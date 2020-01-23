var defaultRevealingModule = (function() {
  return {
  }
})();

var defaultSingleton = (function() {
  var _instance = null;

  function createInstance() {
    
  }

  function getInstance() {
    if(!_instance) {
      _instance = createInstance();
    }
    return _instance;
  }
  
  return {
    getInstance: getInstance
  }
})();

var instrument = (function() {
  var _levels = 10;
  var _notes = 12;
  var _octaves = 10;
  var _subNotes = 10;
  var _timbre = [];

  function getTimbre() {
    return _timbre;
  }

  function init() {
    for(var o = 0; o < _octaves; ++o) {
      var octave = [];
      for(var n = 0; n < _notes; ++n) {
        var note = [];
        for(var s = 0; s < _subNotes; ++s) {
          note.push(Math.floor(Math.random()*10));
        }
        octave.push(note);
      }
      _timbre.push(octave);
    }
    return this;      
  }

  function changeTimbreTone(octave, note, subnote, value) {
    if (value < _levels) {
      _timbre[octave][note][subnote] += value;
    } else {
      alert("Error: Timbre value attempted to set outside _levels.");
    }
  }

  return {
    getTimbre: getTimbre,
    init: init,
    changeTimbreTone: changeTimbreTone
  }
})();

var allInstrumentsSingleton = (function() {
  var _instance;

  function createInstance() {
    var _allInstruments = [];
    // instrument, octave, note, subnote
    var _currentIndex = {
      instrument: 0, 
      octave: 4, 
      note: 6, 
      subNote: 5
    };

    function addInstrument(instrument) {
      _allInstruments.push(instrument);
      _currentIndex.instrument = _allInstruments.length - 1;
    }
    
    function getAllInstruments() {
      return _allInstruments;
    }

    function getCurrentInstrument() {
      if(_currentIndex.instrument >= (_allInstruments.length-1)) {
        return _allInstruments[_currentIndex.instrument];
      }
      return null;
    }

    function getIndex() {
      return _currentIndex;
    }

    function decreaseCurrent() {
      _allInstruments[_currentIndex.instrument].changeTimbreTone(_currentIndex.octave, _currentIndex.note, _currentIndex.subNote, -1);
    }

    function increaseCurrent() {
      _allInstruments[_currentIndex.instrument].changeTimbreTone(_currentIndex.octave, _currentIndex.note, _currentIndex.subNote, 1);
    }

    function removeInstrument(name) {
      delete _allInstruments[name];
    }

    function setIndex(i, o=-1, n=-1, s=-1) {
      _currentIndex.instrument = i;
      if(o > -1) {
        _currentIndex.octave = o;
      }
      if(n > -1) {
        _currentIndex.note = n;
      }
      if(s > -1) {
        _currentIndex.subNote = s;
      }
    }

    return {
      addInstrument: addInstrument,
      getAllInstruments: getAllInstruments,
      getCurrentInstrument: getCurrentInstrument,
      getIndex: getIndex,
      decreaseCurrent: decreaseCurrent,
      increaseCurrent: increaseCurrent,
      removeInstrument: removeInstrument,
      setIndex: setIndex
    }
  }

  function getInstance() {
    if(!_instance) {
      _instance = createInstance();
      var inst = instrument.init();
      _instance.addInstrument(inst);
    }
    return _instance;  
  }

  return {
    getInstance: getInstance,
  }
})();

var screenStatusSingleton = (function() {
  var _instance = null;

  function createInstance() {
    var _pixelWidth = 2400;
    var _fps = 60;
    var _stepSize = 3;

    function getPixelWidth() {
      return _pixelWidth;
    }
    
    function getFramesPerSecond() {
      return _fps;
    }
  
    function getStepSize() {
      return _stepSize;
    }
  
    function setPixelWidth(x) {
      _pixelWidth = x;
    }

    function setFramesPerSecond(x) {
      _fps = x;
    }

    function setStepSize(x) {
      _stepSize = x;
    }

    return {
      getPixelWidth: getPixelWidth,
      getFramesPerSecond: getFramesPerSecond,
      getStepSize: getStepSize,
      setPixelWidth: setPixelWidth,
      setFramesPerSecond: setFramesPerSecond,	
      setStepSize: setStepSize
    }
  }

  function getInstance() {
    if(!_instance) {
      _instance = createInstance();
    }
    return _instance;
  }
  
  return {
    getInstance: getInstance
  }
})();

