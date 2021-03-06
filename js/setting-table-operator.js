
var SettingWindowOperator = function(data) {
  this.settingTable = $('<table>').attr({'id':'settingTable','class':'settingTable'});
  this.data = data;
  this.settingWindow.append(this.closeButton,this.saveButton,this.addTrButton,this.settingTable,this.messageArea);
  this.init();
};

// 初期処理。
SettingWindowOperator.prototype.init = function() {
  this.closeButton.on('click', ()=>{
    this.settingWindow.hide('fast');
  });
  this.saveButton.on('click', () =>{
    var settingData = this.getSettingData();
    var data = Util.getSaveData();
    data.settingList = settingData;
    Util.saveData(data);
  });
  this.messageAreaSetting();
  this.settingSettingTable();
  this.addTrButton.on('click', ()=>{
    var indexList = this.settingTable.find("[name='no']").map(function(){
      return $(this).text();
    }).get();
    var maxNo = Math.max.apply(null,indexList);
    var tr = this.createTr(maxNo+1,'', '', '', '');
    this.settingTable.append(tr);
    // 入力補完を設定する。
    var projectId = tr.find("[name='projectName']").attr("id");
    var taskId = tr.find("[name='taskName']").attr("id");
    Util.projectSuggestSetting(this.data, projectId);
    Util.taskSuggestSetting(this.data, projectId, taskId);
  });
};

// 設定テーブルの値を取得。
SettingWindowOperator.prototype.getSettingData = function() {
  var data = $('#settingTable tr:not(#tablehead)').map(
    function(i,tr) {
      var trdata = $(tr).find('td').map(
        function(i,td){
          return $(td).find("input[type='text']").val();
        }
      ).get();
      return [trdata];
    }
  ).get().filter(
    // 全ての項目が空の場合は除去。
    function(array){
      return array.every(function(o){return o.trim()});
    }
  );
  return data;
};

// 設定窓
SettingWindowOperator.prototype.settingWindow = $('<div>').attr({
  'id': 'settingWindow'
}).hide();

// Closeボタン
SettingWindowOperator.prototype.closeButton = $('<input>').attr({
  'type': 'button',
  'value': 'CLOSE'
});

// 保存ボタン
SettingWindowOperator.prototype.saveButton = $('<input>').attr({
  'type': 'button',
  'value': '保存'
});

// tr作成関数。
SettingWindowOperator.prototype.createTr = function (no,viewName, projectName, taskName, time, thFlag) {
  if (thFlag) {
    var td = $('<th>').attr('class','settingTable');
    var n = td.clone().text(no);
    var v = td.clone().text(viewName);
    var p = td.clone().text(projectName);
    var t = td.clone().text(taskName);
    var ti = td.clone().text(time);
    var h = td.clone().text("-");
    return $('<tr>',{'id':'tablehead','class':'settingTable'}).append(n,v, p, t, ti,h);
  } else {
    var resultTr = $('<tr>').attr('class','settingTable');
    var createTd = (str,name,no)=> {
      var td = $('<td>').attr('class','settingTable');
      $('<input>').attr({
        'type':'text',
        'id':name+'_'+no,
        'name':name,
        'autocomplete':'off'
      }).css('display','block').val(str).appendTo(td);
      return td;
    };
    // 補完用Div
    var suggestDiv = $("<div>").attr({'class':'suggest'});
    var n = $('<td>').attr({'name':'no','class':'settingTable'}).text(no);
    var v = createTd(viewName,'viewName',no);
    var p = createTd(projectName,'projectName',no);
    suggestDiv.clone().attr({"id":"suggest_projectName_"+no,"name":"suggest_projectName"}).appendTo(p);
    var t = createTd(taskName,'taskName',no);
    suggestDiv.clone().attr({"id":"suggest_taskName_"+no,"name":"suggest_taskName"}).appendTo(t);
    var ti = createTd(time,'time',no);
    var closeTd = $('<td>').attr('class','settingTable').append($('<input>').attr({'type':'button','value':'×'}).css('width','20px').on('click',function(){resultTr.remove();}));
    return resultTr.append(n,v, p, t, ti,closeTd);
  }
};

// 設定窓下部メッセージ部
SettingWindowOperator.prototype.messageArea = $('<ul>').attr("id","messageArea");

// 設定窓下部メッセージ設定。
SettingWindowOperator.prototype.messageAreaSetting = function(){[
  "表示名 : 表示される名称。",
  "プロジェクト名 : プロジェクトの作業名称。時間入力する所の値を入力してください。",
  "タスク名 : ↑のプロジェクト名の「+」を押した中にある項目。数値もそのまま入力してください。",
  "時間 : 設定される時間。「00:15」や「01:00」のような形式で入力してください。",
].forEach((s)=>{this.messageArea.append($('<li>').text(s))})};

// 設定テーブル
SettingWindowOperator.prototype.settingSettingTable = function() {
  var self = this;
  // ヘッダの作成
  this.settingTable.append(this.createTr('No','表示名', 'プロジェクト名', 'タスク名', '時間', true));
  // データを復旧。
  $.each(Util.getSaveData().settingList,function(i,d) {
    var tr = self.createTr(i+1,d[0], d[1], d[2], d[3]);
    self.settingTable.append(tr);
  });
};

// 行追加ボタン
SettingWindowOperator.prototype.addTrButton = $('<input>').attr({
  'type': 'button',
  'value': '入力欄追加'
});
