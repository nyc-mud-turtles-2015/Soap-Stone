Rails.application.routes.draw do
  resources :maps, only: [:index]

  get '/login', :to => 'sessions#new', :as => 'login'
end
