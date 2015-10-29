class Follow < ActiveRecord::Base
	belongs_to :follower, class_name: "User", foreign_key: "follower_id"
	belongs_to :followee, class_name: "User", foreign_key: "followee_id"
	validates :follower, :followee, presence: true
	validates :follower, uniqueness: {scope: :followee, message: "you have already followed this person"}
	validate :no_following_self

	def no_following_self
		if follower == followee
			errors.add(:follow, "you are not allowed to follow yourself")
		end
	end	

end
