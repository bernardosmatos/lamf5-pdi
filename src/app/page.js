"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const router = useRouter();

  // Campos de Login
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showSenha, setShowSenha] = useState(false);

  // Verifica se o usuário já está logado
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push("/dashboard");
      } else {
        setLoading(false);
      }
    };
    checkUser();
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: "", text: "" });

    const emailTratado = email.trim().toLowerCase();

    try {
      const { error } = await supabase.auth.signInWithPassword({ email: emailTratado, password: senha });
      if (error) throw error;
      
      router.push("/dashboard");
    } catch (err) {
      let errorMsg = err.message;
      if (errorMsg.includes("Invalid login credentials")) errorMsg = "E-mail ou senha incorretos.";
      if (errorMsg.includes("Email not confirmed")) errorMsg = "Por favor, confirme seu e-mail antes de fazer login.";
      
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setIsSaving(false);
    }
  };

  const IconEyeOpen = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>;
  const IconEyeClosed = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>;

  const inputStyle = { padding: '14px 16px', fontSize: '15px', height: 'auto', borderRadius: '8px' };

  if (loading) {
    return <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--black)' }}><p style={{ color: 'var(--gold)', fontWeight: 'bold' }}>CARREGANDO...</p></div>;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--black)', padding: '20px' }}>
      
      <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '440px', padding: '40px', background: 'rgba(28, 28, 28, 0.9)', backdropFilter: 'blur(12px)', borderTop: '4px solid var(--gold)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '48px', height: '48px', background: 'var(--gold)', color: 'var(--black)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold', margin: '0 auto 16px' }}>L5</div>
          <h1 style={{ fontSize: '24px', color: 'var(--text-primary)', marginBottom: '8px' }}>Acesse sua conta</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Sistema de Gestão de PDI - LAMF5</p>
        </div>

        {message.text && (
          <div className="highlight-box mb-24" style={{ padding: '16px', fontSize: '14px', borderColor: message.type === 'error' ? 'var(--danger)' : 'var(--success)', color: message.type === 'error' ? 'var(--danger)' : 'var(--success)', borderLeftColor: message.type === 'error' ? 'var(--danger)' : 'var(--success)' }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group mb-20">
            <label className="form-label" style={{ fontSize: '14px' }}>E-mail cadastrado</label>
            <input type="email" className="form-input" required value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} placeholder="exemplo@email.com" />
          </div>

          <div className="form-group mb-20">
            <label className="form-label" style={{ fontSize: '14px' }}>Senha</label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <input 
                type={showSenha ? "text" : "password"} 
                className="form-input" 
                required 
                value={senha} 
                onChange={e => setSenha(e.target.value)} 
                style={{ ...inputStyle, paddingRight: "50px", width: "100%" }}
                placeholder="Sua senha de acesso"
              />
              <button 
                type="button" 
                onClick={() => setShowSenha(!showSenha)}
                style={{ position: "absolute", right: "14px", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", padding: 0 }}
              >
                {showSenha ? <IconEyeClosed /> : <IconEyeOpen />}
              </button>
            </div>
          </div>

          <button type="submit" className="topbar-btn primary w-full mt-8" style={{ padding: '16px', fontSize: '16px', fontWeight: 'bold', borderRadius: '8px' }} disabled={isSaving}>
            {isSaving ? "Entrando..." : "Entrar no Sistema"}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '32px', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Ainda não faz parte da Liga?</p>
          <button 
            type="button" 
            onClick={() => router.push('/cadastro')}
            style={{ background: 'none', border: 'none', color: 'var(--gold)', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px' }}
          >
            Criar meu acesso oficial
          </button>
        </div>

      </div>
    </div>
  );
}