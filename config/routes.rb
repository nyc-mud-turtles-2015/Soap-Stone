Rails.application.routes.draw do
  root 'maps#index'

  resources :maps, only: [:index]
  get "/drops/followees" => 'drops#followees'
  resources :users, only: [:show] do
    resources :follows, only: [:index]
  end

  resources :follows, only: [:create, :destroy]
  resources :drops, only: [:new, :index, :show, :create] do
    resources :comments, only: [:create]
    resources :snaps, only: [:create]
  end

  get "/login", :to => 'sessions#new', :as => 'login'
  get "/auth/auth0/callback" => "auth0#callback"
  get "/auth/failure" => "auth0#failure"

end
