"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase"; // NOVO: Conexão com o banco

// ============================================================================
// 1. BASE DE DADOS DO MANUAL (AS 22 ÁREAS DO MERCADO)
// ============================================================================
const AREAS_MERCADO = {
  "Investment Banking": { nome: "Investment Banking (IB)", funcionamento: "Você atua como o arquiteto corporativo. Seu dia a dia envolve assessorar empresas em grandes transações: compra e venda de outras empresas (M&A), fusões ou abertura de capital na bolsa (IPO). O trabalho exige criar modelos financeiros complexos e apresentações comerciais (pitchbooks) impecáveis sob prazos curtíssimos.", justificativa: "Seu perfil combinou alta capacidade analítica, foco em grandes eventos corporativos e uma tolerância altíssima a ritmos de trabalho intensos. Você é movido por fechar grandes deals.", trilha: "Certificações não são o foco principal. Foque em modelagem financeira pesada, contabilidade, Valuation e networking agressivo. Cursos de M&A e DCF são essenciais." },
  "Equity Research": { nome: "Equity Research (Sell-side)", funcionamento: "Seu trabalho é ser o especialista de um setor da economia. Você passa os dias estudando o balanço de empresas listadas em bolsa, conversando com diretores (RI) e escrevendo relatórios recomendando se os clientes da corretora devem 'Comprar', 'Manter' ou 'Vender' uma ação.", justificativa: "Você demonstrou forte apego ao detalhe qualitativo e quantitativo, gostando de analisar teses de longo prazo e escrever relatórios profundos sobre empresas.", trilha: "CNPI é obrigatório para assinar relatórios no Brasil. CFA é o padrão ouro global. Estude contabilidade avançada e leitura de balanços." },
  "Sales & Trading": { nome: "Sales & Trading / Mesa de Operações", funcionamento: "Você é a ponte entre os clientes institucionais e o mercado. Executa ordens de compra e venda de milhões em frações de segundos, precifica ativos, gerencia o risco instantâneo da mesa e busca sempre a melhor execução para lucrar nos 'spreads' (diferença de preços).", justificativa: "Seu perfil é adrenalina pura. Você lida bem com risco extremo, tem raciocínio rápido para decisões em segundos e gosta da dinâmica agressiva de compra e venda.", trilha: "PQO (B3) é obrigatório. Entenda de macroeconomia, derivativos, opções e psicologia de mercado. CFA ajuda, mas a prática e a agilidade mental valem mais." },
  "Asset Management": { nome: "Asset Management (Buy-side)", funcionamento: "Você é quem toma a decisão final de onde colocar o dinheiro do fundo. Ao contrário do sell-side (que só recomenda), você aperta o botão para comprar as ações ou títulos e montar a carteira, visando multiplicar o patrimônio dos cotistas ao longo dos anos.", justificativa: "Você tem um perfil analítico, visão de dono e foco em superar o benchmark no longo prazo. Prefere gerir patrimônio institucional a vender produtos.", trilha: "CGA e CGE (ANBIMA) para gestão. CFA é o diferencial competitivo máximo. Estude Teoria Moderna do Portfólio e alocação de ativos." },
  "Hedge Funds": { nome: "Hedge Funds (Multimercados)", funcionamento: "Como em uma Asset, você faz a gestão do dinheiro, mas com liberdade total. Você opera juros, moedas, commodities e ações globais, podendo apostar na queda (shortear) e usar alavancagem alta para gerar lucros absolutos, não importando a direção do mercado.", justificativa: "Você gosta de mercados complexos, assimetrias e liberdade para operar teses não-convencionais com altíssimo risco e recompensa.", trilha: "CGA/CGE. Aprofunde-se absurdamente em macroeconomia, política monetária, opções e estratégias quantitativas." },
  "Private Equity": { nome: "Private Equity (PE)", funcionamento: "Você levanta bilhões de investidores para comprar empresas de capital fechado (que não estão na bolsa). O trabalho envolve assumir o controle, trocar a diretoria, cortar custos, melhorar a eficiência operacional por anos e depois vender a empresa com alto lucro.", justificativa: "Sua visão é de longo prazo (anos). Você gosta de comprar empresas maduras, reestruturá-las e melhorar suas operações reais antes de vendê-las.", trilha: "Experiência prévia em IB ou Consultoria Estratégica é a porta de entrada. Domine LBO (Leveraged Buyout) e gestão operacional." },
  "Venture Capital": { nome: "Venture Capital (VC)", funcionamento: "Você procura os 'unicórnios' do amanhã. Seu dia a dia é ouvir pitchs de empreendedores, analisar modelos de negócios disruptivos de startups de tecnologia e investir naquelas que podem multiplicar o capital em 10x a 100x em uma década.", justificativa: "Você é movido por inovação, tecnologia e alto risco. Prefere analisar pessoas e potenciais exponenciais do que fluxos de caixa estáticos.", trilha: "Networking em ecossistemas de inovação. Aprenda sobre term sheets, cap tables e tendências de tecnologia (SaaS, IA)." },
  "FIIs": { nome: "Real Estate / FIIs", funcionamento: "Você é o especialista do tijolo financeiro. O trabalho é comprar, vender ou desenvolver prédios comerciais, galpões logísticos e shoppings, ou emitir dívidas imobiliárias (CRIs) para gerar aluguéis/dividendos consistentes aos cotistas dos Fundos Imobiliários.", justificativa: "Você mostrou interesse em ativos tangíveis, geração de renda passiva (dividendos) e dinâmica imobiliária. Gosta de previsibilidade e tijolo.", trilha: "Certificação de Gestor (CGA). Conhecimento profundo em matemática financeira, direito imobiliário e avaliação de imóveis." },
  "Private Banking": { nome: "Private Banking", funcionamento: "Você gerencia a vida financeira de clientes multimilionários (Ultra-High). O trabalho mistura alocação de investimentos com serviços exclusivos, como sucessão familiar, estruturação de empresas no exterior (offshore) e crédito de alto nível.", justificativa: "Seu forte é o relacionamento (Soft Skills), sofisticação e networking. Você prefere lidar com famílias, oferecendo soluções patrimoniais exclusivas.", trilha: "CFP (Certified Financial Planner) é o padrão ouro. CEA (ANBIMA) para começar. Desenvolva oratória, etiqueta corporativa e networking." },
  "Wealth Management": { nome: "Wealth Management / Family Office", funcionamento: "Semelhante ao Private Bank, mas com um viés de aconselhamento independente. Você atua como o 'CFO' de famílias muito ricas, cuidando da perpetuidade da fortuna, blindagem fiscal e consolidando todos os investimentos da família.", justificativa: "Semelhante ao Private, mas com um viés de alocação de portfólio mais independente e planejamento sucessório de longo prazo.", trilha: "CFP, CEA, CGA. Domínio sobre sucessão patrimonial, estruturas offshore, trusts e tributação internacional." },
  "AAI": { nome: "Agente Autônomo de Investimentos (AAI / Assessor)", funcionamento: "Você é o braço comercial do mercado. Seu papel é prospectar investidores, entender os objetivos deles e apresentar o portfólio da corretora (XP, BTG). A remuneração é atrelada ao sucesso da sua captação.", justificativa: "Você tem espírito empreendedor, ama a área comercial e lida perfeitamente com remuneração variável. Acelera na captação de clientes.", trilha: "Prova da ANCORD é o único requisito legal. Desenvolva técnicas de vendas (SPIN Selling), resiliência comercial e networking agressivo." },
  "Banking PJ": { nome: "Banking PJ (Corporate / Middle Market)", funcionamento: "Você é o banqueiro das empresas (B2B). Seu dia a dia é visitar diretores de empresas da 'economia real', entender as necessidades de caixa deles e oferecer linhas de crédito, financiamentos ou operações de câmbio.", justificativa: "Você gosta da economia real. Prefere analisar risco de crédito, balanços de empresas tradicionais e estruturar linhas de financiamento.", trilha: "CPA-20 ou CEA. Foco total em Análise de Crédito, contabilidade, matemática financeira e relacionamento corporativo." },
  "FP&A": { nome: "FP&A (Financial Planning & Analysis)", funcionamento: "Você é o radar do CFO dentro de uma grande empresa. Planeja o orçamento do ano, analisa os custos mês a mês e modela no Excel o que vai acontecer com o caixa da empresa se os juros subirem ou se uma nova fábrica for aberta.", justificativa: "Você tem perfil corporativo forte, adora Excel e gosta de projetar o futuro financeiro de uma única empresa.", trilha: "Excel e Power BI em nível especialista. Estude contabilidade gerencial profunda, modelagem DRE/DFC e projeção de cenários." },
  "Controladoria": { nome: "Controladoria", funcionamento: "Você é o guardião dos números da empresa. Garante que cada centavo que entra e sai está registrado de acordo com as leis contábeis. Elabora as demonstrações financeiras oficiais que vão para o mercado.", justificativa: "Disciplina, exatidão e processos. Você garante que a contabilidade reflita perfeitamente a realidade e audita as finanças corporativas.", trilha: "Graduação forte em Ciências Contábeis ou Economia. CRC (se contador). Conhecimento profundo em IFRS e CPCs." },
  "RI": { nome: "Relações com Investidores (RI)", funcionamento: "Você é a voz oficial da empresa listada na bolsa. Prepara os materiais de divulgação de resultados, faz reuniões com analistas e acionistas e explica a estratégia da diretoria para manter a ação valorizada no mercado.", justificativa: "Você une comunicação impecável com conhecimento técnico. Gosta da ideia de ser a 'voz' da empresa perante o mercado e os acionistas.", trilha: "Domínio de contabilidade, Valuation e oratória. Você precisa saber explicar o porquê dos números da empresa subirem ou caírem." },
  "Risk Management": { nome: "Risk Management (Risco)", funcionamento: "Você é quem dá a permissão ou o bloqueio final. O trabalho é calcular matematicamente o risco que a instituição está correndo nas mesas de operação (Risco de Mercado, Risco de Liquidez) e limitar as perdas usando s de estresse.", justificativa: "Você é o 'freio de emergência'. Tem pensamento crítico voltado a antecipar perdas, mitigar problemas de liquidez e proteger a instituição.", trilha: "FRM (Financial Risk Manager) ou CQF. Matemática fortíssima, estatística, VaR, Basileia e programação básica (Python/R)." },
  "Compliance": { nome: "Compliance & PLD", funcionamento: "Sua missão é evitar fraudes e escândalos. Você monitora as atividades dos funcionários e dos clientes para garantir que o banco obedeça à risca as regras da CVM/BCB e foca na Prevenção à Lavagem de Dinheiro (PLD).", justificativa: "Sua ética é inegociável e você gosta de regulamentos. Seu foco é garantir que o banco siga as leis e prevenir lavagem de dinheiro.", trilha: "Conhecimento jurídico e regulatório (Instruções CVM, normas BCB). Cursos específicos de PLD." },
  "Auditoria": { nome: "Auditoria (Big 4 / Interna)", funcionamento: "Como detetive corporativo, você visita outras empresas para revisar seus livros contábeis. Seu objetivo é atestar que as demonstrações financeiras publicadas são verdadeiras e não têm erros ou fraudes materiais.", justificativa: "Você tem olho clínico para erros, paciência para varrer demonstrações contábeis e gosta do rigor técnico de validar relatórios.", trilha: "Ciências Contábeis. Inglês fluente. Preparação mental para trabalhar muito garantindo a conformidade dos números." },
  "Quant Finance": { nome: "Quantitative Finance (Quant)", funcionamento: "Você cria robôs e algoritmos que investem sozinhos. O trabalho é pesquisar padrões ocultos em dados imensos (Machine Learning) e traduzir teses financeiras complexas para linhas de código C++ ou Python para execução automática.", justificativa: "Você é focado em códigos, robôs e matemática avançada. Confia mais em algoritmos de alta frequência do que em narrativas humanas.", trilha: "Mestrado/Doutorado em Física, Matemática ou Computação é comum. Domínio absoluto de Python, C++, cálculo estocástico e Machine Learning." },
  "Fintech": { nome: "Fintech / Produtos Financeiros", funcionamento: "Você atua como Product Manager (PM) ou estrategista em bancos digitais. O foco é entender o comportamento dos usuários, desenhar novos cartões, contas e empréstimos e guiar as equipes de TI para programar essas soluções.", justificativa: "Você é ágil, gosta de tecnologia e quer 'desbancarizar' o sistema tradicional criando produtos financeiros acessíveis.", trilha: "Metodologias Ágeis (Scrum), Product Management (PM), noções de UX/UI e entendimento do Open Finance e Drex." },
  "Cripto": { nome: "Criptoativos & Web3", funcionamento: "Você estuda e investe na descentralização. Analisa o código de contratos inteligentes, entende a tokenomics (economia dos tokens) e opera ativos altamente voláteis que funcionam 24/7 sem fronteiras.", justificativa: "Você abraça a disrupção total, gosta de mercados desregulamentados e não tem medo de volatilidade extrema.", trilha: "Estude Blockchain, Ethereum, DeFi, Smart Contracts e Tokenomics. Exige estudo autodidata intenso em inglês." },
  "Tesouraria": { nome: "Tesouraria (ALM / Corporativa)", funcionamento: "Você é o coração da liquidez de uma empresa ou banco. Você investe o caixa que está sobrando, usa derivativos para proteger a empresa de altas do dólar ou dos juros (hedge) e capta dinheiro quando a empresa precisa operar.", justificativa: "Você gosta de proteger o caixa da empresa, fazendo hedge cambial e garantindo liquidez de curto prazo.", trilha: "Excel avançado, matemática financeira e conhecimento profundo em derivativos (Swaps, NDFs) para proteção." }
};

