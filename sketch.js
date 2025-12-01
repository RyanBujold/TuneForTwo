
let targets = []
let sounds = []
let distorts = []
let reverbs = []
//let panners = []

//let filters = []

// 'panner' and 'filter' stuff likely doesn't work because of audio context listeners (node.js doesn't work with that)

let gameStart = false;
let didGameStart = false;

let numSongs = 3;

let miyamotoMode = false;

function generateSounds(num)
{
    //Setup distortions
    sounds.push(loadSound("./assets/audio/songs/" + (num + 1) + ".mp3"))
    distorts.push(new p5.Distortion(0, 'none'));
    distorts[num].process(sounds[num]);
    reverbs.push(new p5.Reverb());
    reverbs[num].process(sounds[num],3,2);
    //panners.push(new p5.Panner3D());
    //panners[num].process(sounds[num]);

    //Setup filters
    // const filter = new p5.LowPass();
    // filter.set(10);
    // filters.push(filter);
    // filters[num].disconnect();
    // filters[num].connect(sounds[num]);
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
            distort: distorts[i],
            sound: sounds[i],
            reverb: reverbs[i],
            //panner: panners[i],
            volume: 0,
            distortionLevel: 0,
            reverbLevel: 0,
            //pannerLevel: 0,
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

    if(miyamotoMode){
        push();
        scale(4);
        console.log(frameCount);
        image(gif[Math.round(j) % 4], 0, 0);

        //image(gif, 0, 0) 
        //epic.position(50, 350);   
        pop();
    }
    
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
    fill('limegreen');
    text("press 'q' to start audio", windowWidth / 2, windowHeight / 4);

    highestV = 0;
    highestD = 0;
    for (let target of targets)
    {
        target.distort.set(target.distortionLevel);
        target.sound.setVolume((target.volume));
        target.reverb.amp(target.reverbLevel*10);
        if (target.volume / 2 > highestV) highestV = target.volume / 2;
        if (target.distortionLevel / 2 > highestD) highestD = target.distortionLevel / 2;
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
            targets[i].volume = value[i];
            targets[i].distortionLevel = value[i + numSongs];
            targets[i].reverbLevel = value[i + numSongs*2];
            //targets[i].pannerLevel = value[i + numSongs*3];
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