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
              default: -1, // -1 for all, 1 for enabled, 0 for disabled
            },
            is_featured: {
              type: "integer",
              default: -1, // -1 for all, 1 for Featured, 0 for Not Featured
            },
            is_discount: {
              type: "integer",
              default: -1, // -1 for all, 1 for Discount, 0 for Not Discount
            },
            is_hotdeal: {
              type: "integer",
              default: -1, // -1 for all, 1 for Hotdeal, 0 for Not Hotdeal
            },
            is_sold: {
              type: "integer",
              default: -1, // -1 for all, 1 for Sold, 0 for Not Un Sold
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
        const is_featured = request.query.is_featured;
        const is_discount = request.query.is_discount;
        const is_hotdeal = request.query.is_hotdeal;
        const is_sold = request.query.is_sold;
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

        if (is_featured === 1) {
          where.is_featured = true;
        } else if (is_featured === 0) {
          where.is_featured = false;
        }

        if (is_discount === 1) {
          where.discount_percent = {
            not: null,
          };
        } else if (is_discount === 0) {
          where.discount_percent = null;
        }

        if (is_hotdeal === 1) {
          where.hot_deal_end_at = {
            not: null,
          };
        } else if (is_hotdeal === 0) {
          where.hot_deal_end_at = null;
        }

        if (is_sold === 1) {
          where.is_sold = true;
        } else if (is_sold === 0) {
          where.is_sold = false;
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
            categories: true,
            sub_categories: true,
            sub_sub_categories: true,
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
              default: -1, // -1 for all, 1 for enabled, 0 for disabled
            },
            is_featured: {
              type: "integer",
              default: -1, // -1 for all, 1 for Featured, 0 for Not Featured
            },
            is_discount: {
              type: "integer",
              default: -1, // -1 for all, 1 for Discount, 0 for Not Discount
            },
            is_hotdeal: {
              type: "integer",
              default: -1, // -1 for all, 1 for Hotdeal, 0 for Not Hotdeal
            },
            is_sold: {
              type: "integer",
              default: -1, // -1 for all, 1 for Sold, 0 for UnSold
            },
            category_ids: {
              type: "string",
              default: "[]",
            },
            sub_category_ids: {
              type: "string",
              default: "[]",
            },
            sub_sub_category_ids: {
              type: "string",
              default: "[]",
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const {
          page,
          limit,
          search,
          is_enabled,
          is_featured,
          is_discount,
          is_hotdeal,
          is_sold,
        } = request.query;

        const skip = (page - 1) * limit;

        const category_ids = JSON.parse(request.query.category_ids);
        const sub_category_ids = JSON.parse(request.query.sub_category_ids);
        const sub_sub_category_ids = JSON.parse(
          request.query.sub_sub_category_ids
        );

        let where = {
          deleted_at: null,
          OR: [{ name: { contains: search } }],
        };

        if (is_enabled === 1) {
          where.is_enabled = true;
        } else if (is_enabled === 0) {
          where.is_enabled = false;
        }

        if (is_featured === 1) {
          where.is_featured = true;
        } else if (is_featured === 0) {
          where.is_featured = false;
        }

        if (is_discount === 1) {
          where.discount_percent = {
            not: null,
          };
        } else if (is_discount === 0) {
          where.discount_percent = null;
        }

        if (is_hotdeal === 1) {
          where.hot_deal_end_at = {
            not: null,
          };
        } else if (is_hotdeal === 0) {
          where.hot_deal_end_at = null;
        }

        if (is_sold === 1) {
          where.is_sold = true;
        } else if (is_sold === 0) {
          where.is_sold = false;
        }

        if (category_ids.length > 0) {
          where.category_id = { in: category_ids };
        }

        const categoryCount = await fastify.prisma.items.count({
          where: where,
        });

        if (sub_category_ids.length > 0) {
          where.sub_category_id = { in: sub_category_ids };
        }

        const subCategoryCount = await fastify.prisma.items.count({
          where: where,
        });

        if (sub_sub_category_ids.length > 0) {
          where.sub_sub_category_id = { in: sub_sub_category_ids };
        }

        const subSubCategoryCount = await fastify.prisma.items.count({
          where: where,
        });

        const totalCount = await fastify.prisma.items.count({
          where: where,
        });

        const allCount = await fastify.prisma.items.count({
          where: { deleted_at: null },
        });

        const totalEnabledCount = await fastify.prisma.items.count({
          where: {
            ...where,
            is_enabled: true,
          },
        });

        const totalDisabledCount = await fastify.prisma.items.count({
          where: {
            ...where,
            is_enabled: false,
          },
        });

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

        var count = {};
        count.all = allCount;
        count.enabled = totalEnabledCount;
        count.disabled = totalDisabledCount;
        count.categoryCount = categoryCount;
        count.subCategoryCount = subCategoryCount;
        count.subSubCategoryCount = subSubCategoryCount;

        const totalPages = Math.ceil(totalCount / limit);

        const res = {
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

        const item = await fastify.prisma.items.findUnique({
          where: {
            id: request.params.id,
          },
          include: {
            categories: true,
            sub_categories: true,
            sub_sub_categories: true,
            item_properties: true,
            item_features: true,
            item_images: true,
            item_embeds: true,
          },
        });

        if (!item) {
          throw new Error("Item not found.");
        }

        const res = {
          id: item.id,
          name: item.name,
          description: item.description,
          price_lkr: item.price_lkr,
          price_usd: item.price_usd,
          per_unit: item.per_unit,
          price_type: item.price_type,
          discount_percent: item.discount_percent,
          is_featured: item.is_featured,
          is_enabled: item.is_enabled,
          hot_deal_end_at: item.hot_deal_end_at,
          is_sold: item.is_sold,
          category_id: item.categories.id,
          sub_category_id: item.sub_categories.id,
          sub_sub_category_id: item.sub_sub_categories.id,
          categories: item.categories,
          sub_categories: item.sub_categories,
          sub_sub_categories: item.sub_sub_categories,
          item_properties: item.item_properties,
          item_features: item.item_features,
          item_images: item.item_images,
          item_embeds: item.item_embeds,
          created_at: item.created_at,
        };

        reply.send(res);
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
        tags: ["Admin Dashboard"],
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
            per_unit: { type: "string" },
            discount_percent: { type: "number" },
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
                  mdi_icon: { type: "string" },
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
              category_id: category_id,
              sub_category_id: sub_category_id,
              sub_sub_category_id: sub_sub_category_id,
              price_lkr,
              price_usd,
              price_type,
              per_unit: per_unit,
              discount_percent: discount_percent,
              is_featured: is_featured,
              is_enabled,
              is_sold,
              hot_deal_end_at: moment(
                request.body.hot_deal_end_at
              ).toISOString(),
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
                icon_url: feature.icon_url,
                mdi_icon: feature.mdi_icon,
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
        tags: ["Admin Dashboard"],
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
            per_unit: { type: "string" },
            discount_percent: { type: "number" },
            is_featured: { type: "boolean" },
            is_enabled: { type: "boolean" },
            is_sold: { type: "boolean" },
            hot_deal_end_at: { type: "string" },
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
                  mdi_icon: { type: "string" },
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
              hot_deal_end_at: moment(
                request.body.hot_deal_end_at
              ).toISOString(),
              modified_at: moment().toISOString(),
            },
          });

          await fastify.prisma.item_properties.deleteMany({
            where: { item_id: id },
          });

          if (item_properties && item_properties.length > 0) {
            for (const prop of item_properties) {
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

          await fastify.prisma.item_features.deleteMany({
            where: { item_id: id },
          });

          if (item_features && item_features.length > 0) {
            for (const feature of item_features) {
              await fastify.prisma.item_features.create({
                data: {
                  name: feature.name,
                  icon_url: feature.icon_url || null,
                  mdi_icon: feature.mdi_icon || null,
                  item_id: updatedItem.id,
                  created_at: moment().toISOString(),
                },
              });
            }
          }

          await fastify.prisma.item_images.deleteMany({
            where: { item_id: id },
          });

          if (item_images && item_images.length > 0) {
            for (const image of item_images) {
              await fastify.prisma.item_images.create({
                data: {
                  image_url: image.image_url,
                  item_id: updatedItem.id,
                  created_at: moment().toISOString(),
                },
              });
            }
          }

          await fastify.prisma.item_embeds.deleteMany({
            where: { item_id: id },
          });

          if (item_embeds && item_embeds.length > 0) {
            for (const embed of item_embeds) {
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
