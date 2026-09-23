/* =============================================================
   diegoknochenhauer.store — shared behaviour
   Every block checks that its element exists, so the same file
   runs on the home page and on every research page.
   ============================================================= */
(function () {
  'use strict';
  var EMAIL = 'diegokvlv@gmail.com';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* Year */
  var yr = $('#year');
  if (yr) yr.textContent = new Date().getFullYear();

  /* Mobile menu */
  var btn = $('#menuBtn'), links = $('#navLinks');
  function setMenu(open) {
    if (!links) return;
    links.classList.toggle('open', open);
    document.body.classList.toggle('menu-open', open);
    if (btn) btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  if (btn) btn.addEventListener('click', function () { setMenu(!links.classList.contains('open')); });
  if (links) links.addEventListener('click', function (e) { if (e.target.tagName === 'A') setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  /* Counters */
  function countUp(el) {
    var target = +el.getAttribute('data-count'), suffix = el.getAttribute('data-suffix') || '';
    if (reduce) { el.textContent = target.toLocaleString() + suffix; return; }
    var start = null, dur = 1400;
    (function tick(t) {
      if (!start) start = t;
      var p = Math.min((t - start) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * e).toLocaleString() + suffix;
      if (p < 1) requestAnimationFrame(tick);
    })(performance.now());
  }

  /* Reveal on scroll, then start counters and skill bars inside it */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      en.target.classList.add('in');
      $$('[data-count]', en.target).forEach(countUp);
      $$('.bar-fill', en.target).forEach(function (b, i) {
        setTimeout(function () { b.style.width = b.getAttribute('data-fill') + '%'; }, reduce ? 0 : i * 60);
      });
      io.unobserve(en.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach(function (el) { io.observe(el); });

  /* Highlight the nav link for the section on screen (home page) */
  var navLinks = $$('#navLinks a[href^="#"]');
  var targets = navLinks.map(function (a) { return document.querySelector(a.getAttribute('href')); }).filter(Boolean);
  if (targets.length) {
    var navIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        navLinks.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    targets.forEach(function (t) { navIO.observe(t); });
  }

  /* Reading progress (research pages) */
  var bar = $('#progress');
  if (bar) {
    var onScroll = function () {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (h > 0 ? (window.pageYOffset / h) * 100 : 0) + '%';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* Contact form (Formspree, no page reload) */
  var form = $('#contact-form'), status = $('#form-status');
  if (form && status) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      status.textContent = 'Sending\u2026';
      fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (r) {
          if (!r.ok) throw new Error('rejected');
          status.textContent = 'Message sent. I\u2019ll reply by email.';
          form.reset();
        })
        .catch(function () {
          status.textContent = 'Message not sent. Please email ' + EMAIL + ' directly.';
        });
    });
  }
})();
