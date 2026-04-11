export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="p-8 bg-white rounded-lg shadow-md text-center">
        <h1 className="text-3xl font-bold text-blue-900 mb-4">
          LAMF5 PDI
        </h1>
        <p className="text-gray-600 mb-6">
          Plano de Desenvolvimento Individual - Gestão de Pessoas
        </p>
        <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">
          Entrar no Sistema
        </button>
      </div>
    </main>
  );
}