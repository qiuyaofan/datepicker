/*==============BEGIN API============*/
var defaultOptions = {
  min: false,
  max: false,
  format: 'YYYY-MM-DD HH:mm:ss',
  isRange: false,
  hasShortcut: false,
  shortcutOptions: [],
  // between:数字：30，string:month/year
  between: false,
  hide: function () { },
  show: function () { }
};

var API = {
  // 时分秒格式正则
  timeReg: function (_this) {
    var format = _this.config.format.split(' ')[1];
    var regText = format.replace(/HH/, '([0-9]{1,2})').replace(/:/g, '(:?)').replace(/(mm|ss)/g, '([0-9]{1,2})');
    return new RegExp('^' + regText + '$');
  },
  // 日期格式正则
  dayReg: function (_this) {
    var format = _this.config.format.split(' ')[0];
    var splitStrReg = new RegExp(_this.splitStr, 'g');
    var regText = format.replace(/YYYY/, '([1-9]{1}[0-9]{3})').replace(splitStrReg, '(' + _this.splitStr + '?)').replace(/(MM|DD)/g, '([0-9]{1,2})');
    return new RegExp('^' + regText + '$');
  },
  fixedFill: function (dayResult) {
    // 兼容201808变为2018-00-08的情况
    if (dayResult[3] == 0) {
      dayResult[3] = dayResult[5];
      dayResult[5] = '01';
    }
    if (dayResult[3].length == 1 && dayResult[5] == 0) {
      dayResult[3] = dayResult[3] + '0';
      dayResult[5] = '01';
    }
    if (dayResult[3].length == 2 && dayResult[5] == 0) {
      dayResult[5] = '01';
    }
    return dayResult;
  },
  // 日获取月份天数
  getMonthDay: function (month, year) {
    var prevMonth = month - 1 < 0 ? 11 : month - 1;
    return month === 2 && year % 4 === 0 ? '29' : EVERYMONTHHASDAY[prevMonth];
  },
  // 匹配是否有相应的时间格式
  getFormat: function (format) {
    var arr = ['YYYY', 'MM', 'DD', 'HH', 'mm', 'ss'];
    var result = [];
    for (var i = 0; i < arr.length; i++) {
      result.push(format.indexOf(arr[i]) !== -1);
    }
    return result;
  },
  // 获取原型实例对象
  getPicker: function ($el, type) {
    type = type || 'picker';
    return $el.parents('.c-datepicker-picker').data(type);
  },
  // 补0
  fillTime: function (val) {
    return Number(val) < 10 ? '0' + Number(val) : val;
  },
  // 修复月份超过最大最小
  fillMonth: function (month, year) {
    if (month < 1) {
      month = 12;
      year = year - 1;
    } else if (month > 12) {
      month = 1;
      year = year + 1;
    }
    return {
      month: month,
      year: year
    }
  },
  // 获取年月日
  getTimeFormat: function (_moment) {
    return {
      year: _moment.year(),
      month: _moment.month() + 1,
      day: _moment.date()
    }
  },
  newDateFixed: function (_this, temp) {
    var reg = new RegExp(_this.splitStr, 'g');
    return !temp ? new Date() : _this.splitStr ? new Date(temp.replace(reg, '/')) : new Date(temp);
  },
  // 范围获取具体年月日
  getRangeTimeFormat: function (_this, $input) {
    var temp;
    var val = $input.val();
    temp = val;
    var result = temp ? moment(API.newDateFixed(_this, temp)) : moment();
    return API.getTimeFormat(result);
  },
  // 判断最大值最小值
  minMaxFill: function (_this, result, index, type) {
    // 填充值
    var val;
    if (type === 'month') {
      val = result.year + _this.splitStr + API.fillTime(result.month);
    } else if (type === 'year') {
      val = result.year + '';
    } else {
      val = result.year + _this.splitStr + API.fillTime(result.month) + _this.splitStr + API.fillTime(result.day);
    }
    if (_this.hasTime) {
      val += ' ' + _this.$container.find('.c-datePicker__input-time').eq(index).val();
    }
    if (!_this.config.min && !_this.config.max) {
      val = val.split(' ')[0];
      return {
        val: val,
        result: result
      };
    }
    // 判断最大值最小值
    var nowMoment = moment(API.newDateFixed(_this, val));
    var minMoment = moment(API.newDateFixed(_this, _this.config.min));
    var maxMoment = moment(API.newDateFixed(_this, _this.config.max));
    // 不在范围内
    var isBefore = nowMoment.isBefore(minMoment);
    var isAfter = nowMoment.isAfter(maxMoment);
    if (isBefore && _this.config.min) {
      val = minMoment.format(_this.config.format).split(' ')[0];
      result = API.getTimeFormat(minMoment);
    }
    if (isAfter && _this.config.max) {
      val = maxMoment.format(_this.config.format).split(' ')[0];
      result = API.getTimeFormat(maxMoment);
    }
    val = val.split(' ')[0];
    return {
      val: val,
      result: result
    }
  },
  // 时分秒最大值检测
  timeCheck: function (time) {
    var arr = time.split(':');
    var checkArr = [23, 59, 59];
    for (var i = 0; i < arr.length; i++) {
      if (Number(arr[i]) > checkArr[i]) {
        arr[i] = checkArr[i];
      }
    }
    return arr.join(':');
  },
  // 超过最大
  maxMonth: function (val) {
    return val > 12;
  },
  // 小于最小
  minMonth: function (val) {
    return val < 1;
  },
  // 时分秒范围检测
  judgeTimeRange: function (_this, $day, $time, index) {
    index = index || 0;
    var day = $day.val();
    var time = $time.val();
    if (!day) {
      return;
    }
    var val = day + ' ' + time;
    var _moment = moment(API.newDateFixed(_this, val));
    var isBefore = _this.config.min?_moment.isBefore((API.newDateFixed(_this, _this.config.min))):false;
    var isAfter = _this.config.max?_moment.isAfter((API.newDateFixed(_this, _this.config.max))):false;
    if (!isBefore && !isAfter) {
      return;
    }
    if (isBefore && _this.config.min) {
      val = _this.config.min;
      $time.val(val.split(' ')[1]);
    } else if (isAfter && _this.config.max) {
      val = _this.config.max;
      $time.val(val.split(' ')[1]);
    }
    if (!_this.config.isRange) {
      _this.$input.eq(index).val(val);
    }
  },
  timeVal: function (_this, type) {
    var timeFormat = _this.config.format.split(' ')[1];
    return type === 'min' ? timeFormat.replace(/HH/, '00').replace(/mm/, '00').replace(/ss/, '00') : timeFormat.replace(/HH/, '23').replace(/mm/, '59').replace(/ss/, '59');
  },
  getScrollBarWidth: function () {
    var inner = document.createElement('p');
    inner.style.width = "100%";
    inner.style.height = "200px";
    var outer = document.createElement('div');
    outer.style.position = "absolute";
    outer.style.top = "0px";
    outer.style.left = "0px";
    outer.style.visibility = "hidden";
    outer.style.width = "200px";
    outer.style.height = "150px";
    outer.style.overflow = "hidden";
    outer.appendChild(inner);
    document.body.appendChild(outer);
    var w1 = inner.offsetWidth;
    outer.style.overflow = 'scroll';
    var w2 = inner.offsetWidth;
    if (w1 == w2) w2 = outer.clientWidth;
    document.body.removeChild(outer);
    var barWidth = w1 - w2;
    if (barWidth === 0) {
      barWidth = 15;
    }
    return barWidth;
  }
};
var JQTABLESCROLLWIDTH = API.getScrollBarWidth();

