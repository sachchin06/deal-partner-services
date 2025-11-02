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
  return db.createTable("item_features", {
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
    icon_url: {
      type: "text",
      null: true,
    },
    item_id: {
      type: "int",
      notNull: true,
      unsigned: true,
      foreignKey: {
        name: "items_item_features_id_foreign",
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
  return db.dropTable("item_features");
};

exports._meta = {
  version: 1,
};
