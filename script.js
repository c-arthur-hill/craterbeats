//16 khz is sampling rate

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

var timbreSingleton = (function() {
  var _instance = null;
  
  function createInstance() {
    var _ctx = new AudioContext();
    var _oscillators = [];
    var _amps = [];
    var _allInstrumentsInstance = allInstrumentsSingleton.getInstance();
    var _settings = instrumentSettingsSingleton.getInstance().getSettings();
    var _startTime = null;
    var _started = false;
    var _muted = true;

    function setup() {
      _startTime = _ctx.currentTime;
      var frequencies = _allInstrumentsInstance.getFrequencies();
      var instrument = _allInstrumentsInstance.getCurrentInstrument();
      var timbre = instrument.getTimbre();
      var correction = instrument.getCorrection();
      var octaveOscillators;
      var octaveAmps;
      for(var i = 0; i < timbre.length; ++i) {
        octaveOscillators = [];
        octaveAmps = [];
        for(var j = 0; j < timbre[i].length; ++j) {
          noteOscillators = [];
          noteAmps = [];
          for(var k = 0; k < timbre[i][j].length; ++k) {
            // https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Advanced_techniques
            noteOscillators.push(_ctx.createOscillator());
            noteAmps.push(_ctx.createGain());
            noteOscillators[j].frequency.value = frequencies[i][j];;
            noteAmps[j].gain.value = 0;
            noteOscillators[j].connect(noteAmps[j]);
            noteAmps[j].connect(_ctx.destination);
          }
          octaveOscillators.push(noteOscillators);
          octaveAmps.push(noteAmps);
        }
        _oscillators.push(octaveOscillators);
        _amps.push(octaveAmps);
      }
    }
    
    function start() {
      _startTime = _ctx.currentTime;
      var timbre = instrument.getTimbre();
      var correction = instrument.getCorrection();
      for(var i = 0; i < _oscillators.length; ++i) {
        for(var j = 0; j < _oscillators[i].length; ++j) {
          for(var k = 0; k < _oscillators[i][j].length; ++k) {
            if (!_started) {
              _oscillators[i][j][k].start(_startTime);
            }
            _amps[i][j][k].gain.value = (timbre[i][j][k] / correction);
          }
        }
      }
      _started = true;
      _muted = false;
    }

    function stop() {
      var stopTime = performance.now();

      for(var i = 0; i < _oscillators.length; ++i) {
        for(var j = 0; j < _oscillators[i].length; ++j) {
          for(var k = 0; k < _oscillators[i][j].length; ++k) {
            _amps[i].gain.value = 0;
          }
        }
      }
      _muted = true;
    }

    function toggle() {
      if(_muted) {
        start();
      } else {
        stop();
      }
    }

    function updateTone() {
      // update this to separate method that keeps const vol
      var correction = instrument.getCorrection();
      var timbre = instrument.getTimbre();
      _amps[_settings.currentOctave][_settings.currentNote][_settings.currentSubNote].gain.value = (timbre[_settings.currentOctave][_settings.currentNote][_settings.currentSubNote] / correction); 
    }

    return {
      setup: setup,
      toggle: toggle,
      updateTone: updateTone,
    }
  }

  function getInstance() {
    if(!_instance) {
      _instance = createInstance();
      _instance.setup();
    }
    return _instance;
  }
  
  return {
    getInstance: getInstance
  }
})();

