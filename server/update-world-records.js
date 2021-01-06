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
  const puzzles = puzzleTypes.map((i, el) => {
    return $(el).text().trim();
  }).get();

  const tableBodys = $('tbody', '#results-list');
  const rows = tableBodys.map((i, el) => {
    return [$(el).children('tr').map((i, el) => {
      return [$(el).children('td').map((i, el) => {
        return $(el).text().trim();
      }).get()];
    }).get()];
  }).get();

  const records = [];
  for (let i = 0; i < puzzles.length; i++) {

    records.push({
      puzzle: puzzles[i],
      rows: []
    });

    for (let j = 0; j < rows[i].length; j++) {
      records[i].rows.push({
        type: rows[i][j][0],
        name: rows[i][j][1],
        result: rows[i][j][2]
      });
    }
  }

});
