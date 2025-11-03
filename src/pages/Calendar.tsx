import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { BackButton } from '@/components/BackButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Trash2, Edit, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

type Appointment = {
  id: string;
  wedding_id: string;
  title: string;
  description: string | null;
  appointment_date: string;
  appointment_time: string | null;
  location: string | null;
  created_at: string;
};

export default function Calendar() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [weddingId, setWeddingId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '',
    location: '',
  });

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
      loadAppointments(weddingData.id);
    }
  };

  const loadAppointments = async (wedding_id: string) => {
    const { data } = await supabase
      .from('appointments')
      .select('*')
      .eq('wedding_id', wedding_id)
      .order('appointment_date', { ascending: true });

    if (data) {
      setAppointments(data);
    }
  };

  const handleSave = async () => {
    if (!weddingId || !formData.title) return;

    try {
      const appointmentData = {
        wedding_id: weddingId,
        title: formData.title,
        description: formData.description || null,
        appointment_date: formData.date,
        appointment_time: formData.time || null,
        location: formData.location || null,
      };

      if (editingId) {
        const { error } = await supabase
          .from('appointments')
          .update(appointmentData)
          .eq('id', editingId);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Appointment updated successfully',
        });
      } else {
        const { error } = await supabase
          .from('appointments')
          .insert(appointmentData);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Appointment added successfully',
        });
      }

      setIsDialogOpen(false);
      resetForm();
      if (weddingId) loadAppointments(weddingId);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingId(appointment.id);
    setFormData({
      title: appointment.title,
      description: appointment.description || '',
      date: appointment.appointment_date,
      time: appointment.appointment_time || '',
      location: appointment.location || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);

    if (!error) {
      toast({
        title: 'Success',
        description: 'Appointment deleted',
      });
      if (weddingId) loadAppointments(weddingId);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      time: '',
      location: '',
    });
    setEditingId(null);
  };

  const getAppointmentsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return appointments.filter(apt => apt.appointment_date === dateStr);
  };

  const todayAppointments = selectedDate ? getAppointmentsForDate(selectedDate) : [];

  return (
    <Layout>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <BackButton />
            <h1 className="text-3xl font-serif font-bold mt-2">Calendar & Appointments</h1>
            <p className="text-muted-foreground">Manage your wedding schedule</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Appointment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit' : 'Add'} Appointment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Venue site visit"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g., The Grand Ballroom"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Add any notes..."
                    rows={3}
                  />
                </div>
                <Button
                  onClick={handleSave}
                  disabled={!formData.title}
                  className="w-full"
                >
                  {editingId ? 'Update' : 'Add'} Appointment
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                {selectedDate
                  ? `Appointments for ${format(selectedDate, 'MMMM dd, yyyy')}`
                  : 'Select a date'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todayAppointments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <CalendarIcon className="h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">No appointments for this date</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayAppointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="p-4 border rounded-lg space-y-2 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <h3 className="font-medium">{apt.title}</h3>
                          {apt.appointment_time && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {apt.appointment_time}
                            </div>
                          )}
                          {apt.location && (
                            <p className="text-sm text-muted-foreground">{apt.location}</p>
                          )}
                          {apt.description && (
                            <p className="text-sm text-muted-foreground">{apt.description}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(apt)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(apt.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Upcoming Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            {appointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <CalendarIcon className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No appointments scheduled</p>
                <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Schedule Your First Appointment
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {appointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="p-4 border rounded-lg space-y-2 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <h3 className="font-medium">{apt.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="h-3 w-3" />
                            {format(new Date(apt.appointment_date), 'MMM dd, yyyy')}
                          </div>
                          {apt.appointment_time && (
                            <div className="flex items-center gap-2">
                              <Clock className="h-3 w-3" />
                              {apt.appointment_time}
                            </div>
                          )}
                        </div>
                        {apt.location && (
                          <p className="text-sm text-muted-foreground">{apt.location}</p>
                        )}
                        {apt.description && (
                          <p className="text-sm text-muted-foreground">{apt.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(apt)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(apt.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
