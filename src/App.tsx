import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ScrapingForm } from './components/ScrapingForm';
import { ResultsTable } from './components/ResultsTable';
import { ResultsTableData } from './components/ResultsTableData';
import { Database } from 'lucide-react';
import ThemeToggle from './components/ThemeToggle';

const queryClient = new QueryClient();

function App() {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <Database className="h-8 w-8 text-blue-500 dark:text-blue-400 mr-3" />
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Web Scraping Dashboard</h1>
              </div>
              <ThemeToggle />
            </div>
            
            <div className="grid grid-cols-1 gap-8">
              <div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">New Scraping Job</h2>
                <ScrapingForm />
              </div>
              
              <div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Scraping Results</h2>
                <ResultsTable onJobSelect={setSelectedJobId} />
              </div>

              <div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                  {selectedJobId ? `Results for Job: ${selectedJobId}` : 'Scraping Results Data Table'}
                </h2>
                <ResultsTableData jobId={selectedJobId} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </QueryClientProvider>
  );
}

export default App;