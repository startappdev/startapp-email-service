'use strict';

var swig = require('swig'),
    path = require('path');


class EmailTemplateService {
    
    /**
     * Method to get a specific rendered template by name
     * @param template - {Template Object} template from config
     * @param templateData - {Object} options to render with
     * @returns {Promise}
     */
    getHtml(template, templateData) {

        return new Promise((resolve, reject) => {

            // validate exists
            if (!template) {
                return reject(new Error('Template is not defined'));
            }

            // render it
            swig.renderFile(path.resolve(template.path), templateData, function (err, output) {
                if (err) {
                    return reject(err);
                }

                resolve(output);
            });
        });
    }

    getHtmlSubject(template, data) {
        return swig.render(template, {locals: data});
    }
}

module.exports = new EmailTemplateService();