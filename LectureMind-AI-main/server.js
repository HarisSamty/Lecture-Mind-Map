const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const speech = require('@google-cloud/speech');

const app = express();
const port = 3001;

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Creates a client
const client = new speech.SpeechClient();

// Serve static files from the current directory
app.use(express.static(__dirname));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Enable CORS for all origins (adjust as needed)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});


// Endpoint to receive audio file and transcribe
app.post('/transcribe', upload.single('audio'), async (req, res) => {
  try {
    const filePath = path.join(__dirname, req.file.path);
    const file = fs.readFileSync(filePath);
    const audioBytes = file.toString('base64');

    const audio = {
      content: audioBytes,
    };

    const config = {
      encoding: 'LINEAR16', // Adjust based on your audio format
      sampleRateHertz: 16000, // Adjust based on your audio sample rate
      languageCode: 'en-US',
    };

    const request = {
      audio: audio,
      config: config,
    };

    const [response] = await client.recognize(request);
    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');

    // Clean up the uploaded file
    fs.unlinkSync(filePath);

    res.json({ transcription: transcription });
  } catch (error) {
    console.error('Error during transcription:', error);
    res.status(500).send('Error during transcription');
  }
});

// --- NEW ENDPOINT: Generate Mind Map (Proxy) ---
app.post('/api/generate-mindmap', express.json(), async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    const API_KEY = 'AIzaSyBb3fx68dd4V70szsUN63uoDBWCFr3MqDc';
    const models = [
        'gemini-2.5-flash',
        'gemini-2.5-pro',
        'gemini-2.0-flash',
        'gemini-flash-latest',
        'gemini-pro-latest'
    ];

    let lastError = null;

    for (const model of models) {
        try {
            console.log(`Server attempting model: ${model}`);
            const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;
            
            const response = await fetch(geminiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMsg = errorData.error?.message || response.statusText;
                console.warn(`Model ${model} failed on server: ${errorMsg}`);
                lastError = new Error(errorMsg);
                continue;
            }

            const data = await response.json();
            return res.json(data); // Return successful response immediately

        } catch (error) {
            console.error(`Server error with model ${model}:`, error);
            lastError = error;
        }
    }

    res.status(500).json({ 
        error: 'All models failed', 
        details: lastError ? lastError.message : 'Unknown error' 
    });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
