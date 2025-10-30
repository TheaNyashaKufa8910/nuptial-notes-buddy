import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase, type Wedding, type Guest } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Search, Filter, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Guests() {
  const { user } = useAuth();
  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      const { data: weddingData } = await supabase
        .from('weddings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (weddingData) {
        setWedding(weddingData);

        const { data: guestsData } = await supabase
          .from('guests')
          .select('*')
          .eq('wedding_id', weddingData.id)
          .order('name', { ascending: true });

        if (guestsData) {
          setGuests(guestsData as Guest[]);
        }
      }
    };

    loadData();
  }, [user]);

  const filteredGuests = guests.filter((guest) =>
    guest.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const confirmedCount = guests.filter((g) => g.rsvp_status === 'confirmed').length;
  const invitedCount = guests.filter((g) => g.rsvp_status === 'invited').length;
  const declinedCount = guests.filter((g) => g.rsvp_status === 'declined').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-primary text-primary-foreground';
      case 'declined':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-serif font-bold">Guest List & RSVP</h1>

        <Card>
          <CardHeader>
            <CardTitle>RSVP Status Overview</CardTitle>
            <p className="text-sm text-muted-foreground">
              A breakdown of guest responses.
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{confirmedCount}</div>
                <div className="text-sm text-muted-foreground">Confirmed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{invitedCount}</div>
                <div className="text-sm text-muted-foreground">Invited</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-destructive">{declinedCount}</div>
                <div className="text-sm text-muted-foreground">Declined</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Guest
          </Button>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter Guests
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search guests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="space-y-3">
          {filteredGuests.map((guest) => (
            <Card key={guest.id} className="transition-all hover:shadow-md">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3 flex-1">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(guest.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-medium">{guest.name}</h3>
                    <p className="text-sm text-muted-foreground">{guest.category || 'Guest'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={cn(getStatusColor(guest.rsvp_status), 'capitalize')}>
                    {guest.rsvp_status}
                  </Badge>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredGuests.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? 'No guests found' : 'No guests yet'}
                </p>
                {!searchQuery && (
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Your First Guest
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
