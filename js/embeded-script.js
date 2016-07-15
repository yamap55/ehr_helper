// 閉じるボタンにフォーカスがあたった際に、指定のIDで既存の関数を起動するように設定数する。
// context-script側から既存の関数を触れず、イベントも拾えないため、唯一イベント発火できるfocusを利用する。
document.getElementById("closeBtn").addEventListener("focus",function(){
  var targetId = document.getElementById("targetIdArea").value;
  validateProjectTimeElement(document.getElementById(targetId), 0);
},false);
