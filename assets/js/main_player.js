// Configuration
const APP_CONFIG = {
    streamUrl: "https://radiostreamingserver.com.ar/proxy/hypersonica/stream",
    apiUrl: "https://radiostreamingserver.com.ar:2199/rpc/hypersonica/streaminfo.get"
};

// Part 1: Metadata fetching
setInterval(() => {
    $.getJSON(APP_CONFIG.apiUrl, function (apidata) {
        let caratula = apidata.data[0].track.imageurl;
        let tema = apidata.data[0].song;
        const fondo = document.getElementById('fondo');
        const caratulax = document.getElementById('caratula');
        const temax = document.getElementById('tema');
        if (fondo) fondo.src = caratula;
        if (caratulax) caratulax.src = caratula;
        if (temax) temax.innerText = tema;
    }).fail(function(jqXHR, textStatus, errorThrown) {
        console.error("Error fetching stream info:", textStatus, errorThrown);
        const temax = document.getElementById('tema');
        if (temax) {
            temax.innerText = "Track info unavailable";
        }
        const streamStatus = document.getElementById('stream-status');
        if (streamStatus) {
            streamStatus.innerText = "Cannot load track data.";
        }
    });
}, 300);

// Part 2: Audio element setup
const audio = new Audio();
audio.src = APP_CONFIG.streamUrl;

// Part 3: Player button and Lottie setup & event listener
const player = document.getElementById('player');
const icono = document.getElementById('icon-player');
const lottieContainer = document.getElementById('lottie');
let lottiePlayer = null;
if (lottieContainer) {
    lottiePlayer = lottieContainer.querySelector('lottie-player');
}

if (player && icono) { // Ensure player and icon elements exist before adding listener
    player.addEventListener('click', function () {
        if (audio.paused) {
            audio.play();
            icono.classList.remove('fa-circle-play');
            icono.classList.add('fa-circle-pause');
            if (lottiePlayer) {
                lottiePlayer.play();
            }
        } else {
            audio.pause();
            icono.classList.add('fa-circle-play');
            icono.classList.remove('fa-circle-pause');
            if (lottiePlayer) {
                lottiePlayer.pause();
            }
        }
    });
}

// Part 4: Stream Status Feedback
const streamStatusEl = document.getElementById('stream-status');
if (streamStatusEl) {
    audio.addEventListener('error', function(e) {
        console.error('Audio Error:', audio.error); // Log the actual error object
        streamStatusEl.innerText = 'Stream error. Please try again later.';
    });
    audio.addEventListener('stalled', function() {
        console.warn('Audio Stalled: Browser is trying to get media data, but data is unexpectedly not forthcoming.');
        streamStatusEl.innerText = 'Stream stalled. Buffering issues...';
    });
    audio.addEventListener('waiting', function() {
        console.info('Audio Waiting: Playback has stopped because of a temporary lack of data.');
        streamStatusEl.innerText = 'Buffering...';
    });
    audio.addEventListener('playing', function() {
        streamStatusEl.innerText = ''; // Clear status when playing
    });
    audio.addEventListener('pause', function() {
        // This event also fires when audio stops due to error/end.
        // Only show "Paused" if it's a user-initiated pause and not an error state.
        // Current decision: keep status clear on user pause to avoid confusion.
        if (audio.readyState >= 2 && !audio.error && !audio.ended) {
            // streamStatusEl.innerText = 'Paused';
        }
    });
    audio.addEventListener('ended', function() {
        streamStatusEl.innerText = 'Stream ended.';
    });
}
