// Apenas suportado por navegadores Chromium por enquanto, animação mais suave
const ANIMATION_DURATION = 300;
const supportsInterpolateSize = CSS.supports(
  "interpolate-size",
  "allow-keywords",
);

export function initDetailsTagBehaviorsListener() {
  // Necessário animar abertura e fechamento por js porque o CSS não consegue gerenciar corretamente
  document.querySelectorAll("details").forEach((details) => {
    const summary = details.querySelector("summary");
    const content = details.querySelector("summary ~ *");

    summary.addEventListener("click", (e) => {
      e.preventDefault();
      if (details.open) {
        _animateClose(details, content);
      } else {
        _animateOpen(details, content);
      }
    });
  });
}

function _animateOpen(details, content) {
  details.setAttribute("open", "");

  if (supportsInterpolateSize) {
    content.animate(
      [{ height: "0px" }, { height: content.scrollHeight + "px" }],
      { duration: ANIMATION_DURATION, easing: "ease-out" },
    );
  } else {
    const height = content.scrollHeight + "px";
    content.style.transition = "none";
    content.style.maxHeight = "0";
    content.offsetHeight; // força reflow
    content.style.transition = `max-height ${ANIMATION_DURATION}ms ease-out`;
    content.style.maxHeight = height;
  }
}

function _animateClose(details, content) {
  if (supportsInterpolateSize) {
    const anim = content.animate(
      [{ height: content.offsetHeight + "px" }, { height: "0px" }],
      { duration: ANIMATION_DURATION, easing: "ease-out" },
    );
    anim.onfinish = () => details.removeAttribute("open");
  } else {
    const height = content.scrollHeight + "px";
    content.style.maxHeight = height;
    content.style.transition = `max-height ${ANIMATION_DURATION}ms ease-out`;
    content.offsetHeight; // força reflow
    content.style.maxHeight = "0";
    content.addEventListener(
      "transitionend",
      () => {
        details.removeAttribute("open");
        content.style.maxHeight = "";
        content.style.transition = "";
      },
      { once: true },
    );
  }
}
