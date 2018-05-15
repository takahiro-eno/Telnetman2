// 説明   : ユーザー承認画面用。
// 作成日 : 2014/06/09
// 作成者 : 江野高広

var objAuthorizeUser = new authorizeUser();

function authorizeUser () {
 
 this.userIdList = new Array();// ユーザーIndex を登録順に並べる。
 this.userInfo = new Object();// ユーザーIndex をkey にしてユーザー情報を入れる。
 
 // 初期化
 this.initialize = function () {
  var lengthUserIdList = this.userIdList.length;
  this.userIdList.splice(0, lengthUserIdList);
  
  for(var userId in this.userInfo){
   delete(this.userInfo[userId]);
  }
 };
 
 
 // HTML タグのID を作成する。
 this.idPrefix = "telnetman_ineffective_user_";
 
 this.makeRowId = function (userId){
  return(this.idPrefix + "tr_" + userId);
 };
 
 
 // ユーザー情報を格納する。
 this.inputUserInfo = function (background, userId, userName, userMail, userRegistrationTime){
  this.userIdList.push(userId);
  
  this.userInfo[userId] = new Object();
  this.userInfo[userId]["background"] = background;
  this.userInfo[userId]["userName"] = userName;
  this.userInfo[userId]["userMail"] = userMail;
  this.userInfo[userId]["userRegistrationTime"] = userRegistrationTime;
 };
 
 
 // 1ユーザー分のHTML を作成する。
 this.makeHtmlTr = function (userId){
  var background = this.userInfo[userId]["background"];
  var escapedUserId = objCommonFunctions.escapeHtml(userId);
  var userName = objCommonFunctions.escapeHtml(this.userInfo[userId]["userName"]);
  var userMail = objCommonFunctions.escapeHtml(this.userInfo[userId]["userMail"]);
  var userRegistrationTime = objCommonFunctions.unixtimeToDate(this.userInfo[userId]["userRegistrationTime"], "YYYY/MM/DD hh:mm:ss");
  
  var rowId = this.makeRowId(userId);
  
  var html = "<tr id='" + rowId + "'>" +
             "<td class='background" + background + "'><span class='black'>" + userName + "</span></td>" +
	     "<td class='background" + background + "'><span class='black'>" + escapedUserId   + "</span></td>" +
	     "<td class='background" + background + "'><span class='black'>" + userMail + "</span></td>" +
	     "<td class='background" + background + "'><span class='black'>" + userRegistrationTime + "</span></td>" +
	     "<td class='background" + background + "'><button class='enable' onclick='objAuthorizeUser.authorize(\"" + userId + "\");'>承認</bunnton></td>" +
	     "</tr>";
  
  return(html);
 };
 
 
 // 全ユーザー分のHTML を作成する。
 this.makeHtmlTable = function (){
  var html = "<table class='basic_summary'>" +
             "<tr><th>お名前</th><th>ユーザーID</th><th>メールアドレス</th><th>登録日時</th><th>-</th></tr>";
  
  for(var i = 0, j = this.userIdList.length; i < j; i ++){
   var userId = this.userIdList[i];
   var tr = this.makeHtmlTr(userId);
   html += tr;
  }
  
  html += "</table>";
  
  return(html);
 };
 
 
 // 選択したユーザーを承認する。
 this.authorize = function (userId){
  var check = objTelnetmanAuth.check("objAuthorizeUser.authorize('" + userId + "')");
  
  if(check){
   var url = window.location.href;
   var auth = objTelnetmanAuth.makeAuth();
   
   $.ajax({
    headers : {"telnetmanAuthAdmin" : auth},
    type : "post",
    url  : "/cgi-bin/Telnetman2/authorize_user.cgi",
    data : {
     "user_id" : userId,
     "url" : url
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
       var authResult = hashResult["auth"];
       
       if(authResult === 1){
        var updateResult = hashResult["result"];
	
	if(updateResult === 1){
	 var userId = hashResult["user_id"];
	 
	 var rowId = objAuthorizeUser.makeRowId(userId);
	 
	 var elRow = document.getElementById(rowId);
	 elRow.childNodes[0].childNodes[0].className = "gray";
	 elRow.childNodes[1].childNodes[0].className = "gray";
	 elRow.childNodes[2].childNodes[0].className = "gray";
	 elRow.childNodes[3].childNodes[0].className = "gray";
	 elRow.childNodes[4].childNodes[0].className = "disable";
	 elRow.childNodes[4].childNodes[0].onclick = null;
	}
	else{
	 alert("既に承認されていたか、承認に失敗しました。");
	}
       }
       else{
        alert("認証失敗");
       }
      }
     }
    },
    error : function (){
     alert("うまく通信できませんでした。");
    }
   });
  }
 };
 
 
 // ユーザー一覧を取得する。
 this.get = function () {
  var check = objTelnetmanAuth.check("objAuthorizeUser.get();");
  
  if(check){
   var auth = objTelnetmanAuth.makeAuth();
   
   $.ajax({
    headers : {"telnetmanAuthAdmin" : auth},
    type : "post",
    url  : "/cgi-bin/Telnetman2/get_ineffective_user.cgi",
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
       var authResult = hashResult["auth"];
       
       if(authResult === 1){
        objAuthorizeUser.initialize();
        
	for(var i = 0, j = hashResult["user_list"].length; i < j; i ++){
	 var background = i % 2;
	 
	 var userId    = hashResult["user_list"][i][0];
	 var userName  = hashResult["user_list"][i][1];
	 var userMail  = hashResult["user_list"][i][2];
	 var userRegistrationTime = hashResult["user_list"][i][3];
	 
	 objAuthorizeUser.inputUserInfo(background, userId, userName, userMail, userRegistrationTime);
	}
	
	var html = objAuthorizeUser.makeHtmlTable();
	
	document.getElementById("user_list_area").innerHTML = html;
       }
       else{
        objTelnetmanAuth.reinput();
       }
      }
      else{
       alert("認証失敗");
      }
     }
    },
    error : function () {
     alert("うまく通信できませんでした。");
    }
   });
  }
 };
 
 return(this);
}
