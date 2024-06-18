/*
 * Guidelines for the store/rxdb distinction
 * the redux store should reflect the ui state and should include things we don't necessarily want to persist
 * This includes empty notes, expanded/collapsed notes, and other ui state
 */

import { type PayloadAction } from '@reduxjs/toolkit'
//import { ulid } from '@/lib/helpers/ulid'
import { ulid } from 'ulid'
import { DeepReadonlyObject } from 'event-reduce-js/dist/lib/types'
import { createAppSlice } from '@/lib/redux/createAppSlice'
import { NoteDocType, NoteRelationTypeEnum, NoteRelationDocType } from '@/lib/rxdb/types/noteTypes'
//TODO - type for topics. Not just generic note docs
import noteService from '@/lib/rxdb/service/noteService'
import noteRelationService from '@/lib/rxdb/service/noteRelationService'
import { extractNoteRelations, extractNotes } from '@/fixtures/notes'

const { fetchNotesAsJson, fetchNoteTopicsAsJson, bulkInsertNotes, noteById } = noteService
const { fetchNoteRelationsAsJson, bulkInsertNoteRelations } = noteRelationService

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
interface IdNoteRelationMap {
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
        idToIndex: {},
        indexToId: [],
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
    if (inputIdentifier.includes('_topic')) {
        return inputIdentifier.split('_')[0]
    }
    return null
}

