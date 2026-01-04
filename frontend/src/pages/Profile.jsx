import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../auth/AuthContext";

export default function Profile() {
    const { user, logout } = useAuth();

    const [me, setMe] = useState(null);
    const [displayName, setDisplayName] = useState("");
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);

    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [showFollowers, setShowFollowers] = useState(false);
    const [showFollowing, setShowFollowing] = useState(false);

    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    async function loadMe() {
        const res = await api.get("me");
        setMe(res.data);
        setDisplayName(res.data.display_name || "");
    }

    async function loadFollowersAndFollowing(userId) {
        const [folRes, ingRes] = await Promise.all([
        api.get(`users/${userId}/followers`),
        api.get(`users/${userId}/following`),
        ]);
        setFollowers(folRes.data);
        setFollowing(ingRes.data);
    }

    useEffect(() => {
        (async () => {
        try {
            await loadMe();
        } catch (err) {
            console.error("Erro ao carregar perfil", err);
        } finally {
            setLoading(false);
        }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!me?.id) return;
        loadFollowersAndFollowing(me.id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [me?.id]);

    function handleAvatarChange(e) {
        const file = e.target.files?.[0];
        setAvatarFile(file || null);

        if (file) {
        const url = URL.createObjectURL(file);
        setAvatarPreview(url);
        } else {
        setAvatarPreview(null);
        }
    }

    async function handleSave(e) {
        e.preventDefault();
        setSaving(true);

        try {
        const form = new FormData();

        // tudo opcional (seu requisito)
        if (displayName !== (me?.display_name || "")) {
            form.append("display_name", displayName);
        }
        if (avatarFile) {
            form.append("avatar", avatarFile);
        }

        // Se nada foi alterado, não faz request
        if ([...form.keys()].length === 0) {
            setSaving(false);
            return;
        }

        const res = await api.patch("me", form, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        setMe(res.data);
        setAvatarFile(null);
        setAvatarPreview(null);

        // recarrega listas/contagens
        await loadFollowersAndFollowing(res.data.id);
        } catch (err) {
        console.error("Erro ao salvar perfil", err);
        } finally {
        setSaving(false);
        }
    }

    if (loading) return <p style={{ maxWidth: 600, margin: "40px auto" }}>Carregando perfil...</p>;

    return (
        <div style={{ maxWidth: 600, margin: "40px auto" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h1>Perfil</h1>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <span>@{user?.username}</span>
            <button onClick={logout}>Sair</button>
            </div>
        </header>

        {/* Card do perfil */}
        <div style={{ border: "1px solid #333", borderRadius: 10, padding: 16, marginTop: 16 }}>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <img
                src={avatarPreview || me?.avatar_url || "https://via.placeholder.com/72"}
                alt="Avatar"
                width={72}
                height={72}
                style={{ borderRadius: "50%", objectFit: "cover" }}
            />

            <div style={{ flex: 1 }}>
                <div style={{ fontWeight: "bold" }}>@{me?.username}</div>
                <div style={{ opacity: 0.85 }}>{me?.display_name || "(sem nome)"}</div>

                <div style={{ marginTop: 8, display: "flex", gap: 12 }}>
                <button onClick={() => { setShowFollowers((v) => !v); setShowFollowing(false); }}>
                    Seguidores ({me?.followers_count ?? 0})
                </button>
                <button onClick={() => { setShowFollowing((v) => !v); setShowFollowers(false); }}>
                    Seguindo ({me?.following_count ?? 0})
                </button>
                </div>
            </div>
            </div>

            {/* Form de edição */}
            <form onSubmit={handleSave} style={{ marginTop: 16 }}>
            <label style={{ display: "block", marginBottom: 6 }}>Nome (display_name)</label>
            <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Seu nome público"
                style={{ width: "100%", padding: 10, marginBottom: 12 }}
            />

            <label style={{ display: "block", marginBottom: 6 }}>Foto de perfil</label>
            <input type="file" accept="image/*" onChange={handleAvatarChange} />

            <div style={{ marginTop: 12 }}>
                <button disabled={saving}>{saving ? "Salvando..." : "Salvar alterações"}</button>
            </div>
            </form>
        </div>

        {/* Listas */}
        {showFollowers && (
            <div style={{ marginTop: 16 }}>
            <h2>Seguidores</h2>
            {followers.length === 0 && <p>Nenhum seguidor ainda.</p>}
            {followers.map((u) => (
                <div key={u.id} style={{ padding: 10, borderBottom: "1px solid #ddd" }}>
                @{u.username}
                </div>
            ))}
            </div>
        )}

        {showFollowing && (
            <div style={{ marginTop: 16 }}>
            <h2>Seguindo</h2>
            {following.length === 0 && <p>Você ainda não segue ninguém.</p>}
            {following.map((u) => (
                <div key={u.id} style={{ padding: 10, borderBottom: "1px solid #ddd" }}>
                @{u.username}
                </div>
            ))}
            </div>
        )}
        </div>
    );
}
