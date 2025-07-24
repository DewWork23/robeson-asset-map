'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
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
  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    title: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    location: '',
    description: '',
    category: 'Community Service',
    organizer: ''
  });

  const categories = ['Community Service', 'Health', 'Career', 'Education', 'Recreation'];

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
    const eventToAdd = {
      ...newEvent,
      id
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
            startTime: eventToAdd.time?.split('-')[0] || '',
            endTime: eventToAdd.time?.split('-')[1] || '',
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
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Community Events</h1>
          <p className="text-gray-600">Stay connected with what's happening in Robeson County</p>
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

        {/* Admin Notice */}
        {isAdmin && (
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Admin Mode:</span> Click on any date to add an event
            </p>
          </div>
        )}

        {/* FullCalendar */}
        <div className={`bg-white rounded-lg shadow-md p-6 ${isAdmin ? 'admin-calendar' : ''}`}>
          <style jsx global>{`
            .admin-calendar .fc-daygrid-day:hover {
              background-color: #EFF6FF;
              cursor: pointer;
            }
            .admin-calendar .fc-daygrid-day-frame {
              min-height: 80px;
            }
          `}</style>
          {loading ? (
            <p className="text-center py-8">Loading events...</p>
          ) : (
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              events={calendarEvents}
              eventClick={handleEventClick}
              dateClick={isAdmin ? (arg) => {
                setNewEvent({
                  ...newEvent,
                  date: arg.dateStr
                });
                setShowSubmitModal(true);
              } : undefined}
              eventColor="#3B82F6"
              eventDisplay="block"
              height="auto"
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

        {/* Admin Panel */}
        {isAdmin && (
          <div className="mt-8">
            {/* Pending Events */}
            {sessionStorage.getItem('pendingEvents') && 
             JSON.parse(sessionStorage.getItem('pendingEvents') || '[]').length > 0 && 
             !process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-4">
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

            {/* Admin Actions */}
            <div className="bg-blue-50 rounded-lg p-6 text-center">
              <p className="text-gray-700 mb-3">Logged in as admin</p>
              <div className="flex gap-3 justify-center">
                <button 
                  onClick={() => setShowSubmitModal(true)}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
                >
                  Add Event
                </button>
                <button 
                  onClick={handleLogout}
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Login CTA for non-admins */}
        {!isAdmin && (
          <div className="mt-8 bg-blue-50 rounded-lg p-6 text-center">
            <p className="text-gray-700 mb-3">Are you an authorized event coordinator?</p>
            <button 
              onClick={() => setShowLoginModal(true)}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
            >
              Admin Login
            </button>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                    <input
                      type="text"
                      value={newEvent.time}
                      onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                      placeholder="e.g., 10:00 AM - 2:00 PM"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                </div>

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
                  disabled={!newEvent.title || !newEvent.time || !newEvent.location || !newEvent.organizer || !newEvent.description}
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