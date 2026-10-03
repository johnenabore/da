// Browser-only helper: clicking a featured-work card picks random photos for the
// project page it opens: the cover, plus the three photos in the stack under
// the details.
//
// The pick is remembered here (module state) and read by the project page when
// it mounts on that client-side navigation. It is only ever set from a click
// handler, never during server rendering, so nothing leaks between requests. A
// direct visit or a reload has no pending pick and shows the project's own
// photos, which also keeps server and client rendering identical.

import { photos } from "@/lib/projects";
import type { Photo } from "@/lib/projects";

export type PickedPhotos = { cover: Photo; gallery: Photo[] };

let pending: { slug: string; picked: PickedPhotos } | null = null;

// Four different photos: shuffle a copy and take the first four.
export function pickRandomPhotos(slug: string) {
  const shuffled = [...photos];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  pending = {
    slug,
    picked: { cover: shuffled[0], gallery: shuffled.slice(1, 4) },
  };
}

// Not cleared on read: React may run state initialisers twice in development,
// and both runs must agree. The next click replaces it.
export function getPickedPhotos(slug: string): PickedPhotos | null {
  return pending && pending.slug === slug ? pending.picked : null;
}
