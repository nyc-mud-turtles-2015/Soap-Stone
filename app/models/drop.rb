class Drop < ActiveRecord::Base
  
  DATA_REACH_DISTANCE = 1 #330 * FEET_TO_MILES

  attr_accessor :current_user

  belongs_to :user
  has_many :comments
  has_many :snaps
  
  validates :user, presence: true
  validate :has_some_content

  has_attached_file :photo, styles: { medium: "640x640>", thumb: "292x292>" }, 
                    :default_url => "/images/:style/missing.png",
                    :default_style => :medium,
                    :storage => :s3,
                    :s3_credentials => Proc.new{|a| a.instance.s3_credentials }
  validates_attachment_content_type :photo, content_type: /\Aimage\/.*\Z/
  
  acts_as_mappable :default_units => :miles,
                   :default_formula => :sphere,
                   :lat_column_name => :lat,
                   :lng_column_name => :lon

  def self.collect_drops(origin, allowed_users_filter = nil)
    if (allowed_users_filter)
      all_drops = Drop.within(DATA_REACH_DISTANCE, :origin => origin)
      .where(user: allowed_users_filter)
      .sort(:created_at)
      .includes(:user)
      .limit(50)
    else
      all_drops = Drop.within(DATA_REACH_DISTANCE, :origin => origin)
      .sort(:created_at)
      .includes(:user)
      .limit(50)
    end
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

  def has_photo?
    photo.exists?
  end

  def show_json
    to_json(methods: [:snapped_by?, :has_photo?],
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

end
