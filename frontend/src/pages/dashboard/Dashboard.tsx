import { useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  FolderOpen,
  FolderTree,
  RefreshCcw,
  Shield,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import { useDashboard } from "@/hooks/useDashboard";
import type { RecentCredential } from "@/types/dashboard";

function SummaryCard({
  icon,
  title,
  value,
}: {
  icon: ReactNode;
  title: string;
  value: number;
}) {
  return (
    <div className="ui-card-interactive group rounded-xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 font-display text-3xl font-semibold text-foreground">
            {value.toLocaleString()}
          </p>
        </div>
        <div className="flex size-11 items-center justify-center rounded-lg bg-brass-soft text-brass transition-transform duration-200 ease-out group-hover:scale-[1.05]">
          {icon}
        </div>
      </div>
    </div>
  );
}

function SummaryCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <div className="h-4 w-28 animate-pulse rounded bg-surface-elevated" />
          <div className="h-9 w-20 animate-pulse rounded bg-surface-elevated" />
        </div>
        <div className="size-11 animate-pulse rounded-lg bg-surface-elevated" />
      </div>
    </div>
  );
}

function RecentCredentialRow({
  credential,
}: {
  credential: RecentCredential;
}) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <article className="ui-card-interactive flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border-strong bg-surface-elevated">
          {credential.faviconUrl && !imageFailed ? (
            <img
              src={credential.faviconUrl}
              alt=""
              aria-hidden="true"
              className="size-full object-contain p-2"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <Shield className="size-5 text-brass" aria-hidden="true" />
          )}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-foreground">
              {credential.websiteName}
            </h3>
            {credential.favorite ? (
              <span
                className="inline-flex items-center gap-1 rounded-full bg-brass-soft px-2 py-1 text-[11px] font-medium text-brass"
                aria-label="Favorite credential"
              >
                <Star className="size-3.5 fill-current" aria-hidden="true" />
                Favorite
              </span>
            ) : null}
          </div>

          <p className="mt-1 truncate text-sm text-muted-foreground">
            {credential.websiteUrl}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="inline-flex items-center rounded-full border border-brass/20 bg-brass-soft px-3 py-1 text-xs font-medium text-brass">
          <FolderTree className="mr-1.5 size-3.5" aria-hidden="true" />
          {credential.categoryName}
        </span>
      </div>
    </article>
  );
}

function RecentCredentialSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-4">
        <div className="size-12 shrink-0 animate-pulse rounded-lg bg-surface-elevated" />
        <div className="min-w-0 space-y-3">
          <div className="h-4 w-44 animate-pulse rounded bg-surface-elevated" />
          <div className="h-3 w-64 max-w-full animate-pulse rounded bg-surface-elevated" />
        </div>
      </div>
      <div className="h-7 w-28 animate-pulse rounded-full bg-surface-elevated" />
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { data, error, isPending, refetch, isFetching } = useDashboard();

  const summaryCards = useMemo(
    () => [
      {
        title: "Total Credentials",
        value: data?.totalCredentials ?? 0,
        icon: <Shield className="size-5" aria-hidden="true" />,
      },
      {
        title: "Favorite Credentials",
        value: data?.favoriteCredentials ?? 0,
        icon: <Star className="size-5 fill-current" aria-hidden="true" />,
      },
      {
        title: "Total Categories",
        value: data?.totalCategories ?? 0,
        icon: <FolderOpen className="size-5" aria-hidden="true" />,
      },
    ],
    [data]
  );

  const hasCredentials = (data?.recentCredentials?.length ?? 0) > 0;
  const showLoading = isPending;
  const showError = Boolean(error);
  const showEmpty = !showLoading && !showError && !hasCredentials;

  return (
    <main className="ui-page-fade min-h-screen bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="rounded-2xl border border-border bg-surface px-5 py-6 shadow-sm sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-brass">
                Dashboard
              </p>
              <div>
                <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  Vault overview
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                  Review saved credentials, favorites, and recent activity.
                </p>
              </div>
            </div>

            <Button
              type="button"
              className="w-full sm:w-auto"
              onClick={() => navigate("/credentials/new")}
            >
              Add Credential
            </Button>
          </div>
        </section>

        {showError ? (
          <section className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-border bg-surface px-6 py-12 text-center shadow-sm">
            <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-danger-soft text-danger">
              <AlertCircle className="size-6" aria-hidden="true" />
            </div>
            <h2 className="font-display text-2xl font-semibold text-foreground">
              We could not load your dashboard
            </h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
              {error?.message ?? "Please try again in a moment."}
            </p>
            <Button type="button" className="mt-6 min-w-32" onClick={() => refetch()}>
              <RefreshCcw className={cn("size-4", isFetching && "animate-spin")} />
              Retry
            </Button>
          </section>
        ) : null}

        {!showError ? (
          <>
            <section className="grid gap-4 md:grid-cols-3">
              {showLoading
                ? Array.from({ length: 3 }).map((_, index) => (
                    <SummaryCardSkeleton key={index} />
                  ))
                : summaryCards.map((card) => (
                    <SummaryCard
                      key={card.title}
                      icon={card.icon}
                      title={card.title}
                      value={card.value}
                    />
                  ))}
            </section>

            <section className="rounded-2xl border border-border bg-surface shadow-sm">
              <div className="flex flex-col gap-2 border-b border-border px-5 py-5 sm:px-6">
                <h2 className="font-display text-xl font-semibold text-foreground">
                  Recent Credentials
                </h2>
                <p className="text-sm text-muted-foreground">
                  Latest saved credentials.
                </p>
              </div>

              <div className="space-y-4 p-5 sm:p-6">
                {showLoading
                  ? Array.from({ length: 4 }).map((_, index) => (
                      <RecentCredentialSkeleton key={index} />
                    ))
                  : null}

                {showEmpty ? (
                  <div className="flex min-h-[320px] flex-col items-center justify-center px-6 py-12 text-center">
                    <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-brass-soft text-brass">
                      <FolderOpen className="size-7" aria-hidden="true" />
                    </div>
                    <h3 className="font-display text-2xl font-semibold text-foreground">
                      No credentials yet
                    </h3>
                    <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
                      Add your first credential to get started.
                    </p>
                    <Button
                      type="button"
                      className="mt-6 min-w-36"
                      onClick={() => navigate("/credentials/new")}
                    >
                      Add Credential
                    </Button>
                  </div>
                ) : null}

                {!showLoading && !showEmpty && data?.recentCredentials?.length ? (
                  <div className="space-y-4">
                    {data.recentCredentials.map((credential) => (
                      <RecentCredentialRow key={credential.id} credential={credential} />
                    ))}
                  </div>
                ) : null}
              </div>
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}
