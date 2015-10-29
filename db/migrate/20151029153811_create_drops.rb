class CreateDrops < ActiveRecord::Migration
  def change
    create_table :drops do |t|
      t.integer :user_id, null: false, index: true, foreign_key: true
      t.string :text  #need atleast a text or a photo
      t.string :photo
      t.integer :snaps_count
      t.integer :comments_count
      t.st_point :lonlat, geographic: true

      t.timestamps null: false
    end
  end
end
