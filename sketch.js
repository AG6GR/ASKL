var cnv;

var w = 750;
var h = 500;

// Image assets
var img_body, img_leg, img_lower_arm, img_upper_arm;

// All body part position offsets
var LEG_CENTER, UPPER_ARM_CENTER, LOWER_ARM_CENTER;

// Angular velocity for different body parts
var LEG_VEL_ROTATION = 10
var ARM_UPPER_VEL_ROTATION = 5
var ARM_LOWER_VEL_ROTATION = 5

// Position Vector
var person_pos;
var person_rot;

// Sprites
var body, leg_left, leg_right;
var arm_left_upper, arm_left_lower;
var arm_right_upper, arm_right_lower;
var bodyParts // list of all body parts
var water; // list of all water molecules

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
    if (arm_left_lower.clockwise) {
      arm_left_lower.vel_rotation = ARM_LOWER_VEL_ROTATION;
    } else {
      arm_left_lower.vel_rotation = -ARM_LOWER_VEL_ROTATION;
    }
    if (arm_right_lower.clockwise) {
      arm_right_lower.vel_rotation = ARM_LOWER_VEL_ROTATION;
    } else {
      arm_right_lower.vel_rotation = -ARM_LOWER_VEL_ROTATION;
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
    arm_left_upper.vel_rotation = 0;
    arm_right_upper.vel_rotation = 0;
  } else if (keyCode == 76) {
    // L key
    arm_left_lower.vel_rotation = 0;
    arm_right_lower.vel_rotation = 0;
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
  /*if (arm_right_upper.rotation%360 <180) {
    var temp = createSprite(arm_right_upper.position.x, arm_right_upper.position.y, arm_right_upper.width, arm_right_upper.height);
    temp.rotation = arm_right_upper.rotation;
  }*/

  arm_right_lower.rotation = body.rotation + arm_right_upper.rel_rotation + arm_right_lower.rel_rotation;
  arm_right_lower.position.set(LOWER_ARM_CENTER).rotate(radians(arm_right_upper.rel_rotation)).add(UPPER_ARM_CENTER).rotate(radians(body.rotation)).add(body.position);
}

// Move body part positions based on current velocities
function updateVelocity() {
  leg_left.rel_rotation = Math.min(Math.max(leg_left.rel_rotation + leg_left.vel_rotation, -30), 30)
  leg_right.rel_rotation = Math.min(Math.max(leg_right.rel_rotation + leg_right.vel_rotation, -30), 30)

  arm_left_upper.rel_rotation += arm_left_upper.vel_rotation;
  arm_right_upper.rel_rotation += arm_right_upper.vel_rotation;
  
  // Swap direction once lower arm reaches 90 or 270 degrees
  if (arm_left_lower.rel_rotation < 90 || arm_left_lower.rel_rotation > 270) {
    arm_left_lower.clockwise = !arm_left_lower.clockwise;
    arm_left_lower.vel_rotation = -arm_left_lower.vel_rotation;
  }
  arm_left_lower.rel_rotation += arm_left_lower.vel_rotation

  if (arm_right_lower.rel_rotation < 90 || arm_right_lower.rel_rotation > 270) {
    arm_right_lower.clockwise = !arm_right_lower.clockwise;
    arm_right_lower.vel_rotation = -arm_right_lower.vel_rotation;
  }
  arm_right_lower.rel_rotation += arm_right_lower.vel_rotation

  // check colliders for body parts
  water.bounce(bodyParts);

  // water molecules bounce off of the boundaries of the display box
  for (var i = 0; i < width/2; i++) {
    var y = water[i].position.y
    var x = water[i].position.x
    if (y <= height/2 || y >= height) {
      water[i].setVelocity(water[i].velocity.x, -water[i].velocity.y);
    }
    if (x <= 0 || x >= width) {
      water[i].setVelocity(-water[i].velocity.x, water[i].velocity.y);
    }
  }
}

