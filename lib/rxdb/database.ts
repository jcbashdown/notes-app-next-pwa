// import types
import { RxDatabase, RxCollection, RxJsonSchema, RxDocument, createRxDatabase, addRxPlugin } from 'rxdb'
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie'
import { NoteDocType, NoteRelationTypeEnum } from '@/lib/rxdb/types/noteTypes'

/**
 * declare types
 */

type NoteDocMethods = {
    scream: (v: string) => string
}

type NoteDocument = RxDocument<NoteDocType, NoteDocMethods>

type NoteCollectionMethods = {
    countAllDocuments: () => Promise<number>
}

type NoteCollection = RxCollection<NoteDocType, NoteDocMethods, NoteCollectionMethods>

type MyDatabaseCollections = {
    notes: NoteCollection
}

type MyDatabase = RxDatabase<MyDatabaseCollections>

async function initializeDB(): Promise<MyDatabase> {
    // Dynamically import the RxDB development mode plugin in development environment
    if (process.env.NODE_ENV === 'development') {
        const devModePlugin = await import('rxdb/plugins/dev-mode')
        addRxPlugin(devModePlugin.RxDBDevModePlugin)
        // Remove the existing database (useful during development)
        //await removeRxDatabase('notesdb', storage);
    }
    /**
     * create database and collections
     */
    const myDatabase: MyDatabase = await createRxDatabase<MyDatabaseCollections>({
        name: 'mydb',
        multiInstance: true, //use the same db across tabs
        storage: getRxStorageDexie(),
    })

    const noteSchema: RxJsonSchema<NoteDocType> = {
        title: 'Note',
        description: 'describes a note and its relations',
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
            children: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            ref: 'Note',
                        },
                        relationshipType: {
                            type: 'string',
                            enum: Object.values(NoteRelationTypeEnum),
                        },
                    },
                },
            },
            parents: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            ref: 'Note',
                        },
                        relationshipType: {
                            type: 'string',
                            enum: Object.values(NoteRelationTypeEnum),
                        },
                    },
                },
            },
        },
    }

    //TODO - consider removing these? Or should I use this instead of the service?
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
    }
    //TODO - ^consider removing these? Or should I use this instead of the service?

    await myDatabase.addCollections({
        notes: {
            schema: noteSchema,
            methods: noteDocMethods,
            statics: noteCollectionMethods,
        },
    })

    // add a preInsert-hook
    myDatabase.notes.postInsert(
        function myPostInsertHook(
            this: NoteCollection, // own collection is bound to the scope
            docData: NoteDocType, // documents data
            doc: NoteDocument // RxDocument
        ) {
            console.log('insert to ' + this.name + '-collection: ' + doc.id)
        },
        false // not async
    )
    return myDatabase
}

export default initializeDB()
