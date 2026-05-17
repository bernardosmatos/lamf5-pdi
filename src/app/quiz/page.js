"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase"; 

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
  "FP&A": { nome: "FP&A (Financial Planning & Analysis)", funcionamento: "Você é o radar do CFO dentro de uma grande empresa. Planeja o orçamento do ano, analisa os custos mês a mês e modela no Excel o que vai acontecer com o caixa da empresa se os juros subirem ou se uma nova fábrica for aberta.", justificativa: "Você tem perfil corporativo forte, adora planilhas e gosta de projetar o futuro financeiro de uma única empresa.", trilha: "Excel e Power BI em nível especialista. Estude contabilidade gerencial profunda, modelagem DRE/DFC e projeção de cenários." },
  "Controladoria": { nome: "Controladoria", funcionamento: "Você é o guardião dos números da empresa. Garante que cada centavo que entra e sai está registrado de acordo com as leis contábeis. Elabora as demonstrações financeiras oficiais que vão para o mercado.", justificativa: "Disciplina, exatidão e processos. Você garante que a contabilidade reflita perfeitamente a realidade e audita as finanças corporativas.", trilha: "Graduação forte em Ciências Contábeis ou Economia. CRC (se contador). Conhecimento profundo em IFRS e CPCs." },
  "RI": { nome: "Relações com Investidores (RI)", funcionamento: "Você é a voz oficial da empresa listada na bolsa. Prepara os materiais de divulgação de resultados, faz reuniões com analistas e acionistas e explica a estratégia da diretoria para manter a ação valorizada no mercado.", justificativa: "Você une comunicação impecável com conhecimento técnico. Gosta da ideia de ser a 'voz' da empresa perante o mercado e os acionistas.", trilha: "Domínio de contabilidade, Valuation e oratória. Você precisa saber explicar o porquê dos números da empresa subirem ou caírem." },
  "Risk Management": { nome: "Risk Management (Risco)", funcionamento: "Você é quem dá a permissão ou o bloqueio final. O trabalho é calcular matematicamente o risco que a instituição está correndo nas mesas de operação (Risco de Mercado, Risco de Liquidez) e limitar as perdas usando testes de estresse.", justificativa: "Você é o 'freio de emergência'. Tem pensamento crítico voltado a antecipar perdas, mitigar problemas de liquidez e proteger a instituição.", trilha: "FRM (Financial Risk Manager) ou CQF. Matemática fortíssima, estatística, VaR, Basileia e programação básica (Python/R)." },
  "Compliance": { nome: "Compliance & PLD", funcionamento: "Sua missão é evitar fraudes e escândalos. Você monitora as atividades dos funcionários e dos clientes para garantir que o banco obedeça à risca as regras da CVM/BCB e foca na Prevenção à Lavagem de Dinheiro (PLD).", justificativa: "Sua ética é inegociável e você gosta de regulamentos. Seu foco é garantir que o banco siga as leis e prevenir lavagem de dinheiro.", trilha: "Conhecimento jurídico e regulatório (Instruções CVM, normas BCB). Cursos específicos de PLD." },
  "Auditoria": { nome: "Auditoria (Big 4 / Interna)", funcionamento: "Como detetive corporativo, você visita outras empresas para revisar seus livros contábeis. Seu objetivo é atestar que as demonstrações financeiras publicadas são verdadeiras e não têm erros ou fraudes materiais.", justificativa: "Você tem olho clínico para erros, paciência para varrer relatórios gigantes e gosta do rigor técnico de validar regras.", trilha: "Ciências Contábeis. Inglês fluente. Preparação mental para trabalhar muito garantindo a conformidade dos números." },
  "Quant Finance": { nome: "Quantitative Finance (Quant)", funcionamento: "Você cria robôs e algoritmos que investem sozinhos. O trabalho é pesquisar padrões ocultos em dados imensos (Machine Learning) e traduzir teses financeiras complexas para linhas de código C++ ou Python para execução automática.", justificativa: "Você é focado em códigos, robôs e matemática avançada. Confia mais em algoritmos de alta frequência do que em narrativas humanas.", trilha: "Mestrado/Doutorado em Física, Matemática ou Computação é comum. Domínio absoluto de Python, C++, cálculo estocástico e Machine Learning." },
  "Fintech": { nome: "Fintech / Produtos Financeiros", funcionamento: "Você atua como Product Manager (PM) ou estrategista em bancos digitais. O foco é entender o comportamento dos usuários, desenhar novos cartões, contas e empréstimos e guiar as equipes de TI para programar essas soluções.", justificativa: "Você é ágil, gosta de tecnologia e quer 'desbancarizar' o sistema tradicional criando produtos financeiros acessíveis.", trilha: "Metodologias Ágeis (Scrum), Product Management (PM), noções de UX/UI e entendimento do Open Finance e Drex." },
  "Cripto": { nome: "Criptoativos & Web3", funcionamento: "Você estuda e investe na descentralização. Analisa o código de contratos inteligentes, entende a tokenomics (economia dos tokens) e opera ativos altamente voláteis que funcionam 24/7 sem fronteiras.", justificativa: "Você abraça a disrupção total, gosta de mercados desregulamentados e não tem medo de volatilidade extrema.", trilha: "Estude Blockchain, Ethereum, DeFi, Smart Contracts e Tokenomics. Exige estudo autodidata intenso em inglês." },
  "Tesouraria": { nome: "Tesouraria (ALM / Corporativa)", funcionamento: "Você é o coração da liquidez de uma empresa ou banco. Você investe o caixa que está sobrando, usa derivativos para proteger a empresa de altas do dólar ou dos juros (hedge) e capta dinheiro quando a empresa precisa operar.", justificativa: "Você gosta de proteger o caixa da empresa, fazendo hedge cambial e garantindo liquidez de curto prazo.", trilha: "Excel avançado, matemática financeira e conhecimento profundo em derivativos (Swaps, NDFs) para proteção." }
};

