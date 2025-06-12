'use client';

import { useState, useRef, useEffect } from 'react';
import { Organization } from '@/types/organization';

interface ChatBotProps {
  organizations: Organization[];
}

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

export default function ChatBot({ organizations }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm here to help you find resources in Robeson County. What type of help are you looking for?",
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  const generateResponse = (input: string, orgs: Organization[]): Message => {
    let responseText = '';

    // Check for crisis keywords
    if (input.includes('crisis') || input.includes('emergency') || input.includes('help now') || input.includes('suicide')) {
      const crisisOrgs = orgs.filter(org => org.crisisService);
      responseText = `I understand you need immediate help. Here are 24/7 crisis services:\n\n`;
      responseText += `🚨 National Suicide Prevention: Call 988\n\n`;
      crisisOrgs.slice(0, 3).forEach(org => {
        responseText += `${org.organizationName}: ${org.phone}\n`;
      });
      responseText += `\nPlease reach out for help. You're not alone.`;
    }
    // Check for specific service types
    else if (input.includes('food') || input.includes('hungry') || input.includes('meal')) {
      const foodOrgs = orgs.filter(org => 
        org.category === 'Food/Shelter' || 
        org.servicesOffered.toLowerCase().includes('food') ||
        org.servicesOffered.toLowerCase().includes('meal')
      );
      responseText = `Here are resources for food assistance:\n\n`;
      foodOrgs.slice(0, 3).forEach(org => {
        responseText += `• ${org.organizationName}\n  ${org.address}\n  ${org.phone}\n\n`;
      });
    }
    else if (input.includes('housing') || input.includes('shelter') || input.includes('homeless')) {
      const housingOrgs = orgs.filter(org => 
        org.category === 'Housing' || 
        org.category === 'Food/Shelter' ||
        org.servicesOffered.toLowerCase().includes('shelter') ||
        org.servicesOffered.toLowerCase().includes('housing')
      );
      responseText = `Here are housing and shelter resources:\n\n`;
      housingOrgs.slice(0, 3).forEach(org => {
        responseText += `• ${org.organizationName}\n  ${org.address}\n  ${org.phone}\n\n`;
      });
    }
    else if (input.includes('treatment') || input.includes('addiction') || input.includes('substance')) {
      const treatmentOrgs = orgs.filter(org => 
        org.category === 'Treatment' || 
        org.servicesOffered.toLowerCase().includes('treatment') ||
        org.servicesOffered.toLowerCase().includes('substance')
      );
      responseText = `Here are treatment and recovery resources:\n\n`;
      treatmentOrgs.slice(0, 3).forEach(org => {
        responseText += `• ${org.organizationName}\n  ${org.address}\n  ${org.phone}\n\n`;
      });
    }
    else if (input.includes('job') || input.includes('work') || input.includes('employment')) {
      const jobOrgs = orgs.filter(org => org.category === 'Job Resources');
      responseText = `Here are job and employment resources:\n\n`;
      jobOrgs.slice(0, 3).forEach(org => {
        responseText += `• ${org.organizationName}\n  ${org.address}\n  ${org.phone}\n\n`;
      });
    }
    // Default response
    else {
      responseText = `I can help you find resources for:\n\n`;
      responseText += `• Crisis/Emergency Services (type "crisis")\n`;
      responseText += `• Food Assistance (type "food")\n`;
      responseText += `• Housing/Shelter (type "housing")\n`;
      responseText += `• Treatment Services (type "treatment")\n`;
      responseText += `• Job Resources (type "job")\n\n`;
      responseText += `What type of help do you need?`;
    }

    return {
      id: Date.now().toString(),
      text: responseText,
      isBot: true,
      timestamp: new Date()
    };
  };

  return (
    <>
      {/* Help message above chat button */}
      {!isOpen && (
        <div className="fixed bottom-20 right-4 z-40 bg-white rounded-lg shadow-lg px-3 py-2 text-sm font-medium text-gray-700 border border-gray-200">
          Need help finding something?
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
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.isBot
                      ? 'bg-gray-100 text-gray-900'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{message.text}</p>
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