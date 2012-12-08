Line.prototype.createNote = function(){
  this.note = this.note || new Audio("audio/" + this.sound + browserFormat());
  return this.note;
};
Line.prototype.buildGrid = function(wrapper, meter) {
  var gridParent = $('<ul data-step=' + meter.value + ' data-sound=' + this.sound + '/>').appendTo(wrapper);
  this.grid = [];
  for (var i = 0; i < meter.beat; i++) {
    var newNote = $('<li data-value="0"/>').appendTo(gridParent)[0];
    var line = this;
    $(newNote).bind("click", function() {
      toggleValue.call(this);
      line.createBar();
    });
    this.grid.push(newNote);
    if (i == meter.beat - 1)
      this.createBar();
  };
};
Line.prototype.createBar = function() {
  this.bar = [];
  for (var i = 0; i < this.grid.length; i++) {
    this.bar.push(this.grid[i].attributes['data-value'].value.to_i());
  }
};
Line.prototype.blink = function(index) {
  var line = this;
  if (line.bar[index]) {
    line.note.play();
    $(line.grid[index]).addClass("on");
    var timeout = window.setTimeout(function() {
      $(line.grid[index]).removeClass("on");
      //line.note.pause();
      window.clearTimeout(timeout);
    }, 100);
  }
};
function Line (wrapper, meter, sound) {
  this.beat = meter.beat;
  this.sound = sound;
  this.value = meter.value;
  this.bar = [];
  this.grid = [];
  this.buildGrid (wrapper, meter);
  this.createNote ();
  return this;
}
