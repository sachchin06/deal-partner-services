"use strict";
const moment = require("moment");

module.exports = async function (fastify, opts) {
  fastify.post(
    "/new",
    {
      schema: {
        tags: ["End User"],
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["name", "email", "subject", "message"],
          properties: {
            name: {
              type: "string",
            },
            email: {
              type: "string",
            },
            phone: {
              type: "string",
            },
            subject: {
              type: "string",
            },
            message: {
              type: "string",
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const item = await fastify.prisma.emails.create({
          data: {
            name: request.body.name,
            email: request.body.email,
            phone: request.body.phone,
            subject: request.body.subject,
            message: request.body.message,
            created_at: moment().toISOString(),
            modified_at: moment().toISOString(),
          },
        });

        reply.send({
          message: `Email with Id: ${item.id} created successfully`,
        });
      } catch (error) {
        reply.send(error);
      } finally {
        await fastify.prisma.$disconnect();
      }
    }
  );
};
