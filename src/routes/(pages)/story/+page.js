import { redirect } from "@sveltejs/kit";

// The story is part of the about page now (one carousel): old links land there.
export function load() {
  redirect(308, "/about");
}
