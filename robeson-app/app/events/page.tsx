'use client';

import { useState, useEffect, useRef } from 'react';
import Navigation from '@/components/Navigation';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

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
    organizer: ''
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
      // Try to load from Google Sheets first
      const sheetId = process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID;
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
      
      if (sheetId && apiKey) {
        console.log('Loading events from Google Sheets...');
        // Read specifically from Events sheet (A:M to include Event ID and all columns)
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Events!A:M?key=${apiKey}`;
        
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          const rows = data.values || [];
          
          if (rows.length > 1) {
            // Skip header row and convert to Event objects
            const googleEvents: Event[] = rows.slice(1).map((row: string[], index: number) => ({
              id: row[0] || (index + 1).toString(), // Use Event ID from sheet
              title: row[1] || '',
              date: row[2] || '',
              endDate: row[3] || row[2] || '',
              time: (row[4] && row[5]) ? `${row[4]} - ${row[5]}` : '',
              startTime: row[4] || '9:00 AM',
              endTime: row[5] || '10:00 AM',
              location: row[6] || '',
              description: row[7] || '',
              category: row[8] || 'Community Service',
              organizer: row[9] || ''
            }));
            
            console.log('Loaded', googleEvents.length, 'events from Google Sheets');
            console.log('Event IDs:', googleEvents.map(e => ({ id: e.id, title: e.title })));
            setEvents(googleEvents);
            
            // Convert to FullCalendar format
            const fcEvents: CalendarEvent[] = googleEvents.map(event => convertToCalendarEvent(event));
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
    // Remove from local state immediately for better UX
    setEvents(prevEvents => prevEvents.filter(e => e.id !== eventId));
    setCalendarEvents(prevCalendarEvents => prevCalendarEvents.filter(e => e.id !== eventId));
    
    // Try to delete from Google Sheets
    const scriptUrl = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL;
    if (scriptUrl) {
      try {
        await fetch(scriptUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'delete',
            id: eventId
          })
        });
        
        console.log('Delete request sent for event ID:', eventId);
        alert('Event deleted! If it reappears after refresh, please ensure:\n1. Google Apps Script is redeployed with latest code\n2. Your Events sheet has "Event ID" as the first column');
      } catch (error) {
        console.error('Error deleting from Google Sheets:', error);
        alert('Event deleted locally, but there was an error removing it from Google Sheets.');
      }
    } else {
      alert('Event deleted locally. Google Sheets integration not configured.');
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
    // Validate date and time
    const eventDateTime = new Date(`${newEvent.date}T${convertTo24Hour(newEvent.startTime || '9:00 AM')}`);
    const now = new Date();
    
    if (eventDateTime < now && !isEditing) {
      setValidationError("Can't choose a time that's already occurred");
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
      endDate: newEvent.endDate || newEvent.date,
      time: timeString,
      location: newEvent.location || '',
      description: newEvent.description || '',
      category: newEvent.category || 'Other',
      organizer: newEvent.organizer || '',
      startTime: newEvent.startTime,
      endTime: newEvent.endTime
    };

    // Add to local state for immediate display
    if (isEditing) {
      // Update existing event
      setEvents(prevEvents => prevEvents.map(e => e.id === id ? eventToAdd : e));
    } else {
      // Add new event
      setEvents(prevEvents => {
        const updated = [...prevEvents, eventToAdd];
        console.log('Previous events:', prevEvents);
        console.log('Adding event:', eventToAdd);
        console.log('Updated events:', updated);
        return updated;
      });
    }
    
    // Convert to FullCalendar format
    const fcEvent = convertToCalendarEvent(eventToAdd);
    if (isEditing) {
      setCalendarEvents(prevCalendarEvents => prevCalendarEvents.map(e => e.id === id ? fcEvent : e));
    } else {
      setCalendarEvents(prevCalendarEvents => {
        const updated = [...prevCalendarEvents, fcEvent];
        console.log('Updated calendar events:', updated);
        return updated;
      });
    }
    
    // Force agenda view to re-render
    setRefreshKey(prev => prev + 1);

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
      organizer: ''
    });

    // Check if Google Script URL is configured
    const scriptUrl = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL;
    
    // Submit to Google Sheets in background
    if (scriptUrl) {
      try {
        // Send to Google Sheets via Apps Script
        const response = await fetch(scriptUrl, {
          method: 'POST',
          mode: 'no-cors', // Required for Google Apps Script
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: isEditing ? 'update' : 'add',
            id: eventToAdd.id,
            title: eventToAdd.title,
            date: eventToAdd.date,
            endDate: eventToAdd.endDate || eventToAdd.date,
            startTime: eventToAdd.startTime || '',
            endTime: eventToAdd.endTime || '',
            location: eventToAdd.location,
            description: eventToAdd.description,
            category: eventToAdd.category,
            organizer: eventToAdd.organizer,
            contactEmail: '', // Add if needed
            contactPhone: ''  // Add if needed
          })
        });
        
        // Since we're using no-cors, we can't read the response
        // Event already added to UI, just show success
        console.log(isEditing ? 'Event updated in Google Sheets' : 'Event submitted to Google Sheets');
        alert(isEditing ? 'Event updated successfully!' : 'Event added successfully!');
        
      } catch (error) {
        console.error('Error submitting to Google Sheets:', error);
        alert('Error submitting event. It has been saved locally for now.');
        
        // Fall back to local storage
        const pendingEvents = JSON.parse(sessionStorage.getItem('pendingEvents') || '[]');
        pendingEvents.push(eventToAdd);
        sessionStorage.setItem('pendingEvents', JSON.stringify(pendingEvents));
      }
    } else {
      // No Google Script URL configured - use local storage
      const pendingEvents = JSON.parse(sessionStorage.getItem('pendingEvents') || '[]');
      pendingEvents.push(eventToAdd);
      sessionStorage.setItem('pendingEvents', JSON.stringify(pendingEvents));
      
      console.log('Event saved locally - Google Sheets not configured');
      alert('Event saved locally. Configure Google Sheets integration for persistent storage.');
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
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    const upcoming = events
      .filter(event => {
        // Compare date strings directly to avoid timezone issues
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
        organizer: event.organizer
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
        {/* Header with admin controls */}
        <div className="relative mb-6">
          {/* Admin controls - absolute positioned top right */}
          <div className="absolute top-0 right-0 flex gap-2">
            {!isAdmin ? (
              <button 
                onClick={() => setShowLoginModal(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 text-sm"
              >
                Admin Login
              </button>
            ) : (
              <>
                <button 
                  onClick={() => setShowSubmitModal(true)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 text-sm"
                >
                  Add Event
                </button>
                <button 
                  onClick={handleLogout}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 text-sm"
                >
                  Logout
                </button>
              </>
            )}
          </div>
          
          {/* Header text - centered */}
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">Community Events</h1>
            <p className="text-sm md:text-base text-gray-600">Stay connected with what's happening in Robeson County</p>
          </div>
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
              calendarRef.current?.getApi().changeView('timeGridDay');
              setCurrentView('timeGridDay');
              setIsAgendaView(false);
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
              calendarRef.current?.getApi().changeView('timeGridWeek');
              setCurrentView('timeGridWeek');
              setIsAgendaView(false);
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
              calendarRef.current?.getApi().changeView('dayGridMonth');
              setCurrentView('dayGridMonth');
              setIsAgendaView(false);
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

        {/* Admin Notice */}
        {isAdmin && (
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Admin Mode:</span> Click on any date to add an event
            </p>
          </div>
        )}

        {/* Calendar or Agenda View */}
        {!isAgendaView ? (
          <div className={`bg-white rounded-lg shadow-md p-2 md:p-6 ${isAdmin ? 'admin-calendar' : ''}`}>
            <style jsx global>{`
            .admin-calendar .fc-daygrid-day:hover {
              background-color: #EFF6FF;
              cursor: pointer;
            }
            .admin-calendar .fc-daygrid-day-frame {
              min-height: 80px;
            }
            /* Hide all-day row completely */
            .fc-timegrid-axis-cushion,
            .fc-timegrid-all-day-events,
            .fc-timegrid-divider,
            .fc-scrollgrid-shrink-cushion,
            .fc-timegrid-axis-frame:first-child {
              display: none !important;
            }
            .fc-timegrid .fc-scrollgrid-section:has(.fc-timegrid-divider),
            .fc-timegrid .fc-scrollgrid-section:first-of-type table {
              display: none !important;
            }
            .fc-timegrid .fc-scrollgrid-section:nth-child(2) {
              min-height: 0 !important;
              height: 0 !important;
            }
            /* Hide the all-day text specifically */
            .fc-timegrid-axis-cushion:contains("all-day") {
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
                font-size: 0.75rem;
              }
            }
          `}</style>
          {loading ? (
            <p className="text-center py-8">Loading events...</p>
          ) : (
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView={isMobile ? 'timeGridDay' : 'timeGridWeek'}
              events={calendarEvents}
              eventClick={handleEventClick}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: ''
              }}
              height={isMobile ? 'calc(100vh - 250px)' : 'calc(100vh - 350px)'}
              dateClick={isAdmin ? (arg) => {
                setNewEvent({
                  ...newEvent,
                  date: arg.dateStr,
                  endDate: arg.dateStr
                });
                setShowSubmitModal(true);
              } : undefined}
              eventColor="#3B82F6"
              eventDisplay="block"
              selectable={isAdmin}
              eventContent={(eventInfo) => {
                const category = eventInfo.event.extendedProps.category;
                return (
                  <div 
                    className="p-1 text-xs truncate"
                    style={{ 
                      backgroundColor: getCategoryColor(category),
                      color: 'white',
                      borderRadius: '4px'
                    }}
                  >
                    {eventInfo.event.title}
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
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-gray-800">{event.title}</h4>
                              <span className="text-sm text-gray-500">{event.time}</span>
                            </div>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Location:</span> {event.location}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span 
                                className="text-xs px-2 py-1 rounded-full text-white"
                                style={{ backgroundColor: getCategoryColor(event.category) }}
                              >
                                {event.category}
                              </span>
                              <span className="text-xs text-gray-500">
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

        {/* Pending Events - only show when admin and has pending events */}
        {isAdmin && sessionStorage.getItem('pendingEvents') && 
         JSON.parse(sessionStorage.getItem('pendingEvents') || '[]').length > 0 && 
         !process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL && (
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-4">
            <h3 className="text-lg font-bold text-gray-800 mb-3">Pending Events (Local Storage)</h3>
            <p className="text-sm text-gray-600 mb-4">
              Google Sheets integration not configured. To enable automatic submission:
              1. Follow the instructions in DEPLOY_GOOGLE_SCRIPT.md
              2. Add NEXT_PUBLIC_GOOGLE_SCRIPT_URL to your .env.local file
              
              To manually add these events:
              1. Copy the JSON below
              2. Go to your GitHub repository
              3. Edit public/events.json
              4. Add these events to the "events" array
            </p>
            <div className="bg-white rounded border border-gray-200 p-4 font-mono text-xs overflow-x-auto">
              <pre>{JSON.stringify(JSON.parse(sessionStorage.getItem('pendingEvents') || '[]'), null, 2)}</pre>
            </div>
            <div className="mt-3 flex gap-3">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(
                    JSON.stringify(JSON.parse(sessionStorage.getItem('pendingEvents') || '[]'), null, 2)
                  );
                  alert('Event data copied to clipboard!');
                }}
                className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                Copy to Clipboard
              </button>
              <button 
                onClick={() => {
                  sessionStorage.removeItem('pendingEvents');
                  window.location.reload();
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Clear Pending
              </button>
            </div>
          </div>
        )}

        {/* Event Details Modal */}
        {showEventModal && selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">{selectedEvent.title}</h2>
              <div className="space-y-3 text-gray-700">
                <p><strong>Date:</strong> {new Date(selectedEvent.date).toLocaleDateString()}{selectedEvent.endDate && selectedEvent.endDate !== selectedEvent.date ? ` - ${new Date(selectedEvent.endDate).toLocaleDateString()}` : ''}</p>
                <p><strong>Time:</strong> {selectedEvent.time}</p>
                <p><strong>Location:</strong> {selectedEvent.location}</p>
                <p><strong>Description:</strong> {selectedEvent.description}</p>
                <p><strong>Category:</strong> {selectedEvent.category}</p>
                <p><strong>Organizer:</strong> {selectedEvent.organizer}</p>
              </div>
              <div className="mt-6 flex gap-3">
                {isAdmin && (
                  <>
                    <button
                      onClick={() => {
                        // Load event data into form for editing
                        setNewEvent({
                          title: selectedEvent.title,
                          date: selectedEvent.date,
                          endDate: selectedEvent.endDate || selectedEvent.date,
                          time: selectedEvent.time,
                          startTime: selectedEvent.startTime || '9:00 AM',
                          endTime: selectedEvent.endTime || '10:00 AM',
                          location: selectedEvent.location,
                          description: selectedEvent.description,
                          category: selectedEvent.category,
                          organizer: selectedEvent.organizer
                        });
                        setIsEditing(true);
                        setEditingEventId(selectedEvent.id);
                        setShowEventModal(false);
                        setShowSubmitModal(true);
                      }}
                      className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this event?')) {
                          handleDeleteEvent(selectedEvent.id);
                          setShowEventModal(false);
                        }
                      }}
                      className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </>
                )}
                <button
                  onClick={() => setShowEventModal(false)}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Login Modal */}
        {showLoginModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h2 className="text-xl font-bold mb-4">Admin Login</h2>
              <p className="text-gray-600 mb-4">Enter the admin password to manage events</p>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="Enter password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2"
              />
              {loginError && <p className="text-red-500 text-sm mb-4">{loginError}</p>}
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowLoginModal(false);
                    setPassword('');
                    setLoginError('');
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogin}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Login
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Submit Event Modal */}
        {showSubmitModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen p-4">
              <div className="bg-white rounded-lg p-4 md:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">{isEditing ? 'Edit Event' : 'Add New Event'}</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                  <input
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
                        setNewEvent({...newEvent, date: e.target.value, endDate: e.target.value > (newEvent.endDate || '') ? e.target.value : newEvent.endDate});
                        // Clear validation error when user makes changes
                        if (validationError) {
                          const eventDateTime = new Date(`${e.target.value}T${convertTo24Hour(newEvent.startTime || '9:00 AM')}`);
                          const now = new Date();
                          if (eventDateTime >= now || isEditing) {
                            setValidationError('');
                          }
                        }
                      }}
                      className={`w-full px-4 py-2 border ${validationError ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={newEvent.endDate || newEvent.date}
                      onChange={(e) => setNewEvent({...newEvent, endDate: e.target.value})}
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
                          setNewEvent({...newEvent, startTime: e.target.value});
                          // Clear validation error when user makes changes
                          if (validationError) {
                            const eventDateTime = new Date(`${newEvent.date}T${convertTo24Hour(e.target.value)}`);
                            const now = new Date();
                            if (eventDateTime >= now || isEditing) {
                              setValidationError('');
                            }
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
                        onChange={(e) => setNewEvent({...newEvent, endTime: e.target.value})}
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
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
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
                      organizer: ''
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