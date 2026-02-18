(() => {
  const header = document.querySelector(".site-header");
  const menuToggle = document.getElementById("menuToggle");
  const mobileMenu = document.getElementById("mobileMenu");
  const navLinks = Array.from(document.querySelectorAll(".nav__link"));

  const sectionsByKey = {
    home: document.getElementById("home"),
    about: document.getElementById("about_sr"),
    projects: document.getElementById("projects"),
    contact: document.getElementById("contact"),
  };

  const setMenu = (open) => {
    if (!menuToggle || !mobileMenu) return;
    menuToggle.setAttribute("aria-expanded", String(open));
    mobileMenu.hidden = !open;
    document.body.classList.toggle("menu-open", open);
  };

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", () => {
      const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
      setMenu(!isOpen);
    });

    mobileMenu.addEventListener("click", (e) => {
      if (e.target.closest("a")) setMenu(false);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setMenu(false);
    });
  }

  const getHeaderOffset = () => {
    const h = header ? header.getBoundingClientRect().height : 0;
    return Math.ceil(h + 10);
  };

  const scrollToSelector = (selector) => {
    const el = document.querySelector(selector);
    if (!el) return;
    const y = window.scrollY + el.getBoundingClientRect().top - getHeaderOffset();
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  document.addEventListener("click", (e) => {
    const scrollBtn = e.target.closest("[data-scroll]");
    if (scrollBtn) {
      e.preventDefault();
      scrollToSelector(scrollBtn.getAttribute("data-scroll"));
      return;
    }

    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;

    const href = anchor.getAttribute("href");
    if (!href || href === "#") return;

    e.preventDefault();
    scrollToSelector(href);
    history.replaceState(null, "", href);
  });

  const setActive = (key) => {
    navLinks.forEach((a) => a.classList.toggle("is-active", a.dataset.nav === key));
  };

  const handleTopLock = () => {
    if (window.scrollY < 30) setActive("home");
  };

  let observer = null;

  const makeObserver = () => {
    if (observer) observer.disconnect();

    const rootMargin = `-${getHeaderOffset()}px 0px -60% 0px`;

    observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((x) => x.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) return;

        const id = visible.target.id;
        if (id === "home") setActive("home");
        else if (id === "about_sr") setActive("about");
        else if (id === "projects") setActive("projects");
        else if (id === "contact") setActive("contact");
      },
      {
        root: null,
        threshold: [0.18, 0.3, 0.45, 0.6],
        rootMargin,
      }
    );

    Object.values(sectionsByKey)
      .filter(Boolean)
      .forEach((sec) => observer.observe(sec));
  };

  makeObserver();
  handleTopLock();

  window.addEventListener("resize", () => {
    makeObserver();
    handleTopLock();
  });

  window.addEventListener("scroll", handleTopLock, { passive: true });

  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  const liveDemoBtn = document.getElementById("liveDemoBtn");
  const demoModal = document.getElementById("demoModal");

  const openModal = () => {
    if (!demoModal) return;
    demoModal.hidden = false;
    document.body.classList.add("modal-open");
    const closeBtn = demoModal.querySelector("[data-modal-close]");
    if (closeBtn) closeBtn.focus();
  };

  const closeModal = () => {
    if (!demoModal) return;
    demoModal.hidden = true;
    document.body.classList.remove("modal-open");
    if (liveDemoBtn) liveDemoBtn.focus();
  };

  if (liveDemoBtn && demoModal) {
    liveDemoBtn.addEventListener("click", (e) => {
      e.preventDefault();
      openModal();
    });

    demoModal.addEventListener("click", (e) => {
      if (e.target.closest("[data-modal-close]")) closeModal();
    });

    document.addEventListener("keydown", (e) => {
      if (!demoModal.hidden && e.key === "Escape") closeModal();
    });
  }
})();
