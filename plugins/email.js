"use strict";

const fp = require("fastify-plugin");
const { Resend } = require("resend");

module.exports = fp(async function (fastify, opts) {
  const resend = new Resend(fastify.config.RESEND_API_KEY);
  // const from = fastify.config.RESEND_FROM_EMAIL;

  const email = {
    send: async (currentFastify, params) => {
      try {
        const response = await resend.emails.send({
          from: "DEALPARTNER@dealpartner.lk",
          to: [params.email],
          subject: params.subject,
          text: params.message,
          // html: params.html || null,
          // attachments: params.attachments || [],
          // headers: params.headers || {},
          // tags: params.tags || [],
        });

        return { message: "Email sent successfully!", response };
      } catch (error) {
        return { message: error };
      }
    },
  };

  fastify.decorate("email", email);
});
