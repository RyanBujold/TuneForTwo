let main = {
    x: 100,
    y: 100,
    size: 30
}

let target = {
    x: 400,
    y: 600,
    size: 10
}

const MAXWIDTH = 1000;
const MAXHEIGHT = 1000;

let keyState = {
    w: false,
    a: false,
    s: false,
    d: false
}

function setup() {
    createCanvas(MAXWIDTH, MAXHEIGHT);
    shrimpFamily.play();
    shrimpFamily.loop();
}

let shrimpFamily = undefined;
function preload()
{
    shrimpFamily = loadSound("./assets/audio/nocturne.mp3");
}

/**
 * OOPS I DIDN'T DESCRIBE WHAT MY DRAW DOES!
*/
function draw()
{
    background(0);
    fill(255, 0, 0);
    ellipse(main.x, main.y, main.size);

    let color = checkTarget();
    fill(color.r, color.g, color.b)
    ellipse(target.x, target.y, target.size);

    if (keyState.w) main.y--;
    if (keyState.s) main.y++;
    if (keyState.a) main.x--;
    if (keyState.d) main.x++;

    fill(255);
    textSize(36)
    let distX = target.x > main.x ? target.x - main.x : main.x - target.x;
    let distY = target.y > main.y ? target.y - main.y : main.y - target.y;
    text("DISTANCE FROM TARGET: " + distX + " x " + distY, 100, MAXHEIGHT - 100)

    let d = dist(main.x, main.y, target.x, target.y)
    let m = map(d, 0, 300, 1.0, 0.0, true);
    
    text("DISTANCE FROM TARGET: " + m, 100, MAXHEIGHT - 50)

    shrimpFamily.setVolume(m);

}
function keyPressed()
{
    if (key === "w" || key === "W") keyState.w = true;
    if (key === "a" || key === "A") keyState.a = true;
    if (key === "d" || key === "D") keyState.d = true;
    if (key === "s" || key === "S") keyState.s = true;
}
function keyReleased()
{
    if (key === "w" || key === "W") keyState.w = false;
    if (key === "a" || key === "A") keyState.a = false;
    if (key === "d" || key === "D") keyState.d = false;
    if (key === "s" || key === "S") keyState.s = false;
}

function checkTarget()
{
    let d = dist(main.x, main.y, target.x, target.y);

    let overlap = (d < main.size / 2 + target.size / 2);

    if (overlap) return {r: 0, g: 0, b: 255}
    else return {r: 0, g: 255, b: 0}
    //if (overlap) target.fill = target.fills.overlap;
    //else target.fill = target.fills.noOverlap;
}