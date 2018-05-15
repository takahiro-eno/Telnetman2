// 説明   : コマンド登録画面。
// 作成日 : 2017/09/04
// 作成者 : 江野高広

var objCommand = new command();

function command () {
 this.operation = "create";
 this.commandId = "";
 
 // 入力欄の内容を格納する変数を定義。
 this.isOpened = false;
 this.commandIdList = new Array();
 this.symbolList    = new Object();
 this.valueList     = new Object();
 this.repeatType  = 1;
 this.commandType = 1;
 this.conftEnd    = 0;
 this.prompt      = 1;
 this.store       = 1;
 
 // 必須項目が正しく書けているかどうかの確認。
 this.isTitle     = false;
 this.isCommand   = false;
 
 // HTML のid の接頭語と固定id
 this.idCommandSymbolArea = "";
 this.idPrefix = "telnetman_command_";
 this.idBuildTable   = this.idPrefix + "build_table";
 
 this.nameRepeatType = this.idPrefix + "repeat_type";
 this.idRepeatType1  = this.idPrefix + "repeat_type_1";
 this.idRepeatType2  = this.idPrefix + "repeat_type_2";
 
 this.nameCommandType = this.idPrefix + "command_type";
 this.idCommandType1  = this.idPrefix + "command_type_1";
 this.idCommandType2  = this.idPrefix + "command_type_2";
 this.idCommandType3  = this.idPrefix + "command_type_3";
 
 this.idTitle   = this.idPrefix + "title";
 this.idKeyword = this.idPrefix + "keyword";
 this.idComment = this.idPrefix + "comment";
 
 this.idWait = this.idPrefix + "wait";
 
 this.nameConftEnd  = this.idPrefix + "conft_end";
 this.idConftEndYes = this.idPrefix + "conft_end_yes";
 this.idConftEndNo  = this.idPrefix + "conft_end_no";
 
 this.idCommand = this.idPrefix + "command";
 this.idDummy   = this.idPrefix + "dummy";
 
 this.namePrompt     = this.idPrefix + "prompt";
 this.idPromptNormal = this.idPrefix + "prompt_normal";
 this.idPromptJunos  = this.idPrefix + "prompt_junos";
 this.idPromptNone   = this.idPrefix + "prompt_none";
 
 this.nameStore  = this.idPrefix + "store";
 this.idStoreYes = this.idPrefix + "store_yes";
 this.idStoreNo  = this.idPrefix + "store_no";

 this.idBuildAreaButton = this.idPrefix + "build_area_button";
 this.idCopyButton      = this.idPrefix + "copy_button";
 
 
 // objLayoutFunctions.getItemSymbol の結果全てをthis.commandIdList, this.symbolList に値を格納する。
 this.insertCommandSymbolData = function (itemIdList, itemSymbolList){
  if("command" in itemIdList){
   for(var i = 0, j = itemIdList["command"].length; i < j; i ++){
    var commandId    = itemIdList["command"][i];
    var title        = itemSymbolList["command"][commandId]["title"];
    var repeatType   = itemSymbolList["command"][commandId]["repeat_type"];
    var commandType  = itemSymbolList["command"][commandId]["command_type"];
    
    this.appendCommandSymbolData(commandId, title, repeatType, commandType);
   }
  }
  
  var elButton = document.getElementById(this.idSearchButton);
  elButton.onclick = new Function("objCommand.get();");
  elButton.className = "enable";
 };
 
 
 // this.commandIdList, this.symbolList に1件分のデータを格納する。
 this.appendCommandSymbolData = function (commandId, title, repeatType, commandType){
  this.commandIdList.push(commandId);
  this.symbolList[commandId] = new Object();
  this.symbolList[commandId]["title"] = title;
  this.symbolList[commandId]["repeat_type"] = repeatType;
  this.symbolList[commandId]["command_type"] = commandType;
  this.symbolList[commandId]["serial_number"] = 0;
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
   objLayoutFunctions.getItemSymbol("command", {"command":[itemId]}, null);
  }
  else{
   objLayoutFunctions.getItemSymbol("command", null, {"command":{"keyword":this.valueSearchKeyword, "title":this.valueSearchTitle}});
  }
 };
 
 this.clear = function (){
  var elCommandSymbolArea = document.getElementById(this.idCommandSymbolArea);
  var symbols = elCommandSymbolArea.childNodes;
  for(var i = symbols.length - 1; i >= 0; i --){
   elCommandSymbolArea.removeChild(symbols[i]);
  }
  
  while(this.commandIdList.length > 0){
   var commandId = this.commandIdList.shift();
   
   delete(this.symbolList[commandId]["title"]);
   delete(this.symbolList[commandId]["repeat_type"]);
   delete(this.symbolList[commandId]["command_type"]);
   delete(this.symbolList[commandId]["serial_number"]);
   delete(this.symbolList[commandId]);
  }
  
  this.commandId = "";
  this.initialize();
 };
 
 
 // 画面描画。
 this.print = function (itemId) {
  objControleStorageL.setPage("command");
  objControleStorageS.setPage("command");
  
  if((itemId !== null) && (itemId !== undefined) && (itemId.length > 0)){
   this.valueSearchKeyword = "";
   this.valueSearchTitle   = "";
  }
  
  this.idCommandSymbolArea = objLayoutFunctions.itemSymbolAreaId("command");
  var htmlObjectArea = "<table class='search_item_field'>" +
                       "<tr><td class='left'><span>タイトル</span><input type='text' spellcheck='false' autocomplete='off' placeholder='一部' style='width:170px;' id='" + this.idSearchTitle + "' value='' onblur='objCommand.readSearchTitle();'></td></tr>" +
                       "<tr><td class='left'><span>検索キーワード</span><input type='text' spellcheck='false' autocomplete='off' placeholder='前方一致' style='width:140px;' id='" + this.idSearchKeyword + "' value='' onblur='objCommand.readSearchKeyword();'></td></tr>" +
                       "<tr><td class='center'><button class='enable' id='" + this.idSearchButton + "' onclick='objCommand.get();'>search</button><button class='enable' onclick='objCommand.clear();'>clear</button><img src='img/help.png' width='16' height='16' alt='help' class='onclick_node' onclick='objTelnetmanHelp.help(\"delete_item\");'></td></tr>" +
                       "</table>" +
                       "<div id='" + this.idCommandSymbolArea + "' class='item_symbol_area'></div>";
                       
  var htmlBuildArea = "<table class='telnetman_item_build_table' id='" + this.idBuildTable + "'>" +
                      "<tr>" +
                      "<td class='right'><span class='telnetman_build_table_span1'>動作</span></td>" +
                      "<td>" + 
                      "<span class='middle_radio_buntton'>" +
                       "<input type='radio' name='" + this.nameRepeatType + "' id='" + this.idRepeatType1 + "' value='1' onchange='objCommand.readRepeatType(this.value);' checked><label for='" + this.idRepeatType1 + "'>1回のみ</label>" +
                       "<input type='radio' name='" + this.nameRepeatType + "' id='" + this.idRepeatType2 + "' value='2' onchange='objCommand.readRepeatType(this.value);'        ><label for='" + this.idRepeatType2 + "'>繰り返し</label>" +
                      "</span>" +
                      "</td>" +
                      "</tr>" +
                      "<tr>" +
                      "<td class='right'><span class='telnetman_build_table_span1'>系統</span><img src='img/help.png' width='16' height='16' alt='help' class='onclick_node' onclick='objTelnetmanHelp.help(\"command_type\");'></td>" +
                      "<td>" + 
                      "<span class='middle_radio_buntton'>" +
                       "<input type='radio' name='" + this.nameCommandType + "' id='" + this.idCommandType1 + "' value='1' onchange='objCommand.readCommandType(this.value);' checked><label for='" + this.idCommandType1 + "'>show</label>" +
                       "<input type='radio' name='" + this.nameCommandType + "' id='" + this.idCommandType2 + "' value='2' onchange='objCommand.readCommandType(this.value);'        ><label for='" + this.idCommandType2 + "'>conf&nbsp;t</label>" +
                       "<input type='radio' name='" + this.nameCommandType + "' id='" + this.idCommandType3 + "' value='3' onchange='objCommand.readCommandType(this.value);'        ><label for='" + this.idCommandType3 + "'>返り値なし</label>" +
                      "</span>" +
                      "</td>" +
                      "</tr>" +
                      "<tr>" +
                      "<td class='right'><span class='telnetman_build_table_span1'>タイトル</span></td>" +
                      "<td><input type='text' spellcheck='false' autocomplete='off' style='width:260px;' id='" + this.idTitle + "' value='' onkeyup='objCommand.readValue(this.id); objCommand.checkTitle(); objCommand.changeButton();' onblur='objCommand.readValue(this.id); objCommand.checkTitle(); objCommand.changeButton();' placeholder='必須'></td>" +
                      "</tr>" +
                      "<tr>" +
                      "<td class='right'><span class='telnetman_build_table_span0'>検索キーワード</span><img src='img/help.png' width='16' height='16' alt='help' class='onclick_node' onclick='objTelnetmanHelp.help(\"keyword\");'></td>" +
                      "<td><input type='text' spellcheck='false' autocomplete='off' style='width:260px;' id='" + this.idKeyword + "' value='' onblur='objCommand.readValue(this.id);'></td>" +
                      "</tr>" +
                      "<tr>" +
                      "<td class='right'><span class='telnetman_build_table_span0'>コメント</span><img src='img/spellcheck.png' width='16' height='16' alt='help' class='onclick_node' onclick='objTelnetmanHelp.help(\"parameter13\");'><img src='img/help.png' width='16' height='16' alt='help' class='onclick_node' onclick='objTelnetmanHelp.help(\"comment\");'></td>" +
                      "<td><textarea spellcheck='false' autocomplete='off' style='width:260px; height:30px;' id='" + this.idComment + "' onblur='objCommand.readValue(this.id);'></textarea></td>" +
                      "</tr>" +
                      "<tr>" +
                      "<td class='right'><span class='telnetman_build_table_span1'>wait</span><img src='img/help.png' width='16' height='16' alt='help' class='onclick_node' onclick='objTelnetmanHelp.help(\"wait\");'></td>" +
                      "<td><input type='number' id='" + this.idWait + "' min='0' value='0' onblur='objCommand.readValue(this.id);'><span>s</span></td>" +
                      "</tr>" +
                      "<tr>" +
                      "<td class='right'><span class='telnetman_build_table_span1'>conf&nbsp;t,&nbsp;end</span><img src='img/help.png' width='16' height='16' alt='help' class='onclick_node' onclick='objTelnetmanHelp.help(\"conft_end\");'></td>" +
                      "<td>" + 
                      "<span class='middle_radio_buntton'>" +
                       "<input type='radio' name='" + this.nameConftEnd + "' id='" + this.idConftEndYes + "' value='1' onchange='objCommand.readConftEnd(this.value);'        ><label for='" + this.idConftEndYes + "'>する</label>" +
                       "<input type='radio' name='" + this.nameConftEnd + "' id='" + this.idConftEndNo +  "' value='0' onchange='objCommand.readConftEnd(this.value);' checked><label for='" + this.idConftEndNo  + "'>しない</label>" +
                      "</span>" +
                      "</td>" +
                      "</tr>" +
                      "<tr>" +
                      "<td class='right'><span class='telnetman_build_table_span1'>コマンド</span><img src='img/spellcheck.png' width='16' height='16' alt='help' class='onclick_node' onclick='objTelnetmanHelp.help(\"parameter12\");'><img src='img/help.png' width='16' height='16' alt='help' class='onclick_node' onclick='objTelnetmanHelp.help(\"command\");'></td>" +
                      "<td><textarea spellcheck='false' autocomplete='off' style='width:380px; height:150px;' id='" + this.idCommand + "' onkeyup='objCommand.readValue(this.id); objCommand.checkCommand(); objCommand.changeButton();' onblur='objCommand.readValue(this.id); objCommand.checkCommand(); objCommand.changeButton();' placeholder='必須'></textarea></td>"+
                      "</tr>" +
                      "<tr>" +
                      "<td class='right'><span class='telnetman_build_table_span0'>ダミー用コマンド返り値</span><img src='img/spellcheck.png' width='16' height='16' alt='help' class='onclick_node' onclick='objTelnetmanHelp.help(\"parameter12\");'><img src='img/help.png' width='16' height='16' alt='help' class='onclick_node' onclick='objTelnetmanHelp.help(\"dummy\");'></td>" +
                      "<td><textarea spellcheck='false' autocomplete='off' style='width:380px; height:100px;' id='" + this.idDummy + "' onblur='objCommand.readValue(this.id);'></textarea></td>" +
                      "</tr>" +
                      "<tr>" +
                      "<td class='right'><span class='telnetman_build_table_span1'>プロンプト多重確認</span><img src='img/help.png' width='16' height='16' alt='help' class='onclick_node' onclick='objTelnetmanHelp.help(\"prompt\");'></td>" +
                      "<td>" + 
                      "<span class='middle_radio_buntton'>" +
                       "<input type='radio' name='" + this.namePrompt + "' id='" + this.idPromptNormal + "' value='1' onchange='objCommand.readPrompt(this.value);' checked><label for='" + this.idPromptNormal + "'>通常型</label>" +
                       "<input type='radio' name='" + this.namePrompt + "' id='" + this.idPromptJunos  + "' value='2' onchange='objCommand.readPrompt(this.value);'        ><label for='" + this.idPromptJunos  + "'>JUNOS型</label>" +
                       "<input type='radio' name='" + this.namePrompt + "' id='" + this.idPromptNone   + "' value='0' onchange='objCommand.readPrompt(this.value);'        ><label for='" + this.idPromptNone   + "'>しない</label>" +
                      "</span>" +
                      "</td>" +
                      "</tr>" +
                      "<tr>" +
                      "<td class='right'><span class='telnetman_build_table_span1'>コマンド返り値を</span><img src='img/help.png' width='16' height='16' alt='help' class='onclick_node' onclick='objTelnetmanHelp.help(\"store\");'></td>" +
                      "<td>" + 
                      "<span class='middle_radio_buntton'>" +
                       "<input type='radio' name='" + this.nameStore + "' id='" + this.idStoreYes + "' value='1' onchange='objCommand.readStore(this.value);' checked><label for='" + this.idStoreYes + "'>溜める</label>" +
                       "<input type='radio' name='" + this.nameStore + "' id='" + this.idStoreNo +  "' value='0' onchange='objCommand.readStore(this.value);'        ><label for='" + this.idStoreNo  + "'>溜めない</label>" +
                      "</span>" +
                      "</td>" +
                      "</tr>" +
                      "<tr>" +
                      "<td class='center telnetman_build_table_span1'>-</td>" +
                      "<td><button class='disable' id='" + this.idBuildAreaButton + "'></button><button class='enable' onclick='objCommand.initialize();'>入力欄初期化</button><button class='disable' id='" + this.idCopyButton + "'>コピー</button></td>" +
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
    objLayoutFunctions.printAllItemSymbol("command", this.commandIdList, this.symbolList);
    this.insertValue();
    this.changeButton();
    this.changeInputAttribute();
    
    if(this.commandId.length > 0){
     var idSymbol = objLayoutFunctions.makeSymbolId("command", this.commandId, 0);
     objLayoutFunctions.rotateSymbol(idSymbol);
    }  
   }
  }
  
  document.getElementById(this.idCommandSymbolArea).style.display = "none";
  $("#" + this.idCommandSymbolArea).fadeIn(300);
  document.getElementById(this.idBuildTable).style.display = "none";
  $("#" + this.idBuildTable).fadeIn(300);
 };
 
 
 // 変数と画面を初期化
 this.initialize = function () {
  if(this.commandId.length > 0){
   var idSymbol = objLayoutFunctions.makeSymbolId("command", this.commandId, 0);
   objLayoutFunctions.fixSymbol(idSymbol);
  }
  
  this.operation = "create";
  this.commandId = "";
  
  this.repeatType  = 1;
  this.commandType = 1;
  this.conftEnd    = 0;
  this.prompt      = 1;
  this.store       = 1;
  
  this.valueList[this.idTitle]   = "";
  this.valueList[this.idCommand] = "";
  this.valueList[this.idKeyword] = "";
  this.valueList[this.idComment] = "{\$title}";
  this.valueList[this.idDummy]   = "";
  this.valueList[this.idWait]    = 0;
  
  this.isTitle   = false;
  this.isCommand = false;
  
  if(objControleStorageS.getPage() === "command"){
   this.insertValue();
   this.changeButton();
   this.changeInputAttribute();
  }
 };
 
 
 // 入力欄のreadonly 属性を変更する。
 this.changeInputAttribute = function () {
  var elRepeatType1  = document.getElementById(this.idRepeatType1);
  var elRepeatType2  = document.getElementById(this.idRepeatType2);
  var elCommandType1 = document.getElementById(this.idCommandType1);
  var elCommandType2 = document.getElementById(this.idCommandType2);
  var elCommandType3 = document.getElementById(this.idCommandType3);
  var elTitle        = document.getElementById(this.idTitle);
  var elKeyword      = document.getElementById(this.idKeyword);
  var elComment      = document.getElementById(this.idComment);
  var elWait         = document.getElementById(this.idWait);
  var elConftEndYes  = document.getElementById(this.idConftEndYes);
  var elConftEndNo   = document.getElementById(this.idConftEndNo);
  var elCommand      = document.getElementById(this.idCommand);
  var elDummy        = document.getElementById(this.idDummy);
  var elPromptNormal = document.getElementById(this.idPromptNormal);
  var elPromptJunos  = document.getElementById(this.idPromptJunos);
  var elPromptNone   = document.getElementById(this.idPromptNone);
  var elStoreYes     = document.getElementById(this.idStoreYes);
  var elStoreNo      = document.getElementById(this.idStoreNo);
  
  if((this.operation === "create") || (this.operation === "update")){
   elRepeatType1.disabled  = false;
   elRepeatType2.disabled  = false;
   elCommandType1.disabled = false;
   elCommandType2.disabled = false;
   elCommandType3.disabled = false;
   elTitle.readOnly        = false;
   elKeyword.readOnly      = false;
   elComment.readOnly      = false;
   elWait.readOnly         = false;
   elConftEndYes.disabled  = false;
   elConftEndNo.disabled   = false;
   elCommand.readOnly      = false;
   elDummy.readOnly        = false;
   elPromptNormal.disabled = false;
   elPromptJunos.disabled  = false;
   elPromptNone.disabled   = false;
   elStoreYes.disabled     = false;
   elStoreNo.disabled      = false;

   objLayoutFunctions.removeGrayOut(this.idTitle);
   objLayoutFunctions.removeGrayOut(this.idKeyword);
   objLayoutFunctions.removeGrayOut(this.idComment);
   objLayoutFunctions.removeGrayOut(this.idWait);
   objLayoutFunctions.removeGrayOut(this.idCommand);
   objLayoutFunctions.removeGrayOut(this.idDummy);
  }
  else if(this.operation === "delete"){
   elRepeatType1.disabled  = true;
   elRepeatType2.disabled  = true;
   elCommandType1.disabled = true;
   elCommandType2.disabled = true;
   elCommandType3.disabled = true;
   elTitle.readOnly        = true;
   elKeyword.readOnly      = true;
   elComment.readOnly      = true;
   elWait.readOnly         = true;
   elConftEndYes.disabled  = true;
   elConftEndNo.disabled   = true;
   elCommand.readOnly      = true;
   elDummy.readOnly        = true;
   elPromptNormal.disabled = true;
   elPromptJunos.disabled  = true;
   elPromptNone.disabled   = true;
   elStoreYes.disabled     = true;
   elStoreNo.disabled      = true;

   objLayoutFunctions.grayOut(this.idTitle);
   objLayoutFunctions.grayOut(this.idKeyword);
   objLayoutFunctions.grayOut(this.idComment);
   objLayoutFunctions.grayOut(this.idWait);
   objLayoutFunctions.grayOut(this.idCommand);
   objLayoutFunctions.grayOut(this.idDummy);
  }
 };
 
 
 // 各種入力値の読み取り。
 this.readRepeatType = function (repeatType) {
  if(typeof(repeatType) === "string"){
   repeatType = parseInt(repeatType, 10);
  }
  
  this.repeatType = repeatType;
 };
 
 this.readCommandType = function (commandType) {
  if(typeof(commandType) === "string"){
   commandType = parseInt(commandType, 10);
  }
  
  this.commandType = commandType;
  
  if(commandType === 1){
   this.conftEnd = 0;
   this.prompt   = 1;
   this.store    = 1;
  }
  else if(commandType === 2){
   this.conftEnd = 1;
   this.prompt   = 1;
   this.store    = 0;
  }
  else if(commandType === 3){
   this.conftEnd = 0;
   this.prompt   = 0;
   this.store    = 0;
  }
  
  this.changeConftEnd();
  this.changePrompt();
  this.changeStore();
 };
 
 this.readConftEnd = function (conftEnd) {
  if(typeof(conftEnd) === "string"){
   conftEnd = parseInt(conftEnd, 10);
  }
  
  this.conftEnd = conftEnd;
 };
 
 this.readPrompt = function (prompt) {
  if(typeof(prompt) === "string"){
   prompt = parseInt(prompt, 10);
  }
  
  this.prompt = prompt;
 };
 
 this.readStore = function (store) {
  if(typeof(store) === "string"){
   store = parseInt(store, 10);
  }
  
  this.store = store;
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
 
 
 // コマンドが正しく書けているか確認する。
 this.checkCommand = function () {
  if(this.valueList[this.idCommand].length > 0){
   this.isCommand = true;
  }
  else{
   this.isCommand = false;
  }
 };
 
 
 // 入力欄に値を入れる。
 this.insertValue = function () {
  document.getElementById(this.idSearchKeyword).value = this.valueSearchKeyword;
  document.getElementById(this.idSearchTitle).value   = this.valueSearchTitle;
  
  document.getElementById(this.idTitle).value   = this.valueList[this.idTitle];
  document.getElementById(this.idKeyword).value = this.valueList[this.idKeyword];
  document.getElementById(this.idComment).value = this.valueList[this.idComment];
  document.getElementById(this.idWait).value    = this.valueList[this.idWait];
  document.getElementById(this.idCommand).value = this.valueList[this.idCommand];
  document.getElementById(this.idDummy).value   = this.valueList[this.idDummy];
  
  if(this.repeatType === 1){
   document.getElementById(this.idRepeatType2).checked = false;
   document.getElementById(this.idRepeatType1).checked = true;
  }
  else if(this.repeatType === 2){
   document.getElementById(this.idRepeatType1).checked = false;
   document.getElementById(this.idRepeatType2).checked = true;
  }
  
  if(this.commandType === 1){
   document.getElementById(this.idCommandType2).checked = false;
   document.getElementById(this.idCommandType3).checked = false;
   document.getElementById(this.idCommandType1).checked = true;
  }
  else if(this.commandType === 2){
   document.getElementById(this.idCommandType1).checked = false;
   document.getElementById(this.idCommandType3).checked = false;
   document.getElementById(this.idCommandType2).checked = true;
  }
  else if(this.commandType === 3){
   document.getElementById(this.idCommandType1).checked = false;
   document.getElementById(this.idCommandType2).checked = false;
   document.getElementById(this.idCommandType3).checked = true;
  }
  
  this.changeConftEnd();
  this.changePrompt();
  this.changeStore();
 };
 
 
 // conf t, end するしないの表示の変更。
 this.changeConftEnd = function (){
  if(this.conftEnd === 0){
   document.getElementById(this.idConftEndYes).checked = false;
   document.getElementById(this.idConftEndNo).checked = true;
  }
  else if(this.conftEnd === 1){
   document.getElementById(this.idConftEndNo).checked = false;
   document.getElementById(this.idConftEndYes).checked = true;
  }
 };
 
 // プロンプト確認するしないの表示の変更。
 this.changePrompt = function (){
  if(this.prompt === 1){
   document.getElementById(this.idPromptJunos).checked  = false;
   document.getElementById(this.idPromptNone).checked   = false;
   document.getElementById(this.idPromptNormal).checked = true;
  }
  else if(this.prompt === 2){
   document.getElementById(this.idPromptNormal).checked = false;
   document.getElementById(this.idPromptNone).checked   = false;
   document.getElementById(this.idPromptJunos).checked  = true;
  }
  else if(this.prompt === 0){
   document.getElementById(this.idPromptNormal).checked = false;
   document.getElementById(this.idPromptJunos).checked  = false;
   document.getElementById(this.idPromptNone).checked   = true;
  }
 };
 
 // コマンド返り値を溜める溜めないの表示変更。
 this.changeStore = function (){
  if(this.store === 1){
   document.getElementById(this.idStoreNo).checked  = false;
   document.getElementById(this.idStoreYes).checked = true;
  }
  else if(this.store === 0){
   document.getElementById(this.idStoreYes).checked = false;
   document.getElementById(this.idStoreNo).checked  = true;
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
  
  if(this.isTitle && this.isCommand){
   elButton.className = "enable";
   elButton.onclick = new Function("objCommand.createUpdateDelete();");
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
   elCopyButton.onclick = new Function("objCommand.copy();");
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
  
  if(this.commandId.length > 0){
   var idSymbol = objLayoutFunctions.makeSymbolId("command", this.commandId, 0);
   objLayoutFunctions.fixSymbol(idSymbol);
  }
  
  this.commandId = "";
 };
 
 
 // 新規作成、更新、削除。
 this.createUpdateDelete = function () {
  var authHeader = makeAuthHeader();
  
  $.ajax({
   headers : {"telnetmanAuth" : authHeader},
   type : "post",
   url  : "/cgi-bin/Telnetman2/command.cgi",
   data : {
    "command_id"        : this.commandId,
    "operation"         : this.operation,
    "title"             : objCommonFunctions.convertYen(this.valueList[this.idTitle]),
    "keyword"           : objCommonFunctions.convertYen(this.valueList[this.idKeyword]),
    "comment"           : objCommonFunctions.convertYen(this.valueList[this.idComment]),
    "wait"              : this.valueList[this.idWait],
    "command"           : objCommonFunctions.convertYen(this.valueList[this.idCommand]),
    "dummy"             : objCommonFunctions.convertYen(this.valueList[this.idDummy]),
    "repeat_type"       : this.repeatType,
    "command_type"      : this.commandType,
    "conft_end"         : this.conftEnd,
    "prompt"            : this.prompt,
    "store"             : this.store
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
         var commandId   = hashResult["command_id"];
         var repeatType  = hashResult["repeat_type"];
         var commandType = hashResult["command_type"];
         var title       = hashResult["title"];
         
         var idSymbol = objLayoutFunctions.makeSymbolId("command", commandId, 0);
         
         if(operation === "create"){
          objCommand.appendCommandSymbolData(commandId, title, repeatType, commandType);
          objLayoutFunctions.appendItemSymbol("command", title, repeatType, idSymbol, commandType);
          
          // フローチャートのページにもシンボルを追加する。
          objFlowchart.appendSymbolData("command", commandId, title, repeatType, commandType);
         }
         else if(operation === "update"){
          $("#" + idSymbol).effect('pulsate', '', 1000, function(){
           objCommand.symbolList[commandId]["title"] = title;
           objCommand.symbolList[commandId]["repeat_type"] = repeatType;
           objCommand.symbolList[commandId]["command_type"] = commandType;
           
           var elDiv = document.getElementById(idSymbol);
           
           var divClassName  = objLayoutFunctions.makeSymbolClassName("command", repeatType, commandType);
           var spanClassName = objLayoutFunctions.makeSymbolTitleClassName("command", repeatType, commandType);
           
           elDiv.className = divClassName;
           elDiv.childNodes[0].className = spanClassName;
           elDiv.childNodes[0].innerHTML = objCommonFunctions.escapeHtml(title);
          });
          
          // フローチャートのページのシンボルも更新する。
          objFlowchart.updateSymbolData("command", commandId, title, repeatType, commandType);
         }
         else if(operation === "delete"){
          for(var i = 0, j = objCommand.commandIdList.length; i < j; i ++){
           var shiftCommandId = objCommand.commandIdList.shift();
           if(shiftCommandId !== commandId){
            objCommand.commandIdList.push(shiftCommandId);
           }
           else{
            i --;
            j --;
           }
          }
          
          delete(objCommand.symbolList[commandId]);
          
          $("#" + idSymbol).effect('puff', '', 500, function(){
           var elDiv = document.getElementById(idSymbol);
           document.getElementById(objCommand.idCommandSymbolArea).removeChild(elDiv);
          });
          
          // フローチャートのページのシンボルも削除する。
          objFlowchart.removeSymbolData("command", commandId);
         }
         
         objCommand.initialize();
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
 this.getCommandData = function (commandId, operation) {
  // 流れ図画面とExport画面の右クリックで呼び出されたら終了。
  if((objControleStorageL.getPage() === "flowchart") && (operation === "delete")){
   return(false);
  }
  else if((objControleStorageL.getPage() === "export_import") && (operation === "delete")){
   return(false);
  }
  
  if((objControleStorageL.getPage() === "command") && (this.commandId.length > 0)){
   var idSymbol = objLayoutFunctions.makeSymbolId("command", this.commandId, 0);
   objLayoutFunctions.fixSymbol(idSymbol);
  }
  
  var authHeader = makeAuthHeader();
  
  $.ajax({
   headers : {"telnetmanAuth" : authHeader},
   type : "post",
   url  : "/cgi-bin/Telnetman2/get_item_data.cgi",
   data : {
    "item_type" : "command",
    "item_id"   : commandId,
    "operation"    : operation
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
         if(objControleStorageL.getPage() === "command"){// コマンド設定画面を開いている時
          objCommand.commandId   = hashResult["item_id"];
          objCommand.operation   = hashResult["operation"];
          objCommand.repeatType  = hashResult["repeat_type"];
          objCommand.commandType = hashResult["command_type"];
          objCommand.conftEnd    = hashResult["conft_end"];
          objCommand.prompt      = hashResult["prompt"];
          objCommand.store       = hashResult["store"];
          objCommand.valueList[objCommand.idTitle]   = hashResult["title"];
          objCommand.valueList[objCommand.idKeyword] = hashResult["keyword"];
          objCommand.valueList[objCommand.idComment] = hashResult["comment"];
          objCommand.valueList[objCommand.idWait]    = hashResult["wait"];
          objCommand.valueList[objCommand.idCommand] = hashResult["command"];
          objCommand.valueList[objCommand.idDummy]   = hashResult["dummy"];
          
          objCommand.insertValue();
          objCommand.isTitle   = true;
          objCommand.isCommand = true;
          objCommand.changeButton();
          objCommand.changeInputAttribute();
          
          var idSymbol = objLayoutFunctions.makeSymbolId("command", objCommand.commandId, 0);
          objLayoutFunctions.rotateSymbol(idSymbol);
         }
         else{// 流れ図画面を開いている時
          var itemId      = hashResult["item_id"];
          var repeatType  = hashResult["repeat_type"];
          var commandType = hashResult["command_type"];
          var conftEnd    = hashResult["conft_end"];
          var prompt      = hashResult["prompt"];
          var store       = hashResult["store"];
          var title       = objCommonFunctions.escapeHtml(hashResult["title"]);
          var keyword     = objCommonFunctions.escapeHtml(hashResult["keyword"]);
          var comment     = objCommonFunctions.escapeHtml(hashResult["comment"]);
          var wait        = hashResult["wait"];
          var command     = objCommonFunctions.escapeHtml(hashResult["command"]);
          var dummy       = objCommonFunctions.escapeHtml(hashResult["dummy"]);
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
          
          var commandTypeText = "";
          if(commandType === 1){
           commandTypeText = "show";
          }
          else if(commandType === 2){
           commandTypeText = "conf&nbsp;t";
          }
          else if(commandType === 3){
           commandTypeText = "返り値なし";
          }
          
          var conftEndText = "";
          if(conftEnd === 0){
           conftEndText = "しない";
          }
          else if(conftEnd === 1){
           conftEndText = "する";
          }
          
          var promptText = "";
          if(prompt === 1){
           promptText = "通常型";
          }
          else if(prompt === 2){
           promptText = "JUNOS型";
          }
          else if(prompt === 0){
           promptText = "しない";
          }
          
          var storeText = "";
          if(store === 1){
           storeText = "溜める";
          }
          else if(store === 0){
           storeText = "溜めない";
          }
          
          command = command.replace(/\n/g, "<br>");
          comment = comment.replace(/\n/g, "<br>");
          dummy   = dummy.replace(/\n/g, "<br>");
          
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
                     "<td class='right telnetman_item_viewer_td1'><span class='telnetman_item_viewer_span1'>系統</span></td>" +
                     "<td class='left'><span class='telnetman_item_viewer_span2'>" + commandTypeText + "</span></td>" +
                     "</tr>" +
                     "<tr>" +
                     "<td class='right telnetman_item_viewer_td1'><span class='telnetman_item_viewer_span1'>タイトル</span></td>" +
                     "<td class='left'><span class='onclick_node' onclick='objCommand.print(\"" + itemId + "\"); objLayoutFunctions.removeItemViewTable();'>" + title + "</span></td>" +
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
                     "<td class='right telnetman_item_viewer_td1'><span class='telnetman_item_viewer_span1'>wait</span></td>" +
                     "<td class='left'><span class='telnetman_item_viewer_span2'>" + wait + "&nbsp;秒</span></td>" +
                     "</tr>" +
                     "<tr>" +
                     "<td class='right telnetman_item_viewer_td1'><span class='telnetman_item_viewer_span1'>conft&nbsp;end&nbsp;実行</span></td>" +
                     "<td class='left'><span class='telnetman_item_viewer_span2'>" + conftEndText + "</span></td>" +
                     "</tr>" +
                     "<tr>" +
                     "<td class='right telnetman_item_viewer_td1'><span class='telnetman_item_viewer_span1'>コマンド</span></td>" +
                     "<td class='left'><span class='telnetman_item_viewer_span2'>" + command + "</span></td>" +
                     "</tr>" +
                     "<tr>" +
                     "<td class='right telnetman_item_viewer_td1'><span class='telnetman_item_viewer_span1'>ダミー用</span><br><span class='telnetman_item_viewer_span1'>コマンド返り値</span></td>" +
                     "<td class='left'><span class='telnetman_item_viewer_span2'>" + dummy + "</span></td>" +
                     "</tr>" +
                     "<tr>" +
                     "<td class='right telnetman_item_viewer_td1'><span class='telnetman_item_viewer_span1'>プロンプト多重確認</span></td>" +
                     "<td class='left'><span class='telnetman_item_viewer_span2'>" + promptText + "</span></td>" +
                     "</tr>" +
                     "<tr>" +
                     "<td class='right telnetman_item_viewer_td1'><span class='telnetman_item_viewer_span1'>コマンド返り値を</span></td>" +
                     "<td class='left'><span class='telnetman_item_viewer_span2'>" + storeText + "</span></td>" +
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
