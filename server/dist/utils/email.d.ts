interface EmailOptions {
    to: string;
    subject: string;
    text: string;
    html?: string;
}
export declare const sendEmail: (options: EmailOptions) => Promise<void>;
export {};
