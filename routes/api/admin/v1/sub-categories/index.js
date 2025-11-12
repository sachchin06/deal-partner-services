"use strict";
const moment = require("moment");

module.exports = async function (fastify, opts) {
  fastify.get(
    "/getAll",
    {
      schema: {
        tags: ["Admin Dashboard"],
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
            is_enabled: {
              type: "integer",
              default: -1,
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
        const is_enabled = request.query.is_enabled || -1;
        const category_ids = JSON.parse(request.query.category_ids);

        const skip = (page - 1) * limit;

        let where = {
          deleted_at: null,
          OR: [{ name: { contains: search } }],
        };

        if (category_ids.length > 0) {
          where.category_id = { in: category_ids };
        }

        if (is_enabled == 1) {
          where.is_enabled = true;
        } else if (is_enabled == 0) {
          where.is_enabled = false;
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

        const totalEnabledCount = await fastify.prisma.sub_categories.count({
          where: {
            ...where,
            is_enabled: true,
          },
        });

        const totalDisabledCount = await fastify.prisma.sub_categories.count({
          where: {
            ...where,
            is_enabled: false,
          },
        });

        var count = {};
        count.all = allCount;
        count.enabled = totalEnabledCount;
        count.disabled = totalDisabledCount;

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
