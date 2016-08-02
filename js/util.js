// localStorageのKEY
var KEY = 'EHR_HELPER';

// 設定のデフォルト値
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

// 時間増減ボタンのデフォルト設定
var DEFAULT_TIME_ADD_LIST = ["all","+5","+30","-5","-30"];

// コメント欄のテンプレートデフォルト値
var DEFAULT_COMMENT_TEMPLATES = {
  "":"",
  "電車遅延":"電車遅延のため始業時刻修正。",
  "出社打刻忘れ":"出社時刻打刻忘れ。",
  "退社打刻忘れ":"退社時刻打刻忘れ。",
  "体調不良":"体調不良のため遅刻。",
  "家庭事情":"家庭事情のため遅刻。"
};

// 共通処理
var Util = {
  // 「00:00」、「0000」形式の文字列を分に変換する。
  // 「000」など3桁はNG。
  parseMinutes: function (num) {
    if (!num) {
      return 0;
    }
    var m = num.match(/^(\d\d):?(\d\d)$/);
    return parseInt(m[1]) * 60 + parseInt(m[2]);
  },
  // 分を「0000」形式に変換する。
  parse0000 : function (num) {
    return num <= 0 ? '0000':('0' + (num / 60 | 0)).slice( - 2) + ('0' + (num % 60)).slice( - 2);
  },
  // 該当のテキストボックスに時間を設定する。
  setTimeForText : function (textbox, time) {
    // 設定値を反映するため、閉じるボタンにfocusをあてることで既存の関数を呼び出す。
    textbox.val(time);
    $("#targetIdArea").val(textbox.attr("id"));
    $("#closeBtn").focus().blur();
  },
  // 指定されたデータをlocalStorageに保存する。
  saveData : function(data) {
    console.log(data);
    // 取得したdataを保存
    localStorage.setItem(KEY, JSON.stringify(data));
    console.log(JSON.parse(localStorage.getItem(KEY)));
  },
  // localStorageに保存されたデータを取得する。
  getSaveData : function() {
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
  // 残時間を全て、指定されたテキストボックスに設定する。
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
