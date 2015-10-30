class DropsController < ApplicationController

  def show
    drops = Drop.order("created_at DESC").limit(50).to_json
    render json: drops
  end

  def drop_params
    params.require(:drop).permit(:photo)
  end
  
end
