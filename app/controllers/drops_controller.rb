class DropsController < ApplicationController
  CLICKABLE_DISTANCE = 330 * 0.000189394 #feet to miles

  def new
    @drop = Drop.new
  end

  def index
    clickable = Drop.within(CLICKABLE_DISTANCE, :origin => [params[:lat].to_f, params[:lon].to_f]).order(created_at: :desc).limit(50)
    outside = Drop.beyond(CLICKABLE_DISTANCE, :origin => [params[:lat].to_f, params[:lon].to_f]).order(created_at: :desc).limit(100)
    total = [clickable,outside]
    total.to_json
    render json: total
  end

  def followees
    target_ids = current_user.followees.map{|followee| followee.id}
    clickable = Drop.where(user_id: target_ids).within(CLICKABLE_DISTANCE, :origin => [params[:lat].to_f, params[:lon].to_f]).order(created_at: :desc).limit(50)
    outside = Drop.where(user_id: target_ids).beyond(CLICKABLE_DISTANCE, :origin => [params[:lat].to_f, params[:lon].to_f]).order(created_at: :desc)
    total = [clickable,outside]
    total.to_json
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
