let song; 
let mFFT;
let wand;
let colorA, colorB, colorC;
let moves = [];
let colorPicker;
let amplitude;
let ballScale = 50;

let mSerial;
let connectButton;
let readyToReceive;
let cBackgroundColor;

class Movey {
  constructor(x, y, scale) {
    this.pos = createVector(x, y);
    this.vel = createVector(random(-5, 5), random(-5, 5));
    this.scale = scale
    this.color = color(random(100, 255), random(200, 255), random(100, 255));
  }
  overlap(other) {
    if (other === this) return false;
    let dist = p5.Vector.dist(this.pos, other.pos);
    return dist < (this.scale / 2 * sin(frameCount) + other.scale / 2 * sin(frameCount));
  }
  updateAndDraw(others) {
    this.pos.add(this.vel);
    if (this.pos.x > width - this.scale || this.pos.x < this.scale) {
      this.vel.x *= -1;
    }
    if (this.pos.y > height - this.scale || this.pos.y < this.scale) {
      this.vel.y *= -1;
    }
    let overlap = false;
    for (let other of others) {
      overlap |= this.overlap(other);
    }
    if (overlap) {
      this.color = color(random(100, 255), random(200, 255), random(100, 255));
    }
    push();
    stroke(this.color, 200);
    fill(this.color);
    ellipse(this.pos.x, this.pos.y, this.scale);
    pop();
  }
}

function receiveSerial() {
  let mLine = mSerial.readUntil("\n");
  trim(mLine);
  if (!mLine) return;
  if (mLine.charAt(0) != "{") {
    print("error: ", mLine);
    readyToReceive = true;
    return;
  }
  let data = JSON.parse(mLine).data;
  print(mLine, data);

  let a0 = data.A0;
  let a1 = data.A1;
  let d2 = data.D2;
  cBackgroundColor = map(a1, 0, 800, 0, 255);
  readyToReceive = true;
  let mappedScale = map(a0, 0, 4096, 5, 50);
  if (d2 === 1) {
    moves.push(new Movey(mouseX, mouseY, mappedScale));
  }

  print("A0:", a0, "A1:", a1, "D2:", d2);
}

function connectToSerial() {
  if (!mSerial.opened()) {
    mSerial.open(9600);
    connectButton.hide();
    readyToReceive = true;
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  mSerial = createSerial();

  connectButton = createButton("Connect To Serial");
  connectButton.position(width / 2, height / 2);
  connectButton.mousePressed(connectToSerial);

  cBackgroundColor = 0;

  readyToReceive = false;
}

function draw() {
  background(cBackgroundColor);

  if (mSerial.opened() && readyToReceive) {
    mSerial.clear();
    mSerial.write(0xAB);
    readyToReceive = false;
  }

  if (mSerial.availableBytes() > 0) {
    receiveSerial();
  }

  for (let i = 0; i < moves.length; i++) {
    moves[i].updateAndDraw(moves);
  }
}
