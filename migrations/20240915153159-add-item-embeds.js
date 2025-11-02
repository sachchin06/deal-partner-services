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
  return db.createTable("item_embeds", {
    id: {
      type: "int",
      unsigned: true,
      notNull: true,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: "string",
      notNull: true,
    },
    html: {
      type: "text",
      null: true,
    },
    item_id: {
      type: "int",
      notNull: true,
      unsigned: true,
      foreignKey: {
        name: "items_item_embeds_id_foreign",
        table: "items",
        rules: {
          onDelete: "CASCADE",
          onUpdate: "RESTRICT",
        },
        mapping: "id",
      },
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
  return db.dropTable("item_embeds");
};

exports._meta = {
  version: 1,
};
