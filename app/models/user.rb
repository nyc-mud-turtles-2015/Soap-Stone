class User < ActiveRecord::Base
  has_many :drops
  has_many :comments
  has_many :snaps
  has_many :follower_follows, foreign_key: "followee_id", class_name: "Follow"
  has_many :followee_follows, foreign_key: "follower_id", class_name: "Follow"
  has_many :followers, through: :follower_follows, source: :follower
  has_many :followees, through: :followee_follows, source: :followee
  validates :username, :avatar, :uid, presence: true
  validates :uid, uniqueness: true

  def follow(diff_user)
    self.followee_follows.create(followee: diff_user)
  end

  def unfollow(diff_user)
    self.followee_follows.find_by(followee: diff_user).destroy
  end

  def following?(diff_user)
    self.followees.include?(diff_user)
  end

  def show_json
    to_json(methods: :following?,
      only: [:photo, :text, :created_at, :lon, :lat, :snaps_count, :comments_count],
      include: { 
        user:     { only: [:username, :avatar] }, 
        comments: { only: [:text, :created_at],
          include: { user: { only: [:username, :avatar] } }
        } }
        ) 
  end

end
