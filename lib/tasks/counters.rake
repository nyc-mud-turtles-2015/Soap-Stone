namespace :counters do
  desc "reset the database counters"
  task reset: :environment do
    Drop.find_each {|drop| Drop.reset_counters(drop.id, :snaps, :comments)}
  end
  
end