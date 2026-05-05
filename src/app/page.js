"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";

// ============================================================================
// WHITELIST (LISTA DE E-MAILS AUTORIZADOS)
// ============================================================================
// Coloque aqui os e-mails de todos os membros da liga. 
// Deixe tudo em letras minúsculas.
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

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const router = useRouter();

  // Campos do formulário
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  // Visibilidade das senhas
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);

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

  const handleAuth = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: "", text: "" });

    // Pega o e-mail digitado, remove espaços em branco e deixa tudo minúsculo
    const emailTratado = email.trim().toLowerCase();

    try {
      if (isLogin) {
        // LÓGICA DE LOGIN
        const { error } = await supabase.auth.signInWithPassword({ email: emailTratado, password: senha });
        if (error) throw error;
        
        router.push("/dashboard");

      } else {
        // LÓGICA DE CADASTRO E VERIFICAÇÃO DA WHITELIST
        
        // 1. Trava da Whitelist
        if (!EMAILS_AUTORIZADOS.includes(emailTratado)) {
          setMessage({ type: "error", text: "Acesso negado: Este e-mail não está na lista de membros autorizados da LAMF5. Contate a Gestão de Pessoas." });
          setIsSaving(false);
          return;
        }

        // 2. Trava das Senhas
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

        // 3. Cadastra no Supabase
        const { data, error } = await supabase.auth.signUp({
          email: emailTratado,
          password: senha,
          options: {
            data: {
              nome_completo: nome,
            }
          }
        });

        if (error) throw error;

        // Verifica se o Supabase exige confirmação de email (se sim, a session vem nula no cadastro)
        if (data?.user && !data?.session) {
          setMessage({ type: "success", text: "Cadastro autorizado! Verifique sua caixa de entrada (ou spam) para confirmar seu e-mail antes de logar." });
          // Limpa os campos e volta pro login
          setNome("");
          setEmail("");
          setSenha("");
          setConfirmarSenha("");
          setIsLogin(true);
        } else {
          // Se a confirmação de email estiver desligada, ele loga direto
          router.push("/dashboard");
        }
      }
    } catch (err) {
      // Tradução de alguns erros comuns do Supabase
      let errorMsg = err.message;
      if (errorMsg.includes("Invalid login credentials")) errorMsg = "E-mail ou senha incorretos.";
      if (errorMsg.includes("User already registered")) errorMsg = "Este e-mail já está cadastrado.";
      if (errorMsg.includes("Email not confirmed")) errorMsg = "Por favor, confirme seu e-mail antes de fazer login.";
      
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setIsSaving(false);
    }
  };

  // Ícones do Olho
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
          <h1 style={{ fontSize: '24px', color: 'var(--text-primary)', marginBottom: '8px' }}>{isLogin ? "Acesse sua conta" : "Criar nova conta"}</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Sistema de Gestão de PDI - LAMF5</p>
        </div>

        {message.text && (
          <div className="highlight-box mb-24" style={{ padding: '16px', fontSize: '14px', borderColor: message.type === 'error' ? 'var(--danger)' : 'var(--success)', color: message.type === 'error' ? 'var(--danger)' : 'var(--success)', borderLeftColor: message.type === 'error' ? 'var(--danger)' : 'var(--success)' }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleAuth}>
          
          {!isLogin && (
            <div className="form-group mb-20">
              <label className="form-label" style={{ fontSize: '14px' }}>Nome Completo</label>
              <input className="form-input" required value={nome} onChange={e => setNome(e.target.value)} style={inputStyle} placeholder="Seu nome completo" />
            </div>
          )}

          <div className="form-group mb-20">
            <label className="form-label" style={{ fontSize: '14px' }}>E-mail corporativo ou pessoal</label>
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
                placeholder="Mínimo de 6 caracteres"
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

          {!isLogin && (
            <div className="form-group mb-24">
              <label className="form-label" style={{ fontSize: '14px' }}>Confirmar Senha</label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <input 
                  type={showConfirmarSenha ? "text" : "password"} 
                  className="form-input" 
                  required 
                  value={confirmarSenha} 
                  onChange={e => setConfirmarSenha(e.target.value)} 
                  style={{ ...inputStyle, paddingRight: "50px", width: "100%" }}
                  placeholder="Repita sua senha"
                />
                <button 
                  type="button" 
                  onClick={() => setShowConfirmarSenha(!showConfirmarSenha)}
                  style={{ position: "absolute", right: "14px", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", padding: 0 }}
                >
                  {showConfirmarSenha ? <IconEyeClosed /> : <IconEyeOpen />}
                </button>
              </div>
            </div>
          )}

          <button type="submit" className="topbar-btn primary w-full mt-8" style={{ padding: '16px', fontSize: '16px', fontWeight: 'bold', borderRadius: '8px' }} disabled={isSaving}>
            {isSaving ? "Processando..." : (isLogin ? "Entrar no Sistema" : "Cadastrar")}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '32px', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            {isLogin ? "Ainda não faz parte da Liga?" : "Já possui uma conta ativa?"}
          </p>
          <button 
            type="button" 
            onClick={() => {
              setIsLogin(!isLogin);
              setMessage({ type: "", text: "" }); // Limpa erros ao trocar de tela
              setSenha("");
              setConfirmarSenha("");
            }}
            style={{ background: 'none', border: 'none', color: 'var(--gold)', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px' }}
          >
            {isLogin ? "Criar meu acesso oficial" : "Fazer login no sistema"}
          </button>
        </div>

      </div>
    </div>
  );
}