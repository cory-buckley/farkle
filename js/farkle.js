var Keyboard = window.SimpleKeyboard.default;

var ouchAudio = new Audio('audio/ouch.mp3');
var updateAudio = new Audio('audio/update.wav');
var wipeAudio = new Audio('audio/wipe.wav');
ouchAudio.playbackRate = 1.75;

function resetAudio() {
  ouchAudio.pause();
  updateAudio.pause();
  wipeAudio.pause();
  ouchAudio.currentTime = 0;
  updateAudio.currentTime = 0;
  wipeAudio.currentTime = 0;
}

var winTarget = 10000;
var workingNumber = '0';
var players = [
  { id: 'player1', name: 'Mike', score: 1000},
  { id: 'player2', name: 'Chris',  score: 1000},
  { id: 'player3', name: 'Cory',  score: 1000},
  { id: 'player4', name: 'Marsha',  score: 1000},
  { id: 'player5', name: 'Ana',  score: 1000},
  { id: 'player6', name: 'Robert',  score: 1000},
  { id: 'player7', name: 'Justin',  score: 1000},
  { id: 'player8', name: 'Kevin',  score: 1000}
];
var activePlayer = 0;

var playHistory = new Stack();

function recordState() {
  playHistory.push({ playerIndex: activePlayer, score: players[activePlayer].score});
}

function undoAction() {
  var lastState = playHistory.pop();
  if (lastState != undefined) {
    players[lastState.playerIndex].score = lastState.score;
    updateScores();
    changeActivePlayer(lastState.playerIndex);
  }
}

var neonColors = [
  'rgba(39, 133, 255, 1)',
  'rgba(19, 244, 239, 1)',
  'rgba(104, 255, 0, 1)',
  'rgba(249, 255, 0, 1)',
  'rgba(255, 191, 0, 1)',
  'rgba(255, 0, 92, 1)',
  'rgba(126, 39, 255, 1)'
];

/* Randomize array in-place using Durstenfeld shuffle algorithm */
function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}

shuffleArray(neonColors);

// randomly generates a number between 77 and 255 to avoid overly dark colors
function getRandomColorNumber() {
  return Math.floor(((Math.random() * 0.7) + 0.25) * 255);
}

function getRandomColor() {
  return 'rgba(' + getRandomColorNumber() + ', ' + getRandomColorNumber() + ', ' + getRandomColorNumber() + ', 1)';
}

// assign player colors and names
// the first 7 player colors will be randomly selected from a predetermined neon color palette
// any remaining player colors will be randomly generated
players.forEach((player, index) => {
  if (index < neonColors.length) {
    player.color = neonColors[index];
  }
  else {
    player.color = 'rgba(' + getRandomColorNumber() + ', ' + getRandomColorNumber() + ', ' + getRandomColorNumber() + ', 1)';
  }

  document.querySelectorAll('#' + player.id + ' .player-container-row-player-details-name')[0].innerHTML = '<span>' + player.name + '</span>';
});

function changeActivePlayer(index) {
  if(index != undefined) {
    activePlayer = index;
  }
  else {
    activePlayer = (activePlayer + 1) % players.length;
  }

  players.forEach(player => {
    document.getElementById(player.id).classList.remove('active-player');
    document.getElementById(player.id).classList.remove('animate__animated', 'animate__pulse', 'animate__faster');
  });

  if (!isElementInScrollView(document.getElementById(players[activePlayer].id))) {
    document.getElementById(players[activePlayer].id).previousElementSibling.scrollIntoView();
  }

  document.getElementById(players[activePlayer].id).classList.add('active-player');
  document.getElementById(players[activePlayer].id).classList.add('animate__animated', 'animate__pulse', 'animate__faster');
  workingNumber = 0;
  document.getElementsByClassName('score-calculator-working-number')[0].innerHTML = workingNumber;
  textFit(document.getElementsByClassName('score-calculator-working-number'));
}

