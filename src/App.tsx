import { useEffect, useMemo, useState } from "react";
import { BookOpen } from "lucide-react";

import BookCard from "./components/BookCard";
import AuthorCard from "./components/AuthorCard";
import SearchBar from "./components/SearchBar";
import AddAuthorForm from "./components/tabs/AddAuthorForm";
import AddBookForm from "./components/tabs/AddBookForm";
import NavigationTabs from "./components/NavogationTabs";

import type { Author } from "./types/Authors";
import type { Book } from "./types/Book";

import { authorsService } from "./services/authorsService";
import { booksService } from "./services/booksService";

const App = () => {
	// UI state
	const [activeTab, setActiveTab] =
		useState<"books" | "authors" | "add-author" | "add-book">("books");
	const [searchTerm, setSearchTerm] = useState("");

	// Data state
	const [authors, setAuthors] = useState<Author[]>([]);
	const [books, setBooks] = useState<Book[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Load data (mock or real depending on env)
	useEffect(() => {
		let cancelled = false;
		(async () => {
			setLoading(true);
			setError(null);
			try {
				const [a, b] = await Promise.all([
					authorsService.getAll(),
					booksService.getAll(),
				]);
				if (cancelled) return;
				setAuthors(a);
				setBooks(b);
			} catch (e: any) {
				if (!cancelled) setError(e?.message ?? "Failed to load data");
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, []);

	// Helpers
	const getAuthorById = (authorId: number) =>
		authors.find((author) => author.id === authorId);

	const getBookCountByAuthor = (authorId: number) =>
		books.filter((book) => book.authorId === authorId).length;

	// Filters
	const filteredBooks = useMemo(() => {
		const q = searchTerm.toLowerCase().trim();
		if (!q) return books;
		return books.filter((book) => {
			const author = getAuthorById(book.authorId);
			return (
				book.title.toLowerCase().includes(q) ||
				(author?.name.toLowerCase().includes(q) ?? false)
			);
		});
	}, [books, authors, searchTerm]);

	const filteredAuthors = useMemo(() => {
		const q = searchTerm.toLowerCase().trim();
		if (!q) return authors;
		return authors.filter((a) => a.name.toLowerCase().includes(q));
	}, [authors, searchTerm]);

	// Create handlers
	const handleAddAuthor = async (payload: Omit<Author, "id">) => {
		try {
			const created = await authorsService.create(payload);
			setAuthors((prev) => [created, ...prev]);
			setActiveTab("authors");
		} catch (e: any) {
			alert(e?.message ?? "Failed to add author");
		}
	};

	const handleAddBook = async (payload: Omit<Book, "id">) => {
		try {
			const created = await booksService.create(payload);
			setBooks((prev) => [created, ...prev]);
			setActiveTab("books");
		} catch (e: any) {
			alert(e?.message ?? "Failed to add book");
		}
	};

	return (
		<div className="min-h-screen bg-gray-100">
			{/* Header */}
			<header className="bg-indigo-600 text-white shadow-lg">
				<div className="container mx-auto px-4 py-6">
					<div className="flex items-center gap-3 mb-4">
						<BookOpen className="w-8 h-8" />
						<h1 className="text-3xl font-bold">Books & Authors Library</h1>
					</div>
					<SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
				</div>
			</header>

			{/* Tabs */}
			<NavigationTabs
				activeTab={activeTab}
				setActiveTab={(tab) =>
					setActiveTab(tab as "books" | "authors" | "add-author" | "add-book")
				}
				booksCount={filteredBooks.length}
				authorsCount={filteredAuthors.length}
			/>

			{/* Main */}
			<main className="container mx-auto px-4 py-8">
				{loading && <div className="text-center text-gray-500 py-12">Loading…</div>}
				{error && <div className="text-center text-red-600 py-4">Error: {error}</div>}

				{!loading && !error && (
					<>
						{/* Books */}
						{activeTab === "books" && (
							<div className="space-y-4 flex flex-col flex-wrap">
								{filteredBooks.length > 0 ? (
									filteredBooks.map((book, idx) => (
										<BookCard
											key={book.id ?? `${book.title}-${idx}`}
											book={book}
											author={getAuthorById(book.authorId)!}
										/>
									))
								) : (
									<div className="text-center py-12 text-gray-500">
										No books found matching your search.
									</div>
								)}
							</div>
						)}

						{/* Authors */}
						{activeTab === "authors" && (
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{filteredAuthors.length > 0 ? (
									filteredAuthors.map((author) => (
										<AuthorCard
											key={author.id ?? author.name}
											author={author}
											bookCount={getBookCountByAuthor(author.id!)}
										/>
									))
								) : (
									<div className="col-span-2 text-center py-12 text-gray-500">
										No authors found matching your search.
									</div>
								)}
							</div>
						)}

						{/* Add Author */}
						{activeTab === "add-author" && (
							<AddAuthorForm
								onSubmit={handleAddAuthor}
								onCancel={() => setActiveTab("authors")}
							/>
						)}

						{/* Add Book */}
						{activeTab === "add-book" && (
							<AddBookForm
								authors={authors}                       // use state
								onSubmit={handleAddBook}
								onCancel={() => setActiveTab("books")}   // required prop
							/>
						)}
					</>
				)}
			</main>
		</div>
	);
};

export default App;
