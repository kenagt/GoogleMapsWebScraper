import axios from 'axios';
import { ScrapingJob, ScrapingRequest } from './types';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add error handling interceptor
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout - please try again');
    }
    if (!error.response) {
      throw new Error('Network error - please check if the backend server is running');
    }
    throw error;
  }
);

export const api = {
  startScraping: async (request: ScrapingRequest): Promise<ScrapingJob> => {
    try {
      const response = await axiosInstance.post('/scrape', request);
      return response.data;
    } catch (error) {
      throw error instanceof Error ? error : new Error('Failed to start scraping');
    }
  },

  getJobs: async (): Promise<ScrapingJob[]> => {
    try {
      const response = await axiosInstance.get('/jobs');
      return response.data;
    } catch (error) {
      throw error instanceof Error ? error : new Error('Failed to fetch jobs');
    }
  },

  getJobById: async (id: string): Promise<ScrapingJob> => {
    try {
      const response = await axiosInstance.get(`/jobs/${id}`);
      return response.data;
    } catch (error) {
      throw error instanceof Error ? error : new Error('Failed to fetch job details');
    }
  }
};