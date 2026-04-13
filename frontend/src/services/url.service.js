import axios from "axios";

const apiUrl = `${process.env.REACT_APP_API_URL}/api`;

const axiosInstance = axios.create({
    baseURL: apiUrl,
    withCredentials: true
});

// Add a request interceptor to include the auth token
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("auth_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor to handle token expiration/401s
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.warn("Unauthorized access - clearing stale token");
            localStorage.removeItem("auth_token");
            // Optional: redirect to login if not already there
            if (window.location.pathname !== '/user-login') {
                window.location.href = '/user-login';
            }
        }
        return Promise.reject(error);
    }
);


export default axiosInstance;