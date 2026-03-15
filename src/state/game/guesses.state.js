export function getSavedGuesses() {
  if (!window.guesses) {
    window.guesses = JSON.parse(localStorage.getItem("guesses")) || [];
  }
  return window.guesses;
}

export function guessAlreadyMade(id) {
  const guesses = getSavedGuesses();
  return guesses.includes(id);
}

export function saveGuessId(id) {
  const guesses = getSavedGuesses();
  guesses.push(id);
  localStorage.setItem("guesses", JSON.stringify(guesses));
}

export function getTryCount() {
  const guesses = getSavedGuesses();
  return guesses?.length || 0;
}
