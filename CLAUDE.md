@AGENTS.md

# LAMF5 — Sistema de Gestão de PDI

Portal interno da **Liga Acadêmica de Mercado Financeiro (LAMF5 / UFV)**.
Cada membro faz login, responde um questionário e um quiz vocacional, e acompanha
suas metas de desenvolvimento (PDI = Plano de Desenvolvimento Individual). A
Gestão de Pessoas e a Presidência têm um painel de administração.

> **Para quem nunca programou:** este arquivo é o "manual" que o Claude Code lê
> antes de mexer no site. Se você só quer atualizar alguma coisa, veja a seção
> **"Receitas"** mais abaixo — é só copiar o pedido em português. Guias passo a
> passo em português estão na pasta [`docs/`](docs/README.md).

---

## Stack

| Camada | Tecnologia | Observação |
|---|---|---|
| Framework | **Next.js 16.2.3** (App Router, Turbopack) | ⚠️ versão nova — ver `AGENTS.md` |
| UI | **React 19** | Componentes em `src/app/**/page.js` |
| Banco + Login + Storage | **Supabase** (PostgreSQL + Auth + Storage) | Projeto: `orcoymigfspunjsqxbtb` |
| Estilo | CSS global (`src/app/globals.css`) + estilos inline + Tailwind 4 | Ver "Dívidas técnicas" |
| Deploy | Vercel | Automático via `main` e previews de PR — ver `docs/deploy-vercel.md` |
| CI | GitHub Actions (`.github/workflows/ci.yml`) | Roda `lint` + `build` em todo PR |
| Linguagem | JavaScript (`.js`) | Sem TypeScript apesar do `jsconfig.json` |

---

## Como rodar localmente

```bash
npm install
npm run dev        # http://localhost:3000
```

Precisa de um arquivo **`.env.local`** na raiz (NÃO vai pro Git). Copie de
`.env.local.example` e preencha:

```
NEXT_PUBLIC_SUPABASE_URL=https://orcoymigfspunjsqxbtb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...   # "Publishable key" no painel Supabase
```

A "Publishable key" pode ser pública. **Nunca** use a "Secret key" (`sb_secret_...`)
neste projeto.

Outros comandos: `npm run build` (build de produção), `npm run lint`.

---

## Estrutura de pastas

```
src/
  lib/supabase.js            Cliente Supabase (único ponto de conexão)
  app/
    layout.js                Layout raiz + fontes + <title>
    globals.css              TODO o CSS do site (variáveis de cor no :root)
    page.js                  / .............. Tela de LOGIN
    cadastro/page.js         /cadastro ...... Criar conta (com whitelist de e-mails)
    dashboard/page.js        /dashboard ..... Painel do membro
    dashboard/metas/page.js  /dashboard/metas ...... Membro atualiza status das metas
    dashboard/meuperfil/page.js  /dashboard/meuperfil .. Editar nome/diretoria/senha
    questionario/page.js     /questionario .. Questionário oficial (respostas em JSON)
    quiz/page.js             /quiz .......... Quiz vocacional (22 áreas do mercado)
    administrador/page.js    /administrador . Painel admin (só GP/Presidência)
```

Todas as páginas são **client components** (`"use client"`) e falam direto com o
Supabase pelo navegador. Não há backend/rotas de API próprias.

---

## Modelo de dados (Supabase)

Reconstruído a partir do código — confirme no painel do Supabase antes de alterar.

### Auth
- Login por **e-mail + senha** (Supabase Auth).
- **Confirmação de e-mail está LIGADA** (o código trata "Email not confirmed").
- No cadastro, os dados vão como *metadata* (`options.data`): `nome_completo`,
  `diretoria`, `perfil`. Deve existir um **trigger no banco** que copia esse
  metadata para a tabela `profiles` quando o usuário é criado.

### Tabela `profiles` — 1 linha por usuário
| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | uuid (PK) | Igual ao `auth.users.id` |
| `nome_completo` | text | Nome do membro |
| `diretoria` | text | `Presidente`, `Vice Presidente`, `Projetos`, `Qualidade`, `Gestão de Pessoas`, `Comunicação` |
| `perfil` | text | Nível de acesso. Valores canônicos: `Membro`, `Presidência`, `Gestão de Pessoas`. Definido no cadastro pelo mapa `PERFIL_POR_DIRETORIA` (`cadastro/page.js`). Só `Presidência` e `Gestão de Pessoas` entram em `/administrador`. |
| `quiz_resultado` | text | Área vencedora do quiz vocacional |
| `quiz_feedback` | text | Feedback do membro sobre o resultado |

