# Sistema LAMF5 — Gestão de PDI

Portal interno da **Liga Acadêmica de Mercado Financeiro (LAMF5 / UFV)**: login de
membros, questionário oficial, quiz vocacional, acompanhamento de metas (PDI) e
painel de administração para a Gestão de Pessoas e a Presidência.

- **Site no ar:** https://lamf5ufv.vercel.app
- **Stack:** Next.js 16 + React 19 + Supabase (banco/login/arquivos) + deploy na Vercel.

## Documentação

| Para... | Leia |
|---|---|
| Entender o projeto por dentro (stack, banco, telas) | [`CLAUDE.md`](CLAUDE.md) |
| Configurar tudo pela primeira vez na sua máquina | [`docs/comecando.md`](docs/comecando.md) |
| Fazer uma alteração no site (com o Claude Code) | [`docs/como-atualizar.md`](docs/como-atualizar.md) |
| Configurar o deploy automático | [`docs/deploy-vercel.md`](docs/deploy-vercel.md) |
| Passar o sistema para a próxima gestão | [`docs/repasse.md`](docs/repasse.md) |

## Rodar localmente (resumo)

```bash
npm install
cp .env.local.example .env.local   # e preencher com as chaves do Supabase
npm run dev                        # http://localhost:3000
```

Detalhes em [`docs/comecando.md`](docs/comecando.md).
