'use strict';
var templateService = require('../template.service.js'),
    nodemailer = require('nodemailer');

class NodemailerProvider {
    constructor(config) {
        this.name = "nodemailer";
        this.config = config;
    }

    send(template, mailSettings, templateData) {

        let from = typeof mailSettings.from !== 'undefined' ? mailSettings.from : template.from;

        return templateService.getHtml(template, templateData).then((stringHtml) => {

            let nodemailer_transport = nodemailer.createTransport(this.config);

            // prepare options object
            var transportOptions = {
                from: `${from.name} <${from.email}>`, // Do not change - must be verified email address of startapp.com
                to: mailSettings.to,
                sender: mailSettings.sender || template.sender,
                replyTo: mailSettings.replyTo || template.replyTo,
                subject: templateService.getHtmlSubject(mailSettings.subject || template.subject, templateData),
                html: stringHtml
            };

            // send email
            return nodemailer_transport.sendMail(transportOptions);

        }).then((responses) => {

            let results = [];

            responses.accepted.forEach((accepted) => {
                results.push({
                    status: 'sent',
                    email: accepted
                });
            });

            responses.rejected.forEach((rejected) => {
                results.push({
                    status: 'rejected',
                    email: rejected
                });
            });

            return results;
        });
    }
}

module.exports = NodemailerProvider;
