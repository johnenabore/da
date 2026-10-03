// PLACEHOLDER data — replace with the client's real projects.
// One list drives both the featured-work grid and the /work/[slug] pages.

export type Photo = {
  src: string;
  // CSS aspect-ratio of the file (width / height).
  ratio: string;
};

// Every photo in public/ available to the featured work and the project pages.
// Ratios are the real pixel sizes of each file.
export const photos: Photo[] = [
  { src: "/gallery-placeholder1.png", ratio: "1200 / 1638" },
  { src: "/gallery-placeholder2.png", ratio: "1200 / 1638" },
  { src: "/gallery-placeholder3.png", ratio: "1200 / 1810" },
  { src: "/gallery-placeholder4.png", ratio: "1200 / 1800" },
  { src: "/gallery-placeholder5.png", ratio: "1200 / 1800" },
  { src: "/gallery-placeholder6.png", ratio: "1200 / 1800" },
  { src: "/gallery-placeholder7.png", ratio: "1200 / 1849" },
  { src: "/gallery-placeholder8.png", ratio: "1200 / 1800" },
  { src: "/gallery-placeholder9.png", ratio: "1200 / 1800" },
  { src: "/gallery-placeholder10.png", ratio: "1200 / 1800" },
  { src: "/gallery-placeholder11.png", ratio: "1200 / 1800" },
];

export type Project = {
  slug: string;
  // The "who": the client or credit, shown in the meta line on the project page.
  client: string;
  title: string;
  alt: string;
  // Grid card photo, and the card's CSS aspect-ratio (a crop of the photo).
  cardSrc: string;
  cardRatio: string;
  // The project's own cover photo and its shape. This is the default; when a
  // card is clicked the page opens with a random photo from `photos` instead
  // (see lib/random-cover.ts). The page follows the shape: a portrait photo
  // gets a centred frame at its own ratio, a landscape one the full-width frame.
  heroSrc: string;
  heroRatio: string;
  // The three photos in the stack under the details. Also replaced by random
  // ones when a card is clicked.
  gallery: Photo[];
  // Text under the title on the project page.
  tagline: string;
  description: string;
  credits: string;
  year: string;
  role: string;
};

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const make = (
  client: string,
  title: string,
  cardRatio: string,
  photo: Photo,
  overrides: Partial<Project> = {},
): Project => ({
  slug: slugify(`${client} ${title}`),
  client,
  title,
  alt: `${title} — ${client}`,
  cardSrc: photo.src,
  cardRatio,
  heroSrc: photo.src,
  heroRatio: photo.ratio,
  // The next three photos in the list after this project's own.
  gallery: [1, 2, 3].map(
    (n) => photos[(photos.indexOf(photo) + n) % photos.length],
  ),
  tagline: "Lorem ipsum dolor sit amet",
  description:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.",
  credits: "Credits & Rights: © David & Angela Imagery",
  year: "2025",
  role: "Photographer",
  ...overrides,
});

// Reading order: the first three are the grid's top row, the last three its
// second row, using photos 1–6. The card ratios are crops chosen so the three
// columns end at different heights (about 2.36, 2.0 and 2.53 widths tall).
export const projects: Project[] = [
  make("Lorem Ipsum", "Dolor Sit", "4 / 5", photos[0]),
  make("Ut Enim", "Minim Veniam", "1 / 1", photos[1]),
  make("Excepteur Sint", "Occaecat", "5 / 6", photos[2]),
  make("Amet Consectetur", "Adipiscing Elit", "9 / 10", photos[3]),
  make("Quis Nostrud", "Exercitation", "1 / 1", photos[4]),
  make("Cupidatat Non", "Proident Sunt", "3 / 4", photos[5]),
];

export const getProject = (slug: string) =>
  projects.find((project) => project.slug === slug);

// Every photo for the all-work page: the 11 numbered photos plus the original
// placeholder (750×1125).
export const allWorkPhotos: Photo[] = [
  ...photos,
  { src: "/gallery-placeholder.png", ratio: "750 / 1125" },
];
