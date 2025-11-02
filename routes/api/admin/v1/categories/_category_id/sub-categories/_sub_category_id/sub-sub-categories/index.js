"use strict";
const moment = require("moment");

module.exports = async function (fastify, opts) {
  fastify.get(
    "",
    {
      schema: {
        tags: ["Sub Sub Category"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            category_id: {
              type: "integer",
              default: 1,
            },
            sub_category_id: {
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
        const subCategoryId = request.params.sub_category_id;

        const category = await fastify.prisma.categories.findUnique({
          where: {
            id: categoryId,
          },
        });

        if (!category) {
          throw new Error("This is an invalid category Id.");
        }

        const subCategory = await fastify.prisma.sub_categories.findUnique({
          where: {
            id: subCategoryId,
          },
        });

        if (!subCategory) {
          throw new Error("This is an invalid subCategory Id.");
        }

        const page = request.query.page;
        const limit = request.query.limit;
        const search = request.query.search;
        const is_enabled = request.query.is_enabled;
        const skip = (page - 1) * limit;

        var where = {
          category_id: categoryId,
          sub_category_id: subCategoryId,
          deleted_at: null,
          OR: [{ name: { contains: search } }],
        };

        if (is_enabled == 1) {
          where = {
            category_id: categoryId,
            sub_category_id: subCategoryId,
            deleted_at: null,
            is_enabled: true,
            OR: [{ name: { contains: search } }],
          };
        } else if (is_enabled == 0) {
          where = {
            category_id: categoryId,
            sub_category_id: subCategoryId,
            deleted_at: null,
            is_enabled: false,
            OR: [{ name: { contains: search } }],
          };
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
          where: {
            category_id: categoryId,
            sub_category_id: subCategoryId,
            deleted_at: null,
          },
        });

        const totalEnabledCount = await fastify.prisma.sub_sub_categories.count(
          {
            where: {
              category_id: categoryId,
              sub_category_id: subCategoryId,
              deleted_at: null,
              is_enabled: true,
            },
          }
        );

        const totalDisabledCount =
          await fastify.prisma.sub_sub_categories.count({
            where: {
              category_id: categoryId,
              sub_category_id: subCategoryId,
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
        res.data = subSubCategories;

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
        tags: ["Sub Sub Category"],
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
            sub_category_id: {
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
        const subCategoryId = request.params.sub_category_id;

        const category = await fastify.prisma.categories.findUnique({
          where: {
            id: categoryId,
          },
        });

        if (!category) {
          throw new Error("Category not found.");
        }

        const subCategory = await fastify.prisma.sub_categories.findUnique({
          where: {
            id: subCategoryId,
          },
        });

        if (!subCategory) {
          throw new Error("This is an invalid subCategory Id.");
        }

        const item = await fastify.prisma.sub_sub_categories.findUnique({
          where: {
            id: request.params.id,
          },
          select: {
            id: true,
            name: true,
            description: true,
            image: true,
            is_enabled: true,
            category_id: true,
            sub_category_id: true,
            _count: {
              select: {
                items: true,
              },
            },
          },
        });

        if (item && item.category_id != categoryId) {
          throw new Error(
            `Invalid category Id for Sub Sub Category ${item.name}`
          );
        }

        if (item && item.sub_category_id != subCategoryId) {
          throw new Error(
            `Invalid Sub Category Id for Sub Sub Category ${item.name}`
          );
        }

        const res = {
          id: item.id,
          name: item.name,
          description: item.description,
          image: item.image,
          category_id: item.category_id,
          sub_category_id: item.sub_category_id,
          is_enabled: item.is_enabled,
          total_items_count: item._count.items,
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
        tags: ["Sub Sub Category"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            category_id: {
              type: "integer",
              default: 1,
            },
            sub_category_id: {
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
        const subCategoryId = request.params.sub_category_id;

        const category = await fastify.prisma.categories.findUnique({
          where: {
            id: categoryId,
          },
        });

        if (!category) {
          throw new Error("Category not found.");
        }

        const subCategory = await fastify.prisma.sub_categories.findUnique({
          where: {
            id: subCategoryId,
          },
        });

        if (!subCategory) {
          throw new Error("This is an invalid subCategory Id.");
        }

        const subSubCategory = await fastify.prisma.sub_sub_categories.create({
          data: {
            name: request.body.name,
            image: request.body.image || null,
            description: request.body.description || null,
            is_enabled: request.body.is_enabled,
            category_id: categoryId,
            sub_category_id: subCategoryId,
            created_at: moment().toISOString(),
            modified_at: moment().toISOString(),
          },
          select: {
            name: true,
          },
        });

        reply.send({
          message: `Sub Sub Category '${subSubCategory.name}' created successfully`,
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
        tags: ["Sub Sub Category"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            category_id: {
              type: "integer",
              default: 1,
            },
            sub_category_id: {
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
        const subCategoryId = request.params.sub_category_id;

        const category = await fastify.prisma.categories.findUnique({
          where: {
            id: categoryId,
          },
        });

        if (!category) {
          throw new Error("Category not found.");
        }

        const subCategory = await fastify.prisma.sub_categories.findUnique({
          where: {
            id: subCategoryId,
          },
        });

        if (!subCategory) {
          throw new Error("This is an invalid subCategory Id.");
        }

        const existingSubSubCategory =
          await fastify.prisma.sub_sub_categories.findUnique({
            where: {
              id: request.body.id,
            },
          });

        if (!existingSubSubCategory) {
          throw new Error("Sub Sub Category not found.");
        }

        if (
          existingSubSubCategory &&
          existingSubSubCategory.category_id != categoryId
        ) {
          throw new Error(
            `Invalid category Id for Sub Sub Category ${existingSubSubCategory.name}`
          );
        }

        if (
          existingSubSubCategory &&
          existingSubSubCategory.sub_category_id != subCategoryId
        ) {
          throw new Error(
            `Invalid Sub Category Id for Sub Sub Category ${existingSubSubCategory.name}`
          );
        }

        const item = await fastify.prisma.sub_sub_categories.findFirst({
          where: {
            name: request.body.name,
          },
          select: {
            id: true,
          },
        });

        if (item && item.id != request.body.id) {
          throw new Error(
            `The Sub Sub Category '${request.body.name}' alredy in our system.`
          );
        }

        const updatedSubSubCategory =
          await fastify.prisma.sub_sub_categories.update({
            where: {
              id: request.body.id,
            },
            data: {
              name: request.body.name,
              image: request.body.image || null,
              description: request.body.description || null,
              is_enabled: request.body.is_enabled,
              category_id: categoryId,
              sub_category_id: subCategoryId,
              modified_at: moment().toISOString(),
            },
            select: {
              id: true,
              name: true,
            },
          });

        reply.send({
          message: `Sub Sub Category '${updatedSubSubCategory.name}' updated successfully`,
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
        tags: ["Sub Sub Category"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            category_id: {
              type: "integer",
              default: 1,
            },
            sub_category_id: {
              type: "integer",
              default: 1,
            },
          },
        },
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
        const subCategoryId = request.params.sub_category_id;

        const category = await fastify.prisma.categories.findUnique({
          where: {
            id: categoryId,
          },
        });

        if (!category) {
          throw new Error("Category not found.");
        }

        const subCategory = await fastify.prisma.sub_categories.findUnique({
          where: {
            id: subCategoryId,
          },
        });

        if (!subCategory) {
          throw new Error(`Sub Category not found.`);
        }

        const subSubCategory =
          await fastify.prisma.sub_sub_categories.findUnique({
            where: {
              id: request.body.id,
            },
          });

        if (!subSubCategory) {
          throw new Error(`Sub Sub Category not found.`);
        }

        const item = await fastify.prisma.sub_sub_categories.update({
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
          message: `Sub Sub Category '${item.name}' deleted successfully`,
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
        tags: ["Sub Sub Category"],
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

        const subSubCategory =
          await fastify.prisma.sub_sub_categories.findUnique({
            where: {
              id: request.body.id,
            },
          });

        if (!subSubCategory) {
          throw new Error("Sub Sub Category not found.");
        }

        const updatedSubSubCategory =
          await fastify.prisma.sub_sub_categories.update({
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
          message: `Sub Sub Category ${updatedSubSubCategory.name} has been enabled.`,
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
        tags: ["Sub Sub Category"],
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

        const subSubCategory =
          await fastify.prisma.sub_sub_categories.findUnique({
            where: {
              id: request.body.id,
            },
          });

        if (!subSubCategory) {
          throw new Error("Sub Sub Category not found.");
        }

        const updatedSubSubCategory =
          await fastify.prisma.sub_sub_categories.update({
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
          message: `Sub Sub Category ${updatedSubSubCategory.name} has been disabled.`,
        });
      } catch (error) {
        reply.send(error);
      } finally {
        await fastify.prisma.$disconnect();
      }
    }
  );
};
