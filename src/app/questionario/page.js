"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

// ============================================================================
// DADOS FIXOS E LISTAS
// ============================================================================

const AREAS_MERCADO = [
  "Asset Management (buy-side)", "Equity Research (sell-side)", "Investment Banking - M&A, ECM, DCM",
  "Sales & Trading / Mesa de Operações", "Private Equity", "Venture Capital", 
  "FP&A / Finanças Corporativas", "Tesouraria", "Research Macroeconômico", 
  "Consultoria (McKinsey, Bain, BCG, etc.)", "Fintech", "Crypto / Web3 / Ativos digitais", 
  "Carreira acadêmica / Pesquisa", "Empreendedorismo", "Ainda não sei / Quero descobrir", "Outros"
];

const VOCABULARIO_INICIANTE = [
  "IPCA", "CDI", "Selic", "Ibovespa", "IBrX", "Dólar (USD/BRL)", "Ação ordinária vs preferencial",
  "Dividendos", "Dividend yield", "P/L", "IPO", "Follow-on", "ETF", "FII (Fundo Imobiliário)",
  "Hedge", "Volatilidade", "Liquidez", "Marcação a mercado", "Come-cotas", "Home broker",
  "Book de ofertas", "Corretagem", "Ativo e passivo", "DRE", "Balanço Patrimonial", "Fluxo de Caixa",
  "Buy-side vs Sell-side", "Equity Research", "Asset Management", "Investment Banking"
];

const NIVEIS_TRIAGEM = [
  { id: "iniciante", title: "Iniciante", desc: "Entrei na Liga para aprender. Sei pouco ou nada sobre mercado financeiro, não invisto e não acompanho o mercado de forma regular." },
  { id: "basico", title: "Básico", desc: "Entendo conceitos gerais (ações, renda fixa, inflação). Talvez invista em coisas simples como Tesouro Direto. Acompanho notícias de vez em quando." },
  { id: "intermediario", title: "Intermediário", desc: "Estudo com regularidade. Entendo análise fundamentalista/técnica. Invisto de forma estruturada. Conheço produtos e leio relatórios de research." },
  { id: "avancado", title: "Avançado", desc: "Tenho domínio técnico sólido. Talvez já tenha certificações. Faço valuation/modelagem financeira. Já tive experiência profissional na área ou busco posições seniores." }
];

// NOVO: Dicionário para traduzir a experiência profissional no PDF
const EXP_MAP = {
  "nenhuma": "Não, nunca trabalhei",
  "fora": "Já tive estágio/trabalho fora da área de finanças",
  "estagio_fin": "Já tive estágio em finanças / mercado",
  "clt_fin": "Já tive (ou tenho) vínculo CLT em finanças"
};

const COMPORTAMENTAL_ANCHORS = [
  { id: "c_oral", title: "4.1 Comunicação oral", anchors: ["1 - Evito falar em público; travo em apresentações", "2 - Consigo apresentar se estiver preparado, mas fico ansioso", "3 - Me viro bem, mas me sinto inseguro em debates", "4 - Apresento e defendo ideias com tranquilidade na maioria das situações", "5 - Tenho facilidade de apresentar e argumentar mesmo sem preparo"] },
  { id: "c_escrita", title: "4.2 Comunicação escrita", anchors: ["1 - Tenho dificuldade para estruturar textos; minhas mensagens geram dúvida", "2 - Escrevo de forma funcional, mas preciso de várias revisões", "3 - Consigo escrever textos claros e bem estruturados para o cotidiano", "4 - Produzo documentos e relatórios profissionais sem grande esforço", "5 - Escrevo com fluência, tom adequado e persuasão em qualquer contexto"] },
  { id: "c_equipe", title: "4.3 Trabalho em equipe", anchors: ["1 - Prefiro trabalhar sozinho; times me atrapalham", "2 - Colaboro quando preciso, mas não tomo iniciativa no grupo", "3 - Sou bom colaborador: entrego minha parte e respeito o ritmo do grupo", "4 - Facilito a colaboração: ajudo colegas, destravo conflitos", "5 - Elevo a equipe: pessoas entregam mais e melhor trabalhando comigo"] },
  { id: "c_lider", title: "4.4 Liderança", anchors: ["1 - Nunca liderei nada; evito posições de liderança", "2 - Já liderei por indicação, mas não me sinto à vontade", "3 - Consigo liderar tarefas pontuais ou pequenos grupos quando necessário", "4 - Lidero projetos com autonomia; pessoas me seguem por competência", "5 - Inspiro e desenvolvo pessoas; lidero mesmo sem autoridade formal"] },
  { id: "c_proat", title: "4.5 Proatividade", anchors: ["1 - Espero ser dirigido; raramente tomo iniciativa", "2 - Faço o que é pedido, dentro do prazo, mas sem ir além", "3 - Identifico o que precisa ser feito e entrego antes de ser cobrado", "4 - Antecipo problemas e proponho soluções antes que virem cobrança", "5 - Crio oportunidades; não espero abertura, gero a abertura"] },
  { id: "c_org", title: "4.6 Organização e gestão de tempo", anchors: ["1 - Vivo atrasado; esqueço compromissos; não uso nenhum sistema", "2 - Uso alguma agenda, mas perco prazos com frequência", "3 - Tenho rotina e cumpro a maioria dos prazos, com alguma correria", "4 - Planejo bem a semana, cumpro prazos e equilibrio prioridades", "5 - Sou referência em organização; sobra tempo até para imprevistos"] },
  { id: "c_resil", title: "4.7 Resiliência e lidar com feedback", anchors: ["1 - Feedback negativo me desmonta; evito avaliação", "2 - Recebo feedback, mas fico ruminando por dias", "3 - Aceito críticas, entendo o ponto e tento melhorar, mesmo que doa", "4 - Busco feedback ativamente e uso como combustível para evoluir", "5 - Feedback duro não me abala; converto em plano de ação imediato"] },
  { id: "c_analise", title: "4.8 Pensamento analítico", anchors: ["1 - Tenho dificuldade para separar o problema em partes", "2 - Analiso o óbvio, mas me perco em problemas mais complexos", "3 - Consigo estruturar problemas de média complexidade e concluir", "4 - Decomponho problemas complexos, considero hipóteses e trade-offs", "5 - Raciocínio analítico é minha maior força; resolvo o que os outros travam"] },
  { id: "c_net", title: "4.9 Networking e relacionamento", anchors: ["1 - Evito criar conexões profissionais; me sinto desconfortável", "2 - Tenho contatos, mas não mantenho relações de forma ativa", "3 - Construo boas relações no ambiente imediato (Liga, faculdade)", "4 - Tenho rede ativa, participo de eventos, mantenho contato genuíno", "5 - Networking é uma habilidade forte; conecto pessoas e abro portas"] },
];

// ============================================================================
// COMPONENTES AUXILIARES PARA UI
// ============================================================================

const Req = () => <span style={{color: "var(--danger)", marginLeft: "4px"}}>*</span>;

