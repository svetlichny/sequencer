Machine.prototype = {
  stopped: true,
  justStarted: true,
  grid: [],
  bar: [],
  start: function () {
    if (this.stopped == true) {
      this.stopped = false;
      return this.mainLoop();
    }
  },
  stop: function () {
    this.stopped = true;
    this.justStarted = true;
    window.clearTimeout(this.timeout);
    this.stopBar();
  },
  mainLoop: function () {
    var machine = this;
    this.timeout = window.setTimeout(function() {
      machine.runMainLoop();
    }, barInterval.call(this));  
    return this;
  },
  runMainLoop: function () {
    if (this.stopped) return;
    if (!this.justStarted && this.barNotes)
      this.stopBar();
    this.innerLoop();
    return this.mainLoop();
  },
  innerLoop: function () {
    var machine = this;
    machine.barNotes = [];
    for (var i = 0; i < machine.meter.beat; i++) {
      (function(i) {
        machine.barNotes[i] = window.setTimeout(function() {
          machine.playNote(i);
          machine.blink(i);
        },i*noteLength.call(machine, machine.meter.value));
      })(i);
    }
  }
};

function Machine (meter, gridList) {
  this.getParameters(meter);
  this.sound('high');
  this.sound('med');
  this.sound('low');
  for (var i = 0; i < gridList.length; i++) {
    this.grid.push(gridList[i]);
  };
  this.buildGrid();
  this.listenGrid(gridList);
  return this;
};

Machine.prototype.adjustParameters = function() {
  var parameters = ['beat', 'value'];
  for (var i = 0; i < parameters.length; i++) {
    this.meter[parameters[i]] = this.meter.original[parameters[i]] * this.meter.original.step / this.meter.original.value;
  }
};
Machine.prototype.getParameters = function (meter) {
  this.meter = {};
  this.meter.original = {};
  var originalParameters = ['beat', 'value', 'accent', 'step', 'bpm'];

  function getOriginalParemeters(parameter) {
    this.meter.original[parameter] = this.meter.original[parameter] || $(meter).find('#bar_' + parameter).val().to_i();
    return this.meter.original[parameter];
  };

  for (var i = 0; i < originalParameters.length; i++) {
    getOriginalParemeters.call(this, originalParameters[i]) 
  }
  this.adjustParameters();
  this.listenControls(meter);
};
Machine.prototype.listenControls = function (meter) {
  var machine = this;
  if ($("#bar_value").val().to_i() <= 4){
    $("#bar_accent").attr("disabled", "disabled");
  }
  $(meter).find("select, input").each(function() {
    $(this).bind('keyup change input', function() {
      var optionName = $(this).attr("id").split("_")[1];
      machine.meter.original[optionName] = $(this).val().to_i();
      machine.adjustParameters();
      if (optionName == 'value' && $(this).val().to_i() <= 4) {
        $("#bar_accent").attr("disabled", "disabled");
      } else if (optionName == 'value' && $(this).val().to_i() > 4) {
        $("#bar_accent").removeAttr("disabled");
      }
      if (optionName != 'bpm' && optionName != 'accent') {
        machine.buildGrid();
      }
    });
  });
  $(meter).find('.btn').each(function() {
    var action = $(this).attr('id');
    $(this).click(function() {
      machine[action].call(machine);
      return false;
    });
  });
};
Machine.prototype.listenGrid = function(gridList) {
  var selector = $(gridList[0].parentNode).find("li");
  $(selector).live("click", function () {
    if ($(this).attr('data-value') == 0) {
      $(this).attr('data-value', 1);
    } else {
      $(this).attr('data-value', 0);
    }
    machine.createBar();
  });
};
Machine.prototype.stopBar = function() {
  for (var i = 0; i < this.barNotes.length; i++)
    window.clearTimeout(this.barNotes[i]);
};
Machine.prototype.playNote = function(index) {
  if (index == 0) {
    this.high.play();
  } else if (!(index%(this.meter.value/this.meter.original.accent)) && index != 0) {
    this.low.play();
  }
};
Machine.prototype.sound = function(height){
  this[height] = this[height] || new Audio("audio/" + height + browserFormat());
  return this[height];
};
Machine.prototype.buildGrid = function() {
  var gridParent = this.grid[0].parentNode;
  $(gridParent).empty();
  this.grid = [];
  for (var i = 0; i < this.meter.beat; i++) {
    var newNote = $('<li data-value="0"/>').appendTo($(gridParent))[0];
    this.grid.push(newNote);
    if (i == this.meter.beat - 1)
      this.createBar();
  };
};
Machine.prototype.blink = function(index) {
  var machine = this;
  if (machine.bar[index]){
    $(machine.grid[index]).attr("id", "on");
    var timeout = window.setTimeout(function() {
      $(machine.grid[index]).attr("id", "");
      window.clearTimeout(timeout);
    }, 100);
  }

};

Machine.prototype.createBar = function() {
  var machine = this;
  machine.bar = [];
  for (var i = 0; i < machine.grid.length; i++) {
    machine.bar.push(machine.grid[i].attributes['data-value'].value.to_i());
  }
  $(this).trigger("ready.grid");
};
$(document).ready(function () {
  var gridList = document.getElementById('sequencer').children[0].children;
  var controls = document.getElementById("meter");
  machine = new Machine(controls, gridList);
;})
