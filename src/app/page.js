"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase"; // Correct path for root page
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Credenciais incorretas. Verifique seu e-mail e senha.");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--black)' }}>
      <div style={{ background: 'var(--surface)', padding: '40px', borderRadius: '12px', border: '1px solid var(--border)', width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 className="page-title" style={{ fontSize: '28px', color: 'var(--gold)' }}>Sistema LAMF5</h1>
          <p className="page-subtitle">Acesso restrito a membros</p>
        </div>

        {error && (
          <div className="highlight-box" style={{ borderColor: 'var(--danger)', color: 'var(--danger)', marginBottom: '20px', borderLeftColor: 'var(--danger)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">E-mail da Liga</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="membro@lamf5.com.br"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="••••••••"
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <a href="#" style={{ fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'none' }}>Esqueci minha senha</a>
          </div>

          <button type="submit" className="topbar-btn primary" disabled={loading} style={{ marginTop: '8px', padding: '12px' }}>
            {loading ? "Autenticando..." : "Entrar no Sistema"}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)' }}>
          Ainda não tem acesso?{" "}
          <Link href="/cadastro" style={{ color: 'var(--gold)', fontWeight: '600', textDecoration: 'none' }}>
            Cadastrar-se
          </Link>
        </div>
      </div>
    </div>
  );
}