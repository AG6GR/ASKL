var cnv;

var w = 1000;
var h = 500;

// All body part position offsets
var LEG_CENTER, UPPER_ARM_CENTER, LOWER_ARM_CENTER;

// Position Vector
var person_pos;

// Sprites
var body, leg_left, leg_right;
var arm_left_upper, arm_left_lower;
var arm_right_upper, arm_right_lower;

// ========== CALLBACKS/EVENT HANLDERS ========== //

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

  leg_left.position.set(person_pos).add(LEG_CENTER);
  leg_left.rotation = leg_left.rotation;

  leg_right.position.set(person_pos).add(LEG_CENTER);
  leg_right.rotation = leg_right.rotation;

  arm_left_upper.position.set(person_pos).add(UPPER_ARM_CENTER);
  arm_left_upper.rotation = arm_left_upper.rotation;

  arm_left_lower.position.set(LOWER_ARM_CENTER).rotate(arm_left_upper.rotation).add(arm_left_upper.position)
  arm_left_lower.rotation = arm_left_lower.rotation;

  arm_right_upper.position.set(person_pos).add(UPPER_ARM_CENTER);
  arm_right_upper.rotation = arm_right_upper.rotation;
  
  arm_right_lower.position.set(LOWER_ARM_CENTER).rotate(arm_right_upper.rotation).add(arm_left_upper.position)
  arm_right_lower.rotation = arm_right_lower.rotation;

}

// Update the sprite positions based on keys pressed
function changePosition() {
  var open = 10;
  var close = 4;
  // pressing A makes the legs go apart 
  if (keyWentDown("a")) {
    if (leg_left.rotation > 60 || leg_right.rotation < -60) {
      leg_left.rotation = leg_left.rotation+close;
      leg_right.rotation = leg_right.rotation-close;
    }
    else {
      leg_left.rotation = leg_left.rotation+open;
      leg_right.rotation = leg_right.rotation-open;
    }
  }
  if (keyWentUp("a")) {
    leg_left.rotation = leg_left.rotation-close;
    leg_right.rotation = leg_right.rotation+close;
  }

  // pressing S makes the legs go together
  if (keyWentDown("s")) {
    if (leg_left.rotation < close || leg_right.rotation > -close) {
      leg_left.rotation = leg_left.rotation-close;
      leg_right.rotation = leg_right.rotation+close;
    }
    else {
      leg_left.rotation = leg_left.rotation-open;
      leg_right.rotation = leg_right.rotation+open;
    }
  }
  if (keyWentUp("s")) {
    leg_left.rotation = leg_left.rotation+close;
    leg_right.rotation = leg_right.rotation-close;
  }

  // pressing K makes the upper arms rotate
  if (keyWentDown("k")) {
    arm_right_upper.rotation = arm_right_upper.rotation + open;
    arm_left_upper.rotation = arm_left_upper.rotation + open;
  }
  if (keyWentUp("k")) {
    arm_right_upper.rotation -= close;
    arm_left_upper.rotation -= close;
  }

  // pressing L makes the lower arms rotate between 0 and 90 degrees
  // when either limit is hit, direction of rotation switches
  var lowerOpen;
  var lowerClose;
  if (keyWentDown("l")) {
    if (arm_right_lower.clockwise == 1) {
      lowerOpen = 2*open;
    }
    else {
      lowerOpen = -2*open;
    }
    arm_right_lower.rel_rotation = arm_right_lower.rel_rotation + lowerOpen;
    arm_left_lower.rel_rotation = arm_left_lower.rel_rotation + lowerOpen;

    if (arm_right_lower.rel_rotation > 90 || arm_right_lower.rel_rotation < -90) {
      arm_right_lower.clockwise = -1*arm_right_lower.clockwise;
    }
  }

  if (keyWentUp("l")) {
    if (arm_right_lower.clockwise == 1) {
      lowerClose = 2*close;
    }
    else {
      lowerClose = -2*close;
    }
    arm_right_lower.rel_rotation = arm_right_lower.rel_rotation - lowerClose;
    arm_left_lower.rel_rotation = arm_left_lower.rel_rotation - lowerClose;
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

  // Define position offsets
  LEG_CENTER = createVector(-140, 0, 0);
  UPPER_ARM_CENTER = createVector(40, 0, 0);
  LOWER_ARM_CENTER = createVector(0, 80, 0);

  // Create body part Sprite objects
  body = createSprite(person_pos.x, person_pos.y, 200, 60)
  leg_left = createSprite(person_pos.x - 200, person_pos.y + 25, 240, 40)
  leg_right = createSprite(person_pos.x - 200, person_pos.y - 25, 240, 40)

  arm_left_upper = createSprite(person_pos.x + 20, person_pos.y - 25, 25, 100)
  arm_left_lower = createSprite(person_pos.x - 20, person_pos.y - 25, 20, 100)
  arm_right_upper = createSprite(person_pos.x - 200, person_pos.y - 25, 25, 100)
  arm_right_lower = createSprite(person_pos.x - 200, person_pos.y - 25, 20, 100)

  arm_left_lower.clockwise = 1;
  arm_right_lower.clockwise = 1;

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