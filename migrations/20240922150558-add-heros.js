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
  return db.createTable("heros", {
    id: {
      type: "int",
      unsigned: true,
      notNull: true,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: "text",
      notNull: true,
    },
    sub_title: {
      type: "text",
      null: true,
    },
    image_url: {
      type: "text",
      null: true,
    },
    is_enabled: {
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
  return db.dropTable("heros");
};

exports._meta = {
  version: 1,
};
