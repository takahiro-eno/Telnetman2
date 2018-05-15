// 説明   : セッション選択、作成、削除画面
// 作成日 : 2014/06/17
// 作成者 : 江野高広
// 更新   : 2018/01/30 syslog確認、diff、任意ログの設定をダウンロードできうように。
//                     縦にスクロールできるように。

var objTelnetmanSession = new telnetmanSession();

function telnetmanSession () {
 // HTML のid の接頭語と固定id
 this.idPrefix = "telnetman_session_";
 this.idFrame  = this.idPrefix + "frame";
 this.idUl     = this.idPrefix + "ul";
 this.idInput  = this.idPrefix + "input";
 this.idButton = this.idPrefix + "button";
 
 this.makeId = function (sessionIndex, sessionId) {
  var stringSessionIndex = "";
  
  if(sessionIndex !== 0){
   stringSessionIndex = sessionIndex.toString();
  }
  else{
   stringSessionIndex = sessionId;
  }
  
  var idSessionLi      = this.idPrefix + "li_"      + stringSessionIndex;
  var idSessionDiv     = this.idPrefix + "div_"     + stringSessionIndex;
  var idSessionTitle   = this.idPrefix + "title_"   + stringSessionIndex;
  var idSessionMessage = this.idPrefix + "message_" + stringSessionIndex;
  var idSessionDelete  = this.idPrefix + "delete_"  + stringSessionIndex;
  var idOtherBrowserResult = this.idPrefix + "other_browser_result_" + stringSessionIndex;
  
  return([idSessionLi, idSessionDiv, idSessionTitle, idSessionMessage, idSessionDelete, idOtherBrowserResult]);
 };
 
 
 this.sessionSort = new Array();// セッション作成時刻順にセッションID が格納される。
 this.sessionTitleList = new Object();// key : セッション ID, value : セッションタイトル
 this.maxSessionNumber = 5;// 最大セション数
 this.sessionIndexList = new Object();
 
 this.newSessionTitle = "";
 
 this.intervalId = "";
 
 
 // 変数を初期化
 this.initialize = function () {
  var lengthSessionSort = this.sessionSort.length;
  this.sessionSort.splice(0, lengthSessionSort);
  
  for(var sessionId in this.sessionTitleList){
   delete(this.sessionTitleList[sessionId]);
  }
  
  this.maxSessionNumber = 5;
  
  for(var sessionIndex in this.sessionIndexList){
   delete(this.sessionIndexList[sessionIndex]);
  }
 };
 
 
 
 // セッション情報一覧を受け取る。
 this.inputSessionList = function (sessionList) {
  this.initialize();
  
  var userId = sessionList["user_id"];
  objControleStorageS.setUserId(userId);
  
  for(var i = 0, j = sessionList["session_sort"].length; i < j; i ++){
   var sessionId = sessionList["session_sort"][i];
   this.sessionSort.push(sessionId);
  }
  
  for(sessionId in sessionList["session_title_list"]){
   var sessionTitle = sessionList["session_title_list"][sessionId];
   this.sessionTitleList[sessionId] = sessionTitle;
  }
  
  this.maxSessionNumber = sessionList["max_session_number"];
 };
 
 
 
 // 1セッションあたりのタイトルとメッセージを入れる枠を作る。
 this.makeTitleFrame = function (sessionIndex, sessionId) {
  var idList = this.makeId(sessionIndex, sessionId);
  var idSessionLi      = idList[0];
  var idSessionDiv     = idList[1];
  var idSessionTitle   = idList[2];
  var idSessionMessage = idList[3];
  var idSessionDelete  = idList[4];
  
  var elLi = document.createElement("li");
  elLi.setAttribute("id", idSessionLi);
  
  var elDiv = document.createElement("div");
  elDiv.setAttribute("id", idSessionDiv);
  elDiv.setAttribute("class", "session_title");
  
  var elSpanTitle = document.createElement("span");
  elSpanTitle.setAttribute("class", "session_title");
  elSpanTitle.setAttribute("id", idSessionTitle);
  
  var elSpanMessage = document.createElement("span");
  elSpanMessage.setAttribute("id", idSessionMessage);
  
  var elSpanDelete = document.createElement("span");
  elSpanDelete.setAttribute("id", idSessionDelete);
  
  var elH2 = document.createElement("h2");
  elH2.setAttribute("class", "session_title");
  var elP = document.createElement("p");
  elP.setAttribute("class", "session_message");
  
  elH2.appendChild(elSpanTitle);
  elP.appendChild(elSpanMessage);
  elP.appendChild(elSpanDelete);
  
  elDiv.appendChild(elH2);
  elDiv.appendChild(elP);
  
  elLi.appendChild(elDiv);
  
  return(elLi);
 };
 
 
 // タイトルの枠に要素を入れ込む。
 this.updateTitleElements = function (sessionIndex, sessionId) {
  var idList = this.makeId(sessionIndex, sessionId);
  var idSessionTitle   = idList[2];
  var idSessionMessage = idList[3];
  var idSessionDelete  = idList[4];
  
  var title  = objControleStorageL.getSessionTitle(sessionIndex);
  var opened = objControleStorageL.getSessionOpened(sessionIndex);
  
  var elSpanTitle   = document.getElementById(idSessionTitle);
  var elSpanMessage = document.getElementById(idSessionMessage);
  var elSpanDelete  = document.getElementById(idSessionDelete);
  
  if((title.length > 0) && (opened === 0)){
   elSpanTitle.innerHTML = objCommonFunctions.escapeHtml(title);
   
   elSpanMessage.innerHTML = "開く";
   elSpanMessage.onclick   = new Function("objTelnetmanSession.open(" + sessionIndex + ");");
   elSpanMessage.setAttribute("class", "session_message_enable");
   elSpanDelete.innerHTML  = "[削除]";
   elSpanDelete.onclick    = new Function("objTelnetmanSession.deleteSession(" + sessionIndex + ");");
   elSpanDelete.setAttribute("class", "session_delete_enable");
  }
  else if(title.length === 0){
   elSpanTitle.innerHTML = this.sessionTitleList[sessionId];
   
   elSpanMessage.innerHTML = "他のブラウザ、または、他のクライアントで作成したセッションです。";
   elSpanMessage.onclick   = new Function("objTelnetmanSession.getNodeList('" + sessionId + "');");
   elSpanMessage.setAttribute("class", "session_message_enable");
   elSpanDelete.innerHTML  = "[-]";
   elSpanDelete.onclick    = null;
   elSpanDelete.setAttribute("class", "session_delete_disable");
  }
  else if(opened === 1){
   elSpanTitle.innerHTML = objCommonFunctions.escapeHtml(title);
   
   elSpanMessage.innerHTML = "他のタブで開いています。";
   elSpanMessage.onclick   = null;
   elSpanMessage.setAttribute("class", "session_message_disable");
   elSpanDelete.innerHTML  = "[-]";
   elSpanDelete.onclick    = null;
   elSpanDelete.setAttribute("class", "session_delete_disable");
  }
 };
 
 
 // セッション選択画面の枠を作る。
 this.makeFrameHtml = function () {
  var html = "<div id='" + this.idFrame + "' class='session_frame'>" +
             "<div class='session_header_title'><span>session</span></div>" + 
             "<div class='session_header_link'><a href='index.html'>top</a></div>" +
             "<ul id='" + this.idUl + "'></ul>" +
             "<div class='session_create'>" +
             "<span>タイトル</span><input type='text' size='50' name='" + this.idInput + "' id='" + this.idInput + "' value=''><button class='enable' id='" + this.idButton + "' onclick='objTelnetmanSession.create();'>新規作成</button>" +
             "</div>" +
             "</div>";
  
  return(html);
 };
 
 
 // スクロールできるようにする。
 this.addScrollEvent = function () {
  var elFrame = document.getElementById(this.idFrame);
  elFrame.addEventListener("mousewheel", objTelnetmanSession.scrollFrame);
 };
 
 this.scrollFrame = function (event){
  var scrollDelta = event.wheelDelta;
  scrollDelta = parseInt(scrollDelta / 4, 10);
  
  var elFrame = document.getElementById(objTelnetmanSession.idFrame);
  var currentTop = elFrame.getBoundingClientRect().top;
  
  var frameTop = currentTop + scrollDelta;
  
  elFrame.style.top = frameTop.toString()  + "px";
  
  event.preventDefault();
 };
 
 this.removeScrollEvent = function (){
  var elFrame = document.getElementById(this.idFrame);
  elFrame.removeEventListener("mousewheel", objTelnetmanSession.scrollFrame);
 };
 
 
 // セッション選択画面を表示する。
 this.session = function () {
  var lastSessionIndex = objControleStorageS.getLastSessionIndex();
  if(lastSessionIndex > 0){
   if(typeof(objLayoutFunctions.intervalId) === "number"){
    clearInterval(objLayoutFunctions.intervalId);
    objLayoutFunctions.intervalId = undefined;
   }
  }
  
  var sessionIndex = objControleStorageS.getSessionIndex();
  if(sessionIndex > 0){
   objControleStorageL.setSessionOpened(0);
   objControleStorageS.removeSessionId();
   objControleStorageS.removeSessionIndex();
  }
  
  var html = this.makeFrameHtml();
  
  objCommonFunctions.lockScreen(html, this.idPrefix, "objTelnetmanSession.create()");
  var elUl = document.getElementById(this.idUl);
  
  for(var i = 0, j = this.sessionSort.length; i < j; i ++){
   var sessionId = this.sessionSort[i];
   
   sessionIndex = objControleStorageL.getSessionIndex(sessionId);
   var elLi = this.makeTitleFrame(sessionIndex, sessionId);
   
   elUl.appendChild(elLi);
   this.updateTitleElements(sessionIndex, sessionId);
   
   if(sessionIndex > 0){
    this.sessionIndexList[sessionIndex] = sessionIndex;
   }
  }
  
  // 他のブラウザで削除されたセッションがある場合はWeb Storage 内から関連データを削除する。
  var sessionIndexList = objControleStorageL.getSessionIndexList();
  var numberOfSession = sessionIndexList.length;
  if(numberOfSession > 0){
   for(i = numberOfSession - 1; i >= 0; i --){
    sessionIndex = sessionIndexList[i];
    
    if(!(sessionIndex in this.sessionIndexList)){
     sessionId = objControleStorageL.getSessionId(sessionIndex);
     this.removeSession(sessionId);
     sessionIndexList.splice(i, 1);
    }
   }
   
   objControleStorageL.setSessionIndexList(sessionIndexList);
  }
  
  $('#' + this.idFrame).fadeIn(200, function(){objTelnetmanSession.addScrollEvent();});
  
  if(this.intervalId.length === 0){
   this.intervalId = setInterval("objTelnetmanSession.checkSessionStatus();", 2000);
  }
 };
 
 
 // セッションステータスの表示の更新。
 this.checkSessionStatus = function (){
  var thresholdTime = objCommonFunctions.getUnixtime() - 5;
  
  for(var sessionIndex in this.sessionIndexList){
   var opend = objControleStorageL.getSessionOpened(sessionIndex);
   var sessionId = objControleStorageL.getSessionId(sessionIndex);
   var activateTime = objControleStorageL.getSessionActivateTime(sessionIndex);
   
   if(sessionId.length > 0){
    // ステータス上は開いていることになっているが、アクティベート時刻が5秒より前の場合は閉じていることにする。
    if((opend === 1) && (activateTime < thresholdTime)){
     objControleStorageL.setSessionOpened(0, sessionIndex);
    }
    
    this.updateTitleElements(sessionIndex, sessionId);
   }
   else{
    this.removeSessionTitle(sessionIndex);
   }
  }
 };
 
 
 // 入力されたセッションタイトルを読み出す。
 this.readNewSesiionTitle = function () {
  var sessionTitle = document.getElementById(this.idInput).value;
  
  if((sessionTitle !== null) && (sessionTitle !== undefined) && (sessionTitle.length > 0)){
   this.newSessionTitle = sessionTitle;
   
   return(true);
  }
  else{
   return(false);
  }
 };
 
 
 // セッションを新規作成する。
 this.create = function () {
  if(this.readNewSesiionTitle()){
   var authHeader = makeAuthHeader();
   
   $.ajax({
    headers : {"telnetmanAuth" : authHeader},
    type : "post",
    url  : "/cgi-bin/Telnetman2/create_session.cgi",
    data : {"session_title" : this.newSessionTitle},
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
       
       if(login === 1){
        var create = hashResult["create"];
        
        if(create === 1){
         var sessionId = hashResult["session_id"];
         var sessionIndex = objTelnetmanSession.insertNewSessionData(sessionId);
         
         var elUl = document.getElementById(objTelnetmanSession.idUl);
         var elLi = objTelnetmanSession.makeTitleFrame(sessionIndex);
         elUl.appendChild(elLi);
         objTelnetmanSession.updateTitleElements(sessionIndex);
         
         var idList = objTelnetmanSession.makeId(sessionIndex);
         var idSessionDiv = idList[1];
         document.getElementById(idSessionDiv).style.display = "none";
         
         $("#" + idSessionDiv).animate({height:'show'}, 200);
         document.getElementById(objTelnetmanSession.idInput).value = "";
        }
        else{
         var maxSessionNumber = hashResult["max_session_number"];
         alert("セッション数が上限の" + maxSessionNumber + "個に達しています。");
        }
       }
       else{
        objCommonFunctions.unlockScreen();
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
   alert("タイトルを入力して下さい。");
  }
 };
 
 
 // セッションを削除する。
 this.deleteSession = function (sessionIndex, sessionId) {
  var opened = 0;
  
  if((sessionIndex !== null) && (sessionIndex !== undefined) && (sessionIndex > 0)){
   opened    = objControleStorageL.getSessionOpened(sessionIndex);
   sessionId = objControleStorageL.getSessionId(sessionIndex);
  }
  
  if((opened === 0) && (sessionId !== null) && (sessionId !== undefined) && (sessionId.length > 0)){
   var authHeader = makeAuthHeader();
   
   $.ajax({
    headers : {"telnetmanAuth" : authHeader},
    type : "post",
    url  : "/cgi-bin/Telnetman2/delete_session.cgi",
    data : {"session_id" : sessionId},
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
       
       if(login === 1){
        var deleted = hashResult["delete"];
        
        if(deleted === 1){
         var sessionId = hashResult["session_id"];
         var sessionIndex = objControleStorageL.getSessionIndex(sessionId);
         
         objTelnetmanSession.removeSession(sessionId);
         objTelnetmanSession.removeSessionTitle(sessionIndex, sessionId);
        }
        else if(deleted === 0){
         alert("telnet 準備中、または、実行中のノードがあるため削除できませんでした。");
        }
        else{
         alert("削除しませんでした。");
        }
       }
       else{
        objCommonFunctions.unlockScreen();
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
  else if ((sessionId !== null) && (sessionId !== undefined) && (sessionId.length === 0)){
   this.removeSessionTitle(sessionIndex);
  }
  else{
   this.updateTitleElements(sessionIndex);
  }
 };
 
 
 // Web storage からこのセッションのデータを削除する。
 this.removeSession = function (sessionId) {
  var sessionIndex = objControleStorageL.getSessionIndex(sessionId);
  
  var title = objControleStorageL.getSessionTitle(sessionIndex);
  if(title.length > 0){
   
   // 流れ図の削除
   objControleStorageS.setSessionId(sessionId);
   objControleStorageS.setSessionIndex(sessionIndex);
   objFlowchart.clearStorageData();
   objControleStorageL.removeSelectedFlowchart();
   objControleStorageL.removeFlowchartData("middle");
   objControleStorageL.removeFlowchartData("before");
   objControleStorageL.removeFlowchartData("after");
   objControleStorageL.removeFlowchartTitle("middle");
   objControleStorageL.removeFlowchartTitle("before");
   objControleStorageL.removeFlowchartTitle("after");
   objControleStorageS.removeSessionId();
   objControleStorageS.removeSessionIndex();
   
   // 流れ図以外の削除
   objControleStorageL.removePage(sessionIndex);
   objControleStorageL.removeSessionTitle(sessionIndex);
   objControleStorageL.removeSessionActivateTime(sessionIndex);
   objControleStorageL.removeSessionOpened(sessionIndex);
   objControleStorageL.removeSessionIndex(sessionId);
   objControleStorageL.removeSessionId(sessionIndex);
   
   // session index list から削除。
   objControleStorageL.removeSessionIndexList(sessionIndex);
   delete(this.sessionIndexList[sessionIndex]);
   delete(this.sessionTitleList[sessionId]);
   for(var i = 0, j = this.sessionSort.length; i< j; i ++){
    if(this.sessionSort[i] === sessionId){
     this.sessionSort.splice(i, 1);
     break;
    }
   }
  }
 };
 
 
 // セッションタイトルの表示を隠す。
 this.removeSessionTitle = function (sessionIndex, sessionId) {
  var idList = this.makeId(sessionIndex, sessionId);
  var idSessionLi  = idList[0];
  var idSessionDiv = idList[1];
  
  var elDiv = document.getElementById(idSessionDiv);
  
  if((elDiv !== null) && (elDiv.style.display !== "none")){
   $("#" + idSessionDiv).effect('puff', '', 600, function () {
    var elLi = document.getElementById(idSessionLi);
    document.getElementById(objTelnetmanSession.idUl).removeChild(elLi);
   });
  }
 };
 
 
 // local storage, 定義した配列、変数に新規作成セッション分のデータを入れる。
 this.insertNewSessionData = function (sessionId){
  var sessionIndex = objControleStorageL.getLastSessionIndex() + 1;
  objControleStorageL.setLastSessionIndex(sessionIndex);
  
  objControleStorageL.setSessionIndex(sessionIndex, sessionId);
  objControleStorageL.setSessionId(sessionId, sessionIndex);
  objControleStorageL.setSessionTitle(this.newSessionTitle, sessionIndex);
  objControleStorageL.setSessionActivateTime(0, sessionIndex);
  objControleStorageL.setSessionOpened(0, sessionIndex);
  objControleStorageL.pushSessionIndexList(sessionIndex);
  
  this.sessionSort.push(sessionId);
  this.sessionTitleList[sessionId] = this.newSessionTitle;
  this.newSessionTitle = '';
  this.sessionIndexList[sessionIndex] = sessionIndex;
  
  return(sessionIndex);
 };
 
 
 // 選択したセッションを開く。
 this.open = function (sessionIndex) {
  var opened    = objControleStorageL.getSessionOpened(sessionIndex);
  var sessionId = objControleStorageL.getSessionId(sessionIndex);
  
  if((opened === 0) && (sessionId.length > 0)){
   var unixtime = objCommonFunctions.getUnixtime();
   objControleStorageL.setSessionActivateTime(unixtime, sessionIndex);
   objControleStorageL.setSessionOpened(1, sessionIndex);
   
   clearInterval(this.intervalId);
   this.intervalId = "";
   
   // 前回開いたセッションのIndex を確認する。
   var lastSessionIndex = objControleStorageS.getLastSessionIndex();
   
   // 違うセッションを開いた時はSession Storage を空にしてoperation.html に転送する。
   if((lastSessionIndex > 0) && (sessionIndex !== lastSessionIndex)){
    this.removeSessionStorage();
    
    // 選択したセッションのID とIndex をセッションストレージに記録する。
    objControleStorageS.setSessionId(sessionId);
    objControleStorageS.setSessionIndex(sessionIndex);
    objControleStorageS.setLastSessionId(sessionId);
    objControleStorageS.setLastSessionIndex(sessionIndex);
    
    $('#' + this.idFrame).effect('fade', '', 200, function(){objTelnetmanSession.removeScrollEvent(); objCommonFunctions.unlockScreen(); location.href = "operation.html";});
   }
   else{
    // 選択したセッションのID とIndex をセッションストレージに記録する。
    objControleStorageS.setSessionId(sessionId);
    objControleStorageS.setSessionIndex(sessionIndex);
    objControleStorageS.setLastSessionId(sessionId);
    objControleStorageS.setLastSessionIndex(sessionIndex);
    
    $('#' + this.idFrame).effect('fade', '', 200,
     function (){
      objTelnetmanSession.removeScrollEvent();
      objCommonFunctions.unlockScreen();
      
      var locationHref = location.href;
      
      if(locationHref.match(/operation\.html[#]*$/)){
       var page = objControleStorageS.getPage();
       
       if(page.length > 0){
        objLayoutFunctions.setUpdateSessionStatus();
       }
       else{
        objLayoutFunctions.startSession();
       }
      }
      else{
       location.href = "operation.html";
      }
     }
    );
   }
  }
  else if (sessionId.length === 0){
   this.removeSessionTitle(sessionIndex);
  }
  else{
   this.updateTitleElements(sessionIndex);
  }
 };
 
 
 // 他のブラウザで作成したセッションの結果を取得する。
 this.getNodeList = function (sessionId) {
  var authHeader = makeAuthHeader() + sessionId;
  
  $.ajax({
   headers : {"telnetmanAuth" : authHeader},
   type : "post",
   url  : "/cgi-bin/Telnetman2/check_status.cgi",
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
        // ログイン済、セッション指定済。
        
        var sessionId = hashResult["session_id"];
        var sessionStatus   = hashResult["session_status"];
        
        if(sessionStatus >= 0){
         var idList = objTelnetmanSession.makeId(0, sessionId);
         var idSessionLi      = idList[0];
         var idSessionDiv     = idList[1];
         var idSessionTitle   = idList[2];
         var idSessionMessage = idList[3];
         var idSessionDelete  = idList[4];
         var idOtherBrowserResult = idList[5];
         
         if((sessionStatus === 0) || (sessionStatus === 4)){
          var elSpanDelete  = document.getElementById(idSessionDelete);
          elSpanDelete.innerHTML = "[削除]";
          elSpanDelete.onclick   = new Function("objTelnetmanSession.deleteSession(null, '" + sessionId + "');");
          elSpanDelete.setAttribute("class", "session_delete_enable");
         }
         
         var elDiv = null;
         
         if(document.getElementById(idOtherBrowserResult)){
          $("#" + idOtherBrowserResult).effect('highlight', '', 800, function(){
           elDiv = document.getElementById(idOtherBrowserResult);
           var statusElements = elDiv.childNodes;
           for(var i = statusElements.length - 1; i >= 0; i --){
            elDiv.removeChild(statusElements[i]);
           }
           
           objTelnetmanSession.makeOtherBrowserResult(sessionId, idOtherBrowserResult, sessionStatus);
          });
         }
         else{
          elDiv = document.createElement("div");
          elDiv.setAttribute("id", idOtherBrowserResult);
          elDiv.setAttribute("class", "session_status_other_browser");
          elDiv.style.display = "none";
          
          document.getElementById(idSessionDiv).appendChild(elDiv);
          
          objTelnetmanSession.makeOtherBrowserResult(sessionId, idOtherBrowserResult, sessionStatus);
          
          $("#" + idOtherBrowserResult).animate({height:'show'}, 200);
         }
        }
        else{
         objTelnetmanSession.removeSessionTitle(null, sessionId);
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
 
 
 // 他のブラウザで作成したセッションのステータスを表示する。
 this.makeOtherBrowserResult = function (sessionId, idOtherBrowserResult, sessionStatus){
  var elDiv = document.getElementById(idOtherBrowserResult);
  var elPStatus = document.createElement("p");
  
  var elSpanStatus = document.createElement("span");
  
  if(sessionStatus === 0){
   elSpanStatus.innerHTML = "ステータス&nbsp;:&nbsp;新規作成";
   elPStatus.appendChild(elSpanStatus);
  }
  else if(sessionStatus === 1){
   elSpanStatus.innerHTML = "ステータス&nbsp;:&nbsp;一時停止";
   elPStatus.appendChild(elSpanStatus);
  }
  else if(sessionStatus === 2){
   elSpanStatus.innerHTML = "ステータス&nbsp;:&nbsp;待機中";
   elPStatus.appendChild(elSpanStatus);
  }
  else if(sessionStatus === 3){
   elSpanStatus.innerHTML = "ステータス&nbsp;:&nbsp;実行中";
   elPStatus.appendChild(elSpanStatus);
  }
  else if(sessionStatus === 4){
   elSpanStatus.innerHTML = "ステータス&nbsp;:&nbsp;終了";
   elPStatus.appendChild(elSpanStatus);
   
   var elImgLog = document.createElement("img");
   elImgLog.setAttribute("src", "img/file_extension_zip.png");
   elImgLog.setAttribute("width", "16");
   elImgLog.setAttribute("height", "16");
   elImgLog.setAttribute("alt", "download log");
   elImgLog.onclick = new Function("objParameter.getZipLog('" + sessionId + "')");
   
   elPStatus.appendChild(elImgLog);
  }
  
  elDiv.appendChild(elPStatus);
  
  if(sessionStatus >= 1){
   var elPDownloadPrameter        = document.createElement("p");
   var elPDownloadLoginInfo       = document.createElement("p");
   var elPDownloadTerminalMonitor = document.createElement("p");
   var elPDownloadDiff            = document.createElement("p");
   var elPDownloadOptionalLog     = document.createElement("p");
   var elPDownloadFlowchart       = document.createElement("p");
   
   var elSpanPrameter        = document.createElement("span");
   var elSpanLoginInfo       = document.createElement("span");
   var elSpanTerminalMonitor = document.createElement("span");
   var elSpanDiff            = document.createElement("span");
   var elSpanOptionalLog     = document.createElement("span");
   var elSpanFlowchart       = document.createElement("span");
   elSpanPrameter.innerHTML        = "パラメーターシート&nbsp;:&nbsp;";
   elSpanLoginInfo.innerHTML       = "ログイン情報&nbsp;:&nbsp;";
   elSpanTerminalMonitor.innerHTML = "SYSLOG 確認設定&nbsp;:&nbsp;";
   elSpanDiff.innerHTML            = "Diff 設定&nbsp;:&nbsp;";
   elSpanOptionalLog.innerHTML     = "任意ログ設定&nbsp;:&nbsp;";
   elSpanFlowchart.innerHTML       = "流れ図&nbsp;:&nbsp;";
   
   var elImgPrameter = document.createElement("img");
   elImgPrameter.setAttribute("src", "img/download.png");
   elImgPrameter.setAttribute("width", "16");
   elImgPrameter.setAttribute("height", "16");
   elImgPrameter.setAttribute("alt", "download parameter sheet");
   elImgPrameter.onclick = new Function("objTelnetmanSession.getSessionData('" + sessionId + "','parameter_sheet')");
   
   var elImgLoginInfo = document.createElement("img");
   elImgLoginInfo.setAttribute("src", "img/download.png");
   elImgLoginInfo.setAttribute("width", "16");
   elImgLoginInfo.setAttribute("height", "16");
   elImgLoginInfo.setAttribute("alt", "download login info");
   elImgLoginInfo.onclick = new Function("objTelnetmanSession.getSessionData('" + sessionId + "','login_info')");
   
   var elImgTerminalMonitor = document.createElement("img");
   elImgTerminalMonitor.setAttribute("src", "img/download.png");
   elImgTerminalMonitor.setAttribute("width", "16");
   elImgTerminalMonitor.setAttribute("height", "16");
   elImgTerminalMonitor.setAttribute("alt", "download login info");
   elImgTerminalMonitor.onclick = new Function("objTelnetmanSession.getSessionData('" + sessionId + "','terminal_monitor_values')");
   
   var elImgDiff = document.createElement("img");
   elImgDiff.setAttribute("src", "img/download.png");
   elImgDiff.setAttribute("width", "16");
   elImgDiff.setAttribute("height", "16");
   elImgDiff.setAttribute("alt", "download login info");
   elImgDiff.onclick = new Function("objTelnetmanSession.getSessionData('" + sessionId + "','diff_values')");
   
   var elImgOptionalLog = document.createElement("img");
   elImgOptionalLog.setAttribute("src", "img/download.png");
   elImgOptionalLog.setAttribute("width", "16");
   elImgOptionalLog.setAttribute("height", "16");
   elImgOptionalLog.setAttribute("alt", "download login info");
   elImgOptionalLog.onclick = new Function("objTelnetmanSession.getSessionData('" + sessionId + "','optional_log_values')");
   
   var elImgBeforeFlowchart = document.createElement("img");
   elImgBeforeFlowchart.setAttribute("src", "img/download.png");
   elImgBeforeFlowchart.setAttribute("width", "16");
   elImgBeforeFlowchart.setAttribute("height", "16");
   elImgBeforeFlowchart.setAttribute("alt", "download flowchart");
   elImgBeforeFlowchart.onclick = new Function("objTelnetmanSession.getSessionData('" + sessionId + "','before_flowchart')");
   
   var elImgMiddleFlowchart = document.createElement("img");
   elImgMiddleFlowchart.setAttribute("src", "img/download.png");
   elImgMiddleFlowchart.setAttribute("width", "16");
   elImgMiddleFlowchart.setAttribute("height", "16");
   elImgMiddleFlowchart.setAttribute("alt", "download flowchart");
   elImgMiddleFlowchart.onclick = new Function("objTelnetmanSession.getSessionData('" + sessionId + "','middle_flowchart')");
   
   var elImgAfterFlowchart = document.createElement("img");
   elImgAfterFlowchart.setAttribute("src", "img/download.png");
   elImgAfterFlowchart.setAttribute("width", "16");
   elImgAfterFlowchart.setAttribute("height", "16");
   elImgAfterFlowchart.setAttribute("alt", "download flowchart");
   elImgAfterFlowchart.onclick = new Function("objTelnetmanSession.getSessionData('" + sessionId + "','after_flowchart')");
   
   elPDownloadPrameter.appendChild(elSpanPrameter);
   elPDownloadPrameter.appendChild(elImgPrameter);
   
   elPDownloadLoginInfo.appendChild(elSpanLoginInfo);
   elPDownloadLoginInfo.appendChild(elImgLoginInfo);
   
   elPDownloadTerminalMonitor.appendChild(elSpanTerminalMonitor);
   elPDownloadTerminalMonitor.appendChild(elImgTerminalMonitor);
   
   elPDownloadDiff.appendChild(elSpanDiff);
   elPDownloadDiff.appendChild(elImgDiff);
   
   elPDownloadOptionalLog.appendChild(elSpanOptionalLog);
   elPDownloadOptionalLog.appendChild(elImgOptionalLog);
   
   elPDownloadFlowchart.appendChild(elSpanFlowchart);
   elPDownloadFlowchart.appendChild(elImgBeforeFlowchart);
   elPDownloadFlowchart.appendChild(elImgMiddleFlowchart);
   elPDownloadFlowchart.appendChild(elImgAfterFlowchart);
   
   elDiv.appendChild(elPDownloadPrameter);
   elDiv.appendChild(elPDownloadLoginInfo);
   elDiv.appendChild(elPDownloadTerminalMonitor);
   elDiv.appendChild(elPDownloadDiff);
   elDiv.appendChild(elPDownloadOptionalLog);
   elDiv.appendChild(elPDownloadFlowchart);
  }
 };
 
 
 // zip 圧縮したログをダウンロードする。
 this.getSessionData = function (sessionId, dataType) {
  var authHeader = makeAuthHeader();
  
  if((sessionId !== null) && (sessionId !== undefined) && (sessionId.length > 0)){
   authHeader += sessionId;
  }
  
  $.ajax({
   headers : {"telnetmanAuth" : authHeader},
   type : "post",
   url  : "/cgi-bin/Telnetman2/make_tmp_session_data.cgi",
   data : {
    "data_type" : dataType
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
        // ログイン済、セッション指定済。
        
        var result = hashResult["result"];
        
        if(result == 1){
         var session_id = hashResult["session_id"];
         var dataType   = hashResult["data_type"];
         location.href = "/cgi-bin/Telnetman2/get_tmp_session_data.cgi?session_id=" + session_id + "&data_type=" + dataType;
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
 
 
 // session storage を空にする。
 this.removeSessionStorage = function (){
  objControleStorageS.removeExit();
  objControleStorageS.removeConfigureEnd();
  objControleStorageS.removeConfigureTerminal();
  objControleStorageS.removeMoreCommand();
  objControleStorageS.removeMoreString();
  objControleStorageS.removeTerminalWidth();
  objControleStorageS.removeTerminalLength();
  objControleStorageS.removeEnablePassword();
  objControleStorageS.removeEnableCommand();
  objControleStorageS.removeEnablePrompt();
  objControleStorageS.removePasswordPrompt();
  objControleStorageS.removeUserPrompt();
  objControleStorageS.removeUser();
  objControleStorageS.removeService();
  objControleStorageS.removePort();
  objControleStorageS.removePrompt();
  objControleStorageS.removeTimeout();
  objControleStorageS.removeParameterList();
  objControleStorageS.removePage();
  objControleStorageS.removeDiffHeader1();
  objControleStorageS.removeDiffHeader2();
  objControleStorageS.removeDiffValue1();
  objControleStorageS.removeDiffValue2();
  objControleStorageS.removeOptionalLogHeader();
  objControleStorageS.removeOptionalLogValue();
  objControleStorageS.removeTerminalMonitorCommand();
  objControleStorageS.removeTerminalMonitorPattern();
  objControleStorageS.removeTerminalMonitorErrors();
  objControleStorageS.removeSessionId();
  objControleStorageS.removeSessionIndex();
  objControleStorageS.removeLastSessionId();
  objControleStorageS.removeLastSessionIndex();
 };
 
 return(this);
}
