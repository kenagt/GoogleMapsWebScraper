import { useQuery } from 'react-query';
import { format } from 'date-fns';
import { Loader2, AlertCircle, CheckCircle, Clock, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../api';
import { ScrapingJob } from '../models/types';
import { useState } from 'react';

interface ResultsTableProps {
  onJobSelect: (jobId: string) => void;
}

export function ResultsTable({ onJobSelect }: ResultsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  const { data: jobs, isLoading, error } = useQuery('jobs', api.getJobs, {
    refetchInterval: 5000, // Refresh every 5 seconds
    retry: 1, // Only retry once to avoid too many failed attempts
    retryDelay: 1000 // Wait 1 second before retrying
  });

  const handleRowClick = (job: ScrapingJob) => {
    onJobSelect(job.id);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 dark:text-blue-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="flex items-center text-red-500 mb-2">
          <AlertCircle className="h-6 w-6 mr-2" />
          {error instanceof Error ? error.message : 'Failed to load results'}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">Please ensure the backend server is running and try again</p>
      </div>
    );
  }

  // Sort jobs by createdAt date in descending order (newest first)
  const sortedJobs = jobs ? [...jobs].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ) : [];

  // Calculate pagination
  const totalPages = Math.ceil((sortedJobs?.length || 0) / recordsPerPage);
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = sortedJobs.slice(indexOfFirstRecord, indexOfLastRecord);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Location</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Results</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {currentRecords.map((job: ScrapingJob) => (
            <tr 
              key={job.id} 
              onClick={() => handleRowClick(job)}
              className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <StatusBadge status={job.status} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-2" />
                  <span className="text-gray-900 dark:text-gray-200">{job.location}</span>
                  <span className="ml-2 text-gray-400 dark:text-gray-500">({job.radius}km)</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap capitalize text-gray-900 dark:text-gray-200">{job.type}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {format(new Date(job.createdAt), 'MMM d, yyyy HH:mm')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                {job.results ? `${job.results.length} items` : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Pagination */}
      <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Showing {indexOfFirstRecord + 1}-{Math.min(indexOfLastRecord, sortedJobs.length)} of {sortedJobs.length} results
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => paginate(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
            className={`p-1 rounded-md ${
              currentPage === 1
                ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => paginate(i + 1)}
              className={`px-3 py-1 rounded-md ${
                currentPage === i + 1
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {i + 1}
            </button>
          ))}
          
          <button
            onClick={() => paginate(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage === totalPages || totalPages === 0}
            className={`p-1 rounded-md ${
              currentPage === totalPages || totalPages === 0
                ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            aria-label="Next page"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: ScrapingJob['status'] }) {
  const statusConfig = {
    pending: { 
      icon: Clock, 
      className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' 
    },
    running: { 
      icon: Loader2, 
      className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
    },
    completed: { 
      icon: CheckCircle, 
      className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
    },
    failed: { 
      icon: AlertCircle, 
      className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      <Icon className={`h-4 w-4 mr-1 ${status === 'running' ? 'animate-spin' : ''}`} />
      {status}
    </span>
  );
}