class CreateComments < ActiveRecord::Migration
  def change
    create_table :comments do |t|
      t.integer :drop_id, null: false, index: true, foreign_key: true
      t.integer :user_id, null: false, index: true, foreign_key: true
      t.string :text, null: false

      t.timestamps null: false
    end
  end
end
