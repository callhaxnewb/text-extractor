const natural = require('natural');
const tokenizer = new natural.WordTokenizer();
const stopwords = new Set(natural.stopwords);

function extractiveSummarize(text, sentenceCount = 3) {
  const sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [];
  return sentences.slice(0, sentenceCount).join(' ');
}

function extractKeywords(text, keywordCount = 5) {
  const words = tokenizer.tokenize(text.toLowerCase());
  const wordFreq = words.reduce((freq, word) => {
    if (!stopwords.has(word) && word.length > 2) {
      freq[word] = (freq[word] || 0) + 1;
    }
    return freq;
  }, {});

  return Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, keywordCount)
    .map(([word]) => word);
}

module.exports = { extractiveSummarize, extractKeywords };