'use client'

import { useState, useEffect, useRef } from 'react'
import NewTopic from '@/components/NewTopic'
export default function Menu() {
    const [isDropdownVisible, setIsDropdownVisible] = useState(false)
    const dropdownRef = useRef(null)

    const toggleDropdown = () => {
        setIsDropdownVisible(!isDropdownVisible)
    }

    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setIsDropdownVisible(false)
        }
    }
    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside)

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])
    return (
        <div className="bg-white p-4 rounded-lg shadow-md mb-4 flex" ref={dropdownRef}>
            <NewTopic />
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
            <div
                className={`${
                    isDropdownVisible ? 'block' : 'hidden'
                } absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg`}
                id="menuDropdown"
            >
                <a href="#" className="block px-4 py-2 text-gray-800 hover:bg-gray-200">
                    Download notes
                </a>
            </div>
        </div>
    )
}
