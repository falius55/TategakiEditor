console.log("tategaki.js");
/*
 * 実装目標
 * コピーアンドペースト
 * アンドゥ
 */
$(function(){
	// ===================================================================
	// 		ユーザー操作(label:user)
	// ===================================================================
	// キー操作
	function keyEvent(e) {
		userAlert("");
		var keycode;
		if (document.all) {
			// IE
			keycode = e.keyCode
		}else{
			// IE以外
			keycode = e.which;
		}
		if (keycode === 123) { return; } // F12のみブラウザショートカットキー
		var $inputBuffer = $('.input-buffer');
		if ($('.convert-view')[0]) {
			// 漢字変換候補を選んでいるとき
			keyEventOnConvertView(e,keycode);
		}else if($inputBuffer.text() !== "") {
			// inputBufferへの入力中
			keyEventOnInputBuffer(e,keycode);
		}else{
			// 非入力(通常)状態
			if (e.ctrlKey) {
				// ctrlキーを使ったショートカットキー
				keyEventWithCTRL(e,keycode);
			}else{
				keyEventOnDraft(e,keycode);
			}
		}

		console.log(keycode);
		// デフォルトの動作を無効化する
		e.preventDefault();
		// e.stopPropagation();
		// e.keyCode = 0;
		// e.ctrlKey = false;
	}
	function keyEventOnConvertView(e,keycode) {
		var $inputBuffer = $('.input-buffer');
		switch (keycode) {
			case 8:
				// backspace
				backSpaceOnConvert();
				break;
			case 13:
				// Enter
				// inputBufferの文字を挿入
				$('.convert-view').remove();
				insertStringFromCursor($inputBuffer.text());
				$inputBuffer.empty().hide(); // inputBufferを空にして隠す
				// 禁則処理
				checkKinsoku();
				// displayrow
				// reDisplay();
				changeDisplayRow(false);
				addPageBreak();
				printDocInfo();
				break;
			case 32:
			case 37:
				// space
				// Left
				// 候補のフォーカスを移動する
				shiftLeftAlternativeFocus();
				break;
			case 38:
				// Up
				if (e.shiftKey) {
					// shift & Up
					shiftUpOnConvert();
				}else{
					// Up のみ
					// 選択文節の変更
					// 表示convertviewの変更、alternative-focusの変更、selectphraseの変更
					var prevPhraseNum = $('.alternative-focus').siblings('.phrase-num').text();
					var $prevSelectConvertView = $('.convert-view[data-alternativeList="select"]');
					var $newSelectConvertView = $prevSelectConvertView.prev('.convert-view');
					var newPhraseNum = $newSelectConvertView.children('.phrase-num').text();
					// 最初に達していたら最後に戻る
					if(!($newSelectConvertView[0])){
						$newSelectConvertView = $('.convert-view').last();
						newPhraseNum = $newSelectConvertView.children('.phrase-num').text();
					} 
					var $newPhrases = $('.input-buffer > .vertical-char[data-phrase_num='+ newPhraseNum + ']');
					$prevSelectConvertView.attr('data-alternativeList','nonselect');
					// $prevSelectConvertView.data('alternativeList','nonselect');
					$newSelectConvertView.attr('data-alternativeList','select');
					// $newSelectConvertView.data('alternativeList','select');
					$('.input-buffer > .vertical-char.selectPhrase').removeClass('selectPhrase');
					$newPhrases.addClass('selectPhrase');
					$('.alternative-focus').removeClass('alternative-focus');
					$newSelectConvertView.children('.vertical-row:first-of-type').addClass('alternative-focus');
				}
				break;
			case 39:
				// Right
				shiftRightAlternativeFocus();
				break;
			case 40:
				// Down
				if (e.shiftKey) {
					// shift + Down
					var $firstConvertView = $('.convert-view[data-alternativeList="select"]');
					var $secondConvertView = $firstConvertView.next('.convert-view');
					if(!($secondConvertView[0])) break;
					var firstKana = getStringFromRow($firstConvertView.children('.vertical-row').last());
					var secondKana = getStringFromRow($secondConvertView.children('.vertical-row').last());
					var newStr;
					if(secondKana.length < 2){
						//二番目の文字列が１文字しかないので、２つを統合する
						newStr = firstKana + secondKana + ",";
						getKanjiForFusion(newStr,$firstConvertView,$secondConvertView);
						break;
					}
					newStr = firstKana + secondKana.charAt(0) + "," + secondKana.substring(1);
					getKanjiForChangePhrase(newStr,$firstConvertView,$secondConvertView);
				}else{
					// Down のみ
					// 選択文節の変更
					// 表示convertviewの変更、alternative-focusの変更、selectphraseの変更
					var prevPhraseNum = $('.alternative-focus').siblings('.phrase-num').text();
					var $prevSelectConvertView = $('.convert-view[data-alternativeList="select"]');
					var $newSelectConvertView = $prevSelectConvertView.next('.convert-view');
					var newPhraseNum = $newSelectConvertView.children('.phrase-num').text();
					// 最後に達していたら最初に戻る
					if(!($newSelectConvertView[0])){
						$newSelectConvertView = $('.convert-view').first();
						newPhraseNum = $newSelectConvertView.children('.phrase-num').text();
					} 
					var $newPhrases = $('.input-buffer > .vertical-char[data-phrase_num='+ newPhraseNum + ']');
					$prevSelectConvertView.attr('data-alternativeList','nonselect');
					// $prevSelectConvertView.data('alternativeList','nonselect');
					$newSelectConvertView.attr('data-alternativeList','select');
					// $newSelectConvertView.data('alternativeList','select');
					$('.input-buffer > .vertical-char.selectPhrase').removeClass('selectPhrase');
					$newPhrases.addClass('selectPhrase');
					$('.alternative-focus').removeClass('alternative-focus');
					$newSelectConvertView.children('.vertical-row:first-of-type').addClass('alternative-focus');
				}
				break;
			case 118:
				// F7
				changeKatakanaAtConvert();
				break;
			default:
				break;
		}
	}
	function keyEventOnInputBuffer(e,keycode) {
		var $inputBuffer = $('.input-buffer');
		switch (keycode) {
			case 8:
				// backspace
				$inputBuffer.children('.EOL').prev().remove();
				moveInput();
				if($inputBuffer.children('.vertical-char:first-of-type').hasClass('EOL')){
					$inputBuffer.children('.EOL').remove();
					$inputBuffer.hide();
				}
				break;
			case 13:
				// Enter
				// inputBufferの文字を挿入
				console.log('push enter');
				insertStringFromCursor($inputBuffer.text());
				$inputBuffer.empty().hide(); // inputBufferを空にして隠す
				checkKinsoku();
				// displayrow
				// reDisplay();
				changeDisplayRow(false);
				addPageBreak();
				printDocInfo();
				break;
			case 32:
				// space
				$('.convert-view').show();
				var inputStr = getStringFromRow($inputBuffer);
				getKanjiForFullString(inputStr);
				break;
			case 118:
				// F7
				changeKatakanaAtInput();
				break;
			default:
				// inputBufferの更新
				var inputStr = getStringFromRow($inputBuffer); //もともとの文字列
				var newInputStr;
				if (e.shiftKey) {
					newInputStr = inputStr + key_table.shift_key[String(keycode)];
				}else{
					newInputStr = key_table.getString(inputStr,keycode); //keycodeを加えた新しい文字列
				}
				if(newInputStr.indexOf("undefined") !== -1){
					// 未定義文字(alt,ctrl,tabなど)はbreak
					break;
				}
				insertStringToInputBuffer(newInputStr);
				break;
		}
	}
	function keyEventWithCTRL(e,keycode) {
		var $inputBuffer = $('.input-buffer');
		var textcheck = true;
		switch (keycode) {
			case 18:
			case 70:
				// f
				readyFileModal();
				$('#file-list-modal').modal();
				break;
			case 66:
				// b
			case 68:
				// d
				var $delChar = $('.cursor').prev();
				deleteCharacter($delChar,$('.cursor-row'));
				break;
			case 190:
				// .
				findPrev();
				break;
			case 79:
				// o
				openPrevFile();
				textcheck = false;
				break;
			case 188:
				// ,
				findNext();
				break;
			case 73:
				// i
				openNextFile();
				textcheck = false;
				break;
			case 72:
				// h
				Cursor.shiftLeft();
				break;
			case 74:
				// j
				Cursor.next();
				break;
			case 75:
				// k
				Cursor.prev();
				break;
			case 76:
				// l
				Cursor.shiftRight();
				break;
			case 78:
				// n
				break;
			case 83:
				// s
				saveJsonFile();
				textcheck = false;
				break;
			default:
				break;
		}
		// 非同期通信を伴う処理を行う場合はタイムラグが生じてしまうので、文章チェックはしない
		if (textcheck) {
			// 禁則処理
			checkKinsoku();
			// displayrow
			// reDisplay();
			changeDisplayRow(false);
			addPageBreak();
			printDocInfo();
		}
	}
	function keyEventOnDraft(e,keycode) {
		var $inputBuffer = $('.input-buffer');
		switch (keycode) {
			case 8:
				// backspace
				var $delChar = $('.cursor').prev();
				deleteCharacter($delChar,$('.cursor-row'));
				checkKinsoku();
				break;
			case 13:
				// Enter
				lineBreak();
				checkKinsoku();
				break;
			case 32:
				// space
				insertStringFromCursor("　");
				checkKinsoku();
				break;
			case 37:
				// Left
				Cursor.shiftLeft();
				break;
			case 38:
				// Up
				Cursor.prev();
				break;
			case 39:
				// Right
				Cursor.shiftRight();
				break;
			case 40:
				// Down
				Cursor.next();
				break;
			case 58: // firefox developer edition
			case 186: // chrome
				// :
				startCommandMode();
				break;
			case 191:
				// /
				startFindMode();
				break;
			default:
				// bufferの更新
				var newInputStr;
				if (e.shiftKey) {
					newInputStr = key_table.shift_key[String(keycode)];
				}else{
					newInputStr = key_table.getString("",keycode);
				}
				if(newInputStr == null){
					break;
				}
				insertStringToInputBuffer(newInputStr);
				break;
		}
		// displayrow
		// reDisplay();
		changeDisplayRow(false);
		addPageBreak();
		printDocInfo();
	}
	// commandモード
	function runCommand() {
		var $command = $('input#command');
		var command = $command.val().split(' ');
		if(command.length < 2) command = $command.val().split('　');
		switch (command[0]) {
			case ':w':
			case ':save':
			case ':s':
			case ': ｗ':
			case ':さヴぇ':
			case ':ｓ':
					 if (command[1]) {
						 saveAs(command[1]);
					 }else{
						 saveJsonFile();
					 }
					 break;
			case ':e':
			case ':o':
			case ':open':
			case ':え':
			case ':お':
			case ':おぺｎ':
					 if (command[1]) {
						 openFile(command[1]);
					 }else{
						 defaultNewFile();
					 }
					 break;
			case ':jumpr':
			case ':jumprow':
			case ':jr':
			case ':じゅｍｐｒ':
			case ':じゅｍｐろｗ':
			case ':ｊｒ':
					 if(command[1]) Cursor.jumpForRow(command[1]);
					 break;
			case ':jumpp':
			case ':jumppage':
			case ':jp':
			case ':じゅｍっｐ':
			case ':じゅｍっぱげ':
			case ':ｊｐ':
					 if(command[1]) Cursor.jumpForPage(command[1]);
					 break;
			case ':new':
			case ':n':
			case ':ねｗ':
			case ':ｎ':
					 if (command[1]) {
						 newFile(command[1]);
					 }else {
						 defaultNewFile();
					 }
					 break;
			case ':delete':
			case ':del':
			case ':d':
			case ':でぇて':
			case ':でｌ':
			case ':ｄ':
					 if (command[1]) {
						 deleteFileFromFileName(command[1]);
					 }else{
						 defaultDeleteFile();
					 }
					 break;
			case ':next':
			case ':ねｘｔ':
					 // 次のファイルを開く
					 if (command[1]) {
						 // 第二引数は繰り返し回数
						 var cnt = parseInt(command[1]);
						 if (isNaN(cnt)) { break; }
						 for (var i = 0; i < cnt; i++) {
							 openNextFile();
						 }
					 }else{
						 openNextFile();
					 }
					 break;
			case ':prev':
			case ':ｐれｖ':
					 // 前のファイルを開く
					 if (command[1]) {
						 // 第二引数は繰り返し回数
						 var cnt = parseInt(command[1]);
						 if (isNaN(cnt)) { break; }
						 for (var i = 0; i < cnt; i++) {
							 openPrevFile();
						 }
					 }else{
						 openPrevFile();
					 }
					 break;
			case ':title':
			case ':name':
			case ':t':
			case ':ちｔぇ':
			case ':なめ':
			case ':ｔ':
					 if (command[1]) {
						 setFileTitle(command[1]);
					 }
					 break;
			case ':mv':
			case ':ｍｖ':
					 var $file = $('.file[data-file_name="'+ command[1] +'"],.directory[data-directory_name="'+ command[1] +'"]');
					 var $newParentDir = $('.directory[data-directory_name="'+ command[2] +'"]');
					 if ($file[0] && $newParentDir[0]) {
						 var fileID = $file.attr('data-type')==='file'?$file.attr('data-file_id'):$file.attr('data-directory_id');
						 // var fileID = $file.data('type')==='file'?$file.data('file_id'):$file.data('directory_id');
						 var newParentDirID = $newParentDir.attr('data-directory_id');
						 // var newParentDirID = $newParentDir.data('directory_id');
						 moveFileIntoDirectory(fileID,newParentDirID);
					 }
					 break;
			case ':mkdir':
			case ':ｍｋぢｒ':
					 if (command[1]) {
						 makeDirectory(command[1]);
					 }
					 break;
			case ':deldir':
			case ':でｌぢｒ':
					 if (command[1]) {
						 deleteDirectoryFromDirectoryName(command[1],false);
					 }
					 break;
			case ':noh':
			case ':のｈ':
					 endFindMode();
					 break;
			case '::':
					 insertStringFromCursor(':');
					 break;
			case ':;':
					 insertStringFromCursor(';');
					 break;
			case ':/':
					  insertStringFromCursor('/');
					  break;
			case ':i':
					 insertStringFromCursor(command[1]);
					 break;
			case ':italic':
					 toggleFont('italic');
					 break;
			case ':bold':
					 toggleFont('bold');
					 break;
			default:
					 break;
		}
	}
	function startCommandMode() {
		console.log('startCommandMode');
		var $command = $('<input>').attr('type','text').attr('id','command');
		$('#app-container').after($command);
		document.removeEventListener("keydown",keyEvent,false);
		// フォーカスを当ててからvalueをセットすることで末尾にカーソルが移動される
		$command.focus();
		$command.val(':');

		$('body').on('keyup','#command',keyupEventOnCommandMode);
		$('body').on('blur','#command',endCommandMode);
	}
	function keyupEventOnCommandMode(e) {
		console.log('keyup on #command');
		var keycode;
		if (document.all) {
			// IE
			keycode = e.keyCode
		}else{
			// IE以外
			keycode = e.which;
		}
		if (keycode == 13) {
			// enter
			runCommand();
			endCommandMode();
			e.stopPropagation(); // 親要素へのイベントの伝播(バブリング)を止める。そうしなければ先にaddeventlistenerをしてしまっているので、documentにまでエンターキーが渡ってしまい改行されてしまう。
		}else if(keycode == 27 || $(this).val() == ""){
			// Esc
			// あるいは全文字削除
			endCommandMode();
			e.stopPropagation();
		}else{
			// :eなどの後に途中まで引数を打てばファイルの検索ダイアログが出るようにする
			var $command = $(this);
			var command = $command.val().split(' ');
			if(command.length < 2) command = $command.val().split('　');
			switch (command[0]) {
				case ':e':
				case ':o':
				case ':open':
				case ':mv':
				case ':delete':
				case ':del':
				case ':d':
				case ':え':
				case ':お':
				case ':おぺｎ':
				case ':ｍｖ':
				case ':でぇて':
				case ':でｌ':
				case ':ｄ':
						 if (keycode !== 8 && command[1] && !($('body').hasClass('modal-open'))) {
							 // モーダルウィンドウを表示する
							 displayFileModalOnCommandMode();
							 searchFile(command[1]);
						 }else if(keycode === 8 && !(command[1])){
							 // BSを押した結果、引数がなくなった
							 // モーダルウィンドウを非表示にする
							 noneDisplayFileModalOnCommandMode();
						 }else if(command[1] && command[2]){
							 // 引数ふたつ目
							 searchFile(command[2]);
						 }else if(command[1]){
							 // 引数ひとつ
							 searchFile(command[1]);
						 }
						 break;
				default:
						 break;
			}
		}
		e.preventDefault();
	}
	function displayFileModalOnCommandMode() {
		$('#file-list-modal').addClass('command_modal').modal();
		$('.modal-backdrop.fade.in').addClass('none_modal-backdrop'); // モーダルウィンドウ表示時の半透明背景を見えなくする
	}
	function noneDisplayFileModalOnCommandMode() {
		if ($('body').hasClass('modal-open')) {
			$('#file-list-modal').attr('style','display: none;').removeClass('command_modal').modal('hide'); // あらかじめbootstrapより先回りしてstyle適用で非表示にして置かなければ、消える前に一瞬中央表示になってしまう
		}
		getFileList(getUserID());
	}
	function endCommandMode() {
		console.log('endCommandMode');
		var $body = $('body');
		var $command = $('#command');
		$body.off('keyup','#command',keyupEventOnCommandMode);
		$body.off('blur','#command',endCommandMode);
		$command.remove();
		document.addEventListener("keydown",keyEvent,false);
		noneDisplayFileModalOnCommandMode();
	}
	// configue constructor
	function Configue() {
		var strLen = document.conf_form.str_len.value;
		var rowLen = document.conf_form.row_len.value;
		var strSize;
		if (document.getElementById('conf-str-size-big').checked) {
			strSize = 'big';
		}else if(document.getElementById('conf-str-size-small').checked){
			strSize = 'small';
		}else if(document.getElementById('conf-str-size-middle').checked){
			strSize = 'middle';
		}else{
			strSize = null;
		}
		this.strLen = strLen;
		this.rowLen = rowLen;
		this.strSize = strSize;
	}
	function startFindMode(){
		var $find = $('#find').addClass('active');
		// フォーカスを当ててからvalueをセットすることで末尾にカーソルが移動される
		$find.focus();
		$find.val('/');
		document.removeEventListener("keydown",keyEvent,false);

		$('body').on('keyup','#find',function(e){
			if(e.keyCode == 13){
				$find.blur();
				document.addEventListener("keydown",keyEvent,false);
				return;
			}else if($find.val() == ''){
				$find.blur();
				document.addEventListener("keydown",keyEvent,false);
				endFindMode();
			}
			find($find.val().substring(1));
		});

		$('body').on('blur','#find',function(e){
		document.addEventListener("keydown",keyEvent,false);
		});
		$('body').on('focus','#find',function(e){
		document.removeEventListener("keydown",keyEvent,false);
		});
	}
	function endFindMode(){
		$('#find').removeClass('active').val('');
		$('.search-label').removeClass('search-label');
		$('.search-word').removeClass('search-word');
	}
	function userAlert(str){
		$('#user-info').text(str);
	}
	// ===================================================================
	// 		文章操作(label:string)
	// ===================================================================
	function printString(strArray,strLen) {
		// 配列を引数にして、各文字列を本文表示
		// strLen: １行の文字数
		// 配列に入っている各文字列をそれぞれ段落として挿入する
		for(var i=0;i<strArray.length;i++){
			appendParagraph(strArray[i]);
		}
		if ($('#vertical-draft > .vertical-paragraph').length === 0) {
			// 一行もないなら、空行を挿入する
			appendParagraph("");
		}
	}
	function appendParagraph(str) {
		"use strict";
		$('#vertical-draft').append(createParagraph(str));
	}
	function createParagraph(str) {
		"use strict";
		// 文字列をstrLen文字ごとに区切って行にして、paragraphにappendする
		var strLen = getStringLenOfRow();
		var $para = $('<div>').addClass('vertical-paragraph');
		var pos = 0;
		var outputStr;
		do{
			outputStr = pos+strLen>str.length?str.slice(pos):str.substring(pos,pos+strLen);
			var $row = createRow(outputStr);
			$para.append($row);
			pos += strLen;
		}while(pos<str.length);
		return $para;
	}

	function createRow(str) {
		"use strict";
		if(str == null) return;
		var $row = $('<div>').addClass('vertical-row');
		var $EOL = $('<span>').addClass('vertical-char').addClass('EOL').addClass('display-char');
		$row.append($EOL);
		var cnt;
		for (var i = 0; i < (cnt = str.length); i++) {
			var $char = createCharacter(str.charAt(i));
			$EOL.before($char);
		}
		return $row;
	}
	function createCharacter(c) {
		// 文字列からjQueryオブジェクトを作成
		// クラスを追加するには、最初に半角スペースを入れること
		var htmlChar = "<span class='vertical-char display-char";
		var classArr = getConfDecoChar();
			for (var i = 0; i < classArr.length; i++) {
				htmlChar += " " + classArr[i];
			}
		// 特殊クラスの付与
		if(key_table.dotList.indexOf(c) !== -1) htmlChar += " vertical-dot";
		if(key_table.beforeBracketList.indexOf(c) !== -1) htmlChar += " vertical-before-bracket";
		if(key_table.afterBracketList.indexOf(c) !== -1) htmlChar += " vertical-after-bracket";
		if(key_table.lineList.indexOf(c) !== -1) htmlChar += " character-line";
		if (/[a-z]/.test(c)) htmlChar += " alphabet";
		if (/[１-９]/.test(c)) htmlChar += " suzi";
		if (/[っゃゅょぁぃぅぇぉ]/.test(c)) htmlChar += " yoin";
		htmlChar += "'>";
		htmlChar += c;
		htmlChar += "</span>";
		return $(htmlChar);
	}
	function getKanjiForFullString(str) {
		// 漢字変換
		// 初変換時
		console.log('getKanjiに渡した文字列:' + str);
		$.ajax({
			type : "POST",
			url : "/tategaki/KanjiProxy",
			data : {
				sentence: str
			},
			dataType : "json",
			context: {
			},
			success : function (json) {
				// 表示データを受け取ってからの処理
				// Google日本語入力のwebAPIから、json形式で変換候補が渡される
				// json[0][0]; // ひらがな
				// json[0][1][0]; // 変換候補１つ目
				console.log('初変換:');
				var $inputBuffer = $('.input-buffer');
				var $chars = $inputBuffer.children('.vertical-char');
				var $convertView = $('.convert-view');
				var cnt = 0;
				for (var i = 0; i < json.length; i++) {
					var hiragana = json[i][0];
					var hiraLen = hiragana.length;
					// 文節番号をつける(同じ文節には同じ番号)
					for (var j = cnt; j < (cnt + hiraLen); j++) {
						$chars.eq(j).attr('data-phrase_num',i);
						// $chars.eq(j).data('phrase_num',i);
					}
					cnt += hiraLen;
					insertPhraseToInputBuffer(i,json[i][1][0]); // 第一候補の漢字でinputBufferの文字列を置き換える
					// 変換候補表示
					// convertviewを文節分作成する
					var $convertView = createConvertView(i,json[i]);
					$('#vertical-draft').before($convertView);
				}
				var $convertViews = $('.convert-view');
				$('.convert-view:eq(0)').attr('data-alternativeList','select');
				// $('.convert-view:eq(0)').data('alternativeList','select');
				$('.convert-view[data-alternativeList="select"] > .vertical-row:first-of-type').addClass('alternative-focus');
				repositionConvertView();

				// 現在選択中の文節にselectphraseクラスを設定する
				var phraseNum = $('.alternative-focus').siblings('.phrase-num').text(); // 現在選択中の文節番号
				$('.input-buffer > .vertical-char[data-phrase_num='+ phraseNum + ']').addClass('selectPhrase');
				// 最後にinputBufferの高さ調整
				resizeInputBuffer();
			},
			error : function (XMLHttpRequest, textStatus, errorThrown) {
				alert("Error:"+ textStatus + ":\n" + errorThrown + ":status=" + XMLHttpRequest.status + "in getKanjiForFullString");
			}
		});
	}
	function getKanjiForChangePhrase(str,$firstConvertView,$secondConvertView) {
		// 漢字変換
		// 文節総数に変化なし(文節の区切り目のみ変更)
		console.log('getKanjiに渡した文字列:' + str);
		$.ajax({
			type : "POST",
			url : "/tategaki/KanjiProxy",
			data : {
				sentence: str
			},
			dataType : "json",
			context: {
				$first: $firstConvertView,
				$second: $secondConvertView,
			},
			success : function (json) {
				// 表示データを受け取ってからの処理
				// Google日本語入力のwebAPIから、json形式で変換候補が渡される
				// json[0][0]; // ひらがな
				// json[0][1][0]; // 変換候補１つ目
				console.log('文節総数に変化なし:');
				var fPhraseNum = this.$first.children('.phrase-num').text();
				var sPhraseNum = this.$second.children('.phrase-num').text();
				var $newFirstConvertView = createConvertView(fPhraseNum,json[0]).attr('data-alternativeList','select');
				// var $newFirstConvertView = createConvertView(fPhraseNum,json[0]).data('alternativeList','select');
				var $newSecondConvertView = createConvertView(sPhraseNum,json[1]);
				this.$first.before($newFirstConvertView);
				this.$second.before($newSecondConvertView);

				// 第一候補の文字でinputBufferの該当文字を置き換える
				insertPhraseToInputBuffer(fPhraseNum,getStringFromRow($newFirstConvertView.children('.vertical-row:first-of-type').addClass('alternative-focus')));
				insertPhraseToInputBuffer(sPhraseNum,getStringFromRow($newSecondConvertView.children('.vertical-row:first-of-type')));

				// selectphraseクラスの付け替え
				$('.input-buffer > .vertical-char[data-phrase_num='+ fPhraseNum +']').addClass('selectPhrase');
				repositionConvertView();
				this.$first.remove();
				this.$second.remove();
				// 最後にinputBufferの高さ調整
				resizeInputBuffer();
			},
			error : function (XMLHttpRequest, textStatus, errorThrown) {
				alert("Error:"+ textStatus + ":\n" + errorThrown + ":status=" + XMLHttpRequest.status + "in getKanji");
			}
		});
	}
	function getKanjiForFusion(str,$firstConvertView,$secondConvertView) {
		// 漢字変換
		// 統合時
		// 選択中の文節の次の文節が一文字の場合にShift+Down
		console.log('getKanjiに渡した文字列:' + str);
		$.ajax({
			type : "POST",
			url : "/tategaki/KanjiProxy",
			data : {
				sentence: str
			},
			dataType : "json",
			context: {
				$first: $firstConvertView,
				$second: $secondConvertView,
			},
			success : function (json) {
				// 表示データを受け取ってからの処理
				// Google日本語入力のwebAPIから、json形式で変換候補が渡される
				// json[0][0]; // ひらがな
				// json[0][1][0]; // 変換候補１つ目
				console.log('統合:');
				var fPhraseNum = this.$first.children('.phrase-num').text();
				var $newConvertView = createConvertView(fPhraseNum,json[0]).attr('data-alternativeList','select');
				// var $newConvertView = createConvertView(fPhraseNum,json[0]).data('alternativeList','select');
				this.$first.before($newConvertView);
				// 第一候補の文字でinputBufferの該当文字を置き換える
				insertPhraseToInputBuffer(fPhraseNum,getStringFromRow($newConvertView.children('.vertical-row:first-of-type').addClass('alternative-focus')));
				$('.input-buffer > .vertical-char[data-phrase_num='+ this.$second.children('.phrase-num').text() +']').remove();
				// selectphraseクラスの付け替え
				$('.input-buffer > .vertical-char[data-phrase_num='+ fPhraseNum +']').addClass('selectPhrase');
				repositionConvertView();
				this.$first.remove();
				this.$second.remove();
				resetPhraseNum();
				// 最後にinputBufferの高さ調整
				resizeInputBuffer();
			},
			error : function (XMLHttpRequest, textStatus, errorThrown) {
				alert("Error:"+ textStatus + ":\n" + errorThrown + ":status=" + XMLHttpRequest.status + "in getKanji");
			}
		});
	}
	function getKanjiForSplit(str,$firstConvertView) {
		// 漢字変換
		// 分離時
		// 最後の文節からshift+Up
		console.log('getKanjiに渡した文字列:' + str);
		$.ajax({
			type : "POST",
			url : "/tategaki/KanjiProxy",
			data : {
				sentence: str
			},
			dataType : "json",
			context: {
				$first: $firstConvertView,
			},
			success : function (json) {
				// 表示データを受け取ってからの処理
				// Google日本語入力のwebAPIから、json形式で変換候補が渡される
				// json[0][0]; // ひらがな
				// json[0][1][0]; // 変換候補１つ目
				console.log('分離:');
				var fPhraseNum = this.$first.children('.phrase-num').text();
				var sPhraseNum = $('.convert-view').length;
				var $newFirstConvertView = createConvertView(fPhraseNum,json[0]).attr('data-alternativeList','select');
				// var $newFirstConvertView = createConvertView(fPhraseNum,json[0]).data('alternativeList','select');
				var $newSecondConvertView = createConvertView(sPhraseNum,json[1]);
				this.$first.before($newFirstConvertView);
				this.$first.before($newSecondConvertView);

				// 第一候補の文字でinputBufferの該当文字を置き換える
				insertPhraseToInputBuffer(fPhraseNum,getStringFromRow($newFirstConvertView.children('.vertical-row:first-of-type').addClass('alternative-focus')));
				var secondFirstStr = json[1][1][0];
				var $insertPosObj = $('.input-buffer > .vertical-char[data-phrase_num='+ fPhraseNum + ']').last();
				for (var i = secondFirstStr.length -1; i >= 0; i--) {
					var $character = createCharacter(secondFirstStr.charAt(i)).attr('data-phrase_num',sPhraseNum);
					// var $character = createCharacter(secondFirstStr.charAt(i)).data('phrase_num',sPhraseNum);
					$insertPosObj.after($character);
				}

				// selectphraseクラスの付け替え
				$('.input-buffer > .vertical-char[data-phrase_num='+ fPhraseNum +']').addClass('selectPhrase');
				repositionConvertView();
				this.$first.remove();
				resetPhraseNum();
				// 最後にinputBufferの高さ調整
				resizeInputBuffer();
			},
			error : function (XMLHttpRequest, textStatus, errorThrown) {
				alert("Error:"+ textStatus + ":\n" + errorThrown + ":status=" + XMLHttpRequest.status + "in getKanji");
			}
		});
	}
	function getKanjiForOnePhrase(str,$firstConvertView) {
		// 漢字変換
		// 一文節のみ変換
		console.log('getKanjiに渡した文字列:' + str + ",");
		$.ajax({
			type : "POST",
			url : "/tategaki/KanjiProxy",
			data : {
				sentence: str+"," // 文節を区切られないよう、,を末尾に追加
			},
			dataType : "json",
			context: {
				$first: $firstConvertView,
			},
			success : function (json) {
				// 表示データを受け取ってからの処理
				// Google日本語入力のwebAPIから、json形式で変換候補が渡される
				// json[0][0]; // ひらがな
				// json[0][1][0]; // 変換候補１つ目
				console.log('一文節のみ変換:');
				var fPhraseNum = this.$first.children('.phrase-num').text();
				var $newConvertView = createConvertView(fPhraseNum,json[0]).attr('data-alternativeList','select');
				// var $newConvertView = createConvertView(fPhraseNum,json[0]).data('alternativeList','select');
				this.$first.before($newConvertView);
				// 第一候補の文字でinputBufferの該当文字を置き換える
				insertPhraseToInputBuffer(fPhraseNum,getStringFromRow($newConvertView.children('.vertical-row:first-of-type').addClass('alternative-focus')));
				// selectphraseクラスの付け替え
				$('.input-buffer > .vertical-char[data-phrase_num='+ fPhraseNum +']').addClass('selectPhrase');
				repositionConvertView();
				this.$first.remove();
				// 最後にinputBufferの高さ調整
				resizeInputBuffer();
			},
			error : function (XMLHttpRequest, textStatus, errorThrown) {
				alert("Error:"+ textStatus + ":\n" + errorThrown + ":status=" + XMLHttpRequest.status + "in getKanji");
			}
		});
	}
	function changeKatakanaAtConvert() {
		var phraseNum = $('.input-buffer > .selectPhrase').attr('data-phrase_num');
		// var phraseNum = $('.input-buffer > .selectPhrase').data('phrase_num');
		var str = getKatakana(getStringFromRow($('.convert-view[data-alternativeList="select"] > .vertical-row').last()));
		insertPhraseToInputBuffer(phraseNum,str).addClass('selectPhrase');
		resizeInputBuffer();
	}
	function changeKatakanaAtInput() {
		var str = getStringFromRow($('.input-buffer.vertical-row'));
		insertStringToInputBuffer(getKatakana(str)).children('.vertical-char').not('.EOL').addClass('selectPhrase');
	}
	function getKatakana(str) {
		var rtnKatakana = "";
		var cKatakana;
		var len = str.length;
		for (var i = 0; i < len; i++) {
			cKatakana = key_table.katakana[str.charAt(i)];
			if (cKatakana) {
				rtnKatakana += cKatakana;
			}else{
				// 変換できなければ元の文字をそのまま連結
				rtnKatakana += str.charAt(i);
			}
		}
		return rtnKatakana;
	}
	function createConvertView(phNum,jsonArray) {
		// convertviewを作成する
		// jsonArrayはひらがなと漢字配列が入るように、json[i]の形で渡す
		var $convertView = $('<div>').addClass('convert-view').attr('data-alternativeList','nonselect');
		// var $convertView = $('<div>').addClass('convert-view').data('alternativeList','nonselect');
		if (jsonArray[1] != null) {
			for (var i = 0; i < jsonArray[1].length; i++) {
				$convertView.append(createRow(jsonArray[1][i]));
			}
		}else{
			console.log('no convert data');
		}
		// 最後はひらがな
		$convertView.append(createRow(jsonArray[0]));
		// 文節番号を示す数字をリストに表示する
		// phrase_numはクラスと、inputBuffer文字が持つ属性とで二種類あるから注意
		var $phraseNum = $('<div>').addClass('phrase-num').text(phNum);
		$convertView.append($phraseNum);
		return $convertView;
	}
	function repositionConvertView() {
		// convertviewの位置を調整
		var $convertViews = $('.convert-view');
		var cursorPosObj = getCursorPos();
		var x = cursorPosObj.x;
		var y = cursorPosObj.y;
		$convertViews.each(function () {
			$(this).css('top',y).css('left',(x - parseInt($(this).css('width'))));
		});
	}
	function resetPhraseNum() {
		// inputBufferの文節番号を振り直す
		var newNum = 0;
		var $character = $('.input-buffer > .vertical-char').first();
		var $convertView = $('.convert-view').first();
		var temp = $character.attr('data-phrase_num');
		// var temp = $character.data('phrase_num');
		$convertView.children('.phrase-num').text(newNum);
		while (!($character.hasClass('EOL'))) {
			if (temp !== $character.attr('data-phrase_num')){
			// if (temp !== $character.data('phrase_num')){
				newNum++;
				temp = $character.attr('data-phrase_num');
				// temp = $character.data('phrase_num');
				$convertView = $convertView.next('.convert-view');
				$convertView.children('.phrase-num').text(newNum);
			}
			$character.attr('data-phrase_num',newNum);
			// $character.data('phrase_num',newNum);
			$character = $character.next('.vertical-char');
		}
	}
	function addPageBreak() {
		// 改ページクラスの付与
		$('#vertical-draft > .vertical-paragraph > .vertical-row.page-break').removeClass('page-break');
		$('#vertical-draft > .vertical-paragraph > .vertical-row.page-last-row').removeClass('page-last-row');
		var pageNum = getRowLenOnPage();
		var $rows = $('#vertical-draft > .vertical-paragraph > .vertical-row');
		var $row;
		for (var i = 1; ($row = $rows.eq(pageNum*i-1))[0]; i++) {
			$row.addClass('page-last-row');
		}
		$rows.last().addClass('page-last-row');
		for (var i = 0; ($row = $rows.eq(pageNum*i))[0]; i++) {
			$row.addClass('page-break');
		}
	}
	function checkKinsoku() {
		var $dots = $('#vertical-draft .vertical-char.vertical-dot').add('#vertical-draft .vertical-char.vertical-after-bracket');
		if ($dots[0]) {
			$dots.each(function () {
				var $self = $(this);
				if (!($self.prev()[0])) {
					// 行頭
					var $selfRow = $self.closest('.vertical-row');
					var $prevRow = $selfRow.prev('.vertical-row');	
					if ($prevRow[0]) {
						// 段落の最初ではない
						backChar($prevRow);
					}
				}
			});
		}
	}
	function getStringFromRow($row) {
		var rtnStr = "";
		var $c = $row.children('.vertical-char:first-of-type');
		while ($c[0] && !($c.hasClass('EOL'))) {
			rtnStr += $c.text();
			$c = $c.next();
		}
		return rtnStr;
	}
	function getStringFromParagraph($paragraph) {
		var $rows = $paragraph.children('.vertical-row');
		var rtnStr = "";
		for (var i = 0; i < $rows.length; ++i) {
			rtnStr += getStringFromRow($rows.eq(i));
		}
		return rtnStr;
	}
	function insertStringFromCursor(str) {
		console.log('ins string from cursor');
		var cnt = str.length;
		var $cursor = $('.cursor');
		var $character;
		var $cursorRow = $('#vertical-draft .cursor-row')
		for (var i = 0; i < cnt; i++) {
			$character = createCharacter(str.charAt(i));
			$cursor.before($character);
		}
		cordinateStringNumber($cursorRow,getStringLenOfRow());
		Cursor.repositionCharNum();
		resetDisplayChar();
		changeDisplayChar();
	}
	function insertStringToInputBuffer(str) {
		var $inputBuffer = $('.input-buffer');
		// 新しくinputBufferを作り直す
		var $newInputBuffer = createRow(str).addClass('input-buffer');
		$newInputBuffer.children('.vertical-char').attr('data-phrase_num',-1);
		// $newInputBuffer.children('.vertical-char').data('phrase_num',-1);
		if ($inputBuffer.text()!=="" && $inputBuffer.children('.vertical-char:first-of-type').attr('data-phrase_num') !== "-1") {
		// if ($inputBuffer.text()!=="" && $inputBuffer.children('.vertical-char:first-of-type').data('phrase_num') !== "-1") {
			for (var i = 0; i < $inputBuffer.children('.vertical-char').length; i++) {
				var $oldCharacter = $inputBuffer.children('.vertical-char').eq(i);
				var $newCharacter = $newInputBuffer.children('.vertical-char').eq(i);
				$newCharacter.attr('data-phrase_num',$oldCharacter.attr('data-phrase_num'));
				// $newCharacter.data('phrase_num',$oldCharacter.data('phrase_num'));
			}
		}
		$inputBuffer.before($newInputBuffer);
		$inputBuffer.remove();
		$newInputBuffer.show();
		moveInput();

		return $newInputBuffer;
	}
	function insertPhraseToInputBuffer(phNum,str) {
		// 文節番号phNumを、strで置き換える
		// 新しい文字集合のオブジェクトを返す
		var $selectPhrases = $('.input-buffer > .vertical-char[data-phrase_num='+ phNum +']');
		var $insertPosObj = $selectPhrases.first();
		for (var i = 0; i < str.length; i++) {
			var $character = createCharacter(str.charAt(i));
			$insertPosObj.before($character);
			$character.attr('data-phrase_num',-10);
			// $character.data('phrase_num',-10);
		}
		$selectPhrases.remove();
		return $('.input-buffer > .vertical-char[data-phrase_num="-10"]').attr('data-phrase_num',phNum);
		// return $('.input-buffer > .vertical-char[data-phrase_num="-10"]').data('phrase_num',phNum);
	}
	// 改行
	function lineBreak() {
		var $cursor = $('.cursor');
		var $cursorRow = $('.cursor-row');
		var $nextRow = $cursorRow.nextAll('.vertical-row').first(); //改行前の次の行
		var $prevChar = $cursor.prev(); //移動しない文字の最後
		if (!($prevChar[0])) {
			// 行頭カーソルで改行
			var $baseParagraph = $cursorRow.closest('.vertical-paragraph');
			var $paragraph = createParagraph("");
			if (($cursorRow.prev())[0]) {
				// 段落途中での行頭改行では、段落を２つに分ける
				var $afterParagraph = createDevideParagraph($cursorRow);
				// $baseParagraph,$afterParagraphの順番になるように
				$baseParagraph.after($afterParagraph);
			}else{
				// 段落最初での改行では、その前のところに空行挿入
				$baseParagraph.before($paragraph);
			}
		}else{
			if (!($nextRow[0])) {
				// 次の行がなければ新しく作る
				$nextRow = createRow("");
				$cursorRow.after($nextRow);
			}
			var $insertPosObj = $nextRow.children('.vertical-char:first-of-type'); //挿入先の最初の文字
			var $moveChar = $cursor; // 移動文字
			while($moveChar[0] && !($moveChar.hasClass('EOL'))){ // EOLは移動しない
				// $nextRowの先頭にある$insertPosObjに、$prevCharの次の文字を挿入していく
				$moveChar.remove();
				$insertPosObj.before($moveChar);
				$moveChar = $prevChar.nextAll('.vertical-char').first();
			}
			if ($cursor.hasClass('EOL')) { // EOLにカーソルがあると、EOLが動かないために、カーソルが次の行に行かないので強制的に動かす必要あり
				// = 行末での改行
				$nextRow.children('.vertical-char:first-of-type').addCursor();
			}
			// 移動文字列を次の行に入れた結果規定文字数を超えた場合のために、次の行を文字数調整
			cordinateStringNumber($nextRow,getStringLenOfRow());

			// $nextRow以降を新しい段落とする
			var $currentParagraph = $nextRow.closest('.vertical-paragraph');
			var $newParagraph = createDevideParagraph($nextRow);
			$currentParagraph.after($newParagraph);

			Cursor.repositionCharNum();
		}
		reDisplay();
	}
	function createDevideParagraph($row) {
		// $row以降を新しい段落とする
		// 段落を分けるときに利用する
		var $currentParagraph = $row.closest('.vertical-paragraph');
		var $newParagraph = $('<div>').addClass('vertical-paragraph');
		var $nextRow;
		do{
			// $rowを新しい段落に移動していく
			$nextRow = $row.next(); // $rowを移動すると次の移動対象選択には使えないので、次の行を保持しておく
			$row.remove();
			$newParagraph.append($row);
			$row = $nextRow;
		}while($row[0]);

		return $newParagraph;
	}
	function cordinateStringNumber($vRow,strLen) {
		// 入力などの結果規定文字数を超えた行の文字数を調整する
		// 超えた分を次の行に移動する
		// 同一段落内で完結
		// $vRow: 調整行
		// strLen: １行の文字数
		if($vRow.children().length <= (strLen +1)) return; //調整行の文字数が規定値以下なら調整の必要なし(EOL含めると31個)
		var $nextRow = $vRow.nextAll('.vertical-row').first();
		if (!($nextRow[0])) {
			// 次の行がなければ新しく作る
			$nextRow = createRow("");
			$vRow.after($nextRow);
			reDisplay();
		}
		var $prevChar = $vRow.children('.vertical-char').eq(strLen -1); //移動しない文字の最後
		var $insertPosObj = $nextRow.children('.vertical-char:first-of-type'); //挿入先の最初の文字
		var $moveChar = $prevChar.nextAll('.vertical-char').first(); // 移動文字
		while($moveChar[0] && !($moveChar.hasClass('EOL'))){ // EOLは移動しない
			$moveChar.remove();
			$insertPosObj.before($moveChar);
			$moveChar = $prevChar.nextAll('.vertical-char').first();
		}
		// 移動先の行がstrlen文字を超えている時のために再帰
		cordinateStringNumber($nextRow,strLen);
		// cursorが調整行の最後にあれば動いてくれないので、強制的に動かす
		if ($prevChar.nextAll('.vertical-char').first().hasClass('cursor')) {
			$insertPosObj.addCursor();
			Cursor.repositionCharNum();
		}
		Cursor.addCursorRow();
	}
	function deleteCharacter($delChar,$rowOfDelChar) {
		// $delChar: 削除文字
		// $rowofdelchar: 削除文字のある行
		if (!($delChar[0])) {
			// 行頭からのBS
			var $preRow = $rowOfDelChar.prevAll('.vertical-row').first();
			if (!($preRow[0])) {
				// 前の行が見つからない　＝　段落の最初
				// 段落をつなげて次の処理へ
				var $delParagraph = $rowOfDelChar.closest('.vertical-paragraph');
				var $preParagraph = $delParagraph.prevAll('.vertical-paragraph').first();
				var $mvRow = $delParagraph.children('.vertical-row:first-of-type');
				var $preRow = $preParagraph.children('.vertical-row:last-of-type');
				if (!($preRow[0])) {
					// 段落をまたいでも前の行が見つからない＝文章の最初
					return;
				}
				if ($mvRow.children('.vertical-char:first-of-type').hasClass('EOL')) {
					// 空段落でBSを押した時、段落を削除するのみ
					$delParagraph.remove();
					// cursorの調整
					var $newCursor = $preRow.children('.vertical-char:last-of-type').addCursor(false);
					reDisplay();
					Cursor.repositionCharNum();
					return;
				}

				do{
					// $delParagraphの行を$preParagraphに移動
					$mvRow.remove();
					$preParagraph.append($mvRow);
					$mvRow = $delParagraph.children('.vertical-row:first-of-type');
				}while($mvRow[0]);
				$delParagraph.remove();
				if($preRow.children().length >= getStringLenOfRow()){
					// 前の段落の最終行が規定文字数あるようなら、段落をつなげて終わり
					return;
				}
			}
			// 行頭からのBSかつ段落の最初ではない
			if ($preRow.children('.vertical-char').length < getStringLenOfRow()) {
				// 前の行の文字数が規定数(30)文字ないとき、$rowOfDelCharの文字を前の行に持って行って埋める
				var cnt = getStringLenOfRow() - ($preRow.children('.vertical-char').length -1); // lengthではEOLも含まれるので-1
				for (var i = 0; i < cnt; i++) {
					backChar($preRow);
				}
				reDisplay();
				Cursor.repositionCharNum();
				return;
			}else{
				// 前の行の文字数が規定文字ある時、前の行の最後の文字を削除文字にする
				$delChar = $preRow.children('.EOL').prev();
				$rowOfDelChar = $preRow;
			}
		}
		backChar($rowOfDelChar); // 次の行から１文字持ってくる
		var character = $delChar.text();
		$delChar.remove();
		if ($rowOfDelChar.children('.vertical-char:first-of-type').hasClass('EOL') && ($rowOfDelChar.prev())[0]) {
			// 先にカーソルの調整($rowOfDelChar削除前にカーソル位置取得)
			var $newCursor = $rowOfDelChar.prev().children('.vertical-char:last-of-type');
			$newCursor.addClass('cursor');
			// 最後の１文字を削除した場合はbackCharが反応しないので、その空行を削除(それが段落最後の行でなければ)
			$rowOfDelChar.remove();
			reDisplay();
		}
		Cursor.repositionCharNum();
		return character;
	}
	function backChar($bringRow) {
		// $bringRowの次の行以降の最初の文字を、その前の行の最後に移動する
		var $nextRow = $bringRow.nextAll('.vertical-row').first();
		if(!($nextRow[0])) return;
		var $bc = $nextRow.children('.vertical-char:first-of-type');
		if($bc.hasClass('EOL')){
			// 次の行が空行ならその行を削除
			$nextRow.remove();
			return;
		}
		if ($bc.next().hasClass('EOL')) {
			// 削除すると空行ができる場合
			$bringRow.children('.EOL').before($bc);
			$nextRow.remove();
			return;
		}
		$bc.remove();
		$bringRow.children('.EOL').before($bc);
		backChar($nextRow);
	}
	function backSpaceOnConvert() {
		var $inputBuffer = $('.input-buffer');
		var $selectConvertView = $('.convert-view[data-alternativeList="select"]');
		var hira = getStringFromRow($selectConvertView.children('.vertical-row').last());
		if(hira.length<2){
			var $oldSelectPhrase = $inputBuffer.children('.vertical-char.selectPhrase');

			var prevPhraseNum = $('.alternative-focus').siblings('.phrase-num').text();
			var $prevSelectConvertView = $('.convert-view[data-alternativeList="select"]');
			var $newSelectConvertView = $prevSelectConvertView.next('.convert-view');
			var newPhraseNum = $newSelectConvertView.children('.phrase-num').text();
			// 最後に達していたら最初に戻る
			if(!($newSelectConvertView[0])){
				$newSelectConvertView = $('.convert-view').first();
				newPhraseNum = $newSelectConvertView.children('.phrase-num').text();
			} 
			var $newPhrases = $('.input-buffer > .vertical-char[data-phrase_num='+ newPhraseNum + ']');
			$prevSelectConvertView.attr('data-alternativeList','nonselect');
			// $prevSelectConvertView.data('alternativeList','nonselect');
			$newSelectConvertView.attr('data-alternativeList','select');
			// $newSelectConvertView.data('alternativeList','select');
			$('.input-buffer > .vertical-char.selectPhrase').removeClass('selectPhrase');
			$newPhrases.addClass('selectPhrase');
			$('.alternative-focus').removeClass('alternative-focus');
			$newSelectConvertView.children('.vertical-row:first-of-type').addClass('alternative-focus');

			if($inputBuffer.children('.vertical-char').length > 2){
				$selectConvertView.remove();
				$oldSelectPhrase.remove();
			}else{
				// inputBufferが空になった
				$('.convert-view').remove();
				$inputBuffer.empty().hide(); // inputBufferを空にして隠す
			}
			return;
		}
		getKanjiForOnePhrase(hira.substring(0,hira.length-1),$selectConvertView);

	}
	function shiftUpOnConvert() {
		var $firstConvertView = $('.convert-view[data-alternativeList="select"]');
		var $secondConvertView = $firstConvertView.next('.convert-view');
		var firstKana = getStringFromRow($firstConvertView.children('.vertical-row').last());
		if(firstKana.length < 2) return;
		var newStr;
		var secondKana;
		if(!($secondConvertView[0])){
			// 最後の文節の場合
			// 分離
			newStr = firstKana.substring(0,firstKana.length-1) + "," + firstKana.substring(firstKana.length-1,firstKana.length);
			getKanjiForSplit(newStr,$firstConvertView);
			return;
		}else{
			secondKana = getStringFromRow($secondConvertView.children('.vertical-row').last());
		}
		newStr = firstKana.substring(0,firstKana.length-1) + ","+ firstKana.substring(firstKana.length-1,firstKana.length) + secondKana;
		getKanjiForChangePhrase(newStr,$firstConvertView,$secondConvertView);
	}
	function shiftLeftAlternativeFocus() {
		// 漢字変換候補一覧のフォーカスを左にシフトさせる
		$preSelect = $('.alternative-focus');
		$newSelect = $preSelect.next('.vertical-row');
		if(!($newSelect[0])) return;
		$preSelect.removeClass('alternative-focus');
		$newSelect.addClass('alternative-focus');
		// inputBufferの文字を入れ替える
		var phraseNum = $newSelect.siblings('.phrase-num').text();
		var selectKanji = getStringFromRow($newSelect);
		insertPhraseToInputBuffer(phraseNum,selectKanji);
		// selectphraseクラスの付け替え
		$('.selectPhrase').removeClass('selectPhrase');
		$('.input-buffer > .vertical-char[data-phrase_num='+ phraseNum +']').addClass('selectPhrase');

		resizeInputBuffer();
	}
	function shiftRightAlternativeFocus() {
		// 漢字変換候補一覧のフォーカスを右にシフトさせる
		$preSelect = $('.alternative-focus');
		$newSelect = $preSelect.prev('.vertical-row');
		if(!($newSelect[0])) return;
		$preSelect.removeClass('alternative-focus');
		$newSelect.addClass('alternative-focus');
		var phraseNum = $newSelect.siblings('.phrase-num').text();
		var selectKanji = getStringFromRow($newSelect);
		insertPhraseToInputBuffer(phraseNum,selectKanji);
		// selectphraseクラスの付け替え
		$('.selectPhrase').removeClass('selectPhrase');
		$('.input-buffer > .vertical-char[data-phrase_num='+ phraseNum +']').addClass('selectPhrase');

		resizeInputBuffer();
	}
	function moveInput() {
		// inputBufferの位置を調整する
		var cursorPosObj = getCursorPos();
		var x = cursorPosObj.x;
		var y = cursorPosObj.y;
		var $inputBuffer = $('.input-buffer');
		$inputBuffer.css('top',y).css('left',x);
		resizeInputBuffer();
	}
	function resizeInputBuffer() {
		// inputBufferの高さ調整
		var $inputBuffer = $('.input-buffer');
		var $character = $inputBuffer.children('.vertical-char:first-of-type');
		// borderは上下合わせて２つある
		var height = $character.outerHeight() * ($inputBuffer.children('.vertical-char').length-1) + 5;
		$inputBuffer.css('height',height);
	}

	function getData() {
		var data = new Object();
		data.conf = new Object();
		data.text = getTextObj();
		return JSON.stringify(data);
	}
	function getTextObj() {
		/*
		 * example
		 * array[paragraph[{charObj},{charobj}],paragraph[{charObj}]]
		 * data = {
		 * "conf":{},
		 * "text":[ // getTextObj()
		 * 				[ // getParagraphDataArray()
		 * 				[], // getParagraphClassArr()
		 * 				[ // charArray
		 * 					{ // Characterdata();
		 * 						"char":"あ",
		 * 						"decolation":["decolation-color-blue"]
		 * 					},
		 * 					{
		 * 						"char":"い",
		 * 						"decolation":null
		 * 					}
		 * 					]
		 * 				], // getParagraphDataArray()
		 * 				[
		 * 					{
		 * 						"char":"う",
		 * 						"decolation":null
		 * 					}
		 * 				],
		 * 				[]		// 段落配列が空　＝　空行
		 * 			] // getTextObj()
		 * 			}
		 */
		var paragraphArrays = new Array();
		var $paragraphs = $('#vertical-draft > .vertical-paragraph');
		for (var i = 0; i < $paragraphs.length; ++i) {
			paragraphArrays[i] = getParagraphDataArray($paragraphs.eq(i));
		}
		return paragraphArrays;
	}
	function getParagraphDataArray($paragraph) {
		var paraArr = new Array();
		paraArr[0] = getParagraphClassArr();
		var $chars = $paragraph.find('.vertical-char').not('.EOL');
		var charLen = $chars.length;
		var charArray = new Array();
		for (var i = 0; i < charLen; i++) {
			charArray[i] = new CharacterData($chars.eq(i));
		}
		paraArr[1] = charArray;
		return paraArr;
	}
	function getParagraphClassArr(){
		var arr = new Array();
		return arr;
	}
	function CharacterData($character) {
		// constructor
		var classArray = $character.attr('class').match(/decolation-\S+/g);
		this["char"] = $character.text();
		this["decolation"] = classArray;
	}
	// function createCharChain(){
	// 	var eChars = document.getElementById('vertical-draft').getElementsByClassName('vertical-char');
	// 	var eChar;
	// 	var cnt;
	// 	var prevChar = null;
	// 	var nextChar = null;
	// 	for(var i=0,cnt=chars.length;i<cnt;i++){
	// 		eChar = chars[i];
	// 		if(eChar.classList.contains('EOL')) continue;
	// 	}
	// }
	// function Chars(_elem){
	// 	var classArr = _elem.className.match(/decolation-\S+/g);
	// 	this = {
	// 		prev: null,
	// 		next: null,
	// 		get elem(){ return _elem; },
	// 		set elem(){},
	// 		get text(){ return _elem.textContent;},
	// 		set text(c){
	// 			if(c.length === 1){
	// 				_elem.textContent = c;
	// 			}
	// 		},
	// 		get strClass(){
	// 			return _elem.className;
	// 		},
	// 		get classes(){
	// 			if(classArr){
	// 				return classArr;
	// 			}else{
	// 				return [];
	// 			}
	// 		},
	// 		toString: function(){
	// 			var str = "<span class='"+ classArr[0]"'>"+ this.text +"</span>";
	// 			str = 
	// 	var htmlChar = "<span class='vertical-char display-char";
	// 	var classArr = obj["decolation"];
	// 	if (classArr) {
	// 		for (var i = 0; i < classArr.length; i++) {
	// 			htmlChar += " " + classArr[i];
	// 		}
	// 	//// 特殊クラスの付与
	// 	if(key_table.dotList.indexOf(c) !== -1) htmlChar += " vertical-dot";
	// 	if(key_table.beforeBracketList.indexOf(c) !== -1) htmlChar += " vertical-before-bracket";
	// 	if(key_table.afterBracketList.indexOf(c) !== -1) htmlChar += " vertical-after-bracket";
	// 	if(key_table.lineList.indexOf(c) !== -1) htmlChar += " character-line";
	// 	if (/[a-z]/.test(c)) htmlChar += " alphabet";
	// 	if (/[１-９]/.test(c)) htmlChar += " suzi";
	// 	if (/[っゃゅょぁぃぅぇぉ]/.test(c)) htmlChar += " yoin";
	// 	htmlChar += "'>";
	// 	htmlChar += c;
	// 	htmlChar += "</span>";
	// 		},
	// 	}
	// }
	function splitArray(baseArray,cnt) {
		// baseArrayをcnt個ずつの配列に分割する
		var b = baseArray.length;
		var newArray = [];

		for (var i = 0; i < Math.ceil(b/cnt); i++) {
			var j = i*cnt;
			var p = baseArray.slice(j,j+cnt);
			newArray.push(p);
		}
		return newArray;
	}
	function appendParagraphFromObj(paraObjArr) {
		"use strict";
		var strHtml = "";
		for (var i = 0; i < paraObjArr.length; i++) {
			strHtml += createParagraphFromObj(paraObjArr[i]);
		}
		document.getElementById("vertical-draft").innerHTML = strHtml;
	}
	function createParagraphFromObj(paraObj) {
		"use strict";
		// 文字列をstrLen文字ごとに区切って行にして、paragraphにappendする
		var strLen = getStringLenOfRow();
		var strPara = "<div class='vertical-paragraph'>";
		var objArray = splitArray(paraObj[1],strLen);
		// var objArray = splitArray(paraObj,strLen);
		for (var i = 0; i < objArray.length; i++) {
			strPara += createRowFromObj(objArray[i]);
		}
		if (objArray.length === 0) {
			strPara += createRowFromObj(objArray); // 空行の場合、空配列を渡す
		}
		strPara += "</div>";
		return strPara;
	}
	function createRowFromObj(objArray) {
		"use strict";
		var htmlRow = '<div class="vertical-row">';
		var strInnerHtml = "";
		var cnt;
		for (var i = 0; i < (cnt = objArray.length); i++) {
			htmlRow += createCharacterFromObj(objArray[i]);
		}
		htmlRow += "<span class='vertical-char EOL display-char'></span></div>"
		return htmlRow;
	}
	function createCharacterFromObj(obj) {
		// 文字列からjQueryオブジェクトを作成
		// クラスを追加するには、最初に半角スペースを入れること
		var c = obj["char"];
		var htmlChar = "<span class='vertical-char display-char";
		var classArr = obj["decolation"];
		if (classArr) {
			for (var i = 0; i < classArr.length; i++) {
				htmlChar += " " + classArr[i];
			}
		}
		//// 特殊クラスの付与
		if(key_table.dotList.indexOf(c) !== -1) htmlChar += " vertical-dot";
		if(key_table.beforeBracketList.indexOf(c) !== -1) htmlChar += " vertical-before-bracket";
		if(key_table.afterBracketList.indexOf(c) !== -1) htmlChar += " vertical-after-bracket";
		if(key_table.lineList.indexOf(c) !== -1) htmlChar += " character-line";
		if (/[a-z]/.test(c)) htmlChar += " alphabet";
		if (/[１-９]/.test(c)) htmlChar += " suzi";
		if (/[っゃゅょぁぃぅぇぉ]/.test(c)) htmlChar += " yoin";
		htmlChar += "'>";
		htmlChar += c;
		htmlChar += "</span>";
		return htmlChar; // 返すのは文字列
	}
	function setDecolation(obj) {
		// 付与クラスの文字列を配列で返す
		var classArr = [];
		if (obj["color"]) { classArr.push(obj["color"]); }
		return classArr;
	}
	function setFontSize(size) {
		var $chars = $('#vertical-draft').find('span.vertical-char');
		var $paras = $('#vertical-draft').find('div.vertical-paragraph');
		$chars.removeClass('decolation-font-big');
		$chars.removeClass('decolation-font-small');
		$paras.removeClass('decolation-font-big');
		$paras.removeClass('decolation-font-small');
		switch (size) {
			case 'big':
						$chars.addClass('decolation-font-big');
						$paras.addClass('decolation-font-big');
							break;
			case 'middle':
							break;
			case 'small':
						$chars.addClass('decolation-font-small');
						$paras.addClass('decolation-font-small');
							break;
			default:
							break;
		}
		addDisplayRow(0,getDisplayRowLen());
		resetDisplayChar();
		changeDisplayChar();
	}
	// 文章ゲッター(label:strgetter)
	function getRowLen() {
		// 文書内の行数
		var $rows = $('#vertical-draft > .vertical-paragraph > .vertical-row');
		return $rows.length;
	}
	function getRowLenOnCursorPage() {
		// 現在ページの行数
		var $row = $('.cursor-row');
		var cnt = getCurrentRowOnPage(); // 現在行を加える
		// 後ろに数える
		while ($row[0] && !($row.hasClass('page-last-row'))) {
			cnt++;
			$row = $row.nextObj('#vertical-draft .vertical-row');
		}
		return cnt;
	}
	function getCurrentRowPos() {
		// 文書内での現在行
		var rowNum = $('.vertical-paragraph > .vertical-row').index($('.cursor').closest('.vertical-row')) +1;
		return rowNum;
	}
	function getCurrentRowOnPage() {
		// 現在ページ内で何行目にいるか
		var $row = $('.cursor-row');
		var cnt = 1; // page-break行の分
		// 前にさかのぼって数える
		while ($row[0] && !($row.hasClass('page-break'))) {
			cnt++;
			$row = $row.prevObj('#vertical-draft .vertical-row');
		}
		return cnt;
	}
	function getCurrentStringPosOnRow() {
		// 現在文字位置
		var $cursor = $('.cursor');
		var strNum = $('.cursor-row').children('.vertical-char').index($cursor);
		return strNum;
	}
	function getStringLenOfCursorRow() {
		// カーソル行の全文字数
		var strLen = $('.cursor-row > .vertical-char').length;
		return strLen - 1; // EOLの分を除く
	}
	function getCurrentPagePos() {
		// 現在ページ
		// page-breakを持つ行を探して段落をさかのぼり、その段落に複数のpage-breakがあればcursor行またはその段落の最後の行から行を遡ることでpage-breakを探している
		var $currentParagraph = $('.cursor-row').closest('.vertical-paragraph');
		var $currentPage;
		while (!($currentPage = $currentParagraph.children('.vertical-row.page-break'))[0]) {
			$currentParagraph = $currentParagraph.prev('.vertical-paragraph');
		}
		if ($currentPage.length > 1) {
			if (!($currentParagraph.children('.cursor-row'))[0]) {
				var $row = $('.cursor-row');
				while (!($row.hasClass('page-break'))) {
					$row = $row.prev('.vertical-row');
					$currentPage = $row;
				}
			}else{
				$currentPage = $currentParagraph.children('.page-break:last-of-type');
			}
		}
		return $('.page-break').index($currentPage) + 1;
	}
	function getPageLen() {
		// 文書内の全ページ数
		return $('.page-break').length;
	}
	function getRowLenOnPage() {
		// 1ページの行数
		return 40;
	}
	function getStringLenOfRow() {
		// 1行の文字数
		return 40;
	}
	function getConfDecoChar(){
		var rtnArr = [];
		var color = document.getElementById('color-btn').className.match(/select-(\S+)/);
		if(color){
			rtnArr.push('decolation-color-' + color[1]);
		}
		if(document.getElementById('btn-bold').classList.contains('active')) rtnArr.push('decolation-font-bold');
		if(document.getElementById('btn-italic').classList.contains('active')) rtnArr.push('decolation-font-italic');
		return rtnArr;
	}
	// ===================================================================
	// 		カーソル操作(label:cursor)
	// ===================================================================
	function moveCursorToClickPos(e) {
		if ($('.input-buffer').text() !== "") { return; }
		var prev = $('.cursor');
		getCharOnRowClick($(this),e).addCursor(); // クリックした行のうち最も近い文字にカーソルが当たる
		Cursor.repositionCharNum();
		printDocInfo();
	}
	function setNOCLine() {
		// カーソルのある文字が何文字目かを記憶する要素群を作成する
		// カーソルを左右に動かすときに利用する
		var $container = $('#app-container');

		var strLen = getStringLenOfRow();
		var $NOCLine = $('<div>').attr('id','NOC-line');
		var $numberOfChar;
		for (var i = 0; i < strLen; i++) {
			$numberOfChar = $('<span>').addClass('number-of-char');
			$NOCLine.append($numberOfChar);
		}
		$('#vertical-draft').before($NOCLine);
	}

	function getCharOnRowClick($row,rowEo) {
		// クリック箇所にもっとも近い.vertical-charオブジェクトを返す
		// @param $row .vertical-rowクラスのオブジェクトｊ
		// @param rowEo クリックイベントのイベントオブジェクト
		var clickPos = {
			x: rowEo.pageX,
			y: rowEo.pageY
		};
		var $chars = $row.children('.vertical-char');
		var $resultObj = $chars.first('.vertical-char');
		var min = Number.MAX_VALUE;
		$chars.each(function () {
			var $self = $(this);
			var distance = $self.getDistanceP2O(clickPos);
			if (distance < min) {
				min = distance;
				$resultObj = $self;
			}
		});
		return $resultObj;
	}
	// ２つの要素の中心点同士の距離を求める
	function getDistanceBetweenObj($a,$b) {
		var aCenterPos = getPosCenterPoint($a);
		var bCenterPos = getPosCenterPoint($b);
		return getDistanceP2P(aCenterPos.x,aCenterPos.y,bCenterPos.x,bCenterPos.y);
	}
	// ある点とオブジェクトの中心点の距離を求める
	// ex: po = {x:10,y:10}
	function getDistanceP2O(po,$obj) {
		var objPos = getPosCenterPoint($obj);
		return getDistanceP2P(po.x,po.y,objPos.x,objPos.y);
	}
	// ２点間の距離を求める
	function getDistanceP2P(x1,y1,x2,y2) {
		// ２乗を使っているので、戻り値は必ず正の数になる
		// √{(b.x - a.x)^2+ (b.y - a.y)^2}
		return Math.sqrt(Math.pow(x2-x1,2)+Math.pow(y2-y1,2));
	}
	// オブジェクトの中心点の座標を求める
	function getPosCenterPoint($obj) {
		var objPos = getPosObj($obj);
		var objWidth = parseInt($obj.css('width'));
		var objHeight = parseInt($obj.css('height'));
		return {
			x: objPos.x + objWidth/2,
			y: objPos.y + objHeight/2
		}
	}
	function getCursorPos() {
		return $('.cursor').getPosObj();
	}
	function getPosObj($obj) {
		// window上の絶対座標
		var offset = $obj.offset();
		var x = offset.left;
		var y = offset.top;
		return {
			'x' : x,
			'y' : y
		}
	}
	var Cursor = {
		init: function () {
			$('.vertical-char').first().addClass('cursor');
			$('#NOC-line > .number-of-char:first-of-type').addClass('cursor_char');
			this.addCursorRow();
			resetDisplayChar();
		},
		addCursorRow : function () {
			var $oldCursorRow = $('.vertical-paragraph > .vertical-row.cursor-row');
			if ($oldCursorRow[0]) {
				$oldCursorRow.removeClass('cursor-row');
			}
			$('.cursor').closest('.vertical-row').addClass('cursor-row');
		},
		next : function() {
			// カーソルを次の文字に移動する
			var $prev = $('.cursor');
			var $next = $prev.nextObj('#vertical-draft .vertical-char');
			if (!($next[0])) {
				// 文章の最後に達していたら、何もしない
				return;
			}
			$next.addCursor(false);
			// markしたまま別の行に移り、そのまま上下キーを押してmarkを動かすこともあるので、markを１文字ずつ動かすのでは期待通りの動きをしてくれない
			this.repositionCharNum();
		},
		prev : function () {
			// カーソルを前の文字に移動する
			var $prev = $('.cursor');
			var $next = $prev.prevObj('#vertical-draft .vertical-char');
			if (!($next[0])) {
				return;
			}
			$next.addCursor(false);
			this.repositionCharNum();
		},
		shiftRight: function () {
			// カーソルを前の行に移動する
			var $prev = $('.cursor');
			var NOCNum = $('#NOC-line').children('.number-of-char').index($('.cursor_char'));
			var $next = $('#vertical-draft .cursor-row').prevObj('#vertical-draft .vertical-row').children('.vertical-char').eq(NOCNum);
			if (!($next[0])) {
				// 右の行の文字数が現在文字より小さい
			var $next = $('#vertical-draft div.cursor-row').prevObj('#vertical-draft .vertical-row').children('.vertical-char:last-of-type');
			}
			if (!($next[0])) { return; }
			$next.addCursor(false);
		},
		shiftLeft: function () {
			// カーソルを次の行に移動する
			var $prev = $('.cursor');
			var NOCNum = $('#NOC-line').children('.number-of-char').index($('.cursor_char'));
			var $next = $prev.closest('div.vertical-row').nextObj('#vertical-draft .vertical-row').children('.vertical-char').eq(NOCNum);
			if (!($next[0])) {
			 $next = $prev.closest('.vertical-row').nextObj('#vertical-draft .vertical-row').children('.vertical-char:last-of-type');
			}
			if (!($next[0])) { return; }
			$next.addCursor(false);
		},
		repositionCharNum: function () {
			// charNumの位置を再調整
			var cursorPos = $('.cursor').closest('.vertical-row').children().index($('.cursor'));
			$('.cursor_char').removeClass('cursor_char');
			$('#NOC-line > .number-of-char').eq(cursorPos).addClass('cursor_char');
			// cursor-rowの 調整
			this.addCursorRow();
		},
		jumpForRow: function (rowNum) {
			// 指定行にジャンプする。画面中央に指定行及びカーソルが来るように調整
			var $targetRow = $('.vertical-paragraph > .vertical-row').eq(rowNum-1);
			if (!$targetRow[0]) { return; }
			// cursor
			// $('.cursor').removeClass('cursor');
			// $targetRow.children('.vertical-char:first-of-type').addClass('cursor');
			$targetRow.children('.vertical-char:first-of-type').addCursor(true);
			// this.addCursorRow();
			this.repositionCharNum();
			// display
			// var cursorRowPos = $('.vertical-paragraph > .vertical-row').index($('.cursor-row'));
			// var startDispNum = (cursorRowPos-getDisplayRowLen()/2)>=0?cursorRowPos-getDisplayRowLen()/2:$('.vertical-paragraph > .vertical-row').index($('.vertical-paragraph > .vertical-row:first-of-type'));
			// addDisplayRow(startDispNum,startDispNum+getDisplayRowLen());
			// resetDisplayChar();
			// printDocInfo();
		},
		jumpForPage: function (pageNum) {
			// 指定ページにジャンプする。カーソルは１行目
			var startDispNum = $('.vertical-paragraph > .vertical-row').index($('.page-break').eq(pageNum-1));
			var $targetRow = $('.vertical-paragraph > .vertical-row').eq(startDispNum);
			if (!$targetRow[0]) { return; }
			// cursor
			// $('.cursor').removeClass('cursor');
			// $targetRow.children('.vertical-char:first-of-type').addClass('cursor');
			$targetRow.children('.vertical-char:first-of-type').addCursor(false);
			// this.addCursorRow();
			this.repositionCharNum();
			// display
			addDisplayRow(startDispNum,startDispNum+getDisplayRowLen());
			// resetDisplayChar();
			// printDocInfo();
		}
	};
	function findNext(){
		var $prevCursor = $('.cursor');
		var $nextCursor = $prevCursor.nextObj('#vertical-draft .search-label,.cursor',true);
		if(!$nextCursor[0]) return;
		$nextCursor.addCursor(true);
		Cursor.repositionCharNum();
	}
	function findPrev(){
		var $prevCursor = $('.cursor');
		var $nextCursor = $prevCursor.prevObj('#vertical-draft .search-label,.cursor',true);
		if(!$nextCursor[0]) return;
		$nextCursor.addCursor(true);
		Cursor.repositionCharNum();
	}
	function find(word){
		console.log('find:'+ word);
		// if(word === '') return;
		// 検索字句にクラスを付与する
		var old = document.getElementById('vertical-draft').getElementsByClassName('search-label');
		while(old[0]){ // クラスをremoveするとoldからその要素がなくなって詰められる
			old[0].classList.remove('search-label');
		}
		old = document.getElementById('vertical-draft').getElementsByClassName('search-word');
		while(old[0]){
			old[0].classList.remove('search-word');
		}
		console.log('removed');
		if(word === '') return;

		var chars = document.getElementById('vertical-draft').getElementsByClassName('vertical-char');
		var indexArr = findIndex(word);
		console.log(indexArr);
		var len = word.length;
		for(var i=0;i<indexArr.length;i++){
			chars[indexArr[i]].classList.add('search-label');
			for(var j=0;j<len;j++){
				chars[indexArr[i]+j].classList.add('search-word');
			}
		}
			if(!document.getElementById('vertical-draft').getElementsByClassName('cursor')[0].classList.contains('search-label')) findNext();
	}
	function findIndex(word){
		// 字句検索
		// 1文字目のインデックスの配列を返す
		// var $chars = $('#vertical-draft .vertical-character');
		var indexArr = [];
		var chars = document.getElementById('vertical-draft').getElementsByClassName('vertical-char');
		// var charObj = {};
		for(var i=0;i<chars.length;i++){
			indexArr[i] = i;
		}
		for(var i=0;i<word.length;i++){
			var searchChar = word.charAt(i);
			for(var j=0;j<indexArr.length;j++){ // lengthは変動する
				// if($chars.eq(indexArr[j]+i).text() !== searchChar){
				if(chars.item(indexArr[j]+i).textContent != searchChar){
					indexArr.splice(j,1); // j番目から要素を一つ削除する
					j--;
				}
			}
		}
		return indexArr;
	}
	// =====================================================================
	// 		表示操作(label:display)
	// =====================================================================
	function reDisplay() {
		var startDispNum = $('.vertical-paragraph > .vertical-row').index($('.display-row').first());
		addDisplayRow(startDispNum,startDispNum+getDisplayRowLen()); // 途中行数変化
		// if (getRowLen() >= getDisplayRowLen()) {
		// 	// 全行数が表示行数より多い
		// 	changeDisplayRow(false); // カーソル移動
		// }else{
		// 	$('.vertical-paragraph > .vertical-row').addClass('display-row');
		// }
	}
	function changeDisplayRow(bl) {
		console.time('changeDisplayRow()');
		// カーソルが移動した時の、表示領域の調整
		// bl: trueならカーソルを画面中央に配置する
		var $cursor = $('#vertical-draft .cursor');
		var $cursorRow = $cursor.closest('.vertical-row');
		if($cursorRow.hasClass('display-row')){
			console.log('cursorRow has dispaly-row');
			return;
		}
		$cursorRow.addClass('display-row');
		if($('.display-row').length <= getDisplayRowLen()) return;
		var $nextRow = $cursorRow.nextObj('#vertical-draft .vertical-row');
		var $prevRow = $cursorRow.prevObj('#vertical-draft .vertical-row');
		if ($nextRow.hasClass('display-row')) {
			// カーソルが一行前にはみ出した
			$('.display-row').last().removeClass('display-row');
			resetDispNum();
		}else if($prevRow.hasClass('display-row')){
			// カーソルが一行後にはみ出した
			$('.display-row').first().removeClass('display-row');
			resetDispNum();
		}else if(bl){
			// カーソルが二行以上はみ出し、かつカーソルを中央配置する
			var $rows = $('#vertical-draft .vertical-row');
			var cursorRowPos = $rows.index($('.cursor-row'));
			var start = cursorRowPos - getDisplayRowLen()/2;
			start = start>=0?start:0;
			addDisplayRow(start,start+getDisplayRowLen());
		}else{
			// カーソルが二行以上はみ出した
			var currentStart = $('.vertical-row').index($('.display-row').first());
			var cursorIndex = $('.vertical-row').index($cursorRow);
			var currentEnd = $('.vertical-row').index($('.display-row').last());
			var start = 0;
			if (cursorIndex < currentStart) {
				// カーソルが前にある
				start = cursorIndex;
			}else if(cursorIndex > currentEnd){
				// カーソルが後ろにある
				start = currentStart + (cursorIndex - currentEnd);
			}else{
				// display-rowに囲まれた部分にdisplay-rowでない行がある場合
				// 途中行数変化
				start = currentStart;
				return;
			}
			addDisplayRow(start,start+getDisplayRowLen());
		}
		console.timeEnd('changeDisplayRow()');
	}
	function addDisplayRow(start,end) {
		console.log('addDisplayRow()');
		// start行目からend行目まで表示させる
		//var $oldDisplayRows = $('.vertical-row.display-row').removeClass('display-row');
		var eOldDisplayRows = document.getElementsByClassName('display-row');
		//if ($oldDisplayRows[0]) { $oldDisplayRows.removeClass('display-row'); }
		while (eOldDisplayRows.length > 0) {
			eOldDisplayRows.item(0).classList.remove("display-row");
		}

		// var $verticalRows = $('.vertical-paragraph > .vertical-row');
		var rows = document.getElementById('vertical-draft').getElementsByClassName('vertical-row');
		// var $row;
		var row;
		var rowLen = rows.length;
		if(end>rowLen){
			end = rowLen;
			start = end - getDisplayRowLen();
			if(start < 0) start = 0;
		}
		var k = 0;
		for (var i = start; i < end; i++) {
			// $row = $verticalRows.eq(i);
			row = rows.item(i);
			// $row.addClass('display-row');
			row.classList.add('display-row');
			// row.setAttribute('data-dispnum',k++);
			row.dataset.dispnum = k++;
		}
		console.timeEnd('addDisplayRow()');
	}
	function changeDisplayChar() {
		console.time('changeDisplayChar()');
		var eCursor = document.getElementById('vertical-draft').getElementsByClassName('cursor').item(0);
		var eCursorRow = eCursor.parentNode;
		var chars = eCursorRow.childNodes;
		if (eCursor.classList.contains('EOL') && eCursor.previousElementSibling) {
			eCursor = eCursor.previousElementSibling;
		}
		if(eCursor.classList.contains('display-char')){
			console.log('cursor has display-char');
			return;
		}
		var start;
		var currentStart = index(eCursorRow.querySelector('.display-char'),chars);
		var cursorIndex = index(eCursor,chars);
		var currentEnd = index(eCursorRow.querySelectorAll('.display-char').item(eCursorRow.querySelectorAll('.display-row').length-1),chars);
		if (cursorIndex < currentStart) {
			// カーソルが前にある
			start = cursorIndex;
		}else if(currentEnd > 0 && cursorIndex > currentEnd){
			// カーソルが後ろにある
			start = currentStart + (cursorIndex - currentEnd);
		}else{
			// display-charに囲まれた部分にdisplay-charでない文字がある場合
			// あるいはdisplay-charが一つもない状態の場合
			resetDisplayChar();
			changeDisplayChar();
			return;
		}
		var displayRow = document.querySelectorAll('#vertical-draft .display-row');
		// replaceDispChar(start,displayRow);
		var cnt
		for(var i=0,cnt=displayRow.length;i<cnt;i++){
			dispCharOfRow(start,displayRow.item(i));
		}
		console.timeEnd('changeDisplayChar()');
	}
	function index(target,elements){
		var index = -1;
		for(var i=0;i<elements.lenght;i++){
			if(elements.item(0) == target)
				index = i;
		}
		return index;
	}
	function resetDisplayChar() {
		console.time('resetDisplayChar()');
		var dispRow = document.getElementById('vertical-draft').getElementsByClassName('display-row');
		// replaceDispChar(0,dispRow);
		var cnt;
		for(var i=0,cnt=dispRow.length;i<cnt;i++){
			dispCharOfRow(0,dispRow[i]);
		}
		console.log('resetDisplayChar');
		console.timeEnd('resetDisplayChar()');
	}
	function replaceDispChar(start,dispRows){
		var range = document.createRange();
		range.setStartBefore(dispRows[0].parentNode);
		range.setEndAfter(dispRows[dispRows.length-1].parentNode);
		var fragment = range.cloneContents();
		var frRows = fragment.querySelectorAll('.vertical-row');

		var cnt;
		for(var i=0,cnt=frRows.length;i<cnt;i++){
			dispCharOfRow(start,dispRows[i],frRows[i]);
		}
		range.deleteContents();
		range.insertNode(fragment);
		console.log(frRows);
	}
	//function addDisplayChar() {
	//	console.log('addDisplayChar');
	//	// 適正位置の文字にdisplay-charクラスを付与して表示する

	//	// 何文字目から表示するかを計算
	//	var $cursorRow = $('#vertical-draft .cursor-row');
	//	var $cursorChars = $cursorRow.children('.vertical-char');
	//	var $cursor = $cursorRow.children('.cursor');
	//	var rowHeight = parseInt($cursorRow.css('height'));
	//	var charsHeight = 0;
	//	var start = 0;
	//	for (var i = $cursorChars.index($cursor); i >= 0; i--) {
	//		var $char = $cursorChars.eq(i);
	//		if (!($char.hasClass('EOL'))) charsHeight += parseInt($char.css('height'));
	//		if (charsHeight <= rowHeight) {
	//			start = i;
	//		}else{
	//			break;
	//		}
	//	}

	//	var oldDisplayChar = $('#vertical-draft .display-row > .display-char').not('.EOL');
	//	var $displayRow = $('#vertical-draft .display-row');
	//	if (oldDisplayChar[0]) {
	//		oldDisplayChar.removeClass('display-char');
	//	}
	//	$displayRow.each(function () {
	//		dispCharOfRow(start,$(this));
	//	});
	//}
	function hasClass(elem,classRegExp){
		if(classRegExp.test(elem.className)){
			return true;
		}
		console.log(false);
		return false;
	}
	function dispCharOfRow(start,row,dfRow) {
		// console.time('dispCharOfRow()');
		var elRow = row.nodeName && row.nodeType===1 ? row : row[0];

		var range = document.createRange();
		// range.setStartBefore(dispRows[0]);
		// range.setEndAfter(dispRows[dispRows.length-1]);
		// range.selectNode(row);
		// var fragment = range.cloneContents();
		// var frChars = fragment.querySelectorAll('.vertical-char');
		// console.log('fragment:'+ fragment);
		// console.log('frChars:'+ frChars);
		// console.log('frChars[0]:'+ frChars[0]);

		// var cnt;
		// for(var i=0;i<(cnt = frRows.length);i++){
		// 	dispCharOfRow(start,frRows[i]);
		// }
		
		// $rowのstart文字目以降の各文字を$rowの高さに収まるだけdisplaycharクラスを付与する
		var dispHeight = elRow.clientHeight;
		var chars = elRow.childNodes;
		var charLen = chars.length;
		// console.log('chars:'+ chars);
		// console.log('charlen:'+ charLen);
		if (start > charLen) { return; }
		console.log('dfRow:'+dfRow);
		var dfChars = dfRow.querySelectorAll('.vertical-char');
		var htcnt = 0;
		var fontHeight = 0;
		for(var i=0;i<start;i++){
			// var classList = chars[i].classList;
			var classList = dfChars[i].classList;
			if(classList.contains('display-char')) classList.remove('display-char');
		}
		for (var i = start; i < charLen; i++) {
			var elChar = chars[i];
			var dfChar = dfChars[i];
			fontHeight = elChar.offsetHeight;
			htcnt += fontHeight;
			console.log('dispHeight:'+dispHeight);
			console.log('fontHeight:'+fontHeight);
			console.log('htcnt:'+ htcnt);
			if (htcnt < dispHeight || elChar.classList.contains('EOL')) {
				// if(!(elChar.classList.contains('display-char'))) elChar.classList.add('display-char');
				if(!(dfChar.classList.contains('display-char'))) dfChar.classList.add('display-char');
			}else{
				// if(elChar.classList.contains('display-char')) elChar.classList.remove('display-char');
				if(dfChar.classList.contains('display-char')) dfChar.classList.remove('display-char');
			}
		}

		// range.deleteContents();
		// range.insertNode(fragment);
		console.timeEnd('dispCharOfRow()');
	}
	function resetDispNum(){
			var k=0;
			$('.display-row').each(function(){
				// this.setAttribute('data-dispnum',k++);
				this.dataset.dispnum = k++;
			});
	}
	function getDisplayRowLen() {
		// 表示する行数
		var dispWidth = parseInt($('#vertical-draft').css('width'));
		// var dispWidth = parseInt($('#draft-container').css('width'));
		if (dispWidth <= 0) { return 0; }
		// var rowWidth = parseInt($('.vertical-paragraph > .vertical-row').css('width'));
		var rowWidth = parseInt($('.vertical-paragraph > .vertical-row').css('height'));
		var rowBorderWidth = 2;
		rowWidth += rowBorderWidth;
		var dispLen = dispWidth / rowWidth;
		return dispLen -1; // 一行だけ余裕をもたせる
	}
	function wheelEvent(e,delta,deltaX,deltaY) {
		// マウスホイールを動かすと、ページが左右に動く
		var $nextRow;
		if (delta > 0) {
			// ホイールを上に動かす
			for (var i = 0; i < 3; i++) {
				$nextRow = $('.display-row').first().prevObj('#vertical-draft .vertical-row');
				if (!$nextRow[0]) { break; }
				$nextRow.addClass('display-row');
				$('.display-row').last().removeClass('display-row');
				if (!($('.cursor-row').hasClass('display-row'))) { Cursor.shiftRight(); }
			}
		}else{
			// ホイールを下に動かす
			for (var i = 0; i < 3; i++) {
				$nextRow = $('.display-row').last().nextObj('#vertical-draft .vertical-row');
				if (!$nextRow[0]) { break; }
				$nextRow.addClass('display-row');
				$('.display-row').first().removeClass('display-row');
				if (!($('.cursor-row').hasClass('display-row'))) { Cursor.shiftLeft(); }
			}
		}
		resetDispNum();
			// var k=0;
			// $('.display-row').each(function(){
			// 	this.setAttribute('data-dispnum',k++);
			// });
		printDocInfo();
	}
	function getRowPadding(rowLen) {
		var dispWidth = parseInt($('#vertical-draft').css('width'))-50; // 負の数になることも考慮すること
		var rowWidth = parseInt($('.vertical-paragraph > .vertical-row').css('width'));
		// dispWidth / (rowWidth + padding*2) == rowLen
		var padding = (dispWidth/rowLen - rowWidth)/2;
		return padding;
	}

	// =====================================================================
	// 	選択操作(label:select)
	// =====================================================================
	function getSelect$Array(bl) {
		// 選択範囲のvertical-charを配列に入れて返す
		var retObjArray = new Array();
		var $chars = $('#vertical-draft .display-row .vertical-char').not('.EOL');
		var selection = getSelection();
		var selRange;
		var charRange = document.createRange();
		if(selection.rangeCount === 1){
			// 選択範囲が一箇所の場合
			selRange = selection.getRangeAt(0); // 選択範囲のRange
			for (var i = 0; i < $chars.length; i++) {
				// そのcharacterが選択範囲内にある場合に配列に入れている
				charRange.selectNodeContents($chars.eq(i).get(0).childNodes.item(0)); // 現在の要素を囲む範囲をcharRangeとして設定(jqueryオブジェクトからDOM要素を取得し、引数に渡している)
				// 開始位置が同じかselectの開始位置より文字の開始位置が後ろにあり、
				// 終了位置が同じかselectの終了位置より文字の終了位置が前にある
				if ((charRange.compareBoundaryPoints(Range.START_TO_START,selRange) >= 0
							&& charRange.compareBoundaryPoints(Range.END_TO_END,selRange) <= 0)
					) {
					retObjArray.push($chars.eq(i));
				}
			}
			selRange.detach();
		}
		charRange.detach();
		if(bl) selection.removeAllRanges(); // 選択を解除する
		return retObjArray;
	}
	// function isSelect(){
	// 	var selection = getSelection();
	// 	if(selection.rangeCount > 0) return true;
	// 	return false;
	// }
	function setClassOnSelect(strClass) {
		// 選択中の文字に装飾用クラスを付与する
		// 同じ種類のクラスをすでに持っていた場合は除去する
		var $objArray = getSelect$Array(true);
		var kind = (strClass.match(/(decolation-.+)-.+/))[1];
		var regexp = new RegExp(kind +'-\\S+'); // 正規表現オブジェクト
		for (var i = 0; i < $objArray.length; i++) {
			var rmClass = ($objArray[i].attr('class').match(regexp));
			$objArray[i].addClass(strClass);
			if (rmClass) { $objArray[i].removeClass(rmClass[0]); }
		}
	}
	function toggleClassOnSelect(strClass){
		var $objArray = getSelect$Array(true);
		var cnt;
		for (var i = 0; i < (cnt = $objArray.length); i++) {
			$objArray[i].toggleClass(strClass);
		}
	}
	function removeClassOnSelect(kind) {
		var $objArray = getSelect$Array(true);
		var regexp = new RegExp(kind +'-\\S+'); // 正規表現オブジェクト
		for (var i = 0; i < $objArray.length; i++) {
			var rmClass = ($objArray[i].attr('class').match(regexp));
			if (rmClass) { $objArray[i].removeClass(rmClass[0]); }
		}
	}
	function setColorOnSelect(color) {
		switch (color) {
			case 'black':
				removeClassOnSelect('decolation-color');
				break;
			case 'red':
				setClassOnSelect('decolation-color-red');
				break;
			case 'blue':
				setClassOnSelect('decolation-color-blue');
				break;
			default:
				break;
		}
	}
	function removeColorOnSelect() {
		removeClassOnSelect('decolation-color');
	}
	function setColor(color){
		console.log('set color:'+ color);
		$('#color-btn').removeClassByRegExp(/select-\S+/).addClass('select-'+ color);
	}
	function toggleFont(font){
		var elem = document.getElementById('btn-'+ font);
		elem.classList.toggle('active');
	}
	function setAlignCursorParagraph(align){
		$('#vertical-draft').children('.vertical-paragraph').has('.cursor-row').removeClassByRegExp(/decolation-textalign-\S+/).addClass('decolation-textalign-'+ align);
	}
	// =====================================================================
	// 		ファイル操作(label:file)
	// =====================================================================
	function readFile(fileID){
		"use strict";
		var userID = getUserID();
		$('#vertical-draft > .vertical-paragraph').remove();
		$.ajax({
			type : "POST",
			url : "/tategaki/ReadFile",
			data : {
				user_id: userID,
				file_id: fileID
			},
			context : {
				id : fileID
			},
			dataType : "json",
			success : function (data) {
				// 表示データを受け取ってからの処理
				// ファイル名を表示
				$('#file-title').val(data.filename).attr('data-file_id',this.id);
				// $('#file-title').val(data.filename).data('file_id',this.id);
				// 文章のhtml書き出し
				printString(data.literaArray,getStringLenOfRow());
				// 禁則処理
				checkKinsoku();
				// 最初の４０行のみ表示する
				addDisplayRow(0,getDisplayRowLen());
				Cursor.init();
				resetDisplayChar();
				$('.doc-info > .saved').text(data.saved);

				addPageBreak();
				printDocInfo();
			},
			error : function (XMLHttpRequest, textStatus, errorThrown) {
				alert("Error:"+ textStatus + ":\n" + errorThrown + ":status=" + XMLHttpRequest.status + "in readFile");
			}
		});
	}
	function readJsonFile(fileID){
		"use strict";
		console.log('readJsonFile("'+ fileID +'")');
		var userID = getUserID();
		console.log('readJsonFile userID:"'+ userID);
		$('#vertical-draft > .vertical-paragraph').remove();
		$.ajax({
			type : "POST",
			url : "/tategaki/ReadJsonFile",
			data : {
				user_id: userID,
				file_id: fileID
			},
			context : {
				id : fileID
			},
			dataType : "json",
			success : function (data) {
				// 表示データを受け取ってからの処理
				// ファイル名を表示
				$('#file-title').val(data.filename).attr('data-file_id',this.id);
				// $('#file-title').val(data.filename).data('file_id',this.id);
				// 文章のhtml書き出し
				var text = data.data.text;
				appendParagraphFromObj(text);
				checkKinsoku(); // 禁則処理
				addDisplayRow(0,getDisplayRowLen());
				Cursor.init();
				resetDisplayChar();
				$('.doc-info > .saved').text(data.saved);

				addPageBreak();
				printDocInfo();
			},
			error : function (XMLHttpRequest, textStatus, errorThrown) {
				alert("Error:"+ textStatus + ":\n" + errorThrown + ":status=" + XMLHttpRequest.status + "in readJsonFile");
			}
		});
	}
	function saveFile() {
		"use strict";
		var $fileTitle = $('#file-title');
		var userID = getUserID();
		var filename = $fileTitle.val();
		if (filename.length === 0) {
			userAlert("ファイル名を入力してください");
			return;
		}
		if (filename.indexOf("'") > -1 || filename.indexOf("<")>-1 || filename.indexOf(">")>-1) {
			userAlert("ファイル名に使用不可能文字が含まれています。");
			return;
		}
		var fileID = $fileTitle.attr('data-file_id');
		// var fileID = $fileTitle.data('file_id');
		if (fileID === "-1") {
			saveAs(filename);
			return;
		}
		var $paragraphs = $('#vertical-draft > .vertical-paragraph');
		var contentsArray = new Array();
		// 段落ごとに配列に格納
		for (var i = 0; i < $paragraphs.length; i++) {
			contentsArray.push(getStringFromParagraph($paragraphs.eq(i)));
		}
		var contentsJson = JSON.stringify(contentsArray);
		var nowDate_ms = Date.now() + "";

		$.ajax({
			type : "POST",
			url : "/tategaki/WriteFile",
			data : {
				user_id : userID,
				file_id: fileID,
				filename: filename,
				json: contentsJson,
				saved: nowDate_ms
			},
			context : {
				userID : userID,
				fileID: fileID
			},
			dataType : "json",
			success : function (data) {
				// 表示データを受け取ってからの処理
				console.log(data.result);
				$('.saved').text(data.strDate);
				getFileList(this.userID);
				console.log('保存しました:fileID=' + this.fileID);
			},
			error : function (XMLHttpRequest, textStatus, errorThrown) {
				alert("Error:"+ textStatus + ":\n" + errorThrown + ":status=" + XMLHttpRequest.status + "in saveFile");
			}
		});
	}
	function saveJsonFile() {
		"use strict";
		var $fileTitle = $('#file-title');
		var userID = getUserID();
		var filename = $fileTitle.val();
		if (filename.length === 0) {
			// alert("ファイル名を入力してください");
			userAlert("ファイル名を入力してください");
			return;
		}
		if (filename.indexOf("'") > -1 || filename.indexOf("<")>-1 || filename.indexOf(">")>-1) {
			// alert("ファイル名に使用不可能文字が含まれています。");
			userAlert("ファイル名に使用不可能文字が含まれています。");
			return;
		}
		var fileID = $fileTitle.attr('data-file_id');
		// var fileID = $fileTitle.data('file_id');
		if (fileID === "-1") {
			saveAs(filename);
			return;
		}
		var contentsJson = getData();
		var nowDate_ms = Date.now() + "";

		$.ajax({
			type : "POST",
			url : "/tategaki/WriteJsonFile",
			data : {
				user_id : userID,
				file_id: fileID,
				filename: filename,
				json: contentsJson,
				saved: nowDate_ms
			},
			context : {
				userID : userID,
				fileID: fileID
			},
			dataType : "json",
			success : function (data) {
				// 表示データを受け取ってからの処理
				console.log(data.result);
				$('.saved').text(data.strDate);
				getFileList(this.userID);
				console.log('保存しました:fileID=' + this.fileID);
				$('#user-info').text('保存しました');
			},
			error : function (XMLHttpRequest, textStatus, errorThrown) {
				alert("Error:"+ textStatus + ":\n" + errorThrown + ":status=" + XMLHttpRequest.status + "in saveJsonFile");
			}
		});
	}
	function getFileList(userID){
		"use strict";
		$.ajax({
			type : "POST",
			url : "/tategaki/GetFileList",
			data : {
				user_id: userID
			},
			dataType : "json",
			success : function (data) {
				// 表示データを受け取ってからの処理
				setFileListFromObject(data,$('#file-list'));
			},
			error : function (XMLHttpRequest, textStatus, errorThrown) {
				alert("Error:"+ textStatus + ":\n" + errorThrown + ":status=" + XMLHttpRequest.status + " in getFileList");
			}
		});
	}
	function setFileListFromObject(data,$parentUl) {
		/*
		 * dataの中身例
		 * data = {
		 * 	"directoryname": "root",
		 * 	"1":"sample",
		 * 	"8":"file",
		 * 	"6": {
		 * 		"directoryname": "dirname",
		 * 		"4":"indirfile",
		 * 		"9":"file",
		 * 		"12": {
		 * 			"directoryname": "seconddir",
		 * 			"17": "file"
		 * 		}
		 * 	}
		 * }
		 * fileID:filename
		 */
		$parentUl.empty();
		var $file;
		var filename;
		for (var fileID in data) {
			filename = data[fileID]; // filenameは、対象fileIDのファイル名か、ディレクトリならば再帰的にオブジェクトが入っている
			if (typeof filename === "string" && fileID !==  "directoryname") {
				// file
				$file = $('<a>').addClass('file').attr('href','#').attr('data-type','file').attr('data-file_id',fileID).attr('data-file_name',filename).text(filename);
				$parentUl.append($('<li>').append($file));
			}else if(typeof filename === "object"){
				// dir
				// 再帰的にリストを作成し、コラプスで開けるようにする
				var dirID = fileID;
				var $inner_directory = $('<ul>');
				setFileListFromObject(filename,$inner_directory);
				var $collapse = $('<div>').addClass('collapse').attr('id','directory'+dirID);
				var $inner_collapse = $('<div>').addClass('well').append($inner_directory);
				$collapse.append($inner_collapse);
				var $directory_link = $('<a>').addClass('directory').attr('data-toggle','collapse').attr('href','#directory'+dirID).attr('data-type','directory').attr('data-directory_id',fileID).attr('data-directory_name',filename.directoryname).html('<span class="glyphicon glyphicon-folder-close" aria-hidden="true"></span>'+filename.directoryname);
				$parentUl.append($('<li>').append($directory_link));
				$directory_link.after($collapse);
			}
		}
	}
	function keyupInSearchFileInput(e) {
		var keycode;
		if (document.all) {
			// IE
			keycode = e.keyCode
		}else{
			// IE以外
			keycode = e.which;
		}
		var $searchFile = $('#search-file');
		var searchWord = $searchFile.val();
		if (keycode == 13) {
			// enter
			var $file = getFileObjectFromFileName(searchWord);
			if ($file[0] && $file.length === 1) {
				readJsonFile($file.attr('data-file_id'));
				// readJsonFile($file.data('file_id'));
			}
			$('#file-list-modal').modal('hide');
			document.addEventListener('keydown',keyEvent,false);
		}else if (searchWord.length === 0) {
			getFileList(getUserID);
		}else{
			searchFile(searchWord);
		}
	}
	function searchFile(searchWord){
		"use strict";
		var userID = getUserID();
		$.ajax({
			type : "POST",
			url : "/tategaki/GetFileList",
			data : {
				user_id: userID
			},
			context: {
				userID: userID,
				search_word : searchWord
			},
			dataType : "json",
			success : function (data) {
				// 表示データを受け取ってからの処理
				setFileListFromObject(data,$('#file-list'));
				var $matchFilesArray = getFileObjectsFromFileNameMatch(this.search_word);
				setFileListFromArray($matchFilesArray);
			},
			error : function (XMLHttpRequest, textStatus, errorThrown) {
				alert("Error:"+ textStatus + ":\n" + errorThrown + ":status=" + XMLHttpRequest.status + " in searchFile");
			}
		});
	}
	function setFileListFromArray($array) {
		var $fileList = $('#file-list');
		$fileList.empty();
		var $obj;
		var fileID;
		var filename;
		var $file;
		var matchObjLength = $array.length;
		if (matchObjLength === 0) {
			$fileList.append($('<li>').text('該当するファイルは見つかりませんでした。'));
		}else{
			for (var i = 0; i < matchObjLength; i++) {
				$obj = $array[i];
				fileID = $obj.attr('data-file_id');
				filename = $obj.attr('data-file_name');
				$file = $('<a>').addClass('file').attr('href','#').attr('data-file_id',fileID).attr('data-file_name',filename).text(filename);
				$fileList.append($('<li>').append($file));
			}
		}
	}
	function readyFileModal() {
		// 開くボタンを押した時
		getFileList(getUserID());
		$('#search-file').val('').focus();
	}
	function getFileObjectsFromFileNameMatch(str) {
		// ファイル検索
		var regexp = new RegExp('.*'+ str +'.*'); // 正規表現オブジェクト
		var $array = new Array(); // マッチしたjqueryオブジェクトを入れる配列
		var $files = $('.file');
		$files.each(function () {
			var $self = $(this);
			var filename = $self.attr('data-file_name');
			// var filename = $self.data('file_name');
			if (regexp.test(filename)) {
				$array.push($self);
			}
		});
		return $array;
	}
	function defaultNewFile() {
		newFile('newfile');
	}
	function newFile(filename) {
		$('.vertical-paragraph').remove();
		appendParagraph("");
		$('.vertical-row').addClass('display-row').attr('data-dispnum',0).children('.vertical-char').first().addClass('cursor');
		// $('.vertical-row').addClass('display-row').data('dispnum',"0").children('.vertical-char').first().addClass('cursor');
		$('#file-title').val(filename).attr('data-file_id','-1');
		// $('#file-title').val(filename).data('file_id','-1');
		addPageBreak();
		Cursor.addCursorRow();
		printDocInfo();
	}
	//function createFile(filename){
	//	"use strict";
	//	console.log("communication start point");
	//	$('#vertical-draft > .vertical-paragraph').remove();
	//	var userID = getUserID();
	//	var nowDate_ms = Date.now() + "";
	//	$.ajax({
	//		type : "POST",
	//		url : "/tategaki/CreateFile",
	//		data : {
	//			filename: filename,
	//			user_id: userID,
	//			saved: nowDate_ms
	//		},
	//		context : {
	//			userID: userID
	//		},
	//		dataType : "json",
	//		success : function (data) {
	//			// 表示データを受け取ってからの処理
	//			if(data.newFileID) console.log("communication success!");
	//			$('#file-title').val(data.filename).attr('data-file_id',data.newFileID);
	//			readFile(data.newFileID);
	//			getFileList(this.userID);
	//		},
	//		error : function (XMLHttpRequest, textStatus, errorThrown) {
	//			alert("Error:"+ textStatus + ":\n" + errorThrown + ":status=" + XMLHttpRequest.status + "in createFile");
	//		}
	//	});
	//}
	function saveAs(filename) {
		// 名前をつけて保存
		"use strict";
		if (filename.indexOf("'") > -1 || filename.indexOf("<")>-1 || filename.indexOf(">")>-1) {
			userAlert("ファイル名に使用不可能文字が含まれています。");
			return;
		}
		var userID = getUserID();
		var nowDate_ms = Date.now() + "";
		$.ajax({
			type : "POST",
			url : "/tategaki/CreateFile",
			data : {
				filename: filename,
				user_id: userID,
				saved: nowDate_ms
			},
			context : {
				userID: userID
			},
			dataType : "json",
			success : function (data) {
				// 表示データを受け取ってからの処理
				$('#file-title').val(data.filename).attr('data-file_id',data.newFileID);
				// $('#file-title').val(data.filename).data('file_id',data.newFileID);
				saveJsonFile();
			},
			error : function (XMLHttpRequest, textStatus, errorThrown) {
				alert("Error:"+ textStatus + ":\n" + errorThrown + ":status=" + XMLHttpRequest.status + "in saveAs");
			}
		});
	}
	function defaultDeleteFile() {
		var fileID = $('#file-title').attr('data-file_id');
		// var fileID = $('#file-title').data('file_id');
		if (fileID === '-1') {
			$('#user-info').text('保存していないファイルです。');
			return;
		}
		deleteFile(fileID);
	}
	function deleteFile(fileID) {
		"use strict";
		var userID = getUserID();
		if(window.confirm('本当に削除しますか:'+ getFileNameFromFileID(fileID) + '('+ fileID +')')){
			$.ajax({
				type : "POST",
				url : "/tategaki/DeleteFile",
				data : {
					user_id: userID,
					file_id : fileID
				},
				context : {
					fileID : fileID
				},
				dataType : "json",
				success : function (data) {
					var successRecord = data.successRecord; // 処理行数の文字列
					var result = data.result; // true or false の文字列
					if (successRecord === "1" && result) {
						// 別ファイルに移動
						var $files = $('#file-list .file');
						for (var i = 0; i < $files.length; i++) {
							if ($files.eq(i).attr('data-file_id') !== this.fileID) {
							// if ($files.eq(i).data('file_id') !== this.fileID) {
								readJsonFile($files.eq(i).attr('data-file_id'));
								// readJsonFile($files.eq(i).data('file_id'));
								break;
							}
						}
						getFileList(getUserID());
					}else{
						alert("ファイル削除エラーです(ファイル番号："+ this.fileID + ")");
					}

				},
				error : function (XMLHttpRequest,textStatus,errorThrown) {
					alert("Error:" + textStatus + ":\n" + errorThrown + ":status=" + XMLHttpRequest.status + "in deleteFile ");
				}
			});
		}
	}

	function printDocInfo() {
		console.log('printDocInfo()');
		$('.doc-info > .str-num').text(getCurrentStringPosOnRow());
		$('.doc-info > .str-len').text(getStringLenOfCursorRow());
		$('.doc-info > .row-num').text(getCurrentRowOnPage());
		$('.doc-info > .row-len').text(getRowLenOnCursorPage());
		$('.doc-info > .page-num').text(getCurrentPagePos());
		$('.doc-info > .page-len').text(getPageLen());
	}
	function setFileTitle(filename) {
		$('input#file-title').val(filename);
	}
	function openNextFile() {
		console.log('openNextFile()');
		var $currentFileLi = $('#file-list > li').has('.file[data-file_id="'+ $('input#file-title').attr('data-file_id') +'"]');
		// var $currentFileLi = $('#file-list > li').has('.file[data-file_id="'+ $('input#file-title').data('file_id') +'"]');
		var $nextFile;
		if ($currentFileLi[0]) {
			$nextFile = $currentFileLi.nextAll('li').first().children('.file');
		}else{
			$nextFile = $('#file-list .file').first();
		}
		if($nextFile[0]) readJsonFile($nextFile.attr('data-file_id'));
		// if($nextFile[0]) readJsonFile($nextFile.data('file_id'));
	}
	function openPrevFile() {
		console.log('openPrevFile()');
		var $currentFileLi = $('#file-list > li').has('.file[data-file_id="'+ $('input#file-title').attr('data-file_id') +'"]');
		// var $currentFileLi = $('#file-list > li').has('.file[data-file_id="'+ $('input#file-title').data('file_id') +'"]');
		var $nextFile = $currentFileLi.prevAll('li').first().children('.file');
		if($nextFile[0]) readJsonFile($nextFile.attr('data-file_id'));
		// if($nextFile[0]) readJsonFile($nextFile.data('file_id'));
	}
	function openFile(filename) {
		console.log('openFile('+ filename +')');
				var $file = getFileObjectFromFileName(filename);
				if (!$file[0]) { return; }
				readJsonFile($file.attr('data-file_id'));
				// readJsonFile($file.data('file_id'));
				}
				function getFileObjectFromFileName(filename) {
					// 同一名ファイルが複数存在する可能性を忘れずに
					var $file = $('#file-list .file[data-file_name="'+ filename +'"]');
					return $file;
				}
				function getFileNameFromFileID(fileID) {
					return $('#file-list .file[data-file_id="'+ fileID +'"]').attr('data-file_name');
					// return $('#file-list .file[data-file_id="'+ fileID +'"]').data('file_name');
				}
				function deleteFileFromFileName(filename) {
					console.log('deleteFileFromFileName()');
					var $file = getFileObjectFromFileName(filename);
					if (!$file[0]) { return; }
					var fileID;
					if ($file.size() === 1) {
						fileID = $file.attr('data-file_id');
						// fileID = $file.data('file_id');
						deleteFile(fileID);
					}else if($file.size() > 1){
						if (window.confirm('同一名のファイルが複数存在します。\nすべてのファイルを削除しますか。\nこのうちのどれかのファイルを削除する場合はキャンセルし、個別に削除してください。')) {
							$file.each(function () {
								fileID = $(this).attr('data-file_id');
								// fileID = $(this).data('file_id');
								deleteFile(fileID);
							});
						}else{
							console.log('[存在しないファイル]削除できませんでした。:' + filename);
						}
					}
				}
				function moveFileIntoDirectory(fileID,newParentDirID) {
					// ディレクトリをディレクトリに入れるのも可
					console.log('moveFileIntoDirectory:file['+ fileID +'],newParentDir['+ newParentDirID +']');
					var userID = getUserID();
					$.ajax({
						type : "POST",
						url : "/tategaki/MoveFile",
						data : {
							user_id: userID,
							file_id: fileID,
							directory_id: newParentDirID
						},
						dataType : "json",
						context: {
							userID: userID
						},
						success : function (json) {
							// 表示データを受け取ってからの処理
							getFileList(this.userID);
						},
						error : function (XMLHttpRequest, textStatus, errorThrown) {
							alert("Error:"+ textStatus + ":\n" + errorThrown + ":status=" + XMLHttpRequest.status + "in moveFileIntoDirectory");
						}
					});
				}
				function makeDirectory(directoryname) {
					console.log('make directory:'+ directoryname);
					var userID = getUserID();
					var nowDate_ms = Date.now() + "";
					$.ajax({
						type : "POST",
						url : "/tategaki/MakeDirectory",
						data : {
							user_id: userID,
							directoryname: directoryname,
							saved: nowDate_ms
						},
						dataType : "json",
						context: {
							userID: userID
						},
						success : function (json) {
							// 表示データを受け取ってからの処理
							getFileList(this.userID);
						},
						error : function (XMLHttpRequest, textStatus, errorThrown) {
							alert("Error:"+ textStatus + ":\n" + errorThrown + ":status=" + XMLHttpRequest.status + "in makeDirectory");
						}
					});
				}
				function deleteDirectory(directoryID,option) {
					// ディレクトリ内にファイルがあるとき、強制的に中のファイルごと削除するときのみoptionはtrue
					var userID = getUserID();
					$.ajax({
						type : "POST",
						url : "/tategaki/DeleteDirectory",
						data : {
							directory_id: directoryID,
							option: option
						},
						dataType : "json",
						context: {
							userID: userID
						},
						success : function (json) {
							// 表示データを受け取ってからの処理
							getFileList(this.userID);
							if (json.result === "within") {
								$('#user-info').text("ディレクトリが空ではないので削除できませんでした。");
							}
						},
						error : function (XMLHttpRequest, textStatus, errorThrown) {
							alert("Error:"+ textStatus + ":\n" + errorThrown + ":status=" + XMLHttpRequest.status + "in makeDirectory");
						}
					});
				}
				function deleteDirectoryFromDirectoryName(directoryname,option) {
					var $dir = $('.directory[data-directory_name="'+ directoryname +'"]');
					if (!$dir[0]) { return; }
					var dirID;
					if ($dir.size() === 1) {
						dirID = $dir.attr('data-directory_id');
						// dirID = $dir.data('directory_id');
						deleteDirectory(dirID,option);
					}else if($dir.size() > 1){
						if (window.confirm('同一名のディレクトリが複数存在します。\nすべてのディレクトリを削除しますか。')) {
							$dir.each(function () {
								dirID = $(this).attr('data-directory_id');
								// dirID = $(this).data('directory_id');
								deleteFile(dirID,option);
							});
						}else{
							console.log('[存在しないディレクトリ]削除できませんでした。:' + directoryname);
						}
					}
				}
				function getCurrentFileID() {
					var $fileTitle = $('#file-title');
					var fileID = $fileTitle.attr('data-file_id');
					// var fileID = $fileTitle.data('file_id');
					return fileID;
				}
				// ====================================================
				// 	ユーティリティ(label:utility)
				// ====================================================
				$.fn.extend( {
					nextObj:function(selector,bl){
						// selectorに合致するオブジェクト群の中で、$objの次のオブジェクトを返す
						// bl: trueなら、最後のオブジェクトからnextObjをすると最初のオブジェクトを返す
						var $objs = $(selector);
						var objLen = $objs.length;
						var currentIndex = $objs.index(this);
						if(currentIndex === objLen -1){
							if(bl){
								return $objs.first();
							}else{
								return $();
							}
						}
						return $objs.eq(currentIndex + 1);
					},
					prevObj:function (selector,bl) {
						var $objs = $(selector);
						var currentIndex = $objs.index(this);
						if (currentIndex === 0) {
							if(bl){
								return $objs.last();
							}else{
								return $();
							}
						}else{
							return $objs.eq(currentIndex -1);
						}
					},
					addID:function (id) {
						$('#'+id).removeAttr('id');
						this.attr('id',id);
						return this;
					},
					toString:function () {
						// DOM要素の文字列表現を返す
						var $tmp = $('<div>');
						return $tmp.append(this.clone()).text();
					},
					getDistanceBetweenObj:function($other) {
					// ２つの要素の中心点同士の距離を求める
						var tCenterPos = this.getPosCenterPoint();
						var oCenterPos = $other.getPosCenterPoint();
						return jQuery.getDistanceP2P(tCenterPos.x,tCenterPos.y,oCenterPos.x,oCenterPos.y);
					},
					getDistanceP2O:function(po) {
					// ある点とオブジェクトの中心点の距離を求める
					// ex: po = {x:10,y:10}
						var objPos = this.getPosCenterPoint();
						return jQuery.getDistanceP2P(po.x,po.y,objPos.x,objPos.y);
					},
					getPosCenterPoint:function() {
					// オブジェクトの中心点の座標を求める
						var objPos = this.getPosObj();
						var objWidth = parseInt(this.css('width'));
						var objHeight = parseInt(this.css('height'));
						return {
							x: objPos.x + objWidth/2,
							y: objPos.y + objHeight/2
						}
					},
					getPosObj:function() {
						// window上の絶対座標
						var offset = this.offset();
						var x = offset.left;
						var y = offset.top;
						return {
							'x' : x,
							'y' : y
						}
					},
					removeClassByRegExp:function (regexp) {
						// 正規表現にマッチしたクラスを取り除く
						// 複数クラスを外す場合にはgオプション
						var strClass = this.attr('class') || ""; // classが一つもない場合、attr()はundefinedを返してくるため、match()が使えない
						var classArr = strClass.match(regexp); // 正規表現にマッチしない場合、nullが返ってくる
						var cnt;
						for (var i = 0; classArr && i < (cnt = classArr.length); i++) {
							this.removeClass(classArr[i]);
						}
						return this;
					},
					hasClassByRegExp:function(regexp){
						var strClass = this.attr('class') || "";
						return regexp.test(strClass);
					},
					getOneClassByRegExp:function(regexp){
						// 正規表現に合うクラスを文字列で返す
						var strClass = this.attr('class') || ""; // classが一つもない場合、attr()はundefinedを返してくるため、match()が使えない
						var strClass = strClass.match(regexp)[0]; // 正規表現にマッチしない場合、nullが返ってくる
						return strClass;
					},
					addCursor: function(bl){
						// bl: trueなら、カーソルを画面中央に配置する(二行以上カーソル行がはみ出した場合)
						if(!this.hasClass('vertical-char')) return this;
						var $prevCursor = $('.cursor');
						$prevCursor.removeClass('cursor');
						this.addClass('cursor');
						Cursor.addCursorRow();

						// font
						var prevChar = this.prev('.vertical-char');
						if(prevChar.hasClass('decolation-font-bold')){
							document.getElementById('btn-bold').classList.add('active');
						}else{
							document.getElementById('btn-bold').classList.remove('active');
						}
						if(prevChar.hasClass('decolation-font-italic')){
							document.getElementById('btn-italic').classList.add('active');
						}else{
							document.getElementById('btn-italic').classList.remove('active');
						}

						changeDisplayRow(bl);
						changeDisplayChar();
						printDocInfo();
						return this;
					}
				});
				$.extend({
					getDistanceP2P:function(x1,y1,x2,y2) {
						// ２点間の距離を求める
						// ２乗を使っているので、戻り値は必ず正の数になる
						// √{(b.x - a.x)^2+ (b.y - a.y)^2}
						return Math.sqrt(Math.pow(x2-x1,2)+Math.pow(y2-y1,2));
					}
				});
				function nextObj(selector,$obj) {
					// selectorに合致するオブジェクト群の中で、$objの次のオブジェクトを返す
					var $objs = $(selector);
					var currentIndex = $objs.index($obj);
					return $objs.eq(currentIndex + 1);
				}
				function prevObj(selector,$obj) {
					var $objs = $(selector);
					var currentIndex = $objs.index($obj);
					var newObj = $objs.eq(currentIndex - 1);
					if (newObj[0] === $objs.last()[0]) {
						// eq()に負の引数を渡すと、最後の要素に戻ってしまうのを防止
						return $();
					}else{
						return newObj;
					}
				}
				function getUserID() {
					var userID = $('#site-title').attr('data-user_id');
					// var userID = $('#site-title').data('user_id');
					return userID;
				}
				// ====================================================
				// 	initialize(label:init)
				// ====================================================
				setNOCLine();
				defaultNewFile();
				getFileList(globalUserID);
				// Event
				document.addEventListener("keydown",keyEvent ,false);
				addFocusEvent("file-title");
				$('body').on('keyup','#search-file',keyupInSearchFileInput);
				$('body').on('click','#file-list .file',function (e) {
					var fileID = $(this).attr('data-file_id');
					// var fileID = $(this).data('file_id');
					readJsonFile(fileID);
					$('#file-list-modal').modal('hide');
					//document.addEventListener("keydown",keyEvent,false);
				});
				$('body').on('click','.vertical-paragraph > .vertical-row',moveCursorToClickPos);
				$('body').on('mousewheel','#vertical-draft',wheelEvent);
				document.getElementById('menu-new').addEventListener("click",function (e) { defaultNewFile(); },false);
				document.getElementById('menu-save').addEventListener("click",function (e) { saveJsonFile(); },false);
				document.getElementById('menu-delete').addEventListener("click",function (e) { defaultDeleteFile(); },false);
				document.getElementById('modal-fileopen-link').addEventListener("click",function (e) { readyFileModal(); },false);
				document.getElementById('test').addEventListener("click",function (e) {
					// setFontSize('big');
					//setColorOnSelect('blue');
					//readJsonFile(17);
					searchWord('らすと');
				},false);
				$(window).resize(function () {
					resetDisplayChar();
				});
				$('#file-list-modal').on('shown.bs.modal',function (e) {
					// modalが完全に表示されてからのイベント
					$('#search-file').focus();
				});
				$('div.modal').on('shown.bs.modal',function (e) {
					// modalが完全に表示されてからのイベント
					document.removeEventListener("keydown",keyEvent,false);
				});
				$('div.modal').on('hidden.bs.modal',function (e) {
					if ($('#command')[0]) { return; }
					document.addEventListener("keydown",keyEvent,false);
				});
				$('body').on('click','button.close',function (e) {
					//document.addEventListener("keydown",keyEvent,false);
				});
				function addFocusEvent(id) {
					document.getElementById(id).addEventListener("focus",function (e) {
						document.removeEventListener("keydown",keyEvent,false);
					},false);
					document.getElementById(id).addEventListener("blur",function (e) {
						document.addEventListener("keydown",keyEvent,false);
					});
					document.getElementById(id).addEventListener("keyup",function (e) {
						var keycode;
						if (document.all) {
							// IE
							keycode = e.keyCode
						}else{
							// IE以外
							keycode = e.which;
						}
						if (keycode === 13) {
							// enter
						}
					});
				}
				// palette
				// color
				document.getElementById('color-btn').addEventListener('click',function (e) {
					var eBtn = document.getElementById('color-btn');
					var color = eBtn.className.match(/select-(\S+)/);
					if(color == null){
					 color = 'black';
					}else{
						color = color[1];
					}
					setColorOnSelect(color);
				},false);
				setSelectColorClickEvent("black");
				setSelectColorClickEvent("red");
				setSelectColorClickEvent("blue");
				function setSelectColorClickEvent(color) {
					document.getElementById("select-color-"+color).addEventListener("click",function (e) {
						var elSel = document.getElementById('color-btn');
						$(elSel).removeClassByRegExp(/select-\S+/);
						setColorOnSelect(color);
						if(color === "black") return;
						elSel.classList.add('select-'+color);
					},false);
				}
				// bold italic
				document.getElementById('btn-bold').addEventListener('click',function(e){
					var elem = document.getElementById('btn-bold');
					elem.classList.toggle('active');
					var objArr = getSelect$Array(true);
					if(/active/.test(elem.className)){
						for(var i = 0;i<objArr.length;i++){
							objArr[i].addClass('decolation-font-bold');
						}
					}else{
						for(var i = 0;i<objArr.length;i++){
							objArr[i].removeClass('decolation-font-bold');
						}
					}
				},false);
				document.getElementById('btn-italic').addEventListener('click',function(e){
					var elem = document.getElementById('btn-italic');
					elem.classList.toggle('active');
					var objArr = getSelect$Array(true);
					if(/active/.test(elem.className)){
						for(var i = 0;i<objArr.length;i++){
							objArr[i].addClass('decolation-font-italic');
						}
					}else{
						for(var i = 0;i<objArr.length;i++){
							objArr[i].removeClass('decolation-font-italic');
						}
					}
				},false);
				// selection
				document.getElementById('vertical-draft').addEventListener('mouseup',function(e){
					// 選択範囲に文字装飾が施されていればアクティブに
					var objArr = getSelect$Array();

					var bBold = false;
					var bItalic = false;
					for(var i=0;i<objArr.length;i++){
						if(objArr[i].hasClass("decolation-font-bold")){ bBold = true; }
						if(objArr[i].hasClass("decolation-font-italic")){ bItalic = true; }
					}
					if(bBold){
						document.getElementById("btn-bold").classList.add("active");
					}else{
						document.getElementById("btn-bold").classList.remove("active");
					}
					if(bItalic){
						document.getElementById("btn-italic").classList.add("active");
					}else{
						document.getElementById("btn-italic").classList.remove("active");
					}
					if(objArr.length > 0){
					 objArr[objArr.length -1].nextObj('#vertical-draft .vertical-char').addCursor();
					}
				},false);
				// align
				setTextAlignClickEvent('left');
				setTextAlignClickEvent('center');
				setTextAlignClickEvent('right');
				function setTextAlignClickEvent(align){
					document.getElementById('text-btn-'+ align).addEventListener('click',function(e){
						setAlignCursorParagraph(align);
					},false);
				}
});
