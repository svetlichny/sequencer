String.prototype.to_i = function (){
  return parseInt(this);
}
function barInterval (){
  if (this.justStarted) {
    this.justStarted = false;
    return 0;
  } else {
    return this.meter.beat/this.meter.value*noteLength.call(this, 1);
  }
}
function noteLength (value) {
  return 60/this.meter.original.bpm*4000/value;
};
function browserFormat () {
  if ($.browser.safari) {
    return ".mp3";
  } else {
    return ".wav";
  }
};
function toggleValue () {
  if ($(this).attr('data-value') == 0) {
    $(this).attr('data-value', 1);
  } else {
    $(this).attr('data-value', 0);
  }
};
