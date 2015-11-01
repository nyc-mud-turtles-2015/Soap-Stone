class SnapsController < ApplicationController
  def create
    if request.xhr?
      drop = Drop.find(params[:drop_id])
      snap = drop.snaps.new(user: current_user)
      if snap.save
        render plain: {success: true}.to_json
      else
        render plain: {failure: drop.errors.full_messages.join(",")}.to_json, status: 500
      end
    end
  end
end
