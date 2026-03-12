export function showLoading() {
  const loader = document.getElementById("app-loading");
  if (loader) loader.classList.remove("hidden");
}

export function hideLoading() {
  const loader = document.getElementById("app-loading");
  if (loader) {
    loader.classList.add("hidden");
    loader.addEventListener("transitionend", () => loader.remove(), {
      once: true,
    });
  }
}
