'use client';

import { useEffect, useState } from 'react';
import { getUserId } from '@/lib/userId';
import { ratingCategories, type Ratings } from '@/lib/types';
import StarRating from '@/components/StarRating';

export default function Home() {
  const [userId, setUserId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  // Form state
  const [ratings, setRatings] = useState<Ratings>({
    food: 0,
    venue: 0,
    decor: 0,
    photobooth: 0,
    giveaways: 0,
    emcees: 0,
    games: 0,
    department_presentations: 0,
    raffle: 0,
    loyalty_awards: 0,
  });
  const [comment, setComment] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');

  // Initialize user and check for existing feedback
  useEffect(() => {
    const initializeUser = async () => {
      const id = getUserId();
      setUserId(id);

      if (id) {
        try {
          const response = await fetch('/api/check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: id }),
          });

          const data = await response.json();

          if (data.exists && data.feedback) {
            setIsUpdate(true);
            setRatings(data.feedback.ratings);
            setComment(data.feedback.comment || '');
            setName(data.feedback.name || '');
            setDepartment(data.feedback.department || '');
          }
        } catch (error) {
          console.error('Error checking existing feedback:', error);
        }
      }

      setIsLoading(false);
    };

    initializeUser();
  }, []);

  const handleRatingChange = (category: keyof Ratings, value: number) => {
    setRatings((prev) => ({ ...prev, [category]: value }));
  };

  const isFormValid = () => {
    return Object.values(ratings).every((rating) => rating > 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid()) {
      alert('Please rate all categories before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          ratings,
          comment: comment.trim() || undefined,
          name: name.trim() || undefined,
          department: department.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitted(true);
      } else {
        alert(data.error || 'An error occurred. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-christmas-red via-christmas-green to-christmas-red">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-christmas-red via-christmas-green to-christmas-red p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-12 max-w-2xl w-full text-center">
          <div className="text-6xl mb-6">🎄</div>
          <h1 className="text-3xl sm:text-4xl font-bold text-christmas-green mb-4">
            {isUpdate ? 'Feedback Updated!' : 'Thank You!'}
          </h1>
          <p className="text-lg text-gray-700 mb-6">
            Your feedback has been {isUpdate ? 'updated' : 'submitted'} successfully. 
            We appreciate you taking the time to share your thoughts!
          </p>
          <div className="flex gap-4 justify-center text-4xl sm:text-5xl mb-6">
            ⭐ 🎅 🎁 ❄️ 🔔
          </div>
          <p className="text-sm text-gray-500">
            You can close this window or update your feedback anytime by returning to this page.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setIsUpdate(true);
            }}
            className="mt-6 px-6 py-3 bg-christmas-green text-white font-semibold rounded-lg hover:bg-christmas-green-dark transition-colors duration-200"
          >
            Edit Feedback
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-christmas-red via-christmas-green to-christmas-red p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-t-2xl shadow-xl p-6 sm:p-8 text-center border-b-4 border-christmas-gold">
          <div className="flex justify-center gap-2 text-3xl sm:text-4xl mb-4">
            🎄 ⭐ 🎅
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-christmas-red mb-2">
            Annual Christmas Party Feedback
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Help us make next year's celebration even better!
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-b-2xl shadow-xl p-6 sm:p-8">
          {/* Optional Identity Section */}
          <div className="mb-8 p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <h2 className="text-xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <span>👤</span>
              Tell us who you are (Optional)
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Feel free to stay anonymous or share your identity — it's completely up to you!
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name / Alias
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., John Doe or Santa's Helper"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-christmas-green focus:border-transparent outline-none transition-all"
                />
              </div>
              
              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  id="department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g., Engineering, HR, Sales"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-christmas-green focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Rating Categories */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span>⭐</span>
              Rate Each Category
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Please rate all categories from 1 (Poor) to 5 (Excellent)
            </p>

            <div className="space-y-6">
              {ratingCategories.map((category) => (
                <div
                  key={category.key}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <StarRating
                    label={category.label}
                    value={ratings[category.key]}
                    onChange={(value) => handleRatingChange(category.key, value)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Comment Section */}
          <div className="mb-8">
            <label htmlFor="comment" className="block text-lg font-semibold text-gray-800 mb-2">
              Additional Comments (Optional)
            </label>
            <p className="text-sm text-gray-600 mb-3">
              Share any additional thoughts, suggestions, or highlights from the party
            </p>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={5}
              placeholder="What did you love? What could be improved? Any special moments you'd like to share?"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-christmas-green focus:border-transparent outline-none transition-all resize-none"
            />
          </div>

          {/* Submit Button */}
          <div className="flex flex-col items-center gap-4">
            <button
              type="submit"
              disabled={!isFormValid() || isSubmitting}
              className={`w-full sm:w-auto px-8 py-4 text-lg font-bold rounded-lg transition-all duration-200 transform ${
                isFormValid() && !isSubmitting
                  ? 'bg-gradient-to-r from-christmas-red to-christmas-green text-white hover:scale-105 hover:shadow-lg'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  {isUpdate ? 'Updating...' : 'Submitting...'}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  {isUpdate ? '✏️ Update Feedback' : '🎁 Submit Feedback'}
                </span>
              )}
            </button>
            
            {!isFormValid() && (
              <p className="text-sm text-christmas-red font-medium">
                ⚠️ Please rate all categories before submitting
              </p>
            )}

            {isUpdate && (
              <p className="text-sm text-gray-600 text-center">
                You've already submitted feedback. Click to update your responses.
              </p>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-white text-sm">
          <p>🎄 Thank you for being part of our celebration! 🎄</p>
          <a 
            href="/report" 
            className="inline-block mt-2 text-xs text-white/70 hover:text-white transition-colors"
            title="Admin Report Access"
          >
            Admin Report
          </a>
        </div>
      </div>
    </main>
  );
}
