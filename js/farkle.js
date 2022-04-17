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
  { id: 'player1', score: 0},
  { id: 'player2', score: 0},
  { id: 'player3', score: 0},
  { id: 'player4', score: 0}
];
var activePlayer = 0;

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

  document.getElementById(players[activePlayer].id).classList.add('active-player');
  document.getElementById(players[activePlayer].id).classList.add('animate__animated', 'animate__pulse', 'animate__faster');
  workingNumber = 0;
  document.getElementsByClassName('score-calculator-working-number')[0].innerHTML = workingNumber;
  textFit(document.getElementsByClassName('score-calculator-working-number'));
}

function updateScores(){
  players.forEach(player => {
    document.querySelectorAll('#' + player.id + ' .player-container-row-player-details-score')[0].innerHTML = player.score + '&#32;<span class="remaining-score">&nbsp;/&nbsp;' + (winTarget - player.score) + '</span>';
    var percentage = (player.score / winTarget) * 100;
    document.getElementById(player.id).style.background = 'linear-gradient(90deg, rgba(171,0,255,1) ' + percentage + '%, rgba(255,255,255,1) ' + percentage + '%)';
  });
  resetAudio();
  updateAudio.play();
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
      players[activePlayer].score = Math.max(players[activePlayer].score - parseInt(workingNumber), 0);
      updateScores();
      changeActivePlayer();
      break;
    case 'Add':
      players[activePlayer].score = players[activePlayer].score + parseInt(workingNumber);
      updateScores();
      changeActivePlayer();
      break;
    case 'Farkle':
      changeActivePlayer();
      resetAudio();
      ouchAudio.play();
      break;
    default:
      if(workingNumber == '0') {
        workingNumber = button;
        document.getElementsByClassName('score-calculator-working-number')[0].innerHTML = workingNumber;
      }
      else {
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
    default: ['1 2 3', '4 5 6', '7 8 9', 'Clear 0 Backspace', 'Subtract Add Farkle'],
  },
  buttonTheme : [
    {
      class: 'dark-button',
      buttons: 'Clear Backspace Subtract Add Farkle'
    }
  ],
  theme: "hg-theme-default hg-layout-numeric numeric-theme"
});

changeActivePlayer(0);
updateScores();
textFit(document.getElementsByClassName('score-calculator-working-number'));