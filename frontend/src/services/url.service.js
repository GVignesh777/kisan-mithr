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

export default axiosInstance;