var allBeatsSingleton = (function() {
  var _instance = null;

  function createInstance() {
    var _allBeats = [];
    var _allStarts = [];
    // index of allBeats
    var _index = -1;
    // index of pulses
    var _pulseIndex = -1

    function addBeat(index, repeat=1) {
      if(!(index in _allBeats)) {
	_allBeats[index] = [];
      }
      beat = beat.createBeat((performance.now() - _allStarts[index]), index, _allBeats[index].length, repeat);
      _allBeats[index].push(beat);
      _index = index;
      _pulseIndex = _allBeats[index].length - 1;
    };

    function addEmptyBeat() {
      _allBeats.push([]);
      _allStarts.push(performance.now());
      _index = _index + 1;
      newBeat = beat.createBeat(0, _index, 0);
      _allBeats[_index].push(newBeat);
      _pulseIndex = 0;
    }

    function getAllBeats() {
      return _allBeats;
    }

    function getAllStarts() {
      return _allStarts;
    }

    function getCurrentPulseLength() {
      if(_index >= 0) {
	return _allBeats[_index].length;
      } else {
	return 0;
      }
    }

    function getIndex() {
      return _index;
    }
    
    function getIndexStart(index) {
      return _allStarts[index];
    }

    function getPulseIndex() {
      return _pulseIndex;
    }

    function setIndex(i) {
      _index = i;
      if(!(_index in _allBeats)) {
	_allBeats[_index] = [];
      }
    }

    function setPulseIndex(i) {
      if(i < getCurrentPulseLength()) {
	_pulseIndex = i;
      } else {
	alert("Outside pulse range");
      }
    }

    return {
      addBeat: addBeat,
      addEmptyBeat: addEmptyBeat,
      getAllBeats: getAllBeats,
      getAllStarts: getAllStarts,
      getCurrentPulseLength: getCurrentPulseLength,
      getIndex: getIndex,
      getIndexStart: getIndexStart,
      getPulseIndex: getPulseIndex,
      setIndex: setIndex,
      setPulseIndex: setPulseIndex
    }
  }

  function getInstance() {
    if(!_instance) {
      _instance = createInstance();
      _instance.addEmptyBeat();
    }
    return _instance;
  } 

  return {
    getInstance: getInstance
  }    

})();

var beat = (function() {
  class Beat {

    constructor(timeOffset, allBeatsIndex, order, repeat) {
      this._offset = Math.floor(timeOffset);
      this._allBeatsIndex = allBeatsIndex;
      this._order = order;
      this._repeat = repeat;
      this._notes = [];
      this._offsetPixels = null;
      this._lastPixelWidth = null;
      this._colorInstance = colorSingleton.getInstance();
    }

    addNote(note) {
      for(var i = 0; i < this._notes.length; ++i) {
        if(this._notes[i] == note) {
          return;
        }
        if(this._notes[i] > note) {
          this._notes.splice(i-1, 0, note);
          return;
        }
      }
      this._notes.push(note);
    }

    getAllBeatsIndex() {
      return this._allBeatsIndex;
    }

    getColor() {
      return this._colorInstance.getColors()[this._allBeatsIndex][this._order];
    }

    getNotes() {
      if(this._notes.length < 1) {
        return [7];
      }
      return this._notes;
    }

    getOffset() {
      return this._offset;
    }

    getOffsetPixels() {
      var screenStat = screenStatusSingleton.getInstance();
      if(!this._offsetPixels || (screenStat.getPixelWidth() !== this._lastPixelWidth)) {
	this._lastPixelWidth = screenStat.getPixelWidth();
	this._offsetPixels = this._offset * screenStat.getFramesPerSecond() * screenStat.getStepSize() / 1000;
      }
      return this._offsetPixels;
    }
  
    getOrder() {
      return this._order;
    }

    getRepeat() {
      return this._repeat;
    }
  };

  function createBeat(timeOffset, allBeatsIndex, order) {
    return new Beat(timeOffset, allBeatsIndex, order);
  }

  return {
    createBeat: createBeat
  }
})();

