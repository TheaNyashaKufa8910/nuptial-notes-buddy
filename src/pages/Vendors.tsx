import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { BackButton } from '@/components/BackButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/lib/supabase';
import { Search, Star, MapPin, Phone, Mail, Heart } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

type Vendor = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  rating: number | null;
  reviews_count: number | null;
  created_at: string;
};

const categories = ['All', 'Venue', 'Catering', 'Photography', 'Flowers', 'Music', 'Decoration', 'Cake'];

export default function Vendors() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [myVendors, setMyVendors] = useState<Vendor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    const { data } = await supabase
      .from('vendors')
      .select('*')
      .order('rating', { ascending: false });

    if (data) {
      setVendors(data);
    }
  };

  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || vendor.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleMyVendor = (vendor: Vendor) => {
    setMyVendors((prev) => {
      const exists = prev.find(v => v.id === vendor.id);
      if (exists) {
        return prev.filter(v => v.id !== vendor.id);
      }
      return [...prev, vendor];
    });
  };

  const isMyVendor = (vendorId: string) => myVendors.some(v => v.id === vendorId);

  return (
    <Layout>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <BackButton />
            <h1 className="text-3xl font-serif font-bold mt-2">Vendor Marketplace</h1>
            <p className="text-muted-foreground">Discover and connect with wedding vendors</p>
          </div>
        </div>

        <ScrollArea className="w-full whitespace-nowrap rounded-md border">
          <div className="flex w-max space-x-2 p-4">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="shrink-0"
              >
                {category}
              </Button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search vendors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">All Vendors</TabsTrigger>
            <TabsTrigger value="my">My Vendors ({myVendors.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-6">
            <div className="grid gap-4 md:grid-cols-2">
              {filteredVendors.map((vendor) => (
                <Card key={vendor.id} className="transition-all hover:shadow-lg">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src="" />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {vendor.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{vendor.name}</CardTitle>
                          <Badge variant="secondary" className="mt-1">
                            {vendor.category}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleMyVendor(vendor)}
                      >
                        <Heart className={`h-5 w-5 ${isMyVendor(vendor.id) ? 'fill-primary text-primary' : ''}`} />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {vendor.description || 'Professional wedding services'}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm">
                      {vendor.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-primary text-primary" />
                          <span className="font-medium">{vendor.rating}</span>
                          <span className="text-muted-foreground">
                            ({vendor.reviews_count || 0} reviews)
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 pt-2 border-t">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>Los Angeles, CA</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>(555) 123-4567</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span>contact@{vendor.name.toLowerCase().replace(/\s+/g, '')}.com</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button className="flex-1" size="sm">View Profile</Button>
                      <Button variant="outline" size="sm">Contact</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredVendors.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-muted-foreground">No vendors found</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="my" className="space-y-4 mt-6">
            <div className="grid gap-4 md:grid-cols-2">
              {myVendors.map((vendor) => (
                <Card key={vendor.id} className="transition-all hover:shadow-lg">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src="" />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {vendor.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{vendor.name}</CardTitle>
                          <Badge variant="secondary" className="mt-1">
                            {vendor.category}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleMyVendor(vendor)}
                      >
                        <Heart className="h-5 w-5 fill-primary text-primary" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {vendor.description || 'Professional wedding services'}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm">
                      {vendor.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-primary text-primary" />
                          <span className="font-medium">{vendor.rating}</span>
                          <span className="text-muted-foreground">
                            ({vendor.reviews_count || 0} reviews)
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 pt-2 border-t">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>Los Angeles, CA</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>(555) 123-4567</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span>contact@{vendor.name.toLowerCase().replace(/\s+/g, '')}.com</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button className="flex-1" size="sm">View Profile</Button>
                      <Button variant="outline" size="sm">Contact</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {myVendors.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-muted-foreground">No saved vendors yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Browse all vendors and click the heart icon to save them here
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
