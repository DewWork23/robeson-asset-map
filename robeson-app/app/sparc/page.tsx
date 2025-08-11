'use client';

export default function SparcPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Page Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold mb-4">SPARC/RCORP</h1>
          <p className="text-lg">
            Southeastern Prevention & Addiction Recovery Resource Center
          </p>
          <p className="text-blue-100 mt-2">
            Building a unified voice for substance prevention, treatment, and recovery in Robeson County
          </p>
        </div>

        {/* About Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">About SPARC</h2>
          <p className="text-gray-700 leading-relaxed">
            The Southeastern Prevention and Addiction Recovery Resource Center (SPARC) is funded by the Kate B. Reynolds 
            Foundation and supports the Robeson Rural Communities Opioid Response Program (RCORP) Consortium.
          </p>
        </div>

        {/* Mission Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
          <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-lg mb-4">
            <p className="text-gray-800 font-medium italic">
              To unite community resources and create accessible pathways to prevention, treatment, and recovery 
              for all residents of Robeson County affected by substance use disorders.
            </p>
          </div>
          <p className="text-gray-700 leading-relaxed">
            We work to create one unified voice to address substance prevention, treatment, and recovery needs in 
            the Robeson County community. Through collaboration with over 60 partner organizations, we're building 
            a comprehensive support network for individuals and families affected by substance use disorders.
          </p>
        </div>

        {/* Our Approach Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Approach</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-700 mb-2">Collaborative</h3>
              <p className="text-gray-600">
                Uniting over 60 partner organizations to create a comprehensive support network
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-lg border border-green-200">
              <h3 className="text-lg font-semibold text-green-700 mb-2">Data-Driven</h3>
              <p className="text-gray-600">
                Using evidence-based strategies and tracking outcomes to ensure effectiveness
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-lg border border-purple-200">
              <h3 className="text-lg font-semibold text-purple-700 mb-2">Community-Focused</h3>
              <p className="text-gray-600">
                Tailoring solutions to meet the unique needs of Robeson County's rural communities
              </p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-white p-6 rounded-lg border border-orange-200">
              <h3 className="text-lg font-semibold text-orange-700 mb-2">Holistic</h3>
              <p className="text-gray-600">
                Addressing prevention, treatment, and recovery as interconnected components
              </p>
            </div>
          </div>
        </div>

        {/* Journey Timeline */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Journey</h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  '22
                </div>
              </div>
              <div className="flex-grow">
                <h3 className="font-semibold text-gray-900">2022 - Foundation</h3>
                <p className="text-gray-600">SPARC established with initial funding from Kate B. Reynolds Foundation</p>
                <p className="text-blue-600 font-medium mt-1">10 partner organizations join the consortium</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                  '23
                </div>
              </div>
              <div className="flex-grow">
                <h3 className="font-semibold text-gray-900">2023 - Expansion</h3>
                <p className="text-gray-600">Rapid expansion of partnership network</p>
                <p className="text-gray-600">Implementation of evidence-based strategies across the county</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                  '24
                </div>
              </div>
              <div className="flex-grow">
                <h3 className="font-semibold text-gray-900">2024 - Impact</h3>
                <p className="text-purple-600 font-medium">60+ partner organizations now part of the consortium</p>
                <p className="text-gray-600">$1.178 million in Year 1 funding allocated across key service areas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Consortium Structure */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Consortium Structure</h2>
          <p className="text-gray-700 mb-6">
            The Robeson Rural Communities Opioid Response Program (RCORP) Consortium operates as a collective 
            impact model, bringing together diverse stakeholders to address the opioid epidemic comprehensively.
          </p>
          
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-lg">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-blue-700">RCORP Consortium</h3>
              <p className="text-gray-600">Central Coordination</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-1">Healthcare Providers</h4>
                <p className="text-sm text-gray-600">Treatment centers, hospitals, clinics</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-1">Community Organizations</h4>
                <p className="text-sm text-gray-600">Faith-based groups, nonprofits</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-1">Government Partners</h4>
                <p className="text-sm text-gray-600">County services, law enforcement</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-1">Recovery Support</h4>
                <p className="text-sm text-gray-600">Peer groups, housing services</p>
              </div>
            </div>
          </div>
        </div>

        {/* Core Values */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Core Values</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💙</span>
              <div>
                <h3 className="font-semibold text-gray-900">Compassion</h3>
                <p className="text-gray-600 text-sm">Meeting people where they are with dignity and respect</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🤝</span>
              <div>
                <h3 className="font-semibold text-gray-900">Collaboration</h3>
                <p className="text-gray-600 text-sm">Working together to create lasting change</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">📊</span>
              <div>
                <h3 className="font-semibold text-gray-900">Accountability</h3>
                <p className="text-gray-600 text-sm">Transparent reporting and measurable outcomes</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🌟</span>
              <div>
                <h3 className="font-semibold text-gray-900">Hope</h3>
                <p className="text-gray-600 text-sm">Believing in recovery and the potential for change</p>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Resources */}
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-red-800 mb-4">Emergency Resources</h2>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-900">National Suicide Prevention:</span>
              <a href="tel:988" className="text-red-600 font-bold text-lg hover:underline">988</a>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-900">SAMHSA Helpline:</span>
              <a href="tel:18006624357" className="text-red-600 font-bold text-lg hover:underline">1-800-662-4357</a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-600 text-sm">
          <p>SPARC - Southeastern Prevention and Addiction Recovery Resource Center</p>
          <p>Funded by the Kate B. Reynolds Foundation</p>
          <p className="mt-2">Serving Robeson County, North Carolina</p>
        </div>
      </div>
    </div>
  );
}