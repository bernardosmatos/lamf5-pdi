"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

// --- MAPEAMENTO DOS NÍVEIS E OUTLIERS ---
const NIVEL_MAP = {
  "iniciante": "Iniciante",
  "basico": "Básico",
  "intermediario": "Intermediário",
  "avancado": "Avançado"
};

const COMPORTAMENTAL_MAP = {
  c_oral: "Comunicação Oral", c_escrita: "Comunicação Escrita", c_equipe: "Trabalho em Equipe",
  c_lider: "Liderança", c_proat: "Proatividade", c_org: "Organização e Tempo",
  c_resil: "Resiliência", c_analise: "Pensamento Analítico", c_net: "Networking"
};

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [allStudents, setAllStudents] = useState([]);
  const [allQuestionnaires, setAllQuestionnaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard"); 
  const router = useRouter();

  // Controles do Admin
  const [adminView, setAdminView] = useState("list"); // "list", "goals", "questionnaire"
  const [editingUserId, setEditingUserId] = useState(null);
  const [editingUserName, setEditingUserName] = useState("");
  
  // Metas
  const [userGoals, setUserGoals] = useState([]); 
  const [adminStudentGoals, setAdminStudentGoals] = useState([]); 
  const [newGoal, setNewGoal] = useState({ title: "", description: "", deadline: "" });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadDashboard() {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) { router.push("/"); return; }
      setUser(user);

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setUserProfile(profile);

      // Carrega Metas do Estudante Logado
      const { data: myGoals } = await supabase.from('goals').select('*').eq('member_id', user.id).order('created_at', { ascending: false });
      if (myGoals) setUserGoals(myGoals);

      // Se for Admin, busca a lista de todos os alunos e questionários respondidos
      if (profile?.perfil === "Gestão de Pessoas" || profile?.perfil === "Presidência") {
        const { data: students } = await supabase.from('profiles').select('*');
        setAllStudents(students || []);

        const { data: qs } = await supabase.from('questionario_completo').select('*');
        setAllQuestionnaires(qs || []);
      }

      setLoading(false);
    }
    loadDashboard();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  // --- FUNÇÕES DO ADMIN ---
  const handleViewQuestionnaire = (studentId, studentName) => {
    setEditingUserId(studentId);
    setEditingUserName(studentName);
    setAdminView("questionnaire");
  };

  const handleUnlockQuestionnaire = async (studentId, studentName) => {
    if (!confirm(`Tem certeza que deseja apagar o questionário de ${studentName} e permitir que ele refaça? Essa ação não pode ser desfeita.`)) return;
    
    await supabase.from('questionario_completo').delete().eq('member_id', studentId);
    setAllQuestionnaires(allQuestionnaires.filter(q => q.member_id !== studentId));
    alert("Liberado com sucesso! O membro já pode refazer o questionário.");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleManageStudentGoals = async (studentId, studentName) => {
    setLoading(true);
    setEditingUserId(studentId);
    setEditingUserName(studentName);
    setAdminView("goals");

    const { data: stdGoals } = await supabase.from('goals').select('*').eq('member_id', studentId).order('created_at', { ascending: false });
    setAdminStudentGoals(stdGoals || []);
    
    setLoading(false);
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const payload = { member_id: editingUserId, title: newGoal.title, description: newGoal.description, deadline: newGoal.deadline, status: "Pendente" };
    const { data, error } = await supabase.from('goals').insert([payload]).select();
    
    if (!error && data) {
      setAdminStudentGoals([data[0], ...adminStudentGoals]);
      setNewGoal({ title: "", description: "", deadline: "" });
    } else {
      alert("Erro ao criar meta.");
    }
    setIsSaving(false);
  };

  const handleDeleteGoal = async (goalId) => {
    if(!confirm("Tem certeza que deseja excluir esta meta?")) return;
    await supabase.from('goals').delete().eq('id', goalId);
    setAdminStudentGoals(adminStudentGoals.filter(g => g.id !== goalId));
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

  // ============================================================================
  // ABAS PRINCIPAIS DO ESTUDANTE
  // ============================================================================

  const renderPainelCentral = () => (
    <div className="page active animate-fade-in no-print">
      <div className="page-header">
        <div className="page-eyebrow">Visão Geral</div>
        <h1 className="page-title">Olá, {primeiroNome} 👋</h1>
        <p className="page-subtitle">Acompanhe seu desenvolvimento na Liga Acadêmica de Mercado Financeiro.</p>
      </div>
      
      <div className="grid-2 gap-24 mb-24">
        <div className="card" style={{ borderLeft: '4px solid var(--gold)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>📝</div>
          <h3 className="form-section-title mb-8" style={{ fontSize: '20px' }}>Questionário Oficial PDI</h3>
          <p className="text-secondary mb-24" style={{ fontSize: '14px', lineHeight: '1.6', flex: 1 }}>
            Responda ao questionário completo para mapear seu perfil e objetivos de carreira. Esta etapa é obrigatória antes do seu 1:1.
          </p>
          <button onClick={() => router.push('/questionario')} className="topbar-btn primary w-full" style={{ padding: '14px', fontSize: '15px' }}>
            Acessar Questionário →
          </button>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>🎯</div>
          <h3 className="form-section-title mb-8" style={{ fontSize: '20px' }}>Minhas Metas</h3>
          <p className="text-secondary mb-24" style={{ fontSize: '14px', lineHeight: '1.6', flex: 1 }}>
            Você possui <strong className="text-gold">{userGoals.length}</strong> metas ou tarefas ativas definidas pela Gestão de Pessoas.
          </p>
          <button onClick={() => setActiveTab('metas')} className="topbar-btn w-full" style={{ padding: '14px', fontSize: '15px' }}>
            Visualizar Minhas Metas
          </button>
        </div>
      </div>
    </div>
  );

  const renderMeuPDI = () => (
    <div className="page active animate-fade-in no-print">
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

  const renderMetas = () => (
    <div className="page active animate-fade-in no-print">
      <div className="page-header">
        <div className="page-eyebrow">Gestão de Entregas</div>
        <h1 className="page-title">Minhas Metas</h1>
        <p className="page-subtitle">Tarefas definidas pela Gestão de Pessoas para o seu desenvolvimento.</p>
      </div>

      {userGoals.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-icon">🎯</div>
          <div className="empty-title">Nenhuma meta ativa</div>
          <div className="empty-desc">A Gestão de Pessoas ainda não definiu suas metas oficiais para este ciclo.</div>
        </div>
      ) : (
        <div className="grid-2 gap-16">
          {userGoals.map(goal => (
            <div key={goal.id} className="smart-card">
              <div className="smart-header">
                <div>
                  <div className="smart-title">🎯 {goal.title}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>Prazo: {new Date(goal.deadline).toLocaleDateString('pt-BR')}</div>
                </div>
                <span className={`badge ${goal.status === 'Pendente' ? 'badge-warning' : 'badge-success'}`}>{goal.status}</span>
              </div>
              <div className="smart-body"><p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{goal.description}</p></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ============================================================================
  // ABA ADMIN: VISUALIZAÇÃO DE RESPOSTAS E RESUMÃO
  // ============================================================================
  
  const renderQuestionnaireView = () => {
    const questionario = allQuestionnaires.find(q => q.member_id === editingUserId);
    
    if (!questionario) {
      return (
        <div className="page active animate-fade-in no-print">
          <div className="page-header">
            <button onClick={() => setAdminView("list")} className="topbar-btn mb-20">← Voltar para lista</button>
            <h1 className="page-title text-gold">Diagnóstico: {editingUserName}</h1>
          </div>
          <div className="empty-state card">O membro ainda não respondeu o questionário oficial.</div>
        </div>
      );
    }

    const r = questionario.respostas;

    // Calcular Outliers (1 = Fraco, 5 = Forte)
    const pontosFortes = [];
    const pontosCriticos = [];
    Object.keys(COMPORTAMENTAL_MAP).forEach(key => {
      if (r[key] === 5) pontosFortes.push(COMPORTAMENTAL_MAP[key]);
      if (r[key] === 1) pontosCriticos.push(COMPORTAMENTAL_MAP[key]);
    });

    return (
      <div className="page active animate-fade-in print-area" style={{background: 'var(--black)', padding: '20px'}}>
        
        {/* CSS MÁGICO PARA O PDF */}
        <style>{`
          @media print { 
            .no-print { display: none !important; } 
            body { background: white !important; color: black !important; } 
            .print-area { background: white !important; padding: 0 !important; border: none !important; } 
            * { color: black !important; }
            .print-section { border-bottom: 1px solid #ddd; margin-bottom: 20px; padding-bottom: 10px; page-break-inside: avoid; }
            .print-item { font-size: 14px; margin-bottom: 6px; }
            .print-title { font-size: 18px; font-weight: bold; margin-bottom: 12px; color: #333 !important; }
          }
        `}</style>

        {/* --- SITE NORMAL (no-print) --- */}
        <div className="page-header no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <button onClick={() => setAdminView("list")} className="topbar-btn mb-20">← Voltar para lista</button>
            <div className="page-eyebrow">Diagnóstico Oficial Preenchido</div>
            <h1 className="page-title text-gold">Respostas de {editingUserName}</h1>
          </div>
          <div style={{display: 'flex', gap: '12px'}}>
            <button className="topbar-btn" onClick={handlePrint}>Exportar PDF</button>
            <button className="topbar-btn primary" onClick={() => handleManageStudentGoals(editingUserId, editingUserName)}>Definir Metas →</button>
          </div>
        </div>

        {/* ---------------- ESTRUTURA INVISÍVEL NA TELA, MAS QUE APARECE NO PDF ---------------- */}
        <div className="print-only" style={{ display: 'none' }}>
          <div style={{ textAlign: 'center', borderBottom: '2px solid black', paddingBottom: '15px', marginBottom: '25px' }}>
            <h1 style={{ fontSize: '26px', margin: 0, fontWeight: 'bold' }}>Plano de Desenvolvimento Individual</h1>
            <h2 style={{ fontSize: '18px', fontWeight: 'normal', margin: '8px 0 0' }}>Liga Acadêmica de Mercado Financeiro (LAMF5)</h2>
          </div>

          <div className="print-section">
            <h3 className="print-title">Bloco 1: Contexto Pessoal</h3>
            <p className="print-item"><strong>Nome Completo:</strong> {r.nome}</p>
            <p className="print-item"><strong>Curso/Período:</strong> {r.curso} - {r.periodo}º Período</p>
            <p className="print-item"><strong>CRA:</strong> {r.cra || "Não informado"}</p>
            <p className="print-item"><strong>Entrada na Liga:</strong> {r.entrada_liga}</p>
            <p className="print-item"><strong>Experiência Profissional:</strong> {r.exp_profissional}</p>
            <p className="print-item"><strong>Horas Disponíveis:</strong> {r.horas_disp}</p>
          </div>

          <div className="print-section">
            <h3 className="print-title">Bloco 2 & 3: Triagem e Destaques Técnicos</h3>
            <p className="print-item"><strong>Trilha Nivelada:</strong> {r.nivel?.toUpperCase()}</p>
            <p className="print-item"><strong>Três pontos fortes:</strong> {r.tec_in_fortes || r.tec_mid_fortes || r.tec_adv_fortes || "Não preenchido"}</p>
            <p className="print-item"><strong>Três pontos a melhorar:</strong> {r.tec_in_melhorar || r.tec_mid_melhorar || r.tec_adv_melhorar || "Não preenchido"}</p>
            {r.tec_adv_descarte && <p className="print-item"><strong>Áreas Descartadas:</strong> {r.tec_adv_descarte}</p>}
          </div>

          <div className="print-section">
            <h3 className="print-title">Bloco 4: Avaliação Comportamental</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <p className="print-item"><strong>Comunicação Oral:</strong> {r.c_oral}/5</p>
              <p className="print-item"><strong>Comunicação Escrita:</strong> {r.c_escrita}/5</p>
              <p className="print-item"><strong>Trabalho em Equipe:</strong> {r.c_equipe}/5</p>
              <p className="print-item"><strong>Liderança:</strong> {r.c_lider}/5</p>
              <p className="print-item"><strong>Proatividade:</strong> {r.c_proat}/5</p>
              <p className="print-item"><strong>Organização e Tempo:</strong> {r.c_org}/5</p>
              <p className="print-item"><strong>Resiliência:</strong> {r.c_resil}/5</p>
              <p className="print-item"><strong>Pensamento Analítico:</strong> {r.c_analise}/5</p>
              <p className="print-item"><strong>Networking:</strong> {r.c_net}/5</p>
            </div>
            <p className="print-item" style={{ marginTop: '12px' }}><strong>Método STAR (Situação Difícil):</strong><br/>{r.c_star}</p>
          </div>

          <div className="print-section">
            <h3 className="print-title">Bloco 5: Direção de Carreira</h3>
            <p className="print-item"><strong>Áreas de Interesse:</strong> {(r.d_areas || []).join(', ')}</p>
            <p className="print-item"><strong>Empresa dos Sonhos:</strong> {r.d_empresa}</p>
            <p className="print-item"><strong>Visão 1 Ano:</strong> {r.d_1ano}</p>
            <p className="print-item"><strong>Visão 3 Anos:</strong> {r.d_3anos}</p>
            <p className="print-item"><strong>Visão 5 Anos:</strong> {r.d_5anos}</p>
            <p className="print-item"><strong>Profissional Admira:</strong> {r.d_admira || "Nenhum"}</p>
          </div>

          <div className="print-section">
            <h3 className="print-title">Bloco 6: Metas Concretas (Próximos 6 meses)</h3>
            <p className="print-item"><strong>Acadêmicas:</strong><br/>1. {r.m_acad_1}<br/>2. {r.m_acad_2}<br/>3. {r.m_acad_3}</p>
            <p className="print-item"><strong>Certificações/Cursos:</strong><br/>1. {r.m_cert_1}<br/>2. {r.m_cert_2}<br/>3. {r.m_cert_3}</p>
            <p className="print-item"><strong>Profissionais:</strong><br/>1. {r.m_prof_1}<br/>2. {r.m_prof_2}<br/>3. {r.m_prof_3}</p>
            {r.m_pes_1 && <p className="print-item"><strong>Pessoais:</strong> 1. {r.m_pes_1}</p>}
          </div>

          <div className="print-section">
            <h3 className="print-title">Bloco 7: Reflexões</h3>
            <p className="print-item" style={{marginBottom:'12px'}}><strong>Por que entrou na LAMF5 e o que espera?</strong><br/>{r.r_motivo}</p>
            <p className="print-item" style={{marginBottom:'12px'}}><strong>Se em 1 ano fosse sucesso, o que teria mudado?</strong><br/>{r.r_sucesso}</p>
            <p className="print-item" style={{marginBottom:'12px'}}><strong>O que mais te frustra hoje?</strong><br/>{r.r_frustra}</p>
            <p className="print-item" style={{marginBottom:'12px'}}><strong>Estudo por iniciativa própria:</strong><br/>{r.r_iniciativa}</p>
            <p className="print-item" style={{marginBottom:'12px'}}><strong>O que impede de estudar mais?</strong><br/>{r.r_impede}</p>
            <p className="print-item" style={{marginBottom:'12px'}}><strong>Como aprende melhor?</strong><br/>{r.r_aprende}</p>
            {r.r_mudar && <p className="print-item"><strong>O que mudaria imediatamente:</strong><br/>{r.r_mudar}</p>}
          </div>

          <div className="print-section" style={{ borderBottom: 'none' }}>
            <h3 className="print-title">Bloco 8: Logística 1:1</h3>
            <p className="print-item"><strong>Disponibilidade (Dias/Horas):</strong> {r.log_disp}</p>
            <p className="print-item"><strong>Formato:</strong> {r.log_formato}</p>
            <p className="print-item"><strong>Mentor Preferido:</strong> {r.log_mentor || "Sem preferência"}</p>
            <p className="print-item"><strong>Engajamento Declarado:</strong> {r.log_engajamento}/10</p>
            <p className="print-item"><strong>Informação Confidencial:</strong> {r.log_info || "Nenhuma"}</p>
          </div>
          
          <p style={{ textAlign: 'center', fontSize: '11px', color: '#666', marginTop: '40px' }}>
            Documento Oficial Gerado pelo Sistema de Gestão de Pessoas da LAMF5.
          </p>
        </div>


        {/* ---------------- RESUMÃO ESTRATÉGICO (VISÃO DO SITE) ---------------- */}
        <div className="no-print">
          <h2 className="form-section-title mb-16 mt-32" style={{ fontSize: "20px", color: "var(--text-muted)" }}>Resumo Analítico para o Mentor</h2>
          <div className="grid-2 gap-20 mb-32">
            <div className="card" style={{ padding: "20px", borderTop: "3px solid var(--info)" }}>
              <h3 style={{ fontSize: "14px", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "16px" }}>Dados de Triagem</h3>
              <p style={{ fontSize: "15px", marginBottom: "12px" }}><strong>Nível de Mercado:</strong> <span className="text-gold">{NIVEL_MAP[r.nivel] || "Não definido"}</span></p>
              <p style={{ fontSize: "15px", marginBottom: "12px" }}><strong>Tempo Disponível:</strong> {r.horas_disp || "Não definido"}</p>
              <p style={{ fontSize: "15px", marginBottom: "12px" }}><strong>Disponibilidade Reunião:</strong> {r.log_disp || "Não definido"}</p>
              <p style={{ fontSize: "15px" }}><strong>Engajamento Geral:</strong> {r.log_engajamento !== null ? `${r.log_engajamento}/10` : "Não definido"}</p>
            </div>

            <div className="card" style={{ padding: "20px", borderTop: "3px solid var(--gold)" }}>
              <h3 style={{ fontSize: "14px", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "16px" }}>Outliers Comportamentais</h3>
              <div style={{ marginBottom: "12px" }}>
                <strong style={{ fontSize: "13px", color: "var(--success)" }}>Destaques (Nota 5): </strong>
                {pontosFortes.length > 0 ? pontosFortes.map(p => <span key={p} className="badge badge-success" style={{marginRight:"6px"}}>{p}</span>) : <span className="text-muted" style={{fontSize:"13px"}}>Nenhum destaque máximo.</span>}
              </div>
              <div>
                <strong style={{ fontSize: "13px", color: "var(--danger)" }}>Pontos Críticos (Nota 1): </strong>
                {pontosCriticos.length > 0 ? pontosCriticos.map(p => <span key={p} className="badge badge-danger" style={{marginRight:"6px"}}>{p}</span>) : <span className="text-muted" style={{fontSize:"13px"}}>Nenhum alerta crítico.</span>}
              </div>
            </div>
          </div>

          <div className="card mb-32" style={{ padding: "24px", borderTop: "3px solid var(--success)" }}>
            <h3 style={{ fontSize: "14px", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "16px" }}>Principais Metas do Aluno (Bloco 6)</h3>
            <ul style={{ listStyle: "none", padding: 0 }}>
              <li style={{ marginBottom: "12px", fontSize: "15px" }}><strong>📚 Acadêmica:</strong> {r.m_acad_1 || <span className="text-muted">Não preenchida</span>}</li>
              <li style={{ marginBottom: "12px", fontSize: "15px" }}><strong>🏅 Certificação:</strong> {r.m_cert_1 || <span className="text-muted">Não preenchida</span>}</li>
              <li style={{ fontSize: "15px" }}><strong>💼 Profissional:</strong> {r.m_prof_1 || <span className="text-muted">Não preenchida</span>}</li>
            </ul>
          </div>

          {/* ---------------- QUESTIONÁRIO NA ÍNTEGRA (VISÃO DO SITE) ---------------- */}
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: "32px" }}>
            <h2 className="form-section-title mb-24" style={{ fontSize: "20px", color: "var(--text-muted)" }}>Respostas na Íntegra</h2>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <details className="form-section" style={{ padding: "20px", margin: 0 }}>
                <summary style={{ fontSize: "16px", fontWeight: "bold", cursor: "pointer", color: "var(--gold-light)" }}>Bloco 1: Contexto Pessoal</summary>
                <div className="mt-16" style={{ fontSize: "14px", lineHeight: "1.8", color: "var(--text-secondary)" }}>
                  <p><strong>Nome:</strong> {r.nome}</p>
                  <p><strong>Curso/Período:</strong> {r.curso} - {r.periodo}º Período</p>
                  <p><strong>CRA:</strong> {r.cra || "Não informado"}</p>
                  <p><strong>Entrada na Liga:</strong> {r.entrada_liga}</p>
                  <p><strong>Experiência Profissional:</strong> {r.exp_profissional}</p>
                </div>
              </details>

              <details className="form-section" style={{ padding: "20px", margin: 0 }}>
                <summary style={{ fontSize: "16px", fontWeight: "bold", cursor: "pointer", color: "var(--gold-light)" }}>Bloco 3: Autoavaliação Técnica</summary>
                <div className="mt-16" style={{ fontSize: "14px", lineHeight: "1.8", color: "var(--text-secondary)" }}>
                  <p><strong>Três pontos fortes:</strong> {r.tec_in_fortes || r.tec_mid_fortes || r.tec_adv_fortes || "Não informado"}</p>
                  <p><strong>Três pontos a melhorar:</strong> {r.tec_in_melhorar || r.tec_mid_melhorar || r.tec_adv_melhorar || "Não informado"}</p>
                  {r.tec_adv_descarte && <p><strong>Áreas descartadas (Avançado):</strong> {r.tec_adv_descarte}</p>}
                  <p className="text-muted mt-8" style={{fontSize: "12px"}}>*A avaliação técnica completa (escalas 1-5) está salva no banco de dados e presente no PDF.</p>
                </div>
              </details>

              <details className="form-section" style={{ padding: "20px", margin: 0 }}>
                <summary style={{ fontSize: "16px", fontWeight: "bold", cursor: "pointer", color: "var(--gold-light)" }}>Bloco 5: Direção de Carreira</summary>
                <div className="mt-16" style={{ fontSize: "14px", lineHeight: "1.8", color: "var(--text-secondary)" }}>
                  <p><strong>Áreas de Interesse:</strong> {(r.d_areas || []).join(', ') || "Nenhuma"}</p>
                  <p><strong>Empresa dos Sonhos:</strong> {r.d_empresa}</p>
                  <p><strong>Visão 1 Ano:</strong> {r.d_1ano}</p>
                  <p><strong>Visão 3 Anos:</strong> {r.d_3anos}</p>
                  <p><strong>Visão 5 Anos:</strong> {r.d_5anos}</p>
                  {r.d_admira && <p><strong>Admira:</strong> {r.d_admira}</p>}
                </div>
              </details>

              <details className="form-section" style={{ padding: "20px", margin: 0 }} open>
                <summary style={{ fontSize: "16px", fontWeight: "bold", cursor: "pointer", color: "var(--gold-light)" }}>Bloco 7: Reflexões (Muito Importante)</summary>
                <div className="mt-16" style={{ fontSize: "14px", lineHeight: "1.8", color: "var(--text-secondary)" }}>
                  <p style={{marginBottom:"12px"}}><strong>Por que entrou na Liga e o que espera?</strong><br/>{r.r_motivo}</p>
                  <p style={{marginBottom:"12px"}}><strong>Se em 1 ano fosse sucesso, o que mudaria?</strong><br/>{r.r_sucesso}</p>
                  <p style={{marginBottom:"12px"}}><strong>O que mais te frustra hoje?</strong><br/>{r.r_frustra}</p>
                  <p style={{marginBottom:"12px"}}><strong>Estudo recente por Iniciativa Própria:</strong><br/>{r.r_iniciativa}</p>
                  <p style={{marginBottom:"12px"}}><strong>O que te IMPEDE de estudar mais?</strong><br/>{r.r_impede}</p>
                  <p style={{marginBottom:"12px"}}><strong>Como APRENDE melhor?</strong><br/>{r.r_aprende}</p>
                  {r.r_mudar && <p><strong>O que mudaria em si mesmo?</strong><br/>{r.r_mudar}</p>}
                </div>
              </details>

              <details className="form-section" style={{ padding: "20px", margin: 0 }}>
                <summary style={{ fontSize: "16px", fontWeight: "bold", cursor: "pointer", color: "var(--gold-light)" }}>Bloco 8: Logística 1:1</summary>
                <div className="mt-16" style={{ fontSize: "14px", lineHeight: "1.8", color: "var(--text-secondary)" }}>
                  <p><strong>Disponibilidade:</strong> {r.log_disp}</p>
                  <p><strong>Formato preferido:</strong> {r.log_formato}</p>
                  <p><strong>Mentor Preferido:</strong> {r.log_mentor}</p>
                  {r.log_info && <p><strong>Info Confidencial pro Mentor:</strong> {r.log_info}</p>}
                </div>
              </details>
            </div>
          </div>
        </div>

      </div>
    );
  };

  // --- ABA ADMIN: LISTA E METAS ---
  const renderAdminTab = () => {
    if (adminView === "questionnaire") return renderQuestionnaireView();

    if (adminView === "goals") {
      return (
        <div className="page active animate-fade-in no-print">
          <div className="page-header">
            <button onClick={() => setAdminView("list")} className="topbar-btn mb-20">← Voltar para lista</button>
            <div className="page-eyebrow">Atribuição de Tarefas Oficiais</div>
            <h1 className="page-title text-gold">Metas de: {editingUserName}</h1>
            <p className="page-subtitle mt-8">As metas cadastradas aqui aparecerão no painel do aluno.</p>
          </div>

          <div className="grid-2-1 gap-24 mt-32">
            <div className="form-section">
              <h2 className="form-section-title mb-20">Criar Nova Meta</h2>
              <form onSubmit={handleCreateGoal}>
                <div className="form-group mb-20"><label className="form-label">Título da Meta</label><input required className="form-input" placeholder="Ex: Tirar CPA-20" value={newGoal.title} onChange={e => setNewGoal({...newGoal, title: e.target.value})} /></div>
                <div className="form-group mb-20"><label className="form-label">Prazo Limite</label><input required type="date" className="form-input" value={newGoal.deadline} onChange={e => setNewGoal({...newGoal, deadline: e.target.value})} /></div>
                <div className="form-group mb-24"><label className="form-label">Descrição e Instruções</label><textarea required className="form-textarea" placeholder="Instruções claras para o membro..." value={newGoal.description} onChange={e => setNewGoal({...newGoal, description: e.target.value})} /></div>
                <button type="submit" className="topbar-btn primary w-full" disabled={isSaving}>{isSaving ? "Criando..." : "Atribuir Meta ao Membro"}</button>
              </form>
            </div>

            <div>
              <h2 className="form-section-title mb-20" style={{ fontSize: '18px' }}>Metas Ativas ({adminStudentGoals.length})</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {adminStudentGoals.length === 0 ? (
                  <div className="empty-state card" style={{ padding: "32px" }}>Nenhuma meta oficial definida ainda.</div>
                ) : (
                  adminStudentGoals.map(goal => (
                    <div key={goal.id} className="card" style={{ padding: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h4 style={{ fontSize: '16px', color: 'var(--text-primary)', fontWeight: '600' }}>{goal.title}</h4>
                        <button onClick={() => handleDeleteGoal(goal.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '20px' }}>×</button>
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>Prazo: {new Date(goal.deadline).toLocaleDateString('pt-BR')}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="page active animate-fade-in no-print">
        <div className="page-header">
          <div className="page-eyebrow">Acesso Restrito</div>
          <h1 className="page-title">Painel Administrativo</h1>
          <p className="page-subtitle">Gerenciamento de Membros e Análise de PDIs da LAMF5.</p>
        </div>

        <div className="table-wrap mb-24">
          <div className="table-header"><div className="table-title">Membros Cadastrados</div></div>
          <table>
            <thead>
              <tr>
                <th>Nome do Membro</th>
                <th>Diretoria</th>
                <th>Status Questionário</th>
                <th style={{ textAlign: "right" }}>Ações de Gestão</th>
              </tr>
            </thead>
            <tbody>
              {allStudents.map(student => {
                const isAnswered = allQuestionnaires.some(q => q.member_id === student.id);
                return (
                  <tr key={student.id}>
                    <td><div className="inline-row gap-12"><div className="avatar avatar-sm">{student.nome_completo.substring(0, 2).toUpperCase()}</div>{student.nome_completo}</div></td>
                    <td><span className="tag">{student.diretoria}</span></td>
                    <td>
                      <span className={`badge ${isAnswered ? 'badge-success' : 'badge-muted'}`}>
                        {isAnswered ? '✓ Respondeu' : 'Pendente'}
                      </span>
                    </td>
                    <td style={{ textAlign: "right", display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                      <button 
                        className="topbar-btn" 
                        onClick={() => handleViewQuestionnaire(student.id, student.nome_completo)}
                        disabled={!isAnswered}
                        style={{ opacity: !isAnswered ? 0.5 : 1, cursor: !isAnswered ? 'not-allowed' : 'pointer' }}
                      >
                        Ver Diagnóstico
                      </button>
                      {isAnswered && (
                        <button 
                          className="topbar-btn" 
                          style={{borderColor: 'var(--warning)', color: 'var(--warning)'}} 
                          onClick={() => handleUnlockQuestionnaire(student.id, student.nome_completo)}
                        >
                          Liberar Refazer
                        </button>
                      )}
                      <button className="topbar-btn primary" onClick={() => handleManageStudentGoals(student.id, student.nome_completo)}>
                        Definir Metas
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="app">
      <aside className="sidebar no-print">
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
            
            <div className="nav-item" onClick={() => router.push('/questionario')}>
              <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg> Questionário Oficial
            </div>

            <div className={`nav-item ${activeTab === 'meu_pdi' ? 'active' : ''}`} onClick={() => setActiveTab('meu_pdi')}>
              <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg> Meu PDI
            </div>
            
            <div className={`nav-item ${activeTab === 'metas' ? 'active' : ''}`} onClick={() => setActiveTab('metas')}>
              <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg> Minhas Metas
            </div>
          </div>
          
          {isAdmin && (
            <div className="nav-section" style={{ marginTop: '24px' }}>
              <div className="nav-label">Administração</div>
              <div className={`nav-item ${activeTab === 'admin' ? 'active' : ''}`} onClick={() => { setActiveTab('admin'); setAdminView('list'); }}>
                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg> 
                Painel Admin
                <span className="nav-badge">GP</span>
              </div>
            </div>
          )}
        </nav>
      </aside>
      
      <main className="main">
        <header className="topbar no-print">
          <div className="topbar-breadcrumb">
            <span>Sistema LAMF5</span><span>›</span><span className="current" style={{ textTransform: 'capitalize' }}>{activeTab === 'dashboard' ? 'Painel Central' : activeTab.replace("_", " ")}</span>
          </div>
          <div className="topbar-right"><button className="topbar-btn" onClick={handleLogout}>Sair do Sistema</button></div>
        </header>
        
        <div className="scroll-area" style={{ flex: 1 }}>
          {activeTab === 'dashboard' && renderPainelCentral()}
          {activeTab === 'meu_pdi' && renderMeuPDI()}
          {activeTab === 'metas' && renderMetas()}
          {activeTab === 'admin' && renderAdminTab()}
        </div>
      </main>
    </div>
  );
}