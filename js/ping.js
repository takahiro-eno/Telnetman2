// 説明   : ping 登録画面。
// 作成日 : 2017/11/17
// 作成者 : 江野高広

var objPing = new ping();

function ping () {
 this.operation = "create";
 this.pingId = "";
 
 // 入力欄の内容を格納する変数を定義。
 this.isOpened = false;
 this.pingIdList = new Array();
 this.symbolList = new Object();
 this.valueList  = new Object();
 this.repeatType  = 1;
 this.condition   = 1;
 
 // 必須項目が正しく書けているかどうかの確認。
 this.isTitle  = false;
 this.isTarget = false;
 
 // HTML のid の接頭語と固定id
 this.idPingSymbolArea = "";
 this.idPrefix = "telnetman_ping_";
 this.idBuildTable   = this.idPrefix + "build_table";
 
 this.nameRepeatType = this.idPrefix + "repeat_type";
 this.idRepeatType1  = this.idPrefix + "repeat_type_1";
 this.idRepeatType2  = this.idPrefix + "repeat_type_2";
 
 this.idTitle   = this.idPrefix + "title";
 this.idKeyword = this.idPrefix + "keyword";
 this.idComment = this.idPrefix + "comment";
 
 this.idTarget  = this.idPrefix + "target";
 this.idCount   = this.idPrefix + "count";
 this.idTimeout = this.idPrefix + "timeout";
 
 this.nameCondition = this.idPrefix + "condition";
 this.idCondition1  = this.idPrefix + "condition_1";
 this.idCondition2  = this.idPrefix + "condition_2";
 this.idCondition3  = this.idPrefix + "condition_3";
 this.idCondition4  = this.idPrefix + "condition_4";
 
 this.idNgMessage = this.idPrefix + "ng_message";

 this.idBuildAreaButton = this.idPrefix + "build_area_button";
 this.idCopyButton      = this.idPrefix + "copy_button";
 
 
 // objLayoutFunctions.getItemSymbol の結果全てをthis.pingIdList, this.symbolList に値を格納する。
 this.insertPingSymbolData = function (itemIdList, itemSymbolList){
  if("ping" in itemIdList){
   for(var i = 0, j = itemIdList["ping"].length; i < j; i ++){
    var pingId     = itemIdList["ping"][i];
    var title      = itemSymbolList["ping"][pingId]["title"];
    var repeatType = itemSymbolList["ping"][pingId]["repeat_type"];
    
    this.appendPingSymbolData(pingId, title, repeatType);
   }
  }
  
  var elButton = document.getElementById(this.idSearchButton);
  elButton.onclick = new Function("objPing.get();");
  elButton.className = "enable";
 };
 
 
 // this.pingIdList, this.symbolList に1件分のデータを格納する。
 this.appendPingSymbolData = function (pingId, title, repeatType){
  this.pingIdList.push(pingId);
  this.symbolList[pingId] = new Object();
  this.symbolList[pingId]["title"] = title;
  this.symbolList[pingId]["repeat_type"] = repeatType;
  this.symbolList[pingId]["serial_number"] = 0;
 };
 
 
 // コマンド検索用
 this.idSearchKeyword = this.idPrefix + "search_keyword";
 this.valueSearchKeyword = "";
 
 this.idSearchTitle = this.idPrefix + "search_title";
 this.valueSearchTitle = "";
 
 this.idSearchButton = this.idPrefix + "search_button";
 
 // ID の検索文字列を読み取る。
 this.readSearchKeyword = function () {
  var valueSearchKeyword = document.getElementById(this.idSearchKeyword).value;
  
  if((valueSearchKeyword !== null) && (valueSearchKeyword !== undefined) && (valueSearchKeyword.length > 0)){
   this.valueSearchKeyword = valueSearchKeyword;
  }
  else{
   this.valueSearchKeyword = "";
  }
 };
 
 // title の検索文字列を読み取る。
 this.readSearchTitle = function () {
  var valueSearchTitle = document.getElementById(this.idSearchTitle).value;
  
  if((valueSearchTitle !== null) && (valueSearchTitle !== undefined) && (valueSearchTitle.length > 0)){
   this.valueSearchTitle = valueSearchTitle;
  }
  else{
   this.valueSearchTitle = "";
  }
 };
 
 // コマンドを検索してシンボルエリアを更新する。
 this.get = function (itemId){
  var elButton = document.getElementById(this.idSearchButton);
  elButton.onclick = null;
  elButton.className = "disable";
  
  this.clear();
  
  if((itemId !== null) && (itemId !== undefined) && (itemId.length > 0)){
   objLayoutFunctions.getItemSymbol("ping", {"ping":[itemId]}, null);
  }
  else{
   objLayoutFunctions.getItemSymbol("ping", null, {"ping":{"keyword":this.valueSearchKeyword, "title":this.valueSearchTitle}});
  }
 };
 
 this.clear = function (){
  var elPingSymbolArea = document.getElementById(this.idPingSymbolArea);
  var symbols = elPingSymbolArea.childNodes;
  for(var i = symbols.length - 1; i >= 0; i --){
   elPingSymbolArea.removeChild(symbols[i]);
  }
  
  while(this.pingIdList.length > 0){
   var pingId = this.pingIdList.shift();
   
   delete(this.symbolList[pingId]["title"]);
   delete(this.symbolList[pingId]["repeat_type"]);
   delete(this.symbolList[pingId]["serial_number"]);
   delete(this.symbolList[pingId]);
  }
  
  this.pingId = "";
  this.initialize();
 };
 
 
 // 画面描画。
 this.print = function (itemId) {
  objControleStorageL.setPage("ping");
  objControleStorageS.setPage("ping");
  
  if((itemId !== null) && (itemId !== undefined) && (itemId.length > 0)){
   this.valueSearchKeyword = "";
   this.valueSearchTitle   = "";
  }
  
  this.idPingSymbolArea = objLayoutFunctions.itemSymbolAreaId("ping");
  var htmlObjectArea = "<table class='search_item_field'>" +
                       "<tr><td class='left'><span>タイトル</span><input type='text' spellcheck='false' autocomplete='off' placeholder='一部' style='width:170px;' id='" + this.idSearchTitle + "' value='' onblur='objPing.readSearchTitle();'></td></tr>" +
                       "<tr><td class='left'><span>検索キーワード</span><input type='text' spellcheck='false' autocomplete='off' placeholder='前方一致' style='width:140px;' id='" + this.idSearchKeyword + "' value='' onblur='objPing.readSearchKeyword();'></td></tr>" +
                       "<tr><td class='center'><button class='enable' id='" + this.idSearchButton + "' onclick='objPing.get();'>search</button><button class='enable' onclick='objPing.clear();'>clear</button><img src='img/help.png' width='16' height='16' alt='help' class='onclick_node' onclick='objTelnetmanHelp.help(\"delete_item\");'></td></tr>" +
                       "</table>" +
                       "<div id='" + this.idPingSymbolArea + "' class='item_symbol_area'></div>";
                       
  var htmlBuildArea = "<table class='telnetman_item_build_table' id='" + this.idBuildTable + "'>" +
                      "<tr>" +
                      "<td class='right'><span class='telnetman_build_table_span1'>動作</span></td>" +
                      "<td>" + 
                      "<span class='middle_radio_buntton'>" +
                       "<input type='radio' name='" + this.nameRepeatType + "' id='" + this.idRepeatType1 + "' value='1' onchange='objPing.readRepeatType(this.value);' checked><label for='" + this.idRepeatType1 + "'>1回のみ</label>" +
                       "<input type='radio' name='" + this.nameRepeatType + "' id='" + this.idRepeatType2 + "' value='2' onchange='objPing.readRepeatType(this.value);'        ><label for='" + this.idRepeatType2 + "'>繰り返し</label>" +
                      "</span>" +
                      "</td>" +
                      "</tr>" +
                      "<tr>" +
                      "<td class='right'><span class='telnetman_build_table_span1'>タイトル</span></td>" +
                      "<td><input type='text' spellcheck='false' autocomplete='off' style='width:260px;' id='" + this.idTitle + "' value='' onkeyup='objPing.readValue(this.id); objPing.checkTitle(); objPing.changeButton();' onblur='objPing.readValue(this.id); objPing.checkTitle(); objPing.changeButton();' placeholder='必須'></td>" +
                      "</tr>" +
                      "<tr>" +
                      "<td class='right'><span class='telnetman_build_table_span0'>検索キーワード</span><img src='img/help.png' width='16' height='16' alt='help' class='onclick_node' onclick='objTelnetmanHelp.help(\"keyword\");'></td>" +
                      "<td><input type='text' spellcheck='false' autocomplete='off' style='width:260px;' id='" + this.idKeyword + "' value='' onblur='objPing.readValue(this.id);'></td>" +
                      "</tr>" +
                      "<tr>" +
                      "<td class='right'><span class='telnetman_build_table_span0'>コメント</span><img src='img/spellcheck.png' width='16' height='16' alt='help' class='onclick_node' onclick='objTelnetmanHelp.help(\"parameter13\");'><img src='img/help.png' width='16' height='16' alt='help' class='onclick_node' onclick='objTelnetmanHelp.help(\"comment\");'></td>" +
                      "<td><textarea spellcheck='false' autocomplete='off' style='width:260px; height:30px;' id='" + this.idComment + "' onblur='objPing.readValue(this.id);'></textarea></td>" +
                      "</tr>" +
                      "<tr>" +
                      "<td class='right'><span class='telnetman_build_table_span1'>対象</span><img src='img/spellcheck.png' width='16' height='16' alt='help' class='onclick_node' onclick='objTelnetmanHelp.help(\"parameter1\");'><img src='img/help.png' width='16' height='16' alt='help' class='onclick_node' onclick='objTelnetmanHelp.help(\"ping_target\");'></td>" +
                      "<td><textarea spellcheck='false' autocomplete='off' style='width:200px; height:250px;' id='" + this.idTarget + "' onkeyup='objPing.readValue(this.id); objPing.checkTarget(); objPing.changeButton();' onblur='objPing.readValue(this.id); objPing.checkTarget(); objPing.changeButton();' placeholder='必須'></textarea></td>"+
                      "</tr>" +
                      "<tr>" +
                      "<td class='right'><span class='telnetman_build_table_span1'>count</span></td>" +
                      "<td><input type='number' id='" + this.idCount + "' min='1' value='5' onblur='objPing.readValue(this.id);'><span>回</span></td>" +
                      "</tr>" +
                      "<tr>" +
                      "<td class='right'><span class='telnetman_build_table_span1'>timeout</span></td>" +
                      "<td><input type='number' id='" + this.idTimeout + "' min='1' value='2' onblur='objPing.readValue(this.id);'><span>s</span></td>" +
                      "</tr>" +
                      "<tr>" +
                      "<td class='right'><span class='telnetman_build_table_span1'>OK条件</span></td>" +
                      "<td>" + 
                      "<span class='middle_radio_buntton'>" +
                       "<input type='radio' name='" + this.nameCondition + "' id='" + this.idCondition1 + "' value='1' onchange='objPing.readCondition(this.value);' checked><label for='" + this.idCondition1 + "'>全対象成功</label>" +
                       "<input type='radio' name='" + this.nameCondition + "' id='" + this.idCondition2 + "' value='2' onchange='objPing.readCondition(this.value);'        ><label for='" + this.idCondition2  + "'>一部&nbsp;or&nbsp;全対象成功</label>" +
                       "<input type='radio' name='" + this.nameCondition + "' id='" + this.idCondition3 + "' value='3' onchange='objPing.readCondition(this.value);'        ><label for='" + this.idCondition3 + "'>全対象失敗</label>" +
                       "<input type='radio' name='" + this.nameCondition + "' id='" + this.idCondition4 + "' value='4' onchange='objPing.readCondition(this.value);'        ><label for='" + this.idCondition4  + "'>一部&nbsp;or&nbsp;全対象失敗</label>" +
                      "</span>" +
                      "</td>" +
                      "</tr>" +
                      "<tr>" +
                      "<td class='right'><span class='telnetman_build_table_span0'>NG&nbsp;メッセージ</span><img src='img/spellcheck.png' width='16' height='16' alt='help' class='onclick_node' onclick='objTelnetmanHelp.help(\"parameter13\");'><img src='img/help.png' width='16' height='16' alt='help' class='onclick_node' onclick='objTelnetmanHelp.help(\"NG_message\");'></td>" +
                      "<td><textarea spellcheck='false' autocomplete='off' style='width:380px; height:65px;' name='" + this.idNgMessage + "' id='" + this.idNgMessage + "' onblur='objPing.readValue(this.id);'></textarea></td>" +
                      "</tr>" +
                      "<tr>" +
                      "<td class='center telnetman_build_table_span1'>-</td>" +
                      "<td><button class='disable' id='" + this.idBuildAreaButton + "'></button><button class='enable' onclick='objPing.initialize();'>入力欄初期化</button><button class='disable' id='" + this.idCopyButton + "'>コピー</button></td>" +
                      "</tr>" +
                      "</table>";
  
  document.getElementById("object_area").innerHTML = htmlObjectArea;
  document.getElementById("build_area").innerHTML = htmlBuildArea;
  
  if((itemId !== null) && (itemId !== undefined) && (itemId.length > 0)){
   this.get(itemId);
   this.isOpened = true;
  }
  else{
   if(!this.isOpened){
    this.initialize();   
    this.isOpened = true;
   }
   else{
    objLayoutFunctions.printAllItemSymbol("ping", this.pingIdList, this.symbolList);
    this.insertValue();
    this.changeButton();
    this.changeInputAttribute();
    
    if(this.pingId.length > 0){
     var idSymbol = objLayoutFunctions.makeSymbolId("ping", this.pingId, 0);
     objLayoutFunctions.rotateSymbol(idSymbol);
    }  
   }
  }
  
  document.getElementById(this.idPingSymbolArea).style.display = "none";
  $("#" + this.idPingSymbolArea).fadeIn(300);
  document.getElementById(this.idBuildTable).style.display = "none";
  $("#" + this.idBuildTable).fadeIn(300);
 };
 
 
 // 変数と画面を初期化
 this.initialize = function () {
  if(this.pingId.length > 0){
   var idSymbol = objLayoutFunctions.makeSymbolId("ping", this.pingId, 0);
   objLayoutFunctions.fixSymbol(idSymbol);
  }
  
  this.operation = "create";
  this.pingId = "";
  this.repeatType = 1;
  this.condition  = 1;
  
  this.valueList[this.idTitle]     = "";
  this.valueList[this.idTarget]    = "";
  this.valueList[this.idKeyword]   = "";
  this.valueList[this.idComment]   = "{\$title}";
  this.valueList[this.idCount]     = 5;
  this.valueList[this.idTimeout]   = 2;
  this.valueList[this.idNgMessage] = "";
  
  this.isTitle  = false;
  this.isTarget = false;
  
  if(objControleStorageS.getPage() === "ping"){
   this.insertValue();
   this.changeButton();
   this.changeInputAttribute();
  }
 };
 
 
 // 入力欄のreadonly 属性を変更する。
 this.changeInputAttribute = function () {
  var elRepeatType1 = document.getElementById(this.idRepeatType1);
  var elRepeatType2 = document.getElementById(this.idRepeatType2);
  var elTitle       = document.getElementById(this.idTitle);
  var elKeyword     = document.getElementById(this.idKeyword);
  var elComment     = document.getElementById(this.idComment);
  var elTarget      = document.getElementById(this.idTarget);
  var elCount       = document.getElementById(this.idCount);
  var elTimeout     = document.getElementById(this.idTimeout);
  var elCondition1  = document.getElementById(this.idCondition1);
  var elCondition2  = document.getElementById(this.idCondition2);
  var elCondition3  = document.getElementById(this.idCondition3);
  var elCondition4  = document.getElementById(this.idCondition4);
  var elNgMessage   = document.getElementById(this.idNgMessage);
  
  if((this.operation === "create") || (this.operation === "update")){
   elRepeatType1.disabled = false;
   elRepeatType2.disabled = false;
   elTitle.readOnly       = false;
   elKeyword.readOnly     = false;
   elComment.readOnly     = false;
   elTarget.readOnly      = false;
   elCount.readOnly       = false;
   elTimeout.readOnly     = false;
   elCondition1.disabled  = false;
   elCondition2.disabled  = false;
   elCondition3.disabled  = false;
   elCondition4.disabled  = false;
   elNgMessage.readOnly   = false;

   objLayoutFunctions.removeGrayOut(this.idTitle);
   objLayoutFunctions.removeGrayOut(this.idKeyword);
   objLayoutFunctions.removeGrayOut(this.idComment);
   objLayoutFunctions.removeGrayOut(this.idTarget);
   objLayoutFunctions.removeGrayOut(this.idCount);
   objLayoutFunctions.removeGrayOut(this.idTimeout);
   objLayoutFunctions.removeGrayOut(this.idNgMessage);
  }
  else if(this.operation === "delete"){
   elRepeatType1.disabled = true;
   elRepeatType2.disabled = true;
   elTitle.readOnly       = true;
   elKeyword.readOnly     = true;
   elComment.readOnly     = true;
   elTarget.readOnly      = true;
   elCount.readOnly       = true;
   elTimeout.readOnly     = true;
   elCondition1.disabled  = true;
   elCondition2.disabled  = true;
   elCondition3.disabled  = true;
   elCondition4.disabled  = true;
   elNgMessage.readOnly   = true;

   objLayoutFunctions.grayOut(this.idTitle);
   objLayoutFunctions.grayOut(this.idKeyword);
   objLayoutFunctions.grayOut(this.idComment);
   objLayoutFunctions.grayOut(this.idTarget);
   objLayoutFunctions.grayOut(this.idCount);
   objLayoutFunctions.grayOut(this.idTimeout);
   objLayoutFunctions.grayOut(this.idNgMessage);
  }
 };
 
 
 // 各種入力値の読み取り。
 this.readRepeatType = function (repeatType) {
  if(typeof(repeatType) === "string"){
   repeatType = parseInt(repeatType, 10);
  }
  
  this.repeatType = repeatType;
 };
 
 
 this.readCondition = function (condition) {
  if(typeof(condition) === "string"){
   condition = parseInt(condition, 10);
  }
  
  this.condition = condition;
 };
 
 this.readValue = function (id) {
  var value = document.getElementById(id).value;
  
  if((value !== null) && (value !== undefined)){
   this.valueList[id] = value;
  }
  else{
   this.valueList[id] = "";
  }
 }; 
 
 
 // タイトルが正しく書けているか確認する。
 this.checkTitle = function () {
  if((this.valueList[this.idTitle] !== null) && (this.valueList[this.idTitle] !== undefined) && (this.valueList[this.idTitle].length > 0)){
   this.isTitle = true;
  }
  else{
   this.isTitle = false;
  }
 };
 
 
 // 対象が正しく書けているか確認する。
 this.checkTarget = function () {
  if(this.valueList[this.idTarget].length > 0){
   this.isTarget = true;
  }
  else{
   this.isTarget = false;
  }
 };
 
 
 // 入力欄に値を入れる。
 this.insertValue = function () {
  document.getElementById(this.idSearchKeyword).value = this.valueSearchKeyword;
  document.getElementById(this.idSearchTitle).value   = this.valueSearchTitle;
  
  document.getElementById(this.idTitle).value     = this.valueList[this.idTitle];
  document.getElementById(this.idKeyword).value   = this.valueList[this.idKeyword];
  document.getElementById(this.idComment).value   = this.valueList[this.idComment];
  document.getElementById(this.idTarget).value    = this.valueList[this.idTarget];
  document.getElementById(this.idCount).value     = this.valueList[this.idCount];
  document.getElementById(this.idTimeout).value   = this.valueList[this.idTimeout];
  document.getElementById(this.idNgMessage).value = this.valueList[this.idNgMessage];
  
  if(this.repeatType === 1){
   document.getElementById(this.idRepeatType2).checked = false;
   document.getElementById(this.idRepeatType1).checked = true;
  }
  else if(this.repeatType === 2){
   document.getElementById(this.idRepeatType1).checked = false;
   document.getElementById(this.idRepeatType2).checked = true;
  }
  
  this.changeCondition();
 };
 
 
 // コマンド返り値を溜める溜めないの表示変更。
 this.changeCondition = function (){
  if(this.condition === 1){
   document.getElementById(this.idCondition2).checked = false;
   document.getElementById(this.idCondition3).checked = false;
   document.getElementById(this.idCondition4).checked = false;
   document.getElementById(this.idCondition1).checked = true;
  }
  else if(this.condition === 2){
   document.getElementById(this.idCondition1).checked = false;
   document.getElementById(this.idCondition3).checked = false;
   document.getElementById(this.idCondition4).checked = false;
   document.getElementById(this.idCondition2).checked = true;
  }
  else if(this.condition === 3){
   document.getElementById(this.idCondition1).checked = false;
   document.getElementById(this.idCondition2).checked = false;
   document.getElementById(this.idCondition4).checked = false;
   document.getElementById(this.idCondition3).checked = true;
  }
  else if(this.condition === 4){
   document.getElementById(this.idCondition1).checked = false;
   document.getElementById(this.idCondition2).checked = false;
   document.getElementById(this.idCondition3).checked = false;
   document.getElementById(this.idCondition4).checked = true;
  }
 };   
 
 
 // ボタンを押せるように、または、押せないように変更する。
 this.changeButton = function () {
  var elButton = document.getElementById(this.idBuildAreaButton);
  
  var buttonFace = "";
  if(this.operation === "create"){
   buttonFace = "新規作成";
  }
  else if(this.operation === "update"){
   buttonFace = "更新";
  }
  else if(this.operation === "delete"){
   buttonFace = "削除";
  }
  
  if(this.isTitle && this.isTarget){
   elButton.className = "enable";
   elButton.onclick = new Function("objPing.createUpdateDelete();");
  }
  else{
   elButton.className = "disable";
   elButton.onclick = null;
  }
  
  elButton.innerHTML = buttonFace;
  
  // コピーボタン
  var elCopyButton = document.getElementById(this.idCopyButton);
  if(this.operation === "update"){
   elCopyButton.className = "enable";
   elCopyButton.onclick = new Function("objPing.copy();");
  }
  else{
   elCopyButton.className = "disable";
   elCopyButton.onclick = null;
  }
 };
 
 
 // コピー機能
 this.copy = function (){
  this.operation = "create";
  this.changeButton();
  this.changeInputAttribute();
  
  if(this.pingId.length > 0){
   var idSymbol = objLayoutFunctions.makeSymbolId("ping", this.pingId, 0);
   objLayoutFunctions.fixSymbol(idSymbol);
  }
  
  this.pingId = "";
 };
 
 
 // 新規作成、更新、削除。
 this.createUpdateDelete = function () {
  var authHeader = makeAuthHeader();
  
  $.ajax({
   headers : {"telnetmanAuth" : authHeader},
   type : "post",
   url  : "/cgi-bin/Telnetman2/ping.cgi",
   data : {
    "ping_id"     : this.pingId,
    "operation"   : this.operation,
    "repeat_type" : this.repeatType,
    "title"       : objCommonFunctions.convertYen(this.valueList[this.idTitle]),
    "keyword"     : objCommonFunctions.convertYen(this.valueList[this.idKeyword]),
    "comment"     : objCommonFunctions.convertYen(this.valueList[this.idComment]),
    "target"      : objCommonFunctions.convertYen(this.valueList[this.idTarget]),
    "count"       : this.valueList[this.idCount],
    "timeout"     : this.valueList[this.idTimeout],
    "ng_message"  : objCommonFunctions.convertYen(this.valueList[this.idNgMessage]),    
    "condition"   : this.condition
   },
   success : function (jsonResult) {
    
    if((jsonResult !== null) && (jsonResult !== undefined)){
     var hashResult = null;
     
     try{
      hashResult = JSON.parse(jsonResult);
     }
     catch(error){
      
     }
     
     if(hashResult !== null){
      var login = hashResult["login"];
      var session = hashResult["session"];
      
      if(login === 1){
       if(session === 1){
        var result = hashResult["result"];
        
        if(result === 1){
         var operation   = hashResult["operation"];
         var pingId      = hashResult["ping_id"];
         var repeatType  = hashResult["repeat_type"];
         var title       = hashResult["title"];
         
         var idSymbol = objLayoutFunctions.makeSymbolId("ping", pingId, 0);
         
         if(operation === "create"){
          objPing.appendPingSymbolData(pingId, title, repeatType);
          objLayoutFunctions.appendItemSymbol("ping", title, repeatType, idSymbol);
          
          // フローチャートのページにもシンボルを追加する。
          objFlowchart.appendSymbolData("ping", pingId, title, repeatType);
         }
         else if(operation === "update"){
          $("#" + idSymbol).effect('pulsate', '', 1000, function(){
           objPing.symbolList[pingId]["title"] = title;
           objPing.symbolList[pingId]["repeat_type"] = repeatType;
           
           var elDiv = document.getElementById(idSymbol);
           
           var divClassName  = objLayoutFunctions.makeSymbolClassName("ping", repeatType);
           var spanClassName = objLayoutFunctions.makeSymbolTitleClassName("ping", repeatType);
           
           elDiv.className = divClassName;
           elDiv.childNodes[0].className = spanClassName;
           elDiv.childNodes[0].innerHTML = objCommonFunctions.escapeHtml(title);
          });
          
          // フローチャートのページのシンボルも更新する。
          objFlowchart.updateSymbolData("ping", pingId, title, repeatType);
         }
         else if(operation === "delete"){
          for(var i = 0, j = objPing.pingIdList.length; i < j; i ++){
           var shiftPingId = objPing.pingIdList.shift();
           if(shiftPingId !== pingId){
            objPing.pingIdList.push(shiftPingId);
           }
           else{
            i --;
            j --;
           }
          }
          
          delete(objPing.symbolList[pingId]);
          
          $("#" + idSymbol).effect('puff', '', 500, function(){
           var elDiv = document.getElementById(idSymbol);
           document.getElementById(objPing.idPingSymbolArea).removeChild(elDiv);
          });
          
          // フローチャートのページのシンボルも削除する。
          objFlowchart.removeSymbolData("ping", pingId);
         }
         
         objPing.initialize();
        }
        else{
        var reason = hashResult["reason"];
         alert(reason);
        }
       }
       else{
        if(session === -2){
         var undefinedSessionId = hashResult["undefined_session_id"];
         objTelnetmanSession.removeSession(undefinedSessionId);
        }
        
        // セション選択画面を開く。
        objTelnetmanSession.inputSessionList(hashResult);
        objTelnetmanSession.session();
       }
      }
      else{
       // ログイン画面を開く。
       objTelnetmanLogin.login();
      }
     }
     else{
      alert("CGI Error");
     }
    }
   },
   error : function (){
    alert("Server Error");
   }
  });
 };
 
 
 // 登録内容を取得し、表示を変える。
 this.getPingData = function (pingId, operation) {
  // 流れ図画面とExport画面の右クリックで呼び出されたら終了。
  if((objControleStorageL.getPage() === "flowchart") && (operation === "delete")){
   return(false);
  }
  else if((objControleStorageL.getPage() === "export_import") && (operation === "delete")){
   return(false);
  }
  
  if((objControleStorageL.getPage() === "ping") && (this.pingId.length > 0)){
   var idSymbol = objLayoutFunctions.makeSymbolId("ping", this.pingId, 0);
   objLayoutFunctions.fixSymbol(idSymbol);
  }
  
  var authHeader = makeAuthHeader();
  
  $.ajax({
   headers : {"telnetmanAuth" : authHeader},
   type : "post",
   url  : "/cgi-bin/Telnetman2/get_item_data.cgi",
   data : {
    "item_type" : "ping",
    "item_id"   : pingId,
    "operation" : operation
   },
   success : function (jsonResult) {
    
    if((jsonResult !== null) && (jsonResult !== undefined)){
     var hashResult = null;
     
     try{
      hashResult = JSON.parse(jsonResult);
     }
     catch(error){
      
     }
     
     if(hashResult !== null){
      var login = hashResult["login"];
      var session = hashResult["session"];
      
      if(login === 1){
       if(session === 1){
        var result = hashResult["result"];
        
        if(result === 1){
         if(objControleStorageL.getPage() === "ping"){// コマンド設定画面を開いている時
          objPing.pingId     = hashResult["item_id"];
          objPing.operation  = hashResult["operation"];
          objPing.repeatType = hashResult["repeat_type"];
          objPing.condition  = hashResult["condition"];
          objPing.valueList[objPing.idTitle]     = hashResult["title"];
          objPing.valueList[objPing.idKeyword]   = hashResult["keyword"];
          objPing.valueList[objPing.idComment]   = hashResult["comment"];
          objPing.valueList[objPing.idTarget]    = hashResult["target"];
          objPing.valueList[objPing.idCount]     = hashResult["count"];
          objPing.valueList[objPing.idTimeout]   = hashResult["timeout"];
          objPing.valueList[objPing.idNgMessage] = hashResult["ng_message"];
          
          objPing.insertValue();
          objPing.isTitle = true;
          objPing.isTarget = true;
          objPing.changeButton();
          objPing.changeInputAttribute();
          
          var idSymbol = objLayoutFunctions.makeSymbolId("ping", objPing.pingId, 0);
          objLayoutFunctions.rotateSymbol(idSymbol);
         }
         else{// 流れ図画面を開いている時
          var itemId     = hashResult["item_id"];
          var repeatType = hashResult["repeat_type"];
          var condition  = hashResult["condition"];
          var title      = objCommonFunctions.escapeHtml(hashResult["title"]);
          var keyword    = objCommonFunctions.escapeHtml(hashResult["keyword"]);
          var comment    = objCommonFunctions.escapeHtml(hashResult["comment"]);
          var target     = objCommonFunctions.escapeHtml(hashResult["target"]);
          var count      = hashResult["count"];
          var timeout    = hashResult["timeout"];
          var ngMessage  = objCommonFunctions.escapeHtml(hashResult["ng_message"]);
          var ownerName   = objCommonFunctions.escapeHtml(hashResult["owner_name"]);
          var changerName = objCommonFunctions.escapeHtml(hashResult["changer_name"]);
          var createTime  = hashResult["create_time"];
          var updateTime  = hashResult["update_time"];
          
          var repeatTypeText = "";
          if(repeatType === 1){
           repeatTypeText = "1回のみ";
          }
          else if(repeatType === 2){
           repeatTypeText = "繰り返し";
          }
          
          var conditionText = "";
          if(condition === 1){
           conditionText = "全対象成功";
          }
          else if(condition === 2){
           conditionText = "一部&nbsp;or&nbsp;全対象成功";
          }
          else if(condition === 3){
           conditionText = "全対象失敗";
          }
          else if(condition === 4){
           conditionText = "一部&nbsp;or&nbsp;全対象失敗";
          }
          
          target  = target.replace(/\n/g, "<br>");
          comment = comment.replace(/\n/g, "<br>");
          ngMessage = ngMessage.replace(/\n/g, "<br>");
          
          var dateType = "";
          var date = "";
          if(changerName.length > 0){
           dateType = "更新日時";
           date = objCommonFunctions.unixtimeToDate(updateTime, "YYYY/MM/DD hh:mm:ss");
          }
          else{
           dateType = "作成日時";
           date = objCommonFunctions.unixtimeToDate(createTime, "YYYY/MM/DD hh:mm:ss");
          } 
          
          var html = "<table id='" + objLayoutFunctions.idItemViewTable + "' class='telnetman_item_viewer'>" +
                     "<tr>" +
                     "<th colspan='2'><div><span>コマンド</span><img src='img/cancel.png' width='16' height='16' alt='cancel' onclick='objLayoutFunctions.removeScrollEvent(); objLayoutFunctions.removeItemViewTable();'></div></th>" +
                     "</tr>" +
                     "<tr>" +
                     "<td class='right telnetman_item_viewer_td1'><span class='telnetman_item_viewer_span1'>作成者</span></td>" +
                     "<td class='left'><span class='telnetman_item_viewer_span2'>" + ownerName + "</span></td>" +
                     "</tr>" +
                     "<tr>" +
                     "<td class='right telnetman_item_viewer_td1'><span class='telnetman_item_viewer_span1'>更新者</span></td>" +
                     "<td class='left'><span class='telnetman_item_viewer_span2'>" + changerName + "</span></td>" +
                     "</tr>" +
                     "<tr>" +
                     "<td class='right telnetman_item_viewer_td1'><span class='telnetman_item_viewer_span1'>" + dateType + "</span></td>" +
                     "<td class='left'><span class='telnetman_item_viewer_span2'>" + date + "</span></td>" +
                     "</tr>" +
                     "<tr>" +
                     "<td class='right telnetman_item_viewer_td1'><span class='telnetman_item_viewer_span1'>動作</span></td>" +
                     "<td class='left'><span class='telnetman_item_viewer_span2'>" + repeatTypeText + "</span></td>" +
                     "</tr>" +
                     "<tr>" +
                     "<td class='right telnetman_item_viewer_td1'><span class='telnetman_item_viewer_span1'>タイトル</span></td>" +
                     "<td class='left'><span class='onclick_node' onclick='objPing.print(\"" + itemId + "\"); objLayoutFunctions.removeItemViewTable();'>" + title + "</span></td>" +
                     "</tr>" +
                     "<tr>" +
                     "<td class='right telnetman_item_viewer_td1'><span class='telnetman_item_viewer_span1'>検索キーワード</span></td>" +
                     "<td class='left'><span class='telnetman_item_viewer_span2'>" + keyword + "</span></td>" +
                     "</tr>" +
                     "<tr>" +
                     "<td class='right telnetman_item_viewer_td1'><span class='telnetman_item_viewer_span1'>コメント</span></td>" +
                     "<td class='left'><span class='telnetman_item_viewer_span2'>" + comment + "</span></td>" +
                     "</tr>" +
                     "<tr>" +
                     "<td class='right telnetman_item_viewer_td1'><span class='telnetman_item_viewer_span1'>対象</span></td>" +
                     "<td class='left'><span class='telnetman_item_viewer_span2'>" + target + "</span></td>" +
                     "</tr>" +
                     "<tr>" +
                     "<td class='right telnetman_item_viewer_td1'><span class='telnetman_item_viewer_span1'>count</span></td>" +
                     "<td class='left'><span class='telnetman_item_viewer_span2'>" + count + "&nbsp;回</span></td>" +
                     "</tr>" +
                     "<tr>" +
                     "<td class='right telnetman_item_viewer_td1'><span class='telnetman_item_viewer_span1'>timeout</span></td>" +
                     "<td class='left'><span class='telnetman_item_viewer_span2'>" + timeout + "&nbsp;s</span></td>" +
                     "</tr>" +
                     "<tr>" +
                     "<td class='right telnetman_item_viewer_td1'><span class='telnetman_item_viewer_span1'>OK条件</span></td>" +
                     "<td class='left'><span class='telnetman_item_viewer_span2'>" + conditionText + "</span></td>" +
                     "</tr>" +
                     "<tr>" +
                     "<td class='right telnetman_item_viewer_td1'><span class='telnetman_item_viewer_span1'>NG&nbsp;メッセージ</span></td>" +
                     "<td class='left'><span class='telnetman_item_viewer_span2'>" + ngMessage + "</span></td>" +
                     "</tr>" +
                     "</table>";
                     
          objCommonFunctions.lockScreen(html);
          
          $("#" + objLayoutFunctions.idItemViewTable).fadeIn(200, function(){objLayoutFunctions.addScrollEvent();});
         }
        }
        else{
         alert(hashResult["reason"]);
        }
       }
       else{
        if(session === -2){
         var undefinedSessionId = hashResult["undefined_session_id"];
         objTelnetmanSession.removeSession(undefinedSessionId);
        }
        
        // セション選択画面を開く。
        objTelnetmanSession.inputSessionList(hashResult);
        objTelnetmanSession.session();
       }
      }
      else{
       // ログイン画面を開く。
       objTelnetmanLogin.login();
      }
     }
     else{
      alert("CGI Error");
     }
    }
   },
   error : function (){
    alert("Server Error");
   }
  });
  
  return(true);
 };
 
 return(this);                                           
}
