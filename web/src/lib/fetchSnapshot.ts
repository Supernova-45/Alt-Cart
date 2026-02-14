export async function fetchSnapshot(path: string): Promise<Document> {
  const res = await fetch(path);
  if (!res.ok) {
    throw new Error(`Failed to fetch snapshot: ${res.status} ${res.statusText}`);
  }
  const html = await res.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  return doc;
}
