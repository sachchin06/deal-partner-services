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
        const { page, limit, search, is_enabled } = request.query;
        const skip = (page - 1) * limit;

        const category_ids = JSON.parse(request.query.category_ids);
        const sub_category_ids = JSON.parse(request.query.sub_category_ids);

        let where = {
          deleted_at: null,
          OR: [{ name: { contains: search } }],
        };

        if (category_ids.length > 0) {
          where.category_id = { in: category_ids };
        }

        if (sub_category_ids.length > 0) {
          where.sub_category_id = { in: sub_category_ids };
        }

        if (is_enabled === 1) {
          where.is_enabled = true;
        } else if (is_enabled === 0) {
          where.is_enabled = false;
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

        const totalEnabledCount = await fastify.prisma.sub_sub_categories.count(
          {
            where: {
              ...where,
              is_enabled: true,
            },
          }
        );

        const totalDisabledCount =
          await fastify.prisma.sub_sub_categories.count({
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
