// 説明   : 正規表現を自動生成。
// 作成日 : 2018/06/01
// 作成者 : 江野高広

var objRegGen = new regGen();

function regGen () {
 this.idFrefix = "reg-gen_";
 this.idSampleText   = this.idFrefix + "sample_text";// 正規表現にしたいテキストの入力欄のid
 this.idGeneratedReg = this.idFrefix + "generated_reg";// 作成した正規表現の出力欄のid

 this.sampleText = "";// 正規表現にしたいテキスト
 this.startCharPos = -1;// () の開始位置
 this.endCharPos   = -1;// () の終了位置

 this.regList = new Array();//作成した正規表現一覧
 
 
 // 正規表現にしたい文字列を読み取る。
 this.readSampleText = function(){
  var elSampleText = document.getElementById(this.idSampleText);
  var sampleText = elSampleText.value;
  var startCursorPos = elSampleText.selectionStart;
  var endCursorPos   = elSampleText.selectionEnd;

  if((sampleText === null) || (sampleText === undefined)){
   sampleText = "";
  }

  if((startCursorPos === null) || (startCursorPos === undefined)){
   startCursorPos = 0;
  }

  if((endCursorPos === null) || (endCursorPos === undefined)){
   endCursorPos = 0;
  }

  this.sampleText = sampleText;

  if(startCursorPos < endCursorPos){
   this.startCharPos = startCursorPos;
   this.endCharPos   = endCursorPos - 1;
  }
  else{
   this.startCharPos = -1;
   this.endCharPos   = -1;
  }
 };


 // 出来上がった正規表現を表示する。
 this.writeReg = function (){
  var valueRegList = this.regList.join("\n");
  document.getElementById(this.idGeneratedReg).value = valueRegList;
  this.regList.splice(0);
 };


 // 正規表現をいくつか作成する。
 this.gen = function (){
  this.readSampleText();

  var sampleRegList = new Array(5);
  sampleRegList[0] = new Array();
  sampleRegList[1] = new Array();
  sampleRegList[2] = new Array();
  sampleRegList[3] = new Array();
  sampleRegList[4] = new Array();

  /*
   選択部分(カッコ内)は[^\s]+ または[0-9]+ にする。
   空白は\s+

   パターン1
    記号 : そのまま
    数字 : [0-9]+
    アルファベット : [a-zA-Z]+

   パターン2
    記号 : そのまま
    数字 : [0-9]+
    アルファベット : そのまま

   パターン3
    記号 : そのまま
    数字 : そのまま
    アルファベット : [a-zA-Z]+

   パターン4
    記号 : そのまま
    数字 : そのまま
    アルファベット : そのまま

   パターン5
    [^\s]+ \s+ のみで構成
  */

  var splitSampleText = this.sampleText.split("");
  var existBrackets = false;
  var insideBrackets = false;

  if((this.startCharPos >= 0) && (this.endCharPos >= 0)){
   existBrackets = true;
  }

  for(var i = 0, j = splitSampleText.length; i < j; i ++){
   if(existBrackets && (i === this.startCharPos)){
    sampleRegList[0].push("(");
    sampleRegList[1].push("(");
    sampleRegList[2].push("(");
    sampleRegList[3].push("(");
    sampleRegList[4].push("(");

    insideBrackets = true;
   }

   var char1 = splitSampleText[i];
   var regPart = "";

   if(insideBrackets){// カッコ内
    regPart = this.makeRegPart(0, char1);

    for(var k = 0; k < 5; k ++){
     if(regPart === char1){
      sampleRegList[k].push(regPart);
     }
     else{
      if(sampleRegList[k].lenght === 0){
       sampleRegList[k].push(regPart);
      }
      else{
       var popedRegPart = sampleRegList[k].pop();
       if(popedRegPart !== regPart){
        sampleRegList[k].push(popedRegPart);
       }

       sampleRegList[k].push(regPart);
      }
     }
    }
   }
   else{// カッコ外
    for(var l = 0; l < 5; l ++){
     regPart = this.makeRegPart(l + 1, char1);

     if(regPart === char1){
      sampleRegList[l].push(regPart);
     }
     else{
      if(sampleRegList[l].lenght === 0){
       sampleRegList[l].push(regPart);
      }
      else{
       popedRegPart = sampleRegList[l].pop();
       if(popedRegPart !== regPart){
        sampleRegList[l].push(popedRegPart);
       }

       sampleRegList[l].push(regPart);
      }
     }
    }
   }

   if(existBrackets && (i === this.endCharPos)){
    sampleRegList[0].push(")");
    sampleRegList[1].push(")");
    sampleRegList[2].push(")");
    sampleRegList[3].push(")");
    sampleRegList[4].push(")");

    insideBrackets = false;
   }
  }

  for(var m = 0; m < 5; m ++){
   var sampleReg = sampleRegList[m].join("");

   var isUnique = true;
   for(var n = 0, o = this.regList.length; n < o; n ++){
    if(sampleReg === this.regList[n]){
     isUnique = false;
    }
   }

   if(isUnique){
    this.regList.push(sampleReg);
   }
  }

  this.writeReg();
 };


 // 1文字をパターン毎に正規表現に変換する。
 this.makeRegPart = function (pattern, char1){
  var regPart = "";

  var isSymbol   = false;
  var isAlphabet = false;
  var isNumber   = false;
  var isSpace    = false;

  if(char1.match(/\s/)){
   isSpace = true;
  }
  else if(char1.match(/[0-9]/)){
   isNumber = true;
  }
  else if(char1.match(/[a-zA-Z]/)){
   isAlphabet = true;
  }
  else{
   isSymbol = true;
  }

  if(pattern === 0){// カッコ内
   if(isSpace){
    regPart = "\\s+";
   }
   else if(isNumber){
    regPart = "[0-9]+";
   }
   else{
    regPart = "[^\\s]+";
   }
  }
  else if(pattern === 1){
   if(isSpace){
    regPart = "\\s+";
   }
   else if(isNumber){
    regPart = "[0-9]+";
   }
   else if(isAlphabet){
    regPart = "[a-zA-Z]+";
   }
   else if(isSymbol){
    regPart = this.escapeMetaChar(char1);
   }
  }
  else if(pattern === 2){
   if(isSpace){
    regPart = "\\s+";
   }
   else if(isNumber){
    regPart = "[0-9]+";
   }
   else if(isAlphabet){
    regPart = char1;
   }
   else if(isSymbol){
    regPart = this.escapeMetaChar(char1);
   }
  }
  else if(pattern === 3){
   if(isSpace){
    regPart = "\\s+";
   }
   else if(isNumber){
    regPart = char1;
   }
   else if(isAlphabet){
    regPart = "[a-zA-Z]+";
   }
   else if(isSymbol){
    regPart = this.escapeMetaChar(char1);
   }
  }
  else if(pattern === 4){
   if(isSpace){
    regPart = "\\s+";
   }
   else if(isNumber){
    regPart = char1;
   }
   else if(isAlphabet){
    regPart = char1;
   }
   else if(isSymbol){
    regPart = this.escapeMetaChar(char1);
   }
  }
  else if(pattern === 5){
   if(isSpace){
    regPart = "\\s+";
   }
   else if(isNumber){
    regPart = "[^\\s]+";
   }
   else if(isAlphabet){
    regPart = "[^\\s]+";
   }
   else if(isSymbol){
    regPart = "[^\\s]+";
   }
  }

  return(regPart);
 };


 // メタ文字をエスケープ
 this.escapeMetaChar = function (char1){
  if(char1 === "^"){
   char1 = "\\^";
  }
  else if(char1 === "$"){
   char1 = "\\$";
  }
  else if(char1 === "+"){
   char1 = "\\+";
  }
  else if(char1 === "*"){
   char1 = "\\*";
  }
  else if(char1 === "?"){
   char1 = "\\?";
  }
  else if(char1 === "."){
   char1 = "\\.";
  }
  else if(char1 === "("){
   char1 = "\\(";
  }
  else if(char1 === ")"){
   char1 = "\\)";
  }
  else if(char1 === "{"){
   char1 = "\\{";
  }
  else if(char1 === "}"){
   char1 = "\\}";
  }
  else if(char1 === "["){
   char1 = "\\[";
  }
  else if(char1 === "]"){
   char1 = "\\]";
  }
  else if(char1 === "|"){
   char1 = "\\|";
  }
  else if(char1 === "\\"){
   char1 = "\\\\";
  }

  return(char1);
 };

 return(this);
}
