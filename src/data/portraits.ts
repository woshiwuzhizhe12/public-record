/** Local avatar files. Licenses are recorded in public/portraits/ATTRIBUTION.md. */
const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const portraits: Record<string, string> = {
  "elon-musk": `${base}/portraits/elon-musk.jpg`,
  "jensen-huang": `${base}/portraits/jensen-huang.jpg`,
  "joe-rogan": `${base}/portraits/joe-rogan.jpg`,
  "steve-jobs": `${base}/portraits/steve-jobs.jpg`,
  "lisa-su": `${base}/portraits/lisa-su.jpg`,
};

