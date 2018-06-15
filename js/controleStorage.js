// 説明   : local storage に値を入れたり、出したりする。
// 作成日 : 2014/06/18
// 作成者 : 江野高広
// 更新   : 2015/10/26 syslog 検出機能追加。
//        : 2015/12/09 --More-- 対応。
// 更新   : 2016/06/27 ssh に対応。
// 更新   : 2017/09/11 繰り返し型ルーチンの逆順に対応。
// 更新   : 2018/06/07 検索キーワードをlocal storage に入れる。


var storageL = localStorage;
var objControleStorageL = new controleStorageL();



var storageS = sessionStorage;
var objControleStorageS = new controleStorageS();



// ログインID とセッションID をHTTP リクエストヘッダーに入れる形にする。
function makeAuthHeader () {
 var loginID   = objControleStorageL.getLoginId();
 var sessionID = objControleStorageS.getSessionId();
 
 return("Telnetman " + loginID + " " + sessionID);
}



function controleStorageL () {
 // key の共通接頭語。
 this.prefix = function (){
  return("Telnetman2_" + objControleStorageS.getUserId() + "_");
 };
 
 
 
 // ログインID
 this.keyLoginId = function () {
  return(this.prefix() + "loginId");
 };
 
 this.getLoginId = function () {
  var loginId = storageL.getItem(this.keyLoginId());
  
  if(loginId === null){
   loginId = "";
  }
  
  return(loginId);
 };
 
 this.setLoginId = function (loginId) {
  storageL.setItem(this.keyLoginId(), loginId);
 };
 
 this.removeLoginId = function () {
  storageL.removeItem(this.keyLoginId());
 };
 
 
 // 現在開いているページ。
 this.keyPage = function (sessionIndex) {
  // セッションIundex が未指定ならsession storage から読み出す。
  if((sessionIndex === null) || (sessionIndex === undefined) || (sessionIndex.length ===0)){
   sessionIndex = objControleStorageS.getSessionIndex();
  }
  
  return(this.prefix() + "page_" + sessionIndex);
 };
 
 this.getPage = function (sessionIndex) {
  var page = storageL.getItem(this.keyPage(sessionIndex));
  
  if(page === null){
   page = "flowchart";
  }
  
  return(page);
 };
 
 this.setPage = function (page, sessionIndex) {
  storageL.setItem(this.keyPage(sessionIndex), page);
 };
 
 this.removePage = function (sessionIndex) {
  storageL.removeItem(this.keyPage(sessionIndex));
 };
 
 
 // 最後に採番されたセッションIndex
 this.keyLastSessionIndex = function () {
  return(this.prefix() + "lastSessionIndex");
 };
 
 this.getLastSessionIndex = function () {
  var sessionIndex = storageL.getItem(this.keyLastSessionIndex());
  
  if(sessionIndex !== null){
   sessionIndex = parseInt(sessionIndex, 10);
  }
  else{
   sessionIndex = 0;
  }
  
  return(sessionIndex);
 };
 
 this.setLastSessionIndex = function (sessionIndex) {
  storageL.setItem(this.keyLastSessionIndex(), sessionIndex);
 };
 
 
 
 // セッションIndex を配列に格納する。
 this.keySessionIndexList = function () {
  return(this.prefix() + "sessionIndexList");
 };
 
 this.getSessionIndexList = function () {
  var jsonSessionIndexList = storageL.getItem(this.keySessionIndexList());
  
  if(jsonSessionIndexList !== null){
   var sessionIndexList = JSON.parse(jsonSessionIndexList);
   return(sessionIndexList);
  }
  else{
   sessionIndexList = new Array();
   return(sessionIndexList);
  }
 };
 
 this.setSessionIndexList = function (sessionIndexList) {
  var jsonSessionIndexList = JSON.stringify(sessionIndexList);
  
  storageL.setItem(this.keySessionIndexList(), jsonSessionIndexList);
 };
 
 this.pushSessionIndexList = function (sessionIndex) {
  var sessionIndexList = this.getSessionIndexList();
  
  sessionIndexList.push(sessionIndex);
  
  this.setSessionIndexList(sessionIndexList);
 };
 
 this.removeSessionIndexList = function (sessionIndex){
  var sessionIndexList = this.getSessionIndexList();
  
  for(var i = 0, j = sessionIndexList.length; i < j; i ++){
   if(sessionIndexList[i] === sessionIndex){
    sessionIndexList.splice(i, 1);
    break;
   }
  }
  
  this.setSessionIndexList(sessionIndexList); 
 };
 
 
 
 // セッションID からセッションIndex を特定。
 this.keySessionIndex = function (sessionId) {
  // セッションID が未指定ならsession storage から読み出す。
  if((sessionId === null) || (sessionId === undefined) || (sessionId.length ===0)){
   sessionId = objControleStorageS.getSessionId();
  }
  
  return(this.prefix() + "sessionIndex_" + sessionId);
 };
 
 this.getSessionIndex = function (sessionId) {
  var sessionIndex = storageL.getItem(this.keySessionIndex(sessionId));
  
  if(sessionIndex !== null){
   sessionIndex = parseInt(sessionIndex, 10);
  }
  else{
   sessionIndex = 0;
  }
  
  return(sessionIndex);
 };
 
 this.setSessionIndex = function (sessionIndex, sessionId) {
  storageL.setItem(this.keySessionIndex(sessionId), sessionIndex);
 };
 
 this.removeSessionIndex = function (sessionId) {
  storageL.removeItem(this.keySessionIndex(sessionId));
 };
 
 
 
 // セッションIndex からセッションID を特定。
 this.keySessionId = function (sessionIndex) {
  // セッションIundex が未指定ならsession storage から読み出す。
  if((sessionIndex === null) || (sessionIndex === undefined) || (sessionIndex.length ===0)){
   sessionIndex = objControleStorageS.getSessionIndex();
  }
  
  return(this.prefix() + "sessionId_" + sessionIndex);
 };
 
 this.getSessionId = function (sessionIndex) {
  var sessionId = storageL.getItem(this.keySessionId(sessionIndex));
  
  if(sessionId === null){
   sessionId = "";
  }
  
  return(sessionId);
 };
 
 this.setSessionId = function (sessionId, sessionIndex) {
  storageL.setItem(this.keySessionId(sessionIndex), sessionId);
 };
 
 this.removeSessionId = function (sessionIndex) {
  storageL.removeItem(this.keySessionId(sessionIndex));
 };
 
 
 
 // セッションタイトル
 this.keySessionTitle = function(sessionIndex) {
  if((sessionIndex === null) || (sessionIndex === undefined) || (sessionIndex.length ===0)){
   sessionIndex = objControleStorageS.getSessionIndex();
  }
  
  return(this.prefix() + "sessionTitle_" + sessionIndex);
 };
 
 this.getSessionTitle = function (sessionIndex) {
  var title = storageL.getItem(this.keySessionTitle(sessionIndex));
  
  if(title === null){
   title = "";
  }
  
  return(title);
 };
 
 this.setSessionTitle = function (title, sessionIndex) {
  storageL.setItem(this.keySessionTitle(sessionIndex), title);
 };
 
 this.removeSessionTitle = function (sessionIndex) {
  storageL.removeItem(this.keySessionTitle(sessionIndex));
 };
 
 
 
 // セッションのアクティベート時刻
 this.keySessionActivateTime = function (sessionIndex) {
  if((sessionIndex === null) || (sessionIndex === undefined) || (sessionIndex.length ===0)){
   sessionIndex = objControleStorageS.getSessionIndex();
  }
  
  return(this.prefix() + "sessionActivateTime_" + sessionIndex);
 };
 
 this.getSessionActivateTime = function (sessionIndex) {
  var activateTime = storageL.getItem(this.keySessionActivateTime(sessionIndex));
  
  if(activateTime !== null){
   activateTime = parseInt(activateTime, 10);
  }
  else{
   activateTime = 0;
  }
  
  return(activateTime);
 };
 
 this.setSessionActivateTime = function (activateTime, sessionIndex) {
  storageL.setItem(this.keySessionActivateTime(sessionIndex), activateTime);
 };
 
 this.removeSessionActivateTime = function (sessionIndex) {
  storageL.removeItem(this.keySessionActivateTime(sessionIndex));
 };
 
 
 
 // セッションを開いているかどうか。
 this.keySessionOpened = function (sessionIndex) {
  if((sessionIndex === null) || (sessionIndex === undefined) || (sessionIndex.length ===0)){
   sessionIndex = objControleStorageS.getSessionIndex();
  }
  
  return(this.prefix() + "sessionOpened_" + sessionIndex);
 };
 
 this.getSessionOpened = function (sessionIndex) {
  var opened = storageL.getItem(this.keySessionOpened(sessionIndex));
  
  if(opened !== null){
   opened = parseInt(opened, 10);
  }
  else{
   opened = 0;
  }
  
  return(opened);
 };
 
 this.setSessionOpened = function (opened, sessionIndex) {
  storageL.setItem(this.keySessionOpened(sessionIndex), opened);
 };
 
 this.removeSessionOpened = function (sessionIndex) {
  storageL.removeItem(this.keySessionOpened(sessionIndex));
 };
 
 
 
 // メインルーチンの流れ図の縦の最大要素数。
 this.keyMainRoutineX = function (){
  sessionIndex = objControleStorageS.getSessionIndex();
  
  return(this.prefix() + "mainRoutineX_" + sessionIndex);
 };
 
 this.getMainRoutineX = function (){
  var mainRoutineX = storageL.getItem(this.keyMainRoutineX());
  
  if(mainRoutineX !== null){
   mainRoutineX = parseInt(mainRoutineX, 10);
  }
  else{
   mainRoutineX = 0;
  }
  
  return(mainRoutineX);
 };
 
 this.setMainRoutineX = function (x){
  storageL.setItem(this.keyMainRoutineX(), x);
 };
 
 this.removeMainRoutineX = function () {
  storageL.removeItem(this.keyMainRoutineX());
 };
 
 
 
 // メインルーチンの流れ図の横の最大要素。
 this.keyMainRoutineY = function (){
  sessionIndex = objControleStorageS.getSessionIndex();
  
  return(this.prefix() + "mainRoutineY_" + sessionIndex);
 };
 
 this.getMainRoutineY = function (){
  var mainRoutineY = storageL.getItem(this.keyMainRoutineY());
  
  if(mainRoutineY !== null){
   mainRoutineY = parseInt(mainRoutineY, 10);
  }
  else{
   mainRoutineY = 0;
  }
  
  return(mainRoutineY);
 };
 
 this.setMainRoutineY = function (y){
  storageL.setItem(this.keyMainRoutineY(), y);
 };
 
 this.removeMainRoutineY = function () {
  storageL.removeItem(this.keyMainRoutineY());
 };
 
 
 
 // メインルーチンの流れ図の1要素。
 this.keyMainRoutineSymbol = function (x, y) {
  sessionIndex = objControleStorageS.getSessionIndex();
  
  return(this.prefix() + "mainRoutineSymbol_" + sessionIndex + "_" + x + "_" + y);
 };
 
 this.getMainRoutineSymbol = function (x, y, textFlag){
  var symbolElements = storageL.getItem(this.keyMainRoutineSymbol(x, y));
  
  if(textFlag){
   if(symbolElements !== null){
    return(symbolElements);
   }
   else{
    return("");
   }
  }
  else{
   if(symbolElements === null){
    return(["", ""]);
   }
   
   var splitMainRoutineSymbolElements = symbolElements.split(" ");
   var itemType = splitMainRoutineSymbolElements[0];
   var itemId   = splitMainRoutineSymbolElements[1];
   
   if(itemType === "sub"){
    itemId = parseInt(itemId, 10);
   }
   
   return([itemType, itemId]);
  }
 };
 
 this.setMainRoutineSymbol = function (x, y, itemType, itemId){
  if(typeof(itemId) === "number"){
   itemId = String(itemId);
  }
  
  if((itemType !== null) && (itemType !== undefined) && (itemType.length > 0) && (itemId !== null) && (itemId !== undefined) && (itemId.length > 0)){
   storageL.setItem(this.keyMainRoutineSymbol(x, y), itemType + " " + itemId);
  }
  else{
   this.removeMainRoutineSymbol(x, y);
  }
 };
 
 this.removeMainRoutineSymbol = function (x, y) {
  storageL.removeItem(this.keyMainRoutineSymbol(x, y));
 };
 
 
 
 // メインルーチンのタイプ
 this.keyMainRoutineType = function () {
  sessionIndex = objControleStorageS.getSessionIndex();
  
  return(this.prefix() + "mainRoutineType_" + sessionIndex);
 };
 
 this.getMainRoutineType = function () {
  var routineType = storageL.getItem(this.keyMainRoutineType());
  
  if(routineType !== null){
   routineType = parseInt(routineType, 10);
  }
  else{
   routineType = 1;
  }
  
  return(routineType);
 };
 
 this.setMainRoutineType = function (routineType) {
  storageL.setItem(this.keyMainRoutineType(), routineType);
 };
 
 this.removeMainRoutineType = function () {
  storageL.removeItem(this.keyMainRoutineType());
 };
 
 
 
 // メインルーチンのループ順
 this.keyMainRoutineLoop = function () {
  sessionIndex = objControleStorageS.getSessionIndex();
  
  return(this.prefix() + "mainRoutineLoop_" + sessionIndex);
 };
 
 this.getMainRoutineLoop = function () {
  var loopType = storageL.getItem(this.keyMainRoutineLoop());
  
  if(loopType !== null){
   loopType = parseInt(loopType, 10);
  }
  else{
   loopType = 0;
  }
  
  return(loopType);
 };
 
 this.setMainRoutineLoop = function (loopType) {
  storageL.setItem(this.keyMainRoutineLoop(), loopType);
 };
 
 this.removeMainRoutineLoop = function () {
  storageL.removeItem(this.keyMainRoutineLoop());
 };
 
 
 
 // 最後に採番されたサブルーチン番号
 this.keyLastSubRoutineIndex = function () {
  sessionIndex = objControleStorageS.getSessionIndex();
  
  return(this.prefix() + "lastSubRoutineIndex_" + sessionIndex);
 };
 
 this.getLastSubRoutineIndex = function () {
  var subRoutineIndex = storageL.getItem(this.keyLastSubRoutineIndex());
  
  if(subRoutineIndex !== null){
   subRoutineIndex = parseInt(subRoutineIndex, 10);
  }
  else{
   subRoutineIndex = 0;
  }
  
  return(subRoutineIndex);
 };
 
 this.setLastSubRoutineIndex = function (subRoutineIndex) {
  storageL.setItem(this.keyLastSubRoutineIndex(), subRoutineIndex);
 };
 
 this.removeLastSubRoutineIndex = function () {
  storageL.removeItem(this.keyLastSubRoutineIndex());
 };
 
 
 
 // サブルーチン番号を作成順にpush した配列
 this.keySubRoutineList = function () {
  sessionIndex = objControleStorageS.getSessionIndex();
  
  return(this.prefix() + "subRoutineList_" + sessionIndex);
 };
 
 this.getSubRoutineList = function (){
  var jsonSubRoutineList = storageL.getItem(this.keySubRoutineList());
  
  if(jsonSubRoutineList !== null){
   var subRoutineList = JSON.parse(jsonSubRoutineList);
   return(subRoutineList);
  }
  else{
   subRoutineList = new Array();
   return(subRoutineList);
  }
 };
 
 this.setSubRoutineList = function (subRoutineList){
  var jsonSubRoutineList = JSON.stringify(subRoutineList);
  storageL.setItem(this.keySubRoutineList(), jsonSubRoutineList);
 };
 
 this.pushSubRoutineList = function () {
  var subRoutineIndex = this.getLastSubRoutineIndex() + 1;
  var subRoutineIndexList = this.getSubRoutineList();
  subRoutineIndexList.push(subRoutineIndex);
  this.setSubRoutineList(subRoutineIndexList);
  this.setLastSubRoutineIndex(subRoutineIndex);
  
  return(subRoutineIndex);
 };
 
 this.removeSubRoutineList = function () {
  storageL.removeItem(this.keySubRoutineList());
 };
 
 
 
 // サブルーチンタイプ
 this.keySubRoutineType = function (subRoutineIndex){
  sessionIndex = objControleStorageS.getSessionIndex();
  
  return(this.prefix() + "subRoutineType_" + sessionIndex + "_" + subRoutineIndex);
 };
 
 this.getSubRoutineType = function (subRoutineIndex){
  var subRoutineType = storageL.getItem(this.keySubRoutineType(subRoutineIndex));
  
  if(subRoutineType !== null){
   subRoutineType = parseInt(subRoutineType, 10);
  }
  else{
   subRoutineType = 1;
  }
  
  return(subRoutineType);
 };
 
 this.setSubRoutineType = function (subRoutineIndex, subRoutineType){
  storageL.setItem(this.keySubRoutineType(subRoutineIndex), subRoutineType);
 };
 
 this.removeSubRoutineType = function (subRoutineIndex){
  storageL.removeItem(this.keySubRoutineType(subRoutineIndex));
 };
 
 
 
 // サブルーチンのループ順
 this.keySubRoutineLoop = function (subRoutineIndex) {
  sessionIndex = objControleStorageS.getSessionIndex();
  
  return(this.prefix() + "subRoutineLoop_" + sessionIndex + "_" + subRoutineIndex);
 };
 
 this.getSubRoutineLoop = function (subRoutineIndex){
  var loopType = storageL.getItem(this.keySubRoutineLoop(subRoutineIndex));
  
  if(loopType !== null){
   loopType = parseInt(loopType, 10);
  }
  else{
   loopType = 0;
  }
  
  return(loopType);
 };
 
 this.setSubRoutineLoop = function (subRoutineIndex, loopType){
  storageL.setItem(this.keySubRoutineLoop(subRoutineIndex), loopType);
 };
 
 this.removeSubRoutineLoop = function (subRoutineIndex){
  storageL.removeItem(this.keySubRoutineLoop(subRoutineIndex));
 };
 
 
 
 // サブルーチンのタイトル
 this.keySubRoutineTitle = function (subRoutineIndex) {
  sessionIndex = objControleStorageS.getSessionIndex();
  
  return(this.prefix() + "subRoutineTitle_" + sessionIndex + "_" + subRoutineIndex);
 };
 
 this.getSubRoutineTitle = function (subRoutineIndex) {
  var subRoutineTitle = storageL.getItem(this.keySubRoutineTitle(subRoutineIndex));
  
  if(subRoutineTitle === null){
   subRoutineTitle = "";
  }
  
  return(subRoutineTitle);
 };
 
 this.setSubRoutineTitle = function (subRoutineIndex, subRoutineTitle) {
  storageL.setItem(this.keySubRoutineTitle(subRoutineIndex), subRoutineTitle);
 };
 
 this.removeSubRoutineTitle = function (subRoutineIndex) {
  storageL.removeItem(this.keySubRoutineTitle(subRoutineIndex));
 };
 
 
 
 // サブルーチンの流れ図の縦の最大要素数。
 this.keySubRoutineX = function (subRoutineIndex) {
  sessionIndex = objControleStorageS.getSessionIndex();
  
  return(this.prefix() + "subRoutineX_" + sessionIndex + "_" + subRoutineIndex);
 };
 
 this.getSubRoutineX = function (subRoutineIndex) {
  var subRoutineX = storageL.getItem(this.keySubRoutineX(subRoutineIndex));
  
  if(subRoutineX !== null){
   subRoutineX = parseInt(subRoutineX, 10);
  }
  else{
   subRoutineX = 0;
  }
  
  return(subRoutineX);
 };
 
 this.setSubRoutineX = function (subRoutineIndex, subRoutineX) {
  storageL.setItem(this.keySubRoutineX(subRoutineIndex), subRoutineX);
 };
 
 this.removeSubRoutineX = function (subRoutineIndex) {
  storageL.removeItem(this.keySubRoutineX(subRoutineIndex));
 };
 
 
 
 // サブルーチンの流れ図の横の最大要素数。
 this.keySubRoutineY = function (subRoutineIndex) {
  sessionIndex = objControleStorageS.getSessionIndex();
  
  return(this.prefix() + "subRoutineY_" + sessionIndex + "_" + subRoutineIndex);
 };
 
 this.getSubRoutineY = function (subRoutineIndex) {
  var subRoutineY = storageL.getItem(this.keySubRoutineY(subRoutineIndex));
  
  if(subRoutineY !== null){
   subRoutineY = parseInt(subRoutineY, 10);
  }
  else{
   subRoutineY = 0;
  }
  
  return(subRoutineY);
 };
 
 this.setSubRoutineY = function (subRoutineIndex, subRoutineY) {
  storageL.setItem(this.keySubRoutineY(subRoutineIndex), subRoutineY);
 };
 
 this.removeSubRoutineY = function (subRoutineIndex) {
  storageL.removeItem(this.keySubRoutineY(subRoutineIndex));
 };
 
 
 
 // サブルーチンの流れ図の1要素。
 this.keySubRoutineSymbol = function (subRoutineIndex, subRoutineX, subRoutineY) {
  sessionIndex = objControleStorageS.getSessionIndex();
  
  return(this.prefix() + "subRoutineSymbol_" + sessionIndex + "_" + subRoutineIndex + "_" + subRoutineX + "_" + subRoutineY);
 };
 
 this.getSubRoutineSymbol = function (subRoutineIndex, subRoutineX, subRoutineY, textFlag) {
  var symbolElements = storageL.getItem(this.keySubRoutineSymbol(subRoutineIndex, subRoutineX, subRoutineY));
  
  if(textFlag){
   if(symbolElements !== null){
    return(symbolElements);
   }
   else{
    return("");
   }
  }
  else{
   if(symbolElements === null){
    return(["", ""]);
   }
   
   var splitMainRoutineSymbolElements = symbolElements.split(" ");
   var itemType = splitMainRoutineSymbolElements[0];
   var itemId   = splitMainRoutineSymbolElements[1];
   
   return([itemType, itemId]);
  }
 };
 
 this.setSubRoutineSymbol = function (subRoutineIndex, subRoutineX, subRoutineY, itemType, itemId) {
  if(typeof(itemId) === "number"){
   itemId = String(itemId);
  }
  
  if((itemType !== null) && (itemType !== undefined) && (itemType.length > 0) && (itemId !== null) && (itemId !== undefined) && (itemId.length > 0)){
   storageL.setItem(this.keySubRoutineSymbol(subRoutineIndex, subRoutineX, subRoutineY), itemType + " " + itemId);
  }
  else{
   this.removeSubRoutineSymbol(subRoutineIndex, subRoutineX, subRoutineY);
  }
 };
 
 this.removeSubRoutineSymbol = function (subRoutineIndex, subRoutineX, subRoutineY) {
  storageL.removeItem(this.keySubRoutineSymbol(subRoutineIndex, subRoutineX, subRoutineY));
 };
 
 
 
 // before middle after どの流れ図が選択されているか。
 this.keySelectedFlowchart = function (){
  sessionIndex = objControleStorageS.getSessionIndex();
  return(this.prefix() + "selectedFlowchart_" + sessionIndex);
 };
 
 this.getSelectedFlowchart = function (){
  var flowchartType = storageL.getItem(this.keySelectedFlowchart());
  
  if(flowchartType === null){
   flowchartType = "middle";
  }
  
  return(flowchartType);
 };
 
 this.setSelectedFlowchart = function (flowchartType){
  storageL.setItem(this.keySelectedFlowchart(), flowchartType);
 };
 
 this.removeSelectedFlowchart = function () {
  storageL.removeItem(this.keySelectedFlowchart());
 };
 
 
 
 // flowchart のデータ
 this.keyFlowchartData = function (flowchartType){
  sessionIndex = objControleStorageS.getSessionIndex();
  return(this.prefix() + flowchartType + "FlowchartData_" + sessionIndex);
 };
 
 this.getFlowchartData = function (flowchartType) {
  var jsonFlowchartData = storageL.getItem(this.keyFlowchartData(flowchartType));
  
  if(jsonFlowchartData === null){
   var routineTitle = "";
   
   if(flowchartType === "middle"){ 
    routineTitle = this.getSessionTitle();
   }
   else if(flowchartType === "before"){
    routineTitle = "事前";
   }
   else if(flowchartType === "after"){
    routineTitle = "事後";
   }
   
   var flowchartData = new Object();
   flowchartData["flowchart"] = {"0":[["","",""],["","",""],["","",""]]};
   flowchartData["routine_repeat_type"] = {"0":1};
   flowchartData["routine_title"] = {"0":routineTitle};
   flowchartData["routine_loop_type"] = {"0":0};
   
   jsonFlowchartData = JSON.stringify(flowchartData);
  }
  
  return(jsonFlowchartData);
 };
 
 this.setFlowchartData = function (flowchartType, jsonFlowchartData) {
  storageL.setItem(this.keyFlowchartData(flowchartType), jsonFlowchartData);
 };
 
 this.removeFlowchartData = function (flowchartType) {
  storageL.removeItem(this.keyFlowchartData(flowchartType));
 };
 
 
 
 // middle before after routine のタイトル
 this.keyFlowchartTitle = function (flowchartType) {
  sessionIndex = objControleStorageS.getSessionIndex();
  return(this.prefix() + flowchartType + "FlowchartTitle_" + sessionIndex);
 };
 
 this.getFlowchartTitle = function (flowchartType) {
  var routineTitle = storageL.getItem(this.keyFlowchartTitle(flowchartType));
  
  if(routineTitle === null){
   if(flowchartType === "middle"){ 
    routineTitle = this.getSessionTitle();
   }
   else if(flowchartType === "before"){
    routineTitle = "事前";
   }
   else if(flowchartType === "after"){
    routineTitle = "事後";
   }
  }
  
  return(routineTitle);
 };
 
 this.setFlowchartTitle = function (flowchartType, routineTitle) {
  storageL.setItem(this.keyFlowchartTitle(flowchartType), routineTitle);
 };
 
 this.removeFlowchartTitle = function (flowchartType) {
  storageL.removeItem(this.keyFlowchartTitle(flowchartType));
 };
 
 
 // 検索キーワード
 this.keyKeyword = function () {
  return(this.prefix() + "keyword");
 };
 
 this.getKeyword = function () {
  var keyword = storageL.getItem(this.keyKeyword());
  
  if(keyword === null){
   keyword = "";
  }
  
  return(keyword);
 };
 
 this.setKeyword = function (keyword) {
  storageL.setItem(this.keyKeyword(), keyword);
 };
 
 this.removeKeyword = function () {
  storageL.removeItem(this.keyKeyword());
 };
 
 
 return(this);
}



function controleStorageS () {
 // key の共通接頭語。
 this.prefix = "Telnetman2_";
 
 // ログインしているユーザーID
 this.keyUserId = function () {
  return(this.prefix + "userId");
 };
 
 this.getUserId = function () {
  var userId = storageS.getItem(this.keyUserId());
  
  if(userId === null){
   userId = "";
  }
  
  return(userId);
 };
 
 this.setUserId = function (userId) {
  storageS.setItem(this.keyUserId(), userId);
 };
 
 this.removeUserId = function () {
  storageS.removeItem(this.keyUserId());
 };
 
 
 // セッションID
 this.keySessionId = function () {
  return(this.prefix + "sessionId");
 };
 
 this.getSessionId = function () {
  var sessionId = storageS.getItem(this.keySessionId());
  
  if(sessionId === null){
   sessionId = "";
  }
  
  return(sessionId);
 };
 
 this.setSessionId = function (sessionId) {
  storageS.setItem(this.keySessionId(), sessionId);
 };
 
 this.removeSessionId = function () {
  storageS.removeItem(this.keySessionId());
 };
 
 
 
 // セッションIndex
 this.keySessionIndex = function () {
  return(this.prefix + "sessionIndex");
 };
 
 this.getSessionIndex = function () {
  var sessionIndex = storageS.getItem(this.keySessionIndex());
  
  if(sessionIndex !== null){
   sessionIndex = parseInt(sessionIndex, 10);
  }
  else{
   sessionIndex = 0;
  }
  
  return(sessionIndex);
 };
 
 this.setSessionIndex = function (sessionIndex) {
  storageS.setItem(this.keySessionIndex(), sessionIndex);
 };
 
 this.removeSessionIndex = function () {
  storageS.removeItem(this.keySessionIndex());
 };
 
 
 // 前回開いたセッションID
 this.keyLastSessionId = function () {
  return(this.prefix + "lastSessionId");
 };
 
 this.getLastSessionId = function () {
  var lastSessionId = storageS.getItem(this.keyLastSessionId());
  
  if(lastSessionId === null){
   lastSessionId = "";
  }
  
  return(lastSessionId);
 };
 
 this.setLastSessionId = function (lastSessionId) {
  storageS.setItem(this.keyLastSessionId(), lastSessionId);
 };
 
 this.removeLastSessionId = function () {
  storageS.removeItem(this.keyLastSessionId());
 };
 
 
 
 // 前回開いたセッションIndex
 this.keyLastSessionIndex = function () {
  return(this.prefix + "lastSessionIndex");
 };
 
 this.getLastSessionIndex = function () {
  var lastSessionIndex = storageS.getItem(this.keyLastSessionIndex());
  
  if(lastSessionIndex !== null){
   lastSessionIndex = parseInt(lastSessionIndex, 10);
  }
  else{
   lastSessionIndex = 0;
  }
  
  return(lastSessionIndex);
 };
 
 this.setLastSessionIndex = function (lastSessionIndex) {
  storageS.setItem(this.keyLastSessionIndex(), lastSessionIndex);
 };
 
 this.removeLastSessionIndex = function () {
  storageS.removeItem(this.keyLastSessionIndex());
 };
 
 
 
 // 現在開いているページ。
 this.keyPage = function () {
  return(this.prefix + "page");
 };
 
 this.getPage = function () {
  var page = storageS.getItem(this.keyPage());
  
  if(page === null){
   page = "";
  }
  
  return(page);
 };
 
 this.setPage = function (page) {
  storageS.setItem(this.keyPage(), page);
 };
 
 this.removePage = function () {
  storageS.removeItem(this.keyPage());
 };
 
 
 
 // パラメーターシート
 this.keyParameterList = function () {
  return(this.prefix + "parameterList");
 };
 
 this.getParameterList = function (jsonFlag) {
  var jsonParameterList = storageS.getItem(this.keyParameterList());
  
  if(jsonFlag){
   if(jsonParameterList !== null){
    return(jsonParameterList);
   }
   else{
    return("[[\"\"]]");
   }
  }
  else{
   if(jsonParameterList !== null){
    return(JSON.parse(jsonParameterList));
   }
   else{
    return([["","","","",""],["","","","",""],["","","","",""],["","","","",""],["","","","",""]]);
   }
  }
 };
 
 this.setParameterList = function (parameterList) {
  var jsonParameterList = JSON.stringify(parameterList);
  
  storageS.setItem(this.keyParameterList(), jsonParameterList);
 };
 
 this.removeParameterList = function () {
  storageS.removeItem(this.keyParameterList());
 };
 
 
 // service
 this.keyService = function () {
  return(this.prefix + "service");
 };
 
 this.getService = function () {
  var service = storageS.getItem(this.keyService());
  
  if((service === null) || (service === undefined)){
   service = "telnet";
  }
  
  return(service);
 };
 
 this.setService = function (service){
  if((service === null) || (service === undefined)){
   service = "telnet";
  }
  
  storageS.setItem(this.keyService(), service);
 };
 
 this.removeService = function () {
  storageS.removeItem(this.keyService());
 };
 
 
 // port
 this.keyPort = function () {
  return(this.prefix + "port");
 };
 
 this.getPort = function () {
  var port = storageS.getItem(this.keyPort());
  
  if((port !== null) && (port.length > 0)){
   port = parseInt(port, 10);
  }
  else{
   port = 23;
  }
  
  return(port);
 };
 
 this.setPort = function (port) {
  storageS.setItem(this.keyPort(), port);
 };
 
 this.removePort = function () {
  storageS.removeItem(this.keyPort());
 };
 
 
 // timeout
 this.keyTimeout = function () {
  return(this.prefix + "timeout");
 };
 
 this.getTimeout = function () {
  var timeout = storageS.getItem(this.keyTimeout());
  
  if((timeout !== null) && (timeout.length > 0)){
   timeout = parseInt(timeout, 10);
  }
  else{
   timeout = 10;
  }
  
  return(timeout);
 };
 
 this.setTimeout = function (timeout) {
  if((timeout === null) || (timeout === undefined)){
   timeout = 10;
  }
  
  storageS.setItem(this.keyTimeout(), timeout);
 };
 
 this.removeTimeout = function () {
  storageS.removeItem(this.keyTimeout());
 };
 
 
 
 // prompt
 this.keyPrompt = function () {
  return(this.prefix + "prompt");
 };
 
 this.getPrompt = function () {
  var prompt = storageS.getItem(this.keyPrompt());
  
  if(prompt === null){
   prompt = ".*(>|#|\\]|\\?)\\s*$";
  }
  
  return(prompt);
 };
 
 this.setPrompt = function (prompt) {
  if((prompt === null) || (prompt === undefined)){
   prompt = ".*(>|#|\\]|\\?)\\s*$";
  }
  
  storageS.setItem(this.keyPrompt(), prompt);
 };
 
 this.removePrompt = function () {
  storageS.removeItem(this.keyPrompt());
 };
 
 
 
 // user
 this.keyUser = function () {
  return(this.prefix + "user");
 };
 
 this.getUser = function () {
  var user = storageS.getItem(this.keyUser());
  
  if(user === null){
   user = "";
  }
  
  return(user);
 };
 
 this.setUser = function (user) {
  if((user === null) || (user === undefined)){
   user = "";
  }
  
  storageS.setItem(this.keyUser(), user);
 };
 
 this.removeUser = function () {
  storageS.removeItem(this.keyUser());
 };
 
 
 
 // user prompt
 this.keyUserPrompt = function () {
  return(this.prefix + "userPrompt");
 };
 
 this.getUserPrompt = function () {
  var userPrompt = storageS.getItem(this.keyUserPrompt());
  
  if(userPrompt === null){
   userPrompt = ".*:\\s*$";
  }
  
  return(userPrompt);
 };
 
 this.setUserPrompt = function (userPrompt) {
  if((userPrompt === null) || (userPrompt === undefined)){
   userPrompt = ".*:\\s*$";
  }
  
  storageS.setItem(this.keyUserPrompt(), userPrompt);
 };
 
 this.removeUserPrompt = function () {
  storageS.removeItem(this.keyUserPrompt());
 };
 
 
 
 // password prompt
 this.keyPasswordPrompt = function () {
  return(this.prefix + "passwordPrompt");
 };
 
 this.getPasswordPrompt = function () {
  var passwordPrompt = storageS.getItem(this.keyPasswordPrompt());
  
  if(passwordPrompt === null){
   passwordPrompt = ".*:\\s*$";
  }
  
  return(passwordPrompt);
 };
 
 this.setPasswordPrompt = function (passwordPrompt) {
  if((passwordPrompt === null) || (passwordPrompt === undefined)){
   passwordPrompt = ".*:\\s*$";
  }
  
  storageS.setItem(this.keyPasswordPrompt(), passwordPrompt);
 };
 
 this.removePasswordPrompt = function () {
  storageS.removeItem(this.keyPasswordPrompt());
 };
 
 
 
 // enable prompt
 this.keyEnablePrompt = function () {
  return(this.prefix + "enablePrompt");
 };
 
 this.getEnablePrompt = function () {
  var enablePrompt = storageS.getItem(this.keyEnablePrompt());
  
  if(enablePrompt === null){
   enablePrompt = ".*:\\s*$";
  }
  
  return(enablePrompt);
 };
 
 this.setEnablePrompt = function (enablePrompt) {
  if((enablePrompt === null) || (enablePrompt === undefined)){
   enablePrompt = ".*:\\s*$";
  }
  
  storageS.setItem(this.keyEnablePrompt(), enablePrompt);
 };
 
 this.removeEnablePrompt = function () {
  storageS.removeItem(this.keyEnablePrompt());
 };
 
 
 
 // enable command
 this.keyEnableCommand = function () {
  return(this.prefix + "enableCommand");
 };
 
 this.getEnableCommand = function () {
  var enableCommand = storageS.getItem(this.keyEnableCommand());
  
  if(enableCommand === null){
   enableCommand = "enable";
  }
  
  return(enableCommand);
 };
 
 this.setEnableCommand = function (enableCommand) {
  if((enableCommand === null) || (enableCommand === undefined)){
   enableCommand = "enable";
  }
  
  storageS.setItem(this.keyEnableCommand(), enableCommand);
 };
 
 this.removeEnableCommand = function () {
  storageS.removeItem(this.keyEnableCommand());
 };
 
 
 
 // enable password
 this.keyEnablePassword = function () {
  return(this.prefix + "enablePassword");
 };
 
 this.getEnablePassword = function () {
  var enablePassword = storageS.getItem(this.keyEnablePassword());
  
  if(enablePassword === null){
   enablePassword = "";
  }
  
  return(enablePassword);
 };
 
 this.setEnablePassword = function (enablePassword) {
  if((enablePassword === null) || (enablePassword === undefined)){
   enablePassword = "";
  }
  
  storageS.setItem(this.keyEnablePassword(), enablePassword);
 };
 
 this.removeEnablePassword = function () {
  storageS.removeItem(this.keyEnablePassword());
 };
 
 
 
 // terminal length
 this.keyTerminalLength = function () {
  return(this.prefix + "terminalLength");
 };
 
 this.getTerminalLength = function () {
  var terminalLength = storageS.getItem(this.keyTerminalLength());
  
  if(terminalLength === null){
   terminalLength = "terminal length 0";
  }
  
  return(terminalLength);
 };
 
 this.setTerminalLength = function (terminalLength) {
  if((terminalLength === null) || (terminalLength === undefined)){
   terminalLength = "terminal length 0";
  }
  
  storageS.setItem(this.keyTerminalLength(), terminalLength);
 };
 
 this.removeTerminalLength = function () {
  storageS.removeItem(this.keyTerminalLength());
 };
 
 
 
 // terminal width
 this.keyTerminalWidth = function () {
  return(this.prefix + "terminalWidth");
 };
 
 this.getTerminalWidth = function () {
  var terminalWidth = storageS.getItem(this.keyTerminalWidth());
  
  if(terminalWidth === null){
   terminalWidth = "terminal width 0";
  }
  
  return(terminalWidth);
 };
 
 this.setTerminalWidth = function (terminalWidth) {
  if((terminalWidth === null) || (terminalWidth === undefined)){
   terminalWidth = "terminal width 0";
  }
  
  storageS.setItem(this.keyTerminalWidth(), terminalWidth);
 };
 
 this.removeTerminalWidth = function () {
  storageS.removeItem(this.keyTerminalWidth());
 };
 
 
 // more string
 this.keyMoreString = function () {
  return(this.prefix + "moreString");
 };
 
 this.getMoreString = function () {
  var moreString = storageS.getItem(this.keyMoreString());
  
  if(moreString === null){
   moreString = "";
  }
  
  return(moreString);
 };
 
 this.setMoreString = function (moreString) {
  if((moreString === null) || (moreString === undefined)){
   moreString = "";
  }
  
  storageS.setItem(this.keyMoreString(), moreString);
 };
 
 this.removeMoreString = function () {
  storageS.removeItem(this.keyMoreString());
 };
 
 
 // more command
 this.keyMoreCommand = function () {
  return(this.prefix + "moreCommand");
 };
 
 this.getMoreCommand = function () {
  var moreCommand = storageS.getItem(this.keyMoreCommand());
  
  if(moreCommand === null){
   moreCommand = "";
  }
  
  return(moreCommand);
 };
 
 this.setMoreCommand = function (moreCommand) {
  if((moreCommand === null) || (moreCommand === undefined)){
   moreCommand = "";
  }
  
  storageS.setItem(this.keyMoreCommand(), moreCommand);
 };
 
 this.removeMoreCommand = function () {
  storageS.removeItem(this.keyMoreCommand());
 };
 
 
 // configure terminal
 this.keyConfigureTerminal = function () {
  return(this.prefix + "configureTerminal");
 };
 
 this.getConfigureTerminal = function () {
  var configureTerminal = storageS.getItem(this.keyConfigureTerminal());
  
  if(configureTerminal === null){
   configureTerminal = "configure terminal";
  }
  
  return(configureTerminal);
 };
 
 this.setConfigureTerminal = function (configureTerminal) {
  if((configureTerminal === null) || (configureTerminal === undefined)){
   configureTerminal = "configure terminal";
  }
  
  storageS.setItem(this.keyConfigureTerminal(), configureTerminal);
 };
 
 this.removeConfigureTerminal = function () {
  storageS.removeItem(this.keyConfigureTerminal());
 };
 
 
 
 // configure end
 this.keyConfigureEnd = function () {
  return(this.prefix + "configureEnd");
 };
 
 this.getConfigureEnd = function () {
  var configureEnd = storageS.getItem(this.keyConfigureEnd());
  
  if(configureEnd === null){
   configureEnd = "end";
  }
  
  return(configureEnd);
 };
 
 this.setConfigureEnd = function (configureEnd) {
  if((configureEnd === null) || (configureEnd === undefined)){
   configureEnd = "end";
  }
  
  storageS.setItem(this.keyConfigureEnd(), configureEnd);
 };
 
 this.removeConfigureEnd = function () {
  storageS.removeItem(this.keyConfigureEnd());
 };
 
 
 
 // exit
 this.keyExit = function () {
  return(this.prefix + "exit");
 };
 
 this.getExit = function () {
  var exit = storageS.getItem(this.keyExit());
  
  if(exit === null){
   exit = "exit";
  }
  
  return(exit);
 };
 
 this.setExit = function (exit) {
  if((exit === null) || (exit === undefined)){
   exit = "exit";
  }
  
  storageS.setItem(this.keyExit(), exit);
 };
 
 this.removeExit = function () {
  storageS.removeItem(this.keyExit());
 };
 
 
 
 // diff header 1
 this.keyDiffHeader1 = function (){
  return(this.prefix + "diffHeader1");
 };
 
 this.getDiffHeader1 = function (){
  var diffHeader1 = storageS.getItem(this.keyDiffHeader1());
  
  if(diffHeader1 === null){
   diffHeader1 = "";
  }
  
  return(diffHeader1);
 };
 
 this.setDiffHeader1 = function (diffHeader1){
  storageS.setItem(this.keyDiffHeader1(), diffHeader1);
 };
 
 this.removeDiffHeader1 = function (){
  storageS.removeItem(this.keyDiffHeader1());
 };
 
 
 
 // diff header 2
 this.keyDiffHeader2 = function (){
  return(this.prefix + "diffHeader2");
 };
 
 this.getDiffHeader2 = function (){
  var diffHeader2 = storageS.getItem(this.keyDiffHeader2());
  
  if(diffHeader2 === null){
   diffHeader2 = "";
  }
  
  return(diffHeader2);
 };
 
 this.setDiffHeader2 = function (diffHeader2){
  storageS.setItem(this.keyDiffHeader2(), diffHeader2);
 };
 
 this.removeDiffHeader2 = function (){
  storageS.removeItem(this.keyDiffHeader2());
 };
 
 
 
 // diff value 1
 this.keyDiffValue1 = function (){
  return(this.prefix + "diffValue1");
 };
 
 this.getDiffValue1 = function (){
  var diffValue1 = storageS.getItem(this.keyDiffValue1());
  
  if(diffValue1 === null){
   diffValue1 = "";
  }
  
  return(diffValue1);
 };
 
 this.setDiffValue1 = function (diffValue1){
  storageS.setItem(this.keyDiffValue1(), diffValue1);
 };
 
 this.removeDiffValue1 = function (){
  storageS.removeItem(this.keyDiffValue1());
 };
 
 
 
 // diff value 2
 this.keyDiffValue2 = function (){
  return(this.prefix + "diffValue2");
 };
 
 this.getDiffValue2 = function (){
  var diffValue2 = storageS.getItem(this.keyDiffValue2());
  
  if(diffValue2 === null){
   diffValue2 = "";
  }
  
  return(diffValue2);
 };
 
 this.setDiffValue2 = function (diffValue2){
  storageS.setItem(this.keyDiffValue2(), diffValue2);
 };
 
 this.removeDiffValue2 = function (){
  storageS.removeItem(this.keyDiffValue2());
 };
 
 
 // optional log header
 this.keyOptionalLogHeader = function (){
  return(this.prefix + "optionalLogHeader");
 };
 
 this.getOptionalLogHeader = function (){
  var optionalLogHeader = storageS.getItem(this.keyOptionalLogHeader());
  
  if(optionalLogHeader === null){
   optionalLogHeader = "";
  }
  
  return(optionalLogHeader);
 };
 
 this.setOptionalLogHeader = function (optionalLogHeader){
  storageS.setItem(this.keyOptionalLogHeader(), optionalLogHeader);
 };
 
 this.removeOptionalLogHeader = function (){
  storageS.removeItem(this.keyOptionalLogHeader());
 };
 
 
 // optional log value
 this.keyOptionalLogValue = function (){
  return(this.prefix + "optionalLogValue");
 };
 
 this.getOptionalLogValue = function (){
  var optionalLogValue = storageS.getItem(this.keyOptionalLogValue());
  
  if(optionalLogValue === null){
   optionalLogValue = "";
  }
  
  return(optionalLogValue);
 };
 
 this.setOptionalLogValue = function (optionalLogValue){
  storageS.setItem(this.keyOptionalLogValue(), optionalLogValue);
 };
 
 this.removeOptionalLogValue = function (){
  storageS.removeItem(this.keyOptionalLogValue());
 };
 
 
 // terminal monitor command
 this.keyTerminalMonitorCommand = function (){
  return(this.prefix + "terminalMonitorCommand");
 };
 
 this.getTerminalMonitorCommand = function (){
  var terminalMonitorCommand = storageS.getItem(this.keyTerminalMonitorCommand());
  
  if(terminalMonitorCommand === null){
   terminalMonitorCommand = "";
  }
  
  return(terminalMonitorCommand);
 };
 
 this.setTerminalMonitorCommand = function (terminalMonitorCommand){
  storageS.setItem(this.keyTerminalMonitorCommand(), terminalMonitorCommand);
 };
 
 this.removeTerminalMonitorCommand = function (){
  storageS.removeItem(this.keyTerminalMonitorCommand());
 };
 
 
 // terminal monitor pattern
 this.keyTerminalMonitorPattern = function (){
  return(this.prefix + "terminalMonitorPattern");
 };
 
 this.getTerminalMonitorPattern = function (){
  var terminalMonitorPattern = storageS.getItem(this.keyTerminalMonitorPattern());
  
  if(terminalMonitorPattern === null){
   terminalMonitorPattern = "";
  }
  
  return(terminalMonitorPattern);
 };
 
 this.setTerminalMonitorPattern = function (terminalMonitorPattern){
  storageS.setItem(this.keyTerminalMonitorPattern(), terminalMonitorPattern);
 };
 
 this.removeTerminalMonitorPattern = function (){
  storageS.removeItem(this.keyTerminalMonitorPattern());
 };
 
 
 // terminal monitor errors
 this.keyTerminalMonitorErrors = function (){
  return(this.prefix + "terminalMonitorErrors");
 };
 
 this.getTerminalMonitorErrors = function (jsonFlag){
  var jsonTerminalMonitorErrors = storageS.getItem(this.keyTerminalMonitorErrors());
  
  if(jsonFlag){
   if(jsonTerminalMonitorErrors !== null){
    return(jsonTerminalMonitorErrors);
   }
   else{
    return("[\"\"]");
   }
  }
  else{
   if(jsonTerminalMonitorErrors !== null){
    return(JSON.parse(jsonTerminalMonitorErrors));
   }
   else{
    return([""]);
   }
  }
 };
 
 this.setTerminalMonitorErrors = function (terminalMonitorErrors){
  var jsonTerminalMonitorErrors = "";
  
  if(typeof(terminalMonitorErrors) === "object"){
   jsonTerminalMonitorErrors = JSON.stringify(terminalMonitorErrors);
  }
  else{
   terminalMonitorErrors = terminalMonitorErrors.replace(/^[\r\n]+/, "");
   terminalMonitorErrors = terminalMonitorErrors.replace(/[\r\n]+$/, "");
   var arrayTerminalMonitorErrors = terminalMonitorErrors.split(/[\r\n]+/);
   jsonTerminalMonitorErrors = JSON.stringify(arrayTerminalMonitorErrors);
  }
  
  storageS.setItem(this.keyTerminalMonitorErrors(), jsonTerminalMonitorErrors);
 };
 
 this.removeTerminalMonitorErrors = function () {
  storageS.removeItem(this.keyTerminalMonitorErrors());
 };
  
 return(this);
}
