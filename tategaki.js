console.log('tategaki.js');
/*
 * 実装目標
 * アンドゥ
 */
$(function() {
	// ===================================================================
	// 		クロージャ(label:closer)
	// ===================================================================
	// 巻き上げが起こらないため、ファイル先頭に記述する

	// file_listの中に入れるファイル行を作成する
	const createFileElement = (function () {
		'use strict';
		/*
		 * 作成例
		 * <li>
		 * <a class="file"
		 * data-type="file"
		 * href="#"
		 * data-file-id="1"
		 * data-file-name="filename"
		 * >
		 * filename
		 * </a>
		 * </li>
		 */
		const eFileTemplate = document.createElement('li');
		const eFileLinkTemplate = document.createElement('a');
		eFileLinkTemplate.classList.add('file');
		eFileLinkTemplate.dataset.type = 'file';
		eFileLinkTemplate.href = '#';

		return function (id,filename) {
			const eFile = eFileTemplate.cloneNode(true);
			const eFileLink = eFileLinkTemplate.cloneNode(true);
			eFileLink.dataset.fileId = id;
			eFileLink.dataset.fileName = filename;
			eFileLink.textContent = filename;
			eFile.appendChild(eFileLink);
			return eFile;
		}
	})();
	
	// file_listの中に入れるディレクトリ行を作成する
	const createDirectoryElement = (function () {
		'use strict';
		/*
		 * 作成例
		 * <li>
		 * 	<a class="directory"
		 * 	data-type="directory"
		 * 	data-toggle="collapse"
		 * 	data-directory-id="1"
		 * 	data-directory-name="filename.directoryname"
		 * 	href="#directory1"
		 * 	>
		 *		<span
		 *		class="glyphicon glyphicon-folder-close"
		 *		aria-hidden="true">
		 *		</span>
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
		const eDirectoryTemplete = document.createElement('li');
		const eDirLinkTemplete = document.createElement('a');
		eDirLinkTemplete.classList.add('directory');
		eDirLinkTemplete.dataset.type = 'directory';
		eDirLinkTemplete.dataset.toggle = 'collapse';
		eDirLinkTemplete.innerHTML = '<span class="glyphicon glyphicon-folder-close" aria-hidden="true"></span>'; // フォルダアイコン

		return function (id,innerData) {
			const eDirectory = eDirectoryTemplete.cloneNode(true);
			const eDirLink = eDirLinkTemplete.cloneNode(true);
			const directoryname = innerData.directoryname;
			eDirLink.dataset.directoryId = id;
			eDirLink.dataset.directoryName = directoryname;
			eDirLink.href = '#directory' + id;
			eDirLink.insertAdjacentHTML('beforeend',directoryname);

			eDirectory.appendChild(eDirLink);
			eDirectory.appendChild(createDirCollapseElement(id,innerData)); // コラプスも加える
			return eDirectory;
		}
	})();

	// ディレクトリ行の中に入れるディレクトリ内を表すコラプスを作成する
	const createDirCollapseElement = (function () {
		'use strict';
		/*
		 * 作成例
		 *		<div class="collapse" id="directory1">
		 *			<div class="well">
		 *				<ul>
		 *					<li>filename</li>
		 *					<li>filename</li>
		 *					<li>filename</li>
		 *				</ul>
		 *			</div>
		 *		</div>
		 */
		const eCollapseTemplate = document.createElement('div');
		const eInnerUlTemplate = document.createElement('ul');
		const eWellTemplate = document.createElement('div');
		eCollapseTemplate.classList.add('collapse');
		eWellTemplate.classList.add('well');

		return function (id,innerData) {
			'use strict';
			const eCollapse = eCollapseTemplate.cloneNode(true);
			const eInnerUl = eInnerUlTemplate.cloneNode(true);
			const eWell = eWellTemplate.cloneNode(true);
			eCollapse.id = 'directory' + id;

			// コラプス内にファイルリストを加える
			setFileListFromObject(innerData, eInnerUl);

			eCollapse.appendChild(eWell);
			eWell.appendChild(eInnerUl);
			return eCollapse;
		}
	})();
	
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
	
	// 漢字変換候補を選んでいるときならtrue
	function isConvertMode() {
		'use strict';
		return $('.convert-view')[0] ? true : false;
	}
	// inputbufferへの入力中ならtrue
	function isInputMode() {
		'use strict';
		return $('#input_buffer').text() !== '' ? true : false;
	}

	function keydownOnDoc(e) {
		'use strict';
		return;
		userAlert('');
		const keycode = getKeyCode(e);

		if (keycode === 123) { return; } // F12のみブラウザショートカットキー

		const $inputBuffer = $('#input_buffer');
		if (isConvertMode()) {
			keydownOnConvertView(e,keycode);
		} else if (isInputMode()) {
			keydownOnInputBuffer(e,keycode);
		} else {
			// 非入力(通常)状態

			if (e.ctrlKey) {
				// ctrlキーを使ったショートカットキー
				keydownWithCTRL(e,keycode);
			} else {
				keydownOnContainer(e,keycode);
			}

		}

		console.log(keycode);
		// デフォルトの動作を無効化する
		e.preventDefault();
	}

	function keydownOnConvertView(e,keycode) {
		'use strict';
		return;

		switch (keycode) {
			case 8:
				// backspace
				backSpaceOnConvert();
				break;
			case 13:
				// Enter
				// inputBufferの文字を挿入
				const $inputBuffer = $('#input_buffer');
				$('.convert-view').remove();
				insertStringFromCursor($inputBuffer.text());
				$inputBuffer.empty().hide(); // inputBufferを空にして隠す
				break;
			case 32:
			case 37:
				// space
				// Left
				// 候補のフォーカスを移動する
				shiftLeftSelectKanjiFocus();
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
				shiftRightSelectKanjiFocus();
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
		return;
		const $inputBuffer = $('#input_buffer');

		switch (keycode) {
			case 8:
				// backspace
				// input_bufferの最後の１文字を削除
				// $inputBuffer.children('.EOL').prev().remove();
				// moveInput();
				// input_bufferの文字がなくなればinput_bufferを空にして隠す
				// if ($inputBuffer.children('.char').first().hasClass('EOL')) {
				// 	$inputBuffer.empty().hide(); // inputBufferを空にして隠す
				// }
				break;
			case 13:
				// Enter
				// inputBufferの文字を挿入
				console.log('push enter');
				// insertStringFromCursor($inputBuffer.text());
				// $inputBuffer.empty().hide(); // inputBufferを空にして隠す
				break;
			case 32:
				// space
				// comKanjiForFullString($inputBuffer.text());
				break;
			case 118:
				// F7
				changeKatakanaAll();
				break;
			default:
				// inputBufferの更新
				// updateInputBuffer(keycode,e.shiftKey);
				break;
		}
	}

	function keydownWithCTRL(e,keycode) {
		'use strict';

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
				// backSpaceOnContainer();
				// checkText();
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
			// case 72:
			// 	// h
			// 	readySelection();
			// 	gCursor.shiftLeft();
			// 	extendSelection(e.shiftKey);
			// 	break;
			// case 74:
			// 	// j
			// 	readySelection();
			// 	gCursor.next();
			// 	extendSelection(e.shiftKey);
			// 	break;
			// case 75:
			// 	// k
			// 	readySelection();
			// 	gCursor.prev();
			// 	extendSelection(e.shiftKey);
			// 	break;
			// case 76:
			// 	// l
			// 	readySelection();
			// 	gCursor.shiftRight();
			// 	extendSelection(e.shiftKey);
			// 	break;
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
		// changeDisplayRow(false);
		addPageBreak();
		// printDocInfo();
	}

	function keydownOnContainer(e,keycode) {
		'use strict';

		switch (keycode) {
			// case 8:
			// 	// backspace
			// 	backSpaceOnContainer();
			// 	checkText();
			// 	break;
			// case 13:
			// 	// Enter
			// 	lineBreak();
			// 	checkText();
			// 	break;
			// case 32:
			// 	// space
			// 	insertStringFromCursor('　');
			// 	break;
			// case 37:
			// 	// Left
			// 	// readySelection();
			// 	// gCursor.shiftLeft();
			// 	// extendSelection(e.shiftKey);
			// 	break;
			// case 38:
			// 	// Up
			// 	// readySelection();
			// 	// gCursor.prev();
			// 	// extendSelection(e.shiftKey);
			// 	break;
			// case 39:
			// 	// Right
			// 	// readySelection();
			// 	// gCursor.shiftRight();
			// 	// extendSelection(e.shiftKey);
			// 	break;
			// case 40:
			// 	// Down
			// 	// readySelection();
			// 	// gCursor.next();
			// 	// extendSelection(e.shiftKey);
			// 	break;
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
				// updateInputBuffer(keycode,e.shiftKey);
				break;
		}
	}

	// -------------------------------- keydown function -----------------------------------------

	// 漢字変換時にバックスペース
	function backSpaceOnConvert() {
		'use strict';
		const $inputBuffer = $('#input_buffer');
		const $activeConvertView = $('.convert-view.active');
		const currentSelectKana = $activeConvertView.children('.row').last().text();

		if (currentSelectKana.length >= 2) {
			// 現在選択中の文節が２文字以上
			// 現在選択中の文節から１文字削って、その文節だけ再変換
			comKanjiForOnePhrase(
					currentSelectKana.substring(0,currentSelectKana.length-1) // １文字削除
					,$('.convert-view.active')
					);

		} else {
			// 現在選択中の文節がひらがなで１文字のみ
			// 現在の文節を削除し、選択を次の文節に移す

			if ($inputBuffer.children('.char').not('.EOL').length === 1) {
				// これを削除すればinput_bufferが空になる場合
				// EOL含めて２文字
				$('#convert_container').empty();
				$inputBuffer.empty().hide(); // inputBufferを空にして隠す
				return;
			}

			// 削除後のフォーカス移動先
			let $newActiveConvertView = $activeConvertView.next('.convert-view');
			let newPhraseNum = $newActiveConvertView.children('.phrase-num').text();
			// 現在選択中の文節が最後の文節なら一つ前に戻る
			// 見つからなかった場合は下のselectPhraseのセレクタがエラー(newPhraseNumが空になる)
			if (!($newActiveConvertView[0])) {
				$newActiveConvertView = $activeConvertView.prev('.convert-view');
				newPhraseNum = $newActiveConvertView.children('.phrase-num').text();
			} 

			// convert-view
			$('.convert-view.active').remove();
			$newActiveConvertView.addClass('active');
			$newActiveConvertView.children('.row').first().addClass('select');

			// input_buffer > select-phrase
			$('#input_buffer > .char.select-phrase').remove();
			$('#input_buffer > .char[data-phrase-num='+ newPhraseNum + ']').addClass('select-phrase');

			resetPhraseNum();

		}

	}

	// 漢字変換中に<Up>キー
	// 選択文節を一つ上に変更
	function upOnConvert() {
		'use strict';
		// 選択文節の変更
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
		$('.convert-view > .row.select').removeClass('select');
		$newSelectConvertView.children('.row').first().addClass('select');

		// input_bufferのselect-phraseの変更
		$('#input_buffer > .char.select-phrase').removeClass('select-phrase');
		$('#input_buffer > .char[data-phrase-num='+ newPhraseNum + ']').addClass('select-phrase');
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
		$('.convert-view.active > .row.select').removeClass('select');
		$newSelectConvertView.children('.row').first().addClass('select');

		// input_bufferのselect-phrase
		$('#input_buffer > .char.select-phrase').removeClass('select-phrase');
		$('#input_buffer > .char[data-phrase-num='+ newPhraseNum + ']').addClass('select-phrase');
	}

	// 漢字変換中にShift+<Up>
	// 文節区切りを一つ前にずらす
	function shiftUpOnConvert() {
		'use strict';
		const $firstConvertView = $('.convert-view.active');
		const $secondConvertView = $firstConvertView.next('.convert-view');
		const firstKana = $firstConvertView.children('.row').last().text();

		if (firstKana.length < 2) return; // 選択中の文節が１文字しかないときは何もしない

		if (!($secondConvertView[0])) {
			// 最後の文節の場合
			// 分離
			const newStr = firstKana.substring(0,firstKana.length-1) +
				',' +
				firstKana.substring(firstKana.length-1,firstKana.length);

			comKanjiForSplit(newStr,$firstConvertView);
			return;
		}

		const secondKana = $secondConvertView.children('.row').last().text();

		// 前半文節の最後の文字を、後半文節の最初に移動
		const newStr = firstKana.substring(0,firstKana.length-1) +
			',' +
			firstKana.substring(firstKana.length-1,firstKana.length) +
			secondKana;

		comKanjiForChangePhrase(newStr,$firstConvertView,$secondConvertView);
	}

	// 漢字変換中にShift+<Down>
	// 文節区切りの変更
	function shiftDownOnConvert() {
		'use strict';
		const $firstConvertView = $('.convert-view.active');
		const $secondConvertView = $firstConvertView.next('.convert-view');
		const firstKana = $firstConvertView.children('.row').last().text();
		const secondKana = $secondConvertView.children('.row').last().text();

		if (!($secondConvertView[0])) return; // 最後の文節を選択していたら何もしない

		if (secondKana.length < 2) {
			//二番目の文字列が１文字しかないので、２つを統合する
			const newStr = firstKana + secondKana + ',';
			comKanjiForFusion(newStr,$firstConvertView,$secondConvertView);
			return;
		}

		// 後半の１文字を前半に移す
		const newStr = firstKana + secondKana.charAt(0) + ',' + secondKana.substring(1);
		comKanjiForChangePhrase(newStr,$firstConvertView,$secondConvertView);
	}

	// 漢字変換候補一覧のフォーカスを左にシフトさせる
	function shiftLeftSelectKanjiFocus() {
		'use strict';
		const $oldSelect = $('.convert-view.active > .row.select');
		const $newSelect = $oldSelect.next('.row');

		shiftSelectKanjiFocus($oldSelect, $newSelect);
	}

	// 漢字変換候補一覧のフォーカスを右にシフトさせる
	function shiftRightSelectKanjiFocus() {
		'use strict';
		const $oldSelect = $('.convert-view.active > .row.select');
		const $newSelect = $oldSelect.prev('.row');

		shiftSelectKanjiFocus($oldSelect, $newSelect);
	}

	// convert-viewのselectを$oldSelectから$newSelectに動かす
	function shiftSelectKanjiFocus($oldSelect, $newSelect) {
		'use strict';
		if (!($newSelect[0])) return;

		// selectクラス
		$oldSelect.removeClass('select');
		$newSelect.addClass('select');

		// inputBufferの文字を入れ替える
		const phraseNum = $newSelect.siblings('.phrase-num').text();
		const selectKanji = $newSelect.text();
		insertPhraseToInputBuffer(phraseNum,selectKanji);

		// selectphraseクラスの付け替え
		$('#input_buffer .select-phrase').removeClass('select-phrase');
		$('#input_buffer > .char[data-phrase-num='+ phraseNum +']').addClass('select-phrase');

		resizeInputBuffer();
	}

	// -------------------------------- wheel event ---------------------------------

	function wheelEvent(e,delta,deltaX,deltaY) {
		'use strict';
		// マウスホイールを動かすと、ページが左右に動く
		const mvRowNum = 4; // 一度に動かす行数

		if (delta > 0) {
			// ホイールを上に動かす
			for (let i = 0; i < mvRowNum; i++) {
				shiftRightDisplay();
			}
		} else {
			// ホイールを下に動かす
			for (let i = 0; i < mvRowNum; i++) {
				shiftLeftDisplay();
			}
		}

		// printDocInfo();
	}
	function shiftRightDisplay() {
		'use strict';
		const $nextRow = $('.row.display').first().prevObj('#sentence_container .row');
		if (!$nextRow[0]) { return; }
		$nextRow.addClass('display');
		$('.row.display').last().removeClass('display');
		if (!($('.cursor-row').hasClass('display'))) { gCursor.shiftRight(); }
	}
	function shiftLeftDisplay() {
		'use strict';
		const $nextRow = $('.row.display').last().nextObj('#sentence_container .row');
		if (!$nextRow[0]) { return; }
		$nextRow.addClass('display');
		$('.row.display').first().removeClass('display');
		if (!($('.cursor-row').hasClass('display'))) { gCursor.shiftLeft(); }
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
					 comMoveFile(command[1],command[2]);
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
			// あらかじめbootstrapより先回りしてstyle適用で非表示にしておかなければ、消える前に一瞬中央表示になってしまう
			$('#file_list_modal')
				.attr('style','display: none;')
				.removeClass('command-modal')
				.modal('hide');
		}
		// comFileList(getUserId());
		container.fileList().read(getUserId());
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
		const eSentence = document.getElementById('sentence_container');

		// reset
		const eOldLabel = eSentence.getElementsByClassName('find-label');
		const eOldWord = eSentence.getElementsByClassName('find-word');
		while (eOldLabel[0]) { // クラスをremoveするとeOldLabelからその要素がなくなって詰められる
			eOldLabel[0].classList.remove('find-label');
		}
		while (eOldWord[0]) {
			eOldWord[0].classList.remove('find-word');
		}
		console.log('removed');
		if (word === '') return; // 検索文字がなくなった場合は、すべての文字からクラスを除去するのみ

		const eChars = eSentence.getElementsByClassName('char');
		const indexArr = findIndex(word);
		const wordLen = word.length;
		for(let index of indexArr) {
			// 先頭文字にfind-label
			eChars[index].classList.add('find-label');
			for (let word_i = 0;word_i < wordLen;word_i++) {
				// 該当文字全てにfind-word
				eChars[index + word_i].classList.add('find-word');
			}
		}

		// カーソル位置の次に位置する検索語句の頭にカーソルを移動する
		if (!eSentence.getElementsByClassName('cursor')[0].classList.contains('find-label')) findNext();
	}

	function findIndex(word) {
		'use strict';
		/*
		 * 字句検索
		 * 1文字目のインデックスの配列を返す
		 * 検索字句を1文字ずつ確認
		 * 検索字句の1文字目と、配列に残っているインデックスのcharの文字を比較し、異なれば配列から除外する
		 * 検索字句の2文字目と、配列に残っているインデックスのcharの次のcharの文字を比較し、異なれば配列から除外する
		 * 検索字句の3文字目と、配列に残っているインデックスのcharから２つ後のcharの文字を比較し、異なれば配列から除外する
		 * 検索字句のすべての文字に対して以上を繰り返していき、最終的に配列要素として残っているインデックスが、検索文字列の１文字目のインデックスとなる
		 */
		const eChars = document.getElementById('sentence_container').getElementsByClassName('char');
		const indexArr = [];

		// いったん、すべての文字のインデックスを配列に入れる
		for (let i = 0,len = eChars.length;i < len;i++) {
			indexArr[i] = i;
		}

		for (let search_i = 0,wordLen = word.length;search_i < wordLen;search_i++) {
			const searchChar = word.charAt(search_i);
			// 配列から、条件に合わない要素のインデックスを除外する
			for (let index_i = 0;index_i < indexArr.length;index_i++) { // lengthは変動するため、キャッシュ不可
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
		const $newCursor = $oldCursor.nextObj('#sentence_container .find-label,.cursor',true);

		if (!$newCursor[0]) return;

		$newCursor.addCursor(true);
		gCursor.repositionCharNum();
	}

	// 前の検索語句にカーソルを戻す
	function findPrev() {
		'use strict';
		const $oldCursor = $('.cursor');
		const $newCursor = $oldCursor.prevObj('#sentence_container .find-label,.cursor',true);

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
		for (let str of strArray) {
			html += createParagraphHtml(str);
		}

		// データに１文字もなければ上記for文に入れないので、空行を別に作成する
		if ($('#sentence_container > .paragraph').length === 0) {
			html += createParagraphHtml('');
		}

		// innerHTMLで画面内に挿入する
		document.getElementById('sentence_container').innerHTML = html;
	}

	function appendParagraph(str) {
		'use strict';
		$('#sentence_container').append(createParagraphHtml(str));
	}

	function appendParagraphFromObj(paraObjArr) {
		// 決まった形のオブジェクトを引数に、本文を作成して画面に表示する
		'use strict';
		let html = '';
		for (let paraObj of paraObjArr) {
			html += createParagraphHtmlFromObj(paraObj);
		}
		document.getElementById('sentence_container').innerHTML = html;
		checkKinsoku(); // 禁則処理
	}

	function insertStringFromCursor(str) {
		'use strict';
		console.log('ins string from cursor');
		const $cursor = $('.cursor');
		const $cursorRow = $('#sentence_container .cursor-row')

			for (let char of str) {
				const $character = $(createCharHtml(char));
				$cursor.before($character);
			}
		cordinateStringNumber($cursorRow,getStringLenOfRow());
		gCursor.repositionCharNum();
		checkKinsoku();
		// changeDisplayRow(false);
		// resetDisplayChar();
		// changeDisplayChar();
		addPageBreak();
		printDocInfo();
	}

	function insertStringToInputBuffer(str) {
		'use strict';
		const $inputBuffer = $('#input_buffer');
		$inputBuffer.empty();

		for (let char of str) {
			$inputBuffer.append(
					$(createCharHtml(char)
						).attr('data-phrase-num',-1));
		}

		$inputBuffer.append($('<span class="char EOL"></span>'));
		$inputBuffer.show();

		moveInput();

		return $inputBuffer;
	}

	// inputBufferの更新
	function updateInputBuffer(keycode,isShift) {
		'use strict';
		const inputStr = $('#input_buffer').text(); //もともとの文字列
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
		const $selectPhrases = $('#input_buffer > .char[data-phrase-num='+ phNum +']');
		const $insertPosChar = $selectPhrases.first();

		for (let char of str) {
			const $character = $(createCharHtml(char));
			$insertPosChar.before($character);
			$character.attr('data-phrase-num',-10);
		}
		$selectPhrases.remove();

		return $('#input_buffer > .char[data-phrase-num="-10"]').attr('data-phrase-num',phNum);
	}

	// --------------------------------------- create string html ------------------------------------

	// 文字列を引数にして、段落のhtml文字列を作成する
	function createParagraphHtml(str) {
		'use strict';
		let html = '<div class="paragraph">'

			// strLen文字ごとに区切って各行として連結する
			const strLen = getStringLenOfRow();
		for (let pos = 0,len = str.length; pos <= len; pos += strLen) { // 空文字が渡されることもあるので、pox<=lenと=がついている
			if(str.length < pos + strLen){
				// 残った文字が一行で収まる
				const outputStr = str.slice(pos);
				html += createRowHtml(outputStr);
			} else {
				// 残り文字が一行で収まらない
				const	outputStr = str.substring(pos, pos+strLen);
				html += createRowHtml(outputStr);
			}
		}

		html += '</div>'

			return html;
	}

	// 文字列を引数にして行のhtml文字列を作成する
	function createRowHtml(str) {
		'use strict';
		if (str == null) return;

		let html = '<div class="row">'

			for (let char of str) {
				html += createCharHtml(char);
			}

		html += '<span class="char EOL display"></span></div>';

		return html;
	}

	function createCharHtml(char) {
		'use strict';
		// stringを引数にして、文字のhtml文字列を作成する
		// 引数の文字列が２文字以上の場合は、最初の１文字のみが有効
		// クラスを追加するには、最初に半角スペースを入れること
		if (char.length > 1) { char = char.charAt(0); }
		const classArr = getConfDecoChar();
		let html = '<span class="char display';

		for (let className of classArr) {
			html += ' ' + className;
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
		let html = '<div class="paragraph"';

		// 段落そのものにクラスを付与する
		for (let className of paraObj[0]) {
			html += ' ' + className;
		}
		html += '>';

		// 文字の配列をstrLen個ずつの配列に分け、それぞれで行を作成して連結する
		const strLen = getStringLenOfRow();
		const objArray = splitArray(paraObj[1],strLen); // paraObj[1]が空配列なら、objArrayにも空配列が入る
		for (let charArray of objArray) {
			html += createRowHtmlFromObj(charArray);
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
		let html = '<div class="row">';

		for (let charObj of objArray) {
			html += createCharHtmlFromObj(charObj);
		}
		html += '<span class="char EOL display"></span></div>'
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
		let html = '<span class="char';

		for (let className of classArr) {
			html += ' ' + className;
		}

		// 文字の種類に応じて付与するクラス
		if (/[。、,.,]/.test(char))
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
		const $paragraphs = $('#sentence_container > .paragraph');
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
		const $chars = $paragraph.find('.char').not('.EOL');
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
		}).done(function (json) {
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
			$('#input_buffer').children('.char[data-phrase-num="0"]').addClass('select-phrase');
			// inputBufferの高さ調整
			resizeInputBuffer();
		}).fail(function (XMLHttpRequest, textStatus, errorThrown) {
			alert('Error:'+ textStatus + ':\n' + errorThrown + ':status=' + XMLHttpRequest.status + 'in comKanjiForFullString');
		});
	}

	// input_bufferの各文字に、文節番号を割り振る
	function setPhraseNumToCharOnInputBuffer(json) {
		'use strict';
		const eChars = document.getElementById('input_buffer').getElementsByClassName('char');

		// 各文節ループ
		// pos: 各文節の１文字目のインデックスを保持
		for (let i = 0,pos = 0,len = json.length; i < len; i++) {
			const hiragana = json[i][0];
			const hiraLen = hiragana.length;

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
		for (let i = 0,len = json.length; i < len; i++) {
			// 変換候補表示
			// convertviewを作成する
			const $convertView = createConvertView(i,json[i]);
			$convertContainer.append($convertView);
		}

		// 最初のconvertViewにactiveを付与
		const $convertViews = $convertContainer.children('.convert-view');
		const $activeView = $convertViews.first().addClass('active');

		$activeView.children('.row').first().addClass('select');

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
		}).done(function (json) {
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

			$newFirstConvertView.children('.row').first().addClass('select');
			repositionConvertView();

			// input_buffer
			// 第一候補の文字でinputBufferの該当文字を置き換える
			insertPhraseToInputBuffer(firstPhraseNum,json[0][1][0]);
			insertPhraseToInputBuffer(secondPhraseNum,json[1][1][0]);

			// selectphraseクラスの付け替え
			$('#input_buffer > .char[data-phrase-num='+ firstPhraseNum +']').addClass('select-phrase');
			// 最後にinputBufferの高さ調整
			resizeInputBuffer();
		}).fail(function (XMLHttpRequest, textStatus, errorThrown) {
			'use strict';
			alert('Error:'+ textStatus + ':\n' + errorThrown + ':status=' + XMLHttpRequest.status + 'in comKanji');
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
		}).done(function (json) {
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
			$newConvertView.children('.row').first().addClass('select');
			insertPhraseToInputBuffer(firstPhraseNum,json[0][1][0]);
			const secondPhraseNum = this.$secondConvertView.children('.phrase-num').text();
			$('#input_buffer > .char[data-phrase-num='+ secondPhraseNum +']').remove();
			// selectphraseクラスの付け替え
			$('#input_buffer > .char[data-phrase-num='+ firstPhraseNum +']').addClass('select-phrase');
			resetPhraseNum();
			// inputBufferの高さ調整
			resizeInputBuffer();
		}).fail(function (XMLHttpRequest, textStatus, errorThrown) {
			alert('Error:'+ textStatus + ':\n' + errorThrown + ':status=' + XMLHttpRequest.status + 'in comKanji');
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
			}
		}).done(function (json) {
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
			$newFirstConvertView.children('.row').first().addClass('select');
			const $newBufferChars = insertPhraseToInputBuffer(firstPhraseNum,json[0][1][0]);
			$newBufferChars.addClass('select-phrase');
			// second phrase
			const secondFirstStr = json[1][1][0];
			const $insertPosChar = $('#input_buffer > .char[data-phrase-num='+ firstPhraseNum + ']').last();
			for (let i = secondFirstStr.length -1; i >= 0; i--) {
				const $character = $(createCharHtml(secondFirstStr.charAt(i))).attr('data-phrase-num',secondPhraseNum);
				$insertPosChar.after($character);
			}

			// selectphraseクラスの付け替え
			resetPhraseNum();
			// 最後にinputBufferの高さ調整
			resizeInputBuffer();
		}).fail(function (XMLHttpRequest, textStatus, errorThrown) {
			alert('Error:'+ textStatus + ':\n' + errorThrown + ':status=' + XMLHttpRequest.status + 'in comKanji');
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
			}
		}).done(function (json) {
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
			$newConvertView.children('.row').first().addClass('select');
			repositionConvertView();

			// input_buffer
			const $newBufferChars = insertPhraseToInputBuffer(firstPhraseNum,json[0][1][0]);
			// selectphraseクラスの付け替え
			$newBufferChars.addClass('select-phrase');
			// 最後にinputBufferの高さ調整
			resizeInputBuffer();
		}).fail(function (XMLHttpRequest, textStatus, errorThrown) {
			alert('Error:'+ textStatus + ':\n' + errorThrown + ':status=' + XMLHttpRequest.status + 'in comKanji');
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
		let $iterCharacter = $('#input_buffer > .char').first();
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
			$iterCharacter = $iterCharacter.next('.char');
		}
	}

	// ------------------------------------ convert katakana --------------------------------------

	// ひらがな入力中のカタカナ変換
	// inputbufferの文字をすべてカタカナに変える
	function changeKatakanaAll() {
		'use strict';
		let str = $('#input_buffer').text();
		insertStringToInputBuffer(getKatakana(str))
			.children('.char').not('.EOL')
			.addClass('select-phrase');
	}

	// 漢字変換中のカタカナ変換
	// 選択中の文節のみカタカナに変える
	function changeKatakanaAtConvert() {
		'use strict';
		const phraseNum = $('#input_buffer > .select-phrase').attr('data-phrase-num');
		const str = getKatakana($('.convert-view.active > .row').last().text());
		insertPhraseToInputBuffer(phraseNum,str).addClass('select-phrase');
		resizeInputBuffer();
	}

	// strをカタカナにして返す
	// カタカナ変換できない文字はそのまま
	function getKatakana(str) {
		'use strict';
		let rtnKatakana = '';
		for (let char of str) {
			const cKatakana = key_table.katakana[char];

			if (cKatakana) {
				rtnKatakana += cKatakana;
			} else {
				// 変換できなければ元の文字をそのまま連結
				rtnKatakana += char;
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

		// 行途中での改行
		if ($prevChar[0]) {
			let $nextRow = $cursorRow.nextAll('.row').first(); //改行前の次の行

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
			const $insertPosChar = $nextRow.children('.char').first(); //挿入先の先頭文字
			let $moveChar = $cursor; // 移動文字
			// $nextRowの先頭にある$insertPosCharに、$prevChar以降の文字を挿入していく
			while ($moveChar[0] && !($moveChar.hasClass('EOL'))) { // EOLは移動しない
				$moveChar.remove();
				$insertPosChar.before($moveChar);
				$moveChar = $prevChar.nextAll('.char').first();
			}

			if ($cursor.hasClass('EOL')) { // EOLにカーソルがあると、EOLが動かないために、カーソルが次の行に行かないので強制的に動かす必要あり
				// = 段落末での改行
				$nextRow.children('.char').first().addCursor();
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
				const $baseParagraph = $cursorRow.closest('.paragraph');
				$baseParagraph.before($(createParagraphHtml('')));
				reDisplay();
			}

			return;
		}

	}

	// カーソルの前に位置する文字を削除する
	function backSpaceOnContainer() {
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
		let $preRow = $rowOfDelChar.prevAll('.row').first();

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
		const $paragraphOfDelChar = $rowOfDelChar.closest('.paragraph');
		const $preParagraph = $paragraphOfDelChar.prevAll('.paragraph').first();

		$preRow = $preParagraph.children('.row').last();

		if ($preParagraph[0]) {
			// 第二段落以降の段落

			const $firstRowOfDelChar = $paragraphOfDelChar.children('.row').first();
			if ($firstRowOfDelChar.children('.char').first().hasClass('EOL')) {
				// 空段落でのBS
				$paragraphOfDelChar.remove(); // 段落削除
				// cursorの調整
				$preRow.children('.char').last().addCursor(false); // 前の行の最終文字にカーソルを移動
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
		const $rowOfDelChar = $delChar.closest('.row');

		backChar($rowOfDelChar); // 次の行から１文字持ってくる
		$delChar.remove();

		if ($rowOfDelChar.children('.char').first().hasClass('EOL') && ($rowOfDelChar.prev())[0]) {
			// 文字を削除後、削除文字のあった行が空行で、かつその前の行が存在する = 複数段落の最終行が１文字しかなく、その文字を削除した場合空となるので、削除文字のあった行を削除し、その前の行の最後にカーソルを移動する
			// 先にカーソルの調整($rowOfDelChar削除前にカーソル位置取得)
			$rowOfDelChar.prev().children('.char').last().addCursor(false);
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
		const $newParagraph = $('<div>').addClass('paragraph');
		const $baseParagraph = $row.closest('.paragraph');
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
		const $preRow = $baseParagraph.children('.row').last(); // baseparagraphの最終行をあらかじめ保持しておく
		let $mvRow = $anotherParagraph.children('.row').first();

		while ($mvRow[0]) {
			// $anotherparagraphの行を$baseparagraphに移動
			$mvRow.remove();
			$baseParagraph.append($mvRow);
			$mvRow = $anotherParagraph.children('.row').first();
		}
		$anotherParagraph.remove();

		// baseParagraphのもともとの最終行の文字数が規定数になるよう、その次の行から文字を持ってきて埋める
		const cnt = getStringLenOfRow() - ($preRow.children('.char').length -1); // lengthではEOLも含まれるので-1
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

		let $nextRow = $row.nextAll('.row').first();

		if (!($nextRow[0])) {
			// 次の行がなければ新しく作る
			$nextRow = $(createRowHtml(''));
			$row.after($nextRow);
			reDisplay();
		}

		const $prevChar = $row.children('.char').eq(strLen -1); //移動しない文字の最後
		const $insertPosChar = $nextRow.children('.char').first(); //挿入先の最初の文字
		let $moveChar = $prevChar.nextAll('.char').first(); // 移動文字
		while ($moveChar[0] && !($moveChar.hasClass('EOL'))) { // EOLは移動しない
			$moveChar.remove();
			$insertPosChar.before($moveChar);
			$moveChar = $prevChar.nextAll('.char').first();
		}

		// 移動先の行がstrlen文字を超えている時のために再帰
		cordinateStringNumber($nextRow,strLen);

		// cursorが調整行の最後にあれば動いてくれないので、強制的に動かす
		if ($prevChar.nextAll('.char').first().hasClass('cursor')) {
			$insertPosChar.addCursor();
			gCursor.repositionCharNum();
		}
		gCursor.addCursorRow();
	}

	// $bringRowの次の行の最初の文字を、$bringRowの最後に移動する
	function backChar($bringRow) {
		'use strict';
		const $nextRow = $bringRow.nextAll('.row').first();

		if (!($nextRow[0])) return;

		const $backChar = $nextRow.children('.char').first();

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
		const $dots = $('#sentence_container .char.vertical-dot').add('#sentence_container .char.vertical-after-bracket');

		if ($dots[0]) {
			let $self;
			let $selfRow;
			let $prevRow;
			$dots.each(function () {
				$self = $(this);

				if (!($self.prev()[0])) {
					// 行頭
					$selfRow = $self.closest('.row');
					$prevRow = $selfRow.prev('.row');	
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
		$('#sentence_container').children('.paragraph').has('.cursor-row').removeClassByRegExp(/decolation-textalign-\S+/).addClass('decolation-textalign-'+ align);
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

		for (let eChar of eSelectChars) {
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
		for (let i = 0,cnt = selection.rangeCount; i < cnt; i++) {
			const selRange = selection.getRangeAt(i);
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
		const $rows = $('#sentence_container > .paragraph > .row');
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
			$row = $row.nextObj('#sentence_container .row');
		}
		return cnt;
	}

	// 文書内での現在行
	function getCurrentRowPos() {
		'use strict';
		const rowNum = $('.paragraph > .row').index($('.cursor').closest('.row')) +1;
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
			$row = $row.prevObj('#sentence_container .row');
		}
		return cnt;
	}

	// 現在文字位置
	function getCurrentStringPosOnRow() {
		'use strict';
		const $cursor = $('.cursor');
		const strNum = $('.cursor-row').children('.char').index($cursor);
		return strNum;
	}

	// カーソル行の全文字数
	function getStringLenOfCursorRow() {
		'use strict';
		const strLen = $('.cursor-row > .char').length;
		return strLen - 1; // EOLの分を除く
	}

	// 現在ページ
	function getCurrentPagePos() {
		'use strict';
		// page-breakを持つ行を探して段落をさかのぼり、その段落に複数のpage-breakがあればcursor行またはその段落の最後の行から行を遡ることでpage-breakを探している
		let $currentParagraph = $('.cursor-row').closest('.paragraph');
		let $currentPage;

		while (!($currentPage = $currentParagraph.children('.row.page-break'))[0]) {
			$currentParagraph = $currentParagraph.prev('.paragraph');
		}
		if ($currentPage.length > 1) {

			if (!($currentParagraph.children('.cursor-row'))[0]) {
				const $row = $('.cursor-row');
				while (!($row.hasClass('page-break'))) {
					$row = $row.prev('.row');
					$currentPage = $row;
				}
			} else {
				$currentPage = $currentParagraph.children('.page-break').last();
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
	function setCursorLine() {
		'use strict';
		const $CursorLine = $('#cursor_line');

		for (let i = 0,len = getStringLenOfRow(); i < len; i++) {
			const $numberOfChar = $('<span>').addClass('char-pos');
			$CursorLine.append($numberOfChar);
		}
	}

	// クリック箇所にもっとも近い.charオブジェクトを返す
	function getCharOnRowClick($row,rowEo) {
		'use strict';
		// @param $row .rowクラスのオブジェクトｊ
		// @param rowEo クリックイベントのイベントオブジェクト
		const $chars = $row.children('.char');
		const clickPos = {
			x: rowEo.pageX,
			y: rowEo.pageY
		};

		let $resultObj = $chars.first('.char');
		for (let i = 0,min = Number.MAX_VALUE,$char; ($char = $chars.eq(i))[0]; i++) {
			const distance = $char.computeDistanceP2O(clickPos);
			if (distance < min) {
				min = distance;
				$resultObj = $char;
			}
		}
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
			// $('.char').first().addClass('cursor');
			// $('#cursor_line > .char-pos').first().addClass('cursor-pos-memory');
			// this.addCursorRow();
			// resetDisplayChar();
		},
		addCursorRow : function () {
			'use strict';
			const $oldCursorRow = $('.paragraph > .row.cursor-row');
			if ($oldCursorRow[0]) {
				$oldCursorRow.removeClass('cursor-row');
			}
			$('.cursor').closest('.row').addClass('cursor-row');
		},
		// カーソルを次の文字に移動する
		next : function() {
			'use strict';
			const $prev = $('.cursor');
			let $next = $prev.nextObj('#sentence_container .char');
			if ($next.hasClass('EOL') && $next.closest('.row').next('.row')[0]) { $next = $next.nextObj('#sentence_container .char'); } // 段落途中のEOLにはカーソルを止めない
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
			let $next = $prev.prevObj('#sentence_container .char');
			if ($next.hasClass('EOL') && $next.closest('.row').next('.row')[0]) { $next = $next.prevObj('#sentence_container .char'); } // 段落途中のEOLにはカーソルを止めない
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
			const memoryPos = $('#cursor_line').children('.char-pos').index($('.cursor-pos-memory'));
			let $next = $('#sentence_container .cursor-row').prevObj('#sentence_container .row').children('.char').eq(memoryPos);

			if (!($next[0])) {
				// 右の行の文字数が現在文字より小さい
				$next = $('#sentence_container div.cursor-row').prevObj('#sentence_container .row').children('.char').last();
			}
			if (!($next[0])) { return; }

			if ($next.hasClass('EOL') && $next.closest('.row').next('.row')[0]) { $next = $next.prev('.char'); } // 段落途中のEOLにはカーソルを止めない
			$next.addCursor(false);
		},
		// カーソルを次の行に移動する
		shiftLeft: function () {
			'use strict';
			const $prev = $('.cursor');
			const memoryPos = $('#cursor_line').children('.char-pos').index($('.cursor-pos-memory'));
			let $next = $prev.closest('div.row').nextObj('#sentence_container .row').children('.char').eq(memoryPos);

			if (!($next[0])) {
				$next = $prev.closest('.row').nextObj('#sentence_container .row').children('.char').last();
			}
			if (!($next[0])) { return; }

			if ($next.hasClass('EOL') && $next.closest('.row').next('.row')[0]) { $next = $next.prev('.char'); } // 段落途中のEOLにはカーソルを止めない
			$next.addCursor(false);
		},
		// charNumの位置を再調整
		repositionCharNum: function () {
			'use strict';
			const cursorPos = $('.cursor').closest('.row').children().index($('.cursor'));
			$('.cursor-pos-memory').removeClass('cursor-pos-memory');
			$('#cursor_line > .char-pos').eq(cursorPos).addClass('cursor-pos-memory');
			// cursor-rowの 調整
			this.addCursorRow();
		},
		// 指定行にジャンプする。画面中央に指定行及びカーソルが来るように調整
		jumpForRow: function (rowNum) {
			'use strict';
			const $targetRow = $('#sentence_container .row').eq(rowNum-1);
			if (!$targetRow[0]) { return; }
			// cursor
			$targetRow.children('.char').first().addCursor(true);
			this.repositionCharNum();
		},
		// 指定ページにジャンプする。カーソルは１行目
		jumpForPage: function (pageNum) {
			'use strict';
			const $targetRow = $('#sentence_container .row').eq(firstDispNum);
			if (!$targetRow[0]) { return; }
			// cursor
			$targetRow.children('.char').first().addCursor(false);
			this.repositionCharNum();
			// display
			const firstDispNum = $('#sentence_container .row').index($('#sentence_container .page-break').eq(pageNum-1));
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
		const firstDispNum = $('#sentence_container .row').index($('#sentence_container .row.display').first());
		addDisplayRow(firstDispNum,firstDispNum+getDisplayRowLen()); // 途中行数変化
	}

	// カーソルが移動した時の、表示領域の調整
	function changeDisplayRow(opt_bl) {
		'use strict';
		// opt_bl: trueならカーソルを画面中央に配置する
		console.time('changeDisplayRow()');
		const $cursor = $('#sentence_container .cursor');
		const $cursorRow = $cursor.closest('.row');


		if ($cursorRow.hasClass('display')) {
			console.log('cursorRow has dispaly-row');
			return;
		}

		$cursorRow.addClass('display');
		if ($('.row.display').length <= getDisplayRowLen()) return;
		const $nextRow = $cursorRow.nextObj('#sentence_container .row');
		const $prevRow = $cursorRow.prevObj('#sentence_container .row');
		let first;
		if ($nextRow.hasClass('display')) {
			// カーソルが一行前にはみ出した
			$('.row.display').last().removeClass('display');

		} else if ($prevRow.hasClass('display')) {
			// カーソルが一行後にはみ出した
			$('.row.display').first().removeClass('display');

		} else if (opt_bl) {
			// カーソルが二行以上はみ出し、かつカーソルを中央配置する
			const $rows = $('#sentence_container .row');
			const cursorRowPos = $rows.index($('.cursor-row'));
			first = cursorRowPos - getDisplayRowLen()/2;
			first = first>=0 ? first : 0;
			addDisplayRow(first, (first + getDisplayRowLen()));

		} else {
			// カーソルが二行以上はみ出した
			const currentFirst = $('.row').index($('.row.display').first());
			const cursorIndex = $('.row').index($cursorRow);
			const currentEnd = $('.row').index($('.row.display').last());
			first = 0;

			if (cursorIndex < currentFirst) {
				// カーソルが前にある
				first = cursorIndex;
			} else if (cursorIndex > currentEnd) {
				// カーソルが後ろにある
				first = currentFirst + (cursorIndex - currentEnd);
			} else {
				// displayに囲まれた部分にdisplayでない行がある場合
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
				first = Math.floor(first);
				last = Math.floor(last);
				const eOldDisplayRows = document.querySelectorAll('.row.display');

				while (eOldDisplayRows.length > 0) {
					eOldDisplayRows.item(0).classList.remove('display');
				}

				const eRows = document.getElementById('sentence_container').getElementsByClassName('row');
				const rowLen = eRows.length;
				if (last > rowLen) {
					last = rowLen;
					first = last - getDisplayRowLen();
					if (first < 0) first = 0;
				}

				console.log(getDisplayRowLen());
				for (let i = first; i < last; i++) {
					const eRow = eRows[i];
					eRow.classList.add('display');
				}
				console.timeEnd('addDisplayRow()');
				}

	// ----------------------------------------- display char ------------------------------------

	// カーソルが表示文字外にはみ出た時、表示位置を再計算して表示する
	function changeDisplayChar() {
		'use strict';
		console.time('changeDisplayChar()');
		const eCursor = document.getElementById('sentence_container').getElementsByClassName('cursor')[0];
		if (eCursor.classList.contains('display')) {
			console.log('cursor has display');
			return;
		}
		if (eCursor.classList.contains('EOL') && eCursor.previousElementSibling) { eCursor = eCursor.previousElementSibling; }

		const eCursorRow = eCursor.parentNode;
		const eChars = eCursorRow.children;
		const eDispChars = eCursorRow.querySelectorAll('.char.display');
		const currentFirst = index(eDispChars[0],eChars);
		const cursorIndex = index(eCursor,eChars);
		const currentEnd = index(eDispChars[eDispChars.length-2] ? eDispChars[eDispChars.length-2] : eDispChars[eDispChars.length-1],eChars); // EOLは常にdisplayなので、EOL以外のcharがある行ではEOLの前のcharを最後のdisplayとしてindexを見る
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
			// displayに囲まれた部分にdisplayでない文字があり、かつその文字にカーソルがあたっている
			// あるいはdisplayが一つもない(currentFirst == -1 && currentEnd == -1)
			// resetDisplayChar();
			// changeDisplayChar();
			console.log('cursor is etc');
			return;
		}

		addDisplayChar(first);
		console.timeEnd('changeDisplayChar()');
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
		const eChars = document.getElementsByClassName('char');

		for (let i = 0,eChar; eChar = eChars[i]; i++) {
			if (!eChar.classList.contains('display')) { eChar.classList.add('display'); }
		}
	}
	// 画面に表示されているrowのfirst文字以降にdisplayを付与して表示する
	function addDisplayChar(first) {
		'use strict';
		console.log('char first:'+ first);
		const eDisplayRows = document.querySelectorAll('#sentence_container .row.display');
		let addArr = [];
		let removeArr = [];

		for (let i = 0,eDispRow; eDispRow = eDisplayRows[i];i++) {
			const result = dispCharOfRow(first,eDispRow);
			addArr = addArr.concat(result.add);
			removeArr = removeArr.concat(result.remove);
		}
		for (let elem of addArr) {
			elem.classList.add('display');
		}
		for (let elem of removeArr) {
			elem.classList.remove('display');
		}
	}

	// rowのfirst文字目以降の各文字をrowの高さに収まるだけdisplaycharクラスを付与するとして、row内のcharすべてについてクラスを付与する要素と除去する要素の配列をオブジェクトで返す
	function dispCharOfRow(first,row) {
		'use strict';
		// この関数内でクラスを直接いじってしまうと、複数行に対して実行した場合にその都度描画計算が起こってしまい時間がかかるため、いったんインデックスのみを調査して関数外で一気にクラスの変更を行う形にしている
		console.time('dispCharOfRow()');

		const eRow = row.nodeName && row.nodeType===1 ? row : row[0];
		const eChars = eRow.children;
		const addArr = [];
		const removeArr = [];
		// first文字以前の文字でdisplayを持つ文字があれば除去リストに加える
		for (let i = 0; i < first; i++) {
			const eChar = eChars[i];
			if (!eChar) { return {
				add: addArr,
				remove: removeArr
			}; } // 行内文字数がfirst文字ない場合はEOL以外のdisplayをすべて外して終わり
			if (eChar.classList.contains('display') && !eChar.classList.contains('EOL')) {
				removeArr.push(eChar);
			}
		}

		// first文字以降の文字でrowの高さに収まる文字のうち、displayを持たない文字を追加リストに加える
		// また、rowに収まらない文字でdisplayを持つ文字があれば除去リストに加える
		// EOLは常にdisplayを持つようにする(そうしなければ、空行で一つもdisplayがない状態となり表示要素が一切なくなってしまうので、heightがautoであるrowは潰れた状態になってしまう)
		const dispHeight = parseInt((eRow.currentStyle || document.defaultView.getComputedStyle(eRow,null)).width);
		let fontHeight = 0;
		let htcnt = 0;
		for (let i = first,eChar; eChar = eChars[i]; i++) {
			if (eChar.classList.contains('EOL')) {
				continue;
			}
			fontHeight = eChar.dataset.fontSize === 'auto' ? 18 : parseInt(eChar.dataset.fontSize)+2;
			htcnt += fontHeight;
			if (htcnt < dispHeight) {
				if (!(eChar.classList.contains('display'))) {
					addArr.push(eChar);
				}
			} else {
				if (eChar.classList.contains('display')) {
					removeArr.push(eChar);
				}
			}
		}

		console.timeEnd('dispCharOfRow()');
		return {
			add: addArr,
			remove: removeArr
		};
	}
	$('body').on('click','.char',function (e) {
		'use strict';
		console.log('char:' + $(this).css('height'));
	});
	$('body').on('click','.row',function (e) {
		'use strict';
		console.log('row:' + $(this).css('height'));
	});

	// 表示する行数
	function getDisplayRowLen() {
		'use strict';
		const dispWidth = parseInt($('#sentence_container').css('height'));
		const rowBorderWidth = 2;
		let rowWidth = parseInt($('.paragraph > .row').css('height'));
		console.log('tategaki rowWidgh:'+ rowWidth + ','+ $('.paragraph > .row').hasClass('display'));
		if (dispWidth <= 0) { return 0; }
		rowWidth += rowBorderWidth;
		const dispLen = Math.floor(dispWidth / rowWidth);
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
		const $character = $inputBuffer.children('.char').first();
		// borderは上下合わせて２つある
		const height = $character.outerHeight() * ($inputBuffer.children('.char').length-1) + 5;

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
		$('#sentence_container > .paragraph > .row.page-break').removeClass('page-break');
		$('#sentence_container > .paragraph > .row.page-last-row').removeClass('page-last-row');

		const pageNum = getRowLenOnPage();
		const $rows = $('#sentence_container > .paragraph > .row');
		for (let i = 1,$row; ($row = $rows.eq(pageNum*i-1))[0]; i++) {
			$row.addClass('page-last-row');
		}
		$rows.last().addClass('page-last-row');
		for (let i = 0,$row; ($row = $rows.eq(pageNum*i))[0]; i++) {
			$row.addClass('page-break');
		}
	}

	// =====================================================================
	// 	選択操作(label:select)
	// =====================================================================

	// 選択範囲のcharを配列に入れて返す
	// bl: 実行後選択を解除するならtrue
	function findSelect$obj(bl) {
		'use strict';
		const retObjArray = [];
		const selection = getSelection();

		if (selection.rangeCount === 1) {
			// 選択範囲が一箇所の場合
			const selRange = selection.getRangeAt(0); // 選択範囲のRange

			const $chars = $('#sentence_container .row.display .char').not('.EOL');
			const charRange = document.createRange();
			for (let i = 0,$char; ($char = $chars.eq(i))[0] ; i++) {
				// そのcharacterが選択範囲内にある場合に配列に入れている
				// 現在の要素を囲む範囲をcharRangeとして設定(jqueryオブジェクトからDOM要素を取得し、引数に渡している)。selectNodeContentsをselectNodeにする、あるいは引数をテキストノードではなくspan要素にすると、選択中最初と最終文字が反応しないことがある
				charRange.selectNodeContents($char[0].childNodes.item(0));
				// 開始位置が同じかselectの開始位置より文字の開始位置が後ろにあり、
				// 終了位置が同じかselectの終了位置より文字の終了位置が前にある
				if ((charRange.compareBoundaryPoints(Range.START_TO_START,selRange) >= 0
							&& charRange.compareBoundaryPoints(Range.END_TO_END,selRange) <= 0)) {
					retObjArray.push($char);
				}
			}

			selRange.detach();
		}

		charRange.detach();
		if (bl) selection.removeAllRanges(); // 選択を解除する

		return retObjArray;
	}

	// 選択範囲のcharを配列に入れて返す
	// bl: 実行後選択を解除するならtrue
	function findSelectElem(bl) {
		'use strict';
		const retObjArray = [];
		const selection = getSelection();

		if (selection.rangeCount === 1) {
			// 選択範囲が一箇所の場合
			const selRange = selection.getRangeAt(0); // 選択範囲のRange

			// 選択範囲内にあるcharacterを配列に入れる
			const eChars = document.querySelectorAll('#sentence_container .row.display .char');
			const charRange = document.createRange();
			for (let i = 0,eChar; eChar = eChars[i] ; i++) {
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

		for (let eChar of eSelChars) {
			const rmClass = eChar.className.match(regexp);
			eChar.classList.add(strClass);
			if (rmClass) { eChar.classList.remove(rmClass[0]); }
		}

	}

	function removeClassOnSelect(kind) {
		'use strict';
		const eSelChars = findSelectElem(true);
		const regexp = new RegExp(kind +'-\\S+');

		for (let eChar of eSelChars) {
			const rmClass = eChar.className.match(regexp);
			if (rmClass) { eChar.classList.remove(rmClass[0]); }
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

	function comReadFile(fileId) {
		'use strict';
		$('#sentence_container > .paragraph').remove();

		$.ajax({
			type : 'POST',
			url : '/tategaki/ReadFile',
			data : {
				user_id: getUserId(),
				file_id: fileId
			},
			context : {
				id : fileId
			},
			dataType : 'json',
		}).done(function (data) {
				// 表示データを受け取ってからの処理
				// ファイル名を表示
				$('#file_title').val(data.filename).attr('data-file-id',this.id);
				// 文章のhtml書き出し
				printString(data.literaArray);
				// 禁則処理
				checkKinsoku();
				// 最初の４０行のみ表示する
				// addDisplayRow(0,getDisplayRowLen());
				// gCursor.init();
				// resetDisplayChar();
				$('.doc-info > .saved').text(data.saved);

				addPageBreak();
				printDocInfo();
		}).fail(function (XMLHttpRequest, textStatus, errorThrown) {
				alert('Error:'+ textStatus + ':\n' + errorThrown + ':status=' + XMLHttpRequest.status + 'in comReadFile');
		});

	}

	function comReadJsonFile(fileId) {
		'use strict';
		// console.log('comReadJsonFile("'+ fileId +'")');
		// console.time('comReadJsonFile()');
		const userId = getUserId();
		window.container.readFile({
			user_id: userId,
			file_id: fileId
		});
		// userAlert('読込中');
		// console.log('comReadJsonFile userId:"'+ userId);
		// $('#sentence_container').empty();
		// console.time('ReadJsonFile communication');
		//
		// $.ajax({
		// 	type : 'POST',
		// 	url : '/tategaki/ReadJsonFile',
		// 	data : {
		// 		user_id: userId,
		// 		file_id: fileId
		// 	},
		// 	context : {
		// 		id : fileId
		// 	},
		// 	dataType : 'json'
		// }).done(function (data) {
		// 	console.timeEnd('ReadJsonFile communication');
		// 	// 表示データを受け取ってからの処理
		// 	// ファイル名を表示
		// 	$('#file_title').val(data.filename).attr('data-file-id',this.id);
		// 	// 文章のhtml書き出し
		// 	const text = data.data.text;
		// 	console.time('append string');
		// 	// appendParagraphFromObj(text);
		// 	window.sentence = new window.SentenceContainer(this.id,text);
		// 	console.timeEnd('append string');
		// 	console.log(window.sentence);
		// 	console.time('addDisplayRow');
		// 	addDisplayRow(0,getDisplayRowLen());
		// 	console.timeEnd('addDisplayRow');
		// 	console.time('cursor init');
		// 	gCursor.init();
		// 	console.timeEnd('cursor init');
		// 	// console.time('resetDisplayChar');
		// 	// resetDisplayChar();
		// 	// console.timeEnd('resetDisplayChar');
		// 	$('.doc-info > .saved').text(data.saved);
		//
		// 	addPageBreak();
		// 	printDocInfo();
		// 	console.timeEnd('comReadJsonFile()');
		// 	userAlert('読み込み完了');
		// }).fail(function (XMLHttpRequest, textStatus, errorThrown) {
		// 	alert('Error:'+ textStatus + ':\n' + errorThrown + ':status=' + XMLHttpRequest.status + 'in comReadJsonFile');
		// });
	}

	function comSaveFile() {
		'use strict';
		const userId = getUserId();
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

		const fileId = $fileTitle.attr('data-file-id');

		if (fileId === '-1') {
			comSaveAs(filename);
			return;
		}

		// 段落ごとに配列に格納
		const $paragraphs = $('#sentence_container > .paragraph');
		const contentsArray = [];
		for (let i = 0,$paragraph; ($paragraph = $paragraphs.eq(i))[0]; i++) {
			contentsArray.push($paragraph.text());
		}
		const contentsJson = JSON.stringify(contentsArray);
		const nowDate_ms = Date.now() + '';

		$.ajax({
			type : 'POST',
			url : '/tategaki/WriteFile',
			data : {
				user_id : userId,
				file_id: fileId,
				filename: filename,
				json: contentsJson,
				saved: nowDate_ms
			},
			context : {
				userId : userId,
				fileId: fileId
			},
			dataType : 'json',
		}).done(function (data) {
			// 表示データを受け取ってからの処理
			console.log(data.result);
			$('.saved').text(data.strDate);
			// comFileList(this.userId);
			container.fileList().read(this.userId);
			console.log('保存しました:fileId=' + this.fileId);
		}).fail(function (XMLHttpRequest, textStatus, errorThrown) {
			alert('Error:'+ textStatus + ':\n' + errorThrown + ':status=' + XMLHttpRequest.status + 'in comSaveFile');
		});
	}

	function comSaveJsonFile() {
		'use strict';
		const userId = getUserId();
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

		const fileId = $fileTitle.attr('data-file-id');
		if (fileId === '-1') {
			comSaveAs(filename);
			return;
		}
		const contentsJson = makeJsonDataForSave();
		const nowDate_ms = Date.now() + '';

		console.log('user_id:'+ userId);
		console.log('file_id:'+ fileId);
		console.log('filename:'+ filename);
		console.log('json:'+ contentsJson);
		console.log('saved:'+ nowDate_ms);

		$.ajax({
			type : 'POST',
			url : '/tategaki/WriteJsonFile',
			data : {
				user_id : userId,
				file_id: fileId,
				filename: filename,
				json: contentsJson,
				saved: nowDate_ms
			},
			context : {
				userId : userId,
				fileId: fileId
			},
			dataType : 'json'
		}).done(function (data) {
			// 表示データを受け取ってからの処理
			console.log(data.result);
			$('.saved').text(data.strDate);
			// comFileList(this.userId);
			container.fileList().read(this.userId);
			console.log('保存しました:fileId=' + this.fileId);
			userAlert('保存しました');
		}).fail(function (XMLHttpRequest, textStatus, errorThrown) {
			alert('Error:'+ textStatus + ':\n' + errorThrown + ':status=' + XMLHttpRequest.status + 'in comSaveJsonFile');
		});
	}

	function comFileList(userId) {
		'use strict';
		$.ajax({
			type : 'POST',
			url : '/tategaki/FileListMaker',
			data : {
				user_id: userId
			},
			dataType : 'json',
		}).done(function (data) {
			// 表示データを受け取ってからの処理
			setFileListFromObject(data);
		}).fail(function (XMLHttpRequest, textStatus, errorThrown) {
			alert('Error:'+ textStatus + ':\n' + errorThrown + ':status=' + XMLHttpRequest.status + ' in comFileList');
		});
	}

	function setFileListFromObject(data,opt_eParentUl) {
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
		 * fileId:filename
		 */

		const eParentUl = opt_eParentUl || document.createDocumentFragment();
		if (opt_eParentUl) {
			empty(eParentUl);
		}

		for (let fileId in data) {
			const filename = data[fileId]; // filenameは、対象fileIdのファイル名か、ディレクトリならば再帰的にオブジェクトが入っている

			if (typeof filename === 'string' && fileId !==  'directoryname') {
				// file
				eParentUl.appendChild(createFileElement(fileId,filename));
			} else if (typeof filename === 'object') {
				// dir
				const dirId = fileId;
				const innerData = filename;
				const eDir = createDirectoryElement(dirId, innerData); // createDirectoryElement()内にあるcreateDirCollapseElement()の中でさらにsetFileListFromObject()を使用している
				eParentUl.appendChild(eDir);
			}

		}

		// eParentUl == documentFlagmentの時だけ、file_list内を入れ替える
		if (!opt_eParentUl) {
			const eFileList = document.getElementById('file_list');
			empty(eFileList);
			eFileList.appendChild(eParentUl);
		}
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
			// comFileList(getUserId());
			container.fileList().read(getUserId());

		} else if (searchWord.length === 0) {
			// comFileList(getUserId());
			container.fileList().read(getUserId());
		} else {
			comSearchFile(searchWord);
		}

	}

	// searchWordをファイル名に含むファイルのみをmodalに表示する
	function comSearchFile(searchWord) {
		'use strict';
		const userId = getUserId();

		$.ajax({
			type : 'POST',
			url : '/tategaki/FileListMaker',
			data : {
				user_id: userId
			},
			context: {
				userId: userId,
				search_word : searchWord
			},
			dataType : 'json',
		}).done(function (data) {
			// 表示データを受け取ってからの処理
			setFileListFromObject(data); // filterFileNameMatchは現在のファイルリストから探すため、先に全ファイルをリストに入れておく必要がある
			const $matchFilesArray = filterFileNameMatch(this.search_word);
			setFileListFromArray($matchFilesArray);
		}).fail(function (XMLHttpRequest, textStatus, errorThrown) {
			alert('Error:'+ textStatus + ':\n' + errorThrown + ':status=' + XMLHttpRequest.status + ' in comSearchFile');
		});
	}

	function setFileListFromArray($array) {
		'use strict';
		const $fileList = $('#file_list');

		$fileList.empty();

		if ($array.length > 0) {

			for (let $obj of $array) {
				if ($obj.attr('data-type') === 'file') {
					const fileId = $obj.attr('data-file-id');
					const filename = $obj.attr('data-file-name');
					const $file = $(createFileElement(fileId, filename));
					$fileList.append($file);
				} else {
					const directoryId = $obj.attr('data-directory-id');
					const directoryname = $obj.attr('data-directory-name');
					const $directory = $('<a>')
						.addClass('directory')
						.attr('data-type','directory')
						.attr('data-directory-id',directoryId)
						.attr('data-directory-name',directoryname)
						.html('<span class="glyphicon glyphicon-folder-close" aria-hidden="true"></span>'+ directoryname); // icon
					$fileList.append($('<li>').append($directory));
				}
			}

		} else {
			$fileList.append($('<li>').text('該当するファイルは見つかりませんでした。'));
		}

	}

	// 開くボタンを押した時
	function readyFileModal() {
		'use strict';
		// comFileList(getUserId());
		container.fileList().read(getUserId());
		$('#search_file').val('').focus();
	}

	// ファイル検索
	function filterFileNameMatch(str) {
		'use strict';
		const regexp = new RegExp('^'+ str +'.*');
		const $array = []; // マッチしたjqueryオブジェクトを入れる配列

		const $files = $('.file');
		for (let i = 0,$file; ($file = $files.eq(i))[0]; i++) {
			const filename = $file.attr('data-file-name');
			console.log(filename);
			if (regexp.test(filename)) {
				$array.push($file);
			}
		}
		const $directories = $('.directory');
		for (let i = 0,$directory; ($directory = $directories.eq(i))[0]; i++) {
			const directoryname = $directory.attr('data-directory-name');
			if (regexp.test(directoryname)) {
				$array.push($directory);
			}
		}

		return $array;
	}

	function defaultNewFile() {
		'use strict';
		newFile('newfile');
	}

	function newFile(filename) {
		'use strict';
		$('#sentence_container').empty();

		// appendParagraph('');
		container.newFile(filename);
		console.log(window.container);
		// $('.row').addClass('display').children('.char').first().addClass('cursor');
		$('#file_title').val(filename).attr('data-file-id','-1');
		// addPageBreak();
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

		const userId = getUserId();
		const nowDate_ms = Date.now() + '';
		console.log('userId:'+ userId);
		console.log('nowDate_ms:'+ nowDate_ms);
		$.ajax({
			type : 'POST',
			url : '/tategaki/FileMaker',
			data : {
				filename: filename,
				user_id: userId,
				saved: nowDate_ms
			},
			context : {
				userId: userId
			},
			dataType : 'json'
		}).done(function (data) {
			// 表示データを受け取ってからの処理
			$('#file_title').val(data.filename).attr('data-file-id',data.newFileId);
			comSaveJsonFile();
		}).fail(function (XMLHttpRequest, textStatus, errorThrown) {
			alert('Error:'+ textStatus + ':\n' + errorThrown + ':status=' + XMLHttpRequest.status + 'in comSaveAs');
		});
	}

	function defaultDeleteFile() {
		'use strict';
		const fileId = $('#file_title').attr('data-file-id');
		if (fileId === '-1') {
			userAlert('保存していないファイルです。');
			return;
		}
		comDeleteFile(fileId);
	}

	function comDeleteFile(fileId) {
		'use strict';
		const userId = getUserId();
		if (!window.confirm('本当に削除しますか:'+ getFileNameFromFileId(fileId) + '('+ fileId +')')) { return; }

		$.ajax({
			type : 'POST',
			url : '/tategaki/DeleteFile',
			data : {
				user_id: userId,
				file_id : fileId
			},
			context : {
				fileId : fileId
			},
			dataType : 'json'
		}).done(function (data) {
			const successRecord = data.successRecord; // 処理行数の文字列
			const result = data.result; // true or false の文字列
			if (successRecord === '1' && result) {
				// 別ファイルに移動
				const $files = $('#file_list .file');
				for (let i = 0,$file; ($file = $files.eq(i))[0]; i++) {
					if ($file.attr('data-file-id') != this.fileId) {
						comReadJsonFile($file.attr('data-file-id'));
						break;
					}
				}
				// comFileList(getUserId());
				container.fileList().read(getUserId());
			} else {
				alert('ファイル削除エラーです(ファイル番号：'+ this.fileId + ')');
			}
			}).fail(function (XMLHttpRequest, textStatus, errorThrown) {
					alert('Error:' + textStatus + ':\n' + errorThrown + ':status=' + XMLHttpRequest.status + 'in comDeleteFile ');
				});
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

				function getFileNameFromFileId(fileId) {
					'use strict';
					return $('#file_list .file[data-file-id="'+ fileId +'"]').attr('data-file-name');
				}

				function comDeleteFileFromFileName(filename) {
					'use strict';
					console.log('comDeleteFileFromFileName()');
					const $file = getFileObjectFromFileName(filename);
					if (!$file[0]) { return; }

					let fileId;
					if ($file.size() === 1) {
						fileId = $file.attr('data-file-id');
						comDeleteFile(fileId);
					} else if ($file.size() > 1) {
						// 該当ファイルが複数

						if (window.confirm('同一名のファイルが複数存在します。\nすべてのファイルを削除しますか。\nこのうちのどれかのファイルを削除する場合はキャンセルし、個別に削除してください。')) {
							$file.each(function () {
								fileId = $(this).attr('data-file-id');
								comDeleteFile(fileId);
							});

						} else {
							console.log('[複数ファイル]削除できませんでした。:' + filename);
						}

					}
				}

				function comMoveFile(filename,newParentDirname) {
					'use strict';
					const userId = getUserId();
					// コマンドからの実行の場合、フィルターがかかってfile-list内が一つだけになってしまっているので、
					// いったん全ファイルを取得してからでないと$fileと$newParentDirが見つからない
					$.ajax({
						type : 'POST',
						url : '/tategaki/FileListMaker',
						data : {
							user_id: userId
						},
						dataType : 'json'
					}).done(function (data) {
						// 表示データを受け取ってからの処理
						setFileListFromObject(data);
						const $file = $('.file[data-file-name="'+ filename +'"],.directory[data-directory-name="'+ filename +'"]');
						const $newParentDir = $('.directory[data-directory-name="'+ newParentDirname +'"]');
						let fileId;
						let newParentDirId;
						if ($file[0] && $newParentDir[0]) {
							fileId = $file.attr('data-type')==='file' ? $file.attr('data-file-id') : $file.attr('data-directory-id');
							newParentDirId = $newParentDir.attr('data-directory-id');
							comMvFileToDirectory(fileId,newParentDirId);
						}
					}).fail(function (XMLHttpRequest, textStatus, errorThrown) {
						alert('Error:'+ textStatus + ':\n' + errorThrown + ':status=' + XMLHttpRequest.status + ' in comFileList');
					});
				}

				function comMvFileToDirectory(fileId,newParentDirId) {
					'use strict';
					// ディレクトリをディレクトリに入れるのも可
					console.log('comMvFileToDirectory:file['+ fileId +'],newParentDir['+ newParentDirId +']');
					const userId = getUserId();

					$.ajax({
						type : 'POST',
						url : '/tategaki/MoveFile',
						data : {
							user_id: userId,
							file_id: fileId,
							directory_id: newParentDirId
						},
						dataType : 'json',
						context: {
							userId: userId
						}
					}).done(function (json) {
						// 表示データを受け取ってからの処理
						// comFileList(this.userId);
						container.fileList().read(this.userId);
					}).fail(function (XMLHttpRequest, textStatus, errorThrown) {
						alert('Error:'+ textStatus + ':\n' + errorThrown + ':status=' + XMLHttpRequest.status + 'in comMvFileToDirectory');
					});
				}

				function comMakeDirectory(directoryname) {
					'use strict';
					console.log('make directory:'+ directoryname);
					const userId = getUserId();
					const nowDate_ms = Date.now() + '';
					console.log('user-id:'+ userId);
					console.log('nowDate_ms:'+ nowDate_ms);

					$.ajax({
						type : 'POST',
						url : '/tategaki/DirectoryMaker',
						data : {
							user_id: userId,
							directoryname: directoryname,
							saved: nowDate_ms
						},
						dataType : 'json',
						context: {
							userId: userId
						}
					}).done(function (json) {
						// 表示データを受け取ってからの処理
						// comFileList(this.userId);
						container.fileList().read(this.userId);
					}).fail(function (XMLHttpRequest, textStatus, errorThrown) {
						alert('Error:'+ textStatus + ':\n' + errorThrown + ':status=' + XMLHttpRequest.status + 'in comMakeDirectory');
					});
				}

				function comDeleteDirectory(directoryId,option) {
					'use strict';
					// ディレクトリ内にファイルがあるとき、強制的に中のファイルごと削除するときのみoptionはtrue
					const userId = getUserId();

					$.ajax({
						type : 'POST',
						url : '/tategaki/DeleteDirectory',
						data : {
							directory_id: directoryId,
							option: option
						},
						dataType : 'json',
						context: {
							userId: userId
						}
					}).done(function (json) {
						// 表示データを受け取ってからの処理
						// comFileList(this.userId);
						container.fileList().read(this.userId);
						if (json.result === 'within') {
							userAlert('ディレクトリが空ではないので削除できませんでした。');
						}
					}).fail(function (XMLHttpRequest, textStatus, errorThrown) {
						alert('Error:'+ textStatus + ':\n' + errorThrown + ':status=' + XMLHttpRequest.status + 'in comDeleteDirectory');
					});
				}

				function comDeleteDirectoryFromName(directoryname,option) {
					'use strict';
					const $dir = $('.directory[data-directory-name="'+ directoryname +'"]');
					if (!$dir[0]) { return; }
					let dirId;

					if ($dir.size() === 1) {
						dirId = $dir.attr('data-directory-id');
						comDeleteDirectory(dirId,option);
					} else if ($dir.size() > 1) {

						if (window.confirm('同一名のディレクトリが複数存在します。\nすべてのディレクトリを削除しますか。')) {
							$dir.each(function () {
								dirId = $(this).attr('data-directory-id');
								comDeleteFile(dirId,option);
							});
						} else {
							console.log('[複数ディレクトリ]削除できませんでした。:' + directoryname);
						}

					}
				}

				function getCurrentFileId() {
					'use strict';
					const fileId = $('#file_title').attr('data-file-id');
					return fileId;
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
					addId:function (id) {
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
						for (let className of classArr) {
							this.removeClass(className);
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
						console.log('addCursor');
						if (!this.hasClass('char')) return this;

						const $prevCursor = $('.cursor');
						const $prevChar = this.prev('.char');

						$prevCursor.removeClass('cursor');
						console.log('after prevcursor add class');
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

						// changeDisplayRow(opt_bl);
						// changeDisplayChar();
						// printDocInfo();
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

				// 要素内を空にする
				function empty(elem) {
					'use strict';
					while (elem.childNodes.length > 0) {
						elem.removeChild(elem.firstChild);
					}
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

				function getUserId() {
					'use strict';
					const userId = $('#site_title').attr('data-user-id');
					return userId;
				}

				// ====================================================
				// 	initialize(label:init)
				// ====================================================

				setCursorLine();
				defaultNewFile();
				// comFileList(globalUserId);
				container.fileList().read(globalUserId);
				// Event
				document.addEventListener('keydown',keydownOnDoc ,false);
				addFocusEvent('file_title');
				$('body').on('keyup','#search_file',keyupInSearchFileInput);
				$('body').on('click','#file_list .file',function (e) {
					'use strict';
					const fileId = $(this).attr('data-file-id');
					// comReadJsonFile(fileId);
					container.readFile({
						user_id: getUserId(),
						file_id: fileId
					});
					$('#file_list_modal').modal('hide');
				});
				$('body').on('click','.paragraph > .row',moveCursorToClickPos);
				$('body').on('mousewheel','#sentence_container',wheelEvent);
				document.getElementById('menu_new').addEventListener('click',function (e) { defaultNewFile(); },false);
				document.getElementById('menu_save').addEventListener('click',function (e) { comSaveJsonFile(); },false);
				document.getElementById('menu_delete').addEventListener('click',function (e) { defaultDeleteFile(); },false);
				document.getElementById('modal_fileopen_link').addEventListener('click',function (e) { readyFileModal(); },false);
				document.getElementById('test').addEventListener('click',function (e) {
					'use strict';
					// addDisplayRow(0,getDisplayRowLen());
					gCursor.init();
					addPageBreak();
					// printDocInfo(); // page-breakなどがなければフリーズする(計算に無限ループ？)
				},false);
				$(window).resize(function () {
					'use strict';
					// resetDisplayChar();
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
						for (let eChar of eSelChars) {
							eChar.classList.add('decolation-font-bold');
						}
					} else {
						// ボタンをクリックした結果、解除された
						for (let eChar of eSelChars) {
							eChar.classList.remove('decolation-font-bold');
						}
					}
				},false);
				document.getElementById('btn-italic').addEventListener('click',function(e) {
					'use strict';
					const eBtn = document.getElementById('btn-italic');
					const eSelChars = findSelectElem(true);

					eBtn.classList.toggle('active');
					if (/active/.test(eBtn.className)) {
						for (let eChar of eSelChars) {
							eChar.classList.add('decolation-font-italic');
						}
					} else {
						for (let eChar of eSelChars) {
							eChar[i].classList.remove('decolation-font-italic');
						}
					}
				},false);
				// selection
				// 選択範囲に文字装飾が施されていればアクティブに
				document.getElementById('sentence_container').addEventListener('mouseup',function(e) {
					'use strict';
					const eSelChars = findSelectElem();
					let bBold = false;
					let bItalic = false;

					for (let eChar of eSelChars) {
						if (eChar.classList.contains('decolation-font-bold')) { bBold = true; }
						if (eChar.classList.contains('decolation-font-italic')) { bItalic = true; }
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
						$(eSelChars[eSelChars.length -1]).nextObj('#sentence_container .char').addCursor();
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