var TEARTPL = '<table class="{{class}}" style="">' +
  '<tbody>' +
  '{{body}}' +
  '</tbody>' +
  '</table>';
var TDTPL = '<td class="{{today}}">' +
  '<div>' +
  '<a class="cell">{{value}}</a>' +
  '</div>' +
  '</td>';
var DAYHEADER = '<tr>' +
  '<th>日</th>' +
  '<th>一</th>' +
  '<th>二</th>' +
  '<th>三</th>' +
  '<th>四</th>' +
  '<th>五</th>' +
  '<th>六</th>' +
  '</tr>';
var TIMELITPL = '<li class="c-datepicker-time-spinner__item {{className}}">{{time}}</li>';
var TIMETPL = '<div class="c-datepicker-time-spinner__wrapper c-datepicker-scrollbar">' +
  '<div class="c-datepicker-scrollbar__wrap {{className}}" style="max-height: inherit; margin-bottom: -' + JQTABLESCROLLWIDTH + 'px; margin-right: -' + JQTABLESCROLLWIDTH + 'px;">' +
  '<ul class="c-datepicker-scrollbar__view c-datepicker-time-spinner__list">' +
  '{{li}}' +
  '</ul>' +
  '</div>' +
  '</div>';
var TIMEMAINTPL = '<div class="c-datepicker-time-panel c-datepicker-popper" style="">' +
  '<div class="c-datepicker-time-panel__content has-seconds">' +
  '<div class="c-datepicker-time-spinner has-seconds">' +
  '{{time}}' +
  '</div>' +
  '</div>' +
  '<div class="c-datepicker-time-panel__footer">' +
  '<button type="button" class="c-datepicker-time-panel__btn min">0点</button>' +
  '<button type="button" class="c-datepicker-time-panel__btn max">23:59</button>' +
  '<button type="button" class="c-datepicker-time-panel__btn cancel">取消</button>' +
  '<button type="button" class="c-datepicker-time-panel__btn confirm">确定</button>' +
  '</div>' +
  '</div>';
