import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Register() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState(""); // opcional
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        if (!username.trim() || !password) {
        setError("Preencha usuário e senha.");
        return;
        }
        if (password !== password2) {
        setError("As senhas não conferem.");
        return;
        }

        try {
        setLoading(true);

        // ✅ endpoint correto e payload compatível com seu RegisterSerializer
        await api.post("auth/register/", {
            username: username.trim(),
            email: email.trim() || "",
            password,
        });

        navigate("/login");
        } catch (err) {
        const msg =
            err?.response?.data?.detail ||
            "Erro ao cadastrar. Tente outro usuário.";
        setError(msg);
        } finally {
        setLoading(false);
        }
    }

    return (
        <div style={{ maxWidth: 480, margin: "60px auto" }}>
        <h1>Echo Social</h1>
        <h2>Criar conta</h2>

        <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
            <input
            placeholder="Usuário"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: "100%", padding: 12, marginBottom: 12 }}
            />

            <input
            placeholder="Email (opcional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", padding: 12, marginBottom: 12 }}
            />

            <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: 12, marginBottom: 12 }}
            />

            <input
            type="password"
            placeholder="Confirmar senha"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            style={{ width: "100%", padding: 12, marginBottom: 12 }}
            />

            {error && <p style={{ color: "tomato", marginBottom: 12 }}>{error}</p>}

            <button disabled={loading} style={{ width: "100%", padding: 12 }}>
            {loading ? "Criando..." : "Criar conta"}
            </button>
        </form>

        <p style={{ marginTop: 16 }}>
            Já tem conta? <Link to="/login">Entrar</Link>
        </p>
        </div>
    );
}
