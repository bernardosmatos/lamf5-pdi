"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

// --- DADOS DAS ÁREAS DE INTERESSE ---
const AREAS = [
  { id: "ib", label: "Investment Banking" },
  { id: "ma", label: "M&A Boutique" },
  { id: "pe", label: "Private Equity" },
  { id: "hf", label: "Hedge Fund" },
  { id: "structuring", label: "Structuring" },
  { id: "restructuring", label: "Restructuring" },
  { id: "eq_research", label: "Equity Research" },
  { id: "macro_research", label: "Macro Research" },
  { id: "traders", label: "Traders" },
  { id: "gestao_ativos", label: "Gestão de Ativos" },
  { id: "fpa", label: "FP&A" },
  { id: "credito", label: "Crédito" },
  { id: "risco", label: "Risco" },
  { id: "tesouraria", label: "Tesouraria" },
  { id: "financial_planner", label: "Financial Planner" },
  { id: "ecm", label: "ECM" },
  { id: "dcm", label: "DCM" },
  { id: "sales", label: "Sales" },
  { id: "corporate_banking", label: "Corporate Banking" },
  { id: "private_banking", label: "Private Banking" },
  { id: "gestao_patrimonio", label: "Gestão de Patrimônio" },
  { id: "relacao_investidor", label: "Relação com Investidor" },
  { id: "agente_autonomo", label: "Agente Autônomo" },
  { id: "gerente_banco", label: "Gerente de Banco" },
  { id: "outros", label: "Outros" },
];

