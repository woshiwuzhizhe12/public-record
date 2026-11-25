export function videoPeople(video: { person: string; people?: string[] | null }): string[] {
  const primary = video.person ? [video.person] : [];
  const extras = (video.people ?? []).filter((slug) => slug && slug !== video.person);
  return [...primary, ...extras];
}

export function videoHref(id: string, personOrCompany: string | { person?: string; company?: string }): string {
  const path = `/v/${encodeURIComponent(id)}`;
  if (typeof personOrCompany === "string") {
    return `${path}?person=${encodeURIComponent(personOrCompany)}`;
  }
  if (personOrCompany.company) {
    return `${path}?company=${encodeURIComponent(personOrCompany.company)}`;
  }
  return `${path}?person=${encodeURIComponent(personOrCompany.person ?? "")}`;
}
