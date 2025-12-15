// Audio to Mind Map Converter
class AudioToMindMap {
    constructor() {
        this.audioFile = null;
        this.transcription = '';
        
        this.initializeElements();
        this.setupEventListeners();
    }

    initializeElements() {
        this.uploadArea = document.getElementById('uploadArea');
        this.audioFileInput = document.getElementById('audioFile');
        this.fileInfo = document.getElementById('fileInfo');
        this.fileName = document.getElementById('fileName');
        this.processAudioBtn = document.getElementById('processAudio');
        this.transcriptionText = document.getElementById('transcriptionText');
        this.loadingTranscription = document.getElementById('loadingTranscription');
        this.transcriptionResult = document.getElementById('transcriptionResult');
    }

    setupEventListeners() {
        // File upload
        this.uploadArea.addEventListener('click', () => this.audioFileInput.click());
        this.audioFileInput.addEventListener('change', (e) => this.handleFileSelect(e));

        // Drag and drop
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            this.uploadArea.addEventListener(eventName, (e) => this.preventDefaults(e));
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            this.uploadArea.classList.add('dragover');
        });

        ['dragleave', 'drop'].forEach(eventName => {
            this.uploadArea.classList.remove('dragover');
        });

        this.uploadArea.addEventListener('drop', (e) => this.handleDrop(e));

        // Process button
        this.processAudioBtn.addEventListener('click', () => this.processAudio());

        // Copy and upload new buttons
        document.getElementById('copyText').addEventListener('click', () => this.copyText());
        document.getElementById('uploadNew').addEventListener('click', () => this.resetForm());
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    handleDrop(e) {
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.handleFile(files[0]);
        }
    }

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.handleFile(file);
        }
    }

    handleFile(file) {
        if (file.type.startsWith('audio/')) {
            this.audioFile = file;
            this.fileName.textContent = file.name;
            this.fileInfo.style.display = 'block';
            this.transcriptionResult.style.display = 'none';
        } else {
            alert('Please select a valid audio file.');
        }
    }

    async processAudio() {
        if (!this.audioFile) {
            alert('Please select an audio file first.');
            return;
        }

        this.loadingTranscription.style.display = 'block';
        this.transcriptionResult.style.display = 'none';

        try {
            // Upload audio file to backend server for transcription
            const formData = new FormData();
            formData.append('audio', this.audioFile);

            const response = await fetch('http://localhost:3001/transcribe', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Failed to transcribe audio');
            }

            const data = await response.json();
            this.transcription = data.transcription;

            this.transcriptionText.textContent = this.transcription;
            this.transcriptionResult.style.display = 'block';
            this.loadingTranscription.style.display = 'none';

        } catch (error) {
            console.error('Error transcribing audio:', error);
            alert('Error transcribing audio. Please try again.');
            this.loadingTranscription.style.display = 'none';
        }
    }

    async transcribeAudio(audioFile) {
        // This function is no longer used since transcription is done server-side
        return '';
    }

    copyText() {
        if (!this.transcription) return;
        navigator.clipboard.writeText(this.transcription).then(() => {
            alert('Transcribed text copied to clipboard!');
        });
    }

    resetForm() {
        this.audioFile = null;
        this.transcription = '';
        this.audioFileInput.value = '';
        this.fileInfo.style.display = 'none';
        this.transcriptionResult.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new AudioToMindMap();
});