const calculatePositionInOrder = (
    { cursorPosition, noteChildrenByParentId, renderOrder }: NotesState,
    parentId: string
): number => {
    if (cursorPosition === null) {
        return 0
    }
    const parentChildren = noteChildrenByParentId[parentId]
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
    //insert the new relationship using it's orderi as the index and shifting everything else up after up
    children.splice(newRelationship.order, 0, newRelationship)
    //reorder the children by setting their order to their index
    return children.map((child, index) => {
        child.order = index
        return child
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

const buildNoteOrderForTopic = (state: NotesState, activeTopic: NoteDocType): RenderOrderType => {
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
        if (activeTopic.id === topic.id) {
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
        state.renderOrder = buildNoteOrderForTopic(state, currentNoteTopicDoc)
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
                    state.status = 'idle'
                    state.newTopicText = action.payload
                },
                rejected: (state) => {
                    state.status = 'failed'
                },
            }
        ),
        setCursorSelection: create.asyncThunk<cursorSelectionType | null, cursorSelectionType | null>(
            async (cursorSelection) => {
                return cursorSelection
            },
            {
                pending: (state) => {
                    state.status = 'loading'
                },
                fulfilled: (state, action: PayloadAction<cursorSelectionType | null>) => {
                    state.status = 'idle'
                    state.cursorSelection = action.payload
                },
                rejected: (state) => {
                    state.status = 'failed'
                },
            }
        ),
        setNoteTopic: create.asyncThunk<string, string>(
            async (topicId) => {
                return topicId
            },
            {
                pending: (state) => {
                    state.status = 'loading'
                },
                fulfilled: (state, action: PayloadAction<string>) => {
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
            { oldParentId: string; targetNoteId: string },
            { oldParentId: string; targetNoteId: string }
        >(
            async (payload) => {
                return payload
            },
            {
                pending: (state) => {
                    state.status = 'loading'
                },
                fulfilled: (state, action: PayloadAction<{ oldParentId: string; targetNoteId: string }>) => {
                    state.status = 'idle'
                    const { oldParentId, targetNoteId } = action.payload
                    const newParentId = findParentOfParentInRenderOrder(state, oldParentId, targetNoteId)
                    if (!newParentId) {
                        return
                    }
                    const existingRelationship = state.noteRelationsById[`${oldParentId}-${targetNoteId}`]
                    //get the type of the existing relationship
                    const relationshipType = existingRelationship?.relationshipType || NoteRelationTypeEnum.RELATED
                    delete state.noteRelationsById[`${oldParentId}-${targetNoteId}`]
                    let allRelationships = Object.values(state.noteRelationsById)
                    let { noteRelationsById, noteChildrenByParentId } = buildNoteRelationMappings(
                        allRelationships,
                        state.currentNoteTopic
                    )
                    state.noteRelationsById = noteRelationsById
                    state.noteChildrenByParentId = noteChildrenByParentId
                    const parentPositionInOrder = state.noteChildrenByParentId[newParentId].find(
                        (child) => child.childId === oldParentId
                    )?.order
                    const newPositionInOrder = parentPositionInOrder !== undefined ? parentPositionInOrder + 1 : 0

                    const newRelationship = initNewRelationship(newParentId, targetNoteId, newPositionInOrder)
                    newRelationship.relationshipType = relationshipType
                    const reorderedChildren = reorderChildren(
                        state.noteChildrenByParentId[newParentId],
                        newRelationship
                    )
                    state.noteChildrenByParentId[newParentId] = reorderedChildren
                    allRelationships = Object.values(state.noteChildrenByParentId).reduce(
                        (memo, val) => memo.concat(val),
                        []
                    )
                    //update the state with the new relationships
                    ;({ noteRelationsById, noteChildrenByParentId } = buildNoteRelationMappings(
                        allRelationships,
                        state.currentNoteTopic
                    ))
                    state.noteRelationsById = noteRelationsById
                    state.noteChildrenByParentId = noteChildrenByParentId

                    //re-calculate the render order in the current topic
                    if (state.currentNoteTopic) {
                        state.renderOrder = buildNoteOrderForTopic(state, state.notesById[state.currentNoteTopic])
                    }
                },
                rejected: (state) => {
                    state.status = 'failed'
                },
            }
        ),
        nestNote: create.asyncThunk<
            { oldParentId: string; newParentId: string; targetNoteId: string },
            { oldParentId: string; newParentId: string; targetNoteId: string }
        >(
            async (payload) => {
                return payload
            },
            {
                pending: (state) => {
                    state.status = 'loading'
                },
                fulfilled: (
                    state,
                    action: PayloadAction<{ oldParentId: string; newParentId: string; targetNoteId: string }>
                ) => {
                    state.status = 'idle'
                    const { oldParentId, newParentId, targetNoteId } = action.payload
                    const existingRelationship = state.noteRelationsById[`${oldParentId}-${targetNoteId}`]
                    //get the type of the existing relationship
                    const relationshipType = existingRelationship?.relationshipType || NoteRelationTypeEnum.RELATED
                    delete state.noteRelationsById[`${oldParentId}-${targetNoteId}`]
                    //get a list of all relationships regardless of parent or child
                    const allRelationships = Object.values(state.noteRelationsById)
                    allRelationships.push({
                        id: `${newParentId}-${targetNoteId}`,
                        parentId: newParentId,
                        childId: targetNoteId,
                        relationshipType,
                        order: 0,
                    })
                    //update the state with the new relationships
                    const { noteRelationsById, noteChildrenByParentId } = buildNoteRelationMappings(
                        allRelationships,
                        state.currentNoteTopic
                    )
                    state.noteRelationsById = noteRelationsById
                    state.noteChildrenByParentId = noteChildrenByParentId
                    //The cursor should not move but we should recalculate the order any way so position ids stay in sync.
                    if (state.currentNoteTopic) {
                        state.renderOrder = buildNoteOrderForTopic(state, state.notesById[state.currentNoteTopic])
                    }
                },
                rejected: (state) => {
                    state.status = 'failed'
                },
            }
        ),
        deleteNote: create.asyncThunk<string, string>(
            async (noteToDeleteId) => {
                return noteToDeleteId
            },
            {
                pending: (state) => {
                    state.status = 'loading'
                },
                fulfilled: (state, action: PayloadAction<string>) => {
                    state.status = 'idle'
                    const noteToDeleteId = action.payload
                    delete state.noteChildrenByParentId[noteToDeleteId]
                    //TODO - Do we need a parent by child map? Should we just use rxdb directly?
                    const allRelationships = Object.keys(state.noteRelationsById).reduce(
                        (memo: NoteRelationDocType[], key: string): NoteRelationDocType[] => {
                            if (!key.includes(noteToDeleteId)) {
                                const relationshipToKeep = state.noteRelationsById[key]
                                memo.push(relationshipToKeep)
                            }
                            return memo
                        },
                        []
                    )
                    //update the state with the new relationships
                    const { noteRelationsById, noteChildrenByParentId } = buildNoteRelationMappings(
                        allRelationships,
                        state.currentNoteTopic
                    )
                    state.noteRelationsById = noteRelationsById
                    state.noteChildrenByParentId = noteChildrenByParentId

                    //TODO - delete from note topics if topic and set currentNoteTopic to null if it's the current one
                    if (state.notesById[noteToDeleteId].topic) {
                        state.noteTopics = state.noteTopics.filter((topic) => topic.id !== noteToDeleteId)
                    }
                    //if it's the current topic then set current topic to null
                    if (state.currentNoteTopic === noteToDeleteId) {
                        state.currentNoteTopic = null
                    }
                    delete state.notesById[noteToDeleteId]
                    //re-calculate the render order in the current topic
                    if (state.currentNoteTopic) {
                        state.renderOrder = buildNoteOrderForTopic(state, state.notesById[state.currentNoteTopic])
                    }
                },
                rejected: (state) => {
                    state.status = 'failed'
                },
            }
        ),
        addAndSwitchToTopicNote: create.asyncThunk<string, string>(
            async (topic) => {
                return topic
            },
            {
                pending: (state) => {
                    state.status = 'loading'
                },
                fulfilled: (state, action: PayloadAction<string>) => {
                    state.status = 'idle'
                    const newTopic = initTopic(action.payload)
                    state.notesById[newTopic.id] = newTopic
                    //TODO - add created and updated at and sort by that. Later other things
                    state.noteTopics.unshift(newTopic)
                    state.currentNoteTopic = newTopic.id
                    state.renderOrder = buildNoteOrderForTopic(state, newTopic)

                    state.noteChildrenByParentId[newTopic.id] = []
                },
                rejected: (state) => {
                    state.status = 'failed'
                },
            }
        ),
        addEmptyNote: create.asyncThunk<string, string>(
            async (parentId) => {
                return parentId
            },
            {
                pending: (state) => {
                    state.status = 'loading'
                },
                fulfilled: (state, action: PayloadAction<string>) => {
                    state.status = 'idle'
                    const parentId = action.payload

                    const newPositionInOrder = calculatePositionInOrder(state, parentId)
                    const currentNoteAtPosition = state.noteChildrenByParentId[parentId].find(
                        (child) => child.order === newPositionInOrder
                    )
                    const childAtPositionEmpty = currentNoteAtPosition
                        ? state.notesById[currentNoteAtPosition?.childId]?.text === ''
                        : false
                    if (childAtPositionEmpty) {
                        return
                    }

                    const emptyNote = initEmptyNote()
                    state.notesById[emptyNote.id] = emptyNote
                    const newRelationship = initNewRelationship(parentId, emptyNote.id, newPositionInOrder)
                    const reorderedChildren = reorderChildren(state.noteChildrenByParentId[parentId], newRelationship)
                    state.noteChildrenByParentId[parentId] = reorderedChildren
                    const allRelationships = Object.values(state.noteChildrenByParentId).reduce(
                        (memo, val) => memo.concat(val),
                        []
                    )
                    //update the state with the new relationships
                    const { noteRelationsById, noteChildrenByParentId } = buildNoteRelationMappings(
                        allRelationships,
                        state.currentNoteTopic
                    )
                    state.noteRelationsById = noteRelationsById
                    state.noteChildrenByParentId = noteChildrenByParentId

                    //re-calculate the render order in the current topic
                    if (state.currentNoteTopic) {
                        state.renderOrder = buildNoteOrderForTopic(state, state.notesById[state.currentNoteTopic])
                    }
                    //TODO - refactor to store relationships separate to notes so they can be edited in once place (not by searching notes and doing the edit in two places)?
                },
                rejected: (state) => {
                    state.status = 'failed'
                },
            }
        ),
        updateNoteText: create.asyncThunk<{ noteId: string; text: string }, { noteId: string; text: string }>(
            async (payload) => {
                return payload
            },
            {
                pending: (state) => {
                    state.status = 'loading'
                },
                fulfilled: (state, action: PayloadAction<{ noteId: string; text: string }>) => {
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
                return payload
            },
            {
                pending: (state) => {
                    state.status = 'loading'
                },
                fulfilled: (state, action: PayloadAction<{ noteId: string; text: string }>) => {
                    state.status = 'idle'
                    const note = state.notesById[action.payload.noteId]
                    note.text = action.payload.text + note.text
                },
                rejected: (state) => {
                    state.status = 'failed'
                },
            }
        ),
        updateRelationshipType: create.asyncThunk<
            { parentNoteId: string; noteId: string; relationshipType: NoteRelationTypeEnum },
            { parentNoteId: string; noteId: string; relationshipType: NoteRelationTypeEnum }
        >(
            async (payload) => {
                return payload
            },
            {
                pending: (state) => {
                    state.status = 'loading'
                },
                fulfilled: (
                    state,
                    action: PayloadAction<{
                        parentNoteId: string
                        noteId: string
                        relationshipType: NoteRelationTypeEnum
                    }>
                ) => {
                    state.status = 'idle'
                    const { parentNoteId, noteId, relationshipType } = action.payload
                    const existingRelationship = state.noteRelationsById[`${parentNoteId}-${noteId}`]
                    if (relationshipType === existingRelationship.relationshipType) {
                        return
                    }
                    existingRelationship.relationshipType = relationshipType
                    delete state.noteRelationsById[`${parentNoteId}-${noteId}`]
                    const allRelationships = Object.values(state.noteRelationsById)
                    allRelationships.push(existingRelationship)
                    //update the state with the new relationships
                    const { noteRelationsById, noteChildrenByParentId } = buildNoteRelationMappings(
                        allRelationships,
                        state.currentNoteTopic
                    )
                    state.noteRelationsById = noteRelationsById
                    state.noteChildrenByParentId = noteChildrenByParentId
                },
                rejected: (state) => {
                    state.status = 'failed'
                },
            }
        ),
        initFromRxDB: create.asyncThunk<DeepReadonlyObject<AppInitData>>(
            async () => {
                const notes = await fetchNotesAsJson()
                const noteRelations = await fetchNoteRelationsAsJson()
                const noteTopics = await fetchNoteTopicsAsJson()
                return { noteTopics, noteRelations, notes }
            },
            {
                pending: (state) => {
                    state.status = 'loading'
                },
                fulfilled: (state, action: PayloadAction<DeepReadonlyObject<AppInitData>>) => {
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
                },
                rejected: (state) => {
                    state.status = 'failed'
                },
            }
        ),
        initFromFixture: create.asyncThunk<DeepReadonlyObject<AppInitData>, any>(
            async (data) => {
                const notesFixture = data
                await bulkInsertNotes(extractNotes(notesFixture))
                await bulkInsertNoteRelations(extractNoteRelations(notesFixture))
                const notes = await fetchNotesAsJson()
                const noteRelations = await fetchNoteRelationsAsJson()
                const noteTopics = await fetchNoteTopicsAsJson()
                return { noteTopics, noteRelations, notes }
            },
            {
                pending: (state) => {
                    state.status = 'loading'
                },
                fulfilled: (state, action: PayloadAction<DeepReadonlyObject<AppInitData>>) => {
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
