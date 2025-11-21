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

        let options = {
          where,
        };

        if (limit !== -1) {
          const skip = (page - 1) * limit;
          options = { ...options, skip, take: limit };
        }

        const categories = await fastify.prisma.categories.findMany(options);

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
            deleted_at: null,
            is_enabled: true,
          },
        });

        const totalDisabledCount = await fastify.prisma.categories.count({
          where: {
            deleted_at: null,
            is_enabled: false,
          },
        });

        var count = {};
        count.all = allCount;
        count.enabled = totalEnabledCount;
        count.disabled = totalDisabledCount;

        const totalPages = limit !== -1 ? Math.ceil(totalCount / limit) : 1;

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

        let options = {
          where,
        };

        if (limit !== -1) {
          const skip = (page - 1) * limit;
          options = { ...options, skip, take: limit };
        }

        const categories = await fastify.prisma.categories.findMany(options);

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

        const totalPages = limit !== -1 ? Math.ceil(totalCount / limit) : 1;

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

        const category = await fastify.prisma.categories.findUnique({
          where: {
            id: request.params.id,
          },
          select: {
            id: true,
            name: true,
            description: true,
            image: true,
            is_enabled: true,
            sub_categories: {
              select: {
                id: true,
                name: true,
                _count: {
                  select: {
                    sub_sub_categories: true,
                  },
                },
              },
            },
            _count: {
              select: {
                sub_categories: true,
                items: true,
              },
            },
          },
        });

        if (!category) {
          throw new Error("Category not found.");
        }

        const totalSubSubcategoryCount = category.sub_categories.reduce(
          (acc, subcategory) => acc + subcategory._count.sub_sub_categories,
          0
        );

        const res = {
          id: category.id,
          name: category.name,
          description: category.description,
          image: category.image,
          is_enabled: category.is_enabled,
          total_sub_category_count: category._count.sub_categories,
          total_sub_sub_category_Count: totalSubSubcategoryCount,
          total_items_count: category._count.items,
        };

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
        tags: ["Admin Dashboard"],
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["name"],
          properties: {
            name: {
              type: "string",
            },
            image: {
              type: "string",
            },
            description: {
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

        const item = await fastify.prisma.categories.findFirst({
          where: {
            name: request.body.name,
          },
        });
        if (item) {
          throw new Error("The category name alredy in our system.");
        }
        const category = await fastify.prisma.categories.create({
          data: {
            name: request.body.name,
            image: request.body.image || null,
            description: request.body.description || null,
            is_enabled: request.body.is_enabled,
            created_at: moment().toISOString(),
            modified_at: moment().toISOString(),
          },
          select: {
            name: true,
          },
        });

        reply.send({
          message: `category '${category.name}' created successfully`,
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
          required: ["id", "name"],
          properties: {
            id: {
              type: "number",
            },
            name: {
              type: "string",
            },
            image: {
              type: "string",
              nullable: true,
            },
            description: {
              type: "string",
              nullable: true,
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

        const existingCategory = await fastify.prisma.categories.findUnique({
          where: {
            id: request.body.id,
          },
        });

        if (!existingCategory) {
          throw new Error("Category not found.");
        }

        const item = await fastify.prisma.categories.findFirst({
          where: {
            name: request.body.name,
          },
          select: {
            id: true,
          },
        });

        if (item && item.id != request.body.id) {
          throw new Error(
            `The category '${request.body.name}' alredy in our system.`
          );
        }

        const updatedCategory = await fastify.prisma.categories.update({
          where: {
            id: request.body.id,
          },
          data: {
            name: request.body.name,
            image: request.body.image || null,
            description: request.body.description || null,
            is_enabled: request.body.is_enabled,
            modified_at: moment().toISOString(),
          },
          select: {
            id: true,
            name: true,
          },
        });

        reply.send({
          message: `category '${updatedCategory.name}' updated successfully`,
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

        const category = await fastify.prisma.categories.findUnique({
          where: {
            id: request.body.id,
          },
        });

        if (!category) {
          throw new Error("Category not found.");
        }

        const item = await fastify.prisma.categories.update({
          where: {
            id: request.body.id,
          },
          data: {
            deleted_at: moment().toISOString(),
          },
          select: {
            id: true,
            name: true,
          },
        });

        reply.send({
          message: `Category '${item.name}' deleted successfully`,
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

        const category = await fastify.prisma.categories.findUnique({
          where: {
            id: request.body.id,
          },
        });

        if (!category) {
          throw new Error("Category not found.");
        }

        const updatedCategory = await fastify.prisma.categories.update({
          where: {
            id: request.body.id,
          },
          data: {
            is_enabled: true,
            modified_at: moment().toISOString(),
          },
          select: {
            id: true,
            name: true,
            is_enabled: true,
            modified_at: true,
          },
        });

        reply.send({
          message: `Category ${updatedCategory.name} has been enabled.`,
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

        const category = await fastify.prisma.categories.findUnique({
          where: {
            id: request.body.id,
          },
        });

        if (!category) {
          throw new Error("Category not found.");
        }

        const updatedCategory = await fastify.prisma.categories.update({
          where: {
            id: request.body.id,
          },
          data: {
            is_enabled: false,
            modified_at: moment().toISOString(),
          },
          select: {
            id: true,
            name: true,
            is_enabled: true,
            modified_at: true,
          },
        });

        reply.send({
          message: `Category ${updatedCategory.name} has been disabled.`,
        });
      } catch (error) {
        reply.send(error);
      } finally {
        await fastify.prisma.$disconnect();
      }
    }
  );
};
