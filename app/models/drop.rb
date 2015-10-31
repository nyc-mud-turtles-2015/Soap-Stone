class Drop < ActiveRecord::Base
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
                   # :distance_field_name => :distance,
                   :lat_column_name => :lat,
                   :lng_column_name => :lon


  attr_accessor :current_user

  def has_some_content
    unless photo || text
      errors.add(:drop, "you need something in here to drop some sick art")
    end
  end

  def snapped_by?(user=nil)
    user ||= current_user
    snaps.pluck(:user_id).include?(user.id)
  end

  def show_json
    to_json(methods: :snapped_by?,
      only: [:photo, :text, :created_at, :snaps_count, :comments_count],
      include: { 
        user:     { only: [:username, :avatar] }, 
        comments: { only: [:text, :created_at],
          include: { user: { only: [:username, :avatar] } }
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
