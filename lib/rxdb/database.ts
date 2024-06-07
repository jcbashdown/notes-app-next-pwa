import {
    RxDatabase,
    RxCollection,
    RxJsonSchema,
    RxDocument,
    createRxDatabase,
    addRxPlugin,
    removeRxDatabase,
} from 'rxdb'
import { RxDBJsonDumpPlugin } from 'rxdb/plugins/json-dump'
//import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie'
import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder'
import { NoteDocType, NoteRelationTypeEnum, NoteRelationDocType } from '@/lib/rxdb/types/noteTypes'
import { DeepReadonlyObject } from 'event-reduce-js/dist/lib/types'

/**
 * declare types
 */

//TODO - remove this kind of thing now we are using service
type NoteDocMethods = {
    scream: (v: string) => string
}

export type NoteDocument = RxDocument<NoteDocType, NoteDocMethods>
export type NoteRelationDocument = RxDocument<NoteRelationDocType>

//TODO - remove this kind of thing now we are using service
type NoteCollectionMethods = {
    countAllDocuments: () => Promise<number>
    getAllAsJson: () => Promise<DeepReadonlyObject<NoteDocType[]>>
}

type NoteCollection = RxCollection<NoteDocType, NoteDocMethods, NoteCollectionMethods>
type NoteRelationCollection = RxCollection<NoteRelationDocType>

type MyDatabaseCollections = {
    notes: NoteCollection
    note_relations: NoteRelationCollection
}

export type MyDatabase = RxDatabase<MyDatabaseCollections>

let databaseInstance: MyDatabase | null = null

async function initializeDB(): Promise<MyDatabase> {
    if (databaseInstance) {
        return databaseInstance
    }
    let storage = null
    if (process.env.NODE_ENV === 'test') {
        storage = (await import('rxdb/plugins/storage-memory')).getRxStorageMemory()
    } else {
        storage = (await import('rxdb/plugins/storage-dexie')).getRxStorageDexie()
    }

    // Dynamically import the RxDB development mode plugin in development environment
    if (process.env.NODE_ENV === 'development') {
        const devModePlugin = await import('rxdb/plugins/dev-mode')
        addRxPlugin(devModePlugin.RxDBDevModePlugin)
        // Remove the existing database (useful during development)
        await removeRxDatabase('notes-app-db', storage)
    }
    //enable dumping to json for loading into redux
    addRxPlugin(RxDBJsonDumpPlugin)
    //enable the query builder
    addRxPlugin(RxDBQueryBuilderPlugin)

    /**
     * create database and collections
     */
    const myDatabase: MyDatabase = await createRxDatabase<MyDatabaseCollections>({
        name: 'notes-app-db',
        multiInstance: true, //use the same db across tabs
        storage: storage,
    })

    const noteSchema: RxJsonSchema<NoteDocType> = {
        title: 'Note',
        description: 'describes a note',
        version: 0,
        primaryKey: 'id',
        type: 'object',
        properties: {
            id: {
                type: 'string',
                maxLength: 36,
            },
            text: {
                type: 'string',
            },
            topic: {
                type: 'boolean',
            },
        },
    }
    const noteRelationSchema: RxJsonSchema<NoteRelationDocType> = {
        title: 'Note Relation',
        description: 'describes relations between ntoes',
        version: 0,
        primaryKey: 'id',
        type: 'object',
        properties: {
            id: {
                type: 'string',
                maxLength: 73,
            },
            parentId: {
                type: 'string',
                maxLength: 73,
            },
            childId: {
                type: 'string',
                maxLength: 73,
            },
            relationshipType: {
                type: 'string',
                enum: Object.values(NoteRelationTypeEnum),
            },
            order: {
                type: 'number',
            },
        },
    }

    //TODO - remove in favour of service
    const noteDocMethods: NoteDocMethods = {
        scream: function (this: NoteDocument, what: string) {
            return 'screams: ' + what.toUpperCase()
        },
    }

    const noteCollectionMethods: NoteCollectionMethods = {
        countAllDocuments: async function (this: NoteCollection) {
            const allDocs = await this.find().exec()
            return allDocs.length
        },
        getAllAsJson: async function (this: NoteCollection) {
            const queryResult = await this.find().exec()
            return queryResult.map((doc) => doc.toJSON())
        },
    }
    //TODO - ^remove in favour of service

    await myDatabase.addCollections({
        notes: {
            schema: noteSchema,
            methods: noteDocMethods,
            statics: noteCollectionMethods,
        },
        note_relations: {
            schema: noteRelationSchema,
        },
    })

    // Dynamically import the RxDB development mode plugin in development environment
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
        const fixtureDataModule = await import('@/fixtures/notes')
        const fixtureData = fixtureDataModule.default
        const { extractNotes, extractNoteRelations } = fixtureDataModule
        await myDatabase.notes.bulkInsert(extractNotes(fixtureData))
        await myDatabase.note_relations.bulkInsert(extractNoteRelations(fixtureData))
    }

    databaseInstance = myDatabase
    return databaseInstance
}

export default initializeDB
