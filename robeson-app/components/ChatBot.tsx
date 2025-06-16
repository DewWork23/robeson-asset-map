'use client';

import { useState, useRef, useEffect } from 'react';
import { Organization } from '@/types/organization';

interface ChatBotProps {
  organizations: Organization[];
  viewMode?: 'list' | 'map';
  onCategorySelect?: (category: string | null) => void;
  onViewModeChange?: (mode: 'list' | 'map') => void;
}

interface Message {
  id: string;
  text?: string;
  isBot: boolean;
  timestamp: Date;
  component?: React.ReactNode;
}

export default function ChatBot({ organizations, viewMode = 'list', onCategorySelect, onViewModeChange }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [hideHelpButton, setHideHelpButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const lastBotMessageRef = useRef<HTMLDivElement>(null);

  // Check if device is mobile
  const isMobile = () => {
    return window.innerWidth <= 768;
  };

  // Handle map category selection
  const handleMapCategorySelect = (category: string | null) => {
    if (onCategorySelect) {
      // Use 'All' instead of null to show all categories
      onCategorySelect(category === null ? 'All' : category);
      // Close chat on mobile when selecting a map filter
      if (isMobile()) {
        setIsOpen(false);
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToLastBotMessage = () => {
    if (lastBotMessageRef.current) {
      lastBotMessageRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    // Check if the last message is a bot message with a component (resource list)
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.isBot && lastMessage.component) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        scrollToLastBotMessage();
      }, 100);
    } else {
      scrollToBottom();
    }
  }, [messages]);

  const handleQuickOption = (option: string) => {
    const optionText = {
      crisis: '🚨 I need crisis help',
      food: '🍽️ I need food assistance',
      housing: '🏠 I need housing help',
      treatment: '💊 I need treatment services',
      jobs: '💼 I need job resources',
      healthcare: '🏥 I need healthcare services',
      government: '🏛️ I need government services',
      tribal: '🪶 I need tribal services',
      community: '🏘️ I need community services',
      faith: '⛪ I need faith-based services',
      legal: '⚖️ I need legal services',
      education: '📚 I need education resources',
      pharmacy: '💊 I need pharmacy services',
      other: '❓ I need other help'
    }[option] || option;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: optionText,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    setTimeout(() => {
      const botResponse = generateResponse(option, organizations);
      setMessages(prev => [...prev, botResponse]);
    }, 500);
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Process user input and generate response
    setTimeout(() => {
      const botResponse = generateResponse(inputValue.toLowerCase(), organizations);
      setMessages(prev => [...prev, botResponse]);
    }, 500);
  };

  const formatPhoneForTel = (phone: string) => {
    return phone.replace(/\D/g, '');
  };

  const getDirectionsUrl = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    return `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
  };

  // Helper function to prioritize crisis organizations by physical safety
  const getCrisisPriority = (org: Organization): number => {
    const name = org.organizationName.toLowerCase();
    
    // Highest priority - immediate life-threatening situations
    if (name.includes('suicide prevention') || name === 'suicide prevention hotline') return 1;
    if (name.includes('crisis text line')) return 2;
    if (name.includes('crisis intervention')) return 3;
    
    // Emergency medical services
    if (name.includes('unc health southeastern')) return 4;
    
    // Law enforcement (for immediate physical danger) - prioritize Sheriff's Office
    if (name.includes('sheriff')) return 5;
    if (name.includes('police department')) return 20; // Lower priority for local PDs
    
    // Domestic/sexual violence (immediate safety concerns)
    if (name.includes('domestic violence')) return 6;
    if (name.includes('sexual assault')) return 7;
    
    // Mental health crisis services
    if (name.includes('southeastern integrated care')) return 8;
    if (name.includes('life net services')) return 9;
    if (name.includes('monarch')) return 10;
    if (name.includes('carter clinic')) return 11;
    
    // Substance abuse treatment (urgent but not immediate crisis)
    if (name.includes('lumberton treatment center')) return 12;
    if (name.includes('harm reduction')) return 13;
    if (name.includes('breeches buoy')) return 14;
    if (name.includes('tae\'s pathway')) return 15;
    
    // Support services and other crisis resources
    if (name.includes('stop the pain')) return 16;
    if (name.includes('hope alive')) return 17;
    if (name.includes('christian recovery')) return 18;
    
    // Other crisis services
    return 19;
  };

  const generateResponse = (input: string, orgs: Organization[]): Message => {
    let component: React.ReactNode = null;

    // Check if user is asking about map functionality
    if (viewMode === 'map' && (input.includes('map') || input.includes('show') || input.includes('where'))) {
      component = (
        <div>
          <p className="mb-3">I can help you navigate the map! Here are some things I can do:</p>
          <div className="space-y-2">
            <button
              onClick={() => handleMapCategorySelect('Crisis Services')}
              className="w-full p-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-sm font-medium transition-colors text-left"
            >
              🚨 Show Crisis Services on map
            </button>
            <button
              onClick={() => handleMapCategorySelect('Community Services')}
              className="w-full p-2 bg-green-100 hover:bg-green-200 text-green-800 rounded-lg text-sm font-medium transition-colors text-left"
            >
              🍽️ Show Community Services (includes food)
            </button>
            <button
              onClick={() => handleMapCategorySelect('Mental Health & Substance Use')}
              className="w-full p-2 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg text-sm font-medium transition-colors text-left"
            >
              💊 Show Mental Health & Substance Use services
            </button>
            <button
              onClick={() => handleMapCategorySelect('Housing Services')}
              className="w-full p-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg text-sm font-medium transition-colors text-left"
            >
              🏠 Show Housing Services
            </button>
            <button
              onClick={() => handleMapCategorySelect(null)}
              className="w-full p-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm font-medium transition-colors text-left"
            >
              🗺️ Show all locations
            </button>
          </div>
          <p className="mt-3 text-sm text-gray-600">The map will zoom to show only the selected category.</p>
        </div>
      );
    }
    // Check for crisis keywords
    else if (input === 'crisis' || input.includes('crisis') || input.includes('emergency') || input.includes('help now') || input.includes('suicide')) {
      // Get crisis organizations and sort by priority
      const crisisOrgs = orgs
        .filter(org => org.crisisService)
        .sort((a, b) => getCrisisPriority(a) - getCrisisPriority(b))
        .slice(0, 5); // Show top 5 priority crisis services
      component = (
        <div>
          <p className="font-medium mb-3">I understand you need immediate help. Here are 24/7 crisis services:</p>
          <div className="space-y-2 mb-3">
            {/* 911 Emergency Alert */}
            <div className="p-3 bg-red-700 text-white rounded-lg border-2 border-red-800">
              <p className="font-bold text-lg flex items-center gap-2">
                <span className="text-xl">🚨</span> Life-Threatening Emergency?
              </p>
              <a href="tel:911" className="inline-block mt-2 px-6 py-3 bg-white text-red-700 rounded-lg font-bold hover:bg-gray-100 text-lg">
                Call 911 Immediately
              </a>
            </div>
            
            {/* 988 Mental Health Crisis */}
            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <p className="font-bold text-red-800">💙 Mental Health Crisis Hotline</p>
              <a href="tel:988" className="inline-block mt-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700">
                Call or Text 988
              </a>
            </div>
            {viewMode === 'map' && (
              <div className="space-y-2">
                <button
                  onClick={() => handleMapCategorySelect('Crisis Services')}
                  className="w-full p-3 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg font-medium transition-colors border border-red-300"
                >
                  📍 Show all crisis services on map
                </button>
                <button
                  onClick={() => handleMapCategorySelect(null)}
                  className="w-full p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                >
                  🗺️ Show all categories
                </button>
              </div>
            )}
            {/* Priority Crisis Services */}
            <p className="text-sm font-semibold text-gray-700 mt-2">Priority services for immediate help:</p>
            {crisisOrgs.map(org => (
              <div key={org.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="font-medium text-gray-900">{org.organizationName}</p>
                <p className="text-sm text-gray-600 mt-1">{org.serviceType}</p>
                <p className="text-sm text-gray-600">{org.address}</p>
                <div className="flex gap-2 mt-2">
                  {org.phone && (
                    <a 
                      href={`tel:${formatPhoneForTel(org.phone)}`} 
                      className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                    >
                      Call {org.phone}
                    </a>
                  )}
                  <a 
                    href={getDirectionsUrl(org.address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                  >
                    📍 Directions
                  </a>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-700">Please reach out for help. You're not alone.</p>
        </div>
      );
    }
    // Check for specific service types
    else if (input === 'food' || input.includes('food') || input.includes('hungry') || input.includes('meal')) {
      const foodOrgs = orgs.filter(org => {
        const name = org.organizationName.toLowerCase();
        const services = org.servicesOffered.toLowerCase();
        const serviceType = org.serviceType.toLowerCase();
        
        // Exclude support groups and other non-food services
        if (serviceType.includes('support group') || name.includes('anonymous') || name.includes('al-anon')) {
          return false;
        }
        
        // Include organizations that specifically mention food services
        return services.includes('food') ||
               services.includes('meal') ||
               services.includes('pantry') ||
               services.includes('kitchen') ||
               services.includes('nutrition') ||
               services.includes('feeding') ||
               name.includes('food bank') ||
               name.includes('soup kitchen');
      }).slice(0, 5);
      component = (
        <div>
          <p className="font-medium mb-3">Here are resources for food assistance:</p>
          {viewMode === 'map' && (
            <div className="space-y-2 mb-3">
              <button
                onClick={() => handleMapCategorySelect('Community Services')}
                className="w-full p-3 bg-green-100 hover:bg-green-200 text-green-800 rounded-lg font-medium transition-colors border border-green-300"
              >
                📍 Show all community services on map
              </button>
              <button
                onClick={() => handleMapCategorySelect(null)}
                className="w-full p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                🗺️ Show all categories
              </button>
            </div>
          )}
          <div className="space-y-2">
            {foodOrgs.length > 0 ? (
              foodOrgs.map(org => (
                <div key={org.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="font-medium text-gray-900">{org.organizationName}</p>
                  <p className="text-sm text-gray-600 mt-1">{org.serviceType}</p>
                  <p className="text-sm text-gray-600">{org.address}</p>
                  <div className="flex gap-2 mt-2">
                    {org.phone && (
                      <a 
                        href={`tel:${formatPhoneForTel(org.phone)}`} 
                        className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                      >
                        Call {org.phone}
                      </a>
                    )}
                    <a 
                      href={getDirectionsUrl(org.address)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                    >
                      📍 Directions
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-600">No food assistance resources found. Try searching for "Community Services" or contact 2-1-1 for help.</p>
            )}
          </div>
        </div>
      );
    }
    else if (input === 'housing' || input.includes('housing') || input.includes('shelter') || input.includes('homeless')) {
      const housingOrgs = orgs.filter(org => {
        const services = org.servicesOffered.toLowerCase();
        const name = org.organizationName.toLowerCase();
        const category = org.category;
        
        return category === 'Housing Services' ||
               services.includes('shelter') ||
               services.includes('housing') ||
               services.includes('homeless') ||
               services.includes('transitional housing') ||
               services.includes('emergency housing') ||
               services.includes('rental assistance') ||
               name.includes('housing authority') ||
               name.includes('shelter');
      }).slice(0, 5);
      component = (
        <div>
          <p className="font-medium mb-3">Here are housing and shelter resources:</p>
          {viewMode === 'map' && (
            <div className="space-y-2 mb-3">
              <button
                onClick={() => handleMapCategorySelect('Housing Services')}
                className="w-full p-3 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg font-medium transition-colors border border-blue-300"
              >
                📍 Show all housing locations on map
              </button>
              <button
                onClick={() => handleMapCategorySelect(null)}
                className="w-full p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                🗺️ Show all categories
              </button>
            </div>
          )}
          <div className="space-y-2">
            {housingOrgs.length > 0 ? (
              housingOrgs.map(org => (
                <div key={org.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="font-medium text-gray-900">{org.organizationName}</p>
                  <p className="text-sm text-gray-600 mt-1">{org.serviceType}</p>
                  <p className="text-sm text-gray-600">{org.address}</p>
                  <div className="flex gap-2 mt-2">
                    {org.phone && (
                      <a 
                        href={`tel:${formatPhoneForTel(org.phone)}`} 
                        className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                      >
                        Call {org.phone}
                      </a>
                    )}
                    <a 
                      href={getDirectionsUrl(org.address)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                    >
                      📍 Directions
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-600">No housing resources found. Contact the Robeson County Housing Authority at (910) 738-4866 or dial 2-1-1 for assistance.</p>
            )}
          </div>
        </div>
      );
    }
    else if (input === 'treatment' || input.includes('treatment') || input.includes('addiction') || input.includes('substance')) {
      const treatmentOrgs = orgs.filter(org => {
        const services = org.servicesOffered.toLowerCase();
        const name = org.organizationName.toLowerCase();
        const serviceType = org.serviceType.toLowerCase();
        
        // Direct category match for Mental Health & Substance Use
        if (org.category === 'Mental Health & Substance Use' && 
            (services.includes('treatment') || 
             services.includes('therapy') ||
             services.includes('counseling'))) {
          return true;
        }
        
        // Include crisis services that are mental health/substance related
        if (org.crisisService && org.category === 'Crisis Services') {
          const mentalHealthServiceTypes = [
            'Mental Health Services', 'Substance Abuse Treatment', 'Mental Health/Addiction',
            'Mental Health/Developmental Services', 'Mental Health/Substance Abuse',
            'Addiction Medicine', 'Behavioral Health/Medical', 'Behavioral Health/Peer Support',
            'Opioid Treatment', 'Opioid Recovery', 'Substance Abuse Prevention/Recovery',
            'Substance Use Prevention/Recovery', 'Youth Substance Abuse Prevention',
            'Therapeutic Foster Care/Behavioral Health'
          ];
          return mentalHealthServiceTypes.includes(org.serviceType);
        }
        
        // General service matching
        return services.includes('substance abuse treatment') ||
               services.includes('addiction treatment') ||
               services.includes('detox') ||
               services.includes('rehabilitation') ||
               services.includes('methadone') ||
               services.includes('suboxone') ||
               serviceType.includes('treatment') ||
               name.includes('treatment center') ||
               name.includes('recovery center');
      }).slice(0, 5);
      component = (
        <div>
          <p className="font-medium mb-3">Here are treatment and recovery resources:</p>
          {viewMode === 'map' && (
            <div className="space-y-2 mb-3">
              <button
                onClick={() => handleMapCategorySelect('Mental Health & Substance Use')}
                className="w-full p-3 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg font-medium transition-colors border border-purple-300"
              >
                📍 Show all mental health & substance use services on map
              </button>
              <button
                onClick={() => handleMapCategorySelect(null)}
                className="w-full p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                🗺️ Show all categories
              </button>
            </div>
          )}
          <div className="space-y-2">
            {treatmentOrgs.length > 0 ? (
              treatmentOrgs.map(org => (
                <div key={org.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="font-medium text-gray-900">{org.organizationName}</p>
                  <p className="text-sm text-gray-600 mt-1">{org.serviceType}</p>
                  <p className="text-sm text-gray-600">{org.address}</p>
                  <div className="flex gap-2 mt-2">
                    {org.phone && (
                      <a 
                        href={`tel:${formatPhoneForTel(org.phone)}`} 
                        className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                      >
                        Call {org.phone}
                      </a>
                    )}
                    <a 
                      href={getDirectionsUrl(org.address)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                    >
                      📍 Directions
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-600">No treatment resources found. For immediate help, call the Crisis Intervention line at (800) 939-5911.</p>
            )}
          </div>
        </div>
      );
    }
    else if (input === 'jobs' || input.includes('job') || input.includes('work') || input.includes('employment')) {
      const jobOrgs = orgs.filter(org => {
        const services = org.servicesOffered.toLowerCase();
        const name = org.organizationName.toLowerCase();
        
        return services.includes('job') ||
               services.includes('employment') ||
               services.includes('workforce') ||
               services.includes('career') ||
               services.includes('vocational') ||
               services.includes('job training') ||
               services.includes('job placement') ||
               name.includes('ncworks') ||
               name.includes('employment') ||
               name.includes('workforce');
      }).slice(0, 5);
      component = (
        <div>
          <p className="font-medium mb-3">Here are job and employment resources:</p>
          {viewMode === 'map' && (
            <div className="space-y-2 mb-3">
              <button
                onClick={() => handleMapCategorySelect('Community Services')}
                className="w-full p-3 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-lg font-medium transition-colors border border-yellow-300"
              >
                📍 Show all community services on map
              </button>
              <button
                onClick={() => handleMapCategorySelect(null)}
                className="w-full p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                🗺️ Show all categories
              </button>
            </div>
          )}
          <div className="space-y-2">
            {jobOrgs.length > 0 ? (
              jobOrgs.map(org => (
                <div key={org.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="font-medium text-gray-900">{org.organizationName}</p>
                  <p className="text-sm text-gray-600 mt-1">{org.serviceType}</p>
                  <p className="text-sm text-gray-600">{org.address}</p>
                  <div className="flex gap-2 mt-2">
                    {org.phone && (
                      <a 
                        href={`tel:${formatPhoneForTel(org.phone)}`} 
                        className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                      >
                        Call {org.phone}
                      </a>
                    )}
                    <a 
                      href={getDirectionsUrl(org.address)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                    >
                      📍 Directions
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-600">No job resources found. Contact NCWorks Career Center at (910) 618-5627 or visit their office.</p>
            )}
          </div>
        </div>
      );
    }
    // Healthcare category
    else if (input === 'healthcare' || input.includes('healthcare') || input.includes('medical') || input.includes('health')) {
      const healthcareOrgs = orgs.filter(org => {
        // Exclude support groups regardless of category
        const serviceType = org.serviceType.toLowerCase();
        if (serviceType.includes('support group')) {
          return false;
        }
        
        // Direct category match
        if (org.category === 'Healthcare Services') return true;
        
        // Include crisis services that are healthcare-related
        if (org.crisisService && org.category === 'Crisis Services') {
          const healthcareServiceTypes = [
            'Hospital/Medical Services',
            'Healthcare',
            'Medical Services',
            'Comprehensive Health Services',
            'Integrated Healthcare',
            'Public Health Services'
          ];
          return healthcareServiceTypes.includes(org.serviceType);
        }
        
        return false;
      }).slice(0, 5);
      component = (
        <div>
          <p className="font-medium mb-3">Here are healthcare resources:</p>
          {viewMode === 'map' && (
            <div className="space-y-2 mb-3">
              <button
                onClick={() => handleMapCategorySelect('Healthcare Services')}
                className="w-full p-3 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg font-medium transition-colors border border-emerald-300"
              >
                📍 Show all healthcare services on map
              </button>
              <button
                onClick={() => handleMapCategorySelect(null)}
                className="w-full p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                🗺️ Show all categories
              </button>
            </div>
          )}
          <div className="space-y-2">
            {healthcareOrgs.length > 0 ? (
              healthcareOrgs.map(org => (
                <div key={org.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="font-medium text-gray-900">{org.organizationName}</p>
                  <p className="text-sm text-gray-600 mt-1">{org.serviceType}</p>
                  <p className="text-sm text-gray-600">{org.address}</p>
                  <div className="flex gap-2 mt-2">
                    {org.phone && (
                      <a 
                        href={`tel:${formatPhoneForTel(org.phone)}`} 
                        className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                      >
                        Call {org.phone}
                      </a>
                    )}
                    <a 
                      href={getDirectionsUrl(org.address)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                    >
                      📍 Directions
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-600">No healthcare resources found. Call 2-1-1 for assistance finding healthcare services.</p>
            )}
          </div>
        </div>
      );
    }
    // Government category
    else if (input === 'government' || input.includes('government')) {
      const governmentOrgs = orgs.filter(org => {
        if (org.category === 'Government Services') return true;
        if (org.crisisService && org.category === 'Crisis Services') {
          return ['Social Services', 'Municipal Services'].includes(org.serviceType);
        }
        return false;
      }).slice(0, 5);
      component = (
        <div>
          <p className="font-medium mb-3">Here are government services:</p>
          {viewMode === 'map' && (
            <div className="space-y-2 mb-3">
              <button
                onClick={() => handleMapCategorySelect('Government Services')}
                className="w-full p-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors border border-gray-300"
              >
                📍 Show all government services on map
              </button>
              <button
                onClick={() => handleMapCategorySelect(null)}
                className="w-full p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                🗺️ Show all categories
              </button>
            </div>
          )}
          <div className="space-y-2">
            {governmentOrgs.length > 0 ? (
              governmentOrgs.map(org => (
                <div key={org.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="font-medium text-gray-900">{org.organizationName}</p>
                  <p className="text-sm text-gray-600 mt-1">{org.serviceType}</p>
                  <p className="text-sm text-gray-600">{org.address}</p>
                  <div className="flex gap-2 mt-2">
                    {org.phone && (
                      <a 
                        href={`tel:${formatPhoneForTel(org.phone)}`} 
                        className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                      >
                        Call {org.phone}
                      </a>
                    )}
                    <a 
                      href={getDirectionsUrl(org.address)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                    >
                      📍 Directions
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-600">No government services found. Contact Robeson County government offices for assistance.</p>
            )}
          </div>
        </div>
      );
    }
    // Tribal category
    else if (input === 'tribal' || input.includes('tribal') || input.includes('native')) {
      const tribalOrgs = orgs.filter(org => {
        if (org.category === 'Tribal Services') return true;
        if (org.crisisService && org.category === 'Crisis Services') {
          return org.serviceType === 'Tribal Services';
        }
        return false;
      }).slice(0, 5);
      component = (
        <div>
          <p className="font-medium mb-3">Here are tribal services:</p>
          {viewMode === 'map' && (
            <div className="space-y-2 mb-3">
              <button
                onClick={() => handleMapCategorySelect('Tribal Services')}
                className="w-full p-3 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg font-medium transition-colors border border-amber-300"
              >
                📍 Show all tribal services on map
              </button>
              <button
                onClick={() => handleMapCategorySelect(null)}
                className="w-full p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                🗺️ Show all categories
              </button>
            </div>
          )}
          <div className="space-y-2">
            {tribalOrgs.length > 0 ? (
              tribalOrgs.map(org => (
                <div key={org.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="font-medium text-gray-900">{org.organizationName}</p>
                  <p className="text-sm text-gray-600 mt-1">{org.serviceType}</p>
                  <p className="text-sm text-gray-600">{org.address}</p>
                  <div className="flex gap-2 mt-2">
                    {org.phone && (
                      <a 
                        href={`tel:${formatPhoneForTel(org.phone)}`} 
                        className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                      >
                        Call {org.phone}
                      </a>
                    )}
                    <a 
                      href={getDirectionsUrl(org.address)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                    >
                      📍 Directions
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-600">No tribal services found. Contact the Lumbee Tribe of North Carolina for assistance.</p>
            )}
          </div>
        </div>
      );
    }
    // Community category
    else if (input === 'community' || input.includes('community')) {
      const communityOrgs = orgs.filter(org => {
        if (org.category === 'Community Services') return true;
        if (org.crisisService && org.category === 'Crisis Services') {
          const communityServiceTypes = [
            'Support Services', 'Community Services', 'Crisis Services', 'Support Group',
            'Harm Reduction', 'Mobile Harm Reduction', 'Biopsychosocial Support',
            'Community Resilience', 'Disaster Recovery', 'Disaster Relief/Humanitarian',
            'Healing/Educational Resources', 'Inclusive Community Support',
            'Opioid Crisis Prevention', 'Offender Rehabilitation', 'Resource Gap Bridging',
            'Equine-Assisted Learning'
          ];
          return communityServiceTypes.includes(org.serviceType);
        }
        return false;
      }).slice(0, 5);
      component = (
        <div>
          <p className="font-medium mb-3">Here are community services:</p>
          {viewMode === 'map' && (
            <div className="space-y-2 mb-3">
              <button
                onClick={() => handleMapCategorySelect('Community Services')}
                className="w-full p-3 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded-lg font-medium transition-colors border border-orange-300"
              >
                📍 Show all community services on map
              </button>
              <button
                onClick={() => handleMapCategorySelect(null)}
                className="w-full p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                🗺️ Show all categories
              </button>
            </div>
          )}
          <div className="space-y-2">
            {communityOrgs.length > 0 ? (
              communityOrgs.map(org => (
                <div key={org.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="font-medium text-gray-900">{org.organizationName}</p>
                  <p className="text-sm text-gray-600 mt-1">{org.serviceType}</p>
                  <p className="text-sm text-gray-600">{org.address}</p>
                  <div className="flex gap-2 mt-2">
                    {org.phone && (
                      <a 
                        href={`tel:${formatPhoneForTel(org.phone)}`} 
                        className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                      >
                        Call {org.phone}
                      </a>
                    )}
                    <a 
                      href={getDirectionsUrl(org.address)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                    >
                      📍 Directions
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-600">No community services found. Call 2-1-1 for assistance finding community resources.</p>
            )}
          </div>
        </div>
      );
    }
    // Faith-based category
    else if (input === 'faith' || input.includes('faith') || input.includes('church') || input.includes('religious')) {
      const faithOrgs = orgs.filter(org => {
        if (org.category === 'Faith-Based Services') return true;
        if (org.crisisService && org.category === 'Crisis Services') {
          return ['Faith-Based Services', 'Faith-Based Recovery'].includes(org.serviceType);
        }
        return false;
      }).slice(0, 5);
      component = (
        <div>
          <p className="font-medium mb-3">Here are faith-based services:</p>
          {viewMode === 'map' && (
            <div className="space-y-2 mb-3">
              <button
                onClick={() => handleMapCategorySelect('Faith-Based Services')}
                className="w-full p-3 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg font-medium transition-colors border border-purple-300"
              >
                📍 Show all faith-based services on map
              </button>
              <button
                onClick={() => handleMapCategorySelect(null)}
                className="w-full p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                🗺️ Show all categories
              </button>
            </div>
          )}
          <div className="space-y-2">
            {faithOrgs.length > 0 ? (
              faithOrgs.map(org => (
                <div key={org.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="font-medium text-gray-900">{org.organizationName}</p>
                  <p className="text-sm text-gray-600 mt-1">{org.serviceType}</p>
                  <p className="text-sm text-gray-600">{org.address}</p>
                  <div className="flex gap-2 mt-2">
                    {org.phone && (
                      <a 
                        href={`tel:${formatPhoneForTel(org.phone)}`} 
                        className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                      >
                        Call {org.phone}
                      </a>
                    )}
                    <a 
                      href={getDirectionsUrl(org.address)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                    >
                      📍 Directions
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-600">No faith-based services found. Contact local churches for assistance.</p>
            )}
          </div>
        </div>
      );
    }
    // Legal category
    else if (input === 'legal' || input.includes('legal') || input.includes('lawyer') || input.includes('attorney')) {
      const legalOrgs = orgs.filter(org => {
        if (org.category === 'Legal Services') return true;
        if (org.crisisService && org.category === 'Crisis Services') {
          return ['Legal Services', 'Legal/Prosecution', 'Drug Court', 'Child Advocacy'].includes(org.serviceType);
        }
        return false;
      }).slice(0, 5);
      component = (
        <div>
          <p className="font-medium mb-3">Here are legal services:</p>
          {viewMode === 'map' && (
            <div className="space-y-2 mb-3">
              <button
                onClick={() => handleMapCategorySelect('Legal Services')}
                className="w-full p-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-medium transition-colors border border-slate-300"
              >
                📍 Show all legal services on map
              </button>
              <button
                onClick={() => handleMapCategorySelect(null)}
                className="w-full p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                🗺️ Show all categories
              </button>
            </div>
          )}
          <div className="space-y-2">
            {legalOrgs.length > 0 ? (
              legalOrgs.map(org => (
                <div key={org.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="font-medium text-gray-900">{org.organizationName}</p>
                  <p className="text-sm text-gray-600 mt-1">{org.serviceType}</p>
                  <p className="text-sm text-gray-600">{org.address}</p>
                  <div className="flex gap-2 mt-2">
                    {org.phone && (
                      <a 
                        href={`tel:${formatPhoneForTel(org.phone)}`} 
                        className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                      >
                        Call {org.phone}
                      </a>
                    )}
                    <a 
                      href={getDirectionsUrl(org.address)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                    >
                      📍 Directions
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-600">No legal services found. Contact the North Carolina Bar Association for referrals.</p>
            )}
          </div>
        </div>
      );
    }
    // Education category
    else if (input === 'education' || input.includes('education') || input.includes('school')) {
      const educationOrgs = orgs.filter(org => org.category === 'Education').slice(0, 5);
      component = (
        <div>
          <p className="font-medium mb-3">Here are education resources:</p>
          {viewMode === 'map' && (
            <div className="space-y-2 mb-3">
              <button
                onClick={() => handleMapCategorySelect('Education')}
                className="w-full p-3 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg font-medium transition-colors border border-blue-300"
              >
                📍 Show all education services on map
              </button>
              <button
                onClick={() => handleMapCategorySelect(null)}
                className="w-full p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                🗺️ Show all categories
              </button>
            </div>
          )}
          <div className="space-y-2">
            {educationOrgs.length > 0 ? (
              educationOrgs.map(org => (
                <div key={org.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="font-medium text-gray-900">{org.organizationName}</p>
                  <p className="text-sm text-gray-600 mt-1">{org.serviceType}</p>
                  <p className="text-sm text-gray-600">{org.address}</p>
                  <div className="flex gap-2 mt-2">
                    {org.phone && (
                      <a 
                        href={`tel:${formatPhoneForTel(org.phone)}`} 
                        className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                      >
                        Call {org.phone}
                      </a>
                    )}
                    <a 
                      href={getDirectionsUrl(org.address)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                    >
                      📍 Directions
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-600">No education resources found. Contact Robeson County Schools for assistance.</p>
            )}
          </div>
        </div>
      );
    }
    // Pharmacy category
    else if (input === 'pharmacy' || input.includes('pharmacy') || input.includes('medication')) {
      const pharmacyOrgs = orgs.filter(org => org.category === 'Pharmacy').slice(0, 5);
      component = (
        <div>
          <p className="font-medium mb-3">Here are pharmacy services:</p>
          {viewMode === 'map' && (
            <div className="space-y-2 mb-3">
              <button
                onClick={() => handleMapCategorySelect('Pharmacy')}
                className="w-full p-3 bg-green-100 hover:bg-green-200 text-green-800 rounded-lg font-medium transition-colors border border-green-300"
              >
                📍 Show all pharmacies on map
              </button>
              <button
                onClick={() => handleMapCategorySelect(null)}
                className="w-full p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                🗺️ Show all categories
              </button>
            </div>
          )}
          <div className="space-y-2">
            {pharmacyOrgs.length > 0 ? (
              pharmacyOrgs.map(org => (
                <div key={org.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="font-medium text-gray-900">{org.organizationName}</p>
                  <p className="text-sm text-gray-600 mt-1">{org.serviceType}</p>
                  <p className="text-sm text-gray-600">{org.address}</p>
                  <div className="flex gap-2 mt-2">
                    {org.phone && (
                      <a 
                        href={`tel:${formatPhoneForTel(org.phone)}`} 
                        className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                      >
                        Call {org.phone}
                      </a>
                    )}
                    <a 
                      href={getDirectionsUrl(org.address)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                    >
                      📍 Directions
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-600">No pharmacy services found. Call 2-1-1 for assistance finding pharmacies.</p>
            )}
          </div>
        </div>
      );
    }
    // Default response or "other" option
    else {
      component = (
        <div>
          <p className="mb-3">I can help you find many types of resources. Choose a category or type your specific need:</p>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Quick access:</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleQuickOption('crisis')}
                  className="p-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-sm font-medium transition-colors"
                >
                  🚨 Crisis Help
                </button>
                <button
                  onClick={() => handleQuickOption('food')}
                  className="p-2 bg-green-100 hover:bg-green-200 text-green-800 rounded-lg text-sm font-medium transition-colors"
                >
                  🍽️ Food Services
                </button>
                <button
                  onClick={() => handleQuickOption('housing')}
                  className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg text-sm font-medium transition-colors"
                >
                  🏠 Housing
                </button>
                <button
                  onClick={() => handleQuickOption('treatment')}
                  className="p-2 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg text-sm font-medium transition-colors"
                >
                  💊 Treatment
                </button>
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">More categories:</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleQuickOption('healthcare')}
                  className="p-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-xs font-medium transition-colors"
                >
                  🏥 Healthcare
                </button>
                <button
                  onClick={() => handleQuickOption('government')}
                  className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-medium transition-colors"
                >
                  🏛️ Government
                </button>
                <button
                  onClick={() => handleQuickOption('tribal')}
                  className="p-2 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg text-xs font-medium transition-colors"
                >
                  🪶 Tribal Services
                </button>
                <button
                  onClick={() => handleQuickOption('community')}
                  className="p-2 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded-lg text-xs font-medium transition-colors"
                >
                  🏘️ Community
                </button>
                <button
                  onClick={() => handleQuickOption('faith')}
                  className="p-2 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg text-xs font-medium transition-colors"
                >
                  ⛪ Faith-Based
                </button>
                <button
                  onClick={() => handleQuickOption('legal')}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-medium transition-colors"
                >
                  ⚖️ Legal Services
                </button>
                <button
                  onClick={() => handleQuickOption('education')}
                  className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg text-xs font-medium transition-colors"
                >
                  📚 Education
                </button>
                <button
                  onClick={() => handleQuickOption('pharmacy')}
                  className="p-2 bg-green-100 hover:bg-green-200 text-green-800 rounded-lg text-xs font-medium transition-colors"
                >
                  💊 Pharmacy
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return {
      id: Date.now().toString(),
      component,
      isBot: true,
      timestamp: new Date()
    };
  };

  // Initialize welcome message with buttons
  useEffect(() => {
    if (isOpen) {
      // Clear messages when view mode changes
      setMessages([]);
      const welcomeMessage: Message = {
        id: '1',
        isBot: true,
        timestamp: new Date(),
        component: (
          <div>
            <p className="mb-3">
              {viewMode === 'map' 
                ? "Hello! I'm here to help you navigate the map and find resources. I can filter the map to show specific types of services. What are you looking for?"
                : "Hello! I'm here to help you find resources in Robeson County. What type of help are you looking for?"
              }
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleQuickOption('crisis')}
                className="p-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-sm font-medium transition-colors"
              >
                🚨 Crisis Help
              </button>
              <button
                onClick={() => handleQuickOption('food')}
                className="p-2 bg-green-100 hover:bg-green-200 text-green-800 rounded-lg text-sm font-medium transition-colors"
              >
                🍽️ Food & Meals
              </button>
              <button
                onClick={() => handleQuickOption('housing')}
                className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg text-sm font-medium transition-colors"
              >
                🏠 Housing
              </button>
              <button
                onClick={() => handleQuickOption('treatment')}
                className="p-2 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg text-sm font-medium transition-colors"
              >
                💊 Treatment
              </button>
              <button
                onClick={() => handleQuickOption('jobs')}
                className="p-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-lg text-sm font-medium transition-colors"
              >
                💼 Jobs
              </button>
              <button
                onClick={() => handleQuickOption('other')}
                className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm font-medium transition-colors"
              >
                ❓ Other Help
              </button>
            </div>
          </div>
        )
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, viewMode]);

  // Hide help button when scrolling near footer on mobile
  useEffect(() => {
    const handleScroll = () => {
      if (isMobile() && !isOpen) {
        const scrollPosition = window.scrollY + window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const footerBuffer = 300; // Hide button 300px before reaching bottom
        
        if (scrollPosition > documentHeight - footerBuffer) {
          setHideHelpButton(true);
        } else {
          setHideHelpButton(false);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial position

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isOpen]);

  return (
    <>
      {/* Help message above chat button */}
      {!isOpen && !hideHelpButton && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-32 sm:bottom-24 right-2 sm:right-4 z-40 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg shadow-xl px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base font-semibold border border-blue-700 animate-pulse hover:animate-none hover:scale-105 transition-transform cursor-pointer"
          aria-label="Open chat assistant"
        >
          Need help finding something? 💬
        </button>
      )}
      
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-4 right-4 z-50 p-4 rounded-full shadow-lg transition-all ${
          isOpen ? 'bg-gray-600' : 'bg-blue-600'
        } text-white hover:shadow-xl`}
        aria-label={isOpen ? 'Close chat assistant' : 'Open chat assistant'}
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 w-96 h-[500px] bg-white rounded-lg shadow-2xl flex flex-col">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 rounded-t-lg">
            <h3 className="font-semibold text-lg">Resource Assistant</h3>
            <p className="text-sm opacity-90">I'm here to help you find resources</p>
          </div>

          {/* Messages */}
          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message, index) => (
              <div
                key={message.id}
                ref={message.isBot && message.component ? lastBotMessageRef : null}
                className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.isBot
                      ? 'bg-gray-100 text-gray-900'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  {message.component ? (
                    <div>{message.component}</div>
                  ) : (
                    <p className="text-sm whitespace-pre-line">{message.text}</p>
                  )}
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Chat message input"
              />
              <button
                onClick={handleSend}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                aria-label="Send message"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}