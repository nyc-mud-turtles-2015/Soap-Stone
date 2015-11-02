class CommentsController < ApplicationController
  def create
    if request.xhr?
      drop = Drop.find(params[:drop_id])
      comment = drop.comments.new(user: current_user, text: params[:comment])
      if comment.save
        render json: comment.to_json(include: :user)
      else
        render plain: {failure: drop.errors.full_messages.join(",")}.to_json, status: 500
      end
    end
  end
end
