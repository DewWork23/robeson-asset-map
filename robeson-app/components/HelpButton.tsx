'use client';

import { useState } from 'react';

interface HelpItem {
  question: string;
  answer: string;
}

const helpItems: HelpItem[] = [
  {
    question: "How do I find resources near me?",
    answer: "Click the blue 'Use My Current Location' button in the resource list, or type your town name or zip code in the search box."
  },
  {
    question: "How do I call a resource?",
    answer: "Click on any resource card to see details. If they have a phone number, you'll see a blue phone number you can click to call directly."
  },
  {
    question: "What do the icons mean?",
    answer: "Each icon represents a category: 🚨 Crisis Services, 🍽️ Food, 🏠 Housing, 🏥 Healthcare, 🧠 Mental Health, and more. The icons help you quickly identify the type of service."
  },
  {
    question: "How do I see resources on the map?",
    answer: "On mobile, close the list by tapping the 'Close' button to see the full map. On desktop, the map is always visible on the right. Click any marker to see details."
  },
  {
    question: "Can I get directions to a resource?",
    answer: "Yes! Click on a resource card or map marker, then click the 'Get Directions' button to open directions in Google Maps."
  },
  {
    question: "How do I filter by category?",
    answer: "Use the 'Filter by category' dropdown at the top of the resource list to show only specific types of services like Food or Healthcare."
  }
];

interface HelpButtonProps {
  stationary?: boolean;
}

export default function HelpButton({ stationary = false }: HelpButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedItem, setExpandedItem] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'help' | 'sparc'>('help');

  return (
    <>
      {/* Help button */}
      <button
        onClick={() => setIsOpen(true)}
        className={stationary 
          ? "mt-3 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg shadow-xl px-4 py-2 text-sm font-semibold border border-blue-700 hover:scale-105 transition-transform"
          : "fixed bottom-4 left-4 z-20 bg-gray-600 text-white rounded-full p-3 shadow-lg hover:bg-gray-700 transition-colors"
        }
        aria-label="Get help"
      >
        {stationary ? (
          "Need help finding something? 💬"
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </button>

      {/* Help modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setIsOpen(false)}>
          <div 
            className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-blue-600 text-white p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">
                  {activeTab === 'help' ? 'How can we help?' : 'About SPARC/RCORP'}
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/80 hover:text-white"
                  aria-label="Close help"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Tab buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveTab('help')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'help' 
                      ? 'bg-white text-blue-600' 
                      : 'bg-blue-500 text-white hover:bg-blue-400'
                  }`}
                >
                  Help & FAQ
                </button>
                <button
                  onClick={() => setActiveTab('sparc')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'sparc' 
                      ? 'bg-white text-blue-600' 
                      : 'bg-blue-500 text-white hover:bg-blue-400'
                  }`}
                >
                  SPARC/RCORP
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(80vh-10rem)]">
              {activeTab === 'help' ? (
                <div className="p-4 space-y-2">
                  <p className="text-sm text-gray-600 mb-4">
                    Click on any question below to see the answer:
                  </p>
                  
                  {helpItems.map((item, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg">
                      <button
                        onClick={() => setExpandedItem(expandedItem === index ? null : index)}
                        className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-medium text-gray-900 pr-2">{item.question}</span>
                        <svg 
                          className={`w-5 h-5 text-gray-400 transition-transform ${expandedItem === index ? 'rotate-180' : ''}`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {expandedItem === index && (
                        <div className="px-4 pb-3 text-gray-600">
                          {item.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 space-y-6">
                  {/* SPARC/RCORP Content */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">About SPARC</h3>
                    <p className="text-gray-700 mb-4">
                      The Southeastern Prevention and Addiction Recovery Resource Center (SPARC) is funded by the Kate B. Reynolds Foundation and supports the Robeson Rural Communities Opioid Response Program (RCORP) Consortium.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Our Mission</h4>
                    <div className="bg-blue-50 p-4 rounded-lg mb-3">
                      <p className="text-gray-700">
                        To unite community resources and create accessible pathways to prevention, treatment, and recovery for all residents of Robeson County affected by substance use disorders.
                      </p>
                    </div>
                    <p className="text-sm text-gray-600">
                      We work to create one unified voice to address substance prevention, treatment, and recovery needs in the Robeson County community. Through collaboration with over 60 partner organizations, we're building a comprehensive support network.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Our Approach</h4>
                    <div className="space-y-3">
                      <div className="border-l-4 border-blue-500 pl-4">
                        <h5 className="font-medium text-gray-900">Collaborative</h5>
                        <p className="text-sm text-gray-600">Uniting over 60 partner organizations to create a comprehensive support network</p>
                      </div>
                      <div className="border-l-4 border-green-500 pl-4">
                        <h5 className="font-medium text-gray-900">Data-Driven</h5>
                        <p className="text-sm text-gray-600">Using evidence-based strategies and tracking outcomes to ensure effectiveness</p>
                      </div>
                      <div className="border-l-4 border-purple-500 pl-4">
                        <h5 className="font-medium text-gray-900">Community-Focused</h5>
                        <p className="text-sm text-gray-600">Tailoring solutions to meet the unique needs of Robeson County's rural communities</p>
                      </div>
                      <div className="border-l-4 border-orange-500 pl-4">
                        <h5 className="font-medium text-gray-900">Holistic</h5>
                        <p className="text-sm text-gray-600">Addressing prevention, treatment, and recovery as interconnected components</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Key Milestones</h4>
                    <div className="space-y-2">
                      <div className="flex">
                        <span className="font-medium text-blue-600 mr-3">2022:</span>
                        <span className="text-gray-700">SPARC established with 10 partner organizations</span>
                      </div>
                      <div className="flex">
                        <span className="font-medium text-blue-600 mr-3">2023:</span>
                        <span className="text-gray-700">Rapid expansion and implementation of evidence-based strategies</span>
                      </div>
                      <div className="flex">
                        <span className="font-medium text-blue-600 mr-3">2024:</span>
                        <span className="text-gray-700">60+ partners, $1.178M in Year 1 funding allocated</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Emergency Resources</h4>
                    <div className="bg-red-50 p-4 rounded-lg space-y-2">
                      <p className="text-sm"><strong>National Suicide Prevention:</strong> 988</p>
                      <p className="text-sm"><strong>SAMHSA Helpline:</strong> 1-800-662-4357</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              {activeTab === 'help' ? (
                <>
                  <p className="text-sm text-gray-600 text-center">
                    Still need help? Call 211 for assistance finding resources.
                  </p>
                  <p className="text-sm text-gray-600 text-center mt-2">
                    For app feedback, email{' '}
                    <a href="mailto:jordan.dew@uncp.edu" className="text-blue-600 hover:underline">
                      jordan.dew@uncp.edu
                    </a>
                  </p>
                </>
              ) : (
                <p className="text-sm text-gray-600 text-center">
                  SPARC - Southeastern Prevention and Addiction Recovery Resource Center
                  <br />
                  Serving Robeson County, North Carolina
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}