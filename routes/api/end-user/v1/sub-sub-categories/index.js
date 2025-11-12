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
            sub_category_ids: {
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
        const { page, limit, search } = request.query;
        const skip = (page - 1) * limit;

        const category_ids = JSON.parse(request.query.category_ids);
        const sub_category_ids = JSON.parse(request.query.sub_category_ids);

        let where = {
          is_enabled: true,
          deleted_at: null,
          OR: [{ name: { contains: search } }],
        };

        if (category_ids.length > 0) {
          where.category_id = { in: category_ids };
        }

        if (sub_category_ids.length > 0) {
          where.sub_category_id = { in: sub_category_ids };
        }

        const subSubCategories =
          await fastify.prisma.sub_sub_categories.findMany({
            where: where,
            skip: skip,
            take: limit,
          });

        const totalCount = await fastify.prisma.sub_sub_categories.count({
          where: where,
        });

        const allCount = await fastify.prisma.sub_sub_categories.count({
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
          data: subSubCategories,
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
