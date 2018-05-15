// 説明   : 画面の視覚効果
// 作成者 : 江野高広
// 作成日 : 2014/06/05
// 更新 2016/05/20 : session index 0 のデータが作られる問題を解消。
// 更新   : 2017/08/22 Ver2 用に大幅に更新。


var objLayoutFunctions = new layoutFunctions();

function layoutFunctions () {
 // コマンドシンボルをクリックしたときの座標。
 this.mouseX = 0;
 this.mouseY = 0;
 
 // this.updateSessionStatus を2秒お気に動かすときのID
 this.intervalId = undefined;
 
 // タイトルのID
 this.idTitle = "title_string";
 
 // タイトルの表示を切り替える。
 this.changeTitle = function () {
  var page = objControleStorageL.getPage();
  var title = this.pageTitle(page, true);
  
  var elSpanTitle = document.getElementById(this.idTitle);
  
  elSpanTitle.style.display = "none";
  elSpanTitle.innerHTML = title;
  
  $('#' + this.idTitle).fadeIn(300);
 };
 
 // ページタイトル
 this.pageTitle = function (page, escapeFlag) {
  var title = "";
  
  if(page === "parameter"){
   title = "変数設定 & 実行";
  }
  else if(page === "flowchart"){
   title = "流れ図作成";
  }
  else if(page === "command"){
   title = "コマンド";
  }
  else if(page === "action"){
   title = "アクション";
  }
  else if(page === "ping"){
   title = "ping";
  }
  else if(page === "conversion_script"){
   title = "変換スクリプト";
  }
  else if(page === "export_import"){
   title = "データ入出力";
  }
  
  if(escapeFlag){
   page = objCommonFunctions.escapeHtml(page);
  }
  
  return(title);
 };
 
 
 // ブラウザ上でファイルを展開する挙動を抑止
 this.onDragOver = function (event) {
  event.preventDefault();
 };
 
 
 // 右上のメニューにマウスオーバーしたときの効果を付ける。
 this.addTitleEffect = function () {
  $(document).ready(function(){
   $("img.change_page_icon").hover(function() {
    $(this).stop().animate({top:-6, left:-6}, 180);
   },
   function() {
    $(this).stop().animate({top:0, left:0}, 180);
   });
  });
 };
 
 
 // コマンドの内容などの表示table のID
 this.idItemViewTable = "telnetman_item_view_table";
 
 // コマンドの内容の表示table を消す。
 this.removeItemViewTable = function () {
  $("#" + this.idItemViewTable).effect('fade', '', 200, function (){objCommonFunctions.unlockScreen();});
 };
 
 
 // 背景と文字の色を変えてグレーアウトさせる。
 this.grayOut = function (id) {
  var el = document.getElementById(id);
  var crrentClassName = el.className;
  
  if((crrentClassName !== null) && (crrentClassName !== undefined) && (crrentClassName.length > 0)){
   var splitClassName = crrentClassName.split(" ");
   
   var isDisable = false;
   for(var i = 0, j = splitClassName.length; i < j; i ++){
    if(splitClassName[i] === "disable"){
     isDisable = true;
     break;
    }
   }
   
   if(!isDisable){
    splitClassName.push("disable");
    el.className = splitClassName.join(" ");
   }
  }
  else{
   el.className = "disable";
  }
 };
 
 
 // グレーアウトを取り除く。
 this.removeGrayOut = function (id) {
  var el = document.getElementById(id);
  var crrentClassName = el.className;
  
  if((crrentClassName !== null) && (crrentClassName !== undefined) && (crrentClassName.length > 0)){
   var splitClassName = crrentClassName.split(" ");
   
   var isDisable = false;
   for(var i = 0, j = splitClassName.length; i < j; i ++){
    var shiftClassName = splitClassName.shift();
    if(shiftClassName !== "disable"){
     shiftClassName.push(shiftClassName);
    }
    else{
     isDisable = true;
    }
   }
   
   if(isDisable){
    el.className = splitClassName.join(" ");
   }
  }
 };
 
 
 // シンボルに回転のアニメーションを付ける。
 this.rotateSymbol = function (idSymbol){
  var elSymbol = document.getElementById(idSymbol);
  var crrentClassName = elSymbol.className;
  
  if((crrentClassName !== null) && (crrentClassName !== undefined) && (crrentClassName.length > 0)){
   var splitClassName = crrentClassName.split(" ");
   splitClassName.push("rotate_symbol");
   elSymbol.className = splitClassName.join(" ");
  } 
 };
 
 // シンボルから回転アニメーションを取る。
 this.fixSymbol = function (idSymbol){
  var elSymbol = document.getElementById(idSymbol);
  var crrentClassName = elSymbol.className;
  
  if((crrentClassName !== null) && (crrentClassName !== undefined) && (crrentClassName.length > 0)){
   var splitClassName = crrentClassName.split(" ");
   
   for(var i = splitClassName.length - 1; i >= 0; i --){
    if(splitClassName[i] === "rotate_symbol"){
     splitClassName.splice(i, 1);
    }
   }
   
   elSymbol.className = splitClassName.join(" ");
  }
 };
 
 
 // シンボルのID
 this.makeSymbolId = function (itemType, itemId, serialNumber){
  if((serialNumber === null) || (serialNumber === undefined) || (serialNumber.length === 0)){
   serialNumber = 0;
  }
  
  return(itemType + "_" + itemId + "_" + serialNumber);
 };
 
 
 // シンボルのID からエレメントタイプとエレメントID とシリアルナンバーを取り出す。
 this.parseSymbolId = function (idSymbol){
  var splitIdSymbol = idSymbol.split("_");
  var itemType  = splitIdSymbol.shift();
  var serialNumber = splitIdSymbol.pop();
  var itemId    = splitIdSymbol.join("_");
  
  serialNumber = parseInt(serialNumber, 10);
  
  return([itemType, itemId, serialNumber]);
 };
 
 
 // シンボルのクラス名を作成する。
 this.makeSymbolClassName = function (itemType, repeatType, commandType) {
  if((repeatType === null) || (repeatType === undefined) || (repeatType.length === 0)){
   repeatType = 1;
  }
  
  if((commandType === null) || (commandType === undefined)){
   commandType = itemType;
  }
  else if((typeof(commandType) === "number") && (commandType === 1)){
   commandType = "show";
  }
  else if((typeof(commandType) === "number") && (commandType === 2)){
   commandType = "conft";
  }
  else if((typeof(commandType) === "number") && (commandType === 3)){
   commandType = "etc";
  }
  else{
   commandType = itemType;
  }
  
  return("item_symbol_" + itemType + "_" + commandType + "_" + repeatType);
 };
 
 // コマンドタイトルのクラス名を作成する。
 this.makeSymbolTitleClassName = function (itemType, repeatType, commandType) {
  if((repeatType === null) || (repeatType === undefined) || (repeatType.length === 0)){
   repeatType = 1;
  }
  
  if((commandType === null) || (commandType === undefined)){
   commandType = itemType;
  }
  else if((typeof(commandType) === "number") && (commandType === 1)){
   commandType = "show";
  }
  else if((typeof(commandType) === "number") && (commandType === 2)){
   commandType = "conft";
  }
  else if((typeof(commandType) === "number") && (commandType === 3)){
   commandType = "etc";
  }
  else{
   commandType = itemType;
  }
  
  return("item_title_" + itemType + "_" + commandType + "_" + repeatType);
 };
 
 
 // コマンドのシンボルを作成する。
 this.makeSymbolDom = function (idSymbol, symbolClass, titleClass, title, isEscaped) {
  if(!idSymbol.match(/^jumper_/) && !isEscaped){
   title = objCommonFunctions.escapeHtml(title);
  }
  
  var elP = document.createElement("p");
  elP.setAttribute("class", titleClass);
  elP.innerHTML = title;
  
  var elDiv = document.createElement("div");
  elDiv.setAttribute("class", symbolClass);
  elDiv.setAttribute("id", idSymbol);
  elDiv.appendChild(elP);
  
  elDiv.addEventListener("mousedown", function(event){
   objLayoutFunctions.mouseX = event.pageX;
   objLayoutFunctions.mouseY = event.pageY;
  },true);
  
  elDiv.addEventListener("mouseup", function(event){
   var mouseX = event.pageX;
   var mouseY = event.pageY;
   
   var buttonNumber = event.button;
   var idSymbol = "";
   var tag = event.target.tagName;
   if(tag === "DIV"){
    idSymbol = event.target.id;
   }
   else if(tag === "P"){
    idSymbol = event.target.parentNode.id;
   }
   
   if((idSymbol !== null) && (idSymbol !== undefined) && (idSymbol.length > 0)){
    var symbolIdParts = objLayoutFunctions.parseSymbolId(idSymbol);
    var itemType = symbolIdParts[0];
    var itemId   = symbolIdParts[1];
    
    if((mouseX === objLayoutFunctions.mouseX) && (mouseX === objLayoutFunctions.mouseX) && (buttonNumber === 0)){// 左クリック
     if(itemType === "command"){
      objCommand.getCommandData(itemId, 'update');
     }
     else if(itemType === "action"){
      objAction.getActionData(itemId, 'update');
     }
     else if(itemType === "ping"){
      objPing.getPingData(itemId, 'update');
     }
     else if(itemType === "sub"){
      objFlowchart.view(itemId);
     }
     else{
      event.preventDefault();
     }
    }
    else if((mouseX === objLayoutFunctions.mouseX) && (mouseX === objLayoutFunctions.mouseX) && (buttonNumber === 2)){// 右クリック
     if(itemType === "command"){
      objCommand.getCommandData(itemId, 'delete');
     }
     else if(itemType === "action"){
      objAction.getActionData(itemId, 'delete');
     }
     else if(itemType === "ping"){
      objPing.getPingData(itemId, 'delete');
     }
    }
   }
  },true);
  
  // デフォルトの右クリックは無効にする。
  elDiv.addEventListener("contextmenu", function(event){
   event.preventDefault();
  },true);
  
  return(elDiv);
 };
 
 
 // コマンドシンボルを置くdiv のID を生成する。
 this.itemSymbolAreaId = function (itemType){
  return(itemType + "_item_symbol_area");
 };
 
 
 // コマンドシンボルを作成、追加する。
 this.appendItemSymbol = function (itemType, title, repeatType, idSymbol, commandType){
  var symbolClass = this.makeSymbolClassName(itemType, repeatType, commandType);
  var titleClass  = this.makeSymbolTitleClassName(itemType, repeatType, commandType);
  
  var elDiv = this.makeSymbolDom(idSymbol, symbolClass, titleClass, title);
  var idItemSymbolArea = this.itemSymbolAreaId(itemType);
  
  document.getElementById(idItemSymbolArea).appendChild(elDiv);
  document.getElementById(idSymbol).style.display = "none";
  $("#" + idSymbol).fadeIn(300);
 };
 
 
 // getItemSymbol の結果に従ってappendItemSymbol を繰り返し呼び出す。
 this.printAllItemSymbol = function (itemType, itemIdList, symbolList){
  for(i = 0, j = itemIdList.length; i < j; i ++){
   var itemId     = itemIdList[i];
   var repeatType  = symbolList[itemId]["repeat_type"];
   var title       = symbolList[itemId]["title"];
   var commandType = symbolList[itemId]["command_type"];
   var serialNumber = 0;
   if("serial_number" in symbolList[itemId]){
    serialNumber = symbolList[itemId]["serial_number"];
   }
   
   var idSymbol = this.makeSymbolId(itemType, itemId, serialNumber);
   
   if(!document.getElementById(idSymbol)){
    this.appendItemSymbol(itemType, title, repeatType, idSymbol, commandType);
   }
  }
 };
 
 
 // 指定したコマンドのシンボルの作成に必要なデータを取得して表示する。
 this.getItemSymbol = function (page, staticOptionList, fuzzyOptionList) {
  var optionList = new Object();
  optionList["page"] = page;
  
  if((staticOptionList !== null) && (staticOptionList !== undefined)){
   optionList["static_option"] = JSON.stringify(staticOptionList);
  }
  
  if((fuzzyOptionList !== null) && (fuzzyOptionList !== undefined)){
   optionList["fuzzy_option"] = JSON.stringify(fuzzyOptionList);
  }
  
  var authHeader = makeAuthHeader();
  
  $.ajax({
   headers : {"telnetmanAuth" : authHeader},
   type : "post",
   url  : "/cgi-bin/Telnetman2/get_item_symbol.cgi",
   data : optionList,
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
        var page = hashResult["page"];
        var itemIdList = hashResult["item_id_list"];
        var itemSymbolList = hashResult["item_symbol_list"];
        
        if(page === "flowchart"){
         objFlowchart.insertSymbolData(itemIdList, itemSymbolList);
         objFlowchart.printAllItemSymbol();
        }
        else if(page === "command"){
         objCommand.insertCommandSymbolData(itemIdList, itemSymbolList);
         objLayoutFunctions.printAllItemSymbol("command", objCommand.commandIdList, objCommand.symbolList);
        }
        else if(page === "action"){
         objAction.insertActionSymbolData(itemIdList, itemSymbolList);
         objLayoutFunctions.printAllItemSymbol("action", objAction.actionIdList, objAction.symbolList);
        }
        else if(page === "ping"){
         objPing.insertPingSymbolData(itemIdList, itemSymbolList);
         objLayoutFunctions.printAllItemSymbol("ping", objPing.pingIdList, objPing.symbolList);
        }
        else if(page === "export_import"){
         objExportImport.displayItemSymbol(itemIdList, itemSymbolList);
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
 
 // onload でログイン、セッションの確認をする。
 this.checkLoginAndSession = function () {
  var authHeader = makeAuthHeader();
  
  $.ajax({
   headers : {"telnetmanAuth" : authHeader},
   type : "post",
   url  : "/cgi-bin/Telnetman2/template.cgi",
   data : {},
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
        objLayoutFunctions.startSession();
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
 
 
 // セッション選択後の動作。
 this.startSession = function () {
  this.setUpdateSessionStatus();
  objParameter.isOpened = false;
  
  var page = objControleStorageL.getPage();
  if(page === "parameter"){
   objParameter.print();
  }
  else if(page === "flowchart"){
   objFlowchart.print();
  }
  else if(page === "command"){
   objCommand.print();
  }
  else if(page === "action"){
   objAction.print();
  }
  else if(page === "ping"){
   objPing.print();
  }
  else if(page === "conversion_script"){
   objConversionScript.print();
  }
  else if(page === "export_import"){
   objExportImport.print();
  }
  
  this.changeTitle();
 };
 
 
 // セッションを終了して選択画面を出す。
 this.changeSession = function () {
  clearInterval(this.intervalId);
  this.intervalId = undefined;
  
  objControleStorageL.setSessionOpened(0);
  objControleStorageS.removeSessionId();
  objControleStorageS.removeSessionIndex();
  
  this.checkLoginAndSession();
 };
 
 
 // セッションステータスを更新する。
 this.updateSessionStatus = function () {
  var unixtime = objCommonFunctions.getUnixtime();
  objControleStorageL.setSessionActivateTime(unixtime);
  objControleStorageL.setSessionOpened(1);
 };
 
 
 // このセッションのアクティベーション時刻を2秒おきに更新させ、画面を閉じた閉じた時にセッション選択画面で選択可の状態にする。
 this.setUpdateSessionStatus = function () {
  var sessionIndex = objControleStorageS.getSessionIndex();
  if(sessionIndex > 0){
   if(this.intervalId === undefined){
    this.intervalId = setInterval("objLayoutFunctions.updateSessionStatus()", 2000);
   }
   
   window.onbeforeunload = function () {
    var sessionIndex = objControleStorageS.getSessionIndex();
    if(sessionIndex > 0){
     objControleStorageL.setSessionOpened(0);
    }
   };
  }
 };
 
 
 // ログアウト
 this.logout = function (){
  // 他のタブでログインしていないか確認する。
  var sessionIndexList = objControleStorageL.getSessionIndexList();
  var count = 0;
  for(var i = 0, j = sessionIndexList.length; i < j; i ++){
   var sessionIndex = sessionIndexList[i] ;
   var opened = objControleStorageL.getSessionOpened(sessionIndex);
   if(opened == 1){
    count ++;
   }
  }
  
  if(count == 1){
   var authHeader = makeAuthHeader();
   
   $.ajax({
    headers : {"telnetmanAuth" : authHeader},
    type : "post",
    url  : "/cgi-bin/Telnetman2/logout.cgi",
    data : {},
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
         objLayoutFunctions.stopStatus();
         location.href = "index.html";
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
  else if(count > 1){
   this.stopStatus();
   location.href = "index.html";
  }
  else if(count === 0){
   objControleStorageL.setLoginId("logout");
   location.href = "index.html";
  }
 };
 
 
 
 //
 // ページのステータス更新を止める。
 //
 this.stopStatus = function (){
  if(typeof(this.intervalId) === "number"){
   clearInterval(this.intervalId);
   this.intervalId = undefined;
  }
  
  sessionIndex = objControleStorageS.getSessionIndex();
  
  if(sessionIndex !== 0){
   objControleStorageL.setSessionOpened(0, sessionIndex);
  }       
         
  objTelnetmanSession.removeSessionStorage();
  objControleStorageL.setLoginId("logout");
 };
 
 
 
 //
 // item viewer をマウスホイールで上下移動させる。
 //
 this.addScrollEvent = function () {
  var elTable = document.getElementById(this.idItemViewTable);
  elTable.addEventListener("mousewheel", objLayoutFunctions.scrollItemViewer);
 };
 
 this.scrollItemViewer = function (event){
  var scrollDelta = event.wheelDelta;
  scrollDelta = parseInt(scrollDelta / 4, 10);
  
  var elTable = document.getElementById(objLayoutFunctions.idItemViewTable);
  var currentTop = elTable.getBoundingClientRect().top;
  
  var tableTop = currentTop + scrollDelta;
  
  elTable.style.top = tableTop.toString()  + "px";
  
  event.preventDefault();
 };
 
 this.removeScrollEvent = function (){
  var elTable = document.getElementById(this.idItemViewTable);
  elTable.removeEventListener("mousewheel", objLayoutFunctions.scrollItemViewer);
 };
 
 return(this);
}
