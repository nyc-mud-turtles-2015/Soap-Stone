class CreateUsers < ActiveRecord::Migration
  def change
    create_table :users do |t|
      t.string :username, null: false, uniqueness: true, index: true
      t.string :avatar, null: false
      t.string :uid

      t.timestamps null: false
    end
  end
end
