var socket = io.connect();

var currentScore = 0;

socket.emit('scoreJoin');

socket.on('change', function (img) {
  var teamLogo = document.getElementsByClassName('current-team')[0];
  teamLogo.src = './assets/team/' + (img || 'unknown') + '.png';
});

socket.on('score', function (score) {
  if (currentScore !== score) {
    updateCount(score);
    currentScore = score;
  }
});

socket.on('showMain', function () {
  var imgMain = document.getElementById('imgMain');
  imgMain.classList.add('visible');
  imgMain.classList.remove('hidden');
});

socket.on('hideMain', function () {
  var imgMain = document.getElementById('imgMain');
  imgMain.classList.remove('visible');
  imgMain.classList.add('hidden');
});

function updateCount(score) {
  var newScore = document.getElementsByClassName("new-score")[0];
  var currentScore = document.getElementsByClassName("current-score")[0];

  newScore.textContent = score;

  newScore.classList.add("new-score--update");
  currentScore.classList.add("current-score--update");

  setTimeout(function () {
    newScore.textContent = '0'
    currentScore.textContent = score
    newScore.classList.remove("new-score--update");
    currentScore.classList.remove("current-score--update");
  }, 500);
}

setTimeout(function () {
  setInterval(function () {
    socket.emit('score');
  }, 1000);
}, 1000);