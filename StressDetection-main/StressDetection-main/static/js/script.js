



/* ---------- 1. Slideshow ---------- */
let slideIndex = 0;
const slides = document.querySelectorAll(".slide");

function showSlides() {
  slides[slideIndex].classList.remove("active");
  slideIndex = (slideIndex + 1) % slides.length;
  slides[slideIndex].classList.add("active");
}
setInterval(showSlides, 4000);

/* ---------- 2. Quote carousel ---------- */
const quotes = document.querySelectorAll(".quote-carousel blockquote");
let quoteIdx = 0;

function showQuote(i) {
  quotes.forEach((q, k) => q.classList.toggle("active", k === i));
}
showQuote(quoteIdx);
setInterval(() => {
  quoteIdx = (quoteIdx + 1) % quotes.length;
  showQuote(quoteIdx);
}, 4000);

/* ---------- 3. Navbar highlight & styling ---------- */

const navLinks = document.querySelectorAll(".navbar-button");
  const sections = document.querySelectorAll("section, .Home, .Detect");
  const navbar   = document.querySelector(".navbar");
  const slideH   = document.querySelector(".slideshow-container").offsetHeight;


  function updateActiveNav() {
    if (window.scrollY < slideH - 100) {
      navLinks.forEach(l => l.classList.remove("active"));
      return;
    }
    let current = null;
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 150) current = sec.id;
    });
    navLinks.forEach(l =>
      l.classList.toggle("active", current && l.getAttribute("href").includes(current))
    );
  }



  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > slideH - 100);
    updateActiveNav();
  });
  window.addEventListener("DOMContentLoaded", updateActiveNav);
  /* smooth-scroll on click adjusted to offset fixed navbar */
  navLinks.forEach(link =>
    link.addEventListener("click", e => {
      e.preventDefault();
      const targetId = link.getAttribute("href").substring(1);
      const targetSection = document.getElementById(targetId);
      if (!targetSection) return;
      const navbarHeight = navbar.offsetHeight;
      const targetPosition = targetSection.offsetTop - navbarHeight + 1; // slight adjustment
      window.scrollTo({ top: targetPosition, behavior: "smooth" });
    })
  );
/* ---------- 4. (keep the rest of your demo logic here) ---------- */










// UTILITIES
const show = el => el.classList.remove('hidden');
const hide = el => el.classList.add('hidden');

// MAIN CONTAINERS & CARDS
const mainGrid = document.getElementById('card-container');

const textCard = document.querySelector('.card[data-type="text"]');
const voiceCard = document.querySelector('.card[data-type="voice"]');
const videoCard = document.querySelector('.card[data-type="video"]');

// TEXT EMOTION PANEL
const textEmotionArea = document.getElementById('text-emotion-area');
const textInput = document.getElementById('text-input');
const detectTextBtn = document.getElementById('detect-text-btn');
const textEmotionResult = document.getElementById('textEmotionResult');

// VOICE OPTIONS & PANELS
const voiceOptions = document.getElementById('voice-options');
const uploadAudioCard = document.getElementById('upload-audio-card');
const micCard = document.getElementById('mic-card');

const audioUploadWrapper = document.getElementById('audio-upload-wrapper');
const audioFileInput = document.getElementById('audio-file-input');
const predictAudioBtn = document.getElementById('predict-audio-btn');
const audioResultText = document.getElementById('audioResultText');

const micWrapper = document.getElementById('mic-wrapper');
const startRecBtn = document.getElementById('start-rec-btn');
const stopRecBtn = document.getElementById('stop-rec-btn');
const predictMicBtn = document.getElementById('predict-mic-btn');
const micPlayback = document.getElementById('micPlayback');
const micResultText = document.getElementById('micResultText');

// VIDEO OPTIONS & PANELS
const videoOptions = document.getElementById('video-options');
const uploadVideoCard = document.getElementById('upload-video-card');
const recordVideoCard = document.getElementById('record-video-card');

const uploadVideoPanel = document.getElementById('upload-video-panel');
const videoFileInput = document.getElementById('video-file-input');
const videoPreview = document.getElementById('videoPreview');
const videoStopBtn = document.getElementById('video-stop-btn');

const camWrapper = document.getElementById('cam-wrapper');
const camPreview = document.getElementById('camPreview');
const camStartBtn = document.getElementById('camStartBtn');
const camStopBtn = document.getElementById('camStopBtn');
const camPredictBtn = document.getElementById('camPredictBtn');
const camResultText = document.getElementById('camResultText');

