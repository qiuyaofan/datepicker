/*==============BEGIN PICKER============*/

// 点击body关闭
$('body').on('click.datePicker', function () {
  $('.c-datepicker-picker').each(function (i, panel) {
    var _this = $(panel).data('picker');
    if ($(panel).css('display') === 'block') {
      if (_this.config.isRange && (!_this.$inputBegin.val() && !_this.$inputEnd.val())) {
        $(panel).find('td.available').removeClass('current in-range');
      }
      if (_this.hasTime) {
        $(panel).find('.c-datepicker-time-panel').hide();
      }
      _this.config.hide.call(_this);
      _this.datePickerObject.betweenHandle();
    }

  })
  $('.c-datepicker-picker').hide();
});

// 父级div.c-datepicker-box滚动，日期选择框跟随input滚动
$('.c-datepicker-box').scroll(scrollSetContainerPos);
function scrollSetContainerPos(){
  $('.c-datepicker-picker').each(function (i, panel) {
    var _this = $(panel).data('picker');
    if ($(panel).css('display') === 'block') {
      setContainerPos(_this.datePickerObject);
    }
  })
}

var DATEPICKERAPI = {
  // 初始化年月日十分秒panel
  initShowObject: function (_this, dataFormat) {
    var year, month, dayYear, dayMonth, dayDate;
    if (_this.config.isRange) {
      // 默认值回填时间插件选择框
      _this.fillDefault();
      dayYear = [dataFormat[0].year, dataFormat[1].year];
      dayMonth = [dataFormat[0].month, dataFormat[1].month];
      dayDate = [dataFormat[0].day, dataFormat[1].day];
      year = dataFormat[0].year;
      month = dataFormat[0].month;
    } else {
      var inputVal = _this.$input.val();
      year = dataFormat.year;
      month = dataFormat.month;
      dayYear = year;
      dayMonth = month;
      dayDate = inputVal ? dataFormat.day : false;
      // 年
      if (_this.params.format[0]) {
        _this.yearObject = new Year(_this);
        if (!_this.params.format[2] && !_this.params.format[1]) {
          _this.yearObject.render(year);
        }
      }
      // 月
      if (_this.params.format[1]) {
        _this.monthObject = new Month(_this);
        if (!_this.params.format[2]) {
          _this.$container.find('.c-datepicker-date-picker__prev-btn.month,.c-datepicker-date-picker__next-btn.month').hide();
          _this.monthObject.render(month);
        }
      }
    }

    // 日
    if (_this.params.format[2]) {
      _this.dayObject = new Day(_this);
      _this.dayObject.render(dayYear, dayMonth, dayDate);
    }
    if (_this.params.format[3] || _this.params.format[4] || _this.params.format[5]) {
      _this.timeObject = new Time(_this);
    }
  },
  // 初始化splitStr，params.format，minJson，maxJson
  initParams: function (_this) {
    _this.splitStr = _this.config.format.replace(/[YMDhms:\s]/g, '').split('')[0];
    _this.params.format = API.getFormat(_this.config.format);
    // 最大值最小值判断
    _this.minJson = _this.config.min ? API.getTimeFormat(moment(API.newDateFixed(_this, _this.config.min))) : false;
    _this.maxJson = _this.config.max ? API.getTimeFormat(moment(API.newDateFixed(_this, _this.config.max))) : false;
  },
  renderPicker: function (target, isBlur) {
    var _this = API.getPicker($(target));
    if (_this.config.isRange) {
      DATEPICKERAPI.renderPickerRange(target, isBlur);
    } else {
      DATEPICKERAPI.renderPickerSingle(target, isBlur);
    }
  },
  renderPickerRange: function (target, isBlur) {
    var _this = API.getPicker($(target));
    var val = target.value;
    var format = _this.config.format.split(' ')[0];
    var regText = format.replace(/YYYY/, '[0-9]{4}').replace(/(MM|DD)/g, '[0-9]{2}');
    var reg = new RegExp('^' + regText + '$');
    // 判断符合时间格式
    if (reg.test(val)) {
      var $days = _this.$container.find('.c-datePicker__input-day');
      var $times = _this.$container.find('.c-datePicker__input-time');
      var index = $days.index($(target));
      var isBaseEnd = index === 1;
      var anotherVal = $days.eq(1 - index).val();
      var _moment = moment(API.newDateFixed(_this, val));
      var _momentAnother = moment(API.newDateFixed(_this, anotherVal));
      var orderFail = index === 0 ? _moment.isAfter(_momentAnother) : _moment.isBefore(_momentAnother);
      // 反过来，需要交换
      if (orderFail) {
        var temp = val;
        val = anotherVal;
        anotherVal = temp;
        _moment = moment(API.newDateFixed(_this, val));
        _momentAnother = moment(API.newDateFixed(_this, anotherVal));
        $days.eq(index).val(val);
        $days.eq(1 - index).val(anotherVal);
      }
      // 十分秒重置

      if (_this.hasTime && !isBlur) {
        $times.eq(0).val(_this.timeMin);
        $times.eq(1).val(_this.timeMax);
      }
      // if (_this.dayObject.isBlur) {
      //   _this.dayObject.isBlur = false;
      // }

      var resultAnother = API.getTimeFormat(_momentAnother);
      var result = API.getTimeFormat(_moment);
      // var month = result.month-1;
      // 最大最小值判断修改
      var resultJson = API.minMaxFill(_this, result, index);
      result = resultJson.result;
      // 填充值
      target.value = resultJson.val;
      // this.value = result.year + _this.splitStr + API.fillTime(month + 1) + _this.splitStr + API.fillTime(result.day);
      var rangeYears = [], rangeMonths = [], rangeDates = [];
      rangeYears[index] = result.year;
      rangeMonths[index] = result.month;
      rangeDates[index] = result.day;
      rangeYears[1 - index] = resultAnother.year;
      rangeMonths[1 - index] = resultAnother.month;
      rangeDates[1 - index] = resultAnother.day;
      _this.dayObject.renderRange(rangeYears, rangeMonths, rangeDates, isBaseEnd, true);
    }
  },
  renderPickerSingle: function (target) {
    var _this = API.getPicker($(target));
    var val = target.value;
    var format = _this.config.format.split(' ')[0];
    var regText = format.replace(/YYYY/, '[0-9]{4}').replace(/(MM|DD)/g, '[0-9]{2}');
    var reg = new RegExp('^' + regText + '$');
    // 判断符合时间格式
    if (reg.test(val)) {
      var $time = _this.$container.find('.c-datePicker__input-time');
      var _moment = moment(API.newDateFixed(_this, val));
      var result = API.getTimeFormat(_moment);
      // 最大最小值判断修改
      var resultJson = API.minMaxFill(_this, result, 0);
      result = resultJson.result;
      val = resultJson.val;
      // 填充值
      target.value = val;
      if (_this.hasTime) {
        val += ' ' + $time.val();
      }
      _this.$input.val(val);
      _this.dayObject.renderSingle(result.year, result.month, result.day, true);
    }
  },
  cancelBlur: function (_this) {
    $.unsub('datapickerRenderPicker');
    _this.isBlur = false;
  }
}

