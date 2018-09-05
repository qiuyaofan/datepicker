/*==============BEGIN TIME============*/
// 时分秒
function Time(picker) {
  this.picker = picker;
  this.init();
}

$.extend(Time.prototype, {
  init: function () {

  },
  event: function () {
    // 时分秒取消
    this.picker.$container.on('click', '.c-datepicker-time-panel__btn.cancel', function () {
      var _this = API.getPicker($(this), 'time');
      var $time = _this.picker.activeTimeWrap.find('.c-datePicker__input-time');
      var index = _this.picker.$container.find('.c-datePicker__input-time').index($time);
      if (!_this.picker.config.isRange) {
        var day = _this.picker.$container.find('.c-datePicker__input-day').eq(index).val();
        _this.picker.$input.val(day + ' ' + _this.prevValue);
      }
      _this.picker.$container.find('.c-datePicker__input-time').eq(index).val(_this.prevValue);
      _this.hide();
    });
    // 时分秒确定
    this.picker.$container.on('click', '.c-datepicker-time-panel__btn.confirm', function () {
      var _this = API.getPicker($(this), 'time');
      _this.hide();
    });
    // 0点
    this.picker.$container.on('click', '.c-datepicker-time-panel__btn.min', function () {
      var _this = API.getPicker($(this), 'time');
      _this.updateTimeInput(_this.picker.timeMin);
    });
    // 23点
    this.picker.$container.on('click', '.c-datepicker-time-panel__btn.max', function () {
      var _this = API.getPicker($(this), 'time');
      _this.updateTimeInput(_this.picker.timeMax);
    });
    // 点击隐藏
    this.picker.$container.on('click', function () {
      var _this = $(this).data('time');
      _this.hide();
    });
    var timerArr = {
      timer0: '',
      timer1: '',
      timer2: ''
    };
    // 滚动选择时分秒
    this.picker.$container.find('.c-datepicker-scrollbar__wrap').scroll(function () {
      var _this = API.getPicker($(this), 'time');
      var index = _this.picker.$container.find('.c-datepicker-scrollbar__wrap').index($(this));
      // 兼容滚动延时，导致下一个时间滚动清除掉上一个的timer,所以分开是三个
      clearTimeout(timerArr['timer' + index]);
      timerArr['timer' + index] = setTimeout(function () {

        var top = $(this).scrollTop();
        var num = Math.round(top / 32);
        var len = $(this).find('li').length - 1;
        if (num >= len) {
          num = len;
        }
        top = num * 32;
        $(this).scrollTop(top);
        var index = _this.picker.activeTimeWrap.find('.c-datepicker-scrollbar__wrap').index($(this));
        var $time = _this.picker.activeTimeWrap.find('.c-datePicker__input-time');
        var day = _this.picker.activeTimeWrap.find('.c-datePicker__input-day').val();
        var val = $time.val();
        val = val.split(':');
        val[index] = API.fillTime(num);
        val = val.join(':');
        $time.val(val);
        if (!_this.picker.config.isRange) {
          // 更新input val
          _this.picker.$input.val(day + ' ' + val);
        }
      }.bind(this), 100);
    })
  },
  updateTimeInput: function (val) {
    this.picker.activeTimeWrap.find('.c-datePicker__input-time').val(val);
    if (!this.picker.config.isRange) {
      var day = this.picker.$input.val().split(' ')[0];
      this.picker.$input.val(day + ' ' + val);
    }
    // this.updateTimePanel();
  },
  updateTimePanel: function (isShow) {
    var $wrap = this.picker.activeTimeWrap.find('.c-datepicker-scrollbar__wrap');
    var val = this.picker.activeTimeWrap.find('.c-datePicker__input-time').val();
    var format = this.picker.config.format.split(' ')[1];
    var regText = format.replace(/HH/, '[0-9]{2}').replace(/(mm|ss)/g, '[0-9]{2}');
    var reg = new RegExp('^' + regText + '$');
    var isMatch = reg.test(val);
    // 判断符合时间格式
    if (isMatch) {
      // 兼容第一次打开才赋值
      if (isShow) {
        this.prevValue = val;
      }
      val = val.split(':');
      $.each($wrap, function (i, el) {
        $(el).scrollTop(Number(val[i]) * 32).addClass('active');
      });
    }
    return isMatch;
  },
  show: function () {
    this.picker.activeTimeWrap.find('.c-datepicker-time-panel').show();
    this.updateTimePanel(true);
  },
  hide: function () {
    this.picker.$container.find('.c-datepicker-time-panel').hide();
  },
  render: function (type, hour, minute, second) {
    if (this.picker.config.isRange) {
      this.renderRange(type, hour, minute, second);
    } else {
      this.renderSingle(type, hour, minute, second);
    }
  },
  renderSingle: function (type, hour, minute, second) {
    var html = this.renderHtml(type, hour, minute, second);
    var $time = this.picker.activeTimeWrap.find('.c-datepicker-time-panel');
    // 初始化，添加html
    if (!$time.length) {
      this.picker.activeTimeWrap.find('.c-datepicker-date-picker__editor-wrap').eq(1).append(html);
      this.picker.$container.data('time', this);
      this.event();
      this.show();
    } else {
      // 已添加，显示
      this.show();
    }
  },
  renderRange: function (type, hour, minute, second) {
    var html = this.renderHtml(type, hour, minute, second);
    var $time = this.picker.activeTimeWrap.find('.c-datepicker-time-panel');
    // 初始化，添加html
    if (!$time.length) {
      var $content = this.picker.$container.find('.c-datepicker-date-range-picker__time-content');
      $content.eq(0).find('.c-datepicker-date-range-picker__editor-wrap').eq(1).append(html);
      $content.eq(1).find('.c-datepicker-date-range-picker__editor-wrap').eq(1).append(html);
      this.picker.$container.find('.c-datepicker-time-panel').hide();
      this.picker.$container.data('time', this);
      this.event();
      this.show();
    } else {
      // 已添加，显示
      this.show();
    }
  },
  renderHtml: function (type, hour, minute, second) {
    hour = hour || moment().hour();
    minute = minute || moment().minute();
    second = second || moment().second();
    var li = '';
    var html = '';
    // 时
    if (type[0]) {
      for (var i = 0; i < 24; i++) {
        var className = hour === i ? 'active' : '';
        li += TIMELITPL.replace('{{time}}', API.fillTime(i)).replace('{{className}}', className);
      }
      html += TIMETPL.replace('{{li}}', li).replace('{{className}}', 'hour');
      li = '';
    }

    // 分
    if (type[1]) {
      for (var j = 0; j < 60; j++) {
        var className = minute === j ? 'active' : '';
        li += TIMELITPL.replace('{{time}}', API.fillTime(j)).replace('{{className}}', className);
      }
      html += TIMETPL.replace('{{li}}', li).replace('{{className}}', 'minute');
      li = '';
    }
    // 秒
    if (type[2]) {
      for (var k = 0; k < 60; k++) {
        var className = second === k ? 'active' : '';
        li += TIMELITPL.replace('{{time}}', API.fillTime(k)).replace('{{className}}', className);
      }
      html += TIMETPL.replace('{{li}}', li).replace('{{className}}', 'second');
    }

    html = TIMEMAINTPL.replace('{{time}}', html);
    return html;
  }
});

  /*==============END TIME============*/