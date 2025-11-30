let targets = []
let sounds = []
let distorts = []

const numSongs = 3;

let gameStart = false;
let didGameStart = false;

function generateSounds(num)
{
    //sounds.push(loadSound("./assets/audio/songs/" + (num + 1) + ".mp3"))
    const player = new Tone.Player({
        "url": "./assets/audio/songs/" + (num + 1) + ".mp3",
        "loop": true,
    }).toDestination();
    sounds.push( player );
    //distorts.push(new p5.Distortion(0, '2x'));
    //const distortion = new Tone.Distortion(0.4);

    //distorts[num].process(sounds[num]);
}

let gif = [];
let frameCount = 0;
let gifFrames = [];

function preload()
{
    for (let i = 0; i < numSongs; i++)
        generateSounds(i);

    for (let i = 0; i < 4; i++)
        gif.push(loadImage(`./assets/miyamoto/${i + 1}.png`))
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
            //distort: distorts[i],
            sound: sounds[i],
            volume: 0,
            //distortionLevel: 0
        })
    }

	setupOsc(9000, 5500);
}

let j = 0;

let highestV = 0;
let highestD = 0;
function draw()
{
    background(0);
	createCanvas(windowWidth, windowHeight);

    // Get button press to start Tone.js
    document.querySelector("button").addEventListener("click", async () => {
	    await Tone.start();
	    console.log("context started");
    });

    push();
    scale(4);
    console.log(frameCount);
    image(gif[Math.round(j) % 4], 0, 0);

    //image(gif, 0, 0) 
    //epic.position(50, 350);   
    pop();
    if(gameStart && !didGameStart)
    {
        for (const sound of sounds)
        {
            //console.log(sound);
            sound.start();
            //sound.play();
            //sound.loop();
        }
        didGameStart = true;
    }

    fill(255);
    textSize(36);
    text("press 'q' to start audio", windowWidth / 2, windowHeight / 4);

    highestV = 0;
    highestD = 0;
    for (let target of targets)
    {
        //target.distort.set(target.distortionLevel);
        //target.sound.setVolume((target.volume));
        //if (target.volume / 2 > highestV) highestV = target.volume / 2;
        //if (target.distortionLevel / 2 > highestD) highestD = target.distortionLevel / 2;
    }
    j += highestV + highestD;

    if (j >= 4) j = 0;
}

function receiveOsc(address, value)
{

	if (address == '/wek/outputs')
    {
        for (let i = 0; i < targets.length; i++)
        {
            //targets[i].volume = value[i];
            //targets[i].distortionLevel = value[i + numSongs];
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
    if (key === 'q') { gameStart = true; Tone.start(); }
}