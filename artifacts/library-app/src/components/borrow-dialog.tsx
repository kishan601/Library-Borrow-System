import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { useBorrowBook, getListBooksQueryKey, getListBorrowsQueryKey, getGetBookQueryKey, getGetBookStatsQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { BookOpen } from "lucide-react";

const formSchema = z.object({
  borrowerName: z.string().min(2, "Name must be at least 2 characters."),
});

interface BorrowDialogProps {
  bookId: number;
  bookTitle: string;
  availableCopies: number;
  trigger?: React.ReactNode;
}

export function BorrowDialog({ bookId, bookTitle, availableCopies, trigger }: BorrowDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const borrowBook = useBorrowBook();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      borrowerName: "",
    },
  });

  const isUnavailable = availableCopies <= 0;

  function onSubmit(values: z.infer<typeof formSchema>) {
    borrowBook.mutate(
      { data: { bookId, borrowerName: values.borrowerName } },
      {
        onSuccess: () => {
          setOpen(false);
          form.reset();
          toast({
            title: "Book Borrowed",
            description: `You have successfully borrowed "${bookTitle}".`,
          });
          // Invalidate queries to refresh lists and stats
          queryClient.invalidateQueries({ queryKey: getListBooksQueryKey() });
          queryClient.invalidateQueries({ queryKey: getListBorrowsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetBookQueryKey(bookId) });
          queryClient.invalidateQueries({ queryKey: getGetBookStatsQueryKey() });
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error.error || "Failed to borrow the book. Please try again.",
            variant: "destructive",
          });
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button 
            disabled={isUnavailable} 
            className="w-full sm:w-auto"
            data-testid={`button-borrow-${bookId}`}
          >
            {isUnavailable ? "Unavailable" : "Borrow Copy"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Borrow Book</DialogTitle>
          <DialogDescription>
            You are borrowing a copy of <span className="font-medium text-foreground">{bookTitle}</span>. 
            Please enter your name for the library records.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="borrowerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reader Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Jane Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={borrowBook.isPending}>
                {borrowBook.isPending ? "Processing..." : "Confirm Borrow"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
