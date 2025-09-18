import { Link } from "@remix-run/react";

/**
 * Header component for the Notes app using the Ocean Professional theme.
 * Provides the top navigation bar with app title and primary actions placeholder.
 */
export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-blue-100/60 bg-gradient-to-r from-blue-500/10 to-gray-50 backdrop-blur supports-[backdrop-filter]:bg-blue-50/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="group inline-flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-blue-600 text-white shadow-sm shadow-blue-500/30 ring-1 ring-blue-400/30 grid place-items-center">
            <svg width="18" height="18" viewBox="0 0 24 24" className="opacity-95" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 7.5C4 6.11929 5.11929 5 6.5 5H14.5C15.8807 5 17 6.11929 17 7.5V18.5C17 19.8807 15.8807 21 14.5 21H6.5C5.11929 21 4 19.8807 4 18.5V7.5Z" stroke="white" strokeWidth="1.5"/>
              <path d="M8 3H16.5C17.8807 3 19 4.11929 19 5.5V17" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="text-lg font-semibold tracking-tight text-gray-900">
            Ocean Notes
          </span>
        </Link>

        <nav className="flex items-center gap-2">
          <a
            href="https://remix.run/docs"
            target="_blank"
            rel="noreferrer"
            className="rounded-md px-3 py-1.5 text-sm text-gray-700 transition hover:bg-blue-50 hover:text-blue-700"
          >
            Docs
          </a>
          <a
            href="https://github.com/remix-run/remix"
            target="_blank"
            rel="noreferrer"
            className="rounded-md px-3 py-1.5 text-sm text-gray-700 transition hover:bg-blue-50 hover:text-blue-700"
          >
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}