function updateScores(){
  players.forEach(player => {
    document.querySelectorAll('#' + player.id + ' .player-container-row-player-details-score')[0].innerHTML = '<span class="remaining-score">' + (winTarget - player.score) + '&nbsp;/&nbsp;</span>' + player.score;
    var percentage = (player.score / winTarget) * 100;
    document.getElementById(player.id).style.background = 'linear-gradient(90deg, ' + player.color + ' ' + percentage + '%, rgba(255,255,255,1) ' + percentage + '%)';
  });
}

function onKeyPress(button) {
  switch(button) {
    case 'Clear':
      workingNumber = '0';
      document.getElementsByClassName('score-calculator-working-number')[0].innerHTML = workingNumber;
      break;
    case 'Backspace':
      if (workingNumber.length > 1) {
        workingNumber = workingNumber.slice(0, -1);
        document.getElementsByClassName('score-calculator-working-number')[0].innerHTML = workingNumber;
      }
      else {
        workingNumber = '0';
        document.getElementsByClassName('score-calculator-working-number')[0].innerHTML = workingNumber;
      }
      break;
    case 'Subtract':
      recordState();
      players[activePlayer].score = Math.max(players[activePlayer].score - parseInt(workingNumber), 0);
      updateScores();
      changeActivePlayer();
      resetAudio();
      updateAudio.play();
      break;
    case 'Add':
      recordState();
      players[activePlayer].score = Math.min(players[activePlayer].score + parseInt(workingNumber), winTarget);
      updateScores();
      changeActivePlayer();
      resetAudio();
      updateAudio.play();
      break;
    case 'Farkle':
      recordState();
      changeActivePlayer();
      resetAudio();
      ouchAudio.play();
      break;
    default:
      if(workingNumber == '0') {
        workingNumber = button;
        document.getElementsByClassName('score-calculator-working-number')[0].innerHTML = workingNumber;
      }
      else if (workingNumber.length <= 8) {
        workingNumber = workingNumber + button;
        document.getElementsByClassName('score-calculator-working-number')[0].innerHTML = workingNumber;
      }
      break;
  }
  textFit(document.getElementsByClassName('score-calculator-working-number'));
}

var keyboard = new Keyboard({
  onKeyPress: button => onKeyPress(button),
  layout: {
    default: ['1 2 3', '4 5 6', '7 8 9', 'Clear 0 Backspace', 'Farkle Subtract Add'],
  },
  buttonTheme : [
    {
      class: 'dark-button',
      buttons: 'Farkle Subtract Add'
    },
    {
      class: 'gray-button',
      buttons: 'Clear Backspace'
    }
  ],
  theme: "hg-theme-default hg-layout-numeric numeric-theme",
  disableButtonHold: true
});

var playerContainerElement = document.getElementsByClassName('player-container')[0];
function applyScrollMasks() {
  playerContainerElement.classList.remove('player-container-both-ends-transparent', 'player-container-bottom-transparent', 'player-container-top-transparent');

  if (playerContainerElement.scrollTop == 0) {
    playerContainerElement.classList.add('player-container-bottom-transparent');
  }
  else if (playerContainerElement.scrollTop + playerContainerElement.clientHeight >= playerContainerElement.scrollHeight) {
    playerContainerElement.classList.add('player-container-top-transparent');
  }
  else {
    playerContainerElement.classList.add('player-container-both-ends-transparent');
  }
}

function isElementInScrollView(el) {
  var rect = el.getBoundingClientRect();
  var elemTop = rect.top;
  var elemBottom = rect.bottom;

  // only completely visible elements return true
  var isVisible = (elemTop >= playerContainerElement.scrollTop) && (elemBottom <= playerContainerElement.scrollTop + playerContainerElement.clientHeight);
  return isVisible;
}

playerContainerElement.addEventListener('scroll', () => {
  applyScrollMasks();
});

changeActivePlayer(0);
updateScores();
textFit(document.getElementsByClassName('score-calculator-working-number'));
applyScrollMasks();