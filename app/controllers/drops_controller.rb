class DropsController < ApplicationController

  def show
    drops = Drop.order("created_at DESC").limit(50).to_json
    render json: drops
  end
  
end
