class Drop < ActiveRecord::Base
  
  FEET_TO_MILES = 0.000189394
  CLICKABLE_DISTANCE = 330 * FEET_TO_MILES

  attr_reader :distance
  attr_accessor :current_user

  belongs_to :user
  has_many :comments
  has_many :snaps
  
  validates :user, presence: true
  validate :has_some_content
  
  has_attached_file :photo, styles: { medium: "640x640>", thumb: "292x292>" }, default_url: "/images/:style/missing.png",
                    :storage => :s3,
                    :s3_credentials => Proc.new{|a| a.instance.s3_credentials }
  validates_attachment_content_type :photo, content_type: /\Aimage\/.*\Z/
  
  acts_as_mappable :default_units => :miles,
                   :default_formula => :sphere,
                   :lat_column_name => :lat,
                   :lng_column_name => :lon

  def self.clickable(origin, allowed_users_filter = nil)
    if (allowed_users_filter)
      clickable_drops = Drop.within(CLICKABLE_DISTANCE, :origin => origin)
      .where(user: allowed_users_filter)
      .by_distance(:origin => origin)
      .includes(:user)
      .limit(50)
    else
      clickable_drops = Drop.within(CLICKABLE_DISTANCE, :origin => origin)
      .by_distance(:origin => origin)
      .includes(:user)
      .limit(50)
    end
    include_distances(clickable_drops, origin)
  end


  def self.outside(origin, allowed_users_filter = nil)
    if (allowed_users_filter)
      clickable_drops = Drop.beyond(CLICKABLE_DISTANCE, :origin => origin)
      .where(user: allowed_users_filter)
      .by_distance(:origin => origin)
      .includes(:user)
      .limit(100)
    else
      clickable_drops = Drop.beyond(CLICKABLE_DISTANCE, :origin => origin)
      .by_distance(:origin => origin)
      .includes(:user)
      .limit(100)
    end
    include_distances(clickable_drops, origin)  
  end


  def has_some_content
    unless photo || text
      errors.add(:drop, "you need something in here to drop some sick art")
    end
  end

  def snapped_by?(user = nil)
    user ||= current_user
    snaps.pluck(:user_id).include?(user.id)
  end

  def show_json
    to_json(methods: :snapped_by?,
      only: [:id, :photo, :text, :created_at, :lon, :lat, :snaps_count, :comments_count],
      include: {
        user:     { only: [:username, :avatar] },
        comments: { only: [:text, :created_at],
          include: { user: { only: [:username, :avatar, :id] } }
        } }
        )
  end


  def s3_credentials
    {
      bucket: Rails.application.secrets.s3_bucket,
      access_key_id: Rails.application.secrets.s3_key_id,
      secret_access_key: Rails.application.secrets.s3_secret_key
    }
  end

  def with_distance(origin)
    @distance = distance_from(origin)
    self
  end

  private

  def self.include_distances(drops, origin)
    drops.map{ |drop| drop.with_distance(origin)}
  end

end
