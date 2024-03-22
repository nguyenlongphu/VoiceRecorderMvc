const mic_btn = document.querySelector('#mic');
const playback = document.querySelector('.playback');
const downloadLink = document.createElement('a');

mic_btn.addEventListener('click', ToggleMic);

let can_record = false;
let is_recording = false;

let recorder = null;
let chunks = [];

function SetupAudio() {
    console.log("Setup");
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
            .getUserMedia({
                audio: true
            })
            .then(SetupStream)
            .catch(err => {

                console.log(err)

            });

    }
}
SetupAudio();

function SetupStream(stream) {
    recorder = new MediaRecorder(stream);

    recorder.ondataavailable = e => {
        chunks.push(e.data);
    }
    recorder.onstop = e => {
        const blob = new Blob(chunks, { type: "audio/mp3; codecs=opus" });
        chunks = [];

        // Create a download link and set its href to the Blob URL
        downloadLink.href = window.URL.createObjectURL(blob);
        downloadLink.download = 'recording.mp3';

        // Append the download link to the page
        document.body.appendChild(downloadLink);

        // Simulate a click on the download link to download the file
        downloadLink.click();

        // Remove the download link from the page
        document.body.removeChild(downloadLink);

        playback.src = downloadLink.href;
    }
    can_record = true;
}

function ToggleMic() {
    if (!can_record) return;

    is_recording = !is_recording;

    if (is_recording) {
        recorder.start();
        mic_btn.classList.add('is-recording');

    } else {
        recorder.stop();
        mic_btn.classList.remove('is-recording');
    }
}