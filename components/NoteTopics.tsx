import NoteTopic from '@/components/NoteTopic'

import { useAppSelector } from '@/lib/redux/hooks'
import { selectNoteTopics } from '@/lib/redux/features/noteSlice'

export default function NoteTopics() {
    const noteTopics = useAppSelector(selectNoteTopics)

    return (
        <>
            {noteTopics.map((noteTopic, i) => (
                <NoteTopic key={i} noteTopic={noteTopic} />
            ))}
        </>
    )
}
