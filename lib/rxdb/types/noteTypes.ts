/**
 * declare types
 */

export type NoteDocType = {
    id: string
    text: string
    topic: boolean
    children: NoteRelationDocType[]
    parents: NoteRelationDocType[]
}
export type NoteRelationDocType = {
    id: string
    relationshipType: NoteRelationTypeEnum
}
export enum NoteRelationTypeEnum {
    SUPPORTS = '+',
    OPPOSES = '-',
    RELATED = '',
}