function SingleDatePicker(datePickerObject) {
  this.datePickerObject = datePickerObject;
  this.datePickerObject.pickerObject = null;
  this.$input = datePickerObject.$target.find('input');
  this.config = datePickerObject.config;
  this.params = {};
  this.hasTime = this.config.format.split(' ').length > 1;
  if (this.hasTime) {
    this.timeMin = API.timeVal(this, 'min');
    this.timeMax = API.timeVal(this, 'max');
  }
  this.init();
}

$.extend(SingleDatePicker.prototype, {
  init: function () {
    this.initShow();
    this.event();
  },

  initShow: function () {
    // 初始化splitStr，params.format，minJson，maxJson
    DATEPICKERAPI.initParams(this);
    this.params.isYear = this.params.format[0] && !this.params.format[1];
    this.params.isMonth = this.params.format[0] && this.params.format[1] && !this.params.format[2];
    var table = '';
    var inputVal = this.$input.val();
    var result = inputVal ? moment(API.newDateFixed(this, inputVal)) : moment();
    var dataFormat = API.getTimeFormat(result);
    var sidebar = '';
    var hasSidebar = '';
    var hasTime = '';
    if (this.params.format[3] || this.params.format[4] || this.params.format[5]) {
      hasTime = 'has-time';
    }
    // 有快捷键-单个还是范围
    if (this.config.hasShortcut) {
      hasSidebar = 'has-sidebar';
      sidebar = rederSidebar(this);
    }
    var renderTpl = DATEPICKERMAINTPL;
    if (this.params.isYear || this.params.isMonth) {
      renderTpl = renderTpl.replace(/{{footerButton}}/g, PICKERFOOTERCLEARBUTTON);
    } else {
      renderTpl = renderTpl.replace(/{{footerButton}}/g, PICKERFOOTERNOWBUTTON);
    }

    var $datePickerHtml = $(renderTpl.replace(/{{table}}/g, table).replace(/{{year}}/g, dataFormat.year).replace(/{{month}}/g, dataFormat.month).replace('{{sidebar}}', sidebar).replace('{{hasTime}}', hasTime).replace('{{hasSidebar}}', hasSidebar));
    $('body').append($datePickerHtml);
    this.$container = $datePickerHtml;
    this.$container.data('picker', this);
    // 没有十分秒
    if (!this.hasTime) {
      this.$container.find('.c-datepicker-date-picker__time-header').hide();
    }
    // 初始化年月日十分秒panel
    DATEPICKERAPI.initShowObject(this, dataFormat);
    // 默认值回填时间插件选择框
    var val = this.$input.val().split(' ');
    this.$container.find('.c-datePicker__input-day').val(val[0]);
    this.$container.find('.c-datePicker__input-time').val(val[1]);
    if (getMomentWhenEmpty(this).type!=='active'){
      this.$container.find('.c-datepicker-picker__btn-now').remove();
    }

  },
  event: function () {
    if (this.hasTime) {
      this.eventHasTime();
    }
    this.datePickerObject.$target.on('click', function (event) {
      event.stopPropagation();
    });
    this.$container.on('click', function (event) {
      event.stopPropagation();
    });

    // 点击选择年
    this.$container.on('click', '.c-datepicker-date-picker__header-year', function (event) {
      event.stopPropagation();
      var _this = API.getPicker($(this));
      if (_this.isBlur) {
        DATEPICKERAPI.cancelBlur(_this);
      }
      if ($(this).hasClass('disabled')) {
        return;
      }

      var val = _this.$input.val();
      if (!val) {
        val = moment();
      } else {
        val = moment(API.newDateFixed(_this, val));
      }
      _this.yearObject.render(val.year());
    })
    // 点击选择月
    this.$container.on('click', '.c-datepicker-date-picker__header-month', function (event) {
      event.stopPropagation();
      var _this = API.getPicker($(this));
      if (_this.isBlur) {
        DATEPICKERAPI.cancelBlur(_this);
      }
      if ($(this).hasClass('disabled')) {
        return;
      }
      var val = _this.$input.val();
      if (!val) {
        val = moment();
      } else {
        val = moment(API.newDateFixed(_this, val));
      }
      _this.monthObject.render(val.month() + 1);
    })
    // 下一月
    this.$container.on('click', '.c-datepicker-date-picker__next-btn.month', function (event) {
      event.stopPropagation();
      var _this = API.getPicker($(this));
      renderYearMonth(_this, 'next', 'month');
    })
    // 上一月
    this.$container.on('click', '.c-datepicker-date-picker__prev-btn.month', function (event) {
      event.stopPropagation();
      var _this = API.getPicker($(this));
      // 操作选择年的翻页
      renderYearMonth(_this, 'prev', 'month');
    })
    // 下一年
    this.$container.on('click', '.c-datepicker-date-picker__next-btn.year', function (event) {
      event.stopPropagation();
      var _this = API.getPicker($(this));
      // 操作选择年的翻页
      if ($(this).hasClass('is-year')) {
        var newYear = Number(_this.$container.find('.c-datepicker-year-table td.available').first().find('.cell').text()) + 10;
        _this.yearObject.render(newYear);
      } else if ($(this).hasClass('is-month')) {
        var $year = _this.$container.find('.c-datepicker-date-picker__header-year span');
        $year.text(Number($year.text()) + 1);
        _this.monthObject.render();
      } else {
        renderYearMonth(_this, 'next', 'year');
      }

    })
    // 上一年
    this.$container.on('click', '.c-datepicker-date-picker__prev-btn.year', function (event) {
      event.stopPropagation();
      var _this = API.getPicker($(this));
      // 操作选择年的翻页
      if ($(this).hasClass('is-year')) {
        var newYear = Number(_this.$container.find('.c-datepicker-year-table td.available').first().find('.cell').text()) - 10;
        _this.yearObject.render(newYear);
      } else if ($(this).hasClass('is-month')) {
        var $year = _this.$container.find('.c-datepicker-date-picker__header-year span');
        $year.text(Number($year.text()) - 1);
        _this.monthObject.render();
      } else {
        renderYearMonth(_this, 'prev', 'year');
      }
    })
    // 兼容blur点击切换年时，blur需要重新渲染data，
    function renderYearMonth(_this, dire, type) {
      if (_this.isBlur) {
        _this.dayObject.prevNextSingle(dire, type);
        $.unsub('datapickerRenderPicker');
        _this.isBlur = false;
        // $.sub('datapickerClick', function (e) {
        //   _this.dayObject.prevNextSingle(dire, type);
        //   $.unsub('datapickerClick');
        // });
      } else {
        _this.dayObject.prevNextSingle(dire, type);
      }
    }
    // 点击此刻
    this.$container.on('click', '.c-datepicker-picker__btn-now', function () {
      var _this = API.getPicker($(this));
      setValue(_this, moment().format(_this.config.format));
      _this.datePickerObject.hide('shortcut');
    });

    // 点击清空
    this.$container.on('click', '.c-datepicker-picker__btn-clear', function () {
      var _this = API.getPicker($(this));
      _this.clear();
    })

    // 点击快捷选项
    this.$container.on('click', '.c-datepicker-picker__shortcut', function () {
      var _this = API.getPicker($(this));
      var day = $(this).data('value');
      var result = moment().add(day, 'day').format(_this.config.format);
      if (_this.hasTime) {
        var time = $(this).data('time');
        if (time) {
          result = result.split(' ')[0] + ' ' + time;
        }
      }
      setValue(_this, result);
      _this.datePickerObject.hide('shortcut');
    });
    

    // 点击确定
    this.$container.on('click', '.c-datepicker-picker__link-btn.confirm', function () {
      var _this = API.getPicker($(this));
      if (!_this.$input.val()) {
        var _moment = getMomentWhenEmpty(_this).value;
        setValue(_this, _moment);
      }
      _this.datePickerObject.hide('confirm');
    });
  },
  eventHasTime: function () {
    // 输入框修改日期input
    this.$container.on('keyup', '.c-datePicker__input-time', function () {
      var _this = API.getPicker($(this));
      // 更新显示的time panel值
      var isMatch = _this.timeObject.updateTimePanel();
      if (isMatch) {
        var time = this.value;
        var day = _this.$container.find('.c-datePicker__input-day').val();
        _this.$input.val(day + ' ' + time);
      }

    })
    this.$container.on('click', '.c-datePicker__input-time', function (event) {
      event.stopPropagation();
    });
    // 修改日期
    this.$container.on('keyup', '.c-datePicker__input-day', function () {
      DATEPICKERAPI.renderPickerSingle(this);
    });
    // 失焦判断最大值最小值
    this.$container.on('blur', '.c-datePicker__input-day', function (event) {
      var _this = API.getPicker($(this));
      // 修复满足格式但不完全符合的day格式修正
      fillDay(_this, $(this));
      API.judgeTimeRange(_this, $(this), _this.$container.find('.c-datePicker__input-time'));
    });
    // 失焦判断最大值最小值
    this.$container.on('blur', '.c-datePicker__input-time', function (event) {
      var _this = API.getPicker($(this));
      // 修复满足格式但不完全符合的time格式修正
      fillTime(_this, $(this));
      API.judgeTimeRange(_this, _this.$container.find('.c-datePicker__input-day'), $(this));
    });

    // 聚焦时分秒input
    this.$container.on('focus', '.c-datePicker__input-time', function (event) {
      event.stopPropagation();
      var _this = API.getPicker($(this));
      if (!_this.$input.val() && !this.value) {
        var now = moment().format(_this.config.format);
        _this.$input.val(now);
        now = now.split(' ');
        _this.$container.find('.c-datePicker__input-day').val(now[0]);
        $(this).val(now[1]);
      }
      _this.activeTimeWrap = $(this).parents('.c-datepicker-date-picker__time-header');
      var val = this.value.split(':');
      _this.showTimeSelect(val[0], val[1], val[2]);
    });
    // 聚焦日期input
    this.$container.on('focus', '.c-datePicker__input-day', function () {
      var _this = API.getPicker($(this));
      if (!_this.$input.val()) {
        var now = moment().format(_this.config.format).split(' ');
        $(this).val(now[0]);
        if (now.length > 1) {
          _this.$container.find('.c-datePicker__input-time').val(now[1]);
        }
      }
    });
  },
  clear: function () {
    this.$input.val('');
    this.$container.find('td.available').removeClass('current');
  },
  show: function () {
    // 日
    if (this.params.format[2]) {
      var val = API.getRangeTimeFormat(this, this.$input);
      this.dayObject.render(val.year, val.month, val.day, true);
    }
    this.$container.show();
  },
  reRenderDay: function () {
    // 日
    if (this.params.format[2]) {
      var result = API.getRangeTimeFormat(this, this.$input);
      // 判断是否选中
      var _val = this.$input.val() ? result.day : false;
      this.dayObject.render(result.year, result.month, _val, true);
    }
  },
  renderYear: function () {
    this.yearObject.render();
  },
  renderMonth: function () {
    this.monthObject.render();
  },
  showTimeSelect: function (year, month, day) {
    if (this.params.format[3] || this.params.format[4] || this.params.format[5]) {
      this.timeObject.render(this.params.format.slice(3), year, month, day);
    }
  }

});

