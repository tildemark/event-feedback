'use client';

import { useEffect, useState } from 'react';
import { ratingCategories } from '@/lib/types';

interface Stats {
  total_responses: number;
  average_ratings: {
    [key: string]: number;
  };
  with_comments: number;
  with_names: number;
  departments: string[];
}

interface Response {
  id: number;
  submitted_at: string;
  updated_at: string;
  name: string;
  department: string;
  ratings: {
    [key: string]: number;
  };
  comment: string;
}

interface ReportData {
  stats: Stats;
  responses: Response[];
}

export default function ReportPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showResponses, setShowResponses] = useState(false);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      const response = await fetch('/api/report');
      const reportData = await response.json();
      setData(reportData);
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!data) return;

    const headers = [
      'ID',
      'Submitted At',
      'Name',
      'Department',
      'Food',
      'Venue',
      'Decor',
      'Photobooth',
      'Giveaways',
      'Emcees',
      'Games',
      'Dept Presentations',
      'Raffle',
      'Loyalty Awards',
      'Comment',
    ];

    const rows = data.responses.map((r) => [
      r.id,
      new Date(r.submitted_at).toLocaleString(),
      r.name,
      r.department,
      r.ratings.food,
      r.ratings.venue,
      r.ratings.decor,
      r.ratings.photobooth,
      r.ratings.giveaways,
      r.ratings.emcees,
      r.ratings.games,
      r.ratings.department_presentations,
      r.ratings.raffle,
      r.ratings.loyalty_awards,
      `"${r.comment.replace(/"/g, '""')}"`,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `christmas-party-feedback-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToJSON = () => {
    if (!data) return;

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `christmas-party-feedback-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const printReport = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Loading report...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-red-600">Error loading report</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 print:shadow-none">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-christmas-red mb-2">
                🎄 Christmas Party Feedback Report
              </h1>
              <p className="text-gray-600">
                Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
              </p>
            </div>
            <div className="flex gap-2 print:hidden">
              <button
                onClick={exportToCSV}
                className="px-4 py-2 bg-christmas-green text-white rounded-lg hover:bg-christmas-green-dark transition-colors"
              >
                📊 Export CSV
              </button>
              <button
                onClick={exportToJSON}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                📄 Export JSON
              </button>
              <button
                onClick={printReport}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                🖨️ Print
              </button>
            </div>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-christmas-red mb-2">
              {data.stats.total_responses}
            </div>
            <div className="text-gray-600">Total Responses</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-christmas-green mb-2">
              {data.stats.with_comments}
            </div>
            <div className="text-gray-600">With Comments</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-christmas-gold mb-2">
              {data.stats.with_names}
            </div>
            <div className="text-gray-600">Identified</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {data.stats.departments.length}
            </div>
            <div className="text-gray-600">Departments</div>
          </div>
        </div>

        {/* Average Ratings */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Average Ratings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ratingCategories.map((category) => {
              const avg = data.stats.average_ratings[category.key];
              const percentage = (avg / 5) * 100;
              return (
                <div key={category.key}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-700">{category.label}</span>
                    <span className="text-xl font-bold text-christmas-gold">
                      {avg.toFixed(2)} / 5
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-gradient-to-r from-christmas-red to-christmas-gold h-4 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Individual Responses */}
        <div className="bg-white rounded-lg shadow-lg p-6 print:shadow-none">
          <div className="flex justify-between items-center mb-6 print:mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Individual Responses</h2>
            <button
              onClick={() => setShowResponses(!showResponses)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors print:hidden"
            >
              {showResponses ? 'Hide' : 'Show'} Details ({data.responses.length})
            </button>
          </div>

          {(showResponses || typeof window !== 'undefined' && window.matchMedia) && (
            <div className="space-y-4 print:space-y-6">
              {data.responses.map((response, index) => (
                <div key={response.id} className="border border-gray-200 rounded-lg p-4 print:break-inside-avoid">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-semibold text-lg text-gray-800">
                        {response.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {response.department} • Submitted: {new Date(response.submitted_at).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">#{index + 1}</div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-3">
                    {ratingCategories.map((cat) => (
                      <div key={cat.key} className="text-center">
                        <div className="text-xs text-gray-600 mb-1">{cat.label}</div>
                        <div className="text-xl font-bold text-christmas-gold">
                          {response.ratings[cat.key]}⭐
                        </div>
                      </div>
                    ))}
                  </div>

                  {response.comment && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="text-sm font-medium text-gray-700 mb-1">Comment:</div>
                      <div className="text-gray-600 italic">&ldquo;{response.comment}&rdquo;</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm mt-8 print:mt-6">
          Christmas Party Feedback System • {new Date().getFullYear()}
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:break-inside-avoid {
            break-inside: avoid;
          }
        }
      `}</style>
    </main>
  );
}
