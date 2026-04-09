import { Link, useLocation } from "wouter";
import { useGetBookStats } from "@workspace/api-client-react";
import { BookOpen, History, Library } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { data: stats, isLoading } = useGetBookStats();

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-background">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 border-b md:border-r border-border bg-card flex flex-col">
        <div className="p-6 border-b border-border flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
            <Library className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif font-semibold text-lg text-foreground leading-tight">Athenaeum</h1>
            <p className="text-xs text-muted-foreground">Library Catalog</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Link
            href="/"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
              location === "/" || location.startsWith("/books/")
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Catalog</span>
          </Link>
          <Link
            href="/borrows"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
              location === "/borrows"
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <History className="w-4 h-4" />
            <span>Active Borrows</span>
          </Link>
        </nav>

        {/* Stats Panel */}
        <div className="p-4 m-4 rounded-lg bg-muted border border-border/50">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Library Overview
          </h3>
          {isLoading || !stats ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          ) : (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Titles</span>
                <span className="font-medium">{stats.totalBooks}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Available</span>
                <span className="font-medium text-primary">{stats.availableCopies}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Borrowed</span>
                <span className="font-medium">{stats.activeBorrows}</span>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
