
let targets = []
let sounds = []
let distorts = []

const MAXWIDTH = 1000;
const MAXHEIGHT = 1000;

let gameStart = false;
let didGameStart = false;

let ball = {
    x: MAXWIDTH / 2,
    y: MAXHEIGHT / 2,
    size: 30
}
let noise;
let sinOsc;


var env; // this is the env
var osc; // this oscillator that will be effected by the distortion
var distortion; // this is the waveshaper distortion effect

var fft;

function generateSounds(num)
{
    sounds.push(loadSound("./assets/audio/sound" + (num + 1) + ".wav"))
    distorts.push(new p5.Distortion(1, '2x'));
    distorts[num].process(sounds[num]);
}
function preload()
{
    for (let i = 0; i < 3; i++)
        generateSounds(i);
}

function setup()
{
	createCanvas(MAXWIDTH, MAXHEIGHT);
    for (let i = 0; i < distorts.length; i++)
    {
        targets.push({
            x: ranInt(100, MAXWIDTH - 100),
            y: ranInt(100, MAXHEIGHT - 100),
            size: 10,
            distort: distorts[i],
            sound: sounds[i]
        })
    }

	setupOsc(9000, 5500);
}

function setupDistortion()
{
    fft = new p5.FFT(0, 256);
  
  
    env = new p5.Envelope();
    env.setADSR(0.01, 0.2, 0.1, 0.3);
    env.setRange(1.0, 0.0);
  
    osc = new p5.SawOsc(); // connects to main output by default
    osc.start(0);
    osc.freq(220);
    osc.amp(env);
    osc.disconnect(); // Disconnect from output to process through distortion
  
    // Create a waveshaper distortion with 2x oversampling
    distortion = new p5.Distortion(1, '4x');
    osc.connect(distortion);
}

function ranInt(min, max)
{
    return Math.round(random(min, max))
}


function draw()
{
    console.log(distortionLevel);
	text("I'm p5.js", ball.x - 25, ball.y);
    background(0);
    fill(255, 0, 0);
    ellipse(ball.x, ball.y, ball.size);

    if(gameStart && !didGameStart)
    {
        for (const sound of sounds)
        {
            sound.play();
            sound.loop();
        }
        didGameStart = true;
    }

    text("press 'q' to start audio", 10, 100);


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
        target.distort.set(distortionLevel);
        //env.triggerAttack();
    }
}

var distortionLevel;

function receiveOsc(address, value) {
	//console.log("received OSC: " + address + ", " + value);

	if (address == '/test')
    {
		if (ball.x <= MAXWIDTH && ball.x >= 0) ball.x = (value[0] * 1000 / 2) + 500;
		else if (ball.x > MAXWIDTH) ball.x = MAXWIDTH;
		else if (ball.x < 0) ball.x = 0;
		if (ball.y <= MAXHEIGHT && ball.y >= 0) ball.y = (value[1] * 1000 / 2) + 500;
		else if (ball.y > MAXHEIGHT) ball.y = MAXHEIGHT;
		else if (ball.y < 0) ball.y = 0;
        
        distortionLevel = (value[2] + 1) / 2
        // value[2] and value[3] are the second joystick. We can set the distortion for that
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
}

function keyPressed() {
    if (key === 'q') { gameStart = true; console.log(gameStart); }
}

//env.triggerRelease();