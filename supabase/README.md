# Supabase

Configuração e Edge Functions do projeto.

## Pré-requisitos

- [Scoop](https://scoop.sh/) instalado
- [Supabase CLI](https://supabase.com/docs/guides/cli) instalado via Scoop
- Acesso ao projeto no [Supabase Dashboard](https://supabase.com/dashboard)

### Instalando o Supabase CLI via Scoop

```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

Confirme a instalação:

```powershell
supabase --version
```

---

## Autenticação

Gere um Access Token em **Supabase Dashboard → Account → Access Tokens** e faça login:

```powershell
supabase login
```

---

## Linkando o projeto

Na raiz do repositório, linke com o projeto remoto usando o Project ID (encontrado em **Dashboard → Project Settings → General**):

```powershell
supabase link --project-ref ardewtfmhzdmyjwsduoz
```

---

## Edge Functions

As funções ficam em `supabase/functions/<nome-da-funcao>/index.ts`.

### Fazendo deploy de uma função

```powershell
supabase functions deploy increment-wins
```

### Fazendo deploy de todas as funções

```powershell
supabase functions deploy
```

### Testando localmente

```powershell
supabase start
supabase functions serve increment-wins
```

A função ficará disponível em `http://localhost:54321/functions/v1/increment-wins`.

---

## Secrets

Secrets são variáveis de ambiente usadas pelas Edge Functions. **Nunca versione secrets no repositório.**

### Definindo secrets no ambiente remoto

```powershell
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=sua_key
supabase secrets set WINS_SECRET=seu_secret
```

### Listando secrets cadastrados

```powershell
supabase secrets list
```

### Removendo um secret

```powershell
supabase secrets unset NOME_DO_SECRET
```

### Rodando localmente com secrets

Crie um arquivo `supabase/.env.local` (já está no `.gitignore`):

```env
SUPABASE_SERVICE_ROLE_KEY=sua_key
WINS_SECRET=seu_secret
```

E suba as funções apontando para ele:

```powershell
supabase functions serve --env-file supabase/.env.local
```

---

## Migrations

As migrations ficam em `supabase/migrations/`.

### Aplicando migrations no banco remoto

```powershell
supabase db push
```

---

## Estrutura de pastas

```
supabase/
  functions/
    increment-wins/
      index.ts
  migrations/
    20xx_wins.sql
  config.toml
  .env.local     ← não versionado
  README.md
```
