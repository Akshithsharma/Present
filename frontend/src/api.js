import axios from 'axios';

// Revert to explicit URL. 0.0.0.0 on backend ensures it listens.
const baseURL = 'http://127.0.0.1:5000';

const api = axios.create({
    baseURL,
});

api.interceptors.request.use((config) => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
        try {
            const userData = JSON.parse(storedUser);
            if (userData.token) {
                config.headers.Authorization = `Bearer ${userData.token}`;
            }
        } catch (e) {
            console.error("Error parsing user token", e);
        }
    }
    return config;
});

export default api;