// 时间范围
function RangeDatePicker(datePickerObject) {
  this.datePickerObject = datePickerObject;
  this.datePickerObject.pickerObject = null;
  this.$input = datePickerObject.$target.find('input');
  this.$inputBegin = this.$input.eq(0);
  this.$inputEnd = this.$input.eq(1);
  this.config = datePickerObject.config;
  this.params = {};
  this.hasTime = this.config.format.split(' ').length > 1;
  if (this.hasTime) {
    this.timeMin = API.timeVal(this, 'min');
    this.timeMax = API.timeVal(this, 'max');
  }
  this.init();
}

$.extend(RangeDatePicker.prototype, {
  init: function () {
    this.initShow();
    this.event();
  },

  initShow: function () {
    // 初始化splitStr，params.format，minJson，maxJson
    DATEPICKERAPI.initParams(this);
    var table = '';
    var dataFormat = [];
    dataFormat[0] = API.getRangeTimeFormat(this, this.$input.eq(0));
    dataFormat[1] = API.getRangeTimeFormat(this, this.$input.eq(1));
    var sidebar = '';
    var hasSidebar = '';
    var hasTime = '';
    if (this.params.format[3] || this.params.format[4] || this.params.format[5]) {
      hasTime = 'has-time';
    }
    // 有快捷键-单个还是范围
    if (this.config.hasShortcut) {
      hasSidebar = 'has-sidebar';
      sidebar = rederSidebar(this);
    }
    var $datePickerHtml = $(RANGEPICKERMAINTPL.replace(/{{table}}/g, table).replace(/{{year}}/g, dataFormat[0].year).replace(/{{month}}/g, dataFormat[0].month).replace(/{{yearEnd}}/g, dataFormat[1].year).replace(/{{monthEnd}}/g, dataFormat[1].month).replace('{{sidebar}}', sidebar).replace('{{hasTime}}', hasTime).replace('{{hasSidebar}}', hasSidebar));
    $('body').append($datePickerHtml);
    this.$container = $datePickerHtml;
    this.$container.data('picker', this);
    // 没有十分秒
    if (!this.hasTime) {
      this.$container.find('.c-datepicker-date-range-picker__time-header').hide();
    }
    // 初始化年月日十分秒panel
    DATEPICKERAPI.initShowObject(this, dataFormat);
  },
  // 默认值回填时间插件选择框
  fillDefault: function () {
    var valBegin = this.$inputBegin.val().split(' ');
    var valEnd = this.$inputEnd.val().split(' ');
    var $day = this.$container.find('.c-datePicker__input-day');
    var $time = this.$container.find('.c-datePicker__input-time');
    if (valBegin) {
      $day.eq(0).val(valBegin[0]);
      $time.eq(0).val(valBegin[1]);
    }
    if (valEnd) {
      $day.eq(1).val(valEnd[0]);
      $time.eq(1).val(valEnd[1]);
    }
  },
  event: function () {
    if (this.hasTime) {
      this.eventHasTime();
    }
    this.$container.on('click', function (event) {
      event.stopPropagation();
    });
    this.datePickerObject.$target.on('click', function (event) {
      event.stopPropagation();
    });

    // 下一月
    this.$container.on('click', '.c-datepicker-date-range-picker__next-btn.month', function () {
      var _this = API.getPicker($(this));
      renderYearMonth(_this, 'next', 'month');
    })
    // 上一月
    this.$container.on('click', '.c-datepicker-date-range-picker__prev-btn.month', function () {
      var _this = API.getPicker($(this));
      renderYearMonth(_this, 'prev', 'month');
    })
    // 下一年
    this.$container.on('click', '.c-datepicker-date-range-picker__next-btn.year', function () {
      var _this = API.getPicker($(this));
      renderYearMonth(_this, 'next', 'year');
    })
    // 上一年
    this.$container.on('click', '.c-datepicker-date-range-picker__prev-btn.year', function () {
      var _this = API.getPicker($(this));
      renderYearMonth(_this, 'prev', 'year');
    })

    function renderYearMonth(_this, dire, type) {
      if (_this.isBlur) {
        $.sub('datapickerClick', function (e) {
          _this.dayObject.prevNextRender(dire, type);
          $.unsub('datapickerClick');
        });
        $.pub('datapickerRenderPicker');
      } else {
        _this.dayObject.prevNextRender(dire, type);
      }
    }
    // 点击清空
    this.$container.on('click', '.c-datepicker-picker__btn-clear', function () {
      var _this = API.getPicker($(this));
      _this.clear();
    })

    // 快捷选项
    this.$container.on('click', '.c-datepicker-picker__shortcut', function () {
      var _this = API.getPicker($(this));
      var days = $(this).data('value').split(',');
      var begin = moment().add(days[0], 'day').format(_this.config.format);
      var end = moment().add(days[1], 'day').format(_this.config.format);
      if (_this.hasTime) {
        var times = $(this).data('time').split(',');
        if (times[0]) {
          begin = begin.split(' ')[0] + ' ' + times[0];
        }
        if (times[1]) {
          end = end.split(' ')[0] + ' ' + times[1];
        }
      }
      _this.$inputBegin.val(begin);
      _this.$inputEnd.val(end);
      _this.datePickerObject.hide('shortcut');
      // setValue(_this, result);
    });

    // 点击确定
    this.$container.on('click', '.c-datepicker-picker__link-btn.confirm', function () {
      var _this = API.getPicker($(this));
      var $days = _this.$container.find('.c-datePicker__input-day');
      var $times = _this.$container.find('.c-datePicker__input-time');
      var start = $days.eq(0).val();
      var end = $days.eq(1).val();
      if (!start || !end) {
        _this.datePickerObject.hide('confirm');
        return;
      }
      if (_this.hasTime) {
        start += ' ' + $times.eq(0).val();
        end += ' ' + $times.eq(1).val();
      }
      _this.$inputBegin.val(start);
      _this.$inputEnd.val(end);
      _this.datePickerObject.hide('confirm');
    });
  },
  eventHasTime: function () {
    // 输入框修改日期input
    this.$container.on('keyup', '.c-datePicker__input-time', function () {
      var _this = API.getPicker($(this));
      _this.timeObject.updateTimePanel();
    })
    // 输入框修改日期input
    this.$container.on('keyup', '.c-datePicker__input-day', function () {
      DATEPICKERAPI.renderPicker(this);
    });

    this.$container.on('click', '.c-datePicker__input-time', function (event) {
      event.stopPropagation();
    });
    // 聚焦时分秒input
    this.$container.on('focus', '.c-datePicker__input-time', function (event) {
      event.stopPropagation();
      var _this = API.getPicker($(this));
      if (!_this.$input.val() && !this.value) {
        var now = moment().format(_this.config.format);
        // _this.$input.val(now);
        now = now.split(' ');
        _this.$container.find('.c-datePicker__input-day').val(now[0]);
        _this.$container.find('.c-datePicker__input-time').val(now[1]);
      }
      _this.activeTimeWrap = $(this).parents('.c-datepicker-date-range-picker__time-content');
      _this.showTimeSelect();
      $(this).trigger('keyup');
    });
    // 聚焦日期input
    this.$container.on('focus', '.c-datePicker__input-day,.c-datePicker__input-time', function () {
      var _this = API.getPicker($(this));
      var $day = _this.$container.find('.c-datePicker__input-day');
      if (!$(this).val()) {
        var now = moment().format(_this.config.format).split(' ');
        $day.val(now[0]);
        if (now.length > 1) {
          _this.$container.find('.c-datePicker__input-time').val(now[1]);
        }
      }
    });
    // day失焦判断最大值最小值
    this.$container.on('blur', '.c-datePicker__input-day', function (event) {
      var _this = API.getPicker($(this));
      var index = _this.$container.find('.c-datePicker__input-day').index($(this));
      // 修复满足格式但不完全符合的day格式修正
      fillDay(_this, $(this));
      API.judgeTimeRange(_this, $(this), _this.$container.find('.c-datePicker__input-time').eq(index), index);
    });
    // time失焦判断最大值最小值
    this.$container.on('blur', '.c-datePicker__input-time', function (event) {
      var _this = API.getPicker($(this));
      var index = _this.$container.find('.c-datePicker__input-time').index($(this));
      // 修复满足格式但不完全符合的time格式修正（先修正，后比较大小）
      fillTime(_this, $(this));
      API.judgeTimeRange(_this, _this.$container.find('.c-datePicker__input-day').eq(index), $(this), index);
    });
  },
  show: function () {
    this.fillDefault();
    var dataFormat = [];
    dataFormat[0] = API.getRangeTimeFormat(this, this.$input.eq(0));
    dataFormat[1] = API.getRangeTimeFormat(this, this.$input.eq(1));
    var yearArr = [dataFormat[0].year, dataFormat[1].year];
    var monthArr = [dataFormat[0].month, dataFormat[1].month];
    var dayArr = [dataFormat[0].day, dataFormat[1].day];
    // 日
    if (this.params.format[2]) {
      this.dayObject.render(yearArr, monthArr, dayArr, false, true);
    }
    this.$container.show();
  },
  clear: function () {
    this.$inputBegin.val('');
    this.$inputEnd.val('');
    this.$container.find('.c-datePicker__input-day,.c-datePicker__input-time').val('');
    this.$container.find('td.available').removeClass('current in-range');
  },
  renderYear: function () {
    this.yearObject.render();
  },
  renderMonth: function () {
    this.monthObject.render();
  },
  showTimeSelect: function () {
    if (this.params.format[3] || this.params.format[4] || this.params.format[5]) {
      this.timeObject.render(this.params.format.slice(3));
    }
  }
});

