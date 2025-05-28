const roles = ['بادشاہ', 'وزیر', 'سپاہی', 'چور'];
const icons = {
  'بادشاہ': '👑',
  'وزیر': '🧔',
  'سپاہی': '🛡️',
  'چور': '🕵️'
};

let roundHistory = [];
let players = [
  { name: 'کھلاڑی 1', role: '', score: 0 },
  { name: 'کھلاڑی 2', role: '', score: 0 },
  { name: 'کھلاڑی 3', role: '', score: 0 },
  { name: 'کھلاڑی 4', role: '', score: 0 },
];

const wrongSound = new Audio('sounds/wrong.mp3');
const correctSound = new Audio('sounds/correct.mp3');

const get = (k, d) => JSON.parse(localStorage.getItem(`hangman-${k}`)) ?? d;
const set = (k, v) => localStorage.setItem(`hangman-${k}`, JSON.stringify(v));
const remove = (k) => localStorage.removeItem(`hangman-${k}`);

const playSound = sound => {
    sound.currentTime = 0;
    sound.play();
};

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function startGame() {
  const roleList = [...roles];
  shuffle(roleList);
  players.forEach((p, i) => p.role = roleList[i]);
  renderPlayers();
  showGuessOption();
}

function renderPlayers(reveal = false) {
  const container = document.querySelector('#players');
  container.innerHTML = '';
  players.forEach(p => {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
      <strong>${p.name}</strong>
      <div style="font-size: 40px;">${reveal || (p.role == 'بادشاہ' || p.role == 'وزیر') ? icons[p.role] : '❓'}</div>
      <div>${reveal ? p.role : '<span class="hidden-role"></span>'}</div>
    `;
    container.appendChild(div);
  });
}

function showGuessOption() {
  const minister = players.find(p => p.role === 'وزیر');
  const guessArea = document.querySelector('#guessArea');
  guessArea.innerHTML = `<h3>${minister.name} چور کا اندازہ لگائیں:</h3>`;
  players.forEach(p => {
    if (p.role != 'بادشاہ' && p.name !== minister.name) {
      const spanBtn = document.createElement('span');
      spanBtn.textContent = p.name;
      spanBtn.className = 'btn';
      spanBtn.onclick = () => makeGuess(p.name);
      guessArea.appendChild(spanBtn);
    }
  });
}

function makeGuess(guessedName) {
  const thief = players.find(p => p.role === 'چور');
  const minister = players.find(p => p.role === 'وزیر');
  const king = players.find(p => p.role === 'بادشاہ');
  const soldier = players.find(p => p.role === 'سپاہی');

  let correct = guessedName === thief.name;

  king.score += 100;
  soldier.score += 80;
  if (correct) {
    minister.score += 90;
    thief.score += 0;
    playSound(correctSound);
  } else {
    minister.score += 0;
    thief.score += 90;
    playSound(wrongSound);
  }

  roundHistory.unshift({
    round: roundHistory.length + 1,
    roles: players.map(p => ({ name: p.name, role: p.role })),
    guess: guessedName,
    correct
  });

  renderPlayers(true);
  document.querySelector('#guessArea').innerHTML = `<h3>چور تھا: ${thief.name} — ${correct ? 'صحیح اندازہ!' : 'غلط اندازہ!'}</h3>`;
  setTimeout(e => startGame(), 2000);
  showScores();
  showHistory();
}

document.querySelectorAll('span.btn').forEach(btn => {
  btn.setAttribute('tabindex', '0');
  btn.setAttribute('role', 'button');
  btn.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      btn.click();
    }
  });
});

function showScores() {
  const scoreDiv = document.querySelector('#scores');
  scoreDiv.innerHTML = '<h3>اسکور:</h3>';
  players.forEach(p => {
    const pDiv = document.createElement('div');
    pDiv.textContent = `${p.name} (${p.role}): ${p.score}`;
    scoreDiv.appendChild(pDiv);
  });
}

function showHistory() {
  const container = document.querySelector('#history');
  container.innerHTML = '<h3>راؤنڈ ہسٹری:</h3>';
  roundHistory.forEach(entry => {
    const div = document.createElement('div');
    div.className = 'history-entry';
    const roleList = entry.roles.map(r => `${r.name}: ${r.role}`).join('، ');
    div.innerHTML = `
      <strong>راؤنڈ ${entry.round}</strong><br>
      ${roleList}<br>
      وزیر کا اندازہ: ${entry.guess} — ${entry.correct ? 'درست' : 'غلط'}
    `;
    container.appendChild(div);
  });
}

(e => {
    startGame();
})();