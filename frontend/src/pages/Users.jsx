import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";

export default function Users() {
    const [query, setQuery] = useState("");
    const [users, setUsers] = useState([]);
    const [followingIds, setFollowingIds] = useState(new Set());
    const [loading, setLoading] = useState(true);

    async function loadUsers(q = "") {
        const res = await api.get("users", { params: q ? { search: q } : {} });
        setUsers(res.data);
    }

    async function loadFollowingIds() {
        const res = await api.get("me/following-ids");
        setFollowingIds(new Set(res.data.following_ids));
    }

    async function refresh(q = "") {
        setLoading(true);
        try {
        await Promise.all([loadUsers(q), loadFollowingIds()]);
        } catch (err) {
        console.error("Erro ao carregar tela de usuários", err);
        } finally {
        setLoading(false);
        }
    }

    async function follow(userId) {
        await api.post(`users/${userId}/follow`);
        setFollowingIds((prev) => new Set(prev).add(userId));
    }

    async function unfollow(userId) {
        await api.delete(`users/${userId}/follow`);
        setFollowingIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
        });
    }

    async function toggle(userId) {
        if (followingIds.has(userId)) {
        await unfollow(userId);
        } else {
        await follow(userId);
        }
    }

    function handleSearch(e) {
        e.preventDefault();
        refresh(query.trim());
    }

    useEffect(() => {
        refresh();
    }, []);

    const usersWithState = useMemo(() => {
        return users.map((u) => ({
        ...u,
        isFollowing: followingIds.has(u.id),
        }));
    }, [users, followingIds]);

    return (
        <div style={{ maxWidth: 600, margin: "40px auto" }}>
        <h1>Explorar usuários</h1>

        <form
            onSubmit={handleSearch}
            style={{ margin: "20px 0", display: "flex", gap: 8 }}
        >
            <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por username…"
            style={{ flex: 1, padding: 10 }}
            />
            <button>Buscar</button>
        </form>

        {loading && <p>Carregando...</p>}

        {!loading && usersWithState.length === 0 && (
            <p>Nenhum usuário encontrado.</p>
        )}

        <div>
            {usersWithState.map((u) => (
            <div
                key={u.id}
                style={{
                border: "1px solid #333",
                borderRadius: 8,
                padding: 12,
                marginBottom: 10,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                }}
            >
                <strong>@{u.username}</strong>

                <button onClick={() => toggle(u.id)}>
                {u.isFollowing ? "Seguindo" : "Seguir"}
                </button>
            </div>
            ))}
        </div>
        </div>
    );
}