function DatePicker(options, ele) {
  // this.$container = $('.c-datepicker-picker');
  this.$target = ele;
  this.config = $.extend({}, defaultOptions, options);
  this.params = {};
  this.init();
}

$.extend(DatePicker.prototype, {
  init: function () {
    if (!this.config.isRange) {
      this.pickerObject = new SingleDatePicker(this);
    } else {
      this.pickerObject = new RangeDatePicker(this);
    }
    this.pickerObject.$input.data('datepicker', this);
    this.event();
  },
  event: function () {
    this.pickerObject.$input.on('click', function () {
      var _this = $(this).data('datepicker');
      _this.show();
    });

    this.pickerObject.$input.on('focus', function () {
      var _this = $(this).data('datepicker');
      _this.initInputVal = this.value;
    });
    // 兼容输入框失去焦点
    this.pickerObject.$container.on('click', function () {
      var _this = $(this).data('picker');
      if (_this.isBlur) {
        $.unsub('datapickerClick');
        $.pub('datapickerRenderPicker');
        _this.isBlur = false;
      }
    })
    // 输入框失去焦点
    this.pickerObject.$input.on('blur', function () {
      if (!this.value) {
        return;
      }
      var _this = $(this).data('datepicker');
      var index = _this.pickerObject.$input.index($(this));
      var valArr = this.value.split(' ');
      var day = valArr[0];
      var $container = _this.pickerObject.$container;
      // 有十分秒

      if (_this.pickerObject.hasTime) {
        var dayReg = API.dayReg(_this.pickerObject);
        var time = valArr[1] ? API.timeCheck(valArr[1]) : false;
        var $time = $container.find('.c-datePicker__input-time');
        var $day = $container.find('.c-datePicker__input-day');
        var timeResult = time && time.match(API.timeReg(_this));
        var dayResult = day.match(dayReg);
        if (!time || !timeResult || !dayResult) {
          day = _this.initInputVal.split(' ')[0];
          time = _this.initInputVal.split(' ')[1];
          this.value = _this.initInputVal;
        } else {
          if (dayResult) {
            // 兼容201808变为2018-00-08的情况
            dayResult = API.fixedFill(dayResult);
            day = dayResult[1] + _this.pickerObject.splitStr + API.fillTime(dayResult[3]) + _this.pickerObject.splitStr + API.fillTime(dayResult[5])
          }
          if (timeResult) {
            time = timeResult[5] ? timeResult[1] + ':' + API.fillTime(timeResult[3]) + ':' + API.fillTime(timeResult[5]) : timeResult[1] + ':' + API.fillTime(timeResult[3]);
          }
          this.value = day + ' ' + time;
        }
        $time.eq(index).val(time);
        $day.eq(index).val(day);
        // 兼容失去焦点，点击选择日期
        _this.pickerObject.isBlur = true;
        // 逻辑：先blur-绑定重新渲染date panel事件-触发选择日期或年月切换等事件-发布重新渲染事件|取消发布事件
        // 处理的类型有，点击切换上下一年月，点击年月选择，选择日期，点击piker其他
        $.sub('datapickerRenderPicker', function () {
          DATEPICKERAPI.renderPicker($day.eq(index)[0], true);
          _this.pickerObject.isBlur = false;
          $.pub('datapickerClick');
          $.unsub('datapickerRenderPicker');
        });
      } else {
        // 没有十分秒
        // 年月格式
        if (_this.pickerObject.params.isMonth) {
          var _moment = moment(API.newDateFixed(_this.pickerObject, day + _this.pickerObject.splitStr + '01'));
          var result = API.getTimeFormat(_moment);
          var resultJson = API.minMaxFill(_this.pickerObject, result, 0, 'month');
          val = resultJson.val;
          $(this).val(val);
          // _this.hide();
        } else if (_this.pickerObject.params.isYear) {
          if (_this.config.min && day < _this.config.min) {
            day = _this.config.min;
          }
          if (_this.config.max && day > _this.config.max) {
            day = _this.config.max;
          }
          $(this).val(day);
        } else {
          var dayReg = API.dayReg(_this.pickerObject);
          var dayResult = day.match(dayReg);
          if (!dayResult) {
            // 不匹配
            this.value = _this.initInputVal;
          } else {
            // 匹配
            // 兼容201808变为2018-00-08的情况
            dayResult = API.fixedFill(dayResult);
            day = dayResult[1] + _this.pickerObject.splitStr + API.fillTime(dayResult[3]) + _this.pickerObject.splitStr + API.fillTime(dayResult[5]);
            this.value = day;
          }
        }
      }

    });
  },
  show: function () {
    setContainerPos(this);
    $('.c-datepicker-picker').hide();
    this.pickerObject.show();
    this.config.show.call(this.pickerObject);
  },
  hide: function (type) {
    // 判断输入框没有值
    this.pickerObject.$container.find('.td.available').removeClass('current in-range');
    this.pickerObject.$container.find('.c-datepicker-time-panel').hide();
    this.pickerObject.$container.hide();
    this.betweenHandle();
    this.config.hide.call(this.pickerObject, type);
  },
  betweenHandle: function () {
    var _config = this.config;
    // 处理范围间距，检测开始结束间隔时间
    if (!_config.isRange || !_config.between) {
      return false;
    }
    var start = this.pickerObject.$inputBegin.val();
    var end = this.pickerObject.$inputEnd.val();
    if (!start || !end) {
      return false;
    }
    var beginMoment = moment(API.newDateFixed(this.pickerObject, start));
    var endMoment = moment(API.newDateFixed(this.pickerObject, end));
    var beginFormat = API.getTimeFormat(beginMoment);
    var endFormat = API.getTimeFormat(endMoment);
    // 同一个月内
    if (_config.between === 'month') {
      if (beginFormat.year !== endFormat.year || beginFormat.month !== endFormat.month) {
        var val = beginMoment.set({ 'year': endFormat.year, 'month': endFormat.month - 1, 'date': 1 }).format(_config.format);
        this.pickerObject.$inputBegin.val(val);
      }
      return;
    }
    // 同一年内
    if (_config.between === 'year') {
      if (beginFormat.year !== endFormat.year) {
        var val = beginMoment.set({ 'year': endFormat.year, 'month': 0, 'date': 1 }).format(_config.format);
        this.pickerObject.$inputBegin.val(val);
      }
      return;
    }
    // 规定天数内
    if (Number.isInteger(Number(_config.between))) {
      var endRangeMoment = endMoment.add(-Number(_config.between), 'day');
      if (endRangeMoment.isAfter(beginMoment)) {
        var val = endRangeMoment.format(_config.format);
        this.pickerObject.$inputBegin.val(val);
      }
    }
  }
});
// 设置日期选择框位置
function setContainerPos(_this) {
  var offset = _this.$target.offset();
  var height = _this.$target.outerHeight();
  _this.pickerObject.$container.css({
    top: offset.top + height,
    left: offset.left
  });
}
function fillTime(_this, $time) {
  // 修复满足格式但不完全符合的time格式修正
  var time = $time.val();
  var timeResult = time && time.match(API.timeReg(_this));
  if (!time || !timeResult) {
    return;
  } else {
    if (timeResult) {
      time = _this.config.format.split(' ')[1].replace(/HH/, timeResult[1]).replace(/mm/, API.fillTime(timeResult[3])).replace(/ss/, API.fillTime(timeResult[5]))
      // timeResult[1] + ':' + API.fillTime(timeResult[3]) + ':' + API.fillTime(timeResult[5]);
      $time.val(time);
      if (!_this.config.isRange) {
        $time.trigger('keyup');
      }
    }
  }
}

