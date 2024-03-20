const recordButton = document.getElementById('recordButton');
const stopButton = document.getElementById('stopButton');
const downloadButton = document.getElementById('downloadButton');
const recordedAudio = document.getElementById('recordedAudio');
const audioList = document.getElementById('audioList');

let mediaRecorder;
let recordedChunks = [];
let recordingTimeout;

// Kiểm tra trình duyệt hỗ trợ MediaRecorder
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    console.log('getUserMedia supported.');

    // Yêu cầu truy cập microphone
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            // Khởi tạo MediaRecorder
            mediaRecorder = new MediaRecorder(stream);

            // Sự kiện khi có dữ liệu được ghi
            mediaRecorder.addEventListener('dataavailable', event => {
                recordedChunks.push(event.data);
            });

            // Sự kiện khi dừng ghi
            mediaRecorder.addEventListener('stop', () => {
                // Tạo file audio từ dữ liệu đã ghi
                const blob = new Blob(recordedChunks, { 'type': 'audio/mp3;' });
                const audioURL = URL.createObjectURL(blob);
                recordedAudio.src = audioURL;
                recordedChunks = [];

                // Tạo một phần tử HTML cho file audio
                const audioItem = document.createElement('div');
                audioItem.classList.add('audio-item');

                const audioName = document.createElement('span');
                audioName.classList.add('audio-name');
                audioName.textContent = `recorded_audio_${Date.now()}.mp3`;

                const audioElement = document.createElement('audio');
                audioElement.controls = true;
                audioElement.src = audioURL;

                const deleteButton = document.createElement('button');
                deleteButton.classList.add('delete-button');
                deleteButton.textContent = 'Delete';
                deleteButton.disabled = false;

                // Xóa file audio khi bấm nút Delete
                deleteButton.addEventListener('click', () => {
                    audioItem.remove();
                    URL.revokeObjectURL(audioURL);
                    deleteButton.disabled = true;
                });

                audioItem.appendChild(audioName);
                audioItem.appendChild(audioElement);
                audioItem.appendChild(deleteButton);

                audioList.appendChild(audioItem);

                // Tự động tải xuống file âm thanh
                const a = document.createElement('a');
                a.href = audioURL;
                a.download = audioName.textContent;
                a.click();

                // Tắt nút Stop Record
                stopButton.disabled = true;
            });

            // Bấm nút Start Record
            recordButton.addEventListener('click', () => {
                mediaRecorder.start();
                recordButton.disabled = true;
                stopButton.disabled = false;

                // Dừng ghi sau 15 giây
                recordingTimeout = setTimeout(() => {
                    mediaRecorder.stop();
                    recordButton.disabled = false;
                    stopButton.disabled = true;
                }, 15000);
            });

            // Bấm nút Stop Record
            stopButton.addEventListener('click', () => {
                clearTimeout(recordingTimeout);
                mediaRecorder.stop();
                recordButton.disabled = false;
                stopButton.disabled = true;
            });

            // Bấm nút Download
            downloadButton.addEventListener('click', () => {
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = 'recorded_audio.mp3';
                a.click();

                //Tắt nút Download
                downloadButton.disabled = true;
            });
        })
        .catch(error => {
            console.error('Error accessing microphone:', error);
        });
} else {
    console.error('getUserMedia is not supported in this browser.');
}
