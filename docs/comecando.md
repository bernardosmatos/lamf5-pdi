# Começando — configurar o projeto na sua máquina

Você faz isso **uma vez**. Depois é só abrir e usar.

Tempo estimado: 20–30 min.

---

## 1. Acessos que você precisa ter

Peça para a gestão anterior (ou para quem tem os acessos) te adicionar em:

| Serviço | Para quê | O que pedir |
|---|---|---|
| **GitHub** (repositório `lamf5-pdi`) | onde mora o código | ser adicionado como *collaborator* / membro |
| **Vercel** (projeto `lamf5`) | onde o site é publicado | ser adicionado ao time |
| **Supabase** (projeto `orcoymigfspunjsqxbtb`) | banco de dados e login | ser adicionado como membro da organização |

Se ninguém tem esses acessos, veja [repasse.md](repasse.md) — a seção de recuperação.

---

## 2. Instalar as ferramentas

Instale nesta ordem (Windows):

1. **Node.js** — https://nodejs.org (versão LTS). Confirme no terminal:
   ```bash
   node --version
   ```
2. **Git** — https://git-scm.com/download/win
   ```bash
   git --version
   ```
3. **Claude Code** — é o assistente que vai programar junto com você.
   Siga as instruções em https://docs.claude.com/claude-code
4. *(Opcional)* **VS Code** — https://code.visualstudio.com — para ver os arquivos.

---

## 3. Baixar o código

Abra o terminal (PowerShell) e rode:

```bash
cd C:\Users\SEU-USUARIO\dev        # ou outra pasta FORA do OneDrive
git clone https://github.com/bernardosmatos/lamf5-pdi.git
cd lamf5-pdi
```

> **Não** coloque o projeto dentro do OneDrive/Google Drive — a pasta
> `node_modules` tem milhares de arquivos e a sincronização trava tudo.

---

## 4. Configurar as chaves do Supabase

1. Copie o arquivo de exemplo:
   ```bash
   copy .env.local.example .env.local
   ```
2. Abra `.env.local` e preencha:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://orcoymigfspunjsqxbtb.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
   ```
   - A `NEXT_PUBLIC_SUPABASE_ANON_KEY` é a **Publishable key** do painel do
     Supabase (*Project Settings → API Keys*). Ela pode ser pública.
   - **Nunca** use a *Secret key* (`sb_secret_...`).

O arquivo `.env.local` **não** vai para o GitHub (está no `.gitignore`).

---

## 5. Instalar e rodar

```bash
npm install        # baixa as dependências (demora ~1 min na primeira vez)
npm run dev        # inicia o site local
```

Abra http://localhost:3000 no navegador. Deu certo? Configuração concluída.

Para parar o site local: `Ctrl + C` no terminal.

---

## 6. Do dia a dia em diante

Sempre que for mexer no site, abra o terminal **dentro da pasta do projeto** e
rode o Claude Code ali:

```bash
cd C:\Users\SEU-USUARIO\dev\lamf5-pdi
claude
```

O Claude lê o `CLAUDE.md` automaticamente e já sabe tudo sobre o projeto.
O passo a passo de como pedir uma alteração está em
[como-atualizar.md](como-atualizar.md).
