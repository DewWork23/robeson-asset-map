'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';

interface Event {
  id: string;
  title: string;
  date: Date;
  time: string;
  location: string;
  description: string;
  category: string;
  organizer: string;
}

const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Community Food Drive',
    date: new Date(2025, 6, 28),
    time: '10:00 AM - 2:00 PM',
    location: 'Robeson County Community Center',
    description: 'Help us collect non-perishable food items for local families in need.',
    category: 'Community Service',
    organizer: 'Robeson County Food Bank'
  },
  {
    id: '2',
    title: 'Free Health Screening',
    date: new Date(2025, 6, 30),
    time: '9:00 AM - 4:00 PM',
    location: 'Public Health Department',
    description: 'Free blood pressure, diabetes, and vision screenings. No appointment needed.',
    category: 'Health',
    organizer: 'Robeson County Health Department'
  },
  {
    id: '3',
    title: 'Job Fair',
    date: new Date(2025, 7, 5),
    time: '11:00 AM - 3:00 PM',
    location: 'Robeson Community College',
    description: 'Connect with local employers. Bring your resume!',
    category: 'Career',
    organizer: 'Workforce Development Center'
  },
  {
    id: '4',
    title: 'Back to School Supply Giveaway',
    date: new Date(2025, 7, 10),
    time: '1:00 PM - 5:00 PM',
    location: 'Lumberton High School',
    description: 'Free school supplies for K-12 students. First come, first served.',
    category: 'Education',
    organizer: 'United Way of Robeson County'
  },
  {
    id: '5',
    title: 'Senior Citizens Bingo Night',
    date: new Date(2025, 7, 15),
    time: '6:00 PM - 8:00 PM',
    location: 'Pembroke Senior Center',
    description: 'Join us for bingo, refreshments, and prizes!',
    category: 'Recreation',
    organizer: 'Pembroke Senior Center'
  }
];

export default function EventsPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    title: '',
    date: new Date(),
    time: '',
    location: '',
    description: '',
    category: 'Community Service',
    organizer: ''
  });

  // Check if admin on component mount
  useEffect(() => {
    const adminStatus = sessionStorage.getItem('calendarAdmin');
    if (adminStatus === 'true') {
      setIsAdmin(true);
    }
  }, []);

  const handleLogin = () => {
    // For GitHub Pages deployment, we use a hardcoded password
    // since environment variables aren't supported
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

  const handleSubmitEvent = () => {
    // In a real app, this would save to a database
    console.log('New event submitted:', newEvent);
    // For now, just close the modal
    setShowEventModal(false);
    // Reset form
    setNewEvent({
      title: '',
      date: new Date(),
      time: '',
      location: '',
      description: '',
      category: 'Community Service',
      organizer: ''
    });
    // Show success message
    alert('Event submitted successfully! In production, this would be saved to a database.');
  };

  const categories = ['all', 'Community Service', 'Health', 'Career', 'Education', 'Recreation'];

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getEventsForDate = (date: Date) => {
    return mockEvents.filter(event => 
      event.date.getDate() === date.getDate() &&
      event.date.getMonth() === date.getMonth() &&
      event.date.getFullYear() === date.getFullYear() &&
      (selectedCategory === 'all' || event.category === selectedCategory)
    );
  };

  const filteredEvents = selectedCategory === 'all' 
    ? mockEvents 
    : mockEvents.filter(event => event.category === selectedCategory);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-20 pb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Community Events</h1>
        <p className="text-gray-600 mb-6">Stay connected with what's happening in Robeson County</p>

        {/* Category Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Category:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Calendar View */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Previous month"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="text-xl font-bold text-gray-800">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h2>
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Next month"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: getFirstDayOfMonth(currentMonth) }).map((_, index) => (
                <div key={`empty-${index}`} className="aspect-square" />
              ))}
              
              {Array.from({ length: getDaysInMonth(currentMonth) }).map((_, index) => {
                const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), index + 1);
                const events = getEventsForDate(date);
                const isSelected = selectedDate?.getDate() === date.getDate() &&
                                 selectedDate?.getMonth() === date.getMonth() &&
                                 selectedDate?.getFullYear() === date.getFullYear();
                
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedDate(date)}
                    className={`aspect-square p-1 rounded-lg border transition-colors relative ${
                      isSelected 
                        ? 'bg-blue-500 text-white border-blue-500' 
                        : events.length > 0
                          ? 'bg-blue-50 hover:bg-blue-100 border-blue-200'
                          : 'hover:bg-gray-50 border-gray-200'
                    }`}
                  >
                    <span className="text-sm">{index + 1}</span>
                    {events.length > 0 && !isSelected && (
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                        <div className="w-1 h-1 bg-blue-500 rounded-full" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Event List */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {selectedDate 
                ? `Events on ${selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`
                : 'Upcoming Events'
              }
            </h2>
            
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {(selectedDate ? getEventsForDate(selectedDate) : filteredEvents).map(event => (
                <div key={event.id} className="border-l-4 border-blue-500 pl-4 py-3">
                  <h3 className="font-semibold text-gray-800">{event.title}</h3>
                  <p className="text-sm text-gray-600">{event.time}</p>
                  <p className="text-sm text-gray-600">{event.location}</p>
                  <p className="text-sm text-gray-700 mt-1">{event.description}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      {event.category}
                    </span>
                    <span className="text-xs text-gray-500">By {event.organizer}</span>
                  </div>
                </div>
              ))}
              
              {(selectedDate && getEventsForDate(selectedDate).length === 0) && (
                <p className="text-gray-500 text-center py-8">No events scheduled for this date.</p>
              )}
              
              {(!selectedDate && filteredEvents.length === 0) && (
                <p className="text-gray-500 text-center py-8">No events found for the selected category.</p>
              )}
            </div>
          </div>
        </div>

        {/* Add Event CTA */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6 text-center">
          {isAdmin ? (
            <div>
              <p className="text-gray-700 mb-3">Logged in as admin</p>
              <div className="flex gap-3 justify-center">
                <button 
                  onClick={() => setShowEventModal(true)}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Submit an Event
                </button>
                <button 
                  onClick={handleLogout}
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-gray-700 mb-3">Are you an authorized event coordinator?</p>
              <button 
                onClick={() => setShowLoginModal(true)}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Admin Login
              </button>
            </>
          )}
        </div>

        {/* Login Modal */}
        {showLoginModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h2 className="text-xl font-bold mb-4">Admin Login</h2>
              <p className="text-gray-600 mb-4">Enter the admin password to submit events</p>
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

        {/* Event Submission Modal */}
        {showEventModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full my-8">
              <h2 className="text-xl font-bold mb-4">Submit New Event</h2>
              
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
                      value={newEvent.date?.toISOString().split('T')[0]}
                      onChange={(e) => setNewEvent({...newEvent, date: new Date(e.target.value)})}
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
                    {categories.filter(cat => cat !== 'all').map(category => (
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
                  onClick={() => setShowEventModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitEvent}
                  disabled={!newEvent.title || !newEvent.time || !newEvent.location || !newEvent.organizer || !newEvent.description}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Submit Event
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}