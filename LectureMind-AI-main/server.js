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

    // Delete the uploaded file after processing
    fs.unlinkSync(filePath);

    res.json({ transcription });
  } catch (error) {
    console.error('Error during transcription:', error);
    res.status(500).json({ error: 'Failed to transcribe audio' });
  }
});

app.listen(port, () => {
  console.log(`Speech-to-text server listening at http://localhost:${port}`);
});
