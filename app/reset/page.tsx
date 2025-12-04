'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ResetPage() {
  const [isResetting, setIsResetting] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleReset = async () => {
    if (!confirm('Are you sure you want to delete ALL feedback data? This cannot be undone!')) {
      return;
    }

    setIsResetting(true);
    setMessage('');

    try {
      const response = await fetch('/api/reset', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ Successfully deleted ${data.count} feedback records`);
        setTimeout(() => {
          router.push('/report');
        }, 2000);
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setMessage('❌ Failed to reset data');
      console.error('Reset error:', error);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-christmas-red via-christmas-green to-christmas-gold p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h1 className="text-3xl font-bold text-red-600 mb-4">
            ⚠️ Reset All Feedback Data
          </h1>
          
          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6 mb-6">
            <p className="text-red-800 font-semibold mb-2">
              WARNING: This action is irreversible!
            </p>
            <p className="text-red-700">
              This will permanently delete all feedback responses from the database.
              Use this only when you need to clear test data or start fresh.
            </p>
          </div>

          {message && (
            <div className={`p-4 rounded-lg mb-6 ${
              message.startsWith('✅') 
                ? 'bg-green-50 text-green-800 border border-green-300' 
                : 'bg-red-50 text-red-800 border border-red-300'
            }`}>
              {message}
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={handleReset}
              disabled={isResetting}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isResetting ? 'Deleting...' : 'Delete All Data'}
            </button>
            
            <button
              onClick={() => router.push('/report')}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>

          <div className="mt-6 text-center">
            <a
              href="/report"
              className="text-blue-600 hover:underline"
            >
              ← Back to Report
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
