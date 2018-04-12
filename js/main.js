(() => {
  var theCanvas = document.querySelector('canvas'),
        ctx = theCanvas.getContext("2d"),

        enemy1 = document.querySelector('.enemyOne'),
        enemy2 = document.querySelector('.enemyTwo'),
        enemy3 = document.querySelector('.enemyThree'),

        player = { x : 275, y : 540, width: 60, height : 50, lives : [1,2,3], speed : 7 },
        mouseTracker = { x : theCanvas.width/2 }
        playerImg = document.querySelector('.player'),
        explodeImg = document.querySelector('.kaboom'),
        
        mousePos = player.x - player.width / 2,

        pauseGame = document.querySelector('.pause'),
        resumeGame = document.querySelector('.play'),
        resetGame = document.querySelector('.reset'),

        score = 0;

        var playState = true,

            squares = [
              { x: randomX(), y: 30, x1: 45, y1: 45, image: enemy1, xspeed : 5, yspeed : -4, score : 5, bullets : [] },
              { x: randomX(), y: 90, x1: 30, y1: 30, image: enemy2, xspeed : -2, yspeed : -6, score : 10, bullets : [] },
              { x: randomX(), y: 150, x1: 30, y1: 30, image: enemy3, xspeed : 4, yspeed : 5, score : 10, bullets : [] },
              { x: randomX(), y: 30, x1: 45, y1: 45, image: enemy1, xspeed : -6, yspeed : 8, score : 5, bullets : [] },
              { x: randomX(), y: 90, x1: 30, y1: 30, image: enemy2, xspeed : -4, yspeed : -3, score : 10, bullets : [] },
              { x: randomX(), y: 150, x1: 30, y1: 30, image: enemy3, xspeed : 6, yspeed : 5, score : 10, bullets : [] }
            ],

            bullets = [];

  function draw() {
    ctx.clearRect(0, 0, theCanvas.width, theCanvas.height);
    // draw score
    ctx.fillStyle = 'rgb(255,255,255)';
    ctx.font = '18px sans-serif';
    ctx.fillText(`Score: ${score}`, 500, 20);

    // draw player lives
    player.lives.forEach((life, index) =>  {
      ctx.drawImage(playerImg, 10 + (index* 26), 10, 20, 20)
    });

    // draw the mouse tracker
    ctx.beginPath();
    ctx.moveTo(mouseTracker.x, theCanvas.height - 10);
    ctx.lineTo(mouseTracker.x - 5, theCanvas.height);
    ctx.lineTo(mouseTracker.x + 5, theCanvas.height);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fill();

    // draw the player
    dx = mousePos - player.x;
    player.x += (dx / 10);
    ctx.drawImage(playerImg, player.x, player.y, 50, 50);

    // draw enemies
    squares.forEach(square => {
      //ctx.fillStyle = square.color;
      ctx.drawImage(square.image, square.x, square.y, square.x1, square.y1);

      // try this with css animation / transition (ship movement)?
      if (square.x + square.x1 > theCanvas.width) {
        square.xspeed *= -1;
      } else if (square.x < 0) {
        square.xspeed *= -1;
      }   

      if (square.y + square.y1 > theCanvas.height - 100) {
          square.yspeed *= -1;
      } else if (square.y < 0 ) {
        square.yspeed *= -1;
      }

      square.x += square.xspeed;
      square.y += square.yspeed;
    });

    // draw bullet
    bullets.forEach((bullet, index) => {
        ctx.fillStyle = 'rgb(255, 0, 0)';
        ctx.fillRect(bullet.x, bullet.y, bullet.x2, bullet.y2);

        bullet.y -= bullet.speed;
        bulletIndex = index;

        // loop through squares and see if any collide
        squares.forEach((square, index) => {
          //console.log(index, bulletIndex, (bullet.y <= square.y && bullet.x > square.x && bullet.x < (square.x + square.x1)), bullet.y);
          if (bullet.y <= (square.y + square.y1) && bullet.y > square.y && bullet.x > square.x && bullet.x < (square.x + square.x1)) {
            // should probably try a splice here instead or a different removal method as this leaves an empty index
            
            //delete squares[index];
            //delete bullets[bulletIndex];
            bullets.splice(bulletIndex, 1);
            squares.splice(index, 1);

            console.log(`enemies : ${squares.length}`);

            if (squares.length == 0) {
              console.log('level up!');

              // do a reset function here
              setTimeout(() => {
                playState = false;
                showLevelUp();
              }, 1200);
            }

            score += square.score;

            let explode = document.createElement('audio');
            explode.src = "audio/explosion.mp3";

            document.body.appendChild(explode);

            explode.addEventListener('ended', function() {
              document.body.removeChild(explode);
            });

            explode.play();
          }
        });

        if (bullet.y < 0) {
          // could do a shooting percentage - length of array is shots fired

          //delete bullets[index];
          bullets.splice(index, 1);
          console.log(bullets.length);
        }
    });

    if (playState == false) {
      window.cancelAnimationFrame(draw);
      return
    };

    window.requestAnimationFrame(draw);
  }

  function showLevelUp() {
    // show the Level Up pause screen
    document.querySelector('.level-up').classList.add('show-level-up');
  }

  function createBullet() {
    // create a new bullet
    let newBullet = { x : (player.x + player.width/2 - 2.5), y : (theCanvas.height - player.height - 10), x2 : 5, y2 : 10, speed : 12 };

    // add it to the bullet array
    bullets.push(newBullet);
    let laser = document.createElement("audio");
    laser.src = "audio/laser.mp3";
    document.body.appendChild(laser);

    laser.addEventListener('ended', () => {
      document.body.removeChild(laser);
    });

    laser.play();
  }

  function movePlayer(e) {
    switch (e.keyCode) {
      case 37:
      console.log('move left');
      if (player.x > 0) {
        player.x -= player.speed;
      }
      break;

      case 39:
      console.log('move right');
      if (player.x + player.width < theCanvas.width) {
        player.x += player.speed;
      }
      break;

      default:
      // do nothing
    }
  }

  function shootBullet(e) {
    if (e.keyCode == 32) {
      createBullet();
    }
  }

  function pauseAnimation() {
    playState = false;
  }

  function resumeAnimation() {
    if (playState == false) {
      playState = true;
      window.requestAnimationFrame(draw);
    }
  }

  function randomX() {
    return Math.floor(Math.random() * (theCanvas.width - 100));
  }

  function logMouseMove(e) {
    //console.log('moved mouse...');
    // animate the player movement to make it trail a bit
    mousePos = (e.clientX - theCanvas.offsetLeft) - player.width / 2;

    mouseTracker.x = e.clientX - theCanvas.offsetLeft;
  }

  function restartGame() {
    // could increase speed dynamically here
    squares = [
          { x: randomX(), y: 30, x1: 45, y1: 45, image: enemy1, xspeed : 5, yspeed : 4, score : 5, bullets : [] },
          { x: randomX(), y: 90, x1: 30, y1: 30, image: enemy2, xspeed : 2, yspeed : 6, score : 10, bullets : [] },
          { x: randomX(), y: 150, x1: 30, y1: 30, image: enemy3, xspeed : 4, yspeed : 5, score : 10, bullets : [] },
          { x: randomX(), y: 30, x1: 45, y1: 45, image: enemy1, xspeed : 6, yspeed : 8, score : 5, bullets : [] },
          { x: randomX(), y: 90, x1: 30, y1: 30, image: enemy2, xspeed : 4, yspeed : 3, score : 10, bullets : [] },
          { x: randomX(), y: 150, x1: 30, y1: 30, image: enemy3, xspeed : 6, yspeed : 5, score : 10, bullets : [] }
        ];

    bullets = [];

    player.x = theCanvas.width / 2;

    playState = true;

    document.querySelector('.level-up').classList.remove('show-level-up');

    window.requestAnimationFrame(draw);
  }

  theCanvas.addEventListener('click', createBullet);
  theCanvas.addEventListener('mousemove', logMouseMove);
  //window.addEventListener('keydown', movePlayer);
  window.addEventListener('keyup', shootBullet);

  pauseGame.addEventListener('click', pauseAnimation);
  resumeGame.addEventListener('click', resumeAnimation);
  resetGame.addEventListener('click', restartGame);

  window.requestAnimationFrame(draw);
})();
