import { NoteRelationTypeEnum } from '@/lib/rxdb/types/noteTypes'
const fixture = [
    {
        id: 'f2fb0a80-9f6a-4b5c-8b4c-c5e5e5d5f5d5',
        text: 'This is the root note',
        topic: true,
        children: [
            {
                id: 'a1b2c3d4-e5f6-4b5c-8b4c-c5e5e5d5f5d5',
                relationshipType: NoteRelationTypeEnum.SUPPORTS,
            },
            {
                id: '1a2b3c4d-5e6f-4b5c-8b4c-c5e5e5d5f5d5',
                relationshipType: NoteRelationTypeEnum.OPPOSES,
            },
        ],
        parents: [],
    },
    {
        id: 'a1b2c3d4-e5f6-4b5c-8b4c-c5e5e5d5f5d5',
        text: 'This note supports the root note',
        topic: false,
        children: [
            {
                id: 'a0b1c2d3-e4f5-4b5c-8b4c-c5e5e5d5f5d5',
                relationshipType: NoteRelationTypeEnum.RELATED,
            },
        ],
        parents: [
            {
                id: 'f2fb0a80-9f6a-4b5c-8b4c-c5e5e5d5f5d5',
                relationshipType: NoteRelationTypeEnum.SUPPORTS,
            },
        ],
    },
    {
        id: '1a2b3c4d-5e6f-4b5c-8b4c-c5e5e5d5f5d5',
        text: 'This note opposes the root note',
        topic: false,
        children: [],
        parents: [
            {
                id: 'f2fb0a80-9f6a-4b5c-8b4c-c5e5e5d5f5d5',
                relationshipType: NoteRelationTypeEnum.OPPOSES,
            },
        ],
    },
    {
        id: 'a0b1c2d3-e4f5-4b5c-8b4c-c5e5e5d5f5d5',
        text: 'This note is related to note 2',
        topic: false,
        children: [],
        parents: [
            {
                id: 'a1b2c3d4-e5f6-4b5c-8b4c-c5e5e5d5f5d5',
                relationshipType: NoteRelationTypeEnum.RELATED,
            },
        ],
    },
]
export default fixture
