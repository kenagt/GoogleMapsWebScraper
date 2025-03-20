import React, { useState } from 'react';
import { MapPin, Search, Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from 'react-query';
import { api } from '../api';

export function ScrapingForm() {
  const [location, setLocation] = useState('');
  const [radius, setRadius] = useState(5);
  const [type, setType] = useState<'hotels' | 'restaurants' | 'both'>('both');
  
  const queryClient = useQueryClient();
  const mutation = useMutation(api.startScraping, {
    onSuccess: () => {
      queryClient.invalidateQueries('jobs');
      setLocation('');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ location, radius, type });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="Enter location"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Radius (km)</label>
          <input
            type="range"
            min="1"
            max="50"
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-sm text-gray-500 dark:text-gray-400">{radius} km</span>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as 'hotels' | 'restaurants' | 'both')}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-500 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="both">Hotels & Restaurants</option>
            <option value="hotels">Hotels Only</option>
            <option value="restaurants">Restaurants Only</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={mutation.isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 disabled:bg-blue-400 dark:disabled:bg-blue-500"
        >
          {mutation.isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <Search className="h-5 w-5 mr-2" />
              Start Scraping
            </>
          )}
        </button>
      </div>
    </form>
  );
}