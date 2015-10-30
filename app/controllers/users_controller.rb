class UsersController < ApplicationController

  def show
    @user = User.find_by(id: params[:id])
  end

  private

  def user_params
    params.require(:user).permit(:username, :uid)
  end
end
