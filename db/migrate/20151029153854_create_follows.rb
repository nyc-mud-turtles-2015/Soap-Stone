class CreateFollows < ActiveRecord::Migration
  def change
    create_table :follows do |t|
      t.integer :follower_id, null: false, index: true, foreign_key: :user
      t.integer :followee_id, null: false, index: true, foreign_key: :user

      t.timestamps null: false
    end
  end
end