function fillDay(_this, $day) {
  // 修复满足格式但不完全符合的day格式修正
  var day = $day.val();
  var reg = API.dayReg(_this);
  var dayResult = day.match(reg);
  if (!day || !dayResult) {
    return;
  } else {
    if (dayResult) {
      // 兼容201808变为2018-00-08的情况
      dayResult = API.fixedFill(dayResult);
      day = dayResult[1] + _this.splitStr + API.fillTime(dayResult[3]) + _this.splitStr + API.fillTime(dayResult[5]);
      $day.val(day);
      if (!_this.config.isRange) {
        $day.trigger('keyup');
      }
    }
  }
}

// renderSidebar
function rederSidebar(_this) {
  var html = '';
  var options = _this.config.shortcutOptions;
  for (var i = 0; i < options.length; i++) {
    var time = options[i].time || '';
    html += SIDEBARBUTTON.replace('{{name}}', options[i].name).replace('{{day}}', options[i].day).replace('{{time}}', time);
  }
  return SIDEBARTPL.replace('{{button}}', html);
}

// 设置选中值
function setValue(_this, date) {
  _this.$container.find('.c-datepicker-date-table td.current').removeClass('current');
  // var date = _moment2.format(_this.config.format);
  var timeArr = date.split(' ');
  _this.$input.val(date);
  _this.$container.find('.c-datePicker__input-day').val(timeArr[0]);
  if (timeArr.length > 1) {
    _this.$container.find('.c-datePicker__input-time').val(timeArr[1]);
  }
}

// 单个：填充表单时当选的值为空时，自动填充的值
function getMomentWhenEmpty(_this) {
  var _moment,type;
  if (_this.config.min && moment().isBefore(moment(_this.config.min))) {
    _moment = moment(_this.config.min).format(_this.config.format);
    type='min';
  } else if (_this.config.max && moment().isAfter(moment(_this.config.max))) {
    _moment = moment(_this.config.max).format(_this.config.format);
    type = 'max';
  } else {
    _moment = moment().format(_this.config.format);
    type = 'active';
  }
  return {
    value:_moment,
    type:type
  };
}
/*========END 渲染表格===========*/
$.fn.datePicker = function (options) {
  return this.each(function () {
    new DatePicker(options, $(this));
  });
};
  /*==============END PICKER============*/