/* ============================================================
   HOUP · main.js
   Animaciones scroll-driven, menú móvil, header sticky
   ============================================================ */

(function() {
  'use strict';

  // ============ HEADER STICKY ============
  const header = document.querySelector('.site-header');
  let lastScroll = 0;

  function updateHeader() {
    const scroll = window.scrollY;
    if (scroll > 50) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
    lastScroll = scroll;
  }

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  // ============ MENÚ MÓVIL ============
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.header-nav');

  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('is-active');
      nav.classList.toggle('is-open');
      document.body.style.overflow = nav.classList.contains('is-open') ? 'hidden' : '';
    });

    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.classList.remove('is-active');
        nav.classList.remove('is-open');
        document.body.style.overflow = '';
      });
    });
  }

  // ============ REVEAL ON SCROLL ============
  // Observa elementos .reveal, .fade-in, .slide-left y los activa al entrar al viewport
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.reveal, .fade-in, .slide-left').forEach(el => {
      revealObserver.observe(el);
    });
  }

  // ============ TEXT PROGRESSIVE (letras cambian de color) ============
  // Toma cada .text-progressive y envuelve cada palabra en <span>
  // Al scroll, activa cada palabra secuencialmente cuando entra al viewport
  function initTextProgressive() {
    const textBlocks = document.querySelectorAll('.text-progressive');

    textBlocks.forEach(block => {
      // Si ya está dividido en spans manualmente, no tocar
      if (block.querySelector('span')) return;

      const text = block.innerHTML;
      // Dividir en palabras conservando puntuación
      const words = text.split(/(\s+)/);
      block.innerHTML = words.map(w => {
        if (w.trim() === '') return w;
        return `<span>${w}</span>`;
      }).join('');
    });

    // Observer para cada párrafo progresivo
    if ('IntersectionObserver' in window) {
      const progressiveObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const spans = entry.target.querySelectorAll('span');
            spans.forEach((span, i) => {
              setTimeout(() => {
                span.classList.add('is-active');
              }, i * 60); // 60ms entre cada palabra
            });
            progressiveObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.4 });

      textBlocks.forEach(block => progressiveObserver.observe(block));
    }
  }

  initTextProgressive();

  // ============ WORD HIGHLIGHT individual ============
  // Palabras sueltas que cambian de color al entrar al viewport
  if ('IntersectionObserver' in window) {
    const wordObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-active');
          wordObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });

    document.querySelectorAll('.word-highlight').forEach(el => {
      wordObserver.observe(el);
    });
  }

  // ============ COUNTER ANIMADO ============
  // Elementos .counter con atributo data-target animan desde 0 al valor final
  function animateCounter(el) {
    const target = parseFloat(el.dataset.target);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const duration = 1800;
    const startTime = performance.now();

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Easing cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = target * eased;
      // Si es decimal, un decimal; si es entero, entero
      const display = Number.isInteger(target)
        ? Math.floor(current).toLocaleString('es-MX')
        : current.toFixed(1);
      el.textContent = `${prefix}${display}${suffix}`;
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('.counter[data-target]').forEach(el => {
      counterObserver.observe(el);
    });
  }

  // ============ PARALLAX SUTIL ============
  // Imágenes de hero con parallax muy suave al scroll
  const parallaxElements = document.querySelectorAll('.parallax-slow');

  function updateParallax() {
    const scroll = window.scrollY;
    parallaxElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        const offset = scroll * 0.3;
        el.style.transform = `translateY(${offset}px)`;
      }
    });
  }

  if (parallaxElements.length > 0) {
    window.addEventListener('scroll', updateParallax, { passive: true });
  }

  // ============ NAV ACTIVE LINK ============
  // Marca el link del nav correspondiente a la página actual
  const currentPath = window.location.pathname;
  document.querySelectorAll('.header-nav a').forEach(link => {
    const linkPath = link.getAttribute('href');
    if (linkPath === currentPath ||
        (currentPath === '/' && linkPath === 'index.html') ||
        (currentPath.endsWith('/' + linkPath))) {
      link.classList.add('active');
    }
  });

  // ============ WORD ROTATOR (hero "de ti. / de tu equipo." etc.) ============
  document.querySelectorAll('.word-rotator').forEach(el => {
    const words = (el.dataset.words || '').split('|').filter(Boolean);
    if (words.length === 0) return;
    let i = 0;
    const type = (text, cb) => {
      el.firstChild && el.firstChild.nodeType === 3
        ? (el.firstChild.textContent = '')
        : el.insertBefore(document.createTextNode(''), el.firstChild);
      let j = 0;
      const tick = () => {
        if (j <= text.length) {
          el.firstChild.textContent = text.slice(0, j);
          j++;
          setTimeout(tick, 60);
        } else if (cb) cb();
      };
      tick();
    };
    const del = (cb) => {
      const current = el.firstChild ? el.firstChild.textContent : '';
      let j = current.length;
      const tick = () => {
        if (j >= 0) {
          el.firstChild.textContent = current.slice(0, j);
          j--;
          setTimeout(tick, 35);
        } else if (cb) cb();
      };
      tick();
    };
    const cycle = () => {
      type(words[i], () => {
        setTimeout(() => {
          del(() => {
            i = (i + 1) % words.length;
            cycle();
          });
        }, 2200);
      });
    };
    cycle();
  });

  // ============ ORBITAL CORE WORD ROTATOR ============
  document.querySelectorAll('[data-rotate]').forEach(el => {
    let words;
    try { words = JSON.parse(el.dataset.rotate); } catch(e) { return; }
    if (!Array.isArray(words) || words.length === 0) return;
    let i = 0;
    el.style.transition = 'opacity 400ms ease';
    setInterval(() => {
      el.style.opacity = '0';
      setTimeout(() => {
        i = (i + 1) % words.length;
        el.textContent = words[i];
        el.style.opacity = '1';
      }, 420);
    }, 2600);
  });

  // ============ HOVER GLOW (sigue el cursor en servicios WOW) ============
  document.querySelectorAll('[data-hover-glow]').forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      el.style.setProperty('--mx', `${x}%`);
      el.style.setProperty('--my', `${y}%`);
    });
  });

})();
