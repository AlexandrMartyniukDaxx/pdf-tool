import 'bootstrap/dist/css/bootstrap.min.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/lesser-dark.css';
import * as CodeMirror from 'codemirror/lib/codemirror';
import 'codemirror/mode/htmlmixed/htmlmixed';
import { fillTemplate } from './template-renderer';

let delay;
let delayValue = 3000;

let dataValue = null;
let currentMarkup = null;
let currentPdfObject = null;


const textarea = document.getElementById('code');
const previewFrame = document.getElementById('preview');
const downloadPdf = document.getElementById('pdf-download');
const previewPdf = document.getElementById('pdf-preview');

const editor = CodeMirror.fromTextArea(textarea, {
    mode: 'text/html',
    theme: 'lesser-dark'
});
editor.on('change', function () {
    clearTimeout(delay);
    delay = setTimeout(updatePreview, delayValue);
});

const data = CodeMirror.fromTextArea(document.getElementById('data'), {
    mode: 'application/json',
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
    preview.open();
    preview.write(editor.getValue());
    preview.close();
    fillTemplate(preview.body, dataValue);
    currentMarkup = preview.body.parentElement.innerHTML;
}

previewFrame.addEventListener('load', function (event) {
    this.style.height = this.contentWindow.document.body.offsetHeight + 'px';
});

setTimeout(updatePreview, delayValue);

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
    downloadPdf.download = "file.pdf";
    previewPdf.src = currentPdfObject + '#view=fit&toolbar=0&navpanes=0';
    previewPdf.scrollIntoView(true);
}

document.getElementById('get-pdf').addEventListener('click', getPdf);