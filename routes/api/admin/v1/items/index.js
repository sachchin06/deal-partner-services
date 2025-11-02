"use strict";
const moment = require("moment");

module.exports = async function (fastify, opts) {
  fastify.get(
    "",
    {
      schema: {
        tags: ["Item"],
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
              default: -1, // -1 for all, 1 for enabled, 0 for disabled
            },
            category_id: {
              type: "integer",
              default: null,
            },
            sub_category_id: {
              type: "integer",
              default: null,
            },
            sub_sub_category_id: {
              type: "integer",
              default: null,
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        //  await fastify.token.isAuth(request);
        const page = request.query.page;
        const limit = request.query.limit;
        const search = request.query.search;
        const is_enabled = request.query.is_enabled;
        const category_id = request.query.category_id;
        const sub_category_id = request.query.sub_category_id;
        const sub_sub_category_id = request.query.sub_sub_category_id;
        const skip = (page - 1) * limit;

        var where = {
          deleted_at: null,
          OR: [
            { name: { contains: search } },
            { description: { contains: search } },
          ],
        };

        if (is_enabled == 1) {
          where.is_enabled = true;
        } else if (is_enabled == 0) {
          where.is_enabled = false;
        }

        if (category_id) {
          where.category_id = category_id;
        }

        if (sub_category_id) {
          where.sub_category_id = sub_category_id;
        }

        if (sub_sub_category_id) {
          where.sub_sub_category_id = sub_sub_category_id;
        }

        const items = await fastify.prisma.items.findMany({
          where: where,
          skip: skip,
          take: limit,
          include: {
            item_properties: true,
            item_features: true,
            item_images: true,
            item_embeds: true,
          },
        });

        const totalCount = await fastify.prisma.items.count({
          where: where,
        });

        const allCount = await fastify.prisma.items.count({
          where: { deleted_at: null },
        });

        const totalEnabledCount = await fastify.prisma.items.count({
          where: {
            deleted_at: null,
            is_enabled: true,
          },
        });

        const totalDisabledCount = await fastify.prisma.items.count({
          where: {
            deleted_at: null,
            is_enabled: false,
          },
        });

        const categoryCount = await fastify.prisma.items.count({
          where: {
            deleted_at: null,
            category_id: category_id,
          },
        });

        const subCategoryCount = await fastify.prisma.items.count({
          where: {
            deleted_at: null,
            sub_category_id: sub_category_id,
          },
        });

        const subSubCategoryCount = await fastify.prisma.items.count({
          where: {
            deleted_at: null,
            sub_sub_category_id: sub_sub_category_id,
          },
        });

        var count = {
          all: allCount,
          enabled: totalEnabledCount,
          disabled: totalDisabledCount,
          category: categoryCount,
          sub_category: subCategoryCount,
          sub_sub_category: subSubCategoryCount,
        };

        const totalPages = Math.ceil(totalCount / limit);

        var res = {
          page: page,
          limit: limit,
          totalPages: totalPages,
          totalCount: totalCount,
          count: count,
          data: items,
        };

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
        tags: ["Item"],
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

        const item = await fastify.prisma.items.findUnique({
          where: {
            id: request.params.id,
          },
          include: {
            item_properties: true,
            item_features: true,
            item_images: true,
            item_embeds: true,
          },
        });

        if (!item) {
          throw new Error("Item not found.");
        }

        reply.send(item);
      } catch (error) {
        reply.send({
          error: error.message,
        });
      } finally {
        await fastify.prisma.$disconnect();
      }
    }
  );

  fastify.post(
    "/new",
    {
      schema: {
        tags: ["Item"],
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: [
            "name",
            "price_lkr",
            "price_usd",
            "price_type",
            "is_enabled",
          ],
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            category_id: { type: "integer" },
            sub_category_id: { type: "integer" },
            sub_sub_category_id: { type: "integer" },
            price_lkr: { type: "number" },
            price_usd: { type: "number" },
            price_type: { type: "string" },
            per_unit: { type: "number" },
            discount_percent: { type: "string" },
            is_featured: { type: "boolean" },
            is_enabled: { type: "boolean" },
            is_sold: { type: "boolean" },
            hot_deal_end_at: { type: "string" },
            item_properties: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  key: { type: "string" },
                  value: { type: "string" },
                },
              },
            },
            item_features: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  icon_url: { type: "string" },
                },
              },
            },
            item_images: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  image_url: { type: "string" },
                },
              },
            },
            item_embeds: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  html: { type: "string" },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const {
        name,
        description,
        category_id,
        sub_category_id,
        sub_sub_category_id,
        price_lkr,
        price_usd,
        price_type,
        per_unit,
        discount_percent,
        is_featured,
        is_enabled,
        is_sold,
        hot_deal_end_at,
        item_properties,
        item_features,
        item_images,
        item_embeds,
      } = request.body;

      try {
        // await fastify.token.isAuth(request);

        // Check if the item with the same name already exists
        const existingItem = await fastify.prisma.items.findFirst({
          where: { name },
        });

        if (existingItem) {
          throw new Error("The item name already exists in the system.");
        }

        await fastify.prisma.$transaction(async (prisma) => {
          // Create the main item
          const newItem = await fastify.prisma.items.create({
            data: {
              name,
              description,
              category_id: category_id || null,
              sub_category_id: sub_category_id || null,
              sub_sub_category_id: sub_sub_category_id || null,
              price_lkr,
              price_usd,
              price_type,
              per_unit: per_unit || null,
              discount_percent: discount_percent || null,
              is_featured: is_featured || false,
              is_enabled,
              is_sold,
              hot_deal_end_at: hot_deal_end_at || null,
              created_at: moment().toISOString(),
            },
          });

          // Insert item properties
          if (item_properties && item_properties.length > 0) {
            await fastify.prisma.item_properties.createMany({
              data: item_properties.map((prop) => ({
                key: prop.key,
                value: prop.value,
                item_id: newItem.id,
                created_at: moment().toISOString(),
              })),
            });
          }

          // Insert item features
          if (item_features && item_features.length > 0) {
            await fastify.prisma.item_features.createMany({
              data: item_features.map((feature) => ({
                name: feature.name,
                icon_url: feature.icon_url || null,
                item_id: newItem.id,
                created_at: moment().toISOString(),
              })),
            });
          }

          // Insert item images
          if (item_images && item_images.length > 0) {
            await fastify.prisma.item_images.createMany({
              data: item_images.map((image) => ({
                image_url: image.image_url,
                item_id: newItem.id,
                created_at: moment().toISOString(),
              })),
            });
          }

          // Insert item embeds
          if (item_embeds && item_embeds.length > 0) {
            await fastify.prisma.item_embeds.createMany({
              data: item_embeds.map((embed) => ({
                title: embed.title,
                html: embed.html,
                item_id: newItem.id,
                created_at: moment().toISOString(),
              })),
            });
          }

          reply.send({
            message: `Item '${newItem.name}' created successfully.`,
            itemId: newItem.id,
          });
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
        tags: ["Item"],
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string" },
            description: { type: "string" },
            category_id: { type: "integer" },
            sub_category_id: { type: "integer" },
            sub_sub_category_id: { type: "integer" },
            price_lkr: { type: "number" },
            price_usd: { type: "number" },
            price_type: { type: "string" },
            per_unit: { type: "number" },
            discount_percent: { type: "string" },
            is_featured: { type: "boolean" },
            is_enabled: { type: "boolean" },
            is_sold: { type: "boolean" },
            hot_deal_end_at: { type: "string", format: "date-time" },
            item_properties: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "integer" },
                  key: { type: "string" },
                  value: { type: "string" },
                },
              },
            },
            item_features: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "integer" },
                  name: { type: "string" },
                  icon_url: { type: "string" },
                },
              },
            },
            item_images: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "integer" },
                  image_url: { type: "string" },
                },
              },
            },
            item_embeds: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "integer" },
                  title: { type: "string" },
                  html: { type: "string" },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const {
        id,
        name,
        description,
        category_id,
        sub_category_id,
        sub_sub_category_id,
        price_lkr,
        price_usd,
        price_type,
        per_unit,
        discount_percent,
        is_featured,
        is_enabled,
        is_sold,
        hot_deal_end_at,
        item_properties,
        item_features,
        item_images,
        item_embeds,
      } = request.body;

      try {
        // await fastify.token.isAuth(request);

        const existingItem = await fastify.prisma.items.findUnique({
          where: { id },
        });

        if (!existingItem) {
          throw new Error("Item not found.");
        }

        await fastify.prisma.$transaction(async (prisma) => {
          // Update Item
          const updatedItem = await fastify.prisma.items.update({
            where: { id },
            data: {
              name: name,
              description: description,
              category_id: category_id,
              sub_category_id: sub_category_id,
              sub_sub_category_id: sub_sub_category_id,
              price_lkr: price_lkr,
              price_usd: price_usd,
              price_type: price_type,
              per_unit: per_unit,
              discount_percent: discount_percent,
              is_featured: is_featured,
              is_enabled: is_enabled,
              is_sold,
              hot_deal_end_at: hot_deal_end_at,
              modified_at: moment().toISOString(),
            },
          });

          // Update item properties
          if (item_properties && item_properties.length > 0) {
            for (const prop of item_properties) {
              if (prop.id) {
                await fastify.prisma.item_properties.update({
                  where: { id: prop.id },
                  data: {
                    key: prop.key,
                    value: prop.value,
                    modified_at: moment().toISOString(),
                  },
                });
              } else {
                await fastify.prisma.item_properties.create({
                  data: {
                    key: prop.key,
                    value: prop.value,
                    item_id: updatedItem.id,
                    created_at: moment().toISOString(),
                  },
                });
              }
            }
          }

          // Update item features
          if (item_features && item_features.length > 0) {
            for (const feature of item_features) {
              if (feature.id) {
                await fastify.prisma.item_features.update({
                  where: { id: feature.id },
                  data: {
                    name: feature.name,
                    icon_url: feature.icon_url || null,
                    modified_at: moment().toISOString(),
                  },
                });
              } else {
                await fastify.prisma.item_features.create({
                  data: {
                    name: feature.name,
                    icon_url: feature.icon_url || null,
                    item_id: updatedItem.id,
                    created_at: moment().toISOString(),
                  },
                });
              }
            }
          }

          // Update item images
          if (item_images && item_images.length > 0) {
            for (const image of item_images) {
              if (image.id) {
                await fastify.prisma.item_images.update({
                  where: { id: image.id },
                  data: {
                    image_url: image.image_url,
                    modified_at: moment().toISOString(),
                  },
                });
              } else {
                await fastify.prisma.item_images.create({
                  data: {
                    image_url: image.image_url,
                    item_id: updatedItem.id,
                    created_at: moment().toISOString(),
                  },
                });
              }
            }
          }

          // Update item embeds
          if (item_embeds && item_embeds.length > 0) {
            for (const embed of item_embeds) {
              if (embed.id) {
                await fastify.prisma.item_embeds.update({
                  where: { id: embed.id },
                  data: {
                    title: embed.title,
                    html: embed.html,
                    modified_at: moment().toISOString(),
                  },
                });
              } else {
                await fastify.prisma.item_embeds.create({
                  data: {
                    title: embed.title,
                    html: embed.html,
                    item_id: updatedItem.id,
                    created_at: moment().toISOString(),
                  },
                });
              }
            }
          }

          reply.send({
            message: `Item '${updatedItem.name}' updated successfully.`,
          });
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
        tags: ["Item"],
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
        //  await fastify.token.isAuth(request);

        const item = await fastify.prisma.items.findUnique({
          where: {
            id: request.body.id,
          },
        });

        if (!item) {
          throw new Error("Item not found.");
        }

        await fastify.prisma.$transaction(async (prisma) => {
          const deletedItem = await prisma.items.update({
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

          await prisma.item_properties.updateMany({
            where: {
              item_id: request.body.id,
            },
            data: {
              deleted_at: moment().toISOString(),
            },
          });

          await prisma.item_features.updateMany({
            where: {
              item_id: request.body.id,
            },
            data: {
              deleted_at: moment().toISOString(),
            },
          });

          await prisma.item_images.updateMany({
            where: {
              item_id: request.body.id,
            },
            data: {
              deleted_at: moment().toISOString(),
            },
          });

          await prisma.item_embeds.updateMany({
            where: {
              item_id: request.body.id,
            },
            data: {
              deleted_at: moment().toISOString(),
            },
          });

          reply.send({
            message: `Item '${deletedItem.name}' and its related records deleted successfully`,
          });
        });
      } catch (error) {
        reply.send({ error: error.message });
      } finally {
        await fastify.prisma.$disconnect();
      }
    }
  );

  fastify.post(
    "/enable",
    {
      schema: {
        tags: ["Item"],
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

        const item = await fastify.prisma.items.findUnique({
          where: {
            id: request.body.id,
          },
        });

        if (!item) {
          throw new Error("Item not found.");
        }

        const updatedItem = await fastify.prisma.items.update({
          where: {
            id: request.body.id,
          },
          data: {
            is_enabled: true,
            modified_at: moment().toISOString(),
          },
        });

        reply.send({
          message: `Item '${updatedItem.name}' has been enabled.`,
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
        tags: ["Item"],
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

        const item = await fastify.prisma.items.findUnique({
          where: {
            id: request.body.id,
          },
        });

        if (!item) {
          throw new Error("Item not found.");
        }

        const updatedItem = await fastify.prisma.items.update({
          where: {
            id: request.body.id,
          },
          data: {
            is_enabled: false,
            modified_at: moment().toISOString(),
          },
        });

        reply.send({
          message: `Item '${updatedItem.name}' has been disabled.`,
        });
      } catch (error) {
        reply.send(error);
      } finally {
        await fastify.prisma.$disconnect();
      }
    }
  );
};
