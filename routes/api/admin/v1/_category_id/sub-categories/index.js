"use strict";
const moment = require("moment");

module.exports = async function (fastify, opts) {
  fastify.get(
    "",
    {
      schema: {
        tags: ["Sub Category"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            category_id: {
              type: "integer",
              default: 1,
            },
          },
        },
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

        const categoryId = request.params.category_id;

        const category = await fastify.prisma.categories.findUnique({
          where: {
            id: categoryId,
          },
        });

        if (!category) {
          throw new Error("This is an invalid category Id.");
        }

        const page = request.query.page;
        const limit = request.query.limit;
        const search = request.query.search;
        const is_enabled = request.query.is_enabled;
        const skip = (page - 1) * limit;

        var where = {
          category_id: categoryId,
          deleted_at: null,
          OR: [{ name: { contains: search } }],
        };

        if (is_enabled == 1) {
          where = {
            category_id: categoryId,
            deleted_at: null,
            is_enabled: true,
            OR: [{ name: { contains: search } }],
          };
        } else if (is_enabled == 0) {
          where = {
            category_id: categoryId,
            deleted_at: null,
            is_enabled: false,
            OR: [{ name: { contains: search } }],
          };
        }

        const subCategories = await fastify.prisma.sub_categories.findMany({
          where: where,
          skip: skip,
          take: limit,
        });

        const totalCount = await fastify.prisma.sub_categories.count({
          where: where,
        });

        const allCount = await fastify.prisma.sub_categories.count({
          where: {
            category_id: categoryId,
            deleted_at: null,
          },
        });

        const totalEnabledCount = await fastify.prisma.sub_categories.count({
          where: {
            category_id: categoryId,
            deleted_at: null,
            is_enabled: true,
          },
        });

        const totalDisabledCount = await fastify.prisma.sub_categories.count({
          where: {
            category_id: categoryId,
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
        res.data = subCategories;

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
        tags: ["Sub Category"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              default: 1,
            },
            category_id: {
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

        const categoryId = request.params.category_id;

        const category = await fastify.prisma.categories.findUnique({
          where: {
            id: categoryId,
          },
        });

        if (!category) {
          throw new Error("Category not found.");
        }

        const item = await fastify.prisma.sub_categories.findUnique({
          where: {
            id: request.params.id,
          },
        });

        if (item && item.category_id != categoryId) {
          throw new Error(`Invalid category Id for Sub Category ${item.name}`);
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
        tags: ["Sub Category"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            category_id: {
              type: "integer",
              default: 1,
            },
          },
        },
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

        const categoryId = request.params.category_id;

        const category = await fastify.prisma.categories.findUnique({
          where: {
            id: categoryId,
          },
        });

        if (!category) {
          throw new Error("Category not found.");
        }

        const subCategory = await fastify.prisma.sub_categories.create({
          data: {
            name: request.body.name,
            image: request.body.image || null,
            description: request.body.description || null,
            is_enabled: request.body.is_enabled,
            category_id: categoryId,
            created_at: moment().toISOString(),
            modified_at: moment().toISOString(),
          },
          select: {
            name: true,
          },
        });

        reply.send({
          message: `Sub Category '${subCategory.name}' created successfully`,
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
        tags: ["Sub Category"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            category_id: {
              type: "integer",
              default: 1,
            },
          },
        },
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

        const categoryId = request.params.category_id;

        const category = await fastify.prisma.categories.findUnique({
          where: {
            id: categoryId,
          },
        });

        if (!category) {
          throw new Error("Category not found.");
        }

        const existingSubCategory =
          await fastify.prisma.sub_categories.findUnique({
            where: {
              id: request.body.id,
            },
          });

        if (!existingSubCategory) {
          throw new Error("Sub Category not found.");
        }

        if (
          existingSubCategory &&
          existingSubCategory.category_id != categoryId
        ) {
          throw new Error(
            `Invalid category Id for Sub Category ${existingSubCategory.name}`
          );
        }

        const item = await fastify.prisma.sub_categories.findFirst({
          where: {
            name: request.body.name,
          },
          select: {
            id: true,
          },
        });

        if (item && item.id != request.body.id) {
          throw new Error(
            `The Sub Category '${request.body.name}' alredy in our system.`
          );
        }

        const updatedSubCategory = await fastify.prisma.sub_categories.update({
          where: {
            id: request.body.id,
          },
          data: {
            name: request.body.name,
            image: request.body.image || null,
            description: request.body.description || null,
            is_enabled: request.body.is_enabled,
            category_id: categoryId,
            modified_at: moment().toISOString(),
          },
          select: {
            id: true,
            name: true,
          },
        });

        reply.send({
          message: `Sub Category '${updatedSubCategory.name}' updated successfully`,
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
        tags: ["Sub Category"],
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

        const categoryId = request.params.category_id;

        const category = await fastify.prisma.categories.findUnique({
          where: {
            id: categoryId,
          },
        });

        if (!category) {
          throw new Error("Category not found.");
        }

        const subCategories = await fastify.prisma.sub_categories.findUnique({
          where: {
            id: request.body.id,
          },
        });

        if (!subCategories) {
          throw new Error(`Sub Category not found.`);
        }

        const item = await fastify.prisma.sub_categories.update({
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
          message: `Sub Category '${item.name}' deleted successfully`,
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
        tags: ["Sub Category"],
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

        const category = await fastify.prisma.sub_categories.findUnique({
          where: {
            id: request.body.id,
          },
        });

        if (!category) {
          throw new Error("Sub Category not found.");
        }

        const updatedSubCategory = await fastify.prisma.sub_categories.update({
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
          message: `Sub Category ${updatedSubCategory.name} has been enabled.`,
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
        tags: ["Sub Category"],
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

        const category = await fastify.prisma.sub_categories.findUnique({
          where: {
            id: request.body.id,
          },
        });

        if (!category) {
          throw new Error("Sub Category not found.");
        }

        const updatedSubCategory = await fastify.prisma.sub_categories.update({
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
          message: `Sub Category ${updatedSubCategory.name} has been disabled.`,
        });
      } catch (error) {
        reply.send(error);
      } finally {
        await fastify.prisma.$disconnect();
      }
    }
  );
};
