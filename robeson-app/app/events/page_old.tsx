'use client';

import { useState, useEffect, useRef } from 'react';
import Navigation from '@/components/Navigation';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { supabase } from '@/lib/supabase';
import type { EventRecord } from '@/lib/supabase';

interface Event {
  id: string;
  title: string;
  date: string;
  endDate?: string;
  time: string;
  startTime?: string;
  endTime?: string;
  location: string;
  description: string;
  category: string;
  organizer: string;
  link?: string;
  contactEmail?: string;
  contactPhone?: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  date?: string;
  start?: string;
  end?: string;
  allDay?: boolean;
  extendedProps: {
    time: string;
    location: string;
    description: string;
    category: string;
    organizer: string;
    link?: string;
  };
}

export default function EventsPage() {
  const calendarRef = useRef<FullCalendar>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [validationError, setValidationError] = useState('');
  
  // Check if mobile and set appropriate default view
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const [currentView, setCurrentView] = useState(isMobile ? 'timeGridDay' : 'timeGridWeek');
  const [isAgendaView, setIsAgendaView] = useState(true); // Default to agenda view
  const [refreshKey, setRefreshKey] = useState(0); // Force re-render key
  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    title: '',
    date: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    time: '',
    startTime: '9:00 AM',
    endTime: '10:00 AM',
    location: '',
    description: '',
    category: 'Community Service',
    organizer: '',
    link: ''
  });

  const categories = ['Community Service', 'Health', 'Career', 'Education', 'Recreation'];

  // Generate time options for dropdowns
  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        const ampm = hour < 12 ? 'AM' : 'PM';
        const minuteStr = minute.toString().padStart(2, '0');
        times.push(`${hour12}:${minuteStr} ${ampm}`);
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  // Check if admin on component mount and load events
  useEffect(() => {
    const adminStatus = sessionStorage.getItem('calendarAdmin');
    if (adminStatus === 'true') {
      setIsAdmin(true);
    }
    
    
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      console.log('Loading events from Supabase...');
      
      // Load events from Supabase
      const { data: supabaseEvents, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });
      
      if (error) {
        console.error('Error loading events from Supabase:', error);
        throw error;
      }
      
      if (supabaseEvents) {
        console.log('Loaded', supabaseEvents.length, 'events from Supabase');
        
        // Convert Supabase events to our Event format
        const events: Event[] = supabaseEvents.map((record: EventRecord) => ({
          id: record.id,
          title: record.title,
          date: record.date,
          endDate: record.end_date || record.date,
          time: `${record.start_time} - ${record.end_time}`,
          startTime: record.start_time,
          endTime: record.end_time,
          location: record.location,
          description: record.description,
          category: record.category,
          organizer: record.organizer,
          link: record.link || '',
          contactEmail: record.contact_email || '',
          contactPhone: record.contact_phone || ''
        }));
        
        setEvents(events);
        
        // Convert to FullCalendar format
        const fcEvents: CalendarEvent[] = events.map(event => convertToCalendarEvent(event));
        setCalendarEvents(fcEvents);
        return;
      }
      
      // Fallback to Google Sheets if Supabase fails
      console.log('Fallback: Loading from Google Sheets...');
      const sheetId = process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID;
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
      
      if (sheetId && apiKey) {
        console.log('Loading events from Google Sheets...');
        // Read specifically from Events sheet (A:O to ensure we get all columns even if shifted)
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Events!A:O?key=${apiKey}`;
        
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          const rows = data.values || [];
          
          if (rows.length > 1) {
            // Debug header row
            console.log('Header row:', rows[0]);
            
            // Skip header row and convert to Event objects
            const googleEvents: Event[] = rows.slice(1).map((row: string[], index: number) => {
              // Debug first few rows to see structure
              if (index < 3) {
                console.log(`Row ${index}:`, row);
                console.log(`Row ${index} mapping - ID: ${row[0]}, Title: ${row[1]}, Date: ${row[2]}`);
              }
              
              // Debug: Log the actual row data to understand the structure
              if (index < 3) {
                console.log(`Row ${index} full data:`, row);
              }
              
              // Check if End Date column is missing (data shifted by 1)
              // If what should be End Date looks like a time (contains AM/PM), data is shifted
              const endDateColumnHasTime = row[3] && (row[3].includes('AM') || row[3].includes('PM'));
              
              let eventData;
              if (endDateColumnHasTime) {
                // Data is shifted - End Date column is missing
                console.log('Detected shifted data format - missing End Date column');
                eventData = {
                  id: row[0] || `${row[1]}_${row[2]}_${index}`.replace(/\s+/g, '_'),
                  title: row[1] || '',
                  date: row[2] || '',
                  endDate: row[2] || '', // Use same as start date
                  time: (row[3] && row[4]) ? `${row[3]} - ${row[4]}` : '',
                  startTime: row[3] || '9:00 AM',
                  endTime: row[4] || '10:00 AM',
                  location: row[5] || '',
                  description: row[6] || '',
                  category: row[7] || 'Community Service',
                  organizer: row[8] || '',
                  link: row[12] || '' // Link would be in column 12 with shifted data
                };
              } else {
                // Standard format with all columns
                eventData = {
                  id: row[0] || `${row[1]}_${row[2]}_${index}`.replace(/\s+/g, '_'),
                  title: row[1] || '',
                  date: row[2] || '',
                  endDate: row[3] || row[2] || '',
                  time: (row[4] && row[5]) ? `${row[4]} - ${row[5]}` : '',
                  startTime: row[4] || '9:00 AM',
                  endTime: row[5] || '10:00 AM',
                  location: row[6] || '',
                  description: row[7] || '',
                  category: row[8] || 'Community Service',
                  organizer: row[9] || '',
                  link: row[13] || ''
                };
              }
              
              return eventData;
            });
            
            console.log('Loaded', googleEvents.length, 'events from Google Sheets');
            console.log('Event IDs:', googleEvents.map(e => ({ id: e.id, title: e.title, date: e.date })));
            
            // Filter out events with invalid dates and recently deleted events
            const deletedEvents = JSON.parse(localStorage.getItem('deletedEvents') || '[]');
            
            // Clean up deletions older than 5 minutes
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
            const activeDeletedEvents = deletedEvents.filter((d: any) => {
              const deletedAt = new Date(d.deletedAt);
              return deletedAt > fiveMinutesAgo;
            });
            
            // Update localStorage with only recent deletions
            if (activeDeletedEvents.length !== deletedEvents.length) {
              localStorage.setItem('deletedEvents', JSON.stringify(activeDeletedEvents));
            }
            
            const deletedIds = activeDeletedEvents.map((d: any) => d.id);
            console.log('Currently deleted event IDs:', deletedIds);
            
            const filteredEvents = googleEvents.filter(event => {
              // Check if event has no ID - this is a problem
              if (!event.id) {
                console.warn('Event has no ID, will not persist across refreshes:', event.title);
                // Still include it but warn
              }
              
              // Check if deleted
              if (deletedIds.includes(event.id)) {
                console.log('Filtering out deleted event:', event.id, event.title);
                return false;
              }
              
              // Check if date is valid
              if (!event.date || event.date.trim() === '') {
                console.log('Filtering out event with empty date:', event.title);
                return false;
              }
              
              return true;
            });
            
            console.log('After filtering, events count:', filteredEvents.length);
            setEvents(filteredEvents);
            
            // Convert to FullCalendar format
            const fcEvents: CalendarEvent[] = filteredEvents.map(event => convertToCalendarEvent(event));
            setCalendarEvents(fcEvents);
            return;
          }
        }
      }
      
      // Fall back to events.json if Google Sheets fails or is not configured
      console.log('Falling back to events.json...');
      const basePath = window.location.pathname.includes('/robeson-app/') ? '/robeson-app' : '';
      const response = await fetch(`${basePath}/events.json`);
      const data = await response.json();
      setEvents(data.events || []);
      
      // Convert to FullCalendar format
      const fcEvents: CalendarEvent[] = (data.events || []).map((event: Event) => convertToCalendarEvent(event));
      setCalendarEvents(fcEvents);
    } catch (error) {
      console.error('Error loading events:', error);
      // Initialize with empty arrays if loading fails
      setEvents([]);
      setCalendarEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    // Hardcoded password for GitHub Pages
    const ADMIN_PASSWORD = 'SPARC';
    
    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      sessionStorage.setItem('calendarAdmin', 'true');
      setShowLoginModal(false);
      setPassword('');
      setLoginError('');
    } else {
      setLoginError('Incorrect password');
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    sessionStorage.removeItem('calendarAdmin');
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      // Delete from Supabase
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);
      
      if (error) {
        console.error('Error deleting event:', error);
        alert('Error deleting event');
        return;
      }
      
      // Remove from local state after successful deletion
      setEvents(prevEvents => prevEvents.filter(e => e.id !== eventId));
      setCalendarEvents(prevCalendarEvents => prevCalendarEvents.filter(e => e.id !== eventId));
      
      console.log('Event deleted successfully:', eventId);
      alert('Event deleted');
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Error deleting event');
    }
  };

  const handleEventClick = (info: any) => {
    const event = events.find(e => e.id === info.event.id);
    if (event) {
      setSelectedEvent(event);
      setShowEventModal(true);
    }
  };

  const handleSubmitEvent = async () => {
    // Since we're doing real-time validation, just do a final check
    if (validationError) {
      return;
    }
    
    // Final validation to ensure all required fields are filled
    if (!newEvent.title || !newEvent.date || !newEvent.startTime || !newEvent.endTime || 
        !newEvent.location || !newEvent.organizer || !newEvent.description) {
      setValidationError('Please fill in all required fields');
      return;
    }
    
    setValidationError('');
    
    // Generate a unique ID or use existing one for edits
    const id = isEditing && editingEventId ? editingEventId : Date.now().toString();
    
    // Format time string from start and end times
    const timeString = `${newEvent.startTime} - ${newEvent.endTime}`;
    
    const eventToAdd: Event = {
      id,
      title: newEvent.title || '',
      date: newEvent.date || new Date().toISOString().split('T')[0],
      endDate: newEvent.endDate || newEvent.date || new Date().toISOString().split('T')[0],
      time: timeString,
      location: newEvent.location || '',
      description: newEvent.description || '',
      category: newEvent.category || 'Other',
      organizer: newEvent.organizer || '',
      startTime: newEvent.startTime,
      endTime: newEvent.endTime,
      link: newEvent.link || ''
    };
    
    console.log('Event to add:', eventToAdd);

    // Reset form and close modal immediately for better UX
    setShowSubmitModal(false);
    setIsEditing(false);
    setEditingEventId(null);
    setValidationError('');
    setNewEvent({
      title: '',
      date: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      time: '',
      startTime: '9:00 AM',
      endTime: '10:00 AM',
      location: '',
      description: '',
      category: 'Community Service',
      organizer: '',
      link: ''
    });

    try {
      if (isEditing && editingEventId) {
        // Update existing event in Supabase
        const { error } = await supabase
          .from('events')
          .update({
            title: eventToAdd.title,
            date: eventToAdd.date,
            end_date: eventToAdd.endDate,
            start_time: eventToAdd.startTime || '',
            end_time: eventToAdd.endTime || '',
            location: eventToAdd.location,
            description: eventToAdd.description,
            category: eventToAdd.category,
            organizer: eventToAdd.organizer,
            contact_email: eventToAdd.contactEmail || null,
            contact_phone: eventToAdd.contactPhone || null,
            link: eventToAdd.link || null
          })
          .eq('id', editingEventId);
        
        if (error) throw error;
        
        // Update local state
        setEvents(prevEvents => prevEvents.map(e => e.id === editingEventId ? eventToAdd : e));
        const fcEvent = convertToCalendarEvent(eventToAdd);
        setCalendarEvents(prevCalendarEvents => prevCalendarEvents.map(e => e.id === editingEventId ? fcEvent : e));
        
        alert('Event updated');
      } else {
        // Insert new event into Supabase
        const { data, error } = await supabase
          .from('events')
          .insert([{
            title: eventToAdd.title,
            date: eventToAdd.date,
            end_date: eventToAdd.endDate,
            start_time: eventToAdd.startTime || '',
            end_time: eventToAdd.endTime || '',
            location: eventToAdd.location,
            description: eventToAdd.description,
            category: eventToAdd.category,
            organizer: eventToAdd.organizer,
            contact_email: eventToAdd.contactEmail || null,
            contact_phone: eventToAdd.contactPhone || null,
            link: eventToAdd.link || null
          }])
          .select()
          .single();
        
        if (error) throw error;
        
        // Update event with Supabase-generated ID
        if (data) {
          eventToAdd.id = data.id;
          setEvents(prevEvents => [...prevEvents, eventToAdd]);
          const fcEvent = convertToCalendarEvent(eventToAdd);
          setCalendarEvents(prevCalendarEvents => [...prevCalendarEvents, fcEvent]);
        }
        
        alert('Event added');
      }
      
      // Force agenda view to re-render
      setRefreshKey(prev => prev + 1);
      
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Error saving event');
      
      // Show the modal again so user doesn't lose their data
      setShowSubmitModal(true);
      setIsEditing(isEditing);
      setEditingEventId(editingEventId);
    }

  };

  // Get category color
  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Community Service': '#3B82F6',
      'Health': '#10B981',
      'Career': '#F59E0B',
      'Education': '#8B5CF6',
      'Recreation': '#EC4899'
    };
    return colors[category] || '#6B7280';
  };

  // Get upcoming events sorted by date
  const getUpcomingEvents = () => {
    console.log('getUpcomingEvents called. Current events:', events);
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    const upcoming = events
      .filter(event => {
        // Check if date is valid
        if (!event.date || event.date.trim() === '') {
          console.log('Filtering out event with empty date:', event.title);
          return false;
        }
        
        // Validate the date format
        const dateObj = new Date(event.date);
        if (isNaN(dateObj.getTime())) {
          console.log('Filtering out event with invalid date:', event.title, event.date);
          return false;
        }
        
        // Include all events from today forward
        console.log('Checking event:', event.title, 'Event date:', event.date, 'Today:', todayStr, 'Is upcoming:', event.date >= todayStr);
        return event.date >= todayStr;
      })
      .sort((a, b) => a.date.localeCompare(b.date));
    
    console.log('Filtered upcoming events:', upcoming);
    return upcoming;
  };

  // Format date for agenda view
  const formatAgendaDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  };

  // Group events by date
  const groupEventsByDate = (events: Event[]) => {
    const grouped: { [key: string]: Event[] } = {};
    events.forEach(event => {
      if (!grouped[event.date]) {
        grouped[event.date] = [];
      }
      grouped[event.date].push(event);
    });
    return grouped;
  };

  // Convert 12-hour time to 24-hour format
  const convertTo24Hour = (time12h: string) => {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    let hour = parseInt(hours, 10);
    
    if (modifier === 'PM' && hour !== 12) {
      hour = hour + 12;
    } else if (modifier === 'AM' && hour === 12) {
      hour = 0;
    }
    
    return `${hour.toString().padStart(2, '0')}:${minutes}:00`;
  };

  // Convert event to FullCalendar format
  const convertToCalendarEvent = (event: Event): CalendarEvent => {
    const baseEvent: CalendarEvent = {
      id: event.id,
      title: event.title,
      extendedProps: {
        time: event.time,
        location: event.location,
        description: event.description,
        category: event.category,
        organizer: event.organizer,
        link: event.link
      }
    };

    if (event.startTime && event.endTime) {
      // Convert times to proper datetime format
      baseEvent.start = `${event.date}T${convertTo24Hour(event.startTime)}`;
      // Use endDate if it's different from start date (multi-day event)
      const endDateToUse = event.endDate && event.endDate !== event.date ? event.endDate : event.date;
      baseEvent.end = `${endDateToUse}T${convertTo24Hour(event.endTime)}`;
    } else if (event.time && event.time.includes('-')) {
      // Handle legacy format "10:00 AM - 2:00 PM"
      const [startTime, endTime] = event.time.split(' - ');
      if (startTime && endTime) {
        baseEvent.start = `${event.date}T${convertTo24Hour(startTime.trim())}`;
        baseEvent.end = `${event.date}T${convertTo24Hour(endTime.trim())}`;
      } else {
        // Default to 9-10 AM if parsing fails
        baseEvent.start = `${event.date}T09:00:00`;
        baseEvent.end = `${event.date}T10:00:00`;
      }
    } else {
      // Default to 9-10 AM if no time info
      baseEvent.start = `${event.date}T09:00:00`;
      baseEvent.end = `${event.date}T10:00:00`;
    }

    return baseEvent;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-20 pb-8">
        <div className="max-w-6xl mx-auto">
        {/* Header text - centered */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">Community Events</h1>
          <p className="text-sm md:text-base text-gray-600">Stay connected with what's happening in Robeson County</p>
        </div>

        {/* Category Legend */}
        <div className="mb-6 flex flex-wrap gap-3 justify-center px-4">
          {categories.map(category => (
            <div key={category} className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded"
                style={{ backgroundColor: getCategoryColor(category) }}
              />
              <span className="text-sm text-gray-700">{category}</span>
            </div>
          ))}
        </div>

        {/* View Toggle Buttons */}
        <div className="mb-4 flex justify-center gap-2 px-4">
          <button
            onClick={() => {
              setIsAgendaView(true);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isAgendaView 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Agenda
          </button>
          <button
            onClick={() => {
              setCurrentView('timeGridDay');
              setIsAgendaView(false);
              setRefreshKey(prev => prev + 1);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              currentView === 'timeGridDay' && !isAgendaView
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Day
          </button>
          <button
            onClick={() => {
              setCurrentView('timeGridWeek');
              setIsAgendaView(false);
              setRefreshKey(prev => prev + 1);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              currentView === 'timeGridWeek' && !isAgendaView
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => {
              setCurrentView('dayGridMonth');
              setIsAgendaView(false);
              setRefreshKey(prev => prev + 1);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              currentView === 'dayGridMonth' && !isAgendaView
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Month
          </button>
        </div>


        {/* Calendar or Agenda View */}
        {!isAgendaView ? (
          <div className={`bg-white rounded-lg shadow-md p-2 md:p-6 ${isAdmin ? 'admin-calendar' : ''}`}>
            <style>{`
            .admin-calendar .fc-daygrid-day:hover {
              background-color: #EFF6FF;
              cursor: pointer;
            }
            .admin-calendar .fc-daygrid-day-frame {
              min-height: 80px;
            }
            /* Style the time grid */
            .fc-timegrid-slot-label {
              font-size: 0.875rem;
              color: #4B5563;
            }
            .fc-timegrid-axis {
              width: 60px;
            }
            /* Remove all-day section but keep time labels */
            .fc-timegrid-all-day-events {
              display: none !important;
            }
            .fc-timegrid-divider {
              display: none !important;
            }
            /* Mobile-specific styles */
            @media (max-width: 768px) {
              .fc-toolbar {
                flex-direction: column;
                gap: 0.5rem;
              }
              .fc-toolbar-title {
                font-size: 1.1rem;
              }
              .fc-button {
                padding: 0.25rem 0.5rem;
                font-size: 0.875rem;
              }
              .fc-col-header-cell {
                font-size: 0.75rem;
              }
              .fc-daygrid-day-number {
                font-size: 0.875rem;
              }
              .fc-event {
                font-size: 0.75rem;
              }
              .fc-timegrid-slot-label {
                font-size: 0.7rem;
              }
              .fc-timegrid-axis {
                width: 45px;
              }
            }
          `}</style>
          {loading ? (
            <p className="text-center py-8">Loading events...</p>
          ) : (
            <FullCalendar
              key={`${currentView}-${refreshKey}`}
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView={currentView}
              events={calendarEvents}
              eventClick={handleEventClick}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: ''
              }}
              height={isMobile ? 'calc(100vh - 250px)' : 'calc(100vh - 350px)'}
              dateClick={undefined}
              eventColor="#3B82F6"
              eventDisplay="block"
              selectable={false}
              slotMinTime="06:00:00"
              slotMaxTime="22:00:00"
              slotDuration="00:30:00"
              slotLabelInterval="01:00:00"
              slotLabelFormat={{
                hour: 'numeric',
                minute: '2-digit',
                omitZeroMinute: true,
                meridiem: 'short'
              }}
              allDaySlot={false}
              eventContent={(eventInfo) => {
                const category = eventInfo.event.extendedProps.category;
                const isTimeGrid = eventInfo.view.type.includes('timeGrid');
                return (
                  <div 
                    className="p-1 text-xs"
                    style={{ 
                      backgroundColor: getCategoryColor(category),
                      color: 'white',
                      borderRadius: '4px',
                      height: '100%',
                      overflow: 'hidden'
                    }}
                  >
                    <div className="font-semibold truncate">{eventInfo.event.title}</div>
                    {isTimeGrid && (
                      <div className="text-[10px] opacity-90 truncate">
                        {eventInfo.event.extendedProps.location}
                      </div>
                    )}
                  </div>
                );
              }}
            />
          )}
          </div>
        ) : (
          /* Agenda View */
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6" key={refreshKey}>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Upcoming Events</h2>
            {loading ? (
              <p className="text-center py-8">Loading events...</p>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupEventsByDate(getUpcomingEvents())).map(([date, dayEvents]) => (
                  <div key={date}>
                    <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">
                      {formatAgendaDate(date)}
                    </h3>
                    <div className="space-y-3">
                      {dayEvents.map(event => (
                        <div 
                          key={event.id}
                          onClick={() => {
                            setSelectedEvent(event);
                            setShowEventModal(true);
                          }}
                          className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                        >
                          <div 
                            className="w-1 h-16 rounded-full flex-shrink-0"
                            style={{ backgroundColor: getCategoryColor(event.category) }}
                          />
                          <div className="flex-grow">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                              <h4 className="font-medium text-gray-800 text-base sm:text-base">{event.title}</h4>
                              <span className="text-sm sm:text-sm text-gray-500">{event.time}</span>
                            </div>
                            <p className="text-sm sm:text-sm text-gray-600">
                              <span className="font-medium">Location:</span> {event.location}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <span 
                                className="text-xs sm:text-xs px-2 py-1 rounded-full text-white"
                                style={{ backgroundColor: getCategoryColor(event.category) }}
                              >
                                {event.category}
                              </span>
                              <span className="text-xs sm:text-xs text-gray-500">
                                Organized by {event.organizer}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {getUpcomingEvents().length === 0 && (
                  <p className="text-center text-gray-500 py-8">No upcoming events scheduled.</p>
                )}
              </div>
            )}
          </div>
        )}


        {/* Event Details Modal */}
        {showEventModal && selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">{selectedEvent.title}</h2>
              <div className="space-y-3 text-gray-700">
                <p><strong>Date:</strong> {new Date(selectedEvent.date).toLocaleDateString()}{selectedEvent.endDate && selectedEvent.endDate !== selectedEvent.date ? ` - ${new Date(selectedEvent.endDate).toLocaleDateString()}` : ''}</p>
                <p><strong>Time:</strong> {selectedEvent.time}</p>
                <div>
                  <strong>Location:</strong> {selectedEvent.location}
                  {selectedEvent.location && (
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(selectedEvent.location)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 inline-flex items-center text-blue-500 hover:text-blue-600 text-sm"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Get Directions
                    </a>
                  )}
                </div>
                <div>
                  <strong>Description:</strong>
                  <div className="mt-1 whitespace-pre-wrap">{selectedEvent.description}</div>
                </div>
                <p><strong>Category:</strong> {selectedEvent.category}</p>
                <p><strong>Organizer:</strong> {selectedEvent.organizer}</p>
                {selectedEvent.link && (
                  <p>
                    <strong>Link:</strong>{' '}
                    <a 
                      href={(() => {
                        const link = selectedEvent.link.trim();
                        // If it already has a protocol, use as-is
                        if (link.match(/^https?:\/\//i)) {
                          return link;
                        }
                        // If it starts with //, treat as protocol-relative
                        if (link.startsWith('//')) {
                          return `https:${link}`;
                        }
                        // Otherwise, prepend https://
                        return `https://${link}`;
                      })()} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 underline hover:text-blue-600"
                      onClick={(e) => {
                        e.preventDefault();
                        const link = selectedEvent.link?.trim() || '';
                        let finalUrl = link;
                        if (!link.match(/^https?:\/\//i)) {
                          finalUrl = link.startsWith('//') ? `https:${link}` : `https://${link}`;
                        }
                        window.open(finalUrl, '_blank', 'noopener,noreferrer');
                      }}
                    >
                      {selectedEvent.link.includes('zoom') ? 'Join Zoom Meeting' : 'Event Link'}
                    </a>
                  </p>
                )}
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowEventModal(false)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}


                    type="text"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={newEvent.date}
                      onChange={(e) => {
                        const inputDate = e.target.value;
                        setNewEvent({...newEvent, date: inputDate});
                        
                        // Validate the date immediately
                        if (inputDate) {
                          const dateObj = new Date(inputDate);
                          
                          // Check if date is valid
                          if (isNaN(dateObj.getTime())) {
                            setValidationError('Invalid date format');
                            return;
                          }
                          
                          // Check if the date string matches (catches dates like Feb 31)
                          if (dateObj.toISOString().split('T')[0] !== inputDate) {
                            setValidationError('Invalid date selected');
                            return;
                          }
                          
                          // Check if date is in the past (for new events only)
                          if (!isEditing) {
                            const eventDateTime = new Date(`${inputDate}T${convertTo24Hour(newEvent.startTime || '9:00 AM')}`);
                            const now = new Date();
                            if (eventDateTime < now) {
                              setValidationError("Can't select a past date/time");
                              return;
                            }
                          }
                          
                          // Update end date if needed
                          if (inputDate > (newEvent.endDate || '')) {
                            setNewEvent(prev => ({...prev, endDate: inputDate}));
                          }
                          
                          // Clear any existing validation errors
                          setValidationError('');
                        }
                      }}
                      min={isEditing ? undefined : new Date().toISOString().split('T')[0]}
                      className={`w-full px-4 py-2 border ${validationError ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={newEvent.endDate || newEvent.date}
                      onChange={(e) => {
                        const inputDate = e.target.value;
                        const dateObj = new Date(inputDate);
                        if (!isNaN(dateObj.getTime()) && dateObj.toISOString().split('T')[0] === inputDate) {
                          setNewEvent({...newEvent, endDate: inputDate});
                          if (validationError && validationError.includes('end date')) {
                            setValidationError('');
                          }
                        } else if (inputDate) {
                          setValidationError('Invalid end date selected');
                        }
                      }}
                      min={newEvent.date}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                </div>

                {/* Time Selection */}
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                      <select
                        value={newEvent.startTime}
                        onChange={(e) => {
                          const newStartTime = e.target.value;
                          setNewEvent({...newEvent, startTime: newStartTime});
                          
                          // Validate time for today's date
                          if (!isEditing && newEvent.date === new Date().toISOString().split('T')[0]) {
                            const eventDateTime = new Date(`${newEvent.date}T${convertTo24Hour(newStartTime)}`);
                            const now = new Date();
                            if (eventDateTime < now) {
                              setValidationError("Can't select a time that has already passed");
                              return;
                            }
                          }
                          
                          // Clear validation error if valid
                          if (validationError && !validationError.includes('end time')) {
                            setValidationError('');
                          }
                        }}
                        className={`w-full px-4 py-2 border ${validationError ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                        required
                      >
                        {timeOptions.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                      <select
                        value={newEvent.endTime}
                        onChange={(e) => {
                          const newEndTime = e.target.value;
                          setNewEvent({...newEvent, endTime: newEndTime});
                          
                          // Validate end time is after start time for same-day events
                          if (newEvent.date === newEvent.endDate || !newEvent.endDate) {
                            const startTime = convertTo24Hour(newEvent.startTime || '9:00 AM');
                            const endTime = convertTo24Hour(newEndTime);
                            if (startTime >= endTime) {
                              setValidationError('End time must be after start time');
                              return;
                            }
                          }
                          
                          // Clear validation error if it was about end time
                          if (validationError && validationError.includes('end time')) {
                            setValidationError('');
                          }
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        required
                      >
                        {timeOptions.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                </div>

                {/* Validation Error Message */}
                {validationError && (
                  <div className="flex items-center gap-2 p-4 bg-red-100 border-2 border-red-400 rounded-lg text-red-800 animate-pulse">
                    <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="font-semibold">{validationError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={newEvent.category}
                    onChange={(e) => setNewEvent({...newEvent, category: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Organizer</label>
                  <input
                    type="text"
                    value={newEvent.organizer}
                    onChange={(e) => setNewEvent({...newEvent, organizer: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-y"
                    placeholder="Enter event description. Press Enter for new lines."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Link (Optional)</label>
                  <input
                    type="url"
                    value={newEvent.link}
                    onChange={(e) => setNewEvent({...newEvent, link: e.target.value})}
                    placeholder="https://zoom.us/j/123456789 or event website"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <p className="text-xs text-gray-500 mt-1">Add a Zoom link, event website, or registration page</p>
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <button
                  onClick={() => {
                    setShowSubmitModal(false);
                    setIsEditing(false);
                    setEditingEventId(null);
                    setValidationError('');
                    setNewEvent({
                      title: '',
                      date: new Date().toISOString().split('T')[0],
                      endDate: new Date().toISOString().split('T')[0],
                      time: '',
                      startTime: '9:00 AM',
                      endTime: '10:00 AM',
                      location: '',
                      description: '',
                      category: 'Community Service',
                      organizer: '',
                      link: ''
                    });
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitEvent}
                  disabled={!newEvent.title || !newEvent.startTime || !newEvent.endTime || !newEvent.location || !newEvent.organizer || !newEvent.description || !!validationError}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed relative group"
                  title={validationError || ''}
                >
                  {isEditing ? 'Update Event' : 'Add Event'}
                  {validationError && (
                    <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 text-xs text-white bg-gray-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {validationError}
                    </span>
                  )}
                </button>
              </div>
            </div>
            </div>
          </div>
        )}
        </div>
      </main>
    </div>
  );
}