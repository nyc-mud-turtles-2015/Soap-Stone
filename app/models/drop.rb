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

  @@factory = RGeo::Geographic.spherical_factory(srid: 4326)

  def self.create_lonlat(coords)
    @@factory.point(coords[:longitude], coords[:latitude])
  end

  def has_some_content
    unless photo || text
      errors.add(:drop, "you need something in here to drop some sick art")
    end
  end

  def show_json
    to_json(only: [:photo, :text, :created_at],
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
