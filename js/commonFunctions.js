// 説明   : 共通で使える関数集。
// 作成日 : 2014/05/28
// 作成者 : 江野高広

var objCommonFunctions = new commonFunctions();

function commonFunctions () {
 this.idLockScreen = "lockScreen";
 
 // HTML Escape
 this.escapeHtml = function (string) {
  if(typeof(string) === "number"){
   return(string);
  }
  else if((string === null) || (string === undefined) || (string.length === 0)){
   return("");
  }
  
  string = string.replace(/&/g, "&amp;");
  string = string.replace(/"/g, "&quot;");
  string = string.replace(/'/g, "&#39;");
  string = string.replace(/</g, "&lt;");
  string = string.replace(/>/g, "&gt;");
  string = string.replace(/ /g, "&nbsp;");
  string = string.replace(/\\/g, "&yen;");
  
  return(string);
 };
 
 // ファイル名に使えない文字を「-」にする。
 this.escapeFilename = function (string){
  if(typeof(string) === "number"){
   return(string);
  }
  else if((string === null) || (string === undefined) || (string.length === 0)){
   return("");
  }
  
  string = string.replace(/\s/g, "-");
  string = string.replace(/\\/g, "-");
  string = string.replace(/\//g, "-");
  string = string.replace(/:/g, "");
  string = string.replace(/\*/g, "-");
  string = string.replace(/\?/g, "-");
  string = string.replace(/"/g, "-");
  string = string.replace(/</g, "-");
  string = string.replace(/>/g, "-");
  string = string.replace(/\|/g, "-");
  
  return(string);
 };
 
 // unixtime (秒)を日付に変える。
 this.unixtimeToDate = function (unixtime, format){
  if((unixtime === null) || (unixtime === undefined) || (unixtime.length === 0) || (typeof(unixtime) !== "number")){
   unixtime = this.getUnixtime();
  }
  
  if((format === null) || (format === undefined) || (format.length === 0)){
   format = "YYYY/MM/DD hh:mm:ss";
  }
  
  var date = new Date();
  date.setTime(unixtime * 1000);
  
  var YYYY = date.getFullYear();
  var MM   = date.getMonth() + 1;
  var DD   = date.getDate();
  var hh   = date.getHours();
  var mm   = date.getMinutes();
  var ss   = date.getSeconds();
  
  // 左側を「0」で埋める。
  MM = ("0" + MM).slice(-2);
  DD = ("0" + DD).slice(-2);
  hh = ("0" + hh).slice(-2);
  mm = ("0" + mm).slice(-2);
  ss = ("0" + ss).slice(-2);
  
  format = format.replace(/YYYY/g, YYYY);
  format = format.replace(/MM/g, MM);
  format = format.replace(/DD/g, DD);
  format = format.replace(/hh/g, hh);
  format = format.replace(/mm/g, mm);
  format = format.replace(/ss/g, ss);
  
  return(format);
 };
 
 // unixtime (秒)を求める。
 this.getUnixtime = function () {
  return(parseInt((new Date)/1000, 10));
 };
 
 // 画面の高さを求める。
 this.getBrowserHeight = function () {
  if(window.innerHeight){
   return(window.innerHeight);
  }
  else if(document.documentElement && (document.documentElement.clientHeight !== 0)){
   return(document.documentElement.clientHeight);
  }
  else if(document.body) {
   return(document.body.clientHeight);
  }
  else{
   return(0);
  }
 };
 
 // 画面の幅を求める。
 this.getBrowserWidth = function () {
  if(window.innerWidth){
   return(window.innerWidth);
  }
  else if(document.documentElement && (document.documentElement.clientWidth !== 0)){
   return(document.documentElement.clientWidth);
  }
  else if(document.body){
   return(document.body.clientWidth);
  }
  else{
   return(0);
  }
 };
 
 this.lockScreen = function (html, tabOkIdPref, functionName) {
  if(!document.getElementById(this.idLockScreen)){
   if((html === null) || (html === undefined)){
    html = "";
   }
   
   var elementsInput = document.getElementsByTagName("INPUT");
   var elementsSelect = document.getElementsByTagName("SELECT");
   var elementsTextarea = document.getElementsByTagName("TEXTAREA");
   var elementsButton = document.getElementsByTagName("BUTTON");
   
   for(var i = 0, j = elementsInput.length; i < j; i ++){
    elementsInput[i].blur();
   }
   
   for(i = 0, j = elementsSelect.length; i < j; i ++){
    elementsSelect[i].blur();
   }
   
   for(i = 0, j = elementsTextarea.length; i < j; i ++){
    elementsTextarea[i].blur();
   }
   
   for(i = 0, j = elementsButton.length; i < j; i ++){
    elementsButton[i].blur();
   }
   
   if((tabOkIdPref !== null) && (tabOkIdPref !== undefined) && (tabOkIdPref.length > 0)){
    document.onkeyup =
    function (tabOkIdPref) {
     if(event.keyCode === 9){
      var focusElement = document.activeElement;
      
      if(focusElement !== null){
       var focusElementId = focusElement.id;
       var regTabOkIdPref = new RegExp("^" + tabOkIdPref);
       
       if((focusElementId === undefined) || (focusElementId.length === 0) || !focusElementId.match(regTabOkIdPref)){
        focusElement.blur();
       }
      }
     }
     else if(event.keyCode === 13){
      if((functionName !== null) && (functionName !== undefined) && (functionName.length > 0)){
       eval(functionName + ";");
      }
     }
    };
   }
   else{
    document.onkeydown =
    function (){
     if(event.keyCode === 9){
      return false;
     }
    };
   }
   
   $("body").append("<div id='" + this.idLockScreen + "' style='z-index:200;position:fixed;left:0;top:0;width:100%;height:100%;color:#000000;background-color:rgba(0,0,0,0.2);'>" + html + "</div>");
  }
 };
 
 this.unlockScreen = function () {
  if(document.getElementById(this.idLockScreen)){
   document.onkeyup   = null;
   document.onkeydown = null;
   $("#" + this.idLockScreen).remove();
  }
 };
 
 // 全角英数を半角にする。
 this.convertFullSizeAlphabetAndNumber = function (string) {
  string = string.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);});
  return(string);
 };
 
 // 全角文字も1文字として何文字あるか。
 this.checkStringLength = function (string) {
  escapeString = escape(string);
  var stringLength = escapeString.length;
  
  for(var i = 0, len = 0; i < stringLength; i ++, len ++){
   if(escapeString.charAt(i) === "%"){
    i ++;
    if(escapeString.charAt(i) === "u"){
     i += 3;
     len ++;
    }
    i ++;
   }
  }
  
  return(len);
 };
 
 // 全角文字があったらfalse
 this.checkFullSizeChar = function (string){
  escapeString = escape(string);
  var stringLength = escapeString.length;
  
  for(var i = 0; i < stringLength; i ++){
   if(escapeString.charAt(i) === "%"){
    i ++;
    if(escapeString.charAt(i) === "u"){
     return(false);
    }
    else{
     i ++;
    }
   }
  }
  
  return(true);
 };
 
 // メールアドレスの書式確認
 this.checkMailAddress = function (mailAddress){
  if((mailAddress !== null) && (mailAddress !== undefined) && (mailAddress.length > 0)){
   if(mailAddress.match(/.+@.+/)){
    var splitMailAddress = mailAddress.split("@");
    if(splitMailAddress[1].match(/\./) && !splitMailAddress[1].match(/\.$/)){
     return(true);
    }
   }
  }
  
  return(false);
 };
 
 // 文字列中の&yen; を\ に変更する。
 this.convertYen = function (string){
  var convertionString = "";
  
  if((string !== null) && (string !== undefined) && (string.length > 0)){
   var pos = 0;
   
   while(1){
    var charCode = string.charCodeAt(pos);
    
    if(this.isReallyNaN(charCode)){
     break;
    }
    else{
     if(charCode === 165){
      charCode = 92;
     }
     
     convertionString += String.fromCharCode(charCode);
     pos += 1;
    }
   }
  }
  
  return(convertionString);
 };

 // parameterがNaNであればtrue, それ以外ではfalse
 this.isReallyNaN = function (parameter) {
  return(parameter !== parameter);
 };

 return(this);
}
