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

fs.readFile('./wcadata.html', 'utf8', (err, data) => {
  if (err) throw err;
  const $ = cheerio.load(data);

  const puzzleTypes = $('h2 > a', '#results-list');
  const puzzleTypesArr = puzzleTypes.map((i, el) => {
    return $(el).text().trim();
  }).get();

  const tableBodys = $('tbody', '#results-list');
  const tablesArr = tableBodys.map((i, el) => {
    return [$(el).children('tr').map((i, el) => {
      return [$(el).children('td').map((i, el) => {
        return $(el).text().trim();
      }).get()];
    }).get()];
  }).get();
  console.log(tablesArr);
});
