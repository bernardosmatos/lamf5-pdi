# Deploy automático na Vercel

Depois de configurado (uma vez só), o site publica sozinho:

- **push / merge na `main`** → atualiza o site **de produção** (o oficial).
- **qualquer Pull Request** → gera um **link de preview** (site de teste isolado),
  sem afetar o de produção.

---

## Configuração inicial (fazer uma vez)

### 1. Criar a conta / projeto na Vercel

1. Entrar em <https://vercel.com> e fazer login **com o GitHub** (botão "Continue with GitHub").
2. "Add New..." → "Project".
3. Importar o repositório `bernardosmatos/lamf5-pdi`.
   - Se não aparecer, clicar em "Adjust GitHub App Permissions" e dar acesso ao repo.
4. **Framework Preset:** Next.js (detectado automático). Não mexer em Build/Output.

### 2. Variáveis de ambiente (ANTES de clicar em Deploy)

Na tela de importação, abrir "Environment Variables" e adicionar as duas:

| Name | Value | Ambientes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://orcoymigfspunjsqxbtb.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | a *Publishable key* (`sb_publishable_...`) do painel Supabase | Production, Preview, Development |

Clicar em **Deploy**. Em ~1 min o site está no ar numa URL tipo
`https://lamf5-pdi.vercel.app`.

### 3. Ajustar o Supabase para aceitar o domínio novo

Painel Supabase → **Authentication → URL Configuration**:

- **Site URL:** `https://lamf5-pdi.vercel.app` (a URL de produção da Vercel).
- **Redirect URLs:** adicionar:
  - `https://lamf5-pdi.vercel.app/**`
  - `https://*-lamf5-pdi-*.vercel.app/**` (cobre os previews de PR)
  - `http://localhost:3000/**` (para continuar rodando local)

Sem isso, o link de confirmação de e-mail do cadastro aponta pro lugar errado.

### 4. Proteger a branch `main` (GitHub)

Repo no GitHub → **Settings → Branches → Add branch ruleset** (ou "Branch protection rule"):

- Branch: `main`
- ✅ Require a pull request before merging
- ✅ Require status checks to pass → selecionar **CI / build**
- (opcional) ✅ Require branches to be up to date before merging

Resultado: ninguém consegue commitar direto na `main`; tudo passa por PR + CI verde.

---

## Fluxo do dia a dia (depois de configurado)

1. `git switch -c minha-mudanca`
2. Fazer a mudança (com o Claude) + `npm run dev` pra conferir
3. `git commit` + `git push`
4. Abrir o Pull Request no GitHub
5. Esperar o **CI** ficar verde + abrir o **link de preview** da Vercel e conferir
6. "Merge" → o site de produção atualiza sozinho em ~1 min

## Se algo der errado no site de produção

Na Vercel → aba "Deployments" → achar um deploy antigo que funcionava →
"..." → **"Promote to Production"** (ou "Rollback"). Volta o site na hora,
sem mexer em código.
