import dynamic from 'next/dynamic'

import { useAppSelector } from '@/lib/redux/hooks'
import { selectNoteTopics } from '@/lib/redux/features/noteSlice'

const NoteTopic = dynamic(() => import('@/components/NoteTopic'), {
    ssr: false,
})

export default function NoteTopics() {
    const noteTopics = useAppSelector(selectNoteTopics)
    console.log(noteTopics)

    return (
        <>
            {noteTopics.map((noteTopic, i) => (
                <NoteTopic key={i} noteTopic={noteTopic} />
            ))}
        </>
    )
}
