console.log('tategaki.js');
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
		'use strict';
		let keycode;
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
		'use strict';
		userAlert('');
		const keycode = getKeyCode(e);

		if (keycode === 123) { return; } // F12のみブラウザショートカットキー

		const $inputBuffer = $('#input_buffer');
		if ($('.convert-view')[0]) {
			// 漢字変換候補を選んでいるとき
			keydownOnConvertView(e,keycode);
		} else if ($inputBuffer.text() !== '') {
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
		'use strict';
		const $inputBuffer = $('#input_buffer');

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
					upOnConvert();
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
					shiftDownOnConvert();
				} else {
					// Down のみ
					downOnConvert();
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
		'use strict';
		const $inputBuffer = $('#input_buffer');

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
				break;
			case 32:
				// space
				const inputStr = getStringFromRow($inputBuffer);
				comKanjiForFullString(inputStr);
				break;
			case 118:
				// F7
				changeKatakanaAtInput();
				break;
			default:
				// inputBufferの更新
				updateInputBuffer(keycode,e.shiftKey);
				break;
		}
	}

	function keydownWithCTRL(e,keycode) {
		'use strict';
		const $inputBuffer = $('#input_buffer');

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
				backSpaceOnDraft();
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
				readySelection();
				gCursor.shiftLeft();
				extendSelection(e.shiftKey);
				break;
			case 74:
				// j
				readySelection();
				gCursor.next();
				extendSelection(e.shiftKey);
				break;
			case 75:
				// k
				readySelection();
				gCursor.prev();
				extendSelection(e.shiftKey);
				break;
			case 76:
				// l
				readySelection();
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
		'use strict';
		const $inputBuffer = $('#input_buffer');

		switch (keycode) {
			case 8:
				// backspace
				backSpaceOnDraft();
				checkText();
				break;
			case 13:
				// Enter
				lineBreak();
				checkText();
				break;
			case 32:
				// space
				insertStringFromCursor('　');
				break;
			case 37:
				// Left
				readySelection();
				gCursor.shiftLeft();
				extendSelection(e.shiftKey);
				break;
			case 38:
				// Up
				readySelection();
				gCursor.prev();
				extendSelection(e.shiftKey);
				break;
			case 39:
				// Right
				readySelection();
				gCursor.shiftRight();
				extendSelection(e.shiftKey);
				break;
			case 40:
				// Down
				readySelection();
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
				updateInputBuffer(keycode,e.shiftKey);
				break;
		}
	}

	// -------------------------------- keydown function -----------------------------------------

	// 漢字変換時にバックスペース
	function backSpaceOnConvert() {
		'use strict';
		const $inputBuffer = $('#input_buffer');
		const $activeConvertView = $('.convert-view.active');
		const currentSelectKana = getStringFromRow($activeConvertView.children('.vertical-row').last());

		if (currentSelectKana.length >= 2) {
			// 現在選択中の文節が２文字以上
			// 現在選択中の文節から１文字削って、その文節だけ再変換
			comKanjiForOnePhrase(currentSelectKana.substring(0,currentSelectKana.length-1),$('.convert-view.active'));

		} else {
			// 現在選択中の文節がひらがなで１文字のみ
			// 現在の文節を削除し、選択を次の文節に移す

			if ($inputBuffer.children('.vertical-char').not('.EOL').length === 1) {
				// これを削除すればinput_bufferが空になる場合
				// EOL含めて２文字
				$('#convert_container').empty();
				$inputBuffer.empty().hide(); // inputBufferを空にして隠す
				return;
			}

			// 削除後のフォーカス移動先
			const $newActiveConvertView = $activeConvertView.next('.convert-view');
			const newPhraseNum = $newActiveConvertView.children('.phrase-num').text();
			// 現在選択中の文節が最後の文節なら一つ前に戻る
			// 見つからなかった場合は下のselectPhraseのセレクタがエラー(newPhraseNumが空になる)
			if (!($newActiveConvertView[0])) {
				$newActiveConvertView = $activeConvertView.prev('.convert-view');
				newPhraseNum = $newActiveConvertView.children('.phrase-num').text();
			} 

			// convert-view
			$('.convert-view.active').remove();
			$newActiveConvertView.addClass('active');
			$newActiveConvertView.children('.vertical-row').first().addClass('select');

			// input_buffer > select-phrase
			$('#input_buffer > .vertical-char.select-phrase').remove();
			$('#input_buffer > .vertical-char[data-phrase-num='+ newPhraseNum + ']').addClass('select-phrase');

			resetPhraseNum();

		}

	}

	// 漢字変換中にShift+<Up>
	// 文節区切りを一つ前にずらす
	function shiftUpOnConvert() {
		'use strict';
		const $firstConvertView = $('.convert-view.active');
		const $secondConvertView = $firstConvertView.next('.convert-view');
		const firstKana = getStringFromRow($firstConvertView.children('.vertical-row').last());

		if (firstKana.length < 2) return; // 選択中の文節が１文字しかないときは何もしない

		let newStr;
		if (!($secondConvertView[0])) {
			// 最後の文節の場合
			// 分離
			newStr = firstKana.substring(0,firstKana.length-1) + ',' + firstKana.substring(firstKana.length-1,firstKana.length);
			comKanjiForSplit(newStr,$firstConvertView);
			return;
		}

		const secondKana = getStringFromRow($secondConvertView.children('.vertical-row').last());

		newStr = firstKana.substring(0,firstKana.length-1) + ','+ firstKana.substring(firstKana.length-1,firstKana.length) + secondKana; // 前半文節の最後の文字を、後半文節の最初に移動
		comKanjiForChangePhrase(newStr,$firstConvertView,$secondConvertView);
	}

	// 漢字変換中に<Up>キー
	// 選択文節を一つ上に変更
	function upOnConvert() {
		'use strict';
		const $oldSelectConvertView = $('.convert-view.active');
		let $newSelectConvertView = $oldSelectConvertView.prev('.convert-view');
		let newPhraseNum = $newSelectConvertView.children('.phrase-num').text();

		// 最初に達していたら最後に戻る
		if (!($newSelectConvertView[0])) {
			$newSelectConvertView = $('.convert-view').last();
			newPhraseNum = $newSelectConvertView.children('.phrase-num').text();
		} 

		// 表示convert-viewの変更
		$oldSelectConvertView.removeClass('active');
		$newSelectConvertView.addClass('active');

		// coanvert-view下のselectクラスの付け替え
		$('.convert-view > .vertical-row.select').removeClass('select');
		$newSelectConvertView.children('.vertical-row').first().addClass('select');

		// input_bufferのselect-phraseの変更
		$('#input_buffer > .vertical-char.select-phrase').removeClass('select-phrase');
		$('#input_buffer > .vertical-char[data-phrase-num='+ newPhraseNum + ']').addClass('select-phrase');
	}

	// 漢字変換中にShift+<Down>
	// 文節区切りの変更
	function shiftDownOnConvert() {
		'use strict';
		const $firstConvertView = $('.convert-view.active');
		const $secondConvertView = $firstConvertView.next('.convert-view');
		const firstKana = getStringFromRow($firstConvertView.children('.vertical-row').last());
		const secondKana = getStringFromRow($secondConvertView.children('.vertical-row').last());

		if (!($secondConvertView[0])) return; // 最後の文節を選択していたら何もしない

		let newStr;
		if (secondKana.length < 2) {
			//二番目の文字列が１文字しかないので、２つを統合する
			newStr = firstKana + secondKana + ',';
			comKanjiForFusion(newStr,$firstConvertView,$secondConvertView);
			return;
		}

		// 後半の１文字を前半に移す
		newStr = firstKana + secondKana.charAt(0) + ',' + secondKana.substring(1);
		comKanjiForChangePhrase(newStr,$firstConvertView,$secondConvertView);
	}

	// 漢字変換中に<Down>
	// 選択文節を次の文節に変更
	function downOnConvert() {
		'use strict';
		// 選択文節の変更
		const $oldSelectConvertView = $('.convert-view.active');
		let $newSelectConvertView = $oldSelectConvertView.next('.convert-view');
		let newPhraseNum = $newSelectConvertView.children('.phrase-num').text();

		// 最後に達していたら最初に戻る
		if (!($newSelectConvertView[0])) {
			$newSelectConvertView = $('.convert-view').first();
			newPhraseNum = $newSelectConvertView.children('.phrase-num').text();
		} 

		// convert-view
		$oldSelectConvertView.removeClass('active');
		$newSelectConvertView.addClass('active');
		$('.convert-view.active > .vertical-row.select').removeClass('select');
		$newSelectConvertView.children('.vertical-row').first().addClass('select');

		// input_bufferのselect-phrase
		$('#input_buffer > .vertical-char.select-phrase').removeClass('select-phrase');
		$('#input_buffer > .vertical-char[data-phrase-num='+ newPhraseNum + ']').addClass('select-phrase');
	}

	// 漢字変換候補一覧のフォーカスを左にシフトさせる
	function shiftLeftAlternativeFocus() {
		'use strict';
		const $oldSelect = $('.convert-view.active > .vertical-row.select');
		const $newSelect = $oldSelect.next('.vertical-row');

		if (!($newSelect[0])) return;

		// selectクラスの付け替え
		$oldSelect.removeClass('select');
		$newSelect.addClass('select');
		// inputBufferの文字を入れ替える
		const phraseNum = $newSelect.siblings('.phrase-num').text();
		const selectKanji = getStringFromRow($newSelect);
		insertPhraseToInputBuffer(phraseNum,selectKanji);
		// selectphraseクラスの付け替え
		$('.select-phrase').removeClass('select-phrase');
		$('#input_buffer > .vertical-char[data-phrase-num='+ phraseNum +']').addClass('select-phrase');

		resizeInputBuffer();
	}

	// 漢字変換候補一覧のフォーカスを右にシフトさせる
	function shiftRightAlternativeFocus() {
		'use strict';
		const $oldSelect = $('.convert-view.active > .vertical-row.select');
		const $newSelect = $oldSelect.prev('.vertical-row');
		if (!($newSelect[0])) return;

		$oldSelect.removeClass('select');
		$newSelect.addClass('select');

		const phraseNum = $newSelect.siblings('.phrase-num').text();
		const selectKanji = getStringFromRow($newSelect);
		insertPhraseToInputBuffer(phraseNum,selectKanji);

		// selectphraseクラスの付け替え
		$('.select-phrase').removeClass('select-phrase');
		$('#input_buffer > .vertical-char[data-phrase-num='+ phraseNum +']').addClass('select-phrase');

		resizeInputBuffer();
	}

	// -------------------------------- wheel event ---------------------------------

	function wheelEvent(e,delta,deltaX,deltaY) {
		'use strict';
		// マウスホイールを動かすと、ページが左右に動く
		const mvRowNum = 4; // 一度に動かす行数
		let $nextRow;

		if (delta > 0) {
			// ホイールを上に動かす
			for (let i = 0; i < mvRowNum; i++) {
				$nextRow = $('.display-row').first().prevObj('#vertical_draft .vertical-row');
				if (!$nextRow[0]) { break; }
				$nextRow.addClass('display-row');
				$('.display-row').last().removeClass('display-row');
				if (!($('.cursor-row').hasClass('display-row'))) { gCursor.shiftRight(); }
			}
		} else {
			// ホイールを下に動かす
			for (let i = 0; i < mvRowNum; i++) {
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
		'use strict';
		const $command = $('#command');

		let command = $command.val().split(' ');
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
					 comOpenNextFile();
					 break;
			case ':prev':
			case ':ｐれｖ':
					 // 前のファイルを開く
					 comOpenPrevFile();
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
					 const $file = $('.file[data-file-name="'+ command[1] +'"],.directory[data-directory-name="'+ command[1] +'"]');
					 const $newParentDir = $('.directory[data-directory-name="'+ command[2] +'"]');
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
		'use strict';
		console.log('startCommandMode');
		const $command = $('#command').addClass('active');

		$('#app_container').after($command);
		document.removeEventListener('keydown',keydownOnDoc,false);
		// フォーカスを当ててからvalueをセットすることで末尾にカーソルが移動される
		$command.focus();
		$command.val(':');

		$('body').on('keyup','#command',keyupOnCommand);
		$('body').on('blur','#command',endCommandMode);
	}

	function keyupOnCommand(e) {
		'use strict';
		console.log('keyup on #command');
		const $command = $(this);
		const keycode = getKeyCode(e);

		if (keycode == 13) {
			// enter
			runCommand();
			endCommandMode();
			e.stopPropagation(); // 親要素へのイベントの伝播(バブリング)を止める。そうしなければ先にaddeventlistenerをしてしまっているので、documentにまでエンターキーが渡ってしまい改行されてしまう。
		} else if (keycode == 27 || $command.val() == '') {
			// Esc
			// あるいは全文字削除
			endCommandMode();
			e.stopPropagation();
		} else {
			// :eなどの後に途中まで引数を打てばファイルの検索ダイアログが出るようにする
			let command = $command.val().split(' ');
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
		'use strict';
		$('#file_list_modal').addClass('command-modal').modal();
		$('.modal-backdrop.fade.in').addClass('none_modal-backdrop'); // モーダルウィンドウ表示時の半透明背景を見えなくする
	}

	function comHideFileModaOnCommand() {
		'use strict';
		if ($('body').hasClass('modal-open')) {
			$('#file_list_modal').attr('style','display: none;').removeClass('command-modal').modal('hide'); // あらかじめbootstrapより先回りしてstyle適用で非表示にしておかなければ、消える前に一瞬中央表示になってしまう
		}
		comFileList(getUserID());
	}

	function endCommandMode() {
		'use strict';
		console.log('endCommandMode');
		const $body = $('body');
		const $command = $('#command').removeClass('active');

		$body.off('keyup','#command',keyupOnCommand);
		$body.off('blur','#command',endCommandMode);
		document.addEventListener('keydown',keydownOnDoc,false);
		comHideFileModaOnCommand();
	}

	// ------------------------------ configue ----------------------------

	// [未使用]
	function Configue() {
		'use strict';
		const strLen = document.conf_form.str_len.value;
		const rowLen = document.conf_form.row_len.value;

		let strSize;
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
		'use strict';
		const $find = $('#find').addClass('active');
		// フォーカスを当ててからvalueをセットすることで末尾にカーソルが移動される
		$find.focus();
		$find.val('/');

		document.removeEventListener('keydown',keydownOnDoc,false);

		$('body').on('keyup','#find',function(e) {

			// エンターキーが押されればフォーカスをdraftに戻す(付与されたクラスは除去しない)
			if (e.keyCode == 13) {
				// enter
				$find.blur();
				document.addEventListener('keydown',keydownOnDoc,false);
				return;
			}

			// $findの中身が空になればfindモードを完全に終了する
			if ($find.val() == '') {
				$find.blur();
				document.addEventListener('keydown',keydownOnDoc,false);
				endFindMode();
				return;
			}

			find($find.val().substring(1));
		});

		$('body').on('blur','#find',function(e) {
			document.addEventListener('keydown',keydownOnDoc,false);
		});
		$('body').on('focus','#find',function(e) {
			document.removeEventListener('keydown',keydownOnDoc,false);
		});
	}

	// 字句検索を完全に終了する
	function endFindMode() {
		'use strict';
		$('#find').removeClass('active').val('');
		$('.find-label').removeClass('find-label');
		$('.find-word').removeClass('find-word');
	}

	function find(word) {
		// 検索字句にクラスを付与する
		'use strict';
		const eDraft = document.getElementById('vertical_draft');

		// reset
		const eOldLabel = eDraft.getElementsByClassName('find-label');
		const eOldWord = eDraft.getElementsByClassName('find-word');
		while (eOldLabel[0]) { // クラスをremoveするとeOldLabelからその要素がなくなって詰められる
			eOldLabel[0].classList.remove('find-label');
		}
		while (eOldWord[0]) {
			eOldWord[0].classList.remove('find-word');
		}
		console.log('removed');
		if (word === '') return; // 検索文字がなくなった場合は、すべての文字からクラスを除去するのみ

		const eChars = eDraft.getElementsByClassName('vertical-char');
		const indexArr = findIndex(word);
		// console.log(indexArr);
		const wordLen = word.length;
		for (let i = 0,len = indexArr.length;i < len;i++) {
			// 先頭文字にfind-label
			eChars[indexArr[i]].classList.add('find-label');
			for (let j=0;j<wordLen;j++) {
				// 該当文字全てにfind-word
				eChars[indexArr[i]+j].classList.add('find-word');
			}
		}

		// カーソル位置の次に位置する検索語句の頭にカーソルを移動する
		if (!eDraft.getElementsByClassName('cursor')[0].classList.contains('find-label')) findNext();
	}

	function findIndex(word) {
		'use strict';
		/*
		 * 字句検索
		 * 1文字目のインデックスの配列を返す
		 * 検索字句を1文字ずつ確認
		 * 検索字句の1文字目と、配列に残っているインデックスのvertical-charの文字を比較し、異なれば配列から除外する
		 * 検索字句の2文字目と、配列に残っているインデックスのvertical-charの次のvertical-charの文字を比較し、異なれば配列から除外する
		 * 検索字句の3文字目と、配列に残っているインデックスのvertical-charから２つ後のvertical-charの文字を比較し、異なれば配列から除外する
		 * 検索字句のすべての文字に対して以上を繰り返していき、最終的に配列要素として残っているインデックスが、検索文字列の１文字目のインデックスとなる
		 */
		const eChars = document.getElementById('vertical_draft').getElementsByClassName('vertical-char');
		const indexArr = [];

		// いったん、すべての文字のインデックスを配列に入れる
		for (let i = 0,len = eChars.length;i < len;i++) {
			indexArr[i] = i;
		}

		for (let search_i = 0,wordLen = word.length,searchChar;search_i < wordLen;search_i++) {
			searchChar = word.charAt(search_i);
			// 配列から、条件に合わない要素のインデックスを除外する
			for (let index_i = 0;index_i < indexArr.length;index_i++) { // lengthは変動する
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
		'use strict';
		const $oldCursor = $('.cursor');
		const $newCursor = $oldCursor.nextObj('#vertical_draft .find-label,.cursor',true);

		if (!$newCursor[0]) return;

		$newCursor.addCursor(true);
		gCursor.repositionCharNum();
	}

	// 前の検索語句にカーソルを戻す
	function findPrev() {
		'use strict';
		const $oldCursor = $('.cursor');
		const $newCursor = $oldCursor.prevObj('#vertical_draft .find-label,.cursor',true);

		if (!$newCursor[0]) return;

		$newCursor.addCursor(true);
		gCursor.repositionCharNum();
	}

	// -------------------------------- for user utility ---------------------------------------
	function userAlert(str) {
		'use strict';
		$('#user_info').text(str);
	}

	// ===================================================================
	// 		文章操作(label:string)
	// ===================================================================

	// ------------------------------  insert string ------------------------

	function printString(strArray) {
		'use strict';
		// 配列を引数にして、各文字列を本文表示
		// 配列に入っている各文字列をそれぞれ段落として挿入する
		const strLen = getStringLenOfRow();
		let html = '';

		// 段落のhtml文字列を作成して連結
		for (let i = 0,len = strArray.length;i < len;i++) {
			html += createParagraphHtml(strArray[i]);
		}

		// データに１文字もなければ上記for文に入れないので、空行を別に作成する
		if ($('#vertical_draft > .vertical-paragraph').length === 0) {
			// appendParagraph('');
			html += createParagraphHtml('');
		}

		// innerHTMLで画面内に挿入する
		document.getElementById('vertical_draft').innerHTML = html;
	}

	function appendParagraph(str) {
		'use strict';
		$('#vertical_draft').append(createParagraphHtml(str));
	}

	function appendParagraphFromObj(paraObjArr) {
		// 決まった形のオブジェクトを引数に、本文を作成して画面に表示する
		'use strict';
		let html = '';
		for (let i = 0,len = paraObjArr.length; i < len; i++) {
			html += createParagraphHtmlFromObj(paraObjArr[i]);
		}
		document.getElementById('vertical_draft').innerHTML = html;
	}

	function insertStringFromCursor(str) {
		'use strict';
		console.log('ins string from cursor');
		const $cursor = $('.cursor');
		const $cursorRow = $('#vertical_draft .cursor-row')

			for (let i = 0,len = str.length,$character; i < len; i++) {
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
		'use strict';
		const $inputBuffer = $('#input_buffer');
		$inputBuffer.empty();

		for (let i = 0,len = str.length,char;i < len;i++) {
			char = str.charAt(i);
			$inputBuffer.append($(createCharHtml(char)).attr('data-phrase-num',-1));
		}

		$inputBuffer.append($('<span class="vertical-char EOL"></span>'));
		$inputBuffer.show();

		moveInput();

		return $inputBuffer;
	}

	// inputBufferの更新
	function updateInputBuffer(keycode,isShift) {
		'use strict';
		const inputStr = getStringFromRow($('#input_buffer')); //もともとの文字列
		let newInputStr;

		if (isShift) {
			newInputStr = inputStr + key_table.shift_key[keycode];
		} else {
			newInputStr = key_table.getString(inputStr,keycode); //keycodeを加えた新しい文字列
		}

		if (newInputStr === undefined || newInputStr.indexOf('undefined') !== -1) {
			// 未定義文字(alt,ctrl,tabなど)はreturn
			return;
		}

		insertStringToInputBuffer(newInputStr);
	}

	function insertPhraseToInputBuffer(phNum,str) {
		'use strict';
		// 文節番号phNumを、strで置き換える
		// 新しい文字集合のオブジェクトを返す
		const $selectPhrases = $('#input_buffer > .vertical-char[data-phrase-num='+ phNum +']');
		const $insertPosChar = $selectPhrases.first();

		for (let i = 0,$character; i < str.length; i++) {
			$character = $(createCharHtml(str.charAt(i)));
			$insertPosChar.before($character);
			$character.attr('data-phrase-num',-10);
		}
		$selectPhrases.remove();

		return $('#input_buffer > .vertical-char[data-phrase-num="-10"]').attr('data-phrase-num',phNum);
	}

	// --------------------------------------- create string html ------------------------------------

	// 文字列を引数にして、段落のhtml文字列を作成する
	function createParagraphHtml(str) {
		'use strict';
		let html = '<div class="vertical-paragraph">'

			// strLen文字ごとに区切って各行として連結する
			const strLen = getStringLenOfRow();
		for (let pos = 0,len = str.length,outputStr; pos <= len; pos += strLen) { // 空文字が渡されることもあるので、pox<=lenと=がついている
			outputStr = pos+strLen>str.length ? str.slice(pos) : str.substring(pos,pos+strLen);
			html += createRowHtml(outputStr);
		}

		html += '</div>'

			return html;
	}

	// 文字列を引数にして行のhtml文字列を作成する
	function createRowHtml(str) {
		'use strict';
		if (str == null) return;

		let html = '<div class="vertical-row">'

			for (let i = 0,len = str.length; i < len; i++) {
				html += createCharHtml(str.charAt(i));
			}

		html += '<span class="vertical-char EOL display-char"></span></div>';

		return html;
	}

	function createCharHtml(char) {
		'use strict';
		// stringを引数にして、文字のhtml文字列を作成する
		// 引数の文字列が２文字以上の場合は、最初の１文字のみが有効
		// クラスを追加するには、最初に半角スペースを入れること
		if (char.length > 1) { char = char.charAt(0); }
		const classArr = getConfDecoChar();
		let html = '<span class="vertical-char display-char';

		for (let i = 0,len = classArr.length; i < len; i++) {
			html += ' ' + classArr[i];
		}

		// 特殊クラスの付与
		if (/[。、,\.]/.test(char))
			html += ' vertical-dot';
		else if (/[「『]/.test(char))
			html += ' vertical-before-kagi-bracket';
		else if (/[」』]/.test(char))
			html += ' vertical-after-kagi-bracket';
		else if (/[（\[<\{【\(［〈]/.test(char))
			html += ' vertical-before-bracket';
		else if (/[\)\]>\}】）］〉]/.test(char))
			html += ' vertical-after-bracket';
		else if (/[-ー―〜]/.test(char))
			html += ' character-line';
		else if (/[a-z]/.test(char))
			html += ' alphabet';
		else if (/[１-９]/.test(char))
			html += ' number';
		else if (/[っゃゅょぁぃぅぇぉァィゥェォッャュョ]/.test(char))
			html += ' yoin';

		// html += `" data-font-size="auto">${char}</span>`;
		html += '" data-font-size="auto">';
		html += char;
		html += '</span>';
		return html;
	}

	function createParagraphHtmlFromObj(paraObj) {
		'use strict';
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
		let html = '<div class="vertical-paragraph"';

		// 段落そのものにクラスを付与する
		for (let i = 0,len = paraObj[0].length;i<len;i++) {
			html += ' ' + paraObj[0][i];
		}
		html += '>';

		// 文字の配列をstrLen個ずつの配列に分け、それぞれで行を作成して連結する
		const strLen = getStringLenOfRow();
		const objArray = splitArray(paraObj[1],strLen); // paraObj[1]が空配列なら、objArrayにも空配列が入る
		for (let i = 0,len = objArray.length; i < len; i++) {
			html += createRowHtmlFromObj(objArray[i]);
		}
		// paraObj[1]が空配列 = 空段落(空行)の場合は上記for文が実行されないので、別に空行を作成して連結する
		if (objArray.length === 0) {
			html += createRowHtmlFromObj([]); // createRow~に空配列を渡せば空行が作られる
		}

		html += '</div>';
		return html;
	}

	function createRowHtmlFromObj(objArray) {
		'use strict';
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
		let html = '<div class="vertical-row">';

		for (let i = 0,len = objArray.length; i < len; i++) {
			html += createCharHtmlFromObj(objArray[i]);
		}
		html += '<span class="vertical-char EOL display-char"></span></div>'
			return html;
	}

	function createCharHtmlFromObj(obj) {
		'use strict';
		// 決まった形のオブジェクトを引数にして、charのhtml文字列を作成する
		// クラスを追加するには、最初に半角スペースを入れること
		/*
		 *		文字を表すオブジェクト
		 *		{
		 *			"char":"あ",
		 *			"decolation":["decolation-color-blue"]
		 *		}
		 */
		const char = obj['char'];
		const classArr = obj['decolation'];
		let html = '<span class="vertical-char';

		for (let i = 0,len = classArr.length; i < len; i++) {
			html += ' ' + classArr[i];
		}

		// 文字の種類に応じて付与するクラス
		if (/[。、,\.,]/.test(char))
			html += ' vertical-dot';
		else if (/[「『]/.test(char))
			html += ' vertical-before-kagi-bracket';
		else if (/[」』]/.test(char))
			html += ' vertical-after-kagi-bracket';
		else if (/[（\[<\{【\(［〈]/.test(char))
			html += ' vertical-before-bracket';
		else if (/[\)\]>\}】）］〉]/.test(char))
			html += ' vertical-after-bracket';
		else if (/[-ー―〜]/.test(char))
			html += ' character-line';
		else if (/[a-z]/.test(char))
			html += ' alphabet';
		else if (/[１-９]/.test(char))
			html += ' number';
		else if (/[っゃゅょぁぃぅぇぉァィゥェォッャュョ]/.test(char))
			html += ' yoin';

		html += '" data-font-size="';
		html += obj.fontSize || 'auto';
		html += '">';
		html += char;
		html += '</span>';

		return html;
	}

	// ---------------------------------- get text -------------------------------------------

	function getStringFromRow($row) {
		'use strict';
		let $character = $row.children('.vertical-char').first('.vertical-char');
		let rtnStr = '';

		while ($character[0] && !($character.hasClass('EOL'))) {
			rtnStr += $character.text();
			$character = $character.next();
		}

		return rtnStr;
	}

	function getStringFromParagraph($paragraph) {
		'use strict';
		const $rows = $paragraph.children('.vertical-row');
		let rtnStr = '';

		for (let i = 0,len = $rows.length; i < len; i++) {
			rtnStr += getStringFromRow($rows.eq(i));
		}

		return rtnStr;
	}

	// ----------------------------------- get json text data on draft --------------------------------

	function makeJsonDataForSave() {
		'use strict';
		// テキスト情報をJsonで表す
		const data = {};
		data.conf = {};
		data.text = textToObj();
		return JSON.stringify(data);
	}

	// 本文に関する情報をオブジェクトで表す
	function textToObj() {
		'use strict';
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
		const $paragraphs = $('#vertical_draft > .vertical-paragraph');
		const paragraphArrays = [];

		for (let i = 0,len = $paragraphs.length; i < len; i++) {
			paragraphArrays[i] = makeParagraphArray($paragraphs.eq(i));
		}

		return paragraphArrays;
	}

	// ひとつの段落に関する情報を配列で表す
	function makeParagraphArray($paragraph) {
		'use strict';
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
		const paraArr = [];

		// 段落に直接付与されているクラスを配列化する
		paraArr[0] = splitParagraphClass($paragraph);

		const charArray = [];
		const $chars = $paragraph.find('.vertical-char').not('.EOL');
		for (let i = 0,len = $chars.length; i < len; i++) {
			charArray[i] = new CharacterData($chars.eq(i));
		}

		paraArr[1] = charArray;

		return paraArr;
	}

	// 段落に付与されている装飾用のクラスを文字列の配列にする
	// ["decolation-textalign-center"]
	function splitParagraphClass($paragraph) {
		'use strict';
		const arr = $paragraph.attr('class').match(/decolation-\S+/g) || [];
		return arr;
	}

	function CharacterData($character) {
		'use strict';
		// 文字情報をインスタンス化する
		/*
		 *	{ // Characterdata();
		 *		"char":"あ",
		 *		"decolation":["decolation-color-blue"]
		 *	}
		 */
		const classArray = $character.attr('class').match(/decolation-\S+/g) || [];
		this['char'] = $character.text();
		this['decolation'] = classArray;
		this['fontSize'] = $character[0].dataset.fontSize || null;
	}

	// --------------------------------------- convert kanji -------------------------------------------

	function comKanjiForFullString(str) {
		'use strict';
		// 漢字変換
		// 初変換時
		console.log('comKanjiに渡した文字列:' + str);
		$.ajax({
			type : 'POST',
			url : '/tategaki/KanjiProxy',
			data : {
				sentence: str
			},
			dataType : 'json',
			context: {
			},
			success : function (json) {
				// 表示データを受け取ってからの処理
				// Google日本語入力のwebAPIから、json形式で変換候補が渡される
				// json[0][0]; // ひらがな
				// json[0][1][0]; // 変換候補１つ目
				console.log('初変換:');

				// convert-view群を作成する
				buildConvertViews(json);

				// input_bufferの各文字に、文節番号を割り振る
				setPhraseNumToCharOnInputBuffer(json);

				// input_bufferの文字を、変換第一候補ですべて置き換える
				for (let i = 0,len = json.length; i < len; i++) {
					insertPhraseToInputBuffer(i,json[i][1][0]); // 第一候補の漢字でinputBufferの文字列を置き換える
				}
				// selectphraseクラスを設定する
				$('#input_buffer').children('.vertical-char[data-phrase-num="0"]').addClass('select-phrase');
				// inputBufferの高さ調整
				resizeInputBuffer();

			},
			error : function (XMLHttpRequest, textStatus, errorThrown) {
				alert('Error:'+ textStatus + ':\n' + errorThrown + ':status=' + XMLHttpRequest.status + 'in comKanjiForFullString');
			}
		});
	}

	// input_bufferの各文字に、文節番号を割り振る
	function setPhraseNumToCharOnInputBuffer(json) {
		'use strict';
		const eChars = document.getElementById('input_buffer').getElementsByClassName('vertical-char');

		// 各文節ループ
		// pos: 各文節の１文字目のインデックスを保持
		for (let i = 0,pos = 0,len = json.length,hiragana,hiraLen; i < len; i++) {
			hiragana = json[i][0];
			hiraLen = hiragana.length;

			// 同一文節ループ
			// 文節番号をつける(同じ文節には同じ番号)
			for (let j = pos; j < (pos + hiraLen); j++) {
				eChars[j].dataset.phraseNum = i;
			}

			pos += hiraLen;

		}

	}

	// convert-view群を作成する
	function buildConvertViews(json) {
		'use strict';
		const $convertContainer = $('#convert_container');

		// 各文節ループ
		for (let i = 0,len = json.length,$convertView; i < len; i++) {
			// 変換候補表示
			// convertviewを作成する
			$convertView = createConvertView(i,json[i]);
			$convertContainer.append($convertView);
		}

		// 最初のconvertViewにactiveを付与
		const $convertViews = $convertContainer.children('.convert-view');
		const $activeView = $convertViews.first().addClass('active');

		$activeView.children('.vertical-row').first().addClass('select');

		repositionConvertView();
	}

	function comKanjiForChangePhrase(str,$firstConvertView,$secondConvertView) {
		'use strict';
		// 漢字変換
		// 文節総数に変化なし(文節の区切り目のみ変更)
		console.log('comKanjiに渡した文字列:' + str);
		$.ajax({
			type : 'POST',
			url : '/tategaki/KanjiProxy',
			data : {
				sentence: str
			},
			dataType : 'json',
			context: {
				$firstConvertView: $firstConvertView,
				$secondConvertView: $secondConvertView,
			},
			success : function (json) {
				// 表示データを受け取ってからの処理
				// Google日本語入力のwebAPIから、json形式で変換候補が渡される
				// json[0][0]; // ひらがな
				// json[0][1][0]; // 変換候補１つ目
				console.log('文節総数に変化なし:');
				const firstPhraseNum = this.$firstConvertView.children('.phrase-num').text();
				const secondPhraseNum = this.$secondConvertView.children('.phrase-num').text();

				// convert-view
				const $newFirstConvertView = createConvertView(firstPhraseNum,json[0]).addClass('active');
				const $newSecondConvertView = createConvertView(secondPhraseNum,json[1]);
				this.$firstConvertView.before($newFirstConvertView);
				this.$secondConvertView.before($newSecondConvertView);
				this.$firstConvertView.remove();
				this.$secondConvertView.remove();

				$newFirstConvertView.children('.vertical-row').first().addClass('select');
				repositionConvertView();

				// input_buffer
				// 第一候補の文字でinputBufferの該当文字を置き換える
				insertPhraseToInputBuffer(firstPhraseNum,json[0][1][0]);
				insertPhraseToInputBuffer(secondPhraseNum,json[1][1][0]);

				// selectphraseクラスの付け替え
				$('#input_buffer > .vertical-char[data-phrase-num='+ firstPhraseNum +']').addClass('select-phrase');
				// 最後にinputBufferの高さ調整
				resizeInputBuffer();
			},
			error : function (XMLHttpRequest, textStatus, errorThrown) {
				alert('Error:'+ textStatus + ':\n' + errorThrown + ':status=' + XMLHttpRequest.status + 'in comKanji');
			}
		});
	}

	function comKanjiForFusion(str,$firstConvertView,$secondConvertView) {
		'use strict';
		// 漢字変換
		// 統合時
		// $firstconvertviewと$secondconvertviewを一つにする
		// 選択中の文節の次の文節が一文字の場合にShift+Down
		console.log('comKanjiに渡した文字列:' + str);
		$.ajax({
			type : 'POST',
			url : '/tategaki/KanjiProxy',
			data : {
				sentence: str
			},
			dataType : 'json',
			context: {
				$firstConvertView: $firstConvertView,
				$secondConvertView: $secondConvertView,
			},
			success : function (json) {
				// 表示データを受け取ってからの処理
				// Google日本語入力のwebAPIから、json形式で変換候補が渡される
				// json[0][0]; // ひらがな
				// json[0][1][0]; // 変換候補１つ目
				console.log('統合:');
				const firstPhraseNum = this.$firstConvertView.children('.phrase-num').text();

				// convert-view
				const $newConvertView = createConvertView(firstPhraseNum,json[0]).addClass('active');
				this.$firstConvertView.before($newConvertView);
				this.$firstConvertView.remove();
				this.$secondConvertView.remove();
				repositionConvertView();

				// input_buffer
				// 第一候補の文字でinputBufferの該当文字を置き換える
				$newConvertView.children('.vertical-row').first().addClass('select');
				insertPhraseToInputBuffer(firstPhraseNum,json[0][1][0]);
				const secondPhraseNum = this.$secondConvertView.children('.phrase-num').text();
				$('#input_buffer > .vertical-char[data-phrase-num='+ secondPhraseNum +']').remove();
				// selectphraseクラスの付け替え
				$('#input_buffer > .vertical-char[data-phrase-num='+ firstPhraseNum +']').addClass('select-phrase');
				resetPhraseNum();
				// inputBufferの高さ調整
				resizeInputBuffer();
			},
			error : function (XMLHttpRequest, textStatus, errorThrown) {
				alert('Error:'+ textStatus + ':\n' + errorThrown + ':status=' + XMLHttpRequest.status + 'in comKanji');
			}
		});
	}

	function comKanjiForSplit(str,$firstConvertView) {
		'use strict';
		// 漢字変換
		// 分離時
		// 最後の文節からshift+Up
		console.log('comKanjiに渡した文字列:' + str);
		$.ajax({
			type : 'POST',
			url : '/tategaki/KanjiProxy',
			data : {
				sentence: str
			},
			dataType : 'json',
			context: {
				$firstConvertView: $firstConvertView,
			},
			success : function (json) {
				// 表示データを受け取ってからの処理
				// Google日本語入力のwebAPIから、json形式で変換候補が渡される
				// json[0][0]; // ひらがな
				// json[0][1][0]; // 変換候補１つ目
				console.log('分離:');
				const firstPhraseNum = this.$firstConvertView.children('.phrase-num').text();
				const secondPhraseNum = $('.convert-view').length; // 未使用の数字を取得

				// convert-view
				const $newFirstConvertView = createConvertView(firstPhraseNum,json[0]).addClass('active');
				const $newSecondConvertView = createConvertView(secondPhraseNum,json[1]);
				this.$firstConvertView.before($newFirstConvertView);
				this.$firstConvertView.before($newSecondConvertView);
				this.$firstConvertView.remove();
				repositionConvertView();

				// input_buffer
				// first phrase
				// 第一候補の文字でinputBufferの該当文字を置き換える
				$newFirstConvertView.children('.vertical-row').first().addClass('select');
				const $newBufferChars = insertPhraseToInputBuffer(firstPhraseNum,json[0][1][0]);
				$newBufferChars.addClass('select-phrase');
				// second phrase
				const secondFirstStr = json[1][1][0];
				const $insertPosChar = $('#input_buffer > .vertical-char[data-phrase-num='+ firstPhraseNum + ']').last();
				for (let i = secondFirstStr.length -1,$character; i >= 0; i--) {
					$character = $(createCharHtml(secondFirstStr.charAt(i))).attr('data-phrase-num',secondPhraseNum);
					$insertPosChar.after($character);
				}

				// selectphraseクラスの付け替え
				resetPhraseNum();
				// 最後にinputBufferの高さ調整
				resizeInputBuffer();
			},
			error : function (XMLHttpRequest, textStatus, errorThrown) {
				alert('Error:'+ textStatus + ':\n' + errorThrown + ':status=' + XMLHttpRequest.status + 'in comKanji');
			}
		});
	}

	function comKanjiForOnePhrase(str,$firstConvertView) {
		'use strict';
		// 漢字変換
		// 一文節のみ変換
		// 漢字変換中にBackSpaceを押すなどして、一文節のみ再変換が必要になった場合
		console.log('comKanjiに渡した文字列:' + str + ',');
		$.ajax({
			type : 'POST',
			url : '/tategaki/KanjiProxy',
			data : {
				sentence: str+',' // 文節を区切られないよう、,を末尾に追加
			},
			dataType : 'json',
			context: {
				$firstConvertView: $firstConvertView,
			},
			success : function (json) {
				// 表示データを受け取ってからの処理
				// Google日本語入力のwebAPIから、json形式で変換候補が渡される
				// json[0][0]; // ひらがな
				// json[0][1][0]; // 変換候補１つ目
				console.log('一文節のみ変換:');

				// convert-view
				const firstPhraseNum = this.$firstConvertView.children('.phrase-num').text();
				const $newConvertView = createConvertView(firstPhraseNum,json[0]).addClass('active');
				this.$firstConvertView.before($newConvertView);
				this.$firstConvertView.remove();
				// 第一候補の文字でinputBufferの該当文字を置き換える
				$newConvertView.children('.vertical-row').first().addClass('select');
				repositionConvertView();

				// input_buffer
				const $newBufferChars = insertPhraseToInputBuffer(firstPhraseNum,json[0][1][0]);
				// selectphraseクラスの付け替え
				$newBufferChars.addClass('select-phrase');
				// 最後にinputBufferの高さ調整
				resizeInputBuffer();
			},
			error : function (XMLHttpRequest, textStatus, errorThrown) {
				alert('Error:'+ textStatus + ':\n' + errorThrown + ':status=' + XMLHttpRequest.status + 'in comKanji');
			}
		});
	}

	// convertviewを作成する
	function createConvertView(phNum,jsonArray) {
		'use strict';
		// jsonArrayはひらがなと漢字配列が入るように、json[i]の形で渡す
		let html = '<div class="convert-view">'

			if (jsonArray[1] != null) {

				for (let i = 0,len = jsonArray[1].length; i < len; i++) {
					html += createRowHtml(jsonArray[1][i]);
				}

			} else {
				console.log('no convert data');
			}

		// 最後はひらがな
		html += createRowHtml(jsonArray[0]);

		// 文節番号を示す数字をリストに表示する
		// phrase_numはクラスと、inputBuffer文字が持つ属性とで二種類あるから注意
		html += '<div class="phrase-num">';
		html += phNum;
		html += '</div></div>';

		return $(html);
	}

	// inputBufferの文節番号を振り直す
	function resetPhraseNum() {
		'use strict';
		let $iterCharacter = $('#input_buffer > .vertical-char').first();
		let $convertView = $('.convert-view').first();
		let newNum = 0;
		let tempPhraseNum = $iterCharacter.attr('data-phrase-num'); // 処理している文字の古い文節番号を保持する

		$convertView.children('.phrase-num').text(newNum);
		while (!($iterCharacter.hasClass('EOL'))) {

			if (tempPhraseNum !== $iterCharacter.attr('data-phrase-num')) {
				// 異なる文節
				tempPhraseNum = $iterCharacter.attr('data-phrase-num');
				newNum++;
				// convert-view
				$convertView = $convertView.next('.convert-view');
				$convertView.children('.phrase-num').text(newNum);
			}

			// 同じ文節
			$iterCharacter.attr('data-phrase-num',newNum);
			$iterCharacter = $iterCharacter.next('.vertical-char');
		}
	}

	// ------------------------------------ convert katakana --------------------------------------

	// ひらがな入力中のカタカナ変換
	// inputbufferの文字をすべてカタカナに変える
	function changeKatakanaAtInput() {
		'use strict';
		let str = getStringFromRow($('#input_buffer'));
		insertStringToInputBuffer(getKatakana(str)).children('.vertical-char').not('.EOL').addClass('select-phrase');
	}

	// 漢字変換中のカタカナ変換
	// 選択中の文節のみカタカナに変える
	function changeKatakanaAtConvert() {
		'use strict';
		const phraseNum = $('#input_buffer > .select-phrase').attr('data-phrase-num');
		const str = getKatakana(getStringFromRow($('.convert-view.active > .vertical-row').last()));
		insertPhraseToInputBuffer(phraseNum,str).addClass('select-phrase');
		resizeInputBuffer();
	}

	// strをカタカナにして返す
	// カタカナ変換できない文字はそのまま
	function getKatakana(str) {
		'use strict';
		let rtnKatakana = '';
		for (let i = 0,len = str.length,cKatakana; i < len; i++) {
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
		'use strict';
		const $cursor = $('.cursor');
		const $prevChar = $cursor.prev(); //移動しない文字の最後
		const $cursorRow = $('.cursor-row');

		if ($prevChar[0]) {
			const $nextRow = $cursorRow.nextAll('.vertical-row').first(); //改行前の次の行

			// paragraph
			if (!($nextRow[0])) {
				// 次の行がなければ新しく作る
				$nextRow = $(createRowHtml(''));
				$cursorRow.after($nextRow);
				reDisplay();
			}
			// $nextRow以降を新しい段落とする
			devideParagraph($nextRow);

			// char移動
			const $insertPosChar = $nextRow.children('.vertical-char').first(); //挿入先の先頭文字
			let $moveChar = $cursor; // 移動文字
			// $nextRowの先頭にある$insertPosCharに、$prevChar以降の文字を挿入していく
			while ($moveChar[0] && !($moveChar.hasClass('EOL'))) { // EOLは移動しない
				$moveChar.remove();
				$insertPosChar.before($moveChar);
				$moveChar = $prevChar.nextAll('.vertical-char').first();
			}

			if ($cursor.hasClass('EOL')) { // EOLにカーソルがあると、EOLが動かないために、カーソルが次の行に行かないので強制的に動かす必要あり
				// = 段落末での改行
				$nextRow.children('.vertical-char:first-of-type').addCursor();
			}
			// 移動文字列を次の行に入れた結果規定文字数を超えた場合のために、次の行を文字数調整
			cordinateStringNumber($nextRow,getStringLenOfRow());

			gCursor.repositionCharNum();

			return;
		}

		if (!$prevChar[0]) {
			// 行頭カーソルで改行

			if (($cursorRow.prev())[0]) {
				// 段落途中での行頭改行では、段落を２つに分ける
				devideParagraph($cursorRow);
			} else {
				// 段落最初での改行では、その前のところに空行挿入
				const $baseParagraph = $cursorRow.closest('.vertical-paragraph');
				$baseParagraph.before($(createParagraphHtml('')));
				reDisplay();
			}

			return;
		}

	}

	// カーソルの前に位置する文字を削除する
	function backSpaceOnDraft() {
		'use strict';
		// $delChar: 削除文字
		// $rowofdelchar: 削除文字のある行
		// 行途中でのBS: cursorの前の文字を削除する
		// 行頭からのBS： 前の行の最終文字を削除文字にする
		// 第二段落以降の段落先頭でのBS：前の段落と現在の段落をつなげる
		// 空段落でのBS：その段落を削除する
		// 文章先頭からのBS：何もしない
		const $delChar = $('.cursor').prev();

		// 行の途中でのBS
		if ($delChar[0]) { return deleteCharacter($delChar); }

		// 行頭からのBS
		const $rowOfDelChar = $('.cursor-row');
		const $preRow = $rowOfDelChar.prevAll('.vertical-row').first();

		// 段落途中の行頭からのBS
		if($preRow[0]) {
			$delChar = $preRow.children('.EOL').prev(); // 前の行の最終文字を削除文字に
			return deleteCharacter($delChar);
		}

		// 以下(段落先頭からのBS)は文字の削除を伴わない
		// 空段落でのBS
		// 第二段落以降の段落先頭でのBS
		// 文章先頭でのBS
		// 段落先頭でのBS
		const $paragraphOfDelChar = $rowOfDelChar.closest('.vertical-paragraph');
		const $preParagraph = $paragraphOfDelChar.prevAll('.vertical-paragraph').first();

		$preRow = $preParagraph.children('.vertical-row').last();

		if ($preParagraph[0]) {
			// 第二段落以降の段落

			const $firstRowOfDelChar = $paragraphOfDelChar.children('.vertical-row').first();
			if ($firstRowOfDelChar.children('.vertical-char').first().hasClass('EOL')) {
				// 空段落でのBS
				$paragraphOfDelChar.remove(); // 段落削除
				// cursorの調整
				$preRow.children('.vertical-char').last().addCursor(false); // 前の行の最終文字にカーソルを移動
				reDisplay();
				gCursor.repositionCharNum();
				return '';
			}

			// 第二段落以降の段落先頭でのBS
			// 段落をつなげる
			uniteParagraph($preParagraph,$paragraphOfDelChar);
			reDisplay();
			gCursor.repositionCharNum();
			return '';
		}

		// 文章先頭でのBS
		return null;
	}

	function deleteCharacter($delChar) {
		'use strict';
		const $rowOfDelChar = $delChar.closest('.vertical-row');

		backChar($rowOfDelChar); // 次の行から１文字持ってくる
		$delChar.remove();

		if ($rowOfDelChar.children('.vertical-char').first().hasClass('EOL') && ($rowOfDelChar.prev())[0]) {
			// 文字を削除後、削除文字のあった行が空行で、かつその前の行が存在する = 複数段落の最終行が１文字しかなく、その文字を削除した場合空となるので、削除文字のあった行を削除し、その前の行の最後にカーソルを移動する
			// 先にカーソルの調整($rowOfDelChar削除前にカーソル位置取得)
			$rowOfDelChar.prev().children('.vertical-char').last().addCursor(false);
			// 行の削除
			$rowOfDelChar.remove();
			reDisplay();
		}
		gCursor.repositionCharNum();
		return $delChar.text();
	}

	// $row以降を新しい段落として、段落を２つに分ける
	function devideParagraph($row) {
		'use strict';
		const $newParagraph = $('<div>').addClass('vertical-paragraph');
		const $baseParagraph = $row.closest('.vertical-paragraph');
		$baseParagraph.after($newParagraph);

		let $nextRow;
		while ($row[0]) {
			// $rowを新しい段落に移動していく
			$nextRow = $row.next(); // $rowを移動すると次の移動対象選択には使えないので、次の行を保持しておく
			$row.remove();
			$newParagraph.append($row);
			$row = $nextRow;
		}

		return $newParagraph;
	}

	// 隣接する２つの段落の統合
	// baseParagraphにanotherParagraphを吸収して統合する
	function uniteParagraph($baseParagraph,$anotherParagraph) {
		'use strict';
		const $preRow = $baseParagraph.children('.vertical-row').last(); // baseparagraphの最終行をあらかじめ保持しておく
		let $mvRow = $anotherParagraph.children('.vertical-row').first();

		while ($mvRow[0]) {
			// $anotherparagraphの行を$baseparagraphに移動
			$mvRow.remove();
			$baseParagraph.append($mvRow);
			$mvRow = $anotherParagraph.children('.vertical-row').first();
		}
		$anotherParagraph.remove();

		// baseParagraphのもともとの最終行の文字数が規定数になるよう、その次の行から文字を持ってきて埋める
		const cnt = getStringLenOfRow() - ($preRow.children('.vertical-char').length -1); // lengthではEOLも含まれるので-1
		for (let i = 0; i < cnt; i++) {
			backChar($preRow);
		}
	}

	// ------------------------------------- string cordinator --------------------------------------

	// 入力などの結果規定文字数を超えた行の文字数を調整する
	function cordinateStringNumber($row,strLen) {
		'use strict';
		// 超えた分を次の行に移動する
		// 同一段落内で完結
		// $row: 調整行
		// strLen: １行の文字数
		if ($row.children().length <= (strLen +1)) return; //調整行の文字数が規定値以下なら調整の必要なし(EOL含めると31個)

		let $nextRow = $row.nextAll('.vertical-row').first();

		if (!($nextRow[0])) {
			// 次の行がなければ新しく作る
			$nextRow = $(createRowHtml(''));
			$row.after($nextRow);
			reDisplay();
		}

		const $prevChar = $row.children('.vertical-char').eq(strLen -1); //移動しない文字の最後
		const $insertPosChar = $nextRow.children('.vertical-char').first(); //挿入先の最初の文字
		let $moveChar = $prevChar.nextAll('.vertical-char').first(); // 移動文字
		while ($moveChar[0] && !($moveChar.hasClass('EOL'))) { // EOLは移動しない
			$moveChar.remove();
			$insertPosChar.before($moveChar);
			$moveChar = $prevChar.nextAll('.vertical-char').first();
		}

		// 移動先の行がstrlen文字を超えている時のために再帰
		cordinateStringNumber($nextRow,strLen);

		// cursorが調整行の最後にあれば動いてくれないので、強制的に動かす
		if ($prevChar.nextAll('.vertical-char').first().hasClass('cursor')) {
			$insertPosChar.addCursor();
			gCursor.repositionCharNum();
		}
		gCursor.addCursorRow();
	}

	// $bringRowの次の行の最初の文字を、$bringRowの最後に移動する
	function backChar($bringRow) {
		'use strict';
		const $nextRow = $bringRow.nextAll('.vertical-row').first();

		if (!($nextRow[0])) return;

		const $backChar = $nextRow.children('.vertical-char').first();

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

	// 禁則処理
	function checkKinsoku() {
		'use strict';
		const $dots = $('#vertical_draft .vertical-char.vertical-dot').add('#vertical_draft .vertical-char.vertical-after-bracket');

		if ($dots[0]) {
			let $self;
			let $selfRow;
			let $prevRow;
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

	// 選択範囲の文字に文字色を適用する
	function setColorOnSelect(color) {
		'use strict';
		switch (color) {
			case 'black':
				removeClassOnSelect('decolation-color');
				break;
			case 'red':
				addDecolationClassOnSelect('decolation-color-red');
				break;
			case 'blue':
				addDecolationClassOnSelect('decolation-color-blue');
				break;
			default:
				break;
		}
	}

	// 選択範囲の文字から文字色を外す
	function removeColorOnSelect() {
		'use strict';
		removeClassOnSelect('decolation-color');
	}

	// 文字色ボタンに色を付ける
	function setColor(color) {
		'use strict';
		console.log('set color:'+ color);
		$('#color_btn').removeClassByRegExp(/select-\S+/).addClass('select-'+ color);
	}

	// 文字装飾ボタン(bold,italic)のactiveをトグルする
	function toggleFont(font) {
		'use strict';
		const elem = document.getElementById('btn-'+ font);
		elem.classList.toggle('active');
	}

	// カーソルのある段落にtext-alignを適用する
	function setAlignCursorParagraph(align) {
		'use strict';
		$('#vertical_draft').children('.vertical-paragraph').has('.cursor-row').removeClassByRegExp(/decolation-textalign-\S+/).addClass('decolation-textalign-'+ align);
	}

	// [未使用]フォントサイズを変更する
	function setFontSize(size) {
		'use strict';
		const $chars = $('#vertical_draft').find('span.vertical-char');
		const $paras = $('#vertical_draft').find('div.vertical-paragraph');

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

	// テキストボックスに入力できるように
	document.getElementById('input_text_size').addEventListener('focus',function (e) {
		document.removeEventListener('keydown',keydownOnDoc);
	},false);
	document.getElementById('input_text_size').addEventListener('blur',function (e) {
		document.addEventListener('keydown',keydownOnDoc);
	},false);

	// paletteからフォントサイズが変更された
	addFontSizeEvnet(14);
	addFontSizeEvnet(30);
	addFontSizeEvnet(8);
	function addFontSizeEvnet(fontSize) {
		const eLink = document.getElementById('select-font-' + fontSize);
		eLink.addEventListener('click',function (e) {
			document.getElementById('input_text_size').value = fontSize;
			changeFontSizeOnSelect(fontSize);
		},false);
	};

	function changeFontSizeOnSelect(size) {
		'use strict';
		const eSelectChars = findSelectElem(false);

		for (let i = 0,eChar; eChar = eSelectChars[i]; i++) {
			eChar.dataset.fontSize = size;
		}
	}

	// ------------ copy and paste --------------------

	// 選択中のテキストをストレージに保存する
	function copySelectText() {
		localStorage.clipBoard = selectText();
	}

	// 選択している部分のテキストを返す
	// 複数あればすべて連結する
	function selectText() {
		'use strict';
		const selection = getSelection();
		let ret = '';
		for (let i = 0,cnt = selection.rangeCount,selRange; i < cnt; i++) {
			selRange = selection.getRangeAt(i);
			ret += selRange.toString();
		}
		return ret;
	}

	// ペースト
	function pasteFromCursor() {
		'use strict';
		insertStringFromCursor(localStorage.clipBoard);
	}

	// -----------------------   string getter ------------------------
	// 文章ゲッター(label:strgetter)

	// 文書内の行数
	function getRowLen() {
		'use strict';
		const $rows = $('#vertical_draft > .vertical-paragraph > .vertical-row');
		return $rows.length;
	}

	// 現在ページの行数
	function getRowLenOnCursorPage() {
		'use strict';
		let $row = $('.cursor-row');
		let cnt = getCurrentRowOnPage(); // 現在行を加える

		// 後ろに数える
		while ($row[0] && !($row.hasClass('page-last-row'))) {
			cnt++;
			$row = $row.nextObj('#vertical_draft .vertical-row');
		}
		return cnt;
	}

	// 文書内での現在行
	function getCurrentRowPos() {
		'use strict';
		const rowNum = $('.vertical-paragraph > .vertical-row').index($('.cursor').closest('.vertical-row')) +1;
		return rowNum;
	}

	// 現在ページ内で何行目にいるか
	function getCurrentRowOnPage() {
		'use strict';
		let $row = $('.cursor-row');
		let cnt = 1; // page-break行の分

		// 前にさかのぼって数える
		while ($row[0] && !($row.hasClass('page-break'))) {
			cnt++;
			$row = $row.prevObj('#vertical_draft .vertical-row');
		}
		return cnt;
	}

	// 現在文字位置
	function getCurrentStringPosOnRow() {
		'use strict';
		const $cursor = $('.cursor');
		const strNum = $('.cursor-row').children('.vertical-char').index($cursor);
		return strNum;
	}

	// カーソル行の全文字数
	function getStringLenOfCursorRow() {
		'use strict';
		const strLen = $('.cursor-row > .vertical-char').length;
		return strLen - 1; // EOLの分を除く
	}

	// 現在ページ
	function getCurrentPagePos() {
		'use strict';
		// page-breakを持つ行を探して段落をさかのぼり、その段落に複数のpage-breakがあればcursor行またはその段落の最後の行から行を遡ることでpage-breakを探している
		let $currentParagraph = $('.cursor-row').closest('.vertical-paragraph');
		let $currentPage;

		while (!($currentPage = $currentParagraph.children('.vertical-row.page-break'))[0]) {
			$currentParagraph = $currentParagraph.prev('.vertical-paragraph');
		}
		if ($currentPage.length > 1) {

			if (!($currentParagraph.children('.cursor-row'))[0]) {
				const $row = $('.cursor-row');
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

	// 文書内の全ページ数
	function getPageLen() {
		'use strict';
		return $('.page-break').length;
	}

	// 1ページの行数
	function getRowLenOnPage() {
		'use strict';
		return 40;
	}

	// 1行の文字数
	function getStringLenOfRow() {
		'use strict';
		return 40;
	}

	// 現在activeになっている文字装飾ボタンを配列にする
	function getConfDecoChar() {
		'use strict';
		const rtnArr = [];
		const color = document.getElementById('color_btn').className.match(/select-(\S+)/);

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

	// クリックした行のうち最も近い文字にカーソルが当たる
	function moveCursorToClickPos(e) {
		'use strict';
		if ($('#input_buffer').text() !== '') { return; }
		getCharOnRowClick($(this),e).addCursor();
		gCursor.repositionCharNum();
	}

	// カーソルのある文字が何文字目かを記憶する要素群を作成する
	// カーソルを左右に動かすときに利用する
	function setNOCLine() {
		'use strict';
		const $NOCLine = $('<div>').attr('id','NOC-line');

		for (let i = 0,len = getStringLenOfRow(),$numberOfChar; i < len; i++) {
			$numberOfChar = $('<span>').addClass('number-of-char');
			$NOCLine.append($numberOfChar);
		}
		$('#vertical_draft').before($NOCLine);
	}

	// クリック箇所にもっとも近い.vertical-charオブジェクトを返す
	function getCharOnRowClick($row,rowEo) {
		'use strict';
		// @param $row .vertical-rowクラスのオブジェクトｊ
		// @param rowEo クリックイベントのイベントオブジェクト
		const $chars = $row.children('.vertical-char');
		const clickPos = {
			x: rowEo.pageX,
			y: rowEo.pageY
		};

		let $self;
		let distance;
		let min = Number.MAX_VALUE;
		let $resultObj = $chars.first('.vertical-char');
		$chars.each(function () {
			$self = $(this);
			distance = $self.computeDistanceP2O(clickPos);
			if (distance < min) {
				min = distance;
				$resultObj = $self;
			}
		});

		return $resultObj;
	}

	// ２つの要素の中心点同士の距離を求める
	function computeDistanceBetweenObj($a,$b) {
		'use strict';
		const aCenterPos = computeCenterPoint($a);
		const bCenterPos = computeCenterPoint($b);
		return computeDistanceP2P(aCenterPos.x,aCenterPos.y,bCenterPos.x,bCenterPos.y);
	}

	// ある点とオブジェクトの中心点の距離を求める
	function computeDistanceP2O(po,$obj) {
		'use strict';
		// ex: po = {x:10,y:10}
		const objPos = computeCenterPoint($obj);
		return computeDistanceP2P(po.x,po.y,objPos.x,objPos.y);
	}

	// ２点間の距離を求める
	function computeDistanceP2P(x1,y1,x2,y2) {
		'use strict';
		// ２乗を使っているので、戻り値は必ず正の数になる
		// √{(b.x - a.x)^2+ (b.y - a.y)^2}
		return Math.sqrt(Math.pow(x2-x1,2)+Math.pow(y2-y1,2));
	}

	// オブジェクトの中心点の座標を求める
	function computeCenterPoint($obj) {
		'use strict';
		const objPos = getPosObj($obj);
		const objWidth = parseInt($obj.css('width'));
		const objHeight = parseInt($obj.css('height'));
		return {
			x: objPos.x + objWidth/2,
			y: objPos.y + objHeight/2
		}
	}

	// カーソル位置を返す
	function getCursorPos() {
		'use strict';
		return $('.cursor').getPosObj();
	}

	// window上の絶対座標
	function getPosObj($obj) {
		'use strict';
		const offset = $obj.offset();
		const x = offset.left;
		const y = offset.top;
		return {
			'x' : x,
			'y' : y
		}
	}

	const gCursor = {
		init: function () {
			'use strict';
			$('.vertical-char').first().addClass('cursor');
			$('#NOC-line > .number-of-char:first-of-type').addClass('cursor_char');
			this.addCursorRow();
			resetDisplayChar();
		},
		addCursorRow : function () {
			'use strict';
			const $oldCursorRow = $('.vertical-paragraph > .vertical-row.cursor-row');
			if ($oldCursorRow[0]) {
				$oldCursorRow.removeClass('cursor-row');
			}
			$('.cursor').closest('.vertical-row').addClass('cursor-row');
		},
		// カーソルを次の文字に移動する
		next : function() {
			'use strict';
			const $prev = $('.cursor');
			let $next = $prev.nextObj('#vertical_draft .vertical-char');
			if ($next.hasClass('EOL') && $next.closest('.vertical-row').next('.vertical-row')[0]) { $next = $next.nextObj('#vertical_draft .vertical-char'); } // 段落途中のEOLにはカーソルを止めない
			if (!($next[0])) {
				// 文章の最後に達していたら、何もしない
				return;
			}
			$next.addCursor(false);
			// markしたまま別の行に移り、そのまま上下キーを押してmarkを動かすこともあるので、markを１文字ずつ動かすのでは期待通りの動きをしてくれない
			this.repositionCharNum();
		},
		// カーソルを前の文字に移動する
		prev : function () {
			'use strict';
			const $prev = $('.cursor');
			let $next = $prev.prevObj('#vertical_draft .vertical-char');
			if ($next.hasClass('EOL') && $next.closest('.vertical-row').next('.vertical-row')[0]) { $next = $next.prevObj('#vertical_draft .vertical-char'); } // 段落途中のEOLにはカーソルを止めない
			if (!($next[0])) {
				return;
			}
			$next.addCursor(false);
			this.repositionCharNum();
		},
		// カーソルを前の行に移動する
		shiftRight: function () {
			'use strict';
			const $prev = $('.cursor');
			const NOCNum = $('#NOC-line').children('.number-of-char').index($('.cursor_char'));
			let $next = $('#vertical_draft .cursor-row').prevObj('#vertical_draft .vertical-row').children('.vertical-char').eq(NOCNum);

			if (!($next[0])) {
				// 右の行の文字数が現在文字より小さい
				$next = $('#vertical_draft div.cursor-row').prevObj('#vertical_draft .vertical-row').children('.vertical-char').last();
			}
			if (!($next[0])) { return; }

			if ($next.hasClass('EOL') && $next.closest('.vertical-row').next('.vertical-row')[0]) { $next = $next.prev('.vertical-char'); } // 段落途中のEOLにはカーソルを止めない
			$next.addCursor(false);
		},
		// カーソルを次の行に移動する
		shiftLeft: function () {
			'use strict';
			const $prev = $('.cursor');
			const NOCNum = $('#NOC-line').children('.number-of-char').index($('.cursor_char'));
			let $next = $prev.closest('div.vertical-row').nextObj('#vertical_draft .vertical-row').children('.vertical-char').eq(NOCNum);

			if (!($next[0])) {
				$next = $prev.closest('.vertical-row').nextObj('#vertical_draft .vertical-row').children('.vertical-char:last-of-type');
			}
			if (!($next[0])) { return; }

			if ($next.hasClass('EOL') && $next.closest('.vertical-row').next('.vertical-row')[0]) { $next = $next.prev('.vertical-char'); } // 段落途中のEOLにはカーソルを止めない
			$next.addCursor(false);
		},
		// charNumの位置を再調整
		repositionCharNum: function () {
			'use strict';
			const cursorPos = $('.cursor').closest('.vertical-row').children().index($('.cursor'));
			$('.cursor_char').removeClass('cursor_char');
			$('#NOC-line > .number-of-char').eq(cursorPos).addClass('cursor_char');
			// cursor-rowの 調整
			this.addCursorRow();
		},
		// 指定行にジャンプする。画面中央に指定行及びカーソルが来るように調整
		jumpForRow: function (rowNum) {
			'use strict';
			const $targetRow = $('.vertical-paragraph > .vertical-row').eq(rowNum-1);
			if (!$targetRow[0]) { return; }
			// cursor
			$targetRow.children('.vertical-char:first-of-type').addCursor(true);
			this.repositionCharNum();
		},
		// 指定ページにジャンプする。カーソルは１行目
		jumpForPage: function (pageNum) {
			'use strict';
			const $targetRow = $('.vertical-paragraph > .vertical-row').eq(firstDispNum);
			if (!$targetRow[0]) { return; }
			// cursor
			$targetRow.children('.vertical-char:first-of-type').addCursor(false);
			this.repositionCharNum();
			// display
			const firstDispNum = $('.vertical-paragraph > .vertical-row').index($('.page-break').eq(pageNum-1));
			addDisplayRow(firstDispNum,firstDispNum+getDisplayRowLen());
		}
	};

	// =====================================================================
	// 		表示操作(label:display)
	// =====================================================================

	// ----------------------------- display row --------------------------

	function reDisplay() {
		'use strict';
		console.log('reDisplay');
		const firstDispNum = $('.vertical-paragraph > .vertical-row').index($('.display-row').first());
		addDisplayRow(firstDispNum,firstDispNum+getDisplayRowLen()); // 途中行数変化
	}

	// カーソルが移動した時の、表示領域の調整
	function changeDisplayRow(opt_bl) {
		'use strict';
		// opt_bl: trueならカーソルを画面中央に配置する
		console.time('changeDisplayRow()');
		const $cursor = $('#vertical_draft .cursor');
		const $cursorRow = $cursor.closest('.vertical-row');


		if ($cursorRow.hasClass('display-row')) {
			console.log('cursorRow has dispaly-row');
			return;
		}

		$cursorRow.addClass('display-row');
		if ($('.display-row').length <= getDisplayRowLen()) return;
		const $nextRow = $cursorRow.nextObj('#vertical_draft .vertical-row');
		const $prevRow = $cursorRow.prevObj('#vertical_draft .vertical-row');
		let first;
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
			const $rows = $('#vertical_draft .vertical-row');
			const cursorRowPos = $rows.index($('.cursor-row'));
			first = cursorRowPos - getDisplayRowLen()/2;
			first = first>=0 ? first : 0;
			addDisplayRow(first, (first + getDisplayRowLen()));

		} else {
			// カーソルが二行以上はみ出した
			const currentFirst = $('.vertical-row').index($('.display-row').first());
			const cursorIndex = $('.vertical-row').index($cursorRow);
			const currentEnd = $('.vertical-row').index($('.display-row').last());
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
			}

			addDisplayRow(first,(first + getDisplayRowLen()));
		}

		console.timeEnd('changeDisplayRow()');
	}

	// first行目からlast行目まで表示させる
	function addDisplayRow(first,last) {
		'use strict';
		console.log('addDisplayRow('+ first + ','+ last +')');
				const eOldDisplayRows = document.getElementsByClassName('display-row');

				while (eOldDisplayRows.length > 0) {
					eOldDisplayRows.item(0).classList.remove('display-row');
				}

				const eRows = document.getElementById('vertical_draft').getElementsByClassName('vertical-row');
				const rowLen = eRows.length;
				if (last>rowLen) {
					last = rowLen;
					first = last - getDisplayRowLen();
					if (first < 0) first = 0;
				}

				for (let i = first,eRow; i < last; i++) {
					eRow = eRows[i];
					eRow.classList.add('display-row');
				}
				console.timeEnd('addDisplayRow()');
				}

	// ----------------------------------------- display char ------------------------------------

	// カーソルが表示文字外にはみ出た時、表示位置を再計算して表示する
	function changeDisplayChar() {
		'use strict';
		console.time('changeDisplayChar()');
		const eCursor = document.getElementById('vertical_draft').getElementsByClassName('cursor')[0];
		if (eCursor.classList.contains('display-char')) {
			console.log('cursor has display-char');
			return;
		}
		if (eCursor.classList.contains('EOL') && eCursor.previousElementSibling) { eCursor = eCursor.previousElementSibling; }

		const eCursorRow = eCursor.parentNode;
		const eChars = eCursorRow.children;
		const eDispChars = eCursorRow.querySelectorAll('.display-char');
		const currentFirst = index(eDispChars[0],eChars);
		const cursorIndex = index(eCursor,eChars);
		const currentEnd = index(eDispChars[eDispChars.length-2] ? eDispChars[eDispChars.length-2] : eDispChars[eDispChars.length-1],eChars); // EOLは常にdisplay-charなので、EOL以外のcharがある行ではEOLの前のcharを最後のdisplay-charとしてindexを見る
		let first;

		if (cursorIndex < currentFirst) {
			// カーソルが前にある
			first = cursorIndex;
			console.log('cursor is forward');
		} else if (currentEnd > 0 && cursorIndex > currentEnd) {
			// カーソルが後ろにある
			first = currentFirst + (cursorIndex - currentEnd);
			console.log('cursor is backward');
		} else {
			// display-charに囲まれた部分にdisplay-charでない文字があり、かつその文字にカーソルがあたっている
			// あるいはdisplay-charが一つもない(currentFirst == -1 && currentEnd == -1)
			resetDisplayChar();
			changeDisplayChar();
			console.log('cursor is etc');
			return;
		}

		addDisplayChar(first);
		console.timeEnd('changeDisplayChar()');
	}

	// ノードリストelementsのうち、targetのインデックスを返す
	function index(target,elements) {
		'use strict';
		for (let i = 0,elem; elem = elements[i];i++) {
			if (elem == target)
				return i;
		}

		return -1;
	}

	function resetDisplayChar() {
		'use strict';
		console.time('resetDisplayChar()');
		addDisplayChar(0);
		console.log('resetDisplayChar');
		console.timeEnd('resetDisplayChar()');
	}

	function dispCharAll() {
		'use strict';
		const eChars = document.getElementsByClassName('vertical-char');

		for (let i = 0,eChar; eChar = eChars[i]; i++) {
			if (!eChar.classList.contains('display-char')) { eChar.classList.add('display-char'); }
		}
	}
	// 画面に表示されているrowのfirst文字以降にdisplay-charを付与して表示する
	function addDisplayChar(first) {
		'use strict';
		const eDisplayRows = document.querySelectorAll('#vertical_draft .display-row');
		let addArr = [];
		let removeArr = [];

		// dispCharAll();
		let result;
		for (let i = 0,eDispRow; eDispRow = eDisplayRows[i];i++) {
			result = dispCharOfRow(first,eDispRow);
			addArr = addArr.concat(result.add);
			removeArr = removeArr.concat(result.remove);
		}
		for (let i = 0,len = addArr.length;i < len;i++) {
			addArr[i].classList.add('display-char');
		}
		for (let i = 0,len = removeArr.length;i < len;i++) {
			removeArr[i].classList.remove('display-char');
		}
	}

	// [未使用]
	function replaceDispChar(first,dispRows) {
		'use strict';
		const range = document.createRange();
		const fragment = range.cloneContents();
		const frRows = fragment.querySelectorAll('.vertical-row');

		range.setStartBefore(dispRows[0].parentNode);
		range.setEndAfter(dispRows[dispRows.length-1].parentNode);

		for (let i=0,cnt=frRows.length;i<cnt;i++) {
			dispCharOfRow(first,dispRows[i],frRows[i]);
		}

		range.deleteContents();
		range.insertNode(fragment);
	}

	// $('#vertical_draft').on('click','.vertical-char',function (e) {
	// 	var eSelf = this;
	// 	var $self = $(this);
	// 	var fontHeight;
	// 	console.log('data:'+ this.dataset.a);
	// 	console.log('clientHeight:'+ this.clientHeight);
	// 	console.time('offsetHeight');
	// 	fontHeight = this.offsetHeight;
	// 	console.timeEnd('offsetHeight');
	// 	console.time('getComputedStyle');
	// 	fontHeight = (this.currentStyle || document.defaultView.getComputedStyle(this,null));
	// 	console.timeEnd('getComputedStyle');
	// 	console.time('dataset');
	// 	fontHeight = (parseInt(this.dataset.fontSize) || 16) + 2;
	// 	console.timeEnd('dataset');
	// 	console.time('dispCharOfRow');
	// 	dispCharOfRow(1,this.parentNode);
	// 	console.timeEnd('dispCharOfRow');
	// fontHeight = parseInt((eChar.currentStyle || defaultView.getComputedStyle(eChar,null)).height);
	// fontHeight = eChar.offsetHeight;
	// fontHeight = eChar.clientHeight;
	// fontHeight = eChar.offsetWidth;
	// fontHeight = parseInt((eChar.currentStyle || document.defaultView.getComputedStyle(eChar,null)).width) + parseInt((eChar.currentStyle || document.defaultView.getComputedStyle(eChar,null)).marginLeft);
	// });
	// rowのfirst文字目以降の各文字をrowの高さに収まるだけdisplaycharクラスを付与するとして、row内のcharすべてについてクラスを付与する要素と除去する要素の配列をオブジェクトで返す
	function dispCharOfRow(first,row) {
		'use strict';
		// この関数内でクラスを直接いじってしまうと、複数行に対して実行した場合にその都度描画計算が起こってしまい時間がかかるため、いったんインデックスのみを調査して関数外で一気にクラスの変更を行う形にしている
		console.time('dispCharOfRow()');


		// var defaultView = document.defaultView;

		const eRow = row.nodeName && row.nodeType===1 ? row : row[0];
		const eChars = eRow.childNodes;
		// first文字以前の文字でdisplay-charを持つ文字があれば除去リストに加える
		for (let i = 0,eChar; i < first; i++) {
			eChar = eChars[i];
			if (!eChar) { break; } // 行内文字数がfirst文字ない場合はEOL以外のdisplay-charをすべて外して終わり
			if (eChar.classList.contains('display-char') && !eChar.classList.contains('EOL')) {
				removeArr.push(eChar);
			}
		}

		// first文字以降の文字でrowの高さに収まる文字のうち、display-charを持たない文字を追加リストに加える
		// また、rowに収まらない文字でdisplay-charを持つ文字があれば除去リストに加える
		// EOLは常にdisplay-charを持つようにする(そうしなければ、空行で一つもdisplay-charがない状態となり表示要素が一切なくなってしまうので、heightがautoであるrowは潰れた状態になってしまう)
		const addArr = [];
		const removeArr = [];
		const dispHeight = parseInt((eRow.currentStyle || document.defaultView.getComputedStyle(eRow,null)).width);
		let fontHeight = 0;
		let htcnt = 0;
		for (let i = first,eChar; eChar = eChars[i]; i++) {
			// fontHeight = parseInt((eChar.currentStyle || defaultView.getComputedStyle(eChar,null)).height);
			// fontHeight = eChar.offsetHeight;
			// fontHeight = eChar.clientHeight;
			fontHeight = (parseInt(eChar.dataset.fontSize) || 16) + 2;
			// fontHeight = eChar.offsetWidth;
			// fontHeight = parseInt((eChar.currentStyle || document.defaultView.getComputedStyle(eChar,null)).width) + parseInt((eChar.currentStyle || document.defaultView.getComputedStyle(eChar,null)).marginLeft);
			htcnt += fontHeight;
			console.log('fontHeight:'+fontHeight);
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

		console.log('dispRow.add:'+ addArr.length);
		// console.log('dispRow.remove:'+ removeArr.length);
		console.timeEnd('dispCharOfRow()');

		return {
			add: addArr,
			remove: removeArr
		};
	}

	// [未使用]
	function resetDispNum() {
		'use strict';
		let k=0;
		$('.display-row').each(function() {
			this.dataset.dispnum = k++;
		});
	}

	// 表示する行数
	function getDisplayRowLen() {
		'use strict';
		const dispWidth = parseInt($('#vertical_draft').css('height'));
		const rowBorderWidth = 2;
		let rowWidth = parseInt($('.vertical-paragraph > .vertical-row').css('height'));
		if (dispWidth <= 0) { return 0; }
		rowWidth += rowBorderWidth;
		const dispLen = dispWidth / rowWidth;
		return dispLen -1; // 一行だけ余裕をもたせる
	}

	// ----------------------------------------- element position ---------------------------------------

	// inputBufferの位置を調整する
	function moveInput() {
		'use strict';
		const cursorPosObj = getCursorPos();
		const x = cursorPosObj.x;
		const y = cursorPosObj.y;
		const $inputBuffer = $('#input_buffer');

		$inputBuffer.css('top',y).css('left',x);
		resizeInputBuffer();
	}

	// inputBufferの高さ調整
	function resizeInputBuffer() {
		'use strict';
		const $inputBuffer = $('#input_buffer');
		const $character = $inputBuffer.children('.vertical-char').first();
		// borderは上下合わせて２つある
		const height = $character.outerHeight() * ($inputBuffer.children('.vertical-char').length-1) + 5;

		$inputBuffer.css('height',height);
	}

	// convertviewの位置を調整
	function repositionConvertView() {
		'use strict';
		const eConvertContainer = document.getElementById('convert_container');
		const cursorPosObj = getCursorPos();
		const x = cursorPosObj.x;
		const y = cursorPosObj.y;
		eConvertContainer.style.top = y + 'px';
		eConvertContainer.style.left = (x - parseInt((eConvertContainer.currentStyle || document.defaultView.getComputedStyle(eConvertContainer,null)).width)) + 'px';
	}

	// -------------------------------------- page infomation --------------------------------------------

	// 改ページクラスの付与
	function addPageBreak() {
		'use strict';

		// reset
		$('#vertical_draft > .vertical-paragraph > .vertical-row.page-break').removeClass('page-break');
		$('#vertical_draft > .vertical-paragraph > .vertical-row.page-last-row').removeClass('page-last-row');

		const pageNum = getRowLenOnPage();
		const $rows = $('#vertical_draft > .vertical-paragraph > .vertical-row');
		let $row;
		for (let i = 1; ($row = $rows.eq(pageNum*i-1))[0]; i++) {
			$row.addClass('page-last-row');
		}
		$rows.last().addClass('page-last-row');
		for (let i = 0; ($row = $rows.eq(pageNum*i))[0]; i++) {
			$row.addClass('page-break');
		}
	}

	// [未使用]
	function getRowPadding(rowLen) {
		'use strict';
		const dispWidth = parseInt($('#vertical_draft').css('width'))-50; // 負の数になることも考慮すること
		const rowWidth = parseInt($('.vertical-paragraph > .vertical-row').css('width'));
		const padding = (dispWidth/rowLen - rowWidth)/2;

		return padding;
	}

	// =====================================================================
	// 	選択操作(label:select)
	// =====================================================================

	// 選択範囲のvertical-charを配列に入れて返す
	// bl: 実行後選択を解除するならtrue
	function findSelect$obj(bl) {
		'use strict';
		const retObjArray = [];
		const selection = getSelection();

		if (selection.rangeCount === 1) {
			// 選択範囲が一箇所の場合
			const selRange = selection.getRangeAt(0); // 選択範囲のRange

			const $chars = $('#vertical_draft .display-row .vertical-char').not('.EOL');
			const charRange = document.createRange();
			for (let i = 0,len = $chars.length; i < len; i++) {
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

	// 選択範囲のvertical-charを配列に入れて返す
	// bl: 実行後選択を解除するならtrue
	function findSelectElem(bl) {
		'use strict';
		const retObjArray = [];
		const selection = getSelection();

		if (selection.rangeCount === 1) {
			// 選択範囲が一箇所の場合
			const selRange = selection.getRangeAt(0); // 選択範囲のRange

			// 選択範囲内にあるcharacterを配列に入れる
			const eChars = document.querySelectorAll('#vertical_draft .display-row .vertical-char');
			const charRange = document.createRange();
			for (let i = 0,len=eChars.length,eChar; i < len; i++) {
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
			charRange.detach();
		}

		if (bl) selection.removeAllRanges(); // 選択を解除する

		return retObjArray;
	}

	// 選択中の文字に装飾用クラスを付与する
	// 同じ種類のクラスをすでに持っていた場合は除去する
	function addDecolationClassOnSelect(strClass) {
		'use strict';
		const eSelChars = findSelectElem(true);
		const kind = (strClass.match(/(decolation-.+)-.+/))[1];
		const regexp = new RegExp(kind +'-\\S+');
		let rmClass;

		for (let i = 0,len = eSelChars.length; i < len; i++) {
			rmClass = (eSelChars[i].className.match(regexp));
			eSelChars[i].classList.add(strClass);
			if (rmClass) { eSelChars[i].classList.remove(rmClass[0]); }
		}

	}

	// [未使用]
	function toggleClassOnSelect(strClass) {
		'use strict';
		const $objArray = findSelect$obj(true);
		for (let i = 0,cnt = $objArray.length; i < cnt; i++) {
			$objArray[i].toggleClass(strClass);
		}
	}

	function removeClassOnSelect(kind) {
		'use strict';
		const eSelChars = findSelectElem(true);
		const regexp = new RegExp(kind +'-\\S+');
		let rmClass;

		for (let i = 0,len = eSelChars.length; i < len; i++) {
			rmClass = eSelChars[i].className.match(regexp);
			if (rmClass) { eSelChars[i].classList.remove(rmClass[0]); }
		}
	}

	// カーソル移動前に、selectionにカーソル位置を覚えさせる
	function readySelection() {
		const eCursor = document.querySelector('.cursor');
		const selection = getSelection();

		if (selection.rangeCount === 0) {
			selection.selectAllChildren(eCursor);
		}
	}

	// 選択範囲を動かす(カーソル移動時)
	function extendSelection(bShift) {
		const eCursor = document.querySelector('.cursor');
		const selection = getSelection();

		if (bShift) {
			// シフトキーが押されていれば、カーソルのオフセット０までselectionを拡張
			selection.extend(eCursor,0);
		} else {
			// シフトキー無しでカーソルが動いたならselectionを解除する
			selection.removeAllRanges();
		}
	}

	// =====================================================================
	// 		ファイル操作(label:file)
	// =====================================================================

	function comReadFile(fileID) {
		'use strict';
		$('#vertical_draft > .vertical-paragraph').remove();

		$.ajax({
			type : 'POST',
			url : '/tategaki/ReadFile',
			data : {
				user_id: getUserID(),
				file_id: fileID
			},
			context : {
				id : fileID
			},
			dataType : 'json',
			success : function (data) {
				// 表示データを受け取ってからの処理
				// ファイル名を表示
				$('#file_title').val(data.filename).attr('data-file-id',this.id);
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
				alert('Error:'+ textStatus + ':\n' + errorThrown + ':status=' + XMLHttpRequest.status + 'in comReadFile');
			}
		});

	}

	function comReadJsonFile(fileID) {
		'use strict';
		console.log('comReadJsonFile("'+ fileID +'")');
		console.time('comReadJsonFile()');
		const userID = getUserID();
		userAlert('読込中');
		console.log('comReadJsonFile userID:"'+ userID);
		$('#vertical_draft').empty();
		console.time('ReadJsonFile communication');

		$.ajax({
			type : 'POST',
			url : '/tategaki/ReadJsonFile',
			data : {
				user_id: userID,
				file_id: fileID
			},
			context : {
				id : fileID
			},
			dataType : 'json',
			success : function (data) {
				console.timeEnd('ReadJsonFile communication');
				// 表示データを受け取ってからの処理
				// ファイル名を表示
				$('#file_title').val(data.filename).attr('data-file-id',this.id);
				// 文章のhtml書き出し
				const text = data.data.text;
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
				userAlert('読み込み完了');
			},
			error : function (XMLHttpRequest, textStatus, errorThrown) {
				alert('Error:'+ textStatus + ':\n' + errorThrown + ':status=' + XMLHttpRequest.status + 'in comReadJsonFile');
			}
		});
	}

	function comSaveFile() {
		'use strict';
		const userID = getUserID();
		const $fileTitle = $('#file_title');
		const filename = $fileTitle.val();

		if (filename.length === 0) {
			userAlert('ファイル名を入力してください');
			return;
		}
		if (filename.indexOf('"') > -1 || filename.indexOf('<')>-1 || filename.indexOf('>')>-1) {
			userAlert('ファイル名に使用不可能文字が含まれています。');
			return;
		}

		const fileID = $fileTitle.attr('data-file-id');

		if (fileID === '-1') {
			comSaveAs(filename);
			return;
		}

		// 段落ごとに配列に格納
		const $paragraphs = $('#vertical_draft > .vertical-paragraph');
		const contentsArray = [];
		for (let i = 0,len = $paragraphs.length; i < len; i++) {
			contentsArray.push(getStringFromParagraph($paragraphs.eq(i)));
		}
		const contentsJson = JSON.stringify(contentsArray);
		const nowDate_ms = Date.now() + '';

		$.ajax({
			type : 'POST',
			url : '/tategaki/WriteFile',
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
			dataType : 'json',
			success : function (data) {
				// 表示データを受け取ってからの処理
				console.log(data.result);
				$('.saved').text(data.strDate);
				comFileList(this.userID);
				console.log('保存しました:fileID=' + this.fileID);
			},
			error : function (XMLHttpRequest, textStatus, errorThrown) {
				alert('Error:'+ textStatus + ':\n' + errorThrown + ':status=' + XMLHttpRequest.status + 'in comSaveFile');
			}
		});
	}

	function comSaveJsonFile() {
		'use strict';
		const userID = getUserID();
		const $fileTitle = $('#file_title');
		const filename = $fileTitle.val();

		if (filename.length === 0) {
			userAlert('ファイル名を入力してください');
			return;
		}
		if (filename.indexOf('"') > -1 || filename.indexOf('<')>-1 || filename.indexOf('>')>-1) {
			userAlert('ファイル名に使用不可能文字が含まれています。');
			return;
		}

		userAlert('保存しています');

		const fileID = $fileTitle.attr('data-file-id');
		if (fileID === '-1') {
			comSaveAs(filename);
			return;
		}
		const contentsJson = makeJsonDataForSave();
		// console.log(contentsJson);
		const nowDate_ms = Date.now() + '';

		console.log('user_id:'+ userID);
		console.log('file_id:'+ fileID);
		console.log('filename:'+ filename);
		console.log('json:'+ contentsJson);
		console.log('saved:'+ nowDate_ms);

		$.ajax({
			type : 'POST',
			url : '/tategaki/WriteJsonFile',
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
			dataType : 'json',
			success : function (data) {
				// 表示データを受け取ってからの処理
				console.log(data.result);
				$('.saved').text(data.strDate);
				comFileList(this.userID);
				console.log('保存しました:fileID=' + this.fileID);
				userAlert('保存しました');
			},
			error : function (XMLHttpRequest, textStatus, errorThrown) {
				alert('Error:'+ textStatus + ':\n' + errorThrown + ':status=' + XMLHttpRequest.status + 'in comSaveJsonFile');
			}
		});
	}

	function comFileList(userID) {
		'use strict';

		$.ajax({
			type : 'POST',
			url : '/tategaki/GetFileList',
			data : {
				user_id: userID
			},
			dataType : 'json',
			success : function (data) {
				// 表示データを受け取ってからの処理
				setFileListFromObject(data);
			},
			error : function (XMLHttpRequest, textStatus, errorThrown) {
				alert('Error:'+ textStatus + ':\n' + errorThrown + ':status=' + XMLHttpRequest.status + ' in comFileList');
			}
		});
	}

	function setFileListFromObject(data,opt_$parentUl) {
		'use strict';
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

		const $parentUl = opt_$parentUl || $('#file_list');
		$parentUl.empty();

		let filename = '';
		let $file;
		for (let fileID in data) {
			filename = data[fileID]; // filenameは、対象fileIDのファイル名か、ディレクトリならば再帰的にオブジェクトが入っている

			if (typeof filename === 'string' && fileID !==  'directoryname') {
				// file
				$file = $('<a>').addClass('file').attr('href','#').attr('data-type','file').attr('data-file-id',fileID).attr('data-file-name',filename).text(filename);
				$parentUl.append($('<li>').append($file));
			} else if (typeof filename === 'object') {
				// dir
				createDirCollapseFromObject(/* innerData = */filename, /* dirID = */fileID, $parentUl);
			}

		}
	}

	function createDirCollapseFromObject(data,dirID,$parentUl) {
		'use strict';
		// setFileListと交互再帰的にリストを作成し、コラプスで開けるようにする
		/*
		 *
		 * <li>
		 * 	<a class="directory" data-toggle="collapse" href="#directory1" data-type="directory" data-directory-id="1" data-directory-name="filename.directoryname">
		 *		<span class="glyphicon glyphicon-folder-close" aria-hidden="true"></span>
		 *		filename.directoryname
		 *		</a>
		 *
		 *		<div class="collapse" id="directory1">
		 *			<div class="well">
		 *				<ul>
		 *					<li>filename</li>
		 *					<li>filename</li>
		 *					<li>filename</li>
		 *				</ul>
		 *			</div>
		 *		</div>
		 *	</li>
		 */
		const $dirLink = $('<a>')
			.addClass('directory')
			.attr('data-toggle','collapse')
			.attr('href','#directory'+dirID)
			.attr('data-type','directory')
			.attr('data-directory-id',dirID)
			.attr('data-directory-name',data.directoryname)
			.html('<span class="glyphicon glyphicon-folder-close" aria-hidden="true"></span>'+data.directoryname); // ☓ボタン
		$parentUl.append($('<li>').append($dirLink));

		const $collapse = $('<div>').addClass('collapse').attr('id','directory'+dirID);
		const $innerUl = $('<ul>');
		const $well = $('<div>').addClass('well');
		setFileListFromObject(data,$innerUl); // 交互再帰 内部の各ファイルを設置

		$collapse.append($well);
		$well.append($innerUl);

		$dirLink.after($collapse);
	}

	// ファイルを開くモーダルにある検索ボックスのkeyupイベント
	function keyupInSearchFileInput(e) {
		'use strict';
		const keycode = getKeyCode(e);
		const $searchFile = $('#search_file');
		const searchWord = $searchFile.val();

		if (keycode == 13) {
			// enter

			const $file = getFileObjectFromFileName(searchWord);
			if ($file[0] && $file.length === 1) {
				comReadJsonFile($file.attr('data-file-id'));
			}
			$('#file_list_modal').modal('hide');
			document.addEventListener('keydown',keydownOnDoc,false);
			comFileList(getUserID());

		} else if (searchWord.length === 0) {
			comFileList(getUserID());
		} else {
			comSearchFile(searchWord);
		}

	}

	// searchWordをファイル名に含むファイルのみをmodalに表示する
	function comSearchFile(searchWord) {
		'use strict';
		const userID = getUserID();

		$.ajax({
			type : 'POST',
			url : '/tategaki/GetFileList',
			data : {
				user_id: userID
			},
			context: {
				userID: userID,
				search_word : searchWord
			},
			dataType : 'json',
			success : function (data) {
				// 表示データを受け取ってからの処理
				setFileListFromObject(data); // filterFileNameMatchは現在のファイルリストから探すため、先に全ファイルをリストに入れておく必要がある
				const $matchFilesArray = filterFileNameMatch(this.search_word);
				setFileListFromArray($matchFilesArray);
			},
			error : function (XMLHttpRequest, textStatus, errorThrown) {
				alert('Error:'+ textStatus + ':\n' + errorThrown + ':status=' + XMLHttpRequest.status + ' in comSearchFile');
			}
		});
	}

	function setFileListFromArray($array) {
		'use strict';
		const $fileList = $('#file_list');
		const matchObjLength = $array.length;

		$fileList.empty();

		if (matchObjLength > 0) {

			let $obj;
			let $file;
			let fileID;
			let filename;
			for (let i = 0; i < matchObjLength; i++) {
				$obj = $array[i];
				fileID = $obj.attr('data-file-id');
				filename = $obj.attr('data-file-name');
				$file = $('<a>').addClass('file').attr('href','#').attr('data-file-id',fileID).attr('data-file-name',filename).text(filename);
				$fileList.append($('<li>').append($file));
			}

		} else {
			$fileList.append($('<li>').text('該当するファイルは見つかりませんでした。'));
		}

	}

	// 開くボタンを押した時
	function readyFileModal() {
		'use strict';
		comFileList(getUserID());
		$('#search_file').val('').focus();
	}

	// ファイル検索
	function filterFileNameMatch(str) {
		'use strict';
		const regexp = new RegExp('.*'+ str +'.*');
		const $array = []; // マッチしたjqueryオブジェクトを入れる配列
		let $self;
		let filename;

		$('.file').each(function () {
			$self = $(this);
			filename = $self.attr('data-file-name');
			if (regexp.test(filename)) {
				$array.push($self);
			}
		});

		return $array;
	}

	function defaultNewFile() {
		'use strict';
		newFile('newfile');
	}

	function newFile(filename) {
		'use strict';
		$('#vertical_draft').empty();

		appendParagraph('');
		$('.vertical-row').addClass('display-row').children('.vertical-char').first().addClass('cursor');
		$('#file_title').val(filename).attr('data-file-id','-1');
		addPageBreak();
		gCursor.addCursorRow();
		printDocInfo();
	}

	// 名前をつけて保存
	function comSaveAs(filename) {
		'use strict';

		if (filename.indexOf('"') > -1 || filename.indexOf('<')>-1 || filename.indexOf('>')>-1) {
			userAlert('ファイル名に使用不可能文字が含まれています。');
			return;
		}

		userAlert('保存しています');

		const userID = getUserID();
		const nowDate_ms = Date.now() + '';
		$.ajax({
			type : 'POST',
			url : '/tategaki/CreateFile',
			data : {
				filename: filename,
				user_id: userID,
				saved: nowDate_ms
			},
			context : {
				userID: userID
			},
			dataType : 'json',
			success : function (data) {
				// 表示データを受け取ってからの処理
				$('#file_title').val(data.filename).attr('data-file-id',data.newFileID);
				comSaveJsonFile();
			},
			error : function (XMLHttpRequest, textStatus, errorThrown) {
				alert('Error:'+ textStatus + ':\n' + errorThrown + ':status=' + XMLHttpRequest.status + 'in comSaveAs');
			}
		});
	}

	function defaultDeleteFile() {
		'use strict';
		const fileID = $('#file_title').attr('data-file-id');
		if (fileID === '-1') {
			userAlert('保存していないファイルです。');
			return;
		}
		comDeleteFile(fileID);
	}

	function comDeleteFile(fileID) {
		'use strict';
		const userID = getUserID();
		if (window.confirm('本当に削除しますか:'+ getFileNameFromFileID(fileID) + '('+ fileID +')')) {

			$.ajax({
				type : 'POST',
				url : '/tategaki/DeleteFile',
				data : {
					user_id: userID,
					file_id : fileID
				},
				context : {
					fileID : fileID
				},
				dataType : 'json',
				success : function (data) {
					const successRecord = data.successRecord; // 処理行数の文字列
					const result = data.result; // true or false の文字列
					if (successRecord === '1' && result) {
						// 別ファイルに移動
						const $files = $('#file_list .file');
						for (let i = 0; i < $files.length; i++) {
							if ($files.eq(i).attr('data-file-id') !== this.fileID) {
								comReadJsonFile($files.eq(i).attr('data-file-id'));
								break;
							}
						}
						comFileList(getUserID());
					}else{
						alert('ファイル削除エラーです(ファイル番号：'+ this.fileID + ')');
								}

								},
								error : function (XMLHttpRequest,textStatus,errorThrown) {
									alert('Error:' + textStatus + ':\n' + errorThrown + ':status=' + XMLHttpRequest.status + 'in comDeleteFile ');
								}
								});

		}

	}

	function printDocInfo() {
		'use strict';
		console.log('printDocInfo()');
		$('.doc-info > .str-num').text(getCurrentStringPosOnRow());
		$('.doc-info > .str-len').text(getStringLenOfCursorRow());
		$('.doc-info > .row-num').text(getCurrentRowOnPage());
		$('.doc-info > .row-len').text(getRowLenOnCursorPage());
		$('.doc-info > .page-num').text(getCurrentPagePos());
		$('.doc-info > .page-len').text(getPageLen());
	}

	function setFileTitle(filename) {
		'use strict';
		$('#file_title').val(filename);
	}

	function comOpenNextFile() {
		'use strict';
		console.log('comOpenNextFile()');
		const $currentFileLi = $('#file_list > li').has('.file[data-file-id="'+ $('#file_title').attr('data-file-id') +'"]');

		let $nextFile;
		if ($currentFileLi[0]) {
			$nextFile = $currentFileLi.nextAll('li').first().children('.file');
		} else {
			$nextFile = $('#file_list .file').first();
		}

		if ($nextFile[0]) comReadJsonFile($nextFile.attr('data-file-id'));
	}

	function comOpenPrevFile() {
		'use strict';
		console.log('comOpenPrevFile()');
		const $currentFileLi = $('#file_list > li').has('.file[data-file-id="'+ $('#file_title').attr('data-file-id') +'"]');
		const $nextFile = $currentFileLi.prevAll('li').first().children('.file');
		if ($nextFile[0]) comReadJsonFile($nextFile.attr('data-file-id'));
	}

	function comOpenFile(filename) {
		'use strict';
		console.log('comOpenFile('+ filename +')');
				const $file = getFileObjectFromFileName(filename);

				if (!$file[0]) { return; }

				comReadJsonFile($file.attr('data-file-id'));

				}

				function getFileObjectFromFileName(filename) {
					'use strict';
					// 同一名ファイルが複数存在する可能性を忘れずに
					const $file = $('#file_list .file[data-file-name="'+ filename +'"]');
					return $file;
				}

				function getFileNameFromFileID(fileID) {
					'use strict';
					return $('#file_list .file[data-file-id="'+ fileID +'"]').attr('data-file-name');
				}

				function comDeleteFileFromFileName(filename) {
					'use strict';
					console.log('comDeleteFileFromFileName()');
					const $file = getFileObjectFromFileName(filename);
					if (!$file[0]) { return; }

					let fileID;
					if ($file.size() === 1) {
						fileID = $file.attr('data-file-id');
						comDeleteFile(fileID);
					} else if ($file.size() > 1) {
						// 該当ファイルが複数

						if (window.confirm('同一名のファイルが複数存在します。\nすべてのファイルを削除しますか。\nこのうちのどれかのファイルを削除する場合はキャンセルし、個別に削除してください。')) {
							$file.each(function () {
								fileID = $(this).attr('data-file-id');
								comDeleteFile(fileID);
							});

						} else {
							console.log('[複数ファイル]削除できませんでした。:' + filename);
						}

					}
				}

				function comMoveFile($file,$newParentDir) {
					'use strict';
					let fileID;
					let newParentDirID;

					if ($file[0] && $newParentDir[0]) {
						fileID = $file.attr('data-type')==='file' ? $file.attr('data-file-id') : $file.attr('data-directory-id');
						newParentDirID = $newParentDir.attr('data-directory-id');
						comMvFileToDirectory(fileID,newParentDirID);
					}
				}

				function comMvFileToDirectory(fileID,newParentDirID) {
					'use strict';
					// ディレクトリをディレクトリに入れるのも可
					console.log('comMvFileToDirectory:file['+ fileID +'],newParentDir['+ newParentDirID +']');
					const userID = getUserID();

					$.ajax({
						type : 'POST',
						url : '/tategaki/MoveFile',
						data : {
							user_id: userID,
							file_id: fileID,
							directory_id: newParentDirID
						},
						dataType : 'json',
						context: {
							userID: userID
						},
						success : function (json) {
							// 表示データを受け取ってからの処理
							comFileList(this.userID);
						},
						error : function (XMLHttpRequest, textStatus, errorThrown) {
							alert('Error:'+ textStatus + ':\n' + errorThrown + ':status=' + XMLHttpRequest.status + 'in comMvFileToDirectory');
						}
					});
				}

				function comMakeDirectory(directoryname) {
					'use strict';
					console.log('make directory:'+ directoryname);
					const userID = getUserID();
					const nowDate_ms = Date.now() + '';

					$.ajax({
						type : 'POST',
						url : '/tategaki/MakeDirectory',
						data : {
							user_id: userID,
							directoryname: directoryname,
							saved: nowDate_ms
						},
						dataType : 'json',
						context: {
							userID: userID
						},
						success : function (json) {
							// 表示データを受け取ってからの処理
							comFileList(this.userID);
						},
						error : function (XMLHttpRequest, textStatus, errorThrown) {
							alert('Error:'+ textStatus + ':\n' + errorThrown + ':status=' + XMLHttpRequest.status + 'in comMakeDirectory');
						}
					});
				}

				function comDeleteDirectory(directoryID,option) {
					'use strict';
					// ディレクトリ内にファイルがあるとき、強制的に中のファイルごと削除するときのみoptionはtrue
					const userID = getUserID();

					$.ajax({
						type : 'POST',
						url : '/tategaki/DeleteDirectory',
						data : {
							directory_id: directoryID,
							option: option
						},
						dataType : 'json',
						context: {
							userID: userID
						},
						success : function (json) {
							// 表示データを受け取ってからの処理
							comFileList(this.userID);
							if (json.result === 'within') {
								userAlert('ディレクトリが空ではないので削除できませんでした。');
							}
						},
						error : function (XMLHttpRequest, textStatus, errorThrown) {
							alert('Error:'+ textStatus + ':\n' + errorThrown + ':status=' + XMLHttpRequest.status + 'in comMakeDirectory');
						}
					});
				}

				function comDeleteDirectoryFromName(directoryname,option) {
					'use strict';
					const $dir = $('.directory[data-directory-name="'+ directoryname +'"]');
					if (!$dir[0]) { return; }
					let dirID;

					if ($dir.size() === 1) {
						dirID = $dir.attr('data-directory-id');
						comDeleteDirectory(dirID,option);
					} else if ($dir.size() > 1) {

						if (window.confirm('同一名のディレクトリが複数存在します。\nすべてのディレクトリを削除しますか。')) {
							$dir.each(function () {
								dirID = $(this).attr('data-directory-id');
								comDeleteFile(dirID,option);
							});
						} else {
							console.log('[複数ディレクトリ]削除できませんでした。:' + directoryname);
						}

					}
				}

				function getCurrentFileID() {
					'use strict';
					const fileID = $('#file_title').attr('data-file-id');
					return fileID;
				}

				// ====================================================
				// 	ユーティリティ(label:utility)
				// ====================================================
				$.fn.extend( {
					nextObj:function(selector,bl) {
						'use strict';
						// selectorに合致するオブジェクト群の中で、$objの次のオブジェクトを返す
						// bl: trueなら、最後のオブジェクトからnextObjをすると最初のオブジェクトを返す
						const $objs = $(selector);
						const objLen = $objs.length;
						const currentIndex = $objs.index(this);

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
						'use strict';
						const $objs = $(selector);
						const currentIndex = $objs.index(this);
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
						'use strict';
						$('#'+id).removeAttr('id');
						this.attr('id',id);
						return this;
					},
					// DOM要素の文字列表現を返す
					toString:function () {
						'use strict';
						const $tmp = $('<div>');
						return $tmp.append(this.clone()).html();
					},
					// ２つの要素の中心点同士の距離を求める
					computeDistanceBetweenObj:function($other) {
						'use strict';
						const tCenterPos = this.computeCenterPoint();
						const oCenterPos = $other.computeCenterPoint();
						return jQuery.computeDistanceP2P(tCenterPos.x,tCenterPos.y,oCenterPos.x,oCenterPos.y);
					},
					// ある点とオブジェクトの中心点の距離を求める
					computeDistanceP2O:function(po) {
						'use strict';
						// ex: po = {x:10,y:10}
						const objPos = this.computeCenterPoint();
						return jQuery.computeDistanceP2P(po.x,po.y,objPos.x,objPos.y);
					},
					// オブジェクトの中心点の座標を求める
					computeCenterPoint:function() {
						'use strict';
						const objPos = this.getPosObj();
						const objWidth = parseInt(this.css('width'));
						const objHeight = parseInt(this.css('height'));
						return {
							x: objPos.x + objWidth/2,
							y: objPos.y + objHeight/2
						}
					},
					// window上の絶対座標
					getPosObj:function() {
						'use strict';
						const offset = this.offset();
						const x = offset.left;
						const y = offset.top;
						return {
							'x' : x,
							'y' : y
						}
					},
					// 正規表現にマッチしたクラスを取り除く
					// 複数クラスを外す場合にはgオプション
					removeClassByRegExp:function (regexp) {
						'use strict';
						const strClass = this.attr('class') || ''; // classが一つもない場合、attr()はundefinedを返してくるため、match()が使えない
						const classArr = strClass.match(regexp) || []; // 正規表現にマッチしない場合、nullが返ってくる
						for (let i = 0,len = classArr.length; classArr && i < len; i++) {
							this.removeClass(classArr[i]);
						}
						return this;
					},
					hasClassByRegExp:function(regexp) {
						'use strict';
						const strClass = this.attr('class') || '';
						return regexp.test(strClass);
					},
					// 正規表現に合うクラスを文字列で返す
					getOneClassByRegExp:function(regexp) {
						'use strict';
						const strClass = this.attr('class') || ''; // classが一つもない場合、attr()はundefinedを返してくるため、match()が使えない
						return regexp.test(strClass) ? strClass.match(regexp)[0] : null;
					},
					addCursor: function(opt_bl) {
						'use strict';
						// opt_bl: trueなら、カーソルを画面中央に配置する(二行以上カーソル行がはみ出した場合)
						if (!this.hasClass('vertical-char')) return this;

						const $prevCursor = $('.cursor');
						const $prevChar = this.prev('.vertical-char');

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
					// ２点間の距離を求める
					computeDistanceP2P:function(x1,y1,x2,y2) {
						'use strict';
						// ２乗を使っているので、戻り値は必ず正の数になる
						// √{(b.x - a.x)^2+ (b.y - a.y)^2}
						return Math.sqrt(Math.pow(x2-x1,2)+Math.pow(y2-y1,2));
					}
				});

				// selectorに合致するオブジェクト群の中で、$objの次のオブジェクトを返す
				function nextObj(selector,$obj) {
					'use strict';
					const $objs = $(selector);
					const currentIndex = $objs.index($obj);
					return $objs.eq(currentIndex + 1);
				}

				function prevObj(selector,$obj) {
					'use strict';
					const $objs = $(selector);
					const currentIndex = $objs.index($obj);
					const newObj = $objs.eq(currentIndex - 1);

					if (newObj[0] === $objs.last()[0]) {
						// eq()に負の引数を渡すと、最後の要素に戻ってしまうのを防止
						return $();
					} else {
						return newObj;
					}
				}

				function hasClass(elem,classRegExp) {
					'use strict';
					if (classRegExp.test(elem.className)) {
						return true;
					}
					return false;
				}

				// baseArrayをcnt個ずつの配列に分割する
				function splitArray(baseArray,cnt) {
					'use strict';
					const b = baseArray.length;
					const newArray = [];

					for (let i = 0,j,p; i < Math.ceil(b/cnt); i++) {
						j = i*cnt;
						p = baseArray.slice(j,j+cnt);
						newArray.push(p);
					}
					return newArray;
				}

				function getUserID() {
					'use strict';
					const userID = $('#site_title').attr('data-user-id');
					return userID;
				}

				// ====================================================
				// 	initialize(label:init)
				// ====================================================

				setNOCLine();
				defaultNewFile();
				comFileList(globalUserID);
				// Event
				document.addEventListener('keydown',keydownOnDoc ,false);
				addFocusEvent('file_title');
				$('body').on('keyup','#search_file',keyupInSearchFileInput);
				$('body').on('click','#file_list .file',function (e) {
					'use strict';
					const fileID = $(this).attr('data-file-id');
					comReadJsonFile(fileID);
					$('#file_list_modal').modal('hide');
				});
				$('body').on('click','.vertical-paragraph > .vertical-row',moveCursorToClickPos);
				$('body').on('mousewheel','#vertical_draft',wheelEvent);
				document.getElementById('menu_new').addEventListener('click',function (e) { defaultNewFile(); },false);
				document.getElementById('menu_save').addEventListener('click',function (e) { comSaveJsonFile(); },false);
				document.getElementById('menu_delete').addEventListener('click',function (e) { defaultDeleteFile(); },false);
				document.getElementById('modal_fileopen_link').addEventListener('click',function (e) { readyFileModal(); },false);
				document.getElementById('test').addEventListener('click',function (e) {
					'use strict';
				},false);
				$(window).resize(function () {
					'use strict';
					resetDisplayChar();
				});
				$('#file_list_modal').on('shown.bs.modal',function (e) {
					'use strict';
					// modalが完全に表示されてからのイベント
					$('#search_file').focus();
				});
				$('div.modal').on('shown.bs.modal',function (e) {
					'use strict';
					// modalが完全に表示されてからのイベント
					document.removeEventListener('keydown',keydownOnDoc,false);
				});
				$('div.modal').on('hidden.bs.modal',function (e) {
					'use strict';
					if ($('#command').hasClass('active')) { return; }
					document.addEventListener('keydown',keydownOnDoc,false);
				});
				function addFocusEvent(id) {
					'use strict';
					document.getElementById(id).addEventListener('focus',function (e) {
						document.removeEventListener('keydown',keydownOnDoc,false);
					},false);
					document.getElementById(id).addEventListener('blur',function (e) {
						document.addEventListener('keydown',keydownOnDoc,false);
					});
					document.getElementById(id).addEventListener('keyup',function (e) {
						'use strict';
						const keycode = getKeyCode(e);
						if (keycode === 13) {
							// enter
						}
					});
				}

				// palette
				// color
				document.getElementById('color_btn').addEventListener('click',function (e) {
					'use strict';
					// 文字色ボタンをクリックすると選択している文字の色が変わる
					const eBtn = document.getElementById('color_btn');
					const colors = eBtn.className.match(/select-(\S+)/);
					let color;

					if (colors == null) {
						color = 'black';
					} else {
						color = colors[1];
					}

					setColorOnSelect(color);
				},false);

				setSelectColorClickEvent('black');
				setSelectColorClickEvent('red');
				setSelectColorClickEvent('blue');
				function setSelectColorClickEvent(color) {
					// 文字色(ドロップダウンの方)をクリックするとボタンの色が変わるイベントを付加する
					document.getElementById('select_color_'+color).addEventListener('click',function (e) {
						const elSel = document.getElementById('color_btn');
						$(elSel).removeClassByRegExp(/select-\S+/);
						setColorOnSelect(color);
						if (color === 'black') return;
						elSel.classList.add('select-'+color);
					},false);
				}

				// bold italic
				document.getElementById('btn-bold').addEventListener('click',function(e) {
					'use strict';
					const eBtn = document.getElementById('btn-bold');
					const eSelChars = findSelectElem(true);

					eBtn.classList.toggle('active');
					if (/active/.test(eBtn.className)) {
						// ボタンをクリックした結果、activeになった
						for (let i = 0,cnt=eSelChars.length;i<cnt;i++) {
							eSelChars[i].classList.add('decolation-font-bold');
						}
					} else {
						// ボタンをクリックした結果、解除された
						for (let i = 0,cnt=eSelChars.length;i<cnt;i++) {
							eSelChars[i].classList.remove('decolation-font-bold');
						}
					}
				},false);
				document.getElementById('btn-italic').addEventListener('click',function(e) {
					'use strict';
					const eBtn = document.getElementById('btn-italic');
					const eSelChars = findSelectElem(true);

					eBtn.classList.toggle('active');
					if (/active/.test(eBtn.className)) {
						for (let i = 0,cnt=eSelChars.length;i<cnt;i++) {
							eSelChars[i].classList.add('decolation-font-italic');
						}
					} else {
						for (let i = 0,cnt=eSelChars.length;i<cnt;i++) {
							eSelChars[i].classList.remove('decolation-font-italic');
						}
					}
				},false);
				// selection
				// 選択範囲に文字装飾が施されていればアクティブに
				document.getElementById('vertical_draft').addEventListener('mouseup',function(e) {
					'use strict';
					const eSelChars = findSelectElem();
					let bBold = false;
					let bItalic = false;

					for (let i=0,cnt=eSelChars.length;i<cnt;i++) {
						if (eSelChars[i].classList.contains('decolation-font-bold')) { bBold = true; }
						if (eSelChars[i].classList.contains('decolation-font-italic')) { bItalic = true; }
					}
					if (bBold) {
						document.getElementById('btn-bold').classList.add('active');
					} else {
						document.getElementById('btn-bold').classList.remove('active');
					}
					if (bItalic) {
						document.getElementById('btn-italic').classList.add('active');
					} else {
						document.getElementById('btn-italic').classList.remove('active');
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
					'use strict';
					document.getElementById('text-btn-'+ align).addEventListener('click',function(e) {
						setAlignCursorParagraph(align);
					},false);
				}
});

