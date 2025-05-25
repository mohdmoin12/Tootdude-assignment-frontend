// Updated api.ts with better error handling and debugging

import axios, { AxiosInstance } from 'axios';

// TypeScript interfaces (keeping your existing ones)
export interface Interval {
    start: number;
    end: number;
}

export interface ProgressResponse {
    userId: string;
    videoId: string;
    intervals: Interval[];
    videoDuration: number;
    currentTime: number;
    progress: number;
    lastWatchedPosition: number;
}

export interface GetProgressResponse {
    progress: number;
    lastWatchedPosition: number;
    intervals: Interval[];
}

export interface UserProgressResponse {
    videoId: string;
    progress: number;
    lastWatchedPosition: number;
    intervals: Interval[];
    videoDuration: number;
    updatedAt: string;
}

export interface HealthStatus {
    status: string;
}

// Debug the API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
console.log('Using API URL:', API_URL);

// Create axios instance with base configuration
const api: AxiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 30000, // Increased timeout
    headers: {
        'Content-Type': 'application/json',
    },
    // Force HTTPS if environment is production
    ...(import.meta.env.PROD && {
        httpsAgent: undefined, // Let axios handle HTTPS properly
    })
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        console.log('Making request to:', config.baseURL + config.url);
        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor with better error handling
api.interceptors.response.use(
    (response) => {
        console.log('Response received:', response.status);
        return response.data;
    },
    (error) => {
        console.error('Response error:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            config: {
                url: error.config?.url,
                method: error.config?.method,
                baseURL: error.config?.baseURL
            }
        });
        
        const errorMessage = error.response?.data?.error || error.message || 'An error occurred';
        return Promise.reject(new Error(errorMessage));
    }
);

/**
 * Save video progress
 */
export const saveProgress = async (
    userId: string, 
    videoId: string, 
    intervals: Interval[], 
    videoDuration: number, 
    currentTime: number
): Promise<ProgressResponse> => {
    try {
        console.log('Saving progress for:', { userId, videoId, currentTime });
        const response = await api.post('/progress', {
            userId,
            videoId,
            intervals,
            videoDuration,
            currentTime
        }) as ProgressResponse;
        return response;
    } catch (error) {
        console.error('Save progress error:', error);
        throw error;
    }
};

/**
 * Get video progress
 */
export const getProgress = async (userId: string, videoId: string): Promise<GetProgressResponse> => {
    try {
        console.log('Getting progress for:', { userId, videoId });
        const response = await api.get('/progress', {
            params: { userId, videoId }
        }) as GetProgressResponse;
        return response;
    } catch (error) {
        console.error('Get progress error:', error);
        throw error;
    }
};

/**
 * Get all progress for a user
 */
export const getUserProgress = async (userId: string): Promise<UserProgressResponse[]> => {
    try {
        console.log('Getting user progress for:', userId);
        const response = await api.get(`/user/${userId}/progress`) as UserProgressResponse[];
        return response;
    } catch (error) {
        console.error('Get user progress error:', error);
        throw error;
    }
};

/**
 * Health check with detailed logging
 */
export const healthCheck = async (): Promise<HealthStatus> => {
    try {
        console.log('Performing health check...');
        const response = await api.get('/health') as HealthStatus;
        console.log('Health check successful:', response);
        return response;
    } catch (error) {
        console.error('Health check failed:', error);
        throw error;
    }
};

export default api;