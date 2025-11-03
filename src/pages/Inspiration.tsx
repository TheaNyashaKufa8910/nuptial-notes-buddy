import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { BackButton } from '@/components/BackButton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Trash2, Share2, Image as ImageIcon, Video } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';

type InspirationItem = {
  id: string;
  wedding_id: string;
  media_url: string;
  media_type: string;
  title: string | null;
  notes: string | null;
  shared_with_vendors: boolean | null;
  created_at: string;
};

export default function Inspiration() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<InspirationItem[]>([]);
  const [weddingId, setWeddingId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    notes: '',
    mediaType: 'image' as 'image' | 'video',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    const { data: weddingData } = await supabase
      .from('weddings')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (weddingData) {
      setWeddingId(weddingData.id);

      const { data: inspirationData } = await supabase
        .from('inspiration_items')
        .select('*')
        .eq('wedding_id', weddingData.id)
        .order('created_at', { ascending: false });

      if (inspirationData) {
        setItems(inspirationData);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const type = file.type.startsWith('image/') ? 'image' : 'video';
      setFormData(prev => ({ ...prev, mediaType: type }));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !weddingId || !user) return;

    setUploading(true);
    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('inspiration')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('inspiration')
        .getPublicUrl(fileName);

      const { error: insertError } = await supabase
        .from('inspiration_items')
        .insert({
          wedding_id: weddingId,
          media_url: publicUrl,
          media_type: formData.mediaType,
          title: formData.title || null,
          notes: formData.notes || null,
        });

      if (insertError) throw insertError;

      toast({
        title: 'Success',
        description: 'Inspiration item added successfully',
      });

      setIsDialogOpen(false);
      setFormData({ title: '', notes: '', mediaType: 'image' });
      setSelectedFile(null);
      loadData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, mediaUrl: string) => {
    try {
      const filePath = mediaUrl.split('/inspiration/')[1];
      if (filePath) {
        await supabase.storage.from('inspiration').remove([filePath]);
      }

      const { error } = await supabase
        .from('inspiration_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Item deleted successfully',
      });

      loadData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const toggleShareWithVendors = async (id: string, currentValue: boolean) => {
    const { error } = await supabase
      .from('inspiration_items')
      .update({ shared_with_vendors: !currentValue })
      .eq('id', id);

    if (!error) {
      setItems(prev =>
        prev.map(item =>
          item.id === id ? { ...item, shared_with_vendors: !currentValue } : item
        )
      );
    }
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <BackButton />
            <h1 className="text-3xl font-serif font-bold mt-2">Inspiration Board</h1>
            <p className="text-muted-foreground">Collect and organize your wedding ideas</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Inspiration
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Inspiration</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="file">Upload Image or Video</Label>
                  <Input
                    id="file"
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileSelect}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Title (Optional)</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Floral centerpiece idea"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Add any notes or ideas..."
                    rows={3}
                  />
                </div>
                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || uploading}
                  className="w-full"
                >
                  {uploading ? 'Uploading...' : 'Add to Board'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {items.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-24">
              <ImageIcon className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No inspiration yet
              </h3>
              <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
                Start building your inspiration board with images and videos
              </p>
              <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Your First Item
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <Card key={item.id} className="overflow-hidden group">
                <div className="relative aspect-square bg-muted">
                  {item.media_type === 'image' ? (
                    <img
                      src={item.media_url}
                      alt={item.title || 'Inspiration'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      src={item.media_url}
                      className="w-full h-full object-cover"
                      controls
                    />
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDelete(item.id, item.media_url)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="absolute top-2 right-2">
                    {item.media_type === 'video' ? (
                      <Video className="h-5 w-5 text-white drop-shadow-lg" />
                    ) : (
                      <ImageIcon className="h-5 w-5 text-white drop-shadow-lg" />
                    )}
                  </div>
                </div>
                <CardContent className="p-4 space-y-2">
                  {item.title && (
                    <h3 className="font-medium">{item.title}</h3>
                  )}
                  {item.notes && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {item.notes}
                    </p>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <Share2 className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor={`share-${item.id}`} className="text-sm cursor-pointer">
                        Share with vendors
                      </Label>
                    </div>
                    <Switch
                      id={`share-${item.id}`}
                      checked={item.shared_with_vendors || false}
                      onCheckedChange={() => toggleShareWithVendors(item.id, item.shared_with_vendors || false)}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
