import '../styles/site.scss';

require('./common');

(function ($) {
  // Fix bootstrap tooltip
  $('[data-tooltip=true],[rel=tooltip]').tooltip({ container: 'body' }).click(() => {
    $('[data-tooltip=true],[rel=tooltip]').trigger('mouseleave');
  });
}(jQuery));

/**
 * Creates inline alerts uses bootstraps suffix.
 * Alerts will be faded out and removed from DOM after 2 seconds.
 * @param selector
 */
global.flashAlert = function (selector) {
  let _alertBox = $(selector).addClass('flash-messages');
  if (_alertBox.length === 0) {
    _alertBox = $('<div/>');
    $('main#body .container:first').prepend(_alertBox);
  }

  function _alertType(type) {
    return $('<div/>').addClass(`alert alert-${type}`);
  }

  function _write($alert, msg) {
    const close = $('<button/>')
      .attr({
        type: 'button',
        class: 'close',
        'data-dismiss': 'alert',
        'aria-label': 'Close',
      })
      .html('<span aria-hidden="true">&times;</span>');
    msg = $('<p/>').html(msg);


    setTimeout(() => {
      $alert.fadeOut(500, function () {
        $(this).remove();
      });
    }, 1200);
    return $alert.append([close, msg]);
  }

  function createAlert(type, msg) {
    const $alert = _alertType(type);
    _alertBox.append(_write($alert, msg));
  }

  this.log = function (msg) {
    createAlert('default', msg);
  };
  this.primary = function (msg) {
    createAlert('primary', msg);
  };
  this.success = function (msg) {
    createAlert('success', msg);
  };
  this.info = function (msg) {
    createAlert('info', msg);
  };
  this.warning = function (msg) {
    createAlert('warning', msg);
  };
  this.danger = function (msg) {
    createAlert('danger', msg);
  };
};

/**
 * Toggle Switch
 * DHTMLGoodies.com, Alf Magne Kalleland, September 7th, 2015
 */
if (!global.DG) global.DG = {};


DG.switches = {};
DG.OnOffSwitchProperties = ['textOn', 'textOff', 'width', 'height', 'trackColorOn', 'trackColorOff',
  'textColorOn', 'textColorOff', 'listener', 'trackBorderColor', 'textSizeRatio'];
DG.OnOffSwitch = function (config) {
  if (config.el !== undefined) {
    this.inputEl = $(config.el);


    this.name = this.inputEl.attr('name');
    DG.switches[this.name] = this;
    DG.switches[`#${this.inputEl.attr('id')}`] = this;
    const t = this.inputEl.attr('type');
    this.isCheckbox = t && t.toLowerCase() === 'checkbox';
    if (this.isCheckbox) {
      this.checked = this.inputEl.is(':checked');
    } else {
      this.checked = this.inputEl.val() === 1;
    }
  }

  const properties = DG.OnOffSwitchProperties;
  for (let i = 0; i < properties.length; i++) {
    if (config[properties[i]] !== undefined) {
      this[properties[i]] = config[properties[i]];
    }
  }
  this.render();
};


