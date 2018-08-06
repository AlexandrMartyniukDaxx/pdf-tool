const Handlebars = require('handlebars/dist/handlebars');
import { Formatters } from './formatters';

export class Renderer {
    constructor(locale) {
        this.formatter = new Formatters(locale);
        Handlebars.registerHelper('number', this.formatter.decimal.bind(this.formatter));
        Handlebars.registerHelper('date', this.formatter.date.bind(this.formatter));
        Handlebars.registerHelper('boolean', this.formatter.boolean.bind(this.formatter));
    }

    render(template, value) {
        return Handlebars.compile(template)(value);
    }
}
 