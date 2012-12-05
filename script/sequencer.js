Sequencer.prototype.listenContols = function () {
  var sequencer = this;
  $(document).ready(function() {
    sequencer.meter.find("select").each(function() {
      $(this).change(function() {
        var optionName = $(this).attr("id").split("_")[1];
        sequencer.original[optionName] = parseInt($(this).find("option:selected").text());
        sequencer.buildGrid();
      });
    });
    var selector = $(sequencer.grid[0].parentNode).find("li");
    $(selector).live("click", function () {
      if ($(this).attr('data-value') == 0) {
        $(this).attr('data-value', 1);
      } else {
        $(this).attr('data-value', 0);
      }
      sequencer.createBar();
    });
  });
}
Sequencer.prototype.createBar = function() {
  var sequencer = this;
  sequencer.bar = [];
  for (var i = 0; i < sequencer.grid.length; i++) {
    sequencer.bar.push(parseInt(sequencer.grid[i].attributes['data-value'].value));
  }
};
Sequencer.prototype.buildGrid = function() {
  var gridParent = this.grid[0].parentNode;
  $(gridParent).empty();
  this.grid = [];
  for (var i = 0; i < this.beat(); i++) {
    var newNote = $('<li data-value="0"/>').appendTo($(gridParent))[0];
    this.grid.push(newNote);
    if (i == this.beat() - 1)
      this.createBar();
  };
};
Sequencer.prototype.originalOptionFinder = function (option) {
  this.original[option] = this.original[option] || this.meter.find("#bar_" + option).val().to_i();
  return this.original[option];
}
Sequencer.prototype.value  = function() {
  return 16;
};
Sequencer.prototype.beat = function() {
  return this.originalOptionFinder('beat') * this.value() / this.originalOptionFinder('value');
};
Sequencer.prototype.blink = function(index) {
  var sequencer = this;
  if (sequencer.bar[index]){
    $(sequencer.grid[index]).attr("id", "on");
    var timeout = window.setTimeout(function() {
      $(sequencer.grid[index]).attr("id", "");
      window.clearTimeout(timeout);
    }, 100);
  }
};
function Sequencer (meterTrigger, gridWrapper){
  this.meter = meterTrigger;
  this.bar = [];
  this.grid = [];
  for (var i = 0; i < gridWrapper.length; i++) {
    this.grid.push(gridWrapper[i]);
  };
  this.buildGrid();
  this.listenContols();
  return this;
}


