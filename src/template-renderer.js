const _ = require('lodash');

const attrMap = {
    forOf: 'for-of',
    forItem: 'for-item',
    dataFor: 'data-for'
};

function fillTemplate(root, data) {
    fillArrays(root, data);
    root.innerHTML = render(root.innerHTML, data);
}

function fillArrays(root, data) {
    const elements = root.querySelectorAll(`[${attrMap.forOf}]`);
    if (!elements || !elements.length) {
        return;
    }

    for (const item of elements) {
        const path = item.getAttribute(attrMap.forOf);
        const val = _.get(data, path);
        if (_.isArray(val) && !_.isEmpty(val)) {
            fillArray(item, val);
        }
    }
}

function fillArray(el, data) {
    const template = el.outerHTML;
    const res = data.map(val => render(template, val));
    el.outerHTML = res.join('');
}

function render(html, scope) {
    const stage1 = html.split('{{');
    let res = stage1[0];
    const stage2 = stage1.slice(1).map(str => {
        const stage3 = str.split('}}');
        if (stage3.length > 1) {
            const tmplVal = stage3[0];
            stage3[0] = resolveDisplayValue(tmplVal, scope);
            return stage3.join('');
        } else {
            return stage3[0];
        }
    });
    res = res + stage2.join('');
    return res;
}

function resolveDisplayValue(templateValue, scope) {
    const splitted = templateValue.split('|');
    let displayValue = _.get(scope, splitted[0], '');
    if (splitted.length === 1) {
        return displayValue;
    }
    for (const pipe of splitted.slice(1)) {
        const [name, ...args] = pipe.split(':').map((str) => str.trim());
        displayValue = transformValue(displayValue, name, args);
    }
    return displayValue;
}

function transformValue(value, name, args) {
    switch (name) {
        case 'number':
        return value;
            // return this.numberPipe.transform.call(this.numberPipe, value, ...args);
        case 'date':
        return value;
            // return this.datePipe.transform.call(this.datePipe, value, ...args);
        case 'boolean':
            const values = [args[0] || 'True', args[1] || 'False'];
            return value ? values[0] : values[1];
        default:
            return value;
    }
}

module.exports = { fillTemplate };