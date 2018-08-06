var moment = require('moment');
import 'moment/min/moment-with-locales';
import 'moment/locale/it';

export class Formatters {
    constructor(locale) {
        this.locale = locale;
        moment().locale(locale);
    }

    boolean(value, trueVal, falseVal) {
        return value ? trueVal : falseVal;
    }

    decimal(value, format) {
        if(typeof value != 'number'){
            console.log('Bad number:', value);
            return '';
        }
        const sections = format && format.split('-');
        const options = {};
        if (sections) {
            sections[0] = sections[0].split('.')[1];
            options.minimumFractionDigits = Number(sections[0]);
            options.maximumFractionDigits = Number(sections[1] || sections[0]);
        }
        return Intl.NumberFormat(this.locale, options).format(value);
    }

    date(value, format) {
        return moment(value).format(format);
    }
}