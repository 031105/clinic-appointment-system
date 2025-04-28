'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';
import { CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DatePicker } from '@/components/ui/DatePicker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { Label } from '@/components/ui/Label';
import { Input } from '@/components/ui/Input';
import { toast } from '@/components/ui/use-toast';
import { Plus, Trash2 } from 'lucide-react';

interface TimeSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface UnavailableDate {
  id: string;
  date: Date;
  reason: string;
}

const daysOfWeek = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

// Temporary data - replace with actual API call
const initialTimeSlots: TimeSlot[] = daysOfWeek.map((day) => ({
  id: crypto.randomUUID(),
  day,
  startTime: '09:00',
  endTime: '17:00',
  isAvailable: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(day),
}));

// Initial unavailable dates
const initialUnavailableDates: UnavailableDate[] = [
  {
    id: crypto.randomUUID(),
    date: new Date(2023, 7, 15), // August 15, 2023
    reason: 'Public Holiday - Independence Day'
  },
  {
    id: crypto.randomUUID(),
    date: new Date(2023, 7, 22), // August 22, 2023
    reason: 'Conference Attendance'
  },
  {
    id: crypto.randomUUID(),
    date: new Date(2023, 8, 1), // September 1, 2023
    reason: 'Personal Leave'
  }
];

