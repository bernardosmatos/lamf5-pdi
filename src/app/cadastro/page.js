"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CadastroPage() {
  // Added memory boxes for Nome and Diretoria
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

    // 1. Creates the user in the Auth system
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

    // 2. SAVES THEM TO OUR NEW PROFILES TABLE!
    // We set everyone to 'Estudante' by default. The Admin can change this later.
   if (authData?.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert([
          { 
            id: authData.user.id, 
            user_id: authData.user.id, // <-- A MÁGICA ESTÁ NESTA LINHA!
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
      router.push("/login");
    }, 3000);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-10">
      <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-green-700 mb-6 text-center">
          Criar Conta - PDI
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 text-sm text-center">
            Conta criada com sucesso! Redirecionando para o login...
          </div>
        )}

        <form onSubmit={handleCadastro} className="flex flex-col gap-4">
          
          {/* New Input for Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome Completo
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Digite seu nome"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 outline-none focus:border-green-500"
            />
          </div>

          {/* New Input for Diretoria */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Diretoria
            </label>
            <select
              value={diretoria}
              onChange={(e) => setDiretoria(e.target.value)}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-green-500 bg-white"
            >
              <option value="" disabled>Selecione sua diretoria</option>
              <option value="Presidência">Presidência</option>
              <option value="Gestão de Pessoas">Gestão de Pessoas</option>
              <option value="Projetos">Projetos</option>
              <option value="Marketing">Marketing</option>
              <option value="Comercial">Comercial</option>
              <option value="Outra">Outra</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-mail da Liga
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="membro@lamf5.com.br"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 outline-none focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Criar Senha (mín. 6 caracteres)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 outline-none focus:border-green-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="bg-green-600 text-white px-4 py-2 rounded font-medium hover:bg-green-700 transition mt-4 disabled:bg-green-400"
          >
            {loading ? "Criando..." : "Cadastrar"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Já tem uma conta?{" "}
            <Link href="/login" className="text-blue-600 hover:underline font-medium">
              Faça login aqui
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}