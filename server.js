const express = require('express');
const bodyParser = require('body-parser')
const genPdf = require('./generate-pdf');
const path = require('path');
const fs = require('fs');
const app = express();

genPdf.cleanup();

const port = 3000;
const textParser = bodyParser.text();

app.use('/', express.static('dist'));
app.use('/assets', express.static('assets'));
app.use('/tmp', express.static('tmp'));


app.post('/pdf', textParser, async function (req, res) {
  const htmlName = await genPdf.saveHtmlFile(req.body);
  const url = `http://localhost:${port}/tmp/${htmlName}`;
  const pdfName = await genPdf.openPageAndSavePdf(url);
  res.sendFile(path.resolve('tmp', pdfName), null, (err) => {
    if(err){
      console.log(err);
      res.sendStatus(500).send('Could not save')
    }
    genPdf.cleanup([htmlName, pdfName]);
  });
});

app.post('/assets/*', textParser, async function (req, res) {
  const _path = req.path.slice(8);
  const body = req.body;

  fs.writeFile(path.resolve('assets', _path), body, (err) => {
    if (err) {
      res.status(500).send('Could not write file');
    } else {
      res.status(200).send('File updated');
    }
  });
});

app.listen(port, function () {
  console.log('Server is running on port ' + port);
});
