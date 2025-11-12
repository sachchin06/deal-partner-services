"use strict";
const moment = require("moment");

module.exports = async function (fastify, opts) {
  fastify.get(
    "",
    {
      schema: {
        tags: ["End User"],
        security: [{ bearerAuth: [] }],
        query: {
          type: "object",
          properties: {
            category_ids: {
              type: "string",
              default: "[]",
            },
            page: {
              type: "integer",
              default: 1,
            },
            limit: {
              type: "integer",
              default: 10,
            },
            search: {
              type: "string",
              default: "",
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        // Authenticate the user
        // await fastify.token.isAuth(request);

        const page = request.query.page || 1;
        const limit = request.query.limit || 10;
        const search = request.query.search || "";
        const category_ids = JSON.parse(request.query.category_ids);

        const skip = (page - 1) * limit;

        let where = {
          is_enabled: true,
          deleted_at: null,
          OR: [{ name: { contains: search } }],
        };

        if (category_ids.length > 0) {
          where.category_id = { in: category_ids };
        }

        const subCategories = await fastify.prisma.sub_categories.findMany({
          where: where,
          skip: skip,
          take: limit,
        });

        const totalCount = await fastify.prisma.sub_categories.count({
          where,
        });

        const allCount = await fastify.prisma.sub_categories.count({
          where: { deleted_at: null },
        });

        var count = {};
        count.all = allCount;
        const totalPages = Math.ceil(totalCount / limit);

        const res = {
          page: page,
          limit: limit,
          totalPages: totalPages,
          totalCount: totalCount,
          count: count,
          data: subCategories,
        };

        reply.send(res);
      } catch (error) {
        reply.send(error);
      } finally {
        await fastify.prisma.$disconnect();
      }
    }
  );
};