function ScaleSelector({ value, onChange }) {
  return (
    <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`topbar-btn ${value === n ? 'primary' : ''}`}
          style={{ flex: 1, padding: "10px 0", textAlign: "center", borderRadius: "8px" }}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("diagnostico"); 
  const router = useRouter();

  // --- ESTADOS DO DIAGNÓSTICO E ADMIN ---
  const [hasDiagnostic, setHasDiagnostic] = useState(false);
  const [isEditingDiag, setIsEditingDiag] = useState(false);
  const [step, setStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  
  // Controles do Admin
  const [adminView, setAdminView] = useState("list"); // "list", "form", ou "goals"
  const [editingUserId, setEditingUserId] = useState(null);
  const [editingUserName, setEditingUserName] = useState("");
  
  // --- ESTADOS DE METAS ---
  const [userGoals, setUserGoals] = useState([]); 
  const [adminStudentGoals, setAdminStudentGoals] = useState([]); 
  const [newGoal, setNewGoal] = useState({ title: "", description: "", deadline: "" });
  const [studentDiagSummary, setStudentDiagSummary] = useState({ curto: "", longo: "", acoes: "" }); 

  const [form, setForm] = useState({
    nome: "", semestre: "", curso: "", contato: "",
    areas_interesse: [], area_principal: "", descricao_interesse: "",
    areas_interesse_outros: "", area_principal_outros: "",
    comunicacao: 3, proatividade: 3, trabalho_equipe: 3, organizacao: 3, lideranca: 3,
    nivel_mercado: "", certificacoes: "", pontos_fortes: "", pontos_melhora: "",
    objetivo_curto: "", objetivo_longo: "", empresa_sonho: "", motivacao: "", disponibilidade: "",
    acoes_proximas: "", recursos_necessarios: "", como_liga_ajuda: "", comprometimento: "", expectativas: "",
  });

  const setF = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const toggleArea = (id) => setF("areas_interesse", form.areas_interesse.includes(id) ? form.areas_interesse.filter((a) => a !== id) : [...form.areas_interesse, id]);

  const carregarDadosDoPDI = (savedDiag, profile) => {
    if (savedDiag && savedDiag.experience) {
      try {
        const exp = JSON.parse(savedDiag.experience || "{}");
        const int = JSON.parse(savedDiag.interests || "{}");
        const skills = JSON.parse(savedDiag.current_skills || "{}");
        const goals = JSON.parse(savedDiag.goals || "{}");
        const avail = JSON.parse(savedDiag.availability || "{}");

        setForm({
          nome: profile?.nome_completo || "",
          curso: exp.curso || "", 
          semestre: exp.semestre || "", 
          contato: exp.contato || profile?.email || "",
          areas_interesse: int.areas || [], 
          areas_interesse_outros: int.areas_outros || "",
          area_principal: int.principal || "", 
          area_principal_outros: int.principal_outros || "",
          descricao_interesse: int.desc || "",
          comunicacao: skills.comunicacao || 3, 
          proatividade: skills.proatividade || 3,
          trabalho_equipe: skills.equipe || 3, 
          organizacao: skills.organizacao || 3, 
          lideranca: skills.lideranca || 3,
          nivel_mercado: skills.nivel || "", 
          certificacoes: skills.certs || "",
          pontos_fortes: skills.fortes || "", 
          pontos_melhora: skills.melhora || "",
          objetivo_curto: goals.curto || "", 
          objetivo_longo: goals.longo || "",
          empresa_sonho: goals.empresa || "", 
          motivacao: goals.motivacao || "",
          disponibilidade: avail.disp || "", 
          acoes_proximas: avail.acoes || "",
          recursos_necessarios: avail.recursos || "", 
          como_liga_ajuda: avail.ajuda || "",
          comprometimento: avail.compromisso || "", 
          expectativas: avail.expectativas || ""
        });
        
        setStudentDiagSummary({ curto: goals.curto, longo: goals.longo, acoes: avail.acoes });

      } catch (e) {
        console.error("Erro ao carregar os dados", e);
      }
    } else {
      setForm({
        nome: profile?.nome_completo || "", semestre: "", curso: "", contato: profile?.email || "",
        areas_interesse: [], area_principal: "", descricao_interesse: "", areas_interesse_outros: "", area_principal_outros: "",
        comunicacao: 3, proatividade: 3, trabalho_equipe: 3, organizacao: 3, lideranca: 3,
        nivel_mercado: "", certificacoes: "", pontos_fortes: "", pontos_melhora: "",
        objetivo_curto: "", objetivo_longo: "", empresa_sonho: "", motivacao: "", disponibilidade: "",
        acoes_proximas: "", recursos_necessarios: "", como_liga_ajuda: "", comprometimento: "", expectativas: "",
      });
      setStudentDiagSummary({ curto: "", longo: "", acoes: "" });
    }
  };

  useEffect(() => {
    async function loadDashboard() {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) { router.push("/"); return; }
      setUser(user);

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setUserProfile(profile);

      // Carrega Diagnóstico
      const { data: savedDiag } = await supabase.from('diagnostics').select('*').eq('member_id', user.id).single();
      if (savedDiag && savedDiag.experience) {
        setHasDiagnostic(true);
        carregarDadosDoPDI(savedDiag, profile);
      } else {
        if (profile) setF("nome", profile.nome_completo);
        if (profile) setF("contato", profile.email);
      }

      // Carrega Metas do Estudante Logado
      const { data: myGoals } = await supabase.from('goals').select('*').eq('member_id', user.id).order('created_at', { ascending: false });
      if (myGoals) setUserGoals(myGoals);

      // Se for Admin, busca a lista de todos os alunos
      if (profile?.perfil === "Gestão de Pessoas" || profile?.perfil === "Presidência") {
        const { data: students } = await supabase.from('profiles').select('*');
        setAllStudents(students || []);
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
  const handleEditStudentPDI = async (studentId, studentName, studentEmail) => {
    setLoading(true);
    setEditingUserId(studentId);
    setEditingUserName(studentName);
    setAdminView("form");
    setStep(0);

    const { data: savedDiag } = await supabase.from('diagnostics').select('*').eq('member_id', studentId).single();
    carregarDadosDoPDI(savedDiag, { nome_completo: studentName, email: studentEmail });
    setLoading(false);
  };

  const handleManageStudentGoals = async (studentId, studentName) => {
    setLoading(true);
    setEditingUserId(studentId);
    setEditingUserName(studentName);
    setAdminView("goals");

    const { data: savedDiag } = await supabase.from('diagnostics').select('*').eq('member_id', studentId).single();
    carregarDadosDoPDI(savedDiag, { nome_completo: studentName });

    const { data: stdGoals } = await supabase.from('goals').select('*').eq('member_id', studentId).order('created_at', { ascending: false });
    setAdminStudentGoals(stdGoals || []);
    
    setLoading(false);
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const payload = {
      member_id: editingUserId,
      title: newGoal.title,
      description: newGoal.description,
      deadline: newGoal.deadline,
      status: "Pendente"
    };

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

  // --- SALVAR DIAGNÓSTICO (Resolução do erro 42P10) ---
  const saveDiagnostic = async () => {
    setIsSaving(true);
    const targetId = (activeTab === "admin" && editingUserId) ? editingUserId : user.id;

    const payload = {
      member_id: targetId,
      experience: JSON.stringify({ curso: form.curso, semestre: form.semestre, contato: form.contato }),
      interests: JSON.stringify({ areas: form.areas_interesse, areas_outros: form.areas_interesse_outros, principal: form.area_principal, principal_outros: form.area_principal_outros, desc: form.descricao_interesse }),
      current_skills: JSON.stringify({ comunicacao: form.comunicacao, proatividade: form.proatividade, equipe: form.trabalho_equipe, organizacao: form.organizacao, lideranca: form.lideranca, nivel: form.nivel_mercado, certs: form.certificacoes, fortes: form.pontos_fortes, melhora: form.pontos_melhora }),
      goals: JSON.stringify({ curto: form.objetivo_curto, longo: form.objetivo_longo, empresa: form.empresa_sonho, motivacao: form.motivacao }),
      availability: JSON.stringify({ disp: form.disponibilidade, acoes: form.acoes_proximas, recursos: form.recursos_necessarios, ajuda: form.como_liga_ajuda, compromisso: form.comprometimento, expectativas: form.expectativas })
    };

    const { data: existing } = await supabase.from('diagnostics').select('id').eq('member_id', targetId).single();

    let dbError;
    if (existing) {
      const { error } = await supabase.from('diagnostics').update(payload).eq('member_id', targetId);
      dbError = error;
    } else {
      const { error } = await supabase.from('diagnostics').insert([payload]);
      dbError = error;
    }
    
    setIsSaving(false);
    if (!dbError) {
      alert("Diagnóstico salvo com sucesso!");
      setStep(0);
      if (activeTab === "admin") {
        setAdminView("list");
        setEditingUserId(null);
      } else {
        setHasDiagnostic(true);
        setIsEditingDiag(false);
      }
    } else {
      console.error("Erro do Banco:", dbError);
      alert("Erro ao salvar no banco de dados.");
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--black)' }}>
        <p style={{ color: 'var(--gold)', fontWeight: 'bold', letterSpacing: '0.1em' }}>CARREGANDO SISTEMA PDI...</p>
      </div>
    );
  }

  const nomeCompleto = userProfile?.nome_completo || "Membro";
  const iniciais = nomeCompleto.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  const diretoria = userProfile?.diretoria || "LAMF5";
  const cargo = userProfile?.perfil || "Estudante";
  const isAdmin = cargo === "Gestão de Pessoas" || cargo === "Presidência";

  const renderPainelCentral = () => (
    <div className="page active animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Painel Central</h1>
      </div>
      <div className="empty-state card">Em construção...</div>
    </div>
  );

  const renderMetas = () => (
    <div className="page active animate-fade-in">
      <div className="page-header">
        <div className="page-eyebrow">Módulo 2</div>
        <h1 className="page-title">Minhas Metas</h1>
        <p className="page-subtitle">Tarefas e metas definidas pela Gestão de Pessoas para o seu desenvolvimento.</p>
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
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>
                    Prazo: {new Date(goal.deadline).toLocaleDateString('pt-BR')}
                  </div>
                </div>
                <span className={`badge ${goal.status === 'Pendente' ? 'badge-warning' : 'badge-success'}`}>
                  {goal.status}
                </span>
              </div>
              <div className="smart-body">
                <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  {goal.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderFormulario = (fromAdmin = false) => (
    <div className="animate-fade-in">
      <div className="cycle-bar mb-24" style={{ background: 'rgba(20, 20, 20, 0.6)', backdropFilter: 'blur(10px)' }}>
        {["Apresentação", "Áreas", "Comportamento", "Objetivos", "Plano", "Conclusão"].map((titulo, i) => (
          <div key={i} className={`cycle-step ${step > i ? 'done' : step === i ? 'current' : ''}`}>
            <div className="cycle-dot">{step > i ? '✓' : i + 1}</div>
            <div className="cycle-name">{titulo}</div>
          </div>
        ))}
      </div>

      <div className="form-section" style={{ background: 'rgba(28, 28, 28, 0.8)', backdropFilter: 'blur(12px)', borderTop: '3px solid var(--gold)' }}>
        
        {step === 0 && (
          <div className="animate-fade-in">
            <h2 className="form-section-title mb-16">Dados do Membro</h2>
            
            <div className="form-group mb-20">
              <label className="form-label">Nome completo</label>
              <input className="form-input" value={form.nome} onChange={e => setF("nome", e.target.value)} />
            </div>
            
            <div className="grid-2 gap-20 mb-20">
              <div className="form-group">
                <label className="form-label">Curso</label>
                <input className="form-input" value={form.curso} onChange={e => setF("curso", e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Semestre</label>
                <select className="form-select" value={form.semestre} onChange={e => setF("semestre", e.target.value)}>
                  <option value="">Selecione</option>
                  {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}º Semestre</option>)}
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">E-mail ou WhatsApp</label>
              <input className="form-input" value={form.contato} onChange={e => setF("contato", e.target.value)} />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="animate-fade-in">
            <h2 className="form-section-title mb-16">Áreas de Interesse</h2>
            
            <div className="form-group mb-24">
              <label className="form-label">Selecione as áreas (múltiplas permitidas)</label>
              <div className="checkbox-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}>
                {AREAS.map((area) => (
                  <div 
                    key={area.id} 
                    onClick={() => toggleArea(area.id)} 
                    className={`checkbox-item ${form.areas_interesse.includes(area.id) ? 'selected' : ''}`}
                  >
                    {form.areas_interesse.includes(area.id) && "✓ "}{area.label}
                  </div>
                ))}
              </div>
              
              {form.areas_interesse.includes("outros") && (
                <div className="animate-fade-in mt-16 highlight-box">
                  <label className="form-label text-gold" style={{ marginBottom: "8px", display: "block" }}>
                    Especifique outras áreas:
                  </label>
                  <input className="form-input" value={form.areas_interesse_outros} onChange={e => setF("areas_interesse_outros", e.target.value)} />
                </div>
              )}
            </div>

            <div className="form-group mb-20">
              <label className="form-label">Prioridade no momento</label>
              <select className="form-select" value={form.area_principal} onChange={e => setF("area_principal", e.target.value)}>
                <option value="">Selecione uma área principal</option>
                {AREAS.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
              </select>
              
              {form.area_principal === "outros" && (
                <div className="animate-fade-in mt-16 highlight-box">
                  <label className="form-label text-gold" style={{ marginBottom: "8px", display: "block" }}>
                    Qual é a prioritária?
                  </label>
                  <input className="form-input" value={form.area_principal_outros} onChange={e => setF("area_principal_outros", e.target.value)} />
                </div>
              )}
            </div>

            <div className="form-group mb-20">
              <label className="form-label">Por que essa área te interessa?</label>
              <textarea className="form-textarea" value={form.descricao_interesse} onChange={e => setF("descricao_interesse", e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">Objetivos de Curto Prazo</label>
              <textarea className="form-textarea" value={form.objetivo_curto} onChange={e => setF("objetivo_curto", e.target.value)} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in">
            <h2 className="form-section-title mb-16">Perfil & Habilidades</h2>
            
            <div className="grid-2 gap-24 mb-32">
              <div className="form-group">
                <label className="form-label">Comunicação</label>
                <ScaleSelector value={form.comunicacao} onChange={v => setF("comunicacao", v)} />
              </div>
              <div className="form-group">
                <label className="form-label">Proatividade</label>
                <ScaleSelector value={form.proatividade} onChange={v => setF("proatividade", v)} />
              </div>
              <div className="form-group">
                <label className="form-label">Trabalho em Equipe</label>
                <ScaleSelector value={form.trabalho_equipe} onChange={v => setF("trabalho_equipe", v)} />
              </div>
              <div className="form-group">
                <label className="form-label">Organização</label>
                <ScaleSelector value={form.organizacao} onChange={v => setF("organizacao", v)} />
              </div>
              <div className="form-group">
                <label className="form-label">Liderança</label>
                <ScaleSelector value={form.lideranca} onChange={v => setF("lideranca", v)} />
              </div>
            </div>

            <div className="grid-2 gap-24 mb-24">
              <div className="form-group">
                <label className="form-label">Conhecimento de mercado</label>
                <select className="form-select" value={form.nivel_mercado} onChange={e => setF("nivel_mercado", e.target.value)}>
                  <option value="">Selecione</option>
                  <option value="iniciante">Iniciante</option>
                  <option value="intermediario">Intermediário</option>
                  <option value="avancado">Avançado</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Certificações</label>
                <input className="form-input" value={form.certificacoes} onChange={e => setF("certificacoes", e.target.value)} />
              </div>
            </div>

            <div className="grid-2 gap-24">
              <div className="form-group">
                <label className="form-label">Pontos fortes</label>
                <textarea className="form-textarea" value={form.pontos_fortes} onChange={e => setF("pontos_fortes", e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">O que melhorar</label>
                <textarea className="form-textarea" value={form.pontos_melhora} onChange={e => setF("pontos_melhora", e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-in">
            <h2 className="form-section-title mb-16">Seus Objetivos a Longo Prazo</h2>
            
            <div className="form-group mb-20">
              <label className="form-label">Onde quer chegar em 3-5 anos?</label>
              <textarea className="form-textarea" value={form.objetivo_longo} onChange={e => setF("objetivo_longo", e.target.value)} />
            </div>
            
            <div className="grid-2 gap-20 mb-20">
              <div className="form-group">
                <label className="form-label">Empresa dos sonhos</label>
                <input className="form-input" value={form.empresa_sonho} onChange={e => setF("empresa_sonho", e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Disponibilidade</label>
                <select className="form-select" value={form.disponibilidade} onChange={e => setF("disponibilidade", e.target.value)}>
                  <option value="">Selecione</option>
                  <option value="1-3h">1 a 3 horas</option>
                  <option value="4-6h">4 a 6 horas</option>
                  <option value="7-10h">7 a 10 horas</option>
                  <option value="10h+">Mais de 10 horas</option>
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Motivação</label>
              <textarea className="form-textarea" value={form.motivacao} onChange={e => setF("motivacao", e.target.value)} />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="animate-fade-in">
            <h2 className="form-section-title mb-16">Plano de Ação</h2>
            
            <div className="form-group mb-20">
              <label className="form-label">Próximos passos</label>
              <textarea className="form-textarea" value={form.acoes_proximas} onChange={e => setF("acoes_proximas", e.target.value)} />
            </div>
            
            <div className="form-group mb-20">
              <label className="form-label">Recursos necessários</label>
              <textarea className="form-textarea" value={form.recursos_necessarios} onChange={e => setF("recursos_necessarios", e.target.value)} />
            </div>
            
            <div className="grid-2 gap-20">
              <div className="form-group">
                <label className="form-label">Como a LAMF5 pode ajudar?</label>
                <textarea className="form-textarea" value={form.como_liga_ajuda} onChange={e => setF("como_liga_ajuda", e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Como pretende contribuir?</label>
                <textarea className="form-textarea" value={form.comprometimento} onChange={e => setF("comprometimento", e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="animate-fade-in" style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>💾</div>
            <h2 className="form-section-title mb-16 text-gold">Salvar Avaliação</h2>
            <p className="form-section-desc mx-auto" style={{ maxWidth: "500px", marginBottom: "32px" }}>
              Atualizará o perfil de <strong style={{ color: "var(--white)" }}>{form.nome}</strong> no banco de dados da liga.
            </p>
            <div className="form-group" style={{ textAlign: "left", maxWidth: "500px", margin: "0 auto 24px" }}>
              <label className="form-label">Expectativas Finais</label>
              <textarea className="form-textarea" value={form.expectativas} onChange={e => setF("expectativas", e.target.value)} />
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
          <button 
            className="topbar-btn" 
            onClick={() => { 
              if(step === 0) { 
                if (fromAdmin) { setAdminView("list"); setEditingUserId(null); } 
                else setIsEditingDiag(false); 
              } else { 
                setStep(s => Math.max(0, s - 1)); 
              } 
            }}
          >
            {step === 0 ? "Cancelar" : "← Voltar"}
          </button>
          
          {step < 5 ? (
            <button className="topbar-btn primary" onClick={() => setStep(s => Math.min(5, s + 1))}>
              Continuar →
            </button>
          ) : (
            <button className="topbar-btn primary" onClick={saveDiagnostic} disabled={isSaving}>
              {isSaving ? "Salvando..." : "Salvar Oficial →"}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const renderDiagnosticoView = () => (
    <div className="animate-fade-in">
      <div className="highlight-box mb-32" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{ fontSize: '24px' }}>✅</span>
        <span style={{ fontSize: '15px' }}><strong>Formulário preenchido</strong> após a reunião de alinhamento com a Gestão de Pessoas.</span>
        {isAdmin && (
          <button onClick={() => setIsEditingDiag(true)} className="topbar-btn" style={{ marginLeft: 'auto' }}>
            Editar Formulário
          </button>
        )}
      </div>
      
      <div className="grid-2 mb-24">
        <div className="form-section">
          <div className="form-section-title">Dados Pessoais</div>
          <div className="form-grid mt-20">
            <div className="form-group"><label className="form-label">Nome</label><input className="form-input" value={form.nome} readOnly /></div>
            <div className="form-group form-full"><label className="form-label">E-mail</label><input className="form-input" value={form.contato} readOnly /></div>
          </div>
        </div>
        
        <div className="form-section">
          <div className="form-section-title">Perfil de Interesse</div>
          <div className="form-group mt-20 mb-20">
            <label className="form-label">Áreas</label>
            <div className="checkbox-grid">
              {form.areas_interesse.map(a => (
                <div key={a} className="checkbox-item selected" style={{ cursor:'default' }}>✓ {a}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="form-section">
        <div className="form-section-title">Avaliação Comportamental</div>
        <div className="kpi-grid mt-24">
          <div className="kpi-item"><div className={`kpi-score s${form.comunicacao}`}>{form.comunicacao}</div><div className="kpi-label">Comunicação</div></div>
          <div className="kpi-item"><div className={`kpi-score s${form.organizacao}`}>{form.organizacao}</div><div className="kpi-label">Organização</div></div>
        </div>
      </div>
    </div>
  );

  const renderDiagnosticoWrapper = () => (
    <div className="page active">
      <div className="page-header">
        <div className="page-eyebrow">Módulo 1</div>
        <h1 className="page-title">Diagnóstico Inicial</h1>
      </div>
      
      {!hasDiagnostic && !isEditingDiag ? (
        <div className="empty-state card animate-fade-in">
          <div className="empty-icon">⏳</div>
          <div className="empty-title">Aguardando Reunião</div>
          <div className="empty-desc">O seu diagnóstico será preenchido em conjunto com a Gestão de Pessoas.</div>
        </div>
      ) : ( 
        isEditingDiag ? renderFormulario() : renderDiagnosticoView() 
      )}
    </div>
  );

  // --- ABA ADMIN ---
  const renderAdminTab = () => {
    if (adminView === "form") {
      return (
        <div className="page active animate-fade-in">
          <div className="page-header">
            <div className="page-eyebrow">Gestão de Pessoas</div>
            <h1 className="page-title text-gold">Editando: {editingUserName}</h1>
            <p className="page-subtitle">Preenchendo o PDI em nome do membro.</p>
          </div>
          {renderFormulario(true)}
        </div>
      );
    }

    if (adminView === "goals") {
      return (
        <div className="page active animate-fade-in">
          <div className="page-header">
            <button onClick={() => setAdminView("list")} className="topbar-btn mb-20">← Voltar para lista</button>
            <div className="page-eyebrow">Atribuição de Tarefas</div>
            <h1 className="page-title text-gold">Metas de: {editingUserName}</h1>
          </div>

          <div className="highlight-box mb-32">
            <h3 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px' }}>💡 Resumo do Formulário</h3>
            <p style={{ marginBottom: '8px' }}><strong>Curto Prazo:</strong> {studentDiagSummary.curto || "Não preenchido"}</p>
            <p style={{ marginBottom: '8px' }}><strong>Longo Prazo:</strong> {studentDiagSummary.longo || "Não preenchido"}</p>
            <p><strong>Ações Sugeridas:</strong> {studentDiagSummary.acoes || "Não preenchido"}</p>
          </div>

          <div className="grid-2-1 gap-24">
            <div className="form-section">
              <h2 className="form-section-title mb-20">Criar Nova Meta</h2>
              <form onSubmit={handleCreateGoal}>
                <div className="form-group mb-20">
                  <label className="form-label">Título da Meta</label>
                  <input required className="form-input" placeholder="Ex: Tirar CPA-20" value={newGoal.title} onChange={e => setNewGoal({...newGoal, title: e.target.value})} />
                </div>
                <div className="form-group mb-20">
                  <label className="form-label">Prazo Limite</label>
                  <input required type="date" className="form-input" value={newGoal.deadline} onChange={e => setNewGoal({...newGoal, deadline: e.target.value})} />
                </div>
                <div className="form-group mb-24">
                  <label className="form-label">Descrição da Tarefa</label>
                  <textarea required className="form-textarea" placeholder="Instruções claras para o membro..." value={newGoal.description} onChange={e => setNewGoal({...newGoal, description: e.target.value})} />
                </div>
                <button type="submit" className="topbar-btn primary w-full" disabled={isSaving}>
                  {isSaving ? "Criando..." : "Atribuir Meta ao Membro"}
                </button>
              </form>
            </div>

            <div>
              <h2 className="form-section-title mb-20" style={{ fontSize: '18px' }}>Metas Atribuídas ({adminStudentGoals.length})</h2>
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
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>
                        Prazo: {new Date(goal.deadline).toLocaleDateString('pt-BR')}
                      </p>
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
      <div className="page active animate-fade-in">
        <div className="page-header">
          <div className="page-eyebrow">Acesso Restrito</div>
          <h1 className="page-title">Painel Administrativo</h1>
          <p className="page-subtitle">Gerenciamento de Membros e PDIs da LAMF5.</p>
        </div>

        <div className="table-wrap mb-24">
          <div className="table-header"><div className="table-title">Membros Cadastrados</div></div>
          <table>
            <thead>
              <tr>
                <th>Nome do Membro</th>
                <th>Diretoria</th>
                <th>Cargo</th>
                <th style={{ textAlign: "right" }}>Ações de Gestão</th>
              </tr>
            </thead>
            <tbody>
              {allStudents.map(student => (
                <tr key={student.id}>
                  <td>
                    <div className="inline-row gap-12">
                      <div className="avatar avatar-sm">{student.nome_completo.substring(0, 2).toUpperCase()}</div> 
                      {student.nome_completo}
                    </div>
                  </td>
                  <td><span className="tag">{student.diretoria}</span></td>
                  <td><span className={`badge ${student.perfil === 'Presidência' ? 'badge-gold' : student.perfil === 'Gestão de Pessoas' ? 'badge-info' : 'badge-muted'}`}>{student.perfil}</span></td>
                  <td style={{ textAlign: "right", display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                    <button className="topbar-btn" onClick={() => handleEditStudentPDI(student.id, student.nome_completo, student.email)}>
                      Preencher PDI
                    </button>
                    <button className="topbar-btn primary" onClick={() => handleManageStudentGoals(student.id, student.nome_completo)}>
                      Definir Metas
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">L5</div>
          <div className="logo-text">
            <span className="logo-title">Sistema LAMF5</span>
            <span className="logo-sub">Gestão de Pessoas</span>
          </div>
        </div>
        
        <div className="sidebar-user">
          <div className="inline-row">
            <div className="avatar avatar-sm">{iniciais}</div>
            <div>
              <div className="user-name">{nomeCompleto}</div>
              <div className="user-role">{cargo}</div>
            </div>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-label">Meu PDI</div>
            <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
              <svg className="nav-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h6v6H4zm10 0h6v6h-6zM4 14h6v6H4zm10 0h6v6h-6z"/></svg> 
              Dashboard
            </div>
            <div className={`nav-item ${activeTab === 'diagnostico' ? 'active' : ''}`} onClick={() => { setActiveTab('diagnostico'); setIsEditingDiag(false); carregarDadosDoPDI(null, userProfile); }}>
              <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> 
              Diagnóstico
            </div>
            <div className={`nav-item ${activeTab === 'metas' ? 'active' : ''}`} onClick={() => setActiveTab('metas')}>
              <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg> 
              Minhas Metas
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
        <header className="topbar">
          <div className="topbar-breadcrumb">
            <span>Sistema LAMF5</span>
            <span>›</span>
            <span className="current" style={{ textTransform: 'capitalize' }}>
              {activeTab === 'dashboard' ? 'Painel Central' : activeTab}
            </span>
          </div>
          <div className="topbar-right">
            <button className="topbar-btn" onClick={handleLogout}>Encerrar Sessão</button>
          </div>
        </header>
        
        <div className="scroll-area" style={{ flex: 1 }}>
          {activeTab === 'dashboard' && renderPainelCentral()}
          {activeTab === 'diagnostico' && renderDiagnosticoWrapper()}
          {activeTab === 'metas' && renderMetas()}
          {activeTab === 'admin' && renderAdminTab()}
        </div>
      </main>
    </div>
  );
}