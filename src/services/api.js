import axios from "axios";

const USE_LIVE_API = true; // 🚀 Set to TRUE for Render, FALSE for Localhost
const LIVE_URL = "https://backend-clothes-1p7b.onrender.com";
const LOCAL_URL = "http://localhost:5000";

export const BASE_URL = USE_LIVE_API ? LIVE_URL : LOCAL_URL;
export const API_BASE_URL = `${BASE_URL}/api/v1`;

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // IMPORTANT (cookies mate)
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If the error is 401 and not already a retry
        if (error.response?.status === 401 && !originalRequest._retry) {

            // If the request was actually the refresh-token request, then we must bail out
            if (originalRequest.url?.includes("/users/refresh-token")) {
                isRefreshing = false;
                processQueue(error, null);
                if (typeof window !== "undefined") {
                    console.log("Session expired or invalid. Staying on current page for discovery.");
                }
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => {
                        return api(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            return new Promise(function (resolve, reject) {
                const storedRefreshToken = localStorage.getItem("refreshToken");

                axios
                    .post(
                        `${API_BASE_URL}/users/refresh-token`,
                        { refreshToken: storedRefreshToken }, // 🔥 Send as body fallback
                        { withCredentials: true }
                    )
                    .then((res) => {
                        // 🔥 Save new refresh token if rotated
                        if (res.data.data?.refreshToken) {
                            localStorage.setItem("refreshToken", res.data.data.refreshToken);
                        }
                        processQueue(null);
                        resolve(api(originalRequest));
                    })
                    .catch((err) => {
                        processQueue(err, null);
                        if (typeof window !== "undefined") {
                            console.log("Authentication failed. Use login to access protected features.");
                        }
                        reject(err);
                    })
                    .finally(() => {
                        isRefreshing = false;
                    });
            });
        }

        return Promise.reject(error);
    }
);

export default api;
