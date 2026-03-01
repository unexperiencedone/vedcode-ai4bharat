import { useState } from "react";
import { Search } from "lucide-react";

export function KeywordSearch({ onSearch, isLoading }: { onSearch: (keyword: string) => void, isLoading: boolean }) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query.trim());
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <form onSubmit={handleSubmit} className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-muted-foreground">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a concept or keyword (e.g., PostgreSQL Indexing)..."
          className="w-full pl-12 pr-4 py-4 bg-background border border-border/50 text-foreground rounded-xl shadow-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="absolute inset-y-2 right-2 px-4 bg-primary/10 hover:bg-primary/20 text-primary font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          {isLoading ? "Searching..." : "Explain"}
        </button>
      </form>
      <div className="flex gap-2 mt-3 text-xs text-muted-foreground px-1 items-center">
        <span>Suggested:</span>
        {["Zod Validation", "Drizzle Migrations", "Next.js Middleware"].map((term) => (
          <button
            key={term}
            onClick={() => {
              setQuery(term);
              onSearch(term);
            }}
            className="hover:text-primary transition-colors border border-border/40 px-2 py-0.5 rounded-full"
          >
            {term}
          </button>
        ))}
      </div>
    </div>
  );
}
