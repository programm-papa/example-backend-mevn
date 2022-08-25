const { GoogleSpreadsheet } = require('google-spreadsheet');
const creds = require('../../config/mart-table-207414b64c74.json');

const doc = new GoogleSpreadsheet('1Do3nX7TaL94nKo1O2R4p23knUqX7LISxxLhyNKjkQgs');
async function connectDoc() {
    await doc.useServiceAccountAuth(creds);
}
connectDoc();
module.exports = doc;