var colorSingleton = (function() {
  var _instance = null;

  function createInstance() {
    const _colorLimit = 35;
    var _hueMatrix = ['20', '40', '60', '80'];
    var _colorVector = ['B', 'G', 'Y', 'R'];
    var _blacknessVector = ['20', '40', '60', '80'];
    var _chromaticVector = ['25', '50', '75'];
    var _colors = [];

    function getColors() {
      return _colors;
    }
    
    function getIndexColor(targetIndex, place=-1) {
      var placeIndex = place;
      if (place < 0) {
	placeIndex = _colors[targetIndex].length + place;
      }
      return _colors[targetIndex][placeIndex];
    }

    function setColors() {
      for(var leftColor = 0; leftColor < _colorVector.length; ++leftColor) {
	for(var hue = 0; hue < _hueMatrix.length; ++hue) {
	  var subBeatColors = ['#bf0000'];
	  var ncsColorString = '-' + _colorVector[leftColor] + _hueMatrix[hue];
	  var completeString;
	  for(var blackness = 0; blackness < _blacknessVector.length; ++blackness) {
	    for(var chrom = 0; chrom < _chromaticVector.length; ++chrom) {
	      completeString = _blacknessVector[blackness] + _chromaticVector[chrom] + ncsColorString;
	      subBeatColors.push(w3color('ncs(' + completeString + ')').toHexString());
	    }
	  }
	  _colors.push(subBeatColors);
	}    
      }
    }

    return {
      getColors: getColors,
      getIndexColor: getIndexColor,
      setColors: setColors
    }
  }

  function getInstance() {
    if(!_instance) {
      _instance = createInstance();
      _instance.setColors();
    }
    return _instance;
  } 

  return {
    getInstance: getInstance
  }

})();

var plotAxes = (function() {
  function plotAxes(ctx, axes=1) {
    var width = ctx.canvas.width;
    var height = ctx.canvas.height;
    var startHeight = (height / 2) + ((axes / 2) * 11);
    var xMin = 0;
	
	ctx.save();
    
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#dee2e6';
    ctx.fillStyle = '#dee2e6';
    for(var i = 0; i < axes; ++i) { 
      ctx.moveTo(xMin, startHeight - (i * 11));
      ctx.lineTo(width, startHeight - (i * 11));
    } 
    ctx.stroke();
    ctx.beginPath();
    if (axes > 1) {
      ctx.fillRect((width/2)-1, (startHeight - ((axes-1) * 11)), 2, (axes * 11));
    } else {
      ctx.fillRect((width/2)-1, 0, 2, height);
    }
    ctx.stroke();
    ctx.restore()
  }

  return {
    plotAxes: plotAxes
  }

})();

