import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loadingAuth, setLoadingAuth] = useState(true);

    async function getMe() {
        const res = await api.get("me/");
        setUser(res.data);
        return res.data;
    }

    async function login(username, password) {
        // SimpleJWT espera {username, password}
        const res = await api.post("auth/token/", { username, password });

        localStorage.setItem("access", res.data.access);
        localStorage.setItem("refresh", res.data.refresh);

        await getMe();
    }

    function logout() {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        setUser(null);
    }

    useEffect(() => {
        (async () => {
        try {
            const access = localStorage.getItem("access");
            if (access) await getMe();
        } catch (err) {
            // token inválido/expirado
            logout();
        } finally {
            setLoadingAuth(false);
        }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const value = useMemo(
        () => ({ user, setUser, login, logout, loadingAuth }),
        [user, loadingAuth]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
    }

    export function useAuth() {
    const ctx = useContext(AuthContext);

    // ✅ em vez de quebrar a app, retorna um fallback seguro
    if (!ctx) {
        return {
        user: null,
        loadingAuth: false,
        login: async () => {
            throw new Error("AuthProvider não está envolvendo a aplicação.");
        },
        logout: () => {},
        setUser: () => {},
        };
    }

    return ctx;
}
