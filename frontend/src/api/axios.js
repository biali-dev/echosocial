import axios from "axios";

// Base URL dinâmica (local ou produção)
const BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/";

const api = axios.create({
    baseURL: BASE_URL,
});

// ===============================
// REQUEST INTERCEPTOR
// adiciona access token automaticamente
// ===============================
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("access");
        if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ===============================
// RESPONSE INTERCEPTOR
// tenta renovar token se der 401
// ===============================
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (
        error.response?.status === 401 &&
        !originalRequest._retry
        ) {
        originalRequest._retry = true;

        const refresh = localStorage.getItem("refresh");
        if (!refresh) {
            return Promise.reject(error);
        }

        try {
            // axios "puro" para evitar loop de interceptors
            const res = await axios.post(
            `${BASE_URL}auth/token/refresh/`,
            { refresh }
            );

            const newAccess = res.data.access;

            localStorage.setItem("access", newAccess);
            originalRequest.headers.Authorization = `Bearer ${newAccess}`;

            return api(originalRequest);
        } catch (err) {
            // refresh inválido → força logout
            localStorage.removeItem("access");
            localStorage.removeItem("refresh");
            return Promise.reject(err);
        }
        }

        return Promise.reject(error);
    }
);

export default api;
