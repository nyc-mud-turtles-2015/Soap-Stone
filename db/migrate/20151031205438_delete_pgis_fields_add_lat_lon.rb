class DeletePgisFieldsAddLatLon < ActiveRecord::Migration
  def change
  	add_column :drops, :lon, :float
  	add_column :drops, :lat, :float
  end
end
