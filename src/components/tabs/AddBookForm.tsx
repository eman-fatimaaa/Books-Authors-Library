import React, { useState } from "react";
import type { Book } from "../../types/Book";
import type { Author } from "../../types/Authors";
import { searchBooksByTitle } from "../../services/googleBooksService";

type Props = {
  authors: Author[];
  onSubmit: (book: Omit<Book, "id">) => void;
  onCancel: () => void;
};

type Form = Omit<Book, "id">;

export default function AddBookForm({ authors, onSubmit, onCancel }: Props) {
  const [formData, setFormData] = useState<Form>({
    title: "",
    authorId: 0,
    isbn: "",
    publishedYear: 0,
    description: "",
    coverUrl: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<
    Array<{
      title: string;
      authorName: string;
      description: string;
      isbn: string;
      publishedYear: number;
      thumbnail: string;
    }>
  >([]);

  const handleChange: React.ChangeEventHandler<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  > = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "authorId" || name === "publishedYear" ? parseInt(value) || 0 : value,
    }));

    if (errors[name as keyof Form]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // search-as-you-type on title
    if (name === "title") {
      const query = value.trim();
      if (query.length >= 3) {
        setIsSearching(true);
        searchBooksByTitle(query)
          .then(setResults)
          .catch(() => setResults([]))
          .finally(() => setIsSearching(false));
      } else {
        setResults([]);
      }
    }
  };

  const handlePickSuggestion = (s: (typeof results)[number]) => {
    setFormData((prev) => ({
      ...prev,
      title: s.title,
      description: s.description || prev.description,
      isbn: s.isbn || prev.isbn,
      publishedYear: s.publishedYear || prev.publishedYear,
      coverUrl: s.thumbnail || prev.coverUrl,
    }));

    // check the list of authors your app already has
    const match = authors.find((a) => a.name === s.authorName);
    if (match) {
      setFormData((prev) => ({ ...prev, authorId: match.id! }));
      setErrors((prev) => ({ ...prev, authorId: "" }));
    } else {
      setErrors((prev) => ({
        ...prev,
        authorId: "No matching author found. Please select an author.",
      }));
    }
  };

  const validate = () => {
    const e: Partial<Record<keyof Form, string>> = {};
    if (!formData.title.trim()) e.title = "Title is required";
    if (!formData.authorId) e.authorId = "Select an author";
    if (!formData.isbn.trim()) e.isbn = "ISBN is required";
    if (!formData.publishedYear) e.publishedYear = "Published year is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    onSubmit(formData);
  };

  return (
    <form className="space-y-4 max-w-2xl" onSubmit={handleSubmit}>
      {/* Title + suggestions */}
      <div>
        <label htmlFor="title" className="block font-medium mb-1">
          Title *
        </label>
        <input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
            errors.title ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Enter book title"
        />
        {isSearching && <div className="text-sm text-gray-500 mt-1">Searching…</div>}

        {results.length > 0 && (
          <div className="mt-2 max-h-60 overflow-auto border rounded-lg bg-white shadow">
            {results.map((r, i) => (
              <button
                type="button"
                key={`${r.isbn}-${i}`}
                onClick={() => handlePickSuggestion(r)}
                className="w-full text-left px-3 py-2 hover:bg-gray-50 flex gap-3"
              >
                {r.thumbnail && (
                  // eslint-disable-next-line jsx-a11y/alt-text
                  <img src={r.thumbnail} className="w-10 h-14 object-cover rounded" />
                )}
                <div className="min-w-0">
                  <div className="font-medium truncate">{r.title}</div>
                  <div className="text-sm text-gray-600 truncate">
                    {r.authorName || "Unknown author"} · {r.publishedYear || "—"} · ISBN:{" "}
                    {r.isbn || "—"}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
        {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
      </div>

      {/* Author select (must exist in your list) */}
      <div>
        <label htmlFor="authorId" className="block font-medium mb-1">
          Author *
        </label>
        <select
          id="authorId"
          name="authorId"
          value={formData.authorId || 0}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg ${
            errors.authorId ? "border-red-500" : "border-gray-300"
          }`}
        >
          <option value={0}>Select author…</option>
          {authors.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
        {errors.authorId && <p className="text-red-600 text-sm mt-1">{errors.authorId}</p>}
      </div>

      {/* ISBN + Year */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="isbn" className="block font-medium mb-1">
            ISBN *
          </label>
          <input
            id="isbn"
            name="isbn"
            value={formData.isbn}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg ${
              errors.isbn ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="978…"
          />
          {errors.isbn && <p className="text-red-600 text-sm mt-1">{errors.isbn}</p>}
        </div>

        <div>
          <label htmlFor="publishedYear" className="block font-medium mb-1">
            Published Year *
          </label>
          <input
            id="publishedYear"
            name="publishedYear"
            type="number"
            value={formData.publishedYear || 0}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg ${
              errors.publishedYear ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="2015"
          />
          {errors.publishedYear && (
            <p className="text-red-600 text-sm mt-1">{errors.publishedYear}</p>
          )}
        </div>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block font-medium mb-1">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          value={formData.description}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg border-gray-300"
        />
      </div>

      {/* Cover URL */}
      <div>
        <label htmlFor="coverUrl" className="block font-medium mb-1">
          Cover URL
        </label>
        <input
          id="coverUrl"
          name="coverUrl"
          value={formData.coverUrl}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg border-gray-300"
          placeholder="https://…"
        />
      </div>

      <div className="flex gap-3">
        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg">
          Save
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 border rounded-lg">
          Cancel
        </button>
      </div>
    </form>
  );
}
