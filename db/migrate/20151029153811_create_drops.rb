class CreateDrops < ActiveRecord::Migration
  def change
    create_table :drops do |t|
      t.integer :user_id
      t.string :text
      t.string :photo

      t.timestamps null: false
    end
  end
end
