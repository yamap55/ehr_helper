
// EhrHelper
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
  $.each(Util.getSaveData().timeAddList,(i,addTime)=>{
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
  'font-size': '150%',
  'text-decoration': 'none',
  'float':'right',
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
  var buttonList = $.map(Util.getSaveData().settingList, function (settingData) {
    return $('<p>').text(settingData[0]).bind('click', function () {
      self.setTime(settingData[1], settingData[2], settingData[3]);
    }).css({
      'cursor': 'pointer',
      'text-decoration': 'underline'
    });
  });
  this.operationContainer.append(buttonList);
  $('#operationContainer > *').css('margin', '0px 0px 0px 0px');
  $('#operationContainer > li > span').css('width', '50px');
};

// 本人コメント欄のテンプレートを追加する。
EhrHelper.prototype.addCommentTemplate = function (){
  var commentArea =$("textarea[name='userComment']");
  var selectElem = $("<select>").on("change",function() {
    commentArea.text($(this).val());
  });

  $.each(Util.getSaveData().commentTemplates,function(d,i){
    $("<option>").val(d).text(d).appendTo(selectElem);
  });
  commentArea.parent().append(selectElem);
};

// 設定ボタンを追加する。
EhrHelper.prototype.addSettingWindowButton = function (){
  var settingWindowOperator = new SettingWindowOperator(this.data);
  this.settingWindow = settingWindowOperator.settingWindow;
  this.settingWindow.hide();
  this.settingWindowButton.prependTo(this.operationContainer);
  $('body').append(this.settingWindow);
};

// 設定ボタン
EhrHelper.prototype.settingWindowButton = $('<input type=\'button\'>').attr({
  'id': 'setting_btn',
  'value': '設定'
}).on('click', () => {
  // 設定窓の表示非表示の切り替え。
  $("#settingWindow").toggle('fast');
});

// 全て閉じるボタン追加。
EhrHelper.prototype.addAllCloseButton = function () {
  var allCloseButton = $('<input>', {
    type: 'button',
    value: '全て閉じる'
  }).on('click', function () {
    $('#projectTableTR table img').filter(function () {
      return $(this).attr('src') == '/m3-group/images/dhtmlgoodies_minus.gif'
    }).click();
  });
  $('#projectTableTR table').before(allCloseButton);
};
