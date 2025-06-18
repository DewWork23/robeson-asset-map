'use client';

import { useEffect, useState } from 'react';
import { loadOrganizationsFromGoogleSheets } from '@/lib/googleSheetsParser';

export default function TestSheets() {
  const [status, setStatus] = useState('Loading...');
  const [orgCount, setOrgCount] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    async function testLoad() {
      try {
        setStatus('Fetching from Google Sheets...');
        const orgs = await loadOrganizationsFromGoogleSheets();
        setOrgCount(orgs.length);
        setStatus('Success!');
        console.log('Loaded organizations:', orgs.slice(0, 3)); // Log first 3 for debugging
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setStatus('Failed');
      }
    }
    testLoad();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Google Sheets Integration Test</h1>
      <p>Status: <span className="font-mono">{status}</span></p>
      {orgCount > 0 && (
        <p className="text-green-600">✓ Successfully loaded {orgCount} organizations from Google Sheets!</p>
      )}
      {error && (
        <p className="text-red-600">Error: {error}</p>
      )}
      <div className="mt-4 text-sm text-gray-600">
        <p>Sheet ID: {process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID}</p>
        <p>API Key: {process.env.NEXT_PUBLIC_GOOGLE_API_KEY?.substring(0, 10)}...</p>
      </div>
    </div>
  );
}