/*==============BEGIN YEAR============*/
// .c-datepicker-picker__content
function Year(picker) {
  this.picker = picker;
  this.init();
}

$.extend(Year.prototype, {
  init: function () {

  },
  event: function () {
    // 点击选择年
    if (!this.picker.config.isRange) {
      this.picker.$container.on('click', '.c-datepicker-year-table td.available', function () {
        if ($(this).hasClass('disabled')) {
          return;
        }
        var _this = API.getPicker($(this), 'year');
        var activeNum = $(this).text();
        _this.picker.$container.find('.c-datepicker-date-picker__header-year span').text(activeNum);
        // 年类型，无月、日期
        if (_this.picker.params.isYear) {
          _this.picker.$input.val(activeNum);
          _this.picker.$container.find('.c-datepicker-year-table td.current').removeClass('current');
          $(this).addClass('current');
          _this.picker.datePickerObject.hide('choose');
        } else {
          _this.picker.monthObject.render();
          _this.hide();
        }
      })
    }
  },
  show: function () {
    this.picker.$container.find('.c-datepicker-date-table,.c-datepicker-month-table,.c-datepicker-date-picker__header-month').hide();
    this.picker.$container.find('.c-datepicker-year-table').show();
  },
  hide: function () {
    this.picker.$container.find('.c-datepicker-year-table').hide();
    this.picker.$container.find('.c-datepicker-date-picker__prev-btn.year,.c-datepicker-date-picker__next-btn.year').removeClass('is-year');
  },
  render: function (year) {
    var html = this.renderHtml(year);
    var $year = this.picker.$container.find('.c-datepicker-year-table');
    if (!$year.length) {
      this.picker.$container.find('.c-datepicker-picker__content').append(html);
      this.picker.$container.data('year', this);
      this.show();
      this.event();
    } else {
      $year.replaceWith(html);
      this.show();
    }
    this.picker.$container.find('.c-datepicker-date-picker__prev-btn.month,.c-datepicker-date-picker__next-btn.month').hide();
    this.picker.$container.find('.c-datepicker-date-picker__prev-btn.year,.c-datepicker-date-picker__next-btn.year').addClass('is-year');
  },
  renderHtml: function (year) {
    year = year || moment().year();
    var min = Number(parseInt(year / 10) + '0');
    // var max = min+9;
    var temp = '';
    var html = '';
    var val = this.picker.$input.val();
    var activeYear = val ? API.getTimeFormat(moment(API.newDateFixed(this.picker, val))).year : false;
    var nameOptions = $.fn.datePicker.dates[this.picker.language];
    this.picker.$container.find('.c-datepicker-date-picker__header-year span').text(min + nameOptions.headerYearLink+'-' + (min + 9));
    for (var index = 0; index < 10; index++) {
      var _val = min + index;
      var className = _val == activeYear ? 'current available' : 'available';
      if (_val < this.picker.minJson.year || _val > this.picker.maxJson.year) {
        className += ' disabled';
      }
      temp += RENDERAPI.tdTpl(className, _val);
      if ((index + 1) % 4 === 0) {
        html += '<tr>' + temp + '</tr>';
        temp = '';
      }
    }
    if (temp) {
      html += '<tr>' + temp + '</tr>';
    }
    html = RENDERAPI.tableTpl('c-datepicker-year-table', html);
    return html;
  }
});
/*==============END YEAR============*/