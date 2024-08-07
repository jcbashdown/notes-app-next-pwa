/*
 * Guidelines for the store/rxdb distinction
 * the redux store should reflect the ui state and should include things we don't necessarily want to persist
 * This includes empty notes, expanded/collapsed notes, and other ui state
 */

import cloneDeep from 'lodash/cloneDeep'
import debounce from 'lodash/debounce'
import { type PayloadAction } from '@reduxjs/toolkit'
//import { ulid } from '@/lib/helpers/ulid'
import { ulid } from 'ulid'
import { DeepReadonlyObject } from 'event-reduce-js/dist/lib/types'
import { RootState } from '@/lib/redux/store'
import { createAppSlice } from '@/lib/redux/createAppSlice'
import { NoteDocType, NoteRelationTypeEnum, NoteRelationDocType } from '@/lib/rxdb/types/noteTypes'
//TODO - type for topics. Not just generic note docs
import noteService from '@/lib/rxdb/service/noteService'
import noteRelationService from '@/lib/rxdb/service/noteRelationService'
import { extractNoteRelations, extractNotes } from '@/fixtures/notes'

const {
    rxdbFetchNotesAsJson,
    rxdbFetchNoteTopicsAsJson,
    rxdbBulkInsertNotes,
    rxdbNoteById,
    rxdbAddNote,
    rxdbUpdateNote,
    rxdbInsertOrUpdateNote,
    rxdbDeleteNote,
} = noteService
const {
    rxdbFetchNoteRelationsAsJson,
    rxdbBulkInsertNoteRelations,
    rxdbChildrenByParentId,
    rxdbAllNoteChildrenByParentId,
    rxdbNoteRelationByParentAndChildId,
    rxdbInsertOrUpdateNoteRelation,
    rxdbUpdateNoteRelation,
    rxdbDeleteNoteRelation,
    rxdbDeleteNoteRelationsLinkedToNote,
    rxdbAddNoteRelation,
} = noteRelationService

interface AppInitData {
    notes: NoteDocType[]
    noteRelations: NoteRelationDocType[]
    noteTopics: NoteDocType[]
}

export interface IdNoteMap {
    [id: string]: NoteDocType
}

export interface IdNoteRelationsMap {
    [id: string]: NoteRelationDocType[]
}
export interface IdNoteRelationMap {
    [id: string]: NoteRelationDocType
}
interface NoteRelationMappings {
    noteRelationsById: IdNoteRelationMap
    noteChildrenByParentId: IdNoteRelationsMap
}

export type cursorSelectionType = {
    selectionStart: number | null
    selectionEnd: number | null
}

type idToIndexType = {
    [id: string]: number
}
type RenderOrderType = {
    idToIndex: idToIndexType
    indexToId: string[]
    //add index to id and id to index for note ids
}
export type NotesState = {
    newTopicText: string
    cursorPosition: number | null
    cursorSelection: cursorSelectionType | null
    notesById: IdNoteMap
    noteRelationsById: IdNoteRelationMap
    noteChildrenByParentId: IdNoteRelationsMap
    noteTopics: NoteDocType[]
    currentNoteTopic: string | null
    status: 'idle' | 'loading' | 'failed'
    renderOrder: RenderOrderType
}

const initialState: NotesState = {
    newTopicText: '',
    cursorPosition: 0, //TODO - consider a separate slice for cursor position stuff
    cursorSelection: { selectionStart: 0, selectionEnd: 0 },
    notesById: {},
    noteRelationsById: {},
    noteChildrenByParentId: {},
    noteTopics: [],
    currentNoteTopic: null,
    status: 'idle',
    renderOrder: {
        idToIndex: { newTopic: 0 },
        indexToId: ['newTopic'],
    },
}

const initEmptyNote = (): NoteDocType => {
    return {
        id: ulid(),
        text: '',
        topic: false,
    }
}
const initTopic = (text: string = ''): NoteDocType => {
    return {
        id: ulid(),
        text,
        topic: true,
    }
}
const initNewRelationship = (parentId: string, childId: string, order: number): NoteRelationDocType => {
    //id should be a ulid
    return {
        id: `${parentId}-${childId}`,
        parentId: parentId,
        childId: childId,
        relationshipType: NoteRelationTypeEnum.RELATED,
        order,
    }
}
const returnIdIfTopic = (inputIdentifier: string): string | null => {
    if (inputIdentifier?.includes('_topic')) {
        return inputIdentifier.split('_')[0]
    }
    return null
}

