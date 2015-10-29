class Drop < ActiveRecord::Base
  belongs_to :user
  has_many :comments
  has_many :snaps
  validates :user, presence: true
  validate :has_some_content

  def has_some_content
    unless photo || text
      errors.add(:drop, "you need something in here to drop some sick art")
    end
  end

end
