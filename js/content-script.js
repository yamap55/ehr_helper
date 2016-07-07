var KEY = 'EHR_HELPER';
var DEFAULT_SETTING_LIST = [
  ['会議A',
  '会議（000003000000）',
  '0001なし',
  '0015'],
  [
    '会議B',
    'プロジェクト会議（000002020110）',
    '1004開発／会議',
    '0030',
  ],
];

var Util = {
  parseMinutes: function (num) {
    // 「00:00」、「0000」形式の文字列を分に変換する。
    // 「000」など3桁はNG。
    if (num == '') {
      return 0;
    }
    var m = num.match(/^(\d\d):?(\d\d)$/);
    return parseInt(m[1]) * 60 + parseInt(m[2]);
  },
  parse0000 : function (num) {
    // 分を「0000」形式に変換する。
    return ('0' + (num / 60 | 0)).slice( - 2) + ('0' + (num % 60)).slice( - 2);
  },
  setTimeForText : function (textbox, time) {
    // blurだけでは変換してくれなかったのでclickも起動
    textbox.val(time).trigger('click').trigger('blur');
  },
  getSettingData : function(data) {
    // 取得したdataを保存
    localStorage.setItem(Util.KEY, JSON.stringify(data));
  },
  getSettingData : function() {
    return localStorage.getItem(Util.KEY) ? JSON.parse(localStorage.getItem(Util.KEY)) : Util.DEFAULT_SETTING_LIST;
  }
};

var getTableData = function () {
  var data = [];
  var jobs;
  $('#projectTableTR table tr').each(function () {
    var id = $(this).attr('id');
    if (/project_tr_.*/.test(id)) {
      jobs = [
      ];
      data.push({
        id: id,
        name: $($(this).find('td') [0]).text().trim(),
        jobs: jobs,
      });
    } else if (/project_job_tr_.*/.test(id)) {
      jobs.push({
        id: id,
        name: $($(this).find('td') [0]).text().trim(),
      });
    }
  }
  );
  return data;
};
var tableData = getTableData();
var EhrHelper = function(data){
  this.data = data;
};
EhrHelper.prototype.timeClockNotification = function () {
  // 打刻忘れ通知
  var div = $('.box .folder').filter(function () {
    return $(this).find('h2').text() == '出退社時刻';
  }
  );
  var tds = div.find('td');
  var css = {
    'cssText': 'background-color : red !important'
  };
  if ($(tds[0]).text().trim() == '') {
    $(tds[0]).css(css);
  }
  if ($(tds[1]).text().trim() == '') {
    $(tds[1]).css(css);
  }
};

var ehrHelper = new EhrHelper(tableData);
ehrHelper.timeClockNotification();
