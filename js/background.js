// バッジに文言を設定。
// chrome.browserAction.setBadgeText({ text: "ABC" });
// バッジに開いているタブの数を表示
var counter = 0;
chrome.tabs.getAllInWindow( null, function( tabs ){
    counter = tabs.length;
    chrome.browserAction.setBadgeText({ text:String(counter) });
});
chrome.tabs.onCreated.addListener( function( tab ){
    counter++;
    chrome.browserAction.setBadgeText({ text: String(counter) });
});
chrome.tabs.onRemoved.addListener( function( tab ){
    counter--;
    chrome.browserAction.setBadgeText({ text: String(counter) });
});
// ここまで。

// バッジにタイトルを設定。（マウスオーバー時に表示される文言）
chrome.browserAction.setTitle({ title: "hoge" });

console.log("extention example.")

// カウンターを取得
var getCounter = function(){
    console.log($.fn.jquery);
    return counter;
};

// バッジのカウンターを更新
var updateCounter = function( counter ){
    chrome.browserAction.setBadgeText({text:String(counter)});
};

var Util = {
  a: function() {
  },
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
  getTableData : function () {
    // TableのDataを取得。フォーマットは以下の通り。
    // [{id:プロジェクトのtrを指すID,name:プロジェクト名,jobs:[{id:プロジェクト内のタスクのtrを指すID,name:タスク名},{...}]}]
    if (self.data) {
      return self.data;
    }
    var data = [
    ];
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
    self.data = data;
    //console.log(data);
    return self.data;
  },
  setTimeForText : function (textbox, time) {
    // blurだけでは変換してくれなかったのでclickも起動
    textbox.val(time).trigger('click').trigger('blur');
  }
};
