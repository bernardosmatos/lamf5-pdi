# Repasse de gestão

Checklist para quando a diretoria muda. O objetivo é que o site **nunca** fique
preso na conta pessoal de alguém que saiu da liga.

Responsável sugerido: **Presidência + Gestão de Pessoas** da gestão que está saindo.

---

## 1. Contas e acessos

O site depende de 3 serviços. Em cada um, **adicione as pessoas novas antes de
remover as antigas**.

### GitHub — o código
- Repositório: `github.com/bernardosmatos/lamf5-pdi`
- Adicionar novos mantenedores: *Settings → Collaborators* (ou *People*, se já for
  uma organização).
- **Recomendado:** migrar o repositório para uma **Organização do GitHub** da liga
  (ex: `lamf5-ufv`) para não depender de conta pessoal. Isso é a "Fase 5" do
  plano — ver com quem montou o sistema.

### Vercel — a publicação
- Projeto: `lamf5` (dashboard em vercel.com).
- *Settings → Members* → adicionar as pessoas novas.
- Confirmar que as **variáveis de ambiente** ainda estão lá:
  `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  (*Project → Settings → Environment Variables*).

### Supabase — banco de dados e login
- Projeto: `orcoymigfspunjsqxbtb`
- *Organization → Members* → adicionar novos **Owners** (pelo menos 2 pessoas:
  Presidência e Gestão de Pessoas).
- Onde ficam as chaves: *Project Settings → API Keys*.

---

## 2. Senhas

- Guarde os logins dos 3 serviços num **gerenciador de senhas compartilhado da
  liga** (ex: Bitwarden, plano gratuito). Não passe senha por WhatsApp/e-mail solto.
- Se alguém que tinha acesso saiu em más condições ou a senha vazou:
  - Supabase: *Project Settings → API Keys* → **"Roll" / gerar nova key** e
    atualizar o valor na Vercel e no `.env.local` de quem desenvolve.
  - GitHub/Vercel: trocar senha e ativar verificação em 2 fatores.

---

## 3. Conteúdo (não é código)

Coisas que a nova gestão provavelmente vai querer atualizar:

| O quê | Onde | Precisa de código? |
|---|---|---|
| Lista de quem pode criar conta | `/administrador` → "E-mails Autorizados" | Não |
| Membros e diretorias | cadastro de cada membro no próprio site | Não |
| Metas / PDIs do ciclo | `/administrador` → "Definir Metas" | Não |
| Textos, cores, telas, perguntas | via Claude Code — ver [como-atualizar.md](como-atualizar.md) | Sim (fluxo de PR) |

---

## 4. Entregar para a próxima gestão

Passe este repositório e diga para começarem por:

1. [`docs/comecando.md`](comecando.md) — configurar a máquina.
2. [`docs/como-atualizar.md`](como-atualizar.md) — como mexer no site.
3. [`../CLAUDE.md`](../CLAUDE.md) — como o sistema funciona por dentro.

E atualize a lista de contatos/responsáveis abaixo.

---

## Responsáveis atuais

> Mantenha esta lista atualizada a cada gestão.

| Papel | Nome | Contato | Acessos |
|---|---|---|---|
| _(preencher)_ | | | GitHub / Vercel / Supabase |
| _(preencher)_ | | | GitHub / Vercel / Supabase |
