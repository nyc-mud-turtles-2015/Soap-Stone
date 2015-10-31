class DeletePgisFieldsAddLatLon < ActiveRecord::Migration
  def change
  	remove_column :drops, :lonlat
  	add_column :drops, :lon, :float
  	add_column :drops, :lat, :float
  end
end
