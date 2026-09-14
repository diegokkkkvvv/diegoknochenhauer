/* =============================================================
   diegoknochenhauer.store — shared behaviour
   Loaded by index.html and every /research/ page.
   Everything is guarded: a page that lacks an element just skips it.
   ============================================================= */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ROOT = document.body.getAttribute('data-root') || '';   // '' on home, '../' on subpages
  var EMAIL = 'knochenhauerdiego@gmail.com';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- current year ---------- */
  var yr = $('#year');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- theme ---------- */
  var root = document.documentElement;
  var SUN = 'M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0-5v3m0 14v3M2 12h3m14 0h3M4.2 4.2l2.1 2.1m11.4 11.4 2.1 2.1M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1';
  var MOON = 'M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9z';

  function paintTheme(t) {
    root.setAttribute('data-theme', t);
    var icon = $('#themeIcon');
    if (icon) {
      icon.innerHTML = '<path d="' + (t === 'dark' ? MOON : SUN) + '"/>';
      icon.setAttribute('stroke', t === 'dark' ? 'none' : 'currentColor');
      icon.setAttribute('fill', t === 'dark' ? 'currentColor' : 'none');
      icon.setAttribute('stroke-width', '2');
    }
    try { localStorage.setItem('dk-theme', t); } catch (e) {}
  }
  var saved = null;
  try { saved = localStorage.getItem('dk-theme'); } catch (e) {}
  paintTheme(saved || 'dark');

  var themeBtn = $('#themeBtn');
  if (themeBtn) themeBtn.addEventListener('click', function () {
    paintTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });

  /* ---------- sticky header, progress bar, back to top ---------- */
  var header = $('#siteHeader'), bar = $('#progress'), toTop = $('#toTop');
  function onScroll() {
    var y = window.pageYOffset;
    if (header) header.classList.toggle('stuck', y > 20);
    if (toTop) toTop.classList.toggle('show', y > 700);
    if (bar) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (toTop) toTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  });

  /* ---------- reveal on scroll ---------- */
  var revealEls = $$('.reveal');
  if (revealEls.length) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); revealObs.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { revealObs.observe(el); });
  }

  /* ---------- animated counters ---------- */
  var stats = $('#stats');
  if (stats) {
    var statsObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        $$('[data-count]', e.target).forEach(function (el) {
          var target = parseInt(el.getAttribute('data-count'), 10);
          var suffix = el.getAttribute('data-suffix') || '';
          if (reduced) { el.textContent = target.toLocaleString() + suffix; return; }
          var start = null, dur = 1400;
          function step(ts) {
            if (!start) start = ts;
            var p = Math.min((ts - start) / dur, 1);
            var eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(target * eased).toLocaleString() + suffix;
            if (p < 1) requestAnimationFrame(step);
          }
          requestAnimationFrame(step);
        });
        statsObs.unobserve(e.target);
      });
    }, { threshold: 0.4 });
    statsObs.observe(stats);
  }

  /* ---------- skill meters ---------- */
  var capGrid = $('#capGrid');
  if (capGrid) {
    var capObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        $$('.meter-fill', e.target).forEach(function (f, i) {
          setTimeout(function () { f.style.width = f.getAttribute('data-fill') + '%'; }, reduced ? 0 : i * 70);
        });
        capObs.unobserve(e.target);
      });
    }, { threshold: 0.25 });
    capObs.observe(capGrid);
  }

  /* ---------- experience tabs ---------- */
  var tabs = $$('.tab');
  if (tabs.length) {
    var selectTab = function (tab) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        var panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) panel.hidden = !on;
      });
    };
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { selectTab(t); });
      t.addEventListener('keydown', function (ev) {
        var next = null;
        if (ev.key === 'ArrowDown' || ev.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
        if (ev.key === 'ArrowUp' || ev.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
        if (next) { ev.preventDefault(); next.focus(); selectTab(next); }
      });
    });
  }

  /* ---------- research accordion (home page) ---------- */
  var cases = $$('.case');
  if (cases.length) {
    cases.forEach(function (card) {
      var btn = $('.case-btn', card), body = $('.case-body', card);
      btn.addEventListener('click', function () {
        var open = card.getAttribute('data-open') === 'true';
        cases.forEach(function (other) {
          other.setAttribute('data-open', 'false');
          $('.case-btn', other).setAttribute('aria-expanded', 'false');
          $('.case-body', other).style.maxHeight = null;
        });
        if (!open) {
          card.setAttribute('data-open', 'true');
          btn.setAttribute('aria-expanded', 'true');
          body.style.maxHeight = body.scrollHeight + 'px';
        }
      });
    });
    window.addEventListener('resize', function () {
      var open = $('.case[data-open="true"] .case-body');
      if (open) open.style.maxHeight = open.scrollHeight + 'px';
    });
  }

  /* ---------- active nav link (home page only) ---------- */
  var links = $$('#navLinks a');
  var sections = links
    .map(function (a) {
      var href = a.getAttribute('href');
      return href.charAt(0) === '#' ? document.querySelector(href) : null;
    })
    .filter(Boolean);
  if (sections.length) {
    var navObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) {
          a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { navObs.observe(s); });
  }

  /* ---------- mobile drawer ---------- */
  var drawer = $('#drawer'), menuBtn = $('#menuBtn');
  function setDrawer(open) {
    if (!drawer) return;
    drawer.classList.toggle('open', open);
    document.body.classList.toggle('nav-open', open);
    if (menuBtn) menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  if (menuBtn) menuBtn.addEventListener('click', function () { setDrawer(true); });
  if (drawer) drawer.addEventListener('click', function (e) {
    if (e.target.closest('[data-close]') || e.target.tagName === 'A') setDrawer(false);
  });

  /* ---------- copy email ---------- */
  var copyBtn = $('#copyEmail');
  if (copyBtn) copyBtn.addEventListener('click', function () {
    var note = $('#copyNote');
    function flash() {
      if (!note) return;
      note.classList.add('show');
      setTimeout(function () { note.classList.remove('show'); }, 1800);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(EMAIL).then(flash).catch(function () { window.location.href = 'mailto:' + EMAIL; });
    } else {
      window.location.href = 'mailto:' + EMAIL;
    }
  });

  /* ---------- command palette ---------- */
  var CMDS = [
    { label: 'About',                  hint: 'section', go: 'about' },
    { label: 'Experience',             hint: 'section', go: 'experience' },
    { label: 'Research',               hint: 'section', go: 'research' },
    { label: 'Capabilities',           hint: 'section', go: 'capabilities' },
    { label: 'Background & education', hint: 'section', go: 'background' },
    { label: 'Contact',                hint: 'section', go: 'contact' },
    { label: 'NVIDIA equity valuation',      hint: 'paper', url: ROOT + 'research/nvidia-valuation.html' },
    { label: 'COSO governance review',       hint: 'paper', url: ROOT + 'research/coso-governance.html' },
    { label: 'Fed rate policy & valuations', hint: 'paper', url: ROOT + 'research/fed-rate-policy.html' },
    { label: 'Email Diego',        hint: 'action', url: 'mailto:' + EMAIL },
    { label: 'Open LinkedIn',      hint: 'action', url: 'https://linkedin.com/in/diegoknochenhauer' },
    { label: 'Download CV',        hint: 'action', url: ROOT + 'assets/Diego-Knochenhauer-CV.pdf' },
    { label: 'Toggle light / dark', hint: 'action', theme: true }
  ];

  var pal = $('#cmdk'), palInput = $('#cmdkInput'), palList = $('#cmdkList');
  var shown = [], sel = 0;

  function renderPal(q) {
    q = (q || '').toLowerCase().trim();
    shown = CMDS.filter(function (c) {
      return !q || c.label.toLowerCase().indexOf(q) > -1 || c.hint.indexOf(q) > -1;
    });
    sel = 0;
    if (!shown.length) {
      palList.innerHTML = '<div class="cmdk-empty">Nothing matches that. Try \u201cresearch\u201d or \u201ccontact\u201d.</div>';
      return;
    }
    palList.innerHTML = shown.map(function (c, i) {
      return '<div class="cmdk-item' + (i === 0 ? ' sel' : '') + '" data-i="' + i + '">' +
             '<span>' + c.label + '</span><span class="hint">' + c.hint + '</span></div>';
    }).join('');
  }
  function markSel() {
    $$('.cmdk-item', palList).forEach(function (el, i) { el.classList.toggle('sel', i === sel); });
    var active = $('.cmdk-item.sel', palList);
    if (active) active.scrollIntoView({ block: 'nearest' });
  }
  function openPal() {
    pal.classList.add('open');
    document.body.classList.add('nav-open');
    palInput.value = '';
    renderPal('');
    palInput.focus();
  }
  function closePal() {
    if (!pal) return;
    pal.classList.remove('open');
    document.body.classList.remove('nav-open');
  }
  function runPal(c) {
    if (!c) return;
    closePal();
    if (c.theme) { paintTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'); return; }
    if (c.url) { window.open(c.url, c.url.indexOf('mailto:') === 0 ? '_self' : '_blank'); return; }
    if (c.go) {
      var target = ROOT ? null : document.getElementById(c.go);
      if (target) target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
      else window.location.href = ROOT + 'index.html#' + c.go;
    }
  }

  if (pal && palInput && palList) {
    var cmdkBtn = $('#cmdkBtn');
    if (cmdkBtn) cmdkBtn.addEventListener('click', openPal);
    pal.addEventListener('click', function (e) { if (e.target.closest('[data-cmdk-close]')) closePal(); });
    palList.addEventListener('click', function (e) {
      var item = e.target.closest('.cmdk-item');
      if (item) runPal(shown[parseInt(item.getAttribute('data-i'), 10)]);
    });
    palInput.addEventListener('input', function () { renderPal(palInput.value); });
    palInput.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(sel + 1, shown.length - 1); markSel(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(sel - 1, 0); markSel(); }
      else if (e.key === 'Enter') { e.preventDefault(); runPal(shown[sel]); }
    });
    document.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        pal.classList.contains('open') ? closePal() : openPal();
      }
      if (e.key === 'Escape') { closePal(); setDrawer(false); }
    });
  }

  /* ---------- contact form ---------- */
  var form = $('#contact-form'), status = $('#form-status');
  if (form && status) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      status.textContent = 'Sending\u2026';
      status.style.color = 'var(--text-dim)';
      fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (res) {
          if (!res.ok) throw new Error('rejected');
          status.textContent = 'Sent. I\u2019ll reply within a couple of days.';
          status.style.color = 'var(--signal)';
          form.reset();
        })
        .catch(function () {
          status.textContent = 'That didn\u2019t go through. Email ' + EMAIL + ' instead.';
          status.style.color = 'var(--alert)';
        });
    });
  }

  /* ---------- hero terminal ---------- */
  var term = $('#termBody');
  if (term) {
    var LINES = [
      { t: '<span class="term-prompt">$</span> cat summary.md' },
      { t: '' },
      { t: '<span class="term-key">education</span>    BBA Finance, Hult \u201927 \u00b7 Econ minor' },
      { t: '<span class="term-key">languages</span>    English \u00b7 Spanish' },
      { t: '<span class="term-key">location</span>     Cambridge, MA' },
      { t: '' },
      { t: '<span class="term-key">research</span>     NVIDIA DCF \u00b7 scenarios <span class="term-val">55 / 100 / 172</span>' },
      { t: '             COSO review \u00b7 <span class="term-val">5</span> components, <span class="term-val">17</span> principles' },
      { t: '             Fed cycles \u00b7 <span class="term-val">5</span> episodes, <span class="term-val">1,900bp</span>' },
      { t: '' },
      { t: '<span class="term-key">leadership</span>   Culver, <span class="term-val">2</span> summers \u00b7 <span class="term-val">36</span>-camper unit' },
      { t: '             within a <span class="term-val">1,500+</span> camper program' },
      { t: '             <span class="term-val">5</span>-team structure \u00b7 SOP \u00b7 <span class="term-val">37</span> slides' },
      { t: '' },
      { t: '<span class="term-key">status</span>       <span class="term-note">open to summer 2027 internships</span>' }
    ];
    if (reduced) {
      term.innerHTML = LINES.map(function (l) {
        return '<div class="term-line">' + (l.t || '&nbsp;') + '</div>';
      }).join('');
    } else {
      var li = 0;
      (function typeLine() {
        if (li >= LINES.length) {
          var c = document.createElement('span');
          c.className = 'caret';
          term.appendChild(c);
          return;
        }
        var div = document.createElement('div');
        div.className = 'term-line';
        div.innerHTML = LINES[li].t || '&nbsp;';
        div.style.opacity = '0';
        term.appendChild(div);
        requestAnimationFrame(function () {
          div.style.transition = 'opacity .28s ease';
          div.style.opacity = '1';
        });
        li++;
        setTimeout(typeLine, LINES[li - 1].t === '' ? 160 : 340);
      })();
    }
  }
})();