import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { supabase, type Wedding, type Task, type Milestone } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Calendar, User, Edit } from 'lucide-react';
import { format } from 'date-fns';

export default function Checklist() {
  const { user } = useAuth();
  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);

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

        const { data: tasksData } = await supabase
          .from('tasks')
          .select('*')
          .eq('wedding_id', weddingData.id)
          .order('due_date', { ascending: true });

        const { data: milestonesData } = await supabase
          .from('milestones')
          .select('*')
          .eq('wedding_id', weddingData.id)
          .order('created_at', { ascending: true });

        if (tasksData) setTasks(tasksData);
        if (milestonesData) setMilestones(milestonesData);
      }
    };

    loadData();
  }, [user]);

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    await supabase
      .from('tasks')
      .update({ completed: !completed })
      .eq('id', taskId);

    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, completed: !completed } : task
      )
    );
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-serif font-bold">Smart Checklist & Timeline</h1>

        {milestones.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-serif font-semibold">Your Planning Milestones</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {milestones.map((milestone) => (
                <Card key={milestone.id}>
                  <CardHeader>
                    <CardTitle className="text-base text-primary">
                      {milestone.timeframe}
                    </CardTitle>
                    <p className="text-sm font-medium">{milestone.title}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      {milestone.description}
                    </p>
                    <div className="space-y-1">
                      <Progress value={milestone.progress} className="h-2" />
                      <p className="text-xs text-right text-muted-foreground">
                        {milestone.progress}%
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif font-semibold">Your Wedding Tasks</h2>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add New Task
            </Button>
          </div>

          <div className="space-y-3">
            {tasks.map((task) => (
              <Card key={task.id} className="transition-all hover:shadow-md">
                <CardContent className="flex items-start gap-4 p-4">
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => handleToggleTask(task.id, task.completed)}
                    className="mt-1"
                  />
                  <div className="flex-1 space-y-1">
                    <h3
                      className={`font-medium ${
                        task.completed ? 'line-through text-muted-foreground' : ''
                      }`}
                    >
                      {task.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      {task.due_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(task.due_date), 'MMM dd, yyyy')}
                        </div>
                      )}
                      {task.assigned_to && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {task.assigned_to}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}

            {tasks.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-muted-foreground mb-4">No tasks yet</p>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Your First Task
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
