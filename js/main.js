
let light            = false

let song_in_progress = -1;

let track            = "";

let canVibrate = false;

if('vibrate' in navigator) {
    canVibrate = true;
}

function vibrate() {
    if (canVibrate) {
        navigator.vibrate(500);
    }
}

const canWakeLock = () => 'wakeLock' in navigator;

let wakelock;

function connectWebSocket() {
    const socket = new WebSocket('wss://interactiveviewer.glitch.me/?user-agent=Mozilla');

    socket.onerror = function(error) {
      alert(`[Error connecting to the host]`);
    };

    socket.addEventListener('open', function (event) {
        console.log('Connection Established')
        socket.send('Connection Established');
        start_connected_page()
        document.body.style.backgroundColor = "#ff0000";
        return false;
    });

    socket.addEventListener('message', function (event) {

        let rgbX_array = event.data.split(",")
        let effect     = rgbX_array[3]

        if (effect == 50) {
            const red   = randomIntFromInterval(0, 255)
            const green = randomIntFromInterval(0, 255)
            const blue  = randomIntFromInterval(0, 255)

            document.body.style.backgroundColor = "rgb" + "(" + red + ", " + green + ", " + blue + ")";
        }
        else if(effect != 51) {
            document.body.style.backgroundColor = "rgb" + "(" + rgbX_array[0] + ", " + rgbX_array[1] + ", " + rgbX_array[2] + ")";
        }

        if (song_in_progress == 0) {

            let play_audio = 0
            let src        = ""

            if (effect == 100) {
                src        = 'music/birds.mp3';
                play_audio = 1
            }
            else if (effect == 101) {
                src        = 'music/grillo.mp3';
                play_audio = 1
            }

            if (play_audio == 1) {
                song_in_progress = 1

                let audio = new Audio(src);
                audio.addEventListener("ended", songFinishes);
                audio.play();
            }
        }

        if (effect == 10) {
            vibrate()
        }

        if (effect == 255 && light == false) {
            turnLight(true)
            light = true
        }
        else if (effect == 0 && light == true) {
            turnLight(false)
            light = false
        }
    });


}

async function lockWakeState() {

    //console.log("Checking if screen can be locked")
    if(!canWakeLock()) return;
        try {
            wakelock = await navigator.wakeLock.request();
            wakelock.addEventListener('release', () => {
            console.log('Screen Wake State Locked:', !wakelock.released);
        });
        console.log('Screen Wake State Locked:', !wakelock.released);
    } catch(e) {
        console.error('Failed to lock wake state with reason:', e.message);
    }
}

function start_connected_page() {

    var elementos = document.getElementById("title");
    elementos.style.display = "none";

    var elementos = document.getElementById("start_button");
    elementos.style.display = "none";

    let connectionCircle = document.getElementById("connectionCircle");
    connectionCircle.style.display = "inline";

    connectionCircle.addEventListener("mouseover", function() {
        let p = document.createElement("p");
        p.innerHTML        = "Connection successful, please wait for host actions...";
        p.style.color      = "white"
        p.style.whiteSpace = "nowrap"
        p.style.fontFamily = "Chivo"
        connectionCircle.appendChild(p);
    });


    connectionCircle.addEventListener("mouseout", function() {
        let p = document.querySelector("p");
        p.remove();
    });
}

function songFinishes(element) {
    song_in_progress = 0

    connectWebSocket();
};

function turnLight(mode) {

    if(track) {
        const constraints = {
            advanced: [{
                torch:mode,
            }]
        };

        track.applyConstraints(constraints)
            .then(() => {
            console.log("Successful action with the light")
        })
    }
}

function randomIntFromInterval(min, max) { // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function enableCameraLight() {
    //Test browser support
    const SUPPORTS_MEDIA_DEVICES = 'mediaDevices' in navigator;

    if (SUPPORTS_MEDIA_DEVICES) {
      //Get the environment camera (usually the second one)
      navigator.mediaDevices.enumerateDevices().then(devices => {

        const cameras = devices.filter((device) => device.kind === 'videoinput');

        if (cameras.length === 0) {
          throw 'No camera found on this device.';
        }
        const camera = cameras[cameras.length - 1];


        // Create stream and get video track
        navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: camera.deviceId,
            facingMode: ['user', 'environment'],
            height: {ideal: 1080},
            width: {ideal: 1920}
          }
        }).then(stream => {

            track = stream.getVideoTracks()[0];

            capabilities = track.getCapabilities()

            if (!capabilities.torch) {
                console.log("torch is not supported")
                track.stop()
                track= ""
            }
        });


      });
      //The light will be on as long the track exists
    }
}

const contactServer = () => {
    socket.send("Initialize");
}

function ConfirmSubmit(sender) {
    sender.disabled = true;
    var displayValue = sender.style.
    sender.style.display = 'none'

    if (confirm('Seguro que desea entregar los paquetes?')) {
        sender.disabled = false
        return true;
    }

    sender.disabled = false;
    sender.style.display = displayValue;
    return false;
}

enableCameraLight()
lockWakeState()