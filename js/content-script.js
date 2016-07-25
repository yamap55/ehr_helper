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

var ehrHelper = new EhrHelper(tableData);
// TODO 設定で有効有無を切り替えられるようにする。
ehrHelper.timeClockNotification();
ehrHelper.addTimeButton();
ehrHelper.addOperationContainer();
ehrHelper.addClosebutton();
ehrHelper.addSettingData();
ehrHelper.addCommentTemplate();
ehrHelper.addSettingWindowButton();
ehrHelper.addAllCloseButton();
