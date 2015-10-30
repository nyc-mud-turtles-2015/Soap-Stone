Rails.application.routes.draw do
  resources :maps, only: [:index]
end
