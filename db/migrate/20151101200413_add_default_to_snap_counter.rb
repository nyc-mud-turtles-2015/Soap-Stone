class AddDefaultToSnapCounter < ActiveRecord::Migration
  def change
    change_column :drops, :snaps_count, :integer, default: 0
    change_column :drops, :comments_count, :integer, default: 0
  end
end
