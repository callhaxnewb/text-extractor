// backend/test-llm.js
require('dotenv').config();
const { initializeLLM, generateText, summarizeText } = require('./llm');

async function testLLM() {
  console.log('Initializing LLM...');
  initializeLLM();

  try {
    console.log('Testing text generation...');
    const generatedText = await generateText('Generate a short poem about coding with the following structure: 4 lines, with rhyming second and fourth lines.');
    console.log('Generated Text:', generatedText);

    console.log('\nTesting text summarization...');
    const textToSummarize = `
      The Internet of Things (IoT) is a system of interrelated computing devices, 
      mechanical and digital machines, objects, animals or people that are provided 
      with unique identifiers and the ability to transfer data over a network without 
      requiring human-to-human or human-to-computer interaction.
    `;
    const summary = await summarizeText(textToSummarize);
    console.log('Summary:', summary);
  } catch (error) {
    console.error('An error occurred:', error.message);
    if (error.response) {
      console.error('Error details:', error.response.data);
    }
  }
}

testLLM();