class UpdateUserForAuth0 < ActiveRecord::Migration
  def change
  	change_column :users, :username, :string, uniqueness: false
  	change_column :users, :uid, :string, uniqueness: true
  end
end
