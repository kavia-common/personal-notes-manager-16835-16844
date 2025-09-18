import { redirect } from "@remix-run/node";

export async function loader() {
  return redirect("/notes");
}

export default function IndexRedirect() {
  return null;
}
