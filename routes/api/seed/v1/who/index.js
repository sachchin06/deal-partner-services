"use strict";

const moment = require("moment");
module.exports = async function (fastify, opts) {
  fastify.get(
    "",
    {
      schema: {
        tags: ["Seed"],
      },
    },
    async (request, reply) => {
      try {
        const resp = await fastify.prisma.who.create({
          data: {
            key: "What We Offer",
            value:
              "A wide range of property options, personalized guidance, and expert support in finding the ideal location.",
            created_at: moment().toISOString(),
            modified_at: moment().toISOString(),
          },
        });

        reply.send(resp);
      } catch (error) {
        reply.send(error);
      } finally {
        await fastify.prisma.$disconnect();
      }
    }
  );
};
