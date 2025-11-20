"use strict";
const moment = require("moment");
const _ = require("lodash");

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
        // await fastify.token.isAuth(request);

        const page = request.query.page;
        const limit = request.query.limit;
        const search = request.query.search;
        const skip = (page - 1) * limit;

        var where = {
          deleted_at: null,
          is_approved: true,
          OR: [
            { name: { contains: search } },
            { review: { contains: search } },
          ],
        };

        const items = await fastify.prisma.reviews.findMany({
          where: where,
          skip: skip,
          take: limit,
          select: {
            id: true,
            review: true,
            rating: true,
            name: true,
            email: true,
            is_approved: true,
            created_at: true,
          },
        });
        const totalCount = await fastify.prisma.reviews.count({
          where: where,
        });
        const allCount = await fastify.prisma.reviews.count({
          where: {
            deleted_at: null,
          },
        });

        const totalPages = Math.ceil(totalCount / limit);

        var res = {};
        res.page = page;
        res.limit = limit;
        res.totalPages = totalPages;
        res.totalCount = totalCount;
        res.allCount = allCount;
        res.data = items;
        reply.send(res);
      } catch (error) {
        reply.send(error);
      } finally {
        await fastify.prisma.$disconnect();
      }
    }
  );

  fastify.post(
    "/new",
    {
      schema: {
        tags: ["End User"],
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["review", "email"],
          properties: {
            review: {
              type: "string",
            },
            rating: {
              type: "number",
            },
            email: {
              type: "string",
            },
            name: {
              type: "string",
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        // await fastify.token.isAuth(request);

        const item = await fastify.prisma.reviews.create({
          data: {
            review: request.body.review,
            rating: request.body.rating,
            name: request.body.name,
            email: request.body.email,
            created_at: moment().toISOString(),
            modified_at: moment().toISOString(),
          },
        });

        reply.send({
          message: `Review with Id: ${item.id} created successfully`,
        });
      } catch (error) {
        reply.send(error);
      } finally {
        await fastify.prisma.$disconnect();
      }
    }
  );
};
