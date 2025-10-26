// testOCR.js
const { ImageAnnotatorClient } = require('@google-cloud/vision');

const client = new ImageAnnotatorClient(); // uses GOOGLE_APPLICATION_CREDENTIALS

async function testOCR() {
  const [result] = await client.textDetection('https://upload.wikimedia.org/wikipedia/commons/a/a9/Example.jpg');
  console.log('Detected text:', result.textAnnotations?.[0]?.description);
}

testOCR();
