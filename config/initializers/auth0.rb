Rails.application.config.middleware.use OmniAuth::Builder do
  provider(
    :auth0,
    ENV['AUTH0_CLIENT'],
    ENV['AUTH0_SECRET'],
    'soapstone.auth0.com',
     callback_path: "/auth/auth0/callback"
  )
end
