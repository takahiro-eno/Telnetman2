// 説明   : パラメーターシート作成(A)
// 作成日 : 2015/05/24
// 作成者 : 江野高広
// 更新   : 2017/09/11 Ver.2 向けに更新。

var objParameterSheetA = new parameterSheetA();

function parameterSheetA () {
 this.aaaaParameterSheet = new Array();
 
 this.idAaaaParameterSheetArea = objAction.idPrefix + "parameter_sheet_aaaa";
 
 this.idAaaaParameter = function (x, y) {
  return(objAction.idPrefix + "parameter_sheet_aaaa_" + x + "_" + y);
 };
 
 this.idCreateAaaaParameterSheetLineButton = objAction.idPrefix + "create_aaaa_parameter_sheet_line_button";
 

 this.createAaaaParameterSheet = function (){
  if(!document.getElementById(this.idCreateNewConditionLineButton)){
   var elImgDown = document.createElement("img");
   elImgDown.setAttribute("src", "img/arrow_down.png");
   elImgDown.setAttribute("width", "16");
   elImgDown.setAttribute("height", "16");
   elImgDown.setAttribute("alt", "append parameter");
   elImgDown.setAttribute("class", "onclick_node");
   elImgDown.setAttribute("id", this.idCreateAaaaParameterSheetLineButton);
   elImgDown.onclick = new Function("objParameterSheetA.createAaaaParameterSheetLine();");
   
   var elParameterSheetArea = document.getElementById(this.idAaaaParameterSheetArea);
   elParameterSheetArea.appendChild(elImgDown);
  }
  
  if(this.aaaaParameterSheet.length === 0){
   this.createAaaaParameterSheetLine();
  }
  else{
   for(var i = 0, j = this.aaaaParameterSheet.length; i < j; i ++){
    this.appendAaaaParameterSheetLine(i);
    
    var parameterNode  = this.aaaaParameterSheet[i][0];
    var parameterName  = this.aaaaParameterSheet[i][1];
    var parameterValue = this.aaaaParameterSheet[i][2];
    
    if(parameterNode.length === 0){
     parameterNode = "{\$node}";
     this.aaaaParameterSheet[i][0] = "{\$node}";
    }
    
    document.getElementById(this.idAaaaParameter(i, 0)).value = parameterNode;
    document.getElementById(this.idAaaaParameter(i, 1)).value = parameterName;
    document.getElementById(this.idAaaaParameter(i, 2)).value = parameterValue;
   }
  }
 };

 this.appendAaaaParameterSheetLine = function (x){
  var elInput0 = document.createElement("input");
  elInput0.setAttribute("type", "text");
  elInput0.style.width = "100px";
  elInput0.setAttribute("spellcheck", "false");
  elInput0.setAttribute("autocomplete", "off");
  elInput0.setAttribute("id", this.idAaaaParameter(x, 0));
  elInput0.setAttribute("value", "{\$node}");
  elInput0.setAttribute("placeholder", "A列");
  elInput0.onblur = new Function("objParameterSheetA.readAaaaParameter(" + x + ",0)");
  
  var elInput1 = document.createElement("input");
  elInput1.setAttribute("type", "text");
  elInput1.style.width = "100px";
  elInput1.setAttribute("spellcheck", "false");
  elInput1.setAttribute("autocomplete", "off");
  elInput1.setAttribute("id", this.idAaaaParameter(x, 1));
  elInput1.setAttribute("value", "");
  elInput1.setAttribute("placeholder", "変数名(1行目)");
  elInput1.onblur = new Function("objParameterSheetA.readAaaaParameter(" + x + ",1)");

  var elInput2 = document.createElement("input");
  elInput2.setAttribute("type", "text");
  elInput2.style.width = "100px";
  elInput2.setAttribute("spellcheck", "false");
  elInput2.setAttribute("autocomplete", "off");
  elInput2.setAttribute("id", this.idAaaaParameter(x, 2));
  elInput2.setAttribute("value", "");
  elInput2.setAttribute("placeholder", "新しい値");
  elInput2.onblur = new Function("objParameterSheetA.readAaaaParameter(" + x + ",2)");
  
  var elSpan0 = document.createElement("span");
  elSpan0.innerHTML = "&nbsp;&rarr;&nbsp;";
  
  var elSpan1 = document.createElement("span");
  elSpan1.innerHTML = "&nbsp;=&nbsp;";
  
  var elDiv = document.createElement("div");
  elDiv.className = "margin2";
  elDiv.appendChild(elInput0);
  elDiv.appendChild(elSpan0);
  elDiv.appendChild(elInput1);
  elDiv.appendChild(elSpan1);
  elDiv.appendChild(elInput2);
  
  var elParameterSheetArea = document.getElementById(this.idAaaaParameterSheetArea);
  var elImgDown = document.getElementById(this.idCreateAaaaParameterSheetLineButton);
  
  elParameterSheetArea.insertBefore(elDiv, elImgDown);
 };
 
 this.createAaaaParameterSheetLine = function (){
  var x = this.aaaaParameterSheet.length;
  
  this.aaaaParameterSheet[x] = new Array();
  this.aaaaParameterSheet[x][0] = "{\$node}";
  this.aaaaParameterSheet[x][1] = "";
  this.aaaaParameterSheet[x][2] = "";
  this.appendAaaaParameterSheetLine(x);
 };

 this.readAaaaParameter = function (x, y) {
  var parameter = document.getElementById(this.idAaaaParameter(x, y)).value;
  
  if((parameter !== null) && (parameter !== undefined)){
   this.aaaaParameterSheet[x][y] = objCommonFunctions.convertYen(parameter);
  }
  else {
   this.aaaaParameterSheet[x][y] = "";
  }
 };
 
 this.resetAaaaParameter = function (){
  var elParameterSheetArea = document.getElementById(this.idAaaaParameterSheetArea);
  var aaaaParameterSheetLineList = elParameterSheetArea.childNodes;
  
  for(var i = aaaaParameterSheetLineList.length - 1; i >= 0; i --){
   elParameterSheetArea.removeChild(aaaaParameterSheetLineList[i]);
  }
  
  for(i = this.aaaaParameterSheet.length - 1; i >= 0; i --){
   this.aaaaParameterSheet[i].splice(0, 3);
   this.aaaaParameterSheet.splice(i, 1);
  }
 };
 
 this.trimAaaaParameterSheet = function (){
  for(var i = this.aaaaParameterSheet.length - 1; i >= 1; i --){
   var parameterNode = this.aaaaParameterSheet[i][0];
   parameterNode = parameterNode.replace(/^\s+/, "");
   parameterNode = parameterNode.replace(/\s+$/, "");
   
   var parameterName = this.aaaaParameterSheet[i][1];
   parameterName = parameterName.replace(/^\s+/, "");
   parameterName = parameterName.replace(/\s+$/, "");
   
   if((parameterNode.length === 0) || (parameterName.length === 0)){
    this.aaaaParameterSheet.splice(i, 1);
   }
  }
 };
 
 return(this);
}
