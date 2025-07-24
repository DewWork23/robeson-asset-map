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
  time: string;
  startTime?: string;
  endTime?: string;
  allDay?: boolean;
  location: string;
  description: string;
  category: string;
  organizer: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
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
  
  // Check if mobile and set appropriate default view
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const [currentView, setCurrentView] = useState(isMobile ? 'timeGridDay' : 'timeGridWeek');
  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    title: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    startTime: '9:00 AM',
    endTime: '10:00 AM',
    allDay: false,
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
      const response = await fetch('/robeson-app/events.json');
      const data = await response.json();
      setEvents(data.events);
      
      // Convert to FullCalendar format
      const fcEvents: CalendarEvent[] = data.events.map((event: Event) => ({
        id: event.id,
        title: event.title,
        date: event.date,
        extendedProps: {
          time: event.time,
          location: event.location,
          description: event.description,
          category: event.category,
          organizer: event.organizer
        }
      }));
      setCalendarEvents(fcEvents);
    } catch (error) {
      console.error('Error loading events:', error);
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

  const handleEventClick = (info: any) => {
    const event = events.find(e => e.id === info.event.id);
    if (event) {
      setSelectedEvent(event);
      setShowEventModal(true);
    }
  };

  const handleSubmitEvent = async () => {
    // Generate a unique ID
    const id = Date.now().toString();
    
    // Format time string from start and end times
    let timeString = '';
    if (newEvent.allDay) {
      timeString = 'All Day';
    } else if (newEvent.startTime && newEvent.endTime) {
      timeString = `${newEvent.startTime} - ${newEvent.endTime}`;
    }
    
    const eventToAdd = {
      ...newEvent,
      id,
      time: timeString
    } as Event;

    // Check if Google Script URL is configured
    const scriptUrl = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL;
    
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
            title: eventToAdd.title,
            date: eventToAdd.date,
            startTime: eventToAdd.allDay ? 'All Day' : eventToAdd.startTime || '',
            endTime: eventToAdd.allDay ? 'All Day' : eventToAdd.endTime || '',
            location: eventToAdd.location,
            description: eventToAdd.description,
            category: eventToAdd.category,
            organizer: eventToAdd.organizer,
            contactEmail: '', // Add if needed
            contactPhone: ''  // Add if needed
          })
        });
        
        // Since we're using no-cors, we can't read the response
        // Assume success and update UI
        alert('Event submitted successfully! It will appear after the next data refresh.');
        
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
      
      alert('Event saved locally. Configure NEXT_PUBLIC_GOOGLE_SCRIPT_URL to enable direct submission to Google Sheets.');
    }
    
    // Add to local state for immediate display
    const updatedEvents = [...events, eventToAdd];
    setEvents(updatedEvents);
    
    // Convert to FullCalendar format
    const fcEvent: CalendarEvent = {
      id: eventToAdd.id,
      title: eventToAdd.title,
      date: eventToAdd.date,
      extendedProps: {
        time: eventToAdd.time,
        location: eventToAdd.location,
        description: eventToAdd.description,
        category: eventToAdd.category,
        organizer: eventToAdd.organizer
      }
    };
    setCalendarEvents([...calendarEvents, fcEvent]);

    // Reset form and close modal
    setShowSubmitModal(false);
    setNewEvent({
      title: '',
      date: new Date().toISOString().split('T')[0],
      time: '',
      startTime: '9:00 AM',
      endTime: '10:00 AM',
      allDay: false,
      location: '',
      description: '',
      category: 'Community Service',
      organizer: ''
    });

    // Alert is now handled above based on whether Google Sheets submission worked
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-20 pb-8">
        {/* Header with admin controls */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <div className="text-center md:text-left mb-4 md:mb-0 flex-grow">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">Community Events</h1>
            <p className="text-sm md:text-base text-gray-600">Stay connected with what's happening in Robeson County</p>
          </div>
          
          {/* Admin controls */}
          <div className="flex gap-2 flex-shrink-0">
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
        </div>

        {/* Category Legend */}
        <div className="mb-6 flex flex-wrap gap-3 justify-center">
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
        <div className="mb-4 flex justify-center gap-2">
          <button
            onClick={() => {
              calendarRef.current?.getApi().changeView('timeGridDay');
              setCurrentView('timeGridDay');
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              currentView === 'timeGridDay' 
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
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              currentView === 'timeGridWeek' 
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
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              currentView === 'dayGridMonth' 
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

        {/* FullCalendar */}
        <div className={`bg-white rounded-lg shadow-md p-2 md:p-6 ${isAdmin ? 'admin-calendar' : ''}`}>
          <style jsx global>{`
            .admin-calendar .fc-daygrid-day:hover {
              background-color: #EFF6FF;
              cursor: pointer;
            }
            .admin-calendar .fc-daygrid-day-frame {
              min-height: 80px;
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
                right: isMobile ? '' : 'timeGridDay,timeGridWeek,dayGridMonth'
              }}
              height={isMobile ? 'calc(100vh - 250px)' : 'calc(100vh - 350px)'}
              dateClick={isAdmin ? (arg) => {
                setNewEvent({
                  ...newEvent,
                  date: arg.dateStr
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
                <p><strong>Date:</strong> {new Date(selectedEvent.date).toLocaleDateString()}</p>
                <p><strong>Time:</strong> {selectedEvent.time}</p>
                <p><strong>Location:</strong> {selectedEvent.location}</p>
                <p><strong>Description:</strong> {selectedEvent.description}</p>
                <p><strong>Category:</strong> {selectedEvent.category}</p>
                <p><strong>Organizer:</strong> {selectedEvent.organizer}</p>
              </div>
              <button
                onClick={() => setShowEventModal(false)}
                className="mt-6 w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Close
              </button>
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full my-8">
              <h2 className="text-xl font-bold mb-4">Add New Event</h2>
              
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <input
                        type="checkbox"
                        checked={newEvent.allDay || false}
                        onChange={(e) => setNewEvent({...newEvent, allDay: e.target.checked})}
                        className="mr-2"
                      />
                      All Day Event
                    </label>
                  </div>
                </div>

                {/* Time Selection - only show if not all day */}
                {!newEvent.allDay && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                      <select
                        value={newEvent.startTime}
                        onChange={(e) => setNewEvent({...newEvent, startTime: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
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
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitEvent}
                  disabled={!newEvent.title || (!newEvent.allDay && (!newEvent.startTime || !newEvent.endTime)) || !newEvent.location || !newEvent.organizer || !newEvent.description}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Add Event
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}