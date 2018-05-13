var cnv;

var w = 1000;
var h = 600;
var PIX_PER_M = 250
var POOL_LENGTH = 50 * PIX_PER_M // Pool length in pixels
var WATER_LEVEL = h / 2;

// background scene is 13,500 pixels wide and 600 pixels high
var SCENE_H = 600;
var SCENE_W = 13500;

// Game state machine
var gamestate = 0;
STATE_MENU = 0
STATE_RUNNING = 1
STATE_END = 2
STATE_WIN = 3

// Image assets
var img_body, img_leg, img_lower_arm, img_upper_arm;

// All body part position offsets
var LEG_CENTER, UPPER_ARM_CENTER, LOWER_ARM_CENTER;

// Angular velocity for different body parts
var LEG_VEL_ROTATION = 10
var ARM_UPPER_VEL_ROTATION = 5
var ARM_LOWER_VEL_ROTATION = 5

var KICK_FORCE = 10

// Person state variables
var person_pos; // Position (Vector) pixels
var person_rot; // Rotation (float) degrees
var person_vel; // Velocity (Vector) pixels/frame
var person_vel_rot; // Angular Velocity (float) deg/frame
var is_swim_right; // Track if flip turn has happened

// World State
var swim_distance;
var elapsed_frames;
var avg_fps;

// Sprites
var body, leg_left, leg_right;
var arm_left_upper, arm_left_lower;
var arm_right_upper, arm_right_lower;
var bodyParts // list of all body parts
var water; // list of all water molecules
var buoys; // list of all the buoys

// ========== CALLBACKS/EVENT HANLDERS ========== //

