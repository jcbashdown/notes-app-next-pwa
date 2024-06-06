'use client'

import { useState, useEffect, useRef } from 'react'
import { useAppSelector } from '@/lib/redux/hooks'
import { selectNotesById, selectNoteChildrenByParentId } from '@/lib/redux/features/noteSlice'
import NewTopic from '@/components/NewTopic'
import generateNotesJSONFromStoreState from '@/lib/redux/utils/generateNotesJSONFromStoreState'
import { IdNoteRelationsMap } from '@/lib/redux/features/noteSlice'
import { NoteDocType } from '@/lib/rxdb/types/noteTypes'
export default function Menu() {
    const [isDropdownVisible, setIsDropdownVisible] = useState(false)
    const dropdownRef = useRef<HTMLDivElement | null>(null)

    const noteChildrenByParentId = useAppSelector(selectNoteChildrenByParentId)
    const notes = Object.values(useAppSelector(selectNotesById))

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside)

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])
    const toggleDropdown = () => {
        setIsDropdownVisible(!isDropdownVisible)
    }

    const handleClickOutside = (event: MouseEvent) => {
        console.log(event.target, dropdownRef.current)
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsDropdownVisible(false)
        }
    }
    const handleClick = () => {
        console.log('downloading')
        downloadJSON(notes, noteChildrenByParentId)
    }
    const downloadJSON = (
        notes: NoteDocType[],
        noteChildrenByParentId: IdNoteRelationsMap,
        filename = 'notes.json'
    ) => {
        console.log('downloading')
        const json = generateNotesJSONFromStoreState(notes, noteChildrenByParentId)
        const blob = new Blob([json], { type: 'application/json' })
        const href = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = href
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }
    return (
        <div className="bg-white p-4 rounded-lg shadow-md mb-4 flex">
            <NewTopic />
            <div ref={dropdownRef}>
                <button
                    onClick={toggleDropdown}
                    className="ml-2 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    id="menuButton"
                >
                    <svg
                        className="w-6 h-6 text-gray-700"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 6h16M4 12h16M4 18h16"
                        ></path>
                    </svg>
                </button>
                {/*TODO - style this better*/}
                <div
                    className={`${
                        isDropdownVisible ? 'block' : 'hidden'
                    } absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg`}
                    id="menuDropdown"
                >
                    <a
                        id="download-note-json"
                        href="#"
                        onClick={handleClick}
                        className="block px-4 py-2 text-gray-800 hover:bg-gray-200"
                    >
                        Download notes
                    </a>
                </div>
            </div>
        </div>
    )
}
