"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase"; 
import { useRouter } from "next/navigation";

const DIRETORIAS = [
  "Presidente",
  "Vice Presidente",
  "Projetos",
  "Qualidade",
  "Gestão de Pessoas",
  "Comunicação"
];

export default function MeuPerfilPage() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const router = useRouter();

  // Campos do formulário
  const [nome, setNome] = useState("");
  const [diretoria, setDiretoria] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  // Visibilidade das senhas
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);

  useEffect(() => {
    async function loadData() {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) { router.push("/"); return; }
      
      setUser(user);
      setEmail(user.email);

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (profile) {
        setUserProfile(profile);
        setNome(profile.nome_completo || "");
        setDiretoria(profile.diretoria || "");
      }

      setLoading(false);
    }
    loadData();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: "", text: "" });

    // Validação de segurança: Verifica se as senhas batem ANTES de salvar
    if (senha && senha !== confirmarSenha) {
      setMessage({ type: "error", text: "As senhas não coincidem. Verifique a digitação." });
      setIsSaving(false);
      return;
    }

    try {
      // 1. Atualizar Profile (Nome e Diretoria)
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ nome_completo: nome, diretoria: diretoria })
        .eq('id', user.id);
      
      if (profileError) throw profileError;

      // 2. Atualizar Auth (Email e Senha) no Supabase
      const authUpdates = {};
      if (email !== user.email) authUpdates.email = email;
      if (senha) authUpdates.password = senha;

      if (Object.keys(authUpdates).length > 0) {
        const { error: authError } = await supabase.auth.updateUser(authUpdates);
        if (authError) throw authError;
      }

      setMessage({ type: "success", text: "Perfil atualizado com sucesso! (Se alterou o e-mail, verifique sua caixa de entrada)." });
      setSenha(""); 
      setConfirmarSenha("");

    } catch (err) {
      setMessage({ type: "error", text: err.message || "Erro ao atualizar perfil." });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--black)' }}><p style={{ color: 'var(--gold)', fontWeight: 'bold' }}>CARREGANDO PERFIL...</p></div>;

  const nomeCompleto = userProfile?.nome_completo || "Membro";
  const iniciais = nomeCompleto.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  const cargo = userProfile?.perfil || "Estudante";

  // Ícones de Olho para a senha (Tamanho aumentado para 22px)
  const IconEyeOpen = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>;
  const IconEyeClosed = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>;

  // Estilo base para aumentar os inputs
  const inputStyle = { padding: '16px 20px', fontSize: '16px', height: 'auto', borderRadius: '10px' };

  return (
    <div style={{ minHeight: "100vh", background: "var(--black)", display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 20px" }}>
      
      {/* CABEÇALHO SUPERIOR LIMPO */}
      <div style={{ width: "100%", maxWidth: "1000px", marginBottom: "40px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <button onClick={() => router.push('/dashboard')} className="topbar-btn mb-16" style={{ fontSize: '14px', padding: '10px 20px' }}>← Voltar ao Dashboard</button>
          <h1 className="page-title" style={{ fontSize: "36px" }}>Meu Perfil</h1>
          <p className="page-subtitle" style={{ fontSize: "16px" }}>Atualize seus dados pessoais e credenciais de segurança.</p>
        </div>
        <button className="topbar-btn" style={{ fontSize: '15px', padding: '12px 24px' }} onClick={handleLogout}>Sair do Sistema</button>
      </div>

      <div style={{ width: "100%", maxWidth: "1000px" }}>
        <div className="grid-2-1 gap-32">
          
          {/* FORMULÁRIO DE EDIÇÃO */}
          <div className="form-section" style={{ background: 'rgba(28, 28, 28, 0.8)', backdropFilter: 'blur(12px)', padding: '40px' }}>
            <form onSubmit={handleSave}>
              
              {message.text && (
                <div className="highlight-box mb-32" style={{ padding: '20px', fontSize: '15px', borderColor: message.type === 'error' ? 'var(--danger)' : 'var(--success)', color: message.type === 'error' ? 'var(--danger)' : 'var(--success)', borderLeftColor: message.type === 'error' ? 'var(--danger)' : 'var(--success)' }}>
                  {message.text}
                </div>
              )}

              <h3 className="form-section-title mb-20" style={{ fontSize: '20px' }}>Dados do Membro</h3>
              <div className="form-group mb-24">
                <label className="form-label" style={{ fontSize: '15px' }}>Nome Completo</label>
                <input className="form-input" required value={nome} onChange={e => setNome(e.target.value)} style={inputStyle} />
              </div>
              <div className="form-group mb-40">
                <label className="form-label" style={{ fontSize: '15px' }}>Diretoria Atual</label>
                <select className="form-select" required value={diretoria} onChange={e => setDiretoria(e.target.value)} style={inputStyle}>
                  <option value="">Selecione...</option>
                  {DIRETORIAS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <h3 className="form-section-title mb-20" style={{ fontSize: '20px', borderTop: '1px solid var(--border)', paddingTop: '32px' }}>Segurança & Acesso</h3>
              <div className="form-group mb-24">
                <label className="form-label" style={{ fontSize: '15px' }}>E-mail de Login</label>
                <input type="email" className="form-input" required value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
              </div>
              
              <div className="grid-2 gap-20 mb-40">
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '15px' }}>Nova Senha</label>
                  <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                    <input 
                      type={showSenha ? "text" : "password"} 
                      className="form-input" 
                      placeholder="Deixe em branco para manter" 
                      value={senha} 
                      onChange={e => setSenha(e.target.value)} 
                      style={{ ...inputStyle, paddingRight: "55px", width: "100%" }}
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowSenha(!showSenha)}
                      style={{ position: "absolute", right: "16px", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", padding: 0 }}
                    >
                      {showSenha ? <IconEyeClosed /> : <IconEyeOpen />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '15px' }}>Confirmar Nova Senha</label>
                  <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                    <input 
                      type={showConfirmarSenha ? "text" : "password"} 
                      className="form-input" 
                      placeholder="Repita a senha digitada" 
                      value={confirmarSenha} 
                      onChange={e => setConfirmarSenha(e.target.value)} 
                      disabled={!senha} // Desabilita se não tiver escrevendo uma senha nova
                      style={{ ...inputStyle, paddingRight: "55px", width: "100%", opacity: !senha ? 0.5 : 1 }}
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowConfirmarSenha(!showConfirmarSenha)}
                      disabled={!senha}
                      style={{ position: "absolute", right: "16px", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", padding: 0 }}
                    >
                      {showConfirmarSenha ? <IconEyeClosed /> : <IconEyeOpen />}
                    </button>
                  </div>
                </div>
              </div>

              <button type="submit" className="topbar-btn primary w-full" style={{ padding: '18px', fontSize: '18px', fontWeight: 'bold', borderRadius: '10px' }} disabled={isSaving}>
                {isSaving ? "Salvando Alterações..." : "Salvar Alterações do Perfil"}
              </button>
            </form>
          </div>

          {/* CARTÃO RESUMO DO LADO DIREITO */}
          <div>
            <div className="card" style={{ padding: '40px 24px', textAlign: 'center' }}>
              <div className="avatar mx-auto mb-20" style={{ width: '120px', height: '120px', fontSize: '40px' }}>{iniciais}</div>
              <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px', fontSize: '24px' }}>{nomeCompleto}</h3>
              <p style={{ color: 'var(--gold)', fontSize: '16px', marginBottom: '24px', fontWeight: '500' }}>{diretoria}</p>
              <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.05)', padding: '8px 16px', borderRadius: '20px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                Nível de Acesso: {cargo}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}