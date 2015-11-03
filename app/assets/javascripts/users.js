SoapStone.User = function(args) {
  if (args) {
    this.setAttributes(args);
  }
};

SoapStone.User.prototype.setAttributes = function(args) {
  this.id = this.id || args.id;
  this.username = this.username || args.username;
  this.avatar = this.avatar || args.avatar;
  if (this.id) {
    this.hue = this.calculateUserColor(this.id);
  }
  this.followers = this.followers || args.followers;
  this.followees = this.followers || args.followees;
  this.drops = this.drops || args.drops;
};

SoapStone.User.prototype.calculateUserColor = function (userId) {
  Math.seedrandom(userId);
  return Math.floor(Math.random() * 359) + 1;
};

SoapStone.User.prototype.loadDrops = function(id) {
  var self = this;
  return new Promise(function(resolve, reject) {
    $.ajax({
      type: "GET",
      url: "/users/" + id + "/drops",
      dataType: "json"
    })
    .then(function (response) {
      self.drops = response.drops;
      resolve(self);
    })
    .fail(function () {
      reject();
    });
  });
};

SoapStone.User.prototype.loadFollows = function(id) {
  var self = this;
  return new Promise(function(resolve, reject) {
    $.ajax({
      type: "GET",
      url: "/users/" + id + "/follows",
      dataType: "json"
     })
    .then(function (response) {
      self.followees = response.followees;
      self.followers = response.followers;
      resolve(self);
    })
    .fail(function () {
      reject();
    });
  });
};

SoapStone.UserView = function() {
  var showTemplateSource   = $("[data-template='show-user']").html();
  this.showTemplate = Handlebars.compile(showTemplateSource);
  this.setUpEventHandlers();
};

SoapStone.UserView.prototype.showFollows = function (user) {
  var followerItems = $(document.createDocumentFragment());
  var followeeItems = $(document.createDocumentFragment());
  var self = this;
  user.followers.forEach( function (follower) {
    followerItems.append(self.showTemplate(follower));
  });
  $("[data-role='follower-list']").html(followerItems);
  user.followees.forEach( function (followee) {
    followeeItems.append(self.showTemplate(followee));
  });
  $("[data-role='followee-list']").html(followeeItems);
};

SoapStone.UserView.prototype.setUpEventHandlers = function(){
  $("#followers").on('click', function(event){
    event.preventDefault();
    SoapStone.app.userView.showFollowers(SoapStone.app.user);
  });

  $("#followees").on('click', function(event){
    event.preventDefault();
    SoapStone.app.userView.showFollowees(SoapStone.app.user);
  });

  $("#drops").on('click', function(event){
    debugger;
    event.preventDefault();
    var id = location.href.split('/').slice(-1); //WET code same line as 66
    window.location.href = "/?user_id="+id;
  });
};

SoapStone.UserView.prototype.showFollowers = function(user) {
  var self = this;
  var followerItems = $(document.createDocumentFragment());
  user.followers.forEach( function (follower) {
    followerItems.append(self.showTemplate(follower));
  });
  $(".user").hide();
  $('body').append(followerItems);
  $("[data-button='close-follow']").on('click', function (event) {
    self.closeFollows();
  });
};

SoapStone.UserView.prototype.showFollowees = function(user) {
  var self = this;
  var followeeItems = $(document.createDocumentFragment());
  user.followees.forEach( function (followee) {
    followeeItems.append(self.showTemplate(followee));
  });
  $(".user").hide();
  $('body').append(followeeItems);
  $("[data-button='close-follow']").on('click', function (event) {
    self.closeFollows();
  });
};

SoapStone.UserView.prototype.closeFollows = function () {
  $("[data-view='user']").remove();
  $(".user").show();
};
