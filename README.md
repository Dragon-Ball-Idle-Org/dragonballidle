## DragonBallDle

DragonBallDle é um jogo diário de adivinhação inspirado em “wordle‑likes”, focado no universo de Dragon Ball.
Todo dia existe **um personagem diferente** e o jogador tenta adivinhar com base em atributos como saga, raça, gênero, transformações e afiliações.

### Objetivo do projeto

- **Entretenimento**: criar um desafio diário rápido e viciante para fãs de Dragon Ball.
- **Experiência multilíngue**: o jogo suporta vários idiomas via sistema de i18n.
- **Estudo de arquitetura front+backend**: o repositório demonstra:
  - SPA com Vite.
  - Backend Serverless com Supabase Edge Functions.
  - Deploy na Vercel com configurações personalizadas de roteamento.

---

## Tecnologias principais

- **Frontend**
  - `Vite` (build e dev server com suporte a Multi-Page App via rollupOptions)
  - CSS Moderno (`/src/styles/`) com Custom Properties (`var(--token)`) e Cascateamento (`@layer`)
  - JavaScript Vanilla Modular (`/src/ui`, `/src/state`, `/src/utils`, `/src/services`, `/src/lib`)
  - Sistema de i18n Nativo (`/src/state/i18n.js` + `/locales`) com extrações dinâmicas

- **Backend (Supabase & Serverless)**
  - Supabase Edge Functions (`supabase/functions/increment-wins`) no lugar de backend PHP tradicional
  - Banco de Dados PostgreSQL provido pelo Supabase e bibliotecas como `supabase-js` para consumo da API

- **Infra / DevOps**
  - Deploy em **Vercel** com uso de `vercel.json` listando regras de:
    - i18n por path (`/en-us/`, `/pt-br/`, etc.).
    - SPA redirecionando para `index.html`.
    - Cache management e redirecionamentos.

---

## Como rodar localmente

Pré‑requisitos:

- Node.js (versão compatível com Vite 7)
- `pnpm` (recomendado; o projeto foi configurado com `pnpm`)

Passos:

1. Instale as dependências:
```bash
pnpm install
```

2. Crie e configure as variáveis de ambiente baseando-se no `env-example.txt`. Adicione no `.env` (ou `.env.development`):
```env
# Gere o salt
VITE_DAILY_SECRET=seu_segredo_diario
# Boolean (true|false)
VITE_FORCE_YMD=false
# Supabase url
VITE_SUPABASE_URL=url_do_seu_projeto_supabase
# Supabase Publishable Key
VITE_SUPABASE_PUBLISHABLE_KEY=chave_anon_publica_do_supabase
```

3. Inicie o servidor de desenvolvimento:
```bash
pnpm dev
```

Depois acesse:

```text
http://localhost:5173/en-us/
```

> **Observação sobre o Supabase CLI**: Se quiser testar as Edge Functions localmente, use o [Supabase CLI](https://supabase.com/docs/guides/cli):
> ```bash
> supabase start
> supabase functions serve increment-wins
> ```

---

## Fluxo de deploy

O repositório está configurado para o ambiente de CI/CD da **Vercel**. Cada _push_ para o branch principal aciona o workflow da própria plataforma que:

1. Executa o build utilizando o Vite (`pnpm build`).
2. Configura os rewrites e redirects a partir do `vercel.json`.
3. Para as lógicas de backend, o deploy das Edge Functions deve ser feito separadamente através do **Supabase CLI** (ex: `supabase functions deploy increment-wins`).

---

## Estrutura simplificada

Algumas pastas/arquivos importantes:

- `index.html` – HTML principal da SPA, carrega o bundle Vite, design e o entrypoint principal.
- `404.html` – Página servida em caso de Not Found, acoplando i18n automático nativo sem bibliotecas.
- `src/`
  - `main.js` – Ponto de injeção global que inicializa ferramentas e paraleliza as promessas principais.
  - `head-seo.js` – Controlador para injetar Title e Tags de SEO dinâmicas para web-crawlers em 20+ linguagens com base em rotas.
  - `styles/` – Estilizações modulares guiadas por `index.css` orquestrando: `base`, `layout`, `components` e `utilities`.
  - `state/` – Camada de gerenciamento de dados essenciais e cache do app (Engine, I18n).
  - `ui/` – Componentes limpos para montar botões, animações e listeners no DOM.
  - `utils/`, `services/`, `lib/` – Helpers e lógicas de comunicação assíncronas (como consultas Supabase).
- `public/`
  - Assets de imagens, bandeiras `.svg` e ícones `.ico`.
- `supabase/functions/` – Endpoint para registrar vitórias diárias na edge cloud.
- `vercel.json` – Regras de route rewrite da Vercel para i18n, SPA e redirecionamentos server-side.
- `vite.config.js` – Build do frontend otimizado com Node para o respectivo ambiente local/produção.

---

## Capturas de tela

![win-image](doc/images/win-picture.png)

---

## Licença e créditos

### Código deste projeto

O código deste repositório é licenciado sob a **[MIT License](LICENSE)**. Você pode usar, modificar e redistribuir conforme os termos do arquivo [LICENSE](LICENSE).

### Créditos

- **Arthur Coelho** — [LinkedIn](https://www.linkedin.com/in/arthur-coelho-9a77a1216/)
- **Júlio Villa Pires** — [LinkedIn](https://www.linkedin.com/in/j%C3%BAlio-villa-pires-2678431b8/)
- **Gildo Júnior** — [LinkedIn](https://www.linkedin.com/in/gildofj/) [Github](https://github.com/Gildofj)

### Aviso de marcas e direitos autorais

**Dragon Ball** e todos os personagens, nomes, imagens e elementos relacionados são marcas registradas e/ou obras protegidas por direitos autorais de seus respectivos titulares, incluindo, mas não limitado a: **Toei Animation Co., Ltd.**, **Bandai Namco Entertainment Inc.**, **Shueisha Inc.** e demais detentores oficiais.

Este projeto é um jogo de fãs, **não oficial** e **sem qualquer afiliação, aprovação ou endosso** pelos titulares dos direitos de Dragon Ball. Trata-se de projeto educacional e de entretenimento, de forma **não comercial**. O uso de referências a Dragon Ball é feito em caráter de paródia/homenagem e fair use, respeitando os direitos dos criadores originais.

Se você é detentor de direitos e deseja solicitar alteração ou remoção de conteúdo, entre em contato pelos canais indicados no README.
