"use strict";
const moment = require("moment");
const _ = require("lodash");

module.exports = async function (fastify, opts) {
  fastify.get(
    "",
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

  fastify.get(
    "/:id",
    {
      schema: {
        tags: ["Admin Dashboard"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              default: 1,
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        // await fastify.token.isAuth(request);

        const review = await fastify.prisma.reviews.findUnique({
          where: {
            id: request.params.id,
          },
        });
        reply.send(review);
      } catch (error) {
        reply.send(error);
      } finally {
        await fastify.prisma.$disconnect();
      }
    }
  );

  fastify.post(
    "/delete",
    {
      schema: {
        tags: ["Admin Dashboard"],
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["id"],
          properties: {
            id: {
              type: "number",
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const item = await fastify.prisma.reviews.update({
          where: {
            id: request.body.id,
          },
          data: {
            deleted_at: moment().toISOString(),
          },
        });

        reply.send({ message: "Review deleted successfully" });
      } catch (error) {
        reply.send(error);
      } finally {
        await fastify.prisma.$disconnect();
      }
    }
  );

  fastify.post(
    "/approve",
    {
      schema: {
        tags: ["Admin Dashboard"],
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["id"],
          properties: {
            id: {
              type: "number",
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        // await fastify.token.isAuth(request);

        const review = await fastify.prisma.reviews.findUnique({
          where: {
            id: request.body.id,
          },
        });

        if (!review) {
          throw new Error("Review not found.");
        }

        const updatedReview = await fastify.prisma.reviews.update({
          where: {
            id: request.body.id,
          },
          data: {
            is_approved: true,
            modified_at: moment().toISOString(),
          },
        });

        reply.send({
          message: `Review ${updatedReview.id} has been enabled.`,
        });
      } catch (error) {
        reply.send(error);
      } finally {
        await fastify.prisma.$disconnect();
      }
    }
  );

  fastify.post(
    "/reject",
    {
      schema: {
        tags: ["Admin Dashboard"],
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["id"],
          properties: {
            id: {
              type: "number",
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        // await fastify.token.isAuth(request);

        const review = await fastify.prisma.reviews.findUnique({
          where: {
            id: request.body.id,
          },
        });

        if (!review) {
          throw new Error("Review not found.");
        }

        const updatedReview = await fastify.prisma.reviews.update({
          where: {
            id: request.body.id,
          },
          data: {
            is_approved: false,
            modified_at: moment().toISOString(),
          },
        });

        reply.send({
          message: `Review ${updatedReview.id} has been disabled.`,
        });
      } catch (error) {
        reply.send(error);
      } finally {
        await fastify.prisma.$disconnect();
      }
    }
  );
};