const calculatePositionInOrder = (
    cursorPosition: number | null,
    renderOrder: RenderOrderType,
    parentId: string,
    parentChildren: NoteRelationDocType[]
): number => {
    if (cursorPosition === null) {
        return 0
    }
    const inputIdentifier = renderOrder.indexToId[cursorPosition]
    const [cursorParentId, childId] = inputIdentifier.split('_')[0].split('---')
    if (parentId !== cursorParentId) {
        return 0
    }
    //The index of the child at the current cursor position
    const newPosition = parentChildren.findIndex((child) => child.childId === childId) + 1
    return newPosition
}

const reorderChildren = (children: NoteRelationDocType[], newRelationship: NoteRelationDocType) => {
    const orderedChildren = children.sort((a: NoteRelationDocType, b: NoteRelationDocType) => a.order - b.order)
    //insert the new relationship using it's orderi as the index and shifting everything else up after up
    orderedChildren.splice(newRelationship.order, 0, newRelationship)
    //reorder the children by setting their order to their index
    return orderedChildren.map((child, index) => {
        const newChild = cloneDeep(child)
        newChild.order = index
        return newChild
    })
}

const traverseChildren = (state: NotesState, note: NoteDocType, renderOrder: RenderOrderType): RenderOrderType => {
    return (state.noteChildrenByParentId[note.id] || []).reduce((memo, child) => {
        const childNoteId = child.childId
        const childNote = state.notesById[childNoteId]
        if (childNote?.id) {
            const relPositionId = `${note.id}---${childNote.id}_relationship`
            const textPositionId = `${note.id}---${childNote.id}_text`
            memo.indexToId.push(relPositionId)
            memo.idToIndex[relPositionId] = memo.indexToId.length - 1
            memo.indexToId.push(textPositionId)
            memo.idToIndex[textPositionId] = memo.indexToId.length - 1
            if ((state.noteChildrenByParentId[childNote.id]?.length || 0) > 0) {
                memo = traverseChildren(state, childNote, memo)
            }
        }
        return memo
    }, renderOrder)
}

const buildNoteOrder = (state: NotesState, activeTopic: NoteDocType | null): RenderOrderType => {
    const initialIdToIndex: idToIndexType = {}
    initialIdToIndex['newTopic'] = 0
    //TODO - this needs the order of ids also
    const initialRenderOrder = {
        idToIndex: initialIdToIndex,
        indexToId: ['newTopic'],
    }
    return state.noteTopics.reduce((memo: RenderOrderType, topic: NoteDocType): RenderOrderType => {
        const topicPositionId = `${topic.id}_topic`
        memo.indexToId.push(topicPositionId)
        memo.idToIndex[topicPositionId] = memo.indexToId.length - 1
        if (activeTopic?.id === topic.id) {
            memo = traverseChildren(state, topic, memo)
        }
        return memo
    }, initialRenderOrder)
}

const findParentOfParentInRenderOrder = (state: NotesState, parentId: string, noteId: string): string | null => {
    //get the index of the current note in the render order
    const noteIndex = state.renderOrder.idToIndex[`${parentId}---${noteId}_relationship`]
    //slice indexToId to get from the start to the noteIndex
    const previousNotes = state.renderOrder.indexToId.slice(0, noteIndex)
    //reverse the array to get the most recent note first
    const reversedPreviousNotes = previousNotes.reverse()
    //find the first identifier in the array with the format parentOfParentId---parentId
    for (const id of reversedPreviousNotes) {
        if (id.includes('---')) {
            const parts = id.split('---')
            if (parts[1].includes(parentId)) {
                return parts[0]
            }
        }
    }
    return null
}
//TODO - Filter to only relations flowing from active topic. Probably need to do this in the db query. Load default number of levels to start? Can't be constructing the whole tree at once as this could get very big
const buildNoteRelationMappings = (
    noteRelations: NoteRelationDocType[],
    currentTopicId: string | null
): NoteRelationMappings => {
    const initialMappings: NoteRelationMappings = {
        noteRelationsById: {},
        noteChildrenByParentId: {},
    }
    if (currentTopicId) {
        initialMappings.noteChildrenByParentId[currentTopicId] = []
    }
    const mappings = noteRelations.reduce<NoteRelationMappings>((memo, noteRelation) => {
        memo['noteRelationsById'][noteRelation.id] = noteRelation
        memo['noteChildrenByParentId'][noteRelation.parentId] =
            memo['noteChildrenByParentId'][noteRelation.parentId] ?? []
        memo['noteChildrenByParentId'][noteRelation.parentId].push(noteRelation)
        return memo
    }, initialMappings)
    //not very efficient but we don't expect a lot of sub notes in a topic (later we will limit the depth or optimize)
    return {
        ...mappings,
        noteChildrenByParentId: Object.keys(mappings['noteChildrenByParentId']).reduce(
            (memo: IdNoteRelationsMap, parentId: string) => {
                memo[parentId] = mappings['noteChildrenByParentId'][parentId].sort(
                    (a: NoteRelationDocType, b: NoteRelationDocType) => a.order - b.order
                )
                return memo
            },
            {}
        ),
    }
}

