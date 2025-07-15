'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const isActive = (path: string) => {
    return pathname === path || (path === '/' && (pathname === '/' || pathname.startsWith('/category')));
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-6 mx-auto">
            <Link
              href="/"
              className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                isActive('/') 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Home
            </Link>
            <Link
              href="/map"
              className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                isActive('/map') 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Map View
            </Link>
            <Link
              href="/dashboard"
              className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                isActive('/dashboard') 
                  ? 'bg-red-100 text-red-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Crisis Dashboard
            </Link>
          </div>

          {/* Hamburger Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 mx-auto"
            aria-label="Toggle navigation menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isOpen && (
          <div className="md:hidden border-t border-gray-200 py-2">
            <Link
              href="/"
              onClick={closeMenu}
              className={`block px-4 py-3 rounded-lg font-bold transition-colors ${
                isActive('/') 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="flex items-center gap-2">
                <span>🏠</span> Home
              </span>
            </Link>
            <Link
              href="/map"
              onClick={closeMenu}
              className={`block px-4 py-3 rounded-lg font-bold transition-colors ${
                isActive('/map') 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="flex items-center gap-2">
                <span>🗺️</span> Map View
              </span>
            </Link>
            <Link
              href="/dashboard"
              onClick={closeMenu}
              className={`block px-4 py-3 rounded-lg font-bold transition-colors ${
                isActive('/dashboard') 
                  ? 'bg-red-100 text-red-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="flex items-center gap-2">
                <span>📊</span> Crisis Dashboard
              </span>
            </Link>
            
            {/* Quick Actions in Mobile Menu */}
            <div className="border-t border-gray-200 mt-2 pt-2">
              <a
                href="tel:988"
                className="block px-4 py-3 bg-red-50 text-red-700 rounded-lg font-bold hover:bg-red-100 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <span>☎️</span> Crisis Hotline: 988
                </span>
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}