export default function DoctorAvailability() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [blockReason, setBlockReason] = useState('');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(initialTimeSlots);
  const [unavailableDates, setUnavailableDates] = useState<UnavailableDate[]>(initialUnavailableDates);
  const [appointmentDuration, setAppointmentDuration] = useState<string>('30');
  const [lunchStart, setLunchStart] = useState<string>('12:00');
  const [lunchEnd, setLunchEnd] = useState<string>('13:00');

  const handleAvailabilityToggle = (id: string) => {
    setTimeSlots((prev) =>
      prev.map((slot) =>
        slot.id === id ? { ...slot, isAvailable: !slot.isAvailable } : slot
      )
    );
  };

  const handleTimeChange = (
    id: string,
    field: 'startTime' | 'endTime',
    value: string
  ) => {
    setTimeSlots((prev) =>
      prev.map((slot) => (slot.id === id ? { ...slot, [field]: value } : slot))
    );
  };

  const handleAddTimeSlot = () => {
    // Implement custom time slot addition if needed
  };

  const handleSaveChanges = () => {
    // TODO: Implement API call to save changes
    toast({
      title: 'Success',
      description: 'Your availability has been updated.',
    });
  };

  const handleBlockDate = () => {
    if (!date) return;
    
    // Check if date is already blocked
    const isAlreadyBlocked = unavailableDates.some(
      (blockedDate) => blockedDate.date.toDateString() === date.toDateString()
    );

    if (isAlreadyBlocked) {
      toast({
        title: 'Date Already Blocked',
        description: 'This date is already marked as unavailable.',
        variant: 'destructive'
      });
      return;
    }

    // Add new blocked date
    setUnavailableDates([
      ...unavailableDates,
      {
        id: crypto.randomUUID(),
        date,
        reason: blockReason || 'Unavailable'
      }
    ]);

    // Reset form
    setBlockReason('');
    
    toast({
      title: 'Date Blocked',
      description: `${date.toLocaleDateString()} has been blocked in your calendar.`,
    });
  };

  const handleRemoveBlockedDate = (id: string) => {
    setUnavailableDates(unavailableDates.filter(date => date.id !== id));
  };

  const handleRemoveTimeSlot = (id: string) => {
    // Consider implications before implementing removal of standard days
  };

  return (
    <div className="container mx-auto py-8 px-4 lg:px-6 space-y-8 max-w-7xl">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manage Availability</h1>
        <Button onClick={handleSaveChanges}>Save Changes</Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-sm">
          <CardHeader title="Regular Schedule" className="border-b" />
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Add time slot button */}
              <div className="flex justify-end mb-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-1"
                  onClick={handleAddTimeSlot}
                >
                  <Plus className="h-4 w-4" />
                  Add Time Slot
                </Button>
              </div>
              
              {/* Header */}
              <div className="grid grid-cols-4 gap-4 font-medium text-sm text-gray-500 pb-2 border-b border-gray-100">
                <div>DAY</div>
                <div className="col-span-2">HOURS</div>
                <div className="text-center">AVAILABLE</div>
              </div>
              
              {/* Time slots */}
              <div className="space-y-4">
                {timeSlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="grid grid-cols-4 gap-4 items-center p-4 bg-white rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
                  >
                    <div className="font-medium">{slot.day}</div>
                    <div className="col-span-2 flex gap-2">
                      <Input
                        type="time"
                        value={slot.startTime}
                        onChange={(e) =>
                          handleTimeChange(slot.id, 'startTime', e.target.value)
                        }
                        disabled={!slot.isAvailable}
                        className="flex-1"
                      />
                      <span className="flex items-center text-gray-400">to</span>
                      <Input
                        type="time"
                        value={slot.endTime}
                        onChange={(e) =>
                          handleTimeChange(slot.id, 'endTime', e.target.value)
                        }
                        disabled={!slot.isAvailable}
                        className="flex-1"
                      />
                    </div>
                    <div className="flex justify-center">
                      <div className="flex items-center">
                        <Checkbox
                          id={`available-${slot.id}`}
                          checked={slot.isAvailable}
                          onCheckedChange={() => handleAvailabilityToggle(slot.id)}
                        />
                        <Label
                          htmlFor={`available-${slot.id}`}
                          className="ml-2 cursor-pointer"
                        >
                          Available
                        </Label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader title="Unavailable Dates" className="border-b" />
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="bg-blue-50 text-blue-800 p-4 rounded-md text-sm">
                Add dates when you are unavailable for appointments. These can be 
                holidays, personal leave, or any other days you won't be working.
              </div>
              
              {/* Block date form */}
              <div className="grid grid-cols-1 gap-4 p-5 border border-gray-100 rounded-lg bg-gray-50">
                <div className="space-y-2">
                  <Label htmlFor="block-date" className="font-medium">Select Date</Label>
                  <DatePicker 
                    date={date} 
                    setDate={setDate}
                    placeholder="Select a date to block"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="block-reason" className="font-medium">Reason (optional)</Label>
                  <Input
                    id="block-reason"
                    placeholder="e.g., Holiday, Conference, etc."
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                  />
                </div>
                
                <Button onClick={handleBlockDate} className="mt-2 w-full">
                  Block Selected Date
                </Button>
              </div>
              
              {/* Blocked dates list */}
              <div className="space-y-3">
                <h3 className="font-medium text-sm text-gray-500 uppercase tracking-wider">BLOCKED DATES</h3>
                {unavailableDates.length === 0 ? (
                  <p className="text-gray-500 text-sm p-4 bg-gray-50 rounded-md text-center">No dates blocked yet.</p>
                ) : (
                  <div className="space-y-3">
                    {unavailableDates.map((blockedDate) => (
                      <div 
                        key={blockedDate.id}
                        className="flex justify-between items-center p-4 bg-white rounded-lg border border-gray-100"
                      >
                        <div>
                          <div className="font-medium">
                            {blockedDate.date.toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                          <div className="text-sm text-gray-500">{blockedDate.reason}</div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleRemoveBlockedDate(blockedDate.id)}
                          aria-label="Remove blocked date"
                        >
                          <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="shadow-sm">
        <CardHeader title="Appointment Settings" className="border-b" />
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="appointment-duration" className="font-medium">Appointment Duration</Label>
                <Select value={appointmentDuration} onValueChange={setAppointmentDuration}>
                  <SelectTrigger id="appointment-duration">
                    <SelectValue placeholder="Select appointment duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="font-medium">Lunch Break</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={lunchStart}
                    onChange={(e) => setLunchStart(e.target.value)}
                  />
                  <span className="flex items-center text-gray-400">to</span>
                  <Input
                    type="time"
                    value={lunchEnd}
                    onChange={(e) => setLunchEnd(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 