// Keyboard event handling
function keyPressed() {
  if (gamestate != STATE_RUNNING) {
    return;
  }
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

function keyTyped() {
  if (keyCode == 114) {
    console.log("Resetting!")
    gamestate = STATE_RUNNING;
    resetGame()
    updateForce()
    updatePosition()
    updateVelocity()
    simulateWater()
  }
}

// ========== CUSTOM FUNCTIONS ========== //
// Update all the sprite positions based on the person's location
function updatePosition() {
  person_pos.y += person_vel.y

  if (is_swim_right) {
    swim_distance = person_pos.x
    if (swim_distance < POOL_LENGTH) {
      person_pos.x += person_vel.x
    }
    else {
      is_swim_right = false
    }
  }
  else if (!is_swim_right && swim_distance < POOL_LENGTH * 2) {
    swim_distance = POOL_LENGTH * 2 - person_pos.x
    person_pos.x += Math.min(person_vel.x, 0)
  }

  person_rot += person_vel_rot;

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

  for (var i = 0; i < water.length; i++) {
    if (is_swim_right) {
      if (water[i].position.x < swim_distance - w/2) {
        water[i].remove();
        var waterMolecule = createSprite(random(swim_distance + w/2, swim_distance + w),random(height/2,height), 3, 3);
         waterMolecule.setSpeed(random(1,2), random(0, 360));
        waterMolecule.setCollider("circle", 0,0,3);
        waterMolecule.depth = random(-1.2,1.2);
        water[i] = waterMolecule;
      }
    }
    else {
      if (water[i].position.x > POOL_LENGTH - (swim_distance - POOL_LENGTH) + w/2) {
        water[i].remove();
        var waterMolecule = createSprite(random(POOL_LENGTH - (swim_distance - POOL_LENGTH) - w, POOL_LENGTH - (swim_distance - POOL_LENGTH) - w/2),random(height/2,height), 3, 3);
        waterMolecule.setSpeed(random(1,2), random(0, 360));
        waterMolecule.setCollider("circle", 0,0,3);
        waterMolecule.depth = random(-1.2,1.2);
        water[i] = waterMolecule;
      }
    } 
  }
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
}

// Simulate movement through water and change velocities accordingly
function updateForce() {
  // If legs are moving, propel forward
  if (leg_left.vel_rotation != 0 && leg_left.rel_rotation < 29 && leg_left.rel_rotation > -29) {
    person_vel.add(createVector(KICK_FORCE, 0).rotate(radians(person_rot)))
  }

  // Arms rotate body
  person_vel_rot -= 0.1 * arm_left_upper.vel_rotation

  // Passively sink head first
  person_vel_rot += 0.1

  // If they're outside the water, fall faster
  if (person_pos.y < WATER_LEVEL) {
    person_vel.y += 5
    person_vel.y += 1
  }

  // Drag force
  person_vel.mult(0.7)
  person_vel.y += 0.5
  person_vel_rot *= 0.7
}

function simulateWater() {
  // check colliders for body parts
  water.collide(buoys, handleBuoys);
  bodyParts.displace(water);

  // water molecules bounce off of the boundaries of the display box
  for (var i = 0; i < water.length; i++) {
    var y = water[i].position.y
    var x = water[i].position.x
    if (y <= height/2 || y >= height) {
      water[i].setVelocity(water[i].velocity.x, -1*water[i].velocity.y);
    }
    if (x <= 0 || x >= width) {
      water[i].setVelocity(-water[i].velocity.x, water[i].velocity.y);
    }
  }
}

function simulateBuoys() {
  var eps = 15;
  for (var i = 0; i < buoys.length; i++) {
    var y = buoys[i].position.y
    var x = buoys[i].position.x
    if (y <= height/2 - eps) {
      buoys[i].setVelocity(buoys[i].velocity.x, 3);
    }
    if (y >= height/2 + eps) {
      buoys[i].setVelocity(buoys[i].velocity.x, -3);
    } 
  }

  var weights = [1/19, 4/19, 9/19, 4/19, 1/19];
  var velCopy = [];
  for (var i = 0; i < buoys.length; i++) {
    velCopy.push(buoys[i].velocity.y);
  }

  for (var i = 2; i < buoys.length - 2; i++) {
    var vel = [ velCopy[i - 2],
                velCopy[i - 1],
                velCopy[i],
                velCopy[i + 1],
                velCopy[i + 2]];
    var weightedVel = 0;
    for (var j = 0; j < 5; j++) {
      weightedVel += vel[j]*weights[j];
    }
    buoys[i].setVelocity(buoys[i].velocity.x, weightedVel);
  }


}

// initializes all water molecules with random velocity
function createWater() {
  for (var i = 0; i < width/10; i++) {
    var waterMolecule = createSprite(random(swim_distance-w/2, swim_distance + w/2),random(height/2,height), 3, 3);
    waterMolecule.setSpeed(random(1,2), random(0, 360));
    waterMolecule.setCollider("circle", 0,0,3);
    waterMolecule.depth = random(-1.2,1.2);
    water.add(waterMolecule);
  }
}

// initializes all buoys in their proper locations
function createBuoys() {
  for (var i = 0; i < 40; i++) {
    var singleBuoy = createSprite(w / 40 * i - w/2, h/2, 12, 30);
    singleBuoy.setCollider("rectangle", 0, 0, 12, 30);
    singleBuoy.depth = random(2);
    buoys.add(singleBuoy);
  }
}

// makes collisions affect buoys less 
function handleBuoys(spriteWater, spriteBuoy) {
  newVelX1 = (spriteWater.velocity.x + (2 * spriteBuoy.mass * spriteBuoy.velocity.x)) / (spriteWater.mass + spriteBuoy.mass);
  newVelY1 = (spriteWater.velocity.y + (2 * spriteBuoy.mass * spriteBuoy.velocity.y)) / (spriteWater.mass + spriteBuoy.mass);
  newVelX2 = (spriteBuoy.velocity.x * (spriteBuoy.mass - spriteWater.mass) + (2 * spriteWater.mass * spriteWater.velocity.x)) / (spriteWater.mass + spriteBuoy.mass);
  newVelY2 = (spriteBuoy.velocity.y * (spriteBuoy.mass - spriteWater.mass) + (2 * spriteWater.mass * spriteWater.velocity.y)) / (spriteWater.mass + spriteBuoy.mass);
  spriteWater.setVelocity(-1*newVelX1, -1*newVelY1);
  spriteBuoy.setVelocity(0, newVelY2*2);
}

// Draw background
function drawBackground() {
  background(185, 230, 255);

  // Water
  fill(color(0, 100, 230));
  noStroke();
  rect(0, WATER_LEVEL, SCENE_W, WATER_LEVEL);
  image(img_full_background, -w/2,0);
}

function resetGame() {
  // Setup swimmer
  person_pos = createVector(0, WATER_LEVEL);
  person_rot = 0.0;
  person_vel = createVector(0, 0);
  person_vel_rot = 0.0;
  swim_distance = 0;
  is_swim_right = true;

  elapsed_frames = 0;
  avg_fps = 0;
}

function win() {
  gamestate = STATE_WIN
}
function cheat() {
  KICK_FORCE = 100
}

// ========== P5 STANDARD FUNCTIONS ========== //
function preload() {
  // Preload all image assets
  img_body = loadImage("images/body.png");
  img_leg = loadImage("images/leg2.png");
  img_lower_arm = loadImage("images/lower_arm2.png");
  img_upper_arm = loadImage("images/upper_arm.png");
  img_full_background = loadImage("images/Full_Background.png");
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

  // setup camera
  camera.on(); 

  // Define position offsets
  LEG_CENTER = createVector(-125, 8, 0);
  UPPER_ARM_CENTER = createVector(20, 0, 0);
  LOWER_ARM_CENTER = createVector(0, 80, 0);

  resetGame()

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

  // generate buoys
  buoys = new Group();
  createBuoys();
}

function draw() {

  // Update game state
  if (gamestate == STATE_MENU) {
    updatePosition()
    simulateWater()
    simulateBuoys()

    if (keyIsPressed === true) {
      gamestate = STATE_RUNNING
    }
  } else if (gamestate == STATE_RUNNING) {
    elapsed_frames++;
    avg_fps += frameRate();
    updateForce()
    updatePosition()
    updateVelocity()
    simulateWater()
    simulateBuoys()

    if (person_pos.y > height) {
      gamestate = STATE_END
    } else if (swim_distance >= 2 * POOL_LENGTH) {
      gamestate = STATE_WIN
    }
  } else if (gamestate == STATE_END) {
    updatePosition()
    updateVelocity()
    simulateWater()
    simulateBuoys()
  } else if (gamestate == STATE_WIN) {
    person_vel.set(0,0);
    person_vel_rot = 0;
    updatePosition();
  }

  // Draw the things
  drawBackground()
  drawSprites()

  // camera position
  camera.position.x = person_pos.x;

  // UI elements
  textSize(12);
  text("FPS: " + frameRate().toPrecision(4), camera.position.x - width/2, 30);

  if (gamestate == STATE_MENU) {
    textSize(48);
    textAlign(CENTER);
    text("ASKL", person_pos.x, 60);
    textSize(32);
    text("A/S: Legs\nK: Upper arms\nL: Lower arms\n Press any key to begin!", person_pos.x, 120);
  } else if (gamestate == STATE_RUNNING) {
    textSize(32);
    textAlign(CENTER);
    text("Distance: " + (swim_distance / PIX_PER_M).toFixed(1) + "m", camera.position.x, 60)
    if (!is_swim_right && swim_distance < 55 * PIX_PER_M) {
      text("Half way! Do a flip turn!", camera.position.x, 100)
    }
  } else if (gamestate == STATE_END){
    textSize(48);
    textAlign(CENTER);
    text("Game over!\nPress R to restart", camera.position.x, 90);
  } else if (gamestate == STATE_WIN){
    textSize(48);
    textAlign(CENTER);
    text("You win!\nTime: " + (elapsed_frames/avg_fps).toFixed(2)  + " sec\nPress R to restart", camera.position.x, 90);
  }
}

function windowResized() {
  centerCanvas();
}