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
  return Promise.all([
    db.addColumn("item_features", "mdi_icon", {
      type: "text",
      null: true,
    }),
  ]);
};

exports.down = function (db) {
  return db.removeColumn("item_features", "mdi_icon");
};

exports._meta = {
  version: 1,
};
