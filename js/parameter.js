// 説明   : 変数登録とtelnet実行画面。
// 作成日 : 2014/08/01
// 作成者 : 江野高広
// 更新 : 2015/01/09 自動一時停止機能の追加。
//      : 2015/10/23 syslog 検出機能追加。
//      : 2015/12/09 --More-- 対応。
// 更新 : 2016/01/28 enable password をログイン情報ファイルから外す。
// 更新 : 2016/06/27 ssh に対応。
// 更新 : 2016/07/19 初めて開いたときにサーバーからログイン情報などの入力情報をダウンロードして入力欄に自動で入れる。
// 更新 : 2017/09/14 Ver.2 用に改造。

var objParameter = new parameter();

function parameter () {
 this.isOpened = false;
 this.isExec = false;// telnet 実行中
 this.isPause = false;// telnet 一時停止中
 this.isZipLog = false;
 this.isTelnetmanLight = false;
 this.isAutoPause = false;
 this.intervalId = "";
  
 // HTML のid の接頭語と固定id
 this.idPrefix = "telnetman_parameter_";
 this.idHandsonTable = this.idPrefix + "handson_table";
 this.idService1          = this.idPrefix + "service_telnet";
 this.idService1          = this.idPrefix + "service_ssh-password";
 this.nameService1        = this.idPrefix + "service";
 this.idPort              = this.idPrefix + "port";
 this.idTimeout           = this.idPrefix + "timeout";
 this.idPrompt            = this.idPrefix + "prompt";
 this.idPromptList        = this.idPrefix + "prompt_list";
 this.idUser              = this.idPrefix + "user";
 this.idUserPrompt        = this.idPrefix + "user_prompt";
 this.idPassword          = this.idPrefix + "password";
 this.idPasswordPrompt    = this.idPrefix + "password_prompt";
 this.idEnablePrompt      = this.idPrefix + "enable_prompt";
 this.idEnableCommand     = this.idPrefix + "enable_command";
 this.idEnablePassword    = this.idPrefix + "enable_password";
 this.idTerminalLength    = this.idPrefix + "terminal_length";
 this.idTerminalWidth     = this.idPrefix + "terminal_width";
 this.idConfigureTerminal = this.idPrefix + "configure_terminal";
 this.idConfigureEnd      = this.idPrefix + "configure_end";
 this.idExit              = this.idPrefix + "exit";
 this.idParameterCsvFileName        = this.idPrefix + "parameter_csv_file_name";
 this.idLoginInfoJsonFileName       = this.idPrefix + "login_info_json_file_name";
 this.idDiffValuesJsonFileName      = this.idPrefix + "diff_values_json_file_name";
 this.idOptionalLogJsonFileName     = this.idPrefix + "optional_log_json_file_name";
 this.idTerminalMonitorJsonFileName = this.idPrefix + "terminal_monitor_json_file_name";
 this.idDiffHeader1 = this.idPrefix + "diff_header_1";
 this.idDiffHeader2 = this.idPrefix + "diff_header_2";
 this.idDiffValue1  = this.idPrefix + "diff_value_1";
 this.idDiffValue2  = this.idPrefix + "diff_value_2";
 this.idOptionalLogHeader = this.idPrefix + "optional_log_header";
 this.idOptionalLogValue  = this.idPrefix + "optional_log_value";
 this.idTerminalMonitorCommand = this.idPrefix + "terminal_monitor_command";
 this.idTerminalMonitorPattern = this.idPrefix + "terminal_monitor_pattern";
 this.idTerminalMonitorErrors  = this.idPrefix + "terminal_monitor_errors";
 
 this.idDownloadParameterCsv          = this.idPrefix + "download_parameter_csv";
 this.idDownloadLoginInfoJson         = this.idPrefix + "download_login_info_json";
 this.idDownloadDiffValues            = this.idPrefix + "download_diff_values_json";
 this.idDownloadOptionalLogValues     = this.idPrefix + "download_optional_log_values_json";
 this.idDownloadTerminalMonitorValues = this.idPrefix + "download_terminal_monitor_values_json";
 
 this.idNodeListArea        = this.idPrefix + "node_list_area";
 this.idNodeStatusArea      = this.idPrefix + "node_status_area";
 this.idParameterSheetArea   = this.idPrefix + "parameter_sheet_area";
 this.idLoginInfoArea       = this.idPrefix + "login_info_area";
 this.idDiffValuesArea      = this.idPrefix + "diff_values_area";
 this.idTerminalMonitorArea = this.idPrefix + "terminal_monitor_area";
 this.idOptionalLogArea     = this.idPrefix + "optional_log_area";
 this.idMoreString          = this.idPrefix + "more_string";
 this.idMoreCommand         = this.idPrefix + "more_command"; 
 
 this.idExecButton              = this.idPrefix + "exec_button";
 this.idPauseButton             = this.idPrefix + "pause_button";
 this.idForcedTerminationButton = this.idPrefix + "forced_termination_button";
 this.idZipButton               = this.idPrefix + "zip_button";
 this.idAutoPauseCheckbox       = this.idPrefix + "auto_pause_checkbox";
 
 this.idTelnetmanLightButton  = this.idPrefix + "Telnetman_light_button";
 this.idTelnetmanLightBuilder = this.idPrefix + "Telnetman_light_builder";
 
 this.idNoHardCodingParameterSheet = this.idPrefix + "no_hard_coding_parameter_sheet";
 this.idHardCodingParameterSheet   = this.idPrefix + "hard_coding_parameter_sheet";
 this.idMakeTelnetmanLightButton   = this.idPrefix + "make_telnetman_light_button";
 
 this.idNode = function (node) {
  return(this.idPrefix + "node_" + node);
 };
 
 this.idLogTable    = this.idPrefix + "log_table";
 this.idLogTextarea = this.idPrefix + "log_textarea";
 
 this.classNode = function (status) {
  return(this.idPrefix + "node_" + status);
 };
 
 this.parameterCsvFileName = "";
 this.parameterList = null;
 this.password = "";
 this.enablePassword = "";
 this.loginInfoJsonFileName = "";
 this.diffValuesJsonFileName = "";
 this.optionalLogJsonFileName = "";
 this.terminalMonitorJsonFileName = "";
 this.nodeList = new Array();
 this.nodeStatus = new Object();//1:一時停止 2:待機中 3:実行中 4:正常終了 5:NG終了 6:NG強制続行 7:強制終了 8:エラー終了
 this.jsonParameterList = "";
 this.hardCodingParameterSheet = null;
 
 
 // 画面描画。
 this.print = function () {
  objControleStorageL.setPage("parameter");
  objControleStorageS.setPage("parameter");
  
  var sessionTitle = objControleStorageL.getSessionTitle();
  var downloadParameterCsvFileName    = objCommonFunctions.escapeFilename("Telnetman2_parameter_" + sessionTitle + ".csv");
  var downloadLoginInfoJsonFileName   = objCommonFunctions.escapeFilename("Telnetman2_loginInfo_" + sessionTitle + ".json");
  var downloadDiffValuesFileName      = objCommonFunctions.escapeFilename("Telnetman2_diffValues_" + sessionTitle + ".json");
  var downloadOptionalLogFileName     = objCommonFunctions.escapeFilename("Telnetman2_optionalLog_" + sessionTitle + ".json");
  var downloadTerminalMonitorFileName = objCommonFunctions.escapeFilename("Telnetman2_terminalMonitor_" + sessionTitle + ".json");
  
  var htmlObjectArea = "<div class='margin20' id='" + this.idNodeListArea + "'>" +
                       "<p><input type='checkbox' id='" + this.idAutoPauseCheckbox + "' value='1' onchange='objParameter.autoPause();'><label class='checkbox1' for='" + this.idAutoPauseCheckbox + "'>自動一時停止</label><img src='img/help.png' width='16' height='16' alt='help' class='onclick_node' onclick='objTelnetmanHelp.help(\"pause_button\");'></p>" +
                       "<p><button class='disable' id='" + this.idExecButton + "'>実行</button>" +
                       "<button class='disable' id='" + this.idPauseButton + "'>一時停止</button>" +
                       "<button class='disable' id='" + this.idForcedTerminationButton + "'>強制終了</button></p>" +
                       "<p><button class='disable' id='" + this.idZipButton + "'>zip&nbsp;log</button></p>" +
                       "<p><button class='disable' id='" + this.idTelnetmanLightButton + "'>Telnetman&nbsp;Light</button><img src='img/help.png' width='16' height='16' alt='help' class='onclick_node' onclick='objTelnetmanHelp.help(\"telnetman_light\");'></p>" +
                       "<div class='margin20' id='" + this.idNodeStatusArea + "'></div>" +
                       "</div>";
  var htmlBuildArea = "<div class='margin20' id='" + this.idParameterSheetArea + "' ondragover='objLayoutFunctions.onDragOver(event);' ondrop='objParameter.readCsv(event);'>" +
                      "<a id='" + this.idDownloadParameterCsv + "' href='#' onclick='objParameter.downloadParameterList();' download='" + downloadParameterCsvFileName + "'><img src='img/download.png' width='16' height='16' alt='download'></a><img src='img/help.png' width='16' height='16' alt='help' class='onclick_node' onclick='objTelnetmanHelp.help(\"parameter_sheet\");'><span class='telnetman_build_table_span1'>パラメーターシート&nbsp;:&nbsp;</span><span id='" + this.idParameterCsvFileName + "'></span>" +
                      "<div class='margin20' id='" + this.idHandsonTable + "'></div>" +
                      "</div>" +
                      "<div class='margin20' id='" + this.idLoginInfoArea + "' ondragover='objLayoutFunctions.onDragOver(event);' ondrop='objParameter.readLoginInfo(event);'>" +
                      "<a id='" + this.idDownloadLoginInfoJson + "' href='#' onclick='objParameter.downloadLoginInfo();' download='" + downloadLoginInfoJsonFileName + "'><img src='img/download.png' width='16' height='16' alt='download'></a><img src='img/help.png' width='16' height='16' alt='help' class='onclick_node' onclick='objTelnetmanHelp.help(\"login_info\");'><span class='telnetman_build_table_span1'>ログイン情報&nbsp;:&nbsp;</span><span id='" + this.idLoginInfoJsonFileName + "'></span>" +
                      "<table class='telnetman_item_build_table'>" +
                      "<tr>" +
                      "<td class='right'><span class='telnetman_build_table_span1'>サービス</span></td>" +
                      "<td>" +
                       "<span class='middle_radio_buntton'>" +
                       "<input type='radio' id='" + this.idService1 + "' name='" + this.nameService + "' value='telnet'       onchange='objControleStorageS.setService(this.value); objParameter.changePort();' checked><label for='" + this.idService1 + "'>telnet</label>" +
                       "<input type='radio' id='" + this.idService2 + "' name='" + this.nameService + "' value='ssh-password' onchange='objControleStorageS.setService(this.value); objParameter.changePort();'        ><label for='" + this.idService2 + "'>ssh</label>" +
                       "</span>" +
                      "</td>" +
                      "</tr>" +
                      "<tr>" +
                      "<td class='right'><span class='telnetman_build_table_span1'>ポート</span></td>" +
                      "<td><input type='text' spellcheck='false' autocomplete='off' style='width:54px;' id='" + this.idPort + "' value='' onblur='objControleStorageS.setPort(this.value);'></td>" +
                      "</tr>" +
                      "<tr>" +
                      "<td class='right'><span class='telnetman_build_table_span1'>タイムアウト</span></td>" +
                      "<td><input type='text' spellcheck='false' autocomplete='off' style='width:54px;' id='" + this.idTimeout + "' value='' onblur='objControleStorageS.setTimeout(this.value);'><span>s</span></td>" +
                      "</tr>" +
                      "<tr>" +
                      "<td class='right'><span class='telnetman_build_table_span1'>プロンプト</span></td>" +
                      "<td><input type='text' spellcheck='false' autocomplete='off' style='width:100px;' id='" + this.idPrompt + "' value='' onblur='objControleStorageS.setPrompt(this.value);' list='" + this.idPromptList + "'><datalist id='" + this.idPromptList + "'><option value='.*(>|#|\\]|\\?)\\s*$'></option><option value='.*(>|#|:)\\s*$'></option></datalist><span>&#x203B;正規表現</span></td>" +
                      "</tr>" +
                      "<tr>" +
                      "<td class='right'><span class='telnetman_build_table_span1'>ユーザー名</span></td>" +
                      "<td><input type='text' spellcheck='false' autocomplete='off' style='width:100px;' id='" + this.idUserPrompt + "' value='' onblur='objControleStorageS.setUserPrompt(this.value);' placeholder='空白時同上'><input type='text' spellcheck='false' autocomplete='off' style='width:160px;' id='" + this.idUser + "' value='' onblur='objControleStorageS.setUser(this.value);' placeholder='ログインユーザーID'></td>" +
                      "</tr>" +
                      "<tr>" +
                      "<td class='right'><span class='telnetman_build_table_span1'>パスワード</span></td>" +
                      "<td><input type='text' spellcheck='false' autocomplete='off' style='width:100px;' id='" + this.idPasswordPrompt + "' value='' onblur='objControleStorageS.setPasswordPrompt(this.value);' placeholder='空白時同上'><input type='password' spellcheck='false' autocomplete='off' style='width:160px;' id='" + this.idPassword + "' value='' onblur='objParameter.setPassword(this.value);' placeholder='ログインパスワード'></td>" +
                      "</tr>" +
                      "<tr>" +
                      "<td class='right'><span class='telnetman_build_table_span1'>特権モード</span><input type='text' spellcheck='false' autocomplete='off' style='width:90px;' id='" + this.idEnableCommand + "' value='' onblur='objControleStorageS.setEnableCommand(this.value);' placeholder='enable'></td>" +
                      "<td><input type='text' spellcheck='false' autocomplete='off' style='width:100px;' id='" + this.idEnablePrompt + "' value='' onblur='objControleStorageS.setEnablePrompt(this.value);' placeholder='空白時同上'><input type='password' spellcheck='false' autocomplete='off' style='width:160px;' id='" + this.idEnablePassword + "' value='' onblur='objParameter.setEnablePassword(this.value);' placeholder='特権モード移行パスワード'></td>" +
                      "</tr>" +
                      "<tr>" +
                      "<td class='right'><span class='telnetman_build_table_span1'>行数無制限コマンド</span></td>" +
                      "<td><input type='text' spellcheck='false' autocomplete='off' style='width:150px;' id='" + this.idTerminalLength + "' value='' onblur='objControleStorageS.setTerminalLength(this.value);' placeholder='terminal length 0'></td>" +
                      "</tr>" +
                      "<tr>" +
                      "<td class='right'><span class='telnetman_build_table_span1'>行幅無制限コマンド</span></td>" +
                      "<td><input type='text' spellcheck='false' autocomplete='off' style='width:150px;' id='" + this.idTerminalWidth + "' value='' onblur='objControleStorageS.setTerminalWidth(this.value);' placeholder='terminal width 0'></td>" +
                      "</tr>" +
                      "<tr>" +
                      "<td class='right'><span class='telnetman_build_table_span1'>More&nbsp;と次のページへ</span></td>" +
                      "<td><input type='text' spellcheck='false' autocomplete='off' style='width:125px;' id='" + this.idMoreString + "' value='' onblur='objControleStorageS.setMoreString(this.value);' placeholder='--More--'><input type='text' spellcheck='false' autocomplete='off' style='width:90px;' id='" + this.idMoreCommand + "' value='' onblur='objControleStorageS.setMoreCommand(this.value);' placeholder='空でEnter'></td>" +
                      "</tr>" +
                      "<tr>" +
                      "<td class='right'><span class='telnetman_build_table_span1'>設定変更モード</span></td>" +
                      "<td><input type='text' spellcheck='false' autocomplete='off' style='width:150px;' id='" + this.idConfigureTerminal + "' value='' onblur='objControleStorageS.setConfigureTerminal(this.value);' placeholder='configure terminal'><span>&nbsp;&#x301C;&nbsp;</span><input type='text' spellcheck='false' autocomplete='off' style='width:90px;' id='" + this.idConfigureEnd + "' value='' onblur='objControleStorageS.setConfigureEnd(this.value);' placeholder='end'></td>" +
                      "</tr>" +
                      "<tr>" +
                      "<td class='right'><span class='telnetman_build_table_span1'>ログアウト</span></td>" +
                      "<td><input type='text' spellcheck='false' autocomplete='off' style='width:80px;' id='" + this.idExit +"' value='' onblur='objControleStorageS.setExit(this.value);' placeholder='exit'></td>" +
                      "</tr>" +
                      "</table>" +
                      "</div>" +
                      "<div class='margin20' id='" + this.idTerminalMonitorArea + "' ondragover='objLayoutFunctions.onDragOver(event);' ondrop='objParameter.readTerminalMonitorValues(event);'>" +
                      "<a id='" + this.idDownloadTerminalMonitorValues + "' href='#' onclick='objParameter.downloadTerminalMonitorValues();' download='" + downloadTerminalMonitorFileName + "'><img src='img/download.png' width='16' height='16' alt='download'></a><img src='img/help.png' width='16' height='16' alt='help' class='onclick_node' onclick='objTelnetmanHelp.help(\"syslog_info\");'><span class='telnetman_build_table_span1'>SYSLOG&nbsp;確認設定&nbsp;:&nbsp;</span><span id='" + this.idTerminalMonitorJsonFileName + "'></span>" +
                      "<table class='telnetman_item_build_table'>" +
                      "<tr>" +
                      "<td class='right'><span class='telnetman_build_table_span1'>コマンド</span></td>" +
                      "<td><input type='text' spellcheck='false' autocomplete='off' style='width:150px;' id='" + this.idTerminalMonitorCommand + "' value='' onblur='objControleStorageS.setTerminalMonitorCommand(this.value);' placeholder='terminal monitor'></td>" +
                      "</tr>" +
                      "<tr>" +
                      "<td class='right'><span class='telnetman_build_table_span1'>Syslog&nbsp;パターン</span></td>" +
                      "<td><input type='text' spellcheck='false' autocomplete='off' style='width:320px;' id='" + this.idTerminalMonitorPattern + "' value='' onblur='objControleStorageS.setTerminalMonitorPattern(this.value);'></td>" +
                      "</tr>" +
                      "<tr>" +
                      "<td class='right'><span class='telnetman_build_table_span1'>Error&nbsp;パターン</span></td>" +
                      "<td><textarea spellcheck='false' autocomplete='off' style='width:320px; height:50px;' id='" + this.idTerminalMonitorErrors + "' onblur='objControleStorageS.setTerminalMonitorErrors(this.value);'></textarea></td>" +
                      "</tr>" +
                      "</table>" +
                      "</div>" +
                      "<div class='margin20' id='" + this.idDiffValuesArea + "' ondragover='objLayoutFunctions.onDragOver(event);' ondrop='objParameter.readDiffValues(event);'>" +
                      "<a id='" + this.idDownloadDiffValues + "' href='#' onclick='objParameter.downloadDiffValues();' download='" + downloadDiffValuesFileName + "'><img src='img/download.png' width='16' height='16' alt='download'></a><img src='img/help.png' width='16' height='16' alt='help' class='onclick_node' onclick='objTelnetmanHelp.help(\"diff_info\");'><span class='telnetman_build_table_span1'>Diff&nbsp;設定&nbsp;:&nbsp;</span><span id='" + this.idDiffValuesJsonFileName + "'></span>" +
                      "<table class='telnetman_item_build_table'>" +
                      "<tr>" +
                      "<td class='right'><span class='telnetman_build_table_span1'>タイトル</span><img src='img/spellcheck.png' width='16' height='16' alt='help' class='onclick_node' onclick='objTelnetmanHelp.help(\"parameter5\");'></td>" +
                      "<td><input type='text' spellcheck='false' autocomplete='off' style='width:200px;' id='" + this.idDiffHeader1 +"' value='' onblur='objControleStorageS.setDiffHeader1(this.value);' placeholder='例) 事前ログ'></td>" +
                      "<td><input type='text' spellcheck='false' autocomplete='off' style='width:200px;' id='" + this.idDiffHeader2 +"' value='' onblur='objControleStorageS.setDiffHeader2(this.value);' placeholder='例) 事後ログ'></td>" +
                      "</tr>" +
                      "<tr>" +
                      "<td class='right'><span class='telnetman_build_table_span1'>値</span><img src='img/spellcheck.png' width='16' height='16' alt='help' class='onclick_node' onclick='objTelnetmanHelp.help(\"parameter56\");'></td>" +
                      "<td><textarea spellcheck='false' autocomplete='off' style='width:200px; height:100px;' id='" + this.idDiffValue1 + "' onblur='objControleStorageS.setDiffValue1(this.value);'></textarea></td>" +
                      "<td><textarea spellcheck='false' autocomplete='off' style='width:200px; height:100px;' id='" + this.idDiffValue2 + "' onblur='objControleStorageS.setDiffValue2(this.value);'></textarea></td>" +
                      "</tr>" +
                      "</table>" +
                      "</div>" +
                      "<div class='margin20' id='" + this.idOptionalLogArea + "' ondragover='objLayoutFunctions.onDragOver(event);' ondrop='objParameter.readOptionalLog(event);'>" +
                      "<a id='" + this.idDownloadOptionalLogValues + "' href='#' onclick='objParameter.downloadOptionalLogValues();' download='" + downloadOptionalLogFileName + "'><img src='img/download.png' width='16' height='16' alt='download'></a><img src='img/help.png' width='16' height='16' alt='help' class='onclick_node' onclick='objTelnetmanHelp.help(\"optional_log\");'><span class='telnetman_build_table_span1'>任意ログ設定&nbsp;:&nbsp;</span><span id='" + this.idOptionalLogJsonFileName + "'></span>" +
                      "<table class='telnetman_item_build_table'>" +
                      "<tr>" +
                      "<td class='right'><span class='telnetman_build_table_span1'>ヘッダー</span><img src='img/spellcheck.png' width='16' height='16' alt='help' class='onclick_node' onclick='objTelnetmanHelp.help(\"parameter5\");'></td>" +
                      "<td><input type='text' spellcheck='false' autocomplete='off' style='width:420px;' id='" + this.idOptionalLogHeader +"' value='' onblur='objControleStorageS.setOptionalLogHeader(this.value);'></td>" +
                      "</tr>" +
                      "<tr>" +
                      "<td class='right'><span class='telnetman_build_table_span1'>ログ</span><img src='img/spellcheck.png' width='16' height='16' alt='help' class='onclick_node' onclick='objTelnetmanHelp.help(\"parameter56\");'></td>" +
                      "<td><textarea spellcheck='false' autocomplete='off' style='width:420px; height:60px;' id='" + this.idOptionalLogValue + "' onblur='objControleStorageS.setOptionalLogValue(this.value);'></textarea></td>" +
                      "</tr>" +
                      "</table>" +
                      "</div>";
                      
  
  document.getElementById("object_area").innerHTML = htmlObjectArea;
  document.getElementById("build_area").innerHTML = htmlBuildArea;
  
  document.getElementById(this.idNodeListArea).style.display = "none";
  document.getElementById(this.idParameterSheetArea).style.display = "none";
  document.getElementById(this.idLoginInfoArea).style.display = "none";
  document.getElementById(this.idTerminalMonitorArea).style.display = "none";
  document.getElementById(this.idDiffValuesArea).style.display = "none";
  document.getElementById(this.idOptionalLogArea).style.display = "none";
  
  this.adjustHansontableWidth();
  
  if(!this.isOpened){
   this.setSessionData();
  }
  else{
   this.displaySessionData();
  }
  
  $("#" + this.idNodeListArea).fadeIn(300, function(){
   if(objParameter.isOpened){
    if(objParameter.nodeList.length > 0){
     objParameter.printNodeList();
     objParameter.changeButton();
    }
    else{
     objParameter.getNodeList();
    }
   }
   else{
    objParameter.getNodeList();
    objParameter.isOpened = true;
   }
  });
 };
 
 
 // 入力エリアを値を入れた状態で表示する。
 this.displaySessionData = function (){
  $("#" + this.idParameterSheetArea).fadeIn(300, function(){
   objParameter.defienHandsonTable();
   objParameter.loadParameter();
   objParameter.displayParameterCsvName();
  });
  $("#" + this.idLoginInfoArea).fadeIn(300, function(){
   objParameter.insertLoginInfo();
  });
  $("#" + this.idTerminalMonitorArea).fadeIn(300, function(){
   objParameter.insertTerminalMonitorValues();
  });
  $("#" + this.idDiffValuesArea).fadeIn(300, function(){
   objParameter.insertDiffValues();
  });
  $("#" + this.idOptionalLogArea).fadeIn(300, function(){
   objParameter.insertOptionalLogValues();
  });
 };
 
 
 // 自動停止を有効、無効にする。
 this.autoPause = function () {
  var elAutoPauseCheckbox = document.getElementById(this.idAutoPauseCheckbox);
  
  if(elAutoPauseCheckbox.checked){
   this.isAutoPause = true;
  }
  else{
   this.isAutoPause = false;
  }
  
  if(this.isExec){
   document.getElementById(this.idAutoPauseCheckbox).disabled = true;
   
   var authHeader = makeAuthHeader();
   
   var autoPause = 0;
   if(this.isAutoPause){
    autoPause = 1;
   }
   
   $.ajax({
    headers : {"telnetmanAuth" : authHeader},
    type : "post",
    url  : "/cgi-bin/Telnetman2/auto_pause.cgi",
    data : {
     "auto_pause" : autoPause
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
         document.getElementById(objParameter.idAutoPauseCheckbox).disabled = false;
         
         var autoPause = hashResult["auto_pause"];
         
         if((autoPause === 1) && (objParameter.isAutoPause === false)){
          objParameter.isAutoPause = true;
          document.getElementById(objParameter.idAutoPauseCheckbox).checked = true;
         }
         else if((autoPause === 0) && (objParameter.isAutoPause === true)){
          objParameter.isAutoPause = false;
          document.getElementById(objParameter.idAutoPauseCheckbox).checked = false;
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
       document.getElementById(objParameter.idAutoPauseCheckbox).disabled = false;
       alert("CGI Error");
      }
     }
    },
    error : function (){
     document.getElementById(objParameter.idAutoPauseCheckbox).disabled = false;
     alert("Server Error");
    }
   });
  }
 };
 
 // telnet のログインパスワードを記録する。
 this.setPassword = function (password) {
  if((password === null) || (password === undefined)){
   password = "";
  }
  
  this.password = password;
 };
 
 // telnet のEnable パスワードを記録する。
 this.setEnablePassword = function (enablePassword) {
  if((enablePassword === null) || (enablePassword === undefined)){
   enablePassword = "";
  }
  
  this.enablePassword = enablePassword;
 };
 
 
 // handsontable を定義する。
 this.defienHandsonTable = function () {
  $("#" + this.idHandsonTable).handsontable({
   rowHeaders : true,
   colHeaders : true,
   minSpareCols : 1,
   minSpareRows : 1,
   contextMenu : true,
   afterChange : function (changes, source) {
    objControleStorageS.setParameterList(objParameter.parameterList);
   },
   afterCreateRow : function (index, amount) {
    objControleStorageS.setParameterList(objParameter.parameterList);
   },
   afterCreateCol : function (index, amount) {
    objControleStorageS.setParameterList(objParameter.parameterList);
   },
   afterRemoveRow : function (index, amount) {
    objControleStorageS.setParameterList(objParameter.parameterList);
   },
   afterRemoveCol : function (index, amount) {
    objControleStorageS.setParameterList(objParameter.parameterList);
   }
  });
 };
 
 
 // Session Storage の内容をhandsontable に入れる。
 this.loadParameter = function () {
  $("#" + this.idHandsonTable).handsontable("loadData", objParameter.parameterList);
 };
 
 
 // handsontable を入れるDIV の横幅を画面ギリギリまで伸ばす。
 this.adjustHansontableWidth = function () {
  if(objControleStorageS.getPage() === "parameter"){
   var browserWidth = objCommonFunctions.getBrowserWidth();
   var handsonTableWidth = parseInt(browserWidth / 2, 10) + 180 - 26;
   document.getElementById(this.idHandsonTable).style.width = handsonTableWidth + "px";
  }
 };
 
 
 // csv を読み取る。
 this.readCsv = function (event) {
  if(!this.isExec){
   var files = event.dataTransfer.files;
   
   if((files[0] !== null) && (files[0] !== undefined)){
    if((files[0].name.match(/^Telnetman2_parameter_/)) && (files[0].name.match(/\.csv$/))){
     // FileReaderオブジェクトの生成。
     var reader = new FileReader();
     reader.name = files[0].name;
     
     // ファイル読取が完了した際に呼ばれる処理を定義。
     reader.onload = function (event) {
      var csvParameterList = event.target.result;
      var fileName         = event.target.name;
      objParameter.parameterCsvFileName = fileName;
      
      csvParameterList = csvParameterList.replace(/\r/g, "");
      var rows = csvParameterList.split("\n");
      
      var newParameterList = new Array();
      var newNodeList = new Array();
      for(var i = 0, j = rows.length; i < j; i ++){
       var cols = null;
       if(rows[i].match(/\t/)){
        cols = rows[i].split("\t");
       }
       else{
        cols = rows[i].split(",");
       }
       
       newParameterList[i] = new Array();
       
       while(cols.length > 0){
        var value = cols.shift();
        
        if((value === null) || (value === undefined)){
         value = "";
        }
        
        newParameterList[i].push(value);
       }
       
       // 1列しかなかったら2列目にダミーを入れる。
       if(newParameterList[i].length === 1){
        newParameterList[i].push("");
       }
      }
      
      objParameter.replaceParameterList(newParameterList);
     };
     
     // ファイルの内容を取得。
     reader.readAsText(files[0], 'utf8');
    }
    else{
     this.parameterCsvFileName = "";
     this.replaceParameterList([["","","","",""],["","","","",""],["","","","",""],["","","","",""],["","","","",""]]);
     alert("ファイル名が違います。");
    }
   }
   else{
    alert("取り込めませんでした。\n圧縮ファイルをドラッグ&ドロップしませんでしたか?\n解凍してからもう一度試して下さい。");
   }
  }
  
  // ブラウザ上でファイルを展開する挙動を抑止。
  event.preventDefault();
 };
 
 
 // 変数リストを入れ替える。
 this.replaceParameterList = function (newParameterList) {
  var X = this.parameterList.length;
  var x = newParameterList.length;
  
  if(x > X){
   X = x;
  }
  
  for(var i = 0; i < X; i ++){
   if((this.parameterList[i] !== null) && (this.parameterList[i] !== undefined)){
    var Y = this.parameterList[i].length;
    this.parameterList[i].splice(0, Y);
   }
   else{
    this.parameterList[i] = new Array();
   }
   
   if((newParameterList[i] !== null) && (newParameterList[i] !== undefined)){
    while(newParameterList[i].length > 0){
     var value = newParameterList[i].shift();
     this.parameterList[i].push(value);
    }
   }
   else{
    this.parameterList.splice(i, 1);
    i --;
    X --;
   }
  }
  
  this.loadParameter();
  this.displayParameterCsvName();
 };
 
 
 // CSV ファイル名を表示する。
 this.displayParameterCsvName = function () {
  if(this.parameterCsvFileName.length > 0){
   document.getElementById(this.idParameterCsvFileName).innerHTML = this.parameterCsvFileName;
  }
  else{
   document.getElementById(this.idParameterCsvFileName).innerHTML = "Telnetman2_parameter_****.csv";
  }
 };
 
 
 // 変数リストから最終列、最終行を削除した配列を作る。
 this.trimParameterList = function (isComment) {
  var parameterList = new Array();
  
  // 行数と最大列数を定義する。
  var X = this.parameterList.length;
  var Y = 0;
  for(var i = 0; i < X - 1; i ++){
   var y = this.parameterList[i].length;
   if(y > Y){
    Y = y;
   }
  }
  
  var k = 0;
  for(i = 0; i < X - 1; i ++){
   
   // コメント行を削除する場合。
   if(!isComment){
    var row = this.parameterList[i].join(",");
    row = row.replace(/^\s+/, "");
    
    if((row.length === 0) || row.match(/^#/)){
     continue;
    }
   }
   
   var parameterListRow = new Array();
   var emptyCount = 0;
   for(var j = 0; j < Y - 1; j ++){
    var value = "";
    
    if((this.parameterList[i][j] !== null) && (this.parameterList[i][j] !== undefined)){
     value = this.parameterList[i][j];
    }
    else{
     emptyCount ++;
    }
    
    if((j < Y - 1) || ((j === Y - 1) && (value.length > 0))){
     parameterListRow.push(value);
    }
   }
   
   if((i < X - 1) || ((i === X - 1) && (emptyCount === Y))){
    parameterList.push(parameterListRow);
    k ++;
   }
  }
  
  return(parameterList);
 };
 
 
 // 変数リストをCSV にしてダウンロードさせる。
 this.downloadParameterList = function () {
  var parameterList = this.trimParameterList(true);
  var csvParameterList = "";
  
  for(var i = 0, j = parameterList.length; i < j; i ++){
   csvParameterList += parameterList[i].join("\t") + "\r\n";
  }
  
  var blob = new Blob([csvParameterList], {"type" : "text/csv"});
  
  window.URL = window.URL || window.webkitURL;
  
  var elDownlodParameterCsv = document.getElementById(this.idDownloadParameterCsv);
  elDownlodParameterCsv.setAttribute("href", window.URL.createObjectURL(blob));
 };
 
 
 // telnet のログイン情報のテキストを読み取る。
 this.readLoginInfo = function (event) {
  if(!this.isExec){
   var files = event.dataTransfer.files;
   
   if((files[0] !== null) && (files[0] !== undefined)){
    if((files[0].name.match(/^Telnetman2_loginInfo_/)) && (files[0].name.match(/\.json$/))){
     // FileReaderオブジェクトの生成。
     var reader = new FileReader();
     reader.name = files[0].name;
     
     // ファイル読取が完了した際に呼ばれる処理を定義。
     reader.onload = function (event) {
      var text     = event.target.result;
      var fileName = event.target.name;
      objParameter.loginInfoJsonFileName = fileName;
      
      try{
       var loginInfoList = JSON.parse(text);
       
       objControleStorageS.setService(loginInfoList["service"]);
       objControleStorageS.setPort(loginInfoList["port"]);
       objControleStorageS.setTimeout(loginInfoList["timeout"]);
       objControleStorageS.setPrompt(loginInfoList["prompt"]);
       objControleStorageS.setUser(loginInfoList["user"]);
       objControleStorageS.setUserPrompt(loginInfoList["user_prompt"]);
       objControleStorageS.setPasswordPrompt(loginInfoList["password_prompt"]);
       objControleStorageS.setEnablePrompt(loginInfoList["enable_prompt"]);
       objControleStorageS.setEnableCommand(loginInfoList["enable_command"]);
       objControleStorageS.setTerminalLength(loginInfoList["terminal_length"]);
       objControleStorageS.setTerminalWidth(loginInfoList["terminal_width"]);
       objControleStorageS.setMoreString(loginInfoList["more_string"]);
       objControleStorageS.setMoreCommand(loginInfoList["more_command"]);
       objControleStorageS.setConfigureTerminal(loginInfoList["configure_terminal"]);
       objControleStorageS.setConfigureEnd(loginInfoList["configure_end"]);
       objControleStorageS.setExit(loginInfoList["exit"]);
       objParameter.password = "";
       
       objParameter.insertLoginInfo();
      }
      catch(error){
       objControleStorageS.removeService();
       objControleStorageS.removePort();
       objControleStorageS.removeTimeout();
       objControleStorageS.removePrompt();
       objControleStorageS.removeUser();
       objControleStorageS.removeUserPrompt();
       objControleStorageS.removePasswordPrompt();
       objControleStorageS.removeEnablePrompt();
       objControleStorageS.removeEnableCommand();
       objControleStorageS.removeTerminalLength();
       objControleStorageS.removeTerminalWidth();
       objControleStorageS.removeMoreString();
       objControleStorageS.removeMoreCommand();
       objControleStorageS.removeConfigureTerminal();
       objControleStorageS.removeConfigureEnd();
       objControleStorageS.removeExit();
       objParameter.password = "";
       
       objParameter.loginInfoJsonFileName = "";
       objParameter.insertLoginInfo();
      }
     };
     
     // ファイルの内容を取得。
     reader.readAsText(files[0], 'utf8');
    }
    else{
     objControleStorageS.removeService();
     objControleStorageS.removePort();
     objControleStorageS.removeTimeout();
     objControleStorageS.removePrompt();
     objControleStorageS.removeUser();
     objControleStorageS.removeUserPrompt();
     objControleStorageS.removePasswordPrompt();
     objControleStorageS.removeEnablePrompt();
     objControleStorageS.removeEnableCommand();
     objControleStorageS.removeEnablePassword();
     objControleStorageS.removeTerminalLength();
     objControleStorageS.removeTerminalWidth();
     objControleStorageS.removeMoreString();
     objControleStorageS.removeMoreCommand();
     objControleStorageS.removeConfigureTerminal();
     objControleStorageS.removeConfigureEnd();
     objControleStorageS.removeExit();
     this.password = "";
     
     this.loginInfoJsonFileName = "";
     this.insertLoginInfo();
     
     alert("ファイル名が違います。");
    }
   }
   else{
    alert("取り込めませんでした。\n圧縮ファイルをドラッグ&ドロップしませんでしたか?\n解凍してからもう一度試して下さい。");
   }
  }
  
  // ブラウザ上でファイルを展開する挙動を抑止。
  event.preventDefault();
 };
 
 
 // Web Storage 内のログイン情報をinput タグに入れ込む。
 this.insertLoginInfo = function () {
  document.getElementById(this.idPort).value              = objControleStorageS.getPort();
  document.getElementById(this.idTimeout).value           = objControleStorageS.getTimeout();
  document.getElementById(this.idPrompt).value            = objControleStorageS.getPrompt();
  document.getElementById(this.idUser).value              = objControleStorageS.getUser();
  document.getElementById(this.idUserPrompt).value        = objControleStorageS.getUserPrompt();
  document.getElementById(this.idPasswordPrompt).value    = objControleStorageS.getPasswordPrompt();
  document.getElementById(this.idEnablePrompt).value      = objControleStorageS.getEnablePrompt();
  document.getElementById(this.idEnableCommand).value     = objControleStorageS.getEnableCommand();
  document.getElementById(this.idEnablePassword).value    = this.enablePassword;
  document.getElementById(this.idTerminalLength).value    = objControleStorageS.getTerminalLength();
  document.getElementById(this.idTerminalWidth).value     = objControleStorageS.getTerminalWidth();
  document.getElementById(this.idMoreString).value        = objControleStorageS.getMoreString();
  document.getElementById(this.idMoreCommand).value       = objControleStorageS.getMoreCommand();
  document.getElementById(this.idConfigureTerminal).value = objControleStorageS.getConfigureTerminal();
  document.getElementById(this.idMoreString).value        = objControleStorageS.getMoreString();
  document.getElementById(this.idMoreCommand).value       = objControleStorageS.getMoreCommand();
  document.getElementById(this.idConfigureEnd).value      = objControleStorageS.getConfigureEnd();
  document.getElementById(this.idExit).value              = objControleStorageS.getExit();
  document.getElementById(this.idPassword).value          = this.password;
  
  var service = objControleStorageS.getService();
  if(service === "telnet"){
   document.getElementById(this.idService2).checked = false;
   document.getElementById(this.idService1).checked = true;
  }
  else if(service === "ssh-password"){
   document.getElementById(this.idService1).checked = false;
   document.getElementById(this.idService2).checked = true;
  }
  
  this.displayLoginInfoJsonFileName();
 };
 
 
 // サービスの選択によってポートを変える。
 this.changePort = function(){
  var service = objControleStorageS.getService();
  
  if(service === 'telnet'){
   document.getElementById(this.idPort).value = 23;
   objControleStorageS.setPort(23);
  }
  else if(service === 'ssh-password'){
   document.getElementById(this.idPort).value = 22;
   objControleStorageS.setPort(22);
  }
 };
 
 
 // ログイン情報JSON のファイル名を表示する。
 this.displayLoginInfoJsonFileName = function () {
  if(this.loginInfoJsonFileName.length > 0){
   document.getElementById(this.idLoginInfoJsonFileName).innerHTML = this.loginInfoJsonFileName;
  }
  else{
   document.getElementById(this.idLoginInfoJsonFileName).innerHTML = "Telnetman2_loginInfo_****.json";
  }
 };
 
 
 // ログイン情報をJSON でまとめる。
 this.makeLoginInfoJson = function (isPassword) {
  var loginInfoList = new Object();
  
  loginInfoList["service"]            = objControleStorageS.getService();
  loginInfoList["port"]               = objControleStorageS.getPort();
  loginInfoList["timeout"]            = objControleStorageS.getTimeout();
  loginInfoList["prompt"]             = objControleStorageS.getPrompt();
  loginInfoList["user"]               = objControleStorageS.getUser();
  loginInfoList["user_prompt"]        = objControleStorageS.getUserPrompt();
  loginInfoList["password_prompt"]    = objControleStorageS.getPasswordPrompt();
  loginInfoList["enable_prompt"]      = objControleStorageS.getEnablePrompt();
  loginInfoList["enable_command"]     = objControleStorageS.getEnableCommand();
  loginInfoList["terminal_length"]    = objControleStorageS.getTerminalLength();
  loginInfoList["terminal_width"]     = objControleStorageS.getTerminalWidth();
  loginInfoList["more_string"]        = objControleStorageS.getMoreString();
  loginInfoList["more_command"]       = objControleStorageS.getMoreCommand();
  loginInfoList["configure_terminal"] = objControleStorageS.getConfigureTerminal();
  loginInfoList["configure_end"]      = objControleStorageS.getConfigureEnd();
  loginInfoList["exit"]               = objControleStorageS.getExit();
  
  // パスワードを含める場合。
  if(isPassword){
   loginInfoList["password"]        = this.password;
   loginInfoList["enable_password"] = this.enablePassword;
  }
  
  var jsonLoginInfoList = JSON.stringify(loginInfoList);
  
  return(jsonLoginInfoList);
 };
 
 
 // ログイン情報をWeb Storage に入れる。
 this.setLoginInfo = function (loginInfoList){
  objControleStorageS.setService(loginInfoList["service"]);
  objControleStorageS.setPort(loginInfoList["port"]);
  objControleStorageS.setTimeout(loginInfoList["timeout"]);
  objControleStorageS.setPrompt(loginInfoList["prompt"]);
  objControleStorageS.setUser(loginInfoList["user"]);
  objControleStorageS.setUserPrompt(loginInfoList["user_prompt"]);
  objControleStorageS.setPasswordPrompt(loginInfoList["password_prompt"]);
  objControleStorageS.setEnablePrompt(loginInfoList["enable_prompt"]);
  objControleStorageS.setEnableCommand(loginInfoList["enable_command"]);
  objControleStorageS.setTerminalLength(loginInfoList["terminal_length"]);
  objControleStorageS.setTerminalWidth(loginInfoList["terminal_width"]);
  objControleStorageS.setMoreString(loginInfoList["more_string"]);
  objControleStorageS.setMoreCommand(loginInfoList["more_command"]);
  objControleStorageS.setConfigureTerminal(loginInfoList["configure_terminal"]);
  objControleStorageS.setConfigureEnd(loginInfoList["configure_end"]);
  objControleStorageS.setExit(loginInfoList["exit"]);
 };
 
 
 // ログイン情報のJSON をダウンロードさせる。
 this.downloadLoginInfo = function () {
  var jsonLoginInfoList = this.makeLoginInfoJson();
  var blob = new Blob([jsonLoginInfoList], {"type" : "text/plain"});
  
  window.URL = window.URL || window.webkitURL;
  
  var elDownlodLoginInfoJson = document.getElementById(this.idDownloadLoginInfoJson);
  elDownlodLoginInfoJson.setAttribute("href", window.URL.createObjectURL(blob));
 };
 
 
 // diff 設定を読み取る。
 this.readDiffValues = function (event) {
  if(!this.isExec){
   var files = event.dataTransfer.files;
   
   if((files[0] !== null) && (files[0] !== undefined)){
    if((files[0].name.match(/^Telnetman2_diffValues_/)) && (files[0].name.match(/\.json$/))){
     // FileReaderオブジェクトの生成。
     var reader = new FileReader();
     reader.name = files[0].name;
     
     // ファイル読取が完了した際に呼ばれる処理を定義。
     reader.onload = function (event) {
      var text     = event.target.result;
      var fileName = event.target.name;
      objParameter.diffValuesJsonFileName = files[0].name;
      
      try{
       var diffValueList = JSON.parse(text);
       
       objControleStorageS.setDiffHeader1(diffValueList["diff_header_1"]);
       objControleStorageS.setDiffHeader2(diffValueList["diff_header_2"]);
       objControleStorageS.setDiffValue1(diffValueList["diff_value_1"]);
       objControleStorageS.setDiffValue2(diffValueList["diff_value_2"]);
       
       objParameter.insertDiffValues();
      }
      catch(error){
       objControleStorageS.removeDiffHeader1();
       objControleStorageS.removeDiffHeader2();
       objControleStorageS.removeDiffValue1();
       objControleStorageS.removeDiffValue2();
       
       objParameter.diffValuesJsonFileName = "";
       objParameter.insertDiffValues();
      }
     };
     
     // ファイルの内容を取得。
     reader.readAsText(files[0], 'utf8');
    }
    else{
     objControleStorageS.removeDiffHeader1();
     objControleStorageS.removeDiffHeader2();
     objControleStorageS.removeDiffValue1();
     objControleStorageS.removeDiffValue2();
     
     objParameter.diffValuesJsonFileName = "";
     objParameter.insertDiffValues();
     
     alert("ファイル名が違います。");
    }
   }
   else{
    alert("取り込めませんでした。\n圧縮ファイルをドラッグ&ドロップしませんでしたか?\n解凍してからもう一度試して下さい。");
   }
  }
  
  // ブラウザ上でファイルを展開する挙動を抑止。
  event.preventDefault();
 };
 
 
 // Web Storage 内のDiff 設定をinput text に入れ込む。
 this.insertDiffValues = function () {
  document.getElementById(this.idDiffHeader1).value = objControleStorageS.getDiffHeader1();
  document.getElementById(this.idDiffHeader2).value = objControleStorageS.getDiffHeader2();
  document.getElementById(this.idDiffValue1).value  = objControleStorageS.getDiffValue1();
  document.getElementById(this.idDiffValue2).value  = objControleStorageS.getDiffValue2();
  
  this.displayDiffValuesJsonFileName();
 };
 
 
 // Diff 設定JSON のファイル名を表示する。
 this.displayDiffValuesJsonFileName = function () {
  if(this.diffValuesJsonFileName.length > 0){
   document.getElementById(this.idDiffValuesJsonFileName).innerHTML = this.diffValuesJsonFileName;
  }
  else{
   document.getElementById(this.idDiffValuesJsonFileName).innerHTML = "Telnetman2_diffValues_****.json";
  }
 };
 
 
 // Diff 設定をJSON でまとめる。
 this.makeDiffValuesJson = function () {
  var diffValueList = new Object();
  
  diffValueList["diff_header_1"]  = objControleStorageS.getDiffHeader1();
  diffValueList["diff_header_2"]  = objControleStorageS.getDiffHeader2();
  diffValueList["diff_value_1"]   = objControleStorageS.getDiffValue1();
  diffValueList["diff_value_2"]   = objControleStorageS.getDiffValue2();
  
  var jsonDiffValueList = JSON.stringify(diffValueList);
     
  return(jsonDiffValueList);
 };
 
 
 // Diff 設定をWeb Storage に入れる。
 this.setDiffValueList = function (diffValueList){
  objControleStorageS.setDiffHeader1(diffValueList["diff_header_1"]);
  objControleStorageS.setDiffHeader2(diffValueList["diff_header_2"]);
  objControleStorageS.setDiffValue1(diffValueList["diff_value_1"]);
  objControleStorageS.setDiffValue2(diffValueList["diff_value_2"]);
 };

 
 // Diff 設定のJSON をダウンロードさせる。
 this.downloadDiffValues = function () {
  var jsonDiffValueList = this.makeDiffValuesJson();
  var blob = new Blob([jsonDiffValueList], {"type" : "text/plain"});
  
  window.URL = window.URL || window.webkitURL;
  
  var elDownlodDiffValues = document.getElementById(this.idDownloadDiffValues);
  elDownlodDiffValues.setAttribute("href", window.URL.createObjectURL(blob));
 };
 
 
 // Terminal Monitor 設定を読み取る。
 this.readTerminalMonitorValues = function (event) {
  if(!this.isExec){
   var files = event.dataTransfer.files;
   
   if((files[0] !== null) && (files[0] !== undefined)){
    if((files[0].name.match(/^Telnetman2_terminalMonitor_/)) && (files[0].name.match(/\.json$/))){
     // FileReaderオブジェクトの生成。
     var reader = new FileReader();
     reader.name = files[0].name;
     
     // ファイル読取が完了した際に呼ばれる処理を定義。
     reader.onload = function (event) {
      var text     = event.target.result;
      var fileName = event.target.name;
      objParameter.terminalMonitorJsonFileName = fileName;
      
      try{
       var terminalMonitorValueList = JSON.parse(text);
       
       objControleStorageS.setTerminalMonitorCommand(terminalMonitorValueList["command"]);
       objControleStorageS.setTerminalMonitorPattern(terminalMonitorValueList["pattern"]);
       objControleStorageS.setTerminalMonitorErrors(terminalMonitorValueList["errors"]);
       
       objParameter.insertTerminalMonitorValues();
      }
      catch(error){
       objControleStorageS.removeTerminalMonitorCommand();
       objControleStorageS.removeTerminalMonitorPattern();
       objControleStorageS.removeTerminalMonitorErrors();
       
       objParameter.terminalMonitorJsonFileName = "";
       objParameter.insertTerminalMonitorValues();
      }
     };
     
     // ファイルの内容を取得。
     reader.readAsText(files[0], 'utf8');
    }
    else{
     objControleStorageS.removeTerminalMonitorCommand();
     objControleStorageS.removeTerminalMonitorPattern();
     objControleStorageS.removeTerminalMonitorErrors();
     
     objParameter.terminalMonitorJsonFileName = "";
     objParameter.insertTerminalMonitorValues();
     
     alert("ファイル名が違います。");
    }
   }
   else{
    alert("取り込めませんでした。\n圧縮ファイルをドラッグ&ドロップしませんでしたか?\n解凍してからもう一度試して下さい。");
   }
  }
  
  // ブラウザ上でファイルを展開する挙動を抑止。
  event.preventDefault();
 };
 
 
 // Web Storage 内のTerminal Monitor 設定をinput text に入れ込む。
 this.insertTerminalMonitorValues = function () {
  document.getElementById(this.idTerminalMonitorCommand).value = objControleStorageS.getTerminalMonitorCommand();
  document.getElementById(this.idTerminalMonitorPattern).value = objControleStorageS.getTerminalMonitorPattern();
  
  var arrayTerminalMonitorErrors = objControleStorageS.getTerminalMonitorErrors();
  document.getElementById(this.idTerminalMonitorErrors).value  = arrayTerminalMonitorErrors.join("\n");
  
  this.displayTerminalMonitorValuesJsonFileName();
 };
 
 
 // Terminal Monitor 設定JSON のファイル名を表示する。
 this.displayTerminalMonitorValuesJsonFileName = function () {
  if(this.terminalMonitorJsonFileName.length > 0){
   document.getElementById(this.idTerminalMonitorJsonFileName).innerHTML = this.terminalMonitorJsonFileName;
  }
  else{
   document.getElementById(this.idTerminalMonitorJsonFileName).innerHTML = "Telnetman2_terminalMonitor_****.json";
  }
 };
 
 
 // Terminal Monitor 設定をJSON でまとめる。
 this.makeTerminalMonitorValuesJson = function () {
  var terminalMonitorValueList = new Object();
  
  terminalMonitorValueList["command"]  = objControleStorageS.getTerminalMonitorCommand();
  terminalMonitorValueList["pattern"]  = objControleStorageS.getTerminalMonitorPattern();
  terminalMonitorValueList["errors"]   = objControleStorageS.getTerminalMonitorErrors();
  
  var jsonTerminalMonitorValueList = JSON.stringify(terminalMonitorValueList);
  
  return(jsonTerminalMonitorValueList);
 };
 
 
 // Terminal Monitor 設定をWeb Storage に入れる。
 this.setTerminalMonitorValues = function (terminalMonitorValueList){
  objControleStorageS.setTerminalMonitorCommand(terminalMonitorValueList["command"]);
  objControleStorageS.setTerminalMonitorPattern(terminalMonitorValueList["pattern"]);
  objControleStorageS.setTerminalMonitorErrors(terminalMonitorValueList["errors"]);
 };
 

 // Terminal Monitor 設定のJSON をダウンロードさせる。
 this.downloadTerminalMonitorValues = function () {
  var jsonTerminalMonitorValueList = this.makeTerminalMonitorValuesJson();
  var blob = new Blob([jsonTerminalMonitorValueList], {"type" : "text/plain"});
  
  window.URL = window.URL || window.webkitURL;
  
  var elDownlodTerminalMonitorValues = document.getElementById(this.idDownloadTerminalMonitorValues);
  elDownlodTerminalMonitorValues.setAttribute("href", window.URL.createObjectURL(blob));
 };
  
  
 // 任意ログ設定を読み取る。
 this.readOptionalLog = function (event) {
  if(!this.isExec){
   var files = event.dataTransfer.files;
   
   if((files[0] !== null) && (files[0] !== undefined)){
    if((files[0].name.match(/^Telnetman2_optionalLog_/)) && (files[0].name.match(/\.json$/))){
     // FileReaderオブジェクトの生成。
     var reader = new FileReader();
     reader.name = files[0].name;
     
     // ファイル読取が完了した際に呼ばれる処理を定義。
     reader.onload = function (event) {
      var text     = event.target.result;
      var fileName = event.target.name;
      objParameter.optionalLogJsonFileName = fileName;
      
      try{
       var optionalLogValues = JSON.parse(text);
       
       objControleStorageS.setOptionalLogHeader(optionalLogValues["optional_log_header"]);
       objControleStorageS.setOptionalLogValue(optionalLogValues["optional_log_value"]);
       
       objParameter.insertOptionalLogValues();
      }
      catch(error){
       objControleStorageS.removeOptionalLogHeader();
       objControleStorageS.removeOptionalLogValue();
       
       objParameter.optionalLogJsonFileName = "";
       objParameter.insertOptionalLogValues();
      }
     };
     
     // ファイルの内容を取得。
     reader.readAsText(files[0], 'utf8');
    }
    else{
     objControleStorageS.removeOptionalLogHeader();
     objControleStorageS.removeOptionalLogValue();
     
     objParameter.optionalLogJsonFileName = "";
     objParameter.insertOptionalLogValues();
     
     alert("ファイル名が違います。");
    }
   }
   else{
    alert("取り込めませんでした。\n圧縮ファイルをドラッグ&ドロップしませんでしたか?\n解凍してからもう一度試して下さい。");
   }
  }
  
  // ブラウザ上でファイルを展開する挙動を抑止。
  event.preventDefault();
 };
 
 
 // Web Storage 内の任意ログ設定をinput text に入れ込む。
 this.insertOptionalLogValues = function () {
  document.getElementById(this.idOptionalLogHeader).value = objControleStorageS.getOptionalLogHeader();
  document.getElementById(this.idOptionalLogValue).value  = objControleStorageS.getOptionalLogValue();
  
  this.displayOptionalLogJsonFileName();
 };
 
 
 // 任意ログ設定JSON のファイル名を表示する。
 this.displayOptionalLogJsonFileName = function () {
  if(this.optionalLogJsonFileName.length > 0){
   document.getElementById(this.idOptionalLogJsonFileName).innerHTML = this.optionalLogJsonFileName;
  }
  else{
   document.getElementById(this.idOptionalLogJsonFileName).innerHTML = "Telnetman2_optionalLog_****.json";
  }
 };
 
 
 // 任意ログ設定をJSON でまとめる。
 this.makeOptionalLogValuesJson = function () {
  var optionalLogValues = new Object();
  
  optionalLogValues["optional_log_header"]  = objControleStorageS.getOptionalLogHeader();
  optionalLogValues["optional_log_value"]   = objControleStorageS.getOptionalLogValue();

  var jsonOptionalLogValues = JSON.stringify(optionalLogValues);
   
  return(jsonOptionalLogValues);
 };
 
 
 // 任意ログ設定をWeb Storage に入れる。
 this.setOptionalLogValues = function (optionalLogValues){
  objControleStorageS.setOptionalLogHeader(optionalLogValues["optional_log_header"]);
  objControleStorageS.setOptionalLogValue(optionalLogValues["optional_log_value"]);
 };

 
 // 任意ログ設定のJSON をダウンロードさせる。
 this.downloadOptionalLogValues = function () {
  var jsonOptionalLogValues = this.makeOptionalLogValuesJson();
  var blob = new Blob([jsonOptionalLogValues], {"type" : "text/plain"});
  
  window.URL = window.URL || window.webkitURL;
  
  var elDownlodOptionalLogValues = document.getElementById(this.idDownloadOptionalLogValues);
  elDownlodOptionalLogValues.setAttribute("href", window.URL.createObjectURL(blob));
 };
 
 
 
 // ノードリストを描画する。
 this.printNodeList = function () {
  var elNodeListArea = document.getElementById(this.idNodeStatusArea);
  
  // 空にする。
  var nodeNumber = elNodeListArea.childNodes.length;
  for(var k = nodeNumber - 1; k >= 0; k --){
   elNodeListArea.removeChild(elNodeListArea.childNodes[k]);
  }
  
  for(var i = 0, j = this.nodeList.length; i < j; i ++){
   var node = this.nodeList[i];
   var status = this.nodeStatus[node];
   
   var elDiv = document.createElement("div");
   elDiv.setAttribute("id", this.idNode(node));
   elDiv.setAttribute("class", this.classNode(status));
   
   var elSpan = document.createElement("span");
   elSpan.innerHTML = node;
   
   if(status >= 4){
    elDiv.onclick = new Function("objParameter.getLog('" + node + "');");
   }
   
   elDiv.appendChild(elSpan);
   elNodeListArea.appendChild(elDiv);
  }
 };
 
 
 // ノードリストエリアにloading.gif を入れる。
 this.loadingNodeList = function () {
  var elNodeListArea = document.getElementById(this.idNodeStatusArea);
  
  // 空にする。
  var nodeNumber = elNodeListArea.childNodes.length;
  for(var k = nodeNumber - 1; k >= 0; k --){
   elNodeListArea.removeChild(elNodeListArea.childNodes[k]);
  }
  
  var elLoadingGif = document.createElement('img');
  elLoadingGif.setAttribute("src", "img/loading_128.gif");
  elLoadingGif.setAttribute("width", "128");
  elLoadingGif.setAttribute("height", "15");
  elLoadingGif.setAttribute("alt", "loading");
  
  elNodeListArea.appendChild(elLoadingGif);
 };
 
 
 // ノードのシンボルのclass 名を変える。
 this.changeNodeSymbol = function (){
  for(var i = 0, j = this.nodeList.length; i < j; i ++){
   var node = this.nodeList[i];
   var status = this.nodeStatus[node];
   
   var idNodeSymbol = this.idNode(node);
   var classNodeSymbol = this.classNode(status);
   
   var elDiv = document.getElementById(idNodeSymbol);
   
   elDiv.className = classNodeSymbol;
   
   if(status >= 4){
    elDiv.onclick = new Function("objParameter.getLog('" + node + "');");
   }
   else{
    elDiv.onclick = null;
   }
  }
 };
 
 
 // 実行ボタンの表示を変える。
 this.changeButton = function () {
  var elAutoPause               = document.getElementById(this.idAutoPauseCheckbox);
  var elExecButton              = document.getElementById(this.idExecButton);
  var elPauseButton             = document.getElementById(this.idPauseButton);
  var elForcedTerminationButton = document.getElementById(this.idForcedTerminationButton);
  var elZipButton               = document.getElementById(this.idZipButton);
  var elTelnetmanLightButton    = document.getElementById(this.idTelnetmanLightButton);
  
  elAutoPause.checked = this.isAutoPause;
  
  if(!this.isExec){
   elExecButton.className = 'enable';
   elExecButton.onclick = new Function("objParameter.exec();");
   
   elPauseButton.className = 'disable';
   elPauseButton.onclick = null;
   
   elForcedTerminationButton.className = 'disable';
   elForcedTerminationButton.onclick = null;
  }
  else{
   elExecButton.className = 'disable';
   elExecButton.onclick = null;
   
   if(this.isPause){
    elPauseButton.innerHTML = '再開';
    elPauseButton.className = 'enable';
    elPauseButton.onclick = new Function("objParameter.changeStatus('resumption');");
   }
   else{
    elPauseButton.innerHTML = '一時停止';
    elPauseButton.className = 'enable';
    elPauseButton.onclick = new Function("objParameter.changeStatus('pause');");
   }
   
   elForcedTerminationButton.className = 'enable';
   elForcedTerminationButton.onclick = new Function("objParameter.changeStatus('forced_termination');");
  }
  
  if(this.isZipLog){
   elZipButton.className = 'enable';
   elZipButton.onclick = new Function("objParameter.getZipLog();");
  }
  else{
   elZipButton.className = 'disable';
   elZipButton.onclick = null;
  }
  
  if(this.isTelnetmanLight){
   elTelnetmanLightButton.className = 'enable';
   elTelnetmanLightButton.onclick = new Function("objParameter.openTelnetmanLightBuilder();");
  }
  else{
   elTelnetmanLightButton.className = 'disable';
   elTelnetmanLightButton.onclick = null;
  }
 };
 
 
 // 入力データをサーバーからダウンロードしてWeb Storage に入れる。
 this.setSessionData = function (){
  var authHeader = makeAuthHeader();
  
  $.ajax({
   headers : {"telnetmanAuth" : authHeader},
   type : "post",
   url  : "/cgi-bin/Telnetman2/get_session_data.cgi",
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
        if("parameter_sheet" in hashResult){
         objControleStorageS.setParameterList(hashResult["parameter_sheet"]);
        }
        
        if("login_info" in hashResult){
         objParameter.setLoginInfo(hashResult["login_info"]);
        }
        
        if("terminal_monitor_values" in hashResult){
         objParameter.setTerminalMonitorValues(hashResult["terminal_monitor_values"]);
        }
        
        if("diff_values" in hashResult){
         objParameter.setDiffValueList(hashResult["diff_values"]);
        }
        
        if("optional_log_values" in hashResult){
         objParameter.setOptionalLogValues(hashResult["optional_log_values"]);
        }
        
        objParameter.parameterList = objControleStorageS.getParameterList();
        objParameter.displaySessionData();
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
 
 
 // telnet 実行のためのデータをサーバーに送る。
 this.exec = function () {
  if(!this.isExec){
   var elExecButton = document.getElementById(this.idExecButton);
   elExecButton.className = 'disable';
   elExecButton.onclick = null;
   
   var elZipButton = document.getElementById(this.idZipButton);
   elZipButton.className = 'disable';
   elZipButton.onclick = null;
   
   this.loadingNodeList();
   
   var authHeader = makeAuthHeader();
   
   var autoPause = 0;
   if(this.isAutoPause){
    autoPause = 1;
   }
   
   objFlowchart.archiveFlowchartData();
   var jsonLoginInfo = this.makeLoginInfoJson(true);
   var jsonDiffValueList = this.makeDiffValuesJson();
   var jsonOptionalLogValues = this.makeOptionalLogValuesJson();
   var jsonTerminalMonitorValueList = this.makeTerminalMonitorValuesJson();
   var jsonParameterList = objControleStorageS.getParameterList(true);
   
   objCommonFunctions.lockScreen();
   
   $.ajax({
    headers : {"telnetmanAuth" : authHeader},
    type : "post",
    url  : "/cgi-bin/Telnetman2/queue.cgi",
    data : {
     "session_title" : objControleStorageL.getSessionTitle(),
     "auto_pause" : autoPause,
     "parameter_json"   : jsonParameterList,
     "login_info_json"  : jsonLoginInfo,
     "diff_values_json" : jsonDiffValueList,
     "optional_log_values_json" : jsonOptionalLogValues,
     "terminal_monitor_values_json" : jsonTerminalMonitorValueList,
     "middle_flowchart_json" : objControleStorageL.getFlowchartData("middle"),
     "before_flowchart_json" : objControleStorageL.getFlowchartData("before"),
     "after_flowchart_json"  : objControleStorageL.getFlowchartData("after")
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
         
         if(result === 1){
          var nodeList   = hashResult["node_list"];
          var nodeStatus = hashResult["node_status"];
          
          // 既存のノードリストを削除する。
          while(objParameter.nodeList.length > 0){
           var node = objParameter.nodeList.shift();
           delete(objParameter.nodeStatus[node]);
          }
          
          // ノードリストを更新する。
          for(var i = 0, j = nodeList.length; i < j; i ++){
           node = nodeList[i];
           objParameter.nodeList.push(node);
           var status = nodeStatus[node];
           objParameter.nodeStatus[node] = status;
          }
          
          objParameter.printNodeList();
          
          // 全ノード終了の場合はボタンを押せるように、全ノード終了でない場合は5秒おきにステータスを確認するようにする。
          var sessionStatus = hashResult["session_status"];
          if(sessionStatus === 4){
           objParameter.isExec = false;
           objParameter.isPause = false;
           objParameter.isZipLog = true;
           objParameter.isTelnetmanLight = true;
           objParameter.changeButton();
          }
          else if(sessionStatus < 4){
           objParameter.isExec = true;
           objParameter.isZipLog = false;
           objParameter.isTelnetmanLight = false;
           objParameter.intervalId = setInterval("objParameter.checkStatus();", 5000);
          }
          
          objCommonFunctions.unlockScreen();
         }
         else{
          var reason = hashResult["reason"];
          alert(reason);
          objParameter.changeButton();
          objParameter.printNodeList();
          objCommonFunctions.unlockScreen();
         }
        }
        else{
         if(session === -2){
          var undefinedSessionId = hashResult["undefined_session_id"];
          objTelnetmanSession.removeSession(undefinedSessionId);
         }
         
         objCommonFunctions.unlockScreen();
         objParameter.changeButton();
         objParameter.printNodeList();
         
         // セション選択画面を開く。
         objTelnetmanSession.inputSessionList(hashResult);
         objTelnetmanSession.session();
        }
       }
       else{
        objCommonFunctions.unlockScreen();
        objParameter.changeButton();
        objParameter.printNodeList();
        
        // ログイン画面を開く。
        objTelnetmanLogin.login();
       }
      }
      else{
       alert("CGI Error");
       objCommonFunctions.unlockScreen();
       objParameter.changeButton();
       objParameter.printNodeList();
      }
     }
    },
    error : function (){
     alert("Server Error");
     objCommonFunctions.unlockScreen();
     objParameter.changeButton();
     objParameter.printNodeList();
    }
   });
  }
 };
 
 
 // セッションステータス、ノードステータスを確認する。
 this.checkStatus = function () {
  var authHeader = makeAuthHeader();
  
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
        
        var nodeStatus = hashResult["node_status"];
        var sessionStatus = hashResult["session_status"];
        
        // ノードステータスの変更。
        for(var node in nodeStatus){
         var status = nodeStatus[node];
         objParameter.nodeStatus[node] = status;
        }
        
        // この変数の画面を開いている場合はノードシンボルのclass 名を変更する。
        if(objControleStorageL.getPage() === "parameter"){
         objParameter.changeNodeSymbol();
        }
        
        if(objParameter.isExec && (sessionStatus === 4)){// 全ノード終了
         objParameter.isExec = false;
         objParameter.isPause = false;
         objParameter.isZipLog = true;
         objParameter.isTelnetmanLight = true;
         clearInterval(objParameter.intervalId);
        }
        else if(!objParameter.isPause && (sessionStatus === 1)){// 一時停止
         objParameter.isPause = true;
        }
        else if(objParameter.isPause && (sessionStatus !== 1)){// 再開
         objParameter.isPause = false;
        }
        
        // この変数の画面を開いている場合はボタン表示を変える。
        if(objControleStorageL.getPage() === "parameter"){
         objParameter.changeButton();
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
 
 
 // ログをダウンロードする。
 this.getLog = function (node){
  node = objCommonFunctions.escapeHtml(node);
  
  var html = "<table id='" + this.idLogTable + "' class='telnetman_script_viewer'>" +
             "<tr>" +
             "<th><div><span>" + node + "</span><img src='img/cancel.png' width='16' height='16' alt='cancel' onclick='objParameter.removeLogTable();'><div></th>" +
             "</tr>" +
             "<tr>" +
             "<td><textarea spellcheck='false' autocomplete='off' cols='120' rows='40' readonly='readonly' id='" + this.idLogTextarea + "'>log 取得中</textarea></td>" +
             "</tr>" +
             "</table>";
  
  objCommonFunctions.lockScreen(html);
  $("#" + this.idLogTable).fadeIn(200);
  
  var authHeader = makeAuthHeader();
  
  $.ajax({
   headers : {"telnetmanAuth" : authHeader},
   type : "post",
   url  : "/cgi-bin/Telnetman2/get_log.cgi",
   data : {
    "node" : node
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
         if(document.getElementById(objParameter.idLogTextarea)){
          var node = hashResult["node"];
          var log  = hashResult["log"];
          
          document.getElementById(objParameter.idLogTextarea).value = log;
         }
        }
        else{
         alert(hashResult["reason"]);
        }
       }
       else{
        objCommonFunctions.unlockScreen();
        
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
       objCommonFunctions.unlockScreen();
       
       // ログイン画面を開く。
       objTelnetmanLogin.login();
      }
     }
     else{
      alert("CGI Error");
      objCommonFunctions.unlockScreen();
     }
    }
   },
   error : function () {
    alert("Server Error");
    objCommonFunctions.unlockScreen();
   }
  });
 };
 
 
 // スクリプトの内容の表示のためtable を消す。
 this.removeLogTable = function () {
  $("#" + this.idLogTable).effect('fade', '', 200, function (){objCommonFunctions.unlockScreen();});
 };
 
 
 // 一時停止、再開、強制終了を実行する。
 this.changeStatus = function (status) {
  var elPauseButton = document.getElementById(this.idPauseButton);
  elPauseButton.className = 'disable';
  elPauseButton.onclick = null;
  
  var elForcedTerminationButton = document.getElementById(this.idForcedTerminationButton);
  elForcedTerminationButton.className = 'disable';
  elForcedTerminationButton.onclick = null;
  
  var authHeader = makeAuthHeader();
  
  $.ajax({
   headers : {"telnetmanAuth" : authHeader},
   type : "post",
   url  : "/cgi-bin/Telnetman2/change_status.cgi",
   data : {
    "status" : status
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
        
        if(result === 0){
         alert(hashResult["reason"]);
         objParameter.changeButton();
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
      objParameter.changeButton();
     }
    }
   },
   error : function (){
    alert("Server Error");
    objParameter.changeButton();
   }
  });
 };
 
 
 // ノードリストが空のとき、ノードリストとステータスを取得する。
 this.getNodeList = function () {
  if(this.nodeList.length === 0){
   
   var authHeader = makeAuthHeader();
   
   $.ajax({
    headers : {"telnetmanAuth" : authHeader},
    type : "post",
    url  : "/cgi-bin/Telnetman2/check_status.cgi",
    data : {
     "require_node_list" : 1
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
         
         if(objParameter.nodeList.length === 0){
          var nodeList = hashResult["node_list"];
          
          if(nodeList.length > 0){
           var nodeStatus = hashResult["node_status"];
           
           // ノードリストを入れ込む。
           for(var i = 0, j = nodeList.length; i < j; i ++){
            node = nodeList[i];
            objParameter.nodeList.push(node);
            var status = nodeStatus[node];
            objParameter.nodeStatus[node] = status;
           }
           
           // 全ノード終了でない場合は5秒おきにステータスを確認するようにする。
           var sessionStatus = hashResult["session_status"];
           
           if(sessionStatus === 4){// 全ノード終了
            objParameter.isExec = false;
            objParameter.isPause = false;
            objParameter.isZipLog = true;
            objParameter.isTelnetmanLight = true;
           }
           else if(sessionStatus === 1){// 一時停止
            objParameter.isExec = true;
            objParameter.isPause = true;
            objParameter.intervalId = setInterval("objParameter.checkStatus();", 5000);
           }
           else if((sessionStatus === 2) || (sessionStatus === 3)){// 待機中、実行中
            objParameter.isExec = true;
            objParameter.isPause = false;
            objParameter.intervalId = setInterval("objParameter.checkStatus();", 5000);
           }
           
           objParameter.printNodeList();
          }
          
          // 自動一時停止
          var autoPause = hashResult["auto_pause"];
          if(autoPause === 1){
           objParameter.isAutoPause = true;
          }
          
          objParameter.changeButton();
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
 };
 
 
 // zip 圧縮したログをダウンロードする。
 this.getZipLog = function (sessionId) {
  var authHeader = makeAuthHeader();
  
  if((sessionId !== null) && (sessionId !== undefined) && (sessionId.length > 0)){
   authHeader += sessionId;
  }
  
  $.ajax({
   headers : {"telnetmanAuth" : authHeader},
   type : "post",
   url  : "/cgi-bin/Telnetman2/make_zip_log.cgi",
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
        
        var result = hashResult["result"];
        
        if(result == 1){
         var sessionId = hashResult["session_id"];
         location.href = "/cgi-bin/Telnetman2/get_zip_log.cgi?session_id=" + sessionId;
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
 
 
 // Telentman Light 作成画面を開く。
 this.openTelnetmanLightBuilder = function (){
  this.hardCodingParameterSheet = null;
  
  var html = "<table id='" + this.idTelnetmanLightBuilder + "' class='telnetman_item_viewer'>" +
             "<tr>" +
             "<th><div><span>Telnetman&nbsp;Light&nbsp;作成</span><img src='img/cancel.png' width='16' height='16' alt='cancel' onclick='objParameter.closeTelnetmanLightBuilder();'></div></th>" +
             "</tr>" +
             "<tr>" +
             "<td class='left'><input type='checkbox' id='" + this.idNoHardCodingParameterSheet + "' value='1'><label class='checkbox1' for='" + this.idNoHardCodingParameterSheet + "'>パラメーターシートをハードコーディングしない</label></td>" +
             "</tr>" +
             "<tr>" +
             "<td class='left'><div class='upload_parameter_sheet_area' id='" + this.idHardCodingParameterSheet + "' ondragover='objLayoutFunctions.onDragOver(event);' ondrop='objParameter.readHardCodingParameterSheet(event);'><span>パラメーターシートをここにドロップ</span></div></td>" +
             "</tr>" +
             "<tr>" +
             "<td class='center'><button class='enable' id='" + this.idMakeTelnetmanLightButton + "' onclick='objParameter.makeTelnetmanLight();'>作成</button></td>" +
             "</tr>" +
             "<tr>" +
             "<td class='left'>" +
              "<ul>" +
              "<li>直近で実行された内容がハードコーディングされます。</li>" +
              "<li>パラメーターシートだけはここで指定したものをハードコーディングできます。</li>" +
              "<li>オプションや必要モジュールの説明は中に書いてあります。</li>" +
              "<li>250行目付近のコメント「ここから下は変更しない」より上を適宜変更して下さい。</li>" +
              "<li>文字コード:UTF-8N,&nbsp;改行コード:LF&nbsp;で保存して下さい。</li>" +
              "</ul>" +
             "</td>" +
             "</tr>" +
             "</table>";
             
  objCommonFunctions.lockScreen(html);
  $("#" + this.idTelnetmanLightBuilder).fadeIn(200);
 };
 
 this.closeTelnetmanLightBuilder = function () {
  this.hardCodingParameterSheet = null;
  $("#" + this.idTelnetmanLightBuilder).effect('fade', '', 200, function (){objCommonFunctions.unlockScreen();});
 };
 
 // Telentman Light 用パラメーターシートを読み取る。
 this.readHardCodingParameterSheet = function (event) {
  if(!this.isExec){
   var files = event.dataTransfer.files;
   
   if((files[0] !== null) && (files[0] !== undefined)){
    var fileName = files[0].name;
    
    if((fileName.match(/^Telnetman2_parameter_/)) && (fileName.match(/\.csv$/))){
     document.getElementById(this.idHardCodingParameterSheet).childNodes[0].innerHTML = fileName;
     this.hardCodingParameterSheet = files[0];
    }
    else{
     this.hardCodingParameterSheet = null;
     document.getElementById(this.idHardCodingParameterSheet).childNodes[0].innerHTML = "パラメーターシートをここにドロップ";
     alert("ファイル名が違います。");
    }
   }
   else{
    this.hardCodingParameterSheet = null;
    document.getElementById(this.idHardCodingParameterSheet).childNodes[0].innerHTML = "パラメーターシートをここにドロップ";
    alert("取り込めませんでした。\n圧縮ファイルをドラッグ&ドロップしませんでしたか?\n解凍してからもう一度試して下さい。");
   }
  }
  
  // ブラウザ上でファイルを展開する挙動を抑止。
  event.preventDefault();
 };
 
 // Telentman Light 作成ボタン
 this.changeTelnetmanLightButton = function (enable){
  if(enable){
   document.getElementById(this.idMakeTelnetmanLightButton).onclick = new Function("objParameter.makeTelnetmanLight();");
   document.getElementById(this.idMakeTelnetmanLightButton).className = "enable";
  }
  else{
   document.getElementById(this.idMakeTelnetmanLightButton).onclick = null;
   document.getElementById(this.idMakeTelnetmanLightButton).className = "disable";
  }
 };
 
 // Telentman Light を作成する。
 this.makeTelnetmanLight = function (){
  this.changeTelnetmanLightButton(false);
  
  var formData = new FormData();
  
  if(document.getElementById(this.idNoHardCodingParameterSheet).checked){
   formData.append("no_hard_coding_parameter_sheet", 1);
  }
  else{
   formData.append("no_hard_coding_parameter_sheet", 0);
  }
  
  if(this.hardCodingParameterSheet !== null){
   formData.append("parameter_csv_file", this.hardCodingParameterSheet);
  }
  
  var authHeader = makeAuthHeader();
  
  $.ajax({
   headers : {"telnetmanAuth" : authHeader},
   type : "post",
   url  : "/cgi-bin/Telnetman2/make_Telnetman_light.cgi",
   data : formData,
   contentType : false,
   processData : false,
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
         objParameter.changeTelnetmanLightButton(true);
         var sessionId = hashResult["session_id"];
         location.href = "/cgi-bin/Telnetman2/get_Telnetman_light.cgi?session_id=" + sessionId;
        }
        else if(result === 0){
         alert(hashResult["reason"]);
         objParameter.changeTelnetmanLightButton(true);
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
      objParameter.changeButton();
      objParameter.changeTelnetmanLightButton(true);
     }
    }
   },
   error : function (){
    alert("Server Error");
    objParameter.changeButton();
    objParameter.changeTelnetmanLightButton(true);
   }
  });
 };
 
 return(this);
}
