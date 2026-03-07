## DragonBallDle

DragonBallDle é um jogo diário de adivinhação inspirado em “wordle‑likes”, focado no universo de Dragon Ball.
Todo dia existe **um personagem diferente** e o jogador tenta adivinhar com base em atributos como saga, raça, gênero, transformações e afiliações.

### Objetivo do projeto

- **Entretenimento**: criar um desafio diário rápido e viciante para fãs de Dragon Ball.
- **Experiência multilíngue**: o jogo suporta vários idiomas via sistema de i18n.
- **Estudo de arquitetura front+backend**: o repositório demonstra:
  - SPA com Vite.
  - Backend simples em PHP para contagem de vitórias diárias.
  - Integração com Docker e esteiras de deploy (GitHub Actions).

---

## Tecnologias principais

- **Frontend**
  - `Vite` (build e dev server)
  - JavaScript modular (`/src`)
  - Sistema de i18n próprio (`/src/i18n.js` + `/locales`)

- **Backend**
  - PHP 8.2 (imagem `php:8.2-apache`)
  - Endpoint `api/wins.php` para registrar/consultar as vitórias do dia
  - Persistência em arquivos JSON diários (`data/wins`)

- **Infra / DevOps**
  - `Dockerfile` multi‑stage: build do front com Node/pnpm + server Apache/PHP servindo `dist/` e `api/`.
  - GitHub Actions para build, push da imagem Docker e deploy automatizado em servidor remoto.
  - `.htaccess` com regras de:
    - i18n por path (`/en-us/`, `/pt-br/`, etc.).
    - SPA servindo sempre o mesmo `index.html`.
    - Redirecionamentos pensados para produção, mas neutros em `localhost`.

---

## Como rodar localmente (sem Docker)

Pré‑requisitos:

- Node.js (versão compatível com Vite 7)
- `pnpm` (recomendado; o projeto foi configurado com `pnpm`)

Passos:

```bash
cd dragonballdle.site
pnpm install
pnpm dev
```

Depois acesse:

```text
http://localhost:5173/en-us/
```

> Observação: o backend PHP (`api/wins.php`) precisa de um servidor PHP rodando (por exemplo, Apache ou `php -S`) para registrar/consultar vitórias. Em desenvolvimento, você pode:
>
> - Rodar um Apache/PHP local apontando para a pasta `api/`, ou
> - Usar o container Docker descrito abaixo.

---

## Rodando com Docker

Build da imagem (na pasta que contém `dragonballdle.site` e `api`):

```bash
cd d:\Projects   # ou equivalente no seu sistema
docker build -f dragonballdle.site/Dockerfile -t dragonballdle-site .
```

Rodando o container:

```bash
docker run --rm -p 8080:80 --name dragonballdle dragonballdle-site
```

Acesse:

```text
http://localhost:8080/en-us/
```

---

## Uso de variáveis de ambiente

### Frontend (Vite)

As variáveis usadas no front vivem em arquivos `.env`:

- `.env` (base)
- `.env.development`
- `.env.production`

Todas que forem usadas no código precisam ter prefixo **`VITE_`**, por exemplo:

```env
VITE_DAILY_SECRET=...
VITE_FORCE_YMD=true
```

No código:

```js
const forceYmd = import.meta.env.VITE_FORCE_YMD === "true";
```

No build Docker/CI, o Vite lê `.env.production` criado pela esteira (a partir de GitHub Secrets).

### Backend (PHP)

O backend atual é bem simples e não depende de `.env`.
Se for necessário no futuro, você pode:

- Ler variáveis de ambiente via `getenv('NOME')` na aplicação PHP, ou
- Introduzir uma lib como `vlucas/phpdotenv` para carregar um `.env` específico do servidor.

---

## Fluxo de deploy (GitHub Actions)

O repositório pode usar um workflow de deploy que:

1. Gera um `.env.production` para o Vite com base em GitHub Secrets.
2. Faz `docker build` usando o `Dockerfile` do projeto.
3. Faz `docker push` da imagem para um registry (Docker Hub ou GHCR).
4. Conecta no servidor via SSH e:
   - Faz `docker pull` da nova imagem.
   - Derruba o container antigo.
   - Sobe o container atualizado.

Esse fluxo torna o deploy praticamente automático a cada push na `main`.

---

## Estrutura simplificada

Algumas pastas/arquivos importantes:

- `index.html` – HTML principal da SPA, carrega o bundle Vite e scripts de i18n.
- `src/`
  - `main.js` – bootstrap da UI e da lógica do jogo.
  - `i18n.js` – detecção de idioma e carregamento de banco de caracteres (`characters-*.js`) e `locales`.
  - `shared/constants.js` – constantes utilizadas em mais de um lugar.
- `public/`
  - `characters-*.js` – bancos de personagens por idioma.
  - Assets de imagens, ícones, etc.
- `api/wins.php` – endpoint para registrar/ler vitórias diárias.
- `.htaccess` – regras de rewrite para i18n, SPA e redirecionos.
- `Dockerfile` – build do front + servidor Apache/PHP.

---

## Capturas de tela

![win-image](doc/images/win-picture.png)

---

## Licença e créditos

- Projeto criado como jogo de fãs, sem afiliação oficial com a franquia Dragon Ball.
- Ajuste aqui o tipo de licença e créditos de autores conforme necessário (por exemplo, MIT License + nomes dos autores).
