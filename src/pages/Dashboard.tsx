import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase, type Wedding, type Task, type Guest, type BudgetCategory } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { CheckSquare, Wallet, Users, Briefcase } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [stats, setStats] = useState({
    tasksCompleted: 0,
    totalTasks: 0,
    budgetUsed: 0,
    guestsConfirmed: 0,
    totalGuests: 0,
    vendorsBooked: 0,
  });

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      // Load wedding
      const { data: weddingData } = await supabase
        .from('weddings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (weddingData) {
        setWedding(weddingData);

        // Load tasks
        const { data: tasksData } = await supabase
          .from('tasks')
          .select('*')
          .eq('wedding_id', weddingData.id);

        // Load guests
        const { data: guestsData } = await supabase
          .from('guests')
          .select('*')
          .eq('wedding_id', weddingData.id);

        // Load budget categories
        const { data: budgetData } = await supabase
          .from('budget_categories')
          .select('*')
          .eq('wedding_id', weddingData.id);

        const completedTasks = tasksData?.filter((t) => t.completed).length || 0;
        const confirmedGuests = guestsData?.filter((g) => g.rsvp_status === 'confirmed').length || 0;
        const totalSpent = budgetData?.reduce((sum, cat) => sum + Number(cat.spent || 0), 0) || 0;

        setStats({
          tasksCompleted: completedTasks,
          totalTasks: tasksData?.length || 0,
          budgetUsed: totalSpent,
          guestsConfirmed: confirmedGuests,
          totalGuests: guestsData?.length || 0,
          vendorsBooked: budgetData?.filter((c) => Number(c.spent) > 0).length || 0,
        });
      }
    };

    loadData();
  }, [user]);

  const progressPercent = stats.totalTasks > 0 
    ? Math.round((stats.tasksCompleted / stats.totalTasks) * 100) 
    : 0;

  const guestPercent = stats.totalGuests > 0
    ? Math.round((stats.guestsConfirmed / stats.totalGuests) * 100)
    : 0;

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-serif font-bold">
            {wedding ? `Welcome Back!` : 'Couple Dashboard'}
          </h1>
          <p className="text-muted-foreground">Track your wedding planning progress</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tasks Completed
              </CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.tasksCompleted}/{stats.totalTasks}
              </div>
              <p className="text-xs text-success">
                {progressPercent}% done
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Budget Used
              </CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stats.budgetUsed.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                of ${wedding?.total_budget?.toLocaleString() || '0'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Guests RSVP'd
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.guestsConfirmed}/{stats.totalGuests}
              </div>
              <p className="text-xs text-success">
                {guestPercent}% Confirmed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Vendors Booked
              </CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.vendorsBooked}/8</div>
              <p className="text-xs text-muted-foreground">3 to Go</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Overall Planning Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={progressPercent} className="h-2" />
            <p className="text-sm text-muted-foreground text-center">
              {progressPercent}% Complete
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Link to="/checklist">
            <Card className="cursor-pointer transition-all hover:shadow-lg">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <CheckSquare className="h-12 w-12 text-primary mb-2" />
                <p className="font-medium">Checklist</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/guests">
            <Card className="cursor-pointer transition-all hover:shadow-lg">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <Users className="h-12 w-12 text-primary mb-2" />
                <p className="font-medium">Guest List</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/budget">
            <Card className="cursor-pointer transition-all hover:shadow-lg">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <Wallet className="h-12 w-12 text-primary mb-2" />
                <p className="font-medium">Budget</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/calendar">
            <Card className="cursor-pointer transition-all hover:shadow-lg">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <Briefcase className="h-12 w-12 text-primary mb-2" />
                <p className="font-medium">Vendors</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
