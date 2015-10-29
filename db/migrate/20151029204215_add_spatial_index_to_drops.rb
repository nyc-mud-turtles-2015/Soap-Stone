class AddSpatialIndexToDrops < ActiveRecord::Migration
  def change
    add_index :drops, :lonlat, using: :gist
  end
end