// initializes all water molecules with random velocity
function createWater() {
  for (var i = 0; i < width/2; i++) {
    var waterMolecule = createSprite(random(0,width),random(height/2,height), 3, 3);
    waterMolecule.setSpeed(random(1,2), random(0, 360));
    waterMolecule.setCollider("circle", 0,0,3);
    waterMolecule.depth = random(-1.2,1.2);
    water.add(waterMolecule);
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
  // Preload all image assets
  img_body = loadImage("images/body.png");
  img_leg = loadImage("images/leg2.png");
  img_lower_arm = loadImage("images/lower_arm2.png");
  img_upper_arm = loadImage("images/upper_arm.png");
}

function centerCanvas() {
  var x = (windowWidth - w) / 2;
  var y = (windowHeight - h) / 2;
  cnv.position(x, y);
}

function setup() {
  // Setup Canvas
  cnv = createCanvas(w, h);
  centerCanvas();
  frameRate(60)

  // Setup swimmer
  person_pos = createVector(width/2, height/2);
  person_rot = 0.0;

  // Define position offsets
  LEG_CENTER = createVector(-128, 7, 0);
  UPPER_ARM_CENTER = createVector(20, 0, 0);
  LOWER_ARM_CENTER = createVector(0, 80, 0);

  // Create body part Sprite objects
  bodyParts = new Group();

  arm_left_upper = createSprite(person_pos.x + 20, person_pos.y - 25, 25, 100)
  arm_left_upper.addImage(img_upper_arm);
  arm_left_upper.rel_rotation = 0.0
  arm_left_upper.depth = -1
  arm_left_upper.setCollider("rectangle", 0, 30, 25, 100); // offsets determined empirically
  bodyParts.add(arm_left_upper);

  arm_left_lower = createSprite(person_pos.x - 20, person_pos.y - 25, 20, 100)
  arm_left_lower.addImage(img_lower_arm);
  arm_left_lower.rel_rotation = 180
  arm_left_lower.depth = 1.1 
  arm_left_lower.setCollider("rectangle", 0, 35, 20, 120); // offsets determined empirically
  bodyParts.add(arm_left_lower);

  leg_left = createSprite(person_pos.x - 200, person_pos.y + 25, 240, 40)
  leg_left.addImage(img_leg);
  leg_left.rel_rotation = 45.0;
  leg_left.depth = -1
  leg_left.setCollider("rectangle", -50, 0, 240, 40);
  bodyParts.add(leg_left);

  body = createSprite(person_pos.x, person_pos.y, 200, 60)
  body.addImage(img_body);
  body.depth = 0;
  body.setCollider("rectangle", 0,0,250,60);
  bodyParts.add(body);

  leg_right = createSprite(person_pos.x - 200, person_pos.y - 25, 240, 40)
  leg_right.addImage(img_leg);
  leg_right.rel_rotation = -30.0;
  leg_right.depth = 1
  leg_right.setCollider("rectangle", -50, 0, 240, 40);
  bodyParts.add(leg_right);

  arm_right_upper = createSprite(person_pos.x - 200, person_pos.y - 25, 25, 100)
  arm_right_upper.addImage(img_upper_arm);
  arm_right_upper.rel_rotation = 180.0
  arm_right_upper.depth = 1
  arm_right_upper.setCollider("rectangle", 0, -30, 25, 100); // offsets determined empirically
  bodyParts.add(arm_right_upper);

  arm_right_lower = createSprite(person_pos.x - 200, person_pos.y - 25, 20, 100)
  arm_right_lower.addImage(img_lower_arm);
  arm_right_lower.rel_rotation = 180
  arm_right_lower.depth = -1.1
  arm_right_lower.setCollider("rectangle", 0, -35, 20, 120) // offsets determined empirically
  bodyParts.add(arm_right_lower);

  // Angular velocities
  leg_left.vel_rotation = 0;
  leg_right.vel_rotation = 0;

  arm_left_upper.vel_rotation = 0;
  arm_left_lower.vel_rotation = 0;
  arm_left_lower.clockwise = true

  arm_right_upper.vel_rotation = 0;
  arm_right_lower.vel_rotation = 0;
  arm_right_lower.clockwise = true

  // generates water molecules
  water = new Group();
  createWater();
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