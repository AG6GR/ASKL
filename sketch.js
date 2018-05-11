var cnv;

var w = 750;
var h = 500;

// All body part position offsets
var LEG_CENTER, UPPER_ARM_CENTER, LOWER_ARM_CENTER;

// Angular velocity for different body parts
var LEG_VEL_ROTATION = 10
var ARM_UPPER_VEL_ROTATION = 5
var ARM_LOWER_VEL_ROTATION = 5

// Position Vector
var person_pos;

// Sprites
var body, leg_left, leg_right;
var arm_left_upper, arm_left_lower;
var arm_right_upper, arm_right_lower;

// ========== CALLBACKS/EVENT HANLDERS ========== //

// Keyboard event handling
function keyPressed() {
  if (keyCode == 65) {
    // A key
    leg_left.vel_rotation = LEG_VEL_ROTATION;
    leg_right.vel_rotation = -LEG_VEL_ROTATION;
  } else if (keyCode == 83) {
    // S key
    leg_left.vel_rotation = -LEG_VEL_ROTATION;
    leg_right.vel_rotation = LEG_VEL_ROTATION;
  } else if (keyCode == 75) {
    // K key
    arm_right_upper.vel_rotation = ARM_UPPER_VEL_ROTATION;
    arm_left_upper.vel_rotation = ARM_UPPER_VEL_ROTATION;
  } else if (keyCode == 76) {
    // L key
    if (arm_right_lower.clockwise) {
      arm_right_lower.vel_rotation = ARM_LOWER_VEL_ROTATION;
    } else {
      arm_right_lower.vel_rotation = -ARM_LOWER_VEL_ROTATION;
    }
    if (arm_left_lower.clockwise) {
      arm_left_lower.vel_rotation = ARM_LOWER_VEL_ROTATION;
    } else {
      arm_left_lower.vel_rotation = -ARM_LOWER_VEL_ROTATION;
    }
  }
}
function keyReleased() {
  if (keyCode == 65) {
    // A key
    leg_left.vel_rotation = 0;
    leg_right.vel_rotation = 0;
  } else if (keyCode == 83) {
    // S key
    leg_left.vel_rotation = 0;
    leg_right.vel_rotation = 0;
  } else if (keyCode == 75) {
    // K key
    arm_right_upper.vel_rotation = 0;
    arm_left_upper.vel_rotation = 0;
  } else if (keyCode == 76) {
    // L key
    arm_right_lower.vel_rotation = 0;
    arm_left_lower.vel_rotation = 0;
  }
}

// ========== CUSTOM FUNCTIONS ========== //
// Update all the sprite positions based on the person's location
function updatePosition() {
  body.position.set(person_pos);
  body.rotation = person_rot;

  leg_left.rotation = body.rotation + leg_left.rel_rotation;
  leg_left.position.set(LEG_CENTER).rotate(radians(body.rotation)).add(body.position);
  
  leg_right.rotation = body.rotation + leg_right.rel_rotation;
  leg_right.position.set(LEG_CENTER).rotate(radians(body.rotation)).add(body.position);

  arm_left_upper.rotation = body.rotation + arm_left_upper.rel_rotation;
  arm_left_upper.position.set(UPPER_ARM_CENTER).rotate(radians(body.rotation)).add(body.position);

  arm_left_lower.rotation = body.rotation + arm_left_upper.rel_rotation + arm_left_lower.rel_rotation;
  arm_left_lower.position.set(LOWER_ARM_CENTER).rotate(radians(arm_left_upper.rel_rotation)).add(UPPER_ARM_CENTER).rotate(radians(body.rotation)).add(body.position);

  arm_right_upper.rotation = body.rotation + arm_right_upper.rel_rotation;
  arm_right_upper.position.set(UPPER_ARM_CENTER).rotate(radians(body.rotation)).add(body.position);

  arm_right_lower.rotation = body.rotation + arm_right_upper.rel_rotation + arm_right_lower.rel_rotation;
  arm_right_lower.position.set(LOWER_ARM_CENTER).rotate(radians(arm_right_upper.rel_rotation)).add(UPPER_ARM_CENTER).rotate(radians(body.rotation)).add(body.position);
}

// Move body part positions based on current velocities
function updateVelocity() {
  leg_left.rel_rotation = Math.min(Math.max(leg_left.rel_rotation + leg_left.vel_rotation, -30), 30)
  leg_right.rel_rotation = Math.min(Math.max(leg_right.rel_rotation + leg_right.vel_rotation, -30), 30)

  arm_right_upper.rel_rotation += arm_right_upper.vel_rotation;
  arm_left_upper.rel_rotation += arm_left_upper.vel_rotation;

  // Swap direction once lower arm reaches 0 or 90 degrees
  if (arm_right_lower.rel_rotation <= 0 || arm_right_lower.rel_rotation >= 90) {
    arm_right_lower.clockwise = !arm_right_lower.clockwise;
    arm_right_lower.vel_rotation = -arm_right_lower.vel_rotation;
  }
  arm_right_lower.rel_rotation += arm_right_lower.vel_rotation

  if (arm_left_lower.rel_rotation <= 0 || arm_left_lower.rel_rotation >= 90) {
    arm_left_lower.clockwise = !arm_left_lower.clockwise;
    arm_left_lower.vel_rotation = -arm_left_lower.vel_rotation;
  }
  arm_left_lower.rel_rotation += arm_left_lower.vel_rotation
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
  person_rot = 0.0;

  //img = loadImage('');

  // Define position offsets
  LEG_CENTER = createVector(-140, 0, 0);
  UPPER_ARM_CENTER = createVector(40, 0, 0);
  LOWER_ARM_CENTER = createVector(0, 80, 0);

  // Create body part Sprite objects
  body = createSprite(person_pos.x, person_pos.y, 200, 60)
  leg_left = createSprite(person_pos.x - 200, person_pos.y + 25, 240, 40)
  leg_left.rel_rotation = 45.0;
  leg_right = createSprite(person_pos.x - 200, person_pos.y - 25, 240, 40)
  leg_right.rel_rotation = -30.0;

  arm_left_upper = createSprite(person_pos.x + 20, person_pos.y - 25, 25, 100)
  arm_left_upper.rel_rotation = 0.0
  arm_left_lower = createSprite(person_pos.x - 20, person_pos.y - 25, 20, 100)
  arm_left_lower.rel_rotation = 45.0

  arm_right_upper = createSprite(person_pos.x - 200, person_pos.y - 25, 25, 100)
  arm_right_upper.rel_rotation = 180.0
  arm_right_lower = createSprite(person_pos.x - 200, person_pos.y - 25, 20, 100)
  arm_right_lower.rel_rotation = 45.0

  // Angular velocities
  leg_left.vel_rotation = 0;
  leg_right.vel_rotation = 0;

  arm_left_upper.vel_rotation = 0;
  arm_left_lower.vel_rotation = 0;
  arm_left_lower.clockwise = true

  arm_right_upper.vel_rotation = 0;
  arm_right_lower.vel_rotation = 0;
  arm_right_lower.clockwise = true
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
  updateVelocity()

  // Draw the things
  drawBackground()
  drawSprites()
  text(frameRate(), 10, 30);
}

function windowResized() {
  centerCanvas();
}