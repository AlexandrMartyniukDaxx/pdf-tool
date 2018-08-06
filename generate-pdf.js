const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
var rimraf = require('rimraf');

function saveHtmlFile(text) {
  return new Promise((resolve, reject) => {
    const fileName = generateFileName() + '.html';
    fs.writeFileSync(path.resolve('tmp', fileName), text);
    resolve(fileName);
  });
}

async function openPageAndSavePdf(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  const fileName = generateFileName() + '.pdf';
  await page.pdf({ format: 'A4', path: 'tmp/' + fileName, margin: { left: '1cm', top: '1cm', right: '1cm', bottom: '2cm' } });
  await browser.close();
  return fileName;
}

function cleanup(files) {
  if(files){
    if (Array.isArray(files)) {
      files.forEach(name => {
        fs.unlink(path.resolve('tmp', name), (err) => { if(err) console.log('Failed to delete: ' + name, err)});
      });
    }
  } else {
    const tmp = path.resolve('tmp')
    rimraf(tmp, () => fs.mkdir(tmp));
  }
  
}
 

const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

function generateFileName() {
  const now = new Date().getTime();
  return now + new Array(5).fill(null).map(() => charset.charAt(Math.random() * charset.length - 1)).join('');
}

module.exports = { saveHtmlFile, openPageAndSavePdf, cleanup };
