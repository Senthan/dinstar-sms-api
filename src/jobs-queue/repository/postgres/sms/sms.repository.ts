import { ISmsRepository } from "../../sms";
import * as request from "request";
import * as events from "events";
import * as InfiniteLoop from "infinite-loop";

export class SmsRepository implements ISmsRepository {
    host: any; username: any; password: any; url: any; outgoingSms: any; outgoingResultLoop: any;
    incomingSmsLoop: any; SEND_SMS: any; QUERY_SMS_RESULT: any; QUERY_INCOMING_SMS: any;
    
    constructor(host, username, password) {
        var self = this;
        var EventEmitter =events.EventEmitter;
        self.host = host;
        self.username = username;
        self.password = password;
        self.url = 'http://' + username + ':' + password + '@' + host;
        this.SEND_SMS = '/api/send_sms';
        this.QUERY_SMS_RESULT = '/api/query_sms_result';
        this.QUERY_INCOMING_SMS = '/api/query_incoming_sms';
        self.outgoingSms = [];
    
        self.outgoingResultLoop = new InfiniteLoop();
        self.outgoingResultLoop.add(self.queryOutgoingSmsResult, undefined, self).setInterval(5000).onError(function (error) { console.log(error) });
    
        self.incomingSmsLoop = new InfiniteLoop();
        self.incomingSmsLoop.add(self.queryIncomingSms, self).setInterval(5000).onError(function (error) { console.log(error) });
    
        EventEmitter.call(this);
    }

    async addToOutgoing(messageId, addToFront = null) {
        var self = this;
        if (addToFront) {
            self.outgoingSms.unshift(messageId);
        } else {
            self.outgoingSms.push(messageId);
        }
    };
    
    async sendSms(number, message, messageId, sendToSim, encoding) {
        var self = this;
    
        var options = {
            url: self.url + this.SEND_SMS,
            method: 'POST',
            json: true,
            body: {
                text: message,
                encoding: encoding || "gsm-7bit",
                param: [
                    {
                        number: number,
                        user_id: messageId
                    }
                ],
                port: []
            }
        };
    
        if (sendToSim !== undefined && sendToSim !== false) {
            if (typeof sendToSim === 'string') {
                options.body.port = sendToSim.split(',');
                for(var i = 0; i < options.body.port.length; i++) {
                    options.body.port[i] = parseInt(options.body.port[i]);
                }
            } else {
                options.body.port = [ sendToSim ];
            }
        }
    
        request(options, function (error, response, body) {
            if (!error && response.statusCode === 200) {
    
                body.messageId = messageId;
                // self.emit('message', body);
    
                if (body.error_code === 202) {
    
                    // self.emit('sms_proceeding', body);
    
                    setTimeout(function () {
                        self.addToOutgoing(messageId);
                    }, 5000);
                }
            }
        });
    
        return true;
    };

    async registerForOutgoingSmsResult() {
        this.outgoingResultLoop.run();
    };
    
    async unregisterForOutgoingSmsResult() {
        this.outgoingResultLoop.stop();
    };
    
    async registerForIncomingSms() {
        this.incomingSmsLoop.run();
    };
    
    async unregisterForIncomingSms() {
        this.incomingSmsLoop.stop();
    };
    
    async queryOutgoingSmsResult(messageId, that) {
        var self = that || this;
    
        var messageIds = messageId ? [messageId] : self.outgoingSms.splice(0, 32);
    
        if (messageIds.length > 0) {
            var options = {
                url: self.url + this.QUERY_SMS_RESULT,
                method: 'POST',
                json: true,
                body: {
                    user_id: messageIds
                }
            };
    
            request(options, function (error, response, body) {
    
                if (!error && response.statusCode === 200) {
    
                    self.emit('message', body);
    
                    if (body.error_code === 200) {
    
                        for (var i = 0; i < body.result.length; i++) {
    
                            var result = body.result[i];
    
                            result.messageId = result.user_id;
    
                            if (result.status === 'FAILED') {
                                self.emit('sms_error', result);
                            }
    
                            if (result.status === 'SENT_OK' || result.status === 'DELIVERED') {
                                self.emit('sms_ok', result);
                            }
    
                            if (result.status !== 'SENDING') {
                                var index = messageIds.indexOf(result.messageId);
                                if (index > -1) {
                                    messageIds.splice(index, 1);
                                }
                            }
                        }
                    }
                }
    
                for (var i = 0; i < messageIds.length; i++) {
                    self.addToOutgoing(messageIds[i]);
                }
            });
        }
    
    };
    
    async queryIncomingSms(that) {
        var self = that || this;
    
        var options = {
            url: self.url + this.QUERY_INCOMING_SMS,
            method: 'POST',
            json: true,
            body: {
                flag: 'unread'
            }
        };
    
        request(options, function (error, response, body) {
            if (!error && response.statusCode === 200) {
    
                self.emit('message', body);
    
                if (body.error_code === 200) {
    
                    for (var i = 0; i < body.sms.length; i++) {
    
                        var sms = body.sms[i];
    
                        self.emit('cdr_in', sms);
                    }
                }
            }
        });
    };

}