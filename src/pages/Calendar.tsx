import { Layout } from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar as CalendarIcon } from 'lucide-react';

export default function Calendar() {
  return (
    <Layout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-serif font-bold">Calendar & Appointments</h1>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-24">
            <CalendarIcon className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              Calendar View Coming Soon
            </h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Track your appointments, vendor meetings, and important wedding dates all in one place.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
