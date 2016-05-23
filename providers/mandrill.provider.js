'use strict';
let templateService = require('../template.service.js'),
    _ = require('lodash'),
    mandrill = require('mandrill-api/mandrill');

class MandrillProvider {
    constructor(config) {
        this.name = "mandrill";
        
        let useTestApi = process.env.NODE_ENV === 'e2e' || process.env.NODE_ENV === 'test';
        let api_key = useTestApi ? config.testApiKey : config.apiKey;
        this.mandrill_client = new mandrill.Mandrill(api_key);
    }

    send(template, mailSettings, templateData) {
        
        return new Promise((resolve, reject) => {
            templateService.getHtml(template, templateData).then((stringHtml) => {
                
                let recipientMetadata = [];

                if (mailSettings.existingUsers) {
                    mailSettings.existingUsers.forEach((user) => {
                        recipientMetadata.push({
                            "rcpt": user.email,
                            "values": {
                                "Recipient_User_ID": user.userId
                            }
                        });
                    });
                }

                // convert 'to' email to array if it isn't
                if (!_.isArray(mailSettings.to)) {
                    mailSettings.to = [mailSettings.to];
                }

                // convert 'to' emails to Mandrill friendly format
                let to_emails = [];
                mailSettings.to.forEach((to) => {
                    to_emails.push({
                        "email": to
                    });
                });

                mailSettings.tags = mailSettings.tags || [];

                let from = typeof mailSettings.from !== 'undefined' ? mailSettings.from : template.from;

                let message = {
                    from_email: from.email,
                    from_name: from.name,
                    to: to_emails,
                    subject: mailSettings.subject || template.subject,
                    html: stringHtml,
                    track_opens: true,
                    track_clicks: true,
                    metadata: {
                        "Template_Name": template.name,
                        "Environment": process.env.NODE_ENV || 'development'
                    },
                    tags: mailSettings.tags,
                    recipient_metadata: recipientMetadata,
                    headers: {},
                    attachments: mailSettings.attachments || []
                };

                if (mailSettings.replyTo) {
                    message.headers["Reply-To"] = mailSettings.replyTo;
                }

                // send email using Mandrill API
                this.mandrill_client.messages.send({"message": message}, (responses) => {

                    let results = responses.map((response) => {
                        let result = {
                            status: response.status,
                            email: response.email,
                        };

                        if(response.reject_reason) {
                            result.reason = response.reject_reason;
                        }

                        return result;
                    });

                    resolve(results);
                }, (err) => {
                    return reject(err);
                });

            }, (err) => {
                return reject(err);
            });
        });
    }
}

module.exports = MandrillProvider;
