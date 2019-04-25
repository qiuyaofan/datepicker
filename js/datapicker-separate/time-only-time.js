/*==============BEGIN TIME============*/
var TIMEONLYAPI={
  getPanelVal: function ($parent,index){
    var $wrappers = $parent.find('.c-datepicker-time-spinner__wrapper');
    var valArr = new Array(3);
    $wrappers.each(function (i, _wrapper) {
      if (i !== index) {
        var top = $(_wrapper).find('.c-datepicker-scrollbar__wrap').scrollTop();
        valArr[i] = API.fillTime(Math.round(top / 32));
      }
    })
    return valArr;
  },
  getType: function (inputIndex){
    return inputIndex === 0 ? 'configBegin' : inputIndex === 1 ? 'configEnd' : 'configMinMax';
  },
  checkMinMaxGetVal: function (_this, valArr, inputIndex){
    var panelVal = valArr.join(':');
    var type = TIMEONLYAPI.getType(inputIndex);
    var valSecond = API.countSecond(valArr);
    var minSecond = _this[type].minSecond;
    var maxSecond = _this[type].maxSecond;
    if (valSecond < minSecond) {
      val = _this[type].minVal;
    } else if (valSecond > maxSecond) {
      val = _this[type].maxVal;
    } else {
      val = panelVal;
    }
    return val;
  }
}
// 时分秒
function OnlyTime(picker) {
  this.picker = picker;
}

