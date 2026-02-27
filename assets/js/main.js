(function () {
  'use strict';

  // ═══════════════════════════════════════════════════════
  //  YARDIMCILAR
  // ═══════════════════════════════════════════════════════

  function hashStr(s) {
    var h = 0;
    for (var i = 0; i < s.length; i++) {
      h = ((h << 5) - h) + s.charCodeAt(i);
      h |= 0;
    }
    return Math.abs(h);
  }

  function getBaseUrl() {
    var m = document.querySelector('meta[name="base-url"]');
    return m ? m.getAttribute('content') : '';
  }

  function getStampImageSrc(stampId) {
    if (!stampId) return '';
    var idx = (hashStr(stampId) % 4) + 1;
    return getBaseUrl() + '/assets/img/mektup-pullari/mektup-pulu-' + idx + '.png';
  }

  function getCollectedStamps() {
    try { return JSON.parse(localStorage.getItem('munzevi-stamps') || '[]'); }
    catch (e) { return []; }
  }

  function saveStamp(stampId) {
    var stamps = getCollectedStamps();
    if (stamps.indexOf(stampId) === -1) {
      stamps.push(stampId);
      localStorage.setItem('munzevi-stamps', JSON.stringify(stamps));
    }
  }

  function getJourney() {
    try { return JSON.parse(localStorage.getItem('munzevi-journey') || '[]'); }
    catch (e) { return []; }
  }

  function saveJourneyStep(stampId) {
    var journey = getJourney();
    var exists = journey.some(function (j) { return j.id === stampId; });
    if (!exists) {
      journey.push({ id: stampId, ts: Date.now() });
      localStorage.setItem('munzevi-journey', JSON.stringify(journey));
    }
  }


  // ═══════════════════════════════════════════════════════
  //  Feature A: TEMA & MUM IŞIĞI
  // ═══════════════════════════════════════════════════════

  function initTheme() {
    var saved = localStorage.getItem('munzevi-theme') || 'manuscript';
    document.documentElement.setAttribute('data-theme', saved);

    var btn = document.getElementById('theme-toggle');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var cur = document.documentElement.getAttribute('data-theme');
      var next = (cur === 'void') ? 'manuscript' : 'void';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('munzevi-theme', next);
      if (window.MUNZEVI_SOUNDS && window.MUNZEVI_SOUNDS.themeSwitch) {
        window.MUNZEVI_SOUNDS.themeSwitch();
      }
    });
  }

  function initCandlelight() {
    var layer = document.getElementById('candlelight-layer');
    var glow = document.getElementById('candlelight-glow');
    if (!layer && !glow) return;
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;

    document.addEventListener('mousemove', function (e) {
      if (document.documentElement.getAttribute('data-theme') !== 'void') return;
      var x = e.clientX + 'px';
      var y = e.clientY + 'px';
      if (layer) {
        layer.style.setProperty('--mouse-x', x);
        layer.style.setProperty('--mouse-y', y);
      }
      if (glow) {
        glow.style.setProperty('--mouse-x', x);
        glow.style.setProperty('--mouse-y', y);
      }
    });
  }


  // ═══════════════════════════════════════════════════════
  //  Feature C: GECE ŞİİRİ
  // ═══════════════════════════════════════════════════════

  function initNocturnal() {
    var article = document.querySelector('[data-nocturnal="true"]');
    if (!article) return;
    var hour = new Date().getHours();
    var isDaytime = (hour >= 6 && hour < 23);
    var veil = document.getElementById('nocturnal-veil');
    if (!veil) return;
    if (isDaytime) {
      veil.classList.add('active');
      var body = article.querySelector('.post-body');
      if (body) body.classList.add('nocturnal-blur');
    }
  }


  // ═══════════════════════════════════════════════════════
  //  Feature D: PUL KOLEKSİYONU & YOLCULUK
  // ═══════════════════════════════════════════════════════

  function initStampPost() {
    var article = document.querySelector('[data-stamp-id]');
    if (!article) return;
    var stampId = article.getAttribute('data-stamp-id');
    if (!stampId) return;

    saveStamp(stampId);
    saveJourneyStep(stampId);

    var titleEl = document.querySelector('.post-title');
    if (titleEl) {
      localStorage.setItem('munzevi-last-read', titleEl.textContent.trim());
    }

    var earned = document.getElementById('stamp-earned');
    var img = document.getElementById('stamp-img');
    if (earned && img) {
      img.src = getStampImageSrc(stampId);
      img.alt = stampId;
      earned.classList.add('visible');
      earned.setAttribute('aria-hidden', 'false');
    }

    var collectedNote = document.getElementById('stamp-collected-note');
    if (collectedNote) collectedNote.style.display = '';
  }

  function initStampCollection() {
    var grid = document.getElementById('stamp-grid');
    if (!grid) return;

    var stamps = getCollectedStamps();
    var items = grid.querySelectorAll('.stamp-item');
    var collected = 0;

    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var id = item.getAttribute('data-stamp-id');
      var img = item.querySelector('.stamp-image');
      if (img) {
        img.src = getStampImageSrc(id);
        img.style.filter = 'hue-rotate(' + ((i * 37) % 360) + 'deg)';
      }
      if (stamps.indexOf(id) !== -1) {
        item.classList.add('collected');
        collected++;
      } else {
        item.classList.add('uncollected');
      }
    }

    var counter = document.getElementById('stamp-counter');
    if (counter) counter.textContent = collected + ' / ' + items.length + ' pul toplandı';
  }


  // ═══════════════════════════════════════════════════════
  //  Feature E: ŞİŞEDE MESAJ
  // ═══════════════════════════════════════════════════════

  function initBottle() {
    var form = document.getElementById('bottle-form');
    var container = document.getElementById('bottle-container');
    if (!form || !container) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = new FormData(form);
      fetch(form.action, {
        method: 'POST', body: data,
        headers: { 'Accept': 'application/json' }
      }).catch(function () {});

      container.classList.add('cast-away');
      setTimeout(function () {
        container.innerHTML = '<p class="bottle-farewell">mesajın boşluğa karıştı.</p>';
        container.classList.remove('cast-away');
        container.classList.add('bottle-done');
      }, 1800);
    });
  }


  // ═══════════════════════════════════════════════════════
  //  NEW #1: MÜREKKEP YAŞLANMASI
  // ═══════════════════════════════════════════════════════

  function initInkDecay() {
    var cards = document.querySelectorAll('.ms-page[data-post-date], .post-manuscript[data-post-date]');
    if (!cards.length) return;

    var dates = [];
    for (var i = 0; i < cards.length; i++) {
      dates.push(new Date(cards[i].getAttribute('data-post-date')).getTime());
    }

    var newest = Math.max.apply(null, dates);
    var oldest = Math.min.apply(null, dates);
    var range = newest - oldest || 1;

    for (var j = 0; j < cards.length; j++) {
      var d = new Date(cards[j].getAttribute('data-post-date')).getTime();
      var age = (newest - d) / range;
      var opacity = 1 - (age * 0.38);
      cards[j].style.setProperty('--ink-opacity', opacity.toFixed(3));
    }
  }


  // ═══════════════════════════════════════════════════════
  //  NEW #2: KISMET (rastgele yazıya git)
  // ═══════════════════════════════════════════════════════

  function initKismet() {
    var btn = document.getElementById('kismet-btn');
    if (!btn) return;

    var posts = window.MUNZEVI_POSTS || [];
    if (!posts.length) return;

    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var pick = posts[Math.floor(Math.random() * posts.length)];

      document.body.classList.add('kismet-transition');
      setTimeout(function () { window.location.href = pick; }, 600);
    });
  }


  // ═══════════════════════════════════════════════════════
  //  NEW #4: AYAK İZİ HARİTASI (journey timeline)
  // ═══════════════════════════════════════════════════════

  function initJourney() {
    var timeline = document.getElementById('journey-timeline');
    if (!timeline) return;

    var journey = getJourney();
    var steps = timeline.querySelectorAll('.journey-step');

    for (var i = 0; i < steps.length; i++) {
      var step = steps[i];
      var id = step.getAttribute('data-stamp-id');

      var entry = null;
      for (var j = 0; j < journey.length; j++) {
        if (journey[j].id === id) { entry = journey[j]; break; }
      }

      if (entry) {
        step.classList.add('visited');
        var order = 0;
        for (var k = 0; k < journey.length; k++) {
          if (journey[k].id === id) { order = k + 1; break; }
        }
        step.setAttribute('data-order', order);
        var timeEl = step.querySelector('.journey-time');
        if (timeEl && entry.ts) {
          var dt = new Date(entry.ts);
          timeEl.textContent = dt.toLocaleDateString('tr-TR', {
            day: 'numeric', month: 'long', year: 'numeric'
          });
        }
      } else {
        step.classList.add('unvisited');
      }
    }

    var journeyCount = document.getElementById('journey-count');
    if (journeyCount) {
      journeyCount.textContent = journey.length + ' durak ziyaret edildi';
    }
  }


  // ═══════════════════════════════════════════════════════
  //  NEW #5: MÜREKKEP DAMlalari (easter eggs)
  // ═══════════════════════════════════════════════════════

  var INK_QUOTES = [
    'erişilmesi güç ve imkansız gibi olsa da yaşamın olduğuna dair bir ümit gibisin.',
    'bir kez ölmek evladır her gün tekrar-tekrar ölmekten!',
    'kim demiş ölüler konuşmaz diye?',
    'sevmek de yorulur!',
    'yıldızlar ışığını umutlarımızdan alırlar.',
    'bu aynadaki suret kimin eseri?',
    'dertli tembel; tembel ise dertli olamaz.',
    'gökyüzüne kaçtı uykum, anne\u2026',
    'keşke hep bilmemiş olsaydık.',
    'uyumak istiyorum cavidan, uyanmamacasına!',
    'hayat gerçekten kaybettiğimiz yerden mi başlar?',
    'içimde ölen biri var.',
    'bazı duygular, ne vakit doğduğunu bilmeden büyür.',
    'dirilmek için ölmek gerekti biliyorum zira\u2026',
    'bu defter sana ait. kapat ve kalbine koy.'
  ];

  function initInkDrops() {
    var main = document.querySelector('.site-main');
    if (!main) return;
    main.style.position = 'relative';

    var count = 4 + Math.floor(Math.random() * 4);
    var rng = Date.now();

    for (var i = 0; i < count; i++) {
      var drop = document.createElement('div');
      drop.className = 'ink-drop';

      var topPct  = 8 + ((rng * (i + 1) * 7) % 78);
      var leftPct = 3 + ((rng * (i + 1) * 13) % 90);
      var size    = 14 + Math.floor(Math.random() * 22);

      drop.style.top    = topPct + '%';
      drop.style.left   = leftPct + '%';
      drop.style.width  = size + 'px';
      drop.style.height = size + 'px';

      var br = function() { return (35 + Math.floor(Math.random() * 30)) + '%'; };
      drop.style.borderRadius = br() + ' ' + br() + ' ' + br() + ' ' + br();

      drop.style.opacity = (0.18 + Math.random() * 0.18).toFixed(2);
      drop.style.animationDelay = (i * 0.15) + 's';

      var satX = (-6 + Math.floor(Math.random() * 12));
      var satY = (-4 + Math.floor(Math.random() * 10));
      drop.style.setProperty('--sat-x', satX + 'px');
      drop.style.setProperty('--sat-y', satY + 'px');

      var sat2X = (3 + Math.floor(Math.random() * 8));
      var sat2Y = (2 + Math.floor(Math.random() * 8));
      drop.style.setProperty('--sat2-x', sat2X + 'px');
      drop.style.setProperty('--sat2-y', sat2Y + 'px');

      var shadowSpread = Math.floor(2 + Math.random() * 6);
      drop.style.boxShadow =
        satX + 'px ' + satY + 'px ' + shadowSpread + 'px rgba(26,15,10,0.12), ' +
        sat2X + 'px ' + sat2Y + 'px ' + Math.floor(1 + Math.random() * 3) + 'px rgba(26,15,10,0.08)';

      var quoteIdx = (rng + i * 7) % INK_QUOTES.length;
      drop.setAttribute('data-quote', INK_QUOTES[quoteIdx]);

      (function(el) {
        el.addEventListener('click', function () {
          if (el.classList.contains('revealed')) return;

          var tip = document.createElement('div');
          tip.className = 'ink-drop-quote';
          tip.textContent = el.getAttribute('data-quote');
          el.appendChild(tip);
          el.classList.add('revealed');

          requestAnimationFrame(function () {
            tip.style.opacity = '1';
            tip.style.transform = 'translateX(-50%) translateY(0)';
          });

          setTimeout(function () {
            tip.style.opacity = '0';
            tip.style.transform = 'translateX(-50%) translateY(8px)';
            setTimeout(function () {
              el.classList.remove('revealed');
              if (tip.parentNode) tip.parentNode.removeChild(tip);
            }, 600);
          }, 5000);
        });
      })(drop);

      main.appendChild(drop);
    }
  }


  // ═══════════════════════════════════════════════════════
  //  NEW #7: HAVA DURUMU ATMOSFERİ
  // ═══════════════════════════════════════════════════════

  function initWeather() {
    var layer = document.querySelector('.weather-layer');
    if (!layer) return;

    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(function (pos) {
      var lat = pos.coords.latitude.toFixed(2);
      var lon = pos.coords.longitude.toFixed(2);
      var url = 'https://api.open-meteo.com/v1/forecast?latitude=' + lat +
                '&longitude=' + lon + '&current_weather=true';

      fetch(url)
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (!data.current_weather) return;
          var code = data.current_weather.weathercode;
          var cls = 'weather-clear';

          if (code >= 71 && code <= 77) cls = 'weather-snow';
          else if ((code >= 51 && code <= 67) || (code >= 80 && code <= 99)) cls = 'weather-rain';
          else if (code >= 2 && code <= 48) cls = 'weather-clouds';

          document.body.classList.add(cls);
          layer.classList.add('active');
        })
        .catch(function () {});
    }, function () {}, { timeout: 5000 });
  }


  // ═══════════════════════════════════════════════════════
  //  NEW #8: MÜHÜRLÜ MEKTUP
  // ═══════════════════════════════════════════════════════

  function initSealed() {
    var overlay = document.getElementById('sealed-overlay');
    if (!overlay) return;

    var stamps = getCollectedStamps();
    var currentCount = stamps.length;
    var needed = currentCount + 3;
    var total = window.MUNZEVI_TOTAL_STAMPS || 36;
    if (needed > total - 1) needed = total - 1;

    var sealedStampId = '';
    var article = document.querySelector('[data-stamp-id]');
    if (article) sealedStampId = article.getAttribute('data-stamp-id');

    var alreadyOwns = stamps.indexOf(sealedStampId) !== -1;

    if (alreadyOwns || currentCount >= needed) {
      overlay.remove();
      if (article && sealedStampId) {
        saveStamp(sealedStampId);
        saveJourneyStep(sealedStampId);
      }
      var body = document.querySelector('.post-body');
      if (body) body.classList.remove('nocturnal-blur');
    } else {
      overlay.classList.add('active');
      var body2 = document.querySelector('.post-body');
      if (body2) body2.classList.add('nocturnal-blur');
      var counter = document.getElementById('sealed-counter');
      if (counter) {
        var remaining = needed - currentCount;
        counter.textContent = remaining + ' mektup daha oku';
      }
    }
  }


  // ═══════════════════════════════════════════════════════
  //  NEW #10: DEFTERİN KENARI (margin notes)
  // ═══════════════════════════════════════════════════════

  function initMarginNotes() {
    var form = document.getElementById('margin-notes-form');
    var input = document.getElementById('margin-note-input');
    if (!form || !input) return;

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var text = input.value.trim();
      if (!text) return;

      var data = new FormData(form);
      fetch(form.action, {
        method: 'POST', body: data,
        headers: { 'Accept': 'application/json' }
      }).catch(function() {});

      input.value = '';
      input.disabled = true;
      var btn = form.querySelector('button');
      if (btn) btn.textContent = 'notun gönderildi ✓';
      setTimeout(function() {
        if (btn) btn.textContent = 'bırak';
        input.disabled = false;
      }, 3000);
    });
  }


  // ═══════════════════════════════════════════════════════
  //  STICKY STAMP (JS ile scroll takibi)
  // ═══════════════════════════════════════════════════════

  function initStickyStamp() {
    if (!document.querySelector('.post-manuscript')) return;

    var article = document.querySelector('.post-manuscript[data-stamp-id]');
    if (!article) return;
    var stampId = article.getAttribute('data-stamp-id');
    if (!stampId) return;

    var existing = document.getElementById('floating-stamp');
    if (existing) return;

    var wrapper = document.createElement('div');
    wrapper.id = 'floating-stamp';
    var rail = document.querySelector('.post-stamp-rail');
    var railLeft = rail ? rail.getBoundingClientRect().left : 50;
    wrapper.style.cssText = 'position:fixed;left:' + railLeft + 'px;top:200px;z-index:50;text-align:center;';
    wrapper.innerHTML =
      '<div style="display:inline-block;background:var(--bg-paper);border:3px dashed rgba(44,24,16,0.12);padding:0.5rem;box-shadow:2px 3px 10px rgba(44,24,16,0.1);outline:2px dashed rgba(44,24,16,0.12);outline-offset:3px;transform:rotate(-3deg)">' +
      '<img src="' + getStampImageSrc(stampId) + '" width="100" style="display:block">' +
      '</div>';

    wrapper.style.opacity = '0';
    wrapper.style.transform = 'translateY(-20px)';
    wrapper.style.transition = 'opacity 1.2s ease, transform 1.2s ease';
    document.body.appendChild(wrapper);

    requestAnimationFrame(function() {
      requestAnimationFrame(function() {
        wrapper.style.opacity = '1';
        wrapper.style.transform = 'translateY(0)';
      });
    });
  }


  // ═══════════════════════════════════════════════════════
  //  HERO WHISPER (rastgele mısra)
  // ═══════════════════════════════════════════════════════

  var WHISPERS = [
    'erişilmesi güç ve imkansız gibi olsa da yaşamın olduğuna dair bir ümit gibisin.',
    'bir kez ölmek evladır her gün tekrar-tekrar ölmekten!',
    'kim demiş ölüler konuşmaz diye? yazıyor olmak konuşmak değildir hem.',
    'sevmek de yorulur!',
    'yıldızlar ışığını umutlarımızdan alırlar.',
    'bu aynadaki suret kimin eseri?',
    'gökyüzüne kaçtı uykum, anne\u2026',
    'keşke hep bilmemiş olsaydık.',
    'hayat gerçekten kaybettiğimiz yerden mi başlar?',
    'içimde ölen biri var.',
    'bazı duygular, ne vakit doğduğunu bilmeden büyür.',
    'dirilmek için ölmek gerekti biliyorum zira\u2026',
    'dertli tembel; tembel ise dertli olamaz.',
    'güneşin dahi mesafe ölçüsünün ölüm ve yaşam getirdiği hassas bir alem.',
    'uyumak istiyorum cavidan, uyanmamacasına!'
  ];

  function initHeroWhisper() {
    var el = document.getElementById('hero-whisper');
    if (!el) return;

    var hour = new Date().getHours();
    if (hour >= 3 && hour < 5) {
      el.textContent = 'bu saatte burada ne arıyorsun?';
      el.style.opacity = '0';
      el.style.animation = 'heroFade 3s 3s ease forwards';
      return;
    }

    var kavramlar = window.MUNZEVI_KAVRAMLAR || [];
    var today = new Date();
    var dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);

    if (kavramlar.length > 0) {
      var k = kavramlar[dayOfYear % kavramlar.length];
      el.innerHTML = '<a href="/kavramlar/#' + k.id + '" style="color:inherit;text-decoration:none">' +
        '<em>' + k.word + '</em> \u2014 ' + k.essence + '</a>';
    } else {
      el.textContent = '\u201c' + WHISPERS[Math.floor(Math.random() * WHISPERS.length)] + '\u201d';
    }
  }


  // ═══════════════════════════════════════════════════════
  //  SCROLL HEADER + ANIMASYONLAR
  // ═══════════════════════════════════════════════════════

  function initScrollEffects() {
    var header = document.querySelector('.site-header');
    var hero = document.getElementById('hero');

    if (header && hero) {
      var heroH = hero.offsetHeight;
      window.addEventListener('scroll', function () {
        if (window.scrollY > heroH * 0.6) {
          header.classList.add('visible');
        } else {
          header.classList.remove('visible');
        }
      }, { passive: true });
    } else if (header) {
      header.classList.add('visible');
      document.body.classList.add('has-fixed-header');
    }

    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.ms-page').forEach(function (el) {
        el.classList.add('in-view');
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

    document.querySelectorAll('.ms-page').forEach(function (el) {
      observer.observe(el);
    });
  }


  // ═══════════════════════════════════════════════════════
  //  KART PUL GÖRSELLERİ
  // ═══════════════════════════════════════════════════════

  var SEAL_COLORS = [
    { bg: '#8b0000', shadow: 'rgba(139,0,0,0.25)',  glow: 'rgba(212,163,115,0.4)' },
    { bg: '#6b1020', shadow: 'rgba(107,16,32,0.25)', glow: 'rgba(200,140,120,0.4)' },
    { bg: '#5a2d0c', shadow: 'rgba(90,45,12,0.25)',  glow: 'rgba(220,180,120,0.4)' },
    { bg: '#4a1942', shadow: 'rgba(74,25,66,0.25)',  glow: 'rgba(180,140,200,0.35)' },
    { bg: '#7a6520', shadow: 'rgba(122,101,32,0.25)', glow: 'rgba(230,210,140,0.4)' },
    { bg: '#2d4a3a', shadow: 'rgba(45,74,58,0.25)',  glow: 'rgba(140,200,170,0.35)' },
  ];

  var SEAL_CRACK_SOUND = null;
  try {
    SEAL_CRACK_SOUND = new Audio('data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAAYYhHMZYAAAAAAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAAYYhHMZYAAAAAAAAAAAAAAAAAAAA');
  } catch(e) {}

  function getOpenedSeals() {
    try { return JSON.parse(localStorage.getItem('munzevi-opened-seals') || '[]'); }
    catch(e) { return []; }
  }

  function saveOpenedSeal(pageNum) {
    var opened = getOpenedSeals();
    if (opened.indexOf(pageNum) === -1) {
      opened.push(pageNum);
      localStorage.setItem('munzevi-opened-seals', JSON.stringify(opened));
    }
  }

  function initCardStamps() {
    var imgs = document.querySelectorAll('img[data-stamp-id]');
    for (var i = 0; i < imgs.length; i++) {
      var img = imgs[i];
      var id = img.getAttribute('data-stamp-id');
      if (!id) continue;
      img.src = getStampImageSrc(id);
    }

    var openedSeals = getOpenedSeals();
    var pages = document.querySelectorAll('.ms-page');

    for (var j = 0; j < pages.length; j++) {
      var pg = pages[j];
      var date = pg.getAttribute('data-post-date') || '';
      var pageNum = pg.getAttribute('data-page') || '';
      var stampRot = -12 + (hashStr(date + j) % 25);
      pg.style.setProperty('--stamp-rot', stampRot + 'deg');

      var seal = pg.querySelector('.ms-wax-seal:not(.seal-locked)');
      if (!seal) continue;

      var sealStampId = seal.getAttribute('data-stamp-id') || '';
      var colorIdx = hashStr(sealStampId) % SEAL_COLORS.length;
      var color = SEAL_COLORS[colorIdx];
      seal.style.setProperty('--seal-color', color.bg);
      seal.style.setProperty('--seal-shadow', color.shadow);
      seal.style.setProperty('--seal-glow', color.glow);

      var dripX = -5 + (hashStr(sealStampId + 'x') % 10);
      var dripY = -5 + (hashStr(sealStampId + 'y') % 8);
      var dripSize = 8 + (hashStr(sealStampId + 's') % 6);
      seal.style.setProperty('--drip-x', dripX + 'px');
      seal.style.setProperty('--drip-y', dripY + 'px');
      seal.style.setProperty('--drip-size', dripSize + 'px');

      if (openedSeals.indexOf(pageNum) !== -1) {
        pg.classList.add('opened');
      }
    }
  }


  // ═══════════════════════════════════════════════════════
  //  SLIDER NAVİGASYON
  // ═══════════════════════════════════════════════════════

  function initSlider() {
    var slider = document.getElementById('manuscript-slider');
    var prevBtn = document.getElementById('slider-prev');
    var nextBtn = document.getElementById('slider-next');
    if (!slider) return;

    var pages = slider.querySelectorAll('.ms-page');
    var total = pages.length;

    function updateCounter() {}

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        playRustle();
        slider.scrollBy({ left: -slider.offsetWidth, behavior: 'smooth' });
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        playRustle();
        slider.scrollBy({ left: slider.offsetWidth, behavior: 'smooth' });
      });
    }

    document.addEventListener('keydown', function (e) {
      var wrap = document.getElementById('slider-wrap');
      if (!wrap) return;
      var rect = wrap.getBoundingClientRect();
      if (rect.top > window.innerHeight || rect.bottom < 0) return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        slider.scrollBy({ left: slider.offsetWidth, behavior: 'smooth' });
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        slider.scrollBy({ left: -slider.offsetWidth, behavior: 'smooth' });
      }
    });

    // --- uçak yolu sistemi ---
    var plane = document.getElementById('flight-plane');
    var track = document.getElementById('flight-track');
    var stopsContainer = document.getElementById('flight-stops');
    var lineSvg = document.getElementById('flight-line-svg');
    var pathContainer = document.getElementById('flight-path');
    var openedSeals = getOpenedSeals();
    var lastPlaneIdx = 0;
    var STOP_SPACING = 75;
    var TRACK_PAD = 20;
    var trackWidth = (total - 1) * STOP_SPACING + TRACK_PAD * 2;
    var containerW = pathContainer ? pathContainer.offsetWidth : 340;
    var svgH = 60;

    if (track) track.style.width = trackWidth + 'px';

    // asimetrik dalgalı hat oluştur
    function buildWavyPath() {
      if (!lineSvg) return;
      lineSvg.setAttribute('viewBox', '0 0 ' + trackWidth + ' ' + svgH);
      lineSvg.setAttribute('width', trackWidth);
      lineSvg.setAttribute('height', svgH);

      var d = 'M 0,' + (svgH / 2);
      var mid = svgH / 2;
      for (var i = 0; i < total; i++) {
        var x = TRACK_PAD + i * STOP_SPACING;
        var amp = 12 + Math.sin(i * 1.7) * 6;
        var dir = (i % 2 === 0) ? -1 : 1;
        var cy = mid + dir * amp;
        var cx1 = x - STOP_SPACING * 0.3;
        var cx2 = x + STOP_SPACING * 0.3;
        if (i === 0) {
          d += ' Q ' + (x * 0.5) + ',' + cy + ' ' + x + ',' + mid;
        } else {
          var prevX = TRACK_PAD + (i - 1) * STOP_SPACING;
          d += ' C ' + (prevX + STOP_SPACING * 0.4) + ',' + cy +
               ' ' + (x - STOP_SPACING * 0.4) + ',' + cy +
               ' ' + x + ',' + mid;
        }
      }

      var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', d);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', 'currentColor');
      path.setAttribute('stroke-width', '1.5');
      path.setAttribute('stroke-dasharray', '5 4');
      path.setAttribute('opacity', '0.2');
      lineSvg.appendChild(path);
    }

    buildWavyPath();

    // durak noktaları
    if (stopsContainer) {
      for (var d = 0; d < total; d++) {
        var stop = document.createElement('button');
        stop.className = 'flight-stop';
        stop.setAttribute('aria-label', 'mektup ' + (d + 1));
        stop.style.left = (TRACK_PAD + d * STOP_SPACING) + 'px';

        var pg = pages[d];
        var pgNum = pg ? pg.getAttribute('data-page') : '';
        if (openedSeals.indexOf(pgNum) !== -1) {
          stop.classList.add('stop-opened');
        }

        (function(idx) {
          stop.addEventListener('click', function() {
            playRustle();
            slider.scrollTo({ left: slider.offsetWidth * idx, behavior: 'smooth' });
          });
        })(d);

        stopsContainer.appendChild(stop);
      }
    }

    function updateFlightPath() {
      var idx = Math.round(slider.scrollLeft / slider.offsetWidth);

      // track'i kaydır — uçak her zaman ortada
      if (track) {
        var stopX = TRACK_PAD + idx * STOP_SPACING;
        var offset = (containerW / 2) - stopX;
        track.style.transform = 'translateX(' + offset + 'px)';
      }

      // durak aktif durumu
      var stops = stopsContainer ? stopsContainer.querySelectorAll('.flight-stop') : [];
      for (var s = 0; s < stops.length; s++) {
        stops[s].classList.toggle('stop-active', s === idx);
      }

      // uçak animasyonu
      if (plane && idx !== lastPlaneIdx) {
        plane.classList.remove('fly-right', 'fly-left');
        void plane.offsetWidth;
        plane.classList.add(idx > lastPlaneIdx ? 'fly-right' : 'fly-left');
        lastPlaneIdx = idx;
      }
    }

    slider.addEventListener('scroll', function () {
      requestAnimationFrame(function() {
        updateCounter();
        updateFlightPath();
      });
    }, { passive: true });

    updateCounter();
    updateFlightPath();

    // --- aktif sayfa tespiti ---
    if ('IntersectionObserver' in window) {
      var pageObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          } else {
            entry.target.classList.remove('active');
          }
        });
      }, {
        root: slider,
        threshold: 0.55
      });

      pages.forEach(function (page) {
        pageObserver.observe(page);
      });

      if (pages[0]) pages[0].classList.add('active');
    } else {
      pages.forEach(function (p) { p.classList.add('active'); });
    }

    // --- mühür kırma ---
    var seals = slider.querySelectorAll('.ms-wax-seal:not(.seal-locked)');
    for (var s = 0; s < seals.length; s++) {
      (function (seal) {
        function breakSeal() {
          var page = seal.closest('.ms-page');
          if (!page || page.classList.contains('opened')) return;

          seal.classList.add('breaking');
          spawnSealParticles(seal);
          if (window.MUNZEVI_SOUNDS) {
            window.MUNZEVI_SOUNDS.rustle();
            window.MUNZEVI_SOUNDS.sealCrack();
          } else {
            playRustle();
          }

          var pageNum = page.getAttribute('data-page') || '';
          saveOpenedSeal(pageNum);

          setTimeout(function() {
            page.classList.add('opened');
          }, 500);

          var link = page.querySelector('.ms-page-link');
          if (link) {
            setTimeout(function() {
              window.location.href = link.getAttribute('href');
            }, 750);
          }
        }

        seal.addEventListener('click', breakSeal);
        seal.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            breakSeal();
          }
        });
      })(seals[s]);
    }
  }


  // ═══════════════════════════════════════════════════════
  //  MÜHÜR PARÇACIKLARI
  // ═══════════════════════════════════════════════════════

  function spawnSealParticles(seal) {
    var rect = seal.getBoundingClientRect();
    var parent = seal.closest('.ms-page-inner');
    if (!parent) return;
    var pRect = parent.getBoundingClientRect();

    for (var i = 0; i < 8; i++) {
      var p = document.createElement('div');
      p.className = 'seal-particle';
      var size = 3 + Math.random() * 5;
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      p.style.left = (rect.left - pRect.left + rect.width / 2) + 'px';
      p.style.top = (rect.top - pRect.top + rect.height / 2) + 'px';
      p.style.background = getComputedStyle(seal).getPropertyValue('--seal-color') || '#8b0000';

      var angle = (Math.PI * 2 / 8) * i + (Math.random() - 0.5);
      var dist = 30 + Math.random() * 50;
      var dx = Math.cos(angle) * dist;
      var dy = Math.sin(angle) * dist;

      parent.appendChild(p);

      p.animate([
        { transform: 'translate(0, 0) scale(1)', opacity: 0.9 },
        { transform: 'translate(' + dx + 'px, ' + dy + 'px) scale(0.2)', opacity: 0 }
      ], { duration: 600 + Math.random() * 300, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' });

      (function(el) {
        setTimeout(function() { if (el.parentNode) el.parentNode.removeChild(el); }, 1000);
      })(p);
    }
  }


  // ═══════════════════════════════════════════════════════
  //  HOŞGELDİN SAYFASI (ilk ziyaret)
  // ═══════════════════════════════════════════════════════

  function initWelcome() {
    var welcome = document.getElementById('welcome-page');
    if (!welcome) return;

    var visited = localStorage.getItem('munzevi-visited');
    if (!visited) {
      welcome.style.display = '';
      localStorage.setItem('munzevi-visited', '1');
    } else {
      welcome.remove();
    }
  }


  // ═══════════════════════════════════════════════════════
  //  İNSANİ ZAMAN İFADESİ
  // ═══════════════════════════════════════════════════════

  function initTimeAgo() {
    var els = document.querySelectorAll('.ms-page-ago[data-written]');
    var now = Date.now();

    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      var written = new Date(el.getAttribute('data-written')).getTime();
      var diff = now - written;
      var days = Math.floor(diff / 86400000);
      var months = Math.floor(days / 30);
      var years = Math.floor(days / 365);

      var text = '';
      if (years > 1) text = years + ' yıl önce yazıldı';
      else if (years === 1) text = 'bir yıl önce yazıldı';
      else if (months > 1) text = months + ' ay önce yazıldı';
      else if (months === 1) text = 'bir ay önce yazıldı';
      else if (days > 1) text = days + ' gün önce yazıldı';
      else text = 'bugün yazıldı';

      el.textContent = text;
    }
  }


  // ═══════════════════════════════════════════════════════
  //  KAĞIT HIŞIRTISI (scroll arası)
  // ═══════════════════════════════════════════════════════

  var PAPER_RUSTLE = null;
  try {
    var actx = new (window.AudioContext || window.webkitAudioContext)();
    function createRustle() {
      var buf = actx.createBuffer(1, actx.sampleRate * 0.08, actx.sampleRate);
      var data = buf.getChannelData(0);
      for (var i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.03 * (1 - i / data.length);
      }
      PAPER_RUSTLE = buf;
    }
    createRustle();
  } catch(e) {}

  function playRustle() {
    if (!PAPER_RUSTLE || !actx) return;
    try {
      if (actx.state === 'suspended') actx.resume();
      var src = actx.createBufferSource();
      src.buffer = PAPER_RUSTLE;
      var gain = actx.createGain();
      gain.gain.value = 0.15;
      src.connect(gain).connect(actx.destination);
      src.start();
    } catch(e) {}
  }


  // ═══════════════════════════════════════════════════════
  //  YOLDA OLAN MEKTUPLAR
  // ═══════════════════════════════════════════════════════

  function initEnroute() {
    var enroutes = document.querySelectorAll('.ms-page-enroute[data-arrives]');
    if (!enroutes.length) return;

    var now = new Date();
    now.setHours(0, 0, 0, 0);

    for (var i = 0; i < enroutes.length; i++) {
      var page = enroutes[i];
      var arrives = new Date(page.getAttribute('data-arrives'));
      arrives.setHours(0, 0, 0, 0);

      var diff = arrives.getTime() - now.getTime();
      var days = Math.ceil(diff / 86400000);

      var countdown = page.querySelector('.enroute-countdown');
      var hint = page.querySelector('.enroute-hint');

      if (days <= 0) {
        page.classList.add('arrived');
        page.classList.remove('ms-page-enroute');

        var face = page.querySelector('.enroute-face');
        if (face) face.style.display = 'none';

        var inner = page.querySelector('.ms-page-inner');
        if (!inner) continue;

        var title = page.querySelector('.ms-page-title');
        var titleText = title ? title.textContent : '';
        var stampId = page.querySelector('[data-stamp-id]');
        var sid = stampId ? stampId.getAttribute('data-stamp-id') : '';

        var sealSymbols = ['ﺍ','ﻭ','ﻥ','ﻡ','ﺏ','ﺩ','ﺭ','ﺱ','ﻉ','ﻕ'];
        var symIdx = sid.length % sealSymbols.length;

        var arrivedFace = document.createElement('div');
        arrivedFace.className = 'ms-envelope-face ms-envelope-face-arrived';
        arrivedFace.innerHTML =
          '<h2 class="ms-page-title" style="opacity:1;transform:none">' + titleText + '</h2>' +
          '<div class="ms-wax-seal" role="button" tabindex="0" aria-label="mektubu aç" data-stamp-id="' + sid + '">' +
            '<span class="seal-half seal-left"></span>' +
            '<span class="seal-half seal-right"></span>' +
            '<span class="seal-letter">' + sealSymbols[symIdx] + '</span>' +
          '</div>' +
          '<p class="ms-seal-prompt">mektup ulaştı — mektubu aç</p>';

        inner.appendChild(arrivedFace);

        var newSeal = arrivedFace.querySelector('.ms-wax-seal');
        if (newSeal) {
          var color = SEAL_COLORS[hashStr(sid) % SEAL_COLORS.length];
          newSeal.style.setProperty('--seal-color', color.bg);
          newSeal.style.setProperty('--seal-shadow', color.shadow);
          newSeal.style.setProperty('--seal-glow', color.glow);

          (function(seal) {
            function breakIt() {
              var pg = seal.closest('.ms-page');
              if (!pg || pg.classList.contains('opened')) return;
              seal.classList.add('breaking');
              spawnSealParticles(seal);
              playRustle();
              var pgNum = pg.getAttribute('data-page') || '';
              saveOpenedSeal(pgNum);
              setTimeout(function() { pg.classList.add('opened'); }, 500);
              var link = pg.querySelector('.ms-page-link');
              if (link) {
                setTimeout(function() { window.location.href = link.getAttribute('href'); }, 750);
              }
            }
            seal.addEventListener('click', breakIt);
          })(newSeal);
        }

      } else {
        if (countdown) {
          if (days === 1) {
            countdown.textContent = 'yarın ulaşacak';
          } else {
            countdown.textContent = days + ' gün sonra ulaşacak';
          }
        }
        if (hint) {
          hint.textContent = 'bu mektup yolda.';
        }
      }
    }
  }


  // ═══════════════════════════════════════════════════════
  //  GİZLİ KELİME BULMA (secret-ink)
  // ═══════════════════════════════════════════════════════

  function initSecretWords() {
    var secrets = document.querySelectorAll('.secret-ink[data-secret]');
    if (!secrets.length) return;

    var found = [];
    try { found = JSON.parse(localStorage.getItem('munzevi-secret-words') || '[]'); } catch(e) {}

    secrets.forEach(function(el) {
      var word = el.getAttribute('data-secret');

      var alreadyFound = found.some(function(f) { return f.word === word && f.url === window.location.pathname; });
      if (alreadyFound) {
        el.classList.add('secret-revealed');
      }

      document.addEventListener('selectionchange', function() {
        var sel = window.getSelection();
        if (!sel || !sel.toString()) return;

        if (sel.containsNode(el, true) || sel.toString().indexOf(word) !== -1) {
          if (!el.classList.contains('secret-revealed')) {
            el.classList.add('secret-revealed');

            var pageUrl = window.location.pathname;
            var slug = pageUrl.replace(/^\//, '').replace(/\/$/, '');
            var idx = -1;

            if (window.MUNZEVI_SECRET_MAP) {
              for (var k in window.MUNZEVI_SECRET_MAP) {
                if (pageUrl.indexOf(k) !== -1) {
                  idx = window.MUNZEVI_SECRET_MAP[k];
                  break;
                }
              }
            }

            var entry = { word: word, url: pageUrl, idx: idx };
            var exists = found.some(function(f) { return f.word === word && f.url === pageUrl; });
            if (!exists) {
              found.push(entry);
              localStorage.setItem('munzevi-secret-words', JSON.stringify(found));
            }
          }
        }
      });
    });
  }


  // ═══════════════════════════════════════════════════════
  //  RÜZGARA BIRAKILAN SAYFA
  // ═══════════════════════════════════════════════════════

  function initWindPage() {
    var quote = document.getElementById('wind-quote');
    var link = document.getElementById('wind-link');
    if (!quote || !link) return;

    var posts = window.MUNZEVI_POSTS || [];
    if (!posts.length) return;

    var today = new Date();
    var dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
    var idx = dayOfYear % posts.length;
    var url = posts[idx];

    var excerpts = document.querySelectorAll('.ms-page .ms-page-text');
    if (excerpts[idx]) {
      var text = excerpts[idx].textContent.trim();
      var sentences = text.split(/[.!?…]+/).filter(function(s) { return s.trim().length > 15; });
      var sentenceIdx = dayOfYear % Math.max(sentences.length, 1);
      quote.textContent = '\u201c' + (sentences[sentenceIdx] || text.substring(0, 80)).trim() + '\u2026\u201d';
    } else {
      quote.textContent = '\u201c...\u201d';
    }

    link.href = url;
  }


  // ═══════════════════════════════════════════════════════
  //  DEFTERİ KAPAT
  // ═══════════════════════════════════════════════════════

  function initClosingVeil() {
    var veil = document.getElementById('closing-veil');
    if (!veil) return;

    var triggered = false;

    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden' && !triggered) {
        triggered = true;

        var journey = getJourney();
        var isSirdas = localStorage.getItem('munzevi-sirdas') === '1';
        var msg = 'defter kapanıyor\u2026';

        if (isSirdas) msg = 'bir sırdaş daha gidiyor. defter bunu hatırlayacak.';
        else if (journey.length >= 20) msg = 'her gittiğinde bir mektup daha soluyor.';
        else if (journey.length >= 10) msg = 'gitme.';

        veil.style.setProperty('--closing-msg', '"' + msg + '"');
        veil.classList.add('closing');
        setTimeout(function () {
          veil.classList.remove('closing');
          triggered = false;
        }, 3000);
      }
    });
  }


  // ═══════════════════════════════════════════════════════
  //  AY EVRESİ
  // ═══════════════════════════════════════════════════════

  function getMoonPhase() {
    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth() + 1;
    var day = now.getDate();
    var c, e, jd, b;
    if (month < 3) { c = year - 1; e = month + 12; }
    else { c = year; e = month; }
    jd = Math.floor(365.25 * c) + Math.floor(30.6001 * (e + 1)) + day - 694039.09;
    jd /= 29.5305882;
    b = parseInt(jd, 10);
    jd -= b;
    b = Math.round(jd * 8);
    if (b >= 8) b = 0;
    return b;
  }

  function initMoonPhase() {
    var el = document.getElementById('moon-phase');
    if (!el) return;
    var moonChars = ['\uD83C\uDF11','\uD83C\uDF12','\uD83C\uDF13','\uD83C\uDF14','\uD83C\uDF15','\uD83C\uDF16','\uD83C\uDF17','\uD83C\uDF18'];
    var moonNames = ['yeni ay','hilâl','ilk dördün','dolunaya yaklaşan','dolunay','küçülen ay','son dördün','son hilâl'];
    var phase = getMoonPhase();
    el.textContent = moonChars[phase] || '\uD83C\uDF19';
    el.setAttribute('title', moonNames[phase] || '');
  }


  // ═══════════════════════════════════════════════════════
  //  İMZA DÖNGÜSÜ
  // ═══════════════════════════════════════════════════════

  function initSignatureCycle() {
    if (fxOff('signature')) return;
    var brand = document.getElementById('site-brand');
    if (!brand) return;
    var raw = brand.getAttribute('data-signature-variations');
    if (!raw) return;
    try {
      var list = JSON.parse(raw);
      if (!Array.isArray(list) || list.length < 2) return;
      var index = 0;
      function next() {
        brand.style.opacity = '0';
        setTimeout(function () {
          index = (index + 1) % list.length;
          brand.textContent = list[index];
          brand.style.opacity = '1';
        }, 350);
      }
      setInterval(next, 3200);
    } catch (e) {}
  }


  // ═══════════════════════════════════════════════════════
  //  SİS EFEKTİ
  // ═══════════════════════════════════════════════════════

  function initFog() {
    if (fxOff('fog')) return;
    var fog = document.getElementById('page-fog');
    if (!fog) return;
    if (document.querySelector('.post-manuscript')) {
      fog.classList.add('active');
    }
  }


  // ═══════════════════════════════════════════════════════
  //  TYPEWRITER (daktilo efekti)
  // ═══════════════════════════════════════════════════════

  function initTypewriter() {
    var postBody = document.querySelector('.post-body');
    if (!postBody) return;

    var enabled = localStorage.getItem('munzevi-typewriter');
    if (enabled === 'off') {
      document.body.classList.add('typewriter-off');
      return;
    }

    var speed = parseInt(localStorage.getItem('munzevi-typewriter-speed') || '35', 10);
    var paragraphs = postBody.querySelectorAll('p');
    if (!paragraphs.length) return;

    function wrapCharsInNode(node, startIndex) {
      if (node.nodeType !== 3) return startIndex;
      var text = node.textContent;
      if (!text) return startIndex;
      var frag = document.createDocumentFragment();
      var idx = startIndex;
      for (var i = 0; i < text.length; i++) {
        var span = document.createElement('span');
        span.className = 'char-reveal';
        span.textContent = text[i];
        span.style.animationDelay = (idx * speed / 1000) + 's';
        frag.appendChild(span);
        idx++;
      }
      node.parentNode.replaceChild(frag, node);
      return idx;
    }

    function wrapCharsInElement(el, startIndex) {
      var idx = startIndex;
      var nodes = [];
      for (var i = 0; i < el.childNodes.length; i++) nodes.push(el.childNodes[i]);
      for (var j = 0; j < nodes.length; j++) {
        var n = nodes[j];
        if (n.nodeType === 3) idx = wrapCharsInNode(n, idx);
        else if (n.nodeType === 1 && !n.classList.contains('secret-ink')) idx = wrapCharsInElement(n, idx);
      }
      return idx;
    }

    if (!('IntersectionObserver' in window)) {
      paragraphs.forEach(function (p) {
        wrapCharsInElement(p, 0);
        p.classList.add('typing');
      });
      return;
    }

    var nextToType = 0;
    var pending = {};
    var wrapped = {};

    function startParagraph(index) {
      var p = paragraphs[index];
      if (!p || p.classList.contains('typing')) return;
      if (!wrapped[index]) {
        wrapCharsInElement(p, 0);
        wrapped[index] = true;
      }
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          p.classList.add('typing');
          var chars = p.querySelectorAll('.char-reveal');
          var duration = (chars.length * speed) + 150;
          setTimeout(function () {
            nextToType = index + 1;
            if (pending[nextToType]) startParagraph(nextToType);
          }, duration);
        });
      });
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var p = entry.target;
        var index = parseInt(p.getAttribute('data-typing-index'), 10);
        if (isNaN(index)) return;
        pending[index] = true;
        if (index === nextToType) startParagraph(index);
        observer.unobserve(p);
      });
    }, { rootMargin: '0px 0px -60px 0px', threshold: 0 });

    for (var i = 0; i < paragraphs.length; i++) {
      paragraphs[i].setAttribute('data-typing-index', i);
      observer.observe(paragraphs[i]);
    }
  }


  // ═══════════════════════════════════════════════════════
  //  SAYFA GEÇİŞ ANİMASYONLARI
  // ═══════════════════════════════════════════════════════

  var PAGETURN_KEY = 'munzevi-page-turn';

  function initPageTransitions() {
    if (fxOff('pageturn')) return;
    var transition = document.getElementById('page-transition');
    if (!transition) return;

    try {
      if (sessionStorage.getItem(PAGETURN_KEY) === '1') {
        document.body.classList.add('page-enter-ready');
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            document.body.classList.add('page-enter');
            setTimeout(function () {
              document.body.classList.remove('page-enter-ready', 'page-enter');
            }, 500);
            try { sessionStorage.removeItem(PAGETURN_KEY); } catch (e) {}
          });
        });
      }
    } catch (e) {}

    document.body.addEventListener('click', function (e) {
      var link = e.target && e.target.closest ? e.target.closest('a[href]') : null;
      if (!link) return;
      if (link.getAttribute('target') === '_blank' || e.ctrlKey || e.metaKey || e.shiftKey) return;
      var href = link.getAttribute('href');
      if (!href || href === '#' || href === '') return;
      try {
        var url = new URL(link.href, window.location.href);
        if (url.origin !== window.location.origin) return;
      } catch (err) { return; }

      e.preventDefault();
      try { sessionStorage.setItem(PAGETURN_KEY, '1'); } catch (ex) {}
      document.body.classList.add('page-exit');

      var done = false;
      function go() {
        if (done) return;
        done = true;
        window.location.href = link.href;
      }
      transition.addEventListener('transitionend', go);
      setTimeout(go, 350);
    });
  }


  // ═══════════════════════════════════════════════════════
  //  MEVSİM DUYARLILIĞI
  // ═══════════════════════════════════════════════════════

  function fxOff(key) {
    try { return localStorage.getItem('munzevi-fx-' + key) === 'off'; } catch (e) { return false; }
  }

  function initFxClasses() {
    if (fxOff('wobble'))  document.body.classList.add('no-wobble');
    if (fxOff('breathe')) document.body.classList.add('no-breathe');
    if (fxOff('cursor'))  document.body.classList.add('no-cursor');
    if (fxOff('stars'))   document.body.classList.add('no-stars');
  }

  function initSeason() {
    var m = new Date().getMonth();
    var s = (m >= 2 && m <= 4) ? 'spring' : (m >= 5 && m <= 7) ? 'summer' : (m >= 8 && m <= 10) ? 'autumn' : 'winter';
    document.documentElement.setAttribute('data-season', s);
  }


  // ═══════════════════════════════════════════════════════
  //  DOLUNAY CLICK
  // ═══════════════════════════════════════════════════════

  function initDolunayClick() {
    var moon = document.getElementById('moon-phase');
    if (!moon) return;
    moon.style.cursor = 'pointer';
    moon.style.pointerEvents = 'auto';
    moon.addEventListener('click', function () {
      window.location.href = getBaseUrl() + '/dolunay/';
    });
  }


  // ═══════════════════════════════════════════════════════
  //  OKUMA İZİ (mürekkep çizgisi)
  // ═══════════════════════════════════════════════════════

  function initReadingTrace() {
    if (fxOff('trace')) return;
    var trace = document.getElementById('reading-trace');
    var postBody = document.querySelector('.post-body');
    if (!trace || !postBody) return;

    var url = window.location.pathname;
    var storeKey = 'munzevi-reading-traces';
    var traces = {};
    try { traces = JSON.parse(localStorage.getItem(storeKey) || '{}'); } catch (e) {}

    var prev = traces[url] || { max: 0, visits: 0 };
    prev.visits = (prev.visits || 0) + 1;

    if (prev.max > 0) {
      trace.classList.add('has-history');
      trace.style.height = prev.max + '%';
    }

    trace.classList.add('active');

    function updateTrace() {
      var rect = postBody.getBoundingClientRect();
      var bodyH = rect.height;
      if (bodyH <= 0) return;
      var scrolled = -rect.top + window.innerHeight;
      var pct = Math.min(100, Math.max(0, (scrolled / bodyH) * 100));
      trace.style.height = Math.max(pct, prev.max) + '%';
      if (pct > prev.max) {
        prev.max = Math.round(pct);
        traces[url] = prev;
        try { localStorage.setItem(storeKey, JSON.stringify(traces)); } catch (e) {}
      }
    }

    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { updateTrace(); ticking = false; });
    }, { passive: true });

    setTimeout(updateTrace, 300);
  }


  // ═══════════════════════════════════════════════════════
  //  KAHVE LEKELERİ & GÖZYAŞI İZLERİ
  // ═══════════════════════════════════════════════════════

  function initCoffeeStains() {
    if (fxOff('stains')) return;
    var article = document.querySelector('.post-manuscript');
    if (!article) return;
    var dateStr = article.getAttribute('data-post-date');
    if (!dateStr) return;

    var postDate = new Date(dateStr).getTime();
    var now = Date.now();
    var ageDays = (now - postDate) / 86400000;
    if (ageDays < 7) return;

    var isEmotional = article.hasAttribute('data-emotional');
    var seed = hashStr(dateStr);
    var stainCount = Math.min(5, Math.floor(ageDays / 60) + 1);
    var tezhipFrame = article.querySelector('.tezhip-frame');
    if (!tezhipFrame) return;
    tezhipFrame.style.position = 'relative';

    for (var i = 0; i < stainCount; i++) {
      var s = document.createElement('div');
      s.className = 'coffee-stain';
      var sz = 30 + ((seed * (i + 1) * 7) % 60);
      var top = 10 + ((seed * (i + 1) * 13) % 75);
      var left = 5 + ((seed * (i + 1) * 17) % 85);
      var opacity = 0.025 + (ageDays / 3000) * 0.04;
      s.style.cssText =
        'width:' + sz + 'px;height:' + sz + 'px;' +
        'top:' + top + '%;left:' + left + '%;' +
        'background:radial-gradient(ellipse at 40% 35%,' +
        'rgba(120,80,30,' + opacity.toFixed(3) + '),' +
        'rgba(100,65,20,' + (opacity * 0.5).toFixed(3) + ') 50%,' +
        'transparent 70%);' +
        'animation-delay:' + (i * 0.8) + 's';
      tezhipFrame.appendChild(s);
    }

    if (isEmotional) {
      var tearCount = 1 + ((seed * 3) % 3);
      for (var t = 0; t < tearCount; t++) {
        var tear = document.createElement('div');
        tear.className = 'tear-mark';
        var tw = 15 + ((seed * (t + 1) * 11) % 20);
        var th = tw * 1.3;
        var tt = 20 + ((seed * (t + 1) * 19) % 60);
        var tl = 15 + ((seed * (t + 1) * 23) % 65);
        tear.style.cssText =
          'width:' + tw + 'px;height:' + th + 'px;' +
          'top:' + tt + '%;left:' + tl + '%;' +
          'background:radial-gradient(ellipse,' +
          'rgba(180,200,220,0.06),' +
          'rgba(160,180,200,0.02) 60%,' +
          'transparent 80%);' +
          'animation-delay:' + (t * 1.5 + 2) + 's';
        tezhipFrame.appendChild(tear);
      }
    }
  }


  // ═══════════════════════════════════════════════════════
  //  SON NEFES
  // ═══════════════════════════════════════════════════════

  function initLastBreath() {
    if (fxOff('lastbreath')) return;
    var postBody = document.querySelector('.post-body');
    var chain = document.querySelector('.letter-chain');
    if (!postBody) return;

    if (chain) chain.classList.add('letter-chain-pending');

    var paragraphs = postBody.querySelectorAll('p');
    if (!paragraphs.length) return;
    var lastP = paragraphs[paragraphs.length - 1];

    if (!('IntersectionObserver' in window)) {
      if (chain) chain.classList.add('revealed');
      return;
    }

    var triggered = false;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting || triggered) return;
        triggered = true;
        observer.disconnect();

        var text = lastP.textContent;
        var lastChar = text.charAt(text.length - 1);
        if (/[.…!?]/.test(lastChar)) {
          var walker = document.createTreeWalker(lastP, NodeFilter.SHOW_TEXT, null, false);
          var lastTextNode = null;
          while (walker.nextNode()) lastTextNode = walker.currentNode;

          if (lastTextNode && lastTextNode.textContent.length > 1) {
            var content = lastTextNode.textContent;
            lastTextNode.textContent = content.slice(0, -1);
            var dot = document.createElement('span');
            dot.className = 'last-breath-dot';
            dot.textContent = lastChar;
            lastTextNode.parentNode.appendChild(dot);
          }
        }

        setTimeout(function () {
          if (chain) chain.classList.add('revealed');
        }, 2500);
      });
    }, { threshold: 0.3 });

    observer.observe(lastP);
  }


  // ═══════════════════════════════════════════════════════
  //  KONSTELLASYON HARİTASI
  // ═══════════════════════════════════════════════════════

  function initConstellation() {
    var svg = document.getElementById('constellation-svg');
    var wrap = document.getElementById('constellation-wrap');
    if (!svg || !wrap || !window.MUNZEVI_STAR_DATA) return;

    var rendered = false;
    var tabBtn = document.querySelector('[data-tab="constellation"]');
    if (tabBtn) {
      tabBtn.addEventListener('click', function () {
        if (!rendered) { rendered = true; setTimeout(renderConstellation, 50); }
      });
    }
    if (wrap.offsetWidth > 0) { rendered = true; renderConstellation(); }

    function renderConstellation() {
    var stars = window.MUNZEVI_STAR_DATA;
    var W = wrap.offsetWidth || 600;
    var H = wrap.offsetHeight || 400;
    var pad = 40;
    var stamps = getCollectedStamps();
    var journey = getJourney();

    var ns = 'http://www.w3.org/2000/svg';
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);

    var positions = [];
    for (var i = 0; i < stars.length; i++) {
      var seed = hashStr(stars[i].id || stars[i].title);
      var angle = (seed % 360) * (Math.PI / 180);
      var radius = 0.2 + ((seed * 7) % 60) / 100;
      var cx = W / 2 + Math.cos(angle) * radius * (W / 2 - pad);
      var cy = H / 2 + Math.sin(angle) * radius * (H / 2 - pad);
      cx = Math.max(pad, Math.min(W - pad, cx));
      cy = Math.max(pad, Math.min(H - pad, cy));
      positions.push({ x: cx, y: cy });
    }

    var journeyOrder = [];
    for (var j = 0; j < journey.length; j++) {
      for (var k = 0; k < stars.length; k++) {
        if (stars[k].id === journey[j].id) {
          journeyOrder.push(k);
          break;
        }
      }
    }

    if (journeyOrder.length > 1) {
      var pathD = 'M ' + positions[journeyOrder[0]].x + ' ' + positions[journeyOrder[0]].y;
      for (var p = 1; p < journeyOrder.length; p++) {
        pathD += ' L ' + positions[journeyOrder[p]].x + ' ' + positions[journeyOrder[p]].y;
      }
      var path = document.createElementNS(ns, 'path');
      path.setAttribute('d', pathD);
      path.setAttribute('class', 'const-journey');
      var len = 0;
      for (var q = 1; q < journeyOrder.length; q++) {
        var dx = positions[journeyOrder[q]].x - positions[journeyOrder[q-1]].x;
        var dy = positions[journeyOrder[q]].y - positions[journeyOrder[q-1]].y;
        len += Math.sqrt(dx*dx + dy*dy);
      }
      path.setAttribute('stroke-dasharray', Math.ceil(len));
      path.style.animationDuration = Math.min(5, len / 200) + 's';
      svg.appendChild(path);
    }

    for (var s = 0; s < stars.length; s++) {
      var collected = stamps.indexOf(stars[s].id) !== -1;
      var circle = document.createElementNS(ns, 'circle');
      circle.setAttribute('cx', positions[s].x);
      circle.setAttribute('cy', positions[s].y);
      circle.setAttribute('r', collected ? 3.5 : 2);
      circle.setAttribute('fill', collected ? '#d4a373' : 'rgba(201,185,154,0.25)');
      circle.setAttribute('class', 'const-star');
      circle.setAttribute('data-idx', s);
      svg.appendChild(circle);

      var label = document.createElementNS(ns, 'text');
      label.setAttribute('x', positions[s].x);
      label.setAttribute('y', positions[s].y - 8);
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('class', 'const-label');
      label.setAttribute('opacity', collected ? '0.5' : '0.15');
      label.textContent = stars[s].title.length > 20 ? stars[s].title.substring(0, 18) + '…' : stars[s].title;
      svg.appendChild(label);

      (function (star) {
        circle.addEventListener('click', function () {
          window.location.href = star.url;
        });
      })(stars[s]);
    }

    var countEl = document.getElementById('const-count');
    if (countEl) countEl.textContent = journeyOrder.length;
    } // renderConstellation sonu
  }


  // ═══════════════════════════════════════════════════════
  //  GELİŞTİRİLMİŞ SES TASARIMI
  // ═══════════════════════════════════════════════════════

  function createEnhancedSounds() {
    if (!actx) return;

    window.MUNZEVI_SOUNDS = {
      rustle: function () {
        try {
          if (actx.state === 'suspended') actx.resume();
          var dur = 0.18;
          var buf = actx.createBuffer(1, actx.sampleRate * dur, actx.sampleRate);
          var d = buf.getChannelData(0);
          for (var i = 0; i < d.length; i++) {
            var env = Math.pow(1 - i / d.length, 1.5);
            d[i] = (Math.random() * 2 - 1) * 0.04 * env;
          }
          var src = actx.createBufferSource();
          src.buffer = buf;
          var bp = actx.createBiquadFilter();
          bp.type = 'bandpass';
          bp.frequency.value = 3000;
          bp.Q.value = 0.7;
          var gain = actx.createGain();
          gain.gain.value = 0.2;
          src.connect(bp).connect(gain).connect(actx.destination);
          src.start();
        } catch (e) {}
      },

      sealCrack: function () {
        try {
          if (actx.state === 'suspended') actx.resume();
          var dur = 0.12;
          var buf = actx.createBuffer(1, actx.sampleRate * dur, actx.sampleRate);
          var d = buf.getChannelData(0);
          for (var i = 0; i < d.length; i++) {
            var t = i / actx.sampleRate;
            var env = Math.exp(-t * 40);
            d[i] = (Math.random() * 2 - 1) * 0.08 * env + Math.sin(t * 800) * 0.03 * env;
          }
          var src = actx.createBufferSource();
          src.buffer = buf;
          var hp = actx.createBiquadFilter();
          hp.type = 'highpass';
          hp.frequency.value = 600;
          var gain = actx.createGain();
          gain.gain.value = 0.25;
          src.connect(hp).connect(gain).connect(actx.destination);
          src.start();
        } catch (e) {}
      },

      themeSwitch: function () {
        try {
          if (actx.state === 'suspended') actx.resume();
          var osc = actx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(80, actx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(300, actx.currentTime + 0.15);
          var gain = actx.createGain();
          gain.gain.setValueAtTime(0.04, actx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.3);
          osc.connect(gain).connect(actx.destination);
          osc.start();
          osc.stop(actx.currentTime + 0.3);
        } catch (e) {}
      }
    };
  }


  // ═══════════════════════════════════════════════════════
  //  HİCRİ TAKVİM
  // ═══════════════════════════════════════════════════════

  function gregorianToHijri(gY, gM, gD) {
    var jd = Math.floor((1461 * (gY + 4800 + Math.floor((gM - 14) / 12))) / 4) +
             Math.floor((367 * (gM - 2 - 12 * Math.floor((gM - 14) / 12))) / 12) -
             Math.floor((3 * Math.floor((gY + 4900 + Math.floor((gM - 14) / 12)) / 100)) / 4) +
             gD - 32075;
    var l = jd - 1948440 + 10632;
    var n = Math.floor((l - 1) / 10631);
    l = l - 10631 * n + 354;
    var j = Math.floor((10985 - l) / 5316) * Math.floor((50 * l) / 17719) +
            Math.floor(l / 5670) * Math.floor((43 * l) / 15238);
    l = l - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
        Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
    var hM = Math.floor((24 * l) / 709);
    var hD = l - Math.floor((709 * hM) / 24);
    var hY = 30 * n + j - 30;
    return { year: hY, month: hM, day: hD };
  }

  var HIJRI_MONTHS = [
    '', 'Muharrem', 'Safer', 'Rebîülevvel', 'Rebîülâhir',
    'Cemâziyelevvel', 'Cemâziyelâhir', 'Receb', 'Şaban',
    'Ramazan', 'Şevval', 'Zilkade', 'Zilhicce'
  ];

  function initHijriDates() {
    var els = document.querySelectorAll('.post-date-hijri[data-date]');
    for (var i = 0; i < els.length; i++) {
      var parts = els[i].getAttribute('data-date').split('-');
      if (parts.length < 3) continue;
      var h = gregorianToHijri(parseInt(parts[0]), parseInt(parts[1]), parseInt(parts[2]));
      els[i].textContent = h.day + ' ' + HIJRI_MONTHS[h.month] + ' ' + h.year;
    }
  }


  // ═══════════════════════════════════════════════════════
  //  NABIZ (defterin kalp atışı)
  // ═══════════════════════════════════════════════════════

  function initPulse() {
    document.body.classList.add('has-pulse');
  }


  // ═══════════════════════════════════════════════════════
  //  UNUTULAN MEKTUP (once_only)
  // ═══════════════════════════════════════════════════════

  function initOnceOnly() {
    var article = document.querySelector('[data-once-only="true"]');
    if (!article) return;

    var key = 'munzevi-once-read';
    var read = [];
    try { read = JSON.parse(localStorage.getItem(key) || '[]'); } catch (e) {}
    var url = window.location.pathname;

    var veil = document.getElementById('once-only-veil');

    if (read.indexOf(url) !== -1) {
      if (veil) veil.style.display = '';
      var layout = article.querySelector('.post-layout');
      if (layout) layout.style.display = 'none';
    } else {
      read.push(url);
      try { localStorage.setItem(key, JSON.stringify(read)); } catch (e) {}
    }
  }


  // ═══════════════════════════════════════════════════════
  //  HASRET MEKTUBU (defterin özlemi)
  // ═══════════════════════════════════════════════════════

  function initHasret() {
    var overlay = document.getElementById('hasret-overlay');
    if (!overlay) return;

    var lastKey = 'munzevi-last-visit';
    var lastVisit = 0;
    try { lastVisit = parseInt(localStorage.getItem(lastKey) || '0', 10); } catch (e) {}
    var now = Date.now();
    try { localStorage.setItem(lastKey, String(now)); } catch (e) {}

    if (lastVisit === 0) return;

    var daysSince = (now - lastVisit) / 86400000;
    if (daysSince < 30) return;

    var hasretShown = 'munzevi-hasret-shown';
    if (localStorage.getItem(hasretShown) === String(Math.floor(now / 86400000))) return;
    try { localStorage.setItem(hasretShown, String(Math.floor(now / 86400000))); } catch (e) {}

    overlay.style.display = '';

    setTimeout(function () {
      var l1 = document.getElementById('hasret-line-1');
      if (l1) l1.classList.add('visible');
    }, 1500);

    setTimeout(function () {
      var l2 = document.getElementById('hasret-line-2');
      if (l2) l2.classList.add('visible');
    }, 4000);

    setTimeout(function () {
      overlay.classList.add('fading');
      setTimeout(function () { overlay.style.display = 'none'; }, 2500);
    }, 8000);
  }


  // ═══════════════════════════════════════════════════════
  //  SON SAYFA (nihai ödül — footer link)
  // ═══════════════════════════════════════════════════════

  function initSonSayfa() {
    var el = document.getElementById('footer-son');
    if (!el) return;

    var journey = getJourney();
    var secrets = [];
    try { secrets = JSON.parse(localStorage.getItem('munzevi-secret-words') || '[]'); } catch (e) {}
    var halvetTime = parseInt(localStorage.getItem('munzevi-halvet-time') || '0', 10);
    var isSirdas = localStorage.getItem('munzevi-sirdas') === '1';

    var totalPosts = window.MUNZEVI_TOTAL_STAMPS || 37;
    var allRead = journey.length >= totalPosts - 2;
    var allSecrets = secrets.length >= 35;

    if (allRead && allSecrets && isSirdas && halvetTime >= 600) {
      el.classList.add('unlocked');
    }
  }


  // ═══════════════════════════════════════════════════════
  //  AYNA MEKTUBU (kişisel mektup)
  // ═══════════════════════════════════════════════════════

  function initAynaMektup() {
    var container = document.getElementById('ayna-mektup');
    if (!container) return;

    var journey = getJourney();
    var stamps = getCollectedStamps();
    var traces = {};
    try { traces = JSON.parse(localStorage.getItem('munzevi-reading-traces') || '{}'); } catch (e) {}
    var halvetTime = parseInt(localStorage.getItem('munzevi-halvet-time') || '0', 10);
    var theme = localStorage.getItem('munzevi-theme') || 'manuscript';
    var lastRead = localStorage.getItem('munzevi-last-read') || '';

    if (journey.length < 3) {
      container.style.display = 'none';
      return;
    }

    var hour = new Date().getHours();
    var timeWord = (hour >= 22 || hour < 6) ? 'gece' : (hour < 12) ? 'sabah' : (hour < 18) ? 'öğleden sonra' : 'akşam';

    var firstDate = new Date(journey[0].ts);
    var months = ['ocak','şubat','mart','nisan','mayıs','haziran','temmuz','ağustos','eylül','ekim','kasım','aralık'];
    var firstStr = firstDate.getDate() + ' ' + months[firstDate.getMonth()];

    var mostVisited = '';
    var maxV = 0;
    for (var url in traces) {
      if (traces[url].visits > maxV) { maxV = traces[url].visits; mostVisited = url; }
    }
    var favSlug = mostVisited ? mostVisited.replace(/^\//, '').replace(/\/$/, '').replace(/-/g, ' ') : '';

    var themeStr = theme === 'void'
      ? 'karanlığı tercih ettin — mum ışığında okuyanlardan birisin'
      : 'aydınlıkta okudun — krem rengi kağıdın sıcaklığını seçtin';

    var letter = 'bu mektubu <span class="ayna-mektup-accent">' + timeWord + '</span> okuyorsun. ';
    letter += 'ilk geldiğinde <span class="ayna-mektup-accent">' + firstStr + '</span>\'di. ';
    letter += 'o günden beri <span class="ayna-mektup-accent">' + stamps.length + '</span> mühür kırdın. ';

    if (favSlug) {
      letter += 'en çok \'<span class="ayna-mektup-accent">' + favSlug + '</span>\' mektubuna döndün — demek ki o satırlar sana bir şey fısıldadı. ';
    }

    letter += themeStr + '. ';

    if (halvetTime >= 60) {
      letter += '<span class="ayna-mektup-accent">' + Math.floor(halvetTime / 60) + '</span> dakika sessizlikte bekledin. ';
    }

    letter += '<br><br>biliyor musun, bu defter de seni bekliyor.';

    container.innerHTML = '<p>' + letter + '</p><p class="ayna-mektup-sign">— münzevî, sana</p>';
  }


  // ═══════════════════════════════════════════════════════
  //  MEKTUP YAKMA
  // ═══════════════════════════════════════════════════════

  function initBurnLetter() {
    var article = document.querySelector('.post-manuscript');
    if (!article) return;
    var layout = article.querySelector('.post-layout');
    if (!layout) return;

    var url = window.location.pathname;
    var burnKey = 'munzevi-burned';
    var burned = [];
    try { burned = JSON.parse(localStorage.getItem(burnKey) || '[]'); } catch (e) {}

    if (burned.indexOf(url) !== -1) {
      layout.style.display = 'none';
      var remains = document.getElementById('burned-remains');
      if (remains) {
        remains.style.display = '';
        var frag = document.getElementById('burned-fragment');
        var body = article.querySelector('.post-body');
        if (frag && body) {
          var text = body.textContent || '';
          var words = text.split(/\s+/).filter(function (w) { return w.length > 3; });
          var picks = [];
          for (var i = 0; i < Math.min(5, words.length); i++) {
            picks.push(words[Math.floor(Math.random() * words.length)]);
          }
          frag.textContent = '...' + picks.join('... ...') + '...';
        }
      }
      return;
    }

    var progress = document.getElementById('burn-progress');
    var circle = document.getElementById('burn-circle');
    var overlay = document.getElementById('burn-overlay');
    var holdTimer = null;
    var holdStart = 0;
    var HOLD_DURATION = 5000;

    function startHold(e) {
      if (e.button && e.button !== 0) return;
      holdStart = Date.now();
      if (progress) progress.classList.add('active');
      if (overlay) overlay.classList.add('active');

      holdTimer = setInterval(function () {
        var elapsed = Date.now() - holdStart;
        var pct = Math.min(1, elapsed / HOLD_DURATION);
        if (circle) circle.setAttribute('stroke-dashoffset', String(126 * (1 - pct)));

        if (pct >= 1) {
          clearInterval(holdTimer);
          burned.push(url);
          try { localStorage.setItem(burnKey, JSON.stringify(burned)); } catch (ex) {}
          article.classList.add('burning');
          setTimeout(function () {
            layout.style.display = 'none';
            if (progress) progress.classList.remove('active');
            if (overlay) overlay.classList.remove('active');
            var remains = document.getElementById('burned-remains');
            if (remains) remains.style.display = '';
          }, 3000);
        }
      }, 50);
    }

    function stopHold() {
      clearInterval(holdTimer);
      holdStart = 0;
      if (circle) circle.setAttribute('stroke-dashoffset', '126');
      if (progress) progress.classList.remove('active');
      if (overlay) overlay.classList.remove('active');
    }

    var postBody = article.querySelector('.post-body');
    if (postBody) {
      postBody.addEventListener('mousedown', startHold);
      postBody.addEventListener('mouseup', stopHold);
      postBody.addEventListener('mouseleave', stopHold);
      postBody.addEventListener('touchstart', startHold, { passive: true });
      postBody.addEventListener('touchend', stopHold);
    }
  }


  // ═══════════════════════════════════════════════════════
  //  BÜYÜYEN AĞAÇ
  // ═══════════════════════════════════════════════════════

  function initGrowingTree() {
    var leaves = document.getElementById('tree-leaves');
    var flowers = document.getElementById('tree-flowers');
    var trunk = document.getElementById('tree-trunk');
    if (!leaves) return;

    var journey = getJourney();
    var secrets = [];
    try { secrets = JSON.parse(localStorage.getItem('munzevi-secret-words') || '[]'); } catch (e) {}
    var halvetTime = parseInt(localStorage.getItem('munzevi-halvet-time') || '0', 10);

    var month = new Date().getMonth();
    var isWinter = month === 11 || month === 0 || month === 1;

    if (trunk) {
      var thickness = Math.min(6, 3 + Math.floor(halvetTime / 120));
      trunk.setAttribute('stroke-width', String(thickness));
    }

    var leafPositions = [
      [35,70],[30,62],[25,55],[38,50],[28,45],
      [65,60],[70,52],[60,48],[68,42],[72,55],
      [50,55],[45,45],[55,40],[42,35],[58,32],
      [48,28],[52,22],[40,20],[60,18],[50,12],
      [33,38],[67,35],[45,58],[55,65],[62,28],
      [36,25],[64,22],[47,15],[53,8],[50,5],
      [38,60],[42,52],[58,48],[55,55],[48,38],
      [62,45],[35,32]
    ];

    var ns = 'http://www.w3.org/2000/svg';
    for (var i = 0; i < Math.min(journey.length, leafPositions.length); i++) {
      var leaf = document.createElementNS(ns, 'circle');
      leaf.setAttribute('cx', String(leafPositions[i][0]));
      leaf.setAttribute('cy', String(leafPositions[i][1]));
      leaf.setAttribute('r', '4');
      leaf.setAttribute('class', 'tree-leaf');
      leaf.style.animationDelay = (i * 0.08) + 's';
      if (isWinter) leaf.style.opacity = '0.15';
      leaves.appendChild(leaf);
    }

    for (var j = 0; j < Math.min(secrets.length, 15); j++) {
      var pos = leafPositions[j % leafPositions.length];
      var flower = document.createElementNS(ns, 'circle');
      flower.setAttribute('cx', String(pos[0] + 3));
      flower.setAttribute('cy', String(pos[1] - 3));
      flower.setAttribute('r', '2.5');
      flower.setAttribute('class', 'tree-flower');
      flower.style.animationDelay = (j * 0.12 + 0.5) + 's';
      if (isWinter) flower.style.opacity = '0.1';
      flowers.appendChild(flower);
    }
  }


  // ═══════════════════════════════════════════════════════
  //  HAYALET MEKTUP
  // ═══════════════════════════════════════════════════════

  function initGhostLetter() {
    var slider = document.getElementById('manuscript-slider');
    if (!slider) return;

    var today = new Date();
    var dayOfMonth = today.getDate();
    var seed = today.getFullYear() * 372 + today.getMonth() * 31 + dayOfMonth;
    var ghostDay = (hashStr('ghost' + today.getMonth() + today.getFullYear()) % 28) + 1;
    if (dayOfMonth !== ghostDay) return;

    var ghostKey = 'munzevi-ghost-seen';
    var seenMonth = localStorage.getItem(ghostKey);
    var currentMonth = today.getFullYear() + '-' + today.getMonth();
    if (seenMonth === currentMonth) return;

    var ghostSentences = [
      'bazen en güçlü mektup, yazılmayan mektuptur.',
      'bu satırlar hiç var olmadı — ama sen onları okudun.',
      'bazı mektuplar gönderilmeden kaybolur. bu, onlardan biri.',
      'mürekkep bazen kağıda değmeden kurur.',
      'bu mektup bir rüyadan ibaret. uyanınca unutacaksın.',
      'yazılmamış mektuplar, yazılmışlardan daha ağır gelir.',
      'bu sayfada bir zamanlar bir şey vardı. şimdi sadece yokluğu var.',
      'her defterin bir boş sayfası olmalı. burası, o sayfa.'
    ];

    var ghost = document.createElement('article');
    ghost.className = 'ms-page ghost-letter';
    ghost.setAttribute('data-page', '?');
    ghost.innerHTML =
      '<div class="ms-page-inner" style="text-align:center">' +
        '<h2 class="ms-page-title" style="opacity:0.3;font-style:italic">bu mektup hiç yazılmadı</h2>' +
        '<div class="ms-wax-seal" style="background:transparent;box-shadow:none;border:1px dashed rgba(201,185,154,0.15);animation:none;cursor:pointer" id="ghost-seal">' +
          '<span class="seal-letter" style="opacity:0.2">∅</span>' +
        '</div>' +
        '<div style="display:none;margin-top:2rem" id="ghost-content">' +
          '<p class="ghost-letter-text">' + ghostSentences[seed % ghostSentences.length] + '</p>' +
        '</div>' +
      '</div>';

    var firstPage = slider.querySelector('.ms-page');
    if (firstPage) slider.insertBefore(ghost, firstPage);

    var seal = document.getElementById('ghost-seal');
    var content = document.getElementById('ghost-content');
    if (seal && content) {
      seal.addEventListener('click', function () {
        content.style.display = '';
        seal.style.display = 'none';
        try { localStorage.setItem(ghostKey, currentMonth); } catch (e) {}
        setTimeout(function () {
          ghost.style.transition = 'opacity 3s ease';
          ghost.style.opacity = '0';
          setTimeout(function () {
            if (ghost.parentNode) ghost.parentNode.removeChild(ghost);
          }, 3500);
        }, 4000);
      });
    }
  }


  // ═══════════════════════════════════════════════════════
  //  DEPREM (hızlı scroll uyarısı)
  // ═══════════════════════════════════════════════════════

  function initQuake() {
    if (!document.querySelector('.post-body')) return;

    var lastScroll = window.scrollY;
    var lastTime = Date.now();
    var warned = false;

    window.addEventListener('scroll', function () {
      var now = Date.now();
      var dt = now - lastTime;
      if (dt < 50) return;
      var dy = Math.abs(window.scrollY - lastScroll);
      var speed = dy / dt;
      lastScroll = window.scrollY;
      lastTime = now;

      if (speed > 8 && !warned) {
        warned = true;
        document.body.classList.add('quaking');
        var warning = document.getElementById('quake-warning');
        setTimeout(function () {
          document.body.classList.remove('quaking');
          if (warning) warning.classList.add('visible');
        }, 400);
        setTimeout(function () {
          if (warning) warning.classList.remove('visible');
        }, 4000);
        setTimeout(function () { warned = false; }, 15000);
      }
    }, { passive: true });
  }


  // ═══════════════════════════════════════════════════════
  //  SABRSIZLIK CEZASI
  // ═══════════════════════════════════════════════════════

  function initImpatience() {
    var slider = document.getElementById('manuscript-slider');
    if (!slider) return;

    var skipCount = 0;
    var lastNav = 0;
    var warned = false;

    var overlay = document.createElement('div');
    overlay.className = 'impatience-warning';
    overlay.innerHTML = '<p class="impatience-text">durmadan geçiyorsun.<br>hiçbirini açmadın.</p>';
    document.body.appendChild(overlay);

    slider.addEventListener('scroll', function () {
      var now = Date.now();
      if (now - lastNav < 400) return;
      lastNav = now;
      skipCount++;

      if (skipCount >= 5 && !warned) {
        warned = true;
        overlay.classList.add('visible');
        setTimeout(function () {
          overlay.classList.remove('visible');
        }, 3000);
        setTimeout(function () { skipCount = 0; warned = false; }, 20000);
      }
    }, { passive: true });

    slider.querySelectorAll('.ms-wax-seal').forEach(function (seal) {
      seal.addEventListener('click', function () { skipCount = 0; });
    });
  }


  // ═══════════════════════════════════════════════════════
  //  SCROLL DİRENCİ
  // ═══════════════════════════════════════════════════════

  function initScrollResist() {
    var postBody = document.querySelector('.post-body');
    if (!postBody) return;

    var hint = document.createElement('div');
    hint.className = 'scroll-resist-hint';
    hint.textContent = 'biraz daha kal\u2026';
    document.body.appendChild(hint);

    var resisting = false;
    var hintShown = false;

    window.addEventListener('wheel', function (e) {
      if (e.deltaY <= 0) return;

      var paragraphs = postBody.querySelectorAll('p');
      if (!paragraphs.length) return;
      var lastP = paragraphs[paragraphs.length - 1];
      var rect = lastP.getBoundingClientRect();

      if (rect.top < window.innerHeight * 0.8 && rect.bottom > 0) {
        if (!resisting) {
          resisting = true;
          if (!hintShown) {
            hintShown = true;
            hint.classList.add('visible');
            setTimeout(function () { hint.classList.remove('visible'); }, 4000);
          }
        }
        window.scrollBy(0, -e.deltaY * 0.4);
      } else {
        resisting = false;
      }
    }, { passive: true });
  }


  // ═══════════════════════════════════════════════════════
  //  MÜREKKEP NEHRİ (hero arka plan)
  // ═══════════════════════════════════════════════════════

  var RIVER_WORDS = [
    'hüzün','sessizlik','mürekkep','gece','rüya','yıldız','mektup',
    'sevda','firkat','vuslat','hicran','ayrılık','umut','sabır',
    'defter','kalem','gözyaşı','ay','rüzgar','kuş','gökyüzü',
    'nefes','sükût','halvet','münzevi','fısıltı','gölge','ışık',
    'kelebek','yaprak','deniz','nehir','ateş','toprak',
    'zaman','hatıra','özlem','kavuşma','yalnızlık','tefekkür',
    'garâbet','sekîne','vird','sûveyda','diril','uyan','oku',
    'yaz','sus','bekle','gel','kal','dön','unutma','hatırla'
  ];

  function initInkRiver() {
    var canvas = document.getElementById('ink-river');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;
    var hero = canvas.parentElement;

    function resize() {
      canvas.width = hero.offsetWidth;
      canvas.height = hero.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    var particles = [];
    for (var i = 0; i < 35; i++) {
      particles.push({
        word: RIVER_WORDS[Math.floor(Math.random() * RIVER_WORDS.length)],
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: 0.15 + Math.random() * 0.35,
        size: 11 + Math.random() * 8,
        opacity: 0.2 + Math.random() * 0.4
      });
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      var isVoid = document.documentElement.getAttribute('data-theme') === 'void';

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        ctx.globalAlpha = p.opacity * (isVoid ? 0.08 : 0.04);
        ctx.fillStyle = isVoid ? '#c9b99a' : '#2c1810';
        ctx.font = p.size + 'px Caveat, cursive';
        ctx.fillText(p.word, p.x, p.y);
        p.x -= p.speed;
        if (p.x < -80) {
          p.x = canvas.width + 30;
          p.y = Math.random() * canvas.height;
          p.word = RIVER_WORDS[Math.floor(Math.random() * RIVER_WORDS.length)];
        }
      }
      requestAnimationFrame(draw);
    }
    draw();
  }


  // ═══════════════════════════════════════════════════════
  //  FISILTI (hayalet ses)
  // ═══════════════════════════════════════════════════════

  function initWhisper() {
    if (Math.random() > 1 / 7) return;
    if (!actx) return;

    setTimeout(function () {
      try {
        if (actx.state === 'suspended') actx.resume();
        var dur = 0.5 + Math.random() * 0.4;
        var buf = actx.createBuffer(1, actx.sampleRate * dur, actx.sampleRate);
        var d = buf.getChannelData(0);
        for (var i = 0; i < d.length; i++) {
          var t = i / d.length;
          var env = Math.sin(t * Math.PI);
          d[i] = (Math.random() * 2 - 1) * 0.012 * env;
        }
        var src = actx.createBufferSource();
        src.buffer = buf;
        var bp = actx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = 1200 + Math.random() * 800;
        bp.Q.value = 2.5;
        var gain = actx.createGain();
        gain.gain.value = 0.02;
        src.connect(bp).connect(gain).connect(actx.destination);
        src.start();
      } catch (e) {}
    }, 6000 + Math.random() * 18000);
  }


  // ═══════════════════════════════════════════════════════
  //  SIRDAŞ MODU (yazar notları)
  // ═══════════════════════════════════════════════════════

  function initSirdas() {
    var halvetTime = 0;
    try { halvetTime = parseInt(localStorage.getItem('munzevi-halvet-time') || '0', 10); } catch (e) {}
    var secretWords = [];
    try { secretWords = JSON.parse(localStorage.getItem('munzevi-secret-words') || '[]'); } catch (e) {}

    if (halvetTime >= 600 || secretWords.length >= 35) {
      localStorage.setItem('munzevi-sirdas', '1');
    }

    if (localStorage.getItem('munzevi-sirdas') === '1') {
      var note = document.getElementById('author-note');
      if (note) note.style.display = '';
    }
  }


  // ═══════════════════════════════════════════════════════
  //  KAĞIDIN ARKASI (3D flip)
  // ═══════════════════════════════════════════════════════

  function initFlipCard() {
    var btn = document.getElementById('flip-btn');
    var inner = document.getElementById('post-flip-inner');
    if (!btn || !inner) return;

    btn.addEventListener('click', function () {
      inner.classList.toggle('flipped');
      btn.textContent = inner.classList.contains('flipped') ? 'geri dön ↺' : 'çevir ↻';
    });
  }


  // ═══════════════════════════════════════════════════════
  //  MEKTUP BİRİKTİRME PATLAMASI
  // ═══════════════════════════════════════════════════════

  function initBurst() {
    if (!document.querySelector('.post-body')) return;

    var sessionKey = 'munzevi-session-reads';
    var count = 0;
    try { count = parseInt(sessionStorage.getItem(sessionKey) || '0', 10); } catch (e) {}
    count++;
    try { sessionStorage.setItem(sessionKey, String(count)); } catch (e) {}

    if (count !== 10) return;

    var excerpts = [];
    try {
      var traces = JSON.parse(localStorage.getItem('munzevi-reading-traces') || '{}');
      for (var url in traces) {
        var slug = url.replace(/^\//, '').replace(/\/$/, '').replace(/-/g, ' ');
        if (slug.length > 5) excerpts.push(slug);
      }
    } catch (e) {}

    if (excerpts.length < 3) {
      excerpts = WHISPERS.slice(0, 10);
    }

    var overlay = document.createElement('div');
    overlay.className = 'burst-overlay';
    document.body.appendChild(overlay);

    for (var i = 0; i < Math.min(excerpts.length, 15); i++) {
      var p = document.createElement('div');
      p.className = 'burst-particle';
      p.textContent = excerpts[i].length > 50 ? excerpts[i].substring(0, 48) + '…' : excerpts[i];
      p.style.left = (5 + Math.random() * 85) + '%';
      p.style.top = (-5 - Math.random() * 15) + '%';
      p.style.animationDelay = (i * 0.4) + 's';
      p.style.animationDuration = (6 + Math.random() * 4) + 's';
      p.style.fontSize = (0.9 + Math.random() * 0.5) + 'rem';
      overlay.appendChild(p);
    }

    setTimeout(function () {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }, 16000);
  }


  // ═══════════════════════════════════════════════════════
  //  MEKTUP TAKAS NOKTASI
  // ═══════════════════════════════════════════════════════

  function initTakas() {
    var takasKey = 'munzevi-takas-pool';
    var pool = [];
    try { pool = JSON.parse(localStorage.getItem(takasKey) || '[]'); } catch (e) {}

    var windQuote = document.getElementById('wind-quote');
    if (windQuote && pool.length > 0) {
      var pick = pool[Math.floor(Math.random() * pool.length)];
      var gift = document.createElement('div');
      gift.className = 'takas-gift';
      gift.innerHTML = '<p class="takas-label">birisi bu cümleyi senin için bıraktı</p>' +
        '<p class="takas-quote">\u201c' + pick + '\u201d</p>';
      windQuote.parentNode.insertBefore(gift, windQuote.nextSibling);
    }

    var postBody = document.querySelector('.post-body');
    if (!postBody) return;

    document.addEventListener('mouseup', function () {
      var sel = window.getSelection();
      if (!sel || !sel.toString()) return;
      var text = sel.toString().trim();
      if (text.length < 10 || text.length > 200) return;

      if (!sel.anchorNode || !postBody.contains(sel.anchorNode)) return;

      if (pool.indexOf(text) === -1) {
        pool.push(text);
        if (pool.length > 20) pool.shift();
        try { localStorage.setItem(takasKey, JSON.stringify(pool)); } catch (e) {}
      }
    });
  }


  // ═══════════════════════════════════════════════════════
  //  MOBİL NAVİGASYON
  // ═══════════════════════════════════════════════════════

  function initMobileNav() {
    var hamburger = document.getElementById('nav-hamburger');
    var navLinks = document.getElementById('nav-links');
    var closeBtn = document.getElementById('nav-close');
    if (!hamburger || !navLinks) return;

    hamburger.addEventListener('click', function () {
      navLinks.classList.add('nav-open');
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        navLinks.classList.remove('nav-open');
      });
    }

    navLinks.querySelectorAll('.nav-item').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('nav-open');
      });
    });
  }


  // ═══════════════════════════════════════════════════════
  //  AKTİF SAYFA GÖSTERGESİ
  // ═══════════════════════════════════════════════════════

  function initActiveNav() {
    var path = window.location.pathname.replace(/\/$/, '');
    document.querySelectorAll('.nav-item[data-path]').forEach(function (link) {
      if (path === link.getAttribute('data-path')) {
        link.classList.add('nav-active');
      }
    });
  }


  // ═══════════════════════════════════════════════════════
  //  SCROLL-TO-TOP
  // ═══════════════════════════════════════════════════════

  function initScrollTop() {
    if (!document.querySelector('.post-body')) return;

    var btn = document.createElement('button');
    btn.className = 'scroll-top-btn';
    btn.textContent = '↑';
    btn.setAttribute('aria-label', 'Başa dön');
    document.body.appendChild(btn);

    window.addEventListener('scroll', function () {
      if (window.scrollY > 800) btn.classList.add('visible');
      else btn.classList.remove('visible');
    }, { passive: true });

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }


  // ═══════════════════════════════════════════════════════
  //  AĞAÇ TOOLTIP
  // ═══════════════════════════════════════════════════════

  function initTreeTooltip() {
    var tooltip = document.getElementById('tree-tooltip');
    if (!tooltip) return;

    var journey = getJourney();
    var secrets = [];
    try { secrets = JSON.parse(localStorage.getItem('munzevi-secret-words') || '[]'); } catch (e) {}

    if (journey.length === 0) {
      tooltip.textContent = 'henüz bir tohum bile ekilmedi';
    } else {
      tooltip.textContent = journey.length + ' yaprak · ' + secrets.length + ' çiçek';
    }
  }


  // ═══════════════════════════════════════════════════════
  //  BAŞLAT
  // ═══════════════════════════════════════════════════════

  document.addEventListener('DOMContentLoaded', function () {
    initFxClasses();
    initSeason();
    initPageTransitions();
    initTheme();
    initCandlelight();
    initNocturnal();
    initStampPost();
    initStampCollection();
    initBottle();
    initInkDecay();
    initKismet();
    initJourney();
    initSealed();
    initWeather();
    initMarginNotes();
    initSlider();
    initStickyStamp();
    initHeroWhisper();
    initScrollEffects();
    initCardStamps();
    initWelcome();
    initTimeAgo();
    initWindPage();
    initClosingVeil();
    initSecretWords();
    initEnroute();
    initMoonPhase();
    initDolunayClick();
    initSignatureCycle();
    initFog();
    initTypewriter();
    initReadingTrace();
    initCoffeeStains();
    initLastBreath();
    initConstellation();
    createEnhancedSounds();
    initHijriDates();
    initInkRiver();
    initWhisper();
    initSirdas();
    initPulse();
    initOnceOnly();
    initHasret();
    initSonSayfa();
    initAynaMektup();
    initBurnLetter();
    initGrowingTree();
    initGhostLetter();
    initQuake();
    initImpatience();
    initScrollResist();
    initFlipCard();
    initBurst();
    initTakas();
    initMobileNav();
    initActiveNav();
    initScrollTop();
    initTreeTooltip();
  });

})();
