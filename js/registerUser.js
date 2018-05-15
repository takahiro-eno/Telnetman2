// 説明   : ユーザー登録画面の入力内容を確認して送信する。
// 作成日 : 2014/05/28
// 作成者 : 江野高広
// 更新   : 2017/12/06 グループを追加。

var objRegisterUser = new registerUser();

function registerUser () {
 this.checkUserId   = false;
 this.checkPassword = false;
 this.checkName = false;
 this.checkMail = false;
 
 this.userId       = "";
 this.userPassword = "";
 this.userName     = "";
 this.userMail     = "";
 
 this.idUserId   = "user_id";
 this.idPassword = "user_password";
 this.idName     = "user_name";
 this.idMail     = "user_mail_address";
 this.idMessage  = "message_zone";
 this.idGroup    = "user_group";
 
 
 // エイリアス、パスワード、お名前、メールアドレスが正しく書けていればボタンを押せるようにする。
 this.check = function (id) {
  var inputValue = document.getElementById(id).value;
  var checkResult = objCommonFunctions.checkFullSizeChar(inputValue);
  
  if(inputValue.length === 0){
   checkResult = false;
  }
  
  if(id === this.idUserId){
   if(!inputValue.match(/\s/)){
    this.checkUserId = checkResult;
    this.userId = inputValue;
   }
   else{
    this.checkUserId = false;
   }
  }
  else if(id === this.idPassword){
   if(!inputValue.match(/\s/)){
    this.checkPassword = checkResult;
    this.userPassword = inputValue;
   }
   else{
    this.checkPassword = false;
   }
  }
  else if(id === this.idName){
   if(inputValue.length > 0){
    this.checkName = true;
    this.userName = inputValue;
   }
   else{
    this.checkName = false;
   }
  }
  else if(id === this.idMail){
   if(checkResult && objCommonFunctions.checkMailAddress(inputValue)){
    this.checkMail = checkResult;
    this.userMail = inputValue;
   }
   else{
    this.checkMail = false;
   }
  }
  
  this.changeButton();
 };
 
 
 // ボタンを押せるように、または、押せないように変更する。
 this.changeButton = function () {
  var elButtonRegister = document.getElementById("register_user");
  
  if(this.checkUserId && this.checkPassword && this.checkName && this.checkMail){
   elButtonRegister.className = 'enable';
   elButtonRegister.onclick = new Function("objRegisterUser.register();");
  }
  else{
   elButtonRegister.className = 'disable';
   elButtonRegister.onclick = null;
  }
 };
 
 
 // ユーザー登録。
 this.register = function (){
  var securityCode = document.getElementById(objSecurityImage.idInputCode).value;
  var url = window.location.href;
  
  var groupList = new Array();
  var optionList = document.getElementById(this.idGroup).options;
  for(var i = 0, j = optionList.length; i < j; i ++){
   if(optionList[i].selected){
    groupList.push(optionList[i].value);
   }
  }
  var jsonGroupList = JSON.stringify(groupList);
   
  objCommonFunctions.lockScreen("<div id='" + this.idMessage + "'></div>");
  
  $.ajax({
   type : "post",
   url  : "/cgi-bin/Telnetman2/register_user.cgi",
   data : {
    "user_id"           : this.userId,
    "user_password"     : this.userPassword,
    "user_name"         : this.userName,
    "user_mail_address" : this.userMail,
    "security_code"     : securityCode,
    "md5sum"            : objSecurityImage.md5sum,
    "url"               : url,
    "json_group_list"   : jsonGroupList
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
      var result = hashResult["result"];
      var message = hashResult["message"];
      
      message = message.replace(/\n/g, "<br>");
      
      var elImg = document.createElement("img");
      elImg.setAttribute("width", "16");
      elImg.setAttribute("height", "16");
      var elSpan = document.createElement("span");
      elSpan.innerHTML = message;
      var elButton = document.createElement("button");
      elButton.innerHTML = "閉じる";
      elButton.className = "enable";
      elButton.onclick = new Function("objCommonFunctions.unlockScreen()");
      
      if(result === 1){
       document.getElementById(objRegisterUser.idUserId).value   = "";
       document.getElementById(objRegisterUser.idPassword).value = "";
       document.getElementById(objRegisterUser.idName).value     = "";
       document.getElementById(objRegisterUser.idMail).value     = "";
       document.getElementById(objSecurityImage.idInputCode).value = "";
       
       var optionList = document.getElementById(objRegisterUser.idGroup).options;
       for(var i = 0, j = optionList.length; i < j; i ++){
        optionList[i].selected = false;
       }
       
       elImg.setAttribute("alt", "OK");
       elImg.setAttribute("src", "img/tick.png");
      }
      else{
       elImg.setAttribute("alt", "NG");
       elImg.setAttribute("src", "img/cross.png");
      }
      
      var elDiv = document.getElementById(objRegisterUser.idMessage);
      elDiv.appendChild(elImg);
      elDiv.appendChild(elSpan);
      elDiv.appendChild(elButton);
     }
     else{
      objCommonFunctions.unlockScreen();
     }
    }
    else{
     objCommonFunctions.unlockScreen();
    }
   },
   error : function () {
    alert("CGI Error");
    objCommonFunctions.unlockScreen();
   }
  });
 };
 
 
 // グループ一覧を取得する。
 this.getGroupList = function () {
  $.ajax({
   type : "post",
   url  : "/cgi-bin/Telnetman2/get_group_list.cgi",
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
      var elSelect = document.getElementById(objRegisterUser.idGroup);
      var size = 0;
      
      for(var i = 0, j = hashResult["group_list"].length; i < j; i ++){
       var groupId   = hashResult["group_list"][i]["group_id"];
       var groupName = hashResult["group_list"][i]["group_name"];
       
       var elOption = document.createElement("option");
       elOption.value = groupId;
       elOption.innerHTML = groupName;
       
       elSelect.appendChild(elOption);
       size += 1;
      }
      
      if(size > 5){
       size = 5;
      }
      else if(size === 0){
       size = 1;
      }
      
      elSelect.setAttribute("size", size);
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
 };
 
 return(this);
}
