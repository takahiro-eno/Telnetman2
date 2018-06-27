// 説明   : ログイン画面
// 作成日 : 2014/06/16
// 作成者 : 江野高広
// 更新 : 2015/02/04 ロック解除機能の追加。

var objTelnetmanLogin = new telnetmanLogin();

function telnetmanLogin () {
 // HTML のid の接頭語と固定id
 this.idPrefix = "telnetman_login_";
 this.idTable    = this.idPrefix + "table";
 this.idUser     = this.idPrefix + "user";
 this.idPassword = this.idPrefix + "password";
 this.idButton   = this.idPrefix + "button";
 this.idMessage  = this.idPrefix + "message";
 
 // ユーザーID
 this.userId = "";
 
 
 // 入力用table を作成する。
 this.makeFormHtml = function () {
  var html = "<table class='telnetman_login_table' id='" + this.idTable + "'>" +
   "<tr>" +
   "<td class='telnetman_login_left'><span>login</span></td>" +
   "<td class='telnetman_login_right'><a href='index.html'>top</a></td>" +
   "</tr>" +
   "<tr>" +
   "<td><span>user:</span></td>" +
   "<td><input type='text' size='30' spellcheck='false' autocomplete='off' id='" + this.idUser + "' value=''></td>" +
   "</tr>" +
   "<tr>" +
   "<td><span>password:</span></td>" +
   "<td><input type='password' size='30' id='" + this.idPassword + "' value=''></td>" +
   "</tr>" +
   "<tr>" +
   "<td colspan='2' class='telnetman_login_center'><button class='enable' onclick='objTelnetmanLogin.submit();' id='" + this.idButton + "'>login</button></td>" +
   "</tr>" +
   "<tr>" +
   "<td colspan='2' class='telnetman_login_center'><span id='" + this.idMessage + "'></span></td>" + 
   "</tr>" +
   "</table>";
  
  return(html);
 };
 
 
 // 未ログインのときのユーザー名、パスワード入力画面を表示。
 this.login = function () {
  objLayoutFunctions.stopStatus();
  
  var html = this.makeFormHtml();
  objCommonFunctions.lockScreen(html, this.idPrefix, "objTelnetmanLogin.submit()");
  $("#" + this.idTable).fadeIn(300);
 };
 
 
 // 入力されたユーザー名、パスワードを変数に代入する。
 this.submit = function () {
  var user = document.getElementById(this.idUser).value;
  var password = document.getElementById(this.idPassword).value;
  
  if((user.length > 0) && (password.length > 0)){
   this.userId = user;
   var auth = "Telnetman " + user + ' ' + password;
   
   $.ajax({
    headers : {"telnetmanAuth" : auth},
    type : "post",
    url  : "/cgi-bin/Telnetman2/login.cgi",
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
       
       if(login === 1){
        var userId = hashResult["user_id"];
        objControleStorageS.setUserId(userId);
        
        var loginId = hashResult["login_id"];
	objControleStorageL.setLoginId(loginId);
	
        $("#" + objTelnetmanLogin.idTable).effect('fade', '', 300, function(){objCommonFunctions.unlockScreen(); objTelnetmanSession.inputSessionList(hashResult); objTelnetmanSession.session();});
       }
       else{
        var message = "";
	
	if(login === 0){
	 message = "認証に失敗しました。";
	}
	else if(login === -1){
	 message = "ユーザー名かパスワードが違います。";
	}
	else if(login === -2){
	 message = "アカウントがロックされています。<button class='enable' onclick='objTelnetmanLogin.unlock();'>ロック解除</button>";
	}
	
	document.getElementById(objTelnetmanLogin.idMessage).innerHTML = message;
	$("#" + objTelnetmanLogin.idTable).effect('shake', '', 300);
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
 
 
 // ロック解除メール送信CGI にアクセスする。
 this.unlock = function () {
  var url = location.href;
  
  $.ajax({
   type : "post",
   url  : "/cgi-bin/Telnetman2/unlock_mail.cgi",
   data : {
    "user_id" : this.userId,
    "url" : url
   },
   success : function (jsonResult) {
    var hashResult = null;
    
    try{
     hashResult = JSON.parse(jsonResult);
    }
    catch(error){
     
    }
    
    if(hashResult !== null){
     var result = hashResult["result"];
     
     if(result === 1){
      alert("ロック解除の準備完了。\n登録されているメールアドレス宛に解除URL を記載したメールを送信しました。");
     }
     else{
      var reason = hashResult["reason"];
      alert("ロック解除手続きに失敗しました。\n理由 : " + reason);
     }
    }
    else{
     alert("CGI Error");
    }
   },
   error : function () {
    alert("Server Error");
   }
  });
 };
 
 return(this);
}
