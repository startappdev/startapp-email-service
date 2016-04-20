'use strict';

class EmailService {
    constructor(providerName, config) {
        try {
            let providerClass = require(`./providers/${providerName}.provider.js`);
            this.provider =  new providerClass(config[providerName]);
        }
        catch (err) {
            throw new Error(`Error importing provider ${providerName}: ${err.message}`);
        }
    }
    send(template, mailSettings, templateData) {
        return this.provider.send(template, mailSettings, templateData);
    }
}

module.exports = EmailService;