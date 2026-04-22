"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase"; 
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CadastroPage() {
  const [nome, setNome] = useState("");
  const [diretoria, setDiretoria] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleCadastro = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // 1. Cria o usuário no sistema de Autenticação
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nome_completo: nome, diretoria: diretoria }
      }
    });

    if (authError) {
      setError("Erro ao criar conta. Verifique os dados.");
      setLoading(false);
      return;
    }

    // 2. SALVA NA NOSSA NOVA TABELA DE PERFIS
    if (authData?.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert([
          { 
            id: authData.user.id, 
            user_id: authData.user.id, 
            email: email, 
            nome_completo: nome, 
            diretoria: diretoria,
            perfil: "Estudante" 
          }
        ]);
        
      if (profileError) console.error("Erro ao salvar perfil:", profileError);
    }

    setSuccess(true);
    setTimeout(() => {
      router.push("/"); // Redireciona para a página inicial (Login)
    }, 3000);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--black)', padding: '20px' }}>
      <div style={{ background: 'var(--surface)', padding: '40px', borderRadius: '12px', border: '1px solid var(--border)', width: '100%', maxWidth: '450px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 className="page-title" style={{ fontSize: '28px', color: 'var(--gold)' }}>Criar Conta</h1>
          <p className="page-subtitle">Junte-se ao Sistema LAMF5</p>
        </div>

        {error && (
          <div className="highlight-box" style={{ borderColor: 'var(--danger)', color: 'var(--danger)', marginBottom: '20px', borderLeftColor: 'var(--danger)' }}>
            {error}
          </div>
        )}

        {success && (
          <div className="highlight-box" style={{ borderColor: 'var(--success)', color: 'var(--success)', marginBottom: '20px', borderLeftColor: 'var(--success)' }}>
            Conta criada com sucesso! Redirecionando para o login...
          </div>
        )}

        <form onSubmit={handleCadastro} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Nome Completo</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="form-input"
              placeholder="Digite seu nome"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Diretoria</label>
            <select
              value={diretoria}
              onChange={(e) => setDiretoria(e.target.value)}
              className="form-select"
              required
            >
              <option value="">Selecione sua diretoria</option>
              <option value="Presidência">Presidência</option>
              <option value="Vice-Presidência">Vice-Presidência</option>
              <option value="Gestão de Pessoas">Gestão de Pessoas</option>
              <option value="Projetos">Projetos</option>
              <option value="Marketing">Marketing</option>
              <option value="Comercial">Comercial</option>
              <option value="Jurídico e Financeiro">Jurídico e Financeiro</option>
            </select>
          </div>

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
            <label className="form-label">Criar Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="Mínimo 6 caracteres"
              required
              minLength="6"
            />
          </div>

          <button type="submit" className="topbar-btn primary" disabled={loading || success} style={{ marginTop: '16px', padding: '12px' }}>
            {loading ? "Criando conta..." : "Cadastrar"}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)' }}>
          Já tem uma conta?{" "}
          <Link href="/" style={{ color: 'var(--gold)', fontWeight: '600', textDecoration: 'none' }}>
            Fazer login
          </Link>
        </div>
      </div>
    </div>
  );
}