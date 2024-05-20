import { NoteDocType, NoteRelationTypeEnum, NoteRelationDocType } from '@/lib/rxdb/types/noteTypes'
const fixture = [
    {
        id: 'f2fb0a80-9f6a-4b5c-8b4c-c5e5e5d5f5d5',
        text: 'This is the root note',
        topic: true,
        children: [
            {
                id: 'a1b2c3d4-e5f6-4b5c-8b4c-c5e5e5d5f5d5',
                relationshipType: NoteRelationTypeEnum.SUPPORTS,
                order: 0,
            },
            {
                id: '1a2b3c4d-5e6f-4b5c-8b4c-c5e5e5d5f5d5',
                relationshipType: NoteRelationTypeEnum.OPPOSES,
                order: 1,
            },
        ],
        //parents: [],
    },
    {
        id: 'a1b2c3d4-e5f6-4b5c-8b4c-c5e5e5d5f5d5',
        text: 'This note supports the root note',
        topic: false,
        children: [
            {
                id: 'a0b1c2d3-e4f5-4b5c-8b4c-c5e5e5d5f5d5',
                relationshipType: NoteRelationTypeEnum.RELATED,
                order: 0,
            },
        ],
        //parents: [
        //{
        //id: 'f2fb0a80-9f6a-4b5c-8b4c-c5e5e5d5f5d5',
        //relationshipType: NoteRelationTypeEnum.SUPPORTS,
        //},
        //],
    },
    {
        id: '1a2b3c4d-5e6f-4b5c-8b4c-c5e5e5d5f5d5',
        text: 'This note opposes the root note',
        topic: false,
        children: [],
        //parents: [
        //{
        //id: 'f2fb0a80-9f6a-4b5c-8b4c-c5e5e5d5f5d5',
        //relationshipType: NoteRelationTypeEnum.OPPOSES,
        //},
        //],
    },
    {
        id: 'a0b1c2d3-e4f5-4b5c-8b4c-c5e5e5d5f5d5',
        text: 'This note is related to note 2',
        topic: false,
        children: [],
        //parents: [
        //{
        //id: 'a1b2c3d4-e5f6-4b5c-8b4c-c5e5e5d5f5d5',
        //relationshipType: NoteRelationTypeEnum.RELATED,
        //},
        //],
    },
]
export const extractNotes = (notes: any): NoteDocType[] => {
    return notes.map((note: any): NoteDocType => {
        const { children, parents, ...rest } = note
        return rest
    })
}
//Doesn't have to be efficient - only used in development. If we use it in tests then maybe we can remove some redundancy
export const extractNoteRelationss = (notes: any): NoteRelationDocType[] => {
    const noteRelations = notes.reduce((memo: any, note: any): NoteRelationDocType => {
        for (const child of note.children) {
            memo[`${note.id}-${child.id}`] = {
                id: `${note.id}-${child.id}`,
                parentId: note.id,
                childId: child.id,
                relationshipType: child.relationshipType,
                order: child.order,
            }
        }
        //No longer used
        //for (const parent of note.parents) {
        //memo[`${parent.id}-${note.id}`] = {
        //id: `${parent.id}-${note.id}`,
        //parentId: parent.id,
        //childId: note.id,
        //relationshipType: parent.relationshipType,
        //}
        //}
        return memo
    }, {})
    return Object.values(noteRelations)
}
export default fixture
