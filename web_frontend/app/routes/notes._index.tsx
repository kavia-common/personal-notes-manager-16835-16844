import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useLoaderData, useNavigation, useSearchParams } from "@remix-run/react";
import Header from "~/components/Header";
import Sidebar from "~/components/Sidebar";
import {
  createNote,
  deleteNote,
  getNote,
  listNotes,
  listTags,
  Note,
  Tag,
  updateNote,
  upsertTag,
} from "~/utils/store";

export const meta: MetaFunction = () => ([
  { title: "Ocean Notes" },
  { name: "description", content: "Personal notes with Ocean Professional theme" },
]);

type LoaderData = {
  notes: Note[];
  tags: Tag[];
  activeTagId: string | null;
  selectedNote: Note | null;
  query: string;
};

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const tag = url.searchParams.get("tag");
  const q = url.searchParams.get("q") || "";
  const noteId = url.searchParams.get("id");
  const notes = listNotes({ tagId: tag || undefined, query: q || undefined });
  const selectedNote = noteId ? getNote(noteId) ?? null : notes[0] ?? null;
  const tags = listTags();
  return json<LoaderData>({ notes, tags, activeTagId: tag, selectedNote, query: q });
}

export async function action({ request }: ActionFunctionArgs) {
  const form = await request.formData();
  const intent = String(form.get("_intent") || "");
  try {
    if (intent === "create") {
      const title = String(form.get("title") || "Untitled");
      const content = String(form.get("content") || "");
      const rawTags = String(form.get("tags") || "").trim();
      const tagIds: string[] = [];

      if (rawTags.length) {
        const tagTokens = rawTags.split(",").map((t) => t.trim()).filter(Boolean);
        for (const token of tagTokens) {
          const t = upsertTag(token);
          tagIds.push(t.id);
        }
      }

      const n = createNote({ title, content, tags: tagIds });
      return redirect(`/notes?id=${encodeURIComponent(n.id)}`);
    }

    if (intent === "update") {
      const id = String(form.get("id") || "");
      if (!id) throw new Error("Missing note id");
      const title = String(form.get("title") || "Untitled");
      const content = String(form.get("content") || "");
      const rawTags = String(form.get("tags") || "").trim();
      const tagIds: string[] = [];

      if (rawTags.length) {
        const tagTokens = rawTags.split(",").map((t) => t.trim()).filter(Boolean);
        for (const token of tagTokens) {
          const t = upsertTag(token);
          tagIds.push(t.id);
        }
      }

      const updated = updateNote(id, { title, content, tags: tagIds });
      if (!updated) throw new Error("Note not found");
      return redirect(`/notes?id=${encodeURIComponent(updated.id)}`);
    }

    if (intent === "delete") {
      const id = String(form.get("id") || "");
      if (id) deleteNote(id);
      return redirect(`/notes`);
    }

    if (intent === "select") {
      const id = String(form.get("id") || "");
      const tag = String(form.get("tag") || "");
      const q = String(form.get("q") || "");
      const params = new URLSearchParams();
      if (id) params.set("id", id);
      if (tag) params.set("tag", tag);
      if (q) params.set("q", q);
      return redirect(`/notes?${params.toString()}`);
    }
  } catch (e) {
    return json({ error: (e as Error).message }, { status: 400 });
  }
  return json({ ok: true });
}

