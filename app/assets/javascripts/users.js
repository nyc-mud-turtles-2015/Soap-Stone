SoapStone.User = function(args) {
  if (args) {
    this.setAttributes(args);
  }
};

SoapStone.User.prototype.setAttributes = function(args) {
  this.followers = this.followers || args.followers;
  this.followees = this.followers || args.followees ;
  this.drops = this.drops || args.drops;
},

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

SoapStone.Controller = function() {
  this.user = new SoapStone.User();
  this.userView = new SoapStone.UserView();
  Promise.all([this.loadFollows(), this.loadDrops()]).then(function() {
    //viewstuff
  })
};

SoapStone.Controller.prototype.loadDrops = function () {
  var self = this;
  id = location.href.split('/').slice(-1);
  return this.user.loadDrops(id);
}

SoapStone.Controller.prototype.loadFollows = function() {
  var self = this;
  id = location.href.split('/').slice(-1);
  return this.user.loadFollows(id);  
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
    event.preventDefault();
    SoapStone.app.userView.showMap(SoapStone.app.user);
    // So($(event.target).serializeArray()[2]);
  });
};

// SoapStone.Controller.prototype.createfollow = function(followParams) {
//   var follow = new SoapStone.Follow({followee_id: followParams.value});
//   debugger;
//   follow.save()
//   .then(function(response) {console.log(response);})
//   .fail(function(response) {console.log(response);});
// };

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

SoapStone.UserView.prototype.showMap = function(user) {
  var self = this;
  $(".user").hide();
  debugger
  $('body').append("<p>yes?</p>");
  $("[data-button='close-follow']").on('click', function (event) {
    self.closeFollows();
  });
}


SoapStone.UserView.prototype.closeFollows = function () {
  $("[data-view='user']").remove();
  $(".user").show();
}
