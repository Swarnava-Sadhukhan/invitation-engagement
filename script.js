(function () {
  'use strict';

  // ---------------------------------------------------------
  // Falling petals
  // ---------------------------------------------------------
  function spawnPetals() {
    var field = document.getElementById('petals');
    if (!field) return;
    var count = window.innerWidth < 560 ? 14 : 22;

    for (var i = 0; i < count; i++) {
      var petal = document.createElement('div');
      petal.className = 'petal';

      var size = 6 + Math.random() * 10;
      petal.style.width = size + 'px';
      petal.style.height = size * 0.8 + 'px';
      petal.style.left = Math.random() * 100 + 'vw';

      var fallDuration = 9 + Math.random() * 10;
      var swayDuration = 2.5 + Math.random() * 2.5;
      var delay = Math.random() * fallDuration;

      petal.style.animationDuration = fallDuration + 's, ' + swayDuration + 's';
      petal.style.animationDelay = '-' + delay + 's, 0s';
      petal.style.opacity = (0.35 + Math.random() * 0.35).toFixed(2);

      field.appendChild(petal);
    }
  }

  // ---------------------------------------------------------
  // Envelope open -> "We're Engaged" hold -> CTA -> invitation reveal
  // ---------------------------------------------------------
  function initEnvelope() {
    var seal = document.getElementById('waxSeal');
    var envelope = document.getElementById('envelope');
    var cardPeek = document.getElementById('cardPeek');
    var tapHint = document.getElementById('tapHint');
    var joinCta = document.getElementById('joinCta');
    var envelopeScene = document.getElementById('envelope-scene');
    var invitationScene = document.getElementById('invitation-scene');

    if (!seal || !envelope) return;

    var opened = false;

    function openInvitation() {
      if (opened) return;
      opened = true;

      seal.setAttribute('aria-disabled', 'true');
      envelope.classList.add('is-opening');
      if (tapHint) tapHint.classList.add('is-hidden');

      // let the flap swing open first, then lift the card out
      window.setTimeout(function () {
        cardPeek.classList.add('is-out');
        if (joinCta) joinCta.classList.add('is-visible');
      }, 550);
    }

    function goToInvitation() {
      envelopeScene.classList.remove('is-active');
      invitationScene.classList.add('is-active');
      window.scrollTo(0, 0);
    }

    seal.addEventListener('click', openInvitation);
    seal.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openInvitation();
      }
    });

    if (joinCta) {
      joinCta.addEventListener('click', goToInvitation);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    spawnPetals();
    initEnvelope();
  });
})();
