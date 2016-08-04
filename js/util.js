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
  },
  // Projectの補完設定。
  projectSuggestSetting : function(data, inputId){
      new Suggest.Local(
        inputId,    // 入力のエレメントID
        "suggest_" + inputId, // 補完候補を表示するエリアのID
        data.map(function(o){return o.name;}),      // 補完候補の検索対象となる配列
        {dispMax: 10, interval: 1000}); // オプション
  },
  // プロジェクトをキーに紐づくタスクを取得する。
  getTaskListFromProject : function(data, projectId) {
    var projectName = $("#" + projectId).val();
    var taskList = [];
    if (projectName) {
      var pj = data.find(function(o){return o.name == projectName});
      taskList = pj ? pj.jobs.map((o)=>{return o.name}) : [];
    }
    return taskList;
  },
  // タスクに補完設定を追加。
  taskSuggestSetting : function(data, projectId, taskId) {
    var taskList = this.getTaskListFromProject(data, projectId);
    var taskSuggest = new Suggest.Local(
      taskId,    // 入力のエレメントID
      "suggest_" + taskId, // 補完候補を表示するエリアのID
      taskList,  // 補完候補の検索対象となる配列
      {dispMax: 10, interval: 1000}); // オプション
    var self = this;
    $("#" + projectId).on("blur",function() {
      taskSuggest.candidateList = self.getTaskListFromProject(data, projectId);
    });
  }
};
