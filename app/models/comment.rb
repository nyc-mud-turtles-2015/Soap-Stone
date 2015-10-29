class Comment < ActiveRecord::Base
  belongs_to :user
  belongs_to :drop, counter_cache: true
  validates :user, :drop, :text, presence: true
end
