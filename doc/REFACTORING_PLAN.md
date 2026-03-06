# Plano de Refatoração - DragonBallDle

Este documento descreve o plano de refatoração para melhorar a manutenibilidade e escalabilidade do projeto, evitando complexidade desnecessária (overengineering).

## Fase 1: Organização e Limpeza (Impacto Imediato)

O foco desta fase é reorganizar o código existente para facilitar a leitura e manutenção, sem alterar drasticamente a lógica de negócios.

### 1. Modularização do JavaScript (`src/main.js`)

O arquivo `main.js` atual centraliza muitas responsabilidades. A meta é dividi-lo em módulos ES6 na pasta `src/game/`:

- **`src/game/state.js`**: Centraliza o gerenciamento do estado (tentativas, palpites, status de vitória, persistência no `localStorage`).
- **`src/game/ui.js`**: Controla a manipulação do DOM (criar caixas de palpite, mostrar/esconder pop-ups). As funções devem ler o estado, mas não modificá-lo diretamente.
- **`src/game/character.js`**: Isola a lógica de seleção do personagem (PRNG, `getDailyCharacter`, filtros).
- **`src/game/api.js`**: Centraliza as chamadas `fetch` para o backend (`/api/wins.php`).
- **`src/main.js`**: Atua como orquestrador, importando os módulos e conectando eventos do usuário às funções.

### 2. Modularização do CSS (`src/style.css`)

Dividir o arquivo CSS monolítico em arquivos menores dentro de `src/styles/`:

- **`base.css`**: Variáveis (`:root`), reset, tipografia base.
- **`layout.css`**: Estrutura do header, footer e containers principais.
- **`components/`**:
  - `_grid.css`: Estilos da grade de palpites e cabeçalhos.
  - `_form.css`: Input de busca e dropdown de sugestões.
  - `_popup.css`: Modal de vitória e animações.
  - `_tutorial.css`: Indicadores de cor e seção de ajuda.

### 3. Classes CSS em vez de Estilos Inline

Substituir a manipulação direta de estilos no JS por classes utilitárias.

- _De_: `element.style.backgroundColor = "rgb(0,180,0)"`
- _Para_: `element.classList.add("bg-correct")`

## Fase 2: Arquitetura e Fluxo de Dados (Previsibilidade)

### 1. Centralização do Estado

Substituir variáveis globais dispersas (`tryCount`, `randomCharacter`) por um store único em `src/game/state.js`. Isso estabelece um fluxo unidirecional: **Ação -> Atualiza Estado -> Renderiza UI**.

### 2. Separação de Dados e Tradução

Separar dados estruturais de textos de exibição para facilitar novos idiomas.

- **`characters-base.json`**: Contém IDs e dados imutáveis (Gênero, Raça, Afiliação).
- **`locales/*.json`**: Contém os nomes traduzidos, usando o ID do personagem como chave.

## Fase 3: Escalabilidade e Ferramentas (Futuro)

### 1. Ferramenta de Build (Vite)

Adotar **Vite** para desenvolvimento local rápido (HMR) e otimização de produção (minificação, bundling). Isso também permite importar CSS diretamente nos módulos JS.

### 2. Backend Robusto (`wins.php`)

Migrar o armazenamento de contadores de arquivos `.json` para **SQLite**.

- **Motivo**: Arquivos JSON podem sofrer com "race conditions" (concorrência) em tráfego alto.
- **Solução**: SQLite gerencia bloqueios de escrita de forma nativa e eficiente, mantendo a simplicidade de um arquivo único.
