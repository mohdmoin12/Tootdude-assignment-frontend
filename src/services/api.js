// import axios from 'axios';

// /**
//  * @typedef {Object} Interval
//  * @property {number} start
//  * @property {number} end
//  */

// /**
//  * @typedef {Object} ProgressResponse
//  * @property {string} userId
//  * @property {string} videoId
//  * @property {Interval[]} intervals
//  * @property {number} videoDuration
//  * @property {number} currentTime
//  * @property {string} [id]
//  */

// /**
//  * @typedef {Object} HealthStatus
//  * @property {string} status
//  */

// // Create axios instance with base configuration
// const api = axios.create({
//     baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
//     timeout: 10000,
//     headers: {
//         'Content-Type': 'application/json',
//     },
// });

// // Request interceptor
// api.interceptors.request.use(
//     (config) => {
//         // Add any auth headers here if needed
//         return config;
//     },
//     (error) => {
//         return Promise.reject(error);
//     }
// );

// // Response interceptor
// api.interceptors.response.use(
//     (response) => {
//         return response.data;
//     },
//     (error) => {
//         const errorMessage = error.response?.data?.error || error.message || 'An error occurred';
//         console.error('API Error:', errorMessage);
//         return Promise.reject(new Error(errorMessage));
//     }
// );

// /**
//  * Save video progress
//  * @param {string} userId - User ID
//  * @param {string} videoId - Video ID
//  * @param {Interval[]} intervals - Array of watched intervals
//  * @param {number} videoDuration - Total video duration in seconds
//  * @param {number} currentTime - Current playback time
//  * @returns {Promise<ProgressResponse>} API response
//  */
// export const saveProgress = async (userId, videoId, intervals, videoDuration, currentTime) => {
//     try {
//         const response = await api.post('/progress', {
//             userId,
//             videoId,
//             intervals,
//             videoDuration,
//             currentTime
//         });
//         return response;
//     } catch (error) {
//         throw error;
//     }
// };

// /**
//  * Get video progress
//  * @param {string} userId - User ID
//  * @param {string} videoId - Video ID
//  * @returns {Promise<ProgressResponse>} Progress data
//  */
// export const getProgress = async (userId, videoId) => {
//     try {
//         const response = await api.get('/progress', {
//             params: { userId, videoId }
//         });
//         return response;
//     } catch (error) {
//         throw error;
//     }
// };

// /**
//  * Get all progress for a user
//  * @param {string} userId - User ID
//  * @returns {Promise<ProgressResponse[]>} Array of progress data
//  */
// export const getUserProgress = async (userId) => {
//     try {
//         const response = await api.get(`/user/${userId}/progress`);
//         return response;
//     } catch (error) {
//         throw error;
//     }
// };

// /**
//  * Health check
//  * @returns {Promise<HealthStatus>} Health status
//  */
// export const healthCheck = async () => {
//     try {
//         const response = await api.get('/health');
//         return response;
//     } catch (error) {
//         throw error;
//     }
// };

// export default api;


import axios from 'axios';

/**
 * @typedef {Object} Interval
 * @property {number} start
 * @property {number} end
 */

/**
 * @typedef {Object} ProgressResponse
 * @property {string} userId
 * @property {string} videoId
 * @property {Interval[]} intervals
 * @property {number} videoDuration
 * @property {number} currentTime
 * @property {number} progress
 * @property {number} lastWatchedPosition
 */

/**
 * @typedef {Object} GetProgressResponse
 * @property {number} progress
 * @property {number} lastWatchedPosition
 * @property {Interval[]} intervals
 */

/**
 * @typedef {Object} UserProgressResponse
 * @property {string} videoId
 * @property {number} progress
 * @property {number} lastWatchedPosition
 * @property {Interval[]} intervals
 * @property {number} videoDuration
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} HealthStatus
 * @property {string} status
 */

// Create axios instance with base configuration
const api = axios.create({
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

// Response interceptor
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
 * @param {string} userId - User ID
 * @param {string} videoId - Video ID
 * @param {Interval[]} intervals - Array of watched intervals
 * @param {number} videoDuration - Total video duration in seconds
 * @param {number} currentTime - Current playback time
 * @returns {Promise<ProgressResponse>} API response
 */
export const saveProgress = async (userId, videoId, intervals, videoDuration, currentTime) => {
    try {
        const response = await api.post('/progress', {
            userId,
            videoId,
            intervals,
            videoDuration,
            currentTime
        });
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Get video progress
 * @param {string} userId - User ID
 * @param {string} videoId - Video ID
 * @returns {Promise<GetProgressResponse>} Progress data
 */
export const getProgress = async (userId, videoId) => {
    try {
        const response = await api.get('/progress', {
            params: { userId, videoId }
        });
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Get all progress for a user
 * @param {string} userId - User ID
 * @returns {Promise<UserProgressResponse[]>} Array of progress data
 */
export const getUserProgress = async (userId) => {
    try {
        const response = await api.get(`/user/${userId}/progress`);
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Health check
 * @returns {Promise<HealthStatus>} Health status
 */
export const healthCheck = async () => {
    try {
        const response = await api.get('/health');
        return response;
    } catch (error) {
        throw error;
    }
};

export default api;