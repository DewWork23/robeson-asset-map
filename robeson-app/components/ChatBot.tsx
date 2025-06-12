'use client';

import { useState, useRef, useEffect } from 'react';
import { Organization } from '@/types/organization';

interface ChatBotProps {
  organizations: Organization[];
}

interface Message {
  id: string;
  text?: string;
  isBot: boolean;
  timestamp: Date;
  component?: React.ReactNode;
}

export default function ChatBot({ organizations }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const lastBotMessageRef = useRef<HTMLDivElement>(null);

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

  const generateResponse = (input: string, orgs: Organization[]): Message => {
    let component: React.ReactNode = null;

    // Check for crisis keywords
    if (input === 'crisis' || input.includes('crisis') || input.includes('emergency') || input.includes('help now') || input.includes('suicide')) {
      const crisisOrgs = orgs.filter(org => org.crisisService).slice(0, 3);
      component = (
        <div>
          <p className="font-medium mb-3">I understand you need immediate help. Here are 24/7 crisis services:</p>
          <div className="space-y-2 mb-3">
            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <p className="font-bold text-red-800">🚨 National Crisis Hotline</p>
              <a href="tel:988" className="inline-block mt-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700">
                Call 988 Now
              </a>
            </div>
            {crisisOrgs.map(org => (
              <div key={org.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="font-medium text-gray-900">{org.organizationName}</p>
                {org.phone && (
                  <a 
                    href={`tel:${formatPhoneForTel(org.phone)}`} 
                    className="inline-block mt-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                  >
                    Call {org.phone}
                  </a>
                )}
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-700">Please reach out for help. You're not alone.</p>
        </div>
      );
    }
    // Check for specific service types
    else if (input === 'food' || input.includes('food') || input.includes('hungry') || input.includes('meal')) {
      const foodOrgs = orgs.filter(org => 
        org.category === 'Food/Shelter' || 
        org.servicesOffered.toLowerCase().includes('food') ||
        org.servicesOffered.toLowerCase().includes('meal')
      ).slice(0, 3);
      component = (
        <div>
          <p className="font-medium mb-3">Here are resources for food assistance:</p>
          <div className="space-y-2">
            {foodOrgs.map(org => (
              <div key={org.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="font-medium text-gray-900">{org.organizationName}</p>
                <p className="text-sm text-gray-600 mt-1">{org.address}</p>
                {org.phone && (
                  <a 
                    href={`tel:${formatPhoneForTel(org.phone)}`} 
                    className="inline-block mt-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                  >
                    Call {org.phone}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }
    else if (input === 'housing' || input.includes('housing') || input.includes('shelter') || input.includes('homeless')) {
      const housingOrgs = orgs.filter(org => 
        org.category === 'Housing' || 
        org.category === 'Food/Shelter' ||
        org.servicesOffered.toLowerCase().includes('shelter') ||
        org.servicesOffered.toLowerCase().includes('housing')
      ).slice(0, 3);
      component = (
        <div>
          <p className="font-medium mb-3">Here are housing and shelter resources:</p>
          <div className="space-y-2">
            {housingOrgs.map(org => (
              <div key={org.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="font-medium text-gray-900">{org.organizationName}</p>
                <p className="text-sm text-gray-600 mt-1">{org.address}</p>
                {org.phone && (
                  <a 
                    href={`tel:${formatPhoneForTel(org.phone)}`} 
                    className="inline-block mt-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                  >
                    Call {org.phone}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }
    else if (input === 'treatment' || input.includes('treatment') || input.includes('addiction') || input.includes('substance')) {
      const treatmentOrgs = orgs.filter(org => 
        org.category === 'Treatment' || 
        org.servicesOffered.toLowerCase().includes('treatment') ||
        org.servicesOffered.toLowerCase().includes('substance')
      ).slice(0, 3);
      component = (
        <div>
          <p className="font-medium mb-3">Here are treatment and recovery resources:</p>
          <div className="space-y-2">
            {treatmentOrgs.map(org => (
              <div key={org.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="font-medium text-gray-900">{org.organizationName}</p>
                <p className="text-sm text-gray-600 mt-1">{org.address}</p>
                {org.phone && (
                  <a 
                    href={`tel:${formatPhoneForTel(org.phone)}`} 
                    className="inline-block mt-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                  >
                    Call {org.phone}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }
    else if (input === 'jobs' || input.includes('job') || input.includes('work') || input.includes('employment')) {
      const jobOrgs = orgs.filter(org => org.category === 'Job Resources').slice(0, 3);
      component = (
        <div>
          <p className="font-medium mb-3">Here are job and employment resources:</p>
          <div className="space-y-2">
            {jobOrgs.map(org => (
              <div key={org.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="font-medium text-gray-900">{org.organizationName}</p>
                <p className="text-sm text-gray-600 mt-1">{org.address}</p>
                {org.phone && (
                  <a 
                    href={`tel:${formatPhoneForTel(org.phone)}`} 
                    className="inline-block mt-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                  >
                    Call {org.phone}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }
    // Default response or "other" option
    else {
      component = (
        <div>
          <p className="mb-3">I can help you find many types of resources. You can tell me what you need, or choose from these options:</p>
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
          </div>
          <p className="mt-3 text-sm text-gray-600">Or type your specific need below.</p>
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
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: '1',
        isBot: true,
        timestamp: new Date(),
        component: (
          <div>
            <p className="mb-3">Hello! I'm here to help you find resources in Robeson County. What type of help are you looking for?</p>
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
  }, [isOpen]);

  return (
    <>
      {/* Help message above chat button */}
      {!isOpen && (
        <div className="fixed bottom-20 right-2 sm:right-4 z-40 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg shadow-xl px-4 py-3 text-base font-semibold border border-blue-700 animate-pulse">
          Need help finding something? 💬
        </div>
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