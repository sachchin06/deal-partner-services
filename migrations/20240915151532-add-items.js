"use strict";

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function (db) {
  return db.createTable("items", {
    id: {
      type: "int",
      unsigned: true,
      notNull: true,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: "string",
      notNull: true,
    },
    description: {
      type: "text",
      null: true,
    },
    category_id: {
      type: "int",
      notNull: true,
      unsigned: true,
      foreignKey: {
        name: "items_categories_category_id_foreign",
        table: "categories",
        rules: {
          onDelete: "CASCADE",
          onUpdate: "RESTRICT",
        },
        mapping: "id",
      },
    },
    sub_category_id: {
      type: "int",
      null: true,
      unsigned: true,
      foreignKey: {
        name: "items_sub_categories_category_id_foreign",
        table: "sub_categories",
        rules: {
          onDelete: "CASCADE",
          onUpdate: "RESTRICT",
        },
        mapping: "id",
      },
    },
    sub_sub_category_id: {
      type: "int",
      null: true,
      unsigned: true,
      foreignKey: {
        name: "items_sub_sub_categories_category_id_foreign",
        table: "sub_sub_categories",
        rules: {
          onDelete: "CASCADE",
          onUpdate: "RESTRICT",
        },
        mapping: "id",
      },
    },
    price_lkr: {
      type: "real",
      null: true,
    },
    price_usd: {
      type: "real",
      null: true,
    },
    per_unit: {
      type: "real",
      null: true,
    },
    price_type: {
      type: "string",
      null: true,
    },
    discount_percent: {
      type: "string",
      null: true,
    },
    is_featured: {
      type: "boolean",
      defaultValue: false,
    },
    is_enabled: {
      type: "boolean",
      defaultValue: false,
    },
    hot_deal_end_at: {
      type: "timestamp",
      timezone: true,
      null: true,
    },
    is_sold: {
      type: "boolean",
      defaultValue: false,
    },
    created_at: {
      type: "timestamp",
      timezone: true,
      null: true,
    },
    modified_at: {
      type: "timestamp",
      timezone: true,
      null: true,
    },
    deleted_at: {
      type: "timestamp",
      timezone: true,
      null: true,
    },
  });
};

exports.down = function (db) {
  return db.dropTable("items");
};

exports._meta = {
  version: 1,
};
