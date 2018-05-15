// 説明   : 変換スクリプト登録画面。
// 作成日 : 2017/12/01
// 作成者 : 江野高広

var objConversionScript = new conversionScript();

function conversionScript () {
 this.isOpened = false;
 
 // 登録済み変換スクリプト一覧のデータを格納する。
 this.scriptList = new Array();
 
 this.idUploadTable     = this.idPrefix + "upload_table";
 this.idDropedFileName  = this.idPrefix + "droped_file_name";
 this.idDropArea        = this.idPrefix + "drop_area";
 this.idUploadButton    = this.idPrefix + "upload_button";
 this.idScriptList      = this.idPrefix + "script_list";
 this.idScriptViewTable = this.idPrefix + "script_view_table";
 this.idScriptTr = function (scriptId){
  return(this.idPrefix + "script_" + scriptId);
 };
 
 // 画面描画。
 this.print = function () {
  objControleStorageL.setPage("conversion_script");
  objControleStorageS.setPage("conversion_script");
  
  var htmlUploadArea = "<table class='telnetman_item_build_table' id='" + this.idUploadTable + "'>" +
                       "<tr>" +
                       "<th><span class='telnetman_build_table_span1'>変換スクリプト</span><img src='img/help.png' width='16' height='16' alt='help' class='onclick_node' onclick='objTelnetmanHelp.help(\"telnetman_script\");'></th>" +
                       "</tr>" +
                       "<tr>" +
                       "<td>" +
                       "<span id='" + this.idDropedFileName + "'>Telnetman_script_****.pl&nbsp;</span><br><span>(文字コード:utf8)</span>" +
                       "<div class='upload_script_area' id='" + this.idDropArea + "' ondragover='objLayoutFunctions.onDragOver(event);' ondrop='objConversionScript.onDrop(event);'><span>ここにドロップ</span></div>" +
                       "</td>" +
                       "</tr>" +
                       "<tr>" +
                       "<td class='center'>" +
                       "<button class='disable' id='" + this.idUploadButton + "'>upload</button>" +
                       "</td>" +
                       "</tr>" +
                       "</table>";
                                            
  var htmlListArea = "<table class='telnetman_item_build_table' id='" + this.idScriptList + "'>" +
                     "<tr>" +
                     "<th>スクリプト名</th>" +
                     "<th>作成者</th>" +
                     "<th>更新者</th>" +
                     "<th>更新時刻</th>" +
                     "<th>-</th>" +
                     "</tr>" +
                     "</table>";
  
  document.getElementById("object_area").innerHTML = htmlUploadArea;
  document.getElementById("build_area").innerHTML  = htmlListArea;
  
  if(!this.isOpened){
   this.getConversionScriptList();
  }
  else{
   this.makeConversionScriptList();
  }
  
  document.getElementById(this.idUploadTable).style.display = "none";
  $("#" + this.idUploadTable).fadeIn(300);
  document.getElementById(this.idScriptList).style.display = "none";
  $("#" + this.idScriptList).fadeIn(300);
 }; 
 
 
 // 登録済み変換スクリプト一覧を取得する。
 this.getConversionScriptList = function (){
  var authHeader = makeAuthHeader();
  
  $.ajax({
   headers : {"telnetmanAuth" : authHeader},
   type : "post",
   url  : "/cgi-bin/Telnetman2/get_conversion_script_list.cgi",
   data : {},
   success : function(jsonResult) {
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
        var scriptList = hashResult["script_list"];
        
        for(var i = 0, j = scriptList.length; i < j; i ++){
         var scriptId    = scriptList[i]["script_id"];
         var owner       = scriptList[i]["user_name"];
         var changer     = scriptList[i]["changer_name"];
         var create_time = scriptList[i]["create_time"];
         var update_time = scriptList[i]["update_time"];
         
         objConversionScript.scriptList[i] = new Object();
         objConversionScript.scriptList[i]["script_id"] = scriptId;
         objConversionScript.scriptList[i]["user_name"] = owner;
         objConversionScript.scriptList[i]["changer_name"] = changer;
         objConversionScript.scriptList[i]["create_time"] = create_time;
         objConversionScript.scriptList[i]["update_time"] = update_time;
        }
        
        objConversionScript.makeConversionScriptList();
        objConversionScript.isOpened = true;
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
   error : function () {
    alert("Server Error");
   }
  });
 };
 
 
 // 変換スクリプトをアップロードする。
 this.uploadConversionScript = function () {
  var authHeader = makeAuthHeader();
  
  var fileName = this.dropedFileName;
  var fileText = this.dropedFileText;
  
  this.dropedFileName = "";
  this.dropedFileText = "";
  this.printDropedFile();
  
  $.ajax({
   headers : {"telnetmanAuth" : authHeader},
   type : "post",
   url  : "/cgi-bin/Telnetman2/upload_conversion_script.cgi",
   data : {
    "file_name" : fileName,
    "file_text" : fileText
   },
   success : function(jsonResult) {
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
        
        if(result === 1){
         var operation  = hashResult["operation"];
         var scriptId   = hashResult["script_id"];
         var updateTime = hashResult["update_time"];
         
         var date = objCommonFunctions.unixtimeToDate(updateTime, "YYYY/MM/DD hh:mm:ss");
         
         if(operation === "insert"){
          var owner = hashResult["user_name"];
          var createTime = hashResult["create_time"];
          
          var scriptInfoList = new Object();
          scriptInfoList["script_id"] = scriptId;
          scriptInfoList["user_name"] = owner;
          scriptInfoList["changer_name"] = "";
          scriptInfoList["create_time"] = createTime;
          scriptInfoList["update_time"] = updateTime;
          
          objConversionScript.scriptList.push(scriptInfoList);
          objConversionScript.appendConversionScriptList(scriptId, owner, "", date);
         }
         else if(operation === "update"){
          var changer = hashResult["changer_name"];
          
          for(var i = 0, j = objConversionScript.scriptList.length; i < j; i ++){
           if(objConversionScript.scriptList[i]["script_id"] === scriptId){
            objConversionScript.scriptList[i]["changer_name"] = changer;
            objConversionScript.scriptList[i]["update_time"]  = updateTime;
           }
          }
          
          $("#" + objConversionScript.idScriptTr(scriptId)).effect('pulsate', '',1000, function(){
           document.getElementById(objConversionScript.idScriptTr(scriptId)).childNodes[2].innerHTML = changer;
           document.getElementById(objConversionScript.idScriptTr(scriptId)).childNodes[3].innerHTML = date;
          });
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
   error : function () {
    alert("Server Error");
   }
  });
 };
 
 
 // 変換スクリプトの一覧を作る。
 this.makeConversionScriptList = function () {
  var page = objControleStorageL.getPage();
  
  for(var i = 0, j = this.scriptList.length; i < j; i ++){
   var scriptId = this.scriptList[i]["script_id"];
   var owner      = this.scriptList[i]["user_name"];
   var changer    = this.scriptList[i]["changer_name"];
   var updateTime = this.scriptList[i]["update_time"];
   
   var date = objCommonFunctions.unixtimeToDate(updateTime, "YYYY/MM/DD hh:mm:ss");
   
   if(page === "conversion_script"){// スクリプト登録画面の場合。
    this.appendConversionScriptList(scriptId, owner, changer, date);
   }
   else if(page === "action"){// アクション画面の場合。
    objAction.appendConversionScriptOption(scriptId);
   }
  }
 };
 
 
 // 登録済み変換スクリプト一覧の1行を作って加える。
 this.appendConversionScriptList = function (scriptId, owner, changer, date) {
  var elSpan = document.createElement("span");
  elSpan.setAttribute("class", "onclick_node");
  elSpan.innerHTML = scriptId + ".pl";
  elSpan.onclick = new Function("objConversionScript.downloadConversionScript('" + scriptId + "');");
  
  var elImgDelete = document.createElement("img");
  elImgDelete.setAttribute("src", "img/cross.png");
  elImgDelete.setAttribute("width", "16");
  elImgDelete.setAttribute("height", "16");
  elImgDelete.setAttribute("alt", "削除");
  elImgDelete.setAttribute("class", "onclick_node");
  elImgDelete.onclick = new Function("objConversionScript.deleteConversionScript('" + scriptId + "');");
  
  var elTr = document.createElement("tr");
  elTr.setAttribute("id", this.idScriptTr(scriptId));
  
  var elTd1 = document.createElement("td");
  elTd1.setAttribute("class", "right");
  elTd1.appendChild(elSpan);
  var elTd2 = document.createElement("td");
  elTd2.setAttribute("class", "right");
  elTd2.innerHTML = owner;
  var elTd3 = document.createElement("td");
  elTd3.setAttribute("class", "right");
  elTd3.innerHTML = changer;
  var elTd4 = document.createElement("td");
  elTd4.setAttribute("class", "right");
  elTd4.innerHTML = date;
  var elTd5 = document.createElement("td");
  elTd5.setAttribute("class", "center");
  elTd5.appendChild(elImgDelete);
  
  elTr.appendChild(elTd1);
  elTr.appendChild(elTd2);
  elTr.appendChild(elTd3);
  elTr.appendChild(elTd4);
  elTr.appendChild(elTd5);
  
  document.getElementById(this.idScriptList).appendChild(elTr);
 };
 
 
 // ドロップされた最初のテキストファイルを開く。
 this.onDrop = function (event) {
  var files = event.dataTransfer.files;
  
  if((files[0] !== null) && (files[0] !== undefined)){
   if((files[0].name.match(/^Telnetman_/)) && (files[0].name.match(/\.pl$/))){
    // FileReaderオブジェクトの生成。
    var reader = new FileReader();
    reader.name = files[0].name;
    
    // ファイル読取が完了した際に呼ばれる処理を定義。
    reader.onload = function (event) {
     objConversionScript.dropedFileName = event.target.name;
     objConversionScript.dropedFileText = event.target.result;
     
     objConversionScript.printDropedFile();
    };
    
    // ファイルの内容を取得。
    reader.readAsText(files[0], 'utf8');
   }
   else{
    this.dropedFileName = "";
    this.dropedFileText = "";
    
    this.printDropedFile();
   }
  }
  else{
   alert("取り込めませんでした。\n圧縮ファイルをドラッグ&ドロップしませんでしたか?\n解凍してからもう一度試して下さい。");
  }
  
  // ブラウザ上でファイルを展開する挙動を抑止。
  event.preventDefault();
 };
 
 
 // ドロップされたファイルの内容を表示する。
 this.printDropedFile = function () {
  if((this.dropedFileName.length > 0) && (this.dropedFileText.length > 0)){
   var text = this.dropedFileText.replace(/\r/, "");
   var splitText = text.split("\n");
   
   for(var i = 0, j = splitText.length; i < j; i ++){
    splitText[i] = objCommonFunctions.escapeHtml(splitText[i]);
   }
   
   var htmlText = splitText.join("<br>");
   
   document.getElementById(this.idDropArea).childNodes[0].innerHTML = htmlText;
   document.getElementById(this.idDropedFileName).innerHTML = objCommonFunctions.escapeHtml(this.dropedFileName);
   
   document.getElementById(this.idUploadButton).className = "enable";
   document.getElementById(this.idUploadButton).onclick = new Function("objConversionScript.uploadConversionScript();");
  }
  else{
   document.getElementById(this.idDropArea).childNodes[0].innerHTML = "ここにドロップ";
   document.getElementById(this.idDropedFileName).innerHTML = "Telnetman_script_****.pl";
   
   document.getElementById(this.idUploadButton).className = "disable";
   document.getElementById(this.idUploadButton).onclick = null;
  }
 };
 
 
 // 変換スクリプト1つを取得する。
 this.downloadConversionScript = function (scriptId){
  var authHeader = makeAuthHeader();
  
  $.ajax({
   headers : {"telnetmanAuth" : authHeader},
   type : "post",
   url  : "/cgi-bin/Telnetman2/download_conversion_script.cgi",
   data : {
    "script_id" : scriptId
   },
   success : function(jsonResult) {
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
        
        if(result === 1){
         objCommonFunctions.unlockScreen();
         
         var name = objCommonFunctions.escapeHtml(hashResult["name"]);
         var text = objCommonFunctions.escapeHtml(hashResult["text"]);
         
         var html = "<table id='" + objConversionScript.idScriptViewTable + "' class='telnetman_script_viewer'>" +
                    "<tr>" +
                    "<th><div><span>" + name + "</span><img src='img/cancel.png' width='16' height='16' alt='cancel' onclick='objConversionScript.removeScriptViewTable();'><div></th>" +
                    "</tr>" +
                    "<tr>" +
                    "<td><textarea spellcheck='false' cols='120' rows='40' readonly='readonly'>" + text + "</textarea></td>" +
                    "</tr>" +
                    "</table>";
         
         objCommonFunctions.lockScreen(html);
         
         $("#" + objConversionScript.idScriptViewTable).fadeIn(200);
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
   error : function () {
    alert("Server Error");
   }
  });
 };
 
 
 // スクリプトの内容の表示table を消す。
 this.removeScriptViewTable = function () {
  $("#" + this.idScriptViewTable).effect('fade', '', 200, function (){objCommonFunctions.unlockScreen();});
 };
 
 
 // 変換スクリプト1つを削除する。
 this.deleteConversionScript = function (scriptId){
  if(window.confirm("本当に削除しますか?")){
   var authHeader = makeAuthHeader();
   
   $.ajax({
    headers : {"telnetmanAuth" : authHeader},
    type : "post",
    url  : "/cgi-bin/Telnetman2/delete_conversion_script.cgi",
    data : {
     "script_id" : scriptId
    },
    success : function(jsonResult) {
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
         
         if(result === 1){
          scriptId = hashResult["script_id"];
          
          // 一覧表示から削除。
          var idTr = objConversionScript.idScriptTr(scriptId);
          $("#" + idTr).effect('fade', '', 500, function(){
           var elTr = document.getElementById(idTr);
           document.getElementById(objConversionScript.idScriptList).removeChild(elTr);
          });
          
          // リストから削除。
          for(var i = objConversionScript.scriptList.length - 1; i >= 0; i --){
           if(objConversionScript.scriptList[i]["script_id"] === scriptId){
            objConversionScript.scriptList.splice(i, 1);
           }
          }
          
          // Action 画面でselect 状態であれば解除する。
          objAction.unsetConversionScript(scriptId);
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
    error : function () {
     alert("Server Error");
    }
   });
  }
 };
 
 return(this);
}
