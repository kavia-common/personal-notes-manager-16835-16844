export type Note = {
  id: string;
  title: string;
  content: string;
  tags: string[]; // tag ids
  updatedAt: number;
  createdAt: number;
};

export type Tag = {
  id: string;
  name: string;
  color?: string;
};

// simple in-memory store (non-persistent) for demo purposes
const notes: Record<string, Note> = {};
const tags: Record<string, Tag> = {};

function uid(prefix = ""): string {
  return `${prefix}${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

// seed with a couple of demo notes and tags
(function seed() {
  if (Object.keys(tags).length > 0 || Object.keys(notes).length > 0) return;
  const tWork: Tag = { id: uid("t_"), name: "Work", color: "#2563EB" };
  const tIdeas: Tag = { id: uid("t_"), name: "Ideas", color: "#F59E0B" };
  tags[tWork.id] = tWork;
  tags[tIdeas.id] = tIdeas;

  const n1: Note = {
    id: uid("n_"),
    title: "Welcome to Ocean Notes",
    content:
      "This is your personal notes app. Select a note, or create a new one.\n\n- Modern Ocean Professional theme\n- Blue & amber accents\n- Clean, minimalist UI",
    tags: [tIdeas.id],
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
    updatedAt: Date.now() - 1000 * 60 * 30,
  };
  const n2: Note = {
    id: uid("n_"),
    title: "Tasks",
    content: "1. Draft proposal\n2. Review design\n3. Sync with team",
    tags: [tWork.id],
    createdAt: Date.now() - 1000 * 60 * 60,
    updatedAt: Date.now() - 1000 * 60 * 5,
  };
  notes[n1.id] = n1;
  notes[n2.id] = n2;
})();

// PUBLIC_INTERFACE
export function listTags(): Tag[] {
  /** Return all tags sorted by name. */
  return Object.values(tags).sort((a, b) => a.name.localeCompare(b.name));
}

// PUBLIC_INTERFACE
export function upsertTag(name: string, color?: string): Tag {
  /** Create a tag if it does not exist (case-insensitive match), else return existing. */
  const existing = Object.values(tags).find(
    (t) => t.name.trim().toLowerCase() === name.trim().toLowerCase()
  );
  if (existing) return existing;
  const t: Tag = { id: uid("t_"), name: name.trim(), color };
  tags[t.id] = t;
  return t;
}

// PUBLIC_INTERFACE
export function listNotes(filter?: { tagId?: string; query?: string }): Note[] {
  /** Return notes filtered by tag or query, sorted by updatedAt desc. */
  let arr = Object.values(notes);
  if (filter?.tagId) {
    arr = arr.filter((n) => n.tags.includes(filter.tagId!));
  }
  if (filter?.query) {
    const q = filter.query.toLowerCase();
    arr = arr.filter(
      (n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
    );
  }
  return arr.sort((a, b) => b.updatedAt - a.updatedAt);
}

// PUBLIC_INTERFACE
export function getNote(id: string): Note | undefined {
  /** Get a note by id. */
  return notes[id];
}

// PUBLIC_INTERFACE
export function createNote(input?: Partial<Pick<Note, "title" | "content" | "tags">>): Note {
  /** Create a new note with optional initial fields. */
  const now = Date.now();
  const note: Note = {
    id: uid("n_"),
    title: input?.title?.trim() || "Untitled",
    content: input?.content || "",
    tags: input?.tags || [],
    createdAt: now,
    updatedAt: now,
  };
  notes[note.id] = note;
  return note;
}

// PUBLIC_INTERFACE
export function updateNote(
  id: string,
  patch: Partial<Pick<Note, "title" | "content" | "tags">>
): Note | undefined {
  /** Update an existing note. Returns updated note or undefined if not found. */
  const existing = notes[id];
  if (!existing) return undefined;
  const updated: Note = {
    ...existing,
    title: patch.title !== undefined ? (patch.title.trim() || "Untitled") : existing.title,
    content: patch.content ?? existing.content,
    tags: patch.tags ?? existing.tags,
    updatedAt: Date.now(),
  };
  notes[id] = updated;
  return updated;
}

// PUBLIC_INTERFACE
export function deleteNote(id: string): boolean {
  /** Delete a note by id. Returns true if deleted. */
  if (notes[id]) {
    delete notes[id];
    return true;
  }
  return false;
}
