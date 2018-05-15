// 説明   : パラメーターシート作成(B)
// 作成日 : 2015/05/24
// 作成者 : 江野高広
// 更新   : 2017/09/11 Ver.2 向けに更新。

var objParameterSheetB = new parameterSheetB();

function parameterSheetB () {
 this.bbbbParameterSheet = new Array();
 
 this.idBbbbParameterSheetArea = objAction.idPrefix + "parameter_sheet_bbbb";
 
 this.idBbbbParameter = function (x, y) {
  return(objAction.idPrefix + "parameter_sheet_bbbb_" + x + "_" + y);
 };
 
 this.idCreateBbbbParameterSheetLineButton = objAction.idPrefix + "create_bbbb_parameter_sheet_line_button";
 

 this.createBbbbParameterSheet = function (){
  if(!document.getElementById(this.idCreateNewConditionLineButton)){
   var elImgDown = document.createElement("img");
   elImgDown.setAttribute("src", "img/arrow_down.png");
   elImgDown.setAttribute("width", "16");
   elImgDown.setAttribute("height", "16");
   elImgDown.setAttribute("alt", "append parameter");
   elImgDown.setAttribute("class", "onclick_node");
   elImgDown.setAttribute("id", this.idCreateBbbbParameterSheetLineButton);
   elImgDown.onclick = new Function("objParameterSheetB.createBbbbParameterSheetLine();");
   
   var elParameterSheetArea = document.getElementById(this.idBbbbParameterSheetArea);
   elParameterSheetArea.appendChild(elImgDown);
  }
  
  if(this.bbbbParameterSheet.length === 0){
   this.createBbbbParameterSheetLine();
  }
  else{
   for(var i = 0, j = this.bbbbParameterSheet.length; i < j; i ++){
    this.appendBbbbParameterSheetLine(i);
    
    var parameterNode  = this.bbbbParameterSheet[i][0];
    var bbbbValue      = this.bbbbParameterSheet[i][1];
    var parameterName  = this.bbbbParameterSheet[i][2];
    var parameterValue = this.bbbbParameterSheet[i][3];
    
    if(parameterNode.length === 0){
     parameterNode = "{\$node}";
     this.bbbbParameterSheet[i][0] = "{\$node}";
    }
    
    if(bbbbValue.length === 0){
     bbbbValue = "{\$B}";
     this.bbbbParameterSheet[i][1] = "{\$B}";
    }
    
    document.getElementById(this.idBbbbParameter(i, 0)).value = parameterNode;
    document.getElementById(this.idBbbbParameter(i, 1)).value = bbbbValue;
    document.getElementById(this.idBbbbParameter(i, 2)).value = parameterName;
    document.getElementById(this.idBbbbParameter(i, 3)).value = parameterValue;
   }
  }
 };

 this.appendBbbbParameterSheetLine = function (x){
  var elInput0 = document.createElement("input");
  elInput0.setAttribute("type", "text");
  elInput0.style.width = "100px";
  elInput0.setAttribute("spellcheck", "false");
  elInput0.setAttribute("id", this.idBbbbParameter(x, 0));
  elInput0.setAttribute("value", "{\$node}");
  elInput0.setAttribute("placeholder", "A列");
  elInput0.onblur = new Function("objParameterSheetB.readBbbbParameter(" + x + ",0)");
  
  var elInput1 = document.createElement("input");
  elInput1.setAttribute("type", "text");
  elInput1.style.width = "100px";
  elInput1.setAttribute("spellcheck", "false");
  elInput1.setAttribute("autocomplete", "off");
  elInput1.setAttribute("id", this.idBbbbParameter(x, 1));
  elInput1.setAttribute("value", "{\$B}");
  elInput1.setAttribute("placeholder", "B列");
  elInput1.onblur = new Function("objParameterSheetB.readBbbbParameter(" + x + ",1)");
  
  var elInput2 = document.createElement("input");
  elInput2.setAttribute("type", "text");
  elInput2.style.width = "100px";
  elInput2.setAttribute("spellcheck", "false");
  elInput2.setAttribute("autocomplete", "off");
  elInput2.setAttribute("id", this.idBbbbParameter(x, 2));
  elInput2.setAttribute("value", "");
  elInput2.setAttribute("placeholder", "変数名(1行目)");
  elInput2.onblur = new Function("objParameterSheetB.readBbbbParameter(" + x + ",2)");

  var elInput3 = document.createElement("input");
  elInput3.setAttribute("type", "text");
  elInput3.style.width = "100px";
  elInput3.setAttribute("spellcheck", "false");
  elInput3.setAttribute("autocomplete", "off");
  elInput3.setAttribute("id", this.idBbbbParameter(x, 3));
  elInput3.setAttribute("value", "");
  elInput3.setAttribute("placeholder", "新しい値");
  elInput3.onblur = new Function("objParameterSheetB.readBbbbParameter(" + x + ",3)");
  
  var elSpan0 = document.createElement("span");
  elSpan0.innerHTML = "&nbsp;&rarr;&nbsp;";
  
  var elSpan1 = document.createElement("span");
  elSpan1.innerHTML = "&nbsp;&rarr;&nbsp;";
  
  var elSpan2 = document.createElement("span");
  elSpan2.innerHTML = "&nbsp;=&nbsp;";
  
  var elDiv = document.createElement("div");
  elDiv.className = "margin2";
  elDiv.appendChild(elInput0);
  elDiv.appendChild(elSpan0);
  elDiv.appendChild(elInput1);
  elDiv.appendChild(elSpan1);
  elDiv.appendChild(elInput2);
  elDiv.appendChild(elSpan2);
  elDiv.appendChild(elInput3);
  
  var elParameterSheetArea = document.getElementById(this.idBbbbParameterSheetArea);
  var elImgDown = document.getElementById(this.idCreateBbbbParameterSheetLineButton);
  
  elParameterSheetArea.insertBefore(elDiv, elImgDown);
 };
 
 this.createBbbbParameterSheetLine = function (){
  var x = this.bbbbParameterSheet.length;
  
  this.bbbbParameterSheet[x] = new Array();
  this.bbbbParameterSheet[x][0] = "{\$node}";
  this.bbbbParameterSheet[x][1] = "{\$B}";
  this.bbbbParameterSheet[x][2] = "";
  this.bbbbParameterSheet[x][3] = "";
  this.appendBbbbParameterSheetLine(x);
 };

 this.readBbbbParameter = function (x, y) {
  var parameter = document.getElementById(this.idBbbbParameter(x, y)).value;
  
  if((parameter !== null) && (parameter !== undefined)){
   this.bbbbParameterSheet[x][y] = objCommonFunctions.convertYen(parameter);
  }
  else {
   this.bbbbParameterSheet[x][y] = "";
  }
 };
 
 this.resetBbbbParameter = function (){
  var elParameterSheetArea = document.getElementById(this.idBbbbParameterSheetArea);
  var bbbbParameterSheetLineList = elParameterSheetArea.childNodes;
  
  for(var i = bbbbParameterSheetLineList.length - 1; i >= 0; i --){
   elParameterSheetArea.removeChild(bbbbParameterSheetLineList[i]);
  }
  
  for(i = this.bbbbParameterSheet.length - 1; i >= 0; i --){
   this.bbbbParameterSheet[i].splice(0, 4);
   this.bbbbParameterSheet.splice(i, 1);
  }
 };
 
 this.trimBbbbParameterSheet = function (){
  for(var i = this.bbbbParameterSheet.length - 1; i >= 1; i --){
   var parameterNode = this.bbbbParameterSheet[i][0];
   parameterNode = parameterNode.replace(/^\s+/, "");
   parameterNode = parameterNode.replace(/\s+$/, "");
   
   var bbbbValue = this.bbbbParameterSheet[i][1];
   bbbbValue = bbbbValue.replace(/^\s+/, "");
   bbbbValue = bbbbValue.replace(/\s+$/, "");
   
   var parameterName = this.bbbbParameterSheet[i][2];
   parameterName = parameterName.replace(/^\s+/, "");
   parameterName = parameterName.replace(/\s+$/, "");
   
   if((parameterNode.length === 0) || (bbbbValue.length === 0) || (parameterName.length === 0)){
    this.bbbbParameterSheet.splice(i, 1);
   }
  }
 };
 
 return(this);
}