// ============================================================================
// 2. BANCO DE PERGUNTAS VETORIAIS
// ============================================================================
const QUIZ_QUESTIONS = [
  { pergunta: "1. Você descobre que uma tese de investimento sua deu muito errado e a carteira derreteu 15% em um único dia. Qual é sua reação visceral?", opcoes: [ { texto: "Isso faz parte. Vou ajustar os algoritmos de stop-loss ou achar uma oportunidade de short (venda) imediata para recuperar.", pesos: { "Hedge Funds": 3, "Sales & Trading": 3, "Quant Finance": 2, "Cripto": 2, "Controladoria": -2 } }, { texto: "Bate o desespero. Detesto perdas e prefiro ambientes onde eu calculo custos e controlo o orçamento com previsibilidade.", pesos: { "FP&A": 3, "Controladoria": 3, "Auditoria": 2, "Risk Management": 2, "Venture Capital": -2 } }, { texto: "Não me desespero. Eu invisto para 5 a 10 anos. Se os fundamentos operacionais da empresa seguem intactos, eu seguro ou compro mais.", pesos: { "Private Equity": 3, "Asset Management": 3, "Equity Research": 2, "Wealth Management": 1 } }, { texto: "Preparo uma apresentação transparente e técnica para explicar rapidamente ao meu cliente/acionista os motivos sistêmicos da queda.", pesos: { "RI": 3, "Private Banking": 3, "AAI": 2, "Quant Finance": -1 } } ] },
  { pergunta: "2. Como você enxerga a sua relação ideal com prazos e o ritmo do seu trabalho?", opcoes: [ { texto: "Gosto de ciclos diários agressivos. A meta bateu, mercado fechou, zera tudo e amanhã é outro dia (segundos/horas).", pesos: { "Sales & Trading": 3, "Hedge Funds": 2, "AAI": 2, "Private Equity": -2 } }, { texto: "Gosto de sprints e madrugadas para fechar um negócio que vai sair na capa do Valor Econômico na próxima semana (meses/deal).", pesos: { "Investment Banking": 3, "Private Equity": 2, "Auditoria": 1 } }, { texto: "Gosto de rotinas corporativas cíclicas. O fechamento do mês, a prestação de contas trimestral e metas anuais.", pesos: { "FP&A": 3, "Controladoria": 3, "RI": 2, "Banking PJ": 1 } }, { texto: "Meu prazo é geracional. Penso em como a tecnologia de hoje vai revolucionar o mercado em 10 anos ou perpetuar uma riqueza.", pesos: { "Venture Capital": 3, "Wealth Management": 3, "Cripto": 2, "Fintech": 2 } } ] },
  { pergunta: "3. O que te atrai mais no momento de analisar uma empresa?", opcoes: [ { texto: "Destrinchar o DRE e o Balanço linha por linha e montar um Valuation (DCF) milimétrico no Excel.", pesos: { "Investment Banking": 3, "Equity Research": 3, "Private Equity": 2, "AAI": -1 } }, { texto: "Entender quem são os fundadores, a cultura da equipe e o potencial de disrupção da tecnologia deles.", pesos: { "Venture Capital": 3, "Fintech": 3, "Cripto": 2, "Auditoria": -2 } }, { texto: "Fazer análise de crédito e garantias para entender se ela tem fluxo de caixa suficiente para me pagar um empréstimo.", pesos: { "Banking PJ": 3, "Risk Management": 2, "FIIs": 1 } }, { texto: "Não quero analisar a empresa inteira, prefiro automatizar a leitura de dados de mercado dela usando Python e algoritmos.", pesos: { "Quant Finance": 3, "Risk Management": 2, "Hedge Funds": 1, "Private Banking": -2 } } ] },
  { pergunta: "4. Imagine sua remuneração financeira perfeita. Ela seria:", opcoes: [ { texto: "Salário fixo robusto e previsível, focado em estabilidade, plano de carreira claro e pacote de benefícios corporativos.", pesos: { "Controladoria": 3, "Auditoria": 3, "Compliance": 3, "FP&A": 2, "Sales & Trading": -2 } }, { texto: "Base ok, mas o que brilha são os bônus gordos anuais focados no fechamento de M&A ou meta do fundo.", pesos: { "Investment Banking": 3, "Private Equity": 3, "Asset Management": 2 } }, { texto: "Sou caçador. Quero 100% comissão. Se eu captar 100 milhões amanhã, quero minha porcentagem agressiva na hora.", pesos: { "AAI": 3, "Private Banking": 2, "Sales & Trading": 1, "Controladoria": -3 } }, { texto: "Equity/Stock Options. Quero ser sócio do negócio ou do projeto de tecnologia e ganhar se o valuation explodir.", pesos: { "Venture Capital": 3, "Fintech": 3, "Cripto": 3, "Auditoria": -2 } } ] },
  { pergunta: "5. Se você fosse obrigado a passar 10 horas do dia focando apenas em uma tela, qual seria?", opcoes: [ { texto: "Terminal da Bloomberg, boletas de compra/venda piscando, múltiplos gráficos e telas simultâneas.", pesos: { "Sales & Trading": 3, "Hedge Funds": 2, "Tesouraria": 2 } }, { texto: "Visual Studio Code, Jupyter Notebook, linhas de código em Python ou C++ extraindo dados gigantes.", pesos: { "Quant Finance": 3, "Cripto": 2, "Risk Management": 1 } }, { texto: "Um modelo de Three-Statement Model complexo no Excel (DRE, DFC, Balanço).", pesos: { "Investment Banking": 3, "FP&A": 3, "Equity Research": 2 } }, { texto: "Não conseguiria. Eu preciso sair, ir a almoços, tomar café com donos de empresas e visitar clientes ricos.", pesos: { "Private Banking": 3, "AAI": 3, "Wealth Management": 2, "Quant Finance": -3 } } ] },
  { pergunta: "6. Qual é a sua tolerância para lidar com burocracias, regras legais e o regulador (CVM/BCB)?", opcoes: [ { texto: "Sou o defensor das regras. Leio manuais de conduta e garanto que ninguém desvie a linha moral e jurídica da empresa.", pesos: { "Compliance": 3, "Auditoria": 3, "Controladoria": 2 } }, { texto: "Respeito e navego bem. Sei estruturar portfólios familiares complexos otimizando impostos de forma totalmente legal.", pesos: { "Wealth Management": 3, "Private Banking": 2, "Asset Management": 1 } }, { texto: "As regras são o limite. Onde houver uma brecha legal para alavancar ou estruturar um derivativo complexo, nós vamos atuar.", pesos: { "Hedge Funds": 3, "Sales & Trading": 2, "Tesouraria": 1 } }, { texto: "Odeio o sistema tradicional. Quero descentralização, Open Finance e modelos que contornem a lentidão burocrática dos bancos.", pesos: { "Cripto": 3, "Fintech": 3, "Venture Capital": 2, "Compliance": -3 } } ] },
  { pergunta: "7. Quando se trata de gerir conflitos e estresse, você...", opcoes: [ { texto: "Fico calmo na mesa enquanto tem pessoas gritando ao meu redor. Exerço frieza sob pressão caótica.", pesos: { "Sales & Trading": 3, "Hedge Funds": 2, "Investment Banking": 1 } }, { texto: "Lido bem com discussões técnicas e revisões infinitas vindas de sócios sêniores criticando meu modelo.", pesos: { "Investment Banking": 3, "Private Equity": 2, "Equity Research": 2 } }, { texto: "Tenho empatia para acalmar pessoas que estão com medo de perder as economias da vida delas num cenário de crise.", pesos: { "Private Banking": 3, "AAI": 3, "Wealth Management": 2 } }, { texto: "Prefiro evitar o estresse humano direto. Meu estresse é debugar um erro lógico na minha automação que não está compilando.", pesos: { "Quant Finance": 3, "Fintech": 2, "Risk Management": 1 } } ] },
  { pergunta: "8. Em um almoço de negócios, você adoraria passar horas discutindo sobre:", opcoes: [ { texto: "A dinâmica de juros do Banco Central Americano, taxa de desemprego e macroeconomia global.", pesos: { "Asset Management": 3, "Hedge Funds": 3, "Equity Research": 1 } }, { texto: "Estruturas de holdings offshore, planejamento tributário familiar e fundos exclusivos.", pesos: { "Wealth Management": 3, "Private Banking": 3, "FIIs": 1 } }, { texto: "A operação de uma fábrica: onde estão cortando custos, a logística da máquina, os estoques e a folha de pagamento.", pesos: { "Private Equity": 3, "FP&A": 3, "Banking PJ": 2 } }, { texto: "Como construir a narrativa de venda para o próximo follow-on de uma empresa ou sua relação com a mídia.", pesos: { "RI": 3, "Investment Banking": 1, "AAI": 1 } } ] },
  { pergunta: "9. O mercado despenca misteriosamente em 5 minutos. O que sua intuição te diz para fazer como trabalho?", opcoes: [ { texto: "Correr para calcular a Exposição a Risco (VaR) do banco e avisar as mesas para pararem a sangria imediatamente.", pesos: { "Risk Management": 3, "Tesouraria": 2, "Compliance": 1 } }, { texto: "Verificar se as garantias dos clientes corporativos (Middle Market) do banco ainda cobrem o limite de crédito deles.", pesos: { "Banking PJ": 3, "Risk Management": 1 } }, { texto: "Montar rapidamente um comitê para mandar uma carta tranquilizando as famílias ricas e recomendar paciência.", pesos: { "Private Banking": 3, "Wealth Management": 2, "AAI": 2 } }, { texto: "Escrever uma nota de mercado (Report) ágil para clientes institucionais explicando os motivos técnicos da queda.", pesos: { "Equity Research": 3, "Asset Management": 2, "RI": 1 } } ] },
  { pergunta: "10. Qual ambiente arquitetônico mais combina com você?", opcoes: [ { texto: "Um galpão de startup ou hub de tecnologia. Jeans, tênis, ideias loucas no quadro branco e café liberado.", pesos: { "Fintech": 3, "Cripto": 3, "Venture Capital": 3, "Private Banking": -2 } }, { texto: "A Avenida Faria Lima raiz. Terno, colete, salas de reunião de vidro espelhado com vista pra cidade, fechando operações bilionárias.", pesos: { "Investment Banking": 3, "Private Equity": 3, "Asset Management": 2 } }, { texto: "Escritórios de altíssimo luxo com obras de arte, sofás de couro e discrição absoluta para receber famílias.", pesos: { "Wealth Management": 3, "Private Banking": 3, "FIIs": 1 } }, { texto: "Ambiente de chão de fábrica ou salas de diretorias internas focando em otimizar o resultado real e físico da empresa.", pesos: { "FP&A": 3, "Controladoria": 3, "Banking PJ": 2 } } ] },
  { pergunta: "11. Um bom profissional nesta área é como um:", opcoes: [ { texto: "Cirurgião de trauma: sangue frio, mãos rápidas, trabalha com vida ou morte em tempo real.", pesos: { "Sales & Trading": 3, "Hedge Funds": 2, "Tesouraria": 1 } }, { texto: "Engenheiro de foguete: tudo é baseado em cálculo rigoroso, equações absolutas e ausência de achismos.", pesos: { "Quant Finance": 3, "Risk Management": 3, "Fintech": 1 } }, { texto: "Maestro de orquestra: garante que o balanço, os custos, o DRE e os impostos toquem em perfeita harmonia todo mês.", pesos: { "Controladoria": 3, "FP&A": 3, "Auditoria": 2 } }, { texto: "Diplomata ou Concierge: resolve os piores estresses dos clientes com classe, elegância e um sorriso no rosto.", pesos: { "Private Banking": 3, "AAI": 3, "RI": 2, "Quant Finance": -2 } } ] },
  { pergunta: "12. Ao final da sua carreira, você gostaria de olhar para trás e dizer:", opcoes: [ { texto: "'Eu ajudei a financiar as startups e tecnologias que revolucionaram a forma como o mundo vive hoje.'", pesos: { "Venture Capital": 3, "Fintech": 3, "Cripto": 2 } }, { texto: "'Fui um dos maiores originadores de negócios. Comprei, consolidei e vendi as maiores indústrias do país.'", pesos: { "Private Equity": 3, "Investment Banking": 3, "FIIs": 1 } }, { texto: "'Passei ileso pelas maiores crises protegendo perfeitamente o banco contra o colapso e as multas.'", pesos: { "Risk Management": 3, "Compliance": 3, "Auditoria": 2 } }, { texto: "'Bati o CDI de forma consistente ao longo de 20 anos, gerando valor absurdo para os meus cotistas no fundo.'", pesos: { "Asset Management": 3, "Hedge Funds": 3, "Equity Research": 1 } } ] },
  { pergunta: "13. Como você enxerga a relação entre o seu tempo livre e a sua compensação financeira (Work-Life Balance)?", opcoes: [ { texto: "Estou disposto a sacrificar noites, finais de semana e feriados se isso significar atingir o topo salarial do mercado rapidamente.", pesos: { "Investment Banking": 3, "Private Equity": 3, "Hedge Funds": 2, "Controladoria": -3 } }, { texto: "Quero ganhar muito dinheiro, mas exijo o direito de desconectar quando o mercado financeiro fecha às 17h.", pesos: { "Sales & Trading": 3, "Asset Management": 2, "AAI": 2 } }, { texto: "Prefiro trabalhar de segunda a sexta, em horário comercial estável. Dinheiro é ótimo, mas ter previsibilidade para ver a família é essencial.", pesos: { "FP&A": 3, "Controladoria": 3, "Auditoria": 2, "Banking PJ": 2 } }, { texto: "Trabalho remoto, horários flexíveis e foco puro em entrega. Se eu resolver o problema de madrugada ou de tarde, não importa.", pesos: { "Quant Finance": 3, "Fintech": 3, "Cripto": 3, "Venture Capital": 2 } } ] },
  { pergunta: "14. Diante de um desafio complexo na empresa, qual o seu primeiro instinto para buscar uma solução?", opcoes: [ { texto: "Abrir o Excel do zero e construir um modelo matemático que projete as opções que temos.", pesos: { "Investment Banking": 3, "FP&A": 3, "Equity Research": 2 } }, { texto: "Marcar um café ou jantar com pessoas estratégicas que já resolveram o problema antes.", pesos: { "Private Banking": 3, "Venture Capital": 3, "AAI": 3, "Wealth Management": 2 } }, { texto: "Abrir o terminal/IDE e codar um script em Python ou SQL para processar a base de dados em massa.", pesos: { "Quant Finance": 3, "Risk Management": 2, "Fintech": 2 } }, { texto: "Consultar os manuais de procedimento, regras e regulamentações para garantir que nenhuma lei seja quebrada.", pesos: { "Compliance": 3, "Controladoria": 3, "Auditoria": 3 } } ] },
  { pergunta: "15. Se você fosse escolher apenas UMA métrica de sucesso para o seu trabalho, qual seria?", opcoes: [ { texto: "O volume em R$ do negócio fechado (Tamanho do Deal).", pesos: { "Investment Banking": 3, "Private Equity": 3, "Banking PJ": 2 } }, { texto: "O Alpha (quanto de rentabilidade acima do mercado eu consegui gerar).", pesos: { "Hedge Funds": 3, "Asset Management": 3, "Quant Finance": 2 } }, { texto: "O AUM (Assets Under Management - quanto dinheiro novo eu captei para a instituição).", pesos: { "AAI": 3, "Private Banking": 3, "Wealth Management": 3 } }, { texto: "O Zero (zero falhas, zero multas do regulador, zero quebras de orçamento).", pesos: { "Risk Management": 3, "Compliance": 3, "Controladoria": 3 } } ] },
  { pergunta: "16. Como você prefere lidar com a necessidade de prospectar (vender) o seu serviço?", opcoes: [ { texto: "Nasci para isso. Eu mesmo pego o telefone, bato na porta de empresas e capto os clientes do zero.", pesos: { "AAI": 3, "Banking PJ": 3, "Private Banking": 2 } }, { texto: "Eu vendo ideias complexas para investidores institucionais que já conhecem o assunto, com base técnica.", pesos: { "RI": 3, "Investment Banking": 2, "Asset Management": 2 } }, { texto: "Prefiro não vender nada. Deixe que a equipe comercial (vendedores) traga os clientes, eu fico no background executando.", pesos: { "FP&A": 3, "Quant Finance": 3, "Risk Management": 3, "Controladoria": 3 } } ] },
  { pergunta: "17. Para você, qual a verdadeira definição do que é o 'Risco' financeiro?", opcoes: [ { texto: "Risco é o combustível. É a assimetria matemática de onde se tira as maiores fortunas se você souber operar.", pesos: { "Hedge Funds": 3, "Sales & Trading": 3, "Cripto": 2, "Venture Capital": 2 } }, { texto: "Risco é uma taxa. Ele deve ser precificado, diluído e inserido corretamente no custo da operação ou da carteira.", pesos: { "Asset Management": 3, "Equity Research": 3, "Investment Banking": 2 } }, { texto: "Risco é o inimigo que pode quebrar o banco. Meu dever é impedi-lo usando modelos de estresse e proteção.", pesos: { "Risk Management": 3, "Tesouraria": 3, "Auditoria": 2 } } ] },
  { pergunta: "18. O que te dá mais prazer na sua leitura ou estudo aos finais de semana?", opcoes: [ { texto: "Ler sobre tendências tecnológicas emergentes, biotecnologia e inovação no Vale do Silício.", pesos: { "Venture Capital": 3, "Fintech": 3, "Cripto": 3 } }, { texto: "Ler jornais macroeconômicos (WSJ, Valor), decisões do FED e tentar adivinhar a direção da inflação.", pesos: { "Hedge Funds": 3, "Asset Management": 3, "Tesouraria": 2 } }, { texto: "Aprofundar-se nos detalhes jurídicos ou sucessórios de casos empresariais e blindagem de patrimônio.", pesos: { "Wealth Management": 3, "Private Banking": 2, "Compliance": 2 } }, { texto: "Ver vídeos ou ler tutoriais sobre novas funções de cálculo, estatística ou programação.", pesos: { "Quant Finance": 3, "Risk Management": 2, "FP&A": 1 } } ] },
  { pergunta: "19. Em uma reunião importante, qual o seu estilo principal de argumentação?", opcoes: [ { texto: "Narrativa e sedução: eu conto a história do mercado de uma forma que fascina o cliente e cria confiança.", pesos: { "Private Banking": 3, "AAI": 3, "RI": 3 } }, { texto: "Lógica dedutiva e matemática: eu mostro na tela como a equação defende o meu ponto. Sem dados, sem conversa.", pesos: { "Quant Finance": 3, "Equity Research": 2, "Investment Banking": 2 } }, { texto: "Prudência e regulamentação: eu destaco as diretrizes e regras mostrando por que não podemos fazer a loucura que a área comercial quer.", pesos: { "Compliance": 3, "Risk Management": 3, "Controladoria": 3 } } ] },
  { pergunta: "20. Imagine o mercado financeiro como um grande transatlântico. Qual a sua função lá dentro?", opcoes: [ { texto: "Sou quem vende os ingressos e acomoda os passageiros bilionários na primeira classe.", pesos: { "Private Banking": 3, "AAI": 3, "Wealth Management": 3 } }, { texto: "Sou o engenheiro na sala das máquinas, coberto de óleo (ou código), garantindo que o motor funcione e não exploda.", pesos: { "Risk Management": 3, "Quant Finance": 3, "Controladoria": 2, "FP&A": 2 } }, { texto: "Sou o comandante apontando para o horizonte. Observando as correntes e furacões macroeconômicos para desviar a rota.", pesos: { "Asset Management": 3, "Hedge Funds": 3, "Tesouraria": 2 } }, { texto: "Sou o dono da companhia. Quero comprar mais navios velhos, reformá-los e vender a frota com lucro.", pesos: { "Private Equity": 3, "Investment Banking": 2, "FIIs": 2 } } ] }
];

