// 説明   : ユーザー一覧とユーザー情報変更。
// 作成日 : 2017/12/11
// 作成者 : 江野高広

var objUserInfo = new userInfo();

function userInfo () {
 
 this.userInfo = new Object();
 this.background = 0;
 
 // 初期化
 this.initialize = function () {
  var elTable = document.getElementById(this.idUserList);
  
  for(var userId in this.userInfo){
   elTable.removeChild(document.getElementById(this.makeRowId(userId)));
   delete(this.userInfo[userId]);
  }
 };
 
 
 // HTML タグのID を作成する。
 this.idPrefix = "telnetman_user_";
 
 this.idSearchWord = this.idPrefix + "search_word";
 this.idUserList = this.idPrefix + "list";
 
 this.makeRowId = function (userId){
  return(this.idPrefix + "tr_" + userId);
 };
 
 this.idUserId = function (userId){
  return(this.idPrefix + "id_" + userId);
 };
 
 this.idUserName = function (userId){
  return(this.idPrefix + "name_" + userId);
 };
 
 this.idUserMail = function (userId){
  return(this.idPrefix + "mail_" + userId);
 };
 
 this.idUserPassword = function (userId){
  return(this.idPrefix + "password_" + userId);
 };
 
 this.idUserTime1 = function (userId){
  return(this.idPrefix + "time1_" + userId);
 };
 
 this.idUserTime2 = function (userId){
  return(this.idPrefix + "time2_" + userId);
 };
 
 this.idUserUpdateButton = function (userId){
  return(this.idPrefix + "update_button_" + userId);
 };
 
 this.idUserDeleteButton = function (userId){
  return(this.idPrefix + "delete_button_" + userId);
 };
 
 
 // ユーザー情報を格納する。
 this.inputUserInfo = function (userId, userName, userMail, userRegistrationTime, userActivationTime){
  this.userInfo[userId] = new Object();
  this.userInfo[userId]["user_name"] = userName;
  this.userInfo[userId]["user_mail"] = userMail;
  this.userInfo[userId]["user_registration_time"] = userRegistrationTime;
  this.userInfo[userId]["user_activation_time"]   = userActivationTime;
 };
 
 
 // 1ユーザー分のHTML を作成する。
 this.addTr = function (userId){
  var background = this.background % 2;
  this.background ++;
  
  var elTr = document.createElement("tr");
  var elTd1 = document.createElement("td");// ユーザーID
  var elTd2 = document.createElement("td");// ユーザー名
  var elTd3 = document.createElement("td");// メールアドレス
  var elTd4 = document.createElement("td");// パスワード
  var elTd5 = document.createElement("td");// 登録日時
  var elTd6 = document.createElement("td");// 最終アクセス日時
  var elTd7 = document.createElement("td");// 更新ボタン
  var elTd8 = document.createElement("td");// 削除ボタン
  var elSpan1 = document.createElement("span");
  var elSpan5 = document.createElement("span");
  var elSpan6 = document.createElement("span");
  var elInput2 = document.createElement("input");
  var elInput3 = document.createElement("input");
  var elInput4 = document.createElement("input");
  var elButton7 = document.createElement("button");
  var elButton8 = document.createElement("button");
  elTr.id = this.makeRowId(userId);
  elSpan1.id = this.idUserId(userId);
  elSpan5.id = this.idUserTime1(userId);
  elSpan6.id = this.idUserTime2(userId);
  elInput2.id = this.idUserName(userId);
  elInput3.id = this.idUserMail(userId);
  elInput4.id = this.idUserPassword(userId);
  elButton7.id = this.idUserUpdateButton(userId);
  elButton8.id = this.idUserDeleteButton(userId);
  elTd1.className = "background" + background;
  elTd2.className = "background" + background;
  elTd3.className = "background" + background;
  elTd4.className = "background" + background;
  elTd5.className = "background" + background;
  elTd6.className = "background" + background;
  elTd7.className = "background" + background;
  elTd8.className = "background" + background;
  elSpan1.className = "black";
  elSpan5.className = "black";
  elSpan6.className = "black";
  elButton7.className = "enable";
  elButton8.className = "enable";
  elInput2.setAttribute("type", "text");
  elInput2.setAttribute("spellcheck", "false");
  elInput2.setAttribute("size", "12");
  elInput3.setAttribute("type", "text");
  elInput3.setAttribute("spellcheck", "false");
  elInput3.setAttribute("size", "24");
  elInput4.setAttribute("type", "password");
  elInput4.setAttribute("size", "8");
  elSpan1.innerHTML = userId;
  elSpan5.innerHTML = objCommonFunctions.unixtimeToDate(this.userInfo[userId]["user_registration_time"]);
  elInput2.value = this.userInfo[userId]["user_name"];
  elInput3.value = this.userInfo[userId]["user_mail"];
  elButton7.innerHTML = "更新";
  elButton8.innerHTML = "削除";
  
  if(this.userInfo[userId]["user_activation_time"] > 0){
   elSpan6.innerHTML = objCommonFunctions.unixtimeToDate(this.userInfo[userId]["user_activation_time"]);
  }
  else{
   elSpan6.innerHTML = "-";
  }
  
  elInput2.onblur = new Function("objUserInfo.readUserName('" + userId + "');");
  elInput3.onblur = new Function("objUserInfo.readUserMail('" + userId + "');");
  elInput4.onblur = new Function("objUserInfo.readUserPassword('" + userId + "');");
  elButton7.onclick = new Function("objUserInfo.update('" + userId + "');");
  
  elTd1.appendChild(elSpan1);
  elTd2.appendChild(elInput2);
  elTd3.appendChild(elInput3);
  elTd4.appendChild(elInput4);
  elTd5.appendChild(elSpan5);
  elTd6.appendChild(elSpan6);
  elTd7.appendChild(elButton7);
  elTd8.appendChild(elButton8);
  elTr.appendChild(elTd1);
  elTr.appendChild(elTd2);
  elTr.appendChild(elTd3);
  elTr.appendChild(elTd4);
  elTr.appendChild(elTd5);
  elTr.appendChild(elTd6);
  elTr.appendChild(elTd7);
  elTr.appendChild(elTd8);
  
  document.getElementById(this.idUserList).appendChild(elTr);
 };
 
 
 // 入力された名前を読み取る。
 this.readUserName = function (userId){
  var userName = document.getElementById(this.idUserName(userId)).value;
  this.userInfo[userId]["user_name"] = userName;
 };
 
 // 入力されたメールアドレスを読み取る。
 this.readUserMail = function (userId){
  var userMailAddress = document.getElementById(this.idUserMail(userId)).value;
  this.userInfo[userId]["user_mail_address"] = userMailAddress;
 };
 
 // 入力されたパスワードを読み取る。
 this.readUserPassword = function (userId){
  var userPassword = document.getElementById(this.idUserPassword(userId)).value;
  this.userInfo[userId]["user_password"] = userPassword;
 };
 
 
 
 // ユーザー一覧を取得する。
 this.search = function () {
  var check = objTelnetmanAuth.check("objUserInfo.search();");
  
  if(check){
   var auth = objTelnetmanAuth.makeAuth();
   
   var searchWord = document.getElementById(this.idSearchWord).value;
   
   $.ajax({
    headers : {"telnetmanAuthAdmin" : auth},
    type : "post",
    url  : "/cgi-bin/Telnetman2/get_user_info.cgi",
    data : {
     "search_word" : searchWord
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
        objUserInfo.initialize();
        
        for(var i = 0, j = hashResult["user_list"].length; i < j; i ++){
         var userId    = hashResult["user_list"][i]["user_id"];
         var userName  = hashResult["user_list"][i]["user_name"];
         var userMail  = hashResult["user_list"][i]["user_mail_address"];
         var userRegistrationTime = hashResult["user_list"][i]["registration_time"];
         var userActivationTime   = hashResult["user_list"][i]["activation_time"];
          
         objUserInfo.inputUserInfo(userId, userName, userMail, userRegistrationTime, userActivationTime);
         objUserInfo.addTr(userId);
        }
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
 
 
 // ユーザー情報を更新する。
 this.update = function (userId){
  var check = objTelnetmanAuth.check("objUserInfo.update('" + userId + "');");
  
  if(check){
   var elButton = document.getElementById(this.idUserUpdateButton(userId));
   elButton.className = "disable";
   elButton.onclick = null;
   
   var auth = objTelnetmanAuth.makeAuth();
   
   $.ajax({
    headers : {"telnetmanAuthAdmin" : auth},
    type : "post",
    url  : "/cgi-bin/Telnetman2/user.cgi",
    data : {
     "user_id" : userId,
     "user_name" : this.userInfo[userId]["user_name"],
     "user_mail_address" : this.userInfo[userId]["user_mail_address"],
     "user_password" : this.userInfo[userId]["user_password"]
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
        if(hashResult["result"] === 1){
         var userId = hashResult["user_id"];
         
         var elButton = document.getElementById(objUserInfo.idUserUpdateButton(userId));
         elButton.className = "enable";
         elButton.onclick = new Function("objUserInfo.update('" + userId + "');");
        }
        else{
         alert(hashResult["reason"]);
        }
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
