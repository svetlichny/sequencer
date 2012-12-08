Machine.prototype = {
  lines: [],
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
          if (machine.lines.length) {
            for (var j = 0; j < machine.lines.length; j++) {
              machine.lines[j].blink(i)
            }
          }
        },i*noteLength.call(machine, machine.meter.value));
      })(i);
    }
  }
};

function Machine (meter, wrapper) {
  this.wrapper = wrapper;
  this.getParameters(meter);
  return this;
};
Machine.prototype.newLine = function() {
  var line = new Line(this.wrapper, this.meter, $("#bar_note").val());
  this.lines.push(line);
};
Machine.prototype.adjustParameters = function() {
  var mainParameters = ['beat', 'value'];
  for (var i = 0; i < mainParameters.length; i++) {
    this.meter[mainParameters[i]] = this.meter.original[mainParameters[i]] * this.meter.original.step / this.meter.original.value;
  }
};
Machine.prototype.getParameters = function (meter) {
  var originalParameters = [];
  $(meter).find("select, input").each(function() {
    originalParameters.push(this.id.split("_")[1]);
  });
  this.meter = {};
  this.meter.original = {};

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
      if (machine.lines.length && optionName != 'bpm' && optionName != 'accent') {
        machine.wrapper.empty();
        for (var i = 0; i < machine.lines.length; i ++) {
          machine.lines[i].buildGrid(machine.wrapper, machine.meter);
        }
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
Machine.prototype.stopBar = function() {
  for (var i = 0; i < this.barNotes.length; i++)
    window.clearTimeout(this.barNotes[i]);
};
$(document).ready(function () {
  var gridList = $("#sequencer")
  var controls = document.getElementById("meter");
  machine = new Machine(controls, gridList);
;})