export default function QuizVocacionalPage() {
  const router = useRouter();

  const [started, setStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [result, setResult] = useState(null);
  const [feedback, setFeedback] = useState(null);
  
  const [scores, setScores] = useState(() => {
    const initial = {};
    Object.keys(AREAS_MERCADO).forEach(area => { initial[area] = 0; });
    return initial;
  });

  const handleAnswer = (pontosDaOpcao) => {
    const newScores = { ...scores };
    Object.keys(pontosDaOpcao).forEach((area) => {
      if (newScores[area] !== undefined) {
        newScores[area] += pontosDaOpcao[area];
      }
    });

    setScores(newScores);

    if (currentStep < QUIZ_QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      calculateResult(newScores);
    }
  };

  // Calcula o resultado e SALVA NO SUPABASE
  const calculateResult = async (finalScores) => {
    let winningArea = "";
    let maxScore = -Infinity;

    for (const [area, score] of Object.entries(finalScores)) {
      if (score > maxScore) {
        maxScore = score;
        winningArea = area;
      }
    }

    setResult(winningArea);

    // Salva a área vencedora no banco de dados
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').update({ quiz_resultado: AREAS_MERCADO[winningArea].nome }).eq('id', user.id);
    }
  };

  // Salva a opinião (concorda/discorda) NO SUPABASE
  const handleFeedback = async (valor) => {
    setFeedback(valor);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').update({ quiz_feedback: valor }).eq('id', user.id);
    }
  };

  const resetQuiz = () => {
    setStarted(false);
    setCurrentStep(0);
    setResult(null);
    setFeedback(null);
    const initial = {};
    Object.keys(AREAS_MERCADO).forEach(area => { initial[area] = 0; });
    setScores(initial);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--black)", display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 20px" }}>
      
      {/* HEADER FIXO */}
      <div style={{ width: "100%", maxWidth: "800px", marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <button onClick={() => router.push('/dashboard')} className="topbar-btn mb-16" style={{ fontSize: '13px', padding: '8px 16px' }}>← Voltar ao Dashboard</button>
          <h1 className="page-title" style={{ fontSize: "28px" }}>Quiz Vocacional do Mercado</h1>
          <p className="page-subtitle" style={{ fontSize: "14px" }}>Descubra o seu verdadeiro fit entre as 22 áreas financeiras.</p>
        </div>
      </div>

      <div style={{ width: "100%", maxWidth: "800px" }}>
        
        {/* TELA 1: INTRODUÇÃO */}
        {!started && !result && (
          <div className="card animate-fade-in" style={{ padding: "40px", background: 'rgba(28, 28, 28, 0.8)', backdropFilter: 'blur(12px)', borderTop: '4px solid var(--gold)', textAlign: 'center' }}>
            <div style={{ fontSize: "64px", marginBottom: "20px" }}>🧭</div>
            <h2 className="form-section-title text-gold mb-16" style={{ fontSize: "24px" }}>Descubra sua Trilha Financeira</h2>
            <p className="text-secondary mx-auto" style={{ fontSize: "16px", lineHeight: "1.8", maxWidth: "600px", marginBottom: "32px" }}>
              O Mercado Financeiro é gigante. Existem áreas para quem ama adrenalina, áreas para quem prefere planilhas em silêncio, e carreiras onde o relacionamento humano vale mais que matemática.
              <br/><br/>
              Responda estas <strong>20 perguntas analíticas</strong> baseadas no Manual Oficial da Liga com sinceridade. O algoritmo cruza sua tolerância ao risco, hard skills e work-life balance para indicar o seu destino ideal.
            </p>
            <button onClick={() => setStarted(true)} className="topbar-btn primary" style={{ padding: '16px 32px', fontSize: '16px', fontWeight: 'bold' }}>
              Iniciar o Teste Vocacional
            </button>
          </div>
        )}

        {/* TELA 2: PERGUNTAS */}
        {started && !result && (
          <div className="animate-fade-in">
            <div style={{ marginBottom: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "13px", color: "var(--text-secondary)" }}>
                <span>Pergunta {currentStep + 1} de {QUIZ_QUESTIONS.length}</span>
                <span>{Math.round(((currentStep + 1) / QUIZ_QUESTIONS.length) * 100)}%</span>
              </div>
              <div style={{ width: "100%", height: "6px", background: "var(--surface3)", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${((currentStep + 1) / QUIZ_QUESTIONS.length) * 100}%`, background: "var(--gold)", transition: "width 0.3s ease" }}></div>
              </div>
            </div>

            <div className="card" style={{ padding: "40px", background: 'rgba(28, 28, 28, 0.8)' }}>
              <h3 style={{ fontSize: "20px", color: "var(--text-primary)", marginBottom: "32px", lineHeight: "1.5" }}>
                {QUIZ_QUESTIONS[currentStep].pergunta}
              </h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {QUIZ_QUESTIONS[currentStep].opcoes.map((opcao, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => handleAnswer(opcao.pesos)}
                    style={{ 
                      textAlign: "left", padding: "20px", background: "var(--surface2)", border: "1px solid var(--border)", 
                      borderRadius: "12px", color: "var(--text-secondary)", fontSize: "15px", lineHeight: "1.6",
                      cursor: "pointer", transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--gold)"; e.currentTarget.style.color = "var(--white)"; e.currentTarget.style.background = "rgba(201,168,76,0.05)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.background = "var(--surface2)"; }}
                  >
                    {opcao.texto}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TELA 3: RESULTADO DINÂMICO E FEEDBACK */}
        {result && (
          <div className="card animate-fade-in" style={{ padding: "0", background: 'rgba(28, 28, 28, 0.8)', overflow: "hidden" }}>
            
            <div style={{ background: "linear-gradient(135deg, rgba(201,168,76,0.2) 0%, rgba(20,20,20,0) 100%)", padding: "40px", textAlign: "center", borderBottom: "1px solid var(--border)" }}>
              <div style={{ fontSize: "14px", textTransform: "uppercase", color: "var(--gold)", letterSpacing: "0.1em", marginBottom: "16px", fontWeight: "bold" }}>Seu Perfil Ideal É:</div>
              <h2 style={{ fontSize: "36px", color: "var(--white)", marginBottom: "8px" }}>
                {AREAS_MERCADO[result].nome}
              </h2>
            </div>

            <div style={{ padding: "40px", paddingBottom: "24px" }}>
              <div className="mb-32">
                <h3 style={{ fontSize: "18px", color: "var(--white)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>⚙️</span> O que você fará no dia a dia?
                </h3>
                <p style={{ fontSize: "15px", color: "var(--text-secondary)", lineHeight: "1.7" }}>
                  {AREAS_MERCADO[result].funcionamento}
                </p>
              </div>

              <div className="mb-32">
                <h3 style={{ fontSize: "18px", color: "var(--gold-light)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>🎯</span> Por que essa área deu Match?
                </h3>
                <p style={{ fontSize: "15px", color: "var(--text-secondary)", lineHeight: "1.7" }}>
                  {AREAS_MERCADO[result].justificativa}
                </p>
              </div>

              <div className="highlight-box" style={{ borderLeftColor: "var(--info)" }}>
                <h3 style={{ fontSize: "16px", color: "var(--white)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>📚</span> Trilha Prática (Como entrar)
                </h3>
                <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                  {AREAS_MERCADO[result].trilha}
                </p>
              </div>
            </div>

            {/* ZONA DE FEEDBACK */}
            <div style={{ padding: "0 40px 32px", borderBottom: "1px solid var(--border)", textAlign: "center" }}>
              <h4 style={{ fontSize: "16px", color: "var(--text-primary)", marginBottom: "16px" }}>Você concorda com esse resultado? Faz sentido para você?</h4>
              
              {feedback === null ? (
                <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
                  <button 
                    onClick={() => handleFeedback(true)} 
                    style={{ background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--success)", padding: "10px 24px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", transition: "all 0.2s" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "rgba(40, 167, 69, 0.1)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "var(--surface2)"}
                  >
                    👍 Sim, faz total sentido!
                  </button>
                  <button 
                    onClick={() => handleFeedback(false)} 
                    style={{ background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--danger)", padding: "10px 24px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", transition: "all 0.2s" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "rgba(220, 53, 69, 0.1)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "var(--surface2)"}
                  >
                    👎 Não concordo muito.
                  </button>
                </div>
              ) : (
                <div style={{ padding: "12px", background: "var(--surface2)", borderRadius: "8px", color: "var(--text-muted)", fontSize: "14px" }}>
                  {feedback 
                    ? "Obrigado! Seu feedback foi salvo no sistema. Use esse resultado como bússola no seu PDI." 
                    : "Entendido! O mercado é dinâmico e você pode se redescobrir. Seu mentor foi avisado dessa preferência para o 1:1."}
                </div>
              )}
            </div>

            <div style={{ padding: "24px 40px 40px", display: "flex", gap: "16px", justifyContent: "center" }}>
              <button onClick={() => router.push('/dashboard')} className="topbar-btn primary" style={{ padding: "12px 24px", fontSize: "14px" }}>
                Voltar ao Dashboard
              </button>
              <button onClick={resetQuiz} className="topbar-btn" style={{ padding: "12px 24px", fontSize: "14px" }}>
                Refazer o Teste
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}