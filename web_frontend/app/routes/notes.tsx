import { Outlet } from "@remix-run/react";

/**
 * Parent route for /notes. This allows nested index route rendering and future child routes.
 */
export default function NotesLayout() {
  return <Outlet />;
}
