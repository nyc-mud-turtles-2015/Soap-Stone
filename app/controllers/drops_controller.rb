class DropsController < ApplicationController
  FEET_TO_MILES = 0.000189394
  CLICKABLE_DISTANCE = 330 * FEET_TO_MILES

  def new
    @drop = Drop.new
  end

  def index
    current_location = [params[:lat].to_f, params[:lon].to_f]
    if params[:user_id]
      i = params[:user_id].to_i
      available_drops = Drop.collect_drops(current_location,[i])
      render json: available_drops
      .to_json(include: {user: { only: [:username, :avatar, :id] } })
    else
      available_drops = Drop.collect_drops(current_location)
      render json: available_drops
      .to_json(include: {user: { only: [:username, :avatar, :id] } })
    end
  end

  def followees
    current_location = [params[:lat].to_f, params[:lon].to_f]

    target_ids = current_user.followees.pluck(:id)
    available_drops = Drop.collect_drops(current_location, target_ids)
    render json: available_drops
    .to_json(include: {user: { only: [:username, :avatar, :id] } })
  end

  def show
    drop = Drop.find(params[:id])
    drop.current_user = current_user
    render json: drop.show_json
  end

  def create
    drop = current_user.drops.new(drop_params)
    if drop.save
      render json: {user_id: current_user.id}.to_json
    else
      render plain: {failure: drop.errors.full_messages.join(",")}.to_json, status: 500
    end
  end

  def drop_params
    params.require(:drop).permit(:photo, :text, :lon, :lat)
  end
end