// Globals
let mediaRecorder;
let audioChunks = [];
let camStream = null;

// --- MAIN CARDS CLICK HANDLERS ---

textCard.addEventListener('click', () => {
  hide(mainGrid);
  hide(voiceOptions);
  hide(videoOptions);
  show(textEmotionArea);
  textEmotionResult.textContent = '';
  textInput.value = '';
});

voiceCard.addEventListener('click', () => {
  hide(mainGrid);
  hide(textEmotionArea);
  hide(videoOptions);
  show(voiceOptions);
});

videoCard.addEventListener('click', () => {
  hide(mainGrid);
  hide(textEmotionArea);
  hide(voiceOptions);
  show(videoOptions);
});

// --- TEXT EMOTION DETECTION ---

detectTextBtn.addEventListener('click', async () => {
  const text = textInput.value.trim();
  if (!text) {
    alert('Please enter some text to detect emotion.');
    return;
  }

  textEmotionResult.textContent = 'Detecting emotion...';

  try {
    // wait one second to simulate processing latency
    await new Promise(res => setTimeout(res, 1000));

    // perform the request
    const response = await fetch('/predict-text-emotion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });

    if (!response.ok) {
      throw new Error('Failed to get response from the server.');
    }
   
    const data   = await response.json();
    console.log(data)
    const result = Array.isArray(data.result) ? data.result[0] : data.result || data;

    if (result) {

      textEmotionResult.textContent =
        `Predicted Emotion: ${result.label}`;
    } else {
      textEmotionResult.textContent = '❌ Unexpected response structure.';
    }
  } catch (err) {
    textEmotionResult.textContent = `❌ ${err.message}`;
  } finally {
    // hide the emotion area after 5 s and show the main grid again
    setTimeout(() => {
      hide(textEmotionArea);
      show(mainGrid);
    }, 5000);
  }
});

// --- VOICE OPTIONS ---

uploadAudioCard.addEventListener('click', () => {
  hide(voiceOptions);
  show(audioUploadWrapper);
  audioResultText.textContent = '';
  audioFileInput.value = '';
  predictAudioBtn.disabled = true;
});

micCard.addEventListener('click', () => {
  hide(voiceOptions);
  show(micWrapper);
  micResultText.textContent = '';
  micPlayback.style.display = 'none';
  predictMicBtn.disabled = true;
  stopRecBtn.disabled = true;
  startRecBtn.disabled = false;
});

// AUDIO UPLOAD PANEL
// const fileInput = document.getElementById('audio-file-input');
const audioPlayer = document.getElementById('audio-player');
// enable / disable the predict button when a file is chosen
audioFileInput.addEventListener('change', () => {
    const file = audioFileInput.files[0];
    if (file) {
      // Show audio preview
      const audioURL = URL.createObjectURL(file);
      audioPlayer.src = audioURL;
      audioPlayer.style.display = 'block';
  
      // Enable predict button
      predictAudioBtn.disabled = false;
      audioResultText.textContent = '';
    } else {
      audioPlayer.style.display = 'none';
      predictAudioBtn.disabled = true;
      audioResultText.textContent = '';
    }
  });
predictAudioBtn.addEventListener('click', async () => {
  // guard-rail: no file
  if (audioFileInput.files.length === 0) return;

  const file = audioFileInput.files[0];      // <-- define the file
  predictAudioBtn.disabled = true;
  audioResultText.textContent = 'Predicting emotion…';

  try {
    // (optional) 1-second “thinking” pause
    await new Promise(res => setTimeout(res, 1000));

    const formData = new FormData();
    formData.append('audio', file, file.name || 'audio.wav');

    const response = await fetch('/upload-audio', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    audioResultText.textContent =
      `Predicted Emotion: ${data.predicted_emotion}`;
  } catch (err) {
    console.error(err);
    audioResultText.textContent = `❌ ${err.message}`;
  } finally {
    // after 5 s, reset UI
    setTimeout(() => {
      hide(audioUploadWrapper);
      show(mainGrid);
      predictAudioBtn.disabled = true;
      audioFileInput.value = '';
      audioResultText.textContent = '';
    }, 5000);
  }
});

// MIC RECORDING PANEL

// ---------- module-level (or global) vars ----------

let audioBlob        = null;
let audioURL         = null;
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// ---------- recorder UI ----------
startRecBtn.addEventListener('click', async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    mediaRecorder = new MediaRecorder(stream);
    audioChunks   = [];                         // reset each time

    // collect data while recording
    mediaRecorder.ondataavailable = e => audioChunks.push(e.data);

    // when the recording stops, create the Blob + preview URL
    mediaRecorder.onstop = () => {
      audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      audioURL  = URL.createObjectURL(audioBlob);

      micPlayback.src      = audioURL;
      micPlayback.style.display = 'block';
    //   uploadButton.disabled  = false;
      predictMicBtn.disabled = false;
      micResultText.textContent = 'Recording complete.';
    };

    mediaRecorder.start();

    // UI updates while recording
    startRecBtn.disabled  = true;
    stopRecBtn.disabled   = false;
    predictMicBtn.disabled = true;
    // uploadButton.disabled  = true;
    micResultText.textContent = 'Recording…';
    micPlayback.style.display = 'none';

  } catch (err) {
    alert('Microphone access denied or error: ' + err.message);
  }
});

