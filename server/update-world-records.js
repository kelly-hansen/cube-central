const cheerio = require('cheerio');
const fetch = require('node-fetch');

fetch('https://www.worldcubeassociation.org/results/records')
  .then(res => res.text())
  .then(body => {
    const $ = cheerio.load(body);
    const puzzle = $('#results-list a:first').text();
    const trimmedPuzzle = puzzle.trim();
    console.log(trimmedPuzzle);
  });
