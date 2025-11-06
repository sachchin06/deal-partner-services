"use strict";
const moment = require("moment");

module.exports = async function (fastify, opts) {
  fastify.get(
    "",
    {
      schema: {
        tags: ["Faqs"],
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
          OR: [{ question: { contains: search } }],
        };

        if (is_enabled == 1) {
          where = {
            deleted_at: null,
            is_enabled: true,
            OR: [{ question: { contains: search } }],
          };
        } else if (is_enabled == 0) {
          where = {
            deleted_at: null,
            is_enabled: false,
            OR: [{ question: { contains: search } }],
          };
        }

        const items = await fastify.prisma.faqs.findMany({
          where: where,
          skip: skip,
          take: limit,
        });

        const totalCount = await fastify.prisma.faqs.count({
          where: where,
        });

        const allCount = await fastify.prisma.faqs.count({
          where: {
            deleted_at: null,
          },
        });

        const totalEnabledCount = await fastify.prisma.faqs.count({
          where: {
            deleted_at: null,
            is_enabled: true,
          },
        });

        const totalDisabledCount = await fastify.prisma.faqs.count({
          where: {
            deleted_at: null,
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
        tags: ["Faqs"],
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

        const item = await fastify.prisma.faqs.findUnique({
          where: {
            id: request.params.id,
          },
          select: {
            id: true,
            question: true,
            answer: true,
            is_enabled: true,
            created_at: true,
            modified_at: true,
          },
        });

        if (!item) {
          throw new Error("Entity 'Faqs' not found.");
        }

        reply.send(item);
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
        tags: ["Faqs"],
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["question"],
          properties: {
            question: {
              type: "string",
            },
            answer: {
              type: "string",
            },
            is_enabled: {
              type: "boolean",
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        // await fastify.token.isAuth(request);

        const item = await fastify.prisma.faqs.create({
          data: {
            question: request.body.question || null,
            answer: request.body.answer || null,
            is_enabled: request.body.is_enabled,
            created_at: moment().toISOString(),
            modified_at: moment().toISOString(),
          },
        });

        reply.send({
          message: `An Entity 'Faqs' with Id: ${item.id} created successfully`,
        });
      } catch (error) {
        reply.send(error);
      } finally {
        await fastify.prisma.$disconnect();
      }
    }
  );

  fastify.post(
    "/edit",
    {
      schema: {
        tags: ["Faqs"],
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["id", "question"],
          properties: {
            id: {
              type: "number",
            },
            question: {
              type: "string",
            },
            answer: {
              type: "string",
            },
            is_enabled: {
              type: "boolean",
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        // await fastify.token.isAuth(request);

        const existingItem = await fastify.prisma.faqs.findUnique({
          where: {
            id: request.body.id,
          },
        });

        if (!existingItem) {
          throw new Error("Entity Faqs not found.");
        }

        const updatedItem = await fastify.prisma.faqs.update({
          where: {
            id: request.body.id,
          },
          data: {
            question: request.body.question || null,
            answer: request.body.answer || null,
            is_enabled: request.body.is_enabled,
            modified_at: moment().toISOString(),
          },
        });

        reply.send({
          message: `Entity 'Faqs' with Id: ${updatedItem.id} updated successfully`,
        });
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
        tags: ["Faqs"],
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

        const existingItem = await fastify.prisma.faqs.findUnique({
          where: {
            id: request.body.id,
          },
        });

        if (!existingItem) {
          throw new Error("Entity 'Faqs' not found.");
        }

        const item = await fastify.prisma.faqs.update({
          where: {
            id: request.body.id,
          },
          data: {
            deleted_at: moment().toISOString(),
          },
        });

        reply.send({
          message: `Entity 'Faqs' With Id: ${item.id} deleted successfully`,
        });
      } catch (error) {
        reply.send(error);
      } finally {
        await fastify.prisma.$disconnect();
      }
    }
  );

  fastify.post(
    "/enable",
    {
      schema: {
        tags: ["Faqs"],
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

        const existingItem = await fastify.prisma.faqs.findUnique({
          where: {
            id: request.body.id,
          },
        });

        if (!existingItem) {
          throw new Error("Entity 'Faqs' not found.");
        }

        const updatedItem = await fastify.prisma.faqs.update({
          where: {
            id: request.body.id,
          },
          data: {
            is_enabled: true,
            modified_at: moment().toISOString(),
          },
        });

        reply.send({
          message: `Entity 'Faqs' With Id: ${updatedItem.id} has been enabled.`,
        });
      } catch (error) {
        reply.send(error);
      } finally {
        await fastify.prisma.$disconnect();
      }
    }
  );

  fastify.post(
    "/disable",
    {
      schema: {
        tags: ["Faqs"],
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

        const existingItem = await fastify.prisma.faqs.findUnique({
          where: {
            id: request.body.id,
          },
        });

        if (!existingItem) {
          throw new Error("Entity 'Faqs' not found.");
        }

        const updatedItem = await fastify.prisma.faqs.update({
          where: {
            id: request.body.id,
          },
          data: {
            is_enabled: false,
            modified_at: moment().toISOString(),
          },
        });

        reply.send({
          message: `Entity 'Faqs' With Id: ${updatedItem.id} has been disabled.`,
        });
      } catch (error) {
        reply.send(error);
      } finally {
        await fastify.prisma.$disconnect();
      }
    }
  );
};
