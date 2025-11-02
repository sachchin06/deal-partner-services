"use strict";

module.exports = async function (fastify, opts) {
  //BOC:[upload]
  fastify.post(
    "/upload",
    {
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
        const modelName = request.query.model_name || "deal-partner";
        const data = await request.file();

        const uploadResult = await fastify.uploadToS3(data, modelName);

        var res = {};
        res.document_url = uploadResult.data.Location;
        reply.send(res);
      } catch (error) {
        reply.send({ success: false, error: error.message });
      } finally {
        await fastify.prisma.$disconnect();
      }
    }
  );
  //EOC
};
