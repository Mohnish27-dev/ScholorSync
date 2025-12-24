'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import {
  CalendarDays,
  Download,
  Link2,
  Bell,
  Clock,
  AlertTriangle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Copy,
  ExternalLink,
  Info,
} from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  type: 'deadline' | 'application' | 'reminder' | 'interview' | 'result';
  scholarshipId?: string;
  scholarshipName?: string;
  amount?: { min: number; max: number };
  provider?: string;
  url?: string;
  color?: string;
  description?: string;
}

interface CalendarSyncProps {
  userId: string;
}

const eventTypeIcons = {
  deadline: AlertTriangle,
  application: CheckCircle,
  reminder: Bell,
  interview: CalendarDays,
  result: CheckCircle,
};

const eventTypeLabels = {
  deadline: 'Deadline',
  application: 'Application',
  reminder: 'Reminder',
  interview: 'Interview',
  result: 'Result',
};

export function CalendarSync({ userId }: CalendarSyncProps) {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [groupedEvents, setGroupedEvents] = useState<Record<string, CalendarEvent[]>>({});
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showSyncDialog, setShowSyncDialog] = useState(false);
  const [subscriptionUrl, setSubscriptionUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [reminderSettings, setReminderSettings] = useState({
    sevenDayReminder: true,
    oneDayReminder: true,
    emailNotifications: false,
  });

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const month = currentMonth.getMonth() + 1;
      const year = currentMonth.getFullYear();
      
      const response = await fetch(
        `/api/calendar?userId=${userId}&month=${month}&year=${year}`
      );
      const data = await response.json();

      if (data.success) {
        setEvents(data.events);
        setGroupedEvents(data.groupedEvents);
      }
    } catch (error) {
      console.error('Error fetching calendar events:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, currentMonth]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleExport = async () => {
    try {
      const response = await fetch(`/api/calendar?userId=${userId}&format=ics`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'scholarships.ics';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting calendar:', error);
    }
  };

  const handleSubscribe = async () => {
    try {
      const response = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'subscribe' }),
      });
      const data = await response.json();
      
      if (data.success) {
        setSubscriptionUrl(data.subscriptionUrl);
        setShowSyncDialog(true);
      }
    } catch (error) {
      console.error('Error getting subscription URL:', error);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(subscriptionUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    const dateKey = date.toISOString().split('T')[0];
    return groupedEvents[dateKey] || [];
  };

  const hasEventsOnDate = (date: Date): boolean => {
    const dateKey = date.toISOString().split('T')[0];
    return !!groupedEvents[dateKey]?.length;
  };

  const getUpcomingDeadlines = () => {
    const now = new Date();
    return events
      .filter((e) => e.type === 'deadline' && new Date(e.start) >= now)
      .slice(0, 5);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary" />
                Scholarship Calendar
              </CardTitle>
              <CardDescription>
                Track deadlines and sync with your calendar
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={handleSubscribe} className="gap-2">
                <Link2 className="h-4 w-4" />
                Sync
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="calendar" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="calendar" className="space-y-4">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Calendar View */}
                <div>
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">
                        {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                      </h3>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            const newMonth = new Date(currentMonth);
                            newMonth.setMonth(newMonth.getMonth() - 1);
                            setCurrentMonth(newMonth);
                          }}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            const newMonth = new Date(currentMonth);
                            newMonth.setMonth(newMonth.getMonth() + 1);
                            setCurrentMonth(newMonth);
                          }}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      month={currentMonth}
                      onMonthChange={setCurrentMonth}
                      modifiers={{
                        hasEvents: (date) => hasEventsOnDate(date),
                      }}
                      modifiersStyles={{
                        hasEvents: {
                          fontWeight: 'bold',
                          textDecoration: 'underline',
                          color: 'var(--primary)',
                        },
                      }}
                      className="rounded-md"
                    />
                  </div>
                </div>

                {/* Selected Date Events */}
                <div className="space-y-4">
                  <h3 className="font-semibold">
                    Events for {selectedDate?.toLocaleDateString('en-IN', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </h3>
                  {selectedDate && getEventsForDate(selectedDate).length > 0 ? (
                    <div className="space-y-3">
                      {getEventsForDate(selectedDate).map((event) => {
                        const Icon = eventTypeIcons[event.type];
                        return (
                          <motion.div
                            key={event.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="rounded-lg border p-4"
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className="rounded-lg p-2"
                                style={{ backgroundColor: event.color + '20' }}
                              >
                                <Icon className="h-4 w-4" style={{ color: event.color }} />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium">{event.title}</h4>
                                  <Badge variant="outline" className="text-xs">
                                    {eventTypeLabels[event.type]}
                                  </Badge>
                                </div>
                                {event.description && (
                                  <p className="mt-1 text-sm text-slate-500">{event.description}</p>
                                )}
                                {event.amount && (
                                  <p className="mt-1 text-sm font-medium text-green-600">
                                    ₹{event.amount.min.toLocaleString()} - ₹{event.amount.max.toLocaleString()}
                                  </p>
                                )}
                                {event.url && (
                                  <a
                                    href={event.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-2 inline-flex items-center gap-1 text-sm text-primary hover:underline"
                                  >
                                    Apply Now <ExternalLink className="h-3 w-3" />
                                  </a>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed p-8 text-center">
                      <CalendarDays className="mx-auto h-12 w-12 text-slate-300" />
                      <p className="mt-2 text-sm text-slate-500">No events on this date</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="upcoming" className="space-y-4">
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-500" />
                  Upcoming Deadlines
                </h3>
                {getUpcomingDeadlines().length > 0 ? (
                  <div className="space-y-3">
                    {getUpcomingDeadlines().map((event, index) => {
                      const daysLeft = Math.ceil(
                        (new Date(event.start).getTime() - new Date().getTime()) /
                        (1000 * 60 * 60 * 24)
                      );
                      const isUrgent = daysLeft <= 7;

                      return (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`rounded-lg border p-4 ${
                            isUrgent
                              ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30'
                              : ''
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{event.scholarshipName}</h4>
                              <p className="text-sm text-slate-500">{event.provider}</p>
                              {event.amount && (
                                <p className="text-sm font-medium text-green-600">
                                  ₹{event.amount.min.toLocaleString()} - ₹{event.amount.max.toLocaleString()}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <Badge
                                variant={isUrgent ? 'destructive' : 'secondary'}
                                className="text-xs"
                              >
                                {daysLeft === 0
                                  ? 'Today!'
                                  : daysLeft === 1
                                  ? 'Tomorrow'
                                  : `${daysLeft} days left`}
                              </Badge>
                              <p className="mt-1 text-xs text-slate-500">
                                {new Date(event.start).toLocaleDateString('en-IN')}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed p-8 text-center">
                    <CheckCircle className="mx-auto h-12 w-12 text-green-300" />
                    <p className="mt-2 text-sm text-slate-500">
                      No upcoming deadlines. You&apos;re all caught up!
                    </p>
                  </div>
                )}
              </div>

              {/* Event Legend */}
              <div className="rounded-lg border p-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Event Types
                </h4>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                  {Object.entries(eventTypeLabels).map(([type, label]) => {
                    const Icon = eventTypeIcons[type as keyof typeof eventTypeIcons];
                    return (
                      <div key={type} className="flex items-center gap-2 text-sm">
                        <Icon className="h-4 w-4" />
                        <span>{label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-4">Reminder Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>7-Day Reminder</Label>
                        <p className="text-sm text-slate-500">
                          Get reminded 7 days before deadlines
                        </p>
                      </div>
                      <Switch
                        checked={reminderSettings.sevenDayReminder}
                        onCheckedChange={(checked) =>
                          setReminderSettings((prev) => ({
                            ...prev,
                            sevenDayReminder: checked,
                          }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>1-Day Reminder</Label>
                        <p className="text-sm text-slate-500">
                          Get reminded 1 day before deadlines
                        </p>
                      </div>
                      <Switch
                        checked={reminderSettings.oneDayReminder}
                        onCheckedChange={(checked) =>
                          setReminderSettings((prev) => ({
                            ...prev,
                            oneDayReminder: checked,
                          }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-slate-500">
                          Receive email reminders for deadlines
                        </p>
                      </div>
                      <Switch
                        checked={reminderSettings.emailNotifications}
                        onCheckedChange={(checked) =>
                          setReminderSettings((prev) => ({
                            ...prev,
                            emailNotifications: checked,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Calendar Integration</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Button
                      variant="outline"
                      className="h-auto flex-col gap-2 py-4"
                      onClick={handleExport}
                    >
                      <Download className="h-5 w-5" />
                      <span>Download .ics File</span>
                      <span className="text-xs text-slate-500">Import into any calendar</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto flex-col gap-2 py-4"
                      onClick={handleSubscribe}
                    >
                      <Link2 className="h-5 w-5" />
                      <span>Subscribe to Calendar</span>
                      <span className="text-xs text-slate-500">Auto-sync updates</span>
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Sync Dialog */}
      <Dialog open={showSyncDialog} onOpenChange={setShowSyncDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Subscribe to Calendar</DialogTitle>
            <DialogDescription>
              Use this URL to subscribe to your scholarship calendar in your preferred app.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Input
                value={subscriptionUrl}
                readOnly
                className="flex-1 text-sm"
              />
              <Button size="icon" variant="outline" onClick={copyToClipboard}>
                <AnimatePresence mode="wait">
                  {copied ? (
                    <motion.div
                      key="check"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="copy"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Copy className="h-4 w-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">How to subscribe:</h4>
              <div className="space-y-2 text-sm">
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                  <p className="font-medium">Google Calendar</p>
                  <p className="text-slate-500">
                    Settings → Add calendar → From URL → Paste link
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                  <p className="font-medium">Apple Calendar</p>
                  <p className="text-slate-500">
                    File → New Calendar Subscription → Paste link
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                  <p className="font-medium">Outlook</p>
                  <p className="text-slate-500">
                    Add calendar → Subscribe from web → Paste link
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSyncDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
