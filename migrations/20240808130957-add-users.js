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
  return db.createTable("users", {
    id: {
      type: "int",
      unsigned: true,
      notNull: true,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: "string",
      notNull: true,
      unique: true,
    },
    user_name: {
      type: "string",
      notNull: true,
      unique: true,
    },
    display_name: {
      type: "string",
      null: true,
    },
    otp: {
      type: "string",
      null: true,
    },
    otp_count: {
      type: "int",
      null: true,
    },
    last_otp_at: {
      type: "timestamp",
      timezone: true,
      null: true,
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
  return db.dropTable("users");
};

exports._meta = {
  version: 1,
};