$.extend(OnlyTime.prototype, {
  event: function () {
    // 时分秒取消
    this.picker.$container.on('click', '.c-datepicker-time-panel__btn.cancel', function () {
      var _this = API.getPicker($(this), 'time');
      _this.picker.$input.val(_this.prevValue);
      _this.picker.datePickerObject.hide('confirm');
    });
    // 时分秒确定
    this.picker.$container.on('click', '.c-datepicker-time-panel__btn.confirm', function () {
      var _this = API.getPicker($(this), 'time');
      _this.picker.datePickerObject.hide('confirm');
    });
    // 0点
    this.picker.$container.on('click', '.c-datepicker-time-panel__btn.min', function () {
      var _this = API.getPicker($(this), 'time');
      _this.updateTimeInput(_this.picker.timeMin,$(this));
    });
    // 23点
    this.picker.$container.on('click', '.c-datepicker-time-panel__btn.max', function () {
      var _this = API.getPicker($(this), 'time');
      _this.updateTimeInput(_this.picker.timeMax,$(this));
    });
    var timerArr = {
      timer0: '',
      timer1: '',
      timer2: ''
    };
    // 滚动选择时分秒
    this.picker.$container.find('.c-datepicker-scrollbar__wrap').scroll(function () {
      var _this = API.getPicker($(this), 'time');
      var config = _this.picker.config;
      var $parent = $(this).parents('.c-datepicker-date-picker__onlyTime-content');
      var inputIndex = _this.picker.$container.find('.c-datepicker-date-picker__onlyTime-content').index($parent);
      var index = $parent.find('.c-datepicker-scrollbar__wrap').index($(this));
      // 当前选中的时分秒
      var valArr = TIMEONLYAPI.getPanelVal($parent, index);
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
        var $time = _this.picker.$input.eq(inputIndex);
        valArr[index] = API.fillTime(num);
        // var type = TIMEONLYAPI.getType(inputIndex);
        var panelVal = valArr.join(':');
        // 计算当前值与最大最小值的关系,panel显示值和input val 值不一定一样
        var val = TIMEONLYAPI.checkMinMaxGetVal(_this.picker, valArr, inputIndex);
        // 更新input val
        $time.val(val);
        // 设置当前不可选部分
        _this.setMinMaxHour(inputIndex);
        _this.setMinMaxDisabled(panelVal, inputIndex);
        // 滚动修改对应的最大值最小值
        if (config.isRange){
          var $otherParent = _this.picker.$container.find('.c-datepicker-date-picker__onlyTime-content').eq(1 - inputIndex);
          var otherPanelValArr = TIMEONLYAPI.getPanelVal($otherParent).join(':');
          
          // 根据当前滚动更新另一个的最大最小值
          _this.updateRange(inputIndex, valArr);
          _this.setMinMaxHour(1-inputIndex);
          // 根据最大最小值更新不可选部分
          _this.setMinMaxDisabled(otherPanelValArr, 1-inputIndex);
        }
      }.bind(this), 100);
    })
  },
  // 更新对应的最大值最小值
  updateRange: function (inputIndex, valArr){
    var _this = this.picker;
    // 滚动修改对应的最大值最小值
    var configMinMax = _this.configMinMax;
    var valSecond = API.countSecond(valArr);
    var getJson = function (valArr){
      return {
        hour: valArr[0],
        minute: valArr[1],
        second: valArr[2]
      }
    };
    if (inputIndex === 0 && valSecond > configMinMax.minSecond) {
      // begin
      _this.configEnd.min = getJson(valArr);
      _this.configEnd.minVal = valArr.join(':');
      _this.configEnd.minSecond = API.countSecond(valArr);
    } else if (inputIndex === 1 && valSecond < configMinMax.maxSecond) {
      // end
      _this.configBegin.max = getJson(valArr);
      _this.configBegin.maxVal = valArr.join(':');
      _this.configBegin.maxSecond = API.countSecond(valArr);
    }
  },
  // 设置0点，23点
  updateTimeInput: function (val,$this) {
    if (this.picker.config.isRange) {
      var $parent = $this.parents('.c-datepicker-time-panel');
      var index = this.picker.$container.find('.c-datepicker-time-panel').index($parent);
      this.picker.$input.eq(index).val(val);
      this.updateTimePanel();
    }else{
      this.picker.$input.val(val);
      this.picker.datePickerObject.hide('confirm');
    }
    
  },
  updateTimePanel: function (isShow) {
    var _this=this;
    var format = this.picker.config.format;
    var regText = format.replace(/HH/, '[0-9]{2}').replace(/(mm|ss)/g, '[0-9]{2}');
    var reg = new RegExp('^' + regText + '$');
    var $parents = this.picker.$container.find('.c-datepicker-time-panel');
    $parents.each(function (index, _parent){
      var $wrap = $(_parent).find('.c-datepicker-scrollbar__wrap');
      var val = _this.picker.$input.eq(index).val();
      var isMatch = reg.test(val);
      // 判断符合时间格式
      if (isMatch) {
        val = val.split(':');
        $.each($wrap, function (i, el) {
          $(el).scrollTop(Number(val[i]) * 32).addClass('active');
        });
      }
    })
   
    // return isMatch;
  },
  show: function () {
    this.picker.$container.find('.c-datepicker-time-panel').show();
    this.updateTimePanel(true);
  },
  hide: function () {
    this.picker.$container.find('.c-datepicker-time-panel').hide();
  },
  render: function (type, hour, minute, second) {
    if (this.picker.config.isRange) {
      this.renderRange(type, hour, minute, second);
      this.picker.$container.find('.c-datepicker-time-panel__btn.cancel,.c-datepicker-time-panel__btn.confirm').remove();
    } else {
      this.renderSingle(type, hour, minute, second);
    }
  },
  renderSingle: function (type) {
    var valBegin = this.picker.$input.val();
    this.prevValue = valBegin;
    var time1 = valBegin ? valBegin.split(':') : API.getOnlyTimeFormat(moment());
    this.picker.$input.val(API.getConcatTime(time1[0], time1[1], time1[2]));
    var $time = this.picker.$container.find('.c-datepicker-time-panel');
    // 初始化，添加html
    if (!$time.length) {
      var html = DATEPICKERAPI.renderTimePanelHtml(this.picker,type, time1[0], time1[1], time1[2]);
      this.picker.$container.find('.c-datepicker-date-picker__editor-wrap').append(html);
      this.picker.$container.data('time', this);
      this.setMinMaxHour();
      this.event();
      this.show();
    } else {
      // 已添加，显示
      this.show();
    }
  },
  renderRange: function (type) {
    var valBegin = this.picker.$inputBegin.val();
    var valEnd = this.picker.$inputEnd.val();
    this.prevValue = valBegin + ',' + valEnd;
    var time1 = valBegin ? valBegin.split(':') : API.getOnlyTimeFormat(moment());
    var time2 = valEnd ? valEnd.split(':') : API.getOnlyTimeFormat(moment());
    this.picker.$inputBegin.val(API.getConcatTime(time1[0],time1[1],time1[2]));
    this.picker.$inputEnd.val(API.getConcatTime(time2[0], time2[1], time2[2]));
    var $time = this.picker.$container.find('.c-datepicker-time-panel');
    // 初始化，添加html
    if (!$time.length) {
      var html1 = DATEPICKERAPI.renderTimePanelHtml(this.picker,type, time1[0], time1[1], time1[2]);
      var html2 = DATEPICKERAPI.renderTimePanelHtml(this.picker,type, time2[0], time2[1], time2[2]);
      var $content = this.picker.$container.find('.c-datepicker-date-range-picker__time-content');
      $content.eq(0).find('.c-datepicker-date-range-picker__editor-wrap').append(html1);
      $content.eq(1).find('.c-datepicker-date-range-picker__editor-wrap').append(html2);
      // this.picker.$container.find('.c-datepicker-time-panel').hide();
      this.picker.$container.data('time', this);
      this.setMinMaxHour();
      this.event();
      this.show();
    } else {
      // 已添加，显示
      this.show();
    }
  },
  // 初始化设置小时最大最小
  setMinMaxHour: function (inputIndex){
    var _this = this.picker;
    if (!_this.configMinMax.hasMinMax){
      return;
    }
    ;
    var $panel = _this.$container.find('.c-datepicker-time-panel');
    if (inputIndex>=0){
      $panel = $panel.eq(inputIndex);
    }
    // 获取对应的最大最小json
    var type = TIMEONLYAPI.getType(inputIndex);
    var hourMax = _this[type].max.hour;
    var hourMin = _this[type].min.hour;
    $panel.find('.c-datepicker-time-spinner__item').removeClass('disabled');
    $panel.each(function (index, _panel) {
      var $wrap=$(_panel).find('.c-datepicker-scrollbar__wrap').eq(0);
      $wrap.find('.c-datepicker-time-spinner__item').each(function (k, _item) {
        if ((hourMin&&k < hourMin) || (hourMax&&k > hourMax)){
          $(_item).addClass('disabled');
        }
      })
    })
  },
  // panel最大值最小值变化设置
  setMinMaxDisabled: function (panelVal, inputIndex){
    var _this = this.picker;
    var hasMinMax = _this.configMinMax.hasMinMax;
    if (!panelVal || !hasMinMax){
      return;
    }
    var addDisable=function($el){
      $el.addClass('disabled');
    }
    var $panel = _this.$container.find('.c-datepicker-time-panel').eq(inputIndex);
    var $wrap = $panel.find('.c-datepicker-scrollbar__wrap');
    var $wrapMinute = $wrap.eq(1);
    var $wrapSecond = $wrap.eq(2);
    var $wrapMinuteItem = $wrapMinute.find('.c-datepicker-time-spinner__item');
    var type = inputIndex === 0?'configBegin':'configEnd';
    var minJson = _this[type].min;
    var maxJson = _this[type].max;
    var val = panelVal.split(':');
    val = [Number(val[0]), Number(val[1]), Number(val[2])]
    // 重置disabled
    $wrap.each(function (j, _wrap) {
      if (j!==0){
        $(_wrap).find('.c-datepicker-time-spinner__item').removeClass('disabled');
      }
    })
    if ((!minJson.hour||val[0] > minJson.hour) && (!maxJson.hour||val[0] < maxJson.hour)){
      // 分秒在可选范围内
      return;
    }
    if ((minJson.hour &&val[0] < minJson.hour) || (maxJson.hour &&val[0] > maxJson.hour)) {
      // 分秒都在不可选范围内
      $wrap.each(function (j, _wrap) {
        if (j !== 0) {
          addDisable($(_wrap).find('.c-datepicker-time-spinner__item'));
        }
      })
    } else if (val[0] === minJson.hour){
      // 分等于最小值，秒变化
      // 设置分钟的不可选
      $wrapMinuteItem.each(function (j, _item) {
        if (j < minJson.minute) {
          addDisable($(_item));
        }
      })
      var $wrapSecondItem = $wrapSecond.find('.c-datepicker-time-spinner__item');
      // 秒都在不可选范围内
      if (val[1] < minJson.minute) {
        addDisable($wrapSecondItem);
        return;
      }
      // 秒都在可选范围内
      if (val[1] > minJson.minute) {
        return;
      }
      // 秒部分在可选范围内
      if (val[1] === minJson.minute) {
        $wrapSecondItem.each(function (j, _item) {
          if (j < minJson.second) {
            addDisable($(_item));
          }
        })
        return;
      }
    } else if (val[0] === maxJson.hour) {
      // 分等于最大值，秒变化
      // 设置分钟的不可选
      $wrapMinuteItem.each(function (j, _item) {
        if (j > maxJson.minute) {
          addDisable($(_item));
        }
      })
      // 秒都在不可选范围内
      var $wrapSecondItem = $wrapSecond.find('.c-datepicker-time-spinner__item');
      if (val[1] > maxJson.minute) {
        addDisable($wrapSecondItem);
        return;
      }
      // 秒都在可选范围内
      if (val[1] < maxJson.minute) {
        return;
      }
      // 秒部分在可选范围内
      if (val[1] === maxJson.minute) {
        $wrapSecondItem.each(function (j, _item) {
          if (j > maxJson.second) {
            addDisable($(_item));
          }
        })
        return;
      }
    }
  }
});

/*==============END TIME============*/