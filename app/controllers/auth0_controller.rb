class Auth0Controller < ApplicationController
  def callback
    user = User.find_or_create_by(uid: request.env['omniauth.auth']['uid'])
    user.avatar = request.env['omniauth.auth']['info']['image']
    user.username = request.env['omniauth.auth']['info']['name']
    user.save
    session[:user_id] = user.id
    session[:username] = user.username
    redirect_to root_path
  end

  def failure
    @error_msg = request.params['message']
  end
end
