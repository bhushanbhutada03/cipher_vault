import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Shield, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CredentialCard } from "@/components/credentials/CredentialCard";
import { useCredentials, useSearchCredentials } from "@/hooks/useCredentials";
import { useCategories } from "@/hooks/useCategories";
import { InlineAlert } from "@/components/common/InlineAlert";
import type { CredentialListResponse } from "@/types/credential";

function CredentialSkeleton() {
  return (
    <div className="flex h-[106px] flex-col justify-center rounded-xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="size-12 shrink-0 animate-pulse rounded-lg bg-surface-elevated" />
        <div className="min-w-0 flex-1 space-y-3">
          <div className="h-5 w-40 animate-pulse rounded bg-surface-elevated" />
          <div className="h-4 w-64 max-w-full animate-pulse rounded bg-surface-elevated" />
        </div>
      </div>
    </div>
  );
}

export default function Credentials() {
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Debounce the search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedKeyword(keyword.trim());
    }, 400);
    return () => clearTimeout(handler);
  }, [keyword]);

  const {
    data: allCredentials,
    isPending: isAllPending,
    error: allCredentialsError,
  } = useCredentials();

  const {
    data: searchResults,
    isPending: isSearchPending,
    error: searchError,
  } = useSearchCredentials(debouncedKeyword);

  const { data: categories } = useCategories();

  const isSearching = debouncedKeyword.length > 0;
  const isPending = isSearching ? isSearchPending : isAllPending;
  const error = isSearching ? searchError : allCredentialsError;
  const rawData = isSearching ? searchResults : allCredentials;

  // Apply client-side category filter
  const filteredCredentials = useMemo(() => {
    if (!rawData) return [];
    if (selectedCategory === "All") return rawData;
    return rawData.filter(
      (cred: CredentialListResponse) => cred.categoryName === selectedCategory
    );
  }, [rawData, selectedCategory]);

  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="rounded-2xl border border-border bg-surface px-5 py-6 shadow-sm sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-brass">
                Vault
              </p>
              <div>
                <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  Credentials
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                  Manage and access all your saved accounts securely.
                </p>
              </div>
            </div>

            <Button type="button" className="w-full sm:w-auto" asChild>
              <Link to="/credentials/new">
                <Plus className="size-4" aria-hidden="true" />
                Add Credential
              </Link>
            </Button>
          </div>

          {/* Filters and Search Bar */}
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search credentials..."
                className="pl-9"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
              {keyword && (
                <button
                  type="button"
                  onClick={() => setKeyword("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <XCircle className="size-4" />
                </button>
              )}
            </div>
            
            <div className="sm:w-64">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="flex h-11 w-full rounded-md border border-border-strong bg-surface px-3.5 py-2 text-sm text-foreground transition-colors duration-150 focus-visible:border-brass focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass/30"
                aria-label="Filter by category"
              >
                <option value="All">All Categories</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.categoryName}>
                    {cat.categoryName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {error ? (
          <InlineAlert variant="error">{error.message}</InlineAlert>
        ) : null}

        {!error && (
          <section>
            {isPending ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <CredentialSkeleton key={i} />
                ))}
              </div>
            ) : filteredCredentials.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredCredentials.map((credential) => (
                  <CredentialCard key={credential.id} credential={credential} />
                ))}
              </div>
            ) : (
              <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-border bg-surface px-6 py-12 text-center shadow-sm">
                <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-brass-soft text-brass">
                  {isSearching || selectedCategory !== "All" ? (
                    <Search className="size-7" />
                  ) : (
                    <Shield className="size-7" />
                  )}
                </div>
                <h3 className="font-display text-2xl font-semibold text-foreground">
                  {isSearching || selectedCategory !== "All"
                    ? "No results found"
                    : "No credentials yet"}
                </h3>
                <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
                  {isSearching || selectedCategory !== "All"
                    ? "Try adjusting your search or category filter to find what you're looking for."
                    : "Save your first credential to start organizing your digital life securely."}
                </p>
                {(!isSearching && selectedCategory === "All") && (
                  <Button type="button" className="mt-6 min-w-36" asChild>
                    <Link to="/credentials/new">Add Credential</Link>
                  </Button>
                )}
                {(isSearching || selectedCategory !== "All") && (
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-6 min-w-36"
                    onClick={() => {
                      setKeyword("");
                      setSelectedCategory("All");
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
