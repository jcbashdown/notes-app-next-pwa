/**
 * declare types
 */

export type NoteDocType = {
    id: string
    text: string
    children: NoteRelationDocType[]
    parents: NoteRelationDocType[]
}
export type NoteRelationDocType = {
    type: NoteRelationTypeEnum
}
export enum NoteRelationTypeEnum {
    SUPPORTS = '+',
    OPPOSES = '-',
    RELATED = '',
}
