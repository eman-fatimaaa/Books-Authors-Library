import type { Book } from "../types/Book";
import { api, USE_MOCK } from "./api";
import { staticBooks as seedBooks } from "../mockData/staticData";

// Work on a mutable in-memory copy (don't mutate imported consts)
const mockBooks: Book[] = [...seedBooks];
let lastBookId = Math.max(0, ...mockBooks.map(b => b.id ?? 0));

export const booksService = {
  getAll: async (): Promise<Book[]> => {
    if (USE_MOCK) {
      return new Promise((resolve) =>
        setTimeout(() => resolve([...mockBooks]), 500)
      );
    }
    return api.get<Book[]>("/api/books");
  },

  create: async (book: Omit<Book, "id">): Promise<Book> => {
    if (USE_MOCK) {
      return new Promise((resolve) =>
        setTimeout(() => {
          const created: Book = { id: ++lastBookId, ...book };
          mockBooks.unshift(created);
          resolve(created);
        }, 500)
      );
    }
    return api.post<Book>("/api/books", book);
  },
};