// ============================================================================
// 2. BANCO DE PERGUNTAS VETORIAIS (SUBJETIVAS E PSICOLÓGICAS)
// ============================================================================
const QUIZ_QUESTIONS = [
  {
    pergunta: "1. Você está em uma festa onde não conhece quase ninguém. Qual é o seu comportamento padrão?",
    opcoes: [
      { texto: "Vou direto no anfitrião, pego uma bebida e em 10 minutos já estou trocando contatos com os grupos mais animados da festa.", pesos: { "AAI": 3, "Private Banking": 3, "Wealth Management": 2, "Investment Banking": 2 } },
      { texto: "Encontro uma ou duas pessoas interessantes no canto e passo a noite toda focado em uma conversa profunda sobre um assunto específico.", pesos: { "Equity Research": 3, "Private Equity": 2, "Venture Capital": 2, "Asset Management": 1 } },
      { texto: "Fico mais recuado, observando a dinâmica do lugar, como o evento foi organizado e o padrão de como as pessoas interagem.", pesos: { "Risk Management": 3, "Quant Finance": 2, "Auditoria": 2, "Controladoria": 2 } },
      { texto: "Eu provavelmente sou o anfitrião ou estou ajudando a organizar as bebidas e a logística para garantir que tudo saia perfeito para os outros.", pesos: { "FP&A": 3, "Banking PJ": 2, "FIIs": 1, "Compliance": 1 } }
    ]
  },
  {
    pergunta: "2. Você ganha um prêmio generoso na empresa, mas pode escolher COMO vai receber. Qual opção você pega?",
    opcoes: [
      { texto: "Um valor em dinheiro garantido e fixo agora na minha conta. Sem pegadinhas, sem surpresas.", pesos: { "Controladoria": 3, "Auditoria": 3, "Compliance": 3, "FP&A": 2, "Sales & Trading": -2 } },
      { texto: "Um valor base agora, mas com a chance de dobrar o prêmio daqui a um ano se eu bater metas muito agressivas.", pesos: { "Investment Banking": 3, "Private Equity": 3, "Asset Management": 2 } },
      { texto: "Não quero nada garantido. Quero girar uma roleta onde posso sair sem nada ou com 10 vezes o valor inicial.", pesos: { "AAI": 3, "Private Banking": 2, "Sales & Trading": 3, "Hedge Funds": 2, "Controladoria": -3 } },
      { texto: "Quero 1% da máquina que gera os prêmios. Assim, ganho para sempre se o negócio crescer e inovar no futuro.", pesos: { "Venture Capital": 3, "Fintech": 3, "Cripto": 3 } }
    ]
  },
  {
    pergunta: "3. Qual estilo de jogo mais prende a sua atenção?",
    opcoes: [
      { texto: "Poker. Ler a mente do oponente, calcular o risco instintivo na hora e blefar é muito mais importante que as cartas que eu tenho na mão.", pesos: { "Sales & Trading": 3, "Hedge Funds": 3, "AAI": 2 } },
      { texto: "Xadrez ou Estratégia. Você vence antecipando cenários e calculando metodicamente as próximas 10 jogadas do adversário.", pesos: { "Quant Finance": 3, "Asset Management": 2, "Risk Management": 2 } },
      { texto: "Banco Imobiliário (Monopoly) ou jogos de computador focados em construir cidades, fábricas e gerir recursos a longo prazo.", pesos: { "Private Equity": 3, "FIIs": 3, "FP&A": 2, "Banking PJ": 2 } },
      { texto: "Jogos de Escape Room (físicos ou virtuais). A equipe inteira precisa se comunicar perfeitamente para decifrar a regra oculta e sair do lugar.", pesos: { "Auditoria": 3, "Compliance": 2, "RI": 2, "Equity Research": 1 } }
    ]
  },
  {
    pergunta: "4. Você compra um móvel complexo do zero para montar na sua sala. Como você age?",
    opcoes: [
      { texto: "Abro o manual, separo todos os parafusos por tamanho e sigo exatamente o passo a passo até o fim. Errar não é uma opção.", pesos: { "Compliance": 3, "Auditoria": 3, "Controladoria": 3 } },
      { texto: "Dou uma olhada rápida no desenho da caixa, entendo a lógica de como ele fica em pé e começo a montar do meu jeito.", pesos: { "Wealth Management": 3, "Private Banking": 2, "Asset Management": 1 } },
      { texto: "Ignoro o manual. Pego a furadeira e, se faltar peça ou não encaixar perfeitamente, eu uso minha intuição e resolvo o problema improvisando.", pesos: { "Hedge Funds": 3, "Sales & Trading": 2, "Tesouraria": 1 } },
      { texto: "Olho pro móvel e penso por que comprei isso de madeira, sendo que o design poderia ser otimizado ou impresso em 3D para ser mais eficiente.", pesos: { "Cripto": 3, "Fintech": 3, "Venture Capital": 2 } }
    ]
  },
  {
    pergunta: "5. Você está organizando uma viagem internacional com um grupo de amigos. Qual é o seu papel?",
    opcoes: [
      { texto: "Sou o concierge diplomata. Faço o meio-campo entre os interesses de todos, garanto que fiquem felizes e tenham suas vontades atendidas.", pesos: { "Private Banking": 3, "RI": 3, "Wealth Management": 2 } },
      { texto: "Sou o 'chato' do planejamento. Calculo os custos totais, divido as despesas ao centavo e garanto que ninguém estoure o orçamento da viagem.", pesos: { "FP&A": 3, "Controladoria": 3, "Auditoria": 2 } },
      { texto: "Faço o roteiro 'diferentão'. Busco os lugares mais exóticos, tecnológicos ou inovadores que os guias turísticos convencionais não mostram.", pesos: { "Venture Capital": 3, "Cripto": 2, "Fintech": 2 } },
      { texto: "Não planejo quase nada. Chego lá, alugo um carro e decido o que fazer na hora, lidando com os imprevistos da rota rapidamente e com adrenalina.", pesos: { "Sales & Trading": 3, "Hedge Funds": 2, "AAI": 1 } }
    ]
  },
  {
    pergunta: "6. A internet e a energia da sua casa caem misteriosamente bem no meio de um dia crítico de trabalho. O que você faz primeiro?",
    opcoes: [
      { texto: "Pego papel, caneta e começo a rascunhar o esqueleto mental da apresentação ou do modelo que estava fazendo para não perder tempo até a energia voltar.", pesos: { "Investment Banking": 3, "FP&A": 3, "Equity Research": 2 } },
      { texto: "Pego o carro, vou para um café ou padaria com internet e aproveito o ambiente para puxar papo com alguém ou ligar para meus contatos.", pesos: { "Private Banking": 3, "Venture Capital": 3, "AAI": 3, "Wealth Management": 2 } },
      { texto: "Vou até o quadro de luz, testo os disjuntores, desmonto o roteador e tento hackear, reiniciar ou consertar o problema eu mesmo com lógica pura.", pesos: { "Quant Finance": 3, "Risk Management": 2, "Fintech": 2 } },
      { texto: "Ligo imediatamente para a companhia elétrica exigindo um chamado técnico e leio o contrato de prestação de serviços para pedir o meu reembolso.", pesos: { "Compliance": 3, "Controladoria": 3, "Auditoria": 3 } }
    ]
  },
  {
    pergunta: "7. Quando você precisa tomar uma decisão pessoal muito difícil e com grande impacto no seu futuro, em que você mais confia?",
    opcoes: [
      { texto: "Faço uma lista exata de prós e contras, procuro dados reais e decido friamente com base no que for mais lógico e matematicamente correto.", pesos: { "Quant Finance": 3, "Equity Research": 3, "FP&A": 2, "Asset Management": 1 } },
      { texto: "Pergunto a mentores ou pessoas mais velhas que admiro profundamente, usando a sabedoria humana e a vivência deles como meu guia principal.", pesos: { "Wealth Management": 3, "Private Banking": 3, "Venture Capital": 1 } },
      { texto: "Confio no meu instinto do momento (o famoso 'feeling'). Tomo a decisão rápida, assumo as consequências e vou ajustando a rota no meio do caminho.", pesos: { "Sales & Trading": 3, "Hedge Funds": 3, "Cripto": 2, "AAI": 1 } },
      { texto: "Penso primeiro: 'Qual é o pior cenário possível?'. Se a minha análise disser que eu consigo sobreviver caso tudo dê muito errado, aí eu avanço.", pesos: { "Risk Management": 3, "Compliance": 3, "Auditoria": 2, "Tesouraria": 1 } }
    ]
  },
  {
    pergunta: "8. Como você lida com a ideia de trabalhar sob altíssima demanda e abrir mão do seu tempo livre?",
    opcoes: [
      { texto: "Estou totalmente disposto a sacrificar noites de sono, finais de semana e feriados se isso significar atingir o topo financeiro do mercado muito rápido.", pesos: { "Investment Banking": 3, "Private Equity": 3, "Hedge Funds": 2, "Controladoria": -3 } },
      { texto: "Quero ganhar muito dinheiro e amo o estresse do dia, mas exijo o direito de desconectar a mente assim que o 'sino bater' e o pregão fechar.", pesos: { "Sales & Trading": 3, "Asset Management": 2, "AAI": 2 } },
      { texto: "Prefiro trabalhar firme de segunda a sexta, em horário comercial estável. Dinheiro é ótimo, mas ter previsibilidade para jantar com a família é inegociável.", pesos: { "FP&A": 3, "Controladoria": 3, "Auditoria": 2, "Banking PJ": 2 } },
      { texto: "Prefiro flexibilidade absoluta. Não ligo de trabalhar de madrugada ou domingo, desde que eu não tenha 'bater ponto' num escritório e entregue o projeto.", pesos: { "Quant Finance": 3, "Fintech": 3, "Cripto": 3, "Venture Capital": 2 } }
    ]
  },
  {
    pergunta: "9. Imagine que você precisa aprender uma habilidade ou idioma completamente do zero absoluto. Como você prefere estudar?",
    opcoes: [
      { texto: "Tentativa e erro (Modo Hacker). Eu já abro a ferramenta, começo a errar e vou pesquisando no YouTube/ChatGPT apenas as peças que preciso na hora.", pesos: { "Fintech": 3, "Cripto": 3, "Quant Finance": 2, "Sales & Trading": 2 } },
      { texto: "Modo Pesquisador Profundo. Compro os 3 livros mais difíceis sobre o assunto, leio do início ao fim e faço anotações metodológicas.", pesos: { "Equity Research": 3, "Asset Management": 3, "Controladoria": 2 } },
      { texto: "Modo Tradicional Formal. Busco o curso formal da instituição reguladora, busco os certificados oficiais e sigo a grade escolar à risca.", pesos: { "Auditoria": 3, "Compliance": 3, "Risk Management": 2 } },
      { texto: "Modo Mentoria Ativa. Procuro um especialista fascinante no assunto e ofereço um almoço ou favor para ele me ensinar na prática conversando.", pesos: { "AAI": 3, "Private Banking": 3, "Venture Capital": 2, "Banking PJ": 1 } }
    ]
  },
  {
    pergunta: "10. Se você tivesse que escolher um estilo de guarda-roupa ou ambiente corporativo (Dress Code) para toda a vida, qual seria?",
    opcoes: [
      { texto: "Um galpão de startup ou home-office. Camiseta confortável, moletons, horários livres. O que importa é a minha inteligência, não a minha roupa.", pesos: { "Fintech": 3, "Cripto": 3, "Venture Capital": 3, "Quant Finance": 3, "Private Banking": -2 } },
      { texto: "Avenida Faria Lima raiz. Terno de alfaiataria, salas de vidro espelhado com vista pra cidade e ambiente de alta pressão e performance agressiva.", pesos: { "Investment Banking": 3, "Private Equity": 3, "Asset Management": 2 } },
      { texto: "Ambientes de altíssimo luxo e discrição total. Obras de arte minimalistas, sofás de couro e roupas elegantíssimas, mas sem logomarcas gritantes.", pesos: { "Wealth Management": 3, "Private Banking": 3, "FIIs": 1 } },
      { texto: "Roupas práticas ou ambiente interno (chão de fábrica). Gosto da dinâmica da economia real, de colocar a mão na massa onde o lucro real acontece.", pesos: { "FP&A": 3, "Controladoria": 3, "Banking PJ": 2 } }
    ]
  },
  {
    pergunta: "11. Em termos de temperamento profissional, qual dessas metáforas descreve melhor você?",
    opcoes: [
      { texto: "Um cirurgião de emergência: tem sangue frio absurdo, mãos rápidas, trabalha com vida ou morte em tempo real e não hesita nunca.", pesos: { "Sales & Trading": 3, "Hedge Funds": 2, "Tesouraria": 1 } },
      { texto: "Um engenheiro de foguetes da NASA: absolutamente tudo na sua cabeça é baseado em cálculo rigoroso, equações e total ausência de opiniões humanas.", pesos: { "Quant Finance": 3, "Risk Management": 3, "Fintech": 1 } },
      { texto: "O maestro de uma orquestra clássica: você não toca um instrumento específico sozinho, mas garante as regras e que todos entrem no tempo perfeitamente.", pesos: { "Controladoria": 3, "FP&A": 3, "Auditoria": 2 } },
      { texto: "Um concierge de hotel 5 estrelas: resolve os piores estresses e desejos impossíveis dos convidados com classe, carisma e um sorriso no rosto.", pesos: { "Private Banking": 3, "AAI": 3, "RI": 2, "Quant Finance": -2 } }
    ]
  },
  {
    pergunta: "12. Ao final da sua vida, se você pudesse deixar um único legado profissional, qual você escolheria?",
    opcoes: [
      { texto: "'Eu fui o visionário. Eu descobri e financiei as tecnologias que revolucionaram completamente a forma como a civilização vive hoje.'", pesos: { "Venture Capital": 3, "Fintech": 3, "Cripto": 2 } },
      { texto: "'Fui um dos maiores originadores de impérios. Comprei empresas destruídas, juntei as peças e as transformei nas maiores indústrias do país.'", pesos: { "Private Equity": 3, "Investment Banking": 3, "FIIs": 1 } },
      { texto: "'Eu fui o grande protetor. Passei ileso pelas maiores crises do milênio, protegendo perfeitamente minha instituição contra o colapso e as falhas.'", pesos: { "Risk Management": 3, "Compliance": 3, "Auditoria": 2 } },
      { texto: "'Eu fui a mente brilhante do juros compostos. Bati o mercado ao longo de 20 anos, gerando uma riqueza absurda para quem confiou no meu intelecto.'", pesos: { "Asset Management": 3, "Hedge Funds": 3, "Equity Research": 1 } }
    ]
  },
  {
    pergunta: "13. Você está dirigindo em uma rodovia deserta à noite, rumo a um compromisso, e o pneu fura. Qual é a sua atitude mental?",
    opcoes: [
      { texto: "Saio do carro, troco o pneu na velocidade da luz e improviso. Xingo um pouco, mas já estou acelerando de novo a 120km/h em 5 minutos.", pesos: { "Hedge Funds": 3, "Sales & Trading": 3, "Cripto": 2, "Controladoria": -2 } },
      { texto: "Fico muito frustrado por não ter feito a revisão preventiva. Odeio o caos não planejado. Ligo o pisca, chamo o seguro imediatamente e calculo o atraso.", pesos: { "FP&A": 3, "Controladoria": 3, "Auditoria": 2, "Risk Management": 2 } },
      { texto: "Mantenho a calma total. Pneus furados são um risco estatístico calculado de viajar de carro. Troco tranquilamente e sigo focado no objetivo final.", pesos: { "Private Equity": 3, "Asset Management": 3, "Equity Research": 2 } },
      { texto: "Aproveito o tempo parado para ligar ou mandar áudio para as pessoas que estão me esperando, explicando a narrativa da situação e mantendo todos calmos.", pesos: { "RI": 3, "Private Banking": 3, "AAI": 2 } }
    ]
  },
  {
    pergunta: "14. Você precisa convencer o seu grupo teimoso de amigos a não ir no restaurante de sempre e testar um lugar completamente novo. Como você faz isso?",
    opcoes: [
      { texto: "Conto uma história incrível sobre o chef premiado, descrevo a iluminação e o clima exclusivo, fazendo o lugar parecer uma experiência imperdível.", pesos: { "Private Banking": 3, "AAI": 3, "RI": 3, "Investment Banking": 1 } },
      { texto: "Mostro as avaliações no Google, abro o cardápio, aponto a faixa de preço exata e provo com lógica que o lugar novo tem um custo-benefício superior.", pesos: { "Quant Finance": 3, "Equity Research": 2, "FP&A": 2 } },
      { texto: "Lembro a eles que já fomos no lugar antigo três vezes seguidas e uso nosso combinado passado de que hoje era o meu direito por lei de escolher.", pesos: { "Compliance": 3, "Risk Management": 3, "Controladoria": 3 } },
      { texto: "Digo para esquecerem os dois. Compro ingredientes inusitados na hora e os levo pra minha casa para cozinhar algo que ninguém nunca testou antes.", pesos: { "Venture Capital": 3, "Fintech": 3, "Cripto": 3 } }
    ]
  },
  {
    pergunta: "15. É sexta-feira à noite e você está exausto, mas está sorrindo com um sentimento extremo de dever cumprido. O que causou essa felicidade?",
    opcoes: [
      { texto: "Concluí uma negociação gigantesca que vinha arrastando há meses. Movi montanhas de esforço e assinei algo que vai sair no jornal de segunda.", pesos: { "Investment Banking": 3, "Private Equity": 3, "Banking PJ": 2 } },
      { texto: "Achei um atalho na minha rotina, uma lógica de operação ou um algoritmo que rodou perfeitamente sozinho enquanto os outros se matavam trabalhando.", pesos: { "Hedge Funds": 3, "Asset Management": 3, "Quant Finance": 2 } },
      { texto: "Conheci pessoas fantásticas nessa semana, almocei em lugares excelentes e fechei parceiros incríveis simplesmente porque eles gostaram de mim.", pesos: { "AAI": 3, "Private Banking": 3, "Wealth Management": 3 } },
      { texto: "Fechei o computador sabendo que não deixei um único erro ou ponta solta para trás. Tudo está perfeitamente limpo, organizado e dentro das regras.", pesos: { "Risk Management": 3, "Compliance": 3, "Controladoria": 3 } }
    ]
  },
  {
    pergunta: "16. Ao consumir conteúdo livre na internet (YouTube, Podcasts, Twitter), o que instintivamente prende mais a sua atenção?",
    opcoes: [
      { texto: "Podcasts dinâmicos sobre como melhorar vendas, hacks mentais de persuasão e as histórias emocionantes de como bilionários ficaram ricos.", pesos: { "AAI": 3, "Investment Banking": 3, "Private Banking": 2 } },
      { texto: "Vídeos profundos e documentais de 2 horas destrinchando o balanço de uma empresa que quebrou ou os bastidores técnicos de uma fraude bilionária.", pesos: { "Equity Research": 3, "Quant Finance": 3, "Private Equity": 2 } },
      { texto: "Análises de geopolítica global e como uma guerra distante ou uma fala de um político altera imediatamente o preço do petróleo nos próximos minutos.", pesos: { "Asset Management": 3, "Hedge Funds": 3, "Tesouraria": 2 } },
      { texto: "Tendências futuristas radicais, inteligência artificial generativa, biohacking e visões de como a sociedade e as moedas funcionarão no ano de 2050.", pesos: { "Venture Capital": 3, "Cripto": 3, "Fintech": 3 } }
    ]
  },
  {
    pergunta: "17. Um grupo de colegas quer fazer pular de Bungee Jump ou voar de asa-delta no final de semana. Qual o seu primeiro pensamento?",
    opcoes: [
      { texto: "'Tô dentro na hora! Quanto maior a altura e a sensação de queda-livre, melhor e mais eufórica será a experiência.'", pesos: { "Hedge Funds": 3, "Sales & Trading": 3, "Cripto": 2, "Venture Capital": 2 } },
      { texto: "'Até vou, mas primeiro preciso olhar quem é a agência, o histórico do instrutor e checar as avaliações no Reclame Aqui para ver se compensa.'", pesos: { "Asset Management": 3, "Equity Research": 3, "Investment Banking": 2 } },
      { texto: "'Nem pensar. Qual o sentido lógico em colocar minha própria vida voluntariamente em uma situação com chance de morte grave? Tô fora.'", pesos: { "Risk Management": 3, "Tesouraria": 3, "Auditoria": 2 } },
      { texto: "'Se todos as pessoas interessantes do meu ciclo forem e a gente for tirar boas fotos e gerar conexões legais na viagem toda, eu topo o salto.'", pesos: { "AAI": 3, "Private Banking": 3, "Wealth Management": 3 } }
    ]
  },
  {
    pergunta: "18. Em um debate acalorado com seus amigos sobre um assunto em que vocês discordam totalmente, como você reage?",
    opcoes: [
      { texto: "Mudo o tom de voz, uso meu carisma, leio as emoções deles e construo uma retórica envolvente até fazê-los concordarem sorrindo comigo.", pesos: { "Private Banking": 3, "AAI": 3, "RI": 3, "Investment Banking": 1 } },
      { texto: "Pego meu celular, abro uma fonte confiável de dados ou estatísticas na mesa e mostro que eu estou matematicamente certo. Fim de papo.", pesos: { "Quant Finance": 3, "Equity Research": 2, "FP&A": 2 } },
      { texto: "Não me irrito. Eu uso as próprias premissas que eles defenderam antes para provar as contradições deles, ganhando o debate de forma estruturada.", pesos: { "Compliance": 3, "Risk Management": 3, "Controladoria": 3 } },
      { texto: "Debater cansa. Eu me afasto mentalmente da conversa boba e começo a pensar em como aquele conflito pode gerar uma oportunidade de apostar contra algo.", pesos: { "Sales & Trading": 3, "Hedge Funds": 3, "Asset Management": 1 } }
    ]
  },
  {
    pergunta: "19. Se fosse estritamente necessário vender rifas ou cupons para uma causa social da faculdade, como você se sairia?",
    opcoes: [
      { texto: "Seria o melhor. Abordo estranhos na rua, ligo pra todo mundo, não tenho vergonha nenhuma de tomar 'não' e fecho as vendas rápido.", pesos: { "AAI": 3, "Banking PJ": 3, "Private Banking": 2, "Sales & Trading": 1 } },
      { texto: "Eu não falaria com estranhos, mas faria uma apresentação impecável para um ou dois grandes empresários que conheço para comprarem o lote todo de uma vez.", pesos: { "RI": 3, "Investment Banking": 2, "Asset Management": 2 } },
      { texto: "Odeio a ideia de abordar as pessoas para vender. Eu preferiria organizar a planilha de controle de quem pagou, de quem comprou e fazer a auditoria do cofre.", pesos: { "FP&A": 3, "Quant Finance": 3, "Risk Management": 3, "Controladoria": 3 } },
      { texto: "Criaria uma página na internet ou um robô de disparo de mensagens usando IA para fazer com que as vendas acontecessem sozinhas sem eu falar com ninguém.", pesos: { "Fintech": 3, "Venture Capital": 3, "Cripto": 2 } }
    ]
  },
  {
    pergunta: "20. Imagine que a economia do mundo inteiro é como um enorme oceano, cheio de correntes e tempestades invisíveis. Qual embarcação você escolheria capitanear?",
    opcoes: [
      { texto: "Um Iate de Luxo impecável, onde convido as famílias mais ricas do mundo a entrarem, oferecendo serviços e proteção exclusivas durante a tempestade.", pesos: { "Private Banking": 3, "AAI": 3, "Wealth Management": 3 } },
      { texto: "Eu não quero capitanear. Quero ser o engenheiro-chefe trancado na sala de máquinas embaixo d'água, garantindo que o radar calcule os perigos e o motor não exploda.", pesos: { "Risk Management": 3, "Quant Finance": 3, "Controladoria": 2, "FP&A": 2 } },
      { texto: "Um Submarino Nuclear rápido e discreto. Eu analiso e aproveito a direção oculta das correntes macroeconômicas que a superfície não consegue ver.", pesos: { "Asset Management": 3, "Hedge Funds": 3, "Tesouraria": 2 } },
      { texto: "Eu não opero os barcos. Eu sou o cara no porto que comprou navios velhos na baixa, reformou e agora está vendendo a frota inteira no pico do preço do aço.", pesos: { "Private Equity": 3, "Investment Banking": 2, "FIIs": 2 } }
    ]
  }
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

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').update({ quiz_resultado: AREAS_MERCADO[winningArea].nome }).eq('id', user.id);
    }
  };

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
      
      <div style={{ width: "100%", maxWidth: "800px", marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <button onClick={() => router.push('/dashboard')} className="topbar-btn mb-16" style={{ fontSize: '13px', padding: '8px 16px' }}>← Voltar ao Dashboard</button>
          <h1 className="page-title" style={{ fontSize: "28px" }}>Quiz Vocacional do Mercado</h1>
          <p className="page-subtitle" style={{ fontSize: "14px" }}>Descubra o seu verdadeiro fit entre as 22 áreas financeiras.</p>
        </div>
      </div>

      <div style={{ width: "100%", maxWidth: "800px" }}>
        
        {!started && !result && (
          <div className="card animate-fade-in" style={{ padding: "40px", background: 'rgba(28, 28, 28, 0.8)', backdropFilter: 'blur(12px)', borderTop: '4px solid var(--gold)', textAlign: 'center' }}>
            <div style={{ fontSize: "64px", marginBottom: "20px" }}>🧭</div>
            <h2 className="form-section-title text-gold mb-16" style={{ fontSize: "24px" }}>Descubra sua Trilha Financeira</h2>
            <p className="text-secondary mx-auto" style={{ fontSize: "16px", lineHeight: "1.8", maxWidth: "600px", marginBottom: "32px" }}>
              O Mercado Financeiro é gigante. Existem áreas para quem ama adrenalina, áreas para quem prefere planilhas em silêncio, e carreiras onde o relacionamento humano vale mais que matemática.
              <br/><br/>
              Responda estas <strong>20 perguntas comportamentais</strong> com pura intuição (não tente adivinhar o resultado). O nosso algoritmo de <i>People Analytics</i> cruzará sua reação sob estresse, visão de risco e hábitos para revelar seu destino ideal.
            </p>
            <button onClick={() => setStarted(true)} className="topbar-btn primary" style={{ padding: '16px 32px', fontSize: '16px', fontWeight: 'bold' }}>
              Iniciar o Teste Vocacional
            </button>
          </div>
        )}

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
                  <span>🎯</span> Por que essa área deu Match com você?
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
              <h4 style={{ fontSize: "16px", color: "var(--text-primary)", marginBottom: "16px" }}>Você concorda com esse resultado? Ele faz sentido para sua personalidade?</h4>
              
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
                    ? "Obrigado! Seu feedback de aprovação foi salvo no painel do administrador. Use esse insight como bússola no seu PDI." 
                    : "Entendido! O mercado é gigantesco e você pode se redescobrir. Seu mentor foi avisado dessa preferência para alinhar as rotas no seu 1:1."}
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