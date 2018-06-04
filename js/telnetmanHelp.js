// 説明   : help
// 作成者 : 江野高広
// 作成日 : 2018/02/27

var objTelnetmanHelp = new telnetmanHelp();

function telnetmanHelp() {

 this.help = function (category){
  var title = "";
  var colspan = " colspan='2'";

  if(category === "overview"){
   title = "概要";
  }
  else if(category === "telnetman_light"){
   title = "Telnetman&nbsp;Light";
   colspan = "";
  }
  else if(category === "delete_item"){
   title = "削除";
   colspan = "";
  }
  else if(category === "keyword"){
   title = "キーワード";
   colspan = "";
  }
  else if(category === "comment"){
   title = "コメント";
  }
  else if(category === "command_type"){
   title = "コマンド系統";
  }
  else if(category === "wait"){
   title = "wait";
   colspan = "";
  }
  else if(category === "conft_end"){
   title = "conf&nbsp;t,&nbsp;end";
   colspan = "";
  }
  else if(category === "command"){
   title = "コマンド";
  }
  else if(category === "dummy"){
   title = "ダミー用コマンド返り値";
   colspan = "";
  }
  else if(category === "prompt"){
   title = "プロンプト多重確認";
  }
  else if(category === "store"){
   title = "コマンド返り値を";
   colspan = "";
  }
  else if(category === "include"){
   title = "begin,&nbsp;include,&nbsp;exclude,&nbsp;end";
  }
  else if(category === "include_test"){
   title = "試験用begin,&nbsp;include,&nbsp;exclude,&nbsp;end";
   colspan = "";
  }
  else if(category === "pattern"){
   title = "抽出パターン";
  }
  else if(category === "reg-gen"){
   title = "正規表現ジェネレーター";
   colspan = "";
  }
  else if(category === "script"){
   title = "変換スクリプト";
  }
  else if(category === "condition"){
   title = "分岐条件";
  }
  else if(category === "NG_message"){
   title = "NG&nbsp;メッセージ";
   colspan = "";
  }
  else if(category === "parameter_sheet_A"){
   title = "追加パラメーターシートA";
  }
  else if(category === "parameter_sheet_B"){
   title = "追加パラメーターシートB";
  }
  else if(category === "destroy"){
   title = "コマンド返り値を";
  }
  else if(category === "ping_target"){
   title = "ping&nbsp;対象";
   colspan = "";
  }
  else if(category === "telnetman_script"){
   title = "変換スクリプト";
  }
  else if(category === "export"){
   title = "Export";
   colspan = "";
  }
  else if(category === "import"){
   title = "Import";
   colspan = "";
  }
  else if(category === "flowchart_search"){
   title = "ボタン説明";
  }
  else if(category === "jumper"){
   title = "jumper";
  }
  else if(category === "flowchart_defore_middle_after"){
   title = "3つの流れ図";
   colspan = "";
  }
  else if(category === "flowchart_routine_type"){
   title = "ルーチンの種類";
  }
  else if(category === "pause_button"){
   title = "一時停止&nbsp;強制終了";
  }
  else if(category === "parameter_sheet"){
   title = "パラメーターシート";
  }
  else if(category === "login_info"){
   title = "ログイン情報";
  }
  else if(category === "syslog_info"){
   title = "SYSLOG&nbsp;確認設定";
  }
  else if(category === "diff_info"){
   title = "Diff&nbsp;設定";
  }
  else if(category === "optional_log"){
   title = "任意ログ設定 ";
   colspan = "";
  }
  else if(category.match(/^parameter[0-9]+/)){
   title = "使用可能Telentman&nbsp;変数";
  }

  var html = "<table id='" + objLayoutFunctions.idItemViewTable + "' class='telnetman_item_viewer'>" +
             "<tr>" +
             "<th" + colspan + "><div><span>" + title + "</span><img src='img/cancel.png' width='16' height='16' alt='cancel' onclick='objLayoutFunctions.removeScrollEvent(); objLayoutFunctions.removeItemViewTable();'></div></th>" +
             "</tr>";

  if(category === "overview"){
   html += "<tr>" +
           "<td class='right'><img src='img/01_exec.png'      width='80' height='80' alt='変数設定&nbsp;&amp;&nbsp;実行'></td>" +
           "<td class='left'><span class='telnetman_item_viewer_span2'>パラメーターシートとログインパスワードなどを定義して</span><br><span class='telnetman_item_viewer_span2'>下記流れ図を実行します。</span></td>" +
           "</tr>" +
           "<tr>" +
           "<td class='right'><img src='img/02_flowchart.png' width='80' height='80' alt='流れ図作成'></td>" +
           "<td class='left'><span class='telnetman_item_viewer_span2'>下記command,&nbsp;action,&nbsp;ping&nbsp;を配置して流れ図を作ります。</span></td>" +
           "</tr>" +
           "<tr>" +
           "<td class='right'><img src='img/03_command.png'   width='80' height='80' alt='コマンド'></td>" +
           "<td class='left'><span class='telnetman_item_viewer_span2'>流れ図の材料command&nbsp;を登録します。</span><br><span class='telnetman_item_viewer_span2'>登録したコマンドを対象機器に実行します。</span></td>" +
           "</tr>" +
           "<tr>" +
           "<td class='right'><img src='img/04_action.png'    width='80' height='80' alt='アクション'></td>" +
           "<td class='left'><span class='telnetman_item_viewer_span2'>流れ図の材料action&nbsp;を登録します。</span><br><span class='telnetman_item_viewer_span2'>コマンドの返り値でOK,&nbsp;NG&nbsp;判定したり、</span><br><span class='telnetman_item_viewer_span2'>流れ図実行中にパラメーターシートを編集します。</span></td>" +
           "</tr>" +
           "<tr>" +
           "<td class='right'><img src='img/05_ping.png'      width='80' height='80' alt='ping'></td>" +
           "<td class='left'><span class='telnetman_item_viewer_span2'>流れ図の材料ping&nbsp;を登録します。</span><br><span class='telnetman_item_viewer_span2'>Telnetman&nbsp;サーバーからping&nbsp;を実行してOK,&nbsp;NG&nbsp;判定を行います。</span></td>" +
           "</tr>" +
           "<tr>" +
           "<td class='right'><img src='img/06_script.png'    width='80' height='80' alt='変換スクリプト'></td>" +
           "<td class='left'><span class='telnetman_item_viewer_span2'>action&nbsp;で使用するスクリプトをアップロードします。</span></td>" +
           "</tr>" +
           "<tr>" +
           "<td class='right'><img src='img/07_download.png'  width='80' height='80' alt='データ入出力'></td>" +
           "<td class='left'><span class='telnetman_item_viewer_span2'>command,&nbsp;action&nbsp;ping&nbsp;の所有者を変更したり</span><br><span class='telnetman_item_viewer_span2'>登録内容のExport,&nbsp;Import&nbsp;ができます。</span></td>" +
           "</tr>" +
           "<tr>" +
           "<td class='right'><img src='img/download.png'     width='16' height='16' alt='download'></td>" +
           "<td class='left'><span class='telnetman_item_viewer_span2'>このアイコンをクリックするとその項目のデータをダウンロードできます。</span><br><span class='telnetman_item_viewer_span2'>ダウンロードしたファイルをその項目にドラッグ&amp;ドロップすると取り込めます。</span></td>" +
           "</tr>" +
           "<tr>" +
           "<td class='right'><span class='telnetman_item_viewer_span1'>Telnetman&nbsp;変数</span></td>" +
           "<td class='left'><span class='desc_green'>{&nbsp;}</span><span class='telnetman_item_viewer_span2'>で囲まれた変数を</span><span class='desc_black'>Telnetman&nbsp;変数</span><span class='telnetman_item_viewer_span2'>と称します。</span></td>" +
           "</tr>";
  }
  else if(category === "telnetman_light"){
   html += "<tr>" +
           "<td class='left'" + colspan + "><span class='telnetman_item_viewer_span2'>Telnetman&nbsp;のtelnet&nbsp;実行部分と</span><br><span class='telnetman_item_viewer_span2'>流れ図やパラメーターシートのハードコーディングを1つにしたスクリプトを作成します。</span><br><span class='telnetman_item_viewer_span2'>Telnetman&nbsp;の無い環境でTelnetman&nbsp;と同じ品質で動くスクリプトを作成します。</span></td>" +
           "</tr>";
  }
  else if(category === "delete_item"){
   html += "<tr>" +
           "<td class='left'><span class='telnetman_item_viewer_span2'>アイコンを右クリックすると削除できます。</span></td>" +
           "</tr>";
  }
  else if(category === "keyword"){
   html += "<tr>" +
           "<td class='left'><span class='telnetman_item_viewer_span2'>前方一致で検索するため、作業毎に接頭語を決めると運用しやすくなります。</span><br><span class='telnetman_item_viewer_span2'>特にExport&nbsp;が楽になります。詳しくはDownload&nbsp;のページで。</span></td>" +
           "</tr>";
  }
  else if(category === "comment"){
   html += "<tr>" +
           "<td class='left'" + colspan + "><span class='telnetman_item_viewer_span2'>ログにコメントを挿入します。</span><br><span class='telnetman_item_viewer_span2'>「command&nbsp;系統:返り値なし」で挿入すると見づらくなる場合があります。</span><br><span class='telnetman_item_viewer_span2'>コメントが不要なときは空欄にします。</span></td>" +
           "</tr>" +
           "<tr>" +
           "<td class='right'><span class='telnetman_item_viewer_span1'>例</span></td>" +
           "<td class='left'><textarea spellcheck='false' style='width:260px; height:30px;' readonly>{\$title}\nEthernet{\$B}</textarea></td>" +
           "</tr>" +
           "<tr>" +
           "<td class='right'><span class='telnetman_item_viewer_span1'>結果</span></td>" +
           "<td class='left'><textarea spellcheck='false' style='width:410px; height:140px;' readonly>####################\n# description 設定 #\n# Ethernet0/1      #\n####################\nIOU-L3-1#configure terminal\nEnter configuration commands, one per line.  End with CNTL/Z.\nIOU-L3-1(config)#interface ethernet0/1\nIOU-L3-1(config-if)#description Desc11\nIOU-L3-1(config-if)#end\nIOU-L3-1#</textarea></td>" +
           "</tr>";
  }
  else if(category === "command_type"){
   html += "<tr>" +
           "<td class='left'" + colspan + "><span class='telnetman_item_viewer_span2'>アイコンを変えるだけで機能に違いはありません。</span></td>" +
           "</tr>" +
           "<tr>" +
           "<td class='right'><span class='telnetman_item_viewer_span1'>show</span></td>" +
           "<td class='left'><span class='telnetman_item_viewer_span2'>show&nbsp;系のコマンド</span></td>" +
           "</tr>" +
           "<tr>" +
           "<td class='right'><span class='telnetman_item_viewer_span1'>conf&nbsp;t</span></td>" +
           "<td class='left'><span class='telnetman_item_viewer_span2'>設定変更をかけるコマンド</span></td>" +
           "</tr>" +
           "<tr>" +
           "<td class='right'><span class='telnetman_item_viewer_span1'>返り値なし</span></td>" +
           "<td class='left'><span class='telnetman_item_viewer_span2'>cisco&nbsp;のping,&nbsp;copy&nbsp;のように設定値を入力するときや</span><br><span class='telnetman_item_viewer_span2'>reload,&nbsp;[confirm?],&nbsp;telnet&nbsp;のような返り値が無くEnter&nbsp;だけで行程が進むもの。</span></td>" +
           "</tr>";
  }
  else if(category === "wait"){
   html += "<tr>" +
           "<td class='left'><span class='telnetman_item_viewer_span2'>コマンド実行前に指定された秒数だけ待機します。</span></td>" +
           "</tr>";
  }
  else if(category === "conft_end"){
   html += "<tr>" +
           "<td class='left'><span class='telnetman_item_viewer_span2'>ログイン情報(exec&nbsp;のページ)&nbsp;の「設定変更モード」で指定したコマンドを前後で実行します。</span></td>" +
           "</tr>";
  }
  else if(category === "command"){
   html += "<tr>" +
           "<td class='left'" + colspan + "><span class='telnetman_item_viewer_span2'>コマンドを実行します。</span><br><span class='telnetman_item_viewer_span2'>複数のコマンドを記入する場合、改行をいくつか置くとログが見やすくなります。</span><br><span class='telnetman_item_viewer_span2'>Enter&nbsp;だけを実行したいときは</span><span class='desc_black'>_BLANK_</span><span class='telnetman_item_viewer_span2'>&nbsp;とだけ記入します。</span></td>" +
           "</tr>" +
           "<tr>" +
           "<td class='right'><span class='telnetman_item_viewer_span1'>1回のみ</span></td>" +
           "<td class='left'><span class='telnetman_item_viewer_span2'>コマンドを1回だけ実行します。</span><br><span class='telnetman_item_viewer_span2'>よくわからない場合はとりあえずこちらを選びます。</span></td>" +
           "</tr>" +
           "<tr>" +
           "<td class='right'><span class='telnetman_item_viewer_span1'>繰り返し</span></td>" +
           "<td class='left'>" + this.telnetmanParameterHtml("$", "*") + "<span class='telnetman_item_viewer_span2'>&nbsp;の数だけコマンドを実行します。</span><br><span class='telnetman_item_viewer_span2'>記入の中に</span>" + this.telnetmanParameterHtml("$", "*") + "<span class='telnetman_item_viewer_span2'>&nbsp;が無くても</span>" + this.telnetmanParameterHtml("$", "*") + "<span class='telnetman_item_viewer_span2'>&nbsp;の数だけ実行します。</span></td>" +
           "</tr>";
  }
  else if(category === "dummy"){
   html += "<tr>" +
           "<td class='left'><span class='telnetman_item_viewer_span2'>コマンド欄に</span><span class='desc_black'>_DUMMY_</span><span class='telnetman_item_viewer_span2'>と書いたときにコマンド返り値をここの記入内容で代用します。</span><br><span class='telnetman_item_viewer_span2'>Telnetman&nbsp;変数をつなぎ合わせて次のaction&nbsp;で評価したいときなどに使います。</span><br><span class='telnetman_item_viewer_span2'>実機へはEnter&nbsp;が実行されます。</span></td>" +
           "</tr>";
  }
  else if(category === "prompt"){
   html += "<tr>" +
           "<td class='left'" + colspan + "><span class='telnetman_item_viewer_span2'>コマンドを実行した後にEnter&nbsp;を複数回実行して確実にプロンプトが返ってきたことを確認します。</span><br><span class='telnetman_item_viewer_span2'>この機能による複数回のEnter&nbsp;はログには反映されません。</span></td>" +
           "</tr>" +
           "<tr>" +
           "<td class='right'><span class='telnetman_item_viewer_span1'>通常型</span></td>" +
           "<td class='left'><span class='telnetman_item_viewer_span2'>次のJUNOS型に当てはまらない場合はこちらを選びます。</span></td>" +
           "</tr>" +
           "<tr>" +
           "<td class='right'><span class='telnetman_item_viewer_span1'>JUNOS型</span></td>" +
           "<td class='left'>" +
            "<span class='telnetman_item_viewer_span2'>機器の挙動が以下のいずれかに当てはまる場合はこれを選びます。</span>" +
            "<ul>" +
            "<li><span class='telnetman_item_viewer_span2'>プロンプトとプロンプトの間に改行1個以外に何か入る</span><br><span class='telnetman_item_viewer_span2'>(何も無いように見えて改行以外の制御コードが入る機器もあります。)</span></li>" +
            "<li><span class='telnetman_item_viewer_span2'>空白を複数入力しても1つしか反映されない</span></li>" +
            "</ul>" +
           "</td>" +
           "</tr>" +
           "<tr>" +
           "<td class='right'><span class='telnetman_item_viewer_span1'>しない</span></td>" +
           "<td class='left'><span class='telnetman_item_viewer_span2'>この機能を使いません。つまり、複数回のEnter&nbsp;を実行しません。</span><br><span class='telnetman_item_viewer_span2'>系統「返り値なし」で登録するようなEnter&nbsp;だけで進んでしまうコマンドではこれを選ぶべきです。</span></td>" +
           "</tr>";
  }
  else if(category === "store"){
   html += "<tr>" +
           "<td class='left'><span class='telnetman_item_viewer_span2'>コマンド返り値を次以降のaction&nbsp;のパターン抽出の対象とするかどうかです。</span><br><span class='telnetman_item_viewer_span2'>つまり、コマンド返り値でOK,&nbsp;NG&nbsp;判定したい場合は溜めます。</span><br><span class='telnetman_item_viewer_span2'>ただ実行したいだけであれば溜めません。不用意に溜めるとOK,&nbsp;NG&nbsp;判定に影響が出ます。</span></td>" +
           "</tr>";
  }
  else if(category === "include"){
   html += "<tr>" +
           "<td class='left'" + colspan + "><span class='telnetman_item_viewer_span2'>コマンド返り値を行単位で選別します。</span><br><span class='telnetman_item_viewer_span2'>対象となった行が次のパターンマッチに進みます。</span><br><span class='telnetman_item_viewer_span2'>この機能を使わない場合は空欄にします。</span></td>" +
           "</tr>" +
           "<tr>" +
           "<td class='right'><span class='telnetman_item_viewer_span1'>begin</span></td>" +
           "<td class='left'><span class='telnetman_item_viewer_span2'>含む行であればその行から全行。</span></td>" +
           "</tr>" +
           "<tr>" +
           "<td class='right'><span class='telnetman_item_viewer_span1'>include</span></td>" +
           "<td class='left'><span class='telnetman_item_viewer_span2'>1つでも含めば対象行。</span></td>" +
           "</tr>" +
           "<tr>" +
           "<td class='right'><span class='telnetman_item_viewer_span1'>exclude</span></td>" +
           "<td class='left'><span class='telnetman_item_viewer_span2'>全て含まない行が対象。</span></td>" +
           "</tr>" +
           "<tr>" +
           "<td class='right'><span class='telnetman_item_viewer_span1'>end</span></td>" +
           "<td class='left'><span class='telnetman_item_viewer_span2'>含む行であればその行まで全行。</span><br><span class='telnetman_item_viewer_span2'>ただし、begin&nbsp;と同じ行にはなりません。</span></td>" +
           "</tr>";
  }
  else if(category === "include_test"){
   html += "<tr>" +
           "<td class='left'><span class='telnetman_item_viewer_span2'>Telnetman&nbsp;変数を値で埋めた状態で記入して下さい。</span></td>" +
           "</tr>";
  }
  else if(category === "pattern"){
   html += "<tr>" +
           "<td class='left'" + colspan + ">" +
            "<span class='telnetman_item_viewer_span2'>コマンド返り値から文字列を抽出してTelnetman&nbsp;変数に入れます。</span>" +
            "<ul>" +
            "<li><span class='telnetman_item_viewer_span2'>1回のみ&nbsp;&nbsp;:&nbsp;</span>" + this.telnetmanParameterHtml("$", "1") + "<span class='desc_grey'>,&nbsp;</span>" + this.telnetmanParameterHtml("$", "2") + "<span class='desc_grey'>,&nbsp;</span>" + this.telnetmanParameterHtml("$", "3") + "<span class='desc_grey'>,&nbsp;&hellip;&nbsp;</span><span class='telnetman_item_viewer_span2'>&nbsp;を初期化して抽出値をこれに入れる。</span></li>" +
            "<li><span class='telnetman_item_viewer_span2'>繰り返し&nbsp;:&nbsp;</span>" + this.telnetmanParameterHtml("$", "*") + "<span class='telnetman_item_viewer_span2'>&nbsp;を初期化して抽出値をこれに入れる。</span></li>" +
            "</ul>" +
            "<span class='telnetman_item_viewer_span2'>以下はよく使う正規表現。</span><span class='desc_comment'>&#x203B;この欄にTelnetman&nbsp;変数は使えません。</span></td>" +
           "</tr>" +
           "<tr>" +
           "<td class='right'><span class='telnetman_item_viewer_span1'>IP&nbsp;Address</span></td>" +
           "<td class='left'><span class='telnetman_item_viewer_span2'>[0-9]{1,3}&yen;.[0-9]{1,3}&yen;.[0-9]{1,3}&yen;.[0-9]{1,3}</span></td>" +
           "</tr>" +
           "<tr>" +
           "<td class='right'><span class='telnetman_item_viewer_span1'>数字</span></td>" +
           "<td class='left'><span class='telnetman_item_viewer_span2'>[0-9]+</span></td>" +
           "</tr>" +
           "<tr>" +
           "<td class='right'><span class='telnetman_item_viewer_span1'>任意の文字列</span></td>" +
           "<td class='left'><span class='telnetman_item_viewer_span2'>.+</span></td>" +
           "</tr>" +
           "<tr>" +
           "<td class='right'><span class='telnetman_item_viewer_span1'>0個以上の空白</span></td>" +
           "<td class='left'><span class='telnetman_item_viewer_span2'>&yen;s*</span></td>" +
           "</tr>" +
           "<tr>" +
           "<td class='right'><span class='telnetman_item_viewer_span1'>1個以上の空白</span></td>" +
           "<td class='left'><span class='telnetman_item_viewer_span2'>&yen;s+</span></td>" +
           "</tr>" +
           "<tr>" +
           "<td class='right'><span class='telnetman_item_viewer_span1'>空白以外の任意の文字列</span></td>" +
           "<td class='left'><span class='telnetman_item_viewer_span2'>[^&yen;s]+</span></td>" +
           "</tr>" +
           "<tr>" +
           "<td class='right'><span class='telnetman_item_viewer_span1'>GigabitEthernet&nbsp;から始まってup&nbsp;で終わる</span><br><span class='telnetman_item_viewer_span1'>行末に空白があるかもしれない</span></td>" +
           "<td class='left'><span class='telnetman_item_viewer_span2'>^GigabitEthernet.+up&yen;s*\$</span></td>" +
           "</tr>" +
           "<tr>" +
           "<td class='right'><span class='telnetman_item_viewer_span1'>1行ずつ</span>" + this.telnetmanParameterHtml("$", "1") + "<span class='desc_grey'>,&nbsp;</span>" + this.telnetmanParameterHtml("$", "2") + "<span class='desc_grey'>,&nbsp;</span>" + this.telnetmanParameterHtml("$", "3") + "<span class='desc_grey'>,&nbsp;&hellip;,&nbsp;</span>" + this.telnetmanParameterHtml("$", "*") + "<span class='telnetman_item_viewer_span1'>&nbsp;に入れたい</span></td>" +
           "<td class='left'><span class='telnetman_item_viewer_span2'>.+&nbsp;とだけ記入</span></td>" +
           "</tr>" +
           "<tr>" +
           "<td class='right'><span class='telnetman_item_viewer_span1'>改行含めて全てを</span>" + this.telnetmanParameterHtml("$", "1") + "<span class='telnetman_item_viewer_span1'>&nbsp;に入れたい</span></td>" +
           "<td class='left'><span class='telnetman_item_viewer_span2'>空欄</span></td>" +
           "</tr>" +
           "<tr>" +
           "<td class='right'><span class='telnetman_item_viewer_span1'>一部を取り出すときは()で囲む</span></td>" +
           "<td class='left'>" +
            "<span class='telnetman_item_viewer_span2'>GigabitEthernet1/0/10&nbsp;221.111.65.3&nbsp;YES&nbsp;NVRAM&nbsp;</span><span class='desc_red'>up</span><span class='telnetman_item_viewer_span2'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;up</span><br>" +
            "<span class='telnetman_item_viewer_span2'>GigabitEthernet1/0/11&nbsp;unassigned&nbsp;&nbsp;&nbsp;YES&nbsp;NVRAM&nbsp;</span><span class='desc_red'>administratively&nbsp;down</span><span class='telnetman_item_viewer_span2'>&nbsp;down</span><br>" +
            "<span class='telnetman_item_viewer_span2'>&darr;</span><br>" +
            "<span class='telnetman_item_viewer_span2'>GigabitEthernet[0-9]+/[0-9]+/[0-9]+&yen;s+[^&yen;s]+&yen;s+[^&yen;s]+&yen;s+[^&yen;s]+&yen;s+<span class='desc_red'>([^&yen;s]+&yen;s*[^&yen;s]+)</span>&yen;s+[^&yen;s]+</span>" +
           "</td>" +
           "<tr>" +
           "<td class='right'><span class='telnetman_item_viewer_span1'>メタ文字</span></td>" +
           "<td class='left'><span class='telnetman_item_viewer_span2'>メタ文字を正規表現としてではなく書いたまま使いたい場合は必ず「&yen;」でエスケープして下さい。</span><br><span class='telnetman_item_viewer_span2'>メタ文字&nbsp;.&nbsp;*&nbsp;+&nbsp;?&nbsp;|&nbsp;[&nbsp;]&nbsp;(&nbsp;)&nbsp;{&nbsp;}&nbsp;^&nbsp;\$&nbsp;&yen;&nbsp;[]内の-</span></td>" +
           "</tr>" +
           "</tr>";
  }
  else if(category === "reg-gen"){
   html += "<tr>" +
           "<td class='left'" + colspan + ">" +
            "<span class='telnetman_item_viewer_span2'>1.&nbsp;正規表現にしたい文字列を入力。</span><br>" +
            "<span class='telnetman_item_viewer_span2'>2.&nbsp;(&nbsp;)&nbsp;で囲みたい部分を選択状態に。</span><br>" +
            "<span class='telnetman_item_viewer_span2'>3.&nbsp;[生成]&nbsp;ボタンを押す。</span><br>" +
            "<span class='telnetman_item_viewer_span2'>&darr;</span><br>" +
            "<span class='telnetman_item_viewer_span2'>いくつか候補が出るので参考にする。</span><br>" +
           "</td>" +
           "</tr>"+
           "<tr>" +
           "<td class='center'" + colspan + ">" +
            "<p><input type='text' spellcheck='false' autocomplete='off' value='' style='width:600px;' id='reg-gen_sample_text'></p>" +
            "<p><button class='enable' onclick='objRegGen.gen();'>生成</button></p>" +
            "<p><textarea spellcheck='false' autocomplete='off' style='width:800px; height:100px;' id='reg-gen_generated_reg'></textarea></p>" +
           "</td>" +
           "</tr>";
  }
  else if(category === "script"){
   html += "<tr>" +
           "<td class='left'" + colspan + "><span class='telnetman_item_viewer_span2'>抽出した文字列を変換し改めて</span>" +this.telnetmanParameterHtml("$", "1") + "<span class='desc_grey'>,&nbsp;</span>" + this.telnetmanParameterHtml("$", "2") + "<span class='desc_grey'>,&nbsp;</span>" + this.telnetmanParameterHtml("$", "3") + "<span class='desc_grey'>,&nbsp;&hellip;,&nbsp;</span>" + this.telnetmanParameterHtml("$", "*") + "<span class='telnetman_item_viewer_span2'>&nbsp;に入れたい時に指定します。</span><br><span class='telnetman_item_viewer_span2'>詳しくは変換スクリプト登録ページで。</span></td>" +
           "</tr>" +
           "<tr>" +
           "<td class='right'><span class='telnetman_item_viewer_span1'>例1</span></td>" +
           "<td class='left'>" +
            "<span class='telnetman_item_viewer_span2'>IOU-L3-1#show&nbsp;clock</span><br>" +
            "<span class='telnetman_item_viewer_span2'>*11:03:23.099&nbsp;JST&nbsp;Thu&nbsp;Feb&nbsp;22&nbsp;2018</span><br>" +
            "<span class='telnetman_item_viewer_span2'>&darr;</span><br>" +
            this.telnetmanParameterHtml("$", "1") + "<span class='telnetman_item_viewer_span2'>&nbsp;:&nbsp;11:03:23.099&nbsp;JST&nbsp;Thu&nbsp;Feb&nbsp;22&nbsp;2018</span><br>" +
            "<span class='telnetman_item_viewer_span2'>&darr;</span><br>" +
            "<span class='telnetman_item_viewer_span2'>変換スクリプト</span><br>" +
            "<span class='telnetman_item_viewer_span2'>&darr;</span><br>" +
            this.telnetmanParameterHtml("$", "1") + "<span class='telnetman_item_viewer_span2'>&nbsp;:&nbsp;20180222</span>" +
           "</td>" +
           "</tr>" +
           "<tr>" +
           "<td class='right'><span class='telnetman_item_viewer_span1'>例2</span></td>" +
           "<td class='left'>" +
            "<span class='telnetman_item_viewer_span2'>IOU-L3-1#show&nbsp;running-config&nbsp;interface&nbsp;Ethernet&nbsp;0/0</span><br>" +
            "<span class='telnetman_item_viewer_span2'>Building&nbsp;configuration...</span><br><br>" +
            "<span class='telnetman_item_viewer_span2'>Current&nbsp;configuration&nbsp;:&nbsp;113&nbsp;bytes</span><br>" +
            "<span class='telnetman_item_viewer_span2'>!</span><br>" +
            "<span class='telnetman_item_viewer_span2'>interface&nbsp;Ethernet0/0</span><br>" +
            "<span class='telnetman_item_viewer_span2'>&nbsp;ip&nbsp;address&nbsp;172.23.0.11&nbsp;255.255.0.0</span><br>" +
            "<span class='telnetman_item_viewer_span2'>end</span><br>" +
            "<span class='telnetman_item_viewer_span2'>&darr;</span><br>" +
            this.telnetmanParameterHtml("$", "1") + "<span class='telnetman_item_viewer_span2'>&nbsp;:&nbsp;172.23.0.11</span><br>" +
            this.telnetmanParameterHtml("$", "2") + "<span class='telnetman_item_viewer_span2'>&nbsp;:&nbsp;255.255.0.0</span><br>" +
            "<span class='telnetman_item_viewer_span2'>&darr;</span><br>" +
            "<span class='telnetman_item_viewer_span2'>変換スクリプト</span><br>" +
            "<span class='telnetman_item_viewer_span2'>&darr;</span><br>" +
            this.telnetmanParameterHtml("$", "1") + "<span class='telnetman_item_viewer_span2'>&nbsp;:&nbsp;172.23.255.254</span>" +
           "</td>" +
           "</tr>" +
           "<td class='right'><span class='telnetman_item_viewer_span1'>例3</span></td>" +
           "<td class='left'>" +
            "<span class='telnetman_item_viewer_span2'>IOU-L3-1#show&nbsp;running-config&nbsp;interface&nbsp;Ethernet&nbsp;0/1</span><br>" +
            "<span class='telnetman_item_viewer_span2'>Building&nbsp;configuration...</span><br><br>" +
            "<span class='telnetman_item_viewer_span2'>Current&nbsp;configuration&nbsp;:&nbsp;104&nbsp;bytes</span><br>" +
            "<span class='telnetman_item_viewer_span2'>!</span><br>" +
            "<span class='telnetman_item_viewer_span2'>interface&nbsp;Ethernet0/1</span><br>" +
            "<span class='telnetman_item_viewer_span2'>&nbsp;switchport&nbsp;trunk&nbsp;allowed&nbsp;vlan&nbsp;80,202,602-605,901</span><br>" +
            "<span class='telnetman_item_viewer_span2'>&nbsp;switchport&nbsp;mode&nbsp;trunk</span><br>" +
            "<span class='telnetman_item_viewer_span2'>end</span><br>" +
            "<span class='telnetman_item_viewer_span2'>&darr;</span><br>" +
            this.telnetmanParameterHtml("$", "*") + "<span class='telnetman_item_viewer_span2'>&nbsp;1個目&nbsp;:&nbsp;80,202,602-605,901</span><br>" +
            "<span class='telnetman_item_viewer_span2'>&darr;</span><br>" +
            "<span class='telnetman_item_viewer_span2'>変換スクリプト</span><br>" +
            "<span class='telnetman_item_viewer_span2'>&darr;</span><br>" +
            this.telnetmanParameterHtml("$", "*") + "<span class='telnetman_item_viewer_span2'>&nbsp;1個目&nbsp;:&nbsp;80</span><br>" +
            this.telnetmanParameterHtml("$", "*") + "<span class='telnetman_item_viewer_span2'>&nbsp;2個目&nbsp;:&nbsp;202</span><br>" +
            this.telnetmanParameterHtml("$", "*") + "<span class='telnetman_item_viewer_span2'>&nbsp;3個目&nbsp;:&nbsp;602</span><br>" +
            this.telnetmanParameterHtml("$", "*") + "<span class='telnetman_item_viewer_span2'>&nbsp;4個目&nbsp;:&nbsp;603</span><br>" +
            this.telnetmanParameterHtml("$", "*") + "<span class='telnetman_item_viewer_span2'>&nbsp;5個目&nbsp;:&nbsp;604</span><br>" +
            this.telnetmanParameterHtml("$", "*") + "<span class='telnetman_item_viewer_span2'>&nbsp;6個目&nbsp;:&nbsp;605</span><br>" +
            this.telnetmanParameterHtml("$", "*") + "<span class='telnetman_item_viewer_span2'>&nbsp;7個目&nbsp;:&nbsp;901</span>" +
           "</td>" +
           "</tr>";
  }
  else if(category === "condition"){
   html += "<tr>" +
           "<td class='left'" + colspan + "><span class='telnetman_item_viewer_span2'>コマンド返り値からの抽出値でOK,&nbsp;NG&nbsp;判定を行います。</span><br><span class='telnetman_item_viewer_span2'>perl&nbsp;の書式で条件式を書きます。</span><br><span class='telnetman_item_viewer_span2'>文字列比較するときは両辺を「&quot;」か「&#39;」で囲みます。</span><br><span class='telnetman_item_viewer_span2'>Telnetman&nbsp;変数の中に「&quot;」が含まれる場合は「&#39;」で、「&#39;」が含まれる場合は「&quot;」で囲って下さい。</span></td>" +
           "</tr>" +
           "<tr>" +
           "<td class='right'><span class='telnetman_item_viewer_span1'>横と縦のつながり</span></td>" +
           "<td class='left'><span class='telnetman_item_viewer_span2'>横&nbsp;:&nbsp;and</span><br><span class='telnetman_item_viewer_span2'>縦&nbsp;:&nbsp;or</span></td>" +
           "</tr>" +
           "<tr>" +
           "<td class='right'><span class='telnetman_item_viewer_span1'>例</span></td>" +
           "<td class='left'>" +
            this.telnetmanParameterHtml("$", "1") +
            "<span class='telnetman_item_viewer_span2'>&nbsp;&gt;&nbsp;1000&nbsp;</span>" +
            "<span class='desc_comment'>and</span>" +
            "<span class='desc_green'>&nbsp;</span>" +
            this.telnetmanParameterHtml("$", "1") +
            "<span class='telnetman_item_viewer_span2'>&nbsp;&lt;=&nbsp;2000&nbsp;</span>" +
            "<span class='desc_comment'>and</span>" +
            "<span class='telnetman_item_viewer_span2'>&nbsp;&quot;</span>" +
            this.telnetmanParameterHtml("$", "2") +
            "<span class='telnetman_item_viewer_span2'>&quot;&nbsp;eq&nbsp;&quot;</span>" +
            this.telnetmanParameterAHtml("description") +
            "<span class='telnetman_item_viewer_span2'>&quot;</span>" +
            "<br>" +
            "<span class='desc_comment'>or</span>" +
            "<br>" +
            this.telnetmanParameterHtml("$", "1") +
            "<span class='telnetman_item_viewer_span2'>&nbsp;==&nbsp;3000&nbsp;</span>" +
            "<span class='desc_comment'>and</span>" +
            "<span class='telnetman_item_viewer_span2'>&nbsp;&quot;</span>" +
            this.telnetmanParameterHtml("$", "2") +
            "<span class='telnetman_item_viewer_span2'>&quot;&nbsp;eq&nbsp;&quot;</span>" +
            this.telnetmanParameterAHtml("description") +
            "<span class='telnetman_item_viewer_span2'>&quot;</span>" +
            "<br>" +
            "<span class='desc_comment'>or</span>" +
            "<br>" +
            "<span class='telnetman_item_viewer_span2'>&quot;</span>" +
            this.telnetmanParameterHtml("$", "3") +
            "<span class='telnetman_item_viewer_span2'>&quot;&nbsp;eq&nbsp;&quot;shutdown&quot;</span>" +
           "</td>" +
           "</tr>" +
           "<tr>" +
           "<td class='right'><span class='telnetman_item_viewer_span1'>演算子</span></td>" +
           "<td class='left'>" +
             "<ul>" +
             "<li><span class='telnetman_item_viewer_span2'>等しい(数値)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:&nbsp;==</span></li>" +
             "<li><span class='telnetman_item_viewer_span2'>等しくない(数値)&nbsp;&nbsp;&nbsp;&nbsp;:&nbsp;!=</span></li>" +
             "<li><span class='telnetman_item_viewer_span2'>大きい(数値)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:&nbsp;&gt;,&nbsp;&gt;=</span></li>" +
             "<li><span class='telnetman_item_viewer_span2'>小さい(数値)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:&nbsp;&lt;,&nbsp;&lt;=</span></li>" +
             "<li><span class='telnetman_item_viewer_span2'>等しい(文字列)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:&nbsp;eq</span></li>" +
             "<li><span class='telnetman_item_viewer_span2'>等しくない(文字列)&nbsp;:&nbsp;ne</span></li>" +
             "</ul>" +
           "</td>" +
           "</tr>" +
           "<tr>" +
           "<td class='right'><span class='desc_red'>!</span></td>" +
           "<td class='left'><span class='telnetman_item_viewer_span2'>チェックすると条件式全体の真偽結果を反転させます。</span></td>" +
           "</tr>" +
           "<tr>" +
           "<td class='right'><span class='telnetman_item_viewer_span1'>空欄の場合</span></td>" +
           "<td class='left'><span class='telnetman_item_viewer_span2'>何もせずに次の個数条件に進みます。</span></td>" +
           "</tr>" +
           "<tr>" +
           "<td class='right'><span class='telnetman_item_viewer_span1'>抽出数が0&nbsp;のとき</span></td>" +
           "<td class='left'><span class='telnetman_item_viewer_span2'>何もせずに次の個数条件に進みます。</span></td>" +
           "</tr>" +
           "<tr>" +
           "<td class='right'><span class='telnetman_item_viewer_span1'>1回のみ</span></td>" +
           "<td class='left'>" +
            "<span class='telnetman_item_viewer_span2'>条件式で真偽判定&nbsp;&rarr;&nbsp;偽&nbsp;&rarr;&nbsp;NG</span><br>" +
            "<span class='telnetman_item_viewer_span2'>&darr;</span><br>" +
            "<span class='telnetman_item_viewer_span2'>真</span><br>" +
            "<span class='telnetman_item_viewer_span2'>&darr;</span><br>" +
            "<span class='telnetman_item_viewer_span2'>次の個数条件でOK,&nbsp;NG&nbsp;判定</span>" +
           "</td>" +
           "</tr>" +
           "<tr>" +
           "<td class='right'><span class='telnetman_item_viewer_span1'>繰り返し</span></td>" +
           "<td class='left'>" +
            "<span class='telnetman_item_viewer_span2'>条件式で真となるもののみを" + this.telnetmanParameterHtml("$", "*") + "&nbsp;に入れ直し</span><br>" +
            "<span class='telnetman_item_viewer_span2'>&darr;</span><br>" +
            "<span class='telnetman_item_viewer_span2'>次の個数条件でOK,&nbsp;NG&nbsp;判定</span>" +
           "</td>" +
           "</tr>" +
           "<tr>" +
           "<td class='right'><span class='telnetman_item_viewer_span1'>個数条件</span></td>" +
           "<td class='left'><span class='telnetman_item_viewer_span2'>条件式通過後の</span>" + this.telnetmanParameterHtml("$", "1") + "<span class='desc_grey'>,&nbsp;</span>" + this.telnetmanParameterHtml("$", "2") + "<span class='desc_grey'>,&nbsp;</span>" + this.telnetmanParameterHtml("$", "3") + "<span class='desc_grey'>,&nbsp;&hellip;,&nbsp;</span>" + this.telnetmanParameterHtml("$", "*") + "<span class='telnetman_item_viewer_span2'>&nbsp;の数でOK,&nbsp;NG&nbsp;判定をします。</span></td>" +
           "</tr>";
  }
  else if(category === "NG_message"){
   html += "<tr>" +
           "<td class='left'><span class='telnetman_item_viewer_span2'>NG&nbsp;だった時にメッセージをログの最後に追記します。</span></td>" +
           "</tr>" +
           "<tr>";
  }
  else if(category === "parameter_sheet_A"){
   html += "<tr>" +
           "<td class='left'" + colspan + "><span class='telnetman_item_viewer_span2'>OK&nbsp;だった時にパラメーターシートを編集します。</span><span class='desc_black'>A行</span><span class='telnetman_item_viewer_span2'>(B列が空の行)を編集します。</span><br><span class='telnetman_item_viewer_span2'>以下は記入例と編集箇所の位置関係です。</span><br>" + this.telnetmanParameterAHtml("new hostname") + "<span class='telnetman_item_viewer_span2'>&nbsp;で参照される値が</span>" + this.telnetmanParameterHtml("$", "1") + "<span class='telnetman_item_viewer_span2'>&nbsp;の値に上書きされます。</span></td>" +
           "</tr>" +
           "<tr>" +
           "<td class='left'" + colspan + ">" +
            "<p><input type='text' spellcheck='false' readonly value='{\$node}' style='width:100px; border : 3px solid #ff0000;'>&nbsp;&rarr;&nbsp;<input type='text' spellcheck='false' readonly value='new hostname' style='width:100px; border : 3px solid #3f48cc;'>&nbsp;=&nbsp;<input type='text' spellcheck='false' readonly value='{\$1}' style='width:100px; border : 3px solid #ff7f27;'></p>" +
            "<p><img src='img/help/help_parameter_sheet_A.png' width='604' height='212' alt='追加パラメーターシートA'></p>" +
           "</td>" +
           "</tr>";

   html += this.commonAdditionalParameterSheetDescription();
  }
  else if(category === "parameter_sheet_B"){
   html += "<tr>" +
           "<td class='left'" + colspan + ">" +
            "<span class='telnetman_item_viewer_span2'>OK&nbsp;だった時にパラメーターシートを編集します。</span><span class='desc_black'>B行</span><span class='telnetman_item_viewer_span2'>(B列に記入がある行)を編集します。</span><br>" +
            "<span class='telnetman_item_viewer_span2'>以下は記入例と編集箇所の位置関係です。</span><br>" +
            this.telnetmanParameterBHtml("GigabitEthernet1", "description") + "<br>" +
            this.telnetmanParameterBHtml("GigabitEthernet6", "description") + "<br>" +
            this.telnetmanParameterBHtml("*", "description") + "<br>" +
            "<span class='desc_green'>{</span>" + this.telnetmanParameterHtml("$", "B") + "<span class='desc_black'>:</span><span class='desc_grey'>description</span><span class='desc_green'>}</span><br>" +
            "<span class='telnetman_item_viewer_span2'>で参照される値が「</span><span class='desc_black'>telnetman&nbsp;</span>" + this.telnetmanParameterHtml("$", "1") + "<span class='telnetman_item_viewer_span2'>」の値に上書きされます。</span>" +
           "</td>" +
           "</tr>" +
           "<tr>" +
           "<td class='left'" + colspan + ">" +
            "<p><input type='text' spellcheck='false' readonly value='{\$node}' style='width:100px; border : 3px solid #ff0000;'>&nbsp;&rarr;&nbsp;<input type='text' spellcheck='false' readonly value='{\$B}' style='width:100px; border : 3px solid #22b14c;'>&nbsp;&rarr;&nbsp;<input type='text' spellcheck='false' readonly value='description' style='width:100px; border : 3px solid #3f48cc;'>&nbsp;=&nbsp;<input type='text' spellcheck='false' readonly value='telnetman {\$1}' style='width:100px; border : 3px solid #ff7f27;'></p>" +
            "<p><img src='img/help/help_parameter_sheet_B.png' width='604' height='212' alt='追加パラメーターシートB'></p>" +
           "</td>" +
           "</tr>";

   html += this.commonAdditionalParameterSheetDescription();
  }
  else if(category === "destroy"){
   html += "<tr>" +
           "<td class='left'" + colspan + "><span class='telnetman_item_viewer_span2'>パターン抽出に使ったコマンド返り値をどうするかです。</span></td>" +
           "</tr>" +
           "<tr>" +
           "<td class='right'><span class='telnetman_item_viewer_span1'>破棄する</span></td>" +
           "<td class='left'><span class='telnetman_item_viewer_span2'>空にします。通常はこちらを選びます。</span></td>" +
           "</tr>" +
           "<tr>" +
           "<td class='right'><span class='telnetman_item_viewer_span1'>保持する</span></td>" +
           "<td class='left'><span class='telnetman_item_viewer_span2'>次以降のaction&nbsp;でも同じコマンド返り値を使えます。</span><br><span class='telnetman_item_viewer_span2'>次以降でコマンド返り値を溜めると追記されます。</span></td>" +
           "</tr>";
  }
  else if(category === "ping_target"){
   html += "<tr>" +
           "<td class='left'><span class='telnetman_item_viewer_span2'>ping&nbsp;対象のIP&nbsp;Address&nbsp;を記入します。</span><br><span class='telnetman_item_viewer_span2'>1行に1対象となるように記入します。</span><br><span class='telnetman_item_viewer_span2'>対象数が0&nbsp;の場合は何もせずにOK&nbsp;扱いとなります。</span><br><span class='telnetman_item_viewer_span2'>ping&nbsp;は対象機器からではなくTelnetman&nbsp;サーバーから行います。</span></td>" +
           "</tr>";
  }
  else if(category === "telnetman_script"){
   html += "<tr>" +
           "<td class='left'>" +
            "<p>" +
            this.telnetmanParameterHtml("$", "1") + "<span class='desc_grey'>,&nbsp;</span>" + this.telnetmanParameterHtml("$", "2") + "<span class='desc_grey'>,&nbsp;</span>" + this.telnetmanParameterHtml("$", "3") + "<span class='desc_grey'>,&nbsp;&hellip;&nbsp;</span>" + this.telnetmanParameterHtml("$", "*") + "<span class='telnetman_item_viewer_span2'>&nbsp;を入力し、</span><br>" +
            "<span class='telnetman_item_viewer_span2'>出力を改めて</span>" + this.telnetmanParameterHtml("$", "1") + "<span class='desc_grey'>,&nbsp;</span>" + this.telnetmanParameterHtml("$", "2") + "<span class='desc_grey'>,&nbsp;</span>" + this.telnetmanParameterHtml("$", "3") + "<span class='desc_grey'>,&nbsp;&hellip;&nbsp;</span>" + this.telnetmanParameterHtml("$", "*") + "<span class='telnetman_item_viewer_span2'>&nbsp;とします。</span><br>" +
            "<span class='telnetman_item_viewer_span2'>以下はスクリプトの作成ルールです。</span>" +
            "</p>" +
            "<ul>" +
            "<li>言語:perl</li>" +
            "<li>文字コード:UTF-8N&nbsp;改行コード:LF</li>" +
            "<li>パッケージ名:Telnetman_script_任意の半角文字列</li>" +
            "<li>ファイル名:パッケージ名.pl</li>" +
            "<li>use&nbsp;strict;&nbsp;は必須</li>" +
            "<li>「convert」というサブルーチンを定義し<br>それがTelentman&nbsp;変数の入出力を行う</li>" +
            "<li>convert&nbsp;以外のサブルーチンは任意</li>" +
            "<li>入力値と出力値の数は同数でなくて良い</li>" +
            "<li>正しい値を返せない場合はundef&nbsp;をreturn</li>" +
            "<li>システムコマンドは実行しない</li>" +
            "<li>末行の「1;」を忘れない</li>" +
            "</ul>" +
           "</td>" +
           "<td class='left'>" +
           "<p><span class='telnetman_item_viewer_span1'>テンプレート</span></p>" +
           "<p><textarea spellcheck='false' style='width:380px; height:520px;' readonly>" + this.telnetmanScriptTemplate + "</textarea></p>" +
           "</td>" +
           "</tr>";
  }
  else if(category === "export"){
   html += "<tr>" +
           "<td class='left'>" +
           "<span class='telnetman_item_viewer_span2'>command,&nbsp;action,&nbsp;ping&nbsp;の内容をテキストで出力します。</span><br>" +
           "<span class='telnetman_item_viewer_span2'>バックアップや別のTelnetman&nbsp;にデータ移動させるときに使います。</span><br>" +
           "<span class='telnetman_item_viewer_span2'>検索キーワードの接頭語を作業毎に統一すると1回で全て抽出できます。</span><br>" +
           "<span class='telnetman_item_viewer_span2'>タイトル、検索キーワードが未記入の場合は現在の流れ図にあるものが対象となります。</span>" +
           "</td>" +
           "</tr>";
  }
  else if(category === "import"){
   html += "<tr>" +
           "<td class='left'>" +
           "<span class='telnetman_item_viewer_span2'>Export&nbsp;機能で抽出したデータを取り込みます。</span><br>" +
           "<span class='telnetman_item_viewer_span2'>「更新&nbsp;完了」「新規登録&nbsp;完了」以外のメッセージが出た場合はImport&nbsp;失敗です。</span>" +
           "</td>" +
           "</tr>";
  }
  else if(category === "flowchart_search"){
   html += "<tr>" +
           "<td class='right'><span class='telnetman_item_viewer_span1'>add</span></td>" +
           "<td class='left'><span class='telnetman_item_viewer_span2'>検索結果を一覧に加えます。</span></td>" +
           "</tr>" +
           "<tr>" +
           "<td class='right'><span class='telnetman_item_viewer_span1'>reset</span></td>" +
           "<td class='left'><span class='telnetman_item_viewer_span2'>流れ図に無いアイテムを一覧から削除します。</span><br><span class='telnetman_item_viewer_span2'>つまり、最初にこのページを開いた状態にします。</span></td>" +
           "</tr>" +
           "<tr>" +
           "<td class='right'><span class='telnetman_item_viewer_span1'>clear</span></td>" +
           "<td class='left'><span class='telnetman_item_viewer_span2'>流れ図も検索結果も空にします。</span></td>" +
           "</tr>";
  }
  else if(category === "jumper"){
   html += "<tr>" +
           "<td class='left'" + colspan + ">" +
            "<p><span class='telnetman_item_viewer_span2'>以下のように&nbsp;</span><span class='desc_blue'>&#9675;</span><span class='telnetman_item_viewer_span2'>&nbsp;は通りますが&nbsp;</span><span class='desc_red'>&#10005;</span><span class='telnetman_item_viewer_span2'>&nbsp;は通りません。そこで終了です。</span></p>" +
            "<p><img src='img/help/jumper_help.png' width='432' height='164' alt='矢印 通る 通らない'></p>" +
           "</td>" +
           "</tr>" +
           "<tr>" +
           "<td class='right'><img src='img/jumper_5.png' width='96' height='72' alt='right_down OK'></td>" +
           "<td class='left'><span class='telnetman_item_viewer_span2'>ステータスをOK&nbsp;に変えます。</span><br><span class='telnetman_item_viewer_span2'>繰り返し型メインルーチン、サブルーチンで使う機会が多いです。</span></td>" +
           "</tr>" +
           "<tr>" +
           "<td class='right'><img src='img/jumper_6.png' width='96' height='72' alt='right_down NG'></td>" +
           "<td class='left'>" +
            "<span class='telnetman_item_viewer_span2'>ステータスNG&nbsp;の状態でこの矢印を通ると</span><br>" +
            "<span class='telnetman_item_viewer_span2'>以降の動作はステータスOK&nbsp;のときと同じになりますが</span><br>" +
            "<span class='telnetman_item_viewer_span2'>終了ステータスが「NG&nbsp;強制続行」になります。</span><br>" +
            "<span class='telnetman_item_viewer_span2'>ただし、この矢印以降でNG&nbsp;、Error&nbsp;となった場合は</span><br>" +
            "<span class='telnetman_item_viewer_span2'>終了ステータスは「NG&nbsp;終了」「Error&nbsp;終了」となります。</span>" +
           "</td>" +
           "</tr>";
  }
  else if(category === "flowchart_defore_middle_after"){
   html += "<tr>" +
           "<td class='left'" + colspan + ">" +
            "<span class='telnetman_item_viewer_span2'>最大3つまで流れ図を定義できます。</span><br>" +
            "<span class='telnetman_item_viewer_span2'>真ん中の流れ図のメインルーチンのタイトルがセッションタイトルになります。</span><br>" +
            "<span class='telnetman_item_viewer_span2'>各流れ図の終了時にTelnetman&nbsp;変数や溜まっているコマンド返り値は初期化されます。</span><br>" +
            "<span class='telnetman_item_viewer_span2'>追記、編集したパラメーターシートは引き継がれます。</span><br>" +
           "</td>" +
           "</tr>";
  }
  else if(category === "flowchart_routine_type"){
   html += "<tr>" +
           "<td class='right'><span class='telnetman_item_viewer_span1'>繰り返し</span><br><span class='telnetman_item_viewer_span1'>メインルーチン</span></td>" +
           "<td class='left'>" +
            "<p><span class='telnetman_item_viewer_span2'>パラメーターシートのB列の値の数だけ繰り返します。</span><br><span class='telnetman_item_viewer_span2'>以下の例では</span>" + this.telnetmanParameterHtml("$", "node") + "<span class='desc_grey'>&nbsp;=&nbsp;<span class='desc_black'>172.23.0.101</span><span class='telnetman_item_viewer_span2'>&nbsp;において</span></p>" +
            "<ul>" +
            "<li><span class='telnetman_item_viewer_span2'>1週目&nbsp;:&nbsp;</span>" + this.telnetmanParameterHtml("$", "B") + "<span class='desc_grey'>&nbsp;=&nbsp;</span><span class='desc_black'>GigabitEthernet1</span><span class='telnetman_item_viewer_span2'>,&nbsp;</span><span class='desc_green'>{</span>" + this.telnetmanParameterHtml("$", "B") + "<span class='desc_black'>:</span><span class='desc_grey'>description</span><span class='desc_green'>}</span><span class='telnetman_item_viewer_span2'><span class='desc_grey'>&nbsp;=&nbsp;</span><span class='desc_black'>SW1&nbsp;Gi1/0</span></li>" +
            "<li><span class='telnetman_item_viewer_span2'>2週目&nbsp;:&nbsp;</span>" + this.telnetmanParameterHtml("$", "B") + "<span class='desc_grey'>&nbsp;=&nbsp;</span><span class='desc_black'>GigabitEthernet6</span><span class='telnetman_item_viewer_span2'>,&nbsp;</span><span class='desc_green'>{</span>" + this.telnetmanParameterHtml("$", "B") + "<span class='desc_black'>:</span><span class='desc_grey'>description</span><span class='desc_green'>}</span><span class='telnetman_item_viewer_span2'><span class='desc_grey'>&nbsp;=&nbsp;</span><span class='desc_black'>CSR1000v-02&nbsp;Gi6</span></li>" +
            "</ul>" +
            "<p><img src='img/help/help_parameter_sheet_repeat.png' width='604' hight='212' alt='パラメーターシート'></p>" +
            "<p><span class='desc_comment'>&#x203B;[逆順]にチェックを入れると繰り返し順が逆になります。</span></p>" +
           "</td>" +
           "</tr>" +
           "<tr>" +
           "<td class='right'><span class='telnetman_item_viewer_span1'>1回のみ</span><br><span class='telnetman_item_viewer_span1'>サブルーチン</span></td>" +
           "<td class='left'>" +
            "<p>" +
             "<span class='telnetman_item_viewer_span2'>メインルーチンの</span>" + this.telnetmanParameterHtml("$", "1") + "<span class='desc_grey'>,&nbsp;</span>" + this.telnetmanParameterHtml("$", "2") + "<span class='desc_grey'>,&nbsp;</span>" + this.telnetmanParameterHtml("$", "3") + "<span class='desc_grey'>,&nbsp;&hellip;&nbsp;</span><span class='telnetman_item_viewer_span2'>を</span>" + this.telnetmanParameterHtml("#", "1") + "<span class='desc_grey'>,&nbsp;</span>" + this.telnetmanParameterHtml("#", "2") + "<span class='desc_grey'>,&nbsp;</span>" + this.telnetmanParameterHtml("#", "3") + "<span class='desc_grey'>,&nbsp;&hellip;</span><span class='telnetman_item_viewer_span2'>&nbsp;で参照できます。</span><br>" +
             "<span class='telnetman_item_viewer_span2'>サブルーチン内であればどこでも使えます。</span><br>" +
             "<span class='telnetman_item_viewer_span2'>メインルーチンの</span>" + this.telnetmanParameterHtml("$", "*") + "<span class='telnetman_item_viewer_span2'>&nbsp;や</span><br>" +
             "<span class='telnetman_item_viewer_span2'>サブルーチン内の</span>" + this.telnetmanParameterHtml("$", "1") + "<span class='desc_grey'>,&nbsp;</span>" + this.telnetmanParameterHtml("$", "2") + "<span class='desc_grey'>,&nbsp;</span>" + this.telnetmanParameterHtml("$", "3") + "<span class='desc_grey'>,&nbsp;&hellip;&nbsp;</span>" + this.telnetmanParameterHtml("$", "*") + "<span class='telnetman_item_viewer_span2'>&nbsp;とは関係ありません。</span>" +
            "</p>" +
            "<p><img src='img/help/description_subroutine1.png' width='248' hight='236' alt='サブルーチン 1回のみ'></p>" +
            "<p><span class='desc_comment'>&#x203B;サブルーチンの中にサブルーチンを置くことはできません。</span></p>" +
           "</td>" +
           "</tr>" +
           "<tr>" +
           "<td class='right'><span class='telnetman_item_viewer_span1'>繰り返し</span><br><span class='telnetman_item_viewer_span1'>サブルーチン</span></td>" +
           "<td class='left'>" +
            "<p>" +
             "<span class='telnetman_item_viewer_span2'>メインルーチンの</span>" + this.telnetmanParameterHtml("$", "*") + "<span class='telnetman_item_viewer_span2'>&nbsp;を</span>" + this.telnetmanParameterHtml("#", "*") + "<span class='telnetman_item_viewer_span2'>&nbsp;で参照できます。</span><br>" +
             "<span class='telnetman_item_viewer_span2'>つまり、</span>" + this.telnetmanParameterHtml("$", "*") + "<span class='telnetman_item_viewer_span2'>&nbsp;の数だけ繰り返します。</span>" + this.telnetmanParameterHtml("#", "*") + "<span class='telnetman_item_viewer_span2'>の記入が無くても繰り返します。</span><br>" +
             "<span class='telnetman_item_viewer_span2'>メインルーチンの</span>" + this.telnetmanParameterHtml("$", "1") + "<span class='desc_grey'>,&nbsp;</span>" + this.telnetmanParameterHtml("$", "2") + "<span class='desc_grey'>,&nbsp;</span>" + this.telnetmanParameterHtml("$", "3") + "<span class='desc_grey'>,&nbsp;&hellip;&nbsp;</span><span class='telnetman_item_viewer_span2'>や</span><br>" +
             "<span class='telnetman_item_viewer_span2'>サブルーチン内の</span>" + this.telnetmanParameterHtml("$", "1") + "<span class='desc_grey'>,&nbsp;</span>" + this.telnetmanParameterHtml("$", "2") + "<span class='desc_grey'>,&nbsp;</span>" + this.telnetmanParameterHtml("$", "3") + "<span class='desc_grey'>,&nbsp;&hellip;&nbsp;</span>" + this.telnetmanParameterHtml("$", "*") + "<span class='telnetman_item_viewer_span2'>&nbsp;とは関係ありません。</span>" +
            "</p>" +
            "<p><img src='img/help/description_subroutine2.png' width='248' hight='236' alt='サブルーチン 1回のみ'></p>" +
            "<p>" +
             "<span class='desc_comment'>&#x203B;サブルーチンの中にサブルーチンを置くことはできません。</span><br>" +
             "<span class='desc_comment'>&#x203B;[逆順]にチェックを入れると繰り返し順が逆になります。</span>" +
            "<p>" +
           "</td>" +
           "</tr>";
  }
  else if(category === "pause_button"){
   html += "<tr>" +
           "<td class='right'><span class='telnetman_item_viewer_span1'>一時停止</span></td>" +
           "<td class='left'><span class='telnetman_item_viewer_span2'>telnet&nbsp;実行待ち(queue&nbsp;に入った状態)のノードをtelnet&nbsp;対象から外します。</span><br><span class='telnetman_item_viewer_span2'>後からtelnet&nbsp;対象にできます。</span><br><span class='telnetman_item_viewer_span2'>telnet&nbsp;開始したノードは止められません。</span></td>" +
           "</tr>" +
           "<tr>" +
           "<td class='right'><span class='telnetman_item_viewer_span1'>強制終了</span></td>" +
           "<td class='left'><span class='telnetman_item_viewer_span2'>一時停止状態およびtelnet&nbsp;実行待ちのノードをtelnet&nbsp;対象から外し終了します。</span></td>" +
           "</tr>" +
           "<tr>" +
           "<td class='right'><span class='telnetman_item_viewer_span1'>自動一時停止</span></td>" +
           "<td class='left'><span class='telnetman_item_viewer_span2'>NG&nbsp;終了、または、Error&nbsp;終了したノード発生したら一次停止が発動します。</span></td>" +
           "</tr>";
  }
  else if(category === "parameter_sheet"){
   html += "<tr>" +
           "<td class='left'" + colspan + "><img src='img/help/parametersheet_description.png' width='756' height='260' alt='パラメーターシート'></td>" +
           "</tr>" +
           "<tr>" +
           "<td class='right'><span class='telnetman_item_viewer_span1'>1行目</span></td>" +
           "<td class='left'><span class='desc_black'>変数名定義行</span><span class='telnetman_item_viewer_span2'>と称します。変数名を書きます。必ず1行目に書きます。</span><br><span class='telnetman_item_viewer_span2'>変数名に使えない文字&nbsp;{&nbsp;}&nbsp;\$&nbsp;#&nbsp;*&nbsp;:&nbsp;全角文字&nbsp;空白のみ</span></td>" +
           "</tr>" +
           "<tr>" +
           "<td class='right'><span class='telnetman_item_viewer_span1'>A列</span></td>" +
           "<td class='left'><span class='telnetman_item_viewer_span2'>telnet&nbsp;対象ノードのIP&nbsp;Address&nbsp;を記入します。必ずA列に書きます。</span><br>" + this.telnetmanParameterHtml("$", "node") + "<span class='telnetman_item_viewer_span2'>&nbsp;で値を参照できます。</span></td>" +
           "</tr>" +
           "<tr>" +
           "<td class='right'><span class='telnetman_item_viewer_span1'>B列</span></td>" +
           "<td class='left'><span class='telnetman_item_viewer_span2'>何を書くかは任意です。メインルーチンが繰り返し型のときB列の値の数だけ繰り返します。</span><br>" + this.telnetmanParameterHtml("$", "B") + "<span class='telnetman_item_viewer_span2'>&nbsp;で値を参照できます。</span></td>" +
           "</tr>" +
           "<tr>" +
           "<td class='right'><span class='telnetman_item_viewer_span1'>C列以降</span></td>" +
           "<td class='left'><span class='telnetman_item_viewer_span2'>順不同です。任意の変数名と値を定義して下さい。</span></td>" +
           "</tr>" +
           "<tr>" +
           "<td class='right'><span class='telnetman_item_viewer_span1'>A行</span></td>" +
           "<td class='left'><span class='telnetman_item_viewer_span2'>B列に値が無い行を</span><span class='desc_black'>A行</span><span class='telnetman_item_viewer_span2'>と称します。各ノード1行だけ必須です。</span><br><span class='telnetman_item_viewer_span2'>下記の</span><span class='desc_black'>B行</span><span class='telnetman_item_viewer_span2'>しか無いノードはtelnet&nbsp;対象にはなりません。</span><br><span class='telnetman_item_viewer_span2'>A列の値が同じ</span><span class='desc_black'>A行</span><span class='telnetman_item_viewer_span2'>が複数ある場合は下にある行が優先されます。</span><br><span class='telnetman_item_viewer_span2'>下記の</span><span class='desc_black'>B行</span><span class='telnetman_item_viewer_span2'>含め順不同です。</span><br><span class='telnetman_item_viewer_span2'>値の参照例)&nbsp;</span>" + this.telnetmanParameterAHtml("hostname") + "<span class='desc_grey'>&nbsp;</span>" + this.telnetmanParameterAHtml("new hostname") + "</td>" +
           "</tr>" +
           "<tr>" +
           "<td class='right'><span class='telnetman_item_viewer_span1'>B行</span></td>" +
           "<td class='left'><span class='telnetman_item_viewer_span2'>B列に値が入っている行を</span><span class='desc_black'>B行</span><span class='telnetman_item_viewer_span2'>と称します。任意です。</span><br><span class='telnetman_item_viewer_span2'>A列の値とB列の値が同じ</span><span class='desc_black'>B行</span><span class='telnetman_item_viewer_span2'>が複数ある場合は下にある行が優先されます。</span><br><span class='telnetman_item_viewer_span2'>上記の</span><span class='desc_black'>A行</span><span class='telnetman_item_viewer_span2'>含め順不同です。</span><br><span class='telnetman_item_viewer_span2'>値の参照例)&nbsp;</span>" + this.telnetmanParameterBHtml("GigabitEthetnet1", "description") + "<span class='desc_grey'>&nbsp;</span>" + this.telnetmanParameterBHtml("*", "description") + "<span class='desc_grey'>&nbsp;</span><span class='desc_green'>{</span>" + this.telnetmanParameterHtml("$", "B") + "<span class='desc_black'>:</span><span class='desc_grey'>description</span><span class='desc_green'>}</span></td>" +
           "</tr>" +
           "<tr>" +
           "<td class='right'><span class='telnetman_item_viewer_span1'>空欄</span></td>" +
           "<td class='left'><span class='telnetman_item_viewer_span2'>空欄は未定義扱いになります。</span><br><span class='telnetman_item_viewer_span2'>空文字を定義したいときは</span><span class='desc_black'>_BLANK_</span><span class='telnetman_item_viewer_span2'>&nbsp;と記入します。</span><br><span class='telnetman_item_viewer_span2'>改行は</span><span class='desc_black'>_LF_</span><span class='telnetman_item_viewer_span2'>&nbsp;と記入します。</span></td>" +
           "</tr>";
  }
  else if(category === "login_info"){
   html += "<tr>" +
           "<td class='right'><span class='telnetman_item_viewer_span1'>必須項目</span></td>" +
           "<td class='left'><span class='telnetman_item_viewer_span2'>タイムアウト&nbsp;プロンプト&nbsp;ユーザー名&nbsp;パスワード</span></td>" +
           "</tr>" +
           "<tr>" +
           "<td class='right'><span class='telnetman_item_viewer_span1'>プロンプト</span></td>" +
           "<td class='left'><span class='telnetman_item_viewer_span2'>プロンプトの文字列を正規表現で指定します。</span><br><span class='telnetman_item_viewer_span2'>先頭を表す「^」は使えません。</span><br><span class='telnetman_item_viewer_span2'>行末を表す「\$」は必須です。</span></td>" +
           "</tr>" +
           "<tr>" +
           "<td class='right'><span class='telnetman_item_viewer_span1'>特権モード</span><br><span class='telnetman_item_viewer_span1'>行数無制限コマンド</span><br><span class='telnetman_item_viewer_span1'>行幅無制限コマンド</span></td>" +
           "<td class='left'><span class='telnetman_item_viewer_span2'>記入するとログイン直後にこのコマンドを実行します。</span></td>" +
           "</tr>" +
           "<tr>" +
           "<td class='right'><span class='telnetman_item_viewer_span1'>More&nbsp;と次のページへ</span></td>" +
           "<td class='left'><span class='telnetman_item_viewer_span2'>コマンド返り値の表示に行数制限がある場合は記入します。</span><br><span class='telnetman_item_viewer_span2'>表示が一時停止したことを示す文字列を1つ目の入力欄に、</span><br><span class='telnetman_item_viewer_span2'>次の表示に送るために押すキーを2つ目の入力欄に記入します。</span><br><span class='telnetman_item_viewer_span2'>Enter&nbsp;で次の表示に送る場合は2つ目の入力欄を空欄にします。</span></td>" +
           "</tr>" +
           "<tr>" +
           "<td class='right'><span class='telnetman_item_viewer_span1'>設定変更モード</span></td>" +
           "<td class='left'><span class='telnetman_item_viewer_span2'>設定変更モードに移行するためのコマンドがある場合は記入します。</span></td>" +
           "</tr>" +
           "<tr>" +
           "<td class='right'><span class='telnetman_item_viewer_span1'>ログアウト</span></td>" +
           "<td class='left'><span class='telnetman_item_viewer_span2'>ログアウトするためのコマンドを記入します。</span></td>" +
           "</tr>";
  }
  else if(category === "syslog_info"){
   html += "<tr>" +
           "<td class='left'" + colspan + ">" +
            "<span class='telnetman_item_viewer_span2'>syslog&nbsp;を表示させ、問題有るsyslog&nbsp;であればError&nbsp;終了させるための設定です。</span><br>" +
            "<span class='telnetman_item_viewer_span2'>必要無ければ空欄にします。</span><br>" +
            "<span class='telnetman_item_viewer_span2'>syslog&nbsp;はそれが発生する事象が起きてから表示されるまで数秒以上時間がかかります。</span><br>" +
            "<span class='telnetman_item_viewer_span2'>人が手でコマンドを実行してその返り値に問題無いか確認する場合は</span><br>" +
            "<span class='telnetman_item_viewer_span2'>十分に時間がかかりsyslog&nbsp;を確認するタイミングに問題はありませんが、</span><br>" +
            "<span class='telnetman_item_viewer_span2'>Telnetman&nbsp;のようなスクリプトで行う場合はコマンド実行から返り値確認まで1秒未満で終わり、</span><br>" +
            "<span class='telnetman_item_viewer_span2'>syslog&nbsp;が表示される前に流れ図全て実行済みということも有り得ます。</span><br>" +
            "<span class='telnetman_item_viewer_span2'>wait&nbsp;を置くなどしてよく検証する必要があります。</span>" +
           "</td>" +
           "</tr>" +
           "<tr>" +
           "<td class='right'><span class='telnetman_item_viewer_span1'>コマンド</span></td>" +
           "<td class='left'><span class='telnetman_item_viewer_span2'>syslog&nbsp;表示のためのコマンドを記入します。</span><br><span class='telnetman_item_viewer_span2'>ログイン直後に実行されます。</span></td>" +
           "</tr>" +
           "<tr>" +
           "<td class='right'><span class='telnetman_item_viewer_span1'>Syslog&nbsp;パターン</span></td>" +
           "<td class='left'><span class='telnetman_item_viewer_span2'>正規表現で記入します。</span><br><span class='telnetman_item_viewer_span2'>syslog&nbsp;はコマンド返り値に紛れて表示されます。</span><br><span class='telnetman_item_viewer_span2'>コマンド返り値までマッチしないようなパターンを記入すべきです。</span><br><span class='telnetman_item_viewer_span2'>例えば.+&nbsp;などと記入するとコマンド返り値全てもsyslog&nbsp;と判定されます。</span></td>" +
           "</tr>" +
           "<tr>" +
           "<td class='right'><span class='telnetman_item_viewer_span1'>Error&nbsp;パターン</span></td>" +
           "<td class='left'><span class='telnetman_item_viewer_span2'>上記で検出したsyslog&nbsp;からError&nbsp;としたいパターンを記入します。</span><br><span class='telnetman_item_viewer_span2'>複数記入できます。</span></td>" +
           "</tr>";
  }
  else if(category === "diff_info"){
   html += "<tr>" +
           "<td class='left'" + colspan + "><span class='telnetman_item_viewer_span2'>値の欄に記入があるとOK&nbsp;終了したときにDiff&nbsp;を取ります。</span><br><span class='telnetman_item_viewer_span2'>1ノード1ファイル作成されます。</span><br><span class='telnetman_item_viewer_span2'>結果は[zip&nbsp;log]&nbsp;ボタンを押すとダウンロードできます。</span></td>" +
           "</tr>" +
           "<tr>" +
           "<td class='right'><span class='telnetman_item_viewer_span1'>注意</span></td>" +
           "<td class='left'><span class='telnetman_item_viewer_span2'>対象の文字列が数万行以上あるとdiff&nbsp;の処理に数十分以上かかることがあります。</span><br><span class='telnetman_item_viewer_span2'>どれくらい時間がかかるかよく検証して下さい。</span></td>" +
           "</tr>";
  }
  else if(category === "optional_log"){
   html += "<tr>" +
           "<td class='left'" + colspan + "><span class='telnetman_item_viewer_span2'>ログの欄に記入があるとOK&nbsp;終了したときに任意のログを作成します。</span><br><span class='telnetman_item_viewer_span2'>ヘッダーも作れますので結果をCSV&nbsp;でまとめることもできます。</span><br><span class='telnetman_item_viewer_span2'>全ノード分が1ファイルにまとめられます。</span><br><span class='telnetman_item_viewer_span2'>結果は[zip&nbsp;log]&nbsp;ボタンを押すとダウンロードできます。</span></td>" +
           "</tr>";
  }
  else if(category.match(/^parameter[0-9]+/)){
   html += this.telentmanParameterDescription(category);
  }

  html += "<table>";

  objCommonFunctions.lockScreen(html);
  $("#" + objLayoutFunctions.idItemViewTable).fadeIn(200, function(){objLayoutFunctions.addScrollEvent();});
 };

 // パラメーターシート追加の共通説明
 this.commonAdditionalParameterSheetDescription = function (){
  var html = "<tr>" +
             "<td class='right'><span class='telnetman_item_viewer_span1'>追記したい</span></td>" +
             "<td class='left'>" +
              "<p><input type='text' spellcheck='false' readonly value='{.}{\$1}' style='width:100px; border : 3px solid #ff7f27;'></p>" +
              "<p><span class='telnetman_item_viewer_span2'>先頭に</span>" + this.telnetmanParameterAHtml(".") + "<span class='telnetman_item_viewer_span2'>&nbsp;を付けると上書きではなく追記されます。</span><br><span class='telnetman_item_viewer_span2'>改行して追記されます。新規の変数の場合は改行されません。</span><br></p>" +
             "</td>" +
             "</tr>" +
             "<tr>" +
             "<td class='right'><span class='telnetman_item_viewer_span1'>加算減算したい</span></td>" +
             "<td class='left'>" +
              "<p><input type='text' spellcheck='false' readonly value='{+}{\$1}' style='width:100px; border : 3px solid #ff7f27;'><input type='text' spellcheck='false' readonly value='{-}{\$1}' style='width:100px; border : 3px solid #ff7f27;'></p>" +
              "<p><span class='telnetman_item_viewer_span2'>先頭に</span>" + this.telnetmanParameterAHtml("+") + "<span class='telnetman_item_viewer_span2'>,&nbsp;</span>" + this.telnetmanParameterAHtml("-") + "<span class='telnetman_item_viewer_span2'>&nbsp;を付けるとそれぞれ加算、演算します。</span><br><span class='telnetman_item_viewer_span2'>新規の変数の場合は0&nbsp;に対して演算します。</span></p>" +
             "</td>" +
             "</tr>" +
             "<tr>" +
             "<td class='right'><span class='telnetman_item_viewer_span1'>任意の演算をしたい</span></td>" +
             "<td class='left'>" +
              "<p><input type='text' spellcheck='false' readonly value='{pps in},{\$1},+,2,/' style='width:100px; border : 3px solid #ff7f27;'></p>" +
              "<p><span class='telnetman_item_viewer_span2'>カンマ区切りの逆ポーランド記法で書きます。</span><br><span class='telnetman_item_viewer_span2'>上記の例は</span><span class='desc_black'>(</span>" + this.telnetmanParameterAHtml("pps in") + "<span class='desc_black'>&nbsp;+&nbsp;</span>" + this.telnetmanParameterHtml("$", "1") + "<span class='desc_black'>)&nbsp;/&nbsp;2</span><span class='telnetman_item_viewer_span2'>&nbsp;の逆ポーランド記法です。</span></p>" +
             "</td>" +
             "</tr>" +
             "<tr>" +
             "<td class='right'><span class='telnetman_item_viewer_span1'>注意事項</span></td>" +
             "<td class='left'>" +
              "<span class='telnetman_item_viewer_span2'>この機能はOK&nbsp;の時にしか発動しません。</span><br>" +
              "<span class='telnetman_item_viewer_span2'>ただし、OK&nbsp;でもここの欄に</span>" + this.telnetmanParameterHtml("$", "1") + "<span class='desc_grey'>,&nbsp;</span>" + this.telnetmanParameterHtml("$", "2") + "<span class='desc_grey'>,&nbsp;</span>" + this.telnetmanParameterHtml("$", "3") + "<span class='desc_grey'>,&nbsp;&hellip;,&nbsp;</span>" + this.telnetmanParameterHtml("$", "*") + "<span class='telnetman_item_viewer_span2'>が書かれ、</sapn><br>" +
              "<span class='telnetman_item_viewer_span2'>かつ、</span>" + this.telnetmanParameterHtml("$", "n") + "<span class='telnetman_item_viewer_span2'>&nbsp;=&nbsp;0&nbsp;のときは発動しません。</span><br>" +
              "<span class='telnetman_item_viewer_span2'>ここで編集したTelnetman&nbsp;変数を使う場合は、</span><br>" +
              "<span class='telnetman_item_viewer_span2'>この機能が発動しないこともある、ということを理解した上で使って下さい。</span>" +
             "</td>" +
             "</tr>";

  return(html);
 };

 // Telnetman 変数の説明
 this.telentmanParameterDescription = function (parameterPattern){
  var html = "";

  if(parameterPattern === "parameter12"){
   html += this.telentmanParameterDescriptionHtml1;
   html += this.telentmanParameterDescriptionHtml2;
  }
  else if(parameterPattern === "parameter13"){
   html += this.telentmanParameterDescriptionHtml1;
   html += this.telentmanParameterDescriptionHtml3;
  }
  else if(parameterPattern === "parameter34"){
   html += this.telentmanParameterDescriptionHtml3;
   html += this.telentmanParameterDescriptionHtml4;
  }
  else if(parameterPattern === "parameter1234"){
   html += this.telentmanParameterDescriptionHtml1;
   html += this.telentmanParameterDescriptionHtml2;
   html += this.telentmanParameterDescriptionHtml3;
   html += this.telentmanParameterDescriptionHtml4;
  }
  else if(parameterPattern === "parameter1"){
   html += this.telentmanParameterDescriptionHtml1;
  }
  else if(parameterPattern === "parameter5"){
   html += this.telentmanParameterDescriptionHtml5;
  }
  else if(parameterPattern === "parameter56"){
   html += this.telentmanParameterDescriptionHtml5;
   html += this.telentmanParameterDescriptionHtml6;
  }

  return(html);
 };

 // {$1}, {$2}, {$3}, ..., {$*}, {#1}, {#2}, {#3}, ..., {#*}, {$node}, {$B}, ... などのHTML を作成する。
 this.telnetmanParameterHtml = function (bruePart, blackPart){
  if(bruePart === "$"){
   bruePart = "\$";
  }

  return("<span class='desc_green'>{</span><span class='desc_blue'>" + bruePart + "</span><span class='desc_black'>" + blackPart + "</span><span class='desc_green'>}</span>");
 };

 // {変数名} のHTML を作成する。
 this.telnetmanParameterAHtml = function (parameterName){
  return("<span class='desc_green'>{</span><span class='desc_grey'>" + parameterName + "</span><span class='desc_green'>}</span>");
 };

 // {B列値:変数名} のHTML を作成する。
 this.telnetmanParameterBHtml = function (B, parameterName){
  return("<span class='desc_green'>{</span><span class='desc_grey'>" + B + "</span><span class='desc_black'>:</span><span class='desc_grey'>" + parameterName + "</span><span class='desc_green'>}</span>");
 };

 this.telentmanParameterDescriptionHtml1 =
  "<tr>" +
  "<td class='left'>" + this.telnetmanParameterAHtml("変数名") + "</td>" +
  "<td class='left'><span class='telnetman_item_viewer_span2'>パラメーターシート</span><span class='desc_black'>A行</span><span class='telnetman_item_viewer_span2'>の値</span></td>" +
  "</tr>" +
  "<tr>" +
  "<td class='left'>" + this.telnetmanParameterBHtml("B列値", "変数名") + "</td>" +
  "<td class='left'><span class='telnetman_item_viewer_span2'>パラメーターシート</span><span class='desc_black'>B行</span><span class='telnetman_item_viewer_span2'>の値</span></td>" +
  "</tr>" +
  "<tr>" +
  "<td class='left'>" + this.telnetmanParameterHtml("$", "B") + "</td>" +
  "<td class='left'><span class='telnetman_item_viewer_span2'>現在のB列の値</span><br><span class='desc_comment'>&#x203B;メインルーチンが繰り返し型のときのみ使用可</span></td>" +
  "</tr>" +
  "<tr>" +
  "<td class='left'><span class='desc_green'>{</span><span class='desc_blue'>*</span><span class='desc_black'>:</span><span class='desc_grey'>変数名</span><span class='desc_green'>}</span></td>" +
  "<td class='left'><span class='desc_green'>{</span>" + this.telnetmanParameterHtml("$", "B") + "<span class='desc_black'>:</span><span class='desc_grey'>変数名</span><span class='desc_green'>}</span><span class='telnetman_item_viewer_span2'>&nbsp;と同じ</span></td>" +
  "</tr>" +
  "<tr>" +
  "<td class='left'>" + this.telnetmanParameterHtml("$", "1") + "<span class='desc_grey'>,&nbsp;</span>" + this.telnetmanParameterHtml("$", "2") + "<span class='desc_grey'>,&nbsp;</span>" + this.telnetmanParameterHtml("$", "3") + "<span class='desc_grey'>,&nbsp;&hellip;</span></td>" +
  "<td class='left'><span class='telnetman_item_viewer_span2'>コマンド返り値からの抽出値</span><br><span class='desc_comment'>&#x203B;1回のみ型でのみ使用可</span></td>" +
  "</tr>" +
  "<tr>" +
  "<td class='left'>" + this.telnetmanParameterHtml("$", "*") + "</td>" +
  "<td class='left'><span class='telnetman_item_viewer_span2'>コマンド返り値からの抽出値</span><br><span class='desc_comment'>&#x203B;繰り返し型でのみ使用可</span></td>" +
  "</tr>" +
  "<tr>" +
  "<td class='left'>" + this.telnetmanParameterHtml("#", "1") + "<span class='desc_grey'>,&nbsp;</span>" + this.telnetmanParameterHtml("#", "2") + "<span class='desc_grey'>,&nbsp;</span>" + this.telnetmanParameterHtml("#", "3") + "<span class='desc_grey'>,&nbsp;&hellip;</span></td>" +
  "<td class='left'><span class='telnetman_item_viewer_span2'>メインルーチンの</span>" + this.telnetmanParameterHtml("$", "1") + "<span class='desc_grey'>,&nbsp;</span>" + this.telnetmanParameterHtml("$", "2") + "<span class='desc_grey'>,&nbsp;</span>" + this.telnetmanParameterHtml("$", "3") + "<span class='desc_grey'>,&nbsp;&hellip;</span><br><span class='desc_comment'>&#x203B;1回のみ型サブルーチン内でのみ使用可</span></td>" +
  "</tr>" +
  "<tr>" +
  "<td class='left'>" + this.telnetmanParameterHtml("#", "*") + "</td>" +
  "<td class='left'><span class='telnetman_item_viewer_span2'>メインルーチンの</span>" + this.telnetmanParameterHtml("$", "*") + "<br><span class='desc_comment'>&#x203B;繰り返し型サブルーチン内でのみ使用可</span></td>" +
  "</tr>" +
  "<tr>" +
  "<td class='left'>" + this.telnetmanParameterHtml("$", "node") + "</td>" +
  "<td class='left'><span class='telnetman_item_viewer_span2'>現在の対象ノード(パラメーターシートのA列)</span></td>" +
  "</tr>";

 this.telentmanParameterDescriptionHtml2 =
  "<tr>" +
  "<td class='left'>" + this.telnetmanParameterHtml("$", "user") + "</td>" +
  "<td class='left'><span class='telnetman_item_viewer_span2'>ログイン情報のユーザー名</span></td>" +
  "</tr>" +
  "<tr>" +
  "<td class='left'>" + this.telnetmanParameterHtml("$", "password") + "</td>" +
  "<td class='left'><span class='telnetman_item_viewer_span2'>ログイン情報のパスワード</span></td>" +
  "</tr>" +
  "<tr>" +
  "<td class='left'>" + this.telnetmanParameterHtml("$", "enable_password") + "</td>" +
  "<td class='left'><span class='telnetman_item_viewer_span2'>ログイン情報の特権モード移行パスワード</span></td>" +
  "</tr>" +
  "<tr>" +
  "<td class='left'>" + this.telnetmanParameterHtml("$", "prompt") + "</td>" +
  "<td class='left'><span class='telnetman_item_viewer_span2'>直近で検知したプロンプト</span></td>" +
  "</tr>" +
  "<tr>" +
  "<td class='left'><span class='desc_black'>_BLANK_</span></td>" +
  "<td class='left'><span class='telnetman_item_viewer_span2'>空文字</span></td>" +
  "</tr>" +
  "<tr>" +
  "<td class='left'><span class='desc_black'>_DUMMY_</span></td>" +
  "<td class='left'><span class='desc_black'>_BLANK_</span><span class='telnetman_item_viewer_span2'>&nbsp;と同じだが、コマンドで使った場合は</span><br><span class='telnetman_item_viewer_span2'>コマンド返り値をダミー用のものに差し替える。</span></td>" +
  "</tr>" +
  "<tr>" +
  "<td class='left'><span class='desc_black'>_LF_</span></td>" +
  "<td class='left'><span class='telnetman_item_viewer_span2'>改行</span></td>" +
  "</tr>";

 this.telentmanParameterDescriptionHtml3 =
  "<tr>" +
  "<td class='left'><span class='desc_green'>{</span><span class='desc_blue'>\$</span><span class='desc_black'>title</span><span class='desc_green'>}</span></td>" +
  "<td class='left'><span class='telnetman_item_viewer_span2'>この登録のタイトル</span></td>" +
  "</tr>";

 this.telentmanParameterDescriptionHtml4 =
  "<tr>" +
  "<td class='left'>" + this.telnetmanParameterHtml("$", "command") + "</td>" +
  "<td class='left'><span class='telnetman_item_viewer_span2'>直近で実行したコマンド全て</span></td>" +
  "</tr>" +
  "<tr>" +
  "<td class='left'>" + this.telnetmanParameterHtml("$", "condition") + "</td>" +
  "<td class='left'><span class='telnetman_item_viewer_span2'>最後に評価された分岐条件式</span></td>" +
  "</tr>" +
  "<tr>" +
  "<td class='left'>" + this.telnetmanParameterHtml("$", "pattern") + "</td>" +
  "<td class='left'><span class='telnetman_item_viewer_span2'>抽出パターン</span></td>" +
  "</tr>" +
  "<tr>" +
  "<td class='left'>" + this.telnetmanParameterHtml("$", "n") + "</td>" +
  "<td class='left'><span class='telnetman_item_viewer_span2'>分岐条件適用後の抽出値の数</span></td>" +
  "</tr>";

 this.telentmanParameterDescriptionHtml5 =
  "<tr>" +
  "<td class='left'>" + this.telnetmanParameterAHtml("変数名") + "</td>" +
  "<td class='left'><span class='telnetman_item_viewer_span2'>パラメーターシート</span><span class='desc_black'>A行</span><span class='telnetman_item_viewer_span2'>の値</span></td>" +
  "</tr>" +
  "<tr>" +
  "<td class='left'>" + this.telnetmanParameterBHtml("B列値", "変数名") + "</td>" +
  "<td class='left'><span class='telnetman_item_viewer_span2'>パラメーターシート</span><span class='desc_black'>B行</span><span class='telnetman_item_viewer_span2'>の値</span></td>" +
  "</tr>" +
  "<tr>" +
  "<td class='left'>" + this.telnetmanParameterHtml("$", "node") + "</td>" +
  "<td class='left'><span class='telnetman_item_viewer_span2'>現在の対象ノード(パラメーターシートのA列)</span></td>" +
  "</tr>" +
  "<tr>" +
  "<td class='left'>" + this.telnetmanParameterHtml("$", "user") + "</td>" +
  "<td class='left'><span class='telnetman_item_viewer_span2'>ログイン情報のユーザー名</span></td>" +
  "</tr>" +
  "<td class='left'><span class='desc_black'>_BLANK_</span></td>" +
  "<td class='left'><span class='telnetman_item_viewer_span2'>空文字</span></td>" +
  "</tr>" +
  "<tr>" +
  "<td class='left'><span class='desc_black'>_DUMMY_</span></td>" +
  "<td class='left'><span class='desc_black'>_BLANK_</span><span class='telnetman_item_viewer_span2'>&nbsp;と同じ。</span></td>" +
  "</tr>" +
  "<tr>" +
  "<td class='left'><span class='desc_black'>_LF_</span></td>" +
  "<td class='left'><span class='telnetman_item_viewer_span2'>改行</span></td>" +
  "</tr>";

 this.telentmanParameterDescriptionHtml6 =
  "<tr>" +
  "<td class='left'>" + this.telnetmanParameterHtml("$", "B") + "</td>" +
  "<td class='left'><span class='telnetman_item_viewer_span2'>現在のB列の値</span><br><span class='desc_comment'>&#x203B;この記入がある行は{\$B}&nbsp;の値の数だけ繰り返します。</span></td>" +
  "</tr>" +
  "<tr>" +
  "<td class='left'><span class='desc_green'>{</span><span class='desc_blue'>*</span><span class='desc_black'>:</span><span class='desc_grey'>変数名</span><span class='desc_green'>}</span></td>" +
  "<td class='left'><span class='desc_green'>{</span>" + this.telnetmanParameterHtml("$", "B") + "<span class='desc_black'>:</span><span class='desc_grey'>変数名</span><span class='desc_green'>}</span><span class='telnetman_item_viewer_span2'>&nbsp;と同じ</span><br><span class='desc_comment'>&#x203B;この記入がある行は{\$B}&nbsp;の値の数だけ繰り返します。</span></td>" +
  "</tr>";

 this.telnetmanScriptTemplate =
  "#!/usr/bin/perl\n" +
  "# 説明   : \n" +
  "# 作成者 : \n" +
  "# 作成日 : YYYY/MM/DD\n" +
  "\n" +
  "=pod\n" +
  "詳細説明\n" +
  "...\n" +
  "入力値と出力値の例など\n" +
  "...\n" +
  "..\n" +
  ".\n" +
  "=cut\n" +
  "\n" +
  "use strict;\n" +
  "use warnings;\n" +
  "\n" +
  "package Telnetman_script_任意の半角文字列;\n" +
  "\n" +
  "sub convert {\n" +
  " my @values = @_;\n" +
  " \n" +
  " #\n" +
  " # 変換処理\n" +
  " #\n" +
  " my @new_values = @values;\n" +
  " \n" +
  " \n" +
  " \n" +
  " #\n" +
  " # 例外の場合(何も値を返したくない場合)はundef を返す。\n" +
  " #\n" +
  " if(scalar(@new_values) == 0){\n" +
  "  return(undef);\n" +
  " }\n" +
  " \n" +
  " return(@new_values);\n" +
  "}\n" +
  "\n" +
  "1;\n";

 return(this);
}
