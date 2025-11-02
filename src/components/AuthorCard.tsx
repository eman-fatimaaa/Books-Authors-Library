import type { Author } from "../types/Authors";

type Props = {
  author: Author;     // no Required<...>
  bookCount: number;
};

export default function AuthorCard({ author, bookCount }: Props) {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex items-baseline justify-between">
        <h3 className="font-semibold text-lg">{author.name}</h3>
        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">
          {bookCount} book{bookCount === 1 ? "" : "s"}
        </span>
      </div>

      <div className="text-sm text-gray-600 mt-1">
        {author.country || "—"} • {author.birthYear || "—"}
      </div>

      {author.bio && (
        <p className="text-sm text-gray-700 mt-2 line-clamp-3">{author.bio}</p>
      )}
    </div>
  );
}
