class Snap < ActiveRecord::Base
  belongs_to :drop, counter_cache: true
  belongs_to :user
  validates :drop, :user, presence: true
  validates :drop, uniqueness: {scope: :user, message: "you have already snapped dis piece"}  
end