var SIDEBARBUTTON = '<button type="button" class="c-datepicker-picker__shortcut" data-value="{{day}}" data-time="{{time}}">{{name}}</button>';
var SIDEBARTPL = '<div class="c-datepicker-picker__sidebar">' +
  '{{button}}' +
  '</div>';
var PICKERFOOTERTPL = '<div class="c-datepicker-picker__footer" style="">' +
  '<button type="button" class="c-datepicker-button c-datepicker-picker__link-btn c-datepicker-button--text c-datepicker-button--mini {{className}}">' +
  '<span>' +
  '{{text}}' +
  '</span>' +
  '</button>' +
  '<button type="button" class="c-datepicker-button c-datepicker-picker__link-btn confirm c-datepicker-button--default c-datepicker-button--mini is-plain">' +
  '<span>' +
  '确定' +
  '</span>' +
  '</button>' +
  '</div>';
var PICKERARROWTPL = '<div x-arrow="" class="popper__arrow" style="left: 35px;"></div>';
var PICKERHEADERTPL = '<div class="{{className}}__header">' +
  '{{prev}}' +
  '<span role="button" class="{{className}}__header-label {{className}}__header-year"><span>{{year}}</span> 年</span>' +
  '<span role="button" class="{{className}}__header-label {{className}}__header-month"><span>{{month}}</span> 月</span>' +
  '{{next}}' +
  '</div>';
PICKERHEADERPREVTPL = '<i class="kxiconfont icon-first c-datepicker-picker__icon-btn {{className}}__prev-btn year" aria-label="前一年"></i>' +
  '<i class="kxiconfont icon-left c-datepicker-picker__icon-btn {{className}}__prev-btn month" aria-label="上个月"></i>';
PICKERHEADERNEXTTPL = '<i class="kxiconfont icon-right c-datepicker-picker__icon-btn {{className}}__next-btn month" aria-label="下个月"></i>' +
  '<i class="kxiconfont icon-last c-datepicker-picker__icon-btn {{className}}__next-btn year" aria-label="后一年"></i>';
PICKERHEADERNEXTSINGLETPL = '<i class="kxiconfont icon-last c-datepicker-picker__icon-btn {{className}}__next-btn year" aria-label="后一年"></i>' +
  '<i class="kxiconfont icon-right c-datepicker-picker__icon-btn {{className}}__next-btn month" aria-label="下个月"></i>';
var PICKERTIMEHEADERTPL = '<span class="{{className}}__editor-wrap">' +
  '<div class="c-datepicker-input c-datepicker-input--small">' +
  '<input type="text" autocomplete="off" placeholder="选择日期" class="c-datepicker-input__inner c-datePicker__input-day">' +
  '</div>' +
  '</span>' +
  '<span class="{{className}}__editor-wrap">' +
  '<div class="c-datepicker-input c-datepicker-input--small">' +
  '<input type="text" autocomplete="off" placeholder="选择时间" class="c-datepicker-input__inner c-datePicker__input-time">' +
  '</div>' +
  '</span>';
