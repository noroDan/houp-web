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

  // ============ TEXT PROGRESSIVE (palabras encienden una por una) ============
  // Preserva <em> y <strong>: cada palabra se envuelve en <span>; si está
  // dentro de <em>/<strong>/.accent, el span lleva la clase .accent (cyan).
  function initTextProgressive() {
    const textBlocks = document.querySelectorAll('.text-progressive');

    textBlocks.forEach(block => {
      if (block.dataset.progressed === '1') return;

      // Walk todos los text nodes y envolver cada palabra
      const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT, null);
      const nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);

      nodes.forEach(node => {
        if (!node.textContent.trim()) return;
        const isAccent = !!node.parentElement.closest('em, strong, .accent');
        const words = node.textContent.split(/(\s+)/);
        const frag = document.createDocumentFragment();
        words.forEach(w => {
          if (w.trim() === '') {
            frag.appendChild(document.createTextNode(w));
          } else {
            const span = document.createElement('span');
            span.textContent = w;
            if (isAccent) span.classList.add('accent');
            frag.appendChild(span);
          }
        });
        node.parentNode.replaceChild(frag, node);
      });

      block.dataset.progressed = '1';
    });

    // Observer para cada párrafo progresivo
    if ('IntersectionObserver' in window) {
      const progressiveObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Usar todos los spans de palabras (no los wrappers)
            const spans = entry.target.querySelectorAll('span');
            spans.forEach((span, i) => {
              setTimeout(() => span.classList.add('is-active'), i * 55);
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

  // ============ CLICK TO EXPAND (servicios WOW) ============
  // Al click en una card .servicio-wow, toggle .is-open para mostrar el detalle
  document.querySelectorAll('.servicio-wow').forEach(card => {
    card.addEventListener('click', (e) => {
      // Si clickearon un link dentro de la card, dejar que el link funcione
      if (e.target.closest('a')) return;
      card.classList.toggle('is-open');
    });
  });

  // ============ WHATSAPP DIRECT (app en mobile, Web en desktop) ============
  // Intercepta clicks en links con data-wa-phone y abre WhatsApp directo
  // sin pasar por la página intermedia de wa.me
  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  const isMacOS = /Mac/i.test(navigator.platform);
  const isWindows = /Win/i.test(navigator.platform);

  document.querySelectorAll('[data-wa-phone]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const phone = link.dataset.waPhone;
      const text = encodeURIComponent(link.dataset.waText || '');

      if (isMobile) {
        // iOS/Android: protocolo whatsapp:// abre la app directo
        // Fallback a wa.me si no está instalada (el OS lo maneja)
        const appUrl = `whatsapp://send?phone=${phone}&text=${text}`;
        const webFallback = `https://wa.me/${phone}?text=${text}`;

        // Intentar abrir la app; si falla en 1s, abrir wa.me
        const start = Date.now();
        window.location.href = appUrl;
        setTimeout(() => {
          // Si seguimos en la página después de 1.2s, abrimos el fallback
          if (Date.now() - start < 1500 && !document.hidden) {
            window.location.href = webFallback;
          }
        }, 1200);
      } else {
        // Desktop: WhatsApp Web directo (abre web.whatsapp.com/send)
        // Si no tienen sesión, WhatsApp Web les pedirá escanear QR
        const webUrl = `https://web.whatsapp.com/send?phone=${phone}&text=${text}`;
        window.open(webUrl, '_blank', 'noopener');
      }
    });
  });

})();

/* ============================================================
   V16 · LIGHTBOX CARRUSEL para .visual-stack
   ============================================================ */
