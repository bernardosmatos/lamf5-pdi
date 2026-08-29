# Como atualizar o site

Este é o fluxo do dia a dia. Você conversa com o **Claude Code** em português, ele
faz a mudança no código, e o site publica sozinho depois que você aprova.

> Antes da primeira vez, faça a configuração de [comecando.md](comecando.md).

---

## O passo a passo

### 1. Abrir o projeto

```bash
cd C:\Users\SEU-USUARIO\dev\lamf5-pdi
git switch main
git pull                     # traz as últimas mudanças
claude
```

### 2. Pedir a mudança

Fale com o Claude em português normal. Seja específico. Exemplos:

- *"Troca o texto do botão da tela de login de 'Entrar no Sistema' para 'Acessar'."*
- *"Adiciona a pergunta 'Qual seu semestre?' no questionário, depois do campo de curso."*
- *"Muda a cor dourada do site para um tom mais claro."*
- *"No quiz vocacional, adiciona a área 'Crédito Corporativo'."*

O Claude vai:
- criar uma **branch** nova (uma cópia segura, sem mexer no site no ar);
- fazer a alteração;
- rodar o site localmente para conferir;
- te mostrar o que mudou.

Confira no navegador (http://localhost:3000) se ficou como você queria. Se não,
peça ajustes: *"o botão ficou pequeno, aumenta"*.

### 3. Publicar

Quando estiver bom, peça: *"pode subir para o GitHub e abrir o Pull Request"*.

O Claude faz `commit` + `push` e te dá um **link do Pull Request (PR)**.

### 4. Conferir e aprovar

No PR (no site do GitHub):

1. Espere o **CI** ficar com o ✅ verde (ele testa se o código não quebrou).
2. Abra o **link de preview** que a Vercel posta no PR — é o site de teste com a
   sua mudança, isolado do site real. Confira lá.
3. Está tudo certo? Clique em **"Merge pull request"**.
4. Clique em **"Delete branch"** (limpa a cópia que não é mais necessária).

Em ~1 minuto o site de produção (https://lamf5ufv.vercel.app) atualiza sozinho.

---

## Tarefas comuns (o Claude já sabe fazer)

Estas estão documentadas no [`CLAUDE.md`](../CLAUDE.md), seção "Receitas":

| Quero... | É só pedir |
|---|---|
| Adicionar/remover quem pode criar conta | **Nem precisa do Claude:** `/administrador` → aba "E-mails Autorizados" |
| Mudar textos, títulos, botões de uma tela | *"muda o texto X para Y na tela de ..."* |
| Mudar as cores do site | *"muda a cor ... para ..."* |
| Mudar os nomes das diretorias | *"renomeia a diretoria X para Y"* |
| Adicionar/editar perguntas do questionário | *"adiciona a pergunta ... no questionário"* |
| Mexer no quiz vocacional | *"no quiz, ..."* |

---

## Regras de ouro

- **Nunca** edite direto na branch `main`. Sempre pelo fluxo de PR acima
  (na verdade o GitHub bloqueia isso de propósito).
- **Sempre** confira o preview antes de dar merge.
- Se algo quebrar no site depois de um merge, dá pra voltar atrás em segundos —
  veja [deploy-vercel.md](deploy-vercel.md), seção "Se algo der errado".
- Mudança que mexe no **banco de dados** (tabela nova, coluna nova) precisa de um
  script SQL rodado no Supabase. O Claude prepara o script e te explica; guarde-o
  em `docs/sql/`.
