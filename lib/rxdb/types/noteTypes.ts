/**
 * declare types
 */

export type NoteDocType = {
    id: string
    text: string
    topic: boolean
}
export type NoteRelationDocType = {
    id: string
    parentId: string
    childId: string
    relationshipType: NoteRelationTypeEnum
    order: number
}
export enum NoteRelationTypeEnum {
    SUPPORTS = '+',
    OPPOSES = '-',
    RELATED = '',
}
