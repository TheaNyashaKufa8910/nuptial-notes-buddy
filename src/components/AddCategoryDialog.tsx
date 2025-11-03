import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

type AddCategoryDialogProps = {
  weddingId: string;
  onCategoryAdded: () => void;
};

export const AddCategoryDialog = ({ weddingId, onCategoryAdded }: AddCategoryDialogProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    budgeted: '',
    icon: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.budgeted) {
      toast({
        title: 'Error',
        description: 'Category name and budget are required',
        variant: 'destructive',
      });
      return;
    }

    const { error } = await supabase
      .from('budget_categories')
      .insert({
        wedding_id: weddingId,
        name: formData.name,
        budgeted: parseFloat(formData.budgeted),
        spent: 0,
        icon: formData.icon || null,
      });

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Success',
      description: 'Category added successfully',
    });

    setFormData({
      name: '',
      budgeted: '',
      icon: '',
    });
    setOpen(false);
    onCategoryAdded();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Budget Category</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Category Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Venue, Catering"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="budgeted">Budgeted Amount *</Label>
            <Input
              id="budgeted"
              type="number"
              step="0.01"
              value={formData.budgeted}
              onChange={(e) => setFormData(prev => ({ ...prev, budgeted: e.target.value }))}
              placeholder="5000"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="icon">Icon (optional)</Label>
            <Input
              id="icon"
              value={formData.icon}
              onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
              placeholder="e.g., venue, catering"
            />
          </div>
          <Button type="submit" className="w-full">
            Add Category
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
