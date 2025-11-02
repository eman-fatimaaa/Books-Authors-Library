import type { Book } from "../types/Book";
import type { Author } from "../types/Authors";

type Props = {
  book: Book;       // no Required<...> casting needed
  author: Author;   // resolved from authorId
};

export default function BookCard({ book, author }: Props) {
  return (
    <div className="p-4 bg-white rounded-lg shadow flex gap-4 items-start">
      {book.coverUrl ? (
        // eslint-disable-next-line jsx-a11y/alt-text
        <img
          src={book.coverUrl}
          className="w-16 h-24 object-cover rounded"
        />
      ) : (
        <div className="w-16 h-24 bg-gray-200 rounded" />
      )}

      <div className="min-w-0">
        <div className="font-semibold text-lg truncate">{book.title}</div>
        <div className="text-sm text-gray-600">
          {author.name} · {book.publishedYear || "—"} · ISBN: {book.isbn || "—"}
        </div>
        {book.description && (
          <p className="text-sm text-gray-700 mt-1 line-clamp-3">
            {book.description}
          </p>
        )}
      </div>
    </div>
  );
}
