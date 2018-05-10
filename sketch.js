var cnv;

var w = 1000;
var h = 500;

// Position Vector
var person_pos;

// Sprites
var body, leg_left, leg_right;


// ========== CALLBACKS/EVENT HANLDERS ========== //

// Keyboard event handling
function keyPressed() {
  if (keyCode === LEFT_ARROW) {
    value = 255;
  } else if (keyCode === RIGHT_ARROW) {
    value = 0;
  }
}

// Keyboard event handling
function keyPressed() {
  if (keyCode === LEFT_ARROW) {
    value = 255;
  } else if (keyCode === RIGHT_ARROW) {
    value = 0;
  }
}

// ========== CUSTOM FUNCTIONS ========== //
// Update all the sprite positions based on the person's location
function updatePosition() {
  body.position.x = person_pos.x;
  body.position.y = person_pos.y;

  leg_left.position.x = person_pos.x - 200;
  leg_left.position.y = person_pos.y - 25;
  leg_left.rotation = leg_left.rotation;

  leg_right.position.x = person_pos.x - 200;
  leg_right.position.y = person_pos.y + 25;
  leg_right.rotation = leg_right.rotation;

}

// Update the sprite positions based on keys pressed
function changePosition() {
  if (keyWentDown("a")) {
    if (leg_left.rotation > 60 || leg_right.rotation < -60) {
      leg_left.rotation = leg_left.rotation+2;
      leg_right.rotation = leg_right.rotation-2;
    }
    else {
      leg_left.rotation = leg_left.rotation+5;
      leg_right.rotation = leg_right.rotation-5;
    }
  }
  if (keyWentUp("a")) {
    leg_left.rotation = leg_left.rotation-2;
    leg_right.rotation = leg_right.rotation+2;
  }

  if (keyWentDown("s")) {
    if (leg_left.rotation < 2 || leg_right.rotation > -2) {
      leg_left.rotation = leg_left.rotation-2;
      leg_right.rotation = leg_right.rotation+2;
    }
    else {
      leg_left.rotation = leg_left.rotation-5;
      leg_right.rotation = leg_right.rotation+5;
    }
  }
  if (keyWentUp("s")) {
    leg_left.rotation = leg_left.rotation+2;
    leg_right.rotation = leg_right.rotation-2;
  }
}

// Draw background
function drawBackground() {
  background(185, 230, 255);

  // Water
  fill(color(0, 100, 230));
  noStroke();
  rect(0, h / 2, w, h / 2);
}

// ========== P5 STANDARD FUNCTIONS ========== //
function preload() {
  person_pos = createVector(width/2, height/2);

  //img = loadImage('');
  body = createSprite(person_pos.x, person_pos.y, 200, 50)
  leg_left = createSprite(person_pos.x - 200, person_pos.y + 25, 200, 50)
  leg_right = createSprite(person_pos.x - 200, person_pos.y - 25, 200, 50)

}

function centerCanvas() {
  var x = (windowWidth - w) / 2;
  var y = (windowHeight - h) / 2;
  cnv.position(x, y);
}

function setup() {
  cnv = createCanvas(w, h);
  centerCanvas();
  frameRate(60)
}

function draw() {
  // Update positions
  person_pos.x = mouseX;
  person_pos.y = mouseY;
  updatePosition()
  changePosition()

  // Draw the things
  drawBackground()
  drawSprites()
  text(frameRate(), 10, 30);
}

function windowResized() {
  centerCanvas();
}