(function initLightbox() {
  const stacks = document.querySelectorAll('.visual-stack');
  if (!stacks.length) return;

  // Crear overlay (una sola vez)
  if (!document.querySelector('.hp-lightbox')) {
    const lb = document.createElement('div');
    lb.className = 'hp-lightbox';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'Galería de fotos');
    lb.innerHTML = `
      <button class="hp-lightbox-close" aria-label="Cerrar galería">✕</button>
      <button class="hp-lightbox-nav hp-lightbox-prev" aria-label="Foto anterior">‹</button>
      <div class="hp-lightbox-content">
        <img class="hp-lightbox-img" src="" alt="">
      </div>
      <button class="hp-lightbox-nav hp-lightbox-next" aria-label="Foto siguiente">›</button>
      <div class="hp-lightbox-counter"><span class="hp-lb-current">1</span> / <span class="hp-lb-total">1</span></div>
    `;
    document.body.appendChild(lb);
  }

  const overlay = document.querySelector('.hp-lightbox');
  const img = overlay.querySelector('.hp-lightbox-img');
  const current = overlay.querySelector('.hp-lb-current');
  const total = overlay.querySelector('.hp-lb-total');
  const btnClose = overlay.querySelector('.hp-lightbox-close');
  const btnPrev = overlay.querySelector('.hp-lightbox-prev');
  const btnNext = overlay.querySelector('.hp-lightbox-next');

  let gallery = [];
  let idx = 0;

  function open(fotos, startIdx) {
    gallery = fotos;
    idx = startIdx;
    render();
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
  function render() {
    img.src = gallery[idx].src;
    img.alt = gallery[idx].alt;
    current.textContent = idx + 1;
    total.textContent = gallery.length;
  }
  function prev() { idx = (idx - 1 + gallery.length) % gallery.length; render(); }
  function next() { idx = (idx + 1) % gallery.length; render(); }

  btnClose.addEventListener('click', close);
  btnPrev.addEventListener('click', prev);
  btnNext.addEventListener('click', next);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

  document.addEventListener('keydown', (e) => {
    if (!overlay.classList.contains('active')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') prev();
    else if (e.key === 'ArrowRight') next();
  });

  stacks.forEach((stack) => {
    const figures = stack.querySelectorAll('.visual-stack-foto');
    // Leer galería extendida desde data-gallery si existe (fotos extra que no están en el stack)
    let extraSrcs = [];
    try {
      const raw = stack.getAttribute('data-gallery');
      if (raw) extraSrcs = JSON.parse(raw);
    } catch (e) {}

    figures.forEach((fig, i) => {
      fig.addEventListener('click', () => {
        const fotos = [];
        figures.forEach((f) => {
          const im = f.querySelector('img');
          if (im) fotos.push({ src: im.src, alt: im.alt || '' });
        });
        extraSrcs.forEach((s) => fotos.push({ src: s.src || s, alt: s.alt || '' }));
        open(fotos, i);
      });
    });
  });
})();

/* ============================================================
   V16 · 4 C's ACORDEÓN
   ============================================================ */
(function initCsAccordion() {
  // Cada .cs-layout es un grupo independiente (acordeón + imagen propia)
  const groups = document.querySelectorAll('.cs-layout, .cs-accordion');
  if (!groups.length) return;

  // Evitar inicializar dos veces si ambos selectores matchean (cs-layout contiene cs-accordion)
  const initialized = new Set();

  groups.forEach((group) => {
    // Si es un cs-accordion dentro de un cs-layout ya procesado, saltar
    const parentLayout = group.closest('.cs-layout');
    const scope = parentLayout || group;
    if (initialized.has(scope)) return;
    initialized.add(scope);

    const items = scope.querySelectorAll('.cs-accordion-item');
    if (!items.length) return;

    // Imagen aside sticky (solo dentro de este scope)
    const imgPane = scope.querySelector('.cs-image-current');

    function syncImage(item) {
      if (!imgPane) return;
      const src = item.getAttribute('data-image');
      const alt = item.getAttribute('data-image-alt') || '';
      if (!src || imgPane.getAttribute('src').endsWith(src)) return;
      imgPane.classList.add('cs-img-fading');
      setTimeout(() => {
        imgPane.setAttribute('src', src);
        imgPane.setAttribute('alt', alt);
        imgPane.classList.remove('cs-img-fading');
      }, 220);
    }

    // Abrir el primero por default
    items[0].classList.add('open');
    syncImage(items[0]);

    const itemsArr = Array.from(items);
    itemsArr.forEach((item, index) => {
      const trigger = item.querySelector('.cs-accordion-trigger');
      if (!trigger) return;
      trigger.addEventListener('click', () => {
        const wasOpen = item.classList.contains('open');

        // Cerrar todos
        itemsArr.forEach((i) => {
          i.classList.remove('open');
          const t = i.querySelector('.cs-accordion-trigger');
          if (t) t.setAttribute('aria-expanded', 'false');
        });

        // Si se clickeó una ya abierta → abrir la siguiente (circular)
        // Si se clickeó una cerrada → abrir esa
        const toOpen = wasOpen ? itemsArr[(index + 1) % itemsArr.length] : item;
        toOpen.classList.add('open');
        const openTrigger = toOpen.querySelector('.cs-accordion-trigger');
        if (openTrigger) openTrigger.setAttribute('aria-expanded', 'true');
        syncImage(toOpen);
      });
    });
  });
})();
