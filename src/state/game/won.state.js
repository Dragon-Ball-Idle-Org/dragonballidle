export function isGameWon() {
  return localStorage.getItem("gameWon") === "true";
}

export function markGameWon() {
  localStorage.setItem("gameWon", "true");
}