$.extend(DG.OnOffSwitch.prototype, {

  inputEl: undefined,

  listener: undefined,
  trackBorderColor: undefined,

  checked: false,

  width: 0,
  height: 30,

  trackBorderWidth: 1,

  textSizeRatio: 0.40,

  trackColorOn: undefined,
  trackColorOff: '#EEE',

  textColorOn: undefined,
  textColorOff: undefined,


  el: undefined,
  track: undefined,
  thumb: undefined,
  thumbColor: undefined,
  onTextEl: undefined,
  offTextEl: undefined,
  onOffTrackContainer: undefined,

  textOn: '',
  textOff: '',

  minX: 0,
  maxX: 0,

  trackOn: undefined,
  trackOff: undefined,


  innerTrackWidth: 0,

  name: undefined,

  dragCurrentX: 0,
  borderSize: 0,
  isCheckbox: false,

  render() {
    if (this.width === 0) {
      const ratio = this.textSizeRatio / 2;
      const widthFactor = 2 + Math.max(this.textOff.length * ratio, this.textOn.length * ratio);
      this.width = this.height * widthFactor;
    }

    this.inputEl.css('display', 'none');
    this.el = $(`<div class="on-off-switch" style="width:${this.width}px;height:${this.height - 2}px"></div>`);
    this.inputEl.after(this.el);

    this.inputEl.on('change', this.listenToClickEvent.bind(this));

    this.renderTrack();
    this.renderThumb();

    this.applyStyles();


    this.track.on('click', this.toggle.bind(this));
    this.track.on('touchend', this.toggle.bind(this));

    this.addEvents();
  },

  listenToClickEvent() {
    if (this.inputEl.is(':checked')) {
      if (!this.checked) this.toggle();
    } else if (this.checked) this.toggle();
  },

  addEvents() {
    this.thumb.on('mousedown', this.startDragging.bind(this));
    this.thumb.on('touchstart', this.startDragging.bind(this));

    this.thumb.on('mouseenter', this.enterThumb.bind(this));
    this.thumb.on('mouseleave', this.leaveThumb.bind(this));

    $(document.documentElement).on('touchmove', this.drag.bind(this));
    $(document.documentElement).on('mousemove', this.drag.bind(this));
    $(document.documentElement).on('mouseup', this.endDrag.bind(this));
    $(document.documentElement).on('touchend', this.endDrag.bind(this));
  },

  enterThumb() {
    this.thumbColor.addClass('on-off-switch-thumb-over');
  },

  leaveThumb() {
    this.thumbColor.removeClass('on-off-switch-thumb-over');
  },

  renderTrack() {
    const trackWidth = this.width - (this.trackBorderWidth * 2);
    const innerTrackWidth = trackWidth - (this.height / 2);
    this.innerTrackWidth = trackWidth;
    const trackHeight = this.height - (this.trackBorderWidth * 2);
    const borderWidth = this.height / 2;


    this.track = $(`<div class="on-off-switch-track" style="border-radius:${borderWidth}px;border-width:${this.trackBorderWidth}px;`
            + `width:${trackWidth}px;`
            + `height:${trackHeight}px"></div>`);

    if (this.trackBorderColor) {
      this.track.css('border-color', this.trackBorderColor);
    }
    this.el.append(this.track);

    this.onOffTrackContainer = $(`<div style="position:absolute;height:${trackHeight}px;width:${innerTrackWidth * 2}px"></div>`);
    this.track.append(this.onOffTrackContainer);


    this.trackOn = $(`<div class="on-off-switch-track-on" style="border-radius:${0}px;border-width:${this.trackBorderWidth}px;width:${innerTrackWidth}px;height:${trackHeight}px"><div class="track-on-gradient"></div></div>`);
    this.onOffTrackContainer.append(this.trackOn);
    this.onTextEl = $(`<div class="on-off-switch-text on-off-switch-text-on">${this.textOn}</div>`);
    this.trackOn.append(this.onTextEl);

    if (this.textColorOn) {
      this.onTextEl.css('color', this.textColorOn);
    }

    this.trackOff = $(`<div class="on-off-switch-track-off" style="overflow:hidden;left:${innerTrackWidth - (this.height / 2)}px;border-radius:${0}px;border-width:${this.trackBorderWidth}px;width:${this.width}px;height:${trackHeight}px"><div class="track-off-gradient"></div></div>`);
    this.offTextEl = $(`<div class="on-off-switch-text on-off-switch-text-off">${this.textOff}</div>`);
    this.onOffTrackContainer.append(this.trackOff);
    this.trackOff.append(this.offTextEl);

    if (this.textColorOff) {
      this.offTextEl.css('color', this.textColorOff);
    }

    this.styleText(this.onTextEl);
    this.styleText(this.offTextEl);

    const whiteHeight = this.height / 2;
    const whiteBorderRadius = whiteHeight / 2;
    const horizontalOffset = whiteBorderRadius / 2;
    const whiteWidth = this.width - (horizontalOffset * 2);

    const whiteEl = $(`<div class="on-off-switch-track-white" style="left:${horizontalOffset}px;width:${whiteWidth}px;height:${whiteHeight}px;border-radius:${whiteBorderRadius}px"></div>`);
    const whiteEl2 = $(`<div class="on-off-switch-track-white" style="left:${horizontalOffset}px;width:${whiteWidth}px;height:${whiteHeight}px;border-radius:${whiteBorderRadius}px"></div>`);
    whiteEl.css('top', this.height / 2);
    whiteEl2.css('top', this.height / 2);
    this.trackOn.append(whiteEl);
    this.trackOff.append(whiteEl2);


    this.maxX = this.width - this.height;
  },

  styleText(el) {
    const textHeight = Math.round(this.height * this.textSizeRatio);
    const textWidth = Math.round(this.width - this.height);

    el.css('line-height', `${this.height - (this.trackBorderWidth * 2)}px`);
    el.css('font-size', `${textHeight}px`);
    el.css('left', `${this.height / 2}px`);
    el.css('width', `${textWidth}px`);
  },

  renderThumb() {
    const borderSize = this.getBorderSize();

    const size = this.height - (borderSize * 2);
    const borderRadius = (this.height - this.height % 2) / 2;

    this.thumb = $(`<div class="on-off-switch-thumb" style="width:${this.height}px;height:${this.height}px"></div>`);

    // noinspection CssInvalidPropertyValue
    const shadow = $(`<div class="on-off-switch-thumb-shadow" style="border-radius:${borderRadius}px;width:${size}px;height:${size}px;border-width:${borderSize}px;"></div>`);

    this.thumb.append(shadow);

    // noinspection CssInvalidPropertyValue
    this.thumbColor = $(`<div class="on-off-switch-thumb-color" style="border-radius:${borderRadius}px;width:${size}px;height:${size}px;left:${borderSize}px;top:${borderSize}px"></div>`);
    this.thumb.append(this.thumbColor);

    if (this.trackColorOff) {
      this.trackOff.css('background-color', this.trackColorOff);
    }
    if (this.trackColorOn) {
      this.trackOn.css('background-color', this.trackColorOn);
    }

    this.el.append(this.thumb);
  },


  getBorderSize() {
    if (this.borderSize === 0) {
      this.borderSize = Math.round(this.height / 40);
    }
    return this.borderSize;
  },

  applyStyles() {
    this.thumbColor.removeClass('on-off-switch-thumb-on');
    this.thumbColor.removeClass('on-off-switch-thumb-off');
    this.thumbColor.removeClass('on-off-switch-thumb-over');


    if (this.checked) {
      this.thumbColor.addClass('on-off-switch-thumb-on');
      this.thumb.css('left', this.width - this.height);
      this.onOffTrackContainer.css('left', 0);
    } else {
      this.onOffTrackContainer.css('left', this.getTrackPosUnchecked());
      this.thumbColor.addClass('on-off-switch-thumb-off');
      this.thumb.css('left', 0);
    }
    if (this.isCheckbox) {
      this.inputEl.prop('checked', this.checked);
    } else {
      this.inputEl.val(this.checked ? 1 : 0);
    }
  },

  isDragging: false,
  hasBeenDragged: false,
  startDragging(e) {
    this.isDragging = true;
    this.hasBeenDragged = false;
    const position = this.thumb.position();

    this.startCoordinates = {
      x: this.getX(e),
      elX: position.left,
    };
    return false;
  },

  drag(e) {
    if (!this.isDragging) {
      return true;
    }

    this.hasBeenDragged = true;
    let x = this.startCoordinates.elX + this.getX(e) - this.startCoordinates.x;

    if (x < this.minX)x = this.minX;
    if (x > this.maxX)x = this.maxX;

    this.onOffTrackContainer.css('left', x - this.width + (this.height));
    this.thumb.css('left', x);
    return false;
  },

  getX(e) {
    let x = e.pageX;

    if (e.type && (e.type === 'touchstart' || e.type === 'touchmove')) {
      x = e.originalEvent.touches[0].pageX;
    }

    this.dragCurrentX = x;

    return x;
  },

  endDrag() {
    if (!this.isDragging) return true;

    if (!this.hasBeenDragged) {
      this.toggle();
    } else {
      const center = this.width / 2 - (this.height / 2);
      const x = this.startCoordinates.elX + this.dragCurrentX - this.startCoordinates.x;
      if (x < center) {
        this.animateLeft();
      } else {
        this.animateRight();
      }
    }
    this.isDragging = false;
    return null;
  },

  getTrackPosUnchecked() {
    return 0 - this.width + this.height;
  },

  animateLeft() {
    this.onOffTrackContainer.animate({ left: this.getTrackPosUnchecked() }, 100);
    this.thumb.animate({ left: 0 }, 100, 'swing', this.uncheck.bind(this));
  },

  animateRight() {
    this.onOffTrackContainer.animate({ left: 0 }, 100);
    this.thumb.animate({ left: this.maxX }, 100, 'swing', this.check.bind(this));
  },

  check() {
    if (!this.checked) {
      this.checked = true;
      this.notifyListeners();
    }
    this.applyStyles();
  },

  uncheck() {
    if (this.checked) {
      this.checked = false;
      this.notifyListeners();
    }
    this.applyStyles();
  },

  toggle() {
    if (!this.checked) {
      this.checked = true;
      this.animateRight();
    } else {
      this.checked = false;
      this.animateLeft();
    }

    this.notifyListeners();
  },

  notifyListeners() {
    if (this.listener !== undefined) {
      this.listener.call(this, this.name, this.checked);
    }
  },

  getValue() {
    return this.checked;
  },
});

DG.OnOffSwitchAuto = function (config) {
  const properties = DG.OnOffSwitchProperties;

  $(document).ready(() => {
    if (config.cls) {
      const els = $(config.cls);
      let index = 0;
      for (let i = 0, len = els.length; i < len; i++) {
        const elementConfig = jQuery.extend({}, config);
        const el = $(els[i]);
        if (!els[i].id) {
          els[i].id = `dg-switch-${index}`;
          index++;
        }
        elementConfig.el = `#${els[i].id}`;

        for (let j = 0; j < properties.length; j++) {
          const attr = `data-${properties[j]}`;
          const val = el.attr(attr);
          if (val) {
            elementConfig[properties[j]] = val;
          }
        }

        // eslint-disable-next-line no-new
        new DG.OnOffSwitch(
          elementConfig,
        );
      }
    }
  });
};
