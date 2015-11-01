class FollowsController < ApplicationController

  def create
    current_user.followees << User.find(params[:id])
  end

  def destroy
    user = User.find(params[:id])
    user.followers.delete(current_user) 
  end
  
end