//  范围
var RANGEPICKERMAINTPL = '<div class="c-datepicker-picker c-datepicker-date-range-picker c-datepicker-popper {{hasTime}} {{hasSidebar}}" x-placement="top-start">' +
  '<div class="c-datepicker-picker__body-wrapper">' +
  '{{sidebar}}' +
  '<div class="c-datepicker-picker__body">' +
  '<div class="c-datepicker-date-range-picker__time-header">' +
  '<div class="c-datepicker-date-range-picker__time-content">' +
  PICKERTIMEHEADERTPL.replace(/{{className}}/g, 'c-datepicker-date-range-picker') +
  '</div>' +
  '<span class="kxiconfont icon-right"></span>' +
  '<div class="c-datepicker-date-range-picker__time-content">' +
  PICKERTIMEHEADERTPL.replace(/{{className}}/g, 'c-datepicker-date-range-picker') +
  '</div>' +
  '</div>' +
  '<div class="c-datepicker-picker__body-content">' +
  '<div class="c-datepicker-date-range-picker-panel__wrap is-left">' +
  PICKERHEADERTPL.replace(/{{prev}}/g, PICKERHEADERPREVTPL).replace(/{{next}}/g, '').replace(/{{className}}/g, 'c-datepicker-date-range-picker') +
  '<div class="c-datepicker-picker__content">' +
  '{{table}}' +
  '</div>' +
  '</div>' +
  '<div class="c-datepicker-date-range-picker-panel__wrap is-right">' +
  PICKERHEADERTPL.replace(/{{prev}}/g, '').replace(/{{next}}/g, PICKERHEADERNEXTTPL).replace(/{{year}}/g, '{{yearEnd}}').replace(/{{month}}/g, '{{monthEnd}}').replace(/{{className}}/g, 'c-datepicker-date-range-picker') +
  '<div class="c-datepicker-picker__content">' +
  '{{table}}' +
  '</div>' +
  '</div>' +
  '</div>' +
  '</div>' +
  '</div>' +
  PICKERFOOTERTPL.replace(/{{className}}/g, 'c-datepicker-picker__btn-clear').replace(/{{text}}/g, '清空') +
  PICKERARROWTPL +
  '</div>';
var PICKERFOOTERNOWBUTTON = PICKERFOOTERTPL.replace(/{{className}}/g, 'c-datepicker-picker__btn-now').replace(/{{text}}/g, '此刻');
var PICKERFOOTERCLEARBUTTON = PICKERFOOTERTPL.replace(/{{className}}/g, 'c-datepicker-picker__btn-clear').replace(/{{text}}/g, '清空');
// 单个
var DATEPICKERMAINTPL = '<div class="c-datepicker-picker c-datepicker-date-picker c-datepicker-popper {{hasTime}} {{hasSidebar}}" x-placement="top-start">' +
  '<div class="c-datepicker-picker__body-wrapper">' +
  '{{sidebar}}' +
  '<div class="c-datepicker-picker__body">' +
  '<div class="c-datepicker-date-picker__time-header">' +
  PICKERTIMEHEADERTPL.replace(/{{className}}/g, 'c-datepicker-date-picker') +
  '</div>' +
  PICKERHEADERTPL.replace(/{{prev}}/g, PICKERHEADERPREVTPL).replace(/{{next}}/g, PICKERHEADERNEXTSINGLETPL).replace(/{{className}}/g, 'c-datepicker-date-picker') +
  ' <div class="c-datepicker-picker__content">' +
  '{{table}}' +
  '</div>' +
  '</div>' +
  '</div>' +
  '{{footerButton}}' +
  PICKERARROWTPL +
  '</div>';
var EVERYMONTHHASDAY = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
var MONTHWORDS = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
  /*==============END API============*/

/*===============BEGIN 发布订阅==================*/
// 全局组件：pub/sub
var o = $({});

$.sub = function () {
  o.on.apply(o, arguments);
};

$.unsub = function () {
  o.off.apply(o, arguments);
};

$.pub = function () {
  o.trigger.apply(o, arguments);
};
  /*===============END 发布订阅==================*/