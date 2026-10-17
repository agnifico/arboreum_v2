import { redirect } from "@sveltejs/kit";

// The device used to live here: old links and home-screen bookmarks land on /.
export function load() {
  redirect(308, "/");
}
