import axios from "axios";

const api = axios.create({
    baseURL: "http://127.0.0.1:8000/api/",
});

// Adiciona o access token automaticamente em todas as requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("access");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Se der 401, tenta renovar o access usando o refresh e repete a request
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        const refresh = localStorage.getItem("refresh");
        if (!refresh) return Promise.reject(error);

        try {
            // usa axios "puro" pra evitar loop de interceptors
            const res = await axios.post(
            "http://127.0.0.1:8000/api/auth/token/refresh",
            { refresh }
            );

            localStorage.setItem("access", res.data.access);
            originalRequest.headers.Authorization = `Bearer ${res.data.access}`;

            return api(originalRequest);
        } catch (err) {
            // se refresh falhar, limpa tokens e deixa o app tratar logout
            localStorage.removeItem("access");
            localStorage.removeItem("refresh");
            return Promise.reject(err);
        }
        }

        return Promise.reject(error);
    }
);

export default api;
