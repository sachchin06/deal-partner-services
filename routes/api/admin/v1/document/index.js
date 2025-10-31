"use strict";
const moment = require("moment");

module.exports = async function (fastify, opts) {
  //BOC:[upload]
  fastify.post(
    "/upload",
    {
      preHandler: fastify.upload.single("document"),
      schema: {
        tags: ["Other"],
        //  consumes: ["multipart/form-data"],
        query: {
          type: "object",
          properties: {
            model_name: {
              type: "string",
              default: "staffs",
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        console.log(request.file);
        var res = {};
        res.document_url = request.file.location;
        reply.send(res);
      } catch (error) {
        reply.send(error);
      } finally {
        await fastify.prisma.$disconnect();
      }
    }
  );
  //EOC
};
