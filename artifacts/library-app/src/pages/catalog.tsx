import { Link } from "wouter";
import { useListBooks } from "@workspace/api-client-react";
import { BorrowDialog } from "@/components/borrow-dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen } from "lucide-react";

export default function CatalogPage() {
  const { data: books, isLoading, error } = useListBooks();

  if (error) {
    return (
      <div className="p-8 text-center max-w-md mx-auto mt-12">
        <h2 className="text-2xl font-serif text-destructive mb-2">Unable to load catalog</h2>
        <p className="text-muted-foreground">Please check your connection and try again.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8 lg:p-10 space-y-8">
      <header>
        <h1 className="text-4xl font-serif font-bold text-foreground mb-3">Library Catalog</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Browse our collection of titles. Select a book to view details or borrow a copy directly.
        </p>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="overflow-hidden border-border/60 shadow-sm">
              <div className="aspect-[3/4] bg-muted/50 p-6 flex flex-col justify-end">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <CardContent className="p-5">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-4/5 mb-4" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {books?.map((book) => {
            const isUnavailable = book.availableCopies <= 0;
            
            return (
              <Card key={book.id} className="flex flex-col overflow-hidden hover:border-primary/30 transition-colors duration-300">
                <Link href={`/books/${book.id}`}>
                  <div className="aspect-[3/4] bg-muted p-6 flex flex-col justify-end border-b border-border relative group cursor-pointer">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10">
                      <h3 className="font-serif font-bold text-xl text-foreground group-hover:text-white transition-colors line-clamp-2">
                        {book.title}
                      </h3>
                      <p className="text-sm text-muted-foreground group-hover:text-white/80 transition-colors mt-1 font-medium">
                        {book.author}
                      </p>
                    </div>
                  </div>
                </Link>
                
                <CardContent className="p-5 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="secondary" className="text-xs font-normal">
                      {book.genre}
                    </Badge>
                    <span className={`text-xs font-medium ${isUnavailable ? 'text-destructive' : 'text-primary'}`}>
                      {book.availableCopies} of {book.totalCopies} available
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">
                    {book.description}
                  </p>
                </CardContent>
                
                <CardFooter className="p-5 pt-0">
                  <BorrowDialog 
                    bookId={book.id} 
                    bookTitle={book.title} 
                    availableCopies={book.availableCopies} 
                  />
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
      
      {books?.length === 0 && (
        <div className="text-center py-20 bg-muted/30 rounded-xl border border-border/50 border-dashed">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-serif text-foreground mb-2">The catalog is empty</h3>
          <p className="text-muted-foreground">No books have been added to the library yet.</p>
        </div>
      )}
    </div>
  );
}
