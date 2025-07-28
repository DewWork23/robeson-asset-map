'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { Organization } from '@/types/organization';
import { supabase, OrganizationRecord, EventRecord } from '@/lib/supabase';
import { useOrganizations } from '@/contexts/OrganizationsContext';

export default function AdminDashboard() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<'organizations' | 'events'>('organizations');
  
  // Organizations state
  const { organizations, refetch } = useOrganizations();
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [editingOrg, setEditingOrg] = useState<Partial<Organization>>({});
  const [searchTerm, setSearchTerm] = useState('');
  
  // Events state
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Partial<EventRecord>>({});
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Check if admin on component mount
  useEffect(() => {
    const adminStatus = sessionStorage.getItem('isAdmin');
    if (adminStatus === 'true') {
      setIsAdmin(true);
    } else {
      setShowLoginModal(true);
    }
  }, []);

  // Load events when events tab is active
  useEffect(() => {
    if (activeTab === 'events' && isAdmin) {
      loadEvents();
    }
  }, [activeTab, isAdmin]);

  const loadEvents = async () => {
    setLoadingEvents(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });
      
      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoadingEvents(false);
    }
  };

  const handleLogin = () => {
    const ADMIN_PASSWORD = 'SPARC';
    
    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      sessionStorage.setItem('isAdmin', 'true');
      sessionStorage.setItem('calendarAdmin', 'true'); // For events compatibility
      setShowLoginModal(false);
      setPassword('');
      setLoginError('');
    } else {
      setLoginError('Invalid password');
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    sessionStorage.removeItem('isAdmin');
    sessionStorage.removeItem('calendarAdmin');
    router.push('/');
  };

  const handleOrgEdit = (org: Organization) => {
    setSelectedOrg(org);
    setEditingOrg({
      organizationName: org.organizationName,
      category: org.category,
      serviceType: org.serviceType,
      address: org.address,
      phone: org.phone,
      email: org.email,
      website: org.website,
      hours: org.hours,
      servicesOffered: org.servicesOffered,
      costPayment: org.costPayment,
      description: org.description,
      crisisService: org.crisisService,
      languages: org.languages,
      specialNotes: org.specialNotes,
      latitude: org.latitude,
      longitude: org.longitude
    });
  };

  const handleOrgUpdate = async () => {
    if (!editingOrg) return;

    try {
      if (selectedOrg) {
        // Update existing organization
        const { error } = await supabase
          .from('organizations')
          .update({
            organization_name: editingOrg.organizationName,
            category: editingOrg.category,
            service_type: editingOrg.serviceType,
            address: editingOrg.address,
            phone: editingOrg.phone,
            email: editingOrg.email,
            website: editingOrg.website,
            hours: editingOrg.hours,
            services_offered: editingOrg.servicesOffered,
            cost_payment: editingOrg.costPayment,
            description: editingOrg.description,
            crisis_service: editingOrg.crisisService,
            languages: editingOrg.languages,
            special_notes: editingOrg.specialNotes,
            latitude: editingOrg.latitude,
            longitude: editingOrg.longitude,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedOrg.id);

        if (error) throw error;
        alert('Organization updated successfully!');
      } else {
        // Create new organization
        const { error } = await supabase
          .from('organizations')
          .insert({
            organization_name: editingOrg.organizationName,
            category: editingOrg.category || 'Other',
            service_type: editingOrg.serviceType,
            address: editingOrg.address,
            phone: editingOrg.phone,
            email: editingOrg.email,
            website: editingOrg.website,
            hours: editingOrg.hours,
            services_offered: editingOrg.servicesOffered,
            cost_payment: editingOrg.costPayment,
            description: editingOrg.description,
            crisis_service: editingOrg.crisisService || false,
            languages: editingOrg.languages,
            special_notes: editingOrg.specialNotes,
            latitude: editingOrg.latitude,
            longitude: editingOrg.longitude
          });

        if (error) throw error;
        alert('Organization created successfully!');
      }

      setSelectedOrg(null);
      setEditingOrg({});
      await refetch();
    } catch (error) {
      console.error('Error saving organization:', error);
      alert('Failed to save organization');
    }
  };

  const handleOrgDelete = async (orgId: string) => {
    if (!confirm('Are you sure you want to delete this organization?')) return;

    try {
      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', orgId);

      if (error) throw error;
      
      alert('Organization deleted successfully!');
      await refetch();
    } catch (error) {
      console.error('Error deleting organization:', error);
      alert('Failed to delete organization');
    }
  };

  const handleEventDelete = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
      
      await loadEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event');
    }
  };

  const handleEventEdit = (event: EventRecord) => {
    setSelectedEventId(event.id);
    setEditingEvent({
      title: event.title,
      date: event.date,
      end_date: event.end_date,
      start_time: event.start_time,
      end_time: event.end_time,
      location: event.location,
      description: event.description,
      category: event.category,
      organizer: event.organizer,
      contact_email: event.contact_email,
      contact_phone: event.contact_phone,
      link: event.link
    });
    setIsEditingEvent(true);
    setShowEventModal(true);
  };

  const handleEventSave = async () => {
    try {
      if (isEditingEvent && selectedEventId) {
        // Update existing event
        const { error } = await supabase
          .from('events')
          .update({
            title: editingEvent.title,
            date: editingEvent.date,
            end_date: editingEvent.end_date,
            start_time: editingEvent.start_time,
            end_time: editingEvent.end_time,
            location: editingEvent.location,
            description: editingEvent.description,
            category: editingEvent.category,
            organizer: editingEvent.organizer,
            contact_email: editingEvent.contact_email,
            contact_phone: editingEvent.contact_phone,
            link: editingEvent.link,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedEventId);

        if (error) throw error;
        alert('Event updated successfully!');
      } else {
        // Create new event
        const { error } = await supabase
          .from('events')
          .insert({
            title: editingEvent.title,
            date: editingEvent.date,
            end_date: editingEvent.end_date || editingEvent.date,
            start_time: editingEvent.start_time || '9:00 AM',
            end_time: editingEvent.end_time || '10:00 AM',
            location: editingEvent.location,
            description: editingEvent.description,
            category: editingEvent.category || 'Community Service',
            organizer: editingEvent.organizer,
            contact_email: editingEvent.contact_email,
            contact_phone: editingEvent.contact_phone,
            link: editingEvent.link
          });

        if (error) throw error;
        alert('Event created successfully!');
      }

      setShowEventModal(false);
      setEditingEvent({});
      setIsEditingEvent(false);
      setSelectedEventId(null);
      await loadEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Failed to save event');
    }
  };

  const filteredOrgs = organizations.filter(org =>
    org.organizationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Debug logging only in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Organizations count:', organizations.length);
    console.log('Filtered organizations count:', filteredOrgs.length);
  }

  if (!isAdmin) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen bg-gray-50 pt-20">
          {/* Login Modal */}
          {showLoginModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h2 className="text-xl font-bold mb-4">Admin Login</h2>
                <p className="text-gray-600 mb-4">Enter the admin password to access the dashboard</p>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  className="w-full px-4 py-2 border rounded-lg mb-4"
                  autoFocus
                />
                {loginError && (
                  <p className="text-red-500 text-sm mb-4">{loginError}</p>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={handleLogin}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => router.push('/')}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
              >
                Logout
              </button>
            </div>
            
            {/* Tab Navigation */}
            <div className="flex gap-4 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('organizations')}
                className={`pb-2 px-1 font-medium transition-colors ${
                  activeTab === 'organizations'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Organizations
              </button>
              <button
                onClick={() => setActiveTab('events')}
                className={`pb-2 px-1 font-medium transition-colors ${
                  activeTab === 'events'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Events
              </button>
            </div>
          </div>

          {/* Organizations Tab */}
          {activeTab === 'organizations' && (
            <div>
              {/* Search Bar and Add Button */}
              <div className="mb-6 flex gap-4">
                <input
                  type="text"
                  placeholder="Search organizations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-4 py-2 border rounded-lg"
                />
                <button
                  onClick={() => {
                    setSelectedOrg(null);
                    setEditingOrg({
                      organizationName: '',
                      category: 'Other',
                      serviceType: '',
                      address: '',
                      phone: '',
                      email: '',
                      website: '',
                      hours: '',
                      servicesOffered: '',
                      costPayment: '',
                      description: '',
                      crisisService: false,
                      languages: '',
                      specialNotes: ''
                    });
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Add Organization
                </button>
              </div>

              {/* Organizations List */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Organization
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Address
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Phone
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredOrgs.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                            No organizations found. Click "Add Organization" to create one.
                          </td>
                        </tr>
                      ) : (
                        filteredOrgs.map((org) => {
                          try {
                            return (
                              <tr key={org.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {org.organizationName}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {org.category}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                  {org.address}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {org.phone}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  <div className="flex gap-3">
                                    <button
                                      onClick={() => {
                                        console.log('Edit clicked for org:', org.id, org.organizationName);
                                        handleOrgEdit(org);
                                      }}
                                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => {
                                        console.log('Delete clicked for org:', org.id, org.organizationName);
                                        handleOrgDelete(org.id);
                                      }}
                                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          } catch (error) {
                            console.error('Error rendering org row:', org.id, error);
                            return null;
                          }
                        }))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Events Tab */}
          {activeTab === 'events' && (
            <div>
              <div className="mb-4 flex justify-between items-center">
                <h2 className="text-xl font-semibold">Manage Events</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingEvent({
                        title: '',
                        date: new Date().toISOString().split('T')[0],
                        end_date: new Date().toISOString().split('T')[0],
                        start_time: '9:00 AM',
                        end_time: '10:00 AM',
                        location: '',
                        description: '',
                        category: 'Community Service',
                        organizer: ''
                      });
                      setIsEditingEvent(false);
                      setShowEventModal(true);
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    Add Event
                  </button>
                  <Link
                    href="/events"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Go to Calendar
                  </Link>
                </div>
              </div>
              
              {loadingEvents ? (
                <div className="text-center py-8">Loading events...</div>
              ) : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Title
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Location
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Category
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Time
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {events.map((event) => (
                          <tr key={event.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(event.date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                              {event.title}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {event.location}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {event.category}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {event.start_time} - {event.end_time}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex gap-3">
                                <button
                                  onClick={() => handleEventEdit(event)}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleEventDelete(event.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Edit Organization Modal */}
        {(selectedOrg || (!selectedOrg && editingOrg.organizationName !== undefined)) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">{selectedOrg ? 'Edit Organization' : 'Add Organization'}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Organization Name</label>
                  <input
                    type="text"
                    value={editingOrg.organizationName || ''}
                    onChange={(e) => setEditingOrg({...editingOrg, organizationName: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    value={editingOrg.category || ''}
                    onChange={(e) => setEditingOrg({...editingOrg, category: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Select a category</option>
                    <option value="Crisis Services">Crisis Services</option>
                    <option value="Food Services">Food Services</option>
                    <option value="Housing Services">Housing Services</option>
                    <option value="Healthcare Services">Healthcare Services</option>
                    <option value="Mental Health & Substance Use">Mental Health & Substance Use</option>
                    <option value="Government Services">Government Services</option>
                    <option value="Tribal Services">Tribal Services</option>
                    <option value="Community Services">Community Services</option>
                    <option value="Community Groups & Development">Community Groups & Development</option>
                    <option value="Faith-Based Services">Faith-Based Services</option>
                    <option value="Legal Services">Legal Services</option>
                    <option value="Law Enforcement">Law Enforcement</option>
                    <option value="Education">Education</option>
                    <option value="Pharmacy">Pharmacy</option>
                    <option value="Cultural & Information Services">Cultural & Information Services</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Address</label>
                  <input
                    type="text"
                    value={editingOrg.address || ''}
                    onChange={(e) => setEditingOrg({...editingOrg, address: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input
                    type="text"
                    value={editingOrg.phone || ''}
                    onChange={(e) => setEditingOrg({...editingOrg, phone: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={editingOrg.email || ''}
                    onChange={(e) => setEditingOrg({...editingOrg, email: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Website</label>
                  <input
                    type="text"
                    value={editingOrg.website || ''}
                    onChange={(e) => setEditingOrg({...editingOrg, website: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Hours</label>
                  <input
                    type="text"
                    value={editingOrg.hours || ''}
                    onChange={(e) => setEditingOrg({...editingOrg, hours: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Services Offered</label>
                  <textarea
                    value={editingOrg.servicesOffered || ''}
                    onChange={(e) => setEditingOrg({...editingOrg, servicesOffered: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={3}
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={editingOrg.description || ''}
                    onChange={(e) => setEditingOrg({...editingOrg, description: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    <input
                      type="checkbox"
                      checked={editingOrg.crisisService || false}
                      onChange={(e) => setEditingOrg({...editingOrg, crisisService: e.target.checked})}
                      className="mr-2"
                    />
                    Crisis Service
                  </label>
                </div>
              </div>
              
              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleOrgUpdate}
                  disabled={!editingOrg.organizationName || !editingOrg.category || !editingOrg.address}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {selectedOrg ? 'Save Changes' : 'Create Organization'}
                </button>
                <button
                  onClick={() => {
                    setSelectedOrg(null);
                    setEditingOrg({});
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Event Modal */}
        {showEventModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">{isEditingEvent ? 'Edit Event' : 'Add Event'}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    type="text"
                    value={editingEvent.title || ''}
                    onChange={(e) => setEditingEvent({...editingEvent, title: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    value={editingEvent.category || 'Community Service'}
                    onChange={(e) => setEditingEvent({...editingEvent, category: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="Community Service">Community Service</option>
                    <option value="Health">Health</option>
                    <option value="Career">Career</option>
                    <option value="Education">Education</option>
                    <option value="Recreation">Recreation</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date</label>
                  <input
                    type="date"
                    value={editingEvent.date || ''}
                    onChange={(e) => setEditingEvent({...editingEvent, date: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">End Date</label>
                  <input
                    type="date"
                    value={editingEvent.end_date || editingEvent.date || ''}
                    onChange={(e) => setEditingEvent({...editingEvent, end_date: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Start Time</label>
                  <input
                    type="text"
                    value={editingEvent.start_time || '9:00 AM'}
                    onChange={(e) => setEditingEvent({...editingEvent, start_time: e.target.value})}
                    placeholder="9:00 AM"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">End Time</label>
                  <input
                    type="text"
                    value={editingEvent.end_time || '10:00 AM'}
                    onChange={(e) => setEditingEvent({...editingEvent, end_time: e.target.value})}
                    placeholder="10:00 AM"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <input
                    type="text"
                    value={editingEvent.location || ''}
                    onChange={(e) => setEditingEvent({...editingEvent, location: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Organizer</label>
                  <input
                    type="text"
                    value={editingEvent.organizer || ''}
                    onChange={(e) => setEditingEvent({...editingEvent, organizer: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Link (Optional)</label>
                  <input
                    type="url"
                    value={editingEvent.link || ''}
                    onChange={(e) => setEditingEvent({...editingEvent, link: e.target.value})}
                    placeholder="https://example.com"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={editingEvent.description || ''}
                    onChange={(e) => setEditingEvent({...editingEvent, description: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={4}
                    required
                  />
                </div>
              </div>
              
              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleEventSave}
                  disabled={!editingEvent.title || !editingEvent.date || !editingEvent.location || !editingEvent.organizer || !editingEvent.description}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isEditingEvent ? 'Update Event' : 'Add Event'}
                </button>
                <button
                  onClick={() => {
                    setShowEventModal(false);
                    setEditingEvent({});
                    setIsEditingEvent(false);
                    setSelectedEventId(null);
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}