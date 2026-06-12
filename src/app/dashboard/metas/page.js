"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";

export default function MetasStudentPage() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Estados para edição
  const [editingGoalId, setEditingGoalId] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState("");
  const [linkUpdate, setLinkUpdate] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadData() {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) { router.push("/"); return; }

      const { data: myGoals } = await supabase.from('goals').select('*').eq('member_id', user.id).order('created_at', { ascending: false });
      if (myGoals) setGoals(myGoals);

      setLoading(false);
    }
    loadData();
  }, [router]);

  const handleOpenEdit = (goal) => {
    setEditingGoalId(goal.id);
    setStatusUpdate(goal.status || "Ainda não começou");
    setLinkUpdate(goal.student_attachment || "");
  };

  const handleCancelEdit = () => {
    setEditingGoalId(null);
    setStatusUpdate("");
    setLinkUpdate("");
  };

  const handleSaveUpdate = async (goalId) => {
    setIsSaving(true);
    
    // Encontra a meta atual para verificar se ela já tinha data
    const currentGoal = goals.find(g => g.id === goalId);
    
    // Prepara o pacote de dados básico
    const payload = { 
      status: statusUpdate, 
      student_attachment: linkUpdate 
    };

    // LÓGICA DE DATAS AUTOMÁTICAS
    const agora = new Date().toISOString();

    if (statusUpdate === "Em andamento" && !currentGoal.started_at) {
      payload.started_at = agora; // Carimba o início
    } else if (statusUpdate === "Concluída" && !currentGoal.completed_at) {
      payload.completed_at = agora; // Carimba o fim
      if (!currentGoal.started_at) payload.started_at = agora; // Se pulou direto pro fim, carimba início também
    } else if (statusUpdate === "Ainda não começou") {
      // Se o aluno voltar o status para não começou, zera as datas
      payload.started_at = null;
      payload.completed_at = null;
    }

    const { error } = await supabase.from('goals').update(payload).eq('id', goalId);

    if (!error) {
      // Atualiza a tela instantaneamente
      setGoals(goals.map(g => g.id === goalId ? { ...g, ...payload } : g));
      setEditingGoalId(null);
    } else {
      alert("Erro ao atualizar a meta.");
    }
    setIsSaving(false);
  };

  if (loading) {
    return <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--black)' }}><p style={{ color: 'var(--gold)', fontWeight: 'bold' }}>CARREGANDO METAS...</p></div>;
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--black)", display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 20px" }}>
      
      <div style={{ width: "100%", maxWidth: "900px", marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <button onClick={() => router.push('/dashboard')} className="topbar-btn mb-16" style={{ fontSize: '13px', padding: '8px 16px' }}>← Voltar ao Dashboard</button>
          <h1 className="page-title" style={{ fontSize: "28px" }}>Minhas Metas Oficiais</h1>
          <p className="page-subtitle" style={{ fontSize: "14px" }}>Acompanhe e comprove a evolução das suas tarefas do PDI.</p>
        </div>
      </div>

      <div style={{ width: "100%", maxWidth: "900px" }}>
        {goals.length === 0 ? (
          <div className="empty-state card" style={{ padding: "60px", textAlign: "center" }}>
            <div className="empty-icon" style={{ fontSize: "48px", marginBottom: "16px" }}>🎯</div>
            <div className="empty-title" style={{ fontSize: "20px", color: "var(--text-primary)", marginBottom: "8px" }}>Nenhuma meta ativa</div>
            <div className="empty-desc" style={{ color: "var(--text-secondary)" }}>A Gestão de Pessoas ainda não definiu suas metas oficiais para este ciclo.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {goals.map(goal => {
              const isEditing = editingGoalId === goal.id;
              
              return (
                <div key={goal.id} className="card animate-fade-in" style={{ padding: "32px", borderLeft: goal.status === 'Concluída' ? "4px solid var(--success)" : goal.status === 'Em andamento' ? "4px solid var(--warning)" : "4px solid var(--border)" }}>
                  
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                    <div>
                      <h2 style={{ fontSize: "20px", color: "var(--text-primary)", marginBottom: "8px" }}>{goal.title}</h2>
                      <div style={{ display: "flex", gap: "12px", alignItems: "center", fontSize: "13px", color: "var(--text-muted)", flexWrap: "wrap" }}>
                        <span className={`badge ${goal.status === 'Concluída' ? 'badge-success' : goal.status === 'Em andamento' ? 'badge-warning' : 'badge-muted'}`}>
                          {goal.status}
                        </span>
                        <span>•</span>
                        <span>Prazo: <strong>{new Date(goal.deadline).toLocaleDateString('pt-BR')}</strong></span>
                      </div>

                      {/* DATAS DE INÍCIO E TÉRMINO EXIBIDAS AQUI */}
                      <div style={{ display: "flex", gap: "16px", marginTop: "12px", fontSize: "12px" }}>
                        {goal.started_at && (
                          <span style={{ color: "var(--warning)" }}>▶ Iniciado em: {new Date(goal.started_at).toLocaleDateString('pt-BR')}</span>
                        )}
                        {goal.completed_at && (
                          <span style={{ color: "var(--success)" }}>✓ Concluído em: {new Date(goal.completed_at).toLocaleDateString('pt-BR')}</span>
                        )}
                      </div>
                    </div>
                    
                    {!isEditing && (
                      <button onClick={() => handleOpenEdit(goal)} className="topbar-btn" style={{ fontSize: "13px", borderColor: "var(--gold)", color: "var(--gold)" }}>
                        Atualizar Entrega
                      </button>
                    )}
                  </div>

                  <div style={{ background: "rgba(255,255,255,0.02)", padding: "20px", borderRadius: "8px", marginBottom: "20px" }}>
                    <p style={{ fontSize: "15px", color: "var(--text-secondary)", lineHeight: "1.7", whiteSpace: "pre-wrap", marginBottom: goal.admin_attachment ? "16px" : "0" }}>
                      {goal.description}
                    </p>
                    
                    {goal.admin_attachment && (
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <span style={{ fontSize: "18px" }}>📎</span>
                        <a href={goal.admin_attachment} target="_blank" rel="noreferrer" style={{ fontSize: "14px", color: "var(--info)", textDecoration: "none", fontWeight: "bold" }}>
                          Acessar material de apoio do gestor
                        </a>
                      </div>
                    )}
                  </div>

                  {!isEditing && goal.student_attachment && (
                    <div style={{ padding: "16px", border: "1px dashed var(--success)", borderRadius: "8px", background: "rgba(40, 167, 69, 0.05)" }}>
                      <p style={{ fontSize: "13px", color: "var(--success)", marginBottom: "4px", fontWeight: "bold" }}>Sua entrega cadastrada:</p>
                      <a href={goal.student_attachment} target="_blank" rel="noreferrer" style={{ fontSize: "14px", color: "var(--gold)", textDecoration: "none", wordBreak: "break-all" }}>
                        {goal.student_attachment}
                      </a>
                    </div>
                  )}

                  {isEditing && (
                    <div style={{ padding: "24px", border: "1px solid var(--border)", borderRadius: "12px", background: "var(--surface2)", marginTop: "24px" }}>
                      <h4 style={{ fontSize: "16px", color: "var(--text-primary)", marginBottom: "16px" }}>Atualizar Progresso</h4>
                      
                      <div className="grid-2 gap-16 mb-20">
                        <div className="form-group">
                          <label className="form-label">Status da Meta</label>
                          <select className="form-select" value={statusUpdate} onChange={e => setStatusUpdate(e.target.value)}>
                            <option value="Ainda não começou">Ainda não começou</option>
                            <option value="Em andamento">Em andamento</option>
                            <option value="Concluída">Concluída</option>
                          </select>
                        </div>
                        
                        <div className="form-group">
                          <label className="form-label">Link de Comprovação (Opcional)</label>
                          <input 
                            type="text" 
                            className="form-input" 
                            placeholder="Cole o link do seu PDF, Drive ou certificado..." 
                            value={linkUpdate} 
                            onChange={e => setLinkUpdate(e.target.value)} 
                          />
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                        <button onClick={handleCancelEdit} className="topbar-btn" disabled={isSaving}>Cancelar</button>
                        <button onClick={() => handleSaveUpdate(goal.id)} className="topbar-btn primary" disabled={isSaving}>
                          {isSaving ? "Salvando..." : "Salvar Atualização"}
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}