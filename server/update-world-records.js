require('dotenv/config');
const cheerio = require('cheerio');
const fetch = require('node-fetch');
const pg = require('pg');

const db = new pg.Pool({
  connectionString: process.env.DATABASE_URL
});

async function getWRData() {
  try {
    const response = await fetch('https://www.worldcubeassociation.org/results/records');
    const body = await response.text();
    const $ = cheerio.load(body);

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

    const recordsJson = JSON.stringify(records);
    const dateUpdated = 'now()';
    const sql = `
      with "deleted" as (
        delete from "worldRecordsData" *
      )
      insert into "worldRecordsData" ("recordsData", "dateUpdated")
      values ($1, $2);
      `;
    const params = [recordsJson, dateUpdated];
    return db.query(sql, params);
  } catch (err) {
    console.error(err);
  }
}

getWRData();