function Scale1to5({ label, value, onChange, required = true }) {
  return (
    <div className="form-group mb-16 no-print">
      <label className="form-label text-gold" style={{ fontSize: '13px' }}>{label} {required && <Req />}</label>
      <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => onChange(n)} className={`topbar-btn ${value === n ? 'primary' : ''}`} style={{ flex: 1, padding: "10px 0", textAlign: "center", borderRadius: "8px" }}>
            {n}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)", fontSize: "11px", marginTop: "4px" }}>
        <span>1: Não sei do que se trata</span><span>5: Domino e poderia ensinar</span>
      </div>
    </div>
  );
}

function Scale0to10({ label, value, onChange, required = true }) {
  return (
    <div className="form-group mt-20 mx-auto no-print" style={{ maxWidth: "700px", textAlign: "left" }}>
      <label className="form-label">{label} {required && <Req />}</label>
      <p style={{fontSize:"13px", color:"var(--text-muted)", marginBottom:"12px"}}>Selecione seu nível de engajamento atual com o seu próprio desenvolvimento.</p>
      <div style={{ display: "flex", gap: "6px", marginTop: "4px", flexWrap: "wrap" }}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
          <button 
            key={n} type="button" onClick={() => onChange(n)} 
            className={`topbar-btn ${value === n ? 'primary' : ''}`} 
            style={{ flex: 1, minWidth: "35px", padding: "12px 0", textAlign: "center", borderRadius: "8px", fontWeight: "bold" }}
          >
            {n}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)", fontSize: "11px", marginTop: "6px", fontWeight: "500" }}>
        <span>0: Zero Comprometido</span>
        <span>10: 100% Comprometido</span>
      </div>
    </div>
  );
}

