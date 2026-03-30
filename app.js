/* ==================== MUHAMMAD ALI — APP.JS ==================== */
/* Streamlined Edition — clean, commented, all features preserved  */
(function () {
  'use strict';

  /* --- ROUTER --- */
  var PAGES = ['home','early-life','career','civil-rights','legacy','quotes','stats','works-cited'];
  var currentPage = null;

  function getHash() {
    var h = location.hash.replace('#', '') || 'home';
    return PAGES.indexOf(h) !== -1 ? h : 'home';
  }

  function navigateTo(page) {
    if (page === currentPage) return;
    var oldEl = currentPage ? document.getElementById('page-' + currentPage) : null;
    var newEl = document.getElementById('page-' + page);
    if (!newEl) return;
    closeMobileNav();

    // Active nav link
    document.querySelectorAll('.nav-link').forEach(function (l) {
      l.classList.toggle('active', l.getAttribute('data-nav') === page);
    });

    if (oldEl) {
      runTransition(function () {
        resetPage(oldEl);
        showPage(newEl, page);
      });
    } else {
      showPage(newEl, page);
    }
  }

  function resetPage(el) {
    el.classList.remove('visible', 'active');
    el.querySelectorAll('[data-count]').forEach(function (c) { c._counted = false; c.textContent = '0'; });
    el.querySelectorAll('.shown').forEach(function (s) { s.classList.remove('shown'); });
    el.querySelectorAll('.bar-fill').forEach(function (b) { b.style.width = '0'; });
    el.querySelectorAll('.ring-fill').forEach(function (r) { r.style.strokeDashoffset = '339.292'; });
    el.querySelectorAll('.hl').forEach(function (h) { h.classList.remove('lit'); });
  }

  function showPage(el, page) {
    window.scrollTo(0, 0);
    el.classList.add('active');
    el.offsetHeight; // force reflow
    requestAnimationFrame(function () { el.classList.add('visible'); });
    currentPage = page;
    splitTextInit(el);
    initHighlight(el);
    setTimeout(function () { initReveals(); initPageAnim(page); }, 100);
  }

  /* --- PAGE TRANSITION (sliced wipe) --- */
  function runTransition(cb) {
    var slices = document.querySelectorAll('#transition .slice');
    slices.forEach(function (s) {
      s.style.transformOrigin = 'bottom';
      s.style.transform = 'scaleY(0)';
      s.style.transition = 'none';
    });
    requestAnimationFrame(function () {
      slices.forEach(function (s, i) {
        s.style.transition = 'transform .35s cubic-bezier(.65,0,.35,1) ' + (i * .04) + 's';
        s.style.transform = 'scaleY(1)';
      });
    });
    setTimeout(function () {
      cb();
      setTimeout(function () {
        slices.forEach(function (s, i) {
          s.style.transformOrigin = 'top';
          s.style.transition = 'transform .35s cubic-bezier(.65,0,.35,1) ' + (i * .04) + 's';
          s.style.transform = 'scaleY(0)';
        });
      }, 50);
    }, 450);
  }

  /* --- SPLIT TEXT (letter-by-letter reveal) --- */
  function splitTextInit(container) {
    container.querySelectorAll('.split-text').forEach(function (el) {
      if (el.querySelector('.char')) {
        // Already split — just reset delays
        el.querySelectorAll('.char').forEach(function (c, i) {
          c.style.transitionDelay = (i * .03) + 's';
        });
        return;
      }
      // Decode HTML entities via temp div
      var tmp = document.createElement('div');
      tmp.innerHTML = el.innerHTML;
      var idx = 0;
      el.innerHTML = '';

      Array.prototype.slice.call(tmp.childNodes).forEach(function (node) {
        if (node.nodeType === 1 && node.tagName === 'BR') {
          el.appendChild(document.createElement('br'));
          return;
        }
        var text = node.textContent || '';
        var words = text.split(/\s+/).filter(Boolean);
        if (text.match(/^\s/) && el.lastChild) addSpace(el);

        words.forEach(function (w, wi) {
          if (wi > 0) addSpace(el);
          var wrap = document.createElement('span');
          wrap.className = 'word';
          w.split('').forEach(function (ch) {
            var s = document.createElement('span');
            s.className = 'char';
            s.textContent = ch;
            s.style.transitionDelay = (idx++ * .03) + 's';
            wrap.appendChild(s);
          });
          el.appendChild(wrap);
        });
      });
    });
  }

  function addSpace(parent) {
    var s = document.createElement('span');
    s.className = 'char-space';
    s.textContent = '\u00A0';
    parent.appendChild(s);
  }

  /* --- HIGHLIGHT TEXT (words illuminate on scroll) --- */
  function initHighlight(container) {
    container.querySelectorAll('[data-highlight]').forEach(function (el) {
      if (el.querySelector('.hl')) return;
      var words = el.textContent.split(/\s+/).filter(Boolean);
      el.innerHTML = words.map(function (w) {
        return '<span class="hl">' + w + '</span>';
      }).join(' ');
    });
  }

  function updateHighlight() {
    var pg = document.querySelector('.page.active');
    if (!pg) return;
    pg.querySelectorAll('[data-highlight]').forEach(function (el) {
      var rect = el.getBoundingClientRect();
      var vh = innerHeight;
      var start = vh * .85, end = vh * .25;
      el.querySelectorAll('.hl').forEach(function (w, i, all) {
        var prog = Math.max(0, Math.min(1, 1 - (rect.top - end) / (start - end)));
        if (prog > i / all.length) w.classList.add('lit');
      });
    });
  }

  /* --- TYPEWRITER --- */
  function initTypewriter(el) {
    if (el._tw) return;
    el._tw = true;
    var full = el.textContent;
    el.textContent = '';
    el.classList.add('typing');
    var i = 0;
    var iv = setInterval(function () {
      if (i < full.length) { el.textContent += full[i++]; }
      else { clearInterval(iv); el.classList.remove('typing'); el.classList.add('done'); }
    }, 35);
  }

  /* --- HASH ROUTING --- */
  addEventListener('hashchange', function () { navigateTo(getHash()); });
  document.querySelectorAll('[data-nav]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      var t = el.getAttribute('data-nav');
      if (el.tagName !== 'A') { e.preventDefault(); location.hash = '#' + t; }
    });
  });

  /* --- CUSTOM CURSOR (only on non-touch devices) --- */
  var cursor = document.getElementById('cursor');
  var cx = 0, cy = 0, rx = 0, ry = 0;

  if (cursor && matchMedia('(hover:hover) and (pointer:fine)').matches) {
    document.addEventListener('mousemove', function (e) {
      rx = e.clientX; ry = e.clientY;
    }, { passive: true });

    (function loop() {
      var dx = rx - cx, dy = ry - cy;
      if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
        cx += dx * .15;
        cy += dy * .15;
        cursor.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0)';
      }
      requestAnimationFrame(loop);
    })();

    var hoverSel = 'a,button,[data-nav],.nav-card,.legacy-card,.quote-card,.impact-card,.flip-card,.gal-item,.tag,.cite-item';
    document.addEventListener('mouseover', function (e) {
      if (e.target.closest(hoverSel)) cursor.classList.add('hover');
    });
    document.addEventListener('mouseout', function (e) {
      if (e.target.closest(hoverSel)) cursor.classList.remove('hover');
    });
  }

  /* --- MAGNETIC CARDS --- */
  document.querySelectorAll('.magnetic').forEach(function (el) {
    el.addEventListener('mousemove', function (e) {
      var r = el.getBoundingClientRect();
      var dx = ((e.clientX - r.left) / r.width - .5) * 8;
      var dy = ((e.clientY - r.top) / r.height - .5) * 8;
      el.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
    });
    el.addEventListener('mouseleave', function () {
      el.style.transform = '';
      el.style.transition = 'transform .5s cubic-bezier(.16,1,.3,1)';
      setTimeout(function () { el.style.transition = ''; }, 500);
    });
  });

  /* --- THEME TOGGLE --- */
  var themeBtn = document.getElementById('themeBtn');
  var html = document.documentElement;

  themeBtn.addEventListener('click', function () {
    var dark = html.getAttribute('data-theme') === 'dark';
    html.setAttribute('data-theme', dark ? 'light' : 'dark');
    themeBtn.textContent = dark ? '🌙' : '☀️';
  });

  /* --- MOBILE NAV --- */
  var hamburger = document.getElementById('hamburger');
  var navLinks = document.getElementById('navLinks');

  function closeMobileNav() {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  }

  hamburger.addEventListener('click', function () {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });

  navLinks.querySelectorAll('.nav-link').forEach(function (l) {
    l.addEventListener('click', closeMobileNav);
  });

  /* --- SCROLL BAR + NAV HIDE/SHOW (single listener, RAF-throttled) --- */
  var scrollBar = document.getElementById('scrollBar');
  var nav = document.getElementById('nav');
  var lastY = 0, navHid = false, scrollTick = false;

  addEventListener('scroll', function () {
    if (!scrollTick) {
      scrollTick = true;
      requestAnimationFrame(function () {
        var y = scrollY;
        var h = document.documentElement.scrollHeight - innerHeight;
        scrollBar.style.width = (h > 0 ? y / h * 100 : 0) + '%';
        if (y > 100 && y > lastY && !navHid) { nav.classList.add('hidden'); navHid = true; }
        else if (y < lastY && navHid) { nav.classList.remove('hidden'); navHid = false; }
        lastY = y;
        updateHighlight();
        scrollTick = false;
      });
    }
  }, { passive: true });

  /* --- SCROLL REVEALS (IntersectionObserver) --- */
  function initReveals() {
    // Standard reveals
    var els = document.querySelectorAll('.page.active .reveal:not(.shown)');
    if (els.length) {
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('shown'); obs.unobserve(e.target); }
        });
      }, { threshold: .1, rootMargin: '0px 0px -50px 0px' });
      els.forEach(function (el) { obs.observe(el); });
    }

    // Image clip-path reveals
    var imgs = document.querySelectorAll('.page.active .img-reveal:not(.shown)');
    if (imgs.length) {
      var imgObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('shown'); imgObs.unobserve(e.target); }
        });
      }, { threshold: .2 });
      imgs.forEach(function (el) { imgObs.observe(el); });
    }

    // Typewriters
    document.querySelectorAll('.page.active [data-typewriter]').forEach(function (el) {
      var twObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { initTypewriter(el); twObs.unobserve(e.target); }
        });
      }, { threshold: .5 });
      twObs.observe(el);
    });
  }

  /* --- GSAP PAGE ANIMATIONS --- */
  function initPageAnim(page) {
    // Kill old ScrollTriggers
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.getAll().forEach(function (t) { t.kill(); });
    }

    // Parallax hero backgrounds (all pages)
    var bg = document.querySelector('#page-' + page + ' .parallax-bg');
    if (bg && typeof gsap !== 'undefined') {
      gsap.to(bg, {
        y: 100, ease: 'none',
        scrollTrigger: { trigger: bg.closest('.hero'), start: 'top top', end: 'bottom top', scrub: 1 }
      });
    }

    // Divider line animations
    if (typeof gsap !== 'undefined') {
      document.querySelectorAll('#page-' + page + ' .divider').forEach(function (d) {
        gsap.from(d, {
          scaleX: 0, duration: .8, ease: 'power2.out',
          scrollTrigger: { trigger: d, start: 'top 85%', toggleActions: 'play none none none' }
        });
      });
    }

    // Page-specific animations
    if (page === 'home') initHome();
    else if (page === 'civil-rights') initCivilRights();

    // Tilt cards (home, civil-rights, legacy, quotes, stats)
    if (['home','civil-rights','legacy','quotes','stats'].indexOf(page) !== -1) initTilt();

    // Counters (legacy & stats)
    if (page === 'legacy' || page === 'stats') initCounters();

    // Stats-specific (rings & bars)
    if (page === 'stats') initStats();

    if (typeof ScrollTrigger !== 'undefined') {
      setTimeout(function () { ScrollTrigger.refresh(); }, 300);
    }
  }

  /* --- HOME PAGE --- */
  function initHome() {
    // Hero title 3D tilt on mouse
    var title = document.getElementById('heroTitle');
    var hero = document.getElementById('homeHero');
    if (hero && title) {
      hero.addEventListener('mousemove', function (e) {
        var r = hero.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - .5;
        var y = (e.clientY - r.top) / r.height - .5;
        title.style.transform = 'perspective(800px) rotateY(' + (x * 8) + 'deg) rotateX(' + (-y * 6) + 'deg)';
      });
      hero.addEventListener('mouseleave', function () {
        title.style.transform = 'perspective(800px) rotateY(0) rotateX(0)';
        title.style.transition = 'transform .5s cubic-bezier(.16,1,.3,1)';
        setTimeout(function () { title.style.transition = ''; }, 500);
      });
    }

    // Portrait parallax
    var portrait = document.getElementById('portraitImg');
    if (portrait && typeof gsap !== 'undefined') {
      gsap.to(portrait, {
        y: -80, ease: 'none',
        scrollTrigger: { trigger: '.portrait-band', start: 'top bottom', end: 'bottom top', scrub: 1 }
      });
    }

    // Three.js particles
    initParticles();
  }

  /* --- CIVIL RIGHTS PAGE --- */
  function initCivilRights() {
    if (typeof gsap === 'undefined') return;

    // Big year zoom
    var bigYear = document.querySelector('#page-civil-rights .big-year');
    if (bigYear) {
      gsap.from(bigYear, {
        scale: .3, opacity: 0, duration: 1.5, ease: 'power3.out',
        scrollTrigger: { trigger: bigYear, start: 'top 80%', toggleActions: 'play none none none' }
      });
    }

    // Vietnam quote word reveal
    var vq = document.getElementById('vietnamQuote');
    if (vq && !vq.querySelector('span')) {
      var words = vq.textContent.trim().split(/\s+/);
      vq.innerHTML = words.map(function (w) { return '<span>' + w + '</span>'; }).join(' ');
      var spans = vq.querySelectorAll('span');
      ScrollTrigger.create({
        trigger: vq, start: 'top 75%',
        onEnter: function () {
          spans.forEach(function (s, i) {
            setTimeout(function () { s.classList.add('vis'); }, i * 80);
          });
        }
      });
    }
  }

  /* --- STATS PAGE --- */
  function initStats() {
    var pg = document.querySelector('#page-stats');
    if (!pg) return;

    // Ring charts
    pg.querySelectorAll('.ring').forEach(function (ring) {
      var pct = parseInt(ring.getAttribute('data-pct'), 10);
      var circ = 339.292;
      var offset = circ - (pct / 100) * circ;
      var fill = ring.querySelector('.ring-fill');
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            setTimeout(function () { fill.style.strokeDashoffset = offset; }, 200);
            obs.unobserve(e.target);
          }
        });
      }, { threshold: .3 });
      obs.observe(ring);
    });

    // Stat bars
    pg.querySelectorAll('.bar-fill').forEach(function (bar) {
      var w = bar.getAttribute('data-w');
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            setTimeout(function () { bar.style.width = w + '%'; }, 200);
            obs.unobserve(e.target);
          }
        });
      }, { threshold: .3 });
      obs.observe(bar.closest('.bar-row'));
    });
  }

  /* --- TILT CARDS --- */
  function initTilt() {
    if (matchMedia('(hover:none)').matches) return;
    var pg = document.querySelector('.page.active');
    if (!pg) return;

    pg.querySelectorAll('[data-tilt]').forEach(function (c) {
      if (c._tilt) return;
      c._tilt = true;
      c.addEventListener('mousemove', function (e) {
        var r = c.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - .5;
        var y = (e.clientY - r.top) / r.height - .5;
        c.style.transform = 'perspective(600px) rotateY(' + (x * 10) + 'deg) rotateX(' + (-y * 10) + 'deg) scale(1.02)';
      });
      c.addEventListener('mouseleave', function () {
        c.style.transform = '';
        c.style.transition = 'transform .5s cubic-bezier(.16,1,.3,1)';
        setTimeout(function () { c.style.transition = ''; }, 500);
      });
    });
  }

  /* --- COUNTERS --- */
  function initCounters() {
    var pg = document.querySelector('.page.active');
    if (!pg) return;

    pg.querySelectorAll('[data-count]').forEach(function (el) {
      if (el._counted) return;
      var target = parseInt(el.getAttribute('data-count'), 10);
      var suffix = el.getAttribute('data-suffix') || '';
      var trigger = el.closest('.ring-item') || el.closest('.num-item') || el;

      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting && !el._counted) {
            el._counted = true;
            obs.unobserve(trigger);
            var start = performance.now();
            (function tick(now) {
              var p = Math.min((now - start) / 1500, 1);
              el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target) + suffix;
              if (p < 1) requestAnimationFrame(tick);
            })(start);
          }
        });
      }, { threshold: .05 });
      obs.observe(trigger);
    });
  }

  /* --- THREE.JS PARTICLES (loaded from particles.js) --- */
  var particlesInit = false;
  function initParticles() {
    if (particlesInit) return;
    if (!document.getElementById('particles')) return;
    var s = document.createElement('script');
    s.type = 'module';
    s.src = 'particles.js';
    document.body.appendChild(s);
    particlesInit = true;
  }

  /* --- INIT --- */
  function init() { navigateTo(getHash()); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
