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

var DEFAULT_COMMENT_TEMPLATES = {
  "":"",
  "電車遅延":"電車遅延のため始業時刻修正。",
  "出社打刻忘れ":"出社時刻打刻忘れ。",
  "退社打刻忘れ":"退社時刻打刻忘れ。",
  "体調不良":"体調不良のため遅刻。",
  "家庭事情":"家庭事情のため遅刻。"
};

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
  saveData : function(data) {
    console.log(data);
    // 取得したdataを保存
    localStorage.setItem(KEY, JSON.stringify(data));
    console.log(JSON.parse(localStorage.getItem(KEY)));
  },
  getSaveData : function() {
    // 保存したdataを取得。
    if (localStorage.getItem(KEY)) {
      return JSON.parse(localStorage.getItem(KEY));
    }
    // 保尊されていない場合はデフォルトを返す。
    return {
      settingList : DEFAULT_SETTING_LIST,
      timeAddList : DEFAULT_TIME_ADD_LIST,
      commentTemplates : DEFAULT_COMMENT_TEMPLATES,
    };
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