function BehavioralAnchorScale({ title, anchors, value, onChange }) {
  return (
    <div className="form-section no-print" style={{ padding: "20px", marginBottom: "16px", background: "rgba(201,168,76,0.03)" }}>
      <h3 style={{ fontSize: "16px", color: "var(--gold-light)", marginBottom: "12px" }}>{title} <Req /></h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {anchors.map((anchorText, index) => {
          const val = index + 1;
          const isSelected = value === val;
          return (
            <div 
              key={val} onClick={() => onChange(val)}
              style={{ 
                display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", 
                background: isSelected ? "var(--surface2)" : "transparent",
                border: `1px solid ${isSelected ? "var(--gold)" : "var(--border)"}`,
                borderRadius: "8px", cursor: "pointer", transition: "all 0.2s"
              }}
            >
              <div style={{ 
                width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                background: isSelected ? "var(--gold)" : "var(--surface3)", color: isSelected ? "var(--black)" : "var(--text-muted)",
                fontWeight: "bold", fontSize: "14px", flexShrink: 0
              }}>{val}</div>
              <div style={{ fontSize: "14px", color: isSelected ? "var(--text-primary)" : "var(--text-secondary)" }}>
                {anchorText.substring(4)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function QuestionarioPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [step, setStep] = useState(0); 
  const [isSaving, setIsSaving] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);
  const [alreadyAnswered, setAlreadyAnswered] = useState(false);
  
  // ============================================================================
  // ESTADO GERAL DO FORMULÁRIO
  // ============================================================================
  const [f, setForm] = useState({
    nome: "", curso: "", periodo: "", cra: "", entrada_liga: "", cargo_liga: "", exp_profissional: "", horas_disp: "",
    nivel: "",
    tec_in_math: 0, tec_in_eco: 0, tec_in_bolsa: 0, tec_in_rf_rv: 0, tec_in_tipos: 0, tec_in_news: 0, tec_in_excel: 0, tec_in_org: 0,
    tec_in_vocab: [], tec_in_investiu: "", tec_in_acompanha: "", tec_in_fortes: "", tec_in_melhorar: "",
    tec_mid_fund: 0, tec_mid_tec: 0, tec_mid_val: 0, tec_mid_cont: 0, tec_mid_macro: 0, tec_mid_rf: 0, tec_mid_rv: 0, tec_mid_fundos: 0, tec_mid_fii: 0, tec_mid_sell: 0,
    tec_mid_excel: 0, tec_mid_plat: 0, tec_mid_broker: 0, tec_mid_cart: 0, tec_mid_red: 0,
    tec_mid_tempo: "", tec_mid_classes: [], tec_mid_relatorio: "", tec_mid_freq: "", tec_mid_fortes: "", tec_mid_melhorar: "",
    tec_adv_mod: 0, tec_adv_dcf: 0, tec_adv_mult: 0, tec_adv_sotp: 0, tec_adv_lbo: 0, tec_adv_sens: 0,
    tec_adv_rf: 0, tec_adv_cred: 0, tec_adv_deriv: 0, tec_adv_struc: 0, tec_adv_ma: 0, tec_adv_pe: 0, tec_adv_intl: 0,
    tec_adv_excel: 0, tec_adv_py: 0, tec_adv_sql: 0, tec_adv_term: 0, tec_adv_econ: 0, tec_adv_bi: 0,
    tec_adv_sell: 0, tec_adv_pitch: 0, tec_adv_net: 0, tec_adv_prep: 0,
    tec_adv_cert_tem: [], tec_adv_cert_quer: [], tec_adv_exp: "", tec_adv_exemplos: "", tec_adv_descarte: "", tec_adv_fortes: "", tec_adv_melhorar: "",
    c_oral: 0, c_escrita: 0, c_equipe: 0, c_lider: 0, c_proat: 0, c_org: 0, c_resil: 0, c_analise: 0, c_net: 0, c_star: "",
    d_areas: [], d_empresa: "", d_1ano: "", d_3anos: "", d_5anos: "", d_admira: "",
    m_acad_1: "", m_acad_2: "", m_acad_3: "", m_cert_1: "", m_cert_2: "", m_cert_3: "", m_prof_1: "", m_prof_2: "", m_prof_3: "", m_pes_1: "", m_pes_2: "",
    r_motivo: "", r_sucesso: "", r_frustra: "", r_iniciativa: "", r_impede: "", r_aprende: "", r_mudar: "",
    log_disp: "", log_formato: "", log_mentor: "", log_info: "", log_engajamento: null
  });

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));
  const toggleArr = (key, id) => set(key, f[key].includes(id) ? f[key].filter((a) => a !== id) : [...f[key], id]);

  useEffect(() => {
    async function loadUser() {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) { router.push("/"); return; }
      setUser(user);

      const { data: existing } = await supabase.from('questionario_completo').select('id, respostas').eq('member_id', user.id).single();
      
      if (existing) {
        setAlreadyAnswered(true);
        if (existing.respostas) {
          setForm(existing.respostas); 
        }
      } else {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (profile) set("nome", profile.nome_completo);
      }

      setLoading(false);
    }
    loadUser();
  }, [router]);

  const saveQuestionnaire = async () => {
    setIsSaving(true);
    const payload = { member_id: user.id, respostas: f };
    const { error } = await supabase.from('questionario_completo').upsert(payload, { onConflict: 'member_id' });
    
    setIsSaving(false);
    if (!error) {
      setHasFinished(true);
      setAlreadyAnswered(true);
    } else {
      console.error(error);
      alert("Erro ao salvar.");
    }
  };

  const handlePrint = () => {
    const printElement = document.getElementById("print-report");
    if (!printElement) return;

    const janelaPrint = window.open('', '', 'width=900,height=650');
    
    janelaPrint.document.write(`
      <html>
        <head>
          <title>Relatório PDI - ${f.nome}</title>
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
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          ${printElement.innerHTML}
        </body>
      </html>
    `);

    janelaPrint.document.close();
    janelaPrint.focus();
    
    setTimeout(() => {
      janelaPrint.print();
      janelaPrint.close();
    }, 300);
  };

  const handleNextStep = () => {
    let isValid = true;
    
    if (step === 1) { 
      if (!f.nome || !f.curso || !f.periodo || !f.entrada_liga || !f.exp_profissional || !f.horas_disp) isValid = false;
    } 
    else if (step === 2) { 
      if (!f.nivel) isValid = false;
    } 
    else if (step === 3) { 
      if (f.nivel === "iniciante" || f.nivel === "basico") {
        if (f.tec_in_math === 0 || f.tec_in_eco === 0 || f.tec_in_bolsa === 0 || f.tec_in_tipos === 0 || f.tec_in_excel === 0 || !f.tec_in_fortes || !f.tec_in_melhorar) isValid = false;
      } else if (f.nivel === "intermediario") {
        if (f.tec_mid_fund === 0 || f.tec_mid_val === 0 || f.tec_mid_cont === 0 || f.tec_mid_macro === 0 || f.tec_mid_excel === 0 || f.tec_mid_red === 0 || !f.tec_mid_fortes || !f.tec_mid_melhorar) isValid = false;
      } else if (f.nivel === "avancado") {
        if (f.tec_adv_mod === 0 || f.tec_adv_dcf === 0 || f.tec_adv_lbo === 0 || f.tec_adv_ma === 0 || f.tec_adv_excel === 0 || f.tec_adv_py === 0 || !f.tec_adv_descarte || !f.tec_adv_fortes || !f.tec_adv_melhorar) isValid = false;
      }
    } 
    else if (step === 4) { 
      if (f.c_oral === 0 || f.c_escrita === 0 || f.c_equipe === 0 || f.c_lider === 0 || f.c_proat === 0 || f.c_org === 0 || f.c_resil === 0 || f.c_analise === 0 || f.c_net === 0 || !f.c_star) isValid = false;
    } 
    else if (step === 5) { 
      if (f.d_areas.length === 0 || !f.d_empresa || !f.d_1ano || !f.d_3anos || !f.d_5anos) isValid = false;
    } 
    else if (step === 6) { 
      if (!f.m_acad_1 || !f.m_cert_1 || !f.m_prof_1) isValid = false;
    } 
    else if (step === 7) { 
      if (!f.r_motivo || !f.r_sucesso || !f.r_frustra || !f.r_iniciativa || !f.r_impede || !f.r_aprende) isValid = false;
    } 
    else if (step === 8) { 
      if (!f.log_disp || !f.log_formato || f.log_engajamento === null) isValid = false;
    }

    if (!isValid) {
      alert("Por favor, preencha todos os campos obrigatórios (marcados com *) antes de avançar.");
      return;
    }

    if (step < 8) setStep(s => s + 1);
    else saveQuestionnaire();
  };

  if (loading) return <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--black)' }}><p style={{ color: 'var(--gold)', fontWeight: 'bold' }}>CARREGANDO...</p></div>;

  // ============================================================================
  // TELA DE BLOQUEIO E RELATÓRIO PDF GIGANTE
  // ============================================================================
  if (alreadyAnswered || hasFinished) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--black)' }}>
        
        <div className="card animate-fade-in" style={{ textAlign: "center", padding: "60px 40px", maxWidth: "700px", border: 'none' }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>🏆</div>
          <h2 className="form-section-title text-gold mb-16">{hasFinished ? "Questionário Finalizado!" : "Você já respondeu este questionário."}</h2>
          <p className="form-section-desc mb-32">
            {hasFinished ? `Muito obrigado, ${f.nome}! Suas respostas foram salvas e serão fundamentais para a próxima etapa do seu desenvolvimento na LAMF5.` : "O seu Plano de Desenvolvimento Individual já foi registrado no banco de dados da liga para este ciclo. Caso precise refazer, contate a Gestão de Pessoas."}
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button onClick={() => router.push("/dashboard")} className="topbar-btn primary">Voltar para o Dashboard Central</button>
            <button onClick={handlePrint} className="topbar-btn">Exportar Relatório PDF</button>
          </div>
        </div>
          
        {/* ESTRUTURA INVISÍVEL NA TELA QUE ALIMENTA A NOVA JANELA DE IMPRESSÃO */}
        <div id="print-report" style={{ display: 'none' }}>
          <div className="header-border">
            <h1>Plano de Desenvolvimento Individual</h1>
            <h2>Liga Acadêmica de Mercado Financeiro (LAMF5)</h2>
          </div>

          <div className="print-section">
            <h3 className="print-title">Bloco 1: Contexto Pessoal</h3>
            <p className="print-item"><strong>Nome Completo:</strong> {f.nome}</p>
            <p className="print-item"><strong>Curso/Período:</strong> {f.curso} - {f.periodo}º Período</p>
            <p className="print-item"><strong>CRA:</strong> {f.cra || "Não informado"}</p>
            <p className="print-item"><strong>Entrada na Liga:</strong> {f.entrada_liga}</p>
            {/* CORRIGIDO: Experiência Profissional agora mostra a frase completa */}
            <p className="print-item"><strong>Experiência Profissional:</strong> {EXP_MAP[f.exp_profissional] || f.exp_profissional}</p>
            <p className="print-item"><strong>Horas Disponíveis:</strong> {f.horas_disp}</p>
          </div>

          {/* CORRIGIDO: Bloco 2 & 3 agora mostram as notas técnicas completas */}
          <div className="print-section">
            <h3 className="print-title">Bloco 2 & 3: Autoavaliação Técnica</h3>
            <p className="print-item"><strong>Trilha Nivelada:</strong> {f.nivel?.toUpperCase()}</p>
            
            {f.nivel === "iniciante" || f.nivel === "basico" ? (
              <>
                <p className="print-item"><strong>Matemática financeira básica:</strong> {f.tec_in_math}/5</p>
                <p className="print-item"><strong>Economia (inflação, Selic, PIB):</strong> {f.tec_in_eco}/5</p>
                <p className="print-item"><strong>Bolsa de valores:</strong> {f.tec_in_bolsa}/5</p>
                <p className="print-item"><strong>Tipos de investimento:</strong> {f.tec_in_tipos}/5</p>
                <p className="print-item"><strong>Excel básico:</strong> {f.tec_in_excel}/5</p>
                <p className="print-item"><strong>Vocabulário:</strong> {(f.tec_in_vocab || []).join(', ') || "Nenhum"}</p>
                <p className="print-item" style={{ marginTop: '12px' }}><strong>Três pontos fortes:</strong><br/>{f.tec_in_fortes}</p>
                <p className="print-item"><strong>Três pontos a melhorar:</strong><br/>{f.tec_in_melhorar}</p>
              </>
            ) : f.nivel === "intermediario" ? (
              <>
                <p className="print-item"><strong>Análise fundamentalista:</strong> {f.tec_mid_fund}/5</p>
                <p className="print-item"><strong>Valuation básico:</strong> {f.tec_mid_val}/5</p>
                <p className="print-item"><strong>Contabilidade aplicada:</strong> {f.tec_mid_cont}/5</p>
                <p className="print-item"><strong>Macroeconomia aplicada:</strong> {f.tec_mid_macro}/5</p>
                <p className="print-item"><strong>Excel intermediário:</strong> {f.tec_mid_excel}/5</p>
                <p className="print-item"><strong>Redação técnica:</strong> {f.tec_mid_red}/5</p>
                <p className="print-item"><strong>Relatório/tese escrito:</strong> {f.tec_mid_relatorio || "Não informado"}</p>
                <p className="print-item" style={{ marginTop: '12px' }}><strong>Três pontos fortes:</strong><br/>{f.tec_mid_fortes}</p>
                <p className="print-item"><strong>Três pontos a melhorar:</strong><br/>{f.tec_mid_melhorar}</p>
              </>
            ) : (
              <>
                <p className="print-item"><strong>3-Statement Model:</strong> {f.tec_adv_mod}/5</p>
                <p className="print-item"><strong>DCF Avançado:</strong> {f.tec_adv_dcf}/5</p>
                <p className="print-item"><strong>LBO e PE Return:</strong> {f.tec_adv_lbo}/5</p>
                <p className="print-item"><strong>M&A (Due Diligence):</strong> {f.tec_adv_ma}/5</p>
                <p className="print-item"><strong>Excel Avançado (VBA):</strong> {f.tec_adv_excel}/5</p>
                <p className="print-item"><strong>Python/Dados:</strong> {f.tec_adv_py}/5</p>
                <p className="print-item"><strong>Áreas descartadas:</strong> {f.tec_adv_descarte || "Não preenchido"}</p>
                <p className="print-item" style={{ marginTop: '12px' }}><strong>Três pontos fortes:</strong><br/>{f.tec_adv_fortes}</p>
                <p className="print-item"><strong>Três pontos a melhorar:</strong><br/>{f.tec_adv_melhorar}</p>
              </>
            )}
          </div>

          <div className="print-section">
            <h3 className="print-title">Bloco 4: Avaliação Comportamental</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <p className="print-item"><strong>Comunicação Oral:</strong> {f.c_oral}/5</p>
              <p className="print-item"><strong>Comunicação Escrita:</strong> {f.c_escrita}/5</p>
              <p className="print-item"><strong>Trabalho em Equipe:</strong> {f.c_equipe}/5</p>
              <p className="print-item"><strong>Liderança:</strong> {f.c_lider}/5</p>
              <p className="print-item"><strong>Proatividade:</strong> {f.c_proat}/5</p>
              <p className="print-item"><strong>Organização e Tempo:</strong> {f.c_org}/5</p>
              <p className="print-item"><strong>Resiliência:</strong> {f.c_resil}/5</p>
              <p className="print-item"><strong>Pensamento Analítico:</strong> {f.c_analise}/5</p>
              <p className="print-item"><strong>Networking:</strong> {f.c_net}/5</p>
            </div>
            <p className="print-item" style={{ marginTop: '12px' }}><strong>Método STAR (Situação Difícil):</strong><br/>{f.c_star}</p>
          </div>

          <div className="print-section">
            <h3 className="print-title">Bloco 5: Direção de Carreira</h3>
            <p className="print-item"><strong>Áreas de Interesse:</strong> {(f.d_areas || []).join(', ')}</p>
            <p className="print-item"><strong>Empresa dos Sonhos:</strong> {f.d_empresa}</p>
            <p className="print-item"><strong>Visão 1 Ano:</strong> {f.d_1ano}</p>
            <p className="print-item"><strong>Visão 3 Anos:</strong> {f.d_3anos}</p>
            <p className="print-item"><strong>Visão 5 Anos:</strong> {f.d_5anos}</p>
            <p className="print-item"><strong>Profissional Admira:</strong> {f.d_admira || "Nenhum"}</p>
          </div>

          <div className="print-section">
            <h3 className="print-title">Bloco 6: Metas Concretas (Próximos 6 meses)</h3>
            <p className="print-item"><strong>Acadêmicas:</strong><br/>1. {f.m_acad_1}<br/>2. {f.m_acad_2 || "-"}<br/>3. {f.m_acad_3 || "-"}</p>
            <p className="print-item"><strong>Certificações/Cursos:</strong><br/>1. {f.m_cert_1}<br/>2. {f.m_cert_2 || "-"}<br/>3. {f.m_cert_3 || "-"}</p>
            <p className="print-item"><strong>Profissionais:</strong><br/>1. {f.m_prof_1}<br/>2. {f.m_prof_2 || "-"}<br/>3. {f.m_prof_3 || "-"}</p>
            {f.m_pes_1 && <p className="print-item"><strong>Pessoais:</strong> 1. {f.m_pes_1 || "-"}</p>}
          </div>

          <div className="print-section">
            <h3 className="print-title">Bloco 7: Reflexões</h3>
            <p className="print-item" style={{marginBottom:'12px'}}><strong>Por que entrou na LAMF5 e o que espera?</strong><br/>{f.r_motivo}</p>
            <p className="print-item" style={{marginBottom:'12px'}}><strong>Se em 1 ano fosse sucesso, o que teria mudado?</strong><br/>{f.r_sucesso}</p>
            <p className="print-item" style={{marginBottom:'12px'}}><strong>O que mais te frustra hoje?</strong><br/>{f.r_frustra}</p>
            <p className="print-item" style={{marginBottom:'12px'}}><strong>Estudo por iniciativa própria:</strong><br/>{f.r_iniciativa}</p>
            <p className="print-item" style={{marginBottom:'12px'}}><strong>O que impede de estudar mais?</strong><br/>{f.r_impede}</p>
            <p className="print-item" style={{marginBottom:'12px'}}><strong>Como aprende melhor?</strong><br/>{f.r_aprende}</p>
            {f.r_mudar && <p className="print-item"><strong>O que mudaria imediatamente:</strong><br/>{f.r_mudar}</p>}
          </div>

          <div className="print-section" style={{ borderBottom: 'none' }}>
            <h3 className="print-title">Bloco 8: Logística 1:1</h3>
            <p className="print-item"><strong>Disponibilidade (Dias/Horas):</strong> {f.log_disp}</p>
            <p className="print-item"><strong>Formato:</strong> {f.log_formato}</p>
            <p className="print-item"><strong>Mentor Preferido:</strong> {f.log_mentor || "Sem preferência"}</p>
            <p className="print-item"><strong>Engajamento Declarado:</strong> {f.log_engajamento}/10</p>
            <p className="print-item"><strong>Informação Confidencial:</strong> {f.log_info || "Nenhuma"}</p>
          </div>
          
          <div className="footer">Documento Oficial Gerado pelo Sistema de Gestão de Pessoas da LAMF5.</div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDERIZAÇÃO DOS 9 BLOCOS DO FORMULÁRIO (0 a 8) NA TELA
  // ============================================================================

  const renderBloco0 = () => (
    <div className="animate-fade-in no-print" style={{ textAlign: "center", padding: "40px 20px" }}>
      <h2 className="form-section-title mb-16 text-gold" style={{ fontSize: "32px" }}>Olá! Seja muito bem-vindo(a) ao seu PDI.</h2>
      <p className="text-secondary" style={{ fontSize: "16px", lineHeight: "1.8", maxWidth: "700px", margin: "0 auto 20px" }}>
        Este é o primeiro passo para construirmos juntos o seu Plano de Desenvolvimento Individual na LAMF5. Ele vai guiar conversas de mentoria, definir metas e medir sua evolução ao longo do ano.
      </p>
      <p className="text-secondary" style={{ fontSize: "16px", lineHeight: "1.8", maxWidth: "700px", margin: "0 auto 20px" }}>
        O questionário leva em torno de 20 a 25 minutos. Uma coisa muito importante: <strong className="text-primary" style={{ color: "var(--white)" }}>não existe resposta certa ou errada</strong>, e ninguém será julgado por não saber algo.
      </p>
      <div className="highlight-box mx-auto" style={{ maxWidth: "700px", textAlign: "left", marginBottom: "32px" }}>
        <p>A honestidade aqui é o que vai determinar a qualidade do seu plano. Quanto mais real for o seu retrato hoje, mais preciso será o caminho que vamos traçar. Responda com calma. Vamos juntos.</p>
      </div>
    </div>
  );

  const renderBloco1 = () => (
    <div className="animate-fade-in no-print">
      <h2 className="form-section-title mb-6">Bloco 1: Contexto Pessoal</h2>
      <p className="form-section-desc">Informações básicas para conhecermos você melhor.</p>
      
      <div className="grid-2 gap-20 mb-20">
        <div className="form-group"><label className="form-label">Nome Completo <Req/></label><input className="form-input" value={f.nome} onChange={e=>set("nome", e.target.value)} /></div>
        <div className="form-group"><label className="form-label">Curso <Req/></label><input className="form-input" placeholder="Ex: Economia, Administração..." value={f.curso} onChange={e=>set("curso", e.target.value)} /></div>
      </div>
      <div className="grid-3 gap-20 mb-20">
        <div className="form-group"><label className="form-label">Período Atual <Req/></label><select className="form-select" value={f.periodo} onChange={e=>set("periodo", e.target.value)}><option value="">Selecione</option>{[1,2,3,4,5,6,7,8,9,10].map(n=><option key={n} value={n}>{n}º Período</option>)}</select></div>
        <div className="form-group"><label className="form-label">CRA Atual (Opcional)</label><input type="number" className="form-input" placeholder="Ex: 85" value={f.cra} onChange={e=>set("cra", e.target.value)} /></div>
        <div className="form-group"><label className="form-label">Entrada na Liga <Req/></label><input type="month" className="form-input" value={f.entrada_liga} onChange={e=>set("entrada_liga", e.target.value)} /></div>
      </div>
      <div className="form-group mb-20">
        <label className="form-label">Experiência Profissional <Req/></label>
        <select className="form-select" value={f.exp_profissional} onChange={e=>set("exp_profissional", e.target.value)}>
          <option value="">Selecione a situação que melhor se aplica</option>
          <option value="nenhuma">Não, nunca trabalhei</option>
          <option value="fora">Já tive estágio/trabalho fora da área de finanças</option>
          <option value="estagio_fin">Já tive estágio em finanças / mercado</option>
          <option value="clt_fin">Já tive (ou tenho) vínculo CLT em finanças</option>
        </select>
      </div>
      <div className="form-group highlight-box">
        <label className="form-label text-gold">Horas Semanais REALISTAS para o PDI <Req/></label>
        <p style={{fontSize:"13px", color:"var(--text-muted)", marginBottom:"12px"}}>Conte o tempo que realmente sobra fora faculdade/liga, não o tempo ideal.</p>
        <select className="form-select" value={f.horas_disp} onChange={e=>set("horas_disp", e.target.value)}>
          <option value="">Selecione com honestidade</option>
          <option value="<2">Menos de 2 horas</option>
          <option value="2-5">2 a 5 horas</option>
          <option value="5-10">5 a 10 horas</option>
          <option value="10-15">10 a 15 horas</option>
          <option value="15+">Mais de 15 horas</option>
        </select>
      </div>
    </div>
  );

  const renderBloco2 = () => (
    <div className="animate-fade-in no-print">
      <h2 className="form-section-title mb-6">Bloco 2: Nível de Conhecimento <Req/></h2>
      <p className="form-section-desc">Esta resposta define as perguntas técnicas da próxima página. Leia as descrições atentamente.</p>
      
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {NIVEIS_TRIAGEM.map((nivel) => (
          <div 
            key={nivel.id} onClick={() => set("nivel", nivel.id)}
            style={{
              padding: "24px", borderRadius: "12px", cursor: "pointer", transition: "all 0.2s",
              border: `2px solid ${f.nivel === nivel.id ? "var(--gold)" : "var(--border)"}`,
              background: f.nivel === nivel.id ? "rgba(201,168,76,0.05)" : "var(--surface2)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
              <div style={{ width:"20px", height:"20px", borderRadius:"50%", border:`2px solid ${f.nivel === nivel.id ? "var(--gold)" : "var(--text-muted)"}`, background: f.nivel === nivel.id ? "var(--gold)" : "transparent" }} />
              <h3 style={{ fontSize: "18px", color: f.nivel === nivel.id ? "var(--gold-light)" : "var(--text-primary)", fontWeight: "600" }}>{nivel.title}</h3>
            </div>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", paddingLeft: "32px", lineHeight: "1.6" }}>{nivel.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBloco3 = () => {
    if (!f.nivel) return <div className="highlight-box no-print" style={{borderColor:"var(--danger)", color:"var(--danger)"}}>Por favor, volte ao Bloco 2 e selecione seu nível atual.</div>;

    if (f.nivel === "iniciante" || f.nivel === "basico") return (
      <div className="animate-fade-in no-print">
        <h2 className="form-section-title mb-6">Bloco 3: Autoavaliação Técnica (Iniciante / Básico)</h2>
        <p className="form-section-desc">Avalie de 1 a 5 o seu conhecimento atual nos temas abaixo.</p>
        
        <Scale1to5 label="3.1 Matemática financeira básica" value={f.tec_in_math} onChange={v=>set("tec_in_math",v)} />
        <Scale1to5 label="3.2 Conceitos de economia (inflação, Selic, PIB)" value={f.tec_in_eco} onChange={v=>set("tec_in_eco",v)} />
        <Scale1to5 label="3.3 O que é a bolsa de valores" value={f.tec_in_bolsa} onChange={v=>set("tec_in_bolsa",v)} />
        <Scale1to5 label="3.4 Tipos de investimento (CDB, Ações, FIIs)" value={f.tec_in_tipos} onChange={v=>set("tec_in_tipos",v)} />
        <Scale1to5 label="3.5 Excel básico" value={f.tec_in_excel} onChange={v=>set("tec_in_excel",v)} />
        
        <div className="form-section mt-24" style={{background: "var(--surface2)", padding: "20px"}}>
          <h3 className="form-label text-gold mb-16">3.6 Mapa de Vocabulário (Opcional - Marque apenas o que SABE)</h3>
          <div className="checkbox-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))" }}>
            {VOCABULARIO_INICIANTE.map(termo => (
              <div key={termo} onClick={()=>toggleArr("tec_in_vocab", termo)} className={`checkbox-item ${f.tec_in_vocab.includes(termo)?'selected':''}`} style={{fontSize:'12px', padding:'8px'}}>
                {f.tec_in_vocab.includes(termo) && "✓ "}{termo}
              </div>
            ))}
          </div>
        </div>

        <div className="grid-2 gap-20 mt-24">
          <div className="form-group"><label className="form-label">3.7 Três pontos fortes técnicos seus <Req/></label><textarea className="form-textarea" placeholder="Ex: Sou bom de Excel, aprendo rápido..." value={f.tec_in_fortes} onChange={e=>set("tec_in_fortes", e.target.value)} /></div>
          <div className="form-group"><label className="form-label">3.8 Três pontos para desenvolver <Req/></label><textarea className="form-textarea" placeholder="Ex: Quero entender como ler um balanço..." value={f.tec_in_melhorar} onChange={e=>set("tec_in_melhorar", e.target.value)} /></div>
        </div>
      </div>
    );

    if (f.nivel === "intermediario") return (
      <div className="animate-fade-in no-print">
        <h2 className="form-section-title mb-6">Bloco 3: Autoavaliação Técnica (Intermediário)</h2>
        <p className="form-section-desc">Avalie de 1 a 5 o seu conhecimento atual nos temas abaixo.</p>
        
        <Scale1to5 label="3.1 Análise fundamentalista" value={f.tec_mid_fund} onChange={v=>set("tec_mid_fund",v)} />
        <Scale1to5 label="3.2 Valuation básico (DCF, múltiplos)" value={f.tec_mid_val} onChange={v=>set("tec_mid_val",v)} />
        <Scale1to5 label="3.3 Contabilidade aplicada (DRE, Balanço, DFC)" value={f.tec_mid_cont} onChange={v=>set("tec_mid_cont",v)} />
        <Scale1to5 label="3.4 Macroeconomia aplicada" value={f.tec_mid_macro} onChange={v=>set("tec_mid_macro",v)} />
        <Scale1to5 label="3.5 Excel intermediário" value={f.tec_mid_excel} onChange={v=>set("tec_mid_excel",v)} />
        <Scale1to5 label="3.6 Redação técnica" value={f.tec_mid_red} onChange={v=>set("tec_mid_red",v)} />

        <div className="form-group mt-24 mb-20"><label className="form-label">3.7 Já escreveu algum relatório/tese? (Opcional)</label><textarea className="form-textarea" placeholder="Ex: Escrevi um relatório sobre WEGE3 no semestre passado..." value={f.tec_mid_relatorio} onChange={e=>set("tec_mid_relatorio", e.target.value)} /></div>
        
        <div className="grid-2 gap-20 mt-24">
          <div className="form-group"><label className="form-label">3.8 Três pontos fortes técnicos seus <Req/></label><textarea className="form-textarea" placeholder="Ex: Boa base contábil, Excel avançado..." value={f.tec_mid_fortes} onChange={e=>set("tec_mid_fortes", e.target.value)} /></div>
          <div className="form-group"><label className="form-label">3.9 Três pontos para desenvolver <Req/></label><textarea className="form-textarea" placeholder="Ex: Aprofundar em DCF, entender melhor crédito..." value={f.tec_mid_melhorar} onChange={e=>set("tec_mid_melhorar", e.target.value)} /></div>
        </div>
      </div>
    );

    return (
      <div className="animate-fade-in no-print">
        <h2 className="form-section-title mb-6">Bloco 3: Autoavaliação Técnica (Avançado)</h2>
        <p className="form-section-desc">Avalie de 1 a 5 o seu conhecimento atual nos temas abaixo.</p>
        
        <div className="grid-2 gap-20">
          <div>
            <h3 className="form-label text-gold mb-16" style={{borderBottom:"1px solid var(--border)", paddingBottom:"8px"}}>Modelagem & Valuation</h3>
            <Scale1to5 label="3.1 Three-statement model integrado" value={f.tec_adv_mod} onChange={v=>set("tec_adv_mod",v)} />
            <Scale1to5 label="3.2 DCF Avançado (WACC, terminal value)" value={f.tec_adv_dcf} onChange={v=>set("tec_adv_dcf",v)} />
            <Scale1to5 label="3.3 LBO model e PE return" value={f.tec_adv_lbo} onChange={v=>set("tec_adv_lbo",v)} />
          </div>
          <div>
            <h3 className="form-label text-gold mb-16" style={{borderBottom:"1px solid var(--border)", paddingBottom:"8px"}}>Ferramentas & Mercado</h3>
            <Scale1to5 label="3.4 M&A (due diligence, estruturas)" value={f.tec_adv_ma} onChange={v=>set("tec_adv_ma",v)} />
            <Scale1to5 label="3.5 Excel Avançado (VBA, pesados)" value={f.tec_adv_excel} onChange={v=>set("tec_adv_excel",v)} />
            <Scale1to5 label="3.6 Python / Automações financeiras" value={f.tec_adv_py} onChange={v=>set("tec_adv_py",v)} />
          </div>
        </div>

        <div className="form-group mt-24 mb-20"><label className="form-label">3.7 Quais áreas do mercado você JÁ DESCARTOU e por quê? <Req/></label><textarea className="form-textarea" placeholder="Ex: Descartei IB porque não tenho fit com a carga horária extrema. Foco total em Research..." value={f.tec_adv_descarte} onChange={e=>set("tec_adv_descarte", e.target.value)} /></div>
        
        <div className="grid-2 gap-20 mt-24">
          <div className="form-group"><label className="form-label">3.8 Três pontos fortes técnicos seus <Req/></label><textarea className="form-textarea" placeholder="Ex: Modelagem financeira super rápida..." value={f.tec_adv_fortes} onChange={e=>set("tec_adv_fortes", e.target.value)} /></div>
          <div className="form-group"><label className="form-label">3.9 Três pontos para desenvolver <Req/></label><textarea className="form-textarea" placeholder="Ex: Preciso melhorar meu conhecimento em derivativos..." value={f.tec_adv_melhorar} onChange={e=>set("tec_adv_melhorar", e.target.value)} /></div>
        </div>
      </div>
    );
  };

  const renderBloco4 = () => (
    <div className="animate-fade-in no-print">
      <h2 className="form-section-title mb-6">Bloco 4: Autoavaliação Comportamental</h2>
      <p className="form-section-desc">Leia as descrições e selecione a frase que melhor define a sua realidade hoje. Seja brutalmente honesto.</p>
      
      {COMPORTAMENTAL_ANCHORS.map(comp => (
        <BehavioralAnchorScale key={comp.id} title={comp.title} anchors={comp.anchors} value={f[comp.id]} onChange={v => set(comp.id, v)} />
      ))}

      <div className="form-group mt-32 highlight-box" style={{borderLeft:"4px solid var(--info)"}}>
        <label className="form-label text-gold" style={{fontSize:"16px", marginBottom:"12px"}}>4.10 Validação Prática (Método STAR) <Req/></label>
        <p style={{fontSize:"14px", color:"var(--text-muted)", marginBottom:"16px", lineHeight:"1.5"}}>Descreva uma situação recente (últimos 6 meses) em que você teve que lidar com um desafio difícil. O que aconteceu, como você reagiu e o que aprendeu?</p>
        <textarea className="form-textarea" style={{minHeight:"150px"}} placeholder="Escreva pelo menos 3 frases detalhando o contexto, a sua ação específica e o resultado..." value={f.c_star} onChange={e=>set("c_star", e.target.value)} />
      </div>
    </div>
  );

  const renderBloco5 = () => (
    <div className="animate-fade-in no-print">
      <h2 className="form-section-title mb-6">Bloco 5: Direção de Carreira</h2>
      
      <div className="form-group mb-24">
        <label className="form-label">5.1 Quais áreas do mercado financeiro mais te interessam hoje? <Req/></label>
        <div className="checkbox-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
          {AREAS_MERCADO.map(a => (
            <div key={a} onClick={()=>toggleArr("d_areas", a)} className={`checkbox-item ${f.d_areas.includes(a)?'selected':''}`} style={{fontSize:"13px"}}>{f.d_areas.includes(a)&&"✓ "}{a}</div>
          ))}
        </div>
      </div>

      <div className="form-group mb-20"><label className="form-label">5.2 Que tipo de empresa dos sonhos você imagina para a sua carreira? <Req/></label><input className="form-input" placeholder="Ex: Banco grande, Boutique de M&A, Gestora Independente..." value={f.d_empresa} onChange={e=>set("d_empresa", e.target.value)} /></div>
      
      <div className="grid-3 gap-20 mb-20">
        <div className="form-group"><label className="form-label">5.3 Em 1 ano, quero estar... <Req/></label><textarea className="form-textarea" placeholder="Ex: Estagiando no BTG..." value={f.d_1ano} onChange={e=>set("d_1ano", e.target.value)} /></div>
        <div className="form-group"><label className="form-label">5.4 Em 3 anos, quero estar... <Req/></label><textarea className="form-textarea" placeholder="Ex: Efetivado como Analista..." value={f.d_3anos} onChange={e=>set("d_3anos", e.target.value)} /></div>
        <div className="form-group"><label className="form-label">5.5 Em 5 anos, quero estar... <Req/></label><textarea className="form-textarea" placeholder="Ex: Sênior ou fazendo MBA..." value={f.d_5anos} onChange={e=>set("d_5anos", e.target.value)} /></div>
      </div>
      
      <div className="form-group mb-20"><label className="form-label">5.6 Profissional que admira (Opcional)</label><input className="form-input" placeholder="Ex: Warren Buffett, Howard Marks..." value={f.d_admira} onChange={e=>set("d_admira", e.target.value)} /></div>
    </div>
  );

  const renderBloco6 = () => (
    <div className="animate-fade-in no-print">
      <h2 className="form-section-title mb-6">Bloco 6: Metas Concretas</h2>
      <p className="form-section-desc">O que você quer alcançar nos próximos 6 meses. Apenas a 1ª opção de cada bloco é obrigatória.</p>
      
      <div className="grid-2 gap-24">
        <div className="form-section" style={{padding:"20px", background:"var(--surface2)"}}>
          <h3 className="form-label text-gold mb-8">6.1 Metas Acadêmicas <Req/></h3>
          <p style={{fontSize: "12px", color: "var(--text-muted)", marginBottom: "16px"}}>Ex: Aumentar CRA para 85, conseguir Iniciação Científica, etc.</p>
          <textarea className="form-textarea mb-8" style={{minHeight:"60px", padding:"10px 14px"}} placeholder="1. Meta Acadêmica (Obrigatória)" value={f.m_acad_1} onChange={e=>set("m_acad_1", e.target.value)} />
          <textarea className="form-textarea mb-8" style={{minHeight:"60px", padding:"10px 14px"}} placeholder="2. Meta Acadêmica (Opcional)" value={f.m_acad_2} onChange={e=>set("m_acad_2", e.target.value)} />
          <textarea className="form-textarea" style={{minHeight:"60px", padding:"10px 14px"}} placeholder="3. Meta Acadêmica (Opcional)" value={f.m_acad_3} onChange={e=>set("m_acad_3", e.target.value)} />
        </div>
        
        <div className="form-section" style={{padding:"20px", background:"var(--surface2)"}}>
          <h3 className="form-label text-gold mb-8">6.2 Certificações e Cursos <Req/></h3>
          <p style={{fontSize: "12px", color: "var(--text-muted)", marginBottom: "16px"}}>Ex: Passar na CPA-20, terminar curso de Valuation, etc.</p>
          <textarea className="form-textarea mb-8" style={{minHeight:"60px", padding:"10px 14px"}} placeholder="1. Meta de Estudo (Obrigatória)" value={f.m_cert_1} onChange={e=>set("m_cert_1", e.target.value)} />
          <textarea className="form-textarea mb-8" style={{minHeight:"60px", padding:"10px 14px"}} placeholder="2. Meta de Estudo (Opcional)" value={f.m_cert_2} onChange={e=>set("m_cert_2", e.target.value)} />
          <textarea className="form-textarea" style={{minHeight:"60px", padding:"10px 14px"}} placeholder="3. Meta de Estudo (Opcional)" value={f.m_cert_3} onChange={e=>set("m_cert_3", e.target.value)} />
        </div>
        
        <div className="form-section" style={{padding:"20px", background:"var(--surface2)"}}>
          <h3 className="form-label text-gold mb-8">6.3 Metas Profissionais <Req/></h3>
          <p style={{fontSize: "12px", color: "var(--text-muted)", marginBottom: "16px"}}>Ex: Entrar no processo seletivo do Itaú, melhorar o LinkedIn, etc.</p>
          <textarea className="form-textarea mb-8" style={{minHeight:"60px", padding:"10px 14px"}} placeholder="1. Meta Profissional (Obrigatória)" value={f.m_prof_1} onChange={e=>set("m_prof_1", e.target.value)} />
          <textarea className="form-textarea mb-8" style={{minHeight:"60px", padding:"10px 14px"}} placeholder="2. Meta Profissional (Opcional)" value={f.m_prof_2} onChange={e=>set("m_prof_2", e.target.value)} />
          <textarea className="form-textarea" style={{minHeight:"60px", padding:"10px 14px"}} placeholder="3. Meta Profissional (Opcional)" value={f.m_prof_3} onChange={e=>set("m_prof_3", e.target.value)} />
        </div>
        
        <div className="form-section" style={{padding:"20px", background:"var(--surface2)"}}>
          <h3 className="form-label text-gold mb-8">6.4 Metas Pessoais (Opcional)</h3>
          <p style={{fontSize: "12px", color: "var(--text-muted)", marginBottom: "16px"}}>Ex: Voltar para a academia, ler 1 livro não-técnico por mês, etc.</p>
          <textarea className="form-textarea mb-8" style={{minHeight:"60px", padding:"10px 14px"}} placeholder="1. Meta Pessoal (Opcional)" value={f.m_pes_1} onChange={e=>set("m_pes_1", e.target.value)} />
          <textarea className="form-textarea" style={{minHeight:"60px", padding:"10px 14px"}} placeholder="2. Meta Pessoal (Opcional)" value={f.m_pes_2} onChange={e=>set("m_pes_2", e.target.value)} />
        </div>
      </div>
    </div>
  );

  const renderBloco7 = () => (
    <div className="animate-fade-in no-print">
      <h2 className="form-section-title mb-6">Bloco 7: Reflexões</h2>
      <p className="form-section-desc">Esta é a parte mais valiosa do seu PDI. Pense com carinho antes de responder.</p>
      
      <div className="form-group mb-20"><label className="form-label">7.1 Por que você entrou na LAMF5 e o que espera ter conquistado ao sair? <Req/></label><textarea className="form-textarea" placeholder="O que te move a estar aqui?" value={f.r_motivo} onChange={e=>set("r_motivo", e.target.value)} /></div>
      <div className="form-group mb-20"><label className="form-label">7.2 Se em 1 ano seu PDI fosse um sucesso, o que teria mudado em você? <Req/></label><textarea className="form-textarea" placeholder="Imagine seu 'eu futuro'..." value={f.r_sucesso} onChange={e=>set("r_sucesso", e.target.value)} /></div>
      <div className="form-group mb-20"><label className="form-label">7.3 O que mais te frustra hoje no seu desenvolvimento? <Req/></label><textarea className="form-textarea" placeholder="Ex: Não saber por onde começar, falta de disciplina, ansiedade..." value={f.r_frustra} onChange={e=>set("r_frustra", e.target.value)} /></div>
      <div className="form-group mb-20"><label className="form-label text-gold">7.4 Última coisa que estudou de mercado por INICIATIVA PRÓPRIA (sem obrigação)? <Req/></label><textarea className="form-textarea" placeholder="Ex: Assisti um vídeo do Damodaran no sábado sobre Valuation..." value={f.r_iniciativa} onChange={e=>set("r_iniciativa", e.target.value)} /></div>
      <div className="grid-2 gap-20 mb-20">
        <div className="form-group"><label className="form-label">7.5 O que te IMPEDE hoje de estudar mais? <Req/></label><textarea className="form-textarea" placeholder="Tempo? Método? Procrastinação?" value={f.r_impede} onChange={e=>set("r_impede", e.target.value)} /></div>
        <div className="form-group"><label className="form-label">7.6 Como você APRENDE melhor? <Req/></label><textarea className="form-textarea" placeholder="Lendo, praticando, em grupo?" value={f.r_aprende} onChange={e=>set("r_aprende", e.target.value)} /></div>
      </div>
      <div className="form-group"><label className="form-label">7.7 Tem algo que, se pudesse, mudaria em si mesmo imediatamente? (Opcional)</label><textarea className="form-textarea" placeholder="Ex: Gostaria de ter menos medo de falar em público..." value={f.r_mudar} onChange={e=>set("r_mudar", e.target.value)} /></div>
    </div>
  );

  const renderBloco8 = () => (
    <div className="animate-fade-in no-print" style={{ textAlign: "center", padding: "20px 0" }}>
      <div style={{ fontSize: 64, marginBottom: 20 }}>🤝</div>
      <h2 className="form-section-title mb-16 text-gold">Quase lá! Preparando o seu 1:1</h2>
      <p className="form-section-desc mx-auto" style={{ maxWidth: "600px", marginBottom: "32px" }}>
        Obrigado pela dedicação, <strong style={{ color: "var(--white)" }}>{f.nome}</strong>. Para finalizarmos, informe suas preferências logísticas para marcarmos a sua reunião de mentoria.
      </p>

      <div className="form-group mx-auto mb-24" style={{ maxWidth: "700px", textAlign: "left" }}>
        <label className="form-label">8.1 Disponibilidade de Dias e Horários para o 1:1 <Req/></label>
        <textarea className="form-textarea" style={{minHeight:"60px"}} placeholder="Ex: Segundas à tarde, terças à noite..." value={f.log_disp} onChange={e=>set("log_disp", e.target.value)} />
      </div>

      <div className="form-group mx-auto mb-24" style={{ maxWidth: "700px", textAlign: "left" }}>
        <label className="form-label">8.2 Formato preferido <Req/></label>
        <select className="form-select" value={f.log_formato} onChange={e=>set("log_formato", e.target.value)}>
          <option value="">Selecione</option>
          <option value="presencial">Presencial</option>
          <option value="online">Online (Meet/Zoom)</option>
          <option value="indiferente">Tanto faz</option>
        </select>
      </div>

      <div className="form-group mx-auto mb-24" style={{ maxWidth: "700px", textAlign: "left" }}>
        <label className="form-label">8.3 Tem preferência por algum mentor ou diretoria específica? (Opcional)</label>
        <input className="form-input" placeholder="Ex: Queria alguém de Research..." value={f.log_mentor} onChange={e=>set("log_mentor", e.target.value)} />
      </div>

      <div className="form-group mx-auto mb-24" style={{ maxWidth: "700px", textAlign: "left" }}>
        <label className="form-label">8.4 Algo confidencial que o mentor deve saber ANTES do 1:1? (Opcional)</label>
        <textarea className="form-textarea" style={{minHeight:"60px"}} placeholder="Questões de saúde, problemas familiares severos de tempo, etc..." value={f.log_info} onChange={e=>set("log_info", e.target.value)} />
      </div>

      <Scale0to10 label="8.5 Seu comprometimento com o PDI" value={f.log_engajamento} onChange={v => set("log_engajamento", v)} />
    </div>
  );

  const RENDER_STEPS = [renderBloco0, renderBloco1, renderBloco2, renderBloco3, renderBloco4, renderBloco5, renderBloco6, renderBloco7, renderBloco8];
  const STEP_TITLES = ["Bem-vindo", "Contexto", "Triagem", "Técnico", "Atitudes", "Direção", "Metas", "Reflexão", "Envio"];

  return (
    <div className="no-print" style={{ minHeight: "100vh", background: "var(--black)", display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 20px" }}>
      
      {/* HEADER DO FORMULÁRIO */}
      <div style={{ width: "100%", maxWidth: "800px", marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <button onClick={() => router.push('/dashboard')} className="topbar-btn mb-16" style={{ fontSize: '12px', padding: '6px 12px' }}>← Voltar ao Dashboard</button>
          <h1 className="page-title" style={{ fontSize: "28px" }}>Questionário Oficial PDI</h1>
          <p className="page-subtitle" style={{ fontSize: "14px" }}>Liga Acadêmica de Mercado Financeiro</p>
        </div>
      </div>

      <div style={{ width: "100%", maxWidth: "800px" }}>
        <div className="cycle-bar mb-24" style={{ background: 'rgba(20, 20, 20, 0.6)', backdropFilter: 'blur(10px)', padding: '16px 20px', flexWrap: 'wrap', gap: '8px' }}>
          {STEP_TITLES.map((titulo, i) => (
            <div key={i} className={`cycle-step ${step > i ? 'done' : step === i ? 'current' : ''}`} style={{ minWidth: '60px' }}>
              <div className="cycle-dot" style={{width:"24px", height:"24px", fontSize:"10px", margin: "0 auto 4px"}}>{step > i ? '✓' : i}</div>
              <div className="cycle-name" style={{fontSize:"9px"}}>{titulo}</div>
            </div>
          ))}
        </div>

        <div className="form-section" style={{ background: 'rgba(28, 28, 28, 0.8)', backdropFilter: 'blur(12px)', borderTop: '3px solid var(--gold)' }}>
          
          {RENDER_STEPS[step]()}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
            <button className="topbar-btn" onClick={() => setStep(s => Math.max(0, s - 1))} style={{ visibility: step === 0 ? "hidden" : "visible" }}>
              ← Voltar Etapa
            </button>
            
            <button className="topbar-btn primary" onClick={handleNextStep} disabled={isSaving}>
              {step < 8 ? "Próxima Etapa →" : (isSaving ? "Enviando..." : "Finalizar e Enviar")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}