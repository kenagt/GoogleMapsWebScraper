export interface ScrapingJob {
  id: string;
  location: string;
  radius: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  type: 'hotels' | 'restaurants' | 'both';
  createdAt: string;
  completedAt?: string;
  results?: ScrapingResult[];
}

export interface ScrapingResult {
  name: string;
  address: string;
  rating: number;
  reviews: number;
  type: string;
  phone?: string;
  website?: string;
}

export interface ScrapingRequest {
  location: string;
  radius: number;
  type: 'hotels' | 'restaurants' | 'both';
}