class DropsController < ApplicationController

  def new
    @drop = Drop.new
  end

  def index
    # drops = Drop.order("created_at DESC")#.limit(50)#.to_json
    clickable = Drop.within(0.2, :origin => [40.7048872, -74.0123736])#.to_json
    outside = Drop.beyond(0.2, :origin => [40.7048872, -74.0123736])
    total = []
    total << clickable
    total << outside
    total.to_json

    # binding.pry
    # render json: drops
    render json: total
  end

  def show
    drop = Drop.find(params[:id])
    drop.current_user = current_user
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
    params.require(:drop).permit(:photo, :text, :lon, :lat)
  end
end
