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

/* Create Player DOM Elements */
var playerElementHTMLPart1 = '<div id="player'
var playerElementHTMLPart2 = '" class="player-container-row" onclick="changeActivePlayer(';
var playerElementHTMLPart3 = ')"><div class="player-container-row-player-details"><div class="player-container-row-player-details-name"></div><div class="player-container-row-player-details-score"></div></div></div>';
var lastSpacer = document.getElementById('lastSpacer');

/* Player Colors */
var neonColors = [
  'rgba(39, 133, 255, 1)',
  'rgba(19, 244, 239, 1)',
  'rgba(104, 255, 0, 1)',
  'rgba(249, 255, 0, 1)',
  'rgba(255, 191, 0, 1)',
  'rgba(255, 0, 92, 1)',
  'rgba(126, 39, 255, 1)'
];

/* Game State Data */
var winTarget = 10000;
var workingNumber = '0';
var players = JSON.parse(localStorage.getItem('players')) || [];
if (players.length) {
  startGame();
}
// players element schema: { id: 'player1', name: 'Name1',  score: 0},
var activePlayer = 0;

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
function assignColorsAndNames() {
  players.forEach((player, index) => {
    if (index < neonColors.length) {
      player.color = neonColors[index];
    }
    else {
      player.color = 'rgba(' + getRandomColorNumber() + ', ' + getRandomColorNumber() + ', ' + getRandomColorNumber() + ', 1)';
    }

    document.querySelectorAll('#' + player.id + ' .player-container-row-player-details-name')[0].innerHTML = '<span>' + player.name + '</span>';
  });
}

document.getElementById('newGamePlayerNumber').textContent = players.length + 1;

function addNewPlayer() {
  var playerName = document.getElementById('newGamePlayerName').value;
  if (playerName != '' && playerName != null && playerName != undefined) {
    document.getElementById('newGameAddPlayerButton').disabled = true;
    document.getElementById('newGameStartGameButton').disabled = true;
    players.push({ id: 'player' + (players.length + 1), name: playerName, score: 0});
    document.getElementById('newGamePlayer').classList.add('animate__animated', 'animate__fadeOutLeft', 'animate__faster');
    setTimeout(function() {
      document.getElementById('newGamePlayerNumber').textContent = players.length + 1;
      document.getElementById('newGamePlayerName').value = '';
      document.getElementById('newGamePlayer').classList.remove('animate__animated', 'animate__fadeOutLeft', 'animate__faster');
      document.getElementById('newGamePlayer').classList.add('animate__animated', 'animate__fadeInRight', 'animate__faster');
      setTimeout(function() {
        document.getElementById('newGamePlayer').classList.remove('animate__animated', 'animate__fadeInRight', 'animate__faster');
        document.getElementById('newGameAddPlayerButton').disabled = false;
        document.getElementById('newGameStartGameButton').disabled = false;
      }, 500);
    }, 500);
  }
}

function purgePlayers() {
  players = [];
  playHistory = new Stack();
  lastSpacer.parentNode.innerHTML = '<div id="lastSpacer" class="player-container-spacer"></div>';
  lastSpacer = document.getElementById('lastSpacer');
  document.getElementById('newGamePlayerNumber').textContent = 1;
  document.getElementById('newGamePlayerName').value = '';
  localStorage.setItem('players', JSON.stringify(players));
}

function createElementFromHTML(htmlString) {
  var div = document.createElement('div');
  div.innerHTML = htmlString.trim();

  return div.firstChild;
}

function addPlayerElement(playerNumber) {
  // add spacer
  var spacer = document.createElement('div');
  spacer.classList.add('player-container-spacer');
  lastSpacer.parentNode.insertBefore(spacer, lastSpacer);

  // add player element
  var newPlayerHTMLString = playerElementHTMLPart1 + playerNumber + playerElementHTMLPart2 + (playerNumber - 1) + playerElementHTMLPart3;
  var newPlayer = createElementFromHTML(newPlayerHTMLString);
  lastSpacer.parentNode.insertBefore(newPlayer, lastSpacer);
}

function startGame(){
  if (players.length) {
    localStorage.setItem('players', JSON.stringify(players));
    players.forEach((player, index) => {
      addPlayerElement(index + 1);
    });
    assignColorsAndNames();
    changeActivePlayer(0);
    transitionMenu('new-game-screen', 'menu-screen');
    hideModal('launchModal');
  }
}

/* Play History */
var playHistory = new Stack();

function recordState() {
  playHistory.push({ playerIndex: activePlayer, score: players[activePlayer].score});
  document.querySelectorAll('.restart-button')[0].classList.remove('disabled');
}

