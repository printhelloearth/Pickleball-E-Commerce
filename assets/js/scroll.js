const sectionScrollDuration = 1500;
let sectionScrollTimer = 0;
let restoreSectionScrollBehavior = null;

function scrollToSection(target, hash) {
  window.clearInterval(sectionScrollTimer);

  const root = document.documentElement;
  if (restoreSectionScrollBehavior) restoreSectionScrollBehavior();
  const previousBehavior = root.style.scrollBehavior;
  restoreSectionScrollBehavior = () => {
    root.style.scrollBehavior = previousBehavior;
    restoreSectionScrollBehavior = null;
  };
  root.style.scrollBehavior = "auto";

  const targetTop = Math.max(
    0,
    window.scrollY + target.getBoundingClientRect().top -
      Number.parseFloat(getComputedStyle(target).scrollMarginTop || "0")
  );

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.scrollTo(0, targetTop);
    history.pushState(null, "", hash);
    restoreSectionScrollBehavior();
    return;
  }

  const startTop = window.scrollY;
  const distance = targetTop - startTop;
  const startTime = performance.now();

  history.pushState(null, "", hash);

  function animateScroll() {
    const now = performance.now();
    const progress = Math.min((now - startTime) / sectionScrollDuration, 1);
    const easedProgress = progress < 0.5
      ? 4 * progress * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 3) / 2;

    window.scrollTo(0, startTop + distance * easedProgress);

    if (progress >= 1) {
      window.clearInterval(sectionScrollTimer);
      restoreSectionScrollBehavior();
    }
  }

  sectionScrollTimer = window.setInterval(animateScroll, 16);
}

document.addEventListener("click", event => {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

  const link = event.target.closest('a[href="#shop"], a[href="#membership"], a[href="#story"]');
  if (!link) return;

  const target = document.querySelector(link.getAttribute("href"));
  if (!target) return;

  event.preventDefault();
  scrollToSection(target, link.getAttribute("href"));
});
