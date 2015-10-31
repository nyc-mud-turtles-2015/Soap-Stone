
class DropsController < ApplicationController

  def new
    @drop = Drop.new
  end

  def index
    drops = Drop.order("created_at DESC").limit(50).to_json
    render json: drops
  end

  def show
    drop = Drop.find(params[:id])
    drop.current_user = User.first
    render json: drop.show_json
  end

  def create
    drop = current_user.drops.new(drop_params)
    if drop.save
      render plain: {success: true}.to_json
    else
      render plain: {failure: drop.errors.full_messages.join(",")}.to_json, status: 500
    end
  end

  def drop_params 
    params.require(:drop).permit(:photo, :text)
      .merge(lonlat: Drop.create_lonlat(params[:drop][:coords]))
  end
end