function undoAction() {
  var lastState = playHistory.pop();
  if (lastState != undefined) {
    players[lastState.playerIndex].score = lastState.score;
    localStorage.setItem('players', JSON.stringify(players));
    updateScores();
    changeActivePlayer(lastState.playerIndex);
  }

  if(playHistory.size() == 0) {
    document.querySelectorAll('.restart-button')[0].classList.add('disabled');
  }
}

/* Animation Logic */
var modalVisible = true;

document.getElementById('launchModal').addEventListener('animationend', function() {
  if(document.getElementById('launchModal').classList.contains('animate__fadeOutDown')) {
    modalVisible = false;
    document.getElementById('launchModal').style.visibility = 'hidden';
  }
  else {
    modalVisible = true;
  }
  document.getElementById('launchModal').classList.remove('animate__animated', 'animate__fadeOutDown', 'animate__fadeInUp', 'animate__faster');
});

function toggleMenuButton() {
  if (players.length > 0) {
    for(menuButton of document.getElementsByClassName("close-menu-button")){
      menuButton.style.display = 'block';
    }
  }
}

function showModal(modalId) {
  toggleMenuButton();
  checkResumeCapability();
  document.getElementById(modalId).style.visibility = 'visible';
  document.getElementById(modalId).classList.add('animate__animated', 'animate__fadeInUp', 'animate__faster');
}

function hideModal(modalId) {
  toggleMenuButton();
  document.getElementById(modalId).classList.add('animate__animated', 'animate__fadeOutDown', 'animate__faster');
}

function checkResumeCapability() {
  if (players.length) {
    document.getElementById('resumeButton').style.display = 'inline-block';
    document.getElementById('closeMenuButton').style.display = 'inline-block';
  }
  else {
    document.getElementById('resumeButton').style.display = 'none';
    document.getElementById('closeMenuButton').style.display = 'none';
  }
}

function transitionMenu(hideElement, showElement) {
  document.getElementsByClassName(hideElement)[0].classList.remove('animate__animated', 'animate__fadeOutDown', 'animate__fadeInUp', 'animate__faster');
  document.getElementsByClassName(showElement)[0].classList.remove('animate__animated', 'animate__fadeOutDown', 'animate__fadeInUp', 'animate__faster');

  document.getElementsByClassName(hideElement)[0].classList.add('animate__animated', 'animate__fadeOutDown', 'animate__faster');
  setTimeout(() => {
    checkResumeCapability();
    document.getElementsByClassName(hideElement)[0].style.display = 'none';
    document.getElementsByClassName(showElement)[0].style.display = 'flex';
    document.getElementsByClassName(showElement)[0].classList.add('animate__animated', 'animate__fadeInUp', 'animate__faster');
    toggleMenuButton();
  }, 500);
}

/* Game Logic */
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

  if (players[activePlayer]) {
    if (!isElementInScrollView(document.getElementById(players[activePlayer].id))) {
      document.getElementById(players[activePlayer].id).previousElementSibling.scrollIntoView();
    }

    document.getElementById(players[activePlayer].id).classList.add('active-player');
    document.getElementById(players[activePlayer].id).classList.add('animate__animated', 'animate__pulse', 'animate__faster');
  }

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
      localStorage.setItem('players', JSON.stringify(players));
      updateScores();
      changeActivePlayer();
      resetAudio();
      updateAudio.play();
      break;
    case 'Add':
      recordState();
      players[activePlayer].score = Math.min(players[activePlayer].score + parseInt(workingNumber), winTarget);
      localStorage.setItem('players', JSON.stringify(players));
      updateScores();
      changeActivePlayer();
      resetAudio();
      updateAudio.play();
      break;
    case 'Farkle':
      recordState();
      changeActivePlayer();
      var randomVal = Math.random();
      if (randomVal < 0.15) {
        resetAudio();
        ouchAudio.play();
      }
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
  if (el && playerContainerElement) {
    var rect = el.getBoundingClientRect();
    var elemTop = rect.top;
    var elemBottom = rect.bottom;

    // only completely visible elements return true
    var isVisible = (elemTop >= playerContainerElement.scrollTop) && (elemBottom <= playerContainerElement.scrollTop + playerContainerElement.clientHeight);
    return isVisible;
  }
}

playerContainerElement.addEventListener('scroll', () => {
  applyScrollMasks();
});

changeActivePlayer(0);
updateScores();
textFit(document.getElementsByClassName('score-calculator-working-number'));
applyScrollMasks();