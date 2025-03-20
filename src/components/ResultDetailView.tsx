import React from 'react';
import { X } from 'lucide-react';

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

interface HotelDetailViewProps {
  hotel: Hotel;
  onClose: () => void;
}

// Detail Record component
const ResultDetailView: React.FC<HotelDetailViewProps> = ({ hotel, onClose }) => {
  // Function to format emails as a list when there are multiple
  const formatEmails = (emailsString: string) => {
    if (!emailsString || emailsString.trim() === '') {
      return null;
    }
    
    // Split by commas and filter out any empty strings or image references
    const emails = emailsString.split(',')
      .map(email => email.trim())
      .filter(email => email && !email.endsWith('.png') && !email.endsWith('.jpg') && !email.endsWith('.jpeg'));
    
    if (emails.length === 0) {
      return null;
    }
    
    return emails;
  };
  
  const emailsList = formatEmails(hotel.emails);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{hotel.name}</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Address</h3>
              <p className="text-gray-900 dark:text-gray-200">{hotel.address}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Type</h3>
              <p className="text-gray-900 dark:text-gray-200">{hotel.type}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Rating</h3>
              <div className="flex items-center">
                <p className="text-gray-900 dark:text-gray-200 mr-2">{hotel.rating}</p>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg 
                      key={star}
                      className={`h-5 w-5 ${parseFloat(hotel.rating) >= star ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Reviews</h3>
              <p className="text-gray-900 dark:text-gray-200">{hotel.reviews}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Phone</h3>
              <p className="text-gray-900 dark:text-gray-200">{hotel.phone}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Website</h3>
              {hotel.website ? (
                <a 
                  href={hotel.website}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline break-words"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {hotel.website}
                </a>
              ) : (
                <p className="text-gray-400 dark:text-gray-500 italic">Not available</p>
              )}
            </div>
            
            {/* Added emails section */}
            <div className="md:col-span-2">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Email Contacts</h3>
              {emailsList && emailsList.length > 0 ? (
                <div className="space-y-1">
                  {emailsList.map((email, index) => (
                    <a 
                      key={index}
                      href={`mailto:${email}`}
                      className="block text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline break-words"
                    >
                      {email}
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 dark:text-gray-500 italic">Not available</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t dark:border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultDetailView;