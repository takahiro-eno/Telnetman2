// 説明   : 画像認証用のCGI にアクセスする。
// 作成日 : 2014/05/28
// 作成者 : 江野高広
// 更新   : 2017/08/22 Ver.2 用に微調整。

var objSecurityImage = new securityImage();

function securityImage () {
 this.idImageParent = ""; // img タグの親タグのID
 this.idInputCode   = ""; // 認証文字のinput タグのID
 this.idSecurityImage = "security_image";
 this.width = 240;
 this.height = 80;
 this.base64Png = "";
 this.md5sum = "";
 
 
 // 認証用画像の親タグのID と認証文字のinput タグのID を記録する。
 this.setId = function (id1, id2) {
  this.idImageParent = id1;
  this.idInputCode   = id2;
 };
 
 
 // 認証用画像を描画する。
 this.print = function () {
  var img = document.getElementById(this.idSecurityImage);
  
  if(img !== null){
   img.src = "data:image/png;base64," + this.base64Png;
  }
  else{
   var html = "<img width='" + this.width + "' height='" + this.height + "' alt='認証画像' src='data:image/png;base64," + this.base64Png + "' id='" + this.idSecurityImage + "'>";
   
   document.getElementById(this.idImageParent).innerHTML = html;
  }
 };
 
 
 // 認証用画像を取得する。
 this.getSecurityImage = function () {
  $.ajax({
   type : "post",
   url  : "/cgi-bin/Telnetman2/security_image.cgi",
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
      objSecurityImage.width     = hashResult["width"];
      objSecurityImage.height    = hashResult["height"];
      objSecurityImage.base64Png = hashResult["base64"];
      objSecurityImage.md5sum    = hashResult["md5sum"];
      
      document.getElementById(objSecurityImage.idInputCode).value = "";
      
      objSecurityImage.print();
     }
    }
    
   },
   error : function () {
    alert("認証用画像の取得に失敗しました。");
   }
  });
 };
 
 
 // 入力された認証文字の全角文字を半角にする。
 this.toHalfSize = function () {
  var elInputCode = document.getElementById(this.idInputCode);
  var code = elInputCode.value;
  
  code = objCommonFunctions.convertFullSizeAlphabetAndNumber(code);
  
  elInputCode.value = code;
  this.securityCode = code;
 };
 
 return(this);
}
