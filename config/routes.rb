Rails.application.routes.draw do
  resources :maps, only: [:index]

  get '/login', :to => 'sessions#new', :as => 'login'
  get "/auth/auth0/callback" => "auth0#callback"
  get "/auth/failure" => "auth#failure"
end
