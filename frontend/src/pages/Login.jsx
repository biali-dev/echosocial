import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Login() {
    const { login } = useAuth();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();
        await login(username, password);
    }

    return (
        <div style={{ maxWidth: 400, margin: "100px auto" }}>
        <h1>Echo Social</h1>
        <br />
        <h2>Login</h2>
        <br />

        <form onSubmit={handleSubmit}>
            <input
            placeholder="Usuário"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: "100%", marginBottom: 10 }}
            />

            <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", marginBottom: 10 }}
            />

            <p style={{ marginTop: 16 }}>
            Não tem conta? <Link to="/register">Criar conta</Link>
            </p>

            <button style={{ width: "100%" }}>Entrar</button>
        </form>
        </div>
    );
}
