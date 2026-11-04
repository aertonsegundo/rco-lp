/**
 * Entrada ao rolar dos cartões do método OPALA, no mesmo padrão do resto da página (o JS publicado
 * anima as outras seções): só com `js-reveal` ligado no <html>, uma vez só, sem biblioteca.
 * Sem IntersectionObserver ou com movimento reduzido, o script inline do <head> não liga
 * `js-reveal` e nada fica escondido.
 */
const root = document.documentElement;
const cards = [...document.querySelectorAll<HTMLElement>(".opala-card")];
if (root.classList.contains("js-reveal") && "IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add("is-in");
        io.unobserve(e.target);
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
  );
  cards.forEach((el, i) => {
    el.dataset.reveal = "up";
    el.style.setProperty("--reveal-delay", `${i * 60}ms`);
    io.observe(el);
  });
}
