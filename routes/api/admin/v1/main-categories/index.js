"use strict";
const moment = require("moment");

module.exports = async function (fastify, opts) {
  fastify.get(
    "/all",
    {
      schema: {
        tags: ["Admin Dashboard"],
        security: [{ bearerAuth: [] }],
        query: {
          type: "object",
          properties: {
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
        // await fastify.token.isAuth(request);

        const page = request.query.page;
        const limit = request.query.limit;
        const search = request.query.search;
        const is_enabled = request.query.is_enabled;
        const skip = (page - 1) * limit;

        var where = {
          deleted_at: null,
          OR: [{ name: { contains: search } }],
        };

        if (is_enabled == 1) {
          where = {
            deleted_at: null,
            is_enabled: true,
            OR: [{ name: { contains: search } }],
          };
        } else if (is_enabled == 0) {
          where = {
            deleted_at: null,
            is_enabled: false,
            OR: [{ name: { contains: search } }],
          };
        }

        const categories = await fastify.prisma.categories.findMany({
          where: where,
          skip: skip,
          take: limit,
        });

        const totalCount = await fastify.prisma.categories.count({
          where: where,
        });

        const allCount = await fastify.prisma.categories.count({
          where: {
            deleted_at: null,
          },
        });

        const totalEnabledCount = await fastify.prisma.categories.count({
          where: {
            ...where,
            is_enabled: true,
          },
        });

        const totalDisabledCount = await fastify.prisma.categories.count({
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

        var res = {};
        res.page = page;
        res.limit = limit;
        res.totalPages = totalPages;
        res.totalCount = totalCount;
        res.count = count;
        res.data = categories;

        reply.send(res);
      } catch (error) {
        reply.send(error);
      } finally {
        await fastify.prisma.$disconnect();
      }
    }
  );
};
