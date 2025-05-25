
/* eslint-disable */


import axios, { AxiosInstance } from 'axios';

// TypeScript interfaces
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

// Create axios instance with base configuration
const api: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        // Add any auth headers here if needed
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - returns response.data directly
api.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        const errorMessage = error.response?.data?.error || error.message || 'An error occurred';
        console.error('API Error:', errorMessage);
        return Promise.reject(new Error(errorMessage));
    }
);

/**
 * Save video progress
 * @param userId - User ID
 * @param videoId - Video ID
 * @param intervals - Array of watched intervals
 * @param videoDuration - Total video duration in seconds
 * @param currentTime - Current playback time
 * @returns API response
 */
export const saveProgress = async (
    userId: string, 
    videoId: string, 
    intervals: Interval[], 
    videoDuration: number, 
    currentTime: number
): Promise<ProgressResponse> => {
    try {
        // Since the interceptor returns response.data, we can cast the return type
        const response = await api.post('/progress', {
            userId,
            videoId,
            intervals,
            videoDuration,
            currentTime
        }) as ProgressResponse;
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Get video progress
 * @param userId - User ID
 * @param videoId - Video ID
 * @returns Progress data
 */
export const getProgress = async (userId: string, videoId: string): Promise<GetProgressResponse> => {
    try {
        // Since the interceptor returns response.data, we can cast the return type
        const response = await api.get('/progress', {
            params: { userId, videoId }
        }) as GetProgressResponse;
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Get all progress for a user
 * @param userId - User ID
 * @returns Array of progress data
 */
export const getUserProgress = async (userId: string): Promise<UserProgressResponse[]> => {
    try {
        // Since the interceptor returns response.data, we can cast the return type
        const response = await api.get(`/user/${userId}/progress`) as UserProgressResponse[];
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Health check
 * @returns Health status
 */
export const healthCheck = async (): Promise<HealthStatus> => {
    try {
        // Since the interceptor returns response.data, we can cast the return type
        const response = await api.get('/health') as HealthStatus;
        return response;
    } catch (error) {
        throw error;
    }
};

export default api;