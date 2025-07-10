const { HfInference } = require('@huggingface/inference');
const { extractiveSummarize, extractKeywords } = require('./textProcessing');

let inference;

function initializeLLM() {
  if (!process.env.HUGGINGFACE_API_KEY) {
    throw new Error('HUGGINGFACE_API_KEY is not set in the environment variables');
  }
  inference = new HfInference(process.env.HUGGINGFACE_API_KEY);
}

async function ensureInitialized() {
  if (!inference) {
    initializeLLM();
  }
}

async function generateText(prompt, language = 'en', enrichmentDepth = 'medium') {
  await ensureInitialized();
  try {
    let model = 'mistralai/Mistral-7B-Instruct-v0.2';
    let maxTokens = 150;

    // Adjust model and parameters based on language and enrichment 
    if (language !== 'en') {
      model = 'facebook/mbart-large-50-many-to-many-mmt'; 
    }

    switch (enrichmentDepth) {
      case 'low':
        maxTokens = 100;
        break;
      case 'high':
        maxTokens = 200;
        break;
      default:
        maxTokens = 150;
    }

    const result = await inference.textGeneration({
      model: model,
      inputs: prompt,
      parameters: {
        max_new_tokens: maxTokens,
        temperature: 0.7,
        top_p: 0.95,
        do_sample: true,
      },
    });
    return result.generated_text;
  } catch (error) {
    console.error('Error in text generation, using keyword extraction fallback:', error);
    const keywords = extractKeywords(prompt);
    return `Key topics: ${keywords.join(', ')}`;
  }
}

async function summarizeText(text, language = 'en', enrichmentDepth = 'medium') {
  await ensureInitialized();
  try {
    let model = 'facebook/bart-large-cnn';
    let maxLength = 150;
    let minLength = 40;

    // Adjust model and parameters based on language and enrichment depth
    if (language !== 'en') {
      model = 'facebook/mbart-large-50-many-to-many-mmt'; // Multilingual model
    }

    switch (enrichmentDepth) {
      case 'low':
        maxLength = 100;
        minLength = 30;
        break;
      case 'high':
        maxLength = 200;
        minLength = 50;
        break;
      default:
        maxLength = 150;
        minLength = 40;
    }

    const chunks = text.match(/[\s\S]{1,3600}/g) || [];
    let summaries = [];

    for (let chunk of chunks) {
      try {
        const summary = await inference.summarization({
          model: model,
          inputs: chunk,
          parameters: {
            max_length: maxLength,
            min_length: minLength,
            do_sample: false,
          },
        });
        summaries.push(summary.summary_text);
      } catch (error) {
        console.error('Error in chunk summarization, using extractive fallback:', error);
        summaries.push(extractiveSummarize(chunk));
      }
    }

    if (summaries.length === 1) {
      return summaries[0];
    }

    const combinedSummary = summaries.join(' ');
    try {
      const finalSummary = await inference.summarization({
        model: model,
        inputs: combinedSummary,
        parameters: {
          max_length: maxLength,
          min_length: minLength,
          do_sample: false,
        },
      });
      return finalSummary.summary_text;
    } catch (error) {
      console.error('Error in final summarization, using extractive fallback:', error);
      return extractiveSummarize(combinedSummary);
    }
  } catch (error) {
    console.error('Error in summarization, using extractive fallback:', error);
    return extractiveSummarize(text);
  }
}

module.exports = { initializeLLM, generateText, summarizeText };