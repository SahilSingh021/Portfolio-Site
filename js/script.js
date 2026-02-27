(() => {
  const header = document.querySelector(".site-header");
  const menuToggle = document.getElementById("menuToggle");
  const mobileMenu = document.getElementById("mobileMenu");

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const desktopMQ = window.matchMedia("(min-width: 981px)");

  const navLinks = Array.from(document.querySelectorAll("[data-nav]")).filter(
    (el) => el.tagName.toLowerCase() === "a"
  );

  const sections = [
    { key: "home", el: document.getElementById("home") },
    { key: "about", el: document.getElementById("about_sr") },
    { key: "projects", el: document.getElementById("projects") },
    { key: "contact", el: document.getElementById("contact") },
  ].filter((s) => s.el);

  const getHeaderOffset = () => (header ? Math.ceil(header.getBoundingClientRect().height + 10) : 10);

  const setHeaderState = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 10);
  };

  const setActiveNav = (key) => {
    navLinks.forEach((a) => a.classList.toggle("is-active", a.dataset.nav === key));
    const mobileLinks = mobileMenu ? Array.from(mobileMenu.querySelectorAll("[data-nav]")) : [];
    mobileLinks.forEach((a) => a.classList.toggle("is-active", a.dataset.nav === key));
  };

  const openMenu = () => {
    if (!menuToggle || !mobileMenu) return;
    menuToggle.setAttribute("aria-expanded", "true");
    mobileMenu.hidden = false;
    document.body.classList.add("menu-open");
    requestAnimationFrame(() => mobileMenu.classList.add("is-open"));
  };

  const closeMenu = (instant = false) => {
    if (!menuToggle || !mobileMenu) return;
    menuToggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
    mobileMenu.classList.remove("is-open");
    const dur = instant || prefersReduced ? 0 : 280;
    window.setTimeout(() => {
      mobileMenu.hidden = true;
    }, dur);
  };

  const toggleMenu = () => {
    const isOpen = menuToggle?.getAttribute("aria-expanded") === "true";
    if (isOpen) closeMenu();
    else openMenu();
  };

  const scrollToEl = (el) => {
    if (!el) return;
    const y = window.scrollY + el.getBoundingClientRect().top - getHeaderOffset();
    window.scrollTo({ top: y, behavior: prefersReduced ? "auto" : "smooth" });
  };

  // Anchor navigation
  document.addEventListener("click", (e) => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;

    const href = anchor.getAttribute("href");
    if (!href || href === "#") return;

    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();
    scrollToEl(target);

    const key = anchor.dataset.nav || (href === "#about_sr" ? "about" : href.replace("#", ""));
    if (key) setActiveNav(key);

    history.replaceState(null, "", href);

    if (mobileMenu && !mobileMenu.hidden) closeMenu();
  });

  // menu wiring
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", toggleMenu);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu(true);
    });
  }

  const syncMenuForViewport = () => {
    if (desktopMQ.matches) closeMenu(true);
  };
  desktopMQ.addEventListener?.("change", syncMenuForViewport) || desktopMQ.addListener(syncMenuForViewport);

  // scroll spy
  let cached = [];
  const recalcSectionTops = () => {
    const off = getHeaderOffset();
    cached = sections
      .map((s) => ({ key: s.key, top: Math.floor(s.el.getBoundingClientRect().top + window.scrollY - off) }))
      .sort((a, b) => a.top - b.top);
  };

  const getActiveKeyFromScroll = () => {
    const bottomGap = 2;
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - bottomGap;
    if (atBottom) return cached[cached.length - 1]?.key || "contact";

    const pos = window.scrollY + getHeaderOffset() + 2;
    let active = cached[0]?.key || "home";
    for (let i = 0; i < cached.length; i++) {
      if (pos >= cached[i].top) active = cached[i].key;
      else break;
    }
    return active;
  };

  let ticking = false;
  const onScroll = () => {
    setHeaderState();
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      setActiveNav(getActiveKeyFromScroll());
    });
  };

  // reveal animations
  const revealEls = Array.from(document.querySelectorAll(".reveal"));
  if (!prefersReduced) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -10% 0px" }
    );

    let bucket = 0;
    revealEls.forEach((el) => {
      if (el.hasAttribute("data-stagger")) {
        const d = Math.min(420, (bucket % 8) * 55);
        el.style.setProperty("--d", `${d}ms`);
        bucket++;
      }
      revealObserver.observe(el);
    });
  } else {
    revealEls.forEach((el) => el.classList.add("is-in"));
  }

  // year
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  // modal
  const demoModal = document.getElementById("demoModal");
  let lastFocused = null;

  const openModal = () => {
    if (!demoModal) return;
    lastFocused = document.activeElement;
    demoModal.hidden = false;
    document.body.classList.add("modal-open");
    demoModal.querySelector("[data-modal-close]")?.focus();
  };

  const closeModal = () => {
    if (!demoModal) return;
    demoModal.hidden = true;
    document.body.classList.remove("modal-open");
    lastFocused?.focus?.();
  };

  if (demoModal) {
    demoModal.addEventListener("click", (e) => {
      if (e.target.closest("[data-modal-close]")) closeModal();
    });
    document.addEventListener("keydown", (e) => {
      if (!demoModal.hidden && e.key === "Escape") closeModal();
    });
  }

  // projects
  const projects = [
    {
      title: "ACSA - AssaultCube Secure Arena",
      subtitle: "Final Year Project • platform integrity & anti-cheat",
      description:
        "An end-to-end competitive platform: the web app manages identity, accounts, and match hosting; the anti-cheat DLL enforces integrity checks, logs suspicious activity, and connects to the platform for authenticated play; and the forked AssaultCube client loads the anti-cheat at startup.",
      stack: ["ASP.NET", "C#", "C++"],
      highlights: [
        "Microsoft Identity + secure session flow",
        "JWT auth between components",
        "Kestrel-hosted web platform",
        "Anti-cheat integrity checks + telemetry logging",
      ],
      tags: ["Identity", "JWT", "Kestrel", "Anti-Cheat", ".dll"],
      links: { demo: null, repo: "https://github.com/SahilSingh021/acsa-showcase" },
    },
  ];

  const projectsGrid = document.getElementById("projectsGrid");
  const projectsList = document.getElementById("projectsList");
  const dotsWrap = document.getElementById("projectsDots");
  const countEl = document.getElementById("projectsCount");
  const prevBtn = document.querySelector(".proj-nav--prev");
  const nextBtn = document.querySelector(".proj-nav--next");

  const escapeHtml = (s) =>
    String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const pill = (text) => `<span class="pill mono">${escapeHtml(text)}</span>`;
  const tag = (text) => `<li class="tag">${escapeHtml(text)}</li>`;

  const renderProjectCard = (p) => {
    const stackHtml = (p.stack || []).map(pill).join("");
    const highlightsHtml = (p.highlights || []).map((x) => `<li>${escapeHtml(x)}</li>`).join("");
    const tagsHtml = (p.tags || []).map(tag).join("");

    const demoBtn = p.links?.demo
      ? `<a class="btn btn--primary btn--small" href="${escapeHtml(p.links.demo)}" target="_blank" rel="noreferrer">Live / Demo</a>`
      : `<button class="btn btn--primary btn--small" type="button" data-open-demo-modal>Live / Demo</button>`;

    const repoBtn = p.links?.repo
      ? `<a class="btn btn--ghost btn--small" href="${escapeHtml(p.links.repo)}" target="_blank" rel="noreferrer">Repo</a>`
      : "";

    return `
      <article class="project-card project-swap-in">
        <div class="project-media" aria-hidden="true"></div>

        <div class="project-body">
          <div class="project-top">
            <div>
              <h3 class="project-title">${escapeHtml(p.title)}</h3>
              <p class="project-sub">${escapeHtml(p.subtitle)}</p>
            </div>
            <div class="pills" aria-label="Tech stack">${stackHtml}</div>
          </div>

          <p class="project-desc">${escapeHtml(p.description)}</p>
          ${highlightsHtml ? `<ul class="project-highlights" aria-label="Highlights">${highlightsHtml}</ul>` : ""}
        </div>

        <div class="project-foot">
          <ul class="tags" aria-label="Topics">${tagsHtml}</ul>
          <div class="project-actions">${demoBtn}${repoBtn}</div>
        </div>
      </article>
    `;
  };

  const bindModalButtons = (root) => {
    root.querySelectorAll("[data-open-demo-modal]").forEach((btn) => btn.addEventListener("click", openModal));
  };

  const renderMobileList = () => {
    if (!projectsList) return;
    projectsList.innerHTML = projects.map(renderProjectCard).join("");
    bindModalButtons(projectsList);
  };

  let activeIndex = 0;

  const renderDots = () => {
    if (!dotsWrap) return;
    dotsWrap.innerHTML = projects
      .map((_, i) => {
        const active = i === activeIndex ? "is-active" : "";
        return `<button class="dot-btn ${active}" type="button" aria-label="Go to project ${i + 1}"></button>`;
      })
      .join("");

    Array.from(dotsWrap.querySelectorAll(".dot-btn")).forEach((b, i) =>
      b.addEventListener("click", () => setActiveProject(i))
    );
  };

  const updateNavState = () => {
    if (countEl) countEl.textContent = `${activeIndex + 1} / ${projects.length}`;
    const disabled = projects.length <= 1;
    if (prevBtn) prevBtn.disabled = disabled;
    if (nextBtn) nextBtn.disabled = disabled;
  };

  const setActiveProject = (idx) => {
    activeIndex = (idx + projects.length) % projects.length;

    if (projectsGrid) {
      projectsGrid.innerHTML = renderProjectCard(projects[activeIndex]);
      bindModalButtons(projectsGrid);
    }

    renderDots();
    updateNavState();
  };

  prevBtn?.addEventListener("click", () => setActiveProject(activeIndex - 1));
  nextBtn?.addEventListener("click", () => setActiveProject(activeIndex + 1));

  document.addEventListener("keydown", (e) => {
    const tagName = document.activeElement?.tagName?.toLowerCase();
    const typing = tagName === "input" || tagName === "textarea";
    if (typing) return;
    if (e.key === "ArrowLeft") setActiveProject(activeIndex - 1);
    if (e.key === "ArrowRight") setActiveProject(activeIndex + 1);
  });

  // particles
  const particlesContainer = document.querySelector(".bg-particles");
  if (particlesContainer) {
    for (let i = 0; i < 30; i++) {
      const dot = document.createElement("span");
      dot.style.left = Math.random() * 100 + "vw";
      dot.style.animationDuration = 8 + Math.random() * 100 + "s";
      dot.style.opacity = String(0.25 + Math.random() * 0.75);
      particlesContainer.appendChild(dot);
    }
  }

  // init
  recalcSectionTops();
  setHeaderState();
  setActiveNav(getActiveKeyFromScroll());
  syncMenuForViewport();

  renderMobileList();
  if (projects.length && projectsGrid) setActiveProject(0);

  window.addEventListener("load", () => {
    recalcSectionTops();
    setActiveNav(getActiveKeyFromScroll());
  });

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => {
    recalcSectionTops();
    setActiveNav(getActiveKeyFromScroll());
    syncMenuForViewport();
  });
})();