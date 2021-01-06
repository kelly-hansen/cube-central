const cheerio = require('cheerio');
const fetch = require('node-fetch');

/*
fetch('https://www.worldcubeassociation.org/results/records')
  .then(res => res.text())
  .then(body => {
    const $ = cheerio.load(body);
    const puzzle = $('#results-list a:first').text();
    const trimmedPuzzle = puzzle.trim();
    console.log(trimmedPuzzle);
  });
*/

const fs = require('fs');

let wcaData;
fs.readFile('./wcadata.html', 'utf8', (err, data) => {
  if (err) throw err;
  wcaData = data;
  const $ = cheerio.load(wcaData);
  const puzzleTypes = $('h2 > a', '#results-list');
  const puzzleTypesArr = puzzleTypes.map((i, el) => {
    return $(el).text().trim();
  }).get();
  console.log(puzzleTypesArr);
});
