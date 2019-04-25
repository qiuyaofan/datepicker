// 时间范围
function RangeDatePickerTime(datePickerObject) {
  this.datePickerObject = datePickerObject;
  this.datePickerObject.pickerObject = null;
  this.$input = datePickerObject.$target.find('input');
  this.$inputBegin = this.$input.eq(0);
  this.$inputEnd = this.$input.eq(1);
  this.config = datePickerObject.config;
  this.hasTime = true;
  this.onlyTime = true;
  this.params = {};
  this.language=this.config.language||'zh-CN';
  this.timeMin = API.timeVal(this, 'min');
  this.timeMax = API.timeVal(this, 'max');
  this.configMinMax = API.getOnlyTimeMinMax(this);
  this.configBegin = $.extend({},this.configMinMax);
  this.configEnd = $.extend({}, this.configMinMax);
  this.init();
}

$.extend(RangeDatePickerTime.prototype, {
  init: function () {
    this.initShow();
    this.event();
  },

  initShow: function () {
    // 初始化splitStr，params.format，minJson，maxJson
    DATEPICKERAPI.initParams(this);
    var hasTime = 'has-time only-time';
    var nameOptions = $.fn.datePicker.dates[this.language];
    var TPL = this.config.isRange ? RENDERAPI.rangePickerMainOnlyTimeTpl(nameOptions, hasTime) : RENDERAPI.datePickerMainOnlyTimeTpl(hasTime);
    // var TPL = this.config.isRange ? RANGEPICKERMAINONLYTIMETPL : DATEPICKERMAINOLNLYTIMETPL;
    var $datePickerHtml = $(TPL.replace(/{{table}}/g, ''));
    $('body').append($datePickerHtml);
    this.$container = $datePickerHtml;
    this.$container.data('picker', this);
    this.$container.addClass('is-' + this.language);
    // 初始化年月日十分秒panel
    this.timeObject = new OnlyTime(this);
  },
  event: function () {
    this.$container.on('click', function (event) {
      event.stopPropagation();
    });
    this.datePickerObject.$target.on('click', function (event) {
      event.stopPropagation();
    });
    // 点击清空
    this.$container.on('click', '.c-datepicker-picker__btn-clear', function () {
      var _this = API.getPicker($(this));
      _this.clear();
      _this.datePickerObject.hide('confirm');
    })
    // 点击清空
    this.$container.on('click', '.c-datepicker-picker__btn-cancel', function () {
      var _this = API.getPicker($(this));
      if (_this.config.isRange){
        var valArr=_this.timeObject.prevValue.split(',');
        _this.$inputBegin.val(valArr[0]);
        _this.$inputEnd.val(valArr[1]);
      }
      
      _this.datePickerObject.hide('confirm');
    })

    // 点击确定
    this.$container.on('click', '.c-datepicker-picker__link-btn.confirm', function () {
      var _this = API.getPicker($(this));
      _this.datePickerObject.hide('confirm');
    });
  },
  show: function () {
    this.$container.show();
    DATEPICKERAPI.setInitVal(this);
    this.timeObject.render(this.params.format.slice(3));
  },
  clear: function () {
    this.$inputBegin.val('');
    this.$inputEnd.val('');
  }
});