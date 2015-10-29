class CreateSnaps < ActiveRecord::Migration
  def change
    create_table :snaps do |t|
      t.integer :drop_id, null: false, index: true, foreign_key: true
      t.integer :user_id, null: false, index: true, foreign_key: true

      t.timestamps null: false
    end
  end
end