// ---------- stop button ----------
stopRecBtn.addEventListener('click', () => {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
    startRecBtn.disabled = false;
    stopRecBtn.disabled  = true;
    predictMicBtn.disabled = false;
  }
});

/* assumes:                                                 *
 *   – audioBlob already holds the recorded audio (WAV/WebM) *
 *   – convertToMP3() is available (same helper you posted)  */
async function convertToMP3(wavBlob) {
  const arrayBuffer = await wavBlob.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  const sampleRate = audioBuffer.sampleRate;
  const channelData = audioBuffer.getChannelData(0);

  const samples = floatTo16BitPCM(channelData);
  const mp3Encoder = new lamejs.Mp3Encoder(1, sampleRate, 128);
  const mp3Data = [];
  let blockSize = 1152;
  for (let i = 0; i < samples.length; i += blockSize) {
      let sampleChunk = samples.subarray(i, i + blockSize);
      let mp3buf = mp3Encoder.encodeBuffer(sampleChunk);
      if (mp3buf.length > 0) {
          mp3Data.push(mp3buf);
      }
  }

  const finalBuffer = mp3Encoder.flush();
  if (finalBuffer.length > 0) {
      mp3Data.push(finalBuffer);
  }

  return new Blob(mp3Data, { type: 'audio/mp3' });
}

