export default function FeedbackBanner() {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 py-8 mt-12">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Found incorrect information or missing resources?
        </h3>
        <p className="text-gray-600 mb-4">
          Help us improve this guide by reporting errors, suggesting new resources, or sharing feedback.<br />
          Contact Jordan Dew, Social Research Specialist, UNCP SPARC
        </p>
        <a
          href="mailto:jordan.dew@uncp.edu?subject=Robeson County Community Resources - Feedback"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 hover:shadow-xl hover:scale-110 transition-all duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span>Report Feedback</span>
        </a>
      </div>
    </footer>
  );
}