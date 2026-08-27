(function () {
  'use strict';

  var FORM_ENDPOINT = 'https://formspree.io/f/xnqyeboy';

  var THEME_KEY = 'sahil-portfolio-theme';
  var MOBILE_BREAKPOINT = 768;

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  };

  var themeToggle = $('#theme-toggle');

  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);

    var label = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
    themeToggle.setAttribute('aria-label', label);
    themeToggle.setAttribute('title', label);
  }

  themeToggle.addEventListener('click', function () {
    var next = currentTheme() === 'dark' ? 'light' : 'dark';
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch (e) {}
    applyTheme(next);
  });

  applyTheme(currentTheme());

  var menuToggle = $('#menu-toggle');
  var mobileMenu = $('#mobile-menu');

  function setMenu(open) {
    mobileMenu.hidden = !open;
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Menu');
  }

  menuToggle.addEventListener('click', function () {
    setMenu(mobileMenu.hidden);
  });

  $$('.mobile-menu__link, .mobile-menu__social a', mobileMenu).forEach(function (link) {
    link.addEventListener('click', function () { setMenu(false); });
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth >= MOBILE_BREAKPOINT && !mobileMenu.hidden) setMenu(false);
  });

  var roles = $$('.role');

  function setRole(role, open) {
    var button = $('.role__header', role);
    var panel = $('.role__panel', role);

    role.classList.toggle('is-open', open);
    button.setAttribute('aria-expanded', String(open));
    panel.hidden = !open;
  }

  function openRole(target) {
    roles.forEach(function (role) {
      setRole(role, role === target);
    });
  }

  roles.forEach(function (role) {
    $('.role__header', role).addEventListener('click', function () {
      var isOpen = role.classList.contains('is-open');
      if (isOpen) {
        setRole(role, false);
      } else {
        openRole(role);
      }
    });
  });

  $$('[data-open-role]').forEach(function (trigger) {
    trigger.addEventListener('click', function (event) {
      var role = document.getElementById(trigger.getAttribute('data-open-role'));
      if (!role) return;

      event.preventDefault();
      openRole(role);
      role.scrollIntoView({ behavior: 'smooth', block: 'center' });
      $('.role__header', role).focus({ preventScroll: true });
    });
  });

  var modal = $('#modal');
  var modalDialog = $('.modal__dialog', modal);
  var modalSource = $('#modal-source');
  var lastFocused = null;

  var FOCUSABLE = 'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])';

  function openModal(trigger) {
    lastFocused = trigger;

    var source = trigger.getAttribute('data-source');
    if (source) modalSource.href = source;

    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    modalDialog.focus();
  }

  function closeModal() {
    if (modal.hidden) return;

    modal.hidden = true;
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
    lastFocused = null;
  }

  $$('.card__nodemo').forEach(function (button) {
    button.addEventListener('click', function () { openModal(button); });
  });

  $$('[data-close-modal]', modal).forEach(function (el) {
    el.addEventListener('click', closeModal);
  });

  modal.addEventListener('keydown', function (event) {
    if (event.key !== 'Tab') return;

    var items = $$(FOCUSABLE, modalDialog);
    if (!items.length) return;

    var first = items[0];
    var last = items[items.length - 1];

    if (event.shiftKey && (document.activeElement === first || document.activeElement === modalDialog)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') return;
    closeModal();
    if (!mobileMenu.hidden) setMenu(false);
  });

  var form = $('#contact-form');
  var formFoot = $('.form__foot', form);
  var formNote = $('#form-note');
  var emailField = $('#field-email');
  var emailInput = $('input', emailField);
  var emailError = $('#email-error');

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  if (FORM_ENDPOINT) formNote.hidden = true;

  function setEmailError(bad) {
    emailField.classList.toggle('is-error', bad);
    emailError.hidden = !bad;
    if (bad) {
      emailInput.setAttribute('aria-invalid', 'true');
    } else {
      emailInput.removeAttribute('aria-invalid');
    }
  }

  function showSent() {
    var chip = document.createElement('span');
    chip.className = 'form__sent';
    chip.setAttribute('role', 'status');
    chip.textContent = '✓ Message sent';

    var button = $('.btn--submit', formFoot);
    if (button) button.replaceWith(chip);
    if (formNote) formNote.hidden = true;
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    var email = emailInput.value.trim();
    if (!EMAIL_RE.test(email)) {
      setEmailError(true);
      emailInput.focus();
      return;
    }
    setEmailError(false);

    if (!FORM_ENDPOINT) {
      showSent();
      return;
    }

    var button = $('.btn--submit', formFoot);
    if (button) button.disabled = true;

    fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: new FormData(form)
    })
      .then(function (response) {
        if (!response.ok) throw new Error('Form endpoint returned ' + response.status);
        showSent();
      })
      .catch(function () {
        if (button) button.disabled = false;
        formNote.hidden = false;
        formNote.textContent = 'Send failed, please email me instead';
      });
  });

  emailInput.addEventListener('input', function () {
    if (emailField.classList.contains('is-error') && EMAIL_RE.test(emailInput.value.trim())) {
      setEmailError(false);
    }
  });

  var SPY_OFFSET = 96;

  var spySections = ['work', 'experience', 'about', 'contact']
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  var spyLinks = $$('.nav-links__item, .mobile-menu__link');

  function setActiveSection(id) {
    spyLinks.forEach(function (link) {
      var isActive = link.getAttribute('href') === '#' + id;
      link.classList.toggle('is-active', isActive);
      if (isActive) {
        link.setAttribute('aria-current', 'location');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  function currentSection() {
    var atBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 2;
    if (atBottom) return spySections[spySections.length - 1].id;

    var active = '';
    spySections.forEach(function (section) {
      if (section.getBoundingClientRect().top <= SPY_OFFSET) active = section.id;
    });
    return active;
  }

  var spyQueued = false;

  function updateSpy() {
    spyQueued = false;
    setActiveSection(currentSection());
  }

  window.addEventListener('scroll', function () {
    if (spyQueued) return;
    spyQueued = true;
    window.requestAnimationFrame(updateSpy);
  }, { passive: true });

  window.addEventListener('resize', updateSpy);

  spyLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      setActiveSection(link.getAttribute('href').slice(1));
    });
  });

  updateSpy();

  $$('a[href="#top"]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      event.preventDefault();
      var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
      setMenu(false);

      if (location.hash) {
        history.replaceState(null, '', location.pathname + location.search);
      }
    });
  });

  function parseMonth(value) {
    if (!value) return null;
    var parts = value.split('-');
    return new Date(Number(parts[0]), Number(parts[1]) - 1, 1);
  }

  function monthIndex(date) {
    return date.getFullYear() * 12 + date.getMonth();
  }

  var MERGE_OVERLAPS = false;
  var INCLUSIVE_END = false;

  function employedMonths() {
    var ranges = [];

    roles.forEach(function (role) {
      var start = parseMonth(role.getAttribute('data-start'));
      if (!start) return;

      var end = parseMonth(role.getAttribute('data-end')) || new Date();
      ranges.push([monthIndex(start), monthIndex(end) + (INCLUSIVE_END ? 1 : 0)]);
    });

    if (!MERGE_OVERLAPS) {
      return ranges.reduce(function (total, range) {
        return total + Math.max(0, range[1] - range[0]);
      }, 0);
    }

    ranges.sort(function (a, b) { return a[0] - b[0]; });

    var total = 0;
    var open = null;

    ranges.forEach(function (range) {
      if (open && range[0] <= open[1]) {
        open[1] = Math.max(open[1], range[1]);
      } else {
        if (open) total += open[1] - open[0];
        open = [range[0], range[1]];
      }
    });
    if (open) total += open[1] - open[0];

    return total;
  }

  function formatDuration(months) {
    var years = Math.floor(months / 12);
    var rest = months % 12;
    if (!years) return rest + 'm';
    return rest ? years + 'y ' + rest + 'm' : years + 'y';
  }

  function updateFigures() {
    var companies = {};

    roles.forEach(function (role) {
      var company = role.getAttribute('data-company');
      if (company) companies[company] = true;
    });

    $('#stat-experience').textContent = formatDuration(employedMonths());
    $('#stat-companies').textContent = String(Object.keys(companies).length);

    var projects = $$('.card').length;
    $('#project-count').textContent = projects + (projects === 1 ? ' project' : ' projects');
  }

  updateFigures();

  $('#footer-year').textContent = String(new Date().getFullYear());
})();
