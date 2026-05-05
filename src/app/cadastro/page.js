"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

// ============================================================================
// WHITELIST (LISTA DE E-MAILS AUTORIZADOS)
// ============================================================================
const EMAILS_AUTORIZADOS = [
  "alexandre.marculino@ufv.br",
"alisson.anastacio@ufv.br",
"ariane.cespedes@ufv.br",
"Arthur.p.correa@ufv.br",
"Arthur.madeira@ufv.br",
"barbara.more@ufv.br",
"bernardo.matos@ufv.br",
"jeong.changyoung@ufv.br",
"danilo.s.ribeiro@ufv.br",
"enzo.goyata@ufv.br",
"fabricio.gibbert@ufv.br",
"gabriel.mariosa@ufv.br",
"gabriel.h.olimpio@ufv.br",
"gabriel.s.prado@ufv.br",
"gabriela.silva.oliveira@ufv.br",
"gabriella.conceicao@ufv.br",
"ian.sousa@ufv.br",
"joao.molina@ufv.br",
"kawa.santos@ufv.br",
"marcos.a.rocha@ufv.br",
"maria.makiyama@ufv.br",
"mariana.s.vieira@ufv.br",
"matheus.f.andrade@ufv.br",
"otto.dias@ufv.br",
"rafael.severino@ufv.br",
"rhayssa.joaquim@ufv.br",
"joao.p.paula@ufv.br"
];

const DIRETORIAS = [
  "Presidente",
  "Vice Presidente",
  "Projetos",
  "Qualidade",
  "Gestão de Pessoas",
  "Comunicação"
];