### Tabela `goals` — metas do PDI
| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | PK | |
| `member_id` | uuid → `profiles.id` | Dono da meta |
| `title` | text | Título |
| `description` | text | Descrição |
| `deadline` | date | Prazo |
| `status` | text | `Ainda não começou`, `Em andamento`, `Concluída` |
| `admin_attachment` | text | URL de anexo enviado pela gestão |
| `student_attachment` | text | URL/link entregue pelo membro |
| `started_at` | timestamptz | Carimbado automaticamente ao virar "Em andamento" |
| `completed_at` | timestamptz | Carimbado automaticamente ao virar "Concluída" |
| `created_at` | timestamptz | |

### Tabela `questionario_completo` — respostas do questionário
| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | PK | |
| `member_id` | uuid → `profiles.id` | **Único** (usado em `upsert onConflict`) |
| `respostas` | jsonb | Objeto com todas as respostas do formulário |

### Tabela `emails_autorizados` — quem pode criar conta
| Coluna | Tipo | Descrição |
|---|---|---|
| `email` | text (PK) | E-mail autorizado (sempre minúsculo) |
| `adicionado_por` | uuid → `auth.users.id` | Quem adicionou |
| `criado_em` | timestamptz | |

- RLS: só `perfil` `Gestão de Pessoas` / `Presidência` lê e edita (via função `public.is_admin()`).
- Função `public.email_autorizado(p_email text) → boolean`: usada pela tela de
  cadastro **antes do login** (`security definer`, liberada pro papel `anon`).
  Responde só sim/não, não expõe a lista.
- Gerenciada pela aba **"E-mails Autorizados"** em `/administrador`.
- Script de criação: `docs/sql/03b-emails-autorizados.sql` (rodar 1x no Supabase).

### Storage
- Bucket **`anexos`** (público) — anexos das metas. Usado via
  `supabase.storage.from('anexos')`.

---

## Regras de acesso

- Páginas de `/dashboard/*`, `/questionario` e `/quiz`: exigem sessão; sem login
  redireciona pra `/`.
- `/administrador`: só entra se `profile.perfil` for `"Gestão de Pessoas"` ou
  `"Presidência"`; senão redireciona pra `/dashboard`.
- **A segurança de verdade tem que estar nas RLS policies do Supabase**, não só
  no redirect do React. Ao criar tabela/coluna nova, revise as policies.

---

## Receitas (tarefas comuns)

Peça em português normal pro Claude. Exemplos:

### Adicionar ou remover um membro autorizado a se cadastrar
**Não mexe em código.** Entra em `/administrador` → aba **"E-mails Autorizados"**
→ adiciona/remove. É a tabela `emails_autorizados` no Supabase.

### Mudar os nomes das diretorias
Array `DIRETORIAS` em `src/app/cadastro/page.js`. Se mudar, cheque também os
lugares que comparam texto de diretoria/`perfil` (busque por `"Gestão de Pessoas"`,
`"Presidência"`, `"Presidente"` no projeto).

### Trocar textos, títulos ou botões de uma tela
Estão dentro do JSX da `page.js` correspondente. Ex: textos da tela de login em
`src/app/page.js`; título da aba do navegador em `src/app/layout.js` (`metadata`).

### Mudar cores do site
Variáveis no `:root` de `src/app/globals.css` (`--gold`, `--black`, etc.).

### Adicionar/editar perguntas do questionário
`src/app/questionario/page.js` (arquivo grande). As respostas são salvas como
JSON em `questionario_completo.respostas`, então adicionar campo novo não quebra
o banco — mas o painel admin (`/administrador`) precisa saber exibir o campo novo.

### Mexer no quiz vocacional (áreas, perguntas, pesos)
`src/app/quiz/page.js` — objeto `AREAS_MERCADO` e a lista de perguntas.

---

## Fluxo de alteração (para não quebrar o site no ar)

1. `git switch -c minha-mudanca` (branch nova).
2. Fazer a mudança + `npm run dev` pra conferir localmente.
3. `git commit` + `git push`.
4. Abrir **Pull Request** no GitHub.
5. Conferir o **link de preview** que a Vercel gera no PR.
6. Deu certo → dar merge → site atualiza sozinho.

Nunca commitar direto na `main` sem conferir o preview.

---

## Dívidas técnicas / problemas conhecidos

- **Estilos inline gigantes** em quase todas as páginas — dificulta manutenção;
  migrar aos poucos pro `globals.css`/Tailwind.
- **Sem testes automatizados.**
