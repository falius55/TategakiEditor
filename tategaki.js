console.log("tategaki.js");
/*
 * 実装目標
 * アンドゥ
 */
$(function() {
	// ===================================================================
	// 		ユーザー操作(label:user)
	// ===================================================================

	// --------------------- key event listener ---------------------------

	// キー操作
	function getKeyCode(e) {
		"use strict";
		var keycode;
		if (document.all) {
			// IE
			keycode = e.keyCode
		} else {
			// IE以外
			keycode = e.which;
		}

		return keycode;
	}

	function keydownOnDoc(e) {
		"use strict";
		userAlert("");
		var $inputBuffer = $('#input_buffer');
		var keycode = getKeyCode(e);

		if (keycode === 123) { return; } // F12のみブラウザショートカットキー

		if ($('.convert-view')[0]) {
			// 漢字変換候補を選んでいるとき
			keydownOnConvertView(e,keycode);
		} else if ($inputBuffer.text() !== "") {
			// inputBufferへの入力中
			keydownOnInputBuffer(e,keycode);
		} else {
			// 非入力(通常)状態

			if (e.ctrlKey) {
				// ctrlキーを使ったショートカットキー
				keydownWithCTRL(e,keycode);
			} else {
				keydownOnDraft(e,keycode);
			}

		}

		console.log(keycode);
		// デフォルトの動作を無効化する
		e.preventDefault();
	}

	function keydownOnConvertView(e,keycode) {
		"use strict";
		var $inputBuffer = $('#input_buffer');
		var $prevSelectConvertView;
		var $newSelectConvertView;
		var $newPhrases;
		var prevPhraseNum;
		var newPhraseNum;
		var $firstConvertView;
		var $secondConvertView;
		var firstKana;
		var secondKana;
		var newStr;

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
				// // 禁則処理
				// checkKinsoku();
				// // reDisplay();
				// changeDisplayRow(false);
				// addPageBreak();
				// printDocInfo();
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
				} else {
					// Up のみ
					// 選択文節の変更
					// 表示convertviewの変更、alternative-focusの変更、selectphraseの変更
					$prevSelectConvertView = $('.convert-view.select');
					$newSelectConvertView = $prevSelectConvertView.prev('.convert-view');
					prevPhraseNum = $('.alternative-focus').siblings('.phrase-num').text();
					newPhraseNum = $newSelectConvertView.children('.phrase-num').text();

					// 最初に達していたら最後に戻る
					if (!($newSelectConvertView[0])) {
						$newSelectConvertView = $('.convert-view').last();
						newPhraseNum = $newSelectConvertView.children('.phrase-num').text();
					} 

					$newPhrases = $('#input_buffer > .vertical-char[data-phrase_num='+ newPhraseNum + ']');
					$prevSelectConvertView.removeClass('select');
					$newSelectConvertView.addClass('select');
					$('#input_buffer > .vertical-char.selectPhrase').removeClass('selectPhrase');
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
					$firstConvertView = $('.convert-view.select');
					$secondConvertView = $firstConvertView.next('.convert-view');
					if (!($secondConvertView[0])) break;
					firstKana = getStringFromRow($firstConvertView.children('.vertical-row').last());
					secondKana = getStringFromRow($secondConvertView.children('.vertical-row').last());
					newStr;

					if (secondKana.length < 2) {
						//二番目の文字列が１文字しかないので、２つを統合する
						newStr = firstKana + secondKana + ",";
						comKanjiForFusion(newStr,$firstConvertView,$secondConvertView);
						break;
					}

					newStr = firstKana + secondKana.charAt(0) + "," + secondKana.substring(1);
					comKanjiForChangePhrase(newStr,$firstConvertView,$secondConvertView);
				} else {
					// Down のみ
					// 選択文節の変更
					// 表示convertviewの変更、alternative-focusの変更、selectphraseの変更
					$prevSelectConvertView = $('.convert-view.select');
					$newSelectConvertView = $prevSelectConvertView.next('.convert-view');
					$newPhrases;
					prevPhraseNum = $('.alternative-focus').siblings('.phrase-num').text();
					newPhraseNum = $newSelectConvertView.children('.phrase-num').text();

					// 最後に達していたら最初に戻る
					if (!($newSelectConvertView[0])) {
						$newSelectConvertView = $('.convert-view').first();
						newPhraseNum = $newSelectConvertView.children('.phrase-num').text();
					} 

					$newPhrases = $('#input_buffer > .vertical-char[data-phrase_num='+ newPhraseNum + ']');
					$prevSelectConvertView.removeClass('select');
					$newSelectConvertView.addClass('select');
					$('#input_buffer > .vertical-char.selectPhrase').removeClass('selectPhrase');
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
	
	function keydownOnInputBuffer(e,keycode) {
		"use strict";
		var $inputBuffer = $('#input_buffer');
		var inputStr;
		var newInputStr;

		switch (keycode) {
			case 8:
				// backspace
				$inputBuffer.children('.EOL').prev().remove();
				moveInput();
				if ($inputBuffer.children('.vertical-char:first-of-type').hasClass('EOL')) {
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
				// checkKinsoku();
				// displayrow
				// changeDisplayRow(false);
				// addPageBreak();
				// printDocInfo();
				break;
			case 32:
				// space
				$('.convert-view').show();
				inputStr = getStringFromRow($inputBuffer);
				comKanjiForFullString(inputStr);
				break;
			case 118:
				// F7
				changeKatakanaAtInput();
				break;
			default:
				// inputBufferの更新
				inputStr = getStringFromRow($inputBuffer); //もともとの文字列
				newInputStr;

				if (e.shiftKey) {
					newInputStr = inputStr + key_table.shift_key[keycode];
				} else {
					newInputStr = key_table.getString(inputStr,keycode); //keycodeを加えた新しい文字列
				}

				if (newInputStr.indexOf("undefined") !== -1) {
					// 未定義文字(alt,ctrl,tabなど)はbreak
					break;
				}

				insertStringToInputBuffer(newInputStr);
				break;
		}
	}

	function keydownWithCTRL(e,keycode) {
		"use strict";
		var $inputBuffer = $('#input_buffer');

		switch (keycode) {
			case 18:
			case 70:
				// f
				readyFileModal();
				$('#file_list_modal').modal();
				break;
			case 66:
				// b
			case 68:
				// d
				deleteCharacter();
				checkText();
				break;
			case 190:
				// .
				findPrev();
				break;
			case 79:
				// o
				comOpenPrevFile();
				break;
			case 188:
				// ,
				findNext();
				break;
			case 73:
				// i
				comOpenNextFile();
				break;
			case 72:
				// h
				gCursor.shiftLeft();
				extendSelection(e.shiftKey);
				break;
			case 74:
				// j
				gCursor.next();
				extendSelection(e.shiftKey);
				break;
			case 75:
				// k
				gCursor.prev();
				extendSelection(e.shiftKey);
				break;
			case 76:
				// l
				gCursor.shiftRight();
				extendSelection(e.shiftKey);
				break;
			case 78:
				// n
				break;
			case 83:
				// s
				comSaveJsonFile();
				break;
			case 67:
				// c
				copySelectText();
				break;
			case 86:
				// v
				pasteFromCursor();
				break;
			default:
				break;
		}
	}

	function checkText() {
			checkKinsoku();
			changeDisplayRow(false);
			addPageBreak();
			printDocInfo();
	}

	function keydownOnDraft(e,keycode) {
		"use strict";
		var $inputBuffer = $('#input_buffer');

		switch (keycode) {
			case 8:
				// backspace
				deleteCharacter();
				checkText();
				break;
			case 13:
				// Enter
				lineBreak();
				checkText();
				break;
			case 32:
				// space
				insertStringFromCursor("　");
				break;
			case 37:
				// Left
				gCursor.shiftLeft();
				extendSelection(e.shiftKey);
				break;
			case 38:
				// Up
				gCursor.prev();
				extendSelection(e.shiftKey);
				break;
			case 39:
				// Right
				gCursor.shiftRight();
				extendSelection(e.shiftKey);
				break;
			case 40:
				// Down
				gCursor.next();
				extendSelection(e.shiftKey);
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
				console.log('draft key');
				var newInputStr;
				if (e.shiftKey) {
					newInputStr = key_table.shift_key[keycode];
				} else {
					newInputStr = key_table.getString("",keycode);
				}

				if (newInputStr == null) {
					break;
				}

				insertStringToInputBuffer(newInputStr);
				break;
		}
	}

	// -------------------------------- keydown function -----------------------------------------

	// 漢字変換時にバックスペース
	function backSpaceOnConvert() {
		"use strict";
		var $inputBuffer = $('#input_buffer');
		var $selectConvertView = $('.convert-view.select');
		var $oldSelectPhrase;
		var $prevSelectConvertView;
		var $newSelectConvertView;
		var $newPhrases;
		var hira = getStringFromRow($selectConvertView.children('.vertical-row').last());
		var prevPhraseNum;
		var newPhraseNum;

		if (hira.length < 2) {
			$oldSelectPhrase = $inputBuffer.children('.vertical-char.selectPhrase');

			prevPhraseNum = $('.alternative-focus').siblings('.phrase-num').text();
			$prevSelectConvertView = $('.convert-view.select');
			$newSelectConvertView = $prevSelectConvertView.next('.convert-view');
			newPhraseNum = $newSelectConvertView.children('.phrase-num').text();

			// 最後に達していたら最初に戻る
			if (!($newSelectConvertView[0])) {
				$newSelectConvertView = $('.convert-view').first();
				newPhraseNum = $newSelectConvertView.children('.phrase-num').text();
			} 

			$newPhrases = $('#input_buffer > .vertical-char[data-phrase_num='+ newPhraseNum + ']');
			$prevSelectConvertView.removeClass('select');
			$newSelectConvertView.addClass('select');
			$('#input_buffer > .vertical-char.selectPhrase').removeClass('selectPhrase');
			$newPhrases.addClass('selectPhrase');
			$('.alternative-focus').removeClass('alternative-focus');
			$newSelectConvertView.children('.vertical-row:first-of-type').addClass('alternative-focus');

			if ($inputBuffer.children('.vertical-char').length > 2) {
				$selectConvertView.remove();
				$oldSelectPhrase.remove();
			} else {
				// inputBufferが空になった
				$('.convert-view').remove();
				$inputBuffer.empty().hide(); // inputBufferを空にして隠す
			}

			return;

		} else {
			comKanjiForOnePhrase(hira.substring(0,hira.length-1),$selectConvertView);
		}

	}

	function shiftUpOnConvert() {
		"use strict";
		var $firstConvertView = $('.convert-view.select');
		var $secondConvertView = $firstConvertView.next('.convert-view');
		var firstKana = getStringFromRow($firstConvertView.children('.vertical-row').last());
		var newStr;
		var secondKana;

		if (firstKana.length < 2) return;

		if (!($secondConvertView[0])) {
			// 最後の文節の場合
			// 分離
			newStr = firstKana.substring(0,firstKana.length-1) + "," + firstKana.substring(firstKana.length-1,firstKana.length);
			comKanjiForSplit(newStr,$firstConvertView);
			return;
		} else {
			secondKana = getStringFromRow($secondConvertView.children('.vertical-row').last());
		}

		newStr = firstKana.substring(0,firstKana.length-1) + ","+ firstKana.substring(firstKana.length-1,firstKana.length) + secondKana;
		comKanjiForChangePhrase(newStr,$firstConvertView,$secondConvertView);
	}

	// 漢字変換候補一覧のフォーカスを左にシフトさせる
	function shiftLeftAlternativeFocus() {
		"use strict";
		var $preSelect = $('.alternative-focus');
		var $newSelect = $preSelect.next('.vertical-row');
		var phraseNum;
		var selectKanji;

		if (!($newSelect[0])) return;
		$preSelect.removeClass('alternative-focus');
		$newSelect.addClass('alternative-focus');
		// inputBufferの文字を入れ替える
		phraseNum = $newSelect.siblings('.phrase-num').text();
		selectKanji = getStringFromRow($newSelect);
		insertPhraseToInputBuffer(phraseNum,selectKanji);
		// selectphraseクラスの付け替え
		$('.selectPhrase').removeClass('selectPhrase');
		$('#input_buffer > .vertical-char[data-phrase_num='+ phraseNum +']').addClass('selectPhrase');

		resizeInputBuffer();
	}

	// 漢字変換候補一覧のフォーカスを右にシフトさせる
	function shiftRightAlternativeFocus() {
		"use strict";
		var phraseNum;
		var selectKanji;

		$preSelect = $('.alternative-focus');
		$newSelect = $preSelect.prev('.vertical-row');
		if (!($newSelect[0])) return;
		$preSelect.removeClass('alternative-focus');
		$newSelect.addClass('alternative-focus');
		phraseNum = $newSelect.siblings('.phrase-num').text();
		selectKanji = getStringFromRow($newSelect);
		insertPhraseToInputBuffer(phraseNum,selectKanji);
		// selectphraseクラスの付け替え
		$('.selectPhrase').removeClass('selectPhrase');
		$('#input_buffer > .vertical-char[data-phrase_num='+ phraseNum +']').addClass('selectPhrase');

		resizeInputBuffer();
	}

	// -------------------------------- wheel event ---------------------------------

	function wheelEvent(e,delta,deltaX,deltaY) {
		"use strict";
		// マウスホイールを動かすと、ページが左右に動く
		var $nextRow;

		if (delta > 0) {
			// ホイールを上に動かす
			for (var i = 0; i < 3; i++) {
				$nextRow = $('.display-row').first().prevObj('#vertical_draft .vertical-row');
				if (!$nextRow[0]) { break; }
				$nextRow.addClass('display-row');
				$('.display-row').last().removeClass('display-row');
				if (!($('.cursor-row').hasClass('display-row'))) { gCursor.shiftRight(); }
			}
		} else {
			// ホイールを下に動かす
			for (var i = 0; i < 3; i++) {
				$nextRow = $('.display-row').last().nextObj('#vertical_draft .vertical-row');
				if (!$nextRow[0]) { break; }
				$nextRow.addClass('display-row');
				$('.display-row').first().removeClass('display-row');
				if (!($('.cursor-row').hasClass('display-row'))) { gCursor.shiftLeft(); }
			}
		}

		resetDispNum();
		printDocInfo();
	}

	// ------------------------------- command mode ---------------------------------------

	function runCommand() {
		"use strict";
		var $command = $('#command');
		var $file;
		var $newParentDir;
		var command = $command.val().split(' ');
		var cnt;

		// 半角スペースで区切られていないようなら、全角スペースの区切りでも可
		if (command.length < 2) command = $command.val().split('　');

		switch (command[0]) {
			case ':w':
			case ':save':
			case ':s':
			case ': ｗ':
			case ':さヴぇ':
			case ':ｓ':

					 if (command[1]) {
						 comSaveAs(command[1]);
					 } else {
						 comSaveJsonFile();
					 }

					 break;
			case ':e':
			case ':o':
			case ':open':
			case ':え':
			case ':お':
			case ':おぺｎ':

					 if (command[1]) {
						 comOpenFile(command[1]);
					 } else {
						 defaultNewFile();
					 }

					 break;
			case ':jumpr':
			case ':jumprow':
			case ':jr':
			case ':じゅｍｐｒ':
			case ':じゅｍｐろｗ':
			case ':ｊｒ':
					 if (command[1]) gCursor.jumpForRow(command[1]);
					 break;
			case ':jumpp':
			case ':jumppage':
			case ':jp':
			case ':じゅｍっｐ':
			case ':じゅｍっぱげ':
			case ':ｊｐ':
					 if (command[1]) gCursor.jumpForPage(command[1]);
					 break;
			case ':new':
			case ':n':
			case ':ねｗ':
			case ':ｎ':

					 if (command[1]) {
						 newFile(command[1]);
					 } else {
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
						 comDeleteFileFromFileName(command[1]);
					 } else {
						 defaultDeleteFile();
					 }

					 break;
			case ':next':
			case ':ねｘｔ':
					 // 次のファイルを開く
					 if (command[1]) {
						 // 第二引数は繰り返し回数
						 cnt = parseInt(command[1]);
						 if (isNaN(cnt)) { break; }

						 for (var i = 0; i < cnt; i++) {
							 comOpenNextFile();
						 }

					 } else {
						 comOpenNextFile();
					 }

					 break;
			case ':prev':
			case ':ｐれｖ':
					 // 前のファイルを開く
					 if (command[1]) {
						 // 第二引数は繰り返し回数
						 cnt = parseInt(command[1]);
						 if (isNaN(cnt)) { break; }

						 for (var i = 0; i < cnt; i++) {
							 comOpenPrevFile();
						 }

					 } else {
						 comOpenPrevFile();
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
					 $file = $('.file[data-file_name="'+ command[1] +'"],.directory[data-directory_name="'+ command[1] +'"]');
					 $newParentDir = $('.directory[data-directory_name="'+ command[2] +'"]');
					 comMoveFile($file,$newParentDir);
					 break;
			case ':mkdir':
			case ':ｍｋぢｒ':
					 if (command[1]) {
						 comMakeDirectory(command[1]);
					 }
					 break;
			case ':deldir':
			case ':でｌぢｒ':
					 if (command[1]) {
						 comDeleteDirectoryFromName(command[1],false);
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
		"use strict";
		console.log('startCommandMode');
		var $command = $('#command').addClass('active');

		$('#app_container').after($command);
		document.removeEventListener("keydown",keydownOnDoc,false);
		// フォーカスを当ててからvalueをセットすることで末尾にカーソルが移動される
		$command.focus();
		$command.val(':');

		$('body').on('keyup','#command',keyupOnCommand);
		$('body').on('blur','#command',endCommandMode);
	}

	function keyupOnCommand(e) {
		"use strict";
		console.log('keyup on #command');
		var $command = $(this);
		var keycode = getKeyCode(e);
		var command;

		if (keycode == 13) {
			// enter
			runCommand();
			endCommandMode();
			e.stopPropagation(); // 親要素へのイベントの伝播(バブリング)を止める。そうしなければ先にaddeventlistenerをしてしまっているので、documentにまでエンターキーが渡ってしまい改行されてしまう。
		} else if (keycode == 27 || $command.val() == "") {
			// Esc
			// あるいは全文字削除
			endCommandMode();
			e.stopPropagation();
		} else {
			// :eなどの後に途中まで引数を打てばファイルの検索ダイアログが出るようにする
			command = $command.val().split(' ');
			if (command.length < 2) command = $command.val().split('　'); // 全角スペースも区切りとして有効。ただし、半角スペースとの混在は現状不可

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
							 dispFileModalOnCommand();
							 comSearchFile(command[1]);
						 } else if (keycode === 8 && !(command[1])) {
							 // BSを押した結果、引数がなくなった
							 // モーダルウィンドウを非表示にする
							 comHideFileModaOnCommand();
						 } else if (command[1] && command[2]) {
							 // 引数ふたつ目
							 comSearchFile(command[2]);
						 } else if (command[1]) {
							 // 引数ひとつ
							 comSearchFile(command[1]);
						 }

						 break;
				default:
						 break;
			}

		}
		e.preventDefault();
	}

	function dispFileModalOnCommand() {
		"use strict";
		$('#file_list_modal').addClass('command-modal').modal();
		$('.modal-backdrop.fade.in').addClass('none_modal-backdrop'); // モーダルウィンドウ表示時の半透明背景を見えなくする
	}

	function comHideFileModaOnCommand() {
		"use strict";
		if ($('body').hasClass('modal-open')) {
			$('#file_list_modal').attr('style','display: none;').removeClass('command-modal').modal('hide'); // あらかじめbootstrapより先回りしてstyle適用で非表示にしておかなければ、消える前に一瞬中央表示になってしまう
		}
		comFileList(getUserID());
	}

	function endCommandMode() {
		"use strict";
		console.log('endCommandMode');
		var $body = $('body');
		var $command = $('#command').removeClass('active');

		$body.off('keyup','#command',keyupOnCommand);
		$body.off('blur','#command',endCommandMode);
		document.addEventListener("keydown",keydownOnDoc,false);
		comHideFileModaOnCommand();
	}

	// ------------------------------ configue ----------------------------

	function Configue() {
		"use strict";
		var strLen = document.conf_form.str_len.value;
		var rowLen = document.conf_form.row_len.value;
		var strSize;

		if (document.getElementById('conf_str_size_big').checked) {
			strSize = 'big';
		} else if (document.getElementById('conf_str_size_small').checked) {
			strSize = 'small';
		} else if (document.getElementById('conf_str_size_middle').checked) {
			strSize = 'middle';
		} else {
			strSize = null;
		}

		this.strLen = strLen;
		this.rowLen = rowLen;
		this.strSize = strSize;
	}

	// ---------------------------- find mode ----------------------------------

	/*
	 * 字句検索
	 * 「/」で字句検索モードに入る
	 * find()に文字列を渡すと、渡された文字列を本文内から探し、見つかった文字列にfind-wordクラスを付与する
	 * さらに、見つかった文字列の先頭文字にfind-labelクラスを付与する
	 */
	// 字句検索を開始する
	function startFindMode() {
		"use strict";
		var $find = $('#find').addClass('active');
		// フォーカスを当ててからvalueをセットすることで末尾にカーソルが移動される
		$find.focus();
		$find.val('/');

		document.removeEventListener("keydown",keydownOnDoc,false);

		// エンターキーが押されればフォーカスをdraftに戻す(付与されたクラスは除去しない)
		// $findの中身が空になればfindモードを完全に終了する
		$('body').on('keyup','#find',function(e) {
			if (e.keyCode == 13) {
				// enter
				$find.blur();
				document.addEventListener("keydown",keydownOnDoc,false);
				return;
			} else if ($find.val() == '') {
				$find.blur();
				document.addEventListener("keydown",keydownOnDoc,false);
				endFindMode();
			}

			find($find.val().substring(1));
		});

		$('body').on('blur','#find',function(e) {
		document.addEventListener("keydown",keydownOnDoc,false);
		});
		$('body').on('focus','#find',function(e) {
		document.removeEventListener("keydown",keydownOnDoc,false);
		});
	}

	// 字句検索を完全に終了する
	function endFindMode() {
		"use strict";
		$('#find').removeClass('active').val('');
		$('.find-label').removeClass('find-label');
		$('.find-word').removeClass('find-word');
	}

	function find(word) {
		// 検索字句にクラスを付与する
		"use strict";
		var eOldLabel = document.getElementById('vertical_draft').getElementsByClassName('find-label');
		var eOldWord = document.getElementById('vertical_draft').getElementsByClassName('find-word');
		var eChars;
		var indexArr;
		var len;

		// reset
		while (eOldLabel[0]) { // クラスをremoveするとeOldLabelからその要素がなくなって詰められる
			eOldLabel[0].classList.remove('find-label');
		}
		while (eOldWord[0]) {
			eOldWord[0].classList.remove('find-word');
		}
		console.log('removed');
		if (word === '') return; // 検索文字がなくなった場合は、すべての文字からクラスを除去するのみ

		eChars = document.getElementById('vertical_draft').getElementsByClassName('vertical-char');
		indexArr = findIndex(word);
		// console.log(indexArr);
		len = word.length;
		for (var i=0;i<indexArr.length;i++) {
			// 先頭文字にfind-label
			eChars[indexArr[i]].classList.add('find-label');
			for (var j=0;j<len;j++) {
				// 該当文字全てにfind-word
				eChars[indexArr[i]+j].classList.add('find-word');
			}
		}

		// カーソル位置の次に位置する検索語句の頭にカーソルを移動する
			if (!document.getElementById('vertical_draft').getElementsByClassName('cursor')[0].classList.contains('find-label')) findNext();
	}

	function findIndex(word) {
		"use strict";
		/*
		 * 字句検索
		 * 1文字目のインデックスの配列を返す
		 * 検索字句を1文字ずつ確認
		 * 検索字句の1文字目と、配列に残っているインデックスのvertical-charの文字を比較し、異なれば配列から除外する
		 * 検索字句の2文字目と、配列に残っているインデックスのvertical-charの次のvertical-charの文字を比較し、異なれば配列から除外する
		 * 検索字句の3文字目と、配列に残っているインデックスのvertical-charから２つ後のvertical-charの文字を比較し、異なれば配列から除外する
		 * 検索字句のすべての文字に対して以上を繰り返していき、最終的に配列要素として残っているインデックスが、検索文字列の１文字目のインデックスとなる
		 */
		var eChars = document.getElementById('vertical_draft').getElementsByClassName('vertical-char');
		var indexArr = [];
		var searchChar;

		// いったん、すべての文字のインデックスを配列に入れる
		for (var i=0;i<eChars.length;i++) {
			indexArr[i] = i;
		}

		for (var search_i=0;search_i<word.length;search_i++) {
			searchChar = word.charAt(search_i);
			// 配列から、条件に合わない要素のインデックスを除外する
			for (var index_i=0;index_i<indexArr.length;index_i++) { // lengthは変動する
				if (eChars[indexArr[index_i]+search_i].textContent != searchChar) {
					indexArr.splice(index_i,1); // index_i番目から要素を一つ削除する
					index_i--; // 要素を削除して配列が詰められているので、再び同じ添字の要素を確認する
				}
			}
		}
		return indexArr;
	}

	// 次の検索語句にカーソルを当てる
	function findNext() {
		"use strict";
		var $prevCursor = $('.cursor');
		var $nextCursor = $prevCursor.nextObj('#vertical_draft .find-label,.cursor',true);
		if (!$nextCursor[0]) return;
		$nextCursor.addCursor(true);
		gCursor.repositionCharNum();
	}

	// 前の検索語句にカーソルを戻す
	function findPrev() {
		"use strict";
		var $prevCursor = $('.cursor');
		var $nextCursor = $prevCursor.prevObj('#vertical_draft .find-label,.cursor',true);
		if (!$nextCursor[0]) return;
		$nextCursor.addCursor(true);
		gCursor.repositionCharNum();
	}

	// -------------------------------- for user utility ---------------------------------------
	function userAlert(str) {
		"use strict";
		$('#user_info').text(str);
	}

	// ===================================================================
	// 		文章操作(label:string)
	// ===================================================================

	// ------------------------------  insert string ------------------------

	function printString(strArray) {
		"use strict";
		// 配列を引数にして、各文字列を本文表示
		// 配列に入っている各文字列をそれぞれ段落として挿入する
		var html = "";
		var strLen = getStringLenOfRow();
		var cnt;

		// 段落のhtml文字列を作成して連結
		for (var i=0,cnt=strArray.length;i<cnt;i++) {
			html += createParagraphHtml(strArray[i]);
		}

		// データに１文字もなければ上記for文に入れないので、空行を別に作成する
		if ($('#vertical_draft > .vertical-paragraph').length === 0) {
			// appendParagraph("");
			html += createParagraphHtml("");
		}

		// innerHTMLで画面内に挿入する
		document.getElementById('vertical_draft').innerHTML = html;
	}

	function appendParagraph(str) {
		"use strict";
		$('#vertical_draft').append(createParagraphHtml(str));
	}

	function appendParagraphFromObj(paraObjArr) {
		// 決まった形のオブジェクトを引数に、本文を作成して画面に表示する
		"use strict";
		var html = "";
		for (var i = 0; i < paraObjArr.length; i++) {
			html += createParagraphHtmlFromObj(paraObjArr[i]);
		}
		document.getElementById("vertical_draft").innerHTML = html;
	}

	function insertStringFromCursor(str) {
		"use strict";
		console.log('ins string from cursor');
		var $cursor = $('.cursor');
		var $character;
		var $cursorRow = $('#vertical_draft .cursor-row')
		var cnt = str.length;

		for (var i = 0; i < cnt; i++) {
			$character = $(createCharHtml(str.charAt(i)));
			$cursor.before($character);
		}
		cordinateStringNumber($cursorRow,getStringLenOfRow());
		gCursor.repositionCharNum();
		checkKinsoku();
		changeDisplayRow(false);
		resetDisplayChar();
		changeDisplayChar();
		addPageBreak();
		printDocInfo();
	}

	function insertStringToInputBuffer(str) {
		"use strict";
		var $inputBuffer = $('#input_buffer');
		var char;

		$inputBuffer.empty();

		for (var i=0,cnt=str.length;i<cnt;i++) {
			char = str.charAt(i);
			$inputBuffer.append($(createCharHtml(char)).attr('data-phrase_num',-1));
		}

		$inputBuffer.append($('<span class="vertical-char EOL"></span>'));

		moveInput();

		return $inputBuffer.show();
	}

	function insertPhraseToInputBuffer(phNum,str) {
		"use strict";
		// 文節番号phNumを、strで置き換える
		// 新しい文字集合のオブジェクトを返す
		var $selectPhrases = $('#input_buffer > .vertical-char[data-phrase_num='+ phNum +']');
		var $insertPosObj = $selectPhrases.first();
		var $character;

		for (var i = 0; i < str.length; i++) {
			$character = $(createCharHtml(str.charAt(i)));
			$insertPosObj.before($character);
			$character.attr('data-phrase_num',-10);
		}
		$selectPhrases.remove();

		return $('#input_buffer > .vertical-char[data-phrase_num="-10"]').attr('data-phrase_num',phNum);
	}

	// --------------------------------------- create string html ------------------------------------

	function createParagraphHtml(str) {
		"use strict";
		"use strict";
		// 文字列を引数にして、段落のhtml文字列を作成する
		var html = "<div class='vertical-paragraph'>"
		var strLen = getStringLenOfRow();
		var pos = 0;
		var outputStr;

		// strLen文字ごとに区切って各行として連結する
		do {
			outputStr = pos+strLen>str.length ? str.slice(pos) : str.substring(pos,pos+strLen);
			html += createRowHtml(outputStr);
			pos += strLen;
		} while (pos<str.length);

		html += "</div>"

		return html;
	}

	function createRowHtml(str) {
		"use strict";
		"use strict";
		// 文字列を引数にして行のhtml文字列を作成する
		if (str == null) return;
		var html = "<div class='vertical-row'>"
		var cnt;

		for (var i = 0,cnt=str.length; i < cnt; i++) {
			html += createCharHtml(str.charAt(i));
		}

		html += "<span class='vertical-char EOL display-char'></span></div>";

			return html;
	}

	function createCharHtml(char) {
		"use strict";
		// stringを引数にして、文字のhtml文字列を作成する
		// 引数の文字列が２文字以上の場合は、最初の１文字のみが有効
		// クラスを追加するには、最初に半角スペースを入れること
		if (char.length > 1) { char = char.charAt(0); }
		var html = "<span class='vertical-char display-char";
		var classArr = getConfDecoChar();

			for (var i = 0; i < classArr.length; i++) {
				html += " " + classArr[i];
			}

		// 特殊クラスの付与
		if (key_table.dotList.indexOf(char) !== -1) html += " vertical-dot";
		if (key_table.beforeBracketList.indexOf(char) !== -1) html += " vertical-before-bracket";
		if (key_table.afterBracketList.indexOf(char) !== -1) html += " vertical-after-bracket";
		if (key_table.lineList.indexOf(char) !== -1) html += " character-line";
		if (/[a-z]/.test(char)) html += " alphabet";
		if (/[１-９]/.test(char)) html += " number";
		if (/[っゃゅょぁぃぅぇぉ]/.test(char)) html += " yoin";

		html += "'>";
		html += char;
		html += "</span>";
		return html;
	}

	function createParagraphHtmlFromObj(paraObj) {
		"use strict";
		// 決まった形のオブジェクトを引数にして、paragraphのhtml文字列を作成する
		/*
		 * 			[
		 * 				["decolation-textalign-center"],		 // 段落のクラスが文字列の配列で格納される
		 * 				[												 // 各文字のオブジェクトが配列で格納される
		 * 					{											 // 文字を表すオブジェクト
		 * 						"char":"あ",
		 * 						"decolation":["decolation-color-blue"]
		 * 					},
		 * 					{
		 * 						"char":"い",
		 * 						"decolation":null
		 * 					}
		 * 					]
		 * 			]
		 */
		var strLen = getStringLenOfRow();
		var html = "<div class='vertical-paragraph'";
		var objArray;

		// 段落そのものにクラスを付与する
		for (var i=0;i<paraObj[0].length;i++) {
			html += " " + paraObj[0][i];
		}
		html += ">";

		// 文字の配列をstrLen個ずつの配列に分け、それぞれで行を作成して連結する
		objArray = splitArray(paraObj[1],strLen); // paraObj[1]が空配列なら、objArrayにも空配列が入る
		for (var i = 0; i < objArray.length; i++) {
			html += createRowHtmlFromObj(objArray[i]);
		}
		// paraObj[1]が空配列 = 空段落(空行)の場合は上記for文が実行されないので、別に空行を作成して連結する
		if (objArray.length === 0) {
			html += createRowHtmlFromObj([]); // createRow~に空配列を渡せば空行が作られる
		}

		html += "</div>";
		return html;
	}

	function createRowHtmlFromObj(objArray) {
		"use strict";
		// 決まった形のオブジェクトを引数にして、rowのhtml文字列を作成する
		/*
		 * 				[												 // 各文字のオブジェクトが配列で格納される
		 * 					{											 // 文字を表すオブジェクト
		 * 						"char":"あ",
		 * 						"decolation":["decolation-color-blue"]
		 * 					},
		 * 					{
		 * 						"char":"い",
		 * 						"decolation":null
		 * 					}
		 * 					]
		 */
		var html = '<div class="vertical-row">';
		var cnt;

		for (var i = 0,cnt=objArray.length; i < cnt; i++) {
			html += createCharHtmlFromObj(objArray[i]);
		}
		html += "<span class='vertical-char EOL display-char'></span></div>"
		return html;
	}

	function createCharHtmlFromObj(obj) {
		"use strict";
		// 決まった形のオブジェクトを引数にして、charのhtml文字列を作成する
		// クラスを追加するには、最初に半角スペースを入れること
		/*
		 *		文字を表すオブジェクト
		 *		{
		 *			"char":"あ",
		 *			"decolation":["decolation-color-blue"]
		 *		}
		 */
		var char = obj["char"];
		var html = "<span class='vertical-char";
		var classArr = obj["decolation"];

			for (var i = 0; i < classArr.length; i++) {
				html += " " + classArr[i];
			}
		// 文字の種類に応じて付与するクラス
		if (key_table.dotList.indexOf(char) !== -1) html += " vertical-dot";
		if (key_table.beforeBracketList.indexOf(char) !== -1) html += " vertical-before-bracket";
		if (key_table.afterBracketList.indexOf(char) !== -1) html += " vertical-after-bracket";
		if (key_table.lineList.indexOf(char) !== -1) html += " character-line";
		if (/[a-z]/.test(char)) html += " alphabet";
		if (/[１-９]/.test(char)) html += " number";
		if (/[っゃゅょぁぃぅぇぉ]/.test(char)) html += " yoin";

		html += "'>";
		html += char;
		html += "</span>";

		return html;
	}
	
	// ---------------------------------- get text -------------------------------------------

	function getStringFromRow($row) {
		"use strict";
		var rtnStr = "";
		var $character = $row.children('.vertical-char:first-of-type');

		while ($character[0] && !($character.hasClass('EOL'))) {
			rtnStr += $character.text();
			$character = $character.next();
		}
		return rtnStr;
	}

	function getStringFromParagraph($paragraph) {
		"use strict";
		var $rows = $paragraph.children('.vertical-row');
		var rtnStr = "";

		for (var i = 0; i < $rows.length; ++i) {
			rtnStr += getStringFromRow($rows.eq(i));
		}
		return rtnStr;
	}

	// ----------------------------------- get json text data on draft --------------------------------

	function makeJsonDataToSave() {
		"use strict";
		// テキスト情報をJsonで表す
		var data = new Object();
		data.conf = new Object();
		data.text = textToObj();
		return JSON.stringify(data);
	}

	 // 本文に関する情報をオブジェクトで表す
	function textToObj() {
		"use strict";
		/*
		 * example
		 * array[paragraph[{charObj},{charobj}],paragraph[{charObj}]]
		 * data = {
		 * "conf":{},
		 * "text":[ // textToObj()
		 * 				[ // makeParagraphArray()
		 * 				[], // splitParagraphClass()
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
		 * 				], // makeParagraphArray()
		 * 				[
		 * 				[],
		 * 				[
		 * 					{
		 * 						"char":"う",
		 * 						"decolation":null
		 * 					}
		 * 				]
		 * 				],
		 * 				[]		// 段落配列が空　＝　空行
		 * 			] // textToObj()
		 * 			}
		 */
		var $paragraphs = $('#vertical_draft > .vertical-paragraph');
		var paragraphArrays = new Array();

		for (var i = 0; i < $paragraphs.length; i++) {
			paragraphArrays[i] = makeParagraphArray($paragraphs.eq(i));
		}

		return paragraphArrays;
	}

	// ひとつの段落に関する情報を配列で表す
	function makeParagraphArray($paragraph) {
		"use strict";
		/*
		 * 				[ // makeParagraphArray()
		 * 				[], // splitParagraphClass()
		 * 				[ // charArray
		 * 					{ // Characterdata();
		 * 						"char":"あ",
		 * 						"decolation":["decolation-color-blue"]
		 * 					},
		 * 					{
		 * 						"char":"い",
		 * 						"decolation":[]
		 * 					}
		 * 				]
		 * 				] // makeParagraphArray()
		 */
		var $chars = $paragraph.find('.vertical-char').not('.EOL');
		var paraArr = new Array();
		var charLen = $chars.length;
		var charArray = new Array();

		paraArr[0] = splitParagraphClass($paragraph);

		for (var i = 0; i < charLen; i++) {
			charArray[i] = new CharacterData($chars.eq(i));
		}

		paraArr[1] = charArray;

		return paraArr;
	}

	function splitParagraphClass($paragraph) {
		"use strict";
		// 段落に付与されている装飾用のクラスを文字列の配列にする
		// ["decolation-textalign-center"]
		var arr = $paragraph.attr('class').match(/decolation-\S+/g) || [];
		return arr;
	}

	function CharacterData($character) {
		"use strict";
		// 文字情報をインスタンス化する
		/*
		 *	{ // Characterdata();
		 *		"char":"あ",
		 *		"decolation":["decolation-color-blue"]
		 *	}
		 */
		var classArray = $character.attr('class').match(/decolation-\S+/g) || [];
		this["char"] = $character.text();
		this["decolation"] = classArray;
	}

	// --------------------------------------- convert kanji -------------------------------------------

	function comKanjiForFullString(str) {
		"use strict";
		// 漢字変換
		// 初変換時
		console.log('comKanjiに渡した文字列:' + str);
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
				var $inputBuffer = $('#input_buffer');
				var $chars = $inputBuffer.children('.vertical-char');
				var $convertView;
				var $convertViews;
				var $convertContainer = $('#convert_container');

				var pos = 0;
				var hiragana;
				var hiraLen;

				var phraseNum;

				// 各文節ループ
				for (var i = 0; i < json.length; i++) {
					hiragana = json[i][0];
					hiraLen = hiragana.length;

					// 文節番号をつける(同じ文節には同じ番号)
					for (var j = pos; j < (pos + hiraLen); j++) {
						$chars.eq(j).attr('data-phrase_num',i);
					}

					pos += hiraLen;
					insertPhraseToInputBuffer(i,json[i][1][0]); // 第一候補の漢字でinputBufferの文字列を置き換える

					// 変換候補表示
					// convertviewを作成する
					$convertView = createConvertView(i,json[i]);
					// $('#vertical_draft').before($convertView);
					$convertContainer.append($convertView);
				}

				// 最初のconvertViewにselectを付与
				$convertViews = $('#convert_container .convert-view');
				$convertViews.eq(0).addClass('select');
				$('.convert-view.select > .vertical-row:first-of-type').addClass('alternative-focus');
				repositionConvertView();

				// 現在選択中の文節にselectphraseクラスを設定する
				phraseNum = $('.alternative-focus').siblings('.phrase-num').text(); // 現在選択中の文節番号
				$('#input_buffer > .vertical-char[data-phrase_num='+ phraseNum + ']').addClass('selectPhrase');
				// 最後にinputBufferの高さ調整
				resizeInputBuffer();
			},
			error : function (XMLHttpRequest, textStatus, errorThrown) {
				alert("Error:"+ textStatus + ":\n" + errorThrown + ":status=" + XMLHttpRequest.status + "in comKanjiForFullString");
			}
		});
	}

	function comKanjiForChangePhrase(str,$firstConvertView,$secondConvertView) {
		"use strict";
		// 漢字変換
		// 文節総数に変化なし(文節の区切り目のみ変更)
		console.log('comKanjiに渡した文字列:' + str);
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
				var $newFirstConvertView;
				var $newSecondConvertView;
				var fPhraseNum = this.$first.children('.phrase-num').text();
				var sPhraseNum = this.$second.children('.phrase-num').text();

				$newFirstConvertView = createConvertView(fPhraseNum,json[0]).addClass('select');
				$newSecondConvertView = createConvertView(sPhraseNum,json[1]);
				this.$first.before($newFirstConvertView);
				this.$second.before($newSecondConvertView);

				// 第一候補の文字でinputBufferの該当文字を置き換える
				insertPhraseToInputBuffer(fPhraseNum,getStringFromRow($newFirstConvertView.children('.vertical-row:first-of-type').addClass('alternative-focus')));
				insertPhraseToInputBuffer(sPhraseNum,getStringFromRow($newSecondConvertView.children('.vertical-row:first-of-type')));

				// selectphraseクラスの付け替え
				$('#input_buffer > .vertical-char[data-phrase_num='+ fPhraseNum +']').addClass('selectPhrase');
				repositionConvertView();
				this.$first.remove();
				this.$second.remove();
				// 最後にinputBufferの高さ調整
				resizeInputBuffer();
			},
			error : function (XMLHttpRequest, textStatus, errorThrown) {
				alert("Error:"+ textStatus + ":\n" + errorThrown + ":status=" + XMLHttpRequest.status + "in comKanji");
			}
		});
	}

	function comKanjiForFusion(str,$firstConvertView,$secondConvertView) {
		"use strict";
		// 漢字変換
		// 統合時
		// $firstconvertviewと$secondconvertviewを一つにする
		// 選択中の文節の次の文節が一文字の場合にShift+Down
		console.log('comKanjiに渡した文字列:' + str);
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
				var $newConvertView;
				var fPhraseNum = this.$first.children('.phrase-num').text();

				$newConvertView = createConvertView(fPhraseNum,json[0]).addClass('select');
				this.$first.before($newConvertView);
				// 第一候補の文字でinputBufferの該当文字を置き換える
				insertPhraseToInputBuffer(fPhraseNum,getStringFromRow($newConvertView.children('.vertical-row:first-of-type').addClass('alternative-focus')));
				$('#input_buffer > .vertical-char[data-phrase_num='+ this.$second.children('.phrase-num').text() +']').remove();
				// selectphraseクラスの付け替え
				$('#input_buffer > .vertical-char[data-phrase_num='+ fPhraseNum +']').addClass('selectPhrase');
				repositionConvertView();
				this.$first.remove();
				this.$second.remove();
				resetPhraseNum();
				// 最後にinputBufferの高さ調整
				resizeInputBuffer();
			},
			error : function (XMLHttpRequest, textStatus, errorThrown) {
				alert("Error:"+ textStatus + ":\n" + errorThrown + ":status=" + XMLHttpRequest.status + "in comKanji");
			}
		});
	}

	function comKanjiForSplit(str,$firstConvertView) {
		"use strict";
		// 漢字変換
		// 分離時
		// 最後の文節からshift+Up
		console.log('comKanjiに渡した文字列:' + str);
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
				var $newFirstConvertView;
				var $newSecondConvertView;
				var fPhraseNum = this.$first.children('.phrase-num').text();
				var sPhraseNum = $('.convert-view').length; // 未使用の数字を取得

				var $insertPosObj;
				var $character;
				var secondFirstStr;

				$newFirstConvertView = createConvertView(fPhraseNum,json[0]).addClass('select');
				$newSecondConvertView = createConvertView(sPhraseNum,json[1]);
				this.$first.before($newFirstConvertView);
				this.$first.before($newSecondConvertView);

				// 第一候補の文字でinputBufferの該当文字を置き換える
				insertPhraseToInputBuffer(fPhraseNum,getStringFromRow($newFirstConvertView.children('.vertical-row:first-of-type').addClass('alternative-focus')));
				secondFirstStr = json[1][1][0];
				$insertPosObj = $('#input_buffer > .vertical-char[data-phrase_num='+ fPhraseNum + ']').last();
				for (var i = secondFirstStr.length -1; i >= 0; i--) {
					$character = $(createCharHtml(secondFirstStr.charAt(i))).attr('data-phrase_num',sPhraseNum);
					$insertPosObj.after($character);
				}

				// selectphraseクラスの付け替え
				$('#input_buffer > .vertical-char[data-phrase_num='+ fPhraseNum +']').addClass('selectPhrase');
				repositionConvertView();
				this.$first.remove();
				resetPhraseNum();
				// 最後にinputBufferの高さ調整
				resizeInputBuffer();
			},
			error : function (XMLHttpRequest, textStatus, errorThrown) {
				alert("Error:"+ textStatus + ":\n" + errorThrown + ":status=" + XMLHttpRequest.status + "in comKanji");
			}
		});
	}

	function comKanjiForOnePhrase(str,$firstConvertView) {
		"use strict";
		// 漢字変換
		// 一文節のみ変換
		console.log('comKanjiに渡した文字列:' + str + ",");
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
				var $newConvertView;
				var fPhraseNum = this.$first.children('.phrase-num').text();

				$newConvertView = createConvertView(fPhraseNum,json[0]).addClass('select');
				this.$first.before($newConvertView);
				// 第一候補の文字でinputBufferの該当文字を置き換える
				insertPhraseToInputBuffer(fPhraseNum,getStringFromRow($newConvertView.children('.vertical-row:first-of-type').addClass('alternative-focus')));
				// selectphraseクラスの付け替え
				$('#input_buffer > .vertical-char[data-phrase_num='+ fPhraseNum +']').addClass('selectPhrase');
				repositionConvertView();
				this.$first.remove();
				// 最後にinputBufferの高さ調整
				resizeInputBuffer();
			},
			error : function (XMLHttpRequest, textStatus, errorThrown) {
				alert("Error:"+ textStatus + ":\n" + errorThrown + ":status=" + XMLHttpRequest.status + "in comKanji");
			}
		});
	}

	// convertviewを作成する
	function createConvertView(phNum,jsonArray) {
		"use strict";
		// jsonArrayはひらがなと漢字配列が入るように、json[i]の形で渡す
		var html = "<div class='convert-view'>"

		if (jsonArray[1] != null) {

			for (var i = 0; i < jsonArray[1].length; i++) {
				html += createRowHtml(jsonArray[1][i]);
			}

		} else {
			console.log('no convert data');
		}

		// 最後はひらがな
		html += createRowHtml(jsonArray[0]);

		// 文節番号を示す数字をリストに表示する
		// phrase_numはクラスと、inputBuffer文字が持つ属性とで二種類あるから注意
		html += "<div class='phrase-num'>";
		html += phNum;
		html += "</div></div>";

		return $(html);
	}

	// inputBufferの文節番号を振り直す
	function resetPhraseNum() {
		"use strict";
		var $character = $('#input_buffer > .vertical-char').first();
		var $convertView = $('.convert-view').first();
		var newNum = 0;
		var temp = $character.attr('data-phrase_num');

		$convertView.children('.phrase-num').text(newNum);
		while (!($character.hasClass('EOL'))) {

			if (temp !== $character.attr('data-phrase_num')) {
				newNum++;
				temp = $character.attr('data-phrase_num');
				$convertView = $convertView.next('.convert-view');
				$convertView.children('.phrase-num').text(newNum);
			}

			$character.attr('data-phrase_num',newNum);
			$character = $character.next('.vertical-char');
		}
	}

	// ------------------------------------ convert katakana --------------------------------------

	// ひらがな入力中のカタカナ変換
	// inputbufferの文字をすべてカタカナに変える
	function changeKatakanaAtInput() {
		"use strict";
		var str = getStringFromRow($('#input_buffer.vertical-row'));
		insertStringToInputBuffer(getKatakana(str)).children('.vertical-char').not('.EOL').addClass('selectPhrase');
	}

	// 漢字変換中のカタカナ変換
	// 選択中の文節のみカタカナに変える
	function changeKatakanaAtConvert() {
		"use strict";
		var phraseNum = $('#input_buffer > .selectPhrase').attr('data-phrase_num');
		var str = getKatakana(getStringFromRow($('.convert-view.select > .vertical-row').last()));
		insertPhraseToInputBuffer(phraseNum,str).addClass('selectPhrase');
		resizeInputBuffer();
	}

	// strをカタカナにして返す
	// カタカナ変換できない文字はそのまま
	function getKatakana(str) {
		"use strict";
		var rtnKatakana = "";
		var cKatakana;
		var len = str.length;
		for (var i = 0; i < len; i++) {
			cKatakana = key_table.katakana[str.charAt(i)];

			if (cKatakana) {
				rtnKatakana += cKatakana;
			} else {
				// 変換できなければ元の文字をそのまま連結
				rtnKatakana += str.charAt(i);
			}

		}

		return rtnKatakana;
	}

	// ------------------------------ direct draft html -------------------------------------------
	// lineBreak
	// deleteCharacter

	// 改行
	function lineBreak() {
		"use strict";
		var $cursor = $('.cursor');
		var $cursorRow = $('.cursor-row');
		var $nextRow = $cursorRow.nextAll('.vertical-row').first(); //改行前の次の行
		var $prevChar = $cursor.prev(); //移動しない文字の最後
		var $baseParagraph;
		var $insertPosObj;
		var $moveChar;

		if (!($prevChar[0])) {

			// 行頭カーソルで改行
			if (($cursorRow.prev())[0]) {
				// 段落途中での行頭改行では、段落を２つに分ける
				devideParagraph($cursorRow);
			} else {
				// 段落最初での改行では、その前のところに空行挿入
				$baseParagraph = $cursorRow.closest('.vertical-paragraph');
				$baseParagraph.before($(createParagraphHtml("")));
			}

		} else {

			if (!($nextRow[0])) {
				// 次の行がなければ新しく作る
				$nextRow = $(createRowHtml(""));
				$cursorRow.after($nextRow);
			}

			$insertPosObj = $nextRow.children('.vertical-char:first-of-type'); //挿入先の最初の文字
			$moveChar = $cursor; // 移動文字
			while ($moveChar[0] && !($moveChar.hasClass('EOL'))) { // EOLは移動しない
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
			devideParagraph($nextRow);

			gCursor.repositionCharNum();

		}

		reDisplay();
	}

	// カーソルの前に位置する文字を削除する
	function deleteCharacter() {
		"use strict";
		// $delChar: 削除文字
		// $rowofdelchar: 削除文字のある行
		var $cursor = $('.cursor');
		var $delChar = $cursor.prev();
		var $rowOfDelChar = $('.cursor-row');
		var $preRow;
		var $delParagraph;
		var $preParagraph;
		var $mvRow;
		var $newCursor;
		var character;

		if (!($delChar[0])) {
			// 行頭からのBS
			$preRow = $rowOfDelChar.prevAll('.vertical-row').first();

			if (!($preRow[0])) {
				// 前の行が見つからない　＝　段落の最初
				$delParagraph = $rowOfDelChar.closest('.vertical-paragraph');
				$preParagraph = $delParagraph.prevAll('.vertical-paragraph').first();
				$mvRow = $delParagraph.children('.vertical-row:first-of-type');
				$preRow = $preParagraph.children('.vertical-row:last-of-type');

				if (!($preRow[0])) {
					// 段落をまたいでも前の行が見つからない＝文章の最初
					return;
				}

				if ($mvRow.children('.vertical-char:first-of-type').hasClass('EOL')) {
					// 空段落でBSを押した時、段落を削除するのみ
					$delParagraph.remove();
					// cursorの調整
					$newCursor = $preRow.children('.vertical-char:last-of-type').addCursor(false);
					reDisplay();
					gCursor.repositionCharNum();
					return;
				}

				// 段落をつなげる
					uniteParagraph($preParagraph,$delParagraph);
					reDisplay();
					gCursor.repositionCharNum();
					return;
			} else {
				 // 行頭からのBSかつ段落の最初ではない
				// 前の行の文字数が規定文字ある時、前の行の最後の文字を削除文字にする
				$delChar = $preRow.children('.EOL').prev();
				$rowOfDelChar = $preRow;
			}

		}

		backChar($rowOfDelChar); // 次の行から１文字持ってくる
		character = $delChar.text();
		$delChar.remove();
		if ($cursor.hasClass('EOL')) {
			// EOLからのBSではカーソルを前の文字に変える
			$cursor.prev('.vertical-char').addCursor(false);
		}
		if ($rowOfDelChar.children('.vertical-char:first-of-type').hasClass('EOL') && ($rowOfDelChar.prev())[0]) {
			// 文字を削除後、削除文字のあった行が行が空行で、かつその前の行が存在する = 複数段落の最終行が１文字しかなく、その文字を削除した場合空となるので、削除文字のあった行を削除し、その前の行の最後にカーソルを移動する
			// 先にカーソルの調整($rowOfDelChar削除前にカーソル位置取得)
			$rowOfDelChar.prev().children('.vertical-char').last().addCursor(false);
			$rowOfDelChar.remove();
			reDisplay();
		}
		gCursor.repositionCharNum();
		return character;
	}

	// $row以降を新しい段落として、段落を２つに分ける
	function devideParagraph($row) {
		"use strict";
		var $baseParagraph = $row.closest('.vertical-paragraph');
		var $newParagraph = $('<div>').addClass('vertical-paragraph');
		var $nextRow;

		do {
			// $rowを新しい段落に移動していく
			$nextRow = $row.next(); // $rowを移動すると次の移動対象選択には使えないので、次の行を保持しておく
			$row.remove();
			$newParagraph.append($row);
			$row = $nextRow;
		} while ($row[0]);

		$baseParagraph.after($newParagraph);

		return $newParagraph;
	}

	// 隣接する２つの段落の統合
	// baseParagraphにanotherParagraphを吸収して統合する
	function uniteParagraph($baseParagraph,$anotherParagraph) {
		"use strict";
		var $mvRow = $anotherParagraph.children('.vertical-row:first-of-type');
		var $preRow = $baseParagraph.children('.vertical-row:last-of-type');
		var cnt;

		do {
			// $anotherparagraphの行を$baseparagraphに移動
			$mvRow.remove();
			$baseParagraph.append($mvRow);
			$mvRow = $anotherParagraph.children('.vertical-row:first-of-type');
		} while ($mvRow[0]);
		$anotherParagraph.remove();

			// 前の行の文字数が規定数になるよう、その次の行から文字を持ってきて埋める
			cnt = getStringLenOfRow() - ($preRow.children('.vertical-char').length -1); // lengthではEOLも含まれるので-1
			for (var i = 0; i < cnt; i++) {
				backChar($preRow);
			}
	}

	// ------------------------------------- string cordinator --------------------------------------

	// 入力などの結果規定文字数を超えた行の文字数を調整する
	function cordinateStringNumber($vRow,strLen) {
		"use strict";
		// 超えた分を次の行に移動する
		// 同一段落内で完結
		// $vRow: 調整行
		// strLen: １行の文字数
		if ($vRow.children().length <= (strLen +1)) return; //調整行の文字数が規定値以下なら調整の必要なし(EOL含めると31個)

		var $nextRow = $vRow.nextAll('.vertical-row').first();
		var $prevChar;
		var $insertPosObj;
		var $moveChar;

		if (!($nextRow[0])) {
			// 次の行がなければ新しく作る
			$nextRow = $(createRowHtml(""));
			$vRow.after($nextRow);
			reDisplay();
		}

		$prevChar = $vRow.children('.vertical-char').eq(strLen -1); //移動しない文字の最後
		$insertPosObj = $nextRow.children('.vertical-char:first-of-type'); //挿入先の最初の文字
		$moveChar = $prevChar.nextAll('.vertical-char').first(); // 移動文字
		while ($moveChar[0] && !($moveChar.hasClass('EOL'))) { // EOLは移動しない
			$moveChar.remove();
			$insertPosObj.before($moveChar);
			$moveChar = $prevChar.nextAll('.vertical-char').first();
		}

		// 移動先の行がstrlen文字を超えている時のために再帰
		cordinateStringNumber($nextRow,strLen);

		// cursorが調整行の最後にあれば動いてくれないので、強制的に動かす
		if ($prevChar.nextAll('.vertical-char').first().hasClass('cursor')) {
			$insertPosObj.addCursor();
			gCursor.repositionCharNum();
		}
		gCursor.addCursorRow();
	}

	// $bringRowの次の行以降の最初の文字を、その前の行の最後に移動する
	function backChar($bringRow) {
		"use strict";
		var $nextRow = $bringRow.nextAll('.vertical-row').first();
		var $backChar;

		if (!($nextRow[0])) return;

		$backChar = $nextRow.children('.vertical-char:first-of-type');

		if ($backChar.next().hasClass('EOL')) {
			// 削除すると空行ができる場合
			$bringRow.children('.EOL').before($backChar);
			$nextRow.remove();
			return;
		}

		$backChar.remove();
		$bringRow.children('.EOL').before($backChar);
		backChar($nextRow);
	}

	function checkKinsoku() {
		"use strict";
		var $dots = $('#vertical_draft .vertical-char.vertical-dot').add('#vertical_draft .vertical-char.vertical-after-bracket');
		var $self;
		var $selfRow;
		var $prevRow;

		if ($dots[0]) {
			$dots.each(function () {
				$self = $(this);

				if (!($self.prev()[0])) {
					// 行頭
					$selfRow = $self.closest('.vertical-row');
					$prevRow = $selfRow.prev('.vertical-row');	
					if ($prevRow[0]) {
						// 段落の最初ではない
						backChar($prevRow);
					}
				}

			});
		}
	}

	// --------------------------- text decolation -----------------------------------

	function setColorOnSelect(color) {
		"use strict";
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
		"use strict";
		removeClassOnSelect('decolation-color');
	}

	function setColor(color) {
		"use strict";
		console.log('set color:'+ color);
		$('#color_btn').removeClassByRegExp(/select-\S+/).addClass('select-'+ color);
	}

	function toggleFont(font) {
		"use strict";
		var elem = document.getElementById('btn-'+ font);
		elem.classList.toggle('active');
	}

	function setAlignCursorParagraph(align) {
		"use strict";
		$('#vertical_draft').children('.vertical-paragraph').has('.cursor-row').removeClassByRegExp(/decolation-textalign-\S+/).addClass('decolation-textalign-'+ align);
	}

	function setFontSize(size) {
		"use strict";
		var $chars = $('#vertical_draft').find('span.vertical-char');
		var $paras = $('#vertical_draft').find('div.vertical-paragraph');

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

	// ------------ copy and paste --------------------

	// 選択中のテキストをストレージに保存する
	function copySelectText() {
		localStorage.clipBoard = selectText();
	}

	// 選択している部分のテキストを返す
	// 複数あればすべて連結する
	function selectText() {
		var ret = '';
		var selection = getSelection();
		var selRange;
		var rangeCount = selection.rangeCount;

		for (var i = 0; i < rangeCount; i++) {
			selRange = selection.getRangeAt(i);
			ret += selRange.toString();
		}
		return ret;
	}

	// ペースト
	function pasteFromCursor() {
		insertStringFromCursor(localStorage.clipBoard);
	}

	// -----------------------   string getter ------------------------
	// 文章ゲッター(label:strgetter)

	function getRowLen() {
		"use strict";
		// 文書内の行数
		var $rows = $('#vertical_draft > .vertical-paragraph > .vertical-row');
		return $rows.length;
	}

	function getRowLenOnCursorPage() {
		"use strict";
		// 現在ページの行数
		var $row = $('.cursor-row');
		var cnt = getCurrentRowOnPage(); // 現在行を加える

		// 後ろに数える
		while ($row[0] && !($row.hasClass('page-last-row'))) {
			cnt++;
			$row = $row.nextObj('#vertical_draft .vertical-row');
		}
		return cnt;
	}

	function getCurrentRowPos() {
		"use strict";
		// 文書内での現在行
		var rowNum = $('.vertical-paragraph > .vertical-row').index($('.cursor').closest('.vertical-row')) +1;
		return rowNum;
	}

	function getCurrentRowOnPage() {
		"use strict";
		// 現在ページ内で何行目にいるか
		var $row = $('.cursor-row');
		var cnt = 1; // page-break行の分

		// 前にさかのぼって数える
		while ($row[0] && !($row.hasClass('page-break'))) {
			cnt++;
			$row = $row.prevObj('#vertical_draft .vertical-row');
		}
		return cnt;
	}

	function getCurrentStringPosOnRow() {
		"use strict";
		// 現在文字位置
		var $cursor = $('.cursor');
		var strNum = $('.cursor-row').children('.vertical-char').index($cursor);
		return strNum;
	}

	function getStringLenOfCursorRow() {
		"use strict";
		// カーソル行の全文字数
		var strLen = $('.cursor-row > .vertical-char').length;
		return strLen - 1; // EOLの分を除く
	}

	function getCurrentPagePos() {
		"use strict";
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
			} else {
				$currentPage = $currentParagraph.children('.page-break:last-of-type');
			}

		}
		return $('.page-break').index($currentPage) + 1;
	}

	function getPageLen() {
		"use strict";
		// 文書内の全ページ数
		return $('.page-break').length;
	}

	function getRowLenOnPage() {
		"use strict";
		// 1ページの行数
		return 40;
	}

	function getStringLenOfRow() {
		"use strict";
		// 1行の文字数
		return 40;
	}

	function getConfDecoChar() {
		"use strict";
		var rtnArr = [];
		var color = document.getElementById('color_btn').className.match(/select-(\S+)/);

		if (color) {
			rtnArr.push('decolation-color-' + color[1]);
		}
		if (document.getElementById('btn-bold').classList.contains('active')) rtnArr.push('decolation-font-bold');
		if (document.getElementById('btn-italic').classList.contains('active')) rtnArr.push('decolation-font-italic');
		return rtnArr;
	}

	// ===================================================================
	// 		カーソル操作(label:cursor)
	// ===================================================================
	function moveCursorToClickPos(e) {
		"use strict";
		if ($('#input_buffer').text() !== "") { return; }
		var prev = $('.cursor');
		getCharOnRowClick($(this),e).addCursor(); // クリックした行のうち最も近い文字にカーソルが当たる
		gCursor.repositionCharNum();
		// printDocInfo();
	}

	function setNOCLine() {
		"use strict";
		// カーソルのある文字が何文字目かを記憶する要素群を作成する
		// カーソルを左右に動かすときに利用する
		var $container = $('#app_container');
		var strLen = getStringLenOfRow();
		var $NOCLine = $('<div>').attr('id','NOC-line');
		var $numberOfChar;

		for (var i = 0; i < strLen; i++) {
			$numberOfChar = $('<span>').addClass('number-of-char');
			$NOCLine.append($numberOfChar);
		}
		$('#vertical_draft').before($NOCLine);
	}

	function getCharOnRowClick($row,rowEo) {
		"use strict";
		// クリック箇所にもっとも近い.vertical-charオブジェクトを返す
		// @param $row .vertical-rowクラスのオブジェクトｊ
		// @param rowEo クリックイベントのイベントオブジェクト
		var $chars = $row.children('.vertical-char');
		var $resultObj = $chars.first('.vertical-char');
		var min = Number.MAX_VALUE;
		var clickPos = {
			x: rowEo.pageX,
			y: rowEo.pageY
		};

		$chars.each(function () {
			var $self = $(this);
			var distance = $self.computeDistanceP2O(clickPos);
			if (distance < min) {
				min = distance;
				$resultObj = $self;
			}
		});

		return $resultObj;
	}

	function computeDistanceBetweenObj($a,$b) {
		"use strict";
	// ２つの要素の中心点同士の距離を求める
		var aCenterPos = computeCenterPoint($a);
		var bCenterPos = computeCenterPoint($b);
		return computeDistanceP2P(aCenterPos.x,aCenterPos.y,bCenterPos.x,bCenterPos.y);
	}

	function computeDistanceP2O(po,$obj) {
		"use strict";
	// ある点とオブジェクトの中心点の距離を求める
	// ex: po = {x:10,y:10}
		var objPos = computeCenterPoint($obj);
		return computeDistanceP2P(po.x,po.y,objPos.x,objPos.y);
	}

	function computeDistanceP2P(x1,y1,x2,y2) {
		"use strict";
	// ２点間の距離を求める
		// ２乗を使っているので、戻り値は必ず正の数になる
		// √{(b.x - a.x)^2+ (b.y - a.y)^2}
		return Math.sqrt(Math.pow(x2-x1,2)+Math.pow(y2-y1,2));
	}

	function computeCenterPoint($obj) {
		"use strict";
	// オブジェクトの中心点の座標を求める
		var objPos = getPosObj($obj);
		var objWidth = parseInt($obj.css('width'));
		var objHeight = parseInt($obj.css('height'));
		return {
			x: objPos.x + objWidth/2,
			y: objPos.y + objHeight/2
		}
	}

	function getCursorPos() {
		"use strict";
		return $('.cursor').getPosObj();
	}

	function getPosObj($obj) {
		"use strict";
		// window上の絶対座標
		var offset = $obj.offset();
		var x = offset.left;
		var y = offset.top;
		return {
			'x' : x,
			'y' : y
		}
	}

	var gCursor = {
		init: function () {
		"use strict";
			$('.vertical-char').first().addClass('cursor');
			$('#NOC-line > .number-of-char:first-of-type').addClass('cursor_char');
			this.addCursorRow();
			resetDisplayChar();
		},
		addCursorRow : function () {
		"use strict";
			var $oldCursorRow = $('.vertical-paragraph > .vertical-row.cursor-row');
			if ($oldCursorRow[0]) {
				$oldCursorRow.removeClass('cursor-row');
			}
			$('.cursor').closest('.vertical-row').addClass('cursor-row');
		},
		next : function() {
		"use strict";
			// カーソルを次の文字に移動する
			var $prev = $('.cursor');
			var $next = $prev.nextObj('#vertical_draft .vertical-char');
			if (!($next[0])) {
				// 文章の最後に達していたら、何もしない
				return;
			}
			$next.addCursor(false);
			// markしたまま別の行に移り、そのまま上下キーを押してmarkを動かすこともあるので、markを１文字ずつ動かすのでは期待通りの動きをしてくれない
			this.repositionCharNum();
		},
		prev : function () {
		"use strict";
			// カーソルを前の文字に移動する
			var $prev = $('.cursor');
			var $next = $prev.prevObj('#vertical_draft .vertical-char');
			if (!($next[0])) {
				return;
			}
			$next.addCursor(false);
			this.repositionCharNum();
		},
		shiftRight: function () {
		"use strict";
			// カーソルを前の行に移動する
			var $prev = $('.cursor');
			var NOCNum = $('#NOC-line').children('.number-of-char').index($('.cursor_char'));
			var $next = $('#vertical_draft .cursor-row').prevObj('#vertical_draft .vertical-row').children('.vertical-char').eq(NOCNum);

			if (!($next[0])) {
				// 右の行の文字数が現在文字より小さい
				$next = $('#vertical_draft div.cursor-row').prevObj('#vertical_draft .vertical-row').children('.vertical-char:last-of-type');
			}
			if (!($next[0])) { return; }

			$next.addCursor(false);
		},
		shiftLeft: function () {
		"use strict";
			// カーソルを次の行に移動する
			var $prev = $('.cursor');
			var NOCNum = $('#NOC-line').children('.number-of-char').index($('.cursor_char'));
			var $next = $prev.closest('div.vertical-row').nextObj('#vertical_draft .vertical-row').children('.vertical-char').eq(NOCNum);

			if (!($next[0])) {
			 $next = $prev.closest('.vertical-row').nextObj('#vertical_draft .vertical-row').children('.vertical-char:last-of-type');
			}
			if (!($next[0])) { return; }

			$next.addCursor(false);
		},
		repositionCharNum: function () {
		"use strict";
			// charNumの位置を再調整
			var cursorPos = $('.cursor').closest('.vertical-row').children().index($('.cursor'));
			$('.cursor_char').removeClass('cursor_char');
			$('#NOC-line > .number-of-char').eq(cursorPos).addClass('cursor_char');
			// cursor-rowの 調整
			this.addCursorRow();
		},
		jumpForRow: function (rowNum) {
		"use strict";
			// 指定行にジャンプする。画面中央に指定行及びカーソルが来るように調整
			var $targetRow = $('.vertical-paragraph > .vertical-row').eq(rowNum-1);
			if (!$targetRow[0]) { return; }
			// cursor
			$targetRow.children('.vertical-char:first-of-type').addCursor(true);
			this.repositionCharNum();
		},
		jumpForPage: function (pageNum) {
		"use strict";
			// 指定ページにジャンプする。カーソルは１行目
			var firstDispNum = $('.vertical-paragraph > .vertical-row').index($('.page-break').eq(pageNum-1));
			var $targetRow = $('.vertical-paragraph > .vertical-row').eq(firstDispNum);
			if (!$targetRow[0]) { return; }
			// cursor
			$targetRow.children('.vertical-char:first-of-type').addCursor(false);
			this.repositionCharNum();
			// display
			addDisplayRow(firstDispNum,firstDispNum+getDisplayRowLen());
		}
	};

	// =====================================================================
	// 		表示操作(label:display)
	// =====================================================================

	// ----------------------------- display row --------------------------

	function reDisplay() {
		"use strict";
		console.log('reDisplay');
		var firstDispNum = $('.vertical-paragraph > .vertical-row').index($('.display-row').first());
		addDisplayRow(firstDispNum,firstDispNum+getDisplayRowLen()); // 途中行数変化
	}

	// カーソルが移動した時の、表示領域の調整
	function changeDisplayRow(opt_bl) {
		"use strict";
		// opt_bl: trueならカーソルを画面中央に配置する
		console.time('changeDisplayRow()');
		var $cursor = $('#vertical_draft .cursor');
		var $cursorRow = $cursor.closest('.vertical-row');

		var $nextRow;
		var $prevRow;

		var $rows;
		var cursorRowPos;
		var first;

		var currentFirst;
		var cursorIndex;
		var currentEnd;

		if ($cursorRow.hasClass('display-row')) {
			console.log('cursorRow has dispaly-row');
			return;
		}

		$cursorRow.addClass('display-row');
		if ($('.display-row').length <= getDisplayRowLen()) return;
		$nextRow = $cursorRow.nextObj('#vertical_draft .vertical-row');
		$prevRow = $cursorRow.prevObj('#vertical_draft .vertical-row');
		if ($nextRow.hasClass('display-row')) {
			// カーソルが一行前にはみ出した
			$('.display-row').last().removeClass('display-row');
			resetDispNum();

		} else if ($prevRow.hasClass('display-row')) {
			// カーソルが一行後にはみ出した
			$('.display-row').first().removeClass('display-row');
			resetDispNum();

		} else if (opt_bl) {
			// カーソルが二行以上はみ出し、かつカーソルを中央配置する
			$rows = $('#vertical_draft .vertical-row');
			cursorRowPos = $rows.index($('.cursor-row'));
			first = cursorRowPos - getDisplayRowLen()/2;
			first = first>=0 ? first : 0;
			addDisplayRow(first, (first + getDisplayRowLen()));

		} else {
			// カーソルが二行以上はみ出した
			currentFirst = $('.vertical-row').index($('.display-row').first());
			cursorIndex = $('.vertical-row').index($cursorRow);
			currentEnd = $('.vertical-row').index($('.display-row').last());
			first = 0;

			if (cursorIndex < currentFirst) {
				// カーソルが前にある
				first = cursorIndex;
			} else if (cursorIndex > currentEnd) {
				// カーソルが後ろにある
				first = currentFirst + (cursorIndex - currentEnd);
			} else {
				// display-rowに囲まれた部分にdisplay-rowでない行がある場合
				// 途中行数変化
				first = currentFirst;
				return;
			}

			addDisplayRow(first,(first + getDisplayRowLen()));
		}

		console.timeEnd('changeDisplayRow()');
	}

	// first行目からlast行目まで表示させる
	function addDisplayRow(first,last) {
		"use strict";
		console.log('addDisplayRow('+ first + ','+ last +')');
		var eOldDisplayRows = document.getElementsByClassName('display-row');
		var eRows = document.getElementById('vertical_draft').getElementsByClassName('vertical-row');
		var eRow;
		var rowLen = eRows.length;

		while (eOldDisplayRows.length > 0) {
			eOldDisplayRows.item(0).classList.remove("display-row");
		}

		if (last>rowLen) {
			last = rowLen;
			first = last - getDisplayRowLen();
			if (first < 0) first = 0;
		}

		var k = 0;
		for (var i = first; i < last; i++) {
			eRow = eRows.item(i);
			eRow.classList.add('display-row');
			eRow.dataset.dispnum = k++;
		}
		console.timeEnd('addDisplayRow()');
	}

	// ----------------------------------------- display char ------------------------------------

	// カーソルが表示文字外にはみ出た時、表示位置を再計算して表示する
	function changeDisplayChar() {
		"use strict";
		console.time('changeDisplayChar()');
		var eCursor = document.getElementById('vertical_draft').getElementsByClassName('cursor').item(0);
		if (eCursor.classList.contains('display-char')) {
			console.log('cursor has display-char');
			return;
		}
		if (eCursor.classList.contains('EOL') && eCursor.previousElementSibling) { eCursor = eCursor.previousElementSibling; }

		var eCursorRow = eCursor.parentNode;
		var eChars = eCursorRow.childNodes;

		var eDispChars = eCursorRow.querySelectorAll('.display-char');
		var currentFirst = index(eDispChars[0],eChars);
		var cursorIndex = index(eCursor,eChars);
		var currentEnd = index(eDispChars[eDispChars.length-1],eChars);
		var first;

		if (cursorIndex < currentFirst) {
			// カーソルが前にある
			first = cursorIndex;
		} else if (currentEnd > 0 && cursorIndex > currentEnd) {
			// カーソルが後ろにある
			first = currentFirst + (cursorIndex - currentEnd);
		} else {
			// display-charに囲まれた部分にdisplay-charでない文字がある場合
			// あるいはdisplay-charが一つもない状態の場合
			resetDisplayChar();
			changeDisplayChar();
			return;
		}

		addDisplayChar(first);
		console.timeEnd('changeDisplayChar()');
	}

	// ノードリストelementsのうち、targetのインデックスを返す
	function index(target,elements) {
		"use strict";
		var index = -1;

		for (var i=0;i<elements.lenght;i++) {
			if (elements.item(0) == target)
				index = i;
		}

		return index;
	}

	function resetDisplayChar() {
		"use strict";
		console.time('resetDisplayChar()');
		addDisplayChar(0);
		console.log('resetDisplayChar');
		console.timeEnd('resetDisplayChar()');
	}

	function addDisplayChar(first) {
		// 画面に表示されているrowのfirst文字以降にdisplay-charを付与して表示する
		"use strict";
		var displayRow = document.querySelectorAll('#vertical_draft .display-row');
		var cnt
		var ret;
		var addArr = [];
		var removeArr = [];

		for (var i=0,cnt=displayRow.length;i<cnt;i++) {
			ret = dispCharOfRow(first,displayRow[i]);
			addArr = addArr.concat(ret.add);
			removeArr = removeArr.concat(ret.remove);
		}
		for (var i=0,cnt=addArr.length;i<cnt;i++) {
			addArr[i].classList.add('display-char');
		}
		for (var i=0,cnt=removeArr.length;i<cnt;i++) {
			removeArr[i].classList.remove('display-char');
		}
	}

	function replaceDispChar(first,dispRows) {
		"use strict";
		var range = document.createRange();
		var fragment = range.cloneContents();
		var frRows = fragment.querySelectorAll('.vertical-row');
		var cnt;

		range.setStartBefore(dispRows[0].parentNode);
		range.setEndAfter(dispRows[dispRows.length-1].parentNode);

		for (var i=0,cnt=frRows.length;i<cnt;i++) {
			dispCharOfRow(first,dispRows[i],frRows[i]);
		}

		range.deleteContents();
		range.insertNode(fragment);
	}

	function dispCharOfRow(first,row) {
		"use strict";
		// rowのfirst文字目以降の各文字をrowの高さに収まるだけdisplaycharクラスを付与するとして、row内のcharすべてについてクラスを付与する要素と除去する要素の配列をオブジェクトで返す
		// この関数内でクラスをいじってしまうと、複数行に対して実行した場合にその都度描画計算が起こってしまい時間がかかるため、いったんインデックスのみを調査して関数外で一気にクラスの変更を行う形にしている
		// console.time('dispCharOfRow()');

		var eRow = row.nodeName && row.nodeType===1 ? row : row[0];
		var eChar;
		var eChars = eRow.childNodes;

		var addArr = [];
		var removeArr = [];
		// var dispHeight = eRow.clientHeight;
		var dispHeight = parseInt((eRow.currentStyle || document.defaultView.getComputedStyle(eRow,null)).width);
		var charLen = eChars.length;
		if (first > charLen) { return; }
		var htcnt = 0;
		var fontHeight = 0;

		// first文字以前の文字でdisplay-charを持つ文字があれば除去リストに加える
		for (var i = 0; i < first; i++) {
			eChar = eChars[i];
			if (eChar.classList.contains('display-char')) {
				removeArr.push(eChar);
			}
		}

		// first文字以降の文字でrowの高さに収まる文字のうち、display-charを持たない文字を追加リストに加える
		// また、rowに収まらない文字でdisplay-charを持つ文字があれば除去リストに加える
		// EOLは常にdisplay-charを持つようにする
		for (var i = first; i < charLen; i++) {
			eChar = eChars[i];
			// fontHeight = eChar.offsetHeight;
			fontHeight = eChar.offsetWidth;
		// fontHeight = parseInt((eChar.currentStyle || document.defaultView.getComputedStyle(eChar,null)).width) + parseInt((eChar.currentStyle || document.defaultView.getComputedStyle(eChar,null)).marginLeft);
			htcnt += fontHeight;
			// console.log('dispHeight:'+dispHeight);
			// console.log('fontHeight:'+fontHeight);
			// console.log('htcnt:'+ htcnt);
			if (htcnt < dispHeight || eChar.classList.contains('EOL')) {
				if (!(eChar.classList.contains('display-char'))) {
					addArr.push(eChar);
				}
			} else {
				if (eChar.classList.contains('display-char')) {
					removeArr.push(eChar);
				}
			}
		}

		// console.log('dispRow.add:'+ addArr.length);
		// console.log('dispRow.remove:'+ removeArr.length);
		console.timeEnd('dispCharOfRow()');

		return {
			add: addArr,
			remove: removeArr
		};
	}

	function resetDispNum() {
		"use strict";
			var k=0;
			$('.display-row').each(function() {
				this.dataset.dispnum = k++;
			});
	}

	function getDisplayRowLen() {
		"use strict";
		// 表示する行数
		var dispWidth = parseInt($('#vertical_draft').css('height'));
		var rowWidth = parseInt($('.vertical-paragraph > .vertical-row').css('height'));
		var rowBorderWidth = 2;
		var dispLen;
		if (dispWidth <= 0) { return 0; }
		rowWidth += rowBorderWidth;
		dispLen = dispWidth / rowWidth;
		return dispLen -1; // 一行だけ余裕をもたせる
	}

	// ----------------------------------------- element position ---------------------------------------

	function moveInput() {
		"use strict";
		// inputBufferの位置を調整する
		var cursorPosObj = getCursorPos();
		var x = cursorPosObj.x;
		var y = cursorPosObj.y;
		var $inputBuffer = $('#input_buffer');

		$inputBuffer.css('top',y).css('left',x);
		resizeInputBuffer();
	}

	function resizeInputBuffer() {
		"use strict";
		// inputBufferの高さ調整
		var $inputBuffer = $('#input_buffer');
		var $character = $inputBuffer.children('.vertical-char:first-of-type');
		// borderは上下合わせて２つある
		var height = $character.outerHeight() * ($inputBuffer.children('.vertical-char').length-1) + 5;

		$inputBuffer.css('height',height);
	}

	// convertviewの位置を調整
	function repositionConvertView() {
		"use strict";
		var eConvertContainer = document.getElementById('convert_container');
		var cursorPosObj = getCursorPos();
		var x = cursorPosObj.x;
		var y = cursorPosObj.y;
		eConvertContainer.style.top = y + 'px';
		eConvertContainer.style.left = (x - parseInt((eConvertContainer.currentStyle || document.defaultView.getComputedStyle(eConvertContainer,null)).width)) + 'px';
	}
	
	// -------------------------------------- page infomation --------------------------------------------

	function addPageBreak() {
		"use strict";
		// 改ページクラスの付与
		var pageNum = getRowLenOnPage();
		var $rows = $('#vertical_draft > .vertical-paragraph > .vertical-row');
		var $row;

		$('#vertical_draft > .vertical-paragraph > .vertical-row.page-break').removeClass('page-break');
		$('#vertical_draft > .vertical-paragraph > .vertical-row.page-last-row').removeClass('page-last-row');

		for (var i = 1; ($row = $rows.eq(pageNum*i-1))[0]; i++) {
			$row.addClass('page-last-row');
		}
		$rows.last().addClass('page-last-row');
		for (var i = 0; ($row = $rows.eq(pageNum*i))[0]; i++) {
			$row.addClass('page-break');
		}
	}

	function getRowPadding(rowLen) {
		"use strict";
		var dispWidth = parseInt($('#vertical_draft').css('width'))-50; // 負の数になることも考慮すること
		var rowWidth = parseInt($('.vertical-paragraph > .vertical-row').css('width'));
		var padding = (dispWidth/rowLen - rowWidth)/2;

		return padding;
	}

	// =====================================================================
	// 	選択操作(label:select)
	// =====================================================================

	function findSelect$obj(bl) {
		"use strict";
		// 選択範囲のvertical-charを配列に入れて返す
		// bl: 実行後選択を解除するならtrue
		var retObjArray = new Array();
		var $chars = $('#vertical_draft .display-row .vertical-char').not('.EOL');
		var selection = getSelection();
		var selRange;
		var charRange = document.createRange();

		if (selection.rangeCount === 1) {
			// 選択範囲が一箇所の場合
			selRange = selection.getRangeAt(0); // 選択範囲のRange

			for (var i = 0; i < $chars.length; i++) {
				// そのcharacterが選択範囲内にある場合に配列に入れている
				// 現在の要素を囲む範囲をcharRangeとして設定(jqueryオブジェクトからDOM要素を取得し、引数に渡している)。selectNodeContentsをselectNodeにする、あるいは引数をテキストノードではなくspan要素にすると、選択中最初と最終文字が反応しないことがある
				charRange.selectNodeContents($chars.eq(i).get(0).childNodes.item(0));
				// 開始位置が同じかselectの開始位置より文字の開始位置が後ろにあり、
				// 終了位置が同じかselectの終了位置より文字の終了位置が前にある
				if ((charRange.compareBoundaryPoints(Range.START_TO_START,selRange) >= 0
							&& charRange.compareBoundaryPoints(Range.END_TO_END,selRange) <= 0)) {
					retObjArray.push($chars.eq(i));
				}
			}

			selRange.detach();
		}

		charRange.detach();
		if (bl) selection.removeAllRanges(); // 選択を解除する

		return retObjArray;
	}
	function findSelectElem(bl) {
		"use strict";
		// 選択範囲のvertical-charを配列に入れて返す
		// bl: 実行後選択を解除するならtrue
		var retObjArray = new Array();
		var eChars = document.querySelectorAll('#vertical_draft .display-row .vertical-char');
		var eChar;
		var selection = getSelection();
		var selRange;
		var charRange = document.createRange();
		var cnt;

		if (selection.rangeCount === 1) {
			// 選択範囲が一箇所の場合
			selRange = selection.getRangeAt(0); // 選択範囲のRange

			// 選択範囲内にあるcharacterを配列に入れる
			for (var i = 0,cnt=eChars.length; i < cnt; i++) {
				eChar = eChars[i];
				if (eChar.classList.contains('EOL')) { continue; }
				// 現在の要素を囲む範囲をcharRangeとして設定。selectNodeContentsをselectNodeにする、あるいは引数をテキストノードではなくspan要素にすると、選択中最初と最終文字が反応しないことがある
				charRange.selectNodeContents(eChar.childNodes.item(0));
				// 開始位置が同じかselectの開始位置より文字の開始位置が後ろにあり、
				// 終了位置が同じかselectの終了位置より文字の終了位置が前にある
				if ((charRange.compareBoundaryPoints(Range.START_TO_START,selRange) >= 0
							&& charRange.compareBoundaryPoints(Range.END_TO_END,selRange) <= 0)) {
					retObjArray.push(eChar);
				}
			}

			selRange.detach();
		}

		charRange.detach();
		if (bl) selection.removeAllRanges(); // 選択を解除する

		return retObjArray;
	}

	function setClassOnSelect(strClass) {
		"use strict";
		// 選択中の文字に装飾用クラスを付与する
		// 同じ種類のクラスをすでに持っていた場合は除去する
		var eSelChars = findSelectElem(true);
		var kind = (strClass.match(/(decolation-.+)-.+/))[1];
		var regexp = new RegExp(kind +'-\\S+');
		var cnt;
		var rmClass;

		for (var i = 0,cnt=eSelChars.length; i < cnt; i++) {
			rmClass = (eSelChars[i].className.match(regexp));
			eSelChars[i].classList.add(strClass);
			if (rmClass) { eSelChars[i].classList.remove(rmClass[0]); }
		}

	}

	function toggleClassOnSelect(strClass) {
		"use strict";
		var $objArray = findSelect$obj(true);
		var cnt;
		for (var i = 0; i < (cnt = $objArray.length); i++) {
			$objArray[i].toggleClass(strClass);
		}
	}

	function removeClassOnSelect(kind) {
		"use strict";
		var eSelChars = findSelectElem(true);
		var regexp = new RegExp(kind +'-\\S+');
		var cnt;
		var rmClass;

		for (var i = 0,cnt=eSelChars.length; i < cnt; i++) {
			rmClass = eSelChars[i].className.match(regexp);
			if (rmClass) { eSelChars[i].classList.remove(rmClass[0]); }
		}
	}

	// 選択範囲を動かす(カーソル移動時)
	function extendSelection(bShift) {
		var eCursor = document.querySelector('.cursor');
		var selection = getSelection();

		if (bShift) {

			if (selection.rangeCount === 0) {
				// 選択されていない状態から実行された場合は、カーソルの前の位置にある文字を選択する
				selection.selectAllChildren($('.cursor').prevObj('#vertical_draft .vertical-paragraph .vertical-char')[0]);
			} else {
				// シフトキーが押されていれば、カーソルのオフセット０までselectionを拡張
				selection.extend(eCursor,0);
			}

		} else {
			// シフトキー無しでカーソルが動いたならselectionを解除する
			selection.removeAllRanges();
		}
	}

	// =====================================================================
	// 		ファイル操作(label:file)
	// =====================================================================

	function comReadFile(fileID) {
		"use strict";
		var userID = getUserID();
		$('#vertical_draft > .vertical-paragraph').remove();

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
				$('#file_title').val(data.filename).attr('data-file_id',this.id);
				// 文章のhtml書き出し
				printString(data.literaArray);
				// 禁則処理
				checkKinsoku();
				// 最初の４０行のみ表示する
				addDisplayRow(0,getDisplayRowLen());
				gCursor.init();
				resetDisplayChar();
				$('.doc-info > .saved').text(data.saved);

				addPageBreak();
				printDocInfo();
			},
			error : function (XMLHttpRequest, textStatus, errorThrown) {
				alert("Error:"+ textStatus + ":\n" + errorThrown + ":status=" + XMLHttpRequest.status + "in comReadFile");
			}
		});

	}

	function comReadJsonFile(fileID) {
		"use strict";
		console.log('comReadJsonFile("'+ fileID +'")');
		console.time('comReadJsonFile()');
		var userID = getUserID();
		userAlert("読込中");
		console.log('comReadJsonFile userID:"'+ userID);
		$('#vertical_draft').empty();
		console.time('ReadJsonFile communication');

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
		console.timeEnd('ReadJsonFile communication');
				// 表示データを受け取ってからの処理
				// ファイル名を表示
				$('#file_title').val(data.filename).attr('data-file_id',this.id);
				// 文章のhtml書き出し
				var text = data.data.text;
				console.time('append string');
				appendParagraphFromObj(text);
				console.timeEnd('append string');
				console.time('checkKinsoku');
				checkKinsoku(); // 禁則処理
				console.timeEnd('checkKinsoku');
				console.time('addDisplayRow');
				addDisplayRow(0,getDisplayRowLen());
				console.timeEnd('addDisplayRow');
				console.time('cursor init');
				gCursor.init();
				console.timeEnd('cursor init');
				// console.time('resetDisplayChar');
				// resetDisplayChar();
				// console.timeEnd('resetDisplayChar');
				$('.doc-info > .saved').text(data.saved);

				addPageBreak();
				printDocInfo();
				console.timeEnd('comReadJsonFile()');
				userAlert("読み込み完了");
			},
			error : function (XMLHttpRequest, textStatus, errorThrown) {
				alert("Error:"+ textStatus + ":\n" + errorThrown + ":status=" + XMLHttpRequest.status + "in comReadJsonFile");
			}
		});
	}

	function comSaveFile() {
		"use strict";
		var $fileTitle = $('#file_title');
		var $paragraphs = $('#vertical_draft > .vertical-paragraph');
		var userID = getUserID();
		var filename = $fileTitle.val();
		var fileID;
		var contentsArray = new Array();
		var contentsJson;
		var nowDate_ms;
		
		if (filename.length === 0) {
			userAlert("ファイル名を入力してください");
			return;
		}
		if (filename.indexOf("'") > -1 || filename.indexOf("<")>-1 || filename.indexOf(">")>-1) {
			userAlert("ファイル名に使用不可能文字が含まれています。");
			return;
		}

		fileID = $fileTitle.attr('data-file_id');

		if (fileID === "-1") {
			comSaveAs(filename);
			return;
		}

		// 段落ごとに配列に格納
		for (var i = 0; i < $paragraphs.length; i++) {
			contentsArray.push(getStringFromParagraph($paragraphs.eq(i)));
		}
		contentsJson = JSON.stringify(contentsArray);
		nowDate_ms = Date.now() + "";

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
				comFileList(this.userID);
				console.log('保存しました:fileID=' + this.fileID);
			},
			error : function (XMLHttpRequest, textStatus, errorThrown) {
				alert("Error:"+ textStatus + ":\n" + errorThrown + ":status=" + XMLHttpRequest.status + "in comSaveFile");
			}
		});
	}

	function comSaveJsonFile() {
		"use strict";
		var $fileTitle = $('#file_title');
		var userID = getUserID();
		var fileID;
		var filename = $fileTitle.val();
		var contentsJson;
		var nowDate_ms;

		if (filename.length === 0) {
			userAlert("ファイル名を入力してください");
			return;
		}
		if (filename.indexOf("'") > -1 || filename.indexOf("<")>-1 || filename.indexOf(">")>-1) {
			userAlert("ファイル名に使用不可能文字が含まれています。");
			return;
		}

		userAlert("保存しています");

		fileID = $fileTitle.attr('data-file_id');
		if (fileID === "-1") {
			comSaveAs(filename);
			return;
		}
		contentsJson = makeJsonDataToSave();
		// console.log(contentsJson);
		nowDate_ms = Date.now() + "";

		console.log('user_id:'+ userID);
		console.log('file_id:'+ fileID);
		console.log('filename:'+ filename);
		console.log('json:'+ contentsJson);
		console.log('saved:'+ nowDate_ms);

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
				comFileList(this.userID);
				console.log('保存しました:fileID=' + this.fileID);
				userAlert("保存しました");
			},
			error : function (XMLHttpRequest, textStatus, errorThrown) {
				alert("Error:"+ textStatus + ":\n" + errorThrown + ":status=" + XMLHttpRequest.status + "in comSaveJsonFile");
			}
		});
	}

	function comFileList(userID) {
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
				setFileListFromObject(data);
			},
			error : function (XMLHttpRequest, textStatus, errorThrown) {
				alert("Error:"+ textStatus + ":\n" + errorThrown + ":status=" + XMLHttpRequest.status + " in comFileList");
			}
		});
	}

	function setFileListFromObject(data,opt_$parentUl) {
		"use strict";
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

		var $file;
		var $parentUl;
		var $innerDir;
		var $collapse;
		var $innerCollapse;
		var $dirLink;
		var filename;
		var dirID;

		$parentUl = opt_$parentUl || $('#file_list');
		$parentUl.empty();

		for (var fileID in data) {
			filename = data[fileID]; // filenameは、対象fileIDのファイル名か、ディレクトリならば再帰的にオブジェクトが入っている

			if (typeof filename === "string" && fileID !==  "directoryname") {
				// file
				$file = $('<a>').addClass('file').attr('href','#').attr('data-type','file').attr('data-file_id',fileID).attr('data-file_name',filename).text(filename);
				$parentUl.append($('<li>').append($file));
			} else if (typeof filename === "object") {
				// dir
				// 再帰的にリストを作成し、コラプスで開けるようにする
				dirID = fileID;
				$innerDir = $('<ul>');
				setFileListFromObject(filename,$innerDir);
				$collapse = $('<div>').addClass('collapse').attr('id','directory'+dirID);
				$innerCollapse = $('<div>').addClass('well').append($innerDir);
				$collapse.append($innerCollapse);
				$dirLink = $('<a>').addClass('directory').attr('data-toggle','collapse').attr('href','#directory'+dirID).attr('data-type','directory').attr('data-directory_id',fileID).attr('data-directory_name',filename.directoryname).html('<span class="glyphicon glyphicon-folder-close" aria-hidden="true"></span>'+filename.directoryname);
				$parentUl.append($('<li>').append($dirLink));
				$dirLink.after($collapse);
			}

		}
	}

	function keyupInSearchFileInput(e) {
		"use strict";
		// ファイルを開くモーダルにある検索ボックスのkeyupイベント
		var $searchFile = $('#search_file');
		var $file;
		var keycode = getKeyCode(e);
		var searchWord = $searchFile.val();

		if (keycode == 13) {
			// enter

			$file = getFileObjectFromFileName(searchWord);
			if ($file[0] && $file.length === 1) {
				comReadJsonFile($file.attr('data-file_id'));
			}
			$('#file_list_modal').modal('hide');
			document.addEventListener('keydown',keydownOnDoc,false);

		} else if (searchWord.length === 0) {
			comFileList(getUserID);
		} else {
			comSearchFile(searchWord);
		}

	}

	function comSearchFile(searchWord) {
		// 合致するファイルのみをmodalに表示する
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
				setFileListFromObject(data); // filterFileNameMatchは現在のファイルリストから探すため、先に全ファイルをリストに入れておく必要がある
				var $matchFilesArray = filterFileNameMatch(this.search_word);
				setFileListFromArray($matchFilesArray);
			},
			error : function (XMLHttpRequest, textStatus, errorThrown) {
				alert("Error:"+ textStatus + ":\n" + errorThrown + ":status=" + XMLHttpRequest.status + " in comSearchFile");
			}
		});
	}

	function setFileListFromArray($array) {
		"use strict";
		var $fileList = $('#file_list');
		var $obj;
		var $file;
		var fileID;
		var filename;
		var matchObjLength = $array.length;

		$fileList.empty();

		if (matchObjLength === 0) {
			$fileList.append($('<li>').text('該当するファイルは見つかりませんでした。'));
		} else {

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
		"use strict";
		// 開くボタンを押した時
		comFileList(getUserID());
		$('#search_file').val('').focus();
	}
	
	function filterFileNameMatch(str) {
		"use strict";
		// ファイル検索
		var regexp = new RegExp('.*'+ str +'.*');
		var $array = new Array(); // マッチしたjqueryオブジェクトを入れる配列
		var $files = $('.file');
		var $self;
		var filename;

		$files.each(function () {
			$self = $(this);
			filename = $self.attr('data-file_name');
			if (regexp.test(filename)) {
				$array.push($self);
			}
		});

		return $array;
	}

	function defaultNewFile() {
		"use strict";
		newFile('newfile');
	}

	function newFile(filename) {
		"use strict";
		$('.vertical-paragraph').remove();

		appendParagraph("");
		$('.vertical-row').addClass('display-row').attr('data-dispnum',0).children('.vertical-char').first().addClass('cursor');
		$('#file_title').val(filename).attr('data-file_id','-1');
		addPageBreak();
		gCursor.addCursorRow();
		printDocInfo();
	}

	function comSaveAs(filename) {
		// 名前をつけて保存
		"use strict";
		var userID = getUserID();
		var nowDate_ms = Date.now() + "";

		if (filename.indexOf("'") > -1 || filename.indexOf("<")>-1 || filename.indexOf(">")>-1) {
			userAlert("ファイル名に使用不可能文字が含まれています。");
			return;
		}

		userAlert("保存しています");

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
				$('#file_title').val(data.filename).attr('data-file_id',data.newFileID);
				comSaveJsonFile();
			},
			error : function (XMLHttpRequest, textStatus, errorThrown) {
				alert("Error:"+ textStatus + ":\n" + errorThrown + ":status=" + XMLHttpRequest.status + "in comSaveAs");
			}
		});
	}

	function defaultDeleteFile() {
		"use strict";
		var fileID = $('#file_title').attr('data-file_id');
		if (fileID === '-1') {
			userAlert('保存していないファイルです。');
			return;
		}
		comDeleteFile(fileID);
	}

	function comDeleteFile(fileID) {
		"use strict";
		var userID = getUserID();
		if (window.confirm('本当に削除しますか:'+ getFileNameFromFileID(fileID) + '('+ fileID +')')) {

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
						var $files = $('#file_list .file');
						for (var i = 0; i < $files.length; i++) {
							if ($files.eq(i).attr('data-file_id') !== this.fileID) {
								comReadJsonFile($files.eq(i).attr('data-file_id'));
								break;
							}
						}
						comFileList(getUserID());
					}else{
						alert("ファイル削除エラーです(ファイル番号："+ this.fileID + ")");
					}

				},
				error : function (XMLHttpRequest,textStatus,errorThrown) {
					alert("Error:" + textStatus + ":\n" + errorThrown + ":status=" + XMLHttpRequest.status + "in comDeleteFile ");
				}
			});

		}

	}

	function printDocInfo() {
		"use strict";
		console.log('printDocInfo()');
		$('.doc-info > .str-num').text(getCurrentStringPosOnRow());
		$('.doc-info > .str-len').text(getStringLenOfCursorRow());
		$('.doc-info > .row-num').text(getCurrentRowOnPage());
		$('.doc-info > .row-len').text(getRowLenOnCursorPage());
		$('.doc-info > .page-num').text(getCurrentPagePos());
		$('.doc-info > .page-len').text(getPageLen());
	}

	function setFileTitle(filename) {
		"use strict";
		$('#file_title').val(filename);
	}

	function comOpenNextFile() {
		"use strict";
		console.log('comOpenNextFile()');
		var $currentFileLi = $('#file_list > li').has('.file[data-file_id="'+ $('#file_title').attr('data-file_id') +'"]');
		var $nextFile;

		if ($currentFileLi[0]) {
			$nextFile = $currentFileLi.nextAll('li').first().children('.file');
		} else {
			$nextFile = $('#file_list .file').first();
		}

		if ($nextFile[0]) comReadJsonFile($nextFile.attr('data-file_id'));
	}

	function comOpenPrevFile() {
		"use strict";
		console.log('comOpenPrevFile()');
		var $currentFileLi = $('#file_list > li').has('.file[data-file_id="'+ $('#file_title').attr('data-file_id') +'"]');
		var $nextFile = $currentFileLi.prevAll('li').first().children('.file');
		if ($nextFile[0]) comReadJsonFile($nextFile.attr('data-file_id'));
	}

	function comOpenFile(filename) {
		"use strict";
		console.log('comOpenFile('+ filename +')');
		var $file = getFileObjectFromFileName(filename);

		if (!$file[0]) { return; }

		comReadJsonFile($file.attr('data-file_id'));

	}

	function getFileObjectFromFileName(filename) {
		"use strict";
		// 同一名ファイルが複数存在する可能性を忘れずに
		var $file = $('#file_list .file[data-file_name="'+ filename +'"]');
		return $file;
	}

	function getFileNameFromFileID(fileID) {
		"use strict";
		return $('#file_list .file[data-file_id="'+ fileID +'"]').attr('data-file_name');
	}

	function comDeleteFileFromFileName(filename) {
		"use strict";
		console.log('comDeleteFileFromFileName()');
		var $file = getFileObjectFromFileName(filename);
		var fileID;

		if (!$file[0]) { return; }

		if ($file.size() === 1) {
			fileID = $file.attr('data-file_id');
			comDeleteFile(fileID);
		} else if ($file.size() > 1) {
			// 該当ファイルが複数

			if (window.confirm('同一名のファイルが複数存在します。\nすべてのファイルを削除しますか。\nこのうちのどれかのファイルを削除する場合はキャンセルし、個別に削除してください。')) {
				$file.each(function () {
					fileID = $(this).attr('data-file_id');
					comDeleteFile(fileID);
				});

			} else {
				console.log('[複数ファイル]削除できませんでした。:' + filename);
			}

		}
	}

	function comMoveFile($file,$newParentDir) {
		"use strict";
		var fileID;
		var newParentDirID;

		if ($file[0] && $newParentDir[0]) {
			fileID = $file.attr('data-type')==='file' ? $file.attr('data-file_id') : $file.attr('data-directory_id');
			newParentDirID = $newParentDir.attr('data-directory_id');
			comMvFileToDirectory(fileID,newParentDirID);
		}
	}

	function comMvFileToDirectory(fileID,newParentDirID) {
		"use strict";
		// ディレクトリをディレクトリに入れるのも可
		console.log('comMvFileToDirectory:file['+ fileID +'],newParentDir['+ newParentDirID +']');
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
				comFileList(this.userID);
			},
			error : function (XMLHttpRequest, textStatus, errorThrown) {
				alert("Error:"+ textStatus + ":\n" + errorThrown + ":status=" + XMLHttpRequest.status + "in comMvFileToDirectory");
			}
		});
	}

	function comMakeDirectory(directoryname) {
		"use strict";
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
				comFileList(this.userID);
			},
			error : function (XMLHttpRequest, textStatus, errorThrown) {
				alert("Error:"+ textStatus + ":\n" + errorThrown + ":status=" + XMLHttpRequest.status + "in comMakeDirectory");
			}
		});
	}

	function comDeleteDirectory(directoryID,option) {
		"use strict";
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
				comFileList(this.userID);
				if (json.result === "within") {
					userAlert("ディレクトリが空ではないので削除できませんでした。");
				}
			},
			error : function (XMLHttpRequest, textStatus, errorThrown) {
				alert("Error:"+ textStatus + ":\n" + errorThrown + ":status=" + XMLHttpRequest.status + "in comMakeDirectory");
			}
		});
	}

	function comDeleteDirectoryFromName(directoryname,option) {
		"use strict";
		var $dir = $('.directory[data-directory_name="'+ directoryname +'"]');
		if (!$dir[0]) { return; }
		var dirID;

		if ($dir.size() === 1) {
			dirID = $dir.attr('data-directory_id');
			comDeleteDirectory(dirID,option);
		} else if ($dir.size() > 1) {

			if (window.confirm('同一名のディレクトリが複数存在します。\nすべてのディレクトリを削除しますか。')) {
				$dir.each(function () {
					dirID = $(this).attr('data-directory_id');
					comDeleteFile(dirID,option);
				});
			} else {
				console.log('[複数ディレクトリ]削除できませんでした。:' + directoryname);
			}

		}
	}

	function getCurrentFileID() {
		"use strict";
		var $fileTitle = $('#file_title');
		var fileID = $fileTitle.attr('data-file_id');
		return fileID;
	}

	// ====================================================
	// 	ユーティリティ(label:utility)
	// ====================================================
	$.fn.extend( {
		nextObj:function(selector,bl) {
		"use strict";
			// selectorに合致するオブジェクト群の中で、$objの次のオブジェクトを返す
			// bl: trueなら、最後のオブジェクトからnextObjをすると最初のオブジェクトを返す
			var $objs = $(selector);
			var objLen = $objs.length;
			var currentIndex = $objs.index(this);

			if (currentIndex === objLen -1) {
				if (bl) {
					return $objs.first();
				} else {
					return $();
				}
			}

			return $objs.eq(currentIndex + 1);
		},
		prevObj:function (selector,bl) {
		"use strict";
			var $objs = $(selector);
			var currentIndex = $objs.index(this);
			if (currentIndex === 0) {
				if (bl) {
					return $objs.last();
				} else {
					return $();
				}
			} else {
				return $objs.eq(currentIndex -1);
			}
		},
		addID:function (id) {
		"use strict";
			$('#'+id).removeAttr('id');
			this.attr('id',id);
			return this;
		},
		toString:function () {
		"use strict";
			// DOM要素の文字列表現を返す
			var $tmp = $('<div>');
			return $tmp.append(this.clone()).text();
		},
		computeDistanceBetweenObj:function($other) {
		"use strict";
			// ２つの要素の中心点同士の距離を求める
			var tCenterPos = this.computeCenterPoint();
			var oCenterPos = $other.computeCenterPoint();
			return jQuery.computeDistanceP2P(tCenterPos.x,tCenterPos.y,oCenterPos.x,oCenterPos.y);
		},
		computeDistanceP2O:function(po) {
		"use strict";
			// ある点とオブジェクトの中心点の距離を求める
			// ex: po = {x:10,y:10}
			var objPos = this.computeCenterPoint();
			return jQuery.computeDistanceP2P(po.x,po.y,objPos.x,objPos.y);
		},
		computeCenterPoint:function() {
		"use strict";
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
		"use strict";
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
		"use strict";
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
		hasClassByRegExp:function(regexp) {
		"use strict";
			var strClass = this.attr('class') || "";
			return regexp.test(strClass);
		},
		getOneClassByRegExp:function(regexp) {
		"use strict";
			// 正規表現に合うクラスを文字列で返す
			var strClass = this.attr('class') || ""; // classが一つもない場合、attr()はundefinedを返してくるため、match()が使えない
			var strClass = strClass.match(regexp)[0]; // 正規表現にマッチしない場合、nullが返ってくる
			return strClass;
		},
		addCursor: function(opt_bl) {
		"use strict";
			// opt_bl: trueなら、カーソルを画面中央に配置する(二行以上カーソル行がはみ出した場合)
			if (!this.hasClass('vertical-char')) return this;

			var $prevCursor = $('.cursor');
			var $prevChar = this.prev('.vertical-char');

			$prevCursor.removeClass('cursor');
			this.addClass('cursor');
			gCursor.addCursorRow();

			// fontが付いている文字の次にカーソルが来た場合、そのfontをオンにする
			if ($prevChar.hasClass('decolation-font-bold')) {
				document.getElementById('btn-bold').classList.add('active');
			} else {
				document.getElementById('btn-bold').classList.remove('active');
			}
			if ($prevChar.hasClass('decolation-font-italic')) {
				document.getElementById('btn-italic').classList.add('active');
			} else {
				document.getElementById('btn-italic').classList.remove('active');
			}

			changeDisplayRow(opt_bl);
			changeDisplayChar();
			printDocInfo();
			return this;
		}
	});

	$.extend({
		computeDistanceP2P:function(x1,y1,x2,y2) {
		"use strict";
			// ２点間の距離を求める
			// ２乗を使っているので、戻り値は必ず正の数になる
			// √{(b.x - a.x)^2+ (b.y - a.y)^2}
			return Math.sqrt(Math.pow(x2-x1,2)+Math.pow(y2-y1,2));
		}
	});

	function nextObj(selector,$obj) {
		"use strict";
		// selectorに合致するオブジェクト群の中で、$objの次のオブジェクトを返す
		var $objs = $(selector);
		var currentIndex = $objs.index($obj);
		return $objs.eq(currentIndex + 1);
	}

	function prevObj(selector,$obj) {
		"use strict";
		var $objs = $(selector);
		var currentIndex = $objs.index($obj);
		var newObj = $objs.eq(currentIndex - 1);

		if (newObj[0] === $objs.last()[0]) {
			// eq()に負の引数を渡すと、最後の要素に戻ってしまうのを防止
			return $();
		} else {
			return newObj;
		}
	}

	function hasClass(elem,classRegExp) {
		"use strict";
		if (classRegExp.test(elem.className)) {
			return true;
		}
		return false;
	}

	function splitArray(baseArray,cnt) {
		"use strict";
		// baseArrayをcnt個ずつの配列に分割する
		var b = baseArray.length;
		var newArray = [];
		var j,p;

		for (var i = 0; i < Math.ceil(b/cnt); i++) {
			j = i*cnt;
			p = baseArray.slice(j,j+cnt);
			newArray.push(p);
		}
		return newArray;
	}

	function getUserID() {
		"use strict";
		var userID = $('#site_title').attr('data-user_id');
		return userID;
	}

	// ====================================================
	// 	initialize(label:init)
	// ====================================================

	setNOCLine();
	defaultNewFile();
	comFileList(globalUserID);
	// Event
	document.addEventListener("keydown",keydownOnDoc ,false);
	addFocusEvent("file_title");
	$('body').on('keyup','#search_file',keyupInSearchFileInput);
	$('body').on('click','#file_list .file',function (e) {
		var fileID = $(this).attr('data-file_id');
		comReadJsonFile(fileID);
		$('#file_list_modal').modal('hide');
	});
	$('body').on('click','.vertical-paragraph > .vertical-row',moveCursorToClickPos);
	$('body').on('mousewheel','#vertical_draft',wheelEvent);
	document.getElementById('menu_new').addEventListener("click",function (e) { defaultNewFile(); },false);
	document.getElementById('menu_save').addEventListener("click",function (e) { comSaveJsonFile(); },false);
	document.getElementById('menu_delete').addEventListener("click",function (e) { defaultDeleteFile(); },false);
	document.getElementById('modal_fileopen_link').addEventListener("click",function (e) { readyFileModal(); },false);
	document.getElementById('test').addEventListener("click",function (e) {
	},false);
	$(window).resize(function () {
		resetDisplayChar();
	});
	$('#file_list_modal').on('shown.bs.modal',function (e) {
		// modalが完全に表示されてからのイベント
		$('#search_file').focus();
	});
	$('div.modal').on('shown.bs.modal',function (e) {
		// modalが完全に表示されてからのイベント
		document.removeEventListener("keydown",keydownOnDoc,false);
	});
	$('div.modal').on('hidden.bs.modal',function (e) {
		if ($('#command').hasClass('active')) { return; }
		document.addEventListener("keydown",keydownOnDoc,false);
	});
	function addFocusEvent(id) {
		document.getElementById(id).addEventListener("focus",function (e) {
			document.removeEventListener("keydown",keydownOnDoc,false);
		},false);
		document.getElementById(id).addEventListener("blur",function (e) {
			document.addEventListener("keydown",keydownOnDoc,false);
		});
		document.getElementById(id).addEventListener("keyup",function (e) {
			var keycode = getKeyCode(e);
			if (keycode === 13) {
				// enter
			}
		});
	}

	// palette
	// color
	document.getElementById('color_btn').addEventListener('click',function (e) {
		// 文字色ボタンをクリックすると選択している文字の色が変わる
		var eBtn = document.getElementById('color_btn');
		var color = eBtn.className.match(/select-(\S+)/);

		if (color == null) {
			color = 'black';
		} else {
			color = color[1];
		}

		setColorOnSelect(color);
	},false);

	setSelectColorClickEvent("black");
	setSelectColorClickEvent("red");
	setSelectColorClickEvent("blue");
	function setSelectColorClickEvent(color) {
		// 文字色(ドロップダウンの方)をクリックするとボタンの色が変わるイベントを付加する
		document.getElementById("select_color_"+color).addEventListener("click",function (e) {
			var elSel = document.getElementById('color_btn');
			$(elSel).removeClassByRegExp(/select-\S+/);
			setColorOnSelect(color);
			if (color === "black") return;
			elSel.classList.add('select-'+color);
		},false);
	}

	// bold italic
	document.getElementById('btn-bold').addEventListener('click',function(e) {
		var eBtn = document.getElementById('btn-bold');
		var eSelChars = findSelectElem(true);
		var cnt;

		eBtn.classList.toggle('active');
		if (/active/.test(eBtn.className)) {
			// ボタンをクリックした結果、activeになった
			for (var i = 0,cnt=eSelChars.length;i<cnt;i++) {
				eSelChars[i].classList.add('decolation-font-bold');
			}
		} else {
			// ボタンをクリックした結果、解除された
			for (var i = 0,cnt=eSelChars.length;i<cnt;i++) {
				eSelChars[i].classList.remove('decolation-font-bold');
			}
		}
	},false);
	document.getElementById('btn-italic').addEventListener('click',function(e) {
		var eBtn = document.getElementById('btn-italic');
		var eSelChars = findSelectElem(true);
		var cnt;

		eBtn.classList.toggle('active');
		if (/active/.test(eBtn.className)) {
			for (var i = 0,cnt=eSelChars.length;i<cnt;i++) {
				eSelChars[i].classList.add('decolation-font-italic');
			}
		} else {
			for (var i = 0,cnt=eSelChars.length;i<cnt;i++) {
				eSelChars[i].classList.remove('decolation-font-italic');
			}
		}
	},false);
	// selection
	// 選択範囲に文字装飾が施されていればアクティブに
	document.getElementById('vertical_draft').addEventListener('mouseup',function(e) {
		var eSelChars = findSelectElem();
		var bBold = false;
		var bItalic = false;
		var cnt;

		for (var i=0,cnt=eSelChars.length;i<cnt;i++) {
			if (eSelChars[i].classList.contains("decolation-font-bold")) { bBold = true; }
			if (eSelChars[i].classList.contains("decolation-font-italic")) { bItalic = true; }
		}
		if (bBold) {
			document.getElementById("btn-bold").classList.add("active");
		} else {
			document.getElementById("btn-bold").classList.remove("active");
		}
		if (bItalic) {
			document.getElementById("btn-italic").classList.add("active");
		} else {
			document.getElementById("btn-italic").classList.remove("active");
		}

		// 選択した最後のcharにカーソルを当てる
		if (eSelChars.length > 0) {
			$(eSelChars[eSelChars.length -1]).nextObj('#vertical_draft .vertical-char').addCursor();
		}
	},false);
	// align
	setTextAlignClickEvent('left');
	setTextAlignClickEvent('center');
	setTextAlignClickEvent('right');
	function setTextAlignClickEvent(align) {
		document.getElementById('text-btn-'+ align).addEventListener('click',function(e) {
			setAlignCursorParagraph(align);
		},false);
	}
});