var plotBarSingleton = (function() {
  var _instance = null;

  function createInstance() {
    var _animationPlace = null;
    var _canvas = document.getElementById("canvas"); 
    var _context = canvas.getContext("2d");
    var _screenStatusInstance = screenStatusSingleton.getInstance();
    var _allInstruments = allInstrumentsSingleton.getInstance();
    function getCanvasWidth() {
      return _canvas.width;
    }

    function plotBar() {
      _context.clearRect(0, 0, _context.canvas.width, _context.canvas.height);

      _animationPlace = _animationPlace - _screenStatusInstance.getStepSize();
      if (_animationPlace <= 0) {
	_animationPlace = _context.canvas.width;
      }

      var width = _context.canvas.width;
      var height = _context.canvas.height;
      var initialX = Math.floor((width % 120) / 2);
      var barWidth = Math.floor(width / 120);
      var x = initialX;
      var y = 0;
      var currentInstrument = _allInstruments.getCurrentInstrument().getTimbre();
      var currentIndex = _allInstruments.getIndex();
      var currentLoop = false;
      _context.beginPath();
      _context.strokeStyle = '#fff';
      _context.lineWidth = barWidth-2;

      if(currentInstrument) {
	for(var oct = 0; oct < currentInstrument.length; ++oct) {
	  x = initialX;
	  if(currentIndex.octave == oct) {
	    y += 200;
	    currentLoop = true;
	  } else {
	    y += 20;
	  }
	  _context.moveTo(x, y);
	  for(var note = 0; note < currentInstrument[oct].length; ++note) {
	    for(var subNote = 0; subNote < currentInstrument[oct][note].length; ++subNote) {
	      if(currentLoop) {
		if(currentIndex.note == note && currentIndex.subNote == subNote) {
		  _context.closePath();
		  _context.stroke();
		  _context.beginPath();
		  _context.moveTo(x, y);
		  _context.strokeStyle = '#bf0000';
		}
		_context.lineTo(x, y-(5+(20 * currentInstrument[oct][note][subNote])));
		if(currentIndex.note == note && currentIndex.subNote == subNote) {
		  _context.closePath();
		  _context.stroke();
		  _context.beginPath();
		  _context.strokeStyle = '#fff';
		}
	      } else {
		_context.lineTo(x, y-(2 * currentInstrument[oct][note][subNote]));
	      }
	      x += barWidth;
	      _context.moveTo(x, y);
	    }
	  }
	  if(currentLoop) {
	    currentLoop = false;
	  }
	}
      } else {
	alert("No Instrument");
      }
      _context.closePath();
      _context.stroke();
      requestAnimationFrame(plotBar);
    }

    function setAnimationPlace(newVal) {
      _animationPlace = newVal;
    }

    function setCanvasWidth(newWidth) {
      _canvas.setAttribute('width', Math.floor(window.innerWidth));
      setAnimationPlace(_animationPlace);
    }
  
    return {
      getCanvasWidth: getCanvasWidth,
      plotBar: plotBar,
      setAnimationPlace: setAnimationPlace,
      setCanvasWidth: setCanvasWidth
    }
  }


  function getInstance() {
    if(!_instance) {
      _instance = createInstance();
      _instance.setCanvasWidth(Math.floor(window.innerWidth));
      _instance.setAnimationPlace(_instance.getCanvasWidth());
    }
    return _instance;
  }

  return {
    getInstance: getInstance
  }

})();

var plotSineSingleton = (function() {
  var _instance = null;

  function createInstance() {
    var _animationPlace = null;
    var _canvas = document.getElementById("canvas"); 
    var _context = canvas.getContext("2d");
    var _screenStatusInstance = screenStatusSingleton.getInstance();

    function getCanvasWidth() {
      return _canvas.width;
    }

    function plotSine() {
      _context.clearRect(0, 0, _context.canvas.width, _context.canvas.height);

      _animationPlace = _animationPlace - _screenStatusInstance.getStepSize();
      if (_animationPlace <= 0) {
	_animationPlace = _context.canvas.width;
      }
      setAnimationPlace(animationPlace);

      var width = _context.canvas.width;
      var height = _context.canvas.height;
      var scale = 20;

      _context.beginPath();
      _context.lineWidth = 2;
      _context.strokeStyle = '#fff';
      var x = 0;
      var y = 0;
      var amplitude = 40;
      var frequency = 100;
      while (x < width) {
	y = height/2 + amplitude * Math.sin((x-getAnimationPlace())/frequency);
	_context.lineTo(x, y);
	x = x + 1;
      }
      _context.stroke();
      _context.closePath();
      _context.save();
      showAxes(_context);
      _context.restore();

      requestAnimationFrame(plotSine);
    }

    function setAnimationPlace(newVal) {
      _animationPlace = newVal;
    }

    function setCanvasWidth(newWidth) {
      _canvas.setAttribute('width', Math.floor(window.innerWidth));
    }
    
    return {
      getCanvasWidth: getCanvasWidth,
      plotSine: plotSine,
      setAnimationPlace: setAnimationPlace,
      setCanvasWidth: setCanvasWidth
    }
  }

  function getInstance() {
    if(!_instance) {
      _instance = createInstance();
      _instance.setCanvasWidth(Math.floor(window.innerWidth));
      _instance.setAnimationPlace(_instance.getCanvasWidth());
    }
    return _instance;
  }

  return {
    getInstance: getInstance
  }

})();

