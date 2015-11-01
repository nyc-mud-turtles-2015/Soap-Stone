SoapStone.User = function(args) {
  this.username = args.username;
};



SoapStone.UserView = function() {
  this.setUpEventHandlers()
};

SoapStone.UserView.prototype.setUpEventHandlers = function(){
  $("[data-role='follow']").on('click', function(event){
    debugger;
    var followee = event.target.value;
    debugger;
    $("[data-role='follow']").hide();
    $("[data-role='unfollow']").show();\
    SoapStone.app.createFollow({user: user}
  })
  
  $("[data-role='unfollow']").on('click', function(event){
    $("[data-role='unfollow']").hide();
    $("[data-role='follow']").show();
  })
};

SoapStone.Controller = function() {
  this.view = new SoapStone.UserView();
  this.view.controller = this;
};

SoapStone.Controller.prototype.createfollow = function(followParams) {
  var follow = new SoapStone.Follow(followParams);
  debugger;
  follow.save()
  .then(function(response) {console.log(response);})
  .fail(function(response) {console.log(response);});
};

SoapStone.Follow.prototype.save = function() {
  var data = {};
  data.follow = {};
  return $.ajax({
    type: "POST",
    url:  "/drops",
    data: data
  });
};


//this needs to go in the event handler for form posting
// $( document ).ready(function() {
//   SoapStone.app = new SoapStone.Controller();
// });
