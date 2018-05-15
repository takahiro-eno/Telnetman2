// 説明   : action 登録画面。
// 作成日 : 2017/09/11
// 作成者 : 江野高広

var objAction = new action();

function action () {
 this.operation = "create";
 this.actionId = "";
 
 // 入力欄の内容を格納する変数を定義。
 this.isOpened = false;
 this.actionIdList = new Array();
 this.symbolList = new Object();
 this.valueList = new Object();
 this.repeatType = 1;
 this.destroy = 1;
 
 // 条件の入力値を格納する。
 this.conditionList = new Array();
 
 // 必須項目が正しく書けているかどうかの確認。
 this.isActionId = false;
 this.isTitle    = false;
 
 // HTML のid の接頭語と固定id
 this.idActionSymbolArea = "";
 this.idPrefix = "telnetman_acrion_";
 this.idBuildTable   = this.idPrefix + "build_table";
 this.nameRepeatType = this.idPrefix + "repeat_type";
 this.idRepeatType1  = this.idPrefix + "repeat_type_1";
 this.idRepeatType2  = this.idPrefix + "repeat_type_2";
 this.idTitle        = this.idPrefix + "title";
 this.idKeyword      = this.idPrefix + "keyword";
 this.idComment      = this.idPrefix + "comment";
 this.idPattern      = this.idPrefix + "pattern";
 this.idScriptId     = this.idPrefix + "script_id";
 this.idNot          = this.idPrefix + "not";
 this.idNgMessage    = this.idPrefix + "ng_message";
 this.idBuildAreaButton = this.idPrefix + "build_area_button";
 this.idCopyButton     = this.idPrefix + "copy_button";
 this.idConditionArea = this.idPrefix + "conditions";
 this.nameDestroy      =  this.idPrefix + "destroy";
 this.idDestroy0      =  this.idPrefix + "destroy_0";
 this.idDestroy1      =  this.idPrefix + "destroy_1";
 this.idConditionLine = function (x) {
  return(this.idPrefix + "condition_line_" + x);
 };
 this.idCondition = function (x, y) {
  return(this.idPrefix + "condition_" + x + "_" + y);
 };
 this.idCreateNewConditionLineButton = this.idPrefix + "condition_new_line";
 this.idCreateNewConditionFieldButton = function (x) {
  return(this.idPrefix + "condition_new_field_" + x);
 };

 // パターンマッチテストエリアのid
 this.idTogglePatternMatchTestAreaButton = this.idPrefix + "toggle_pattern_match_test_area_button";
 this.idPatternMatchTestArea             = this.idPrefix + "pattern_match_test_area";
 this.idPatternMatchMessage              = this.idPrefix + "pattern_match_message";
 this.idPatternMatchValues               = this.idPrefix + "pattern_match_values";
 this.idTestCommandReturn                = this.idPrefix + "test_command_return";
 
 // 個数条件のid とname
 this.idOperator = function (number){
  if((number !== null) && (number !== undefined)){
   return(this.idPrefix + "operator_" + number);
  }
  else{
   return(this.idPrefix + "operator");
  }
 };
 this.idOperatorLabel = function (number){
  return(this.idPrefix + "operator_label_" + number);
 };
 this.idCount = this.idPrefix + "count";
 
 
 // pipe type のid とname
 this.idPipeType = function (number){
  if((number !== null) && (number !== undefined)){
   return(this.idPrefix + "pipe_type_" + number);
  }
  else{
   return(this.idPrefix + "pipe_type");
  }
 };
 this.idPipeTypeLabel = function (number){
  return(this.idPrefix + "pipe_type_label_" + number);
 };
 this.idPipeWord = this.idPrefix + "pipe_word";
 this.idPipeTestType = this.idPrefix + "pipe_test_type";
 this.idPipeTestWord = this.idPrefix + "pipe_test_word";
 
 // パターンマッチテストエリアを開いているかどうか。
 this.isPattermatchTestArea = false;
 
 // コマンドシンボル描画のためのデータを格納する。
 this.actionIdList = new Array();
 this.symbolList = new Object();
 
 // objLayoutFunctions.getItemSymbol の結果全てをthis.actionIdList, this.symbolList に値を格納する。
 this.insertActionSymbolData = function (itemIdList, itemSymbolList){
  if("action" in itemIdList){
   for(var i = 0, j = itemIdList["action"].length; i < j; i ++){
    var actionId   = itemIdList["action"][i];
    var title      = itemSymbolList["action"][actionId]["title"];
    var repeatType = itemSymbolList["action"][actionId]["repeat_type"];
    
    this.appendActionSymbolData(actionId, title, repeatType);
   }
  }
  
  var elButton = document.getElementById(this.idSearchButton);
  elButton.onclick = new Function("objAction.get();");
  elButton.className = "enable";
 };
 
 // this.actionIdList, this.symbolList に1件分のデータを格納する。
 this.appendActionSymbolData = function (actionId, title, repeatType){
  this.actionIdList.push(actionId);
  this.symbolList[actionId] = new Object();
  this.symbolList[actionId]["title"] = title;
  this.symbolList[actionId]["repeat_type"] = repeatType;
  this.symbolList[actionId]["serial_number"] = 0;
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
   objLayoutFunctions.getItemSymbol("action", {"action":[itemId]}, null);
  }
  else{
   objLayoutFunctions.getItemSymbol("action", null, {"action":{"keyword":this.valueSearchKeyword, "title":this.valueSearchTitle}});
  }
 };
 
 this.clear = function (){
  var elActionSymbolArea = document.getElementById(this.idActionSymbolArea);
  var symbols = elActionSymbolArea.childNodes;
  for(var i = symbols.length - 1; i >= 0; i --){
   elActionSymbolArea.removeChild(symbols[i]);
  }
  
  while(this.actionIdList.length > 0){
   var actionId = this.actionIdList.shift();
   
   delete(this.symbolList[actionId]["title"]);
   delete(this.symbolList[actionId]["repeat_type"]);
   delete(this.symbolList[actionId]["serial_number"]);
   delete(this.symbolList[actionId]);
  }
  
  this.actionId = "";
  this.initialize();
 };
 
 
 // 画面描画。
 this.print = function (itemId) {
  objControleStorageL.setPage("action");
  objControleStorageS.setPage("action");
  
  if((itemId !== null) && (itemId !== undefined) && (itemId.length > 0)){
   this.valueSearchKeyword = "";
   this.valueSearchTitle   = "";
  }
  
  this.idActionSymbolArea = objLayoutFunctions.itemSymbolAreaId("action");
  var htmlObjectArea = "<table class='search_item_field'>" +
                       "<tr><td class='left'><span>タイトル</span><input type='text' spellcheck='false' autocomplete='off' placeholder='一部' style='width:170px;' id='" + this.idSearchTitle + "' value='' onblur='objAction.readSearchTitle();'></td></tr>" +
                       "<tr><td class='left'><span>検索キーワード</span><input type='text' spellcheck='false' autocomplete='off' placeholder='前方一致' style='width:140px;' id='" + this.idSearchKeyword + "' value='' onblur='objAction.readSearchKeyword();'></td></tr>" +
                       "<tr><td class='center'><button class='enable' id='" + this.idSearchButton + "' onclick='objAction.get();'>search</button><button class='enable' onclick='objAction.clear();'>clear</button><img src='img/help.png' width='16' height='16' alt='help' class='onclick_node' onclick='objTelnetmanHelp.help(\"delete_item\");'></td></tr>" +
                       "</table>" +
                       "<div id='" + this.idActionSymbolArea + "' class='item_symbol_area'></div>";
                       
  var htmlBuildArea = "<table class='telnetman_item_build_table' id='" + this.idBuildTable + "'>" +
                      "<tr>" +
                      "<td class='right'><span class='telnetman_build_table_span1'>動作</span></td>" +
                      "<td>" + 
                      "<span class='middle_radio_buntton'>" +
                       "<input type='radio' name='" + this.nameRepeatType + "' id='" + this.idRepeatType1 + "' value='1' onchange='objAction.readRepeatType(this.value);' checked><label for='" + this.idRepeatType1 + "'>1回のみ</label>" +
                       "<input type='radio' name='" + this.nameRepeatType + "' id='" + this.idRepeatType2 + "' value='2' onchange='objAction.readRepeatType(this.value);'        ><label for='" + this.idRepeatType2 + "'>繰り返し</label>" +
                      "</span>" +
                      "</td>" +
                      "</tr>" +
                      "<tr>" +
                      "<td class='right'><span class='telnetman_build_table_span1'>タイトル</span></td>" +
                      "<td><input type='text' spellcheck='false' autocomplete='off' style='width:260px;' id='" + this.idTitle + "' value='' onkeyup='objAction.readValue(this.id); objAction.checkTitle(); objAction.changeButton();' onblur='objAction.readValue(this.id); objAction.checkTitle(); objAction.changeButton();' placeholder='必須'></td>" +
                      "</tr>" +
                      "<tr>" +
                      "<td class='right'><span class='telnetman_build_table_span0'>検索キーワード</span><img src='img/help.png' width='16' height='16' alt='help' class='onclick_node' onclick='objTelnetmanHelp.help(\"keyword\");'></td>" +
                      "<td><input type='text' spellcheck='false' autocomplete='off' style='width:260px;' id='" + this.idKeyword + "' value='' onblur='objAction.readValue(this.id);'></td>" +
                      "</tr>" +
                      "<tr>" +
                      "<td class='right'><span class='telnetman_build_table_span0'>コメント</span><img src='img/spellcheck.png' width='16' height='16' alt='help' class='onclick_node' onclick='objTelnetmanHelp.help(\"parameter13\");'><img src='img/help.png' width='16' height='16' alt='help' class='onclick_node' onclick='objTelnetmanHelp.help(\"comment\");'></td>" +
                      "<td><textarea spellcheck='false' autocomplete='off' style='width:260px; height:30px;' id='" + this.idComment + "' onblur='objAction.readValue(this.id);'></textarea></td>" +
                      "</tr>" +
                      "<tr>" +
                      "<td class='right'><span class='telnetman_build_table_span0'>抽出パターン</span><img src='img/help.png' width='16' height='16' alt='help' class='onclick_node' onclick='objTelnetmanHelp.help(\"pattern\");'></td>" +
                      "<td>" +
                      
                      "<div class='pattern_match_element_frame'>" +
                       "<div class='pattern_match_element_box1'>" +
                       "<span class='little_radio_buntton'>" +
                       "<input type='radio' id='" + this.idPipeType(1) + "' name='" + this.idPipeType() + "' value='1' onchange='objAction.readPipeType(this.id);' checked><label for='" + this.idPipeType(1) + "' id='" + this.idPipeTypeLabel(1) + "'>include</label>" +
                       "<input type='radio' id='" + this.idPipeType(2) + "' name='" + this.idPipeType() + "' value='2' onchange='objAction.readPipeType(this.id);'        ><label for='" + this.idPipeType(2) + "' id='" + this.idPipeTypeLabel(2) + "'>exclude</label>" +
                       "<input type='radio' id='" + this.idPipeType(3) + "' name='" + this.idPipeType() + "' value='3' onchange='objAction.readPipeType(this.id);'        ><label for='" + this.idPipeType(3) + "' id='" + this.idPipeTypeLabel(3) + "'>begin</label>" +
                       "</span>" +
                       "<img src='img/spellcheck.png' width='16' height='16' alt='help' class='onclick_node' onclick='objTelnetmanHelp.help(\"parameter12\");'>" +
                       "<img src='img/help.png' width='16' height='16' alt='help' class='onclick_node' onclick='objTelnetmanHelp.help(\"include\");'>" +
                       "</div>" +
                       "<div class='pattern_match_element_box2'>" +
                       "<textarea spellcheck='false' autocomplete='off' style='width:200px; height:54px;' id='" + this.idPipeWord + "' onblur='objAction.readValue(this.id);'></textarea><span>&#x203B;非正規表現</span>" +
                       "</div>" +
                       "<p class='pattern_match_element_border'>---------------&nbsp;{$1},&nbsp;{$2},&nbsp;{$3},&nbsp;&hellip;,&nbsp;{$*}&nbsp;初期化&nbsp;---------------</p>" +
                       "<div class='pattern_match_element_box3'>" +
                       "<textarea spellcheck='false' autocomplete='off' style='width:380px; height:100px;' id='" + this.idPattern + "' value='' onblur='objAction.readValue(this.id);'></textarea><span>&#x203B;正規表現</span>" +
                       "</div>" +
                      "</div>" +
                      
                      "<div class='pattern_match_button_area'>" +
                      "<button class='enable' id='" + this.idTogglePatternMatchTestAreaButton + "' onclick='objAction.toggleMatchTestArea();'>&#9660;</button>"  +
                      "</div>" +
                      
                      "<div class='pattern_match_test_area' id='" + this.idPatternMatchTestArea + "'>" +
                      "<p class='pattern_match_line_area'><button class='enable' onclick='objAction.patternMatchTest();'>TEST</button><span id='" + this.idPatternMatchMessage + "'></span></p>" +
                      "<p class='pattern_match_line_area' id='" + this.idPatternMatchValues + "'></p>" +
                      "<div class='pattern_match_element_frame'>" +
                       "<div class='pattern_match_element_box1'>" +
                       "<img src='img/help.png' width='16' height='16' alt='help' class='onclick_node' onclick='objTelnetmanHelp.help(\"include_test\");'><span id='" + this.idPipeTestType + "'></span>" +
                       "</div>" +
                       "<div class='pattern_match_element_box2'>" +
                       "<textarea spellcheck='false' autocomplete='off' style='width:270px; height:54px;' id='" + this.idPipeTestWord + "' onblur='objAction.readValue(this.id);' placeholder='試験用include,exclude,begin'></textarea>" +
                       "</div>" +
                       "<div class='pattern_match_element_box3'>" +
                       "<textarea spellcheck='false' autocomplete='off' style='width:450px; height:100px;' id='" + this.idTestCommandReturn + "' onblur='objAction.readValue(this.id);' placeholder='パターンマッチ試験用コマンド返り値'></textarea>" +
                       "</div>" +
                      "</div>" +
                      "</div>" +
                      
                      "</td>" +
                      "</tr>" +
                      "<tr>" +
                      "<td class='right'><span class='telnetman_build_table_span0'>変換スクリプト</span><img src='img/help.png' width='16' height='16' alt='help' class='onclick_node' onclick='objTelnetmanHelp.help(\"script\");'></td>" +
                      "<td><select id='" + this.idScriptId + "' onchange='objAction.readValue(this.id)'><option value=''>なし</option></select></td>" +
                      "</tr>" +
                      "<tr>" +
                      "<td class='right'><input type='checkbox' id='" + this.idNot + "' value='1' onchange='objAction.readNot();'><label for='" + this.idNot + "' class='checkbox1'><span class='bold red'>!</label><span class='telnetman_build_table_span0'>分岐条件</span><img src='img/spellcheck.png' width='16' height='16' alt='help' class='onclick_node' onclick='objTelnetmanHelp.help(\"parameter12\");'><img src='img/help.png' width='16' height='16' alt='help' class='onclick_node' onclick='objTelnetmanHelp.help(\"condition\");'></td>" +
                      "<td><div id='" + this.idConditionArea + "'></div></td>" +
                      "</tr>" +
                      "<tr>" +
                      "<td class='right'><span class='telnetman_build_table_span0'>個数条件</span></td>" +
                      "<td>" +
                       "<span>{\$n}&nbsp;</span>" +
                       "<span class='little_radio_buntton'>" +
                       "<input type='radio' id='" + this.idOperator(1) + "' name='" + this.idOperator() + "' value='1' onchange='objAction.readOperator(this.id);'        ><label for='" + this.idOperator(1) + "' id='" + this.idOperatorLabel(1) + "'>==</label>" +
                       "<input type='radio' id='" + this.idOperator(2) + "' name='" + this.idOperator() + "' value='2' onchange='objAction.readOperator(this.id);'        ><label for='" + this.idOperator(2) + "' id='" + this.idOperatorLabel(2) + "'>!=</label>" +
                       "<input type='radio' id='" + this.idOperator(3) + "' name='" + this.idOperator() + "' value='3' onchange='objAction.readOperator(this.id);' checked><label for='" + this.idOperator(3) + "' id='" + this.idOperatorLabel(3) + "'>&gt;</label>" +
                       "<input type='radio' id='" + this.idOperator(4) + "' name='" + this.idOperator() + "' value='4' onchange='objAction.readOperator(this.id);'        ><label for='" + this.idOperator(4) + "' id='" + this.idOperatorLabel(4) + "'>&gt;=</label>" +
                       "<input type='radio' id='" + this.idOperator(5) + "' name='" + this.idOperator() + "' value='5' onchange='objAction.readOperator(this.id);'        ><label for='" + this.idOperator(5) + "' id='" + this.idOperatorLabel(5) + "'>&lt;</label>" +
                       "<input type='radio' id='" + this.idOperator(6) + "' name='" + this.idOperator() + "' value='6' onchange='objAction.readOperator(this.id);'        ><label for='" + this.idOperator(6) + "' id='" + this.idOperatorLabel(6) + "'>&lt;=</label>" +
                       "</span>" +
                       "<input type='number' id='" + this.idCount + "' min='0' value='0' onblur='objAction.readValue(this.id);'>" +
                      "</td>" +
                      "</tr>" +
                      "<tr>" +
                      "<td class='right'><span class='telnetman_build_table_span0'>NG&nbsp;メッセージ</span><img src='img/spellcheck.png' width='16' height='16' alt='help' class='onclick_node' onclick='objTelnetmanHelp.help(\"parameter34\");'><img src='img/help.png' width='16' height='16' alt='help' class='onclick_node' onclick='objTelnetmanHelp.help(\"NG_message\");'></td>" +
                      "<td><textarea spellcheck='false' autocomplete='off' style='width:380px; height:65px;' name='" + this.idNgMessage + "' id='" + this.idNgMessage + "' onblur='objAction.readValue(this.id);'></textarea></td>" +
                      "</tr>" +
                      "<tr>" +
                      "<td class='right'><span class='telnetman_build_table_span0'>追加パラメーターシートA</span><img src='img/spellcheck.png' width='16' height='16' alt='help' class='onclick_node' onclick='objTelnetmanHelp.help(\"parameter1234\");'><img src='img/help.png' width='16' height='16' alt='help' class='onclick_node' onclick='objTelnetmanHelp.help(\"parameter_sheet_A\");'></td>" +
                      "<td><div id='" + objParameterSheetA.idAaaaParameterSheetArea + "'></div></td>" +
                      "</tr>" +
                      "<tr>" +
                      "<td class='right'><span class='telnetman_build_table_span0'>追加パラメーターシートB</span><img src='img/spellcheck.png' width='16' height='16' alt='help' class='onclick_node' onclick='objTelnetmanHelp.help(\"parameter1234\");'><img src='img/help.png' width='16' height='16' alt='help' class='onclick_node' onclick='objTelnetmanHelp.help(\"parameter_sheet_B\");'></td>" +
                      "<td><div id='" + objParameterSheetB.idBbbbParameterSheetArea + "'></div></td>" +
                      "</tr>" +
                      "<tr>" +
                      "<td class='right'><span class='telnetman_build_table_span1'>コマンド返り値を</span><img src='img/help.png' width='16' height='16' alt='help' class='onclick_node' onclick='objTelnetmanHelp.help(\"destroy\");'></td>" +
                      "<td>" + 
                      "<span class='middle_radio_buntton'>" +
                       "<input type='radio' name='" + this.nameDestroy + "' id='" + this.idDestroy1 + "' value='1' onchange='objAction.readDestroy(this.value);' checked><label for='" + this.idDestroy1 + "'>破棄する</label>" +
                       "<input type='radio' name='" + this.nameDestroy + "' id='" + this.idDestroy0 + "' value='0' onchange='objAction.readDestroy(this.value);'        ><label for='" + this.idDestroy0 + "'>保持する</label>" +
                      "</span>" +
                      "</td>" +
                      "</tr>" +
                      "<tr>" +
                      "<td class='center telnetman_build_table_span1'>-</td>" +
                      "<td><button class='disable' id='" + this.idBuildAreaButton + "'></button><button class='enable' onclick='objAction.initialize();'>入力欄初期化</button><button class='disable' id='" + this.idCopyButton + "'>コピー</button></td>" +
                      "</tr>" +
                      "</table>";
  
  document.getElementById("object_area").innerHTML = htmlObjectArea;
  document.getElementById("build_area").innerHTML  = htmlBuildArea;
  
  if((itemId !== null) && (itemId !== undefined) && (itemId.length > 0)){
   this.get(itemId);
   objConversionScript.getConversionScriptList();
   this.isOpened = true;
  }
  else{
   if(!this.isOpened){
    this.initialize();
    objConversionScript.getConversionScriptList();
    this.isOpened = true;
   }
   else{
    objLayoutFunctions.printAllItemSymbol("action", this.actionIdList, this.symbolList);
    this.trimConditionList();
    objConversionScript.makeConversionScriptList();
    this.insertValue();
    this.createConditionArea();
    this.changeButton();
    this.changeInputAttribute();  
    
    objParameterSheetA.trimAaaaParameterSheet();
    objParameterSheetA.createAaaaParameterSheet();
    objParameterSheetB.trimBbbbParameterSheet();
    objParameterSheetB.createBbbbParameterSheet();
    
    if(this.actionId.length > 0){
     var idSymbol = objLayoutFunctions.makeSymbolId("action", this.actionId, 0);
     objLayoutFunctions.rotateSymbol(idSymbol);
    }
   }
  }
  
  this.displayPatternMatchArea();
  
  document.getElementById(this.idActionSymbolArea).style.display = "none";
  $("#" + this.idActionSymbolArea).fadeIn(300);
  document.getElementById(this.idBuildTable).style.display = "none";
  $("#" + this.idBuildTable).fadeIn(300);                     
 };
 
 
 // 変数と画面を初期化
 this.initialize = function () {
  if(this.actionId.length > 0){
   var idSymbol = objLayoutFunctions.makeSymbolId("action", this.actionId, 0);
   objLayoutFunctions.fixSymbol(idSymbol);
  }
  
  this.operation = "create";
  this.actionId = "";
  
  this.repeatType = 1;
  this.destroy = 1;
  
  this.valueList[this.idTitle] = "";
  this.valueList[this.idKeyword] = "";
  this.valueList[this.idComment] = "{\$title}";
  this.valueList[this.idPipeType()] = 1;
  this.valueList[this.idPipeWord] = "";
  this.valueList[this.idPipeTestWord] = "";
  this.valueList[this.idPattern] = "";
  this.valueList[this.idNot] = 0;
  this.valueList[this.idOperator()] = 3;
  this.valueList[this.idCount] = 0;
  this.valueList[this.idNgMessage] = "";
  this.valueList[this.idScriptId] = "";
  this.valueList[this.idTestCommandReturn] = "";
  
  this.isTitle = false;
  
  if(objControleStorageS.getPage() === "action"){
   // 条件欄の初期化
   this.resetConditionList();
   this.conditionList[0] = new Array();
   this.conditionList[0].push("");
   
   this.insertValue();
   this.createConditionArea();
   
   this.changeButton();
   this.changeInputAttribute();
   
   // パラメーターシート作成の初期化
   objParameterSheetA.resetAaaaParameter();
   objParameterSheetA.createAaaaParameterSheet();
   objParameterSheetB.resetBbbbParameter();
   objParameterSheetB.createBbbbParameterSheet();
  }
  
  // パターンマッチ結果の削除。
  this.clearPatternMatchReturn();
 };
 
 
 // 入力欄のreadonly 属性を変更する。
 this.changeInputAttribute = function () {
  var elRepeatType1 = document.getElementById(this.idRepeatType1);
  var elRepeatType2 = document.getElementById(this.idRepeatType2);
  var elTitle       = document.getElementById(this.idTitle);
  var elKeyword     = document.getElementById(this.idKeyword);
  var elComment     = document.getElementById(this.idComment);
  var elPipeWord    = document.getElementById(this.idPipeWord);
  var elPattern     = document.getElementById(this.idPattern);
  var elScriptId    = document.getElementById(this.idScriptId);
  var elNot         = document.getElementById(this.idNot);
  var elNgMessage   = document.getElementById(this.idNgMessage);
  var elLineButton  = document.getElementById(this.idCreateNewConditionLineButton);
  var elDestroy0     = document.getElementById(this.idDestroy0);
  var elDestroy1     = document.getElementById(this.idDestroy1);
  
  if((this.operation === "create") || (this.operation === "update")){
   elRepeatType1.disabled = false;
   elRepeatType2.disabled = false;
   elTitle.readOnly       = false;
   elPipeWord.readOnly    = false;
   elPattern.readOnly     = false;
   elScriptId.disabled    = false;
   elNot.disabled         = false;
   elNgMessage.readOnly   = false;
   elDestroy0.disabled    = false;
   elDestroy1.disabled    = false;
   objLayoutFunctions.removeGrayOut(this.idTitle);
   objLayoutFunctions.removeGrayOut(this.idKeyword);
   objLayoutFunctions.removeGrayOut(this.idComment);
   objLayoutFunctions.removeGrayOut(this.idPipeWord);
   objLayoutFunctions.removeGrayOut(this.idPattern);
   objLayoutFunctions.removeGrayOut(this.idScriptId);
   objLayoutFunctions.removeGrayOut(this.idNgMessage);
   
   if(elLineButton.onclick === null){
    elLineButton.onclick = new Function("objAction.createNewConditionLine();");
   }
   
   for(var i = 0, j = this.conditionList.length; i < j; i ++){
    for(var k = 0, l = this.conditionList[i].length; k < l; k ++){
     var idCondition = this.idCondition(i, k);
     document.getElementById(idCondition).readOnly = false;
     objLayoutFunctions.removeGrayOut(idCondition);
    }
    
    var elFiledButton = document.getElementById(this.idCreateNewConditionFieldButton(i));
    if(elFiledButton.onclick === null){
     elFiledButton.onclick = new Function("objAction.createNewConditionField(" + i + ")");
    }
   }
   
   for(var num = 1; num <= 6; num ++){
    document.getElementById(this.idOperator(num)).disabled = false;
   }
   
   for(num = 1; num <= 3; num ++){
    document.getElementById(this.idPipeType(num)).disabled = false;
   }
  }
  else if(this.operation === "delete"){
   elRepeatType1.disabled = true;
   elRepeatType2.disabled = true;
   elTitle.readOnly       = true;
   elPipeWord.readOnly    = true;
   elPattern.readOnly     = true;
   elScriptId.disabled    = true;
   elNot.disabled         = true;
   elNgMessage.readOnly   = true;
   elDestroy0.disabled    = true;
   elDestroy1.disabled    = true;
   objLayoutFunctions.grayOut(this.idTitle);
   objLayoutFunctions.grayOut(this.idKeyword);
   objLayoutFunctions.grayOut(this.idComment);
   objLayoutFunctions.grayOut(this.idPipeWord);
   objLayoutFunctions.grayOut(this.idPattern);
   objLayoutFunctions.grayOut(this.idScriptId);
   objLayoutFunctions.grayOut(this.idNgMessage);
   
   if(elLineButton.onclick !== null){
    elLineButton.onclick = null;
   }
   
   for(i = 0, j = this.conditionList.length; i < j; i ++){
    for(k = 0, l = this.conditionList[i].length; k < l; k ++){
     idCondition = this.idCondition(i, k);
     document.getElementById(idCondition).readOnly = true;
     objLayoutFunctions.grayOut(idCondition);
    }
    
    elFiledButton = document.getElementById(this.idCreateNewConditionFieldButton(i));
    if(elFiledButton.onclick !== null){
     elFiledButton.onclick = null;
    }
   }
   
   for(num = 1; num <= 6; num ++){
    document.getElementById(this.idOperator(num)).disabled = true;
   }
   
   for(num = 1; num <= 3; num ++){
    document.getElementById(this.idPipeType(num)).disabled = true;
   }
  }
 };
 
 
 // 繰り返しタイプの選択を読み取る。
 this.readRepeatType = function (repeatType) {
  if(typeof(repeatType) === "string"){
   repeatType = parseInt(repeatType, 10);
  }
  
  this.repeatType = repeatType;
 };
 
 
 // コマンド返り値破棄の選択を読み取る。
 this.readDestroy = function (destroy) {
  if(typeof(destroy) === "string"){
   destroy = parseInt(destroy, 10);
  }
  
  this.destroy = destroy;
 };
 
 
 // 入力された条件を読み取る。
 this.readConditon = function (x, y) {
  var condition = document.getElementById(this.idCondition(x, y)).value;
  
  if((condition !== null) && (condition !== undefined)){
   this.conditionList[x][y] = objCommonFunctions.convertYen(condition);
  }
  else {
   this.conditionList[x][y] = "";
  }
 };
 
 
 // 入力値を読み取る。
 this.readValue = function (id) {
  var value = document.getElementById(id).value;
  
  if((value !== null) && (value !== undefined)){
   this.valueList[id] = value;
  }
  else{
   this.valueList[id] = "";
  }
 };
 
 
 // 個数条件の演算子を読み取る。
 this.readOperator = function (id) {
  var value = document.getElementById(id).value;
  var name  = this.idOperator();
  
  if((value !== null) && (value !== undefined)){
   value = parseInt(value, 10);
   this.valueList[name] = value;
  }
  else{
   this.valueList[name] = "";
  }
 };
 
 
 // pipe type を読み取る。
 this.readPipeType = function (id) {
  var value = document.getElementById(id).value;
  var name  = this.idPipeType();
  
  if((value !== null) && (value !== undefined)){
   value = parseInt(value, 10);
   this.valueList[name] = value;
   
   this.writePipeType(value);
  }
  else{
   this.valueList[name] = "";
   this.writePipeType(0);
  }
 };
 
 this.writePipeType = function (pipeType){
  var pipeTypeString = "";
  if(pipeType === 1){
   pipeTypeString = "include";
  }
  else if(pipeType === 2){
   pipeTypeString = "exclude";
  }
  else if(pipeType === 3){
   pipeTypeString = "begin";
  }
  
  document.getElementById(this.idPipeTestType).innerHTML = pipeTypeString;
 };
 
 
 // 条件反転を読み取る。
 this.readNot = function (){
  var not = document.getElementById(this.idNot).checked;
  
  if(not){
   this.valueList[this.idNot] = 1;
  }
  else{
   this.valueList[this.idNot] = 0;
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
 
 
 // 入力欄に値を入れる。
 this.insertValue = function () {
  var elSearchKeyword = document.getElementById(this.idSearchKeyword);
  elSearchKeyword.value = this.valueSearchKeyword;
  
  var elSearchTitle = document.getElementById(this.idSearchTitle);
  elSearchTitle.value = this.valueSearchTitle;
  
  if(this.repeatType === 1){
   document.getElementById(this.idRepeatType2).checked = false;
   document.getElementById(this.idRepeatType1).checked = true;
  }
  else{
   document.getElementById(this.idRepeatType1).checked = false;
   document.getElementById(this.idRepeatType2).checked = true;
  }
  
  document.getElementById(this.idTitle).value        = this.valueList[this.idTitle];
  document.getElementById(this.idKeyword).value      = this.valueList[this.idKeyword];
  document.getElementById(this.idComment).value      = this.valueList[this.idComment];
  document.getElementById(this.idPipeWord).value     = this.valueList[this.idPipeWord];
  document.getElementById(this.idPipeTestWord).value = this.valueList[this.idPipeTestWord];
  document.getElementById(this.idPattern).value      = this.valueList[this.idPattern];
  document.getElementById(this.idCount).value        = this.valueList[this.idCount];
  document.getElementById(this.idNgMessage).value    = this.valueList[this.idNgMessage];
  document.getElementById(this.idTestCommandReturn).value = this.valueList[this.idTestCommandReturn];
  
  var scriptOptionList = document.getElementById(this.idScriptId).options;
  for(var i = 0, j = scriptOptionList.length; i < j; i ++){
   if(scriptOptionList[i].value === this.valueList[this.idScriptId]){
    scriptOptionList[i].selected = true;
   }
   else{
    scriptOptionList[i].selected = false;
   }
  }
  
  if(this.valueList[this.idNot] === 1){
   document.getElementById(this.idNot).checked = true;
  }
  else{
   document.getElementById(this.idNot).checked = false;
  }
  
  for(var num = 1; num <= 6; num ++){
   document.getElementById(this.idOperator(num)).checked = false;
  }
  document.getElementById(this.idOperator(this.valueList[this.idOperator()])).checked = true;
  
  for(num = 1; num <= 3; num ++){
   document.getElementById(this.idPipeType(num)).checked = false;
  }
  document.getElementById(this.idPipeType(this.valueList[this.idPipeType()])).checked = true;
  this.writePipeType(this.valueList[this.idPipeType()]);
  
  if(this.destroy === 1){
   document.getElementById(this.idDestroy0).checked = false;
   document.getElementById(this.idDestroy1).checked = true;
  }
  else{
   document.getElementById(this.idDestroy1).checked = false;
   document.getElementById(this.idDestroy0).checked = true;
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
  
  if(this.isTitle){
   elButton.className = "enable";
   elButton.onclick = new Function("objAction.createUpdateDelete();");
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
   elCopyButton.onclick = new Function("objAction.copy();");
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
  
  if(this.actionId.length > 0){
   var idSymbol = objLayoutFunctions.makeSymbolId("action", this.actionId, 0);
   objLayoutFunctions.fixSymbol(idSymbol);
  }
  
  this.actionId = "";
 };
 
 
 // 条件入力欄全体を作る。
 this.createConditionArea = function () {
  if(!document.getElementById(this.idCreateNewConditionLineButton)){
   var elImgDown = document.createElement("img");
   elImgDown.setAttribute("src", "img/arrow_down.png");
   elImgDown.setAttribute("width", "16");
   elImgDown.setAttribute("height", "16");
   elImgDown.setAttribute("alt", "append condition");
   elImgDown.setAttribute("class", "onclick_node");
   elImgDown.setAttribute("id", this.idCreateNewConditionLineButton);
   elImgDown.onclick = new Function("objAction.createNewConditionLine();");
   
   var elConditionArea = document.getElementById(this.idConditionArea);
   elConditionArea.appendChild(elImgDown);
  }
  
  for(var i = 0, j = this.conditionList.length; i < j; i ++){
   this.appendConditionLine(i);
   
   for(var k = 0, l = this.conditionList[i].length; k < l; k ++){
    var condition = this.conditionList[i][k];
    
    this.appendConditionField(i, k);
    document.getElementById(this.idCondition(i, k)).value = condition;
   }
  }
 };
 
 
 // 条件入力欄とthis.conditionList() を空にする。
 this.resetConditionList = function () {
  var elConditionArea = document.getElementById(this.idConditionArea);
  var elConditionLineList = elConditionArea.childNodes;
  
  for(var i = elConditionLineList.length - 1; i >= 0; i --){
   elConditionArea.removeChild(elConditionLineList[i]);
  }
  
  for(i = this.conditionList.length - 1; i >= 0; i --){
   var lengthConditionList = this.conditionList[i].length;
   this.conditionList[i].splice(0, lengthConditionList);
  }
  
  lengthConditionList = this.conditionList.length;
  this.conditionList.splice(0, lengthConditionList);
 };
 
 
 // 条件欄1つを加える。
 this.appendConditionField = function (x, y) {
  var elInput = document.createElement("input");
  elInput.setAttribute("type", "text");
  elInput.style.width = "150px";
  elInput.setAttribute("spellcheck", "false");
  elInput.setAttribute("autocomplete", "off");
  elInput.setAttribute("id", this.idCondition(x, y));
  elInput.setAttribute("value", "");
  elInput.onblur = new Function("objAction.readConditon(" + x + "," + y + ")");
  
  var elConditionLine = document.getElementById(this.idConditionLine(x));
  var elImgRight = document.getElementById(this.idCreateNewConditionFieldButton(x));
  
  elConditionLine.insertBefore(elInput, elImgRight);
  
  // 横幅の調整
  var width = this.conditionList[x].length * 134 + 32;
  elConditionLine.style.width = width + "px";
 };
 
 
 // 条件入力欄を1行加える。
 this.appendConditionLine = function (x) {
  var elDiv = document.createElement("div");
  elDiv.className = "margin2";
  elDiv.setAttribute("id", this.idConditionLine(x));
  
  var elImgRight = document.createElement("img");
  elImgRight.setAttribute("src", "img/arrow_right.png");
  elImgRight.setAttribute("width", "16");
  elImgRight.setAttribute("height", "16");
  elImgRight.setAttribute("alt", "append condition");
  elImgRight.setAttribute("class", "onclick_node");
  elImgRight.setAttribute("id", this.idCreateNewConditionFieldButton(x));
  elImgRight.onclick = new Function("objAction.createNewConditionField(" + x + ")");
  
  elDiv.appendChild(elImgRight);
  
  var elConditionArea = document.getElementById(this.idConditionArea);
  var elConditionNewLineButton = document.getElementById(this.idCreateNewConditionLineButton);
  
  elConditionArea.insertBefore(elDiv, elConditionNewLineButton);
 };
 
 
 // this.conditionList の1要素に空のデータを入れる。
 this.pushEmptyCondition = function (x) {
  this.conditionList[x].push("");
 };
 
 
 // this.conditionList に空のデータを入れる。
 this.pushEmptyLine = function (x) {
  this.conditionList[x] = new Array();
 };
 
 
 // 新しい条件行を追加する。
 this.createNewConditionLine = function () {
  x = this.conditionList.length;
  
  this.pushEmptyLine(x);
  this.pushEmptyCondition(x);
  this.appendConditionLine(x);
  this.appendConditionField(x, 0);
 };
 
 
 // 新しい入力欄を作る。
 this.createNewConditionField = function (x) {
  var y = this.conditionList[x].length;
  
  this.pushEmptyCondition(x);
  this.appendConditionField(x, y);
 };
 
 
 // this.conditionList の空白要素、空白行を取り除く。
 this.trimConditionList = function () {
  for(var i = this.conditionList.length - 1; i >= 0; i --){
   for(var j = this.conditionList[i].length - 1; j >= 0; j --){
    this.conditionList[i][j] = this.conditionList[i][j].replace(/^\s+/, "");
    this.conditionList[i][j] = this.conditionList[i][j].replace(/\s+$/, "");
    
    if(this.conditionList[i][j].length === 0){
     this.conditionList[i].splice(j, 1);
    }
   }
   
   if(this.conditionList[i].length === 0){
    this.conditionList.splice(i, 1);
   }
  }
  
  if(this.conditionList.length === 0){
   this.conditionList[0] = new Array();
   this.conditionList[0].push("");
  }
 };
 
 
 // 新規作成、更新、削除。
 this.createUpdateDelete = function () {
  var authHeader = makeAuthHeader();
  
  this.trimConditionList();
  var jsonConditionList = JSON.stringify(this.conditionList);
  
  objParameterSheetA.trimAaaaParameterSheet();
  var jsonParameterSheetA = JSON.stringify(objParameterSheetA.aaaaParameterSheet);
  
  objParameterSheetB.trimBbbbParameterSheet();
  var jsonParameterSheetB = JSON.stringify(objParameterSheetB.bbbbParameterSheet);
  
  var pattern = this.valueList[this.idPattern];
  pattern = pattern.replace(/\r/g, "");
  pattern = pattern.replace(/\n+/g, "\n");
  
  $.ajax({
   headers : {"telnetmanAuth" : authHeader},
   type : "post",
   url  : "/cgi-bin/Telnetman2/action.cgi",
   data : {
    "action_id"      : this.actionId,
    "operation"      : this.operation,
    "repeat_type"    : this.repeatType,
    "title"          : objCommonFunctions.convertYen(this.valueList[this.idTitle]),
    "keyword"        : objCommonFunctions.convertYen(this.valueList[this.idKeyword]),
    "comment"        : objCommonFunctions.convertYen(this.valueList[this.idComment]),
    "pattern"        : objCommonFunctions.convertYen(pattern),
    "pipe_type"      : this.valueList[this.idPipeType()],
    "pipe_word"      : objCommonFunctions.convertYen(this.valueList[this.idPipeWord]),
    "ng_message"     : objCommonFunctions.convertYen(this.valueList[this.idNgMessage]),
    "script_id"      : this.valueList[this.idScriptId],
    "json_condition" : jsonConditionList,
    "not"            : this.valueList[this.idNot],
    "operator"       : this.valueList[this.idOperator()],
    "count"          : this.valueList[this.idCount],
    "json_parameter_sheet_a" : jsonParameterSheetA,
    "json_parameter_sheet_b" : jsonParameterSheetB,
    "destroy"        : this.destroy
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
         var operation  = hashResult["operation"];
         var actionId   = hashResult["action_id"];
         var repeatType = hashResult["repeat_type"];
         var title      = hashResult["title"];
         
         var idSymbol = objLayoutFunctions.makeSymbolId("action", actionId, 0);
         
         if(operation === "create"){
          objAction.appendActionSymbolData(actionId, title, repeatType);
          objLayoutFunctions.appendItemSymbol("action", title, repeatType, idSymbol);
          
          // フローチャートのページにもシンボルを追加する。
          objFlowchart.appendSymbolData("action", actionId, title, repeatType);
         }
         else if(operation === "update"){
          $("#" + idSymbol).effect('pulsate', '', 1000, function(){
           objAction.symbolList[actionId]["title"] = title;
           objAction.symbolList[actionId]["repeat_type"] = repeatType;
           
           var elDiv = document.getElementById(idSymbol);
           
           var divClassName  = objLayoutFunctions.makeSymbolClassName("action", repeatType);
           var spanClassName = objLayoutFunctions.makeSymbolTitleClassName("action", repeatType);
           
           elDiv.className = divClassName;
           elDiv.childNodes[0].className = spanClassName;
           elDiv.childNodes[0].innerHTML = objCommonFunctions.escapeHtml(title);
          });
          
          // フローチャートのページのシンボルも更新する。
          objFlowchart.updateSymbolData("action", actionId, title, repeatType);
         }
         else if(operation === "delete"){
          for(var i = 0, j = objAction.actionIdList.length; i < j; i ++){
           var shiftActionId = objAction.actionIdList.shift();
           if(shiftActionId !== actionId){
            objAction.actionIdList.push(shiftActionId);
           }
           else{
            i --;
            j --;
           }
          }
          
          delete(objAction.symbolList[actionId]);
          
          $("#" + idSymbol).effect('puff', '', 500, function(){
           var elDiv = document.getElementById(idSymbol);
           document.getElementById(objAction.idActionSymbolArea).removeChild(elDiv);
          });
          
          // フローチャートのページのシンボルも削除する。
          objFlowchart.removeSymbolData("action", actionId);
         }
         
         objAction.initialize();
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
 this.getActionData = function (actionId, operation) {
  // 流れ図画面とExport画面の右クリックで呼び出されたら終了。
  if((objControleStorageL.getPage() === "flowchart") && (operation === "delete")){
   return(false);
  }
  else if((objControleStorageL.getPage() === "export_import") && (operation === "delete")){
   return(false);
  }
  
  if((objControleStorageL.getPage() === "action") && (this.actionId.length > 0)){
   var idSymbol = objLayoutFunctions.makeSymbolId("action", this.actionId, 0);
   objLayoutFunctions.fixSymbol(idSymbol);
  }
  
  var authHeader = makeAuthHeader();
  
  $.ajax({
   headers : {"telnetmanAuth" : authHeader},
   type : "post",
   url  : "/cgi-bin/Telnetman2/get_item_data.cgi",
   data : {
    "item_type" : "action",
    "item_id"   : actionId,
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
         if(objControleStorageL.getPage() === "action"){// action 登録画面を開いている時
          objAction.operation  = hashResult["operation"];
          objAction.repeatType = hashResult["repeat_type"];
          objAction.actionId   = hashResult["item_id"];
          objAction.destroy    = hashResult["destroy"];
          objAction.valueList[objAction.idTitle]       = hashResult["title"];
          objAction.valueList[objAction.idKeyword]     = hashResult["keyword"];
          objAction.valueList[objAction.idComment]     = hashResult["comment"];
          objAction.valueList[objAction.idPattern]     = hashResult["pattern"];
          objAction.valueList[objAction.idPipeType()]  = hashResult["pipe_type"];
          objAction.valueList[objAction.idPipeWord]    = hashResult["pipe_word"];
          objAction.valueList[objAction.idScriptId]    = hashResult["script_id"];
          objAction.valueList[objAction.idNot]         = hashResult["not"];
          objAction.valueList[objAction.idOperator()]  = hashResult["operator"];
          objAction.valueList[objAction.idCount]       = hashResult["count"];
          objAction.valueList[objAction.idNgMessage]   = hashResult["ng_message"];
          
          // 条件欄の入れ替え。
          var jsonCondition = hashResult["json_condition"];
          var conditionList = JSON.parse(jsonCondition);
          objAction.resetConditionList();
          for(var i = 0, j = conditionList.length; i < j; i ++){
           objAction.conditionList[i] = new Array();
           for(var k = 0, l = conditionList[i].length; k < l; k ++){
            var condition = conditionList[i][k];
            objAction.conditionList[i].push(condition);
           }
          }
          
          // パラメーターシート作成(A)の入れ替え。
          var jsonParameterSheetA = hashResult["json_parameter_sheet_a"];
          var parameterSheetA = JSON.parse(jsonParameterSheetA);
          objParameterSheetA.resetAaaaParameter();
          for(i = 0, j = parameterSheetA.length; i < j; i ++){
           objParameterSheetA.aaaaParameterSheet[i] = new Array();
           var parameterNode  = parameterSheetA[i][0];
           var parameterName  = parameterSheetA[i][1];
           var parameterValue = parameterSheetA[i][2];
           
           objParameterSheetA.aaaaParameterSheet[i][0] = parameterNode;
           objParameterSheetA.aaaaParameterSheet[i][1] = parameterName;
           objParameterSheetA.aaaaParameterSheet[i][2] = parameterValue;
          }
          
          // パラメーターシート作成(B)の入れ替え。
          var jsonParameterSheetB = hashResult["json_parameter_sheet_b"];
          var parameterSheetB = JSON.parse(jsonParameterSheetB);
          objParameterSheetB.resetBbbbParameter();
          for(i = 0, j = parameterSheetB.length; i < j; i ++){
           objParameterSheetB.bbbbParameterSheet[i] = new Array();
           parameterNode  = parameterSheetB[i][0];
           var bbbbValue  = parameterSheetB[i][1];
           parameterName  = parameterSheetB[i][2];
           parameterValue = parameterSheetB[i][3];
           
           objParameterSheetB.bbbbParameterSheet[i][0] = parameterNode;
           objParameterSheetB.bbbbParameterSheet[i][1] = bbbbValue;
           objParameterSheetB.bbbbParameterSheet[i][2] = parameterName;
           objParameterSheetB.bbbbParameterSheet[i][3] = parameterValue;
          }
          
          objAction.insertValue();
          objAction.createConditionArea();
          objParameterSheetA.createAaaaParameterSheet();
          objParameterSheetB.createBbbbParameterSheet();
          objAction.isTitle     = true;
          objAction.changeButton();
          objAction.changeInputAttribute();
          
          // 前回のパターンマッチ結果を削除する。
          objAction.clearPatternMatchReturn();
          
          document.getElementById(objAction.idPatternMatchMessage).innerHTML = "";
          
          var idSymbol = objLayoutFunctions.makeSymbolId("action", objAction.actionId, 0);
          objLayoutFunctions.rotateSymbol(idSymbol);
         }
         else{// 流れ図画面を開いている時
          var itemId = hashResult["item_id"];
          var repeatType  = hashResult["repeat_type"];
          var repeatTypeText = "";
          if(repeatType === 1){
           repeatTypeText = "1回のみ";
          }
          else if(repeatType === 2){
           repeatTypeText = "繰り返し";
          }
          
          var destroy = hashResult["destroy"];
          var destroyHtml = "";
          if(destroy === 1){
           destroyHtml = "破棄する";
          }
          else if(destroy === 0){
           destroyHtml = "保持する";
          }
          
          var ownerName   = objCommonFunctions.escapeHtml(hashResult["owner_name"]);
          var changerName = objCommonFunctions.escapeHtml(hashResult["changer_name"]);
          var createTime  = hashResult["create_time"];
          var updateTime  = hashResult["update_time"];
          var title     = objCommonFunctions.escapeHtml(hashResult["title"]);
          var keyword   = objCommonFunctions.escapeHtml(hashResult["keyword"]);
          var comment   = objCommonFunctions.escapeHtml(hashResult["comment"]);
          var pattern   = objCommonFunctions.escapeHtml(hashResult["pattern"]);
          var pipeType  = hashResult["pipe_type"];
          var pipeWord  = objCommonFunctions.escapeHtml(hashResult["pipe_word"]);
          var scriptId  = objCommonFunctions.escapeHtml(hashResult["script_id"]);
          var not       = hashResult["not"];
          var operator  = hashResult["operator"];
          var count     = hashResult["count"];
          var ngMessage = objCommonFunctions.escapeHtml(hashResult["ng_message"]);
          
          comment  = comment.replace(/\n/g, "<br>");
          pattern  = pattern.replace(/\n/g, "<br>");
          pipeWord = pipeWord.replace(/\n/g, "<br>");
          ngMessage = ngMessage.replace(/\n/g, "<br>");
          
          jsonCondition = hashResult["json_condition"];
          conditionList = JSON.parse(jsonCondition);
          var conditionListHtml = "";
          for(i = 0, j = conditionList.length; i < j; i ++){
           if(i !== 0){
            conditionListHtml += "<br><span class='and_or'>or</span><br>";
           }
           
           for(k = 0, l = conditionList[i].length; k < l; k ++){
            conditionList[i][k] = objCommonFunctions.escapeHtml(conditionList[i][k]);
           }
           
           conditionListHtml += "<span>(" + conditionList[i].join(")</span><span class='and_or'>and</span><span>(") + ")</span>";
          }
          
          jsonParameterSheetA = hashResult["json_parameter_sheet_a"];
          parameterSheetA = JSON.parse(jsonParameterSheetA);
          var parameterSheetAaaaHtml = "";
          for(i = 0, j = parameterSheetA.length; i < j; i ++){
           if((parameterSheetA[i][0] === null) || (parameterSheetA[i][0] === undefined) || (parameterSheetA[i][0].length === 0)){
            continue;
           }
           
           if(i !== 0){
            parameterSheetAaaaHtml += "<br>";
           }
           
           parameterSheetAaaaHtml += "<span>" + objCommonFunctions.escapeHtml(parameterSheetA[i][0]) + "&nbsp;&rarr;&nbsp;" + objCommonFunctions.escapeHtml(parameterSheetA[i][1]) + "&nbsp;=&nbsp;" + objCommonFunctions.escapeHtml(parameterSheetA[i][2]) + "</span>";
          }
          
          jsonParameterSheetB = hashResult["json_parameter_sheet_b"];
          parameterSheetB = JSON.parse(jsonParameterSheetB);
          var parameterSheetBbbbHtml = "";
          for(i = 0, j = parameterSheetB.length; i < j; i ++){
           if((parameterSheetB[i][0] === null) || (parameterSheetB[i][0] === undefined) || (parameterSheetB[i][0].length === 0) || (parameterSheetB[i][1] === null) || (parameterSheetB[i][1] === undefined) || (parameterSheetB[i][1].length === 0)){
            continue;
           }
           
           if(i !== 0){
            parameterSheetBbbbHtml += "<br>";
           }
           
           parameterSheetBbbbHtml += "<span>" + objCommonFunctions.escapeHtml(parameterSheetB[i][0]) + "&nbsp;&rarr;&nbsp;" + objCommonFunctions.escapeHtml(parameterSheetB[i][1]) + "&nbsp;&rarr;&nbsp;" + objCommonFunctions.escapeHtml(parameterSheetB[i][2]) + "&nbsp;=&nbsp;" + objCommonFunctions.escapeHtml(parameterSheetB[i][3]) + "</span>";
          }
          
          var spanScript = "";
          if(scriptId.length > 0){
           spanScript = "<span class='onclick_node' onclick='objConversionScript.downloadConversionScript(\"" + scriptId + "\");'>" + scriptId + ".pl</span>";
          }
          
          var htmlNot = "";
          if(not === 1){
           htmlNot = "<span class='bold red'>!</span>";
          }
          
          var countCondition = "";
          if(operator === 1){
           countCondition = "==";
          }
          else if(operator === 2){
           countCondition = "!=";
          }
          else if(operator === 3){
           countCondition = ">";
          }
          else if(operator === 4){
           countCondition = ">=";
          }
          else if(operator === 5){
           countCondition = "<";
          }
          else if(operator === 6){
           countCondition = "<=";
          }
          countCondition += "&nbsp;" + count;
          
          var pipeTypeValue = "";
          if(pipeType === 1){
           pipeTypeValue = "include";
          }
          else if(pipeType === 2){
           pipeTypeValue = "exclude";
          }
          else if(pipeType === 3){
           pipeTypeValue = "begin";
          }
          
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
                     "<th colspan='2'><div><span>アクション</span><img src='img/cancel.png' width='16' height='16' alt='cancel' onclick='objLayoutFunctions.removeScrollEvent(); objLayoutFunctions.removeItemViewTable();'></div></th>" +
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
                     "<td class='left'><span class='onclick_node' onclick='objAction.print(\"" + itemId + "\"); objLayoutFunctions.removeItemViewTable();'>" + title + "</span></td>" +
                     "</tr>" +
                     "<tr>" +
                     "<td class='right telnetman_item_viewer_td1'><span class='telnetman_item_viewer_span1'>検索キーワード</span></td>" +
                     "<td class='left'><span class='telnetman_item_viewer_span2'>" + keyword + "</span></td>" +
                     "</tr>" +
                     "<tr>" +
                     "<td class='right telnetman_item_viewer_td1'><span class='telnetman_item_viewer_span1'>コメント</span></td>" +
                     "<td class='left'><span class='telnetman_item_viewer_span2'>" + comment + "</span></td>" +
                     "</tr>";
          if(pipeWord.length > 0){           
           html +=   "<tr>" +
                     "<td class='right telnetman_item_viewer_td1'><span class='telnetman_item_viewer_span1'>" + pipeTypeValue + "</span></td>" +
                     "<td class='left'><span class='telnetman_item_viewer_span2'>" + pipeWord + "</span></td>" +
                     "</tr>";                 
          }
          html +=    "<tr>" +
                     "<td class='right telnetman_item_viewer_td1'><span class='telnetman_item_viewer_span1'>抽出パターン</span></td>" +
                     "<td class='left'><span class='telnetman_item_viewer_span2'>" + pattern + "</span></td>" +
                     "</tr>" +
                     "<tr>" +
                     "<td class='right telnetman_item_viewer_td1'><span class='telnetman_item_viewer_span1'>変換スクリプト</span></td>" +
                     "<td class='left'>" + spanScript + "</td>" +
                     "</tr>" +
                     "<tr>" +
                     "<td class='right telnetman_item_viewer_td1'>" + htmlNot + "<span class='telnetman_item_viewer_span1'>分岐条件</span></td>" +
                     "<td class='left'><div class='telnetman_item_viewer_condition_list'>" + conditionListHtml + "</div></td>" +
                     "</tr>" +
                     "<tr>" +
                     "<td class='right telnetman_item_viewer_td1'><span class='telnetman_item_viewer_span1'>個数条件</span></td>" +
                     "<td class='left'><span class='telnetman_item_viewer_span2'>{\$n}&nbsp;" + countCondition + "</span></td>" +
                     "</tr>" +
                     "<tr>" +
                     "<td class='right telnetman_item_viewer_td1'><span class='telnetman_item_viewer_span1'>NG&nbsp;メッセージ</span></td>" +
                     "<td class='left'><span class='telnetman_item_viewer_span2'>" + ngMessage + "</span></td>" +
                     "</tr>" +
                     "<tr>" +
                     "<td class='right telnetman_item_viewer_td1'><span class='telnetman_item_viewer_span1'>追加パラメーターシートA</span></td>" +
                     "<td class='left'><div class='telnetman_item_viewer_condition_list'>" + parameterSheetAaaaHtml + "</div></td>" +
                     "</tr>" +
                     "<tr>" +
                     "<td class='right telnetman_item_viewer_td1'><span class='telnetman_item_viewer_span1'>追加パラメーターシートB</span></td>" +
                     "<td class='left'><div class='telnetman_item_viewer_condition_list'>" + parameterSheetBbbbHtml + "</div></td>" +
                     "</tr>" +
                     "<tr>" +
                     "<td class='right telnetman_item_viewer_td1'><span class='telnetman_item_viewer_span1'>コマンド返り値を</span></td>" +
                     "<td class='left'><span class='telnetman_item_viewer_span2'>" + destroyHtml + "</span></td>" +
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
 
 
 // スクリプトのoption を1つ作って加える。
 this.appendConversionScriptOption = function (scriptId) {
  var elOption = document.createElement("option");
  elOption.setAttribute("value", scriptId);
  elOption.innerHTML = scriptId + ".pl";
  
  document.getElementById(this.idScriptId).appendChild(elOption);
 };
 
 
 // 選択中のスクリプトが削除されたらoption のselected 対象から外す。
 this.unsetConversionScript = function(scriptId){
  if(scriptId === this.valueList[this.idScriptId]){
   this.valueList[this.idScriptId] = "";
  }
 };
 
 
 // コマンド結果のパターンマッチテスト
 this.patternMatchTest = function () {
  var authHeader = makeAuthHeader();
  
  var pattern = this.valueList[this.idPattern];
  pattern = pattern.replace(/\r/g, "");
  pattern = pattern.replace(/\n+/g, "\n");
  
  var pipeType = this.valueList[this.idPipeType()];
  var pipeWord = this.valueList[this.idPipeTestWord];
  
  if(this.valueList[this.idTestCommandReturn].length > 0){
   $.ajax({
    headers : {"telnetmanAuth" : authHeader},
    type : "post",
    url  : "/cgi-bin/Telnetman2/pattern_match_test.cgi",
    data : {
     "command_return" : objCommonFunctions.convertYen(this.valueList[this.idTestCommandReturn]),
     "pattern"        : objCommonFunctions.convertYen(pattern),
     "pipe_type"      : pipeType,
     "pipe_word"      : objCommonFunctions.convertYen(pipeWord)
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
          // 前回のパターンマッチ結果を削除する。
          objAction.clearPatternMatchReturn();
          
          var values = hashResult["values"];
          var numberOfValues = values.length;
          
          // 結果のメッセージを表示する。
          document.getElementById(objAction.idPatternMatchMessage).innerHTML = numberOfValues + " 個パターンマッチしました。";
          
          for(i = 0; i < numberOfValues; i ++){
           var size = values[i].length + 1;
           
           var elInput = document.createElement("input");
           elInput.setAttribute("type", "text");
           elInput.setAttribute("spellcheck", "false");
           elInput.setAttribute("size", size);
           elInput.readOnly = true;
           
           var elPValues = document.getElementById(objAction.idPatternMatchValues);
           elPValues.appendChild(elInput);
           elInput.value = values[i];
          }
         }
         else{
          // 前回のパターンマッチ結果を削除する。
          elPValues = document.getElementById(objAction.idPatternMatchValues);
          elInputValueList = elPValues.childNodes;
          for(i = elInputValueList.length - 1; i >= 0; i --){
           elPValues.removeChild(elInputValueList[i]);
          }
          
          document.getElementById(objAction.idPatternMatchMessage).innerHTML = "";
          
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
  }
  else{
   alert("試験用のコマンド結果を記入して下さい。");
  }
 };
 
 
 // パターンマッチエリアの表示、非表示
 this.displayPatternMatchArea = function (){
  var elPatternMatchTestArea = document.getElementById(this.idPatternMatchTestArea);
  var elTogglePatternMatchTestAreaButton = document.getElementById(this.idTogglePatternMatchTestAreaButton);
  
  if(this.isPattermatchTestArea){
   elPatternMatchTestArea.style.display = "block";
   elTogglePatternMatchTestAreaButton.innerHTML = "&#9650;";
  }
  else{
   elPatternMatchTestArea.style.display = "none";
   elTogglePatternMatchTestAreaButton.innerHTML = "&#9660;";
  }
 };
 
 
 // パターンマッチエリアの表示、非表示を切り替える。
 this.toggleMatchTestArea = function () {
  var elTogglePatternMatchTestAreaButton = document.getElementById(this.idTogglePatternMatchTestAreaButton);
  
  if(this.isPattermatchTestArea){
   this.isPattermatchTestArea = false;
   elTogglePatternMatchTestAreaButton.innerHTML = "&#9660;";
  }
  else{
   this.isPattermatchTestArea = true;
   elTogglePatternMatchTestAreaButton.innerHTML = "&#9650;";
  }
  
  $("#" + this.idPatternMatchTestArea).toggle("show");
 };
 
 // パターンマッチ結果を削除する。
 this.clearPatternMatchReturn = function (){
  document.getElementById(this.idPatternMatchMessage).innerHTML = "";
  
  var elPValues = document.getElementById(this.idPatternMatchValues);
  var elInputValueList = elPValues.childNodes;
  for(var i = elInputValueList.length - 1; i >= 0; i --){
   elPValues.removeChild(elInputValueList[i]);
  }
 };
 
 return(this);
}
