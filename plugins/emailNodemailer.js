const fp = require("fastify-plugin");
const nodemailer = require("nodemailer");

module.exports = fp(async function (fastify, opts){
    const testAccount = await nodemailer.createTestAccount();
    devTransport = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass
        }
    })

    const emailViaNodemailer = {
        send: async (currentFastify, params) => {
            try {
                if(!params || !params.email){
                    throw new Error("Missing params.email");
                }

                const info = await devTransport.sendMail({
                  from:
                    params.from ||
                    fastify.config.RESEND_FROM_EMAIL ||
                    "dev@example.com",
                  to: params.email,
                  subject: params.subject,
                  text: params.message,
                //   html: params.html || undefined,
                });
                
                const preview = nodemailer.getTestMessageUrl(info);
                // log preview URL
                fastify.log.info("Email sent (dev). Preview URL: %s", preview);
                return { message: "Email sent (dev)", info, preview };

            } catch (error) {
                currentFastify?.log?.error?.(error);
                return { message: error.message || error };
            }
        },
    };

    fastify.decorate("emailViaNodemailer", emailViaNodemailer);
});