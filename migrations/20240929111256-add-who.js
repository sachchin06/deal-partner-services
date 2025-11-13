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
  return db.createTable("who", {
    id: {
      type: "int",
      unsigned: true,
      notNull: true,
      primaryKey: true,
      autoIncrement: true,
    },
    key: {
      type: "string",
      notNull: true,
    },
    value: {
      type: "text",
      null: true,
    },
    is_enabled: {
      type: "boolean",
      defaultValue: true,
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
  return db.dropTable("who");
};

exports._meta = {
  version: 1,
};
