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
  language: 'zh-CN',
  hide: function () { },
  show: function () { }
};

var API = {
  onlytimeReg: function (format){
    return /^HH:mm(:ss)?$/.test(format);
  },
  // 获取时分秒格式
  getFormatTime: function (_this) {
    return _this.onlyTime ? _this.config.format : _this.config.format.split(' ')[1];
  },
  // 时分秒格式正则
  timeReg: function (_this) {
    var format = API.getFormatTime(_this);
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
  // 获取时分秒
  getOnlyTimeFormat: function (_moment) {
    return [_moment.hour(),_moment.minute(),_moment.second()];
  },
  getConcatTime: function (hour, minute, second){
    return API.fillTime(hour) + ':' + API.fillTime(minute) + ':' + API.fillTime(second);
  },
  newDateFixed: function (_this, temp) {
    var isIE = !!window.ActiveXObject || "ActiveXObject" in window;
    var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    // Safari 年月模式只能用-,其他Safari、ie用/
    var str = isIE || (isSafari && _this.config.format !== 'YYYY-MM') ? '/' : '-';
    var reg = new RegExp(_this.splitStr, 'g');
    var result = !temp ? new Date() : _this.splitStr ? new Date(temp.replace(reg, str)) : new Date(temp);
    return result;
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
    var timeFormat = _this.onlyTime ? _this.config.format:_this.config.format.split(' ')[1];
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
  },
  getOnlyTimeMinMax: function (_this){
    var min = _this.config.min;
    var max = _this.config.max;
    var emptyVal=void(0);
    var minJson={
      hour:emptyVal,
      minute:emptyVal,
      second:emptyVal
    };
    var maxJson = {
      hour: emptyVal,
      minute: emptyVal,
      second: emptyVal
    };
    var hasMin = min && min.match(API.timeReg(_this));
    var hasMax = max && max.match(API.timeReg(_this));
    var hasMinMax = hasMax && hasMin ? true : hasMax ? 'max' : hasMin?'min':false;
    if (hasMin) {
      var _min =min.split(':');
      minJson.hour = Number(_min[0]);
      minJson.minute = Number(_min[1]);
      minJson.second = Number(_min[2]);
    }
    if (hasMax) {
      var _max = max.split(':');
      maxJson.hour = Number(_max[0]);
      maxJson.minute = Number(_max[1]);
      maxJson.second = Number(_max[2]);
    }
    var minSecond = hasMin ? API.countSecond(min.split(':')) : void (0);
    var maxSecond = hasMax ? API.countSecond(max.split(':')) : void (0);
    return {
      min: minJson,
      max: maxJson,
      hasMin: hasMin,
      hasMax: hasMax,
      hasMinMax: hasMinMax,
      minSecond: minSecond,
      maxSecond: maxSecond,
      minVal: min,
      maxVal: max
    }
  },
  countSecond: function (result){
    return result.length === 2 ? result = Number(result[0]) * 60 + Number(result[1]) : result.length === 3 ? result = Number(result[0]) * 3600 + Number(result[1]) * 60 + Number(result[2]) : false;

  }
};
var JQTABLESCROLLWIDTH = API.getScrollBarWidth();
var RENDERAPI={
  tableTpl: function (className, content){
    var html = '<table class="' + className+'" style="">' +
      '<tbody>' +
      content +
      '</tbody>' +
    '</table>';
    return html;
  },
  tdTpl: function (today,value){
    var html = '<td class="' + today+'">' +
      '<div>' +
      '<a class="cell">' + value+'</a>' +
      '</div>' +
      '</td>';
      return html;
  },
  dayHeader: function (nameOptions){
    var days = nameOptions.days;
    var thHtml='';
    for (var i = 0, len=days.length; i < len; i++) {
      thHtml += '<th>' + days[i]+'</th>';
    }
    var html = '<tr>' +
      thHtml +
      '</tr>';
      return html;
  },
  timeLiTpl: function (className,time){
    var html = '<li class="c-datepicker-time-spinner__item ' + className + '">' + time+'</li>';
    return html;
  },
  timeTpl: function (className,li){
    var html = '<div class="c-datepicker-time-spinner__wrapper c-datepicker-scrollbar">' +
      '<div class="c-datepicker-scrollbar__wrap ' + className+'" style="max-height: inherit; margin-bottom: -' + JQTABLESCROLLWIDTH + 'px; margin-right: -' + JQTABLESCROLLWIDTH + 'px;">' +
      '<ul class="c-datepicker-scrollbar__view c-datepicker-time-spinner__list">' +
      li +
      '</ul>' +
      '</div>' +
      '</div>';
    return html;
  },
  timeMainTpl: function (nameOptions,time){
    var html = '<div class="c-datepicker-time-panel c-datepicker-popper" style="">' +
      '<div class="c-datepicker-time-panel__content has-seconds">' +
      '<div class="c-datepicker-time-spinner has-seconds">' +
      time +
      '</div>' +
      '</div>' +
      '<div class="c-datepicker-time-panel__footer">' +
      '<button type="button" class="c-datepicker-time-panel__btn min">' + nameOptions.zero+'</button>' +
      '<button type="button" class="c-datepicker-time-panel__btn max">23:59</button>' +
      '<button type="button" class="c-datepicker-time-panel__btn cancel">' + nameOptions.cancel +'</button>' +
        '<button type="button" class="c-datepicker-time-panel__btn confirm">' + nameOptions.confirm+'</button>' +
      '</div>' +
      '</div>';
      return html;
  },
  sideBarButton: function (day, time, name){
    var html = '<button type="button" class="c-datepicker-picker__shortcut" data-value="' + day + '" data-time="' + time + '">' + name+'</button>';
    return html;
  },
  sideBarTpl: function (button){
    var html = '<div class="c-datepicker-picker__sidebar">' +
      button +
      '</div>';
      return html;
  },
  pickerFooterTpl: function (nameOptions,className, text){
      var clearHtml = '';
      if (className === 'c-datepicker-picker__btn-now') {
        clearHtml = '<button type="button" class="c-datepicker-button c-datepicker-picker__link-btn c-datepicker-button--text c-datepicker-button--mini c-datepicker-picker__btn-clear">' +
          '<span>' +
          nameOptions.clear +
          '</span>' +
          '</button>'
      }
      var html = '<div class="c-datepicker-picker__footer" style="">' +
        clearHtml +
        '<button type="button" class="c-datepicker-button c-datepicker-picker__link-btn c-datepicker-button--text c-datepicker-button--mini ' + className + '">' +
        '<span>' +
        text +
        '</span>' +
        '</button>' +
        '<button type="button" class="c-datepicker-button c-datepicker-picker__link-btn confirm c-datepicker-button--default c-datepicker-button--mini is-plain">' +
        '<span>' +
        nameOptions.confirm +
        '</span>' +
        '</button>' +
        '</div>';
      return html;
  },
  pickerArrowTpl:function(){
    return '<div x-arrow="" class="popper__arrow" style="left: 35px;"></div>';
  },
  pickerHeaderTpl: function (nameOptions,className, prev, next, year, month){
    var html = '<div class="'+className+'__header">' +
      prev +
      '<span role="button" class="' + className + '__header-label ' + className + '__header-year"><span>' + year + '</span> ' + nameOptions.headerYearLink+'</span>' +
      '<span role="button" class="' + className + '__header-label ' + className + '__header-month"><span>' + month + '</span> ' + nameOptions.units[1] +'</span>' +
      next +
      '</div>';
      return html;
  },
  pickerHeaderPrevTpl: function (nameOptions,className){
    var html = '<i class="kxiconfont icon-first c-datepicker-picker__icon-btn ' + className + '__prev-btn year" aria-label="' + nameOptions.prevYear +'"></i>' +
      '<i class="kxiconfont icon-left c-datepicker-picker__icon-btn ' + className + '__prev-btn month" aria-label="' + nameOptions.nextMonth +'"></i>';
    return html;
  },
  pickerHeaderNextTpl: function (nameOptions,className) {
    var html = '<i class="kxiconfont icon-right c-datepicker-picker__icon-btn ' + className + '__next-btn month" aria-label="' + nameOptions.nextMonth +'"></i>' +'<i class="kxiconfont icon-last c-datepicker-picker__icon-btn ' + className + '__next-btn year" aria-label="' + nameOptions.nextYear +'"></i>';
    return html;
  },
  pickerHeaderNextSingleTpl: function (nameOptions,className) {
    var html = '<i class="kxiconfont icon-last c-datepicker-picker__icon-btn ' + className + '__next-btn year" aria-label="' + nameOptions.nextYear +'"></i>' +
      '<i class="kxiconfont icon-right c-datepicker-picker__icon-btn ' + className + '__next-btn month" aria-label="' + nameOptions.nextMonth +'"></i>';
    return html;
  },
  pickerTimeHeaderTpl: function (nameOptions,className){
    var html = '<span class="'+className+'__editor-wrap">' +
      '<div class="c-datepicker-input c-datepicker-input--small">' +
      '<input type="text" autocomplete="off" placeholder="' + nameOptions.chooseDay+'" class="c-datepicker-input__inner c-datePicker__input-day">' +
      '</div>' +
      '</span>' +
      '<span class="'+className+'__editor-wrap">' +
      '<div class="c-datepicker-input c-datepicker-input--small">' +
      '<input type="text" autocomplete="off" placeholder="' + nameOptions.chooseTime +'" class="c-datepicker-input__inner c-datePicker__input-time">' +
      '</div>' +
      '</span>';
      return html;
  },
  pickerOnlyTimeHeaderTpl: function (className, name){
    var html = '<span class="' + className+'__editor-wrap">' +
      '<div class="c-datepicker-only-time-title">' + name+'</div>' +
      '</span>';
      return html;
  },
  rangePickerMainTpl: function (nameOptions,hasTime,hasSidebar,yearEnd, monthEnd, sidebar, table){
    var className ='c-datepicker-date-range-picker';
    var timeHeader = RENDERAPI.pickerTimeHeaderTpl(nameOptions,className);
    var prev = RENDERAPI.pickerHeaderPrevTpl(nameOptions,className);
    var next = RENDERAPI.pickerHeaderNextTpl(nameOptions,className);
    var pickerHeader = RENDERAPI.pickerHeaderTpl(nameOptions,className,prev, '','{{year}}','{{month}}');
    var pickerHeader2 = RENDERAPI.pickerHeaderTpl(nameOptions,className, '', next, yearEnd, monthEnd);
    var footer = RENDERAPI.pickerFooterTpl(nameOptions,'c-datepicker-picker__btn-clear', nameOptions.clear);
    var arrow = RENDERAPI.pickerArrowTpl();
    var html = '<div class="c-datepicker-picker c-datepicker-date-range-picker c-datepicker-popper ' + hasTime + ' ' + hasSidebar+'" x-placement="top-start">' +
      '<div class="c-datepicker-picker__body-wrapper">' +
      sidebar +
      '<div class="c-datepicker-picker__body">' +
      '<div class="c-datepicker-date-range-picker__time-header">' +
      '<div class="c-datepicker-date-range-picker__time-content">' +
      timeHeader+
      '</div>' +
      '<span class="kxiconfont icon-right"></span>' +
      '<div class="c-datepicker-date-range-picker__time-content">' +
      timeHeader+
      '</div>' +
      '</div>' +
      '<div class="c-datepicker-picker__body-content">' +
      '<div class="c-datepicker-date-range-picker-panel__wrap is-left">' +
      pickerHeader +
      '<div class="c-datepicker-picker__content">' +
      table +
      '</div>' +
      '</div>' +
      '<div class="c-datepicker-date-range-picker-panel__wrap is-right">' +
      pickerHeader2 +
      '<div class="c-datepicker-picker__content">' +
      table +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>' +
      footer+
      arrow +
      '</div>';
      return html;
  },
  pickerFooterOnlyTimeTpl: function (nameOptions){
    //  范围-只有时分秒
    var html = '<div class="c-datepicker-picker__footer" style="">' +
      '<button type="button" class="c-datepicker-button c-datepicker-picker__link-btn c-datepicker-button--text c-datepicker-button--mini  c-datepicker-picker__btn-clear">' +
      '<span>' +
      nameOptions.clear +
      '</span>' +
      '</button>' +
      '<button type="button" class="c-datepicker-button c-datepicker-picker__link-btn c-datepicker-button--text c-datepicker-button--mini  c-datepicker-picker__btn-cancel">' +
      '<span>' +
      nameOptions.cancel +
      '</span>' +
      '</button>' +
      '<button type="button" class="c-datepicker-button c-datepicker-picker__link-btn confirm c-datepicker-button--default c-datepicker-button--mini is-plain">' +
      '<span>' +
      nameOptions.confirm +
      '</span>' +
      '</button>' +
      '</div>';
      return html;
  },
  rangePickerMainOnlyTimeTpl: function (nameOptions,hasTime){
    var className ='c-datepicker-date-range-picker';
    var headerBegin = RENDERAPI.pickerOnlyTimeHeaderTpl(className, nameOptions.begin);
    var headerEnd = RENDERAPI.pickerOnlyTimeHeaderTpl(className, nameOptions.end);
    var footer = RENDERAPI.pickerFooterOnlyTimeTpl(nameOptions);
    var arrow = RENDERAPI.pickerArrowTpl();
    var html = '<div class="c-datepicker-picker c-datepicker-date-range-picker c-datepicker-popper ' + hasTime+'" x-placement="top-start">' +
    '<div class="c-datepicker-picker__body-wrapper">' +
    '<div class="c-datepicker-picker__body">' +
    '<div class="c-datepicker-date-range-picker__time-header">' +
    '<div class="c-datepicker-date-range-picker__time-content c-datepicker-date-picker__onlyTime-content">' +
      headerBegin +
    '</div>' +
    '<div class="c-datepicker-date-range-picker__time-content c-datepicker-date-picker__onlyTime-content">' +
      headerEnd +
    '</div>' +
    '</div>' +
    '</div>' +
    '</div>' +
      footer +
      arrow +
    '</div>';
    return html;
  },
  pickerFooterNowButton:function(nameOptions){
    var html = RENDERAPI.pickerFooterTpl(nameOptions,'c-datepicker-picker__btn-now', nameOptions.now);
    return html;
  },
  pickerFooterClearButton: function (nameOptions) {
    var html = RENDERAPI.pickerFooterTpl(nameOptions,'c-datepicker-picker__btn-clear', nameOptions.clear); 
    return html;
  },
  datePickerMainTpl: function (nameOptions){
    var className = 'c-datepicker-date-picker';
    var timeHeader = RENDERAPI.pickerTimeHeaderTpl(nameOptions,className);
    var prev = RENDERAPI.pickerHeaderPrevTpl(nameOptions,className);
    var next = RENDERAPI.pickerHeaderNextSingleTpl(nameOptions,className);
    var pickerHeader = RENDERAPI.pickerHeaderTpl(nameOptions, className, prev, next, '{{year}}', '{{month}}');
    var arrow = RENDERAPI.pickerArrowTpl();
    // 单个
    var html = '<div class="c-datepicker-picker c-datepicker-date-picker c-datepicker-popper {{hasTime}} {{hasSidebar}}" x-placement="top-start">' +
      '<div class="c-datepicker-picker__body-wrapper">' +
      '{{sidebar}}' +
      '<div class="c-datepicker-picker__body">' +
      '<div class="c-datepicker-date-picker__time-header">' +
      timeHeader +
      '</div>' +
      pickerHeader +
      ' <div class="c-datepicker-picker__content">' +
      '{{table}}' +
      '</div>' +
      '</div>' +
      '</div>' +
      '{{footerButton}}' +
      arrow+
      '</div>';
    return html;
  },
  datePickerMainOnlyTimeTpl: function (hasTime){
    var header = RENDERAPI.pickerOnlyTimeHeaderTpl('c-datepicker-date-picker', '');
    var arrow = RENDERAPI.pickerArrowTpl();
    // 单个-只有时分秒
    var html = '<div class="c-datepicker-picker c-datepicker-date-picker c-datepicker-popper ' + hasTime+'" x-placement="top-start">' +
      '<div class="c-datepicker-picker__body-wrapper">' +
      '<div class="c-datepicker-picker__body">' +
      '<div class="c-datepicker-date-picker__time-header c-datepicker-date-picker__onlyTime-content">' +
      header +
      '</div>' +
      '</div>' +
      '</div>' +
      arrow +
      '</div>';
    return html;
  },
  monthWords:function(nameOptions){
    return nameOptions.months;
  }
};
var EVERYMONTHHASDAY = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
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