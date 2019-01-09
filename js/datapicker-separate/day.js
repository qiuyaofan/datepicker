/*==============BEGIN DAY============*/
// 日期
function Day(picker) {
  this.picker = picker;
  this.init();
}

$.extend(Day.prototype, {
  init: function () {
    this.current = 0;
  },
  eventSingle: function () {
    // 点击选择日期
    this.picker.$container.on('click', '.c-datepicker-date-table td.available', function (event) {
      event.stopPropagation();
      var $this = $(this);
      var _this = API.getPicker($this, 'day');
      if ($this.hasClass('disabled')) {
        return;
      }
      if (_this.picker.isBlur) {
        var $wrap = $this.parents('.c-datepicker-picker__content');
        var index = $wrap.find('.c-datepicker-date-table td').index($this);
        $.sub('datapickerClick', function (e) {
          $this = $wrap.find('.c-datepicker-date-table td').eq(index);
          clickDate(_this, $this);
          $.unsub('datapickerClick');
        });
        $.pub('datapickerRenderPicker');
      } else {
        clickDate(_this, $this);
      }
    })
    function clickDate(_this, $target) {
      var activeNum = $target.text();
      _this.picker.$container.find('.c-datepicker-date-table td.current').removeClass('current');
      $target.addClass('current');
      var val = _this.picker.$container.find('.c-datePicker__input-day').val();
      if (!val) {
        var time = moment().format(_this.picker.config.format).split(' ')[1];
        _this.picker.$container.find('.c-datePicker__input-time').val(time);
        setValue.call(_this, activeNum, moment(), moment());
      } else {
        var inputVal = _this.picker.$input.val();
        setValue.call(_this, activeNum, moment(API.newDateFixed(_this.picker, val)), moment(API.newDateFixed(_this.picker, inputVal)));
      }
      if (!_this.picker.hasTime) {
        _this.picker.datePickerObject.hide('choose');
      } else {
        API.judgeTimeRange(_this.picker, _this.picker.$container.find('.c-datePicker__input-day'), _this.picker.$container.find('.c-datePicker__input-time'));
      }
    }
    // 设置选中值
    function setValue(activeNum, input, inputDay) {
      var year = this.picker.$container.find('.c-datepicker-date-picker__header-year span').text();
      var month = this.picker.$container.find('.c-datepicker-date-picker__header-month span').text() - 1;
      // picker里的日期input
      val = input.set({ 'year': year, 'month': month, 'date': activeNum }).format(this.picker.config.format.split(' ')[0]);
      this.picker.$container.find('.c-datePicker__input-day').val(val);
      // 整个表单input update
      var inputVal = inputDay.set({ 'year': year, 'month': month, 'date': activeNum }).format(this.picker.config.format);
      this.picker.$input.val(inputVal);
    }
  },
  eventRange: function () {
    // 点击选择日期
    this.picker.$container.on('click', '.c-datepicker-date-table td.available', function (event) {
      event.stopPropagation();
      var $this = $(this);
      if ($this.hasClass('disabled')) {
        return;
      }
      var _this = API.getPicker($this, 'day');
      if (_this.picker.isBlur) {
        var $wrap = $this.parents('.c-datepicker-date-range-picker-panel__wrap');
        var index = $wrap.find('td').index($this);
        $.sub('datapickerClick', function (e) {
          $this = $wrap.find('td').eq(index);
          clickDateRange(_this, $this);
          $.unsub('datapickerClick');
        });
        $.pub('datapickerRenderPicker');
      } else {
        clickDateRange(_this, $this);
      }
    })

    function clickDateRange(_this, $target) {
      // var _this = API.getPicker($(this), 'day');
      var $wrap = _this.picker.$container.find('.c-datepicker-date-range-picker-panel__wrap');
      $wrap.find('td.current.hover').removeClass('current hover');
      var $current = $wrap.find('td.current');

      var $activeWrap = $target.parents('.c-datepicker-date-range-picker-panel__wrap');
      var date = $target.find('.cell').text();
      var $day = _this.picker.$container.find('.c-datePicker__input-day');
      var $time = _this.picker.$container.find('.c-datePicker__input-time');
      var year = $activeWrap.find('.c-datepicker-date-range-picker__header-year span').text();
      var month = $activeWrap.find('.c-datepicker-date-range-picker__header-month span').text() - 1;
      // 重选
      if (_this.current >= 2) {
        $current.removeClass('current');
        $wrap.find('td.in-range').removeClass('in-range');
        $current = $wrap.find('td.current');
        _this.current = 0;
      }
      if (!_this.current) {
        $target.addClass('current');
        var inputVal = moment().set({ 'year': year, 'month': month, 'date': date }).format(_this.picker.config.format.split(' ')[0]);
        $day.val(inputVal);
        $time.eq(0).val(_this.picker.timeMin);
        $time.eq(1).val(_this.picker.timeMax);
        _this.current = 1;
      } else if (_this.current == 1) {
        // 选完两个
        $target.addClass('current');
        var existDate = $day.eq(0).val();
        var inputVal = moment().set({ 'year': year, 'month': month, 'date': date }).format(_this.picker.config.format.split(' ')[0]);
        var a = moment(API.newDateFixed(_this.picker, existDate));
        var b = moment(API.newDateFixed(_this.picker, inputVal));
        // 比初选的小，交换
        if (!_this.picker.hasTime) {
          // 没有十分秒，则选完就隐藏时间插件，并赋值输入框
          if (b.diff(a) < 0) {
            var temp = inputVal;
            inputVal = existDate;
            existDate = temp;
          }
          _this.current = 2;
          _this.picker.$inputBegin.val(existDate);
          _this.picker.$inputEnd.val(inputVal);
          _this.picker.datePickerObject.hide('choose');
        } else {
          // 有十分秒，则选添加选择范围样式
          if (b.diff(a) < 0) {
            $day.eq(0).val(inputVal);
            $day.eq(1).val(existDate);
          } else {
            $day.eq(1).val(inputVal);
          }
          _this.current = 2;
          _this.addRangeClass();
        }
      }

      if (_this.current) {
        var index = _this.current - 1;
        API.judgeTimeRange(_this.picker, _this.picker.$container.find('.c-datePicker__input-day').eq(index), _this.picker.$container.find('.c-datePicker__input-time').eq(index), index);
      }
    }

    // 移动渲染范围模式，前提是只有一个current时
    this.picker.$container.on('mouseenter', '.c-datepicker-date-table td.available', function () {
      var _this = API.getPicker($(this), 'day');
      if (_this.current != 1) {
        return;
      }
      _this.picker.$container.find('td.current.hover').removeClass('current hover');
      $(this).addClass('current hover');
      var $wrap = $(this).parents('.c-datepicker-date-range-picker-panel__wrap');
      var $start = _this.picker.$container.find('.c-datePicker__input-day').eq(0);
      var year = $wrap.find('.c-datepicker-date-range-picker__header-year span').text();
      var month = $wrap.find('.c-datepicker-date-range-picker__header-month span').text();
      var date = $(this).find('.cell').text();
      var start = $start.val();
      var end = year + _this.picker.splitStr + month + _this.picker.splitStr + date;
      // 需要交换开始结束时间
      if (moment(API.newDateFixed(_this.picker, start)).isAfter(API.newDateFixed(_this.picker, end))) {
        var temp = start;
        start = end;
        end = temp;
      }
      _this.addRangeClass(moment(API.newDateFixed(_this.picker, start)), moment(API.newDateFixed(_this.picker, end)), true);
    })
  },
  show: function () {
    this.picker.$container.find('.c-datepicker-year-table,.c-datepicker-month-table').hide();
    this.picker.$container.find('.c-datepicker-date-table').show();
  },
  hide: function () {
    this.picker.$container.find('.c-datepicker-date-table').hide();
  },
  render: function (year, month, today, baseEnd, reRender) {
    if (this.picker.config.isRange) {
      this.renderRange(year, month, today, baseEnd, reRender);
    } else {
      this.renderSingle(year, month, today, reRender);
    }
  },
  renderSingle: function (year, month, today, reRender) {
    var html = this.renderHtml(year, month, today);
    var $year = this.picker.$container.find('.c-datepicker-date-table');
    if ($year.length && !reRender) {
      this.addCurrentSingle();
      this.show();
    } else {
      var $content = this.picker.$container.find('.c-datepicker-picker__content');
      // 日历头部
      var $year = this.picker.$container.find('.c-datepicker-date-picker__header-year span');
      var $month = this.picker.$container.find('.c-datepicker-date-picker__header-month span');
      $year.text(year);
      $month.text(month);
      if (!$content.find('.c-datepicker-date-table').length) {
        $content.append(html);
      } else {
        $content.find('.c-datepicker-date-table').replaceWith(html);
      }
      if (!this.picker.$container.data('day')) {
        this.picker.$container.data('day', this);
      }
      this.addCurrentSingle();
      this.show();
      if (!reRender) {
        this.eventSingle();
      }
    }
  },
  addCurrentSingle: function () {
    var val = this.picker.$input.val();
    if (!val) {
      return;
    }
    if (!API.dayReg(this.picker).test(val.split(' ')[0])) {
      return;
    }
    var result = API.getTimeFormat(moment(API.newDateFixed(this.picker, val)));
    var year = this.picker.$container.find('.c-datepicker-date-picker__header-year span').text();
    var month = this.picker.$container.find('.c-datepicker-date-picker__header-month span').text();
    if (result.year == year && result.month == month) {
      var $day = this.picker.$container.find('.c-datepicker-date-table td.available');
      $day.removeClass('current');
      $day.eq(result.day - 1).addClass('current');
    }
  },
  // 显示和选中值有联动关系，和输入框修改日期有关
  renderRange: function (year, month, today, baseEnd, reRender) {
    var $dateTable = this.picker.$container.find('.c-datepicker-date-table');
    if ($dateTable.length && !reRender) {
      this.show();
    } else {
      var index = 0, distance = 1, countFn = API.maxMonth, initMonth = 1;
      // 去掉 不需要
      // if (baseEnd) {
      //   index = 1;
      //   distance = -1;
      //   countFn = API.minMonth;
      //   initMonth = 12;
      // }
      // today[index]
      var html = this.renderHtml(year[index], month[index], false);
      // 选中间隔月份
      var monthEnd = month[index] + distance;
      var yearEnd = year[index];
      if (countFn(monthEnd)) {
        monthEnd = initMonth;
        yearEnd = yearEnd + distance;
      }
      var htmlEnd = this.renderHtml(yearEnd, monthEnd, false);

      // 日历头部
      var $dateTable = this.picker.$container.find('.c-datepicker-date-range-picker__header-year');
      var $month = this.picker.$container.find('.c-datepicker-date-range-picker__header-month');
      $dateTable.eq(index).find('span').text(year[index]);
      $month.eq(index).find('span').text(month[index]);
      $dateTable.eq(1 - index).find('span').text(yearEnd);
      $month.eq(1 - index).find('span').text(monthEnd);

      this.picker.$container.find('.c-datepicker-picker__content').eq(index).html(html);
      this.picker.$container.find('.c-datepicker-picker__content').eq(1 - index).html(htmlEnd);
      if (!this.picker.$container.data('day')) {
        this.picker.$container.data('day', this);
      }
      this.addRangeClass();
      if (!reRender) {
        this.eventRange();
      }
    }
  },
  // 上一月下一月，上一年下一年修改显示界面
  prevNextSingle: function (moveType, type) {
    var $year = this.picker.$container.find('.c-datepicker-date-picker__header-year');
    var $month = this.picker.$container.find('.c-datepicker-date-picker__header-month');
    var year = Number($year.find('span').text());
    var month = Number($month.find('span').text());
    var day = this.picker.$container.find('.c-datePicker__input-day').val();
    var dayFormat = API.getTimeFormat(moment(API.newDateFixed(this.picker, day)));
    var count = 1;
    if (moveType === 'prev') {
      count = -1;
    }
    if (type === 'year') {
      year = year + count;
    } else if (type === 'month') {
      month = month + count;
      var result = API.fillMonth(month, year);
      month = result.month;
      year = result.year;
    }
    var date = false;
    if (dayFormat.year == year && dayFormat.month == month) {
      date = dayFormat.day;
    }
    var html = this.renderHtml(year, month, date);
    // 日历头部
    $year.find('span').text(year);
    $month.find('span').text(month);
    var $content = this.picker.$container.find('.c-datepicker-picker__content');
    var $table = $content.find('.c-datepicker-date-table');
    this.picker.$container.find('.c-datepicker-month-table,.c-datepicker-year-table').hide();
    if ($table.length) {
      $table.replaceWith(html);
    } else {
      $content.append(html);
    }
  },
  // 上一月下一月，上一年下一年修改显示界面
  prevNextRender: function (moveType, type) {
    var $year = this.picker.$container.find('.c-datepicker-date-range-picker__header-year');
    var $month = this.picker.$container.find('.c-datepicker-date-range-picker__header-month');
    var year = Number($year.eq(0).find('span').text());
    var month = Number($month.eq(0).find('span').text());
    var count = 1;
    var endYear, endMonth;
    if (moveType === 'prev') {
      count = -1;
    }
    if (type === 'year') {
      year = year + count;
    } else if (type === 'month') {
      month = month + count;
    }
    var result = API.fillMonth(month, year);
    month = result.month;
    year = result.year;
    endMonth = month + 1;
    var endResult = API.fillMonth(endMonth, year);
    endMonth = endResult.month;
    endYear = endResult.year;

    var html = this.renderHtml(year, month, false);
    var htmlEnd = this.renderHtml(endYear, endMonth, false);
    // 日历头部
    $year.eq(0).find('span').text(year);
    $month.eq(0).find('span').text(month);
    $year.eq(1).find('span').text(endYear);
    $month.eq(1).find('span').text(endMonth);
    this.picker.$container.find('.c-datepicker-picker__content').eq(0).html(html);
    this.picker.$container.find('.c-datepicker-picker__content').eq(1).html(htmlEnd);
    this.addRangeClass(false, false, true);
  },
  // 拼接day的html
  renderHtml: function (year, month, activeDay) {
    var _moment = moment();
    month = month || _moment.month() + 1;
    year = year || _moment.year();
    var today = (_moment.month() + 1 === month) && (_moment.year() === year) ? _moment.date() : '';

    var prevMonthDay = API.getMonthDay(month - 1, year);
    var day = API.getMonthDay(month, year);
    var weekday = moment().set({ 'year': year, 'month': month - 1, 'date': 1 }).weekday();
    var weekdayLast = moment().set({ 'year': year, 'month': month - 1, 'date': day }).weekday();
    var html = DAYHEADER;
    var min = 1;
    var temp = '';
    var row = 0;
    // prev-month
    if (weekday != 0) {
      for (var prev = weekday - 1; prev >= 0; prev--) {
        var className = 'prev-month';
        temp += TDTPL.replace('{{value}}', prevMonthDay - prev).replace('{{today}}', className);
        if ((weekday - prev) % 7 === 0) {
          html += '<tr>' + temp + '</tr>';
          temp = '';
          row += 1;
        }
      }
    }
    var begin = weekday % 7;
    // active day 
    var hasMin = this.picker.minJson ? true : false;
    var hasMax = this.picker.maxJson ? true : false;
    var minMonth = hasMin ? moment(API.newDateFixed(this.picker, this.picker.minJson.year + this.picker.splitStr + this.picker.minJson.month+ this.picker.splitStr+1)):false;
    var maxMonth = hasMax ? moment(API.newDateFixed(this.picker, this.picker.maxJson.year + this.picker.splitStr + this.picker.maxJson.month + this.picker.splitStr + 1)):false;
    var disabledName = '';
    var isSame = false;
    var nowDate = moment(API.newDateFixed(this.picker, year + this.picker.splitStr + month + this.picker.splitStr + 1));
    // 不在范围内
    if ((hasMin && nowDate.isBefore(minMonth)) || (hasMax && nowDate.isAfter(maxMonth))) {
      disabledName = ' disabled';
    } else if ((hasMin && nowDate.isSame(minMonth)) || (hasMax && nowDate.isSame(maxMonth))) {
      isSame = true;
      var minDay, maxDay;
      if (hasMin && hasMax && maxMonth.isSame(minMonth)) {
        minDay = this.picker.minJson.day;
        maxDay = this.picker.maxJson.day;
      } else if (hasMin && nowDate.isSame(minMonth)) {
        minDay = this.picker.minJson.day;
        maxDay = 32;
      } else if (hasMax && nowDate.isSame(maxMonth)) {
        minDay = 0;
        maxDay = this.picker.maxJson.day;
      }
    }
    for (var index = 0; index < day; index++) {
      var className = 'available' + disabledName;
      var _val = min + index;
      if (_val === today) {
        className += ' today';
      }
      if (_val === activeDay) {
        className += ' current';
      }
      if (isSame && (_val < minDay || _val > maxDay)) {
        className += ' disabled';
      }
      // var className = _val === today ? _val === selectedDate ? 'current today available' : 'available';
      temp += TDTPL.replace('{{value}}', _val).replace('{{today}}', className);
      if ((begin + index + 1) % 7 === 0) {
        html += '<tr>' + temp + '</tr>';
        temp = '';
        // 兼容刚好换行的bug
        if (index != (day - 1)) {
          row += 1;
        }
      }
    }
    begin = (weekday + day) % 7;
    // next-month
    var nextMax = (6 - row - 1) * 7 + (6 - weekdayLast);
    for (var next = 0; next < nextMax; next++) {
      var className = 'next-month';
      temp += TDTPL.replace('{{value}}', 1 + next).replace('{{today}}', className);
      if ((begin + next + 1) % 7 === 0) {
        html += '<tr>' + temp + '</tr>';
        temp = '';
      }
    }

    html = TEARTPL.replace('{{body}}', html).replace('{{class}}', 'c-datepicker-date-table');
    return html;
  },
  // 添加时间范围类名
  addRangeClass: function (defaultStart, defaultEnd, isHover) {
    var $wrap = this.picker.$container.find('.c-datepicker-date-range-picker-panel__wrap');
    $wrap.find('td.available').removeClass('in-range start-date end-date');
    var $days = this.picker.$container.find('.c-datePicker__input-day');
    var $years = this.picker.$container.find('.c-datepicker-date-range-picker__header-year');
    var $months = this.picker.$container.find('.c-datepicker-date-range-picker__header-month');
    var start = defaultStart || $days.eq(0).val();
    var end = defaultEnd || $days.eq(1).val();

    if (!start || !end) {
      return;
    }
    // 不是hover的时候
    if (!isHover) {
      this.current = 2;
    }
    var startMoment = defaultStart || moment(API.newDateFixed(this.picker, $days.eq(0).val()));
    var endMoment = defaultEnd || moment(API.newDateFixed(this.picker, $days.eq(1).val()));
    var startYear = $years.eq(0).find('span').text();
    var endYear = $years.eq(1).find('span').text();
    var startMonth = $months.eq(0).find('span').text();
    var endMonth = $months.eq(1).find('span').text();
    var startRangeDate = startYear + this.picker.splitStr + startMonth + this.picker.splitStr + 1;
    var endRangeDate = endYear + this.picker.splitStr + endMonth + this.picker.splitStr + API.getMonthDay(endMonth, endYear);
    var isStartBetween = !(startMoment.isBefore(API.newDateFixed(this.picker, startRangeDate)) || startMoment.isAfter(API.newDateFixed(this.picker, endRangeDate)));;
    var isEndBetween = !(endMoment.isBefore(API.newDateFixed(this.picker, startRangeDate)) || endMoment.isAfter(API.newDateFixed(this.picker, endRangeDate)));
    var index;
    // 所选值不在显示范围内
    var isBefore = startMoment.isBefore(API.newDateFixed(this.picker, startRangeDate)) && startMoment.isBefore(API.newDateFixed(this.picker, endRangeDate)) && endMoment.isBefore(API.newDateFixed(this.picker, startRangeDate)) && endMoment.isBefore(API.newDateFixed(this.picker, endRangeDate));
    var isAfter = startMoment.isAfter(API.newDateFixed(this.picker, startRangeDate)) && startMoment.isAfter(API.newDateFixed(this.picker, endRangeDate)) && endMoment.isAfter(API.newDateFixed(this.picker, startRangeDate)) && endMoment.isAfter(API.newDateFixed(this.picker, endRangeDate));
    // 当前显示范围在所选范围外
    if (isAfter || isBefore) {
      return;
    }
    // 开始值在范围内
    if (isStartBetween) {
      index = (startMoment.month() + 1) == startMonth ? 0 : 1;
      $wrap.eq(index).find('td.available').eq(startMoment.date() - 1).addClass('current start-date');
    }
    // 结束值在范围内
    if (isEndBetween) {
      index = (endMoment.month() + 1) == startMonth ? 0 : 1;
      $wrap.eq(index).find('td.available').eq(endMoment.date() - 1).addClass('current end-date');
    }

    var $current = $wrap.find('td.current');
    var $start = $wrap.find('.start-date');
    var $end = $wrap.find('.end-date');
    $current.addClass('in-range');
    // 选中的都在
    // 同一个
    if ($start.is($end)) {
      $start.addClass('in-range');
      return;
    }else if ($current.length === 2) {
      var $startTr = $start.parents('tr');
      var $endTr = $end.parents('tr');
      // 同一页
      if ($start.parents('.c-datepicker-date-range-picker-panel__wrap').is($end.parents('.c-datepicker-date-range-picker-panel__wrap'))) {
        // 同一行
        if ($startTr.is($endTr)) {
          var $tds = $start.nextAll('td.available');
          $tds.each(function (i, _td) {
            $(_td).addClass('in-range');
            if ($(_td).is($end)) {
              return false;
            }
          })
          return;
        }
        $start.nextAll('td.available').addClass('in-range');
        $end.prevAll('td.available').addClass('in-range');
        var $startTrs = $startTr.nextAll('tr');
        var $endTr = $endTr.prev('tr');
        // 上下行，则不用继续
        if ($startTr.is($endTr)) {
          return;
        }
        // 多行
        $startTrs.each(function (i, tr) {
          $(tr).find('td.available').addClass('in-range');
          if ($(tr).is($endTr)) {
            return false;
          }
        })
        return;
      }
      // 不同页
      $start.nextAll('td.available').addClass('in-range');
      $end.prevAll('td.available').addClass('in-range');
      $startTr.nextAll('tr').find('td.available').addClass('in-range');
      $endTr.prevAll('tr').find('td.available').addClass('in-range');
    } else if ($start.length) {
      // 只有开始选中
      var $startTr = $start.parents('tr');
      $start.nextAll('td.available').addClass('in-range');
      $startTr.nextAll('tr').find('td.available').addClass('in-range');
      if (index === 0) {
        $wrap.eq(1).find('td.available').addClass('in-range');
      }
    } else if ($end.length) {
      // 只有结束选中
      var $endTr = $end.parents('tr');
      $end.prevAll('td.available').addClass('in-range');
      $endTr.prevAll('tr').find('td.available').addClass('in-range');
      if (index === 1) {
        $wrap.eq(0).find('td.available').addClass('in-range');
      }
    } else {
      $wrap.find('td.available').addClass('in-range');
    }
  }
});
  /*==============END DAY============*/