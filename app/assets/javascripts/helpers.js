// Handlebars Helpers
Handlebars.registerHelper('pluralize', function(count, singular, plural, wordOnly) {
  if (count === 1) {
    if (wordOnly) {return singular;}
    return String(count) + " " + singular;
  } else {
    if (typeof plural === "string") {
      if (wordOnly) {return plural;}
      return String(count) + " " + plural;
    } else {
      return String(count) + " " + singular + "s";
    }
  }
});

Handlebars.registerHelper('dist', function(miles, part) {
  var MILES_TO_FEET = 5280;
  if (miles >= 1) {
    if (part && part == "number") { return String(miles.toFixed(1)); }
    if (part && part == "unit")   { return "miles"; }
    return  miles.toFixed(1) + " miles";
  }
  else{
    var feet = Math.round(miles * MILES_TO_FEET);
    if (part && part == "number") { return String(feet); }
    if (part && part == "unit")   { return (feet == 1) ? "foot" : "feet"; }
    return (feet == 1) ? "1 foot" : feet + " feet";
  }
});

Handlebars.registerHelper('timeAgo', function(time, part) {
  var units = [
    { name: "second", limit: 60, in_seconds: 1 },
    { name: "minute", limit: 3600, in_seconds: 60 },
    { name: "hour", limit: 86400, in_seconds: 3600  },
    { name: "day", limit: 604800, in_seconds: 86400 },
    { name: "week", limit: 2629743, in_seconds: 604800  },
    { name: "month", limit: 31556926, in_seconds: 2629743 },
    { name: "year", limit: null, in_seconds: 31556926 }
  ];
  var diff = (new Date() - new Date(time)) / 1000;
  if (diff < 5 && part == "unit");
  if (diff < 5) return "now";

  var i = 0, unit;
  while (unit = units[i++]) {
    if (diff < unit.limit || !unit.limit){
      diff =  Math.floor(diff / unit.in_seconds);
      if (part && part == "number") { return String(diff); }
      if (part && part == "unit")   { return unit.name + (diff>1 ? "s ago" : " ago"); }
      return diff + " " + unit.name + (diff>1 ? "s ago" : " ago");
    }
  }
});

// Array helpers
Array.prototype.updateDropsArray = function (func, oldArray, otherArray, limit){
  var newArray = this;
  newArray.forEach(function(dropData){
    // console.log(dropData)
    if ($.inArray(dropData.id, oldArray.map(function(obj){return obj.id;})) == -1 ){//its not in the clickable drops so add it
        if (oldArray.length>=limit){
          oldArray.pop();
        }//check the threshold and see the length of clickable
        func(dropData);
      }
    var outIndex =  $.inArray(dropData.id, otherArray.map(function(obj){return obj.id;}));
    if (outIndex != -1){//it was outside but now inside so remove that from the old outside
      debugger;
      var kill = oldArray[outIndex];
      kill.marker.setMap(null);//not needed but take it off the map before destorying incase of ZOMBIE points
      // delete kill; 
      oldArray.splice(outIndex,1);
    }
  });
};

// jQuery helpers
$.fn.exists = function () {
    return this.length !== 0;
};

function debounce(func, delay){
  var timeoutID = null;
  return function(){
      var context = this, args = arguments;
      clearTimeout(timeoutID);
      timeoutID = setTimeout(function(){
        func.apply(context, args);
      }, delay);
    };
};
