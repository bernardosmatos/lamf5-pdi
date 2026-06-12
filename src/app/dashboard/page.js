"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard"); 
  const [userGoals, setUserGoals] = useState([]); 
  const router = useRouter();

  useEffect(() => {
    async function loadDashboard() {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) { router.push("/"); return; }
      setUser(user);

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setUserProfile(profile);

      const { data: myGoals } = await supabase.from('goals').select('*').eq('member_id', user.id).order('created_at', { ascending: false });
      if (myGoals) setUserGoals(myGoals);

      setLoading(false);
    }
    loadDashboard();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--black)' }}><p style={{ color: 'var(--gold)', fontWeight: 'bold', letterSpacing: '0.1em' }}>CARREGANDO SISTEMA PDI...</p></div>;
  }

  const nomeCompleto = userProfile?.nome_completo || "Membro";
  const primeiroNome = nomeCompleto.split(' ')[0];
  const iniciais = nomeCompleto.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  const diretoria = userProfile?.diretoria || "LAMF5";
  const cargo = userProfile?.perfil || "Estudante";
  const isAdmin = cargo === "Gestão de Pessoas" || cargo === "Presidência";

  const renderPainelCentral = () => (
    <div className="page active animate-fade-in">
      <div className="page-header">
        <div className="page-eyebrow">Visão Geral</div>
        <h1 className="page-title">Olá, {primeiroNome} 👋</h1>
        <p className="page-subtitle">Acompanhe seu desenvolvimento na Liga Acadêmica de Mercado Financeiro.</p>
      </div>
      
      <div className="grid-3 gap-24 mb-24">
        <div className="card" style={{ borderLeft: '4px solid var(--gold)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>📝</div>
          <h3 className="form-section-title mb-8" style={{ fontSize: '20px' }}>Questionário Oficial</h3>
          <p className="text-secondary mb-24" style={{ fontSize: '14px', lineHeight: '1.6', flex: 1 }}>
            Responda ao questionário completo para mapear seu perfil e objetivos de carreira. Esta etapa é obrigatória antes do seu 1:1.
          </p>
          <button onClick={() => router.push('/questionario')} className="topbar-btn primary w-full" style={{ padding: '14px', fontSize: '15px' }}>
            Acessar Questionário →
          </button>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>🧭</div>
          <h3 className="form-section-title mb-8" style={{ fontSize: '20px' }}>Quiz Vocacional</h3>
          <p className="text-secondary mb-24" style={{ fontSize: '14px', lineHeight: '1.6', flex: 1 }}>
            Descubra qual das 22 áreas do mercado financeiro mais combina com seu perfil técnico e psicológico.
          </p>
          <button onClick={() => router.push('/quiz')} className="topbar-btn w-full" style={{ padding: '14px', fontSize: '15px', border: '1px solid var(--gold)', color: 'var(--gold)' }}>
            Fazer o Teste Rápido
          </button>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>🎯</div>
          <h3 className="form-section-title mb-8" style={{ fontSize: '20px' }}>Minhas Metas</h3>
          <p className="text-secondary mb-24" style={{ fontSize: '14px', lineHeight: '1.6', flex: 1 }}>
            Você possui <strong className="text-gold">{userGoals.length}</strong> metas ou tarefas ativas definidas pela Gestão de Pessoas.
          </p>
          <button onClick={() => router.push('/dashboard/metas')} className="topbar-btn w-full" style={{ padding: '14px', fontSize: '15px' }}>
            Acessar Minhas Metas
          </button>
        </div>
      </div>
    </div>
  );

  const renderMeuPDI = () => (
    <div className="page active animate-fade-in">
      <div className="page-header">
        <div className="page-eyebrow">Módulo de Acompanhamento</div>
        <h1 className="page-title">Meu PDI</h1>
      </div>
      <div className="empty-state card">
        <div className="empty-icon">🏗️</div>
        <div className="empty-title">Em Construção</div>
        <div className="empty-desc">Esta aba abrigará o seu plano de desenvolvimento interativo em breve.</div>
      </div>
    </div>
  );

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">L5</div>
          <div className="logo-text"><span className="logo-title">Sistema LAMF5</span><span className="logo-sub">Gestão de Pessoas</span></div>
        </div>
        
        <div className="sidebar-user">
          <div className="inline-row">
            <div className="avatar avatar-sm">{iniciais}</div>
            <div><div className="user-name">{nomeCompleto}</div><div className="user-role">{cargo}</div></div>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-label">Meu Espaço</div>
            <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
              <svg className="nav-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h6v6H4zm10 0h6v6h-6zM4 14h6v6H4zm10 0h6v6h-6z"/></svg> Painel Central
            </div>
            
            <div className="nav-item" onClick={() => router.push('/dashboard/meuperfil')}>
              <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg> Meu Perfil
            </div>

            <div className="nav-item" onClick={() => router.push('/questionario')}>
              <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg> Questionário Oficial
            </div>

            <div className="nav-item" onClick={() => router.push('/quiz')}>
              <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg> Quiz Vocacional
            </div>

            <div className={`nav-item ${activeTab === 'meu_pdi' ? 'active' : ''}`} onClick={() => setActiveTab('meu_pdi')}>
              <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg> Meu PDI
            </div>
            
            <div className="nav-item" onClick={() => router.push('/dashboard/metas')}>
              <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg> Minhas Metas
            </div>
          </div>
          
          {isAdmin && (
            <div className="nav-section" style={{ marginTop: '24px' }}>
              <div className="nav-label">Administração</div>
              <div className="nav-item" onClick={() => router.push('/administrador')}>
                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg> 
                Painel Admin
                <span className="nav-badge">GP</span>
              </div>
            </div>
          )}
        </nav>
      </aside>
      
      <main className="main">
        <header className="topbar">
          <div className="topbar-breadcrumb">
            <span>Sistema LAMF5</span><span>›</span><span className="current" style={{ textTransform: 'capitalize' }}>{activeTab === 'dashboard' ? 'Painel Central' : activeTab.replace("_", " ")}</span>
          </div>
          <div className="topbar-right"><button className="topbar-btn" onClick={handleLogout}>Sair do Sistema</button></div>
        </header>
        
        <div className="scroll-area" style={{ flex: 1 }}>
          {activeTab === 'dashboard' && renderPainelCentral()}
          {activeTab === 'meu_pdi' && renderMeuPDI()}
        </div>
      </main>
    </div>
  );
}