class DropsController < ApplicationController
  FEET_TO_MILES = 0.000189394
  CLICKABLE_DISTANCE = 330 * FEET_TO_MILES

  def new
    @drop = Drop.new
  end

  def index
    current_location = [params[:lat].to_f, params[:lon].to_f]
    clickable = Drop.clickable(current_location)
    outside = Drop.outside(current_location)
    render plain: [clickable, outside]
    .to_json(methods: [:distance], include: {user: { only: [:username, :avatar, :id] } })
  end

  def followees
    current_location = [params[:lat].to_f, params[:lon].to_f]
    target_ids = current_user.followees.map{|followee| followee.id}
    clickable = Drop.clickable(current_location, target_ids)
    outside = Drop.outside(current_location, target_ids)
    render plain: [clickable, outside]
    .to_json(methods: [:distance], include: {user: { only: [:username, :avatar, :id] } })
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
