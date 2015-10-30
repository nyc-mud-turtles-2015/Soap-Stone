class AddAttachmentPhotoToDrops < ActiveRecord::Migration
  def self.up
    change_table :drops do |t|
      t.attachment :photo
    end
  end

  def self.down
    remove_attachment :drops, :photo
  end
end