const updateTopic = (state: NotesState, newTopic: string) => {
    if (state.currentNoteTopic !== newTopic) {
        state.currentNoteTopic = newTopic
        const currentNoteTopicDoc = state.notesById[newTopic]
        state.renderOrder = buildNoteOrder(state, currentNoteTopicDoc)
        state.cursorPosition = state.renderOrder.idToIndex[`${newTopic}_topic`]
    }
}
const setCursorPositionAndUpdateTopicIfNeeded = (state: NotesState, newCursorPosition: number) => {
    state.cursorPosition = newCursorPosition
    const newTopicId = returnIdIfTopic(state.renderOrder.indexToId[state.cursorPosition])
    if (newTopicId) {
        updateTopic(state, newTopicId)
    }
}

export const noteSlice = createAppSlice({
    name: 'noteSlice',
    initialState,
    reducers: (create) => ({
        setNewTopicText: create.asyncThunk<string, string>(
            async (topicText) => {
                return topicText
            },
            {
                pending: (state) => {
                    state.status = 'loading'
                },
                fulfilled: (state, action: PayloadAction<string>) => {
                    console.log('Reducer: setNewTopicText')
                    state.status = 'idle'
                    state.newTopicText = action.payload
                },
                rejected: (state) => {
                    state.status = 'failed'
                },
            }
        ), //TODO - no need for this to be async. Also review others after rxdb integration
        setCursorSelection: create.asyncThunk<cursorSelectionType | null, cursorSelectionType | null>(
            async (cursorSelection) => {
                return cursorSelection
            },
            {
                pending: (state) => {
                    state.status = 'loading'
                },
                fulfilled: (state, action: PayloadAction<cursorSelectionType | null>) => {
                    console.log('Reducer: setCursorSelection')
                    state.status = 'idle'
                    state.cursorSelection = action.payload
                },
                rejected: (state) => {
                    state.status = 'failed'
                },
            }
        ), //TODO - no need for this to be async. Also review others after rxdb integration
        setNoteTopic: create.asyncThunk<string, string>(
            async (topicId) => {
                return topicId
            },
            {
                pending: (state) => {
                    state.status = 'loading'
                },
                fulfilled: (state, action: PayloadAction<string>) => {
                    console.log('Reducer: setNoteTopic')
                    state.status = 'idle'
                    updateTopic(state, action.payload)
                },
                rejected: (state) => {
                    state.status = 'failed'
                },
            }
        ),
        setCursorPosition: create.asyncThunk<number, number>(
            async (position) => {
                return position
            },
            {
                pending: (state) => {
                    state.status = 'loading'
                },
                fulfilled: (state, action: PayloadAction<number>) => {
                    console.log('Reducer: setCursorPosition')
                    state.status = 'idle'
                    setCursorPositionAndUpdateTopicIfNeeded(state, action.payload)
                },
                rejected: (state) => {
                    state.status = 'failed'
                },
            }
        ),
        moveCursorBack: create.asyncThunk<void, void>(async () => {}, {
            pending: (state) => {
                state.status = 'loading'
            },
            fulfilled: (state) => {
                console.log('Reducer: moveCursorBack')
                state.status = 'idle'
                if (state.cursorPosition !== null) {
                    let newCursorPosition = state.cursorPosition - 1
                    if (newCursorPosition < 0) {
                        newCursorPosition = 0
                    }
                    setCursorPositionAndUpdateTopicIfNeeded(state, newCursorPosition)
                }
            },
            rejected: (state) => {
                state.status = 'failed'
            },
        }),
        moveCursorForward: create.asyncThunk<void, void>(async () => {}, {
            pending: (state) => {
                state.status = 'loading'
            },
            fulfilled: (state) => {
                console.log('Reducer: moveCursorForward')
                state.status = 'idle'
                if (state.cursorPosition !== null) {
                    let newCursorPosition = state.cursorPosition + 1
                    if (state.renderOrder.indexToId.length <= newCursorPosition) {
                        newCursorPosition = state.renderOrder.indexToId.length - 1
                    }
                    setCursorPositionAndUpdateTopicIfNeeded(state, newCursorPosition)
                }
            },
            rejected: (state) => {
                state.status = 'failed'
            },
        }),
        moveDown: create.asyncThunk<void, void>(async () => {}, {
            pending: (state) => {
                state.status = 'loading'
            },
            fulfilled: (state) => {
                console.log('Reducer: moveDown')
                state.status = 'idle'
                if (state.cursorPosition !== null) {
                    let newCursorPosition = state.cursorPosition + 2
                    if (state.renderOrder.indexToId.length <= newCursorPosition) {
                        newCursorPosition = state.renderOrder.indexToId.length - 1
                    }
                    setCursorPositionAndUpdateTopicIfNeeded(state, newCursorPosition)
                }
            },
            rejected: (state) => {
                state.status = 'failed'
            },
        }),
        moveUp: create.asyncThunk<void, void>(async () => {}, {
            pending: (state) => {
                state.status = 'loading'
            },
            fulfilled: (state) => {
                console.log('Reducer: moveUp')
                state.status = 'idle'
                if (state.cursorPosition !== null) {
                    let newCursorPosition: number
                    //if it's two then it's the first child input - only move back on
                    if (state.cursorPosition <= 2) {
                        newCursorPosition = state.cursorPosition - 1
                    } else {
                        newCursorPosition = state.cursorPosition - 2
                    }
                    if (newCursorPosition < 0) {
                        newCursorPosition = 0
                    }
                    setCursorPositionAndUpdateTopicIfNeeded(state, newCursorPosition)
                }
            },
            rejected: (state) => {
                state.status = 'failed'
            },
        }),
        reduceNoteNesting: create.asyncThunk<
            {
                newNoteChildrenByParentId: IdNoteRelationsMap | null
                newNoteRelationsById: IdNoteRelationMap | null
            },
            { oldParentId: string; targetNoteId: string }
        >(
            async (
                payload,
                thunkApi
            ): Promise<{
                newNoteChildrenByParentId: IdNoteRelationsMap | null
                newNoteRelationsById: IdNoteRelationMap | null
            }> => {
                const { oldParentId, targetNoteId } = payload

                const state = (thunkApi.getState() as RootState).noteSlice as NotesState
                let newNoteChildrenByParentId = null
                let newNoteRelationsById = null
                const newParentId = findParentOfParentInRenderOrder(state, oldParentId, targetNoteId)
                if (newParentId) {
                    const existingRelationshipType =
                        (await rxdbNoteRelationByParentAndChildId(oldParentId, targetNoteId))?.relationshipType ||
                        NoteRelationTypeEnum.RELATED
                    await rxdbDeleteNoteRelation(`${oldParentId}-${targetNoteId}`)

                    //fetch the remaining children of the old parent and update the order
                    const sortedChildren = ((await rxdbChildrenByParentId(oldParentId)) as NoteRelationDocType[]).sort(
                        (a: NoteRelationDocType, b: NoteRelationDocType) => a.order - b.order
                    )
                    //loop with index and set the order to the index
                    sortedChildren.forEach(async (child, index) => {
                        await rxdbUpdateNoteRelation(child.id, { order: index })
                    })
                    //Determine the new position in the order
                    const parentPositionInOrder = (await rxdbNoteRelationByParentAndChildId(newParentId, oldParentId))
                        ?.order
                    const newPositionInOrder = parentPositionInOrder !== undefined ? parentPositionInOrder + 1 : 0
                    console.log(newPositionInOrder)

                    const newRelationship = initNewRelationship(newParentId, targetNoteId, newPositionInOrder)
                    newRelationship.relationshipType = existingRelationshipType
                    const existingChildren = (await rxdbChildrenByParentId(newParentId)) as NoteRelationDocType[]
                    const reorderedChildren = reorderChildren(existingChildren, newRelationship)
                    //update the relationships
                    //we may have soft deleted previously so use upsert
                    for (const child of reorderedChildren) {
                        console.log(JSON.stringify(child))
                        await rxdbInsertOrUpdateNoteRelation(child)
                    }

                    newNoteChildrenByParentId = await rxdbAllNoteChildrenByParentId()
                    newNoteRelationsById = (await rxdbFetchNoteRelationsAsJson()).reduce(
                        (memo: IdNoteRelationMap, noteRelation: NoteRelationDocType) => {
                            memo[noteRelation.id] = noteRelation
                            return memo
                        },
                        {} as IdNoteRelationMap
                    )
                }

                console.log(newNoteChildrenByParentId, newNoteRelationsById, newParentId)
                return { newNoteChildrenByParentId, newNoteRelationsById }
            },
            {
                pending: (state) => {
                    state.status = 'loading'
                },
                fulfilled: (
                    state,
                    action: PayloadAction<{
                        newNoteChildrenByParentId: IdNoteRelationsMap | null
                        newNoteRelationsById: IdNoteRelationMap | null
                    }>
                ) => {
                    console.log('Reducer: reduceNoteNesting')
                    state.status = 'idle'
                    const { newNoteChildrenByParentId, newNoteRelationsById } = action.payload
                    if (!newNoteChildrenByParentId || !newNoteRelationsById) {
                        return
                    }
                    state.noteRelationsById = newNoteRelationsById
                    state.noteChildrenByParentId = newNoteChildrenByParentId

                    //re-calculate the render order in the current topic
                    if (state.currentNoteTopic) {
                        state.renderOrder = buildNoteOrder(state, state.notesById[state.currentNoteTopic])
                    }
                },
                rejected: (state) => {
                    state.status = 'failed'
                },
            }
        ),
        nestNote: create.asyncThunk<
            {
                newNoteChildrenByParentId: IdNoteRelationsMap
                newNoteRelationsById: IdNoteRelationMap
            },
            { oldParentId: string; newParentId: string; targetNoteId: string }
        >(
            async (payload) => {
                const { targetNoteId, newParentId, oldParentId } = payload
                const existingRelationshipType =
                    (await rxdbNoteRelationByParentAndChildId(oldParentId, targetNoteId))?.relationshipType ||
                    NoteRelationTypeEnum.RELATED
                await rxdbDeleteNoteRelation(`${oldParentId}-${targetNoteId}`)
                //fetch the remaining children and update the order
                const sortedChildren = ((await rxdbChildrenByParentId(oldParentId)) as NoteRelationDocType[]).sort(
                    (a: NoteRelationDocType, b: NoteRelationDocType) => a.order - b.order
                )
                //loop with index and set the order to the index
                sortedChildren.forEach(async (child, index) => {
                    await rxdbUpdateNoteRelation(child.id, { order: index })
                })
                //insert the new relationship with the new parent id
                //we may have soft deleted previously so use upsert
                await rxdbInsertOrUpdateNoteRelation({
                    id: `${newParentId}-${targetNoteId}`,
                    parentId: newParentId,
                    childId: targetNoteId,
                    relationshipType: existingRelationshipType,
                    order: 0,
                })

                const newNoteChildrenByParentId = await rxdbAllNoteChildrenByParentId()
                const newNoteRelationsById = (await rxdbFetchNoteRelationsAsJson()).reduce(
                    (memo: IdNoteRelationMap, noteRelation: NoteRelationDocType) => {
                        memo[noteRelation.id] = noteRelation
                        return memo
                    },
                    {} as IdNoteRelationMap
                )

                return { newNoteChildrenByParentId, newNoteRelationsById }
            },
            {
                pending: (state) => {
                    state.status = 'loading'
                },
                fulfilled: (
                    state,
                    action: PayloadAction<{
                        newNoteChildrenByParentId: IdNoteRelationsMap
                        newNoteRelationsById: IdNoteRelationMap
                    }>
                ) => {
                    console.log('Reducer: nestNote')
                    state.status = 'idle'
                    const { newNoteChildrenByParentId, newNoteRelationsById } = action.payload
                    state.noteRelationsById = newNoteRelationsById
                    state.noteChildrenByParentId = newNoteChildrenByParentId

                    //re-calculate the render order in the current topic
                    //The cursor should not move but we should recalculate the order any way so position ids stay in sync.
                    if (state.currentNoteTopic) {
                        state.renderOrder = buildNoteOrder(state, state.notesById[state.currentNoteTopic])
                    }
                },
                rejected: (state) => {
                    state.status = 'failed'
                },
            }
        ),
        deleteNote: create.asyncThunk<
            {
                newNoteChildrenByParentId: IdNoteRelationsMap
                newNoteRelationsById: IdNoteRelationMap
                newNotesById: IdNoteMap
                newNoteTopics: NoteDocType[]
                noteToDeleteId: string
            },
            string
        >(
            async (noteToDeleteId) => {
                await rxdbDeleteNote(noteToDeleteId)
                await rxdbDeleteNoteRelationsLinkedToNote(noteToDeleteId)
                const newNoteChildrenByParentId = await rxdbAllNoteChildrenByParentId()
                const newNoteRelationsById = (await rxdbFetchNoteRelationsAsJson()).reduce(
                    (memo: IdNoteRelationMap, noteRelation: NoteRelationDocType) => {
                        memo[noteRelation.id] = noteRelation
                        return memo
                    },
                    {} as IdNoteRelationMap
                )
                const { newNotesById, newNoteTopics } = (await rxdbFetchNotesAsJson()).reduce(
                    (memo: { newNotesById: IdNoteMap; newNoteTopics: NoteDocType[] }, note: NoteDocType) => {
                        memo.newNotesById[note.id] = note
                        if (note.topic) {
                            memo.newNoteTopics.push(note)
                        }
                        return memo
                    },
                    { newNotesById: {}, newNoteTopics: [] } as { newNotesById: IdNoteMap; newNoteTopics: NoteDocType[] }
                )

                return { newNoteChildrenByParentId, newNoteRelationsById, newNotesById, newNoteTopics, noteToDeleteId }
            },
            {
                pending: (state) => {
                    state.status = 'loading'
                },
                fulfilled: (
                    state,
                    action: PayloadAction<{
                        newNoteChildrenByParentId: IdNoteRelationsMap
                        newNoteRelationsById: IdNoteRelationMap
                        newNotesById: IdNoteMap
                        newNoteTopics: NoteDocType[]
                        noteToDeleteId: string
                    }>
                ) => {
                    console.log('Reducer: deleteNote')
                    state.status = 'idle'
                    const {
                        newNoteChildrenByParentId,
                        newNoteRelationsById,
                        newNotesById,
                        newNoteTopics,
                        noteToDeleteId,
                    } = action.payload
                    state.noteRelationsById = newNoteRelationsById
                    state.noteChildrenByParentId = newNoteChildrenByParentId

                    //if it's the current topic then set current topic to null
                    if (state.currentNoteTopic === noteToDeleteId) {
                        state.currentNoteTopic = null
                    }
                    state.noteTopics = newNoteTopics
                    state.notesById = newNotesById
                    //re-calculate the render order in the current topic
                    if (state.currentNoteTopic) {
                        state.renderOrder = buildNoteOrder(state, state.notesById[state.currentNoteTopic])
                    }
                },
                rejected: (state) => {
                    state.status = 'failed'
                },
            }
        ),
        addAndSwitchToTopicNote: create.asyncThunk<NoteDocType, string>(
            async (topic) => {
                const newTopic = initTopic(topic)
                await rxdbAddNote(newTopic)
                return newTopic
            },
            {
                pending: (state) => {
                    state.status = 'loading'
                },
                fulfilled: (state, action: PayloadAction<NoteDocType>) => {
                    console.log('Reducer: addAndSwitchToTopicNote')
                    state.status = 'idle'
                    const newTopic = action.payload
                    state.notesById[newTopic.id] = newTopic
                    //TODO - add created and updated at and sort by that. Later other things
                    state.noteTopics.unshift(newTopic)
                    state.currentNoteTopic = newTopic.id
                    state.renderOrder = buildNoteOrder(state, newTopic)

                    state.noteChildrenByParentId[newTopic.id] = []
                },
                rejected: (state) => {
                    state.status = 'failed'
                },
            }
        ),
        addEmptyNote: create.asyncThunk<
            {
                newNoteChildrenByParentId: IdNoteRelationsMap
                newNoteRelationsById: IdNoteRelationMap
                emptyNote: NoteDocType
            } | null,
            string
        >(
            async (
                parentId,
                thunkApi
            ): Promise<{
                newNoteChildrenByParentId: IdNoteRelationsMap
                newNoteRelationsById: IdNoteRelationMap
                emptyNote: NoteDocType
            } | null> => {
                const state = (thunkApi.getState() as RootState).noteSlice as NotesState
                const { cursorPosition, renderOrder } = state
                const parentChildren = (await rxdbChildrenByParentId(parentId)) as NoteRelationDocType[]
                const newPositionInOrder = calculatePositionInOrder(
                    cursorPosition,
                    renderOrder,
                    parentId,
                    parentChildren
                )
                const currentNoteAtPosition = parentChildren.find((child) => child.order === newPositionInOrder)
                const childAtPositionEmpty = currentNoteAtPosition
                    ? (await rxdbNoteById(currentNoteAtPosition?.childId))?.text === ''
                    : false
                if (childAtPositionEmpty) {
                    return null
                }

                const emptyNote = initEmptyNote()
                const newRelationship = initNewRelationship(parentId, emptyNote.id, newPositionInOrder)
                const reorderedChildren = reorderChildren(parentChildren, newRelationship)
                await rxdbAddNote(emptyNote)
                for (const child of reorderedChildren) {
                    await rxdbInsertOrUpdateNoteRelation(child)
                }
                const newNoteChildrenByParentId = await rxdbAllNoteChildrenByParentId()
                const newNoteRelationsById = (await rxdbFetchNoteRelationsAsJson()).reduce(
                    (memo: IdNoteRelationMap, noteRelation: NoteRelationDocType) => {
                        memo[noteRelation.id] = noteRelation
                        return memo
                    },
                    {} as IdNoteRelationMap
                )
                return {
                    newNoteChildrenByParentId,
                    newNoteRelationsById,
                    emptyNote,
                }
            },
            {
                pending: (state) => {
                    state.status = 'loading'
                },
                fulfilled: (
                    state,
                    action: PayloadAction<{
                        newNoteChildrenByParentId: IdNoteRelationsMap
                        newNoteRelationsById: IdNoteRelationMap
                        emptyNote: NoteDocType
                    } | null>
                ) => {
                    if (!action.payload) return
                    console.log('Reducer: addEmptyNote')
                    const { newNoteRelationsById, newNoteChildrenByParentId, emptyNote } = action.payload

                    state.notesById[emptyNote.id] = emptyNote
                    state.noteRelationsById = newNoteRelationsById
                    state.noteChildrenByParentId = newNoteChildrenByParentId

                    //re-calculate the render order in the current topic
                    if (state.currentNoteTopic) {
                        state.renderOrder = buildNoteOrder(state, state.notesById[state.currentNoteTopic])
                    }
                    state.status = 'idle'
                },
                rejected: (state) => {
                    state.status = 'failed'
                },
            }
        ),
        updateNoteText: create.asyncThunk<{ noteId: string; text: string }, { noteId: string; text: string }>(
            async (payload) => {
                // TODO - consider debouncing, tracking note text in component with usestate and debouncing there then making this synchronous again etc.
                //debounce(() => rxdbInsertOrUpdateNote({ id: payload.noteId, text: payload.text }), 50)
                rxdbInsertOrUpdateNote({ id: payload.noteId, text: payload.text })
                return payload
            },
            {
                pending: (state) => {
                    state.status = 'loading'
                },
                fulfilled: (state, action: PayloadAction<{ noteId: string; text: string }>) => {
                    console.log('Reducer: updateNoteText')
                    state.status = 'idle'
                    const note = state.notesById[action.payload.noteId]
                    note.text = action.payload.text
                },
                rejected: (state) => {
                    state.status = 'failed'
                },
            }
        ),
        insertAtStartOfNoteText: create.asyncThunk<{ noteId: string; text: string }, { noteId: string; text: string }>(
            async (payload) => {
                const noteId = payload.noteId
                const currentNoteText = (await rxdbNoteById(noteId))?.text || ''
                const newText = payload.text + currentNoteText
                await rxdbUpdateNote(noteId, { text: newText })
                return { noteId, text: newText }
            },
            {
                pending: (state) => {
                    state.status = 'loading'
                },
                fulfilled: (state, action: PayloadAction<{ noteId: string; text: string }>) => {
                    console.log('Reducer: insertAtStartOfNoteText')
                    state.status = 'idle'
                    const note = state.notesById[action.payload.noteId]
                    note.text = action.payload.text
                },
                rejected: (state) => {
                    state.status = 'failed'
                },
            }
        ),
        updateRelationshipType: create.asyncThunk<
            {
                newNoteChildrenByParentId: IdNoteRelationsMap
                newNoteRelationsById: IdNoteRelationMap
            },
            { parentNoteId: string; noteId: string; relationshipType: NoteRelationTypeEnum }
        >(
            async (payload) => {
                const existingNoteRelation = await rxdbNoteRelationByParentAndChildId(
                    payload.parentNoteId,
                    payload.noteId
                )
                if (existingNoteRelation) {
                    await rxdbUpdateNoteRelation(existingNoteRelation.id, {
                        relationshipType: payload.relationshipType,
                    })
                }

                const newNoteChildrenByParentId = await rxdbAllNoteChildrenByParentId()
                const newNoteRelationsById = (await rxdbFetchNoteRelationsAsJson()).reduce(
                    (memo: IdNoteRelationMap, noteRelation: NoteRelationDocType) => {
                        memo[noteRelation.id] = noteRelation
                        return memo
                    },
                    {} as IdNoteRelationMap
                )
                return {
                    newNoteChildrenByParentId,
                    newNoteRelationsById,
                }
            },
            {
                pending: (state) => {
                    state.status = 'loading'
                },
                fulfilled: (
                    state,
                    action: PayloadAction<{
                        newNoteChildrenByParentId: IdNoteRelationsMap
                        newNoteRelationsById: IdNoteRelationMap
                    }>
                ) => {
                    console.log('Reducer: updateRelationshipType')
                    state.status = 'idle'
                    const { newNoteRelationsById, newNoteChildrenByParentId } = action.payload
                    state.noteRelationsById = newNoteRelationsById
                    state.noteChildrenByParentId = newNoteChildrenByParentId
                },
                rejected: (state) => {
                    state.status = 'failed'
                },
            }
        ),
        initFromRxDB: create.asyncThunk<DeepReadonlyObject<AppInitData>>(
            async () => {
                const notes = await rxdbFetchNotesAsJson()
                const noteRelations = await rxdbFetchNoteRelationsAsJson()
                const noteTopics = await rxdbFetchNoteTopicsAsJson()
                return { noteTopics, noteRelations, notes }
            },
            {
                pending: (state) => {
                    state.status = 'loading'
                },
                fulfilled: (state, action: PayloadAction<DeepReadonlyObject<AppInitData>>) => {
                    console.log('Reducer: initFromRxDB')
                    state.status = 'idle'
                    const { noteTopics, noteRelations, notes } = action.payload
                    state.notesById = notes.reduce<IdNoteMap>((memo, note) => {
                        memo[note.id] = note
                        return memo
                    }, {})
                    const { noteRelationsById, noteChildrenByParentId } = buildNoteRelationMappings(
                        noteRelations as NoteRelationDocType[],
                        state.currentNoteTopic
                    )
                    state.noteRelationsById = noteRelationsById
                    state.noteChildrenByParentId = noteChildrenByParentId
                    state.noteTopics = noteTopics as NoteDocType[]
                    if (state.currentNoteTopic === null) {
                        state.renderOrder = buildNoteOrder(state, null)
                    } else {
                        state.renderOrder = buildNoteOrder(state, state.notesById[state.currentNoteTopic])
                    }
                },
                rejected: (state) => {
                    state.status = 'failed'
                },
            }
        ),
        initFromFixture: create.asyncThunk<DeepReadonlyObject<AppInitData>, any>(
            async (data) => {
                const notesFixture = data
                await rxdbBulkInsertNotes(extractNotes(notesFixture))
                await rxdbBulkInsertNoteRelations(extractNoteRelations(notesFixture))
                const notes = await rxdbFetchNotesAsJson()
                const noteRelations = await rxdbFetchNoteRelationsAsJson()
                const noteTopics = await rxdbFetchNoteTopicsAsJson()
                return { noteTopics, noteRelations, notes }
            },
            {
                pending: (state) => {
                    state.status = 'loading'
                },
                fulfilled: (state, action: PayloadAction<DeepReadonlyObject<AppInitData>>) => {
                    console.log('Reducer: initFromFixture')
                    state.status = 'idle'
                    const { noteTopics, noteRelations, notes } = action.payload
                    state.notesById = notes.reduce<IdNoteMap>((memo, note) => {
                        memo[note.id] = note
                        return memo
                    }, {})
                    const { noteRelationsById, noteChildrenByParentId } = buildNoteRelationMappings(
                        noteRelations as NoteRelationDocType[],
                        state.currentNoteTopic
                    )
                    state.noteRelationsById = noteRelationsById
                    state.noteChildrenByParentId = noteChildrenByParentId
                    state.noteTopics = noteTopics as NoteDocType[]
                    if (state.currentNoteTopic === null) {
                        state.renderOrder = buildNoteOrder(state, null)
                    } else {
                        state.renderOrder = buildNoteOrder(state, state.notesById[state.currentNoteTopic])
                    }
                },
                rejected: (state) => {
                    state.status = 'failed'
                },
            }
        ),
    }),
    selectors: {
        selectNewTopicText: (state) => state.newTopicText,
        selectCurrentNoteTopic: (state) => state.currentNoteTopic,
        selectNote: (state, id: string) => state.notesById[id],
        selectNoteChildren: (state, id: string) => state.noteChildrenByParentId[id],
        selectNoteChildrenByParentId: (state) => state.noteChildrenByParentId,
        selectNotesById: (state) => state.notesById,
        selectNoteTopics: (state) => state.noteTopics,
        selectStatus: (state) => state.status,
        selectCursorPosition: (state) => state.cursorPosition,
        selectCursorSelection: (state) => state.cursorSelection,
        selectRenderOrder: (state) => state.renderOrder,
        selectIsCurrentTopicChild: (state, id: string) => {
            return state.noteChildrenByParentId[state.currentNoteTopic || ''].some((child) => child.childId === id)
        },
    },
})

export const {
    setNewTopicText,
    initFromRxDB,
    initFromFixture,
    addEmptyNote,
    updateNoteText,
    updateRelationshipType,
    setCursorPosition,
    setCursorSelection,
    nestNote,
    reduceNoteNesting,
    setNoteTopic,
    moveCursorBack,
    moveCursorForward,
    moveDown,
    moveUp,
    deleteNote,
    insertAtStartOfNoteText,
} = noteSlice.actions
export const {
    selectNewTopicText,
    selectCurrentNoteTopic,
    selectCursorPosition,
    selectCursorSelection,
    selectNoteTopics,
    selectNote,
    selectNoteChildren,
    selectNoteChildrenByParentId,
    selectNotesById,
    selectRenderOrder,
    selectIsCurrentTopicChild,
} = noteSlice.selectors
