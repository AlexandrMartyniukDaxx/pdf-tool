import 'bootstrap/dist/css/bootstrap.min.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/lesser-dark.css';
import * as CodeMirror from 'codemirror/lib/codemirror';
import 'codemirror/mode/htmlmixed/htmlmixed';
import 'codemirror/mode/handlebars/handlebars';
import { Renderer } from './../common/renderer';


let delay;
let delayValue = 3000;

let dataValue = null;
let currentMarkup = null;
let currentPdfObject = null;

const renderer = new Renderer('it');
const textarea = document.getElementById('code');
const previewFrame = document.getElementById('preview');
const downloadPdf = document.getElementById('pdf-download');
const previewPdf = document.getElementById('pdf-preview');
const templateUpload = document.getElementById('template-upload');
const dataUpload = document.getElementById('data-upload');
const saveTemplate = document.getElementById('save-template');
const saveData = document.getElementById('save-data');
const download = document.getElementById('download');

const editor = CodeMirror.fromTextArea(textarea, {
    mode: { name: 'handlebars', base: 'text/html' },
    matchBrackets: true,
    autoCloseTags: true,
    lineNumbers: true,
    theme: 'lesser-dark'
});
editor.on('change', function () {
    clearTimeout(delay);
    delay = setTimeout(updatePreview, delayValue);
});

const data = CodeMirror.fromTextArea(document.getElementById('data'), {
    mode: 'application/json',
    lineNumbers: true,
    theme: 'lesser-dark'
});
data.on('change', function () {
    const value = data.getValue();
    try {
        dataValue = JSON.parse(value);
        clearTimeout(delay);
        delay = setTimeout(updatePreview, delayValue);
    } catch (e) {
        dataValue = null;
    }
});

function updatePreview() {
    var preview = previewFrame.contentDocument || previewFrame.contentWindow.document;
    currentMarkup = renderer.render(editor.getValue(), dataValue);
    preview.open();
    preview.write(currentMarkup);
    preview.close();
}

previewFrame.addEventListener('load', function (event) {
    this.style.height = this.contentWindow.document.body.offsetHeight + 'px';
});

function getPdf() {
    fetch('/pdf', {
        method: 'POST',
        body: currentMarkup
    }).then(res => res.blob())
        .then((blob) => {
            showPdf(blob);
        });
}

function showPdf(blob) {
    if (currentPdfObject) {
        window.URL.revokeObjectURL(currentPdfObject);
    }
    currentPdfObject = window.URL.createObjectURL(blob);
    downloadPdf.innerHTML = 'Download';
    downloadPdf.href = currentPdfObject;
    downloadPdf.download = 'file.pdf';
    previewPdf.src = currentPdfObject + '#view=fit&toolbar=0&navpanes=0';
    previewPdf.scrollIntoView(true);
}

document.getElementById('get-pdf').addEventListener('click', getPdf);
const uri = '/assets/consumes/gas/';

function fetchData() {
    Promise.all([
        fetch(uri + 'data.json').then(res => res.text()),
        fetch(uri + 'template.handlebars').then(res => res.text())
    ]).then(res => {
        editor.setValue(res[1]);
        data.setValue(res[0]);
    })
}

fetchData();

templateUpload.addEventListener('change', uploadTemplate);
dataUpload.addEventListener('change', uploadData)

function uploadTemplate() {
    const file = this.files[0];
    const reader = new FileReader();

    reader.addEventListener('load', (e) => {
        editor.setValue(e.target.result);
    })

    reader.readAsText(file);
}

function uploadData() {
    const file = this.files[0];
    const reader = new FileReader();

    reader.addEventListener('load', (e) => {
        data.setValue(e.target.result);
    })

    reader.readAsText(file);
}

function downloadTemplate() {
    const value = editor.getValue();
    const filename = uploadTemplate.files && uploadTemplate.files[0].name || 'new-template.handlebars';
    initDownload(value, filename);
}

function downloadData() {
    const value = data.getValue();
    const filename = dataUpload.files && dataUpload.files[0].name || 'data.handlebars.json';
    initDownload(value, filename);
}

function initDownload(text, filename) {
    const obj = URL.createObjectURL(new Blob([text]));
    download.href = obj;
    download.download = filename;
    download.click();
}

function uploadTemplate() {
    const value = editor.getValue();
    fetch(uri + 'template.handlebars', { method: 'POST', body: value })
        .then(() => { });
}

saveTemplate.addEventListener('click', uploadTemplate);
saveData.addEventListener('click', downloadData);