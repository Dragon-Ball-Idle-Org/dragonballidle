export function initAnalytics() {
  function pushPageView() {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "page_view",
      page_path: location.pathname + location.search + location.hash,
      page_title: document.title,
      page_language: document.documentElement.lang || "",
    });
  }

  // 1) Primeiro carregamento
  pushPageView();

  // 2) Quando mudar o idioma via clique (se sua troca de idioma NÃO recarregar):
  document.addEventListener("click", function (e) {
    const a = e.target.closest("a[href]");
    if (!a) return;
    const url = new URL(a.href, location.origin);
    // se for navegação interna:
    if (url.origin === location.origin) {
      // deixa o navegador navegar; se não houver reload, empurra o evento depois
      setTimeout(pushPageView, 50);
    }
  });

  // 3) Voltar/avançar do browser (caso use History API no futuro)
  window.addEventListener("popstate", pushPageView);
}
