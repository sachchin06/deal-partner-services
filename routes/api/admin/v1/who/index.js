"use strict";
const moment = require("moment");

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
          OR: [{ key: { contains: search } }],
        };

        if (is_enabled == 1) {
          where = {
            deleted_at: null,
            is_enabled: true,
            OR: [{ key: { contains: search } }],
          };
        } else if (is_enabled == 0) {
          where = {
            deleted_at: null,
            is_enabled: false,
            OR: [{ key: { contains: search } }],
          };
        }

        const items = await fastify.prisma.who.findMany({
          where: where,
          skip: skip,
          take: limit,
        });

        const totalCount = await fastify.prisma.who.count({
          where: where,
        });

        const allCount = await fastify.prisma.who.count({
          where: {
            deleted_at: null,
          },
        });

        const totalEnabledCount = await fastify.prisma.who.count({
          where: {
            deleted_at: null,
            is_enabled: true,
          },
        });

        const totalDisabledCount = await fastify.prisma.who.count({
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

        const item = await fastify.prisma.who.findUnique({
          where: {
            id: request.params.id,
          },
          select: {
            id: true,
            key: true,
            value: true,
            mdi_icon: true,
            is_enabled: true,
            created_at: true,
            modified_at: true,
          },
        });

        if (!item) {
          throw new Error("Entity 'Who' not found.");
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
        tags: ["Admin Dashboard"],
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["key", "value"],
          properties: {
            key: {
              type: "string",
            },
            value: {
              type: "string",
            },
            mdi_icon: {
              type: "string",
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        // await fastify.token.isAuth(request);

        const item = await fastify.prisma.who.create({
          data: {
            key: request.body.key,
            value: request.body.value,
            mdi_icon: request.body.mdi_icon,
            created_at: moment().toISOString(),
            modified_at: moment().toISOString(),
          },
        });

        reply.send({
          message: `New entity 'Who' created successfully with Id: ${item.id}`,
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
        tags: ["Admin Dashboard"],
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["id", "key"],
          properties: {
            id: {
              type: "number",
            },
            key: {
              type: "string",
            },
            value: {
              type: "string",
            },
            mdi_icon: {
              type: "string",
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        // await fastify.token.isAuth(request);

        const existingItem = await fastify.prisma.who.findUnique({
          where: {
            id: request.body.id,
          },
        });

        if (!existingItem) {
          throw new Error("Entity Who not found.");
        }

        const updatedItem = await fastify.prisma.who.update({
          where: {
            id: request.body.id,
          },
          data: {
            key: request.body.key,
            value: request.body.value,
            mdi_icon: request.body.mdi_icon,
            modified_at: moment().toISOString(),
          },
        });

        reply.send({
          message: `Entity 'Who' with Id: ${updatedItem.id} updated successfully`,
        });
      } catch (error) {
        reply.send(error);
      } finally {
        await fastify.prisma.$disconnect();
      }
    }
  );
};
