export function videoPeople(video: { person: string; people?: string[] | null }): string[] {
  const extras = (video.people ?? []).filter((slug) => slug && slug !== video.person);
  return [video.person, ...extras];
}

export function videoHref(id: string, personSlug: string): string {
  return `/v/${encodeURIComponent(id)}?person=${encodeURIComponent(personSlug)}`;
}
