// 説明   : グループ管理。
// 作成日 : 2017/12/05
// 作成者 : 江野高広

var objUserGroup = new userGroup();

function userGroup () {
 
 this.backgroundIndex = 0;
 this.groupIdList = new Array();
 this.groupNameList = new Object();
 this.userId = "";
 
 // 初期化
 this.initialize = function () {
  var lengthGroupIdList = this.groupIdList.length;
  this.groupIdList.splice(0, lengthGroupIdList);
  
  for(var groupId in this.groupNameList){
   delete(this.groupNameList[groupId]);
  }
  
  this.backgroundIndex = 0;
 };
 
 
 // HTML タグのID を作成する。
 this.idPrefix = "telnetman_group_";
 this.idGroupList       = this.idPrefix + "list";
 this.idNewGroupName    = this.idPrefix + "new_group_name";
 this.idNewGroupButton  = this.idPrefix + "new_group_button";
 this.idUserId          = this.idPrefix + "user_id";
 this.idGetButton       = this.idPrefix + "get_button";
 this.idSaveButton      = this.idPrefix + "save_button";
 this.idUnassignedGroup = this.idPrefix + "unassigned";
 this.idAllocatedGroup  = this.idPrefix + "allocated";
 
 this.makeRowId = function (groupId){
  return(this.idPrefix + "tr_" + groupId);
 };
 
 this.idGroupName = function (groupId){
  return(this.idPrefix + "name_" + groupId);
 };
 
 this.idUpdateButton = function (groupId){
  return(this.idPrefix + "update_button_" + groupId);
 };
 
 this.idDeleteButton = function (groupId){
  return(this.idPrefix + "delete_button_" + groupId);
 };
 
 
 // グループ情報を格納する。
 this.inputGroupInfo = function (groupId, groupName){
  this.groupIdList.push(groupId);
  this.groupNameList[groupId] = groupName;
 };
 
 
 // 1ユーザー分のHTML を追加する。
 this.addTr = function (groupId){
  var groupName = this.groupNameList[groupId];
  var background = this.backgroundIndex % 2;
  this.backgroundIndex += 1;
  
  var elTr    = document.createElement("tr");
  var elTd1   = document.createElement("td");
  var elTd2   = document.createElement("td");
  var elTd3   = document.createElement("td");
  var elInput1 = document.createElement("input");
  var elButton2 = document.createElement("button");
  var elButton3 = document.createElement("button");
  
  elTr.id = this.makeRowId(groupId);
  elInput1.id = this.idGroupName(groupId);
  elButton2.id = this.idUpdateButton(groupId);
  elButton3.id = this.idDeleteButton(groupId);
  
  elTd1.className = "background" + background;
  elTd2.className = "background" + background;
  elTd3.className = "background" + background;
  elButton2.className = "enable";
  elButton3.className = "enable";
  
  elInput1.setAttribute("type", "text");
  elInput1.setAttribute("spellcheck", "false");
  elInput1.setAttribute("size", "24");
  
  elInput1.value = groupName;
  elButton2.innerHTML = "更新";
  elButton3.innerHTML = "削除";
  
  elInput1.onblur = new Function("objUserGroup.readGroupName('" + groupId + "');");
  elButton2.onclick = new Function("objUserGroup.update('" + groupId + "')");
  //elButton3.onclick = new Function("objUserGroup.deleteGroup('" + groupId + "')");
  
  elTd1.appendChild(elInput1);
  elTd2.appendChild(elButton2);
  elTd3.appendChild(elButton3);
  elTr.appendChild(elTd1);
  elTr.appendChild(elTd2);
  elTr.appendChild(elTd3);
  
  document.getElementById(this.idGroupList).appendChild(elTr);
 };
 
 
 // グループ名を読み取る。
 this.readGroupName = function(groupId){
  var groupName = document.getElementById(this.idGroupName(groupId)).value;
  this.groupNameList[groupId] = groupName;
 };
 
 
 // グループ一覧を取得する。
 this.get = function () {
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
      objUserGroup.initialize();
      
      for(var i = 0, j = hashResult["group_list"].length; i < j; i ++){
       var groupId   = hashResult["group_list"][i]["group_id"];
       var groupName = hashResult["group_list"][i]["group_name"];
       
       objUserGroup.inputGroupInfo(groupId, groupName);
       objUserGroup.addTr(groupId);
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
 };
 
 
 // グループを新規作成。
 this.add = function () {
  var check = objTelnetmanAuth.check("objUserGroup.add();");
  
  if(check){
   var elButton = document.getElementById(this.idNewGroupButton);
   elButton.onclick = null;
   elButton.className = "disable";
   
   var groupName = document.getElementById(this.idNewGroupName).value;
   
   var auth = objTelnetmanAuth.makeAuth();
   
   $.ajax({
    headers : {"telnetmanAuthAdmin" : auth},
    type : "post",
    url  : "/cgi-bin/Telnetman2/group.cgi",
    data : {
     "operation"  : "create",
     "group_name" : groupName
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
        var result = hashResult["result"];
        
        if(result === 1){
         var groupId   = hashResult["group_id"];
         var groupName = hashResult["group_name"];
        
         objUserGroup.inputGroupInfo(groupId, groupName);
         objUserGroup.addTr(groupId);
         document.getElementById(objUserGroup.idNewGroupName).value = "";
        }
        else{
         alert(hashResult["reason"]);
        }
        
        var elButton = document.getElementById(objUserGroup.idNewGroupButton);
        elButton.onclick = new Function("objUserGroup.add();");
        elButton.className = "enable";
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
 
 
 // グループ名の更新。
 this.update = function (groupId){
  var check = objTelnetmanAuth.check("objUserGroup.update('" + groupId + "');");
  
  if(check){
   var elButton = document.getElementById(this.idUpdateButton(groupId));
   elButton.className = "disable";
   elButton.onclick = null;
   
   var auth = objTelnetmanAuth.makeAuth();
   
   $.ajax({
    headers : {"telnetmanAuthAdmin" : auth},
    type : "post",
    url  : "/cgi-bin/Telnetman2/group.cgi",
    data : {
     "operation"  : "update",
     "group_id" : groupId,
     "group_name" : this.groupNameList[groupId]
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
         var groupId = hashResult["group_id"];
         
         var elButton = document.getElementById(objUserGroup.idUpdateButton(groupId));
         elButton.className = "enable";
         elButton.onclick = new Function("objUserGroup.update('" + groupId + "');");
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
 
 
 // グループのoption を作る。
 this.makeGroupOption = function (groupId, groupName){
  var elOption = document.createElement("option");
  elOption.value     = groupId;
  elOption.innerHTML = groupName;
  
  return(elOption);
 };
 
 
 // ユーザーとグループの関連付け取得。
 this.search = function (){
  var check = objTelnetmanAuth.check("objUserGroup.search();");
  
  if(check){
   var userId = document.getElementById(this.idUserId).value;
   
   var unassignedGroupOptions = document.getElementById(this.idUnassignedGroup).options;
   var allocatedGroupOptions  = document.getElementById(this.idAllocatedGroup).options;
   
   // 未割り当ての削除。
   for(var i = unassignedGroupOptions.length - 1; i >= 0; i --){
    document.getElementById(this.idUnassignedGroup).removeChild(unassignedGroupOptions[i]);
   }
   
   // 未割り当ての削除。
   for(i = allocatedGroupOptions.length - 1; i >= 0; i --){
    document.getElementById(this.idAllocatedGroup).removeChild(allocatedGroupOptions[i]);
   }
   
   if((userId !== null) && (userId !== undefined) && (userId.length > 0)){
    var elButton = document.getElementById(this.idGetButton);
    elButton.className = "disable";
    elButton.onclick = null;
    
    var auth = objTelnetmanAuth.makeAuth();
    
    $.ajax({
     headers : {"telnetmanAuthAdmin" : auth},
     type : "post",
     url  : "/cgi-bin/Telnetman2/user_group.cgi",
     data : {
      "operation"  : "get",
      "user_id" : userId
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
          objUserGroup.userId = hashResult["user_id"];
          
          var unassignedGroupList = hashResult["unassigned_group_list"];
          var allocatedGroupList  = hashResult["allocated_group_list"];
          
          // 未割り当てに追加。
          for(var i = 0, j = unassignedGroupList.length; i < j; i ++){
           var groupId   = unassignedGroupList[i][0];
           var groupName = unassignedGroupList[i][1];
           
           var elOption = objUserGroup.makeGroupOption(groupId, groupName);
           
           document.getElementById(objUserGroup.idUnassignedGroup).appendChild(elOption);
          }
          
          // 割り当て済みに追加。
          for(i = 0, j = allocatedGroupList.length; i < j; i ++){
           groupId   = allocatedGroupList[i][0];
           groupName = allocatedGroupList[i][1];
           
           elOption = objUserGroup.makeGroupOption(groupId, groupName);
           
           document.getElementById(objUserGroup.idAllocatedGroup).appendChild(elOption);
          }
         }
         else{
          objUserGroup.userId = "";
          alert(hashResult["reason"]);
         }
         
         var elButton = document.getElementById(objUserGroup.idGetButton);
         elButton.className = "enable";
         elButton.onclick = new Function("objUserGroup.search();");
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
  }
 };
 
 
 // 割り当てる。
 this.allocate = function (){
  var elUnassignedGroup = document.getElementById(this.idUnassignedGroup);
  var elAllocatedGroup  = document.getElementById(this.idAllocatedGroup);
  
  var unassignedGroupOptions = elUnassignedGroup.options;
  
  for(var i = unassignedGroupOptions.length - 1; i >= 0; i --){
   if(unassignedGroupOptions[i].selected){
    var groupId   = unassignedGroupOptions[i].value;
    var groupName = unassignedGroupOptions[i].innerHTML;
    
    var elOption = objUserGroup.makeGroupOption(groupId, groupName);
    elAllocatedGroup.appendChild(elOption);
    
    elUnassignedGroup.removeChild(unassignedGroupOptions[i]);
   }
  }
 };
 
 // 割り当てから外す。
 this.unassign = function (){
  var elUnassignedGroup = document.getElementById(this.idUnassignedGroup);
  var elAllocatedGroup  = document.getElementById(this.idAllocatedGroup);
  
  var allocatedGroupOptions = elAllocatedGroup.options;
  
  for(var i = allocatedGroupOptions.length - 1; i >= 0; i --){
   if(allocatedGroupOptions[i].selected){
    var groupId   = allocatedGroupOptions[i].value;
    var groupName = allocatedGroupOptions[i].innerHTML;
    
    var elOption = objUserGroup.makeGroupOption(groupId, groupName);
    elUnassignedGroup.appendChild(elOption);
    
    elAllocatedGroup.removeChild(allocatedGroupOptions[i]);
   }
  }
 };
 
 
 // 割り当て設定を保存。
 this.save = function (){
  var check = objTelnetmanAuth.check("objUserGroup.save();");
  
  if(check){
   var elButton = document.getElementById(this.idSaveButton);
   elButton.onclick = null;
   elButton.className = "disable";
   
   var groupList = new Array();
  
   var allocatedGroupOptions  = document.getElementById(this.idAllocatedGroup).options;
   
   for(var i = 0, j = allocatedGroupOptions.length; i < j; i ++){
    var groupId = allocatedGroupOptions[i].value;
    groupList.push(groupId);
   }
   
   var jsonGroupList = JSON.stringify(groupList);
   
   var auth = objTelnetmanAuth.makeAuth();
   
   $.ajax({
    headers : {"telnetmanAuthAdmin" : auth},
    type : "post",
    url  : "/cgi-bin/Telnetman2/user_group.cgi",
    data : {
     "operation"  : "save",
     "user_id" : this.userId,
     "json_group_list" : jsonGroupList
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
        var result = hashResult["result"];
        
        if(result === 1){
         var userId = hashResult["user_id"];
         document.getElementById(objUserGroup.idUserId).value = userId;
        }
        else{
         alert(hashResult["reason"]);
        }
        
        var elButton = document.getElementById(objUserGroup.idSaveButton);
        elButton.onclick = new Function("objUserGroup.save();");
        elButton.className = "enable";
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
