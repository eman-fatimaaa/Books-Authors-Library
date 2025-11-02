const GOOGLE_BOOKS_API = "https://www.googleapis.com/books/v1/volumes";

type GoogleItem = {
  volumeInfo?: {
    title?: string;
    authors?: string[];
    description?: string;
    publishedDate?: string; // e.g. "2015-12-08"
    industryIdentifiers?: { type: string; identifier: string }[];
    imageLinks?: { thumbnail?: string; smallThumbnail?: string };
  };
};

function toSuggestion(item: GoogleItem) {
  const v = item.volumeInfo ?? {};
  const isbn =
    v.industryIdentifiers?.find((x) => x.type === "ISBN_13")?.identifier ||
    v.industryIdentifiers?.find((x) => x.type === "ISBN_10")?.identifier ||
    "";

  const publishedYear = v.publishedDate ? parseInt(v.publishedDate.substring(0, 4)) : 0;

  return {
    title: v.title ?? "",
    authorName: v.authors?.[0] ?? "",
    description: v.description ?? "",
    isbn,
    publishedYear,
    thumbnail: (v.imageLinks?.thumbnail || v.imageLinks?.smallThumbnail || "")
      .replace("http://", "https://"),
  };
}

export async function searchBooksByTitle(
  title: string
): Promise<
  Array<{
    title: string;
    authorName: string;
    description: string;
    isbn: string;
    publishedYear: number;
    thumbnail: string;
  }>
> {
  if (!title || title.trim().length < 3) return [];
  const params = new URLSearchParams({
    q: `intitle:${title}`,
    maxResults: "40",
  });
  const res = await fetch(`${GOOGLE_BOOKS_API}?${params}`);
  if (!res.ok) throw new Error(`Google Books failed: ${res.status}`);
  const data = await res.json();
  const items: GoogleItem[] = data?.items ?? [];
  return items.map(toSuggestion);
}
