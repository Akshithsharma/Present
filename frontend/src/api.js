
import axios from 'axios';

// In production (monolith), use relative path so requests go to same domain.
// In dev, use specific Flask URL.
const baseURL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://127.0.0.1:5000');

const api = axios.create({
    baseURL,
});

// Add a request interceptor to include auth token
api.interceptors.request.use((config) => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
        const userData = JSON.parse(storedUser);
        if (userData.token) {
            config.headers.Authorization = `Bearer ${userData.token}`;
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;
