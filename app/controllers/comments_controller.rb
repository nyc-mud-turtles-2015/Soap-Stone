class CommentsController < ApplicationController
  def create
    if request.xhr?
      drop = Drop.find(params[:comment_id])
      comment = drop.comments.build(user: current_user)
      if comment.save
        render plain: {success: true}.to_json
      else
        render plain: {failure: drop.errors.full_messages.join(",")}.to_json, status: 500
      end
    end
  end
end
