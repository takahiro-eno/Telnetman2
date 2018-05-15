// 説明   : フローチャート作成画面。
// 作成日 : 2014/07/07
// 作成者 : 江野高広
// 更新日 : 2014/10/24 ルーチンの更新ボタンを廃止し、変更時に自動的に保存されるようにした。
// 更新   : 2017/09/14 Ver.2 向けに大幅改造。

var objFlowchart = new flowchart();

function flowchart () {
 // D & D されたシンボルの下にあるシンボルのid を記録する。
 this.idNextSymbol = "";
 
 this.isOpened = false;
 this.selectedItemType = "command";
 this.selectedRoutine = 0;
 
 this.mainRoutine = new Array();
 this.mainRoutineType  = 1;
 this.mainRoutineTitle = "";
 this.subRoutine  = new Object();
 
 this.itemIdList = new Object();
 this.itemIdList["sub"]     = new Array();
 this.itemIdList["jumper"]  = new Array();
 this.itemIdList["command"] = new Array();
 this.itemIdList["action"]  = new Array();
 this.itemIdList["ping"]    = new Array();
 
 this.symbolList = new Object();
 this.symbolList["sub"]     = new Object();
 this.symbolList["jumper"]  = new Object();
 this.symbolList["command"] = new Object();
 this.symbolList["action"]  = new Object();
 this.symbolList["ping"]    = new Object();
                
 this.serialNumberList = new Object();
 this.serialNumberList["sub"]     = new Object();
 this.serialNumberList["jumper"]  = new Object();
 this.serialNumberList["command"] = new Object();
 this.serialNumberList["action"]  = new Object();
 this.serialNumberList["ping"]    = new Object();
 
 this.numberOfLoadingSubroutine = 0;
 
 // id
 this.idPrefix = "flowchart_";
 
 this.idAllItemSymbolArea = this.idPrefix + "all_item_symbol_area";
 this.nameItemType = this.idPrefix + "item_type";
 this.idItemType = new Object();
 
 this.nameFlowchartType      = this.idPrefix + "flowchart_type";
 this.idFlowchartTypeBefore  = this.idPrefix + "flowchart_type_before";
 this.idFlowchartTypeMiddle  = this.idPrefix + "flowchart_type_middle";
 this.idFlowchartTypeAfter   = this.idPrefix + "flowchart_type_after";
 this.idFlowchartTitleBefore = this.idPrefix + "flowchart_title_before";
 this.idFlowchartTitleMiddle = this.idPrefix + "flowchart_title_middle";
 this.idFlowchartTitleAfter  = this.idPrefix + "flowchart_title_after";
 
 this.idSquaresArea   = this.idPrefix + "squares_area";
 this.idSearchKeyword = this.idPrefix + "search_keyword";
 this.idSearchTitle   = this.idPrefix + "search_title";
 this.idSearchButton  = this.idPrefix + "search_button";
 this.idRestButton    = this.idPrefix + "reset_button";
 this.idClearButton   = this.idPrefix + "clear_button";
 
 this.idFlowchartDataJsonFileName  = this.idPrefix + "flowchart_data_json_file_name";
 this.idModRoutineArea = this.idPrefix + "mod_routine_area";
 this.nameRoutineType  = this.idPrefix + "routine_type";
 this.idRoutineType1   = this.idPrefix + "routine_type_1";
 this.idRoutineType2   = this.idPrefix + "routine_type_2";
 this.idRoutineTitle   = this.idPrefix + "routine_title";
 this.idLoopType       = this.idPrefix + "loop_type";
 
 this.idDownloadFlowchartData  = this.idPrefix + "download_flowchart_data";
 this.idDownloadSubroutineData = this.idPrefix + "download_subroutine_data";
 this.idRoutineLabelArea = this.idPrefix + "routine_label_area";
 this.idRemoveButton = this.idPrefix + "remove_button";
 this.idCreateButton = this.idPrefix + "create_button";
 this.nameRoutineRadio = this.idPrefix + "routine_radio";
 this.idRoutineRadio = function (routineIndex) {
  return(this.idPrefix + "routine_radio_" + routineIndex);
 };
 this.idRoutineLabel = function (routineIndex) {
  return(this.idPrefix + "routine_label_" + routineIndex);
 };
 this.idSpanDownloadSubroutineData = this.idPrefix + "download_subroutine_data";
 
 // シンボルエリアのID
 this.idItemSymbolArea = new Object();
 
  // 流れ図table のid
 this.idFlowchartTable = function (routineIndex){
  return(this.idPrefix + "table_" + routineIndex);
 };
 
 // 右クリックメニュー
 this.idConTextMenu = this.idPrefix + "context_menu";
 
 // 入力欄の内容
 this.valueSearchKeyword = "";
 this.valueSearchTitle = "";
 
 this.valueRoutineType = 1;
 this.valueRoutineTitle = "";
 
 this.valueLoopType = 0;
 
 // 流れ図データのファイル名。
 this.flowchartDataJsonFileName = new Object();
 this.flowchartDataJsonFileName["before"] = "";
 this.flowchartDataJsonFileName["middle"]   = "";
 this.flowchartDataJsonFileName["after"]  = "";
 
 // ジャンパーリストを作成する。
 this.makeJumperList = function () {
  this.itemIdList["jumper"].push("1", "2", "3", "4", "5", "6");
  
  // repeat_type の値をJumper のID とする。
  this.symbolList["jumper"]["1"] = new Object();
  this.symbolList["jumper"]["1"]["repeat_type"] = 1;
  this.symbolList["jumper"]["1"]["title"] = "<img src='img/jumper_1.png' width='32' height='72' alt='down'>";
  this.symbolList["jumper"]["1"]["serial_number"] = this.getSerialNumber("jumper", "1");
  
  this.symbolList["jumper"]["2"] = new Object();
  this.symbolList["jumper"]["2"]["repeat_type"] = 2;
  this.symbolList["jumper"]["2"]["title"] = "<img src='img/jumper_2.png' width='196' height='32' alt='right'>";
  this.symbolList["jumper"]["2"]["serial_number"] = this.getSerialNumber("jumper", "2");
  
  this.symbolList["jumper"]["3"] = new Object();
  this.symbolList["jumper"]["3"]["repeat_type"] = 3;
  this.symbolList["jumper"]["3"]["title"] = "<img src='img/jumper_3.png' width='132' height='32' alt='down_right'>";
  this.symbolList["jumper"]["3"]["serial_number"] = this.getSerialNumber("jumper", "3");
  
  this.symbolList["jumper"]["4"] = new Object();
  this.symbolList["jumper"]["4"]["repeat_type"] = 4;
  this.symbolList["jumper"]["4"]["title"] = "<img src='img/jumper_4.png' width='96' height='72' alt='right_down'>";
  this.symbolList["jumper"]["4"]["serial_number"] = this.getSerialNumber("jumper", "4");
  
  this.symbolList["jumper"]["5"] = new Object();
  this.symbolList["jumper"]["5"]["repeat_type"] = 5;
  this.symbolList["jumper"]["5"]["title"] = "<img src='img/jumper_5.png' width='96' height='72' alt='right_down OK'>";
  this.symbolList["jumper"]["5"]["serial_number"] = this.getSerialNumber("jumper", "5");
  
  this.symbolList["jumper"]["6"] = new Object();
  this.symbolList["jumper"]["6"]["repeat_type"] = 6;
  this.symbolList["jumper"]["6"]["title"] = "<img src='img/jumper_6.png' width='96' height='72' alt='right_down NG'>";
  this.symbolList["jumper"]["6"]["serial_number"] = this.getSerialNumber("jumper", "6");
 };
 
 
 // シンボルエリアの表示切り替えエリア
 this.makeSelectItemTypeArea = function () {
  this.idItemType["command"] = this.idPrefix + "item_type_command";
  this.idItemType["action"]  = this.idPrefix + "item_type_action";
  this.idItemType["ping"]    = this.idPrefix + "item_type_ping";
  this.idItemType["sub"]     = this.idPrefix + "item_type_sub";
  this.idItemType["jumper"]  = this.idPrefix + "item_type_jumper";
  this.idItemSymbolArea["command"] = objLayoutFunctions.itemSymbolAreaId("command");
  this.idItemSymbolArea["action"]  = objLayoutFunctions.itemSymbolAreaId("action");
  this.idItemSymbolArea["ping"]    = objLayoutFunctions.itemSymbolAreaId("ping");
  this.idItemSymbolArea["sub"]     = objLayoutFunctions.itemSymbolAreaId("sub");
  this.idItemSymbolArea["jumper"]  = objLayoutFunctions.itemSymbolAreaId("jumper");
  
  var html = "<div class='select_item_type'>" +
             "<input type='radio' id='" + this.idItemType["command"] + "' name='" + this.nameItemType + "' value='command' onclick='objFlowchart.selectItemType(this.value);'><label for='" + this.idItemType["command"] + "'>command</label>" +
             "<input type='radio' id='" + this.idItemType["action"]  + "' name='" + this.nameItemType + "' value='action'  onclick='objFlowchart.selectItemType(this.value);'><label for='" + this.idItemType["action"] +  "'>action</label>" +
             "<input type='radio' id='" + this.idItemType["ping"]    + "' name='" + this.nameItemType + "' value='ping'    onclick='objFlowchart.selectItemType(this.value);'><label for='" + this.idItemType["ping"] +    "'>ping</label>" +
             "<input type='radio' id='" + this.idItemType["sub"]     + "' name='" + this.nameItemType + "' value='sub'     onclick='objFlowchart.selectItemType(this.value);'><label for='" + this.idItemType["sub"] +     "'>subroutine</label>" +
             "<input type='radio' id='" + this.idItemType["jumper"]  + "' name='" + this.nameItemType + "' value='jumper'  onclick='objFlowchart.selectItemType(this.value);'><label for='" + this.idItemType["jumper"] +  "'>jumper</label>" +
             "</div>";
  
  return(html);
 };
 
 
 // シンボルエリアの表示を切り替える。
 this.selectItemType = function (itemType) {
  this.selectedItemType = itemType;
  this.visibleItemSymbol();
 };
 
 
 this.print = function (){
  objControleStorageL.setPage("flowchart");
  objControleStorageS.setPage("flowchart");
  
  // 左側のシンボル一覧の枠を作成する。
  var htmlSearchField        = this.makeSearchField();
  var htmlSelectItemTypeArea = this.makeSelectItemTypeArea();
  
  var htmlItemSymbolArea = "<div id='" + this.idAllItemSymbolArea + "'>" +
                           "<div id='" + this.idItemSymbolArea["command"] + "' class='item_symbol_area'></div>" +
                           "<div id='" + this.idItemSymbolArea["action"]  + "' class='item_symbol_area'></div>" +
                           "<div id='" + this.idItemSymbolArea["ping"]    + "' class='item_symbol_area'></div>" +
                           "<div id='" + this.idItemSymbolArea["sub"]     + "' class='subroutine_symbol_area'></div>" +
                           "<div id='" + this.idItemSymbolArea["jumper"]  + "' class='item_symbol_area'><p style='text-align:center;'><img src='img/help.png' width='16' height='16' alt='help' class='onclick_node' onclick='objTelnetmanHelp.help(\"jumper\");'></p></div>" +
                           "</div>";
  
  document.getElementById("object_area").innerHTML = htmlSearchField + htmlSelectItemTypeArea + htmlItemSymbolArea;
  
  // 流れ図を作る。
  document.getElementById("build_area").innerHTML = "<div class='flowchart_flowchart_symbol_area'>" +
                                                    "<div class='flowchart_flowchart_symbol_help'><img src='img/help.png' width='16' height='16' alt='help' class='onclick_node' onclick='objTelnetmanHelp.help(\"flowchart_defore_middle_after\");'></div>" +
                                                    "<div class='flowchart_flowchart_symbol_zone'><input type='radio' id='" + this.idFlowchartTypeBefore + "' name='" + this.nameFlowchartType + "' value='before' onchange='objFlowchart.selectFlowchart(this.value);'><label for='" + this.idFlowchartTypeBefore + "'><span id='" + this.idFlowchartTitleBefore + "'></span></label><img src='img/arrow_next2.png' width='32' height='32' alt='next'></div>" +
                                                    "<div class='flowchart_flowchart_symbol_zone'><input type='radio' id='" + this.idFlowchartTypeMiddle + "' name='" + this.nameFlowchartType + "' value='middle' onchange='objFlowchart.selectFlowchart(this.value);'><label for='" + this.idFlowchartTypeMiddle + "'><span id='" + this.idFlowchartTitleMiddle + "'></span></label><img src='img/arrow_next2.png' width='32' height='32' alt='next'></div>" +
                                                    "<div class='flowchart_flowchart_symbol_zone'><input type='radio' id='" + this.idFlowchartTypeAfter  + "' name='" + this.nameFlowchartType + "' value='after'  onchange='objFlowchart.selectFlowchart(this.value);'><label for='" + this.idFlowchartTypeAfter +  "'><span id='" + this.idFlowchartTitleAfter + "'></span></label></div>" +
                                                    "</div>";
  
  this.checkFlowchartRadioButton();
  this.displayFlowchartTitle("middle");
  this.displayFlowchartTitle("before");
  this.displayFlowchartTitle("after");
  
  if(!this.isOpened){
   this.makeJumperList();
   var staticOptionList = this.makeFlowchartData();
   objLayoutFunctions.getItemSymbol("flowchart", staticOptionList);
  }
  else {
   this.printAllItemSymbol();
   objLayoutFunctions.printAllItemSymbol("jumper", this.itemIdList["jumper"], this.symbolList["jumper"]);
   objLayoutFunctions.printAllItemSymbol("sub",    this.itemIdList["sub"],    this.symbolList["sub"]);
   this.ddItemSymbolAreaSub();
   this.printAllFlowchart();
  }
 };
 
 
 // 全てのシンボルを表示する。
 this.printAllItemSymbol = function () {
  objLayoutFunctions.printAllItemSymbol("command", this.itemIdList["command"], this.symbolList["command"]);
  objLayoutFunctions.printAllItemSymbol("action",  this.itemIdList["action"],  this.symbolList["action"]);
  objLayoutFunctions.printAllItemSymbol("ping",    this.itemIdList["ping"],    this.symbolList["ping"]);
  
  this.ddItemSymbolAreaMain();
  
  if(!this.isOpened){
   objLayoutFunctions.printAllItemSymbol("jumper", this.itemIdList["jumper"], this.symbolList["jumper"]);
   objLayoutFunctions.printAllItemSymbol("sub",    this.itemIdList["sub"],    this.symbolList["sub"]);
   this.ddItemSymbolAreaSub();
   this.printAllFlowchart();
   this.isOpened = true;
  }
 };
 
 
 // 全ての流れ図を表示する。
 this.printAllFlowchart = function () {
  var elDivSquaresArea = document.createElement("div");
  elDivSquaresArea.setAttribute("id", this.idSquaresArea);
  elDivSquaresArea.ondragover = new Function("event", "objLayoutFunctions.onDragOver(event);");
  elDivSquaresArea.ondrop     = new Function("event", "objFlowchart.readFlowchartData(event);");
  
  var elDivDownloadFlowchartDataArea = this.makeDownloadFlowchartDataArea();
  elDivSquaresArea.appendChild(elDivDownloadFlowchartDataArea);
  
  var elDivModRoutineArea = this.makeModRoutineField();
  elDivSquaresArea.appendChild(elDivModRoutineArea);
  
  var elDivRoutineListArea = this.makeRoutineListArea();
  elDivSquaresArea.appendChild(elDivRoutineListArea);
  
  var elTableMainFlowchart = this.makeMainFlowchart();
  elDivSquaresArea.appendChild(elTableMainFlowchart);
  
  for(var i = 0, j = this.itemIdList["sub"].length; i < j; i ++){
   var subRoutineIndex = this.itemIdList["sub"][i];
   
   if(subRoutineIndex in this.subRoutine){
    var elTableSubFlowchart = this.makeSubFlowchart(subRoutineIndex);
    elDivSquaresArea.appendChild(elTableSubFlowchart);
   }
  }
  
  // 右クリックメニューを追加。
  var elDivContextMenu = this.makeContextMenu();
  elDivSquaresArea.appendChild(elDivContextMenu);
  
  document.getElementById("build_area").appendChild(elDivSquaresArea);
  
  this.insertItemSymbolFieldValues();
  this.visibleItemSymbol();
  
  this.displayJsonName();
  
  this.view(this.selectedRoutine);
  
  document.getElementById(this.idAllItemSymbolArea).style.display = "none";
  $("#" + this.idAllItemSymbolArea).fadeIn(300);
  document.getElementById(this.idSquaresArea).style.display = "none";
  $("#" + this.idSquaresArea).fadeIn(300, function(){
   objFlowchart.ddSquareAreaMain();
   objFlowchart.ddSquareAreaSub();
  });
 };
 
 
 
 // シンボルの検索欄を作る。
 this.makeSearchField = function () {
  var html = "<table class='search_item_field'>" +
	     "<tr><td class='left'><span>タイトル</span><input type='text' spellcheck='false' autocomplete='off' placeholder='一部' style='width:170px;' id='" + this.idSearchTitle + "' value='' onblur='objFlowchart.readSearchTitle();'></td></tr>" +
             "<tr><td class='left'><span>検索キーワード</span><input type='text' spellcheck='false' autocomplete='off' placeholder='前方一致' style='width:140px;' id='" + this.idSearchKeyword + "' value='' onblur='objFlowchart.readSearchKeyword();'></td></tr>" +
	     "<tr><td class='center'><button class='enable' id='" + this.idSearchButton + "' onclick='objFlowchart.get();'>add</button><button class='enable' id='" + this.idRestButton + "' onclick='objFlowchart.reset();'>reset</button><button class='enable' id='" + this.idClearButton + "' onclick='objFlowchart.clear();'>clear</button><img style='margin-left:4px;' src='img/help.png' width='16' height='16' alt='help' class='onclick_node' onclick='objTelnetmanHelp.help(\"flowchart_search\");'></td></tr>" +
	     "</table>";
  
  return(html);
 };
 
 
 // 現在開いている流れ図をJSON にして保存する。
 this.archiveFlowchartData = function (){
  var flowchartType = objControleStorageL.getSelectedFlowchart();
  var jsonFlowchartData = this.makeFlowchartDataJson();
  objControleStorageL.setFlowchartData(flowchartType, jsonFlowchartData);
 };
 
 
 // 開いている流れ図に合わせてinput radio にchecked 属性を加える。
 this.checkFlowchartRadioButton = function () {
  var flowchartType = objControleStorageL.getSelectedFlowchart();
  
  if(flowchartType === "middle"){
   document.getElementById(this.idFlowchartTypeBefore).checked = false;
   document.getElementById(this.idFlowchartTypeAfter).checked = false;
   document.getElementById(this.idFlowchartTypeMiddle).checked = true;
  }
  else if(flowchartType === "before"){
   document.getElementById(this.idFlowchartTypeAfter).checked = false;
   document.getElementById(this.idFlowchartTypeMiddle).checked = false;
   document.getElementById(this.idFlowchartTypeBefore).checked = true;
  }
  else if(flowchartType === "after"){
   document.getElementById(this.idFlowchartTypeMiddle).checked = false;
   document.getElementById(this.idFlowchartTypeBefore).checked = false;
   document.getElementById(this.idFlowchartTypeAfter).checked = true;
  }
 };
 
 
 // 流れ図のシンボルのタイトルを変更する。
 this.displayFlowchartTitle = function (flowchartType){
  var flowchartTitle = objControleStorageL.getFlowchartTitle(flowchartType);
  
  if(flowchartType === "middle"){
   document.getElementById(this.idFlowchartTitleMiddle).innerHTML = flowchartTitle;
  }
  else if(flowchartType === "before"){
   document.getElementById(this.idFlowchartTitleBefore).innerHTML = flowchartTitle;
  }
  else if(flowchartType === "after"){
   document.getElementById(this.idFlowchartTitleAfter).innerHTML = flowchartTitle;
  }
 };
 
 
 // 開いている流れ図を変更する。
 this.selectFlowchart = function (selectedFlowchartType){
  var flowchartType = objControleStorageL.getSelectedFlowchart();
  
  if(selectedFlowchartType !== flowchartType){
   this.archiveFlowchartData();
   
   this.initialize();
   this.clearStorageData();
   
   objControleStorageL.setSelectedFlowchart(selectedFlowchartType);
   
   var jsonFlowchartData = objControleStorageL.getFlowchartData(selectedFlowchartType);
   var flowchartData = JSON.parse(jsonFlowchartData);
   this.setFlowchartData(flowchartData);
   
   this.isOpened = false;
   this.print();
  }
 };
 
 
 // メインルーチンの流れ図を作る。
 this.makeMainFlowchart = function () {
  var elTable = document.createElement("table");
  elTable.setAttribute("class", "flowchart");
  elTable.setAttribute("id", this.idFlowchartTable(0));
  
  for(var i = 0, x = this.mainRoutine.length; i < x; i ++){
   var elTr = document.createElement("tr");
   
   for(var j = 0, y = this.mainRoutine[i].length; j < y; j ++){
    var elTd = this.makeSquareTd(0 , i, j);
    
    if(this.mainRoutine[i][j] !== null){
     var itemType  = this.mainRoutine[i][j]["item_type"];
     var itemId    = this.mainRoutine[i][j]["item_id"];
     var serialNumber = this.mainRoutine[i][j]["serial_number"];
     
     if((this.symbolList[itemType][itemId] !== null) && (this.symbolList[itemType][itemId] !== undefined)){
      var title       = this.symbolList[itemType][itemId]["title"];
      var repeatType  = this.symbolList[itemType][itemId]["repeat_type"];
      var commandType = this.symbolList[itemType][itemId]["command_type"];
      
      var idSymbol    = objLayoutFunctions.makeSymbolId(itemType, itemId, serialNumber);
      var symbolClass = objLayoutFunctions.makeSymbolClassName(itemType, repeatType, commandType);
      var titleClass  = objLayoutFunctions.makeSymbolTitleClassName(itemType, repeatType, commandType);
      var elDiv       = objLayoutFunctions.makeSymbolDom(idSymbol, symbolClass, titleClass, title);
      
      elTd.childNodes[0].appendChild(elDiv);
      
      // 矢印の追加
      imgItems = this.additionalArrowImg(itemType);
      for(a = 0, b = imgItems.length; a < b; a ++){
       elTd.childNodes[0].appendChild(imgItems[a]);
      }
      
      elDiv.style.margin = "0 auto";
      if((itemType === "sub") || (itemType === "action")){
       elDiv.style.top = "6px";
      }
      else if(itemType === "ping"){
       elDiv.style.top = "13px";
      }
      else{
       elDiv.style.top = "18px";
      }
     }
     else{
      this.mainRoutine[i][j] = null;
      delete(this.serialNumberList[itemType][itemId]);
      objControleStorageL.removeMainRoutineSymbol(i, j);
      
      elTd.style.backgroundColor = "#a0a0a0";
     }
    }
    
    elTr.appendChild(elTd);
   }
   
   elTable.appendChild(elTr);
  }
  
  return(elTable);
 };
 
 
 // サブルーチンの流れ図を作る。
 this.makeSubFlowchart = function (subRoutineIndex) {
  var elTable = document.createElement("table");
  elTable.setAttribute("class", "flowchart");
  elTable.setAttribute("id", this.idFlowchartTable(subRoutineIndex));
  
  for(var i = 0, x = this.subRoutine[subRoutineIndex].length; i < x; i ++){
   var elTr = document.createElement("tr");
   
   for(var j = 0, y = this.subRoutine[subRoutineIndex][i].length; j < y; j ++){
    var elTd = this.makeSquareTd(subRoutineIndex, i, j);
    
    if(this.subRoutine[subRoutineIndex][i][j] !== null){
     var itemType  = this.subRoutine[subRoutineIndex][i][j]["item_type"];
     var itemId    = this.subRoutine[subRoutineIndex][i][j]["item_id"];
     var serialNumber = this.subRoutine[subRoutineIndex][i][j]["serial_number"];
     
     if((this.symbolList[itemType][itemId] !== null) && (this.symbolList[itemType][itemId] !== undefined)){
      var title       = this.symbolList[itemType][itemId]["title"];
      var repeatType  = this.symbolList[itemType][itemId]["repeat_type"];
      var commandType = this.symbolList[itemType][itemId]["command_type"];
      
      var idSymbol    = objLayoutFunctions.makeSymbolId(itemType, itemId, serialNumber);
      var symbolClass = objLayoutFunctions.makeSymbolClassName(itemType, repeatType, commandType);
      var titleClass  = objLayoutFunctions.makeSymbolTitleClassName(itemType, repeatType, commandType);
      var elDiv       = objLayoutFunctions.makeSymbolDom(idSymbol, symbolClass, titleClass, title);
      elDiv.style.top = "18px";
      
      elTd.childNodes[0].appendChild(elDiv);
      
      // 矢印の追加
      var imgItems = this.additionalArrowImg(itemType);
      for(var a = 0, b = imgItems.length; a < b; a ++){
       elTd.childNodes[0].appendChild(imgItems[a]);
      }
      
      elDiv.style.margin = "0 auto";
      if((itemType === "sub") || (itemType === "action")){
       elDiv.style.top = "6px";
      }
      else if(itemType === "ping"){
       elDiv.style.top = "13px";
      }
      else{
       elDiv.style.top = "18px";
      }
     }
     else{
      this.subRoutine[subRoutineIndex][i][j] = null;
      delete(this.serialNumberList[itemType][itemId]);
      objControleStorageL.removeSubRoutineSymbol(subRoutineIndex, i, j);
      
      elTd.style.backgroundColor = "#a0a0a0";
     }
    }
    
    elTr.appendChild(elTd);
   }
   
   elTable.appendChild(elTr);
  }
  
  return(elTable);
 };
 
 
 // 右クリックメニュー
 this.makeContextMenu = function () {
  var elDiv = document.createElement("div");
  elDiv.setAttribute("class", "contextMenu");
  elDiv.setAttribute("id", this.idConTextMenu);
  elDiv.style.display = "none";
  
  var elUl = document.createElement("ul");
  var elLi1 = document.createElement("li");
  var elLi2 = document.createElement("li");
  var elLi3 = document.createElement("li");
  var elLi4 = document.createElement("li");
  var elLi5 = document.createElement("li");
  
  elLi1.setAttribute("id", "square_contextMenuLi1");
  elLi2.setAttribute("id", "square_contextMenuLi2");
  elLi3.setAttribute("id", "square_contextMenuLi3");
  elLi4.setAttribute("id", "square_contextMenuLi4");
  elLi5.setAttribute("id", "square_contextMenuLi5");
  
  elLi1.innerHTML = "下に行を追加";
  elLi2.innerHTML = "右に列を追加";
  elLi3.innerHTML = "この行を削除";
  elLi4.innerHTML = "この列を削除";
  elLi5.innerHTML = "この要素を削除";
  
  elUl.appendChild(elLi1);
  elUl.appendChild(elLi2);
  elUl.appendChild(elLi3);
  elUl.appendChild(elLi4);
  elUl.appendChild(elLi5);
  
  elDiv.appendChild(elUl);
  
  return(elDiv);
 };
 
 
 // contextMenu に渡す連想配列。
 this.contextMenuSetting = {
  menuStyle : {
   border : "2px solid #000"
  },
  itemStyle : {
   fontFamily : "verdana",
   backgroundColor : "#666",
   color : "white",
   border : "none",
   padding : "1px"
  },
  itemHoverStyle : {
   color : "#fff",
   backgroundColor : "#996644",
   border : "none"
  },
  bindings : {
   "square_contextMenuLi1" : function (elSquare){
    objFlowchart.addRow(elSquare.id);
   },
   "square_contextMenuLi2" : function (elSquare){
    objFlowchart.addCol(elSquare.id);
   },
   "square_contextMenuLi3" : function (elSquare){
    objFlowchart.delRow(elSquare.id);
   },
   "square_contextMenuLi4" : function (elSquare){
    objFlowchart.delCol(elSquare.id);
   },
   "square_contextMenuLi5" : function (elSquare){
    objFlowchart.delItem(elSquare.id);
   }
  }
 };
 
 
 // 下に行を追加
 this.addRow = function (idSquare) {
  var squareItems = this.parseSquareId(idSquare);
  var routineIndex = squareItems[0];
  var x = squareItems[1];
  var y = squareItems[2];
  
  if(routineIndex === 0){
   // 内部データとWeb Storage に1行追加。
   this.mainRoutine.splice(x + 1, 0, new Array());
   var rowCount = objControleStorageL.getMainRoutineX();
   rowCount ++;
   objControleStorageL.setMainRoutineX(rowCount);
   
   // 内部データの追加行にnull を入れ、流れ図に1行追加。
   var colCount = objControleStorageL.getMainRoutineY();
   var elTable = document.getElementById(this.idFlowchartTable(0));
   var elTr = document.createElement("tr");
   for(var j = 0; j < colCount; j ++){
    this.mainRoutine[x + 1].push(null);
    var elTd = this.makeSquareTd(0, rowCount - 1, j);
    elTr.appendChild(elTd);
   }
   elTable.appendChild(elTr);
   
   // Web Storage と流れ図のシンボルを1行分ずらす。
   for(var i = rowCount - 2; i >= x + 1; i --){
    for(j = 0; j < colCount; j ++){
     var symbolItems = objControleStorageL.getMainRoutineSymbol(i, j);
     objControleStorageL.setMainRoutineSymbol(i + 1, j, symbolItems[0], symbolItems[1]);
     objControleStorageL.removeMainRoutineSymbol(i, j);
     
     var idSquareFrom = this.idSquare(0, i, j);
     var idSquareTo   = this.idSquare(0, i + 1, j);
     var elSquareFrom = document.getElementById(idSquareFrom);
     var elSquareTo   = document.getElementById(idSquareTo);
     var itemsCount = elSquareFrom.childNodes.length;
     for(var k = 0; k < itemsCount; k ++){
      elSquareTo.appendChild(elSquareFrom.childNodes[0]);
     }
    }
   }
   
   this.ddSquareAreaMain();
   
   for(j = 0; j < colCount; j ++){
    var idSquareAdditional = this.idSquare(0, x + 1, j);
    $("#" + idSquareAdditional).effect('highlight', '', 800);
   }
  }
  else{
   // 内部データとWeb Storage に1行追加。
   this.subRoutine[routineIndex].splice(x + 1, 0, new Array());
   rowCount = objControleStorageL.getSubRoutineX(routineIndex);
   rowCount ++;
   objControleStorageL.setSubRoutineX(routineIndex, rowCount);
   
   // 内部データの追加行にnull を入れ、流れ図に1行追加。
   colCount = objControleStorageL.getSubRoutineY(routineIndex);
   elTable = document.getElementById(this.idFlowchartTable(routineIndex));
   elTr = document.createElement("tr");
   for(j = 0; j < colCount; j ++){
    this.subRoutine[routineIndex][x + 1].push(null);
    elTd = this.makeSquareTd(routineIndex, rowCount - 1, j);
    elTr.appendChild(elTd);
   }
   elTable.appendChild(elTr);
   
   // Web Storage と流れ図のシンボルを1行分ずらす。
   for(i = rowCount - 2; i >= x + 1; i --){
    for(j = 0; j < colCount; j ++){
     symbolItems = objControleStorageL.getSubRoutineSymbol(routineIndex, i, j);
     objControleStorageL.setSubRoutineSymbol(routineIndex, i + 1, j, symbolItems[0], symbolItems[1]);
     objControleStorageL.removeSubRoutineSymbol(routineIndex, i, j);
     
     idSquareFrom = this.idSquare(routineIndex, i, j);
     idSquareTo   = this.idSquare(routineIndex, i + 1, j);
     elSquareFrom = document.getElementById(idSquareFrom);
     elSquareTo   = document.getElementById(idSquareTo);
     itemsCount = elSquareFrom.childNodes.length;
     for(k = 0; k < itemsCount; k ++){
      elSquareTo.appendChild(elSquareFrom.childNodes[0]);
     }
    }
   }
   
   this.ddSquareAreaSub();
   
   for(j = 0; j < colCount; j ++){
    idSquareAdditional = this.idSquare(routineIndex, x + 1, j);
    $("#" + idSquareAdditional).effect('highlight', '', 800);
   }
  }
 };
 
 
 // この行を削除
 this.delRow = function (idSquare) {
  var squareItems = this.parseSquareId(idSquare);
  var routineIndex = squareItems[0];
  var x = squareItems[1];
  var y = squareItems[2];
  
  if(routineIndex === 0){
   var rowCount = objControleStorageL.getMainRoutineX();
   
   if(rowCount > 3){
    var elTable = document.getElementById(this.idFlowchartTable(0));
    
    // 内部データとWeb Storage から1行削除。
    this.mainRoutine.splice(x, 1);
    rowCount --;
    objControleStorageL.setMainRoutineX(rowCount);
    
    // Web Storage と流れ図のシンボルを1行分ずらす。
    var colCount = objControleStorageL.getMainRoutineY();
    var yList = new Array();
    var deleteCount = 0;
    for(var j = 0; j < colCount; j ++){
     yList.push(j);
     var idSquareDelete = this.idSquare(0, x, j);
     
     $("#" + idSquareDelete).effect('highlight', '', 800, function(){
      var J = yList.shift();
      
      for(var i = x + 1; i <= rowCount; i ++){
       var symbolItems = objControleStorageL.getMainRoutineSymbol(i, J);
       objControleStorageL.setMainRoutineSymbol(i - 1, J, symbolItems[0], symbolItems[1]);
       objControleStorageL.removeMainRoutineSymbol(i, J);
       
       var idSquareFrom = objFlowchart.idSquare(0, i, J);
       var idSquareTo   = objFlowchart.idSquare(0, i - 1, J);
       var elSquareFrom = document.getElementById(idSquareFrom);
       var elSquareTo   = document.getElementById(idSquareTo);
       var itemsCount = elSquareFrom.childNodes.length;
       
       objFlowchart.emptySquare(idSquareTo);
       
       for(var k = 0; k < itemsCount; k ++){
        elSquareTo.appendChild(elSquareFrom.childNodes[0]);
       }
      }
      
      deleteCount ++;
      
      // 流れ図から最終行を削除。
      if((yList.length === 0) && (deleteCount === colCount)){
       elTable.removeChild(elTable.childNodes[rowCount]);
      }
     });
    }
   }
  }
  else{
   rowCount = objControleStorageL.getSubRoutineX(routineIndex);
   
   if(rowCount > 3){
    elTable = document.getElementById(this.idFlowchartTable(routineIndex));
    
    // 内部データとWeb Storage から1行削除。
    this.subRoutine[routineIndex].splice(x, 1);
    rowCount --;
    objControleStorageL.setSubRoutineX(routineIndex, rowCount);
    
    // Web Storage と流れ図のシンボルを1行分ずらす。
    colCount = objControleStorageL.getSubRoutineY(routineIndex);
    yList = new Array();
    deleteCount = 0;
    for(j = 0; j < colCount; j ++){
     yList.push(j);
     idSquareDelete = this.idSquare(routineIndex, x, j);
     
     $("#" + idSquareDelete).effect('highlight', '', 800, function(){
      J = yList.shift();
      
      for(i = x + 1; i <= rowCount; i ++){
       var symbolItems = objControleStorageL.getSubRoutineSymbol(routineIndex, i, J);
       objControleStorageL.setSubRoutineSymbol(routineIndex, i - 1, J, symbolItems[0], symbolItems[1]);
       objControleStorageL.removeSubRoutineSymbol(routineIndex, i, J);
       
       var idSquareFrom = objFlowchart.idSquare(routineIndex, i, J);
       var idSquareTo   = objFlowchart.idSquare(routineIndex, i - 1, J);
       var elSquareFrom = document.getElementById(idSquareFrom);
       var elSquareTo   = document.getElementById(idSquareTo);
       var itemsCount = elSquareFrom.childNodes.length;
       
       objFlowchart.emptySquare(idSquareTo);
       
       for(var k = 0; k < itemsCount; k ++){
        elSquareTo.appendChild(elSquareFrom.childNodes[0]);
       }
      }
      
      deleteCount ++;
      
      // 流れ図から最終行を削除。
      if((yList.length === 0) && (deleteCount === colCount)){
       elTable.removeChild(elTable.childNodes[rowCount]);
      }
     });
    }
   }
  }
 };
 
 
 // 右に列を加える。
 this.addCol = function (idSquare) {
  var squareItems = this.parseSquareId(idSquare);
  var routineIndex = squareItems[0];
  var x = squareItems[1];
  var y = squareItems[2];
  
  if(routineIndex === 0){
   var rowCount = objControleStorageL.getMainRoutineX();
   
   //Web Storage に1列追加。
   var colCount = objControleStorageL.getMainRoutineY();
   colCount ++;
   objControleStorageL.setMainRoutineY(colCount);
   
   var elTable = document.getElementById(this.idFlowchartTable(0));
   
   for(var i = 0; i < rowCount; i ++){
    // 内部データに1列追加。
    this.mainRoutine[i].splice(y + 1, 0, null);
    
    // 流れ図に1列加える。
    var elTd = this.makeSquareTd(0, i, colCount - 1);
    elTable.childNodes[i].appendChild(elTd);
    
    // Web Storage と流れ図のシンボルを1行分ずらす。
    for(var j = colCount - 2; j >= y + 1; j --){
     var symbolItems = objControleStorageL.getMainRoutineSymbol(i, j);
     objControleStorageL.setMainRoutineSymbol(i, j + 1, symbolItems[0], symbolItems[1]);
     objControleStorageL.removeMainRoutineSymbol(i, j);
     
     var idSquareFrom = this.idSquare(0, i, j);
     var idSquareTo   = this.idSquare(0, i, j + 1);
     var elSquareFrom = document.getElementById(idSquareFrom);
     var elSquareTo   = document.getElementById(idSquareTo);
     var itemsCount = elSquareFrom.childNodes.length;
     for(var k = 0; k < itemsCount; k ++){
      elSquareTo.appendChild(elSquareFrom.childNodes[0]);
     }
    }
   }
   
   this.ddSquareAreaMain();
   
   for(i = 0; i < rowCount; i ++){
    var idSquareAdditional = this.idSquare(0, i, y + 1);
    $("#" + idSquareAdditional).effect('highlight', '', 800);
   }
  }
  else{
   rowCount = objControleStorageL.getSubRoutineX(routineIndex);
   
   //Web Storage に1列追加。
   colCount = objControleStorageL.getSubRoutineY(routineIndex);
   colCount ++;
   objControleStorageL.setSubRoutineY(routineIndex, colCount);
   
   elTable = document.getElementById(this.idFlowchartTable(routineIndex));
   
   for(i = 0; i < rowCount; i ++){
    // 内部データに1列追加。
    this.subRoutine[routineIndex][i].splice(y + 1, 0, null);
    
    // 流れ図に1列加える。
    elTd = this.makeSquareTd(routineIndex, i, colCount - 1);
    elTable.childNodes[i].appendChild(elTd);
    
    // Web Storage と流れ図のシンボルを1行分ずらす。
    for(j = colCount - 2; j >= y + 1; j --){
     symbolItems = objControleStorageL.getSubRoutineSymbol(routineIndex, i, j);
     objControleStorageL.setSubRoutineSymbol(routineIndex, i, j + 1, symbolItems[0], symbolItems[1]);
     objControleStorageL.removeSubRoutineSymbol(routineIndex, i, j);
     
     idSquareFrom = this.idSquare(routineIndex, i, j);
     idSquareTo   = this.idSquare(routineIndex, i, j + 1);
     elSquareFrom = document.getElementById(idSquareFrom);
     elSquareTo   = document.getElementById(idSquareTo);
     itemsCount = elSquareFrom.childNodes.length;
     for(k = 0; k < itemsCount; k ++){
      elSquareTo.appendChild(elSquareFrom.childNodes[0]);
     }
    }
   }
   
   this.ddSquareAreaSub();
   
   for(i = 0; i < rowCount; i ++){
    idSquareAdditional = this.idSquare(routineIndex, i, y + 1);
    $("#" + idSquareAdditional).effect('highlight', '', 800);
   }
  }
  
  this.adjustWidth();
 };
 
 
 // この列を削除する。
 this.delCol = function (idSquare) {
  var squareItems = this.parseSquareId(idSquare);
  var routineIndex = squareItems[0];
  var x = squareItems[1];
  var y = squareItems[2];
  
  if(routineIndex === 0){
   var rowCount = objControleStorageL.getMainRoutineX();
   var colCount = objControleStorageL.getMainRoutineY();
   
   if(colCount > 3){
    var elTable = document.getElementById(this.idFlowchartTable(0));
    
    // Web Storage から1列減らす。
    colCount --;
    objControleStorageL.setMainRoutineY(colCount);
    
    var xList = new Array();
    var deleteCount = 0;
    for(var i = 0; i < rowCount; i ++){
     // 内部データから1列削除。
     this.mainRoutine[i].splice(y, 1);
     
     xList.push(i);
     
     // Web Storage と流れ図のシンボルを1行分ずらす。
     var idSquareDelete = this.idSquare(0, i, y);
     $("#" + idSquareDelete).effect('highlight', '', 800, function(){
      var I = xList.shift();
      
      for(var j = y + 1; j <= colCount; j ++){
       var symbolItems = objControleStorageL.getMainRoutineSymbol(I, j);
       objControleStorageL.setMainRoutineSymbol(I, j - 1, symbolItems[0], symbolItems[1]);
       objControleStorageL.removeMainRoutineSymbol(I, j);
       
       var idSquareFrom = objFlowchart.idSquare(0, I, j);
       var idSquareTo   = objFlowchart.idSquare(0, I, j - 1);
       var elSquareFrom = document.getElementById(idSquareFrom);
       var elSquareTo   = document.getElementById(idSquareTo);
       var itemsCount = elSquareFrom.childNodes.length;
       
       objFlowchart.emptySquare(idSquareTo);
       
       for(var k = 0; k < itemsCount; k ++){
        elSquareTo.appendChild(elSquareFrom.childNodes[0]);
       }
      }
      
      // 流れ図から最終列を削除。
      elTable.childNodes[I].removeChild(elTable.childNodes[I].childNodes[colCount]);
      
      deleteCount ++;
      
      // 画面の横幅を調整。
      if((xList.length === 0) && (deleteCount === rowCount)){
       objFlowchart.adjustWidth();
      }
     });
    }
   }
  }
  else{
   rowCount = objControleStorageL.getSubRoutineX(routineIndex);
   colCount = objControleStorageL.getSubRoutineY(routineIndex);
   
   if(colCount > 3){
    elTable = document.getElementById(this.idFlowchartTable(routineIndex));
    
    // Web Storage から1列減らす。
    colCount --;
    objControleStorageL.setSubRoutineY(routineIndex, colCount);
    
    xList = new Array();
    deleteCount = 0;
    for(i = 0; i < rowCount; i ++){
     // 内部データから1列削除。
     this.subRoutine[routineIndex][i].splice(y, 1);
     
     xList.push(i);
     
     // Web Storage と流れ図のシンボルを1行分ずらす。
     idSquareDelete = this.idSquare(routineIndex, i, y);
     $("#" + idSquareDelete).effect('highlight', '', 800, function(){
      var I = xList.shift();
      
      // Web Storage と流れ図のシンボルを1行分ずらす。
      for(j = y + 1; j <= colCount; j ++){
       var symbolItems = objControleStorageL.getSubRoutineSymbol(routineIndex, I, j);
       objControleStorageL.setSubRoutineSymbol(routineIndex, I, j - 1, symbolItems[0], symbolItems[1]);
       objControleStorageL.removeSubRoutineSymbol(routineIndex, I, j);
       
       var idSquareFrom = objFlowchart.idSquare(routineIndex, I, j);
       var idSquareTo   = objFlowchart.idSquare(routineIndex, I, j - 1);
       var elSquareFrom = document.getElementById(idSquareFrom);
       var elSquareTo   = document.getElementById(idSquareTo);
       var itemsCount = elSquareFrom.childNodes.length;
       
       objFlowchart.emptySquare(idSquareTo);
       
       for(var k = 0; k < itemsCount; k ++){
        elSquareTo.appendChild(elSquareFrom.childNodes[0]);
       }
      }
      
      // 流れ図から最終列を削除。
      elTable.childNodes[I].removeChild(elTable.childNodes[I].childNodes[colCount]);
      
      deleteCount ++;
      
      // 画面の横幅を調整。
      if((xList.length === 0) && (deleteCount === rowCount)){
       objFlowchart.adjustWidth();
      }
     });
    }
   }
  }
 };
 
 
 // この要素を削除。
 this.delItem = function (idSquare) {
  var squareItems = this.parseSquareId(idSquare);
  var routineIndex = squareItems[0];
  var x = squareItems[1];
  var y = squareItems[2];
  
  if(routineIndex === 0){
   if(this.mainRoutine[x][y] !== null){
    var idSymbol = objLayoutFunctions.makeSymbolId(this.mainRoutine[x][y]["item_type"], this.mainRoutine[x][y]["item_id"], this.mainRoutine[x][y]["serial_number"]);
    
    delete(this.mainRoutine[x][y]["item_type"]);
    delete(this.mainRoutine[x][y]["item_id"]);
    delete(this.mainRoutine[x][y]["serial_number"]);
    this.mainRoutine[x][y] = null;
    
    objControleStorageL.removeMainRoutineSymbol(x, y);
    
    $("#" + idSymbol).effect('fade', '', 300, function (){
     objFlowchart.emptySquare(idSquare);
    });
   }
  }
  else{
   if(this.subRoutine[routineIndex][x][y] !== null){
    idSymbol = objLayoutFunctions.makeSymbolId(this.subRoutine[routineIndex][x][y]["item_type"], this.subRoutine[routineIndex][x][y]["item_id"], this.subRoutine[routineIndex][x][y]["serial_number"]);
    
    delete(this.subRoutine[routineIndex][x][y]["item_type"]);
    delete(this.subRoutine[routineIndex][x][y]["item_id"]);
    delete(this.subRoutine[routineIndex][x][y]["serial_number"]);
    this.subRoutine[routineIndex][x][y] = null;
    
    objControleStorageL.removeSubRoutineSymbol(routineIndex, x, y);
    
    $("#" + idSymbol).effect('fade', '', 300, function (){
     objFlowchart.emptySquare(idSquare);
    });
   }
  }
 };
 
 
 // 追加の矢印。
 this.additionalArrowImg = function (itemType){
  var imgItems = new Array();
  
  if((itemType === "action") || (itemType === "ping")){
   elImgOk = this.makeArrow("ok");
   elImgNg = this.makeArrow("ng");
   
   imgItems.push(elImgOk);
   imgItems.push(elImgNg);
  }
  else if((itemType === "command") || (itemType === "sub")){
   elImgNext = this.makeArrow("next");
   
   imgItems.push(elImgNext);
  }
  
  return(imgItems);
 };
 
 
 // 流れ図のデータファイルのファイル名を表示する。
 this.displayJsonName = function () {
  var flowchartType = objControleStorageL.getSelectedFlowchart();
  
  if(this.flowchartDataJsonFileName[flowchartType].length > 0){
   document.getElementById(this.idFlowchartDataJsonFileName).innerHTML = this.flowchartDataJsonFileName[flowchartType];
  }
  else{
   document.getElementById(this.idFlowchartDataJsonFileName).innerHTML = "Telnetman2_flowchart_****.json";
  }
 };
 
 
 // 流れ図のデータファイルのダウンロードエリア。
 this.makeDownloadFlowchartDataArea = function () {
  var elDiv = document.createElement("div");
  elDiv.setAttribute("class", "margin20");
  
  var flowchartType = objControleStorageL.getSelectedFlowchart();
  var sessionTitle  = objControleStorageL.getSessionTitle();
  var flowchartDataJsonFileName = this.makeFlowchartFileName();
  
  var elSpan = document.createElement("span");
  elSpan.setAttribute("id", this.idFlowchartDataJsonFileName);
  
  var elImg = this.createDownloadButtonImage();
  
  var elA = document.createElement("a");
  elA.setAttribute("href", "#");
  elA.setAttribute("id", this.idDownloadFlowchartData);
  elA.setAttribute("download", flowchartDataJsonFileName);
  elA.onclick = new Function("objFlowchart.downloadFlowchart();");
  elA.appendChild(elImg);
  
  elDiv.appendChild(elA);
  elDiv.appendChild(elSpan);
  
  return(elDiv);
 };
 
 // ダウンロードボタンの画像エレメントを作る。
 this.createDownloadButtonImage = function (){
  var elImg = document.createElement("img");
  elImg.setAttribute("src", "img/download.png");
  elImg.setAttribute("width", "16");
  elImg.setAttribute("height", "16");
  elImg.setAttribute("alt", "download");
  
  return(elImg);
 };
 
 
 // サブルーチン新規作成エリアを作る。
 this.makeModRoutineField = function () {
  var elDiv = document.createElement("div");
  elDiv.setAttribute("id", this.idModRoutineArea);
  
  // 繰り返しタイプ
  var elSpanRoutineType = document.createElement("span");
  elSpanRoutineType.className = "routine_radio_buntton";
  
  var elInputRadio1 = document.createElement("input");
  elInputRadio1.setAttribute("type", "radio");
  elInputRadio1.setAttribute("name", this.nameRoutineType);
  elInputRadio1.setAttribute("id", this.idRoutineType1);
  elInputRadio1.setAttribute("value", "1");
  elInputRadio1.onchange = new Function("objFlowchart.readRoutineType(this.value); objFlowchart.update();");
  
  var elInputRadio2 = document.createElement("input");
  elInputRadio2.setAttribute("type", "radio");
  elInputRadio2.setAttribute("name", this.nameRoutineType);
  elInputRadio2.setAttribute("id", this.idRoutineType2);
  elInputRadio2.setAttribute("value", "2");
  elInputRadio2.onchange = new Function("objFlowchart.readRoutineType(this.value); objFlowchart.update();");
  
  var elLabel1 = document.createElement("label");
  elLabel1.setAttribute("for", this.idRoutineType1);
  elLabel1.innerHTML = "1回のみ";
  
  var elLabel2 = document.createElement("label");
  elLabel2.setAttribute("for", this.idRoutineType2);
  elLabel2.innerHTML = "繰り返し";
  
  elSpanRoutineType.appendChild(elInputRadio1);
  elSpanRoutineType.appendChild(elLabel1);
  elSpanRoutineType.appendChild(elInputRadio2);
  elSpanRoutineType.appendChild(elLabel2);
  
  // 逆順
  var elSpanLoopType = document.createElement("span");
  
  var elCheckbox = document.createElement("input");
  elCheckbox.setAttribute("type", "checkbox");
  elCheckbox.id = this.idLoopType;
  elCheckbox.valus = "1";
  elCheckbox.onchange = new Function("objFlowchart.readLoopType(); objFlowchart.update();");
  
  var elLabel3 = document.createElement("label");
  elLabel3.className = "checkbox1";
  elLabel3.setAttribute("for", this.idLoopType);
  elLabel3.innerHTML = "逆順";
  
  elSpanLoopType.appendChild(elCheckbox);
  elSpanLoopType.appendChild(elLabel3);
  
  // タイトル
  var elImgHelp = document.createElement("img");
  elImgHelp.setAttribute("src", "img/help.png");
  elImgHelp.setAttribute("width", "16");
  elImgHelp.setAttribute("height", "16");
  elImgHelp.setAttribute("alt", "help");
  elImgHelp.className = "onclick_node";
  elImgHelp.onclick = new Function("objTelnetmanHelp.help(\"flowchart_routine_type\");");
  var elSpanTitle = document.createElement("span");
  elSpanTitle.innerHTML = "タイトル";
  var elInputText = document.createElement("input");
  elInputText.setAttribute("type", "text");
  elInputText.setAttribute("spellcheck", "false");
  elInputText.setAttribute("autocomplete", "off");
  elInputText.style.width = "150px";
  elInputText.setAttribute("id", this.idRoutineTitle);
  elInputText.setAttribute("value", "");
  elInputText.onblur = new Function("objFlowchart.readRoutineTitle(); objFlowchart.update();");

  var elButtonRemove = document.createElement("button");
  elButtonRemove.setAttribute("id", this.idRemoveButton);
  if(this.selectedRoutine === 0){
   elButtonRemove.setAttribute("class", "disable");
   elButtonRemove.onclick = null;
  }
  else{
   elButtonRemove.setAttribute("class", "enable");
   elButtonRemove.onclick = new Function("objFlowchart.remove();");
  }
  elButtonRemove.innerHTML = "削除";
  
  var elSpanDownloadSubroutineData = document.createElement("span");
  elSpanDownloadSubroutineData.setAttribute("id", this.idSpanDownloadSubroutineData);
  elSpanDownloadSubroutineData.className = "margin-left-20";
  
  elDiv.appendChild(elImgHelp);
  elDiv.appendChild(elSpanTitle);
  elDiv.appendChild(elInputText);
  elDiv.appendChild(elSpanRoutineType);
  elDiv.appendChild(elSpanLoopType);
  elDiv.appendChild(elButtonRemove);
  elDiv.appendChild(elSpanDownloadSubroutineData);
  
  return(elDiv);
 };
 
 
 // サブルーチンを新規作成する。
 this.create = function () {
  var title      = "名無し";
  var repeatType = 1;
  var loopType   = 0;
  
  var subRoutineIndex = objControleStorageL.pushSubRoutineList();
  
  objControleStorageL.setSubRoutineTitle(subRoutineIndex, title);
  objControleStorageL.setSubRoutineType(subRoutineIndex, repeatType);
  objControleStorageL.setSubRoutineLoop(subRoutineIndex, loopType);
  objControleStorageL.setSubRoutineX(subRoutineIndex, 3);
  objControleStorageL.setSubRoutineY(subRoutineIndex, 3);
  
  this.subRoutine[subRoutineIndex] = new Array();
  
  for(var i = 0; i < 3; i ++){
   this.subRoutine[subRoutineIndex][i] = new Array();
   for(var j = 0; j < 3; j ++){
    this.subRoutine[subRoutineIndex][i][j] = null;
   }
  }
  
  var elTableSubFlowchart = this.makeSubFlowchart(subRoutineIndex);
  document.getElementById(this.idSquaresArea).appendChild(elTableSubFlowchart);
  
  var elDivRoutineLabelArea = document.getElementById(this.idRoutineLabelArea);
  var elCreateButton = document.getElementById(this.idCreateButton);
  var elRadioLabelSub = this.makeRoutineLabel(subRoutineIndex, title, repeatType);
  
  elDivRoutineLabelArea.insertBefore(elRadioLabelSub[0], elCreateButton);
  elDivRoutineLabelArea.insertBefore(elRadioLabelSub[1], elCreateButton);
  
  
  this.appendSymbolData("sub", subRoutineIndex, title, repeatType);
  var idSymbol = objLayoutFunctions.makeSymbolId("sub", subRoutineIndex, 0);
  objLayoutFunctions.appendItemSymbol("sub", title, repeatType, idSymbol);
  
  this.view(subRoutineIndex);
  
  this.ddItemSymbolAreaSub();
  this.ddSquareAreaSub();
 };
 
 
 // サブルーチンを削除する。
 this.remove = function () {
  var subRoutineIndex = this.selectedRoutine;
  
  var title = objControleStorageL.getSubRoutineTitle(subRoutineIndex);
  
  if(confirm("サブルーチン\n" + title + "\nを削除しますか?")){
   if(subRoutineIndex !== 0){
    $("#" + this.idRoutineLabel(subRoutineIndex)).effect('fade', '', 500, function(){
     var elRadioSub = document.getElementById(objFlowchart.idRoutineRadio(subRoutineIndex));
     var elLabelSub = document.getElementById(objFlowchart.idRoutineLabel(subRoutineIndex));
     document.getElementById(objFlowchart.idRoutineLabelArea).removeChild(elRadioSub);
     document.getElementById(objFlowchart.idRoutineLabelArea).removeChild(elLabelSub);
    });
    
    var elTableSubFlowchart = document.getElementById(this.idFlowchartTable(subRoutineIndex));
    document.getElementById(this.idSquaresArea).removeChild(elTableSubFlowchart);
    
    var idSymbol = objLayoutFunctions.makeSymbolId("sub", subRoutineIndex, this.serialNumberList["sub"][subRoutineIndex]);
    $("#" + idSymbol).effect('puff', '', 500, function(){
     var elDiv = document.getElementById(idSymbol);
     document.getElementById(objFlowchart.idItemSymbolArea["sub"]).removeChild(elDiv);
    });
    
    // メインルーチンの流れ図からシンボルを削除する。
    var x = objControleStorageL.getMainRoutineX();
    var y = objControleStorageL.getMainRoutineY();
    for(i = 0; i < x; i ++){
     for(j = 0; j < y; j ++){
      var symbolItems = objControleStorageL.getMainRoutineSymbol(i, j);
      
      if((symbolItems[0] === "sub") && (symbolItems[1] === subRoutineIndex)){
       var idSquare = this.idSquare(0, i, j);
       this.emptySquare(idSquare);
      }
     }
    }
    
    delete(this.subRoutine[subRoutineIndex]);
    
    x = objControleStorageL.getSubRoutineX(subRoutineIndex);
    y = objControleStorageL.getSubRoutineY(subRoutineIndex);
    for(i = 0; i < x; i ++){
     for(j = 0; j < y; j ++){
      objControleStorageL.removeSubRoutineSymbol(subRoutineIndex, i, j);
     }
    }
    
    objControleStorageL.removeSubRoutineTitle(subRoutineIndex);
    objControleStorageL.removeSubRoutineType(subRoutineIndex);
    objControleStorageL.removeSubRoutineLoop(subRoutineIndex);
    objControleStorageL.removeSubRoutineX(subRoutineIndex);
    objControleStorageL.removeSubRoutineY(subRoutineIndex);
    
    this.removeSymbolData("sub", subRoutineIndex);
    objControleStorageL.setSubRoutineList(this.itemIdList["sub"]);
    
    this.view(0);
   }
  }
 };
 
 
 // メインルーチン、サブルーチンを更新する。
 this.update = function () {
  var routineIndex = this.selectedRoutine;
  var title      = this.valueRoutineTitle;
  var repeatType = this.valueRoutineType;
  
  // 繰り返しの逆順ボタン
  if(repeatType === 1){
   document.getElementById(this.idLoopType).checked = false;
   document.getElementById(this.idLoopType).disabled = true;
   this.valueLoopType = 0;
  }
  else if(repeatType === 2){
   document.getElementById(this.idLoopType).disabled = false;
  }
  
  var loopType = this.valueLoopType;
  
  if(title.length === 0){
   title = "名無し";
   this.valueRoutineTitle = title;
   document.getElementById(this.idRoutineTitle).value = title;
  }
  
  if(routineIndex === 0){
   var flowchartType = objControleStorageL.getSelectedFlowchart();
   objControleStorageL.setFlowchartTitle(flowchartType, title);
   this.displayFlowchartTitle(flowchartType);
   
   if(flowchartType === "middle"){
    objControleStorageL.setSessionTitle(title);
   }
   
   objControleStorageL.setMainRoutineType(repeatType);
   this.mainRoutineTitle = title;
   this.mainRoutineType  = repeatType;
   
   objControleStorageL.setMainRoutineLoop(loopType);
  }
  else{
   objControleStorageL.setSubRoutineTitle(routineIndex, title);
   objControleStorageL.setSubRoutineType(routineIndex, repeatType);
   objControleStorageL.setSubRoutineLoop(routineIndex, loopType);
   
   this.updateSymbolData("sub", routineIndex, title, repeatType);
   
   // 画面のシンボルの表示を変える。
   for(var i = this.serialNumberList["sub"][routineIndex]; i >= 0; i --){
    var idSymbol = objLayoutFunctions.makeSymbolId("sub", routineIndex, i);
    
    var elSymbol = document.getElementById(idSymbol);
    if(elSymbol !== null){
     elSymbol.className = objLayoutFunctions.makeSymbolClassName("sub", repeatType);
     elSymbol.childNodes[0].className = objLayoutFunctions.makeSymbolTitleClassName("sub", repeatType);
     elSymbol.childNodes[0].innerHTML = objCommonFunctions.escapeHtml(title);
    }
   }
  }
  
  // ラベルの更新
  var elLabel = document.getElementById(objFlowchart.idRoutineLabel(routineIndex));
  elLabel.innerHTML = title;
  elLabel.className = objFlowchart.routineLabelClass(repeatType);
  objFlowchart.changeSquaresAreaClass(repeatType);
 };
 
 
 // メインルーチン、サブルーチンのラベルエリアを作る。
 this.makeRoutineListArea = function () {
  var elDiv = document.createElement("div");
  elDiv.setAttribute("id", this.idRoutineLabelArea);
  elDiv.setAttribute("class", "select_subroutine");
  
  var elRadioLabelMain = this.makeRoutineLabel(0, this.mainRoutineTitle, this.mainRoutineType);
  
  elDiv.appendChild(elRadioLabelMain[0]);
  elDiv.appendChild(elRadioLabelMain[1]);
  
  for(var i = 0, j = this.itemIdList["sub"].length; i < j; i ++){
   var subRoutineIndex = this.itemIdList["sub"][i];
   
   var title      = this.symbolList["sub"][subRoutineIndex]["title"];
   var repeatType = this.symbolList["sub"][subRoutineIndex]["repeat_type"];
   var elRadioLabelSub = this.makeRoutineLabel(subRoutineIndex, title, repeatType);
   
   elDiv.appendChild(elRadioLabelSub[0]);
   elDiv.appendChild(elRadioLabelSub[1]);
  }
  
  // 新規作成ボタンを作る。
  var elButtonCreate = document.createElement("img");
  elButtonCreate.setAttribute("id", this.idCreateButton);
  elButtonCreate.setAttribute("class", "onclick_node");
  elButtonCreate.setAttribute("src", "img/add.png");
  elButtonCreate.setAttribute("width", "16");
  elButtonCreate.setAttribute("height", "16");
  elButtonCreate.setAttribute("alt", "サブルーチン追加");
  elButtonCreate.onclick = new Function("objFlowchart.create();");
  
  elDiv.appendChild(elButtonCreate);
  
  return(elDiv);
 };
 
 
 // メインルーチン、サブルーチンのラベル1つを作る。
 this.makeRoutineLabel = function (routineIndex, title, repeatType) {
  var idRadio = this.idRoutineRadio(routineIndex);
  
  var elInputRadio = document.createElement("input");
  elInputRadio.setAttribute("type", "radio");
  elInputRadio.setAttribute("name", this.nameRoutineRadio);
  elInputRadio.setAttribute("id", idRadio);
  elInputRadio.setAttribute("value", routineIndex);
  elInputRadio.onclick = new Function("objFlowchart.view(this.value)");
  
  var elLabel = document.createElement("label");
  elLabel.setAttribute("id", this.idRoutineLabel(routineIndex));
  elLabel.setAttribute("class", this.routineLabelClass(repeatType));
  elLabel.setAttribute("for", idRadio);
  elLabel.innerHTML = objCommonFunctions.escapeHtml(title);
  
  return([elInputRadio, elLabel]);
 };
 
 
 // メインルーチン、サブルーチンの見出しのclass 名を作成する。
 this.routineLabelClass = function (repeatType) {
  return("subroutine_label_" + repeatType);
 };
 
 
 // クリックしたルーチンの内容を表示する。
 this.view = function (routineIndex) {
  if(typeof(routineIndex) !== "number"){
   routineIndex = parseInt(routineIndex, 10);
  }
  
  var elRemoveButton = document.getElementById(this.idRemoveButton);
  var elSpanDownloadSubroutineData = document.getElementById(this.idSpanDownloadSubroutineData);
  
  var repeatType = 1;
  var title = "";
  var loopType = 0;
  
  // サブルーチンデータダウンロードボタンの削除
  if(elSpanDownloadSubroutineData.childNodes[0]){
   elSpanDownloadSubroutineData.removeChild(elSpanDownloadSubroutineData.childNodes[0]);
  }
  
  if(routineIndex === 0){// メインルーチンの場合 
   elRemoveButton.className = "disable";
   elRemoveButton.onclick = null;
   repeatType = this.mainRoutineType;
   title      = this.mainRoutineTitle;
   loopType = objControleStorageL.getMainRoutineLoop();
  }
  else{
   elRemoveButton.className = "enable";
   elRemoveButton.onclick = new Function("objFlowchart.remove();");
   repeatType = this.symbolList["sub"][routineIndex]["repeat_type"];
   title      = this.symbolList["sub"][routineIndex]["title"];
   loopType = objControleStorageL.getSubRoutineLoop(routineIndex);
   
   // サブルーチンデータダウンロードボタンの作成
   var elImg = this.createDownloadButtonImage();
   
   var jsonSubroutineData = this.makeSubroutineDataJson(routineIndex);
   var subroutineDataJsonFileName = objCommonFunctions.escapeFilename("Telnetman2_subroutine_" + title + ".json");
   var blob = new Blob([jsonSubroutineData], {"type" : "text/plain"});
   window.URL = window.URL || window.webkitURL;
   
   var elA = document.createElement("a");
   elA.setAttribute("href", "#");
   elA.setAttribute("id", this.idDownloadSubroutineData);
   elA.setAttribute("download", subroutineDataJsonFileName);
   elA.setAttribute("href", window.URL.createObjectURL(blob));
   
   elA.appendChild(elImg);
   elSpanDownloadSubroutineData.appendChild(elA);
  }
  
  this.selectedRoutine = routineIndex;
  this.valueRoutineType = repeatType;
  this.valueRoutineTitle = title;
  this.valueLoopType = loopType;
  
  this.insertRoutineListFieldValues();
  this.visibleFlowchart();
  
  this.adjustWidth();
  this.changeSquaresAreaClass(repeatType);
 };
 
 
 // マス目一個を作る。
 this.makeSquareTd = function (routineIndex, x, y) {
  var squareClass = "";
  if(routineIndex === 0){
   squareClass = "main_square";
  }
  else{
   squareClass = "sub_square";
  }
  
  var id = this.idSquare(routineIndex, x, y);
  var elTd = document.createElement("td");
  var elDiv = document.createElement("div");
  elDiv.setAttribute("class", squareClass);
  elDiv.setAttribute("id", id);
  
  elTd.appendChild(elDiv);
  
  return(elTd);
 };
 
 
 // マス目のid を作る。
 this.idSquare = function (routineIndex, x, y) {
  return("square_" + routineIndex + "_" + x + "_" + y);
 };
 
 
 // マス目のid からルーチンタイプとx, y を取り出す。
 this.parseSquareId = function (idSquare) {
  var splitSquareId = idSquare.split("_");
  var routineIndex = parseInt(splitSquareId[1], 10);
  var x = parseInt(splitSquareId[2], 10);
  var y = parseInt(splitSquareId[3], 10);
  
  return([routineIndex, x, y]);
 };
 
 
 // マス目を空にする。
 this.emptySquare = function (idSquare) {
  var elSquare = document.getElementById(idSquare);
  var symbolAndArrowList = elSquare.childNodes;
  
  for(var i = symbolAndArrowList.length - 1; i >= 0; i --){
   elSquare.removeChild(symbolAndArrowList[i]);
  }
 };
 
 
 // 矢印を作る。
 this.makeArrow = function (arrowType) {
  var elImg = document.createElement("img");
  
  if(arrowType === "ok"){
   elImg.setAttribute("src", "img/arrow_ok.png");
   elImg.setAttribute("class", "arrow_down");
   elImg.setAttribute("alt", "OK");
  }
  else if(arrowType === "ng"){
   elImg.setAttribute("src", "img/arrow_ng.png");
   elImg.setAttribute("class", "arrow_right");
   elImg.setAttribute("alt", "NG");
  }
  else if(arrowType === "next"){
   elImg.setAttribute("src", "img/arrow_next.png");
   elImg.setAttribute("class", "arrow_down");
   elImg.setAttribute("alt", "NEXT");
  }
  
  elImg.setAttribute("width", "32");
  elImg.setAttribute("height", "32");
  
  return(elImg);
 };
 
 
 // 流れ図表示領域の横の長さを変える。
 this.adjustWidth = function (){
  var y = 0;
  
  if(this.selectedRoutine === 0){
   y = objControleStorageL.getMainRoutineY();
  }
  else{
   y = objControleStorageL.getSubRoutineY(this.selectedRoutine);
  }
  
  var width  = y * 201 + 40;
  
  var elSquaresArea = document.getElementById(this.idSquaresArea);
  elSquaresArea.style.width  = width + "px";
 };
 
 
 // 流れ図表示領域のclass 名を変更する。
 this.changeSquaresAreaClass = function (repeatType){
  var squaresAreaClassName = this.idSquaresArea + "_" + repeatType;
  document.getElementById(this.idSquaresArea).className = squaresAreaClassName;
 };
 
 
 // local storage 内の流れ図関連のデータから流れ図の2次元配列を作成し、
 // objLayoutFunctions.printAllItemSymbol() に渡すための条件を作り出す。
 this.makeFlowchartData = function () {
  var repeatType = objControleStorageL.getMainRoutineType();
  var loopType   = objControleStorageL.getMainRoutineLoop();
  
  var flowchartType = objControleStorageL.getSelectedFlowchart();
  var title      = objControleStorageL.getFlowchartTitle(flowchartType);
  
  this.mainRoutineType  = repeatType;
  this.mainRoutineTitle = title;
  
  this.valueRoutineType  = repeatType;
  this.valueRoutineTitle = title;
  this.valueLoopType     = loopType;
  
  var x = objControleStorageL.getMainRoutineX();
  var y = objControleStorageL.getMainRoutineY();
  
  if(x < 3){
   x = 3;
   objControleStorageL.setMainRoutineX(3);
  }
  if(y < 3){
   y = 3;
   objControleStorageL.setMainRoutineY(3);
  }
  
  for(var i = 0; i < x; i ++){
   this.mainRoutine[i] = new Array();
   
   for(var j = 0; j < y; j ++){
    var symbolItems = objControleStorageL.getMainRoutineSymbol(i, j);
    var itemType = symbolItems[0];
    var itemId   = symbolItems[1];
    
    if(itemType.length > 0){
     var serialNumber = this.getSerialNumber(itemType, itemId);
     
     this.mainRoutine[i][j] = new Object();
     this.mainRoutine[i][j]["item_type"]  = itemType;
     this.mainRoutine[i][j]["item_id"]    = itemId;
     this.mainRoutine[i][j]["serial_number"] = serialNumber;
     
     if(itemType === "jumper"){
      this.symbolList["jumper"][itemId]["serial_number"] = this.getSerialNumber("jumper", itemId);
     }
    }
    else{
     this.mainRoutine[i][j] = null;
    }
   }
  }
  
  // サブルーチンのデータを作り出す。
  var subRoutineIndexList = objControleStorageL.getSubRoutineList();
  for(var k = 0, l = subRoutineIndexList.length; k < l; k ++){
   var subRoutineIndex = subRoutineIndexList[k];
   
   this.itemIdList["sub"].push(subRoutineIndex);
   
   this.symbolList["sub"][subRoutineIndex] = new Object();
   this.symbolList["sub"][subRoutineIndex]["repeat_type"] = objControleStorageL.getSubRoutineType(subRoutineIndex);
   this.symbolList["sub"][subRoutineIndex]["title"] = objControleStorageL.getSubRoutineTitle(subRoutineIndex);
   this.symbolList["sub"][subRoutineIndex]["serial_number"] = this.getSerialNumber("sub", subRoutineIndex);
   
   x = objControleStorageL.getSubRoutineX(subRoutineIndex);
   y = objControleStorageL.getSubRoutineY(subRoutineIndex);
   
   if(x < 3){
    x = 3;
    objControleStorageL.setSubRoutineX(subRoutineIndex, 3);
   }
   if(y < 3){
    y = 3;
    objControleStorageL.setSubRoutineY(subRoutineIndex, 3);
   }
   
   this.subRoutine[subRoutineIndex] = new Array();
   for(i = 0; i < x; i ++){
    this.subRoutine[subRoutineIndex][i] = new Array();
    
    for(j = 0; j < y; j ++){
     symbolItems = objControleStorageL.getSubRoutineSymbol(subRoutineIndex, i, j);
     itemType = symbolItems[0];
     itemId   = symbolItems[1];
     
     if(itemType.length > 0){
      serialNumber = this.getSerialNumber(itemType, itemId);
      
      this.subRoutine[subRoutineIndex][i][j] = new Object();
      this.subRoutine[subRoutineIndex][i][j]["item_type"]  = itemType;
      this.subRoutine[subRoutineIndex][i][j]["item_id"]    = itemId;
      this.subRoutine[subRoutineIndex][i][j]["serial_number"] = serialNumber;
      
      if(itemType === "jumper"){
       this.symbolList["jumper"][itemId]["serial_number"] = this.getSerialNumber("jumper", itemId);
      }
     }
     else{
      this.subRoutine[subRoutineIndex][i][j] = null;
     }
    }
   }
  }
  
  // 条件を作る。
  var staticOptionList = new Object();
  for(itemType in this.serialNumberList){
   if((itemType === "command") || (itemType === "action") || (itemType === "ping")){
    staticOptionList[itemType] = new Array();
    for(itemId in this.serialNumberList[itemType]){
     staticOptionList[itemType].push(itemId);
    }
    
    if(staticOptionList[itemType].length === 0){
     delete(staticOptionList[itemType]);
    }
   }
  }
  
  return(staticOptionList);
 };
 
 
 // タイプ、ID 毎のシンボルの通し番号を更新して取り出す。
 this.getSerialNumber = function (itemType, itemId){
  if(itemId in this.serialNumberList[itemType]){
   this.serialNumberList[itemType][itemId] += 1;
  }
  else{
   this.serialNumberList[itemType][itemId] = 0;
  }
  
  var serialNumber = this.serialNumberList[itemType][itemId];
  
  return(serialNumber);
 };
 
 
 // シンボルの追加分のID
 this.makeSymbolNextId = function (idSymbol) {
  var symbolIdParts = objLayoutFunctions.parseSymbolId(idSymbol);
  var itemType   = symbolIdParts[0];
  var itemId     = symbolIdParts[1];
  var serialNumber = this.getSerialNumber(itemType, itemId);
  
  this.symbolList[itemType][itemId]["serial_number"] = serialNumber;
  idSymbol = objLayoutFunctions.makeSymbolId(itemType, itemId, serialNumber);
  
  return(idSymbol);
 };
 
 
 // objLayoutFunctions.getItemSymbol の結果全てをthis.itemIdList[itemType], this.symbolList[itemType] に値を格納する。
 this.insertSymbolData = function (itemIdList, itemSymbolList){
  for(var itemType in this.serialNumberList){
   if((itemType === "command") || (itemType === "action") || (itemType === "ping")){
    if(itemType in itemIdList){
     for(var i = 0, j = itemIdList[itemType].length; i < j; i ++){
      var itemId   = itemIdList[itemType][i];
      var title       = itemSymbolList[itemType][itemId]["title"];
      var repeatType  = itemSymbolList[itemType][itemId]["repeat_type"];
      var commandType = itemSymbolList[itemType][itemId]["command_type"];
      
      this.appendSymbolData(itemType, itemId, title, repeatType, commandType);
     }
    }
   }
  }
  
  var elButton = document.getElementById(this.idSearchButton);
  elButton.onclick = new Function("objFlowchart.get();");
  elButton.className = "enable";
 };
 
 
 // this.itemIdList[itemType], this.symbolList[itemType] に1件分のデータを新規で格納する。
 this.appendSymbolData = function (itemType, itemId, title, repeatType, commandType){
  // 未取得の場合のみ追加。
  if(!(itemId in this.symbolList[itemType])){
   var serialNumber = this.getSerialNumber(itemType, itemId);
   this.itemIdList[itemType].push(itemId);
   this.symbolList[itemType][itemId] = new Object();
   this.symbolList[itemType][itemId]["title"]         = title;
   this.symbolList[itemType][itemId]["repeat_type"]   = repeatType;
   this.symbolList[itemType][itemId]["command_type"]  = commandType;
   this.symbolList[itemType][itemId]["serial_number"] = serialNumber;
  }
 };
 
 // 1件分のデータを更新する。
 this.updateSymbolData = function (itemType, itemId, title, repeatType, commandType){
  if(itemType in this.symbolList){
   if(itemId in this.symbolList[itemType]){
    this.symbolList[itemType][itemId]["title"]        = title;
    this.symbolList[itemType][itemId]["repeat_type"]  = repeatType;
    this.symbolList[itemType][itemId]["command_type"] = commandType;
   }
  }
 };
 
 // 1件分のデータを削除する。
 this.removeSymbolData = function (itemType, itemId){
  if(itemId in this.symbolList[itemType]){
   for(var i = 0, j = this.itemIdList[itemType].length; i < j; i ++){
    shiftItemId = this.itemIdList[itemType].shift();
    if(shiftItemId !== itemId){
     this.itemIdList[itemType].push(shiftItemId);
    }
    else{
     i --;
     j --;
    }
   }
   
   delete(this.symbolList[itemType][itemId]);
   delete(this.serialNumberList[itemType][itemId]);
   
   // web storage と流れ図配列からも削除する。
   var x = objControleStorageL.getMainRoutineX();
   var y = objControleStorageL.getMainRoutineY();
   for(i = 0; i < x; i ++){
    for(j = 0; j < y; j ++){
     var symbolItems = objControleStorageL.getMainRoutineSymbol(i, j);
     
     if((symbolItems[0] === itemType) && (symbolItems[1] === itemId)){
      objControleStorageL.removeMainRoutineSymbol(i, j);
      this.mainRoutine[i][j] = null;
     }
    }
   }
   
   if((itemType === "command") || (itemType === "action") || (itemType === "ping")){
    for(var k = 0, l = this.itemIdList["sub"].length; k < l; k ++){
     var subRoutineIndex = this.itemIdList["sub"][k];
     
     x = objControleStorageL.getSubRoutineX(subRoutineIndex);
     y = objControleStorageL.getSubRoutineY(subRoutineIndex);
     for(i = 0; i < x; i ++){
      for(j = 0; j < y; j ++){
       symbolItems = objControleStorageL.getSubRoutineSymbol(subRoutineIndex, i, j);
       
       if((symbolItems[0] === itemType) && (symbolItems[1] === itemId)){
        objControleStorageL.removeSubRoutineSymbol(subRoutineIndex, i, j);
        this.subRoutine[subRoutineIndex][i][j] = null;
       }
      }
     }
    }
   }
  }
 };
 
 
 // シンボルエリアの入力欄に値を入れる。
 this.insertItemSymbolFieldValues = function () {
  var elSearchKeyword = document.getElementById(this.idSearchKeyword);
  var elSearchTitle   = document.getElementById(this.idSearchTitle);

  elSearchKeyword.value = this.valueSearchKeyword;
  elSearchTitle.value   = this.valueSearchTitle;
 };
 
 
 // ルーチン更新エリアの入力欄に値を入れる。
 this.insertRoutineListFieldValues = function (){
  var elRoutineTitle = document.getElementById(this.idRoutineTitle);
  var elRoutineType1 = document.getElementById(this.idRoutineType1);
  var elRoutineType2 = document.getElementById(this.idRoutineType2);
  var elLoopType     = document.getElementById(this.idLoopType);
  
  elRoutineTitle.value = this.valueRoutineTitle;
  
  if(this.valueRoutineType === 1){
   elRoutineType2.checked = false;
   elRoutineType1.checked = true;
   elLoopType.disabled = true; 
  }
  else if(this.valueRoutineType === 2){
   elRoutineType1.checked = false;
   elRoutineType2.checked = true;
   elLoopType.disabled = false;
  }
  
  if(this.valueLoopType === 0){
   elLoopType.checked = false;
  }
  else if(this.valueLoopType === 1){
   elLoopType.checked = true;
  }
 };
 
 
 // keyword の検索文字列を読み取る。
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
 
 
 // ルーチンの入力タイトルを読み取る。
 this.readRoutineTitle = function (){
  var valueRoutineTitle = document.getElementById(this.idRoutineTitle).value;
  
  if((valueRoutineTitle !== null) && (valueRoutineTitle !== undefined) && (valueRoutineTitle.length > 0)){
   this.valueRoutineTitle = valueRoutineTitle;
  }
  else{
   this.valueRoutineTitle = "";
  }
 };
 
 
 //ルーチンの繰り返しタイプを読み取る。
 this.readRoutineType = function (valueRoutineType) {
  this.valueRoutineType = parseInt(valueRoutineType, 10);
 };
 
 
 // 繰り返し型のループタイプを読み取る。
 this.readLoopType = function (){
  if(document.getElementById(this.idLoopType).checked){
   this.valueLoopType = 1;
  }
  else{
   this.valueLoopType = 0;
  }
 };
 
 
 // item データをサーバーから取り込む。
 this.get = function () {
  var elButton = document.getElementById(this.idSearchButton);
  elButton.onclick = null;
  elButton.className = "disable";
  
  var fuzzyOptionList = new Object();
  fuzzyOptionList["command"] = new Object();
  fuzzyOptionList["action"]  = new Object();
  fuzzyOptionList["ping"]    = new Object();
  
  fuzzyOptionList["command"]["keyword"] = this.valueSearchKeyword;
  fuzzyOptionList["command"]["title"]   = this.valueSearchTitle;
  fuzzyOptionList["action"]["keyword"]  = this.valueSearchKeyword;
  fuzzyOptionList["action"]["title"]    = this.valueSearchTitle;
  fuzzyOptionList["ping"]["keyword"]    = this.valueSearchKeyword;
  fuzzyOptionList["ping"]["title"]      = this.valueSearchTitle;
  
  objLayoutFunctions.getItemSymbol("flowchart", null, fuzzyOptionList);
 };
 
 
 // シンボルエリアと流れ図エリアの表示、非表示
 this.visibleItemSymbol = function () {
  for(var itemType in this.idItemSymbolArea){
   if(itemType === this.selectedItemType){
    $("#" + this.idItemSymbolArea[itemType]).fadeIn(200);
    document.getElementById(this.idItemType[itemType]).checked = true;
   }
   else{
    document.getElementById(this.idItemType[itemType]).checked = false;
    document.getElementById(this.idItemSymbolArea[itemType]).style.display = "none";
   }
  }
 };
 
 
 // 流れ図の表示、非表示
 this.visibleFlowchart = function () {
  if(this.selectedRoutine === 0){
   $("#" + this.idFlowchartTable(0)).fadeIn(200);
   document.getElementById(this.idRoutineRadio(0)).checked = true;
  }
  else{
   document.getElementById(this.idFlowchartTable(0)).style.display = "none";
   document.getElementById(this.idRoutineRadio(0)).checked = false;
  }
  
  for(var i = 0, j = this.itemIdList["sub"].length; i < j; i ++){
   if(this.itemIdList["sub"][i] === this.selectedRoutine){
    $("#" + this.idFlowchartTable(this.itemIdList["sub"][i])).fadeIn(200);
    document.getElementById(this.idRoutineRadio(this.itemIdList["sub"][i])).checked = true;
   }
   else{
    document.getElementById(this.idFlowchartTable(this.itemIdList["sub"][i])).style.display = "none";
    document.getElementById(this.idRoutineRadio(this.itemIdList["sub"][i])).checked = false;
   }
  }
 };
 
 
 // D & D されたシンボルの配置を記録する。
 this.saveSymbolPosition = function (idSymbol, idSquare) {
  var symbolIdParts = objLayoutFunctions.parseSymbolId(idSymbol);
  var itemType   = symbolIdParts[0];
  var itemId      = symbolIdParts[1];
  var serialNumber  = symbolIdParts[2];
  
  var squareItems = this.parseSquareId(idSquare);
  var routineIndex = squareItems[0];
  var x            = squareItems[1];
  var y            = squareItems[2];
  
  if(routineIndex === 0){
   if(this.mainRoutine[x][y] === null){
    this.mainRoutine[x][y] = new Object();
   }
   
   this.mainRoutine[x][y]["item_type"]   = itemType;
   this.mainRoutine[x][y]["item_id"]     = itemId;
   this.mainRoutine[x][y]["serial_number"] = serialNumber;
   
   objControleStorageL.setMainRoutineSymbol(x, y, itemType, itemId);
  }
  else{
   if(this.subRoutine[routineIndex][x][y] === null){
    this.subRoutine[routineIndex][x][y] = new Object();
   }
   
   this.subRoutine[routineIndex][x][y]["item_type"]   = itemType;
   this.subRoutine[routineIndex][x][y]["item_id"]     = itemId;
   this.subRoutine[routineIndex][x][y]["serial_number"] = serialNumber;
   
   objControleStorageL.setSubRoutineSymbol(routineIndex, x, y, itemType, itemId);
  }
 };
 
 
 // D & D されたシンボルの配置を削除する。
 this.removeSymbolPosition = function (idSquare) {
  var squareItems = this.parseSquareId(idSquare);
  var routineIndex = squareItems[0];
  var x            = squareItems[1];
  var y            = squareItems[2];
  
  if(routineIndex === 0){
   if(this.mainRoutine[x][y] !== null){
    delete(this.mainRoutine[x][y]["item_type"]);
    delete(this.mainRoutine[x][y]["item_id"]);
    delete(this.mainRoutine[x][y]["serial_number"]);
    this.mainRoutine[x][y] = null;
    
    objControleStorageL.removeMainRoutineSymbol(x, y);
   }
  }
  else{
   if(this.subRoutine[routineIndex][x][y] !== null){
    delete(this.subRoutine[routineIndex][x][y]["item_type"]);
    delete(this.subRoutine[routineIndex][x][y]["item_id"]);
    delete(this.subRoutine[routineIndex][x][y]["serial_number"]);
    this.subRoutine[routineIndex][x][y] = null;
    
    objControleStorageL.removeSubRoutineSymbol(routineIndex, x, y);
   }
  }
 };
 
 
 //
 // 以下D & D 関連の関数
 //
 
 // 移動対象の下にあるシンボルのID を取得する。
 this.ddItemSymbolAreaStart = function (idItemSymbolArea, idSymbol) {
  this.idNextSymbol = "";
  
  var symbolDomList = document.getElementById(idItemSymbolArea).childNodes;
  var isTargetId = false;
  
  CHECKID : for(var i = 0, j = symbolDomList.length; i < j; i ++){
   if(symbolDomList[i].id === idSymbol) {
    isTargetId = true;
    continue CHECKID;
   }
   
   if(isTargetId){
    if((symbolDomList[i].id !== null) && (symbolDomList[i].id !== undefined) && (symbolDomList[i].id.length > 0)){
     this.idNextSymbol = symbolDomList[i].id;
     break CHECKID;
    }
   }
  }
 };
 
 
 // 無くなったシンボルを複製して追加する。
 this.ddItemSymbolAreaRemove = function (idItemSymbolArea, idSymbol, symbolClass, titleClass, title) {
  // 追加用のシンボルのID を作成する。(末尾の数字に1 を足す。)
  idSymbol = this.makeSymbolNextId(idSymbol);
  
  var elDiv = objLayoutFunctions.makeSymbolDom(idSymbol, symbolClass, titleClass, title, true);
  
  // シンボルを追加する。
  var elItemSymbolArea = document.getElementById(idItemSymbolArea);
  if(this.idNextSymbol.length > 0){
   var elNextDiv = document.getElementById(this.idNextSymbol);
   elItemSymbolArea.insertBefore(elDiv, elNextDiv);
  }
  else{
   elItemSymbolArea.appendChild(elDiv);
  }
 };
 
 
 // 流れ図内でシンボルが移動開始したとき。
 this.ddSquareAreaStart = function (idSquare) {
  var elSquare = document.getElementById(idSquare);
  var innerItems = elSquare.childNodes;
  
  // 矢印を外す。
  for(var i = 0, j = innerItems.length; i < j; i ++){
   if((innerItems[i].tagName === "IMG") && (innerItems[i].className.match(/^arrow_/))){
    elSquare.removeChild(innerItems[i]);
    i --;
    j --;
   }
  }
  
  // 配置を削除する。
  this.removeSymbolPosition(idSquare);
 };
 
 
 // シンボルが移動されてきたとき。
 this.ddSquareAreaReceive = function (idSquare, idSymbol) {
  var elSymbol = document.getElementById(idSymbol);
  elSymbol.style.margin = "0 auto";
  
  // top:**px を追加する。
  var symbolIdParts = objLayoutFunctions.parseSymbolId(idSymbol);
  var itemType = symbolIdParts[0];
  if((itemType === "sub") || (itemType === "action")){
   elSymbol.style.top = "6px";
  }
  else if(itemType === "ping"){
   elSymbol.style.top = "13px";
  }
  else{
   elSymbol.style.top = "18px";
  }
  
  // 元々あったシンボルを削除する。
  var elSquare = document.getElementById(idSquare);
  var divList = elSquare.childNodes;
  
  for(var i = 0, j = divList.length; i < j; i ++){
   if((divList[i].id === null) || (divList[i].id === undefined) || (divList[i].id !== idSymbol)){
    elSquare.removeChild(divList[i]);
    i --;
    j --;
   }
  }
  
  // 矢印を加える。
  var imgItems = this.additionalArrowImg(itemType);
  for(var a = 0, b = imgItems.length; a < b; a ++){
   elSquare.appendChild(imgItems[a]);
  }
  
  // 最終行に加えられたら行を追加する。
  var squareItems = this.parseSquareId(idSquare);
  var routineIndex = squareItems[0];
  var x = squareItems[1];
  var y = squareItems[2];
  
  var rowCount = 3;
  var colCount = 3;
  
  if(routineIndex === 0){
   rowCount = objControleStorageL.getMainRoutineX();
   colCount = objControleStorageL.getMainRoutineY();
  }
  else{
   rowCount = objControleStorageL.getSubRoutineX(routineIndex);
   colCount = objControleStorageL.getSubRoutineY(routineIndex);
  }
  
  if(x === rowCount - 1){
   this.addRow(idSquare);
  }
  
  if(y === colCount - 1){
   this.addCol(idSquare);
  }
  
  // 配置を保存する。
  this.saveSymbolPosition(idSymbol, idSquare);
 };
 
 
  // 同じマス目にD & D されてきたとき。
 this.ddSquareAreaStop = function (idSquare, idSymbol) {
  var elSquare = document.getElementById(idSquare);
  var innerItems = elSquare.childNodes;
  
  if(innerItems.length > 0){
   // 矢印を加える。
   var itemIdParts = objLayoutFunctions.parseSymbolId(idSymbol);
   var itemType = itemIdParts[0];
   
   var imgItems = this.additionalArrowImg(itemType);
   for(var a = 0, b = imgItems.length; a < b; a ++){
    elSquare.appendChild(imgItems[a]);
   }
   
   // 配置を保存する。
   this.saveSymbolPosition(idSymbol, idSquare);
  }
 };
 
 
 // D & D のシンボルエリアの操作。
 this.ddItemSymbolAreaMain = function () {
  $(".item_symbol_area").sortable({
   connectWith : [".main_square", ".sub_square"],
   items : "div",
   start : function (event, ui) {
    var idItemSymbolArea = event.target.id;
    var idSymbol = ui.item.attr("id");
    
    objFlowchart.ddItemSymbolAreaStart(idItemSymbolArea, idSymbol);
   },
   remove : function(event, ui){
    var idItemSymbolArea = event.target.id;
    var idSymbol = ui.item.attr("id");
    var symbolClass = ui.item.attr("class");
    var elTitleList = ui.item.children("p");
    var titleClass = elTitleList[0].className;
    var title = elTitleList[0].innerHTML;
    
    objFlowchart.ddItemSymbolAreaRemove(idItemSymbolArea, idSymbol, symbolClass, titleClass, title);
   }
  });
 };
 
 
 // D & D の流れ図エリア
 this.ddSquareAreaMain = function () {
  // 右クリックメニュー
  $(".main_square").contextMenu(objFlowchart.idConTextMenu, objFlowchart.contextMenuSetting);
  
  // D & D
  $(".main_square").sortable({
   connectWith : ".main_square",
   items : "div",
   start : function (event, ui) {
    var idSquare = event.target.id;// 移動元のセルのID
    
    objFlowchart.ddSquareAreaStart(idSquare);
   },
   receive : function (event, ui){
    var idSquare = event.target.id;// 移動先のセルのID
    var idSymbol = ui.item.attr("id");// 移動されたシンボルのID
    
    objFlowchart.ddSquareAreaReceive(idSquare, idSymbol);
   },
   stop : function (event, ui) {
    var idSquare = event.target.id;
    var idSymbol = ui.item.attr("id");
    
    objFlowchart.ddSquareAreaStop(idSquare, idSymbol);
   }
  });
 };


 // D & D のシンボルエリアの操作。
 this.ddItemSymbolAreaSub = function () {
  $(".subroutine_symbol_area").sortable({
   connectWith : ".main_square",
   items : "div",
   start : function (event, ui) {
    var idItemSymbolArea = event.target.id;
    var idSymbol = ui.item.attr("id");
    
    objFlowchart.ddItemSymbolAreaStart(idItemSymbolArea, idSymbol);
   },
   remove : function(event, ui){
    var idItemSymbolArea = event.target.id;
    var idSymbol = ui.item.attr("id");
    var symbolClass = ui.item.attr("class");
    var elTitleList = ui.item.children("p");
    var titleClass = elTitleList[0].className;
    var title = elTitleList[0].innerHTML;
    
    objFlowchart.ddItemSymbolAreaRemove(idItemSymbolArea, idSymbol, symbolClass, titleClass, title);
   }
  });
 };
 
 
 // D & D の流れ図エリア
 this.ddSquareAreaSub = function () {
  // 右クリックメニュー
  $(".sub_square").contextMenu(objFlowchart.idConTextMenu, objFlowchart.contextMenuSetting);
  
  // D & D
  $(".sub_square").sortable({
   connectWith : ".sub_square",
   items : "div",
   start : function (event, ui) {
    var idSquare = event.target.id;// 移動元のセルのID
    
    objFlowchart.ddSquareAreaStart(idSquare);
   },
   receive : function (event, ui){
    var idSquare = event.target.id;// 移動先のセルのID
    var idSymbol = ui.item.attr("id");// 移動されたシンボルのID
    
    objFlowchart.ddSquareAreaReceive(idSquare, idSymbol);
   },
   stop : function (event, ui) {
    var idSquare = event.target.id;
    var idSymbol = ui.item.attr("id");
    
    objFlowchart.ddSquareAreaStop(idSquare, idSymbol);
   }
  });
 };
 
 
 // Web Storage の流れ図データをオブジェクトにする。
 this.makeFlowchartObject = function () {
  var flowchart = new Object();
  flowchart["0"] = new Array();
  
  var x = objControleStorageL.getMainRoutineX();
  var y = objControleStorageL.getMainRoutineY();
  
  for(var i = 0; i < x; i ++){
   flowchart["0"][i] = new Array();
   
   for(var j = 0; j < y; j ++){
    var value = objControleStorageL.getMainRoutineSymbol(i, j, true);
    flowchart["0"][i][j] = value;
   }
  }
  
  var subRoutineIndexList = objControleStorageL.getSubRoutineList();
  for(var k = 0, l = subRoutineIndexList.length; k < l; k ++){
   var subRoutineIndex = subRoutineIndexList[k];
   flowchart[subRoutineIndex] = this.makeSubroutineObject(subRoutineIndex);
  }
  
  return(flowchart);
 };
 
 // サブルーチンのデータをオブジェクトにする。
 this.makeSubroutineObject = function (subRoutineIndex){
  var subroutineData = new Array();
  
  x = objControleStorageL.getSubRoutineX(subRoutineIndex);
  y = objControleStorageL.getSubRoutineY(subRoutineIndex);
  
  for(i = 0; i < x; i ++){
   subroutineData[i] = new Array();
   
   for(j = 0; j < y; j ++){
    value = objControleStorageL.getSubRoutineSymbol(subRoutineIndex, i, j, true);
    subroutineData[i][j] = value;
   }
  }
  
  return(subroutineData); 
 };
 
 
 
 // Web Storage のルーチンの繰り返し型をオブジェクトにする。
 this.makeRoutineRepeatTypeObject = function () {
  var routineRepeatType = new Object();
  
  routineRepeatType["0"] = objControleStorageL.getMainRoutineType();
  
  var subRoutineIndexList = objControleStorageL.getSubRoutineList();
  for(var k = 0, l = subRoutineIndexList.length; k < l; k ++){
   var subRoutineIndex = subRoutineIndexList[k];
   routineRepeatType[subRoutineIndex] = objControleStorageL.getSubRoutineType(subRoutineIndex);
  }
  
  return(routineRepeatType);
 };
 
 
 // Web Storage のループタイプをオブジェクトにする。
 this.makeRoutineLoopTypeObject = function () {
  var routineLoopType = new Object();
  
  routineLoopType["0"] = objControleStorageL.getMainRoutineLoop();
  
  var subRoutineIndexList = objControleStorageL.getSubRoutineList();
  for(var k = 0, l = subRoutineIndexList.length; k < l; k ++){
   var subRoutineIndex = subRoutineIndexList[k];
   routineLoopType[subRoutineIndex] = objControleStorageL.getSubRoutineLoop(subRoutineIndex);
  }
  
  return(routineLoopType);
 };
 
 
 // Web Storage のルーチンのタイトルをオブジェクトにする。
 this.makeRoutineTitleObject = function () {
  var routineTitle = new Object();
  
  var flowchartType = objControleStorageL.getSelectedFlowchart();
  routineTitle["0"] = objControleStorageL.getFlowchartTitle(flowchartType);
  
  var subRoutineIndexList = objControleStorageL.getSubRoutineList();
  for(var k = 0, l = subRoutineIndexList.length; k < l; k ++){
   var subRoutineIndex = subRoutineIndexList[k];
   routineTitle[subRoutineIndex] = objControleStorageL.getSubRoutineTitle(subRoutineIndex);
  }
  
  return(routineTitle);
 };
 
 
 // Web Storage の流れ図のデータをJSON にする。
 this.makeFlowchartDataJson = function () {
  var flowchart         = this.makeFlowchartObject();
  var routineRepeatType = this.makeRoutineRepeatTypeObject();
  var routineTitle      = this.makeRoutineTitleObject();
  var routineLoopType   = this.makeRoutineLoopTypeObject();
  
  var flowchartData = new Object();
  flowchartData["flowchart"] = flowchart;
  flowchartData["routine_repeat_type"] = routineRepeatType;
  flowchartData["routine_title"] = routineTitle;
  flowchartData["routine_loop_type"] = routineLoopType;
  
  var jsonFlowchartData = JSON.stringify(flowchartData);
  
  return(jsonFlowchartData);
 };
 
 // Web Storage のサブルーチンのデータをJSON にする。
 this.makeSubroutineDataJson = function(subRoutineIndex){
  var subroutine = this.makeSubroutineObject(subRoutineIndex);
  var title      = objControleStorageL.getSubRoutineTitle(subRoutineIndex);
  var repeatType = objControleStorageL.getSubRoutineType(subRoutineIndex);
  var loopType   = objControleStorageL.getSubRoutineLoop(subRoutineIndex);
  var x = objControleStorageL.getSubRoutineX(subRoutineIndex);
  var y = objControleStorageL.getSubRoutineY(subRoutineIndex);
  
  var subroutineData = new Object();
  subroutineData["subroutine"] = subroutine;
  subroutineData["title"] = title;
  subroutineData["repeat_type"] = repeatType;
  subroutineData["loop_type"] = loopType;
  subroutineData["x"] = x;
  subroutineData["y"] = y;
  
  var jsonSubroutineData = JSON.stringify(subroutineData);
  
  return(jsonSubroutineData);
 };
 
 
 // 流れ図のデータをWeb Storage に入れる。
 this.setFlowchartData = function (flowchartData) {
  var subRoutineIndexList = new Array();
  
  for(routineIndex in flowchartData["flowchart"]){
   var x          = flowchartData["flowchart"][routineIndex].length;
   var y          = flowchartData["flowchart"][routineIndex][0].length;
   var title      = flowchartData["routine_title"][routineIndex];
   var repeatType = flowchartData["routine_repeat_type"][routineIndex];
   var loopType   = flowchartData["routine_loop_type"][routineIndex];
   
   if(routineIndex === "0"){
    var flowchartType = objControleStorageL.getSelectedFlowchart();
    objControleStorageL.setFlowchartTitle(flowchartType, title);
    
    if(flowchartType === "middle"){
     objControleStorageL.setSessionTitle(title);
    }
    
    objControleStorageL.setMainRoutineType(repeatType);
    objControleStorageL.setMainRoutineLoop(loopType);
    objControleStorageL.setMainRoutineX(x);
    objControleStorageL.setMainRoutineY(y);
    
    for(var i = 0; i < x; i ++){
     for(var j = 0; j < y; j ++){
      var itemTypeId = flowchartData["flowchart"]["0"][i][j];
      if((itemTypeId !== null) && (itemTypeId !== undefined) && (itemTypeId.length > 0)){
       var itemTypeIdList = itemTypeId.split(/\s+/);
       var itemType = itemTypeIdList[0];
       var itemId   = itemTypeIdList[1];
       objControleStorageL.setMainRoutineSymbol(i, j, itemType, itemId);
      }
     }
    }
   }
   else{
    subRoutineIndexList.push(parseInt(routineIndex, 10));
    
    objControleStorageL.setSubRoutineTitle(routineIndex, title);
    objControleStorageL.setSubRoutineType(routineIndex, repeatType);
    objControleStorageL.setSubRoutineLoop(routineIndex, loopType);
    objControleStorageL.setSubRoutineX(routineIndex, x);
    objControleStorageL.setSubRoutineY(routineIndex, y);
    
    for(i = 0; i < x; i ++){
     for(j = 0; j < y; j ++){
      itemTypeId = flowchartData["flowchart"][routineIndex][i][j];
      if((itemTypeId !== null) && (itemTypeId !== undefined) && (itemTypeId.length > 0)){
       itemTypeIdList = itemTypeId.split(/\s+/);
       itemType = itemTypeIdList[0];
       itemId   = itemTypeIdList[1];
       objControleStorageL.setSubRoutineSymbol(routineIndex, i, j, itemType, itemId);
      }
     }
    }
   }
  }
  
  subRoutineIndexList = subRoutineIndexList.sort(
   function(a, b){
    return(a - b);
   }
  );
  
  objControleStorageL.setSubRoutineList(subRoutineIndexList);
  
  var maxSubRoutineIndex = 0;
  if(subRoutineIndexList.length > 0){
   maxSubRoutineIndex = subRoutineIndexList.pop();
  }
  objControleStorageL.setLastSubRoutineIndex(maxSubRoutineIndex);
 };
 
 
 // 流れ図データをJSON のテキストファイルで出力する。
 this.downloadFlowchart = function () {
  var flowchartDataJsonFileName = this.makeFlowchartFileName();
  var jsonFlowchartData = this.makeFlowchartDataJson();
  
  var blob = new Blob([jsonFlowchartData], {"type" : "text/plain"});
  
  window.URL = window.URL || window.webkitURL;
  
  var elDownlodJson = document.getElementById(this.idDownloadFlowchartData);
  elDownlodJson.setAttribute("download", flowchartDataJsonFileName);
  elDownlodJson.setAttribute("href", window.URL.createObjectURL(blob));
 };
 
 
 // 流れ図データのファイル名を作る。 
 this.makeFlowchartFileName = function (){
  var flowchartType = objControleStorageL.getSelectedFlowchart();
  var sessionTitle  = objControleStorageL.getSessionTitle();
  var flowchartDataJsonFileName = objCommonFunctions.escapeFilename("Telnetman2_flowchart_" + flowchartType + "_" + sessionTitle + ".json");
  
  return(flowchartDataJsonFileName);
 };
 
 
 // 配列、連想配列などを全て空にする。
 this.initialize = function () {
  for(itemType in this.itemIdList){
   while(this.itemIdList[itemType].length > 0){
    var itemId = this.itemIdList[itemType].shift();
    
    delete(this.serialNumberList[itemType][itemId]);
    delete(this.symbolList[itemType][itemId]["repeat_type"]);
    delete(this.symbolList[itemType][itemId]["command_type"]);
    delete(this.symbolList[itemType][itemId]["title"]);
    delete(this.symbolList[itemType][itemId]["serial_number"]);
    delete(this.symbolList[itemType][itemId]);
   }
  }
  
  this.idNextSymbol = "";
  this.selectedItemType = "command";
  this.selectedRoutine = 0;
  this.mainRoutineType  = 1;
  this.mainRoutineTitle = "";
  this.valueLoopType = 0;
  this.valueSearchKeyword = "";
  this.valueSearchTitle = "";
  
  for(var subRoutineIndex in this.subRoutine){
   for(var i = this.subRoutine[subRoutineIndex].length - 1; i >= 0; i --){
    var j = this.subRoutine[subRoutineIndex][i].length;
    this.subRoutine[subRoutineIndex][i].splice(0, j);
    this.subRoutine[subRoutineIndex].splice(i, 1);
   }
  }
  
  for(i = this.mainRoutine.length - 1; i >= 0; i --){
   j = this.mainRoutine[i].length;
   this.mainRoutine[i].splice(0, j);
   this.mainRoutine.splice(i, 1);
  }
 };
 
 
 // Web Storage からこのセッションの流れ図データを全て削除する。
 this.clearStorageData = function () {
  var subRoutineList = objControleStorageL.getSubRoutineList();
  
  // サブルーチンの削除。
  for(var k = 0, l = subRoutineList.length; k < l; k ++){
   var subRoutineIndex = subRoutineList[k];
   
   var x = objControleStorageL.getSubRoutineX(subRoutineIndex);
   var y = objControleStorageL.getSubRoutineY(subRoutineIndex);
   
   for(var i = 0; i < x; i ++){
    for(var j = 0; j < y; j ++){
     objControleStorageL.removeSubRoutineSymbol(subRoutineIndex, i, j);
    }
   }
   
   objControleStorageL.removeSubRoutineX(subRoutineIndex);
   objControleStorageL.removeSubRoutineY(subRoutineIndex);
   objControleStorageL.removeSubRoutineTitle(subRoutineIndex);
   objControleStorageL.removeSubRoutineType(subRoutineIndex);
   objControleStorageL.removeSubRoutineLoop(subRoutineIndex);
  }
  
  objControleStorageL.removeSubRoutineList();
  objControleStorageL.removeLastSubRoutineIndex();
  
  // メインルーチンの削除。
  x = objControleStorageL.getMainRoutineX();
  y = objControleStorageL.getMainRoutineY();
  
  for(i = 0; i < x; i ++){
   for(j = 0; j < y; j ++){
    objControleStorageL.removeMainRoutineSymbol(i, j);
   }
  }
  
  objControleStorageL.removeMainRoutineX();
  objControleStorageL.removeMainRoutineY();
  objControleStorageL.removeMainRoutineType();
  objControleStorageL.removeMainRoutineLoop();
 };
 
 
 // 流れ図データかサブルーチンデータを取り込む。
 this.readFlowchartData = function (event) {
  var files = event.dataTransfer.files;
  
  if((files[0] !== null) && (files[0] !== undefined)){
   this.numberOfLoadingSubroutine = 0;
   var isFlowchart  = true;
   var isSubroutine = true;
   
   for(var i = 0, j = files.length; i < j; i ++){
    var fileName = files[i].name;
    
    if(isFlowchart && (fileName.match(/^Telnetman2_flowchart_/)) && (fileName.match(/\.json$/))){
     isSubroutine = false;
     
     // FileReaderオブジェクトの生成。
     var reader = new FileReader();
     reader.name = files[0].name;
     
     // ファイル読取が完了した際に呼ばれる処理を定義。
     reader.onload = function (event) {
      var text     = event.target.result;
      var fileName = event.target.name;
      
      var flowchartData = null;
      
      try{
       flowchartData = JSON.parse(text);
      }
      catch(error){
       alert("ファイルの内容がJSON 形式ではありません。\n" + error);
      }
      
      if(flowchartData !== null){
       var flowchartType = objControleStorageL.getSelectedFlowchart();
       objFlowchart.flowchartDataJsonFileName[flowchartType] = fileName;
       
       objFlowchart.initialize();
       objFlowchart.clearStorageData();
       
       objControleStorageL.setFlowchartData(flowchartType, text);
       
       objFlowchart.setFlowchartData(flowchartData);
       
       objFlowchart.isOpened = false;
       objFlowchart.print();
      }
     };
     
     // ファイルの内容を取得。
     reader.readAsText(files[0], 'utf8');
     
     // ブラウザ上でファイルを展開する挙動を抑止。
     event.preventDefault();
     
     break;
    }
    else if(isSubroutine && (fileName.match(/^Telnetman2_subroutine_/)) && (fileName.match(/\.json$/))){
     this.numberOfLoadingSubroutine += 1;
     isFlowchart = false;
     
     // FileReaderオブジェクトの生成。
     reader = new FileReader();
     
     // ファイル読取が完了した際に呼ばれる処理を定義。
     reader.onload = function (event) {
      var jsonSubroutineData = event.target.result;
      
      var subroutineData = null;
      
      try{
       subroutineData = JSON.parse(jsonSubroutineData);
      }
      catch(error){
       alert("ファイルの内容がJSON 形式ではありません。\n" + error);
      }
      
      if(subroutineData !== null){
       var subroutine = subroutineData["subroutine"];
       var title      = subroutineData["title"];
       var repeatType = subroutineData["repeat_type"];
       var loopType   = subroutineData["loop_type"];
       var x = subroutineData["x"];
       var y = subroutineData["y"];
       
       var subRoutineIndex = objControleStorageL.pushSubRoutineList();
       
       objControleStorageL.setSubRoutineTitle(subRoutineIndex, title);
       objControleStorageL.setSubRoutineType(subRoutineIndex, repeatType);
       objControleStorageL.setSubRoutineLoop(subRoutineIndex, loopType);
       objControleStorageL.setSubRoutineX(subRoutineIndex, x);
       objControleStorageL.setSubRoutineY(subRoutineIndex, y);
       
       for(var i = 0; i < x; i ++){
        for(var j = 0; j < y; j ++){
         var itemTypeId = subroutine[i][j];
         
         if((itemTypeId !== null) && (itemTypeId !== undefined) && (itemTypeId.length > 0)){
          var itemTypeIdList = itemTypeId.split(/\s+/);
          var itemType = itemTypeIdList[0];
          var itemId   = itemTypeIdList[1];
          
          objControleStorageL.setSubRoutineSymbol(subRoutineIndex, i, j, itemType, itemId);
         }
        }
       }
      }
      
      objFlowchart.numberOfLoadingSubroutine -= 1;
      
      if(objFlowchart.numberOfLoadingSubroutine === 0){
       objFlowchart.initialize();
       objFlowchart.isOpened = false;
       objFlowchart.print();
      }
     };
     
     // ファイルの内容を取得。
     reader.readAsText(files[i], 'utf8');
     
     // ブラウザ上でファイルを展開する挙動を抑止。
     event.preventDefault();
    }
    else{
     alert("ファイル名が違います。\n" + fileName);
    }
   }
  }
  else{
   alert("取り込めませんでした。\n圧縮ファイルをドラッグ&ドロップしませんでしたか?\n解凍してからもう一度試して下さい。");
  }
 };
 
 
 // 初めてこのページを開いた状態にする。
 this.reset = function () {
  var elButton = document.getElementById(this.idRestButton);
  elButton.className = "disable";
  elButton.onclick = null;
  
  this.initialize();
  this.isOpened = false;
  this.print();
 };
 
 
 // 真っさらにする。
 this.clear = function(){
  if(confirm("流れ図を空にしますか?")){
   var elButton = document.getElementById(this.idClearButton);
   elButton.className = "disable";
   elButton.onclick = null;
   
   this.initialize();
   this.clearStorageData();
   this.isOpened = false;
   this.print();
  }
 };
 
 return(this);
}
