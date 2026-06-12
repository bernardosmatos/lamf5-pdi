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

const EXP_MAP = {
  "nenhuma": "Não, nunca trabalhei",
  "fora": "Já tive estágio/trabalho fora da área de finanças",
  "estagio_fin": "Já tive estágio em finanças / mercado",
  "clt_fin": "Já tive (ou tenho) vínculo CLT em finanças"
};

const COMPORTAMENTAL_MAP = {
  c_oral: "Comunicação Oral", c_escrita: "Comunicação Escrita", c_equipe: "Trabalho em Equipe",
  c_lider: "Liderança", c_proat: "Proatividade", c_org: "Organização e Tempo",
  c_resil: "Resiliência", c_analise: "Pensamento Analítico", c_net: "Networking"
};

export default function AdministradorPage() {
  const [userProfile, setUserProfile] = useState(null);
  const [allStudents, setAllStudents] = useState([]);
  const [allQuestionnaires, setAllQuestionnaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Controles do Admin
  const [adminView, setAdminView] = useState("list"); 
  const [editingUserId, setEditingUserId] = useState(null);
  const [editingUserName, setEditingUserName] = useState("");
  
  // Metas e Upload
  const [adminStudentGoals, setAdminStudentGoals] = useState([]); 
  const [newGoal, setNewGoal] = useState({ title: "", description: "", deadline: "", admin_attachment: "", status: "Ainda não começou" });
  const [adminFile, setAdminFile] = useState(null); 
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadAdminData() {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) { router.push("/"); return; }

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      
      if (profile?.perfil !== "Gestão de Pessoas" && profile?.perfil !== "Presidência") {
        router.push("/dashboard");
        return;
      }

      setUserProfile(profile);

      const { data: students } = await supabase.from('profiles').select('*');
      setAllStudents(students || []);

      const { data: qs } = await supabase.from('questionario_completo').select('*');
      setAllQuestionnaires(qs || []);

      setLoading(false);
    }
    loadAdminData();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

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
    const printElement = document.getElementById("print-report");
    if (!printElement) return;

    const janelaPrint = window.open('', '', 'width=900,height=650');
    
    janelaPrint.document.write(`
      <html>
        <head>
          <title>Relatório PDI - ${editingUserName}</title>
          <style>
            body { font-family: Arial, sans-serif; color: black; padding: 40px; background: white; margin: 0; }
            * { box-sizing: border-box; }
            .print-section { border-bottom: 1px solid #ddd; margin-bottom: 20px; padding-bottom: 10px; page-break-inside: avoid; }
            .print-item { font-size: 14px; margin-bottom: 6px; }
            .print-title { font-size: 18px; font-weight: bold; margin-bottom: 12px; color: #333; }
            h1 { font-size: 26px; margin: 0; font-weight: bold; text-align: center; }
            h2 { font-size: 18px; font-weight: normal; margin: 8px 0 0; text-align: center; }
            .header-border { border-bottom: 2px solid black; padding-bottom: 15px; margin-bottom: 25px; }
            .footer { text-align: center; font-size: 11px; color: #666; margin-top: 40px; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>${printElement.innerHTML}</body>
      </html>
    `);

    janelaPrint.document.close();
    janelaPrint.focus();
    setTimeout(() => { janelaPrint.print(); janelaPrint.close(); }, 300);
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

    // SEU NOVO LOG DE AUDITORIA:
    console.log("AUDITORIA PDI - Enviando meta para o estudante ID:", editingUserId);

    let finalAttachmentUrl = newGoal.admin_attachment; // Inicia com o link de texto, se houver

    // Se o usuário anexou um arquivo, o arquivo substitui o link de texto
    if (adminFile) {
      const fileExt = adminFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`;
      const filePath = `admin_uploads/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('anexos')
        .upload(filePath, adminFile);

      if (uploadError) {
        alert("Erro no upload do arquivo: " + uploadError.message);
        setIsSaving(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage.from('anexos').getPublicUrl(filePath);
      finalAttachmentUrl = publicUrlData.publicUrl;
    }

    const payload = { 
      member_id: editingUserId, 
      title: newGoal.title, 
      description: newGoal.description, 
      deadline: newGoal.deadline, 
      status: newGoal.status,
      admin_attachment: finalAttachmentUrl
    };
    
    const { data, error } = await supabase.from('goals').insert([payload]).select();
    
    if (!error && data) {
      setAdminStudentGoals([data[0], ...adminStudentGoals]);
      setNewGoal({ title: "", description: "", deadline: "", admin_attachment: "", status: "Ainda não começou" });
      setAdminFile(null);
      
      // Limpa o input file visualmente
      const fileInput = document.getElementById('file-upload-admin');
      if(fileInput) fileInput.value = "";
    } else { 
      alert("Erro ao criar meta no banco: " + (error?.message || "Erro desconhecido")); 
    }
    setIsSaving(false);
  };

  const handleDeleteGoal = async (goalId) => {
    if(!confirm("Tem certeza que deseja excluir esta meta?")) return;
    await supabase.from('goals').delete().eq('id', goalId);
    setAdminStudentGoals(adminStudentGoals.filter(g => g.id !== goalId));
  };

  if (loading) {
    return <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--black)' }}><p style={{ color: 'var(--gold)', fontWeight: 'bold' }}>CARREGANDO MÓDULO ADMIN...</p></div>;
  }

  const nomeCompleto = userProfile?.nome_completo || "Administrador";
  const iniciais = nomeCompleto.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  const cargo = userProfile?.perfil || "Gestão";

  const renderQuestionnaireView = () => {
    const questionario = allQuestionnaires.find(q => q.member_id === editingUserId);
    
    if (!questionario) {
      return (
        <div className="page active animate-fade-in">
          <div className="page-header">
            <button onClick={() => setAdminView("list")} className="topbar-btn mb-20">← Voltar para lista</button>
            <h1 className="page-title text-gold">Diagnóstico: {editingUserName}</h1>
          </div>
          <div className="empty-state card">O membro ainda não respondeu o questionário oficial.</div>
        </div>
      );
    }

    const r = questionario.respostas;
    const pontosFortes = []; const pontosCriticos = [];
    Object.keys(COMPORTAMENTAL_MAP).forEach(key => {
      if (r[key] === 5) pontosFortes.push(COMPORTAMENTAL_MAP[key]);
      if (r[key] === 1) pontosCriticos.push(COMPORTAMENTAL_MAP[key]);
    });

    return (
      <div className="page active animate-fade-in" style={{background: 'var(--black)', padding: '20px'}}>
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
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

        <div id="print-report" style={{ display: 'none' }}>
          <div className="header-border">
            <h1>Plano de Desenvolvimento Individual</h1>
            <h2>Liga Acadêmica de Mercado Financeiro (LAMF5)</h2>
          </div>
          <div className="print-section">
            <h3 className="print-title">Bloco 1: Contexto Pessoal</h3>
            <p className="print-item"><strong>Nome Completo:</strong> {r.nome}</p>
            <p className="print-item"><strong>Curso/Período:</strong> {r.curso} - {r.periodo}º Período</p>
            <p className="print-item"><strong>CRA:</strong> {r.cra || "Não informado"}</p>
            <p className="print-item"><strong>Entrada na Liga:</strong> {r.entrada_liga}</p>
            <p className="print-item"><strong>Experiência Profissional:</strong> {EXP_MAP[r.exp_profissional] || r.exp_profissional}</p>
            <p className="print-item"><strong>Horas Disponíveis:</strong> {r.horas_disp}</p>
          </div>

          <div className="print-section">
            <h3 className="print-title">Bloco 2 & 3: Autoavaliação Técnica</h3>
            <p className="print-item"><strong>Trilha Nivelada:</strong> {r.nivel?.toUpperCase()}</p>
            {r.nivel === "iniciante" || r.nivel === "basico" ? (
              <>
                <p className="print-item"><strong>Matemática financeira básica:</strong> {r.tec_in_math}/5</p>
                <p className="print-item"><strong>Economia (inflação, Selic, PIB):</strong> {r.tec_in_eco}/5</p>
                <p className="print-item"><strong>Bolsa de valores:</strong> {r.tec_in_bolsa}/5</p>
                <p className="print-item"><strong>Tipos de investimento:</strong> {r.tec_in_tipos}/5</p>
                <p className="print-item"><strong>Excel básico:</strong> {r.tec_in_excel}/5</p>
                <p className="print-item"><strong>Vocabulário:</strong> {(r.tec_in_vocab || []).join(', ') || "Nenhum"}</p>
                <p className="print-item" style={{ marginTop: '12px' }}><strong>Três pontos fortes:</strong><br/>{r.tec_in_fortes}</p>
                <p className="print-item"><strong>Três pontos a melhorar:</strong><br/>{r.tec_in_melhorar}</p>
              </>
            ) : r.nivel === "intermediario" ? (
              <>
                <p className="print-item"><strong>Análise fundamentalista:</strong> {r.tec_mid_fund}/5</p>
                <p className="print-item"><strong>Valuation básico:</strong> {r.tec_mid_val}/5</p>
                <p className="print-item"><strong>Contabilidade aplicada:</strong> {r.tec_mid_cont}/5</p>
                <p className="print-item"><strong>Macroeconomia aplicada:</strong> {r.tec_mid_macro}/5</p>
                <p className="print-item"><strong>Excel intermediário:</strong> {r.tec_mid_excel}/5</p>
                <p className="print-item"><strong>Redação técnica:</strong> {r.tec_mid_red}/5</p>
                <p className="print-item"><strong>Relatório/tese escrito:</strong> {r.tec_mid_relatorio || "Não informado"}</p>
                <p className="print-item" style={{ marginTop: '12px' }}><strong>Três pontos fortes:</strong><br/>{r.tec_mid_fortes}</p>
                <p className="print-item"><strong>Três pontos a melhorar:</strong><br/>{r.tec_mid_melhorar}</p>
              </>
            ) : (
              <>
                <p className="print-item"><strong>3-Statement Model:</strong> {r.tec_adv_mod}/5</p>
                <p className="print-item"><strong>DCF Avançado:</strong> {r.tec_adv_dcf}/5</p>
                <p className="print-item"><strong>LBO e PE Return:</strong> {r.tec_adv_lbo}/5</p>
                <p className="print-item"><strong>M&A (Due Diligence):</strong> {r.tec_adv_ma}/5</p>
                <p className="print-item"><strong>Excel Avançado (VBA):</strong> {r.tec_adv_excel}/5</p>
                <p className="print-item"><strong>Python/Dados:</strong> {r.tec_adv_py}/5</p>
                <p className="print-item"><strong>Áreas descartadas:</strong> {r.tec_adv_descarte || "Não preenchido"}</p>
                <p className="print-item" style={{ marginTop: '12px' }}><strong>Três pontos fortes:</strong><br/>{r.tec_adv_fortes}</p>
                <p className="print-item"><strong>Três pontos a melhorar:</strong><br/>{r.tec_adv_melhorar}</p>
              </>
            )}
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
            <p className="print-item"><strong>Acadêmicas:</strong><br/>1. {r.m_acad_1}<br/>2. {r.m_acad_2 || "-"}<br/>3. {r.m_acad_3 || "-"}</p>
            <p className="print-item"><strong>Certificações/Cursos:</strong><br/>1. {r.m_cert_1}<br/>2. {r.m_cert_2 || "-"}<br/>3. {r.m_cert_3 || "-"}</p>
            <p className="print-item"><strong>Profissionais:</strong><br/>1. {r.m_prof_1}<br/>2. {r.m_prof_2 || "-"}<br/>3. {r.m_prof_3 || "-"}</p>
            {r.m_pes_1 && <p className="print-item"><strong>Pessoais:</strong> 1. {r.m_pes_1 || "-"}</p>}
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
          
          <div className="footer">Documento Oficial Gerado pelo Sistema de Gestão de Pessoas da LAMF5.</div>
        </div>

        <div>
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
        </div>
      </div>
    );
  };

  const renderAdminTab = () => {
    if (adminView === "questionnaire") return renderQuestionnaireView();

    if (adminView === "goals") {
      return (
        <div className="page active animate-fade-in">
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
                <div className="form-group mb-20">
                  <label className="form-label">Título da Meta</label>
                  <input required className="form-input" placeholder="Ex: Tirar CPA-20" value={newGoal.title} onChange={e => setNewGoal({...newGoal, title: e.target.value})} />
                </div>
                
                <div className="grid-2 gap-16 mb-20">
                  <div className="form-group">
                    <label className="form-label">Prazo Limite</label>
                    <input required type="date" className="form-input" value={newGoal.deadline} onChange={e => setNewGoal({...newGoal, deadline: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status Inicial</label>
                    <select className="form-select" value={newGoal.status} onChange={e => setNewGoal({...newGoal, status: e.target.value})}>
                      <option value="Ainda não começou">Ainda não começou</option>
                      <option value="Em andamento">Em andamento</option>
                      <option value="Concluída">Concluída</option>
                    </select>
                  </div>
                </div>

                <div className="grid-2 gap-16 mb-24">
                  <div className="form-group">
                    <label className="form-label">Upload de Material (Opcional)</label>
                    <input 
                      id="file-upload-admin"
                      type="file" 
                      className="form-input" 
                      style={{ padding: '10px' }}
                      onChange={e => setAdminFile(e.target.files[0])} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">OU Cole um Link Externo</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Ex: Link do YouTube, Drive..." 
                      value={newGoal.admin_attachment} 
                      onChange={e => setNewGoal({...newGoal, admin_attachment: e.target.value})} 
                      disabled={!!adminFile} 
                    />
                  </div>
                </div>

                <div className="form-group mb-24">
                  <label className="form-label">Descrição e Instruções</label>
                  <textarea required className="form-textarea" placeholder="Instruções claras para o membro..." value={newGoal.description} onChange={e => setNewGoal({...newGoal, description: e.target.value})} />
                </div>
                <button type="submit" className="topbar-btn primary w-full" disabled={isSaving}>{isSaving ? "Criando/Enviando..." : "Atribuir Meta ao Membro"}</button>
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
                      
                      <div style={{ marginTop: '12px', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span className={`badge ${goal.status === 'Concluída' ? 'badge-success' : goal.status === 'Em andamento' ? 'badge-warning' : 'badge-muted'}`}>
                          {goal.status}
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Prazo: {new Date(goal.deadline).toLocaleDateString('pt-BR')}</span>
                      </div>

                      {goal.student_attachment && (
                        <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(40, 167, 69, 0.05)', border: '1px solid var(--success)', borderRadius: '8px' }}>
                          <p style={{ fontSize: '12px', color: 'var(--success)', marginBottom: '4px', fontWeight: 'bold' }}>✓ Entrega do Aluno:</p>
                          <a href={goal.student_attachment} target="_blank" rel="noreferrer" style={{ fontSize: '13px', color: 'var(--gold)', textDecoration: 'none', wordBreak: 'break-all' }}>
                            Acessar Arquivo/Link submetido
                          </a>
                        </div>
                      )}
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
                <th>Resultado Quiz</th>
                <th style={{ textAlign: "right" }}>Ações de Gestão</th>
              </tr>
            </thead>
            <tbody>
              {allStudents.map(student => {
                const isAnswered = allQuestionnaires.some(q => q.member_id === student.id);
                return (
                  <tr key={student.id}>
                    <td>
                      <div className="inline-row gap-12">
                        <div className="avatar avatar-sm">{(student.nome_completo || "??").substring(0, 2).toUpperCase()}</div>
                        {student.nome_completo || "Membro Sem Nome"}
                      </div>
                    </td>
                    <td><span className="tag">{student.diretoria}</span></td>
                    <td>
                      <span className={`badge ${isAnswered ? 'badge-success' : 'badge-muted'}`}>
                        {isAnswered ? '✓ Respondeu' : 'Pendente'}
                      </span>
                    </td>
                    <td>
                      {student.quiz_resultado ? (
                        <div>
                          <div style={{color: 'var(--gold-light)', fontWeight: '600', fontSize: '13px'}}>{student.quiz_resultado}</div>
                          <div style={{fontSize: '11px', marginTop: '4px', color: student.quiz_feedback === true ? 'var(--success)' : (student.quiz_feedback === false ? 'var(--danger)' : 'var(--text-muted)')}}>
                            {student.quiz_feedback === true ? '👍 Concordou' : (student.quiz_feedback === false ? '👎 Discordou' : '⏳ Sem feedback')}
                          </div>
                        </div>
                      ) : (
                        <span className="badge badge-muted" style={{ background: 'transparent', border: '1px dashed var(--border)' }}>Pendente</span>
                      )}
                    </td>

                    <td style={{ textAlign: "right", display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                      <button className="topbar-btn" onClick={() => handleViewQuestionnaire(student.id, student.nome_completo)} disabled={!isAnswered} style={{ opacity: !isAnswered ? 0.5 : 1, cursor: !isAnswered ? 'not-allowed' : 'pointer' }}>
                        Ver Diagnóstico
                      </button>
                      {isAnswered && (
                        <button className="topbar-btn" style={{borderColor: 'var(--warning)', color: 'var(--warning)'}} onClick={() => handleUnlockQuestionnaire(student.id, student.nome_completo)}>
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
            <div className="nav-item" onClick={() => router.push('/dashboard')}>
              <svg className="nav-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h6v6H4zm10 0h6v6h-6zM4 14h6v6H4zm10 0h6v6h-6z"/></svg> Painel Central
            </div>
            
            <div className="nav-item" onClick={() => router.push('/dashboard/meuperfil')}>
              <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg> Meu Perfil
            </div>

            <div className="nav-item" onClick={() => router.push('/questionario')}>
              <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg> Questionário Oficial
            </div>

            <div className="nav-item" onClick={() => router.push('/quiz')}>
              <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg> Quiz Vocacional
            </div>

            <div className="nav-item" onClick={() => router.push('/dashboard')}>
              <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg> Meu PDI
            </div>
            
            <div className="nav-item" onClick={() => router.push('/dashboard/metas')}>
              <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg> Minhas Metas
            </div>
          </div>
          
          <div className="nav-section" style={{ marginTop: '24px' }}>
            <div className="nav-label">Administração</div>
            <div className="nav-item active" onClick={() => setAdminView('list')}>
              <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg> 
              Painel Admin
              <span className="nav-badge">GP</span>
            </div>
          </div>
        </nav>
      </aside>
      
      <main className="main">
        <header className="topbar">
          <div className="topbar-breadcrumb">
            <span>Sistema LAMF5</span><span>›</span><span className="current">Painel Administrativo</span>
          </div>
          <div className="topbar-right"><button className="topbar-btn" onClick={handleLogout}>Sair do Sistema</button></div>
        </header>
        
        <div className="scroll-area" style={{ flex: 1 }}>
          {renderAdminTab()}
        </div>
      </main>
    </div>
  );
}