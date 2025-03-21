import React from 'react';
import { useState, useEffect } from 'react';
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, X, AlertCircle, Download, Mail } from 'lucide-react';
import HotelDetailView from './ResultDetailView';

// Define the type for hotel data
interface Hotel {
  name: string;
  address: string;
  rating: string;
  reviews: string;
  type: string;
  phone: string;
  website: string | null;
  emails: string; // Added emails field
}

interface ResultsTableDataProps {
  jobId: string | null;
}

export const ResultsTableData: React.FC<ResultsTableDataProps> = ({ jobId }) => {
  const [data, setData] = useState<Hotel[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Hotel;
    direction: 'asc' | 'desc';
  } | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  
  // Detail view state
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      // Reset data and error when job changes
      setData([]);
      setError(null);
      
      // If no job is selected, don't try to fetch data
      if (!jobId) {
        return;
      }
      
      try {
        setLoading(true);
        // Fetch data from the specific job file
        const response = await fetch(`/backend/jobs/${jobId}.json`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const jsonData = await response.json();
        
        // Set data from the results array if it exists
        if (jsonData && jsonData.results && Array.isArray(jsonData.results)) {
          setData(jsonData.results);
        } else {
          setData([]);
          setError('No results found in the job data');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load job data. Please try again later.');
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Reset to first page when job changes
    setCurrentPage(1);
  }, [jobId]);

  // Handle sorting
  const requestSort = (key: keyof Hotel) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Apply sorting and filtering to the data
  const sortedData = React.useMemo(() => {
    // Create a copy of the data
    let sortableData = [...data];
    
    // Apply search filter
    if (searchTerm) {
      sortableData = sortableData.filter(item =>
        Object.values(item).some(
          value => value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    
    // Apply sorting
    if (sortConfig !== null) {
      sortableData.sort((a, b) => {
        const aValue = a[sortConfig.key] || '';
        const bValue = b[sortConfig.key] || '';
        
        // Convert values for comparison - handle numeric sorting for ratings and reviews
        let comparison = 0;
        if (sortConfig.key === 'rating' || sortConfig.key === 'reviews') {
          // Convert comma-separated numbers to decimal for comparison
          const aNum = parseFloat(String(aValue).replace(',', '.'));
          const bNum = parseFloat(String(bValue).replace(',', '.'));
          comparison = aNum - bNum;
        } else {
          // String comparison
          if (aValue < bValue) {
            comparison = -1;
          }
          if (aValue > bValue) {
            comparison = 1;
          }
        }
        
        return sortConfig.direction === 'desc' ? comparison * -1 : comparison;
      });
    }
    
    return sortableData;
  }, [data, searchTerm, sortConfig]);

  // Calculate pagination values
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);

  // Pagination control handlers
  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Handler for opening hotel details
  const handleRowClick = (hotel: Hotel) => {
    setSelectedHotel(hotel);
  };

  // Handler for closing hotel details
  const handleCloseDetails = () => {
    setSelectedHotel(null);
  };

  const getDomainFromUrl = (url: string) => {
    try {
      if (!/^https?:\/\//i.test(url)) {
        url = 'http://' + url; // Prepend http:// if not present
      }
      const parsedUrl = new URL(url);
      return parsedUrl.hostname;
    } catch (error) {
      console.error("Invalid URL", error);
      return ''; // Return an empty string if the URL is invalid
    }
  };

  // Function to check if hotel has valid emails
  const hasValidEmails = (emailsString: string) => {
    if (!emailsString || emailsString.trim() === '') return false;
    
    // Check if there's at least one valid email (not image references)
    return emailsString.split(',')
      .some(email => {
        const trimmed = email.trim();
        return trimmed && !trimmed.endsWith('.png') && !trimmed.endsWith('.jpg') && !trimmed.endsWith('.jpeg');
      });
  };

  // CSV Export function
  const exportToCSV = () => {
    if (sortedData.length === 0) return;
    
    // Define CSV headers - updated to include emails
    const headers = ['Name', 'Address', 'Rating', 'Reviews', 'Type', 'Phone', 'Website', 'Emails'];
    
    // Convert data to CSV format
    const csvData = sortedData.map(hotel => [
      `"${hotel.name.replace(/"/g, '""')}"`, // Escape quotes in CSV
      `"${hotel.address.replace(/"/g, '""')}"`,
      hotel.rating || 'N/A',
      hotel.reviews || 'N/A',
      hotel.type,
      hotel.phone || 'N/A',
      hotel.website || 'N/A',
      `"${hotel.emails?.replace(/"/g, '""') || 'N/A'}"` // Added emails field
    ]);
    
    // Combine headers and data
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    // Create blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // Set file name with job ID and timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `hotel-data-${jobId}-${timestamp}.csv`;
    
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Show a message if no job is selected
  if (!jobId) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-8 text-center">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Job Selected</h3>
        <p className="text-gray-500 dark:text-gray-400">
          Please select a job from the table above to view its results.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6">
        <div className="text-red-500 dark:text-red-400 text-center">{error}</div>
      </div>
    );
  }

  // Empty state handler
  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-12">
        <div className="text-center">
          <svg 
            className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 14h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No hotels found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            This job contains no results data.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Detail view modal */}
      {selectedHotel && (
        <HotelDetailView 
          hotel={selectedHotel} 
          onClose={handleCloseDetails} 
        />
      )}
      
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        {/* Search and export bar */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-4">
          <div className="relative rounded-md shadow-sm flex-grow max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-600 rounded-md p-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="Search hotels..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Export to CSV button */}
          <button
            onClick={exportToCSV}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={sortedData.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Export to CSV
          </button>
        </div>
        
        {/* Results count */}
        <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
          Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, sortedData.length)} of {sortedData.length} results
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('name')}
                >
                  <div className="flex items-center">
                    Name
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('address')}
                >
                  <div className="flex items-center">
                    Address
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('rating')}
                >
                  <div className="flex items-center">
                    Rating
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('reviews')}
                >
                  <div className="flex items-center">
                    Reviews
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('type')}
                >
                  <div className="flex items-center">
                    Type
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('phone')}
                >
                  <div className="flex items-center">
                    Phone
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Website
                </th>
                {/* Added Email column */}
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Email
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {currentItems.map((hotel, index) => (
                <tr 
                  key={index} 
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer" 
                  onClick={() => handleRowClick(hotel)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{hotel.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">{hotel.address}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-100">{hotel.rating || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-100">{hotel.reviews || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-100 capitalize">{hotel.type}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-100">{hotel.phone || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {hotel.website ? (
                      <a
                        href={hotel.website}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 truncate block max-w-xs"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()} // Prevent row click when clicking the link
                      >
                        {getDomainFromUrl(hotel.website)}
                      </a>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500 italic">Not available</span>
                    )}
                  </td>
                  {/* Added Email column cell */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {hasValidEmails(hotel.emails) ? (
                      <div className="flex items-center text-blue-600 dark:text-blue-400">
                        <Mail className="h-4 w-4 mr-1" />
                        <span>Available</span>
                      </div>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500 italic">Not available</span>
                    )}
                  </td>
                </tr>
              ))}
              {sortedData.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    No results found for your search
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Updated pagination based on ResultsTable.tsx */}
        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, sortedData.length)} of {sortedData.length} results
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
        
        {/* Items per page selector */}
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
            <span>Show</span>
            <select
              className="mx-2 border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1); // Reset to first page when changing items per page
              }}
            >
              {[5, 10, 25, 50].map((number) => (
                <option key={number} value={number}>
                  {number}
                </option>
              ))}
            </select>
            <span>entries per page</span>
          </div>
        </div>
      </div>
    </>
  );
};