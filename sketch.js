
let targets = []
let sounds = []
let distorts = []

let gameStart = false;
let didGameStart = false;

function generateSounds(num)
{
    sounds.push(loadSound("./assets/audio/sound" + (num + 1) + ".wav"))
    distorts.push(new p5.Distortion(0, '2x'));
    distorts[num].process(sounds[num]);
}
function preload()
{
    for (let i = 0; i < 3; i++)
        generateSounds(i);
}

function setup()
{
	createCanvas(windowWidth, windowHeight);
    for (let i = 0; i < distorts.length; i++)
    {
        targets.push({
            x: 350,
            y: 350,
            size: 10,
            distort: distorts[i],
            sound: sounds[i],
            volume: 0,
            distortionLevel: 0
        })
    }

	setupOsc(9000, 5500);
}

function draw()
{
    background(0);

    if(gameStart && !didGameStart)
    {
        for (const sound of sounds)
        {
            sound.play();
            sound.loop();
        }
        didGameStart = true;
    }

    fill(255);
    textSize(36);
    text("press 'q' to start audio", windowWidth / 2, windowHeight / 2);

    for (let target of targets)
    {
        target.distort.set(target.distortionLevel);
        target.sound.setVolume(target.volume);
    }
}

function receiveOsc(address, value)
{

	if (address == '/wek/outputs')
    {
        for (let i = 0; i < targets.length; i++)
        {
            targets[i].volume = value[i];
            targets[i].distortionLevel = value[i + 3];
        }
	}
}

function sendOsc(address, value) { socket.emit('message', [address].concat(value)); }

function setupOsc(oscPortIn, oscPortOut)
{
	var socket = io.connect('http://127.0.0.1:8081', { port: 8081, rememberTransport: false });
	socket.on('connect', function() {
		socket.emit('config', {
			server: { port: oscPortIn,  host: '127.0.0.1'},
			client: { port: oscPortOut, host: '127.0.0.1'}
		});
	});
	socket.on('message', function(msg)
    {
		if (msg[0] == '#bundle')
			for (var i=2; i<msg.length; i++)
				receiveOsc(msg[i][0], msg[i].splice(1));
        else receiveOsc(msg[0], msg.splice(1));
	});
}

function keyPressed()
{
    if (key === 'q') { gameStart = true; console.log(gameStart); }
}