'use strict';


const gameState = {
  soundOn: true
};

const $ = (selector, root = document) =>
  root.querySelector(selector);

const $$ = (selector, root = document) =>
  Array.from(root.querySelectorAll(selector));

const stage = $('#stage');
const srAnnounce = $('#sr-announce');
const transitionVeil = $('#transition-veil');


function announce(message) {
  if (srAnnounce) {
    srAnnounce.textContent = message;
  }
}

function showScreen(id, transition = true) {
  const target = document.getElementById(id);
  if (!target) return;

  const changeScreen = () => {
    $$('.screen').forEach(screen => {
      screen.classList.remove('active');
    });

    target.classList.add('active');

    window.scrollTo({
      top: 0,
      behavior: 'auto'
    });

    $$('.nav-link, .mobile-link').forEach(link => {
      link.classList.toggle(
        'active',
        link.dataset.target === id
      );
    });

    announce(`${id.replace(/-/g, ' ')} screen`);
  };

  if (transition && transitionVeil) {
    transitionVeil.classList.add('active');

    setTimeout(() => {
      changeScreen();

      setTimeout(() => {
        transitionVeil.classList.remove('active');
      }, 250);

    }, 320);

  } else {
    changeScreen();
  }
}

document.addEventListener('click', event => {

  const element = event.target.closest('[data-target]');

  if (!element) return;

  event.preventDefault();

  const target = element.dataset.target;

  closeMobileMenu();

  showScreen(target);
});


const homeButton = $('[data-nav-home]');

if (homeButton) {
  homeButton.addEventListener('click', event => {

    event.preventDefault();

    closeMobileMenu();

    showScreen('landing');
  });
}


const hamburgerBtn = $('#hamburger-btn');
const mobileMenu = $('#mobile-menu');
const mobileOverlay = $('#mobile-menu-overlay');

function openMobileMenu() {

  if (!mobileMenu) return;

  mobileMenu.classList.add('open');

  if (mobileOverlay) {
    mobileOverlay.classList.add('open');
  }

  if (hamburgerBtn) {
    hamburgerBtn.setAttribute('aria-expanded', 'true');
  }

  mobileMenu.setAttribute('aria-hidden', 'false');
}


function closeMobileMenu() {

  if (!mobileMenu) return;

  mobileMenu.classList.remove('open');

  if (mobileOverlay) {
    mobileOverlay.classList.remove('open');
  }

  if (hamburgerBtn) {
    hamburgerBtn.setAttribute('aria-expanded', 'false');
  }

  mobileMenu.setAttribute('aria-hidden', 'true');
}


if (hamburgerBtn) {

  hamburgerBtn.addEventListener('click', () => {

    const isOpen =
      mobileMenu.classList.contains('open');

    if (isOpen) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }

  });

}

if (mobileOverlay) {
  mobileOverlay.addEventListener(
    'click',
    closeMobileMenu
  );
}

document.addEventListener('keydown', event => {

  if (event.key === 'Escape') {
    closeMobileMenu();
  }

});

const backgroundMusic = new Audio('bgm.mp3');

backgroundMusic.loop = true;
backgroundMusic.volume = 0.5;

document.getElementById('start-game-btn').addEventListener('click', () => {
    backgroundMusic.play();
});

const SOUND_FILES = {
  click: 'magic-click.mp3',
  reveal: 'magic-reveall.mp3'
};


const audioCache = {};
let audioUnlocked = false;


function unlockAudio() {
  audioUnlocked = true;
}

document.addEventListener(
  'pointerdown',
  unlockAudio,
  { once: true }
);

document.addEventListener(
  'keydown',
  unlockAudio,
  { once: true }
);


function playSound(name) {

  if (!gameState.soundOn || !audioUnlocked) {
    return;
  }

  const source = SOUND_FILES[name];

  if (!source) return;

  try {

    if (!audioCache[name]) {
      audioCache[name] = new Audio(source);
    }

    const sound =
      audioCache[name].cloneNode();

    sound.volume = 0.3;

    const playPromise = sound.play();

    if (playPromise) {
      playPromise.catch(() => {});
    }

  } catch (error) {
  }
}



const soundToggleBtn =
  $('#sound-toggle');

if (soundToggleBtn) {

  soundToggleBtn.addEventListener(
    'click',
    () => {

      gameState.soundOn =
        !gameState.soundOn;

      soundToggleBtn.setAttribute(
        'aria-pressed',
        String(gameState.soundOn)
      );

      const soundOn =
        $('.sound-on', soundToggleBtn);

      const soundOff =
        $('.sound-off', soundToggleBtn);

      if (soundOn) {
        soundOn.hidden =
          !gameState.soundOn;
      }

      if (soundOff) {
        soundOff.hidden =
          gameState.soundOn;
      }

    }
  );

}

document.addEventListener('click', event => {

  const button =
    event.target.closest(
      '.btn-magic, .icon-btn'
    );

  if (!button) return;

  playSound('click');

  if (button.classList.contains('btn-magic')) {

    const rect =
      button.getBoundingClientRect();

    button.style.setProperty(
      '--rx',
      `${event.clientX - rect.left}px`
    );

    button.style.setProperty(
      '--ry',
      `${event.clientY - rect.top}px`
    );

    button.classList.remove('ripple');

    void button.offsetWidth;

    button.classList.add('ripple');
  }

});
let playerName = '';
function startGame() {

  const playerNameInput =
    document.getElementById('player-name');


playerName = playerNameInput.value.trim();

  if (!playerName) {
    playerNameInput.focus();
    playerNameInput.placeholder =
      '⚠️ Please enter name';
    return;
  }

  showScreen('game-screen', true);

  setTimeout(() => {

    buildMagicNumberGame();

    const playerWelcome =
  document.querySelector('.player-welcome');

if (playerWelcome) {
  playerWelcome.textContent =
    `✨ Welcome, ${playerName}!`;
}

  }, 400);
}

