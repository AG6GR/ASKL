var cnv;

var w = 1000;
var h = 500;

// Position Vector
var person_pos;

// Sprites
var body, leg_left, leg_right;

// Update all the sprite positions based on the person's location
function updatePosition() {
  body.position.x = person_pos.x;
  body.position.y = person_pos.y;

  leg_left.position.x = person_pos.x - 200;
  leg_left.position.y = person_pos.y - 25;

  leg_right.position.x = person_pos.x - 200;
  leg_right.position.y = person_pos.y + 25;

}

// Draw background
function drawBackground() {
  background(185, 230, 255);

  // Water
  fill(color(0, 100, 230));
  noStroke();
  rect(0, h / 2, w, h / 2);
}

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

  // Background
  cnv = createCanvas(w, h);
  centerCanvas();
}

function draw() {
  // Update positions
  person_pos.x = mouseX;
  person_pos.y = mouseY;
  updatePosition()

  // Draw the things
  drawBackground()
  drawSprites()
}

function windowResized() {
  centerCanvas();
}