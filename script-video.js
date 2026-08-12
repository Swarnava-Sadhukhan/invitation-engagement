(function () {
  'use strict';

  // ---------------------------------------------------------
  // Video intro: paused until click, slow crossfade into page
  // ---------------------------------------------------------
  function initVideoIntro() {
    var stage = document.getElementById('videoStage');
    var videoBg = document.getElementById('introVideoBg');
    var videoFg = document.getElementById('introVideo');
    var videoScene = document.getElementById('video-scene');
    var invitationScene = document.getElementById('invitation-scene');

    if (!stage || !videoFg) return;

    // nudge browsers into painting the first frame while paused
    function paintFirstFrame(video) {
      video.addEventListener('loadedmetadata', function () {
        try { video.currentTime = 0.01; } catch (e) { /* ignore */ }
      });
    }
    paintFirstFrame(videoBg);
    paintFirstFrame(videoFg);

    var started = false;

    function startVideo() {
      if (started) return;
      started = true;

      videoBg.play();
      videoFg.play();
    }

    function goToInvitation() {
      invitationScene.classList.add('is-active');
      videoScene.classList.add('is-fading');
      window.scrollTo(0, 0);
      initRevealObserver();
      initScratchHearts();
      initJourneyDots();

      window.setTimeout(function () {
        videoScene.classList.remove('is-active');
        videoScene.classList.remove('is-fading');
      }, 1450);
    }

    stage.addEventListener('click', startVideo);
    stage.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        startVideo();
      }
    });

    videoFg.addEventListener('ended', goToInvitation);
  }

  // ---------------------------------------------------------
  // Scroll-triggered reveal animations
  // ---------------------------------------------------------
  var revealObserverStarted = false;

  function initRevealObserver() {
    if (revealObserverStarted) return;
    revealObserverStarted = true;

    var items = document.querySelectorAll('.reveal, .invite-card');

    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    items.forEach(function (el) { observer.observe(el); });
  }

  // ---------------------------------------------------------
  // Scratch-to-reveal hearts
  // ---------------------------------------------------------
  var scratchHeartsStarted = false;

  function initScratchHearts() {
    if (scratchHeartsStarted) return;
    var items = document.querySelectorAll('.scratch-item');
    if (!items.length) return;
    scratchHeartsStarted = true;

    var scratchedCount = 0;

    function spawnConfetti(container) {
      if (!container) return;
      var colors = ['#c96f83', '#e6c98a', '#f9dbe1', '#fffaf6', '#a94f66'];
      var pieces = 70;

      for (var i = 0; i < pieces; i++) {
        var piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.left = (Math.random() * 100) + '%';
        piece.style.background = colors[Math.floor(Math.random() * colors.length)];
        piece.style.animationDuration = (2.2 + Math.random() * 1.6) + 's';
        piece.style.animationDelay = (Math.random() * 0.5) + 's';
        piece.style.transform = 'rotate(' + (Math.random() * 360) + 'deg)';
        container.appendChild(piece);
      }

      window.setTimeout(function () { container.innerHTML = ''; }, 4200);
    }

    function onAllScratched() {
      var result = document.getElementById('scratchResult');
      var hint = document.getElementById('scratchScrollHint');
      var confettiLayer = document.getElementById('confettiLayer');

      if (result) result.classList.add('is-visible');
      if (hint) hint.classList.add('is-visible');
      spawnConfetti(confettiLayer);
    }

    function completeHeart(item, canvas) {
      canvas.style.transition = 'opacity 0.6s ease';
      canvas.style.opacity = '0';
      window.setTimeout(function () { canvas.style.pointerEvents = 'none'; }, 650);

      item.classList.add('is-revealed');
      scratchedCount++;
      if (scratchedCount === items.length) onAllScratched();
    }

    function setupHeart(item) {
      var canvas = item.querySelector('.scratch-canvas');
      var heart = item.querySelector('.scratch-heart');
      if (!canvas || !heart) return;

      var ctx = canvas.getContext('2d');
      var rect = heart.getBoundingClientRect();
      var dpr = window.devicePixelRatio || 1;
      var width = rect.width;
      var height = rect.height;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.scale(dpr, dpr);

      function paintScratchLayer() {
        ctx.globalCompositeOperation = 'source-over';

        var gradient = ctx.createRadialGradient(
          width * 0.35, height * 0.3, width * 0.05,
          width * 0.5, height * 0.5, width * 0.75
        );
        gradient.addColorStop(0, '#f0e2c8');
        gradient.addColorStop(0.55, '#cfa876');
        gradient.addColorStop(1, '#93703f');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // scattered light glitter specks
        for (var g = 0; g < 22; g++) {
          var gx = Math.random() * width;
          var gy = Math.random() * height;
          var gr = width * (0.006 + Math.random() * 0.012);
          var gOpacity = 0.25 + Math.random() * 0.55;
          ctx.beginPath();
          ctx.fillStyle = 'rgba(255,250,235,' + gOpacity + ')';
          ctx.arc(gx, gy, gr, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = 'rgba(90,58,35,0.85)';
        ctx.font = '600 ' + Math.max(10, width * 0.085) + 'px Poppins, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.letterSpacing = '1px';
        ctx.fillText('SCRATCH ME', width / 2, height / 2);
      }
      paintScratchLayer();

      var scratching = false;
      var done = false;

      function pointFromEvent(e) {
        var r = canvas.getBoundingClientRect();
        return { x: e.clientX - r.left, y: e.clientY - r.top };
      }

      function scratchAt(x, y) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(x, y, Math.max(14, width * 0.16), 0, Math.PI * 2);
        ctx.fill();
      }

      function checkProgress() {
        if (done) return;
        var data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        var transparent = 0;
        var total = 0;
        var step = 4 * 6; // sample every 6th pixel for performance

        for (var i = 3; i < data.length; i += step) {
          total++;
          if (data[i] < 40) transparent++;
        }

        if (total > 0 && transparent / total > 0.5) {
          done = true;
          completeHeart(item, canvas);
        }
      }

      canvas.addEventListener('pointerdown', function (e) {
        scratching = true;
        try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
        var p = pointFromEvent(e);
        scratchAt(p.x, p.y);
      });

      canvas.addEventListener('pointermove', function (e) {
        if (!scratching) return;
        var p = pointFromEvent(e);
        scratchAt(p.x, p.y);
      });

      function endScratch() {
        if (!scratching) return;
        scratching = false;
        checkProgress();
      }

      canvas.addEventListener('pointerup', endScratch);
      canvas.addEventListener('pointercancel', endScratch);
      canvas.addEventListener('pointerleave', function () {
        if (scratching) checkProgress();
      });
    }

    items.forEach(setupHeart);
  }

  // ---------------------------------------------------------
  // Journey gallery: native touch swipe + mouse drag-to-scroll
  // ---------------------------------------------------------
  function initJourneyDrag() {
    var track = document.getElementById('journeyTrack');
    if (!track) return;

    var isDragging = false;
    var startX = 0;
    var startScrollLeft = 0;

    track.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      isDragging = true;
      startX = e.clientX;
      startScrollLeft = track.scrollLeft;
      track.classList.add('is-dragging');
    });

    track.addEventListener('pointermove', function (e) {
      if (!isDragging) return;
      track.scrollLeft = startScrollLeft - (e.clientX - startX);
    });

    function endDrag() {
      isDragging = false;
      track.classList.remove('is-dragging');
    }

    track.addEventListener('pointerup', endDrag);
    track.addEventListener('pointerleave', endDrag);
  }

  // ---------------------------------------------------------
  // Journey gallery: pagination dots synced to active slide
  // ---------------------------------------------------------
  var journeyDotsStarted = false;

  function initJourneyDots() {
    if (journeyDotsStarted) return;
    var track = document.getElementById('journeyTrack');
    var dots = document.querySelectorAll('#journeyDots .journey-dot');
    var slides = track ? track.querySelectorAll('.polaroid-slide') : [];
    if (!track || !slides.length || !dots.length) return;
    journeyDotsStarted = true;

    function setActive(index) {
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }
    setActive(0);

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
            var index = Array.prototype.indexOf.call(slides, entry.target);
            if (index !== -1) setActive(index);
          }
        });
      }, { root: track, threshold: [0.6] });

      slides.forEach(function (slide) { observer.observe(slide); });
    } else {
      track.addEventListener('scroll', function () {
        var index = Math.round(track.scrollLeft / track.clientWidth);
        setActive(index);
      });
    }
  }

  // ---------------------------------------------------------
  // Save the Date: downloads an .ics file that opens the
  // device's own calendar app to add the event
  // ---------------------------------------------------------
  function initSaveDate() {
    var btn = document.getElementById('saveDateBtn');
    if (!btn) return;

    btn.addEventListener('click', function () {
      var now = new Date();
      var dtstamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

      var icsLines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Swarnava and Atreyee//Engagement Invitation//EN',
        'CALSCALE:GREGORIAN',
        'BEGIN:VEVENT',
        'UID:swarnava-atreyee-engagement-2026@invitation',
        'DTSTAMP:' + dtstamp,
        'DTSTART:20261124T073000Z',
        'DTEND:20261124T113000Z',
        'SUMMARY:Swarnava and Atreyee - Engagement Ceremony',
        'DESCRIPTION:Join us as we celebrate our engagement!',
        'LOCATION:Glook - The Sky Lounge, Newtown, Kolkata',
        'END:VEVENT',
        'END:VCALENDAR'
      ];

      var blob = new Blob([icsLines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var link = document.createElement('a');
      link.href = url;
      link.download = 'Swarnava-Atreyee-Engagement.ics';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initVideoIntro();
    initJourneyDrag();
    initSaveDate();
  });
})();
