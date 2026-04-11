"use client";

import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  // This function safely logs the user out and sends them back to the login screen
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-md p-8 mt-10">
        
        <div className="flex justify-between items-center mb-8 border-b pb-4">
          <h1 className="text-3xl font-bold text-blue-900">
            Painel do Membro
          </h1>
          <button
            onClick={handleLogout}
            className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded font-medium hover:bg-red-100 transition"
          >
            Sair do Sistema
          </button>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-6">
          <p className="text-blue-800">
            <strong>Bem-vindo ao PDI!</strong> O sistema de Gestão de Pessoas da Liga Acadêmica de Mercado Financeiro está em construção. 
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border rounded-lg p-6 bg-gray-50">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Metas e Objetivos</h2>
            <p className="text-gray-600 text-sm">Em breve: Acompanhamento de metas individuais e da Batalha de Carteiras.</p>
          </div>
          
          <div className="border rounded-lg p-6 bg-gray-50">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Avaliações</h2>
            <p className="text-gray-600 text-sm">Em breve: Feedbacks e avaliações de desempenho do semestre.</p>
          </div>
        </div>

      </div>
    </div>
  );
}