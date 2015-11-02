class MapsController < ApplicationController
  def index
    if !logged_in?
      redirect_to login_path
    end
  end
end