const startButton =
  $('#start-game-btn');

if (startButton) {

  startButton.addEventListener(
    'click',
    startGame
  );

}

let randomNumber = 0;

function buildMagicNumberGame() {
  
 randomNumber =
  Math.floor(Math.random() * 30) * 2 + 2;

const steps = [
  {
    text: '🔮 Close your eyes for a moment... think of any number between 1 and 100. Let it glow in your mind. Do not speak it — not even a whisper.',
    button: "✨ I'VE CHOSEN — NEXT"
  },
  {
    text: '🌗 The number grows in power... double it. Multiply your number by 2, and let this new number take its place in your mind.',
    button: '⚡ DOUBLED — NEXT'
  },
  {
    text: `🌌 From beyond the veil, a number reveals itself to me: <strong>${randomNumber}</strong>. Add it to what you're holding, and let the total settle in your thoughts.`,
    button: '🌠 ADDED — NEXT'
  },
  {
    text: '🌓 The energies must be balanced... divide your total by 2. Hold this final number close — this is the one that matters now.',
    button: '🕯️ BALANCED — NEXT'
  },
  {
    text : ' 🤝 Now, whisper your very first number — the one you thought of at the start — for your friend subtract that number from the result you\'re holding, and keep the new answer safe in their mind.',
    
    button: '👥 SHARED TO HIM — NEXT'
  },
  {
    text: '🔮✨ The threads of fate are weaving together... I can feel your number forming in the mist. Are you ready to witness the reveal?',
    button: '🌟 REVEAL MY NUMBER 🌟'
  }
];

  let currentStep = 0;


  function renderStep() {

    stage.innerHTML = `

      <div class="stage-panel">
      <p class="challenge-eyebrow">
  Mind Hack Magic<br>
  ${currentStep === 0 ? `Welcome ${playerName}<br> to` : ''}
 The Real World Game
</p>

        <h2 class="challenge-title">
          🔮 MIND MYSTIC
        </h2>

        <div class="glass-card">

          <p class="step-counter">
            Step ${currentStep + 1} of ${steps.length}
          </p>

          <p class="challenge-instruction">
            ${steps[currentStep].text}
          </p>

          <button
            class="btn-magic btn-start"
            id="step-btn"
          >
            ${steps[currentStep].button}
          </button>

        </div>

      </div>

    `;


    const stepButton =
      $('#step-btn');

    stepButton.addEventListener(
      'click',
      () => {

        currentStep++;

        if (currentStep < steps.length) {

          renderStep();

        } else {

          revealMagicNumber();

        }

      }
    );

  }


  renderStep();

}

function revealMagicNumber() {

  stage.innerHTML = `

    <div class="stage-panel">

      <p class="challenge-eyebrow">
    ☠️ THE MAGIC IS REVEALED ☠️
      </p>

      <h2 class="challenge-title">
      ${playerName}<br>
        YOUR MAGIC  <br>NUMBER🫣<br> LEFT IN YOUR MIND
      </h2>

      <div class="reveal-wrap">

        <div
          class="magic-circle"
          id="magic-circle"
        ></div>

        <div
          class="reveal-number"
          id="reveal-number"
        >
           ${randomNumber / 2}
        </div>

      </div>

      <p class="feedback-msg gold">
        MAGIC NEVER LIES… 🪄
      </p>

      <button
        class="btn-magic btn-start"
        id="play-again-btn"
      >
        PLAY AGAIN ♾️
      </button>

    </div>

  `;

  requestAnimationFrame(() => {

    const circle =
      $('#magic-circle');

    const number =
      $('#reveal-number');

    if (circle) {
      circle.classList.add('show');
    }

    if (number) {
      number.classList.add('show');
    }

  });


  playSound('reveal');

  screenFlash();

  const circle =
    $('#magic-circle');

  if (circle) {

    const rect =
      circle.getBoundingClientRect();

    burstParticles(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2
    );

  }


  const playAgain =
    $('#play-again-btn');

  if (playAgain) {

    playAgain.addEventListener(
      'click',
      startGame
    );

  }

}

function screenFlash() {

  const flash =
    document.createElement('div');

  flash.className =
    'screen-flash flash';

  document.body.appendChild(flash);

  setTimeout(() => {
    flash.remove();
  }, 550);

}


function burstParticles(
  x,
  y,
  color = '155,107,255',
  count = 22
) {

  for (let i = 0; i < count; i++) {

    const particle =
      document.createElement('span');

    particle.className =
      'magic-particle';

    particle.style.left =
      `${x}px`;

    particle.style.top =
      `${y}px`;

    particle.style.setProperty(
      '--particle-color',
      color
    );

    particle.style.setProperty(
      '--angle',
      `${Math.random() * 360}deg`
    );

    particle.style.setProperty(
      '--distance',
      `${60 + Math.random() * 140}px`
    );

    document.body.appendChild(
      particle
    );

    setTimeout(() => {
      particle.remove();
    }, 1000);

  }

}

showScreen(
  'landing',
  false
);
