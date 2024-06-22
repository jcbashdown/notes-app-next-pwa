import { DeepReadonlyObject } from 'event-reduce-js/dist/lib/types'
import initializeDB, { NoteRelationDocument } from '@/lib/rxdb/database'
import { IdNoteRelationsMap } from '@/lib/redux/features/noteSlice'

import { NoteRelationDocType } from '@/lib/rxdb/types/noteTypes'

//READ
//TODO - use a decorator to await?
const rxdbFetchNoteRelations = async (): Promise<NoteRelationDocument[]> => {
    const dbInstance = await initializeDB()
    return await dbInstance.note_relations.find().where('_deleted').eq(false).exec()
}

const rxdbFetchNoteRelation = async (id: string): Promise<NoteRelationDocument | null> => {
    const dbInstance = await initializeDB()
    return await dbInstance.note_relations.findOne().where('id').eq(id).where('_deleted').eq(false).exec()
}

const rxdbFetchNoteRelationsAsJson = async (): Promise<DeepReadonlyObject<NoteRelationDocType[]>> => {
    const fetchNoteRelationsQueryResult = await rxdbFetchNoteRelations()
    return fetchNoteRelationsQueryResult.map((noteRelation) => {
        return noteRelation.toJSON()
    })
}

const rxdbFetchNoteRelationAsJson = async (id: string): Promise<DeepReadonlyObject<NoteRelationDocType> | null> => {
    const noteRelation = await rxdbFetchNoteRelation(id)
    return noteRelation?.toJSON() || null
}

const rxdbChildrenByParentId = async (parentId: string): Promise<DeepReadonlyObject<NoteRelationDocType[]>> => {
    const dbInstance = await initializeDB()
    const children = await dbInstance.note_relations
        .find()
        .where('parentId')
        .eq(parentId)

        .where('_deleted')
        .eq(false)
        .exec()
    return children.map((noteRelation) => {
        return noteRelation.toJSON()
    })
}
const rxdbNoteRelationByParentAndChildId = async (
    parentId: string,
    childId: string
): Promise<DeepReadonlyObject<NoteRelationDocType | null>> => {
    const dbInstance = await initializeDB()
    return (
        (
            await dbInstance.note_relations.findOne().where('parentId').eq(parentId).where('childId').eq(childId).exec()
        )?.toJSON() || null
    )
}

const rxdbAllNoteChildrenByParentId = async (): Promise<IdNoteRelationsMap> => {
    const noteRelations = ((await rxdbFetchNoteRelationsAsJson()) as NoteRelationDocType[]).sort(
        (a: NoteRelationDocType, b: NoteRelationDocType) => a.order - b.order
    )
    let result: IdNoteRelationsMap = {}

    result = noteRelations.reduce((acc: IdNoteRelationsMap, noteRelation: NoteRelationDocType) => {
        const parentId = noteRelation.parentId
        acc[parentId] = acc[parentId] || []
        acc[parentId].push(noteRelation)
        return acc
    }, result)
    return result
    //shouldn't be necessary if the whole thing is sorted
    //return Object.keys(result).reduce((memo: IdNoteRelationsMap, parentId: string) => {
    //memo[parentId] = result[parentId].sort((a: NoteRelationDocType, b: NoteRelationDocType) => a.order - b.order)
    //return memo
    //}, {})
}

//CREATE
const rxdbAddNoteRelation = async (doc: NoteRelationDocType): Promise<NoteRelationDocType> => {
    const dbInstance = await initializeDB()
    await dbInstance.note_relations.insert(doc)
    return doc
}

const rxdbBulkInsertNoteRelations = async (noteRelations: NoteRelationDocType[]): Promise<void> => {
    const dbInstance = await initializeDB()
    await dbInstance.note_relations.bulkInsert(noteRelations)
}

//UPDATE
//TODO - composite id of parent + child id
const rxdbUpdateNoteRelation = async (docId: string, changes: Partial<NoteRelationDocType>): Promise<void> => {
    const dbInstance = await initializeDB()
    const doc = await dbInstance.note_relations.findOne(docId).exec()
    if (doc) {
        await doc.patch(changes)
    }
}
const rxdbInsertOrUpdateNoteRelation = async (noteRelation: NoteRelationDocType): Promise<void> => {
    const dbInstance = await initializeDB()
    await dbInstance.note_relations.upsert(noteRelation)
}
const rxdbReorderChildren = async (parentId: string): Promise<void> => {
    //load all children ordered ascending by order
    const children = ((await rxdbChildrenByParentId(parentId)) as NoteRelationDocType[]).sort(
        (a: NoteRelationDocType, b: NoteRelationDocType) => a.order - b.order
    )
    //update each "order" with its index
    children.forEach(async (child, index) => {
        await rxdbUpdateNoteRelation(child.id, { order: index })
    })
}

//DESTROY
const rxdbDeleteNoteRelation = async (docId: string): Promise<void> => {
    const dbInstance = await initializeDB()
    const doc = await dbInstance.note_relations.findOne(docId).exec()
    if (doc) {
        await doc.remove()
    }
}
const rxdbDeleteNoteRelationsLinkedToNote = async (docId: string): Promise<void> => {
    const dbInstance = await initializeDB()
    const isParent = { parentId: docId }
    const isChild = { childId: docId }

    // Query to find documents that match either condition1 or condition2
    const asParent = await dbInstance.note_relations
        .find({
            selector: {
                $or: [isParent],
            },
        })
        .exec()
    //remove each found relation
    for (const relation of asParent) {
        await relation.remove()
    }
    // Query to find documents that match either condition1 or condition2
    const asChild = await dbInstance.note_relations
        .find({
            selector: {
                $or: [isChild],
            },
        })
        .exec()
    //remove each found relation
    for (const relation of asChild) {
        const parentId = relation.parentId
        await relation.remove()
        await rxdbReorderChildren(parentId)
    }
}

const noteRelationService = {
    rxdbFetchNoteRelation,
    rxdbFetchNoteRelationAsJson,
    rxdbFetchNoteRelations,
    rxdbFetchNoteRelationsAsJson,
    rxdbChildrenByParentId,
    rxdbAllNoteChildrenByParentId,
    rxdbNoteRelationByParentAndChildId,
    rxdbAddNoteRelation,
    rxdbUpdateNoteRelation,
    rxdbInsertOrUpdateNoteRelation,
    rxdbDeleteNoteRelation,
    rxdbDeleteNoteRelationsLinkedToNote,
    rxdbBulkInsertNoteRelations,
}
export default noteRelationService