var plotMovingRectangleSingleton = (function() {
  var _instance;

  function createInstance() {
    var _screenStatusInstance = screenStatusSingleton.getInstance();
    var _allBeatsInstance = allBeatsSingleton.getInstance();
    var _animationPlace = null;
    var _canvas = document.getElementById("canvas"); 
    var _context = canvas.getContext("2d");
    
    function getCanvasWidth() {
      return _canvas.width;
    }

    function plotMovingRectangle() {
      _context.clearRect(0, 0, _context.canvas.width, _context.canvas.height);
      plotAxes.plotAxes(_context, 36);
      var allBeats = _allBeatsInstance.getAllBeats();
      var width = _context.canvas.width;
      var halfWidth = Math.floor(_context.canvas.width / 2);
      var height = _context.canvas.height;
      var bounce = 0;
      var index = _allBeatsInstance.getIndex();
      // 77 - 5 to center
      var startHeight = (height / 2) + 72;
      _context.beginPath();
      _context.lineWidth = 3;
      for (var i = 0; i < allBeats[index].length; ++i) {
	var position = _animationPlace + allBeats[index][i].getOffsetPixels();
	_context.strokeStyle = allBeats[index][i].getColor();

	if (Math.abs(position) <= _screenStatusInstance.getStepSize()) {
	  bounce = 11;
	}

	// left side
	if (position >= 0 && position < halfWidth) {
	  var leftPosition = halfWidth - position;
	  for(var g = 0; g < allBeats[index][i].getNotes().length; ++g) {
	    _context.strokeRect(leftPosition, (bounce + startHeight - (11 * allBeats[index][i].getNotes()[g])), 10, 10);
	  }
	}

	// right side
	if (position <= _screenStatusInstance.getPixelWidth() && position > (_screenStatusInstance.getPixelWidth() - halfWidth)) {
	  var rightPosition = halfWidth + (_screenStatusInstance.getPixelWidth() - position) + 1;
	  for(var g = 0; g < allBeats[index][i].getNotes().length; ++g) {
	    _context.strokeRect(rightPosition, (bounce + startHeight - (11 * allBeats[index][i].getNotes()[g])), 10, 10);
	  }
	
	}

	if (bounce) {
	  bounce = 0;
	}

      }

      _animationPlace = _animationPlace + _screenStatusInstance.getStepSize();
      if (_animationPlace >= _screenStatusInstance.getPixelWidth()) {
	_animationPlace = 0;
      }

      requestAnimationFrame(plotMovingRectangle);
    }

    function setAnimationPlace(newVal) {
      _animationPlace = newVal;
    }

    return {
      getCanvasWidth: getCanvasWidth,
      plotMovingRectangle: plotMovingRectangle,
      setAnimationPlace: setAnimationPlace,
    }
  }

  function getInstance() {
    if(!_instance) {
      _instance = createInstance();
      _instance.setAnimationPlace((_instance.getCanvasWidth() / 2));
    }
    return _instance;
  }

  return {
    getInstance: getInstance
  }

})();