export default function CadastroPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [sucesso, setSucesso] = useState(false);
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

  const handleCadastro = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: "", text: "" });

    const emailTratado = email.trim().toLowerCase();

    try {
      // 1. Trava da Whitelist
      if (!EMAILS_AUTORIZADOS.includes(emailTratado)) {
        setMessage({ type: "error", text: "Acesso negado: Este e-mail não está na lista de membros autorizados. Contate a Gestão de Pessoas." });
        setIsSaving(false);
        return;
      }

      // 2. Validações de Senha e Diretoria
      if (!diretoria) {
        setMessage({ type: "error", text: "Por favor, selecione sua diretoria atual." });
        setIsSaving(false);
        return;
      }

      if (senha !== confirmarSenha) {
        setMessage({ type: "error", text: "As senhas não coincidem. Verifique a digitação." });
        setIsSaving(false);
        return;
      }

      if (senha.length < 6) {
        setMessage({ type: "error", text: "A senha deve ter pelo menos 6 caracteres." });
        setIsSaving(false);
        return;
      }

      // 3. Cadastra no Supabase passando nome e diretoria via meta-dados
      const { data, error } = await supabase.auth.signUp({
        email: emailTratado,
        password: senha,
        options: {
          data: {
            nome_completo: nome,
            diretoria: diretoria,
            perfil: diretoria === "Presidente" || diretoria === "Gestão de Pessoas" ? diretoria : "Membro" // Define acesso basico
          }
        }
      });

      if (error) throw error;

      // 4. Sucesso!
      if (data?.user && !data?.session) {
        setSucesso(true);
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      let errorMsg = err.message;
      if (errorMsg.includes("User already registered")) errorMsg = "Este e-mail já está cadastrado.";
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setIsSaving(false);
    }
  };

  const IconEyeOpen = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>;
  const IconEyeClosed = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>;

  const inputStyle = { padding: '14px 16px', fontSize: '15px', height: 'auto', borderRadius: '8px' };

  if (sucesso) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--black)', padding: '20px' }}>
        <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '440px', padding: '40px', textAlign: 'center', borderTop: '4px solid var(--success)' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✉️</div>
          <h1 style={{ fontSize: '24px', color: 'var(--text-primary)', marginBottom: '16px' }}>Confirme seu e-mail</h1>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '32px' }}>
            Seu cadastro foi aprovado! Nós enviamos um link de confirmação para <strong>{email}</strong>. Por favor, verifique sua caixa de entrada (ou pasta de spam) para ativar sua conta.
          </p>
          <button onClick={() => router.push('/')} className="topbar-btn primary w-full" style={{ padding: '14px' }}>
            Ir para a tela de Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--black)', padding: '40px 20px' }}>
      
      <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '40px', background: 'rgba(28, 28, 28, 0.9)', backdropFilter: 'blur(12px)', borderTop: '4px solid var(--gold)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '24px', color: 'var(--text-primary)', marginBottom: '8px' }}>Criar nova conta</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Acesso exclusivo para membros da LAMF5</p>
        </div>

        {message.text && (
          <div className="highlight-box mb-24" style={{ padding: '16px', fontSize: '14px', borderColor: message.type === 'error' ? 'var(--danger)' : 'var(--success)', color: message.type === 'error' ? 'var(--danger)' : 'var(--success)', borderLeftColor: message.type === 'error' ? 'var(--danger)' : 'var(--success)' }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleCadastro}>
          
          <div className="form-group mb-20">
            <label className="form-label" style={{ fontSize: '14px' }}>Nome Completo</label>
            <input className="form-input" required value={nome} onChange={e => setNome(e.target.value)} style={inputStyle} placeholder="Seu nome e sobrenome" />
          </div>

          <div className="form-group mb-20">
            <label className="form-label" style={{ fontSize: '14px' }}>Diretoria</label>
            <select className="form-select" required value={diretoria} onChange={e => setDiretoria(e.target.value)} style={inputStyle}>
              <option value="">Selecione sua diretoria...</option>
              {DIRETORIAS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div className="form-group mb-20">
            <label className="form-label" style={{ fontSize: '14px' }}>E-mail</label>
            <input type="email" className="form-input" required value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} placeholder="O e-mail cadastrado na liga" />
          </div>

          <div className="grid-2 gap-16 mb-24">
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '14px' }}>Senha</label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <input 
                  type={showSenha ? "text" : "password"} 
                  className="form-input" 
                  required 
                  value={senha} 
                  onChange={e => setSenha(e.target.value)} 
                  style={{ ...inputStyle, paddingRight: "40px", width: "100%" }}
                  placeholder="Mínimo 6"
                />
                <button 
                  type="button" 
                  onClick={() => setShowSenha(!showSenha)}
                  style={{ position: "absolute", right: "12px", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", padding: 0 }}
                >
                  {showSenha ? <IconEyeClosed /> : <IconEyeOpen />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontSize: '14px' }}>Confirmar</label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <input 
                  type={showConfirmarSenha ? "text" : "password"} 
                  className="form-input" 
                  required 
                  value={confirmarSenha} 
                  onChange={e => setConfirmarSenha(e.target.value)} 
                  style={{ ...inputStyle, paddingRight: "40px", width: "100%", opacity: !senha ? 0.5 : 1 }}
                  disabled={!senha}
                  placeholder="Repita"
                />
                <button 
                  type="button" 
                  onClick={() => setShowConfirmarSenha(!showConfirmarSenha)}
                  disabled={!senha}
                  style={{ position: "absolute", right: "12px", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", padding: 0 }}
                >
                  {showConfirmarSenha ? <IconEyeClosed /> : <IconEyeOpen />}
                </button>
              </div>
            </div>
          </div>

          <button type="submit" className="topbar-btn primary w-full mt-4" style={{ padding: '16px', fontSize: '16px', fontWeight: 'bold', borderRadius: '8px' }} disabled={isSaving}>
            {isSaving ? "Verificando..." : "Criar Cadastro Oficial"}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '32px', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Já possui uma conta ativa?</p>
          <button 
            type="button" 
            onClick={() => router.push('/')}
            style={{ background: 'none', border: 'none', color: 'var(--gold)', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px' }}
          >
            Fazer login no sistema
          </button>
        </div>

      </div>
    </div>
  );
}