export default function NotesPage() {
  const { notes, tags, activeTagId, selectedNote, query } = useLoaderData<typeof loader>();
  const busy = useNavigation().state !== "idle";

  return (
    <div className="flex h-screen w-full flex-col" style={{ backgroundColor: "#f9fafb" }}>
      <Header />
      <div className="mx-auto flex h-[calc(100vh-56px)] w-full max-w-7xl gap-0 px-4 py-4">
        <Sidebar
          tags={tags}
          activeTagId={activeTagId}
        />

        <main className="flex min-w-0 flex-1 flex-row gap-4">
          {/* Notes list panel */}
          <section className="flex h-full w-80 shrink-0 flex-col rounded-xl border border-gray-200 bg-white shadow-sm shadow-gray-100">
            <div className="flex items-center justify-between border-b border-gray-200 px-3 py-2">
              <h3 className="text-sm font-semibold text-gray-800">Your Notes</h3>
              <Form method="post" replace>
                <input type="hidden" name="_intent" value="create" />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm ring-1 ring-blue-500/40 transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <span className="text-xs">+</span> New
                </button>
              </Form>
            </div>

            <div className="border-b border-gray-200 p-2">
              <SearchBar defaultValue={query} />
            </div>

            <ul className="flex-1 divide-y divide-gray-100 overflow-y-auto">
              {notes.length === 0 && (
                <li className="p-4 text-sm text-gray-500">No notes found.</li>
              )}
              {notes.map((n) => {
                const active = selectedNote?.id === n.id;
                return (
                  <li key={n.id}>
                    <Form method="post" replace className="block">
                      <input type="hidden" name="_intent" value="select" />
                      <input type="hidden" name="id" value={n.id} />
                      {activeTagId && <input type="hidden" name="tag" value={activeTagId} />}
                      {query && <input type="hidden" name="q" value={query} />}
                      <button
                        type="submit"
                        className={`block w-full px-3 py-2 text-left transition ${
                          active
                            ? "bg-blue-50/70 text-blue-800"
                            : "hover:bg-blue-50 hover:text-blue-800"
                        }`}
                      >
                        <div className="line-clamp-1 text-sm font-medium">{n.title || "Untitled"}</div>
                        <div className="mt-0.5 line-clamp-1 text-xs text-gray-500">
                          {new Date(n.updatedAt).toLocaleString()}
                        </div>
                      </button>
                    </Form>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Editor panel */}
          <section className="flex min-w-0 flex-1 flex-col rounded-xl border border-gray-200 bg-white shadow-sm shadow-gray-100">
            {selectedNote ? (
              <NoteEditor key={selectedNote.id} note={selectedNote} tags={tags} busy={busy} />
            ) : (
              <div className="grid h-full place-items-center p-8 text-center">
                <div className="max-w-md">
                  <div className="mx-auto mb-4 h-12 w-12 rounded-xl bg-amber-100 text-amber-700 ring-1 ring-amber-200 grid place-items-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" className="opacity-90" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 7H18M6 12H18M6 17H13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-800">No note selected</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Create a new note or select one from the list to start editing.
                  </p>
                  <div className="mt-4">
                    <Form method="post" replace>
                      <input type="hidden" name="_intent" value="create" />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm ring-1 ring-blue-500/40 transition hover:bg-blue-700"
                      >
                        <span className="text-base">+</span> New note
                      </button>
                    </Form>
                  </div>
                </div>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

function SearchBar({ defaultValue }: { defaultValue?: string }) {
  const [params] = useSearchParams();
  const tag = params.get("tag") ?? "";

  return (
    <Form method="get" replace className="flex items-center gap-2">
      <input type="hidden" name="tag" value={tag} />
      <input
        type="text"
        name="q"
        defaultValue={defaultValue}
        placeholder="Search notes..."
        className="w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm outline-none ring-blue-500/40 placeholder:text-gray-400 focus:ring-2"
      />
      <button
        type="submit"
        className="rounded-md bg-amber-500/90 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-amber-600"
        aria-label="Search"
        title="Search"
      >
        Go
      </button>
    </Form>
  );
}

function NoteEditor({ note, tags, busy }: { note: Note; tags: Tag[]; busy: boolean }) {
  const tagNames = (note.tags
    .map((id) => tags.find((t) => t.id === id)?.name)
    .filter(Boolean) as string[]).join(", ");

  return (
    <>
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <Link
            to="/notes"
            className="hidden rounded-md px-2 py-1 text-xs text-gray-600 ring-1 ring-gray-200 transition hover:bg-gray-50 sm:inline-block"
            title="Back to all notes"
          >
            All notes
          </Link>
          <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-200">
            Edited {new Date(note.updatedAt).toLocaleTimeString()}
          </span>
        </div>
        <Form method="post" replace>
          <input type="hidden" name="_intent" value="delete" />
          <input type="hidden" name="id" value={note.id} />
          <button
            type="submit"
            className="rounded-md px-3 py-1.5 text-sm font-medium text-red-600 ring-1 ring-red-200 transition hover:bg-red-50"
          >
            Delete
          </button>
        </Form>
      </div>

      <Form method="post" replace className="flex flex-1 flex-col gap-3 p-4">
        <input type="hidden" name="_intent" value="update" />
        <input type="hidden" name="id" value={note.id} />

        <input
          type="text"
          name="title"
          defaultValue={note.title}
          placeholder="Note title"
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-base font-semibold text-gray-800 outline-none ring-blue-500/40 placeholder:text-gray-400 focus:ring-2"
        />

        <textarea
          name="content"
          defaultValue={note.content}
          placeholder="Write your note..."
          className="min-h-[280px] flex-1 resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none ring-blue-500/40 placeholder:text-gray-400 focus:ring-2"
        />

        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <input
            type="text"
            name="tags"
            defaultValue={tagNames}
            placeholder="Tags (comma separated)"
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none ring-amber-500/40 placeholder:text-gray-400 focus:ring-2"
          />
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm ring-1 ring-blue-500/40 transition hover:bg-blue-700 disabled:opacity-60"
          >
            {busy ? "Saving..." : "Save changes"}
          </button>
        </div>
      </Form>
    </>
  );
}
