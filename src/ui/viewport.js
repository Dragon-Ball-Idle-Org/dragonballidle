export function setVH() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
}

export function initViewport() {
  setVH();
  window.addEventListener("resize", setVH);
}
