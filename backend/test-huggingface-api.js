// backend/test-huggingface-api.js
require('dotenv').config();
const { HfInference } = require('@huggingface/inference');

async function testHuggingFaceAPI() {
  const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

  try {
    console.log('Testing text generation...');
    const textGenResult = await hf.textGeneration({
      model: 'gpt2',
      inputs: 'Hello, my name is',
      parameters: { max_new_tokens: 20 }
    });
    console.log('Text generation successful:', textGenResult.generated_text);

    console.log('\nTesting summarization...');
    const summaryResult = await hf.summarization({
      model: 'facebook/bart-large-cnn',
      inputs: 'The tower is 324 metres (1,063 ft) tall, about the same height as an 81-storey building, and the tallest structure in Paris. Its base is square, measuring 125 metres (410 ft) on each side. During its construction, the Eiffel Tower surpassed the Washington Monument to become the tallest man-made structure in the world, a title it held for 41 years until the Chrysler Building in New York City was finished in 1930.',
      parameters: { max_length: 50, min_length: 20 }
    });
    console.log('Summarization successful:', summaryResult.summary_text);

  } catch (error) {
    console.error('Error testing Hugging Face API:', error);
    console.error('Error details:', error.response ? error.response.data : 'No response data');
  }
}

testHuggingFaceAPI();