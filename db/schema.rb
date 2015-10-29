# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20151029204215) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"
  enable_extension "postgis"

  create_table "comments", force: :cascade do |t|
    t.integer  "drop_id",    null: false
    t.integer  "user_id",    null: false
    t.string   "text",       null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  add_index "comments", ["drop_id"], name: "index_comments_on_drop_id", using: :btree
  add_index "comments", ["user_id"], name: "index_comments_on_user_id", using: :btree

  create_table "drops", force: :cascade do |t|
    t.integer   "user_id",                                                                 null: false
    t.string    "text"
    t.string    "photo"
    t.integer   "snaps_count"
    t.integer   "comments_count"
    t.geography "lonlat",         limit: {:srid=>4326, :type=>"point", :geographic=>true}
    t.datetime  "created_at",                                                              null: false
    t.datetime  "updated_at",                                                              null: false
  end

  add_index "drops", ["lonlat"], name: "index_drops_on_lonlat", using: :gist
  add_index "drops", ["user_id"], name: "index_drops_on_user_id", using: :btree

  create_table "follows", force: :cascade do |t|
    t.integer  "follower_id", null: false
    t.integer  "followee_id", null: false
    t.datetime "created_at",  null: false
    t.datetime "updated_at",  null: false
  end

  add_index "follows", ["followee_id"], name: "index_follows_on_followee_id", using: :btree
  add_index "follows", ["follower_id"], name: "index_follows_on_follower_id", using: :btree

  create_table "snaps", force: :cascade do |t|
    t.integer  "drop_id",    null: false
    t.integer  "user_id",    null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  add_index "snaps", ["drop_id"], name: "index_snaps_on_drop_id", using: :btree
  add_index "snaps", ["user_id"], name: "index_snaps_on_user_id", using: :btree

  create_table "users", force: :cascade do |t|
    t.string   "username",   null: false
    t.string   "avatar",     null: false
    t.string   "uid"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  add_index "users", ["username"], name: "index_users_on_username", using: :btree

end
