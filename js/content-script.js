// 既存ページにスクリプト追加。
var injectScript;
injectScript = function(file, node) {
  var s, th;
  th = document.getElementsByTagName(node)[0];
  s = document.createElement('script');
  s.setAttribute('type', 'text/javascript');
  s.setAttribute('src', file);
  return th.appendChild(s);
};
injectScript(chrome.extension.getURL('js/embeded-script.js'), 'body');

// 既存関数起動用Hiddenを追加。
$("<input>").attr({"type":"hidden","id":"targetIdArea"}).appendTo($("body"));

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
  ]
];
var DEFAULT_TIME_ADD_LIST = ["all","+5","+30","-5","-30"];

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
    return num <= 0 ? '0000':('0' + (num / 60 | 0)).slice( - 2) + ('0' + (num % 60)).slice( - 2);
  },
  setTimeForText : function (textbox, time) {
    // 設定値を反映するため、閉じるボタンにfocusをあてることで既存の関数を呼び出す。
    textbox.val(time);
    $("#targetIdArea").val(textbox.attr("id"));
		$("#closeBtn").focus().blur();
  },
  setSettingData : function(data) {
    // 取得したdataを保存
    localStorage.setItem(Util.KEY, JSON.stringify(data));
  },
  getSettingData : function() {
    return localStorage.getItem(KEY) ? JSON.parse(localStorage.getItem(KEY)) : DEFAULT_SETTING_LIST;
  },
  setAllTime : function (targetTextBox) {
    var time = this.parseMinutes(targetTextBox.val());
    var remainingTime = $('#calc_attend_2_project_hours').text();
    if (remainingTime.match(/^-/)) {
      // 残時間が「-」の場合、値が設定されていた場合にはスルー。
      if (time == 0) {
        this.setTime(targetTextBox, '00:00');
      }
    } else {
      // 残時間が「+」の場合
      if (time != 0) {
        // 既に値が設定されていた場合は加算。
        remainingTime = this.parse0000(time + this.parseMinutes(remainingTime));
      }
      this.setTimeForText(targetTextBox, remainingTime);
    }
  }
};

// 作業名称と小タスクのテーブルデータを取得する。
var getTableData = function () {
  var data = [];
  var jobs;
  $('#projectTableTR table tr').each(function () {
    var id = $(this).attr('id');
    if (/project_tr_.*/.test(id)) {
      jobs = [];
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
  });
  return data;
};
var tableData = getTableData();
var EhrHelper = function(data){
  this.data = data;
};
// 打刻忘れ通知
EhrHelper.prototype.timeClockNotification = function () {
  var div = $('.box .folder').filter(function () {
    return $(this).find('h2').text() == '出退社時刻';
  });
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

// 各タスクに時間の加減ボタンを追加する。
EhrHelper.prototype.addTimeButton = function() {
  // 時間の加算減算（+X,-X）を行う
  var f = function () {
    var t = $($(this).closest('tr').find('input[type=\'text\']') [0]);
    var array = $(this).attr('value').match(/^([+-])(\d+)$/);
    var symbol = array[1];
    var i = parseInt(array[2]);
    if (t.val()) {
      if (symbol == '+') {
        i += Util.parseMinutes(t.val());
      } else {
        i = Util.parseMinutes(t.val()) - i;
      }
    }
    Util.setTimeForText(t, Util.parse0000(i));
  };
  // 残り時間をそのまま設定する。
  var ff = function () {
    var t = $($(this).closest('tr').find('input[type=\'text\']') [0]);
    Util.setAllTime(t);
  };
  // ボタン群を作成。
  var addBtnArea = $('<span>', {name: 'addBtnArea'});
  var addTimeBtn = $('<input>', {type: 'button'});
  $.each(DEFAULT_TIME_ADD_LIST,(i,addTime)=>{
    var addFunc = addTime.toLowerCase() == "all" ? ff : f;
    addTimeBtn.clone().attr('value',addTime).on('click',addFunc).appendTo(addBtnArea);
  });
  // ボタン群を各タスクの左前に追加。
  $('[id^=\'project_job_tr_\']').each(function () {
    $(this).find('td:first').prepend(addBtnArea.clone(true));
  });
};

// 操作領域。
EhrHelper.prototype.operationContainer = $('<div id=\'operationContainer\'>').css({
    'position': 'fixed',
    'top': '250px',
    'right': '10px',
    'z-index': '999',
    'width': '120px',
    'background': '#F4A28D',
    'border-radius': '10px',
    '-moz-border-radius': '10px',
    '-webkit-border-radius': '10px',
    'padding-bottom': '10px'
  }
);

// xボタン。（閉じるボタン）
EhrHelper.prototype.closeButton =  $('<a>').attr({"id":"closeBtn","href":"#"}).text('×').on('click', function () {
  $(this).closest('#operationContainer').hide();
  return false;
}).css({
  'cursor': 'pointer',
  'font-size': '150%'
});

// 操作領域追加。
EhrHelper.prototype.addOperationContainer = function() {
  $("body").append(this.operationContainer);
};

// 操作領域に閉じるボタンを追加する。
EhrHelper.prototype.addClosebutton = function() {
  this.operationContainer.append(this.closeButton);
};

// 指定されたプロジェクト内のタスクに作業時間を設定する。
EhrHelper.prototype.setTime = function (projectName, taskName, time) {
  var project = this.data.find(o=>{return o.name == projectName});
  if (!project) {
    throw "設定されているProjectが表示されていません。 : ["+projectName+"]";
  }
  var job = project.jobs.find(o=>{return o.name == taskName});
  if (!job) {
    throw "設定されているjobが表示されていません。 : ["+taskName+"]";
  }

  var target = $($('#' + job.id + ' input[type="text"]') [0]);
  console.log('#' + job.id + ' input[type="text"]');
  console.log(target);
  if (time.toLowerCase() === "all") {
    Util.setAllTime(target);
  } else {
    var num;
    if (target.val()) {
      var minutes = Util.parseMinutes(target.val()) + Util.parseMinutes(time);
      num = Util.parse0000(minutes);
    } else {
      num = time;
    }
    // 値設定。
    Util.setTimeForText(target, num);
  }
};

// 設定されているProjectを操作領域に追加。
EhrHelper.prototype.addSettingData = function (){
  var self = this;
  // 設定からボタンのListを作成。
  var buttonList = $.map(Util.getSettingData(), function (settingData) {
    return $('<p>').text(settingData[0]).bind('click', function () {
      self.setTime(settingData[1], settingData[2], settingData[3]);
    }).css({
      'cursor': 'pointer',
      'text-decoration': 'underline'
    });
  });
  this.operationContainer.append(buttonList);
  $('#hoge > *').css('margin', '0px 0px 0px 0px');
  $('#hoge > li > span').css('width', '50px');
};

var ehrHelper = new EhrHelper(tableData);
// TODO 設定で有効有無を切り替えられるようにする。
ehrHelper.timeClockNotification();
ehrHelper.addTimeButton();
ehrHelper.addOperationContainer();
ehrHelper.addClosebutton();
ehrHelper.addSettingData();
