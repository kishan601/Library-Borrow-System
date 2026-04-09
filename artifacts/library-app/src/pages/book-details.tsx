import { useParams } from "wouter";
import { Link } from "wouter";
import { useGetBook } from "@workspace/api-client-react";
import { getGetBookQueryKey } from "@workspace/api-client-react";
import { BorrowDialog } from "@/components/borrow-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Book as BookIcon } from "lucide-react";

export default function BookDetailsPage() {
  const params = useParams<{ id: string }>();
  const bookId = parseInt(params.id || "0", 10);

  const { data: book, isLoading, error } = useGetBook(bookId, {
    query: {
      enabled: !!bookId,
      queryKey: getGetBookQueryKey(bookId),
    }
  });

  if (error || (!isLoading && !book)) {
    return (
      <div className="p-8 text-center max-w-md mx-auto mt-12">
        <h2 className="text-2xl font-serif text-destructive mb-2">Book not found</h2>
        <p className="text-muted-foreground mb-6">The requested book could not be found in the catalog.</p>
        <Button asChild variant="outline">
          <Link href="/">Return to Catalog</Link>
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 md:p-10">
        <Skeleton className="h-10 w-32 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-10">
          <Skeleton className="aspect-[3/4] w-full rounded-lg" />
          <div className="space-y-6 pt-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-6 w-1/2" />
            <div className="flex gap-4">
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-8 w-32 rounded-full" />
            </div>
            <div className="space-y-3 pt-6">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isUnavailable = book!.availableCopies <= 0;

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10">
      <Button asChild variant="ghost" className="mb-8 pl-0 hover:bg-transparent">
        <Link href="/" className="flex items-center text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Catalog
        </Link>
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-[minmax(250px,300px)_1fr] gap-10 md:gap-16">
        {/* Book Cover Stand-in */}
        <div className="bg-muted rounded-lg aspect-[3/4] p-8 flex flex-col justify-center items-center text-center border shadow-sm relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-4 bg-primary/20" />
          <BookIcon className="w-16 h-16 text-muted-foreground/30 mb-6" />
          <h2 className="font-serif text-2xl font-bold text-foreground leading-tight">
            {book!.title}
          </h2>
          <p className="mt-4 font-medium text-muted-foreground">
            {book!.author}
          </p>
        </div>

        {/* Details Info */}
        <div className="flex flex-col">
          <div className="mb-6">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-3 leading-tight">
              {book!.title}
            </h1>
            <p className="text-xl text-muted-foreground">
              By <span className="font-medium text-foreground">{book!.author}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-8">
            <Badge variant="secondary" className="px-3 py-1 text-sm font-normal">
              {book!.genre}
            </Badge>
            <div className={`px-3 py-1 text-sm rounded-md border ${
              isUnavailable 
                ? "bg-destructive/10 text-destructive border-destructive/20" 
                : "bg-primary/10 text-primary border-primary/20"
            }`}>
              <span className="font-medium">{book!.availableCopies}</span> of {book!.totalCopies} copies available
            </div>
          </div>

          <div className="prose prose-sm md:prose-base text-muted-foreground max-w-none mb-10">
            <h3 className="text-foreground font-serif text-xl mb-3">About this edition</h3>
            <p className="leading-relaxed">
              {book!.description}
            </p>
          </div>

          <div className="mt-auto pt-8 border-t border-border">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
              <div>
                <p className="text-sm font-medium text-foreground mb-1">Interested in reading?</p>
                <p className="text-xs text-muted-foreground">Record a borrow to check out this title.</p>
              </div>
              <BorrowDialog 
                bookId={book!.id} 
                bookTitle={book!.title} 
                availableCopies={book!.availableCopies}
                trigger={
                  <Button size="lg" disabled={isUnavailable} className="w-full sm:w-auto text-base">
                    {isUnavailable ? "Currently Unavailable" : "Borrow Copy"}
                  </Button>
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
