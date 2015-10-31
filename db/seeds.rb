# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)

def seed!

  # create users
  5.times do
    User.create(username: random_name, avatar: random_avatar, uid: random_uid)
  end
  users = User.all

  # create drops
  60.times do
    lon, lat = random_location
    Drop.create(user: users.sample, text: random_text, lon: lon, lat: lat)
  end
  drops = Drop.all

  # follow users
  users.each do |user|
    users_to_follow = users.to_a.dup.reject{ |other_user| user == other_user }.sample(rand(2..4))
    users_to_follow.each{ |other_user| user.followees << other_user } 
  end

  # create comments and snaps
  drops.each do |drop|
    (rand(0..3)).times do
      drop.comments.create(text: random_comment, user: users.sample)
    end
    snappers = users.sample(rand(0..(users.count)))
    snappers.each do |snapper|
      drop.snaps.create(user: snapper)
    end
  end
end

def random_name
  Faker::Name.name
end

def random_avatar
  Faker::Avatar.image(Faker::Number.number(10),"50x50")
end

def random_uid
  Faker::Number.number(20)
end

def random_text
  "#{Faker::Hacker.adjective} #{Faker::Hacker.noun}".titleize
end

def random_comment
  "#{Faker::Hacker.say_something_smart}"
end

def random_location
  lon = -74.0092818 + rand((-0.001)..(0.001))
  lat =  40.7062564 + rand((-0.001)..(0.001))
  [lon, lat]
end

seed!

