import { NoteRelationTypeEnum } from '@/lib/rxdb/types/noteTypes'
const fixture = [
    {
        id: 'f2fb0a80OPPOSES9f6aOPPOSES4b5cOPPOSES8b4cOPPOSESc5e5e5d5f5d5',
        text: 'This is the root note',
        children: [
            {
                id: 'a1b2c3d4OPPOSESe5f6OPPOSES4b5cOPPOSES8b4cOPPOSESc5e5e5d5f5d5',
                relationshipType: NoteRelationTypeEnum.SUPPORTS,
            },
            {
                id: '1a2b3c4dOPPOSES5e6fOPPOSES4b5cOPPOSES8b4cOPPOSESc5e5e5d5f5d5',
                relationshipType: NoteRelationTypeEnum.OPPOSES,
            },
        ],
        parents: [],
    },
    {
        id: 'a1b2c3d4OPPOSESe5f6OPPOSES4b5cOPPOSES8b4cOPPOSESc5e5e5d5f5d5',
        text: 'This note supports the root note',
        children: [
            {
                id: 'a0b1c2d3OPPOSESe4f5OPPOSES4b5cOPPOSES8b4cOPPOSESc5e5e5d5f5d5',
                relationshipType: NoteRelationTypeEnum.RELATED,
            },
        ],
        parents: [
            {
                id: 'f2fb0a80OPPOSES9f6aOPPOSES4b5cOPPOSES8b4cOPPOSESc5e5e5d5f5d5',
                relationshipType: NoteRelationTypeEnum.SUPPORTS,
            },
        ],
    },
    {
        id: '1a2b3c4dOPPOSES5e6fOPPOSES4b5cOPPOSES8b4cOPPOSESc5e5e5d5f5d5',
        text: 'This note opposes the root note',
        children: [],
        parents: [
            {
                id: 'f2fb0a80OPPOSES9f6aOPPOSES4b5cOPPOSES8b4cOPPOSESc5e5e5d5f5d5',
                relationshipType: NoteRelationTypeEnum.OPPOSES,
            },
        ],
    },
    {
        id: 'a0b1c2d3OPPOSESe4f5OPPOSES4b5cOPPOSES8b4cOPPOSESc5e5e5d5f5d5',
        text: 'This note is related to note 2',
        children: [],
        parents: [
            {
                id: 'a1b2c3d4OPPOSESe5f6OPPOSES4b5cOPPOSES8b4cOPPOSESc5e5e5d5f5d5',
                relationshipType: NoteRelationTypeEnum.RELATED,
            },
        ],
    },
]
export default fixture
