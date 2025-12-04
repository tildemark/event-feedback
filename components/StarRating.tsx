'use client';

import { useState } from 'react';

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
}

export default function StarRating({ value, onChange, label }: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState(0);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        <span className="text-christmas-red ml-1">*</span>
      </label>
      <div className="flex gap-2 items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHoverValue(star)}
            onMouseLeave={() => setHoverValue(0)}
            className="transition-all duration-150 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-christmas-gold focus:ring-offset-2 rounded"
            aria-label={`Rate ${star} out of 5 stars`}
          >
            <svg
              className={`w-8 h-8 sm:w-10 sm:h-10 transition-colors duration-150 ${
                star <= (hoverValue || value)
                  ? 'text-christmas-gold fill-current'
                  : 'text-gray-300'
              }`}
              fill={star <= (hoverValue || value) ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          </button>
        ))}
        <span className="ml-2 text-sm font-medium text-gray-600">
          {value > 0 ? `${value}/5` : 'Not rated'}
        </span>
      </div>
    </div>
  );
}
