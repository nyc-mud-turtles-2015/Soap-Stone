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

  def me
    redirect_to user_path(current_user)
  end

  def search
    query_name = params[:query]
    target = User.find_by(username: query_name)
    if target
      render json: {user_id: target.id}
    else
      status 404
    end
  end

  def filter
    users = []
    if params[:query] && params[:query].length > 0
      users = User.where('UPPER(username) LIKE UPPER(?)', params[:query]+"%")
      .limit(6) 
    end
    render json: {users: users}
  end

end
