import { useListBorrows, useReturnBook, getListBorrowsQueryKey, getListBooksQueryKey, getGetBookStatsQueryKey } from "@workspace/api-client-react";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { History, BookCheck } from "lucide-react";
import { Link } from "wouter";

export default function BorrowsPage() {
  const { data: borrows, isLoading, error } = useListBorrows();
  const returnBook = useReturnBook();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleReturn = (borrowId: number, bookTitle: string) => {
    returnBook.mutate(
      { id: borrowId },
      {
        onSuccess: () => {
          toast({
            title: "Book Returned",
            description: `Successfully recorded return of "${bookTitle}".`,
          });
          queryClient.invalidateQueries({ queryKey: getListBorrowsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getListBooksQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetBookStatsQueryKey() });
        },
        onError: (error) => {
          toast({
            title: "Error returning book",
            description: error.error || "Failed to process the return.",
            variant: "destructive",
          });
        }
      }
    );
  };

  if (error) {
    return (
      <div className="p-8 text-center max-w-md mx-auto mt-12">
        <h2 className="text-2xl font-serif text-destructive mb-2">Unable to load records</h2>
        <p className="text-muted-foreground">Please check your connection and try again.</p>
      </div>
    );
  }

  // Filter to show only active borrows
  const activeBorrows = borrows?.filter(b => b.returnedAt === null) || [];
  // Sort by date borrowed, newest first
  const sortedBorrows = [...activeBorrows].sort((a, b) => 
    new Date(b.borrowedAt).getTime() - new Date(a.borrowedAt).getTime()
  );

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-8 lg:p-10 space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-4xl font-serif font-bold text-foreground mb-2">Active Borrows</h1>
          <p className="text-lg text-muted-foreground">
            Currently checked out materials awaiting return.
          </p>
        </div>
        <div className="bg-muted px-4 py-2 rounded-md">
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider mr-2">Total</span>
          <span className="text-xl font-bold">{activeBorrows.length}</span>
        </div>
      </header>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="flex flex-col md:flex-row gap-6 justify-between md:items-center">
                <div className="space-y-3 flex-1">
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
                <div className="space-y-3 w-48">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : sortedBorrows.length === 0 ? (
        <div className="text-center py-20 bg-muted/30 rounded-xl border border-border/50 border-dashed">
          <History className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-serif text-foreground mb-2">No active borrows</h3>
          <p className="text-muted-foreground mb-6">All library materials are currently available.</p>
          <Button asChild variant="outline">
            <Link href="/">Browse Catalog</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {sortedBorrows.map((borrow) => {
            const borrowedDate = new Date(borrow.borrowedAt);
            const bookTitle = borrow.book?.title || "Unknown Book";
            
            return (
              <Card key={borrow.id} className="overflow-hidden hover:border-primary/20 transition-colors">
                <div className="p-5 md:p-6 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs bg-muted">
                        Record #{borrow.id}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Borrowed on {format(borrowedDate, "MMMM d, yyyy")}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-serif font-bold text-foreground mt-2 mb-1 truncate">
                      {bookTitle}
                    </h3>
                    <p className="text-foreground">
                      <span className="text-muted-foreground">Reader:</span> <span className="font-medium">{borrow.borrowerName}</span>
                    </p>
                  </div>
                  
                  <div className="flex shrink-0 w-full md:w-auto">
                    <Button 
                      onClick={() => handleReturn(borrow.id, bookTitle)}
                      disabled={returnBook.isPending}
                      className="w-full md:w-auto"
                      size="lg"
                    >
                      <BookCheck className="w-4 h-4 mr-2" />
                      {returnBook.isPending ? "Processing..." : "Process Return"}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