function floatTo16BitPCM(floatSamples) {
  let output = new Int16Array(floatSamples.length);
  for (let i = 0; i < floatSamples.length; i++) {
      let s = Math.max(-1, Math.min(1, floatSamples[i]));
      output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  return output;
}

predictMicBtn.addEventListener('click', async () => {
  // guard-rail: nothing recorded yet
  if (!audioBlob) {
    alert('No audio recorded — please record first.');
    return;
  }

  predictMicBtn.disabled   = true;
  micResultText.textContent = 'Predicting emotion...';

  try {
    // (optional) 1-s “thinking” pause so UI feels consistent
    await new Promise(res => setTimeout(res, 1000));

    /* ------------ 1. convert the blob to MP3 ------------- */
    const mp3Blob = await convertToMP3(audioBlob);

    /* ------------ 2. build FormData ---------------------- */
    const formData = new FormData();
    formData.append('audio', mp3Blob, 'audio.mp3');

    /* ------------ 3. POST to backend --------------------- */
    const response = await fetch('/upload-audio', {   // ← your API endpoint
      method: 'POST',
      body:   formData
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status} ${response.statusText}`);
    }

    const { predicted_emotion} = await response.json();

    /* ------------ 4. show result ------------------------- */
    micResultText.textContent =
      `Predicted Emotion: ${predicted_emotion} `;

  } catch (err) {
    console.error(err);
    micResultText.textContent = `❌ ${err.message}`;
  } finally {
    /* ------------ 5. after 5 s, reset UI ---------------- */
    setTimeout(() => {
      if (micPlayback) {
        micPlayback.pause();
        micPlayback.src = '';
        micPlayback.style.display = 'none';
      }
      micResultText.textContent = '';
      hide(micWrapper);
      show(mainGrid);
    }, 5000);
  }
});

const uploadVidBtn = document.getElementById('upload-video-btn');
// --- VIDEO OPTIONS ---
//let isStreaming = false;

uploadVideoCard.addEventListener('click', () => {
    hide(mainGrid);
    hide(videoOptions);
    show(uploadVideoPanel);
  
    videoFileInput.value = '';
    // videoPreview.pause();
    videoPreview.src = '';
    videoPreview.classList.add('hidden');
    videoStopBtn.disabled = true;
   // isStreaming = false; 
  });
  
  let isStreaming = false;

  function startStreaming() {
    if (isStreaming) return;  // prevent multiple streams
    isStreaming = true;
  
    videoPreview.style.display = 'block';
    videoPreview.src = "/video-stream?time=" + new Date().getTime();
    videoPreview.classList.remove('hidden');
    videoStopBtn.disabled = false;
  
    videoPreview.onerror = () => {
      if (!isStreaming) {
        // This error happened after stop, ignore silently
        return;
      }
      alert('Error loading video stream.');
      videoPreview.style.display = 'none';
      videoStopBtn.disabled = true;
      isStreaming = false;
    };
  }
  
  uploadVidBtn.addEventListener('click', async () => {
    if (videoFileInput.files.length === 0) {
      alert('Please select a video file first.');
      return;
    }
  
    const file = videoFileInput.files[0];
    if (!file.type.startsWith('video/')) {
      alert('Please select a valid video file.');
      return;
    }
  
    uploadVidBtn.disabled = true;
  
    const formData = new FormData();
    formData.append('file', file, file.name);
  
    try {
      const response = await fetch('/upload-video', {
        method: 'POST',
        body: formData,
      });
  
      const resultText = await response.text();
      alert(resultText);
  
      if (!response.ok) throw new Error(resultText || 'Upload failed');
  
      startStreaming(); // start stream only when upload is successful
  
    } catch (err) {
      alert('Upload error: ' + err.message);
    } finally {
      uploadVidBtn.disabled = false;
      videoFileInput.value = ''; // reset input
    }
  });
  
  videoStopBtn.addEventListener('click', async () => {
    try {
      let response = await fetch("/stop-video", { method: "POST" });
      let result = await response.text();
      console.log("Stop response:", result);
  
      isStreaming = false;  // stop flag before clearing source
  
      videoPreview.style.display = "none";
      videoPreview.src = "";  // clear source to stop request for frames
      videoPreview.classList.add('hidden');
  
      videoFileInput.value = '';
      videoStopBtn.disabled = true;
  
      hide(uploadVideoPanel);
      show(mainGrid);
    } catch (error) {
      console.error("Error stopping video:", error);
      alert("Failed to stop the video properly.");
    }
  });
  










// --- LIVE CAMERA ---







recordVideoCard.addEventListener('click', () => {
  hide(mainGrid);
  hide(videoOptions);
  show(camWrapper);

  camStartBtn.disabled = false;
  camStopBtn.disabled = true;

  camPreview.srcObject = null;
});
//const camPreview = document.getElementById("camPreview");
const errorMessage = document.getElementById("errorMessage");
camStartBtn.addEventListener('click', async () => {
  try {
    camStartBtn.disabled = true;
    camStopBtn.disabled = false;
    errorMessage.innerHTML = "";

    let clearResponse = await fetch("/clear-uploaded-video", { method: "POST" });
    if (!clearResponse.ok) throw new Error("Failed to clear uploaded video");

    let startResponse = await fetch("/start-video-live", { method: "POST" });
    if (!startResponse.ok) throw new Error("Failed to start video live stream");

    camPreview.style.display = "block";
    camPreview.src = `/video-stream-live?time=${Date.now()}`;
  } catch (error) {
    console.error("Error while starting the camera:", error);
    errorMessage.innerHTML = `<p style="color: red;">${error.message}</p>`;
    camStartBtn.disabled = false;
    camStopBtn.disabled = true;
  }
});

camStopBtn.addEventListener('click', async () => {
  try {
    const response = await fetch("/stop-video-live", { method: "POST" });
    const result = await response.text();
    console.log(result);

    camPreview.src = "";
    camPreview.style.display = "none";

    hide(camWrapper);
    show(mainGrid);

    camStartBtn.disabled = false;
    camStopBtn.disabled = true;

  } catch (error) {
    console.error("Error stopping video live:", error);
    alert("Failed to stop video live stream.");
  }
});
