Rails.application.routes.draw do
  root 'maps#index'

  resources :maps, only: [:index]
  resources :drops, only: [:show, :create]

  get "/login", :to => 'sessions#new', :as => 'login'
  get "/auth/auth0/callback" => "auth0#callback"
  get "/auth/failure" => "auth0#failure"

end
