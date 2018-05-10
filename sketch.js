var cnv;

var w = 1000;
var h = 500;

function preload() {
  //img = loadImage('');
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
  background(185, 230, 255);

  // Water
  fill(color(0, 100, 230));
  noStroke();
  rect(0, h / 2, w, h / 2);
}

function draw() {

}

function windowResized() {
  centerCanvas();
}