import { Link, useLocation } from "@remix-run/react";

type Tag = {
  id: string;
  name: string;
  color?: string;
};

type SidebarProps = {
  tags: Tag[];
  activeTagId?: string | null;
};

export default function Sidebar({ tags, activeTagId }: SidebarProps) {
  const location = useLocation();
  const isAll = !activeTagId;

  return (
    <aside className="h-full w-64 shrink-0 border-r border-gray-200 bg-white/80 backdrop-blur-sm">
      <div className="flex h-full flex-col">
        <div className="px-4 pb-3 pt-4">
          <div className="rounded-lg bg-gradient-to-br from-blue-50 to-amber-50 p-4 ring-1 ring-blue-100/60">
            <h2 className="text-sm font-semibold text-gray-800">Tags & Folders</h2>
            <p className="mt-1 text-xs text-gray-600">Organize your notes with tags</p>
          </div>
        </div>
        <nav className="flex-1 space-y-2 overflow-y-auto px-3 pb-4">
          <Link
            to="/notes"
            className={`group flex items-center gap-2 rounded-md px-3 py-2 text-sm transition ${
              isAll && location.pathname.startsWith("/notes")
                ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
            }`}
          >
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-blue-100 text-blue-700">
              <svg width="12" height="12" viewBox="0 0 24 24" className="opacity-80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 7H17M7 12H17M7 17H13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </span>
            All notes
          </Link>
          <div className="pt-2">
            <div className="px-3 pb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
              Tags
            </div>
            <ul className="space-y-1">
              {tags.length === 0 && (
                <li className="px-3 text-xs text-gray-500">
                  No tags yet. Add tags in the editor.
                </li>
              )}
              {tags.map((tag) => {
                const active = activeTagId === tag.id;
                return (
                  <li key={tag.id}>
                    <Link
                      to={`/notes?tag=${encodeURIComponent(tag.id)}`}
                      className={`group flex items-center justify-between rounded-md px-3 py-2 text-sm transition ${
                        active
                          ? "bg-amber-50 text-amber-800 ring-1 ring-amber-200"
                          : "text-gray-700 hover:bg-amber-50 hover:text-amber-800"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: tag.color ?? "#F59E0B" }}
                        />
                        {tag.name}
                      </span>
                      <span className="text-xs text-gray-400 group-hover:text-amber-700">
                        #
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>
      </div>
    </aside>
  );
}
