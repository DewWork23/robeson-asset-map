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
  const [loading, setLoading] = useState(true);
  
  // Check if mobile and set appropriate default view
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const [currentView, setCurrentView] = useState(isMobile ? 'timeGridDay' : 'timeGridWeek');
  const [isAgendaView, setIsAgendaView] = useState(true); // Default to agenda view
  const [refreshKey, setRefreshKey] = useState(0); // Force re-render key

  const categories = ['Community Service', 'Health', 'Career', 'Education', 'Recreation'];

  // Load events on component mount
  useEffect(() => {
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
      }
    } catch (error) {
      console.error('Error loading events:', error);
      // Initialize with empty arrays if loading fails
      setEvents([]);
      setCalendarEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = (info: any) => {
    const event = events.find(e => e.id === info.event.id);
    if (event) {
      setSelectedEvent(event);
      setShowEventModal(true);
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
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    const upcoming = events
      .filter(event => {
        // Check if date is valid
        if (!event.date || event.date.trim() === '') {
          return false;
        }
        
        // Validate the date format
        const dateObj = new Date(event.date);
        if (isNaN(dateObj.getTime())) {
          return false;
        }
        
        // Include all events from today forward
        return event.date >= todayStr;
      })
      .sort((a, b) => a.date.localeCompare(b.date));
    
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
          <div className="bg-white rounded-lg shadow-md p-2 md:p-6">
            <style>{`
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
        </div>
      </main>
    </div>
  );
}