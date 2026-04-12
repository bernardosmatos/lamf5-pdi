"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("visao-geral");
  const router = useRouter();

  useEffect(() => {
    async function loadDashboard() {
      // 1. Get the logged in user
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        router.push("/login");
        return;
      }
      setUser(user);

      // 2. Check their specific role in our new profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      setUserProfile(profile);

      // 3. IF THEY ARE ADMIN, download the list of all students!
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
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <p className="text-yellow-500 font-bold text-xl tracking-widest uppercase">Carregando Sistema...</p>
      </div>
    );
  }

  const nomeCompleto = userProfile?.nome_completo || user?.user_metadata?.nome_completo || "Membro";
  const diretoria = userProfile?.diretoria || user?.user_metadata?.diretoria || "LAMF5";

  // --- CONTENT RENDERERS FOR EACH TAB --- //
  
  const renderVisaoGeral = () => (
    <div className="animate-fade-in space-y-6">
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-lg">
        <h2 className="text-xl font-bold text-white mb-2">Bem-vindo ao Portal PDI</h2>
        <p className="text-gray-400 text-sm leading-relaxed">
          Este é o seu ambiente exclusivo de desenvolvimento dentro da Liga Acadêmica de Mercado Financeiro. 
          Utilize o menu lateral para gerenciar suas metas, avaliar seu diagnóstico e acessar materiais premium.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Metas Ativas</p>
            <p className="text-3xl font-bold text-yellow-500 mt-1">2</p>
          </div>
          <div className="bg-gray-900 p-3 rounded-full border border-gray-700">
            🎯
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Ciclo Atual</p>
            <p className="text-xl font-bold text-white mt-1">60 Dias</p>
          </div>
          <div className="bg-gray-900 p-3 rounded-full border border-gray-700">
            ⏱️
          </div>
        </div>
      </div>
    </div>
  );

  const renderDiagnostico = () => (
    <div className="animate-fade-in bg-gray-800 rounded-lg p-8 border border-gray-700 shadow-lg">
      <h2 className="text-2xl font-bold text-yellow-500 mb-6 border-b border-gray-700 pb-4">📋 Diagnóstico Inicial</h2>
      <p className="text-gray-300 mb-6">Revise suas áreas de interesse e competências mapeadas na última reunião de 1:1 com a Gestão de Pessoas.</p>
      <div className="bg-gray-900 p-6 rounded border border-gray-700">
        <p className="text-gray-400 text-sm text-center">O formulário de diagnóstico detalhado será carregado aqui.</p>
      </div>
    </div>
  );

  const renderMetas = () => (
    <div className="animate-fade-in bg-gray-800 rounded-lg p-8 border border-gray-700 shadow-lg">
      <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
        <h2 className="text-2xl font-bold text-yellow-500">🎯 Plano de Ação (SMART)</h2>
        <button className="bg-yellow-600 hover:bg-yellow-500 text-gray-900 font-bold py-2 px-4 rounded text-sm transition-colors">
          + Nova Meta
        </button>
      </div>
      
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-5 mb-4">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-bold text-white text-lg">Estudar Valuation por DCF</h3>
          <span className="text-xs bg-yellow-500/20 text-yellow-500 border border-yellow-500/50 px-2 py-1 rounded font-bold uppercase tracking-wider">Em andamento</span>
        </div>
        <p className="text-sm text-gray-400 mb-4">Finalizar curso do Damodaran e montar planilha modelo para a diretoria.</p>
        
        <div className="w-full bg-gray-800 rounded-full h-2 mb-2 border border-gray-700">
          <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '45%' }}></div>
        </div>
        <div className="flex justify-between text-xs font-medium">
          <span className="text-gray-500">Início: 01/04</span>
          <span className="text-yellow-500">45% Concluído</span>
          <span className="text-gray-500">Prazo: 20/06</span>
        </div>
      </div>
    </div>
  );

  const renderRecursos = () => (
    <div className="animate-fade-in bg-gray-800 rounded-lg p-8 border border-gray-700 shadow-lg">
      <h2 className="text-2xl font-bold text-yellow-500 mb-6 border-b border-gray-700 pb-4">📚 Banco de Recursos</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-900 border border-gray-700 p-5 rounded hover:border-yellow-500/50 transition cursor-pointer group">
          <span className="text-xs text-blue-400 font-bold mb-2 block tracking-wider">CURSO</span>
          <p className="text-lg font-bold text-white group-hover:text-yellow-500 transition-colors">Damodaran - Valuation</p>
          <p className="text-sm text-gray-400 mt-2">Nível: Intermediário • Research</p>
        </div>
        <div className="bg-gray-900 border border-gray-700 p-5 rounded hover:border-yellow-500/50 transition cursor-pointer group">
          <span className="text-xs text-green-400 font-bold mb-2 block tracking-wider">CERTIFICAÇÃO</span>
          <p className="text-lg font-bold text-white group-hover:text-yellow-500 transition-colors">Material CPA-20 (ANBIMA)</p>
          <p className="text-sm text-gray-400 mt-2">Nível: Intermediário • Geral</p>
        </div>
      </div>
    </div>
  );

  // HERE IS THE MISSING ADMIN PANEL!
  const renderAdminPanel = () => (
    <div className="animate-fade-in bg-gray-800 rounded-lg p-8 border border-gray-700 shadow-lg">
      <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
        <h2 className="text-2xl font-bold text-yellow-500">👑 Painel da Presidência / GP</h2>
        <span className="bg-blue-900 text-blue-200 px-3 py-1 rounded text-sm font-bold border border-blue-700">
          Acesso Nível Admin
        </span>
      </div>
      
      <p className="text-gray-300 mb-6">Abaixo está a lista de todos os membros cadastrados na LAMF5. Clique em um membro para editar suas metas ou alterar seu cargo.</p>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="text-xs text-gray-500 uppercase bg-gray-900 border-b border-gray-700">
            <tr>
              <th className="px-6 py-4 font-bold">Nome do Membro</th>
              <th className="px-6 py-4 font-bold">Diretoria</th>
              <th className="px-6 py-4 font-bold">Cargo/Nível</th>
              <th className="px-6 py-4 font-bold text-right">Ação</th>
            </tr>
          </thead>
          <tbody>
            {allStudents.map((student) => (
              <tr key={student.id} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-750 transition">
                <td className="px-6 py-4 font-medium text-white">{student.nome_completo}</td>
                <td className="px-6 py-4">{student.diretoria}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    student.perfil === 'Presidência' ? 'bg-yellow-900/50 text-yellow-500 border border-yellow-700' :
                    student.perfil === 'Gestão de Pessoas' ? 'bg-purple-900/50 text-purple-400 border border-purple-700' :
                    'bg-gray-700 text-gray-300'
                  }`}>
                    {student.perfil}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-yellow-500 hover:text-white font-bold transition">Ver PDI →</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // --- MAIN LAYOUT RENDER --- //

  return (
    <div className="flex h-screen bg-gray-900 overflow-hidden font-sans">
      
      {/* SIDEBAR (LEFT BAR) */}
      <aside className="w-64 bg-black border-r border-gray-800 flex flex-col hidden md:flex">
        <div className="h-20 flex items-center justify-center border-b border-gray-800">
          <h1 className="text-2xl font-extrabold tracking-widest text-white">
            LAMF<span className="text-yellow-500">5</span>
          </h1>
        </div>
        
        <div className="p-6">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Menu do Sistema</p>
          <nav className="space-y-2">
            {[
              { id: "visao-geral", label: "Visão Geral", icon: "📊" },
              { id: "diagnostico", label: "Diagnóstico Inicial", icon: "📋" },
              { id: "metas", label: "Plano de Ação", icon: "🎯" },
              { id: "recursos", label: "Banco de Recursos", icon: "📚" },
              // Smart Admin Button
              ...(userProfile?.perfil === "Gestão de Pessoas" || userProfile?.perfil === "Presidência" 
                ? [{ id: "admin", label: "Painel Admin", icon: "👑" }] 
                : [])
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center text-left px-4 py-3 rounded transition-all duration-200 ${
                  activeTab === item.id 
                    ? "bg-gray-800 text-yellow-500 border-l-4 border-yellow-500 shadow-md" 
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
        
        <div className="mt-auto p-6 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2 bg-gray-900 border border-gray-700 text-gray-400 rounded hover:bg-red-900/20 hover:text-red-400 hover:border-red-900/50 transition-colors text-sm font-bold"
          >
            Encerrar Sessão
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* TOP HEADER */}
        <header className="h-20 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-8">
          <div>
            <h2 className="text-xl font-bold text-white">
              Olá, <span className="text-yellow-500">{nomeCompleto}</span>
            </h2>
            <p className="text-sm text-gray-400 font-medium tracking-wide">
              {userProfile?.perfil || "Membro"} • {diretoria}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-gray-800 border border-yellow-500 flex items-center justify-center text-yellow-500 font-bold shadow-[0_0_10px_rgba(234,179,8,0.2)]">
              {nomeCompleto.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* DYNAMIC CONTENT SCROLL AREA */}
        <div className="flex-1 overflow-y-auto p-8 bg-gray-900/50">
          <div className="max-w-5xl mx-auto">
            {activeTab === "visao-geral" && renderVisaoGeral()}
            {activeTab === "diagnostico" && renderDiagnostico()}
            {activeTab === "metas" && renderMetas()}
            {activeTab === "recursos" && renderRecursos()}
            {activeTab === "admin" && renderAdminPanel()}
          </div>
        </div>
        
      </main>
    </div>
  );
}