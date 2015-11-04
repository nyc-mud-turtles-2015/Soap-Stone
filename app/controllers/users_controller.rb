class UsersController < ApplicationController

  def show
    @user = User.find(params[:id])
  end

  def edit
    @user = User.find(params[:id])
  end

  def update
    @user = User.find(params[:id]) 
    binding.pry
    if @user.update(username: params[:user][:username])
      redirect_to @user
    else
      flash.now.alert = @user.errors.full_messages.join(', ')
      render plain: {failure: @user.errors.full_messages.join(",")}.to_json, status: 422
    end
  end
end
