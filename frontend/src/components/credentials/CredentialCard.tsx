import { Link } from "react-router-dom";
import { FolderOpen, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CredentialListResponse } from "@/types/credential";
import { useToggleFavoriteMutation } from "@/hooks/useCredentials";

interface CredentialCardProps {
  credential: CredentialListResponse;
}

export function CredentialCard({ credential }: CredentialCardProps) {
  const toggleFavorite = useToggleFavoriteMutation();

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite.mutate(credential.id);
  };

  return (
    <Link
      to={`/credentials/${credential.id}`}
      className="group block overflow-hidden rounded-xl border border-border bg-surface transition-all duration-200 hover:border-brass/50 hover:shadow-md"
    >
      <div className="flex items-start justify-between p-5">
        <div className="flex items-start gap-4 overflow-hidden">
          {/* Favicon or fallback icon */}
          <div className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-border bg-background shadow-sm">
            {credential.faviconUrl ? (
              <img
                src={credential.faviconUrl}
                alt={`${credential.websiteName} favicon`}
                className="size-6 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <div className="flex size-6 items-center justify-center rounded-sm bg-muted text-xs font-bold text-muted-foreground uppercase">
                {credential.websiteName.charAt(0)}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-1">
            <h3 className="truncate font-display text-base font-semibold text-foreground group-hover:text-brass transition-colors">
              {credential.websiteName}
            </h3>
            {credential.websiteUrl && (
              <p className="truncate text-sm text-muted-foreground">
                {credential.websiteUrl}
              </p>
            )}
            <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <FolderOpen className="size-3.5" />
              <span className="truncate">{credential.categoryName}</span>
            </div>
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 transition-colors"
          onClick={handleToggleFavorite}
          disabled={toggleFavorite.isPending}
          aria-label={credential.favorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Star
            className={`size-5 transition-all duration-200 ${
              credential.favorite
                ? "fill-brass text-brass"
                : "text-muted-foreground group-hover:text-brass"
            }`}
          />
        </Button>
      </div>
    </Link>
  );
}
