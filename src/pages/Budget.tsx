import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase, type Wedding, type BudgetCategory } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Download, Plus, ChevronRight, Home, Utensils, Flower2, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';

const iconMap: { [key: string]: any } = {
  venue: Home,
  catering: Utensils,
  flowers: Flower2,
  photography: Camera,
};

export default function Budget() {
  const { user } = useAuth();
  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [totalBudgeted, setTotalBudgeted] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);

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

        const { data: categoriesData } = await supabase
          .from('budget_categories')
          .select('*')
          .eq('wedding_id', weddingData.id)
          .order('created_at', { ascending: true });

        if (categoriesData) {
          setCategories(categoriesData);
          const budgeted = categoriesData.reduce((sum, cat) => sum + Number(cat.budgeted || 0), 0);
          const spent = categoriesData.reduce((sum, cat) => sum + Number(cat.spent || 0), 0);
          setTotalBudgeted(budgeted);
          setTotalSpent(spent);
        }
      }
    };

    loadData();
  }, [user]);

  return (
    <Layout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-serif font-bold">Budget Tracker</h1>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export to PDF / CSV
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Budgeted
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                ${totalBudgeted.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Spent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                ${totalSpent.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif font-semibold">Spending Categories</h2>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          </div>

          {categories.map((category) => {
            const Icon = iconMap[category.icon || ''] || Home;
            const spent = Number(category.spent || 0);
            const budgeted = Number(category.budgeted || 0);
            const remaining = budgeted - spent;
            const percentUsed = budgeted > 0 ? (spent / budgeted) * 100 : 0;
            const isOverBudget = spent > budgeted;

            return (
              <Card
                key={category.id}
                className={cn(
                  'transition-all hover:shadow-md',
                  isOverBudget && 'border-destructive'
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{category.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Budgeted: ${budgeted.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className={cn(
                        'text-lg font-semibold',
                        isOverBudget && 'text-destructive'
                      )}>
                        Spent: ${spent.toLocaleString()}
                      </span>
                    </div>
                    <Progress 
                      value={Math.min(percentUsed, 100)} 
                      className={cn(
                        'h-2',
                        isOverBudget && '[&>div]:bg-destructive'
                      )}
                    />
                    <p className={cn(
                      'text-sm text-right',
                      isOverBudget ? 'text-destructive' : 'text-muted-foreground'
                    )}>
                      {isOverBudget
                        ? `Over budget by $${Math.abs(remaining).toLocaleString()}`
                        : `$${remaining.toLocaleString()} remaining`}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {categories.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground mb-4">No budget categories yet</p>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Your First Category
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
