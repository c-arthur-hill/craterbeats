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
    var _settings = settingsSingleton.getInstance().getSettings();
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
            noteOscillators[k].frequency.value = frequencies[i][j][k];
            noteAmps[k].gain.value = 0;
            noteOscillators[k].connect(noteAmps[k]);
            noteAmps[k].connect(_ctx.destination);
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

var settingsSingleton = (function() {
  var _instance = null;

  function createInstance() {
    var _settings = {
      maxLevels: 100,
      maxNotes: 12,
      maxSubNotes: 1,
      maxOctaves: 8, 
      currentInstrument: 0, 
      currentOctave: 4, 
      currentNote: 1,
      currentSubNote: 0,
      fps: 60,
      stepSize: 3,
      timbreSquareSideLength: 20,
      currentHor: 1,
      timbreSquares: 150,
    };

    function getCurrentHor() {
      return _settings.currentHor;
    }

    function getFramesPerSecond() {
      return _settings.fps;
    }

    function getSettings() {
      return _settings;
    }
  
    function getStepSize() {
      return _settings.stepSize;
    }

    function setCurrentHor(x) {
      _settings.currentHor = x;
    }
  
    function setFramesPerSecond(x) {
      _settings.fps = x;
    }

    function setStepSize(x) {
      _settings.stepSize = x;
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
      getCurrentHor: getCurrentHor,
      getFramesPerSecond: getFramesPerSecond,
      getSettings: getSettings,
      getStepSize: getStepSize,
      setCurrentHor: setCurrentHor,
      setFramesPerSecond: setFramesPerSecond,	
      setIndex: setIndex,
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

var instrument = (function() {
  var _timbre = [];
  var _settings = settingsSingleton.getInstance().getSettings();

  function getTimbre() {
    return _timbre;
  }

  function getCorrection() {
    return _settings.maxSubNotes * _settings.maxNotes * _settings.maxOctaves * _settings.maxLevels;
  }

  function init() {
    var octave;
    var note;
    var subNote;
    for(var o = 0; o < _settings.maxOctaves; ++o) {
      octave = [];
      for(var n = 0; n < _settings.maxNotes; ++n) {
        note = [];
        for(var s = 0; s < _settings.maxSubNotes; ++s) {
          subNote = [];
          for(var q = 0; q < _settings.timbreSquares; ++q) {
            subNote.push(50);
          }
          note.push(subNote);
        }
        octave.push(note);
      }
      _timbre.push(octave);
    }
    return this;      
  }

  function changeTimbreTone(octave, note, subNote, hor, value) {
    if (_timbre[octave][note][subNote][hor] + value <= _settings.maxLevels && _timbre[octave][note][subNote][hor] + value >= 0) {
      _timbre[octave][note][subNote][hor] += value;
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
    var _settingsInstance = settingsSingleton.getInstance()
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
      var base = Math.pow(2, (1/(_settings.maxNotes * _settings.maxSubNotes)));
      var a4 = (4 * _settings.maxSubNotes * _settings.maxNotes) + (9 * _settings.maxSubNotes);
      var place = 0;
      for(var o = 0; o < _settings.maxOctaves; ++o) {
        octave = [];
        for(var n = 0; n < _settings.maxNotes; ++n) {
          //A4 (440 hz) is 21st
          note = [];
          for(var s = 0; s < _settings.maxSubNotes; ++s) {
            note.push(440 * Math.pow(base, (place - a4)));
            ++place
          }
          octave.push(note);
        }
        _frequencies.push(octave);
      }
      return _frequencies;
    }

    function decreaseCurrent() {
      _allInstruments[_settings.currentInstrument].changeTimbreTone(_settings.currentOctave, _settings.currentNote, _settings.currentSubNote, _settings.currentHor, -1);
    }

    function increaseCurrent() {
      _allInstruments[_settings.currentInstrument].changeTimbreTone(_settings.currentOctave, _settings.currentNote, _settings.currentSubNote, _settings.currentHor, 1);
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
    var _settingsInstance = settingsSingleton.getInstance();

    function calcOffset() {
      return Math.floor(performance.now() - _allStarts[_index]) % pixelsToMicroSeconds(getPixelWidth());
    }

    function pixelsToMicroSeconds(px) {
      return Math.floor(px * 1000 / (_settingsInstance.getFramesPerSecond() * _settingsInstance.getStepSize()));
    }

    function microSecondsToPixels(ms) {
      return Math.floor(ms * _settingsInstance.getFramesPerSecond() * _settingsInstance.getStepSize() / 1000);
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
    var _scalarLimit = 1;
    var _scalarMin = 25;
    var _scalarMax = 75;
    var _scalarColors = [];

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

    function getScalarColors() {
      return _scalarColors;
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
      var ncsColorString;
      // certain this is the bone-headed way of doing this
      // 201 member vectors from dark blue to white to dark green
      for(var col = _scalarLimit; col >= 0; --col) {
        for(var gra = _scalarMin; gra < _scalarMax; ++gra) {
          if(col == 0) {
            if(gra == _scalarMin) {
              _scalarColors.push('#fff');
            }
            ncsColorString = gra.toString() + '80-' + _colorVector[col];
            _scalarColors.push(w3color('ncs(' + ncsColorString + ')').toHexString());
          } else {
            ncsColorString = (100-gra).toString() + '80-' + _colorVector[col];
            _scalarColors.push(w3color('ncs(' + ncsColorString + ')').toHexString());
          }
        } 
      }
      console.log(_scalarColors);
    }

    return {
      getColors: getColors,
      getIndexColor: getIndexColor,
      getScalarColors: getScalarColors,
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
    var _settingsInstance = settingsSingleton.getInstance();
    var _settings = _settingsInstance.getSettings();
    var _allInstruments = allInstrumentsSingleton.getInstance();
    var _scalarColors = colorSingleton.getInstance().getScalarColors();

    function getCanvasWidth() {
      return _canvas.width;
    }

    function plotBar() {
      _context.clearRect(0, 0, _context.canvas.width, _context.canvas.height);
      var width = _context.canvas.width;
      var height = _context.canvas.height;
      var squareSides = _settings.timbreSquareSideLength;
      var verticalSquares = _settings.maxOctaves * _settings.maxNotes * _settings.maxSubNotes;
      var horizontalSquares = width / squareSides;
      var halfSquareSides = Math.floor(squareSides / 2);
      var x = 1;
      var y = (halfSquareSides / 2);
      var currentInstrument = _allInstruments.getCurrentInstrument().getTimbre();
      var currentLoop = false;
      var currentVert = (_settings.currentOctave * _settings.maxNotes * _settings.maxSubNotes) + (_settings.currentNote * _settings.maxSubNotes);

      if(currentInstrument) {
        _context.lineWidth = halfSquareSides - 2;
        _context.beginPath();
        for(var octaveLine = 0; octaveLine < _settings.currentOctave; ++octaveLine) {
          _context.moveTo(x, y);
          _context.strokeStyle = '#fff';
          _context.lineTo(width-1, y);
          y += halfSquareSides; 
        }
        _context.stroke();

        y += 4;
        _context.lineWidth = squareSides - 2;
        for(var note = 0; note < _settings.maxNotes; ++note) {
          for(var subNote = 0; subNote < _settings.maxSubNotes; ++subNote) {
            x = halfSquareSides;
            y += halfSquareSides; 
            for(var hor = 0; hor < horizontalSquares; ++hor) {
              _context.beginPath();
              _context.moveTo(x, y);
              if(note == _settings.currentNote && subNote == _settings.currentSubNote && hor == _settings.currentHor && currentInstrument[_settings.currentOctave][note][subNote][hor] == 50) {
                _context.strokeStyle = '#bf0000';
              } else {
                // replace 0 with horr
                _context.strokeStyle = _scalarColors[currentInstrument[_settings.currentOctave][note][subNote][hor]];
              }

              _context.lineTo(x, y-squareSides+2);
              _context.stroke();
              x += squareSides;
            }
            y += halfSquareSides;
          }
        }
      } else {
	      alert("No Instrument");
      }

      x = 1;
      // have to correct for last y += halfSquareSides in loop above
      y -= (halfSquareSides / 2);
      y += 1;
      _context.lineWidth = halfSquareSides - 2;
      _context.beginPath();
      for(var octaveLine = _settings.currentOctave + 1; octaveLine < _settings.maxOctaves; ++octaveLine) {
        _context.moveTo(x, y);
        _context.strokeStyle = '#fff';
        _context.lineTo(width-1, y); 
        y += halfSquareSides;
      }

      _context.stroke();
      requestAnimationFrame(plotBar);
    }

    function setCanvasSize() {
      var windowWidth = document.body.clientWidth;
      var canvasWidth = windowWidth - (windowWidth % _settings.timbreSquareSideLength);
      _canvas.setAttribute('width', canvasWidth);
      var marginWidth = Math.floor((windowWidth - canvasWidth) / 2);
      _canvas.style.marginLeft = marginWidth + 'px';
      _canvas.style.marginRight = marginWidth + 'px';
      var canvasHeight = _settings.timbreSquareSideLength * _settings.maxNotes * _settings.maxSubNotes;
      canvasHeight += ((_settings.timbreSquareSideLength / 2) * (_settings.maxOctaves+1));
      _canvas.setAttribute('height', canvasHeight);
    }
  
    return {
      getCanvasWidth: getCanvasWidth,
      plotBar: plotBar,
      setCanvasSize: setCanvasSize
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
    var _settingsInstance = settingsSingleton.getInstance();
    var _animationId;

    function getCanvasWidth() {
      return _canvas.width;
    }

    function cancelAnimation() {
      window.cancelAnimationFrame(_animationId);
    }

    function plotSine() {
      _context.clearRect(0, 0, _context.canvas.width, _context.canvas.height);

      _animationPlace = _animationPlace - _settingsInstance.getStepSize();
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
    var _settingsInstance = settingsSingleton.getInstance();
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

	if (Math.abs(position) <= _settingsInstance.getStepSize()) {
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

      _animationPlace = _animationPlace + _settingsInstance.getStepSize();
      if (_animationPlace >= _allBeatsInstance.getPixelWidth()) {
        const copy = _animationPlace;
	_animationPlace = _animationPlace % _settingsInstance.getStepSize();
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
  var _settingsInstance = settingsSingleton.getInstance();

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
    _plotBar.setCanvasSize();
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

  function downTimbre() {
    var prev = _settingsInstance.getSettings();
    if ((prev.currentNote + 1) == prev.maxNotes) {
      prev.currentNote = 0;
      prev.currentOctave += 1;
    } else {
      prev.currentNote += 1;
    }
    _settingsInstance.setIndex(prev.currentInstrument, prev.currentOctave, prev.currentNote);
  }

  function increaseTone() {
    _instruments.increaseCurrent();
    _timbre.updateTone();
  }
  
  function init() {
    bar();
  }
  
  function leftTimbre() {
    var prev = _settingsInstance.getSettings();
    _settingsInstance.setCurrentHor(prev.currentHor - 1);
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

  function rightTimbre() {
    var prev = _settingsInstance.getSettings();
    _settingsInstance.setCurrentHor(prev.currentHor + 1);
  }

  function sine() {
    _plotSine.cancelAnimation();
    _plotSine.plotSine();
  }

  function toggleTimbre() {
    _timbre.toggle();
  }

  function upTimbre() {
    var prev = _settingsInstance.getSettings();
    if (prev.currentNote == 0) {
      prev.currentNote = (prev.maxNotes - 1);
      prev.currentOctave -= 1;
    } else {
      prev.currentNote -= 1;
    }
    _settingsInstance.setIndex(prev.currentInstrument, prev.currentOctave, prev.currentNote);
  }

  return {
    addNote: addNote,
    bar: bar,
    beat: beat,
    decreaseTone: decreaseTone,
    downTimbre: downTimbre,
    increaseTone: increaseTone,
    leftTimbre: leftTimbre,
    newBeat: newBeat,
    init: init,
    pulse: pulse,
    rightTimbre: rightTimbre,
    sine: sine,
    toggleTimbre: toggleTimbre,
    upTimbre: upTimbre
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
	buttonFunctions.leftTimbre();
	break;
      case 75: //up
	buttonFunctions.upTimbre(); 
	break;
      case 76: //right
	buttonFunctions.rightTimbre();
	break;
      case 74: //down
	buttonFunctions.downTimbre();
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
