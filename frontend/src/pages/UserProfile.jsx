import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios";

export default function UserProfile() {
    const { id } = useParams();

    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);

    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [postsLoading, setPostsLoading] = useState(true);

    async function loadProfile() {
        const res = await api.get(`users/${id}`);
        setProfile(res.data);
    }

    async function loadPosts() {
        setPostsLoading(true);
        try {
        const res = await api.get(`users/${id}/posts`);
        setPosts(res.data);
        } catch (err) {
        console.error("Erro ao carregar posts do usuário", err);
        } finally {
        setPostsLoading(false);
        }
    }

    async function refreshAll() {
        setLoading(true);
        try {
        await Promise.all([loadProfile(), loadPosts()]);
        } catch (err) {
        console.error("Erro ao carregar perfil público", err);
        } finally {
        setLoading(false);
        }
    }

    async function follow() {
        setBusy(true);
        try {
        await api.post(`users/${id}/follow`);
        await refreshAll();
        } finally {
        setBusy(false);
        }
    }

    async function unfollow() {
        setBusy(true);
        try {
        await api.delete(`users/${id}/follow`);
        await refreshAll();
        } finally {
        setBusy(false);
        }
    }

    async function toggleLike(post) {
        try {
        const current = post.likes_count ?? 0;

        if (post.liked_by_me) {
            await api.delete(`posts/${post.id}/like`);
            setPosts((prev) =>
            prev.map((p) =>
                p.id === post.id
                ? { ...p, liked_by_me: false, likes_count: Math.max(0, current - 1) }
                : p
            )
            );
        } else {
            await api.post(`posts/${post.id}/like`);
            setPosts((prev) =>
            prev.map((p) =>
                p.id === post.id
                ? { ...p, liked_by_me: true, likes_count: current + 1 }
                : p
            )
            );
        }
        } catch (err) {
        console.error("Erro ao dar like", err);
        }
    }

    useEffect(() => {
        refreshAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (loading) return <p style={{ maxWidth: 600, margin: "40px auto" }}>Carregando...</p>;
    if (!profile) return <p style={{ maxWidth: 600, margin: "40px auto" }}>Perfil não encontrado.</p>;

    return (
        <div style={{ maxWidth: 600, margin: "40px auto" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h1>Perfil</h1>
            <Link to="/">Voltar ao Feed</Link>
        </header>

        <div style={{ border: "1px solid #333", borderRadius: 10, padding: 16, marginTop: 16 }}>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <img
                src={profile.avatar_url || "https://via.placeholder.com/72"}
                alt="Avatar"
                width={72}
                height={72}
                style={{ borderRadius: "50%", objectFit: "cover" }}
            />

            <div style={{ flex: 1 }}>
                <div style={{ fontWeight: "bold" }}>@{profile.username}</div>
                <div style={{ opacity: 0.85 }}>{profile.display_name || "(sem nome)"}</div>

                <div style={{ marginTop: 8, display: "flex", gap: 12 }}>
                <span>Seguidores: {profile.followers_count ?? 0}</span>
                <span>Seguindo: {profile.following_count ?? 0}</span>
                </div>
            </div>

            <div>
                {profile.is_following ? (
                <button disabled={busy} onClick={unfollow}>
                    {busy ? "..." : "Seguindo"}
                </button>
                ) : (
                <button disabled={busy} onClick={follow}>
                    {busy ? "..." : "Seguir"}
                </button>
                )}
            </div>
            </div>
        </div>

        <h2 style={{ marginTop: 20 }}>Posts</h2>

        {postsLoading && <p>Carregando posts...</p>}

        {!postsLoading && posts.length === 0 && <p>Esse usuário ainda não postou.</p>}

        <div>
            {posts.map((post) => (
            <div
                key={post.id}
                style={{
                border: "1px solid #333",
                borderRadius: 8,
                padding: 12,
                marginBottom: 12,
                }}
            >
                <strong>@{post.author_username}</strong>

                <p style={{ margin: "8px 0" }}>{post.content}</p>

                <small>{new Date(post.created_at).toLocaleString()}</small>

                <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 8 }}>
                <button onClick={() => toggleLike(post)}>
                    {post.liked_by_me ? "💙 Curtido" : "🤍 Curtir"}
                </button>
                <span>{post.likes_count ?? 0} curtidas</span>
                <span>💬 {post.comments_count ?? 0}</span>
                </div>
            </div>
            ))}
        </div>
        </div>
    );
}
