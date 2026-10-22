/* ==========================================================================
   Content Analytics — Insight proof lightbox
   Self-contained: only touches [data-cam-lightbox] inside #content-analytics.
   No global styles or global listeners outside this component's scope.
   ========================================================================== */
(function () {
  'use strict';

  var TRIGGER_SELECTOR = '#content-analytics [data-cam-lightbox]';

  var triggers = [];
  var lightbox = null;
  var els = {};
  var currentIndex = 0;
  var lastFocused = null;
  var previousBodyOverflow = '';

  function collectTriggers() {
    triggers = Array.prototype.slice.call(document.querySelectorAll(TRIGGER_SELECTOR));
  }

  function buildLightbox() {
    var root = document.createElement('div');
    root.className = 'cam-lightbox';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-label', 'Screenshot insight Instagram');
    root.setAttribute('aria-hidden', 'true');

    root.innerHTML =
      '<div class="cam-lightbox__dialog" role="document">' +
        '<div class="cam-lightbox__bar">' +
          '<span class="cam-lightbox__title" data-cam-role="title"></span>' +
          '<span class="cam-lightbox__counter" data-cam-role="counter"></span>' +
          '<div class="cam-lightbox__actions">' +
            '<button type="button" class="cam-lightbox__btn" data-cam-role="zoom" aria-label="Perbesar gambar" title="Zoom (Z)">' +
              '<i class="fas fa-magnifying-glass-plus" aria-hidden="true"></i>' +
            '</button>' +
            '<button type="button" class="cam-lightbox__btn" data-cam-role="close" aria-label="Tutup" title="Tutup (Esc)">' +
              '<i class="fas fa-xmark" aria-hidden="true"></i>' +
            '</button>' +
          '</div>' +
        '</div>' +
        '<div class="cam-lightbox__stage" data-cam-role="stage">' +
          '<button type="button" class="cam-lightbox__nav cam-lightbox__nav--prev" data-cam-role="prev" aria-label="Screenshot sebelumnya">' +
            '<i class="fas fa-chevron-left" aria-hidden="true"></i>' +
          '</button>' +
          '<img class="cam-lightbox__img" data-cam-role="img" alt="">' +
          '<button type="button" class="cam-lightbox__nav cam-lightbox__nav--next" data-cam-role="next" aria-label="Screenshot berikutnya">' +
            '<i class="fas fa-chevron-right" aria-hidden="true"></i>' +
          '</button>' +
        '</div>' +
        '<div class="cam-lightbox__foot">' +
          '<p class="cam-lightbox__hint">Klik gambar untuk zoom &middot; <kbd>&larr;</kbd> <kbd>&rarr;</kbd> navigasi &middot; <kbd>Esc</kbd> tutup</p>' +
          '<a class="cam-lightbox__open" data-cam-role="open" href="#" target="_blank" rel="noopener noreferrer">' +
            'Buka gambar asli <i class="fas fa-arrow-up-right-from-square" aria-hidden="true"></i>' +
          '</a>' +
        '</div>' +
      '</div>';

    document.body.appendChild(root);

    els.root = root;
    els.title = root.querySelector('[data-cam-role="title"]');
    els.counter = root.querySelector('[data-cam-role="counter"]');
    els.stage = root.querySelector('[data-cam-role="stage"]');
    els.img = root.querySelector('[data-cam-role="img"]');
    els.prev = root.querySelector('[data-cam-role="prev"]');
    els.next = root.querySelector('[data-cam-role="next"]');
    els.close = root.querySelector('[data-cam-role="close"]');
    els.zoom = root.querySelector('[data-cam-role="zoom"]');
    els.open = root.querySelector('[data-cam-role="open"]');

    root.addEventListener('click', function (event) {
      if (event.target === root) closeLightbox();
    });

    els.close.addEventListener('click', closeLightbox);
    els.prev.addEventListener('click', function () { show(currentIndex - 1); });
    els.next.addEventListener('click', function () { show(currentIndex + 1); });
    els.zoom.addEventListener('click', toggleZoom);
    els.img.addEventListener('click', toggleZoom);

    return root;
  }

  function captionOf(trigger) {
    var fromData = trigger.getAttribute('data-cam-caption');
    if (fromData) return fromData;
    var figure = trigger.closest('.cam-proof');
    var caption = figure ? figure.querySelector('.cam-proof__caption') : null;
    return caption ? caption.textContent.trim() : 'Insight screenshot';
  }

  function srcOf(trigger) {
    var img = trigger.querySelector('img');
    return img ? img.getAttribute('src') : trigger.getAttribute('href');
  }

  function show(index) {
    if (!triggers.length) return;

    var total = triggers.length;
    currentIndex = ((index % total) + total) % total;

    var trigger = triggers[currentIndex];
    var src = srcOf(trigger);
    var caption = captionOf(trigger);

    els.stage.classList.remove('is-zoomed');
    els.img.src = src;
    els.img.alt = caption + ' — screenshot insight Instagram';
    els.title.textContent = caption;
    els.counter.textContent = (currentIndex + 1) + ' / ' + total;
    els.open.href = src;

    var single = total < 2;
    els.prev.hidden = single;
    els.next.hidden = single;
  }

  function toggleZoom() {
    var zoomed = els.stage.classList.toggle('is-zoomed');
    els.zoom.setAttribute('aria-label', zoomed ? 'Perkecil gambar' : 'Perbesar gambar');
    var icon = els.zoom.querySelector('i');
    if (icon) {
      icon.className = zoomed ? 'fas fa-magnifying-glass-minus' : 'fas fa-magnifying-glass-plus';
    }
  }

  function openLightbox(trigger) {
    collectTriggers();
    var index = triggers.indexOf(trigger);
    if (index === -1) index = 0;

    if (!lightbox) lightbox = buildLightbox();

    lastFocused = document.activeElement;
    show(index);

    lightbox.setAttribute('aria-hidden', 'false');
    lightbox.classList.add('is-open');

    previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    if (els.close) els.close.focus({ preventScroll: true });
  }

  function closeLightbox() {
    if (!lightbox) return;

    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = previousBodyOverflow;
    previousBodyOverflow = '';
    els.stage.classList.remove('is-zoomed');

    if (lastFocused && typeof lastFocused.focus === 'function') {
      lastFocused.focus({ preventScroll: true });
    }
  }

  function isOpen() {
    return !!lightbox && lightbox.classList.contains('is-open');
  }

  document.addEventListener('click', function (event) {
    var trigger = event.target.closest ? event.target.closest('[data-cam-lightbox]') : null;
    if (!trigger) return;
    if (!trigger.closest('#content-analytics')) return;

    event.preventDefault();
    openLightbox(trigger);
  });

  document.addEventListener('keydown', function (event) {
    if (!isOpen()) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      closeLightbox();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      show(currentIndex + 1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      show(currentIndex - 1);
    } else if (event.key === 'z' || event.key === 'Z') {
      event.preventDefault();
      toggleZoom();
    } else if (event.key === 'Tab') {
      // Keep focus inside the dialog while it is open
      var focusables = lightbox.querySelectorAll('button:not([hidden]), a[href]');
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', collectTriggers);
  } else {
    collectTriggers();
  }
})();
