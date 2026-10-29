'use client';

import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useState } from 'react';
import { deleteSummaryAction } from '@/actions/summary-actions';
import { toast } from 'sonner';

interface DeleteButtonProps {
  summaryId: string;
}

export default function DeleteButton({
  summaryId,
}: DeleteButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    try {
      setLoading(true);

      const result = await deleteSummaryAction({ summaryId });

      if (!result.success) {
        toast.error('Failed to delete summary');
        return;
      }

      toast.success('Summary deleted successfully');
      setOpen(false);
    } catch (error) {
      console.error('Error deleting summary:', error);
      toast.error('An error occurred while deleting the summary');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-400 bg-gray-50 border border-gray-200 hover:text-gray-600 hover:bg-gray-50"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Summary</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this summary?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            variant="outline"
            disabled={loading}
            className="bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200 hover:text-gray-900"
            onClick={() => setOpen(false)}
            >
             Cancel
          </Button>

          <Button
              variant="outline"
             disabled={loading}
             className="bg-gray-200 text-gray-800 border-gray-300 hover:bg-gray-300 hover:text-gray-900"
             onClick={handleDelete}
            >
             {loading ? 'Deleting...' : 'Delete'}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}