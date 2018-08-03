const express = require('express');
const bodyParser = require('body-parser')
const genPdf = require('./generate-pdf');
const path = require('path');
const app = express();

genPdf.cleanup();

const port = 3000;
const textParser = bodyParser.text();

app.use('/', express.static('dist'));
app.use('/tmp', express.static('tmp'));


app.post('/pdf', textParser, async function(req, res) {
    const htmlName = await genPdf.saveHtmlFile(req.body);
    const url = `http://localhost:${port}/tmp/${htmlName}`;
    const pdfName = await genPdf.openPageAndSavePdf(url);
    res.sendFile(path.resolve('tmp', pdfName));
});

app.listen(port, function () {
  console.log('Server is running on port ' + port);
});
