// 説明   : コマンドのエクスポート、インポート画面。
// 作成日 : 2014/11/18
// 作成者 : 江野高広
// 更新 2016/05/20 : 管理者権限で所有者変更できるように。
//      2017/12/04 : Ver2 用に編集。

var objExportImport = new exportImport();

function exportImport () {
 // 入力欄の内容を格納する変数を定義。
 this.isOpened = false;
 
 this.idPrefix = "telnetman_export_import_";
 this.idButtonArea        = this.idPrefix + "button_area";
 this.idImportZone        = this.idPrefix + "import_zone";
 this.idResultArea        = this.idPrefix + "result_area";
 this.idExportButtonArea  = this.idPrefix + "export_anchor";
 this.idExportButton      = this.idPrefix + "export_button";
 this.idImportButton      = this.idPrefix + "import_button";
 this.idChangeOwnerTable  = this.idPrefix + "change_owner_table";
 this.idChangeOwnerButton = this.idPrefix + "change_owner_button";
 this.idUserIdList        = this.idPrefix + "user_id_list";
 this.idNewOwner          = this.idPrefix + "new_owner";
 this.idAdministrator     = this.idPrefix + "administrator";
 this.idSearchKeyword     = this.idPrefix + "seartch_keyword";
 this.idSearchTitle       = this.idPrefix + "seartch_title";
 
 this.commentDivId = function (itemType, itemId) {
  return(this.idPrefix + "comment_" + itemType + "_" + itemId);
 };
 
 this.checkBoxId = function (itemType, itemId) {
  return(this.idPrefix + "checkbox_" + itemType + "_" + itemId);
 };
 
 this.parseCheckBoxId = function (checkBoxId){
  var splitCheckBoxId = checkBoxId.split("_");
  
  splitCheckBoxId.splice(0, 4);
  
  var itemType = splitCheckBoxId.shift();
  var itemId   = splitCheckBoxId.join("_");
  
  return([itemType, itemId]);
 };
 
 this.exportCount = 0;
 this.exports = new Array();
 this.importCount = 0;
 this.imports = new Object();
 this.ownerChangeList = new Object();
 this.administrator = 0;
 
 this.dropedFileName = "";
 this.dropedFileText = "";
 
 this.valueSearchKeyword = "";
 this.valueSearchTitle   = "";
 
 this.isExportButton = true;
 this.isImportButton = false;
 this.isChageOwnerButton = false;
 
 this.order = "";
 
 // 画面描画。
 this.print = function () {
  objControleStorageL.setPage("export_import");
  objControleStorageS.setPage("export_import");
  
  this.initialize();
  
  var htmlButtonArea = "<div class='telnetman_exportInport_button_area' id='" + this.idButtonArea + "'>" +
                       "<div class='telnetman_exportInport_button_zone'>" +
                       "<table class='search_item_field'>" +
                       "<tr><td class='left'><span>タイトル</span><input type='text' spellcheck='false' autocomplete='off' placeholder='一部' style='width:170px;' id='" + this.idSearchTitle + "' value=''></td></tr>" +
                       "<tr><td class='left'><span>検索キーワード</span><input type='text' spellcheck='false' autocomplete='off' placeholder='前方一致' style='width:140px;' id='" + this.idSearchKeyword + "' value=''></td></tr>" +
                       "</table>" +
                       "</div>" +
                       "<div class='telnetman_exportInport_button_zone'>" +
                       "<h1>所有者変更</h1>" +
                       "<p><button class='enable' onclick='objExportImport.getItemList();'>対象一覧表示</button></p>" +
                       "<p><input type='text' id='" + this.idNewOwner + "' style='width:210px;' list='" + this.idUserIdList + "' value=''><datalist id='" + this.idUserIdList + "'></datalist><span>に</span><input type='checkbox' id='" + this.idAdministrator + "' value='1' onchange='objExportImport.checkAdministrator();'><label class='checkbox1' for='" + this.idAdministrator + "'>管理者権限で</label><button class='disable' id='" + this.idChangeOwnerButton + "'>譲渡する。</button></p>" +
                       "</div>" +
                       "<div class='telnetman_exportInport_button_zone'>" +
                       "<h1>Export<img src='img/help.png' width='16' height='16' alt='help' class='onclick_node' onclick='objTelnetmanHelp.help(\"export\");'></h1>" +
                       "<p><button class='enable' id='" + this.idExportButton + "' onclick='objExportImport.exportItem();'>登録内容&nbsp;抽出</button></p>" +
                       "<p>&#8594;<span id='" + this.idExportButtonArea + "'></span></p>" +
                       "</div>" +
                       "<div class='telnetman_exportInport_button_zone'>" +
                       "<h1>Import<img src='img/help.png' width='16' height='16' alt='help' class='onclick_node' onclick='objTelnetmanHelp.help(\"import\");'></h1>" +
                       "<div class='telnetman_exportInport_d_and_d_area' id='" + this.idImportZone + "' ondragover='objLayoutFunctions.onDragOver(event);' ondrop='objExportImport.onDrop(event);'><span>ここにドロップ<br>Telnetman2_Expors_****.txt</span></div>" +
                       "<p><button class='disable' id='" + this.idImportButton + "'>一括登録</button></p>" +
                       "</div>" +
                       "</div>";
  
  var htmlResultArea = "<div id='" + this.idResultArea + "' class='margin20'></div>";
  
  document.getElementById("object_area").innerHTML = htmlButtonArea;
  document.getElementById("build_area").innerHTML = htmlResultArea;
  
  document.getElementById(this.idButtonArea).style.display = "none";
  $("#" + this.idButtonArea).fadeIn(300);
  document.getElementById(this.idResultArea).style.display = "none";
  $("#" + this.idResultArea).fadeIn(300);
 };
 
 
 // 全て初期化する。
 this.initialize = function () {
  this.initializeOwnerChangeList();
  this.initializeImports();
  this.initializeExports();
  
  this.dropedFileName = "";
  this.dropedFileText = "";
  
  this.isExportButton = true;
  this.isImportButton = false;
  this.isChageOwnerButton = false;
  
  this.order = "";
 };
 
 
 // 画面右を空にする。
 this.emptyResultArea = function () {
  var elResultArea = document.getElementById(this.idResultArea);
  var resultElements = elResultArea.childNodes;
  for(var i = resultElements.length - 1; i >= 0; i --){
   elResultArea.removeChild(resultElements[i]);
  }
 };
 
 
 // 画面右にコマンドシンボルと結果のコメントを入れる。
 this.pushResultArea = function (itemType, itemId, repeatType, title, commandType, innerElement1, innerElement2) {
  // コマンドシンボルを作る。
  var idSymbol    = objLayoutFunctions.makeSymbolId(itemType, itemId, 1);
  var symbolClass = objLayoutFunctions.makeSymbolClassName(itemType, repeatType, commandType);
  var titleClass  = objLayoutFunctions.makeSymbolTitleClassName(itemType, repeatType, commandType);
  var elSymbolDiv = objLayoutFunctions.makeSymbolDom(idSymbol, symbolClass, titleClass, title);

  elSymbolDiv.style.cssFloat = "left";
  elSymbolDiv.style.clear    = "both";
  
  var elDiv = document.createElement("div");
  var idComentDiv = this.commentDivId(itemType, itemId);
  elDiv.setAttribute("id", idComentDiv );
  elDiv.className = "telnetman_exportImport_comment_div";
  elDiv.appendChild(innerElement1);
  
  if((innerElement2 !== null) && (innerElement2 !== undefined)){
   elDiv.appendChild(innerElement2);
  }
  
  document.getElementById(this.idResultArea).appendChild(elSymbolDiv);
  document.getElementById(this.idResultArea).appendChild(elDiv);
 };
 
 
 // 画面右にエラーメッセージとそのシンボルを入れる。
 this.pushErrorSymbol = function (errorMessage){
  // シンボル作成。
  var symbolClass = objLayoutFunctions.makeSymbolClassName("bug", 1);
  var titleClass  = objLayoutFunctions.makeSymbolTitleClassName("bug", 1);
  
  var elErrorSymbolDiv = document.createElement("div");
  elErrorSymbolDiv.className = symbolClass;
  
  var elErrorTitleSpan = document.createElement("span");
  elErrorTitleSpan.className = titleClass;
  
  elErrorSymbolDiv.appendChild(elErrorTitleSpan);
  
  // エラーメッセージ作成。
  var elDiv = document.createElement("div");
  elDiv.className = "telnetman_exportImport_comment_div";
  
  var elErorMessageSpan = document.createElement("span");
  elErorMessageSpan.innerHTML = errorMessage;
  
  elDiv.appendChild(elErorMessageSpan);
  
  document.getElementById(this.idResultArea).appendChild(elErrorSymbolDiv);
  document.getElementById(this.idResultArea).appendChild(elDiv);
 };
 
 
 // 事前、middle、事後の流れ図内のitem をまとめてリスト化する。
 this.makeItemList = function (){
  objFlowchart.archiveFlowchartData();
  var jsonMiddleFlowchartData = objControleStorageL.getFlowchartData("middle");
  var jsonBeforeFlowchartData = objControleStorageL.getFlowchartData("before");
  var jsonAfterFlowchartData  = objControleStorageL.getFlowchartData("after");
  
  var middleFlowchartData = JSON.parse(jsonMiddleFlowchartData);
  var beforeFlowchartData = JSON.parse(jsonBeforeFlowchartData);
  var afterFlowchartData  = JSON.parse(jsonAfterFlowchartData);
  
  var checkList = new Object();
  
  for(var routinIndex in middleFlowchartData["flowchart"]){
   for(var i = 0, x = middleFlowchartData["flowchart"][routinIndex].length; i < x; i ++){
    for(var j = 0, y = middleFlowchartData["flowchart"][routinIndex][i].length; j < y; j ++){
     var itemTypeId = middleFlowchartData["flowchart"][routinIndex][i][j];
     
     if((itemTypeId !== null) && (itemTypeId !== undefined) && (itemTypeId.length > 0)){
      var splitItemTypeId = itemTypeId.split(/\s/);
      var itemType = splitItemTypeId[0];
      var itemId   = splitItemTypeId[1];
      
      if((itemType === "command") || (itemType === "action") || (itemType === "ping")){
       if(!(itemType in checkList)){
        checkList[itemType]  = new Object();
       }
       
       if(!(itemId in checkList[itemType])){
        checkList[itemType][itemId] = 1;
       }
      }
     }
    }
   }
  }
  
  for(routinIndex in beforeFlowchartData["flowchart"]){
   for(i = 0, x = beforeFlowchartData["flowchart"][routinIndex].length; i < x; i ++){
    for(j = 0, y = beforeFlowchartData["flowchart"][routinIndex][i].length; j < y; j ++){
     itemTypeId = beforeFlowchartData["flowchart"][routinIndex][i][j];
     
     if((itemTypeId !== null) && (itemTypeId !== undefined) && (itemTypeId.length > 0)){
      splitItemTypeId = itemTypeId.split(/\s/);
      itemType = splitItemTypeId[0];
      itemId   = splitItemTypeId[1];
      
      if((itemType === "command") || (itemType === "action") || (itemType === "ping")){
       if(!(itemType in checkList)){
        checkList[itemType]  = new Object();
       }
       
       if(!(itemId in checkList[itemType])){
        checkList[itemType][itemId] = 1;
       }
      }
     }
    }
   }
  }
  
  for(routinIndex in afterFlowchartData["flowchart"]){
   for(i = 0, x = afterFlowchartData["flowchart"][routinIndex].length; i < x; i ++){
    for(j = 0, y = afterFlowchartData["flowchart"][routinIndex][i].length; j < y; j ++){
     itemTypeId = afterFlowchartData["flowchart"][routinIndex][i][j];
     
     if((itemTypeId !== null) && (itemTypeId !== undefined) && (itemTypeId.length > 0)){
      splitItemTypeId = itemTypeId.split(/\s/);
      itemType = splitItemTypeId[0];
      itemId   = splitItemTypeId[1];
      
      if((itemType === "command") || (itemType === "action") || (itemType === "ping")){
       if(!(itemType in checkList)){
        checkList[itemType]  = new Object();
       }
       
      if(!(itemId in checkList[itemType])){
        checkList[itemType][itemId] = 1;
       }
      }
     }
    }
   }
  }
  
  var itemList = new Object();
  for(itemType in checkList){
   itemList[itemType] = new Array();
   
   for(itemId in checkList[itemType]){
    itemList[itemType].push(itemId);
   }
  }
  
  return(itemList);
 };
 
 
 // アイテム一覧を取得する。
 this.getItemSymbol = function () {
  var valueSearchKeyword = document.getElementById(this.idSearchKeyword).value;
  var valueSearchTitle   = document.getElementById(this.idSearchTitle).value;
  
  this.valueSearchKeyword = "";
  this.valueSearchTitle   = "";
  
  if((valueSearchKeyword !== null) && (valueSearchKeyword !== undefined) && (valueSearchKeyword.length > 0)){
   this.valueSearchKeyword = valueSearchKeyword;
  }
  
  if((valueSearchTitle !== null) && (valueSearchTitle !== undefined) && (valueSearchTitle.length > 0)){
   this.valueSearchTitle = valueSearchTitle;
  }
  
  if((this.valueSearchKeyword.length > 0) || (this.valueSearchTitle.length > 0)){
   objLayoutFunctions.getItemSymbol("export_import",  null, {"command":{"keyword":this.valueSearchKeyword, "title":this.valueSearchTitle}, "action":{"keyword":this.valueSearchKeyword, "title":this.valueSearchTitle}, "ping":{"keyword":this.valueSearchKeyword, "title":this.valueSearchTitle}});
  }
  else{
   var itemList = this.makeItemList();
   objLayoutFunctions.getItemSymbol("export_import", itemList);
  }
 }; 
 
  
 // 所有者変更対象一覧を初期化する。
 this.initializeOwnerChangeList = function () {
  for(var itemType in this.ownerChangeList){
   for(var itemId in this.ownerChangeList[itemType]){
    delete(this.ownerChangeList[itemType][itemId]);
   }
   delete(this.ownerChangeList[itemType]);
  }
 };
 
 
 // コマンド一覧を取得する。
 this.getItemList = function () {
  this.emptyResultArea();
  
  this.initializeOwnerChangeList();
  this.order = "change_owner";
  
  this.getItemSymbol();
 };
 
 
 // アイテム一覧を表示。
 this.displayItemSymbol = function (itemIdList, itemSymbolList){
  var isfound = false;
  
  for(var itemType in itemIdList){
   isfound = true;
   this.ownerChangeList[itemType] = new Object();
   
   for(var i = 0, j = itemIdList[itemType].length; i < j; i ++){
    var itemId      = itemIdList[itemType][i];
    var title       = itemSymbolList[itemType][itemId]["title"];
    var repeatType  = itemSymbolList[itemType][itemId]["repeat_type"];
    var commandType = itemSymbolList[itemType][itemId]["command_type"];
    
    if(this.order === "change_owner"){
     var checkBoxId = this.checkBoxId(itemType, itemId);
     var elInput = document.createElement("input");
     elInput.setAttribute("type", "checkbox");
     elInput.setAttribute("id", checkBoxId);
     elInput.setAttribute("value", 1);
     elInput.checked = true;
     elInput.onchange = new Function("objExportImport.changeOwnerList(this.id);");
     
     var elLabel = document.createElement("label");
     elLabel.className = "checkbox1";
     elLabel.setAttribute("for", checkBoxId);
     elLabel.innerHTML = "変更対象にする";
     
     this.pushResultArea(itemType, itemId, repeatType, title, commandType, elInput, elLabel);
     this.ownerChangeList[itemType][itemId] = 1;
    }
    else if(this.order === "export"){
     this.getItemData(itemType, itemId);
    }
   }
  }
  
  if((this.order === "change_owner") && isfound){
   this.getUserList();
  }
  else if((this.order === "export") && !isfound){
   this.replaceExportButton();
  }
 };
 
 
 // 「譲渡する」のボタンを押せるように、または、押せないようにする。
 this.changeOwnerButton = function () {
  if(this.isChageOwnerButton){
   document.getElementById(this.idChangeOwnerButton).className = "enable";
   document.getElementById(this.idChangeOwnerButton).onclick = new Function("objExportImport.changeOwner();");
  }
  else{
   document.getElementById(this.idChangeOwnerButton).className = "disable";
   document.getElementById(this.idChangeOwnerButton).onclick = null;
  }
 };
 
 
 // 所有者変更対象にする、しない。
 this.changeOwnerList = function (checkBoxId){
  var itemTypeId = this.parseCheckBoxId(checkBoxId);
  var itemType = itemTypeId[0];
  var itemId   = itemTypeId[1];
  
  if(document.getElementById(checkBoxId).checked){
   this.ownerChangeList[itemType][itemId] = 1;
  }
  else{
   this.ownerChangeList[itemType][itemId] = 0;
  }
 };
 
 
 // ユーザー一覧を取得する。
 this.getUserList = function () {
  var authHeader = makeAuthHeader();
  
  $.ajax({
   headers : {"telnetmanAuth" : authHeader},
   type : "post",
   url  : "/cgi-bin/Telnetman2/get_user_list.cgi",
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
        var userIdList   = hashResult["user_id_list"];
        var userNameList = hashResult["user_name_list"];
        
        var elUserList = document.getElementById(objExportImport.idUserIdList);
        var userDataElements = elUserList.childNodes;
        for(var k = userDataElements.length - 1; k >= 0; k --){
         elUserList.removeChild(userDataElements[k]);
        }
        
        for(var i = 0, j = userIdList.length; i < j; i ++){
         var userId = userIdList[i];
         var userName = userNameList[userId];
         
         var elOption = document.createElement("option");
         elOption.setAttribute("value", userId);
         elOption.setAttribute("label", userName);
         
         elUserList.appendChild(elOption);
        }
        
        objExportImport.isChageOwnerButton = true;
        objExportImport.changeOwnerButton();
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
 
 
 // 管理者権限のcheck box の変更を記録する。
 this.checkAdministrator = function (){
  if(document.getElementById(this.idAdministrator).checked){
   this.administrator = 1;
  }
  else{
   this.administrator = 0;
  }
 };
 
 
 // 所有者を変更する。
 this.changeOwner = function () {
  var newOwnerId = document.getElementById(this.idNewOwner).value;
  
  if(newOwnerId.length > 0){
   var authAdminHeader = "";
   var authUserHeader  = "";
   
   if(this.administrator === 1){
    if(objTelnetmanAuth.check("objExportImport.changeOwner();")){
     authAdminHeader = objTelnetmanAuth.makeAuth();
     authUserHeader  = makeAuthHeader();
    }
   }
   else{
    authUserHeader = makeAuthHeader();
   }
   
   if(authUserHeader.length > 0){
    this.isChageOwnerButton = false;
    this.changeOwnerButton(); 
    var jsonOwnerChangeList = JSON.stringify(this.ownerChangeList);
    
    $.ajax({
     headers : {"telnetmanAuth" : authUserHeader, "telnetmanAuthAdmin" : authAdminHeader},
     type : "post",
     url  : "/cgi-bin/Telnetman2/change_owner.cgi",
     data : {
      "administrator" : this.administrator,
      "new_owner_id" : newOwnerId,
      "json_item_list" : jsonOwnerChangeList
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
        var login         = hashResult["login"];
        var session       = hashResult["session"];
        var administrator = hashResult["administrator"];
        var authAdmin     = hashResult["auth_admin"];
        
        if((administrator === 1) && (authAdmin === 0)){
         objTelnetmanAuth.reinput();
        }
        else{
         if(login === 1){
          if(session === 1){
           var result = hashResult["result"];
           
           if(result === 1){
            var changeOwnerReluts = hashResult["change_owner_results"];
            
            for(var itemType in changeOwnerReluts){
             for(var itemId in changeOwnerReluts[itemType]){
              var comment = changeOwnerReluts[itemType][itemId];
              var idCommentDiv = objExportImport.commentDivId(itemType, itemId);
              var elCommentDiv = document.getElementById(idCommentDiv);
              
              var commentElements = elCommentDiv.childNodes;
              for(var i = commentElements.length - 1; i >= 0; i --){
               elCommentDiv.removeChild(commentElements[i]);
              }
              
              var elSpan = document.createElement("span");
              elSpan.innerHTML = comment;
              
              elCommentDiv.appendChild(elSpan);
             }
            }
           }
           else{
            alert(hashResult["reason"]);
            objExportImport.isChageOwnerButton = true;
            objExportImport.changeOwnerButton();
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
  }
 };
 
 
 // エクスポートリストを初期化する。
 this.initializeExports = function () {
  var lengthExports = this.exports.length;
  this.exports.splice(0, lengthExports);
 };
 
 
 // 流れ図にあるコマンド, アクション、ping の内容全てをテキストで出力する。
 this.exportItem = function () {
  var elImg = document.createElement("img");
  elImg.setAttribute("src", "img/loading_16.gif");
  elImg.setAttribute("width", "16");
  elImg.setAttribute("height", "16");
  elImg.setAttribute("alt", "download");
  this.replaceExportButton(elImg);
  
  this.isExportButton = false;
  this.changeExportButton();
  this.exportCount = 0;
  this.initializeExports();
  this.emptyResultArea();
  this.order = "export";
  
  this.getItemSymbol();
 };
 
 
 // Export 対象のデータを取得する。
 this.getItemData = function (itemType, itemId){
  this.exportCount ++;
  
  var authHeader = makeAuthHeader();
  
  $.ajax({
   headers : {"telnetmanAuth" : authHeader},
   type : "post",
   url  : "/cgi-bin/Telnetman2/get_item_data.cgi",
   data : {
    "item_type" : itemType,
    "item_id"   : itemId,
    "operation" : "get"
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
        var result      = hashResult["result"];
        
        if(result === 1){
         var itemType = hashResult["item_type"];
         var itemId   = hashResult["item_id"];
         var repeatType  = hashResult["repeat_type"];
         var title       = hashResult["title"];
         var commandType = undefined;
       
         if(itemType === "command"){
          commandType = hashResult["command_type"];
         }
         
         delete(hashResult["login"]);
         delete(hashResult["session"]);
         delete(hashResult["result"]);
         delete(hashResult["operation"]);
         delete(hashResult["update_time"]);
         delete(hashResult["create_at"]);
         delete(hashResult["owner_name"]);
         delete(hashResult["user_id"]);
         
         var jsonItemData = JSON.stringify(hashResult);
         objExportImport.exports.push(jsonItemData);
         
         var elSpan = document.createElement("span");
         elSpan.innerHTML = "抽出済み。";
         
         objExportImport.pushResultArea(itemType, itemId, repeatType, title, commandType, elSpan);
        }
        else{//result
         itemType = "";
         itemId = "";
         
         if("item_type" in hashResult){
          itemType = hashResult["item_type"];
         }
         
         if("item_id" in hashResult){
          itemId   = hashResult["item_id"];
         }
         
         elSpan = document.createElement("span");
         elSpan.innerHTML = hashResult["reason"];
         
         if((itemType.length > 0) && (itemId.length > 0)){
          objExportImport.pushResultArea(itemType, itemId, 1, "Error", undefined, elSpan);
         }
         else{
          objExportImport.pushErrorSymbol(hashResult["reason"]);
         }
        }
       }
       else{//session
        objExportImport.pushErrorSymbol("セッションが確立していません。");
       }
      }
      else{//login
       objExportImport.pushErrorSymbol("login timeout");
      }
     }
     else{//cgi error
      objExportImport.pushErrorSymbol("CGI Error");
     }
    }
    
    objExportImport.exportCount --;
    
    if(objExportImport.exportCount === 0){
     var elA = objExportImport.makeDownloadButton();
     objExportImport.replaceExportButton(elA);
     
     objExportImport.isExportButton = true;
     objExportImport.changeExportButton();
    }
   },
   error : function (){
    objExportImport.exportCount --;
    
    if(objExportImport.exportCount === 0){
     elA = objExportImport.makeDownloadButton();
     objExportImport.replaceExportButton(elA);
     
     objExportImport.isExportButton = true;
     objExportImport.changeExportButton();
    }
   }
  });
 };
 
 
 // Export ボタンを押せるように、または、押せないようにする。
 this.changeExportButton = function () {
  if(this.isExportButton){
   document.getElementById(this.idExportButton).className = "enable";
   document.getElementById(this.idExportButton).onclick = new Function("objExportImport.exportItem();");
  }
  else{
   document.getElementById(this.idExportButton).className = "disable";
   document.getElementById(this.idExportButton).onclick = null;
  }
 };
 
 
 // Export 結果のダウンロードボタンを作る。
 this.makeDownloadButton = function () {
  var fileNamePart = "";
  
  if((this.valueSearchKeyword.length > 0) || (this.valueSearchTitle.length > 0)){
   if((this.valueSearchKeyword.length > 0) && (this.valueSearchTitle.length > 0)){
    fileNamePart = this.valueSearchKeyword + "_" + this.valueSearchTitle;
   }
   else if(this.valueSearchKeyword.length > 0){
    fileNamePart = this.valueSearchKeyword;
   }
   else if(this.valueSearchTitle.length > 0){
    fileNamePart = this.valueSearchTitle;
   }
  }
  else{
   fileNamePart = objControleStorageL.getSessionTitle();
  }
  
  var fileName = objCommonFunctions.escapeFilename("Telnetman2_Exports_" + fileNamePart + ".txt");
  
  var blob = new Blob([objExportImport.exports.join("\n")], {"type" : "text/plain"});
  window.URL = window.URL || window.webkitURL;
  
  var elImg = document.createElement("img");
  elImg.setAttribute("src", "img/download.png");
  elImg.setAttribute("width", "16");
  elImg.setAttribute("height", "16");
  elImg.setAttribute("alt", "download");
  
  var elA = document.createElement("a");
  elA.setAttribute("href", window.URL.createObjectURL(blob));
  elA.setAttribute("download", fileName);
  elA.appendChild(elImg);
  
  return(elA);
 };
 
 
 // Export ボタンの画像を差し替える。
 this.replaceExportButton = function (elIcon) {
  var elExportButtonArea = document.getElementById(this.idExportButtonArea);
  var icons = elExportButtonArea.childNodes;
  for(var i = icons.length - 1; i >= 0; i --){
   elExportButtonArea.removeChild(icons[i]);
  }
  
  if((elIcon !== null) && (elIcon !== undefined)){
   elExportButtonArea.appendChild(elIcon);
  }
 };
 
 
 // ドロップされた最初のテキストファイルを開く。
 this.onDrop = function (event) {
  var files = event.dataTransfer.files;
  
  if((files[0].name.match(/^Telnetman2_Exports_/)) && (files[0].name.match(/\.txt$/))){
   // FileReaderオブジェクトの生成。
   var reader = new FileReader();
   reader.name = files[0].name;
   
   // ファイル読取が完了した際に呼ばれる処理を定義。
   reader.onload = function (event) {
    objExportImport.dropedFileName = event.target.name;
    objExportImport.dropedFileText = event.target.result;
    
    objExportImport.printDropedFile();
   };
   
   // ファイルの内容を取得。
   reader.readAsText(files[0], 'utf8');
  }
  else{
   this.dropedFileName = "";
   this.dropedFileText = "";
   
   this.printDropedFile();
  }
  
  // ブラウザ上でファイルを展開する挙動を抑止。
  event.preventDefault();
 };
 
 
 // ドロップされたファイルの内容を表示する。
 this.printDropedFile = function () {
  if((this.dropedFileName.length > 0) && (this.dropedFileText.length > 0)){
   document.getElementById(this.idImportZone).childNodes[0].innerHTML = this.dropedFileName;
   this.isImportButton = true;
  }
  else{
   document.getElementById(this.idImportZone).childNodes[0].innerHTML = "ここにドロップ<br>Telnetman1_Expors_****.txt";
   this.isImportButton = false;
  }
  
  this.changeImportButton();
 };
 
 
 // Import ボタンを押せるように、または、押せないようにする。
 this.changeImportButton = function () {
  if(this.isImportButton){
   document.getElementById(this.idImportButton).className = "enable";
   document.getElementById(this.idImportButton).onclick = new Function("objExportImport.importItems();");
  }
  else{
   document.getElementById(this.idImportButton).className = "disable";
   document.getElementById(this.idImportButton).onclick = null;
  }
 };
 
 
 // インポートリストを初期化する。
 this.initializeImports = function () {
  for(var itemType in this.imports){
   for(var itemId in this.imports[itemType]){
    delete(this.imports[itemType][itemId]);
   }
   delete(this.imports[itemType]);
  }
 };
 
 
 // 一括登録
 this.importItems = function () {
  this.isImportButton = false;
  this.changeImportButton();
  this.importCount = 0;
  this.emptyResultArea();
  this.order = "import";
  
  var check = false;
  
  this.initializeImports();
  
  var splitText = this.dropedFileText.split("\n");
  for(var i = 0, j = splitText.length; i < j; i ++){
   var itemData = JSON.parse(splitText[i]);
   itemType = itemData["item_type"];
   itemId   = itemData["item_id"];
   delete(itemData["item_type"]);
   itemData["operation"] = "create";
   
   if(!(itemType in this.imports)){
    this.imports[itemType] = new Object();
   }
   
   if(!(itemId in this.imports[itemType])){
    this.imports[itemType][itemId] = itemData;
    check = true;
   }
  }
  
  if(check){
   for(itemType in this.imports){
    for(itemId in this.imports[itemType]){
     this.importCount ++;
     
     this.importItem(itemType, itemId);
    }
   }
  }
 };
 
 
 this.importItem = function (itemType, itemId){
  var authHeader = makeAuthHeader();
  
  var cgi = "";
  if(itemType === "command"){
   cgi = "/cgi-bin/Telnetman2/command.cgi";
  }
  else if(itemType === "action"){
   cgi = "/cgi-bin/Telnetman2/action.cgi";
  }
  else if(itemType === "ping"){
   cgi = "/cgi-bin/Telnetman2/ping.cgi";
  }
  
  if(cgi.length > 0){
   $.ajax({
    headers : {"telnetmanAuth" : authHeader},
    type : "post",
    url  : cgi,
    data : this.imports[itemType][itemId],
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
         var operation = hashResult["operation"];
         var commandType = undefined;
         
         if(result === 1){
          var itemType = hashResult["item_type"];
          var itemId   = hashResult["item_id"];
          var repeatType  = hashResult["repeat_type"];
          var title       = hashResult["title"];
          
          if(itemType === "command"){
           commandType = hashResult["command_type"];
          }
          
          var elSpan = document.createElement("span");
          
          if(operation === "create"){
           elSpan.innerHTML = "新規登録&nbsp;完了";
           
           // フローチャートのページにもシンボルを追加する。
           objFlowchart.appendSymbolData(itemType, itemId, title, repeatType, commandType);
          }
          else if(operation === "update"){
           elSpan.innerHTML = "更新&nbsp;完了";
           
           // フローチャートのページのシンボルも更新する。
           objFlowchart.updateSymbolData(itemType, itemId, title, repeatType, commandType);
          }
          
          objExportImport.pushResultArea(itemType, itemId, repeatType, title, commandType, elSpan);
         }
         else{// result
          itemType = "";
          itemId = "";
          
          if("item_type" in hashResult){
           itemType = hashResult["item_type"];
          }
          
          if("item_id" in hashResult){
           itemId   = hashResult["item_id"];
          }
          
          elSpan = document.createElement("span");
          elSpan.innerHTML = hashResult["reason"];
          
          if((itemType.length > 0) && (itemId.length > 0)){
           if(itemType === "command"){
            commandType = 1;
           }
           
           objExportImport.pushResultArea(itemType, itemId, 1, "Error", commandType, elSpan);
          }
          else{
           objExportImport.pushErrorSymbol(hashResult["reason"]);
          }
         }
        }
        else{// session
         objExportImport.pushErrorSymbol("セッションが確立していません。");
        }
       }
       else{// login
        objExportImport.pushErrorSymbol("login timeout");
       }
      }
      else{// cgi error
       objExportImport.pushErrorSymbol("CGI Error");
      }
     }
     objExportImport.importCount --;
     
     if(objExportImport.importCount === 0){
      objExportImport.isImportButton = true;
      objExportImport.changeImportButton();
     }
    },
    error : function (){
     objExportImport.importCount --;
     
     if(objExportImport.importCount === 0){
      objExportImport.isImportButton = true;
      objExportImport.changeImportButton();
     }
    }
   });
  }
  else{
   objExportImport.importCount --;
   
   if(objExportImport.importCount === 0){
    objExportImport.isImportButton = true;
    objExportImport.changeImportButton();
   }
  }
 };
 
 return(this);
}
