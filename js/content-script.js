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
// [{id:id,name:projectName,jobs[{id:id,name:taskName}]}]
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

// Projectの補完設定。
var projectList = tableData.map(function(o){return o.name;});
$("#settingTable [name='projectName']").each(
  function(){
    new Suggest.Local(
      $(this).attr("id"),    // 入力のエレメントID
      "suggest_"+$(this).attr("id"), // 補完候補を表示するエリアのID
      projectList,      // 補完候補の検索対象となる配列
      {dispMax: 10, interval: 1000}); // オプション
  }
);

// 設定テーブルのIndex一覧を取得。
var indexList = $("#settingTable").find("[name='no']").map(function(){
  return $(this).text();
}).get();

// プロジェクトをキーに紐づくタスクを取得する。
var getTaskListFromProject = function(projectId, data) {
  var projectName = $(projectId).val();
  var taskList = [];
  if (projectName) {
    var pj = data.find(function(o){return o.name == projectName});
    taskList = pj ? pj.jobs.map((o)=>{return o.name}) : [];
  }
  return taskList;
};

// タスクに補完設定を追加。
// [{id:id,name:projectName,jobs[{id:id,name:taskName}]}]
$.each(indexList, function(i,index){
  var taskList = getTaskListFromProject("#projectName_" + index, tableData);
  var taskSuggest = new Suggest.Local(
    "taskName_" + index,    // 入力のエレメントID
    "suggest_taskName_" + index, // 補完候補を表示するエリアのID
    taskList,  // 補完候補の検索対象となる配列
    {dispMax: 10, interval: 1000}); // オプション
  $("#projectName_" + index).on("blur",function() {
    taskSuggest.candidateList = getTaskListFromProject("#projectName_" + index, tableData);
  });
});
