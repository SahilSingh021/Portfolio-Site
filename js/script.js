(() => {
  const themeToggle = document.getElementById("themeToggle");
  const themeIcon   = document.getElementById("themeIcon");

  const applyTheme = (theme) => {
    document.documentElement.setAttribute("data-theme", theme);
    if (themeIcon) {
      themeIcon.className = theme === "dark" ? "ri-sun-line" : "ri-moon-line";
    }
    localStorage.setItem("theme", theme);
  };

  const initialTheme = document.documentElement.getAttribute("data-theme") || "light";
  applyTheme(initialTheme);

  themeToggle?.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    applyTheme(current === "dark" ? "light" : "dark");
  });

  const header = document.querySelector(".site-header");
  const menuToggle = document.getElementById("menuToggle");
  const mobileMenu = document.getElementById("mobileMenu");

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const desktopMQ = window.matchMedia("(min-width: 981px)");

  const navLinks = Array.from(document.querySelectorAll("[data-nav]")).filter(
    (el) => el.tagName.toLowerCase() === "a"
  );

  const sections = [
    { key: "home",       el: document.getElementById("home") },
    { key: "about",      el: document.getElementById("about") },
    { key: "skills",     el: document.getElementById("skills") },
    { key: "experience", el: document.getElementById("experience") },
    { key: "projects",   el: document.getElementById("projects") },
    { key: "contact",    el: document.getElementById("contact") },
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

  document.addEventListener("click", (e) => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;

    const href = anchor.getAttribute("href");
    if (!href || href === "#") return;

    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();
    scrollToEl(target);

    const key = anchor.dataset.nav || href.replace("#", "");
    if (key) setActiveNav(key);

    history.replaceState(null, "", href);

    if (mobileMenu && !mobileMenu.hidden) closeMenu();
  });

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

  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
  const statYear = document.getElementById("stat-year");
  if (statYear) statYear.textContent = String(new Date().getFullYear());

  // live stats from timeline
  (function () {
    const MONTHS = { Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11 };
    function parseDate(str) {
      str = str.trim();
      if (/present/i.test(str)) return new Date();
      const [m, y] = str.split(" ");
      return new Date(parseInt(y), MONTHS[m] ?? 0, 1);
    }
    const dateEls = document.querySelectorAll(".timeline-date");
    let minStart = null, maxEnd = null;
    dateEls.forEach(el => {
      const parts = el.textContent.trim().split(/\s*[–\-]\s*/);
      if (parts.length < 2) return;
      const s = parseDate(parts[0]), e = parseDate(parts[1]);
      if (!minStart || s < minStart) minStart = s;
      if (!maxEnd || e > maxEnd) maxEnd = e;
    });
    const elYears = document.getElementById("stat-years");
    if (elYears && minStart && maxEnd) {
      const yrs = Math.round((maxEnd - minStart) / (1000 * 60 * 60 * 24 * 365));
      elYears.textContent = yrs || 1;
    }
    const elCo = document.getElementById("stat-companies");
    if (elCo) elCo.textContent = document.querySelectorAll(".timeline-item").length;
  })();

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
    {
      title: "Portfolio",
      subtitle: "Personal project • this site",
      description:
        "A personal portfolio built from scratch using vanilla HTML, CSS, and JavaScript. Designed to be fast, clean, and easy to maintain without relying on any frameworks or build tools.",
      stack: ["HTML", "CSS", "JS"],
      highlights: [
        "Light and dark mode with system preference detection",
        "Seamless infinite ticker using requestAnimationFrame",
        "Typewriter animation cycling through role descriptions",
        "Scroll-reveal animations and a JS-driven project carousel",
      ],
      tags: ["Vanilla JS", "CSS", "No Framework"],
      current: true,
      links: { demo: null, repo: "https://github.com/SahilSingh021/Portfolio-Site" },
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

  const renderProjectCard = (p, idx) => {
    const stackHtml = (p.stack || []).map(pill).join("");
    const highlightsHtml = (p.highlights || []).map((x) => `<li>${escapeHtml(x)}</li>`).join("");
    const num = String((idx ?? 0) + 1).padStart(2, "0");

    const demoBtn = p.current
      ? `<span class="btn btn--current btn--small"><i class="ri-radio-button-line" aria-hidden="true"></i> Current</span>`
      : p.links?.demo
        ? `<a class="btn btn--primary btn--small" href="${escapeHtml(p.links.demo)}" target="_blank" rel="noreferrer"><i class="ri-external-link-line" aria-hidden="true"></i> Live Demo</a>`
        : `<button class="btn btn--primary btn--small" type="button" data-open-demo-modal><i class="ri-play-circle-line" aria-hidden="true"></i> Live Demo</button>`;

    const repoBtn = p.links?.repo
      ? `<a class="btn btn--ghost btn--small" href="${escapeHtml(p.links.repo)}" target="_blank" rel="noreferrer"><i class="ri-github-line" aria-hidden="true"></i> Repo</a>`
      : "";

    return `
      <article class="project-card project-swap-in">
        <div class="pc-wrap">
          <div class="pc-top">
            <span class="pc-num mono">${num}</span>
            <div class="pc-stack">${stackHtml}</div>
          </div>
          <h3 class="pc-title">${escapeHtml(p.title)}</h3>
          <p class="pc-sub">${escapeHtml(p.subtitle)}</p>
          <p class="pc-desc">${escapeHtml(p.description)}</p>
          ${highlightsHtml ? `<ul class="pc-highlights">${highlightsHtml}</ul>` : ""}
          <div class="pc-footer">
            <div class="pc-cta">${demoBtn}${repoBtn}</div>
          </div>
        </div>
      </article>
    `;
  };

  const bindModalButtons = (root) => {
    root.querySelectorAll("[data-open-demo-modal]").forEach((btn) => btn.addEventListener("click", openModal));
  };

  const renderMobileList = () => {
    if (!projectsList) return;
    projectsList.innerHTML = projects.map((p, i) => renderProjectCard(p, i)).join("");
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

  let transitioning = false;

  const setActiveProject = (idx, dir = 1) => {
    if (transitioning) return;
    transitioning = true;

    const nextIndex = (idx + projects.length) % projects.length;
    const outClass = "pc-out";
    const inClass  = dir >= 0 ? "pc-in-next" : "pc-in-prev";

    const old = projectsGrid?.querySelector(".project-card");
    if (old) {
      old.classList.add(outClass);
      setTimeout(() => {
        activeIndex = nextIndex;
        if (projectsGrid) {
          projectsGrid.innerHTML = renderProjectCard(projects[activeIndex], activeIndex);
          projectsGrid.querySelector(".project-card")?.classList.add(inClass);
          bindModalButtons(projectsGrid);
        }
        renderDots();
        updateNavState();
        transitioning = false;
      }, 180);
    } else {
      activeIndex = nextIndex;
      if (projectsGrid) {
        projectsGrid.innerHTML = renderProjectCard(projects[activeIndex], activeIndex);
        projectsGrid.querySelector(".project-card")?.classList.add(inClass);
        bindModalButtons(projectsGrid);
      }
      renderDots();
      updateNavState();
      transitioning = false;
    }
  };

  prevBtn?.addEventListener("click", () => setActiveProject(activeIndex - 1, -1));
  nextBtn?.addEventListener("click", () => setActiveProject(activeIndex + 1,  1));

  document.addEventListener("keydown", (e) => {
    const tagName = document.activeElement?.tagName?.toLowerCase();
    const typing = tagName === "input" || tagName === "textarea";
    if (typing) return;
    if (e.key === "ArrowLeft") setActiveProject(activeIndex - 1);
    if (e.key === "ArrowRight") setActiveProject(activeIndex + 1);
  });

  function initTypewriter() {
    const el = document.querySelector(".hero-desc");
    if (!el || prefersReduced) {
        return;
    }

    const phrases = [
      "I build practical software and web experiences.",
      "I write C# backends, REST APIs, and .NET systems.",
      "I work at the binary level: C++ and x86 assembly.",
      "I reverse engineer binaries and analyse PE structures.",
      "I build from the ground up, not just glue APIs together.",
    ];

    el.innerHTML = '<span class="tw-text"></span><span class="tw-cursor" aria-hidden="true"></span>';
    const twText = el.querySelector(".tw-text");

    let pi = 0, ci = 0, deleting = false;
    const TYPE  = 44;   // ms per character while typing
    const DEL   = 30;   // ms per character while deleting
    const HOLD  = 2000; // pause after phrase is fully typed
    const REST  = 380;  // pause after phrase is fully deleted

    function tick() {
      const phrase = phrases[pi];
      if (!deleting) {
        ci++;
        twText.textContent = phrase.slice(0, ci);
        if (ci === phrase.length) {
          deleting = true;
          setTimeout(tick, HOLD);
          return;
        }
        setTimeout(tick, TYPE);
      } else {
        ci--;
        twText.textContent = phrase.slice(0, ci);
        if (ci === 0) {
          deleting = false;
          pi = (pi + 1) % phrases.length;
          setTimeout(tick, REST);
          return;
        }
        setTimeout(tick, DEL);
      }
    }

    // slight delay so the reveal animation finishes first
    setTimeout(tick, 700);
  }

  function initTicker() {
    const wrap = document.querySelector(".ticker-wrap");
    const orig = document.querySelector(".ticker-track");
    if (!wrap || !orig || prefersReduced) return;

    // wrap > inner > [orig + clones]
    const inner = document.createElement("div");
    inner.className = "ticker-inner";
    wrap.appendChild(inner);
    inner.appendChild(orig); // move original into inner

    // measure after fonts load so we get the real width
    const trackW = orig.offsetWidth;
    if (!trackW) return;

    // enough copies to cover 3x the viewport
    const totalNeeded = Math.max(2, Math.ceil((window.innerWidth * 3) / trackW) + 1);
    for (let i = 1; i < totalNeeded; i++) {
      inner.appendChild(orig.cloneNode(true));
    }

    let pos     = 0;
    let running = true;
    const SPEED = 0.4; // px per frame at 60 fps ≈ 48 px/s

    wrap.addEventListener("mouseenter", () => running = false);
    wrap.addEventListener("mouseleave",  () => running = true);

    (function tick() {
      if (running) {
        pos -= SPEED;
        if (pos <= -trackW) pos += trackW;
        inner.style.transform = `translateX(${pos}px)`;
      }
      requestAnimationFrame(tick);
    })();
  }

  recalcSectionTops();
  setHeaderState();
  setActiveNav(getActiveKeyFromScroll());
  syncMenuForViewport();

  initTypewriter();
  renderMobileList();
  if (projects.length && projectsGrid) setActiveProject(0);

  window.addEventListener("load", () => {
    recalcSectionTops();
    setActiveNav(getActiveKeyFromScroll());
    initTicker();
  });

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => {
    recalcSectionTops();
    setActiveNav(getActiveKeyFromScroll());
    syncMenuForViewport();
  });
})();