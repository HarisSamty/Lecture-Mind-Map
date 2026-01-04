const https = require('https');

const API_KEY = 'AIzaSyBb3fx68dd4V70szsUN63uoDBWCFr3MqDc';
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

https.get(url, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Status Code:', res.statusCode);
    try {
      const parsedData = JSON.parse(data);
      if (parsedData.models) {
        console.log('Available Models:');
        parsedData.models.forEach(m => console.log(`- ${m.name} (${m.supportedGenerationMethods})`));
      } else {
        console.log('Response:', data);
      }
    } catch (e) {
      console.log('Raw Data:', data);
    }
  });

}).on('error', (err) => {
  console.error('Error:', err.message);
});
