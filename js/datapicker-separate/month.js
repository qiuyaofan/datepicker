/*==============BEGIN MONTH============*/
// 月
function Month(picker) {
  this.picker = picker;
  this.init();
}

$.extend(Month.prototype, {
  init: function () {

  },
  event: function () {
    if (!this.picker.config.isRange) {
      // 点击选择月份
      this.picker.$container.on('click', '.c-datepicker-month-table td.available', function () {
        if ($(this).hasClass('disabled')) {
          return;
        }
        var _this = API.getPicker($(this), 'month');
        var year = _this.picker.$container.find('.c-datepicker-date-picker__header-year span').text();
        var month = _this.picker.$container.find('.c-datepicker-month-table td').index($(this)) + 1;
        _this.picker.$container.find('.c-datepicker-date-picker__header-month span').text(month);
        // 是选择月，无日期
        if (_this.picker.params.isMonth) {
          var val = year + _this.picker.splitStr + API.fillTime(month);
          _this.picker.$input.val(val);
          _this.picker.$container.find('.c-datepicker-month-table td.current').removeClass('current');
          $(this).addClass('current');
          _this.picker.datePickerObject.hide('choose');
        } else {
          _this.picker.dayObject.renderSingle(year, month, false, true);
          _this.hide();
        }
      })
    }
  },
  show: function () {
    this.picker.$container.find('.c-datepicker-month-table').show();
    this.picker.$container.find('.c-datepicker-date-table,.c-datepicker-year-table').hide();
  },
  hide: function () {
    this.picker.$container.find('.c-datepicker-date-picker__prev-btn.month,.c-datepicker-date-picker__next-btn.month').show();
    this.picker.$container.find('.c-datepicker-date-picker__header-month').show();
    this.picker.$container.find('.c-datepicker-month-table').hide();
    this.picker.$container.find('.c-datepicker-date-picker__prev-btn.year,.c-datepicker-date-picker__next-btn.year').removeClass('is-month');
  },
  render: function () {
    var html = this.renderHtml();
    var $month = this.picker.$container.find('.c-datepicker-month-table');
    if (!$month.length) {
      this.picker.$container.find('.c-datepicker-picker__content').append(html);
      this.picker.$container.data('month', this);
      this.show();
      this.event();
    } else {
      $month.replaceWith(html);
      this.show();
    }
    this.picker.$container.find('.c-datepicker-date-picker__prev-btn.year,.c-datepicker-date-picker__next-btn.year').addClass('is-month');
  },
  renderHtml: function () {
    // month = month || moment().month() + 1;
    var min = 1;
    var temp = '';
    var html = '';
    var nowYear = this.picker.$container.find('.c-datepicker-date-picker__header-year span').text();
    var minYear = this.picker.minJson.year;
    var maxYear = this.picker.maxJson.year;
    var disabledName = '';
    var isSame = false;
    // 不在范围内
    if (nowYear < minYear || nowYear > maxYear) {
      disabledName = ' disabled';
    } else if (nowYear == minYear || nowYear == maxYear) {
      isSame = true;
      var minMonth, maxMonth;
      if (maxYear == minYear) {
        minMonth = this.picker.minJson.month;
        maxMonth = this.picker.maxJson.month;
      } else if (nowYear == minYear) {
        minMonth = this.picker.minJson.month;
        maxMonth = 13;
      } else if (nowYear == maxYear) {
        minMonth = 0;
        maxMonth = this.picker.maxJson.month;
      }
    }
    var val = this.picker.$input.val();
    var formatResult = API.getTimeFormat(moment(API.newDateFixed(this.picker, val)));
    var activeMonth = val && (formatResult.year == nowYear) ? formatResult.month : false;
    var nameOptions = $.fn.datePicker.dates[this.picker.language];
    var words = RENDERAPI.monthWords(nameOptions);
    for (var index = 0; index < 12; index++) {
      var _val = min + index;
      // var className = 'available';
      var className = _val === activeMonth ? 'current available' : 'available';
      className += disabledName;
      if (isSame && (_val < minMonth || _val > maxMonth)) {
        className += ' disabled';
      }
      temp += RENDERAPI.tdTpl(className, words[index]);
      if ((index + 1) % 4 === 0) {
        html += '<tr>' + temp + '</tr>';
        temp = '';
      }
    }
    html = RENDERAPI.tableTpl('c-datepicker-month-table', html);
    return html;
  }
});

  /*==============END MONTH============*/