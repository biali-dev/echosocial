import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../auth/AuthContext";

export default function Feed() {
    const { user, logout } = useAuth();

    const [posts, setPosts] = useState([]);
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(true);

    // Comentários
    const [openComments, setOpenComments] = useState({}); // { [postId]: boolean }
    const [commentsByPost, setCommentsByPost] = useState({}); // { [postId]: Comment[] }
    const [commentText, setCommentText] = useState({}); // { [postId]: string }
    const [commentsLoading, setCommentsLoading] = useState({}); // { [postId]: boolean }

    async function loadFeed() {
        try {
        const res = await api.get("feed");
        setPosts(res.data);
        } catch (err) {
        console.error("Erro ao carregar feed", err);
        } finally {
        setLoading(false);
        }
    }

    async function createPost(e) {
        e.preventDefault();
        if (!content.trim()) return;

        try {
        await api.post("posts", { content });
        setContent("");
        loadFeed();
        } catch (err) {
        console.error("Erro ao criar post", err);
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
                ? {
                    ...p,
                    liked_by_me: false,
                    likes_count: Math.max(0, current - 1),
                    }
                : p
            )
            );
        } else {
            await api.post(`posts/${post.id}/like`);
            setPosts((prev) =>
            prev.map((p) =>
                p.id === post.id
                ? {
                    ...p,
                    liked_by_me: true,
                    likes_count: current + 1,
                    }
                : p
            )
            );
        }
        } catch (err) {
        console.error("Erro ao dar like", err);
        }
    }

    async function loadComments(postId) {
        try {
        setCommentsLoading((prev) => ({ ...prev, [postId]: true }));
        const res = await api.get(`posts/${postId}/comments`);
        setCommentsByPost((prev) => ({ ...prev, [postId]: res.data }));
        } catch (err) {
        console.error("Erro ao carregar comentários", err);
        } finally {
        setCommentsLoading((prev) => ({ ...prev, [postId]: false }));
        }
    }

    function toggleComments(postId) {
        setOpenComments((prev) => {
        const nextOpen = !prev[postId];

        // se vai abrir e ainda não carregou comentários, carrega
        if (nextOpen && !commentsByPost[postId]) {
            loadComments(postId);
        }

        return { ...prev, [postId]: nextOpen };
        });
    }

    async function createComment(postId) {
        try {
        const text = (commentText[postId] || "").trim();
        if (!text) return;

        await api.post(`posts/${postId}/comments`, { content: text });

        // limpa input
        setCommentText((prev) => ({ ...prev, [postId]: "" }));

        // atualiza lista
        await loadComments(postId);

        // atualiza contagem no card (se o backend estiver retornando comments_count)
        setPosts((prev) =>
            prev.map((p) =>
            p.id === postId
                ? { ...p, comments_count: (p.comments_count ?? 0) + 1 }
                : p
            )
        );
        } catch (err) {
        console.error("Erro ao comentar", err);
        }
    }

    useEffect(() => {
        loadFeed();
    }, []);

    return (
        <div style={{ maxWidth: 600, margin: "40px auto" }}>
        {/* Header */}
        <header 
            style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            }}
        >
            <h1>Feed</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link to="/users">Explorar</Link>
            <Link to="/profile">Perfil</Link>
            <span>Olá, {user?.username}</span>
            <button onClick={logout}>Sair</button>
            </div>
        </header>

        {/* Criar post */}
        <form onSubmit={createPost} style={{ margin: "20px 0" }}>
            <textarea
            rows={3}
            maxLength={280}
            placeholder="O que está acontecendo?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{ width: "100%", padding: 10 }}
            />
            <button style={{ marginTop: 10 }}>Postar</button>
        </form>

        {/* Feed */}
        {loading && <p>Carregando feed...</p>}

        {!loading && posts.length === 0 && (
            <p>Nenhum post ainda. Siga alguém ou crie o primeiro 🙂</p>
        )}

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
                <Link to={`/users/${post.author_id}`} style={{ fontWeight: "bold" }}>
                    @{post.author_username}
                </Link>

                <p style={{ margin: "8px 0" }}>{post.content}</p>

                <small>{new Date(post.created_at).toLocaleString()}</small>

                {/* Ações */}
                <div
                style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "center",
                    marginTop: 8,
                    flexWrap: "wrap",
                }}
                >
                <button onClick={() => toggleLike(post)}>
                    {post.liked_by_me ? "💙 Curtido" : "🤍 Curtir"}
                </button>
                <span>{post.likes_count ?? 0} curtidas</span>

                <button onClick={() => toggleComments(post.id)}>
                    💬 Comentários ({post.comments_count ?? 0})
                </button>
                </div>

                {/* Comentários */}
                {openComments[post.id] && (
                <div style={{ marginTop: 10 }}>
                    {commentsLoading[post.id] && <p>Carregando comentários...</p>}

                    {!commentsLoading[post.id] &&
                    (commentsByPost[post.id] || []).map((c) => (
                        <div
                        key={c.id}
                        style={{
                            borderTop: "1px solid #ddd",
                            paddingTop: 6,
                            marginTop: 6,
                        }}
                        >
                        <strong>@{c.user_username}</strong>
                        <p style={{ margin: "4px 0" }}>{c.content}</p>
                        <small>{new Date(c.created_at).toLocaleString()}</small>
                        </div>
                    ))}

                    <div style={{ marginTop: 10 }}>
                    <input
                        placeholder="Escreva um comentário…"
                        value={commentText[post.id] || ""}
                        onChange={(e) =>
                        setCommentText((prev) => ({
                            ...prev,
                            [post.id]: e.target.value,
                        }))
                        }
                        style={{ width: "100%", padding: 8 }}
                    />
                    <button
                        style={{ marginTop: 8 }}
                        onClick={() => createComment(post.id)}
                    >
                        Comentar
                    </button>
                    </div>
                </div>
                )}
            </div>
            ))}
        </div>
        </div>
    );
}
