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

  // Mobile menu
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

  // Smooth scroll with header offset
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

  // Active nav link highlight
  const setActiveNav = (key) => {
    navLinks.forEach((a) => a.classList.toggle("is-active", a.dataset.nav === key));
  };

  const handleTopLock = () => {
    if (window.scrollY < 30) setActiveNav("home");
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
        if (id === "home") setActiveNav("home");
        else if (id === "about_sr") setActiveNav("about");
        else if (id === "projects") setActiveNav("projects");
        else if (id === "contact") setActiveNav("contact");
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

  // Footer year
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  // Demo modal
  const demoModal = document.getElementById("demoModal");
  let lastFocused = null;

  const openModal = () => {
    if (!demoModal) return;
    lastFocused = document.activeElement;
    demoModal.hidden = false;
    document.body.classList.add("modal-open");
    const closeBtn = demoModal.querySelector("[data-modal-close]");
    if (closeBtn) closeBtn.focus();
  };

  const closeModal = () => {
    if (!demoModal) return;
    demoModal.hidden = true;
    document.body.classList.remove("modal-open");
    if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
  };

  if (demoModal) {
    demoModal.addEventListener("click", (e) => {
      if (e.target.closest("[data-modal-close]")) closeModal();
    });

    document.addEventListener("keydown", (e) => {
      if (!demoModal.hidden && e.key === "Escape") closeModal();
    });
  }

  // Projects data
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
      links: { demo: null, repo: null },
    }
  ];

  // Projects rendering
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
      <article class="project-card">
        <div class="project-media" aria-hidden="true"></div>

        <div class="project-body">
          <div class="project-top">
            <div>
              <h3 class="project-title">${escapeHtml(p.title)}</h3>
              <p class="project-sub">${escapeHtml(p.subtitle)}</p>
            </div>
            <div class="pills" aria-label="Tech stack">
              ${stackHtml}
            </div>
          </div>

          <p class="project-desc">${escapeHtml(p.description)}</p>

          ${
            highlightsHtml
              ? `<ul class="project-highlights" aria-label="Highlights">${highlightsHtml}</ul>`
              : ""
          }
        </div>

        <div class="project-foot">
          <ul class="tags" aria-label="Topics">${tagsHtml}</ul>

          <div class="project-actions">
            ${demoBtn}
            ${repoBtn}
          </div>
        </div>
      </article>
    `;
  };

  const renderMobileList = () => {
    if (!projectsList) return;
    projectsList.innerHTML = projects.map(renderProjectCard).join("");

    projectsList.querySelectorAll("[data-open-demo-modal]").forEach((btn) => {
      btn.addEventListener("click", () => openModal());
    });
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

      const modalBtn = projectsGrid.querySelector("[data-open-demo-modal]");
      if (modalBtn) modalBtn.addEventListener("click", () => openModal());
    }

    renderDots();
    updateNavState();
  };

  if (prevBtn) prevBtn.addEventListener("click", () => setActiveProject(activeIndex - 1));
  if (nextBtn) nextBtn.addEventListener("click", () => setActiveProject(activeIndex + 1));

  document.addEventListener("keydown", (e) => {
    const tag = document.activeElement?.tagName?.toLowerCase();
    const typing = tag === "input" || tag === "textarea";
    if (typing) return;

    if (e.key === "ArrowLeft") setActiveProject(activeIndex - 1);
    if (e.key === "ArrowRight") setActiveProject(activeIndex + 1);
  });

  renderMobileList();
  if (projects.length && projectsGrid) setActiveProject(0);

  const container = document.querySelector(".bg-particles");
  for (let i = 0; i < 30; i++) {
    const dot = document.createElement("span");
    dot.style.left = Math.random() * 100 + "vw";
    dot.style.animationDuration = 8 + Math.random() * 100 + "s";
    dot.style.opacity = Math.random();
    container.appendChild(dot);
  }
})();