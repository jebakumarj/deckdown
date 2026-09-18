import type { Deck } from "@/lib/deck";

const escapeHtml = (value: string) =>
  value.replace(/[&<>"]/g, (char) =>
    char === "&" ? "&amp;" : char === "<" ? "&lt;" : char === ">" ? "&gt;" : "&quot;",
  );

const PLAYER_CSS = `
html, body { margin: 0; height: 100%; background: #0b0b0c; overflow: hidden; }
.deck { display: grid; place-items: center; height: 100%; }
.slide-stage { position: relative; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,.45); }
.slide-stage > .slide { position: absolute; inset: 0; transform-origin: top left; }
.slide-stage > .slide[hidden] { display: none; }
.hud {
  position: fixed; right: 16px; bottom: 12px; display: flex; gap: 14px;
  color: rgba(255,255,255,.55); font: 12px ui-sans-serif, system-ui, sans-serif;
}
.notes {
  position: fixed; inset: auto 0 0 0; max-height: 34vh; overflow: auto; padding: 14px 20px 26px;
  background: rgba(10,10,10,.93); color: #e8e8e8; white-space: pre-wrap;
  font: 15px/1.6 ui-sans-serif, system-ui, sans-serif; border-top: 1px solid rgba(255,255,255,.12);
}
.notes[hidden] { display: none; }
`;

const PLAYER_JS = `
(function () {
  var slides = Array.prototype.slice.call(document.querySelectorAll(".slide"));
  var stage = document.querySelector(".slide-stage");
  var counter = document.querySelector(".hud .counter");
  var notes = document.querySelector(".notes");
  var index = 0;
  var step = 0;

  function stepsOf(slide) {
    return slide.querySelectorAll(".step").length - 1;
  }

  function render(changedSlide) {
    if (changedSlide) {
      // Restart the deck transition on the slide that just became visible.
      var incoming = slides[index];
      incoming.style.animation = "none";
      void incoming.offsetWidth;
      incoming.style.animation = "";
    }
    slides.forEach(function (slide, i) {
      slide.hidden = i !== index;
      if (i !== index) return;
      Array.prototype.forEach.call(slide.querySelectorAll(".step"), function (node) {
        node.dataset.visible = Number(node.dataset.step) <= step ? "true" : "false";
      });
    });
    counter.textContent = index + 1 + " / " + slides.length;
    notes.textContent = slides[index].dataset.notes || "";
    location.hash = String(index + 1);
  }

  function next() {
    var changed = false;
    if (step < stepsOf(slides[index])) step++;
    else if (index < slides.length - 1) { index++; step = 0; changed = true; }
    else return;
    render(changed);
  }

  function previous() {
    var changed = false;
    if (step > 0) step--;
    else if (index > 0) { index--; step = stepsOf(slides[index]); changed = true; }
    else return;
    render(changed);
  }

  function scale() {
    var factor = Math.min(window.innerWidth / 1280, window.innerHeight / 720);
    stage.style.width = 1280 * factor + "px";
    stage.style.height = 720 * factor + "px";
    slides.forEach(function (slide) { slide.style.transform = "scale(" + factor + ")"; });
  }

  document.addEventListener("keydown", function (event) {
    var key = event.key;
    if (key === "ArrowRight" || key === "ArrowDown" || key === "PageDown" || key === " " || key === "Enter") { event.preventDefault(); next(); }
    else if (key === "ArrowLeft" || key === "ArrowUp" || key === "PageUp" || key === "Backspace") { event.preventDefault(); previous(); }
    else if (key === "Home") { index = 0; step = 0; render(true); }
    else if (key === "End") { index = slides.length - 1; step = 0; render(true); }
    else if (key === "s" || key === "S") { notes.hidden = !notes.hidden; }
    else if (key === "f" || key === "F") { document.documentElement.requestFullscreen && document.documentElement.requestFullscreen(); }
  });

  document.addEventListener("click", function (event) {
    if (event.target.closest(".notes")) return;
    next();
  });

  window.addEventListener("resize", scale);
  var fromHash = parseInt(location.hash.slice(1), 10);
  if (fromHash > 0 && fromHash <= slides.length) index = fromHash - 1;
  scale();
  render();
})();
`;

/**
 * A single self-contained HTML file: pre-rendered slides, inlined CSS and a
 * small player. No network access required once it is unzipped.
 */
export function buildStandaloneHtml(deck: Deck, theme: string, css: string): string {
  const title = deck.meta.title || "presentation.md deck";

  const slides = deck.slides
    .map(
      (slide, index) =>
        `<div class="slide" data-layout="${slide.layout}" data-notes="${escapeHtml(slide.notes)}"${
          index === 0 ? "" : " hidden"
        }>${slide.html}</div>`,
    )
    .join("\n");

  return `<!doctype html>
<html lang="en" data-theme="${escapeHtml(theme)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>${css}</style>
<style>${PLAYER_CSS}</style>
</head>
<body>
<div class="deck" data-theme="${escapeHtml(theme)}" data-transition="${deck.meta.transition}">
  <div class="slide-stage">
${slides}
  </div>
</div>
<div class="hud"><span class="counter"></span><span>S notes</span><span>F fullscreen</span></div>
<div class="notes" hidden></div>
<script>${PLAYER_JS}</script>
</body>
</html>
`;
}
