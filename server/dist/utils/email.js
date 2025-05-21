"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = require("../config");
const logger_1 = require("./logger");
// Create reusable transporter object using SMTP transport
const transporter = nodemailer_1.default.createTransport({
    host: config_1.config.email.host,
    port: config_1.config.email.port,
    secure: config_1.config.email.port === 465, // true for 465, false for other ports
    auth: {
        user: config_1.config.email.user,
        pass: config_1.config.email.pass,
    },
});
const sendEmail = async (options) => {
    try {
        // Send mail with defined transport object
        const info = await transporter.sendMail({
            from: config_1.config.email.from,
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html,
        });
        logger_1.logger.info('Email sent:', info.messageId);
    }
    catch (error) {
        logger_1.logger.error('Error sending email:', error);
        throw error;
    }
};
exports.sendEmail = sendEmail;
//# sourceMappingURL=email.js.map