var instrumentSettingsSingleton = (function() {
  var _instance = null;

  function createInstance() {
    var _settings = {
      maxLevels: 100,
      maxNotes: 12,
      maxSubNotes: 10,
      maxOctaves: 8, 
      currentInstrument: 0, 
      currentOctave: 4, 
      currentNote: 8,
      currentSubNote: 0
    };

    function getSettings() {
      return _settings;
    }

    function setIndex(i, o=-1, n=-1, s=-1) {
      _settings.currentInstrument = i;

      if(o > -1) {
	      _settings.currentOctave = o;
      }
      if(n > -1) {
        _settings.currentNote = n;
      }
      if(s > -1) {
        _settings.currentSubNote = s;
      }
    }

    return {
      getSettings: getSettings,
      setIndex: setIndex
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

var instrument = (function() {
  var _timbre = [];
  var _settings = instrumentSettingsSingleton.getInstance().getSettings();

  function getTimbre() {
    return _timbre;
  }

  function getCorrection() {
    return _settings.maxSubNotes * _settings.maxNotes * _settings.maxOctaves * _settings.maxLevels;
  }

  function init() {
    var octave;
    var note;
    for(var o = 0; o < _settings.maxOctaves; ++o) {
      octave = [];
      for(var n = 0; n < _settings.maxNotes; ++n) {
        note = [];
        for(var s = 0; s < _settings.maxSubNotes; ++s) {
          if (o == _settings.currentOctave && n == _settings.currentNote && s == _settings.currentSubNote) {
            note.push(5);
          } else {
            // random 0 or 1
            note.push(0);
          }
        }
        octave.push(note);
      }
      _timbre.push(octave);
    }
    return this;      
  }

  function changeTimbreTone(octave, note, value) {
    if (value < _settings.maxLevels) {
      _timbre[octave][note] += value;
    } else {
      alert("Error: Timbre value attempted to set outside _levels.");
    }
  }

  return {
    getCorrection: getCorrection,
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
    var _frequencies = [];
    var _settingsInstance = instrumentSettingsSingleton.getInstance()
    var _settings = _settingsInstance.getSettings();

    function addInstrument(instrument) {
      _allInstruments.push(instrument);
      _settingsInstance.setIndex(_allInstruments.length - 1);
    }
    
    function getAllInstruments() {
      return _allInstruments;
    }

    function getCurrentInstrument() {
      if(_settings.currentInstrument >= (_allInstruments.length-1)) {
        return _allInstruments[_settings.currentInstrument];
      }
      return null;
    }

    function getFrequencies() {
      if(_frequencies.length > 0) {
        return _frequencies;
      }
      
      var octave;
      var note;
      var freq;
      var base = Math.pow(2, (1/120));
      var place = 0;
      for(var o = 0; o < _settings.maxOctaves; ++o) {
        octave = [];
        for(var n = 0; n < _settings.maxNotes; ++n) {
          //A4 (440 hz) is 21st
          note = [];
          for(var s = 0; s < _settings.maxSubNotes; ++s) {
            octave.push(440 * Math.pow(base, (place - 500)));
            ++place
          }
          octave.push(note);
        }
        _frequencies.push(octave);
      }

      return _frequencies;
    }

    function decreaseCurrent() {
      _allInstruments[_settings.currentInstrument].changeTimbreTone(_settings.currentOctave, _settings.currentNote, _settings.currentSubNote, -1);
    }

    function increaseCurrent() {
      _allInstruments[_settings.currentInstrument].changeTimbreTone(_settings.currentOctave, _settings.currentNote, _settings.currentSubNote, 1);
    }

    function removeInstrument(name) {
      delete _allInstruments[name];
    }

    return {
      addInstrument: addInstrument,
      getAllInstruments: getAllInstruments,
      getCurrentInstrument: getCurrentInstrument,
      getFrequencies: getFrequencies,
      decreaseCurrent: decreaseCurrent,
      increaseCurrent: increaseCurrent,
      removeInstrument: removeInstrument,
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
    var _fps = 60;
    var _stepSize = 3;

    function getFramesPerSecond() {
      return _fps;
    }
  
    function getStepSize() {
      return _stepSize;
    }
  
    function setFramesPerSecond(x) {
      _fps = x;
    }

    function setStepSize(x) {
      _stepSize = x;
    }

    return {
      getFramesPerSecond: getFramesPerSecond,
      getStepSize: getStepSize,
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
    var _allPixelWidths = [];
    // index of allBeats
    var _index = -1;
    // index of pulses
    var _pulseIndex = -1;

    function calcOffset() {
      return Math.floor(performance.now() - _allStarts[_index]) % pixelsToMicroSeconds(getPixelWidth());
    }

    function pixelsToMicroSeconds(px) {
      var screenStatusInstance = screenStatusSingleton.getInstance();
      return Math.floor(px * 1000 / (screenStatusInstance.getFramesPerSecond() * screenStatusInstance.getStepSize()));
    }

    function microSecondsToPixels(ms) {
      var screenStatusInstance = screenStatusSingleton.getInstance();
      return Math.floor(ms * screenStatusInstance.getFramesPerSecond() * screenStatusInstance.getStepSize() / 1000);
    }

    function addBeat(repeat=1) {
      _allBeats[_index].push(beat.createBeat(calcOffset(), _index, _allBeats[_index].length, repeat));
      _pulseIndex = _allBeats[_index].length - 1;
    };

    function addEmptyBeat() {
      _allBeats.push([]);
      _allStarts.push(performance.now());
      _allPixelWidths.push(1200);
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
    
    function getIndexStart() {
      return _allStarts[_index];
    }

    function getPixelWidth() {
      return _allPixelWidths[_index];
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

    function setPixelWidth(x) {
      _pixelWidth = x;
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
      calcOffset: calcOffset,
      getAllBeats: getAllBeats,
      getAllStarts: getAllStarts,
      getCurrentPulseLength: getCurrentPulseLength,
      getIndex: getIndex,
      getIndexStart: getIndexStart,
      getPixelWidth: getPixelWidth,
      getPulseIndex: getPulseIndex,
      setIndex: setIndex,
      setPulseIndex: setPulseIndex,
      setPixelWidth: setPixelWidth,
      microSecondsToPixels: microSecondsToPixels,
      pixelsToMicroSeconds: pixelsToMicroSeconds
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
      var allBeatsInstance = allBeatsSingleton.getInstance();
      var screenStatusInstance = screenStatusSingleton.getInstance();
      if(!this._offsetPixels || (allBeatsInstance.getPixelWidth() !== this._lastPixelWidth)) {
	this._lastPixelWidth = allBeatsInstance.getPixelWidth();
	this._offsetPixels = allBeatsInstance.microSecondsToPixels(this._offset);
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
    var _canvas = document.getElementById("canvas"); 
    var _context = canvas.getContext("2d");
    var _screenStatusInstance = screenStatusSingleton.getInstance();
    var _allInstruments = allInstrumentsSingleton.getInstance();
    var _instrumentSettings = instrumentSettingsSingleton.getInstance().getSettings();

    function getCanvasWidth() {
      return _canvas.width;
    }

    function plotBar() {
      _context.clearRect(0, 0, _context.canvas.width, _context.canvas.height);

      var width = _context.canvas.width;
      var height = _context.canvas.height;
      var barWidth = width / 12;
      var initialX = Math.floor(barWidth / 2);
      var x = initialX;
      var y = 0;
      var currentInstrument = _allInstruments.getCurrentInstrument().getTimbre();
      var currentLoop = false;
      _context.beginPath();
      _context.strokeStyle = '#fff';
      _context.lineWidth = barWidth-2;

      if(currentInstrument) {
	for(var oct = 0; oct < currentInstrument.length; ++oct) {
	  x = initialX;
	  if(_instrumentSettings.currentOctave == oct) {
	    y += 200;
	    currentLoop = true;
	  } else {
	    y += 20;
	  }
	  _context.moveTo(x, y);
	  for(var note = 0; note < currentInstrument[oct].length; ++note) {
	      if(currentLoop) {
		if(_instrumentSettings.currentNote == note) {
		  _context.closePath();
		  _context.stroke();
		  _context.beginPath();
		  _context.moveTo(x, y);
		  _context.strokeStyle = '#bf0000';
		}
		_context.lineTo(x, y-(5+(20 * currentInstrument[oct][note])));
		if(_instrumentSettings.currentNote == note) {
		  _context.closePath();
		  _context.stroke();
		  _context.beginPath();
		  _context.strokeStyle = '#fff';
		}
	      } else {
		_context.lineTo(x, y-(2 * currentInstrument[oct][note]));
	      }
	      x += barWidth;
	      _context.moveTo(x, y);
	    }

	    if(currentLoop) {
	      currentLoop = false;
	    }
	  }
      } else {
	alert("No Instrument");
      }
      _context.stroke();
      requestAnimationFrame(plotBar);
    }

    function setCanvasWidth() {
      var windowWidth = document.body.clientWidth;
      var notesNum = _instrumentSettings.maxNotes;
      var columnWidth = Math.floor(windowWidth / (notesNum+1));
      // adding half remainder to each margin
      var marginWidth = Math.floor(columnWidth/2 + ((windowWidth % notesNum) / 2));
      var marginString = marginWidth.toString() + 'px';
      var canvasWidth = columnWidth * notesNum;
      _canvas.setAttribute('width', canvasWidth);
      _canvas.style.marginLeft = marginString;
      _canvas.style.marginRight = marginString;
    }
  
    return {
      getCanvasWidth: getCanvasWidth,
      plotBar: plotBar,
      setCanvasWidth: setCanvasWidth
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

var plotSineSingleton = (function() {
  var _instance = null;

  function createInstance() {
    var _animationPlace = null;
    var _canvas = document.getElementById("canvas"); 
    var _context = canvas.getContext("2d");
    var _screenStatusInstance = screenStatusSingleton.getInstance();
    var _animationId;

    function getCanvasWidth() {
      return _canvas.width;
    }

    function cancelAnimation() {
      window.cancelAnimationFrame(_animationId);
    }

    function plotSine() {
      _context.clearRect(0, 0, _context.canvas.width, _context.canvas.height);

      _animationPlace = _animationPlace - _screenStatusInstance.getStepSize();
      if (_animationPlace <= 0) {
	_animationPlace = _context.canvas.width;
      }
      setAnimationPlace(_animationPlace);

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
	y = height/2 + amplitude * Math.sin((x-_animationPlace)/frequency);
	_context.lineTo(x, y);
	x = x + 1;
      }
      _context.stroke();
      _context.closePath();
      _context.save();
      plotAxes.plotAxes(_context);
      _context.restore();

      _animationId = requestAnimationFrame(plotSine);
    }

    function setAnimationPlace(newVal) {
      _animationPlace = newVal;
    }

    function setCanvasWidth(newWidth) {
      _canvas.setAttribute('width', Math.floor(window.innerWidth));
    }
    
    return {
      cancelAnimation: cancelAnimation,
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
    var _lastDrop = null;
    var _canvas = document.getElementById("canvas"); 
    var _context = canvas.getContext("2d");
    var _animationId = null;

    function cancelAnimation() {
      window.cancelAnimationFrame(_animationId);
    }

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
	var position = _animationPlace - allBeats[index][i].getOffsetPixels();
	_context.strokeStyle = allBeats[index][i].getColor();

	if (Math.abs(position) <= _screenStatusInstance.getStepSize()) {
	  bounce = 11;
	}

	// default to left side
	position = halfWidth - position;
	if (position < 0) {
	  // try placing on right side
	  position = position +  _allBeatsInstance.getPixelWidth() + 1;
	}

	if (position >= 0 && position <= width) {
	  for(var g = 0; g < allBeats[index][i].getNotes().length; ++g) {
	    _context.strokeRect(position, (bounce + startHeight - (11 * allBeats[index][i].getNotes()[g])), 10, 10);
	  }
	} else if ((position - _lastDrop) >= 0 && (position - _lastDrop) <= width) {
	  // annoying bug... when _animationPlace overflows to zero below a bunch of items would drop off
	  for(var g = 0; g < allBeats[index][i].getNotes().length; ++g) {
	    _context.strokeRect((position - _lastDrop), (bounce + startHeight - (11 * allBeats[index][i].getNotes()[g])), 10, 10);
	  }
	}

	if (bounce) {
		bounce = 0;
	}

      }

      _animationPlace = _animationPlace + _screenStatusInstance.getStepSize();
      if (_animationPlace >= _allBeatsInstance.getPixelWidth()) {
        const copy = _animationPlace;
	_animationPlace = _animationPlace % _screenStatusInstance.getStepSize();
        _lastDrop = copy - _animationPlace;
      }

      _animationId = requestAnimationFrame(plotMovingRectangle);
    }

    function setAnimationPlace() {
      _animationPlace = _allBeatsInstance.microSecondsToPixels(_allBeatsInstance.calcOffset());
    }

    function setCanvasWidth() {
      var toWidth = window.innerWidth;
      if (toWidth > _allBeatsInstance.getPixelWidth()) {
        toWidth = _allBeatsInstance.getPixelWidth();
      }
      _canvas.setAttribute('width', Math.floor(toWidth));
    }


    return {
      cancelAnimation: cancelAnimation,
      getCanvasWidth: getCanvasWidth,
      plotMovingRectangle: plotMovingRectangle,
      setAnimationPlace: setAnimationPlace,
      setCanvasWidth: setCanvasWidth
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

var buttonFunctions = (function() {
  var _plotMovingRectangle = plotMovingRectangleSingleton.getInstance();
  var _plotSine = plotSineSingleton.getInstance();
  var _plotBar = plotBarSingleton.getInstance();
  var _colors = colorSingleton.getInstance();
  var _allBeats = allBeatsSingleton.getInstance();
  var _instruments = allInstrumentsSingleton.getInstance();
  var _timbre = timbreSingleton.getInstance();
  var _instrumentSettings = instrumentSettingsSingleton.getInstance();

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
    _plotBar.setCanvasWidth();
    _plotBar.plotBar();
  }

  function beat() {
    _plotMovingRectangle.setCanvasWidth();
    _plotMovingRectangle.cancelAnimation();
    _plotMovingRectangle.setAnimationPlace();
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
    _timbre.updateTone();
  }

  function downOctave() {
    var prev = _instrumentSettings.getSettings();
    _instrumentSettings.setIndex(prev.currentInstrument, prev.currentOctave-1, prev.currentNote);
  }

  function increaseTone() {
    _instruments.increaseCurrent();
    _timbre.updateTone();
  }
  
  function init() {
    bar();
  }
  
  function leftTone() {
    var prev = _instrumentSettings.getSettings();
    if(prev.currentNote == 0) {
      prev.currentOctave -= 1;
      prev.currentNote = 9;
    } else {
      prev.currentNote -= 1;
    }
    _instrumentSettings.setIndex(prev.currentInstrument, prev.currentOctave, prev.currentNote);
  }

  function pulse() {
    const now = performance.now();
    const pulseButton = document.getElementById('pulse');
    const beatIndex = parseInt(pulseButton.dataset.beatIndex);
    if ((_allBeats.getCurrentPulseLength()-1) >= beatIndex) {
      _allBeats.addBeat();
      addPulseButton(_allBeats.getCurrentPulseLength()-1);
    } else {
      alert("You did something weird");
    }
  }

  function rightTone() {
    var prev = _instrumentSettings.getSettings();
    if(prev.currentNote == 11) {
      prev.currentOctave += 1;
      prev.currentNote = 0;
    } else {
      prev.currentNote += 1;
    }
    _instrumentSettings.setIndex(prev.currentInstrument, prev.currentOctave, prev.currentNote);
  }

  function sine() {
    _plotSine.cancelAnimation();
    _plotSine.plotSine();
  }

  function toggleTimbre() {
    _timbre.toggle();
  }

  function upOctave() {
    var prev = _instrumentSettings.getSettings();
    _instrumentSettings.setIndex(prev.currentInstrument, prev.currentOctave+1, prev.currentNote);
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
    sine: sine,
    toggleTimbre: toggleTimbre,
    upOctave: upOctave
  }
})()

document.onkeydown = function(e) {
  e = e || window.event;
  if(e.shiftKey) {
  /**  switch(e.which || e.keyCode) {
      case 79:
	buttonFunctions.increaseTone();
	break;
      case 78:
	buttonFunctions.decreaseTone();
	break;
    }
    **/
  } else {
    switch(e.which || e.keyCode) {
      case 72: // left
	buttonFunctions.leftTone();
	break;
      case 75: //up
	buttonFunctions.downOctave(); 
	break;
      case 76: //right
	buttonFunctions.rightTone();
	break;
      case 74: //down
	buttonFunctions.upOctave();
	break;
      case 79:
	buttonFunctions.increaseTone();
	break;
      case 78:
	buttonFunctions.decreaseTone();
	break;
    }
  }
};