var buttonFunctions = (function() {
  var _plotMovingRectangle = plotMovingRectangleSingleton.getInstance();
  var _plotSine = plotSineSingleton.getInstance();
  var _plotBar = plotBarSingleton.getInstance();
  var _colors = colorSingleton.getInstance();
  var _allBeats = allBeatsSingleton.getInstance();
  var _instruments = allInstrumentsSingleton.getInstance();

  function addBeatButton(value) {
    var container = document.getElementById('beatButtonColumn');
    var buttonContainer = document.createElement('div');
    buttonContainer.className = 'col-1';
    var beatButton = document.createElement('button');
    beatButton.type = 'button';
    beatButton.dataset.index = (_allBeats.getIndex()).toString();
    beatButton.dataset.pulseIndex = (0).toString();
    beatButton.className = 'beat-btn btn btn-outline-light btn-dark btn-block';
    beatButton.style.color = _colors.getIndexColor(value, 0);
    beatButton.innerText = value.toString();
    beatButton.onclick = changeBeatIndex;
    buttonContainer.appendChild(beatButton);
    container.appendChild(buttonContainer);
  }

  function addPulseButton(value) {
    var container = document.getElementById('pulseButtonColumn');
    var buttonContainer = document.createElement('div');
    buttonContainer.className = 'col-1 pulse-btn-container';
    var pulseButton = document.createElement('button');
    pulseButton.type = 'button';
    pulseButton.dataset.index = (_allBeats.getIndex()).toString();
    pulseButton.dataset.pulseIndex = (value).toString();
    pulseButton.style.color = _colors.getIndexColor(_allBeats.getIndex(), value);
    pulseButton.className = 'pulse-btn btn btn-outline-light btn-dark btn-block';
    pulseButton.innerText = value.toString();
    pulseButton.onclick = changeBeatIndex;
    buttonContainer.appendChild(pulseButton);
    container.appendChild(buttonContainer);
  }

  function addAllPulseButtons() {
    for(var i = 1; i < canvas.getCurrentPulseLength(); ++i) {
      addPulseButton(i);
    }
  }

  function changeBeatIndex() {
    _allBeats.setIndex(parseInt(this.dataset.index));
    _allBeats.setPulseIndex(parseInt(this.dataset.pulseIndex));
    if(_allBeats.getPulseIndex() < 1) {
      removePulseButtons();
      addAllPulseButtons();
    }
  }

  function removePulseButtons() {
    var pulseButtons = document.getElementsByClassName('pulse-btn-container');
    const pulseButtonsLength = pulseButtons.length;
    for(var i = 0; i < pulseButtonsLength; ++i) {
      pulseButtons[0].parentNode.removeChild(pulseButtons[0]);
    }
  }

  function updatePulseButtonBeatIndex() {
    var pulseButton = document.getElementById('pulse');
    pulseButton.dataset.beatIndex = _allBeats.getIndex().toString();
  }

  // exposed functions below
  function addNote(e) {
    _allBeats.getAllBeats()[_allBeats.getIndex()][_allBeats.getPulseIndex()].addNote(parseInt(e.getAttribute('data-note')));
  }

  function bar() {
    _plotBar.plotBar();
  }

  function beat() {
    _plotMovingRectangle.plotMovingRectangle();
  }

  function newBeat() {
    // creates new top level Beat
    var now = performance.now();
    var beatButton = document.getElementById('beat');
    updatePulseButtonBeatIndex();
    addBeatButton(_allBeats.getIndex());
    removePulseButtons();
    addAllPulseButtons();
    _canvas.setCurrentAnimation(1);
  }

  function decreaseTone() {
    _instruments.decreaseCurrent();
  }

  function downOctave() {
    var prev = _instruments.getIndex();
    _instruments.setIndex(prev.instrument, prev.octave-1, prev.note, prev.subNote);
  }

  function increaseTone() {
    _instruments.increaseCurrent();
  }
  
  function init() {
    bar();
  }
  
  function leftTone() {
    var prev = _instruments.getIndex();
    if(prev.subNote == 0) {
      prev.note -= 1;
      prev.subNote = 9;
    } else {
      prev.subNote -= 1;
    }
    _instruments.setIndex(prev.instrument, prev.octave, prev.note, prev.subNote);
  }

  function pulse() {
    const now = performance.now();
    const pulseButton = document.getElementById('pulse');
    const beatIndex = parseInt(pulseButton.dataset.beatIndex);
    if ((_allBeats.getCurrentPulseLength()-1) >= beatIndex) {
      _allBeats.addBeat(beatIndex);
      addPulseButton(_allBeats.getCurrentPulseLength()-1);
    } else {
      alert("You did something weird");
    }
  }

  function rightTone() {
    var prev = _instruments.getIndex();
    if(prev.subNote == 9) {
      prev.note += 1;
      prev.subNote = 0;
    } else {
      prev.subNote += 1;
    }
    _instruments.setIndex(prev.instrument, prev.octave, prev.note, prev.subNote);
  }

  function sin() {
    _plotSine.plotSine();
  }

  function upOctave() {
    var prev = _instruments.getIndex();
    _instruments.setIndex(prev.instrument, prev.octave+1, prev.note, prev.subNote);
  }

  return {
    addNote: addNote,
    bar: bar,
    beat: beat,
    decreaseTone: decreaseTone,
    downOctave: downOctave,
    increaseTone: increaseTone,
    leftTone: leftTone,
    newBeat: newBeat,
    init: init,
    pulse: pulse,
    rightTone: rightTone,
    sin: sin,
    upOctave: upOctave
  }
})()

document.onkeydown = function(e) {
  e = e || window.event;
  switch(e.which || e.keyCode) {
    case 37: // left
      buttonFunctions.leftTone();
      break;
    case 38: //up
      buttonFunctions.downOctave(); 
      break;
    case 39: //right
      buttonFunctions.rightTone();
      break;
    case 40:
      buttonFunctions.upOctave();
      break;
  }
};
