import { useState } from "react";
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
        <h1>Login</h1>

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

            <button style={{ width: "100%" }}>Entrar</button>
        </form>
        </div>
    );
}
