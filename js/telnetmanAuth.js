// 説明   : Telnetman の管理者ユーザー認証用
// 作成日 : 2014/06/09
// 作成者 : 江野高広

var objTelnetmanAuth = new telnetmanAuth();

function telnetmanAuth () {
 // ユーザーID, パスワードを入力後に呼び出される関数名。
 this.callbackFunctionName = "";
 
 // Web stotage のkey を定義。
 this.keyPrefix = "Telnetman2_";
 this.keyUser = this.keyPrefix + "admin_user_id";
 this.keyPassword = this.keyPrefix + "admin_password";
 
 
 // HTML のid の接頭語と固定id
 this.idPrefix = "telnetman_auth_";
 this.idUser     = this.idPrefix + "_user";
 this.idPassword = this.idPrefix + "_password";
 this.idButton   = this.idPrefix + "_button";
 
 
 // 入力用table を作成する。
 this.makeFormHtml = function () {
  var html = "<table class='telnetman_auth_table'>" +
   "<tr>" +
   "<td colspan='2' class='telnetman_auth_header'><span>要管理者権限</span></td>" +
   "</tr>" +
   "<tr>" +
   "<td><span>user:</span></td>" +
   "<td><input type='text' size='30' id='" + this.idUser + "' value=''></td>" +
   "</tr>" +
   "<tr>" +
   "<td><span>password:</span></td>" +
   "<td><input type='password' size='30' id='" + this.idPassword + "' value=''></td>" +
   "</tr>" +
   "<tr>" +
   "<td colspan='2' class='telnetman_auth_button'><button class='enable' onclick='objTelnetmanAuth.set(); " + this.callbackFunctionName + ";' id='" + this.idButton + "'>submit</button><button class='enable' onclick='objCommonFunctions.unlockScreen();'>cancel</button></td>" +
   "</tr>" +
   "</table>";
  
  return(html);
 };
 
 
 // ユーザー名、パスワードが未入力なら入力画面を表示する。
 this.check = function (callbackFunction) {
  this.callbackFunctionName = callbackFunction;
  
  if((storageL.getItem(this.keyUser) === null) || (storageL.getItem(this.keyPassword) === null)){
   var html = this.makeFormHtml();
   
   objCommonFunctions.lockScreen(html, this.idPrefix);
   
   return(false);
  }
  
  return(true);
 };
 
 
 // ユーザー名、パスワードを再入力する。
 this.reinput = function () {
  var html = this.makeFormHtml();
  objCommonFunctions.lockScreen(html, this.idPrefix);
 };
 
 
 // 入力されたユーザー名、パスワードを変数に代入する。
 this.set = function () {
  var user = document.getElementById(this.idUser).value;
  var password = document.getElementById(this.idPassword).value;
  
  if((user.length > 0) && (password.length > 0)){
   storageL.setItem(this.keyUser, user);
   storageL.setItem(this.keyPassword, password);
   
   objCommonFunctions.unlockScreen();
  }
 };
 
 
 // ユーザー名、パスワードをヘッダーに入れる形にする。
 this.makeAuth = function () {
  var user = storageL.getItem(this.keyUser);
  var password = storageL.getItem(this.keyPassword);
  
  return("Administrator " + user + ' ' + password);
 };
 
 
 return(this);
}
