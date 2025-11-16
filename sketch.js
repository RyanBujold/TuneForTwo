
let targets = []
let sounds = []

const MAXWIDTH = 1000;
const MAXHEIGHT = 1000;

let ball = {
    x: MAXWIDTH / 2,
    y: MAXHEIGHT / 2,
    size: 30
}
function setup() {
	createCanvas(MAXWIDTH, MAXHEIGHT);
    for (const sound of sounds)
    {
        targets.push({
            x: ranInt(100, MAXWIDTH - 100),
            y: ranInt(100, MAXHEIGHT - 100),
            size: 10,
            sound: sound
        })
        sound.play();
        sound.loop();
    }
	setupOsc(9000, 5501);
}

function ranInt(min, max)
{
    return Math.round(random(min, max))
}

function preload()
{
    sounds.push(loadSound("./assets/audio/sound1.wav"))
    sounds.push(loadSound("./assets/audio/sound2.wav"))
    sounds.push(loadSound("./assets/audio/sound3.wav"))
    shrimpFamily = loadSound("./assets/audio/nocturne.mp3");
}

function draw() {
	text("I'm p5.js", ball.x-25, ball.y);
    background(0);
    fill(255, 0, 0);
    ellipse(ball.x, ball.y, ball.size);

    //if (keyState.w) ball.y--;
    //if (keyState.s) ball.y++;
    //if (keyState.a) ball.x--;
    //if (keyState.d) ball.x++;
//
    for (let target of targets)
    {
        let color = checkTarget(target);
        fill(color.r, color.g, color.b)
        ellipse(target.x, target.y, target.size);

        fill(255);
        textSize(36)
    
        let d = dist(ball.x, ball.y, target.x, target.y)
        let m = map(d, 0, 300, 1.0, 0.0, true);
        target.sound.setVolume(m);
    }
}

function receiveOsc(address, value) {
	//console.log("received OSC: " + address + ", " + value);

	if (address == '/test') {
		if (ball.x <= MAXWIDTH && ball.x >= 0) ball.x = (value[0] * 1000 / 2) + 500;
		else if (ball.x > MAXWIDTH) ball.x = MAXWIDTH;
		else if (ball.x < 0) ball.x = 0;
		if (ball.y <= MAXHEIGHT && ball.y >= 0) ball.y = (value[1] * 1000 / 2) + 500;
		else if (ball.y > MAXHEIGHT) ball.y = MAXHEIGHT;
		else if (ball.y < 0) ball.y = 0;
	}
}

function sendOsc(address, value) {
	socket.emit('message', [address].concat(value));
}

function setupOsc(oscPortIn, oscPortOut) {
	var socket = io.connect('http://127.0.0.1:8081', { port: 8081, rememberTransport: false });
	socket.on('connect', function() {
		socket.emit('config', {
			server: { port: oscPortIn,  host: '127.0.0.1'},
			client: { port: oscPortOut, host: '127.0.0.1'}
		});
	});
	socket.on('message', function(msg) {
		if (msg[0] == '#bundle') {
			for (var i=2; i<msg.length; i++) {
				receiveOsc(msg[i][0], msg[i].splice(1));
			}
		} else {
			receiveOsc(msg[0], msg.splice(1));
		}
	});
}

function checkTarget(target)
{
    let d = dist(ball.x, ball.y, target.x, target.y);

    let overlap = (d < ball.size / 2 + target.size / 2);

    if (overlap) return {r: 0, g: 0, b: 255}
    else return {r: 0, g: 255, b: 0}
    //if (overlap) target.fill = target.fills.overlap;
    //else target.fill = target.fills.noOverlap;
}