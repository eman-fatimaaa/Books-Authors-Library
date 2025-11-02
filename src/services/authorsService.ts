import type { Author } from "../types/Authors";
import { api, USE_MOCK } from "./api";
import { staticAuthors as seedAuthors } from "../mockData/staticData";

// Work on a mutable in-memory copy (don't mutate imported consts)
const mockAuthors: Author[] = [...seedAuthors];
let lastAuthorId = Math.max(0, ...mockAuthors.map(a => a.id ?? 0));

export const authorsService = {
  getAll: async (): Promise<Author[]> => {
    if (USE_MOCK) {
      return new Promise((resolve) =>
        setTimeout(() => resolve([...mockAuthors]), 500)
      );
    }
    return api.get<Author[]>("/api/authors");
  },

  create: async (author: Omit<Author, "id">): Promise<Author> => {
    if (USE_MOCK) {
      return new Promise((resolve) =>
        setTimeout(() => {
          const created: Author = { id: ++lastAuthorId, ...author };
          mockAuthors.unshift(created);
          resolve(created);
        }, 500)
      );
    }
    return api.post<Author>("/api/authors", author);
  },
};
