console.log("tategaki.js");
(function(){
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
				console.log("communication success!");
				// Google日本語入力のwebAPIから、json形式で変換候補が渡される
				// json[0][0]; // ひらがな
				// json[0][1][0]; // 変換候補１つ目
				console.log('初変換:');
				var $input_buffer = $('.input_buffer');
				var $characters = $input_buffer.children('.vertical_character');
				var $convertView = $('.convertView');
				var count = 0;
				for (var i = 0; i < json.length; i++) {
					var hiragana = json[i][0];
					var hiraLen = hiragana.length;
					// 文節番号をつける(同じ文節には同じ番号)
					for (var j = count; j < (count + hiraLen); j++) {
						$characters.eq(j).attr('data-phrase_num',i);
					}
					count += hiraLen;
					insertPhraseToInputBuffer(i,json[i][1][0]); // 第一候補の漢字でinput_bufferの文字列を置き換える
					// 変換候補表示
					// convertviewを文節分作成する
					var $convertView = createConvertView(i,json[i]);
					$('#vertical_draft').before($convertView);
				}
				var $convertViews = $('.convertView');
				$('.convertView:eq(0)').attr('data-alternativeList','select');
				$('.convertView[data-alternativeList="select"] > .vertical_row:first-of-type').addClass('alternative_focus');
				repositionConvertView();

				// 現在選択中の文節にselectphraseクラスを設定する
				var phraseNum = $('.alternative_focus').siblings('.phrase_num').text(); // 現在選択中の文節番号
				$('.input_buffer > .vertical_character[data-phrase_num='+ phraseNum + ']').addClass('selectPhrase');
				// 最後にinput_bufferの高さ調整
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
				console.log("communication success!");
				// Google日本語入力のwebAPIから、json形式で変換候補が渡される
				// json[0][0]; // ひらがな
				// json[0][1][0]; // 変換候補１つ目
				console.log('文節総数に変化なし:');
				var fphrase_num = this.$first.children('.phrase_num').text();
				var sphrase_num = this.$second.children('.phrase_num').text();
				var $newFirstConvertView = createConvertView(fphrase_num,json[0]).attr('data-alternativeList','select');
				var $newSecondConvertView = createConvertView(sphrase_num,json[1]);
				this.$first.before($newFirstConvertView);
				this.$second.before($newSecondConvertView);

				// 第一候補の文字でinput_bufferの該当文字を置き換える
				insertPhraseToInputBuffer(fphrase_num,getStringFromRow($newFirstConvertView.children('.vertical_row:first-of-type').addClass('alternative_focus')));
				insertPhraseToInputBuffer(sphrase_num,getStringFromRow($newSecondConvertView.children('.vertical_row:first-of-type')));

				// selectphraseクラスの付け替え
				$('.input_buffer > .vertical_character[data-phrase_num='+ fphrase_num +']').addClass('selectPhrase');
				repositionConvertView();
				this.$first.remove();
				this.$second.remove();
				// 最後にinput_bufferの高さ調整
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
				console.log("communication success!");
				// Google日本語入力のwebAPIから、json形式で変換候補が渡される
				// json[0][0]; // ひらがな
				// json[0][1][0]; // 変換候補１つ目
				console.log('統合:');
				var fphrase_num = this.$first.children('.phrase_num').text();
				var $newConvertView = createConvertView(fphrase_num,json[0]).attr('data-alternativeList','select');
				this.$first.before($newConvertView);
				// 第一候補の文字でinput_bufferの該当文字を置き換える
				insertPhraseToInputBuffer(fphrase_num,getStringFromRow($newConvertView.children('.vertical_row:first-of-type').addClass('alternative_focus')));
				$('.input_buffer > .vertical_character[data-phrase_num='+ this.$second.children('.phrase_num').text() +']').remove();
				// selectphraseクラスの付け替え
				$('.input_buffer > .vertical_character[data-phrase_num='+ fphrase_num +']').addClass('selectPhrase');
				repositionConvertView();
				this.$first.remove();
				this.$second.remove();
				resetPhraseNum();
				// 最後にinput_bufferの高さ調整
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
				console.log("communication success!");
				// Google日本語入力のwebAPIから、json形式で変換候補が渡される
				// json[0][0]; // ひらがな
				// json[0][1][0]; // 変換候補１つ目
				console.log('分離:');
				var fphrase_num = this.$first.children('.phrase_num').text();
				var sphrase_num = $('.convertView').length;
				var $newFirstConvertView = createConvertView(fphrase_num,json[0]).attr('data-alternativeList','select');
				var $newSecondConvertView = createConvertView(sphrase_num,json[1]);
				this.$first.before($newFirstConvertView);
				this.$first.before($newSecondConvertView);

				// 第一候補の文字でinput_bufferの該当文字を置き換える
				insertPhraseToInputBuffer(fphrase_num,getStringFromRow($newFirstConvertView.children('.vertical_row:first-of-type').addClass('alternative_focus')));
				var secondFirstStr = json[1][1][0];
				var $insertPosObj = $('.input_buffer > .vertical_character[data-phrase_num='+ fphrase_num + ']:last');
				for (var i = secondFirstStr.length -1; i >= 0; i--) {
					var $character = createCharacter(secondFirstStr.charAt(i)).attr('data-phrase_num',sphrase_num);
					$insertPosObj.after($character);
				}

				// selectphraseクラスの付け替え
				$('.input_buffer > .vertical_character[data-phrase_num='+ fphrase_num +']').addClass('selectPhrase');
				repositionConvertView();
				this.$first.remove();
				resetPhraseNum();
				// 最後にinput_bufferの高さ調整
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
				console.log("communication success!");
				// Google日本語入力のwebAPIから、json形式で変換候補が渡される
				// json[0][0]; // ひらがな
				// json[0][1][0]; // 変換候補１つ目
				console.log('一文節のみ変換:');
				var fphrase_num = this.$first.children('.phrase_num').text();
				var $newConvertView = createConvertView(fphrase_num,json[0]).attr('data-alternativeList','select');
				this.$first.before($newConvertView);
				// 第一候補の文字でinput_bufferの該当文字を置き換える
				insertPhraseToInputBuffer(fphrase_num,getStringFromRow($newConvertView.children('.vertical_row:first-of-type').addClass('alternative_focus')));
				// selectphraseクラスの付け替え
				$('.input_buffer > .vertical_character[data-phrase_num='+ fphrase_num +']').addClass('selectPhrase');
				repositionConvertView();
				this.$first.remove();
				// 最後にinput_bufferの高さ調整
				resizeInputBuffer();
			},
			error : function (XMLHttpRequest, textStatus, errorThrown) {
				alert("Error:"+ textStatus + ":\n" + errorThrown + ":status=" + XMLHttpRequest.status + "in getKanji");
			}
		});
	}
	function createConvertView(phNum,jsonArray) {
		// convertviewを作成する
		// jsonArrayはひらがなと漢字配列が入るように、json[i]の形で渡す
		var $convertView = $('<div>').addClass('convertView').attr('data-alternativeList','nonselect');
		if (jsonArray[1] != null) {
			console.log('no undefined');
			console.log('jsonArray:'+ jsonArray[1]);
			for (var i = 0; i < jsonArray[1].length; i++) {
				$convertView.append(createRow(jsonArray[1][i]));
			}
		}else{
			console.log('no convert data');
		}
		// 最後はひらがな
		$convertView.append(createRow(jsonArray[0]));
		// 文節番号を示す数字をリストに表示する
		// phrase_numはクラスと、input_buffer文字が持つ属性とで二種類あるから注意
		var $phrase_num = $('<div>').addClass('phrase_num').text(phNum);
		$convertView.append($phrase_num);
		return $convertView;
	}
	function repositionConvertView() {
		// convertviewの位置を調整
		var $convertViews = $('.convertView');
		var focusPosObj = getFocusPos();
		var x = focusPosObj.x;
		var y = focusPosObj.y;
		$convertViews.each(function () {
			$(this).css('top',y + 'px').css('left',(x - parseInt($(this).css('width'))) + 'px');
		});
	}
	function resetPhraseNum() {
		// input_bufferの文節番号を振り直す
		var newNum = 0;
		var $character = $('.input_buffer > .vertical_character:first');
		var $convertView = $('.convertView:first');
		var temp = $character.attr('data-phrase_num');
		$convertView.children('.phrase_num').text(newNum);
		while (!($character.hasClass('EOL'))) {
			if (temp !== $character.attr('data-phrase_num')){
				newNum++;
				temp = $character.attr('data-phrase_num');
				$convertView = $convertView.next('.convertView');
				$convertView.children('.phrase_num').text(newNum);
			}
			$character.attr('data-phrase_num',newNum);
			$character = $character.next('.vertical_character');
		}
	}
	function readFile(file_id){
		"use strict";
		console.log("communication start point");
		var user_id = getUserID();
		$('#vertical_draft > .vertical_paragraph').remove();
		$.ajax({
			type : "POST",
			url : "/tategaki/ReadFile",
			data : {
				user_id: user_id,
				file_id: file_id
			},
			context : {
				id : file_id
			},
			dataType : "json",
			success : function (data) {
				// 表示データを受け取ってからの処理
				if(data.literaArray) console.log("communication success!");
				// ファイル名を表示
				$('#file_title').val(data.filename).attr('data-file_id',this.id);
				// 文章のhtml書き出し
				printString(data.literaArray,getStrLenOfRow());
				// 禁則処理
				checkKinsoku();
				// 最初の４０行のみ表示する
				addDisplayRow(0,getDisplayRowLen());
				Focus.init();
				$('.infomation > .saved').text(data.saved);

				addPageBreak();
				printInfomation();
			},
			error : function (XMLHttpRequest, textStatus, errorThrown) {
				alert("Error:"+ textStatus + ":\n" + errorThrown + ":status=" + XMLHttpRequest.status + "in readFile");
			}
		});
	}
	function addPageBreak() {
		// 改ページクラスの付与
		$('#vertical_draft > .vertical_paragraph > .vertical_row.page_break').removeClass('page_break');
		$('#vertical_draft > .vertical_paragraph > .vertical_row.page_last_row').removeClass('page_last_row');
		var pageNum = getRowLenOnPage();
		var $rows = $('#vertical_draft > .vertical_paragraph > .vertical_row');
		var $row;
		for (var i = 1; ($row = $rows.eq(pageNum*i-1))[0]; i++) {
			$row.addClass('page_last_row');
		}
		$rows.last().addClass('page_last_row');
		for (var i = 0; ($row = $rows.eq(pageNum*i))[0]; i++) {
			$row.addClass('page_break');
		}
	}
	function printString(strArray,strLen) {
		// 配列を引数にして、各文字列を本文表示
		// strLen: １行の文字数
		// 配列に入っている各文字列をそれぞれ段落として挿入する
		for(var i=0;i<strArray.length;i++){
			appendParagraph(strArray[i]);
		}
		if ($('#vertical_draft > .vertical_paragraph').length === 0) {
			// 一行もないなら、空行を挿入する
			appendParagraph("");
		}
	}
	function saveFile() {
		"use strict";
		var $file_title = $('#file_title');
		var user_id = getUserID();
		var filename = $file_title.val();
		if (filename.length === 0) {
			alert("ファイル名を入力してください");
			return;
		}
		if (filename.indexOf("'") > -1 || filename.indexOf("<")>-1 || filename.indexOf(">")>-1) {
			alert("ファイル名に使用不可能文字が含まれています。");
			return;
		}
		var file_id = $file_title.attr('data-file_id');
		if (file_id === "-1") {
			saveAs(filename);
			return;
		}
		var $paragraphs = $('#vertical_draft > .vertical_paragraph');
		var contentsArray = new Array();
		// 段落ごとに配列に格納
		for (var i = 0; i < $paragraphs.length; i++) {
			contentsArray.push(getStringFromParagraph($paragraphs.eq(i)));
		}
		var contentsJson = JSON.stringify(contentsArray);
		var nowDate_ms = Date.now() + "";
		console.log(nowDate_ms);

		console.log("communication start point");
		$.ajax({
			type : "POST",
			url : "/tategaki/WriteFile",
			data : {
				user_id : user_id,
				file_id: file_id,
				filename: filename,
				json: contentsJson,
				saved: nowDate_ms
			},
			context : {
				user_id : user_id,
				file_id: file_id
			},
			dataType : "json",
			success : function (data) {
				// 表示データを受け取ってからの処理
				console.log("communication success!");
				console.log(data.result);
				$('.saved').text(data.strDate);
				getFileList(this.user_id);
				console.log('保存しました:file_id=' + this.file_id);
			},
			error : function (XMLHttpRequest, textStatus, errorThrown) {
				alert("Error:"+ textStatus + ":\n" + errorThrown + ":status=" + XMLHttpRequest.status + "in saveFile");
			}
		});
	}
	function getFileList(userID){
		"use strict";
		console.log("communication start point in getFileList(userID:"+ userID +")");
		$('.file_list').empty();
		$.ajax({
			type : "POST",
			url : "/tategaki/GetFileList",
			data : {
				user_id: userID
			},
			dataType : "json",
			success : function (data) {
				// 表示データを受け取ってからの処理
				// data.fileid_list[] : ファイルid
				// data.filename_list[] : ファイル名
				if(data.fileID_list) console.log("communication success! in getFileList()");
				var $fileList = $('.file_list').text('ファイルを開く');
				var file_id;
				var filename;
				var $filename;
				for (var i = 0; i < data.fileID_list.length; i++) {
					file_id = data.fileID_list[i];
					filename = data.filename_list[i];
					$filename = $('<a>').addClass('file_name').attr('href','#').attr('data-file_id',file_id).attr('data-file_name',filename).text(filename);
					$fileList.append($('<li>').append($filename));
				}
			},
			error : function (XMLHttpRequest, textStatus, errorThrown) {
				alert("Error:"+ textStatus + ":\n" + errorThrown + ":status=" + XMLHttpRequest.status + " in getFileList");
			}
		});
	}
	function defaultNewFile() {
		newFile('newfile');
	}
	function newFile(filename){
		"use strict";
		console.log("communication start point");
		$('#vertical_draft > .vertical_paragraph').remove();
		var user_id = getUserID();
		var nowDate_ms = Date.now() + "";
		$.ajax({
			type : "POST",
			url : "/tategaki/NewFile",
			data : {
				filename: filename,
				user_id: user_id,
				saved: nowDate_ms
			},
			context : {
				user_id: user_id
			},
			dataType : "json",
			success : function (data) {
				// 表示データを受け取ってからの処理
				if(data.newFileID) console.log("communication success!");
				// ファイル名を表示
				$('#file_title').val(data.filename).attr('data-file_id',data.newFileID);
				readFile(data.newFileID);
				getFileList(this.user_id);
			},
			error : function (XMLHttpRequest, textStatus, errorThrown) {
				alert("Error:"+ textStatus + ":\n" + errorThrown + ":status=" + XMLHttpRequest.status + "in newFile");
			}
		});
	}
	function saveAs(filename) {
		// 名前をつけて保存
		"use strict";
		if (filename.indexOf("'") > -1 || filename.indexOf("<")>-1 || filename.indexOf(">")>-1) {
			alert("ファイル名に使用不可能文字が含まれています。");
			return;
		}
		console.log("communication start point");
		var user_id = getUserID();
		var nowDate_ms = Date.now() + "";
		$.ajax({
			type : "POST",
			url : "/tategaki/NewFile",
			data : {
				filename: filename,
				user_id: user_id,
				saved: nowDate_ms
			},
			context : {
				user_id: user_id
			},
			dataType : "json",
			success : function (data) {
				// 表示データを受け取ってからの処理
				if(data.newFileID) console.log("communication success!");
				// ファイル名を表示
				$('#file_title').val(data.filename).attr('data-file_id',data.newFileID);
				saveFile();
			},
			error : function (XMLHttpRequest, textStatus, errorThrown) {
				alert("Error:"+ textStatus + ":\n" + errorThrown + ":status=" + XMLHttpRequest.status + "in saveAs");
			}
		});
	}
	function defaultDeleteFile() {
		var file_id = $('input#file_title').attr('data-file_id');
		deleteFile(file_id);
	}
	function deleteFile(file_id) {
		"use strict";
		console.log("communication start point");
		var user_id = getUserID();
		if(window.confirm('本当に削除しますか:'+ getFileNameFromFileID(file_id) + '('+ file_id +')')){
			$.ajax({
				type : "POST",
				url : "/tategaki/DeleteFile",
				data : {
					user_id: user_id,
					file_id : file_id
				},
				context : {
					file_id : file_id
				},
				dataType : "json",
				success : function (data) {
					var successRecord = data.successRecord; // 処理行数の文字列
					var result = data.result; // true or false の文字列
					if (successRecord === "1" && result) {
						// 別ファイルに移動
						var $filenames = $('.file_list .file_name');
						for (var i = 0; i < $filenames.length; i++) {
							if ($filenames.eq(i).attr('data-file_id') !== this.file_id) {
								readFile($filenames.eq(i).attr('data-file_id'));
								break;
							}
						}
						getFileList(getUserID());
					}else{
						alert("ファイル削除エラーです(ファイル番号："+ this.file_id + ")");
					}

				},
				error : function (XMLHttpRequest,textStatus,errorThrown) {
					alert("Error:" + textStatus + ":\n" + errorThrown + ":status=" + XMLHttpRequest.status + "in deleteFile ");
				}
			});
		}
	}
	function getStringFromRow($row) {
		if (!$row[0]) console.log('$row is null in getStringFromRow');
		var rtnStr = "";
		var $c = $row.children('.vertical_character:first-of-type');
		while ($c[0] && !($c.hasClass('EOL'))) {
			rtnStr += $c.text();
			$c = $c.next();
		}
		return rtnStr;
	}
	function getStringFromParagraph($paragraph) {
		var $rows = $paragraph.children('.vertical_row');
		var rtnStr = "";
		for (var i = 0; i < $rows.length; ++i) {
			rtnStr += getStringFromRow($rows.eq(i));
		}
		return rtnStr;
	}
	function setNOCLine() {
		// フォーカスのある文字が何文字目かを記憶する要素群を作成する
		// フォーカスを左右に動かすときに利用する
		var $container = $('#app_container');

		var strLen = getStrLenOfRow();
		var $NOC_line = $('<div>').addClass('NOC_line');
		var $number_of_char;
		for (var i = 0; i < strLen; i++) {
			$number_of_char = $('<span>').addClass('number_of_char');
			$NOC_line.append($number_of_char);
		}
		$('#vertical_draft').prepend($NOC_line);
	}
	function insertStrFromFocus(str) {
		var count = str.length;
		var $focus = $('.focus');
		var $character;
		for (var i = 0; i < count; ++i) {
			$character = createCharacter(str.charAt(i));
			$focus.before($character);
		}
		cordinateStringNumber($focus.closest('.vertical_row'),getStrLenOfRow());
		Focus.repositionCharNum();
	}
	function insertStringToInputBuffer(str) {
		var $input_buffer = $('.input_buffer');
		// 新しくinput_bufferを作り直す
		var $newInput_Buffer = createRow(str).addClass('input_buffer');
		$newInput_Buffer.children('.vertical_character').attr('data-phrase_num',-1);
		if ($input_buffer.text()!=="" && $input_buffer.children('.vertical_character:first-of-type').attr('data-phrase_num') !== "-1") {
			for (var i = 0; i < $input_buffer.children('.vertical_character').length; i++) {
				var $oldCharacter = $input_buffer.children('.vertical_character').eq(i);
				var $newCharacter = $newInput_Buffer.children('.vertical_character').eq(i);
				$newCharacter.attr('data-phrase_num',$oldCharacter.attr('data-phrase_num'));
			}
		}
		$input_buffer.before($newInput_Buffer);
		$input_buffer.remove();
		$newInput_Buffer.show();
		moveInput();

		return $newInput_Buffer;
	}
	function insertPhraseToInputBuffer(phNum,str) {
		// 文節番号phNumを、strで置き換える
		// 新しい文字集合のオブジェクトを返す
		var $selectPhrases = $('.input_buffer > .vertical_character[data-phrase_num='+ phNum +']');
		var $insertPosObj = $selectPhrases.first();
		for (var i = 0; i < str.length; i++) {
			var $character = createCharacter(str.charAt(i));
			$insertPosObj.before($character);
			$character.attr('data-phrase_num',-10);
		}
		$selectPhrases.remove();
		return $('.input_buffer > .vertical_character[data-phrase_num="-10"]').attr('data-phrase_num',phNum);
	}
	function appendParagraph(str) {
		"use strict";
		$('#vertical_draft').append(createParapraph(str));
	}
	function createParapraph(str) {
		"use strict";
		// 文字列をstrLen文字ごとに区切って行にして、paragraphにappendする
		var strLen = getStrLenOfRow();
		var $p = $('<div>').addClass('vertical_paragraph');
		var pos = 0;
		var outputString;
		do{
			outputString = pos+strLen>str.length?str.slice(pos):str.substring(pos,pos+strLen);
			var $row = createRow(outputString);
			$p.append($row);
			pos += strLen;
		}while(pos<str.length);
		return $p;
	}

	function createRow(str) {
		"use strict";
		if(str == null) return;
		var $row = $('<div>').addClass('vertical_row');
		var $EOL = $('<span>').addClass('vertical_character').addClass('EOL');
		$row.append($EOL);
		var count;
		for (var i = 0; i < (count = str.length); i++) {
			var $c = createCharacter(str.charAt(i));
			$EOL.before($c);
		}
		return $row;
	}
	function createCharacter(c) {
		var $character = $('<span>').addClass('vertical_character').text(c);
		// 特殊クラスの付与
		if(key_table.dotList.indexOf(c) !== -1) $character.addClass("vertical_dot"); // 句点
		if(key_table.beforeBracketList.indexOf(c) !== -1) $character.addClass("vertical_before_bracket"); // 前括弧
		if(key_table.afterBracketList.indexOf(c) !== -1) $character.addClass("vertical_after_bracket"); // 後括弧
		if(key_table.lineList.indexOf(c) !== -1) $character.addClass("character_line"); // 伸ばし棒
		return $character;
	}
	// 改行
	function lineBreak() {
		var $focus = $('.focus');
		var $focusRow = $('.focus_row');
		var $nextRow = $focusRow.nextAll('.vertical_row:first'); //改行前の次の行
		var $prevChar = $focus.prev(); //移動しない文字の最後
		if (!($prevChar[0])) {
			// 行頭フォーカスで改行
			var $baseParagraph = $focusRow.closest('.vertical_paragraph');
			var $paragraph = $('<div>').addClass('vertical_paragraph');
			var $row = createRow("").addClass('displayRow');
			$paragraph.append($row);
			if (($focusRow.prev())[0]) {
				// 段落途中での行頭改行では、段落を２つに分ける
				var $afterParagraph = createDevideParagraph($focusRow);
				// $baseParagraph,$afterParagraphの順番になるように
				$baseParagraph.after($afterParagraph);
				return;
			}
			// 段落最初での改行では、その前のところに空行挿入
			$baseParagraph.before($paragraph);
			return;
		}

		if (!($nextRow[0])) {
			// 次の行がなければ新しく作る
			$nextRow = createRow("");
			$focusRow.after($nextRow);
		}
		var $insertPosObj = $nextRow.children('.vertical_character:first-of-type'); //挿入先の最初の文字
		var $vChar = $focus; // 移動文字
		while($vChar[0] && !($vChar.hasClass('EOL'))){ // EOLは移動しない
			// $nextRowの先頭にある$insertPosObjに、$prevCharの次の文字を挿入していく
			$vChar.remove();
			$insertPosObj.before($vChar);
			$vChar = $prevChar.nextAll('.vertical_character:first');
		}
		if ($focus.hasClass('EOL')) { // EOLにフォーカスがあると、EOLが動かないために、フォーカスが次の行に行かないので強制的に動かす必要あり
			// = 行末での改行
			$focus.removeClass('focus');
			$nextRow.children('.vertical_character:first-of-type').addClass('focus');
		}
		// 移動文字列を次の行に入れた結果規定文字数を超えた場合のために、次の行を文字数調整
		cordinateStringNumber($nextRow,getStrLenOfRow());

		// $nextRow以降を新しい段落とする
		var $currentParagraph = $nextRow.closest('.vertical_paragraph');
		var $newParagraph = createDevideParagraph($nextRow);
		$currentParagraph.after($newParagraph);

		Focus.repositionCharNum();
	}
	function createDevideParagraph($row) {
		// $row以降を新しい段落とする
		// 段落を分けるときに利用する
		var $currentParagraph = $row.closest('.vertical_paragraph');
		var $newParagraph = $('<div>').addClass('vertical_paragraph');
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
		var $nextRow = $vRow.nextAll('.vertical_row:first');
		if (!($nextRow[0])) {
			// 次の行がなければ新しく作る
			$nextRow = createRow("");
			$vRow.after($nextRow);
		}
		var $prevChar = $vRow.children('.vertical_character').eq(strLen -1); //移動しない文字の最後
		var $insertPosObj = $nextRow.children('.vertical_character:first-of-type'); //挿入先の最初の文字
		var $vChar = $prevChar.nextAll('.vertical_character:first'); // 移動文字
		while($vChar[0] && !($vChar.hasClass('EOL'))){ // EOLは移動しない
			$vChar.remove();
			$insertPosObj.before($vChar);
			$vChar = $prevChar.nextAll('.vertical_character:first');
		}
		// 移動先の行がstrlen文字を超えている時のために再帰
		cordinateStringNumber($nextRow,strLen);
		// focusが調整行の最後にあれば動いてくれないので、強制的に動かす
		if ($prevChar.nextAll('.vertical_character:first').hasClass('focus')) {
			$('.focus').removeClass('focus');
			$insertPosObj.addClass('focus');
			Focus.repositionCharNum();
		}
	}
	function deleteCharacter($vCharacter,$rowOfDelChar) {
		// $vCharacter: 削除文字
		// $rowofdelchar: 削除文字のある行
		if (!($vCharacter[0])) {
			// 行頭からのBS
			console.log('deleteCharacter(): !($vCharacter[0])');
			var $preRow = $rowOfDelChar.prevAll('.vertical_row:first');
			if (!($preRow[0])) {
				console.log('deleteCharacter(): !($preRow[0])');
				// 前の行が見つからない　＝　段落の最初
				// 段落をつなげて次の処理へ
				var $delParagraph = $rowOfDelChar.closest('.vertical_paragraph');
				var $preParagraph = $delParagraph.prevAll('.vertical_paragraph:first');
				var $mvRow = $delParagraph.children('.vertical_row:first-of-type');
				var $preRow = $preParagraph.children('.vertical_row:last-of-type');
				if (!($preRow[0])) {
					// 段落をまたいでも前の行が見つからない＝文章の最初
					return;
				}
				if ($mvRow.children('.vertical_character:first-of-type').hasClass('EOL')) {
					console.log('deleteCharacter(): $mvRow\'s children has .EOL');
					// 空段落でBSを押した時、段落を削除するのみ
					$delParagraph.remove();
					// focusの調整
					var $newFocus = $preRow.children('.vertical_character:last-of-type');
					$newFocus.addClass('focus');
					Focus.repositionCharNum();
					return;
				}

				do{
					// $delParagraphの行を$preParagraphに移動
					$mvRow.remove();
					$preParagraph.append($mvRow);
					$mvRow = $delParagraph.children('.vertical_row:first-of-type');
				}while($mvRow[0]);
				$delParagraph.remove();
				if($preRow.children().length >= getStrLenOfRow()) return; // 前の段落の最終行が規定文字数あるようなら、段落をつなげて終わり
			}
			// 行頭からのBSかつ段落の最初ではない
			if ($preRow.children('.vertical_character').length < getStrLenOfRow()) {
				// 前の行の文字数が規定数(30)文字ないとき、$rowOfDelCharの文字を前の行に持って行って埋める
				var count = getStrLenOfRow() - ($preRow.children('.vertical_character').length -1); // lengthではEOLも含まれるので-1
				for (var i = 0; i < count; i++) {
					backChar($preRow);
				}
				Focus.repositionCharNum();
				return;
			}else{
				// 前の行の文字数が規定文字ある時、前の行の最後の文字を削除文字にする
				$vCharacter = $preRow.children('.EOL').prev();
				$rowOfDelChar = $preRow;
			}
		}
		backChar($rowOfDelChar); // 次の行から１文字持ってくる
		var character = $vCharacter.text();
		$vCharacter.remove();
		if ($rowOfDelChar.children('.vertical_character:first-of-type').hasClass('EOL') && ($rowOfDelChar.prev())[0]) {
			// 先にフォーカスの調整($rowOfDelChar削除前にフォーカス位置取得)
			var $newFocus = $rowOfDelChar.prev().children('.vertical_character:last-of-type');
			$newFocus.addClass('focus');
			// 最後の１文字を削除した場合はbackCharが反応しないので、その空行を削除(それが段落最後の行でなければ)
			$rowOfDelChar.remove();
		}
		Focus.repositionCharNum();
		return character;
	}
	function backChar($bringRow) {
		// $bringRowの次の行以降の最初の文字を、その前の行の最後に移動する
		var $nextRow = $bringRow.nextAll('.vertical_row:first');
		if(!($nextRow[0])) return;
		var $bc = $nextRow.children('.vertical_character:first-of-type');
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
	var Focus = {
		init: function () {
			$('.vertical_character:first').addClass('focus');
			$('.NOC_line > .number_of_char:first-of-type').addClass('focus_char');
			this.addFocusRow();
		},
		addFocusRow : function () {
			var $oldFocusRow = $('.vertical_paragraph > .vertical_row.focus_row');
			if ($oldFocusRow[0]) {
				$oldFocusRow.removeClass('focus_row');
			}
			$('.focus').closest('.vertical_row').addClass('focus_row');
		},
		next : function() {
			// カーソルを次の文字に移動する
			var prev = $('.focus');
			var next = prev.nextAll('.vertical_character:first');
			if (!(next[0])) {
				// 行末に達していたら、次の行の１文字目に移る
				next = prev.closest('.vertical_row').nextAll('.vertical_row:first').children('.vertical_character:first-of-type');
			}
			if (!(next[0])) {
				// 段落の最後に達していたら、次の段落の最初に
				next = prev.parents('.vertical_paragraph').nextAll('.vertical_paragraph:first').find('.vertical_character:first');
			}
			if (!(next[0])) {
				// 文章の最後に達していたら、何もしない
				return;
			}
			prev.removeClass('focus');
			next.addClass('focus');
			// markしたまま別の行に移り、そのまま上下キーを押してmarkを動かすこともあるので、markを１文字ずつ動かすのでは期待通りの動きをしてくれない
			Focus.repositionCharNum();
			this.addFocusRow();
		},
		prev : function () {
			// カーソルを前の文字に移動する
			var prev = $('.focus');
			var next = prev.prevAll('.vertical_character:first');
			if (!(next[0])) {
				next = prev.closest('.vertical_row').prevAll('.vertical_row:first').children('.vertical_character:last-of-type');
			}
			if (!(next[0])) {
				// 段落の最後に達していたら、次の段落の最初に
				next = prev.parents('.vertical_paragraph').prevAll('.vertical_paragraph:first').find('.vertical_character:last');
			}
			if (!(next[0])) {
				return;
			}
			prev.removeClass('focus');
			next.addClass('focus');
			Focus.repositionCharNum();
			this.addFocusRow();
		},
		shiftRight: function () {
			// カーソルを前の行に移動する
			var prev = $('.focus');
			var NOC_Num = $('.NOC_line').children('.number_of_char').index($('.focus_char'));
			var next = prev
				.closest('.vertical_row')
				.prevAll('.vertical_row:first')
				.children('.vertical_character')
				.eq(NOC_Num);
			if (!(next[0])) {
				// 右の行の文字数が現在文字より小さい
				next = prev
					.closest('.vertical_row')
					.prevAll('.vertical_row:first')
					.children('.vertical_character:last-of-type');
			}
			if (!(next[0])) {
				// 段落の最後に達していたら、次の段落
				next = prev.parents('.vertical_paragraph').prevAll('.vertical_paragraph:first').children('.vertical_row:last-of-type').children('.vertical_character').eq(NOC_Num);
			}
			if (!(next[0])) {
				// 段落の最後かつ右行の文字数が少ない
				next = prev.parents('.vertical_paragraph').prevAll('.vertical_paragraph:first').children('.vertical_row:last-of-type').children('.vertical_character:last-of-type');
			}
			if (!(next[0])) {
				return;
			}
			prev.removeClass('focus');
			next.addClass('focus');
			this.addFocusRow();
		},
		shiftLeft: function () {
			// カーソルを次の行に移動する
			var prev = $('.focus');
			var NOC_Num = $('.NOC_line').children('.number_of_char').index($('.focus_char'));
			var next = prev.closest('.vertical_row').nextAll('.vertical_row:first').children('.vertical_character').eq(NOC_Num);
			if (!(next[0])) {
				next = prev.closest('.vertical_row').nextAll('.vertical_row:first').children('.vertical_character:last-of-type');
			}
			if (!(next[0])) {
				// 段落の最後に達していたら、次の段落
				next = prev.parents('.vertical_paragraph').nextAll('.vertical_paragraph:first').children('.vertical_row:first-of-type').children('.vertical_character').eq(NOC_Num);
			}
			if (!(next[0])) {
				next = prev.parents('.vertical_paragraph').nextAll('.vertical_paragraph:first').children('.vertical_row:first-of-type').children('.EOL');
			}
			if (!(next[0])) {
				return;
			}
			prev.removeClass('focus');
			next.addClass('focus');
			this.addFocusRow();
		},
		repositionCharNum: function () {
			// charNumの位置を再調整
			var focusPos = $('.focus').closest('.vertical_row').children().index($('.focus'));
			$('.focus_char').removeClass('focus_char');
			$('.NOC_line > .number_of_char').eq(focusPos).addClass('focus_char');
			// focus_rowの 調整
			this.addFocusRow();
		},
		jumpForRow: function (rowNum) {
			// 指定行にジャンプする。画面中央に指定行及びフォーカスが来るように調整
			var $targetRow = $('.vertical_paragraph > .vertical_row').eq(rowNum-1);
			if (!$targetRow[0]) { return; }
			// focus
			$('.focus').removeClass('focus');
			$targetRow.children('.vertical_character:first-of-type').addClass('focus');
			this.addFocusRow();
			this.repositionCharNum();
			// display
			var focusRowPos = $('.vertical_paragraph > .vertical_row').index($('.focus_row'));
			var startDispNum = (focusRowPos-getDisplayRowLen()/2)>=0?focusRowPos-getDisplayRowLen()/2:$('.vertical_paragraph > .vertical_row').index($('.vertical_paragraph > .vertical_row:first-of-type'));
			addDisplayRow(startDispNum,startDispNum+getDisplayRowLen());
			printInfomation();
		},
		jumpForPage: function (pageNum) {
			// 指定ページにジャンプする。フォーカスは１行目
			var startDispNum = $('.vertical_paragraph > .vertical_row').index($('.page_break').eq(pageNum-1));
			var $targetRow = $('.vertical_paragraph > .vertical_row').eq(startDispNum);
			if (!$targetRow[0]) { return; }
			// focus
			$('.focus').removeClass('focus');
			$targetRow.children('.vertical_character:first-of-type').addClass('focus');
			this.addFocusRow();
			this.repositionCharNum();
			// display
			addDisplayRow(startDispNum,startDispNum+getDisplayRowLen());
			printInfomation();
		}
	};

	function wheelEvent(e,delta,deltaX,deltaY) {
		// マウスホイールを動かすと、ページが左右に動く
		var $nextRow;
		if (delta > 0) {
			// ホイールを上に動かす
			for (var i = 0; i < 3; i++) {
				$nextRow = $('.displayRow:first').prev('.vertical_row');
				if (!$nextRow[0]) { $nextRow = $('.displayRow:first').closest('.vertical_paragraph').prev('.vertical_paragraph').children('.vertical_row:last-of-type'); }
				if (!$nextRow[0]) { return; }
				$nextRow.addClass('displayRow');
				$('.displayRow:last').removeClass('displayRow');
				if (!($('.focus_row').hasClass('displayRow'))) { Focus.shiftRight(); }
			}
		}else{
			// ホイールを下に動かす
			for (var i = 0; i < 3; i++) {
				$nextRow = $('.displayRow:last').next('.vertical_row');
				if (!$nextRow[0]) { $nextRow = $('.displayRow:last').closest('.vertical_paragraph').next('.vertical_paragraph').children('.vertical_row:first-of-type'); }
				if (!$nextRow[0]) { return; }
				$nextRow.addClass('displayRow');
				$('.displayRow:first').removeClass('displayRow');
				if (!($('.focus_row').hasClass('displayRow'))) { Focus.shiftLeft(); }
			}
		}
		printInfomation();
	}
	function keyEvent(e) {
		var keycode;
		if (document.all) {
			// IE
			keycode = e.keyCode
		}else{
			// IE以外
			keycode = e.which;
		}
		if (keycode === 123) { return; } // F12のみブラウザショートカットキー
		var $input_buffer = $('.input_buffer');
		if ($('.convertView')[0]) {
			// 漢字変換候補を選んでいるとき
			switch (keycode) {
				case 8:
					// backspace
					backSpaceOnConvert();
					break;
				case 13:
					// Enter
					// input_bufferの文字を挿入
					$('.convertView').remove();
					insertStrFromFocus($input_buffer.text());
					$input_buffer.empty().hide(); // input_bufferを空にして隠す
					// 禁則処理
					checkKinsoku();
					// displayrow
					reDisplay();
					addPageBreak();
					printInfomation();
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
						// 表示convertviewの変更、alternative_focusの変更、selectphraseの変更
						var prevPhraseNum = $('.alternative_focus').siblings('.phrase_num').text();
						var $prevSelectConvertView = $('.convertView[data-alternativeList="select"]');
						var $newSelectConvertView = $prevSelectConvertView.prev('.convertView');
						var newPhraseNum = $newSelectConvertView.children('.phrase_num').text();
						// 最初に達していたら最後に戻る
						if(!($newSelectConvertView[0])){
							$newSelectConvertView = $('.convertView:last');
							newPhraseNum = $newSelectConvertView.children('.phrase_num').text();
						} 
						var $newPhrases = $('.input_buffer > .vertical_character[data-phrase_num='+ newPhraseNum + ']');
						$prevSelectConvertView.attr('data-alternativeList','nonselect');
						$newSelectConvertView.attr('data-alternativeList','select');
						$('.input_buffer > .vertical_character.selectPhrase').removeClass('selectPhrase');
						$newPhrases.addClass('selectPhrase');
						$('.alternative_focus').removeClass('alternative_focus');
						$newSelectConvertView.children('.vertical_row:first-of-type').addClass('alternative_focus');
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
						var $firstConvertView = $('.convertView[data-alternativeList="select"]');
						var $secondConvertView = $firstConvertView.next('.convertView');
						if(!($secondConvertView[0])) break;
						var firstKana = getStringFromRow($firstConvertView.children('.vertical_row:last'));
						var secondKana = getStringFromRow($secondConvertView.children('.vertical_row:last'));
						var newString;
						if(secondKana.length < 2){
							//二番目の文字列が１文字しかないので、２つを統合する
							newString = firstKana + secondKana + ",";
							getKanjiForFusion(newString,$firstConvertView,$secondConvertView);
							break;
						}
						newString = firstKana + secondKana.charAt(0) + "," + secondKana.substring(1);
						getKanjiForChangePhrase(newString,$firstConvertView,$secondConvertView);
					}else{
						// Down のみ
						// 選択文節の変更
						// 表示convertviewの変更、alternative_focusの変更、selectphraseの変更
						var prevPhraseNum = $('.alternative_focus').siblings('.phrase_num').text();
						var $prevSelectConvertView = $('.convertView[data-alternativeList="select"]');
						var $newSelectConvertView = $prevSelectConvertView.next('.convertView');
						var newPhraseNum = $newSelectConvertView.children('.phrase_num').text();
						// 最後に達していたら最初に戻る
						if(!($newSelectConvertView[0])){
							$newSelectConvertView = $('.convertView:first');
							newPhraseNum = $newSelectConvertView.children('.phrase_num').text();
						} 
						var $newPhrases = $('.input_buffer > .vertical_character[data-phrase_num='+ newPhraseNum + ']');
						$prevSelectConvertView.attr('data-alternativeList','nonselect');
						$newSelectConvertView.attr('data-alternativeList','select');
						$('.input_buffer > .vertical_character.selectPhrase').removeClass('selectPhrase');
						$newPhrases.addClass('selectPhrase');
						$('.alternative_focus').removeClass('alternative_focus');
						$newSelectConvertView.children('.vertical_row:first-of-type').addClass('alternative_focus');
					}
					break;
				case 118:
					changeKatakanaAtConvert();
					break;
				default:
					break;
			}
		}else if($input_buffer.text() !== "") {
			// input_bufferへの入力中
			switch (keycode) {
				case 8:
					// backspace
					$input_buffer.children('.EOL').prev().remove();
					moveInput();
					if($input_buffer.children('.vertical_character:first-of-type').hasClass('EOL')){
						$input_buffer.children('.EOL').remove();
						$input_buffer.hide();
					}
					break;
				case 13:
					// Enter
					// input_bufferの文字を挿入
					insertStrFromFocus($input_buffer.text());
					$input_buffer.empty().hide(); // input_bufferを空にして隠す
					break;
				case 32:
					// space
					$('.convertView').show();
					var inputStr = getStringFromRow($input_buffer);
					getKanjiForFullString(inputStr);
					break;
				case 118:
					changeKatakanaAtInput();
					break;
				default:
					// input_bufferの更新
					var inputStr = getStringFromRow($input_buffer); //もともとの文字列
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
		}else{
			// 非入力(通常)状態
			var textcheck = true;
			if (e.ctrlKey) {
				// ctrlキーを使ったショートカットキー
				switch (keycode) {
					case 66:
						// b
					case 68:
						// d
						var $delChar = $('.focus').prev();
						deleteCharacter($delChar,$('.focus_row'));
						break;
					case 79:
						// o
						console.log('C + O');
						openPrevFile();
						textcheck = false;
						break;
					case 73:
						// i
						console.log('C + I');
						openNextFile();
						textcheck = false;
						break;
					case 72:
						// h
						Focus.shiftLeft();
						break;
					case 74:
						// j
						Focus.next();
						break;
					case 75:
						// k
						Focus.prev();
						break;
					case 76:
						// l
						Focus.shiftRight();
						break;
					case 78:
						// n
						break;
					case 83:
						// s
						saveFile();
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
					reDisplay();
					addPageBreak();
					printInfomation();
				}
			}else{
				switch (keycode) {
					case 8:
						// backspace
						var $delChar = $('.focus').prev();
						deleteCharacter($delChar,$('.focus_row'));
						break;
					case 13:
						// Enter
						lineBreak();
						break;
					case 32:
						// space
						insertStrFromFocus(" ");
						break;
					case 37:
						// Left
						Focus.shiftLeft();
						break;
					case 38:
						// Up
						Focus.prev();
						break;
					case 39:
						// Right
						Focus.shiftRight();
						break;
					case 40:
						// Down
						Focus.next();
						break;
					case 58: // firefox developer edition
					case 186: // chrome
						// :
						startCommandMode();
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
				// 禁則処理
				checkKinsoku();
				// displayrow
				reDisplay();
				addPageBreak();
				printInfomation();
			}
		}

		console.log(keycode);
		// デフォルトの動作を無効化する
		e.preventDefault();
	}

	function reDisplay() {
		var startDispNum = $('.vertical_paragraph > .vertical_row').index($('.displayRow:first'));
		addDisplayRow(startDispNum,startDispNum+getDisplayRowLen()); // 途中行数変化
		if (getRowLen() >= getDisplayRowLen()) {
			// 全行数が表示行数より多い
			changeDisplayRow(); // フォーカス移動
		}else{
			$('.vertical_paragraph > .vertical_row').addClass('displayRow');
		}
	}

	function backSpaceOnConvert() {
		var $input_buffer = $('.input_buffer');
		var $selectConvertView = $('.convertView[data-alternativeList="select"]');
		var hira = getStringFromRow($selectConvertView.children('.vertical_row:last'));
		if(hira.length<2){
			var $oldSelectPhrase = $input_buffer.children('.vertical_character.selectPhrase');

			var prevPhraseNum = $('.alternative_focus').siblings('.phrase_num').text();
			var $prevSelectConvertView = $('.convertView[data-alternativeList="select"]');
			var $newSelectConvertView = $prevSelectConvertView.next('.convertView');
			var newPhraseNum = $newSelectConvertView.children('.phrase_num').text();
			// 最後に達していたら最初に戻る
			if(!($newSelectConvertView[0])){
				$newSelectConvertView = $('.convertView:first');
				newPhraseNum = $newSelectConvertView.children('.phrase_num').text();
			} 
			var $newPhrases = $('.input_buffer > .vertical_character[data-phrase_num='+ newPhraseNum + ']');
			$prevSelectConvertView.attr('data-alternativeList','nonselect');
			$newSelectConvertView.attr('data-alternativeList','select');
			$('.input_buffer > .vertical_character.selectPhrase').removeClass('selectPhrase');
			$newPhrases.addClass('selectPhrase');
			$('.alternative_focus').removeClass('alternative_focus');
			$newSelectConvertView.children('.vertical_row:first-of-type').addClass('alternative_focus');

			if($input_buffer.children('.vertical_character').length > 2){
				$selectConvertView.remove();
				$oldSelectPhrase.remove();
			}else{
				// input_bufferが空になった
				$('.convertView').remove();
				$input_buffer.empty().hide(); // input_bufferを空にして隠す
			}
			return;
		}
		getKanjiForOnePhrase(hira.substring(0,hira.length-1),$selectConvertView);

	}
	function shiftUpOnConvert() {
		var $firstConvertView = $('.convertView[data-alternativeList="select"]');
		var $secondConvertView = $firstConvertView.next('.convertView');
		var firstKana = getStringFromRow($firstConvertView.children('.vertical_row:last'));
		if(firstKana.length < 2) return;
		var newString;
		var secondKana;
		if(!($secondConvertView[0])){
			// 最後の文節の場合
			// 分離
			newString = firstKana.substring(0,firstKana.length-1) + "," + firstKana.substring(firstKana.length-1,firstKana.length);
			getKanjiForSplit(newString,$firstConvertView);
			return;
		}else{
			secondKana = getStringFromRow($secondConvertView.children('.vertical_row:last'));
		}
		newString = firstKana.substring(0,firstKana.length-1) + ","+ firstKana.substring(firstKana.length-1,firstKana.length) + secondKana;
		getKanjiForChangePhrase(newString,$firstConvertView,$secondConvertView);
	}
	function shiftLeftAlternativeFocus() {
		// 漢字変換候補一覧のフォーカスを左にシフトさせる
		$preSelect = $('.alternative_focus');
		$newSelect = $preSelect.next('.vertical_row');
		if(!($newSelect[0])) return;
		$preSelect.removeClass('alternative_focus');
		$newSelect.addClass('alternative_focus');
		// input_bufferの文字を入れ替える
		var phraseNum = $newSelect.siblings('.phrase_num').text();
		var selectKanji = getStringFromRow($newSelect);
		insertPhraseToInputBuffer(phraseNum,selectKanji);
		// selectphraseクラスの付け替え
		$('.selectPhrase').removeClass('selectPhrase');
		$('.input_buffer > .vertical_character[data-phrase_num='+ phraseNum +']').addClass('selectPhrase');

		resizeInputBuffer();
	}
	function shiftRightAlternativeFocus() {
		// 漢字変換候補一覧のフォーカスを右にシフトさせる
		$preSelect = $('.alternative_focus');
		$newSelect = $preSelect.prev('.vertical_row');
		if(!($newSelect[0])) return;
		$preSelect.removeClass('alternative_focus');
		$newSelect.addClass('alternative_focus');
		var phraseNum = $newSelect.siblings('.phrase_num').text();
		var selectKanji = getStringFromRow($newSelect);
		insertPhraseToInputBuffer(phraseNum,selectKanji);
		// selectphraseクラスの付け替え
		$('.selectPhrase').removeClass('selectPhrase');
		$('.input_buffer > .vertical_character[data-phrase_num='+ phraseNum +']').addClass('selectPhrase');

		resizeInputBuffer();
	}

	function moveInput() {
		// input_bufferの位置を調整する
		var focusPosObj = getFocusPos();
		var x = focusPosObj.x;
		var y = focusPosObj.y;
		var $input_buffer = $('.input_buffer');
		$input_buffer.css('top',y + 'px').css('left',x + 'px');
		resizeInputBuffer();
	}
	function getFocusPos() {
		return getPosObj($('.focus'));
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
	function resizeInputBuffer() {
		// input_bufferの高さ調整
		var $input_buffer = $('.input_buffer');
		var $character = $input_buffer.children('.vertical_character:first-of-type');
		// borderは上下合わせて２つある
		var height = (parseInt($character.css('height')) + parseInt($character.css('border-width'))*2) * ($input_buffer.children('.vertical_character').length-1);
		$input_buffer.css('height',height + 'px');
	}
	function changeDisplayRow() {
		// フォーカスが移動した時の、表示領域の調整
		var $focus = $('#vertical_draft > .vertical_paragraph > .vertical_row > .focus');
		var $parentRow = $focus.closest('.vertical_row');
		if($parentRow.hasClass('displayRow')) return;
		$parentRow.addClass('displayRow');
		if($('.displayRow').length <= getDisplayRowLen()) return;
		var $nextRow = $parentRow.next('.vertical_row');
		if(!($nextRow[0])) $nextRow = $parentRow.closest('.vertical_paragraph').next('.vertical_paragraph').children('.vertical_row:first-of-type');
		if ($nextRow.hasClass('displayRow')) {
			$('.displayRow:last').removeClass('displayRow');
		}else{
			$('.displayRow:first').removeClass('displayRow');
		}
	}
	function addDisplayRow(start,end) {
		var $oldDisplayRows = $('.vertical_row.displayRow').removeClass('displayRow');
		if ($oldDisplayRows[0]) { $oldDisplayRows.removeClass('displayRow'); }
		var $verticalRows = $('.vertical_paragraph > .vertical_row');
		var $row;
		for (var i = start; i < end; i++) {
			$row = $verticalRows.eq(i);
			$row.addClass('displayRow');
		}
	}
	function printInfomation() {
		console.log('printInfomation()');
		$('.infomation > .str_num').text(getCurrentStrPosOnRow());
		$('.infomation > .str_len').text(getStrLenOfFocusRow());
		$('.infomation > .row_num').text(getCurrentRowOnPage());
		$('.infomation > .row_len').text(getRowLenOnFocusPage());
		$('.infomation > .page_num').text(getCurrentPagePos());
		$('.infomation > .page_len').text(getPageLen());
	}
	function changeKatakanaAtConvert() {
		var phraseNum = $('.input_buffer > .selectPhrase').attr('data-phrase_num');
		var str = getKatakana(getStringFromRow($('.convertView[data-alternativeList="select"] > .vertical_row:last')));
		insertPhraseToInputBuffer(phraseNum,str).addClass('selectPhrase');
		resizeInputBuffer();
	}
	function changeKatakanaAtInput() {
		var str = getStringFromRow($('.input_buffer.vertical_row'));
		insertStringToInputBuffer(getKatakana(str)).children('.vertical_character:not(.EOL)').addClass('selectPhrase');
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
	function startCommandMode() {
		console.log('startCommandMode');
		var $command = $('<input>').attr('type','text').attr('id','command');
		$('#app_container').after($command);
		document.removeEventListener("keydown",keyEvent,false);
		// フォーカスを当ててからvalueをセットすることで末尾にカーソルが移動される
		$command.focus();
		$command.val(':');

		$('body').on('keyup','input#command',keyupEventOnCommandMode);
		$('body').on('blur','input#command',endCommandMode);
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
		}
		e.preventDefault();
	}
	function endCommandMode() {
		console.log('endCommandMode');
		var $command = $('input#command');
		$('body').off('keyup','input#command',keyupEventOnCommandMode);
		$('body').off('blur','input#command',endCommandMode);
		$command.remove();
		document.addEventListener("keydown",keyEvent,false);
	}
	function runCommand() {
		var $command = $('input#command');
		var command = $command.val().split(' ');
		switch (command[0]) {
			case ':w':
			case ':save':
			case ':s':
					 if (command[1]) {
						 saveAs(command[1]);
					 }else{
						 saveFile();
					 }
					 break;
			case ':e':
			case ':o':
			case ':open':
					 if (command[1]) {
						 openFile(command[1]);
					 }else{
						 defaultNewFile();
					 }
					 break;
			case ':jumpr':
			case ':jumprow':
			case ':jr':
					 if(command[1]) Focus.jumpForRow(command[1]);
					 break;
			case ':jumpp':
			case ':jumppage':
			case ':jp':
					 if(command[1]) Focus.jumpForPage(command[1]);
					 break;
			case ':new':
			case ':n':
					 if (command[1]) {
						 newFile(command[1]);
					 }else {
						 defaultNewFile();
					 }
					 break;
			case ':delete':
			case ':del':
			case ':d':
					 if (command[1]) {
						 deleteFileFromFileName(command[1]);
					 }else{
						 defaultDeleteFile();
					 }
					 break;
			case ':next':
					 // 次のファイルを開く
					 if (command[1]) {
						 // 第二引数は繰り返し回数
						 var count = parseInt(command[1]);
						 if (isNaN(count)) { break; }
						 for (var i = 0; i < count; i++) {
							 openNextFile();
						 }
					 }else{
						 openNextFile();
					 }
					 break;
			case ':prev':
					 // 前のファイルを開く
					 if (command[1]) {
						 // 第二引数は繰り返し回数
						 var count = parseInt(command[1]);
						 if (isNaN(count)) { break; }
						 for (var i = 0; i < count; i++) {
							 openPrevFile();
						 }
					 }else{
						 openPrevFile();
					 }
					 break;
			case ':title':
			case ':name':
			case ':t':
					 if (command[1]) {
						 setFileTitle(command[1]);
					 }
			default:
					 break;
		}
	}
	function setFileTitle(filename) {
		$('input#file_title').val(filename);
	}
	function openNextFile() {
		console.log('openNextFile()');
		var $currentFileLi = $('.file_list > li').has('.file_name[data-file_id="'+ $('input#file_title').attr('data-file_id') +'"]');
		var $nextFile;
		if ($currentFileLi[0]) {
			$nextFile = $currentFileLi.nextAll('li:first').children('.file_name');
		}else{
			$nextFile = $('.file_list .file_name:first');
		}
		if($nextFile[0]) readFile($nextFile.attr('data-file_id'));
	}
	function openPrevFile() {
		console.log('openPrevFile()');
		var $currentFileLi = $('.file_list > li').has('.file_name[data-file_id="'+ $('input#file_title').attr('data-file_id') +'"]');
		var $nextFile = $currentFileLi.prevAll('li:first').children('.file_name');
		if($nextFile[0]) readFile($nextFile.attr('data-file_id'));
	}
	function openFile(filename) {
		console.log('openFile()');
		var $file = getFileObjectFromFileName(filename);
		if (!$file[0]) { return; }
		readFile($file.attr('data-file_id'));
	}
	function getFileObjectFromFileName(filename) {
		// 同一名ファイルが複数存在する可能性を忘れずに
		var $filename = $('.file_list .file_name[data-file_name="'+ filename +'"]');
		return $filename;
	}
	function getFileNameFromFileID(file_id) {
		return $('.file_list .file_name[data-file_id="'+ file_id +'"]').attr('data-file_name');
	}
	function deleteFileFromFileName(filename) {
		console.log('deleteFileFromFileName');
		var $file = getFileObjectFromFileName(filename);
		if (!$file[0]) { return; }
		var file_id;
		if ($file.size() === 1) {
			file_id = $file.attr('data-file_id');
			deleteFile(file_id);
		}else if($file.size() > 1){
			if (window.confirm('同一名のファイルが複数存在します。\nすべてのファイルを削除しますか。\nこのうちのどれかのファイルを削除する場合はキャンセルし、個別に削除してください。')) {
				$file.each(function () {
					file_id = $(this).attr('data-file_id');
					deleteFile(file_id);
				});
			}else{
				console.log('[存在しないファイル]削除できませんでした。:' + filename);
			}
		}
	}
	function checkKinsoku() {
		var $dots = $('#vertical_draft > .vertical_paragraph > .vertical_row > .vertical_character.vertical_dot');
		if ($dots[0]) {
			$dots.each(function () {
				var $self = $(this);
				if (!($self.prev()[0])) {
					var $selfRow = $self.closest('.vertical_row');
					var $prevRow = $selfRow.prev('.vertical_row');	
					if ($prevRow[0]) {
						$self.remove();
						$selfRow.remove();
						$prevRow.children('.vertical_character.EOL').before($self);
					}
				}
			});
		}
	}
	function getUserID() {
		var userID = $('h1#site_title').attr('data-user_id');
		return userID;
	}
	function getRowLenOnPage() {
		// 1ページの行数
		return 40;
	}
	function getStrLenOfRow() {
		// 1行の文字数
		return 30;
	}
	function getRowPadding(rowLen) {
		var dispWidth = parseInt($('#vertical_draft').css('width'))-50; // 負の数になることも考慮すること
		var rowWidth = parseInt($('.vertical_paragraph > .vertical_row').css('width'));
		// dispWidth / (rowWidth + padding*2) == rowLen
		var padding = (dispWidth/rowLen - rowWidth)/2;
		return padding;
	}
	function getDisplayRowLen() {
		// 表示する行数
		var dispWidth = parseInt($('#vertical_draft').css('width'))-50;
		if (dispWidth <= 0) { return 0; }
		var rowWidth = parseInt($('.vertical_paragraph > .vertical_row').css('width'));
		console.log('rowBodyWidth:' + rowWidth);
		var rowBorderWidth = 2;
		console.log('rowBorderWidth:'+ rowBorderWidth);
		rowWidth += rowBorderWidth;
		var dispLen = dispWidth / rowWidth;
		console.log('dispWidth:'+ dispWidth);
		console.log('rowWidth:'+ rowWidth);
		console.log('getDisplayRowLen:' + dispLen);
		return dispLen -1; // 一行だけ余裕をもたせる
	}

	function getCurrentFileID() {
		var $file_title = $('#file_title');
		var file_id = $file_title.attr('data-file_id');
		return file_id;
	}
	function getRowLen() {
		// 文書内の行数
		var $rows = $('#vertical_draft > .vertical_paragraph > .vertical_row');
		return $rows.length;
	}
	function getRowLenOnFocusPage() {
		// 現在ページの行数
		var $row = $('.focus_row');
		var count = getCurrentRowOnPage(); // 現在行を加える
		// 後ろに数える
		while ($row[0] && !($row.hasClass('page_last_row'))) {
			count++;
			if (!($row.next('.vertical_row')[0])) {
				$row = $row.closest('.vertical_paragraph').next('.vertical_paragraph').children('.vertical_row:first-of-type');
			}else{
				$row = $row.next('.vertical_row');
			}
		}
		return count;
	}
	function getCurrentRowPos() {
		// 文書内での現在行
		var rowNum = $('.vertical_paragraph > .vertical_row').index($('.focus').closest('.vertical_row')) +1;
		return rowNum;
	}
	function getCurrentRowOnPage() {
		// 現在ページ内で何行目にいるか
		var $row = $('.focus_row');
		var count = 1; // page_break行の分
		// 前にさかのぼって数える
		while ($row[0] && !($row.hasClass('page_break'))) {
			count++;
			if (!($row.prev('.vertical_row')[0])) {
				$row = $row.closest('.vertical_paragraph').prev('.vertical_paragraph').children('.vertical_row:last-of-type');
			}else{
				$row = $row.prev('.vertical_row');
			}
		}
		return count;
	}
	function getCurrentStrPosOnRow() {
		// 現在文字位置
		var $focus = $('.focus');
		var strNum = $('.focus_row').children('.vertical_character').index($focus);
		console.log('getCurrentStrPosOnRow():' + strNum);
		return strNum;
	}
	function getStrLenOfFocusRow() {
		// フォーカス行の全文字数
		var strLen = $('.focus_row > .vertical_character').length;
		console.log('getStrLenOfFocusRow()' + strLen);
		return strLen - 1; // EOLの分を除く
	}
	function getCurrentPagePos() {
		// 現在ページ
		// page_breakを持つ行を探して段落をさかのぼり、その段落に複数のpage_breakがあればfocus行またはその段落の最後の行から行を遡ることでpage_breakを探している
		var $currentParagraph = $('.focus_row').closest('.vertical_paragraph');
		var $currentPage;
		while (!($currentPage = $currentParagraph.children('.vertical_row.page_break'))[0]) {
			$currentParagraph = $currentParagraph.prev('.vertical_paragraph');
		}
		if ($currentPage.length > 1) {
			if (!($currentParagraph.children('.focus_row'))[0]) {
				var $row = $('.focus_row');
				while (!($row.hasClass('page_break'))) {
					$row = $row.prev('.vertical_row');
					$currentPage = $row;
				}
			}else{
				$currentPage = $currentParagraph.children('.page_break:last-of-type');
			}
		}
		return $('.page_break').index($currentPage) + 1;
	}
	function getPageLen() {
		// 文書内の全ページ数
		return $('.page_break').length;
	}
	function getCharOnRowClick($row,rowEo) {
		// クリック箇所にもっとも近い.vertical_characterオブジェクトを返す
		// @param $row .vertical_rowクラスのオブジェクトｊ
		// @param rowEo クリックイベントのイベントオブジェクト
		var clickPos = {
			x: rowEo.pageX,
			y: rowEo.pageY
		};
		var $chars = $row.children('.vertical_character');
		var $resultObj = $chars.first('.vertical_character');
		var min = Number.MAX_VALUE;
		$chars.each(function () {
			var $self = $(this);
			var distance = getDistanceP2O(clickPos,$self);
			if (distance < min) {
				min = distance;
				$resultObj = $self;
			}
		});
		console.log('min_distance:'+ min);
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
	// ====================================================
	// 	initialize
	// ====================================================
	setNOCLine();
	appendParagraph("縦書きテキストエディタ");
	$('.vertical_row').addClass('displayRow').children('.vertical_character:first').addClass('focus');
	addPageBreak();
	Focus.addFocusRow();
	printInfomation();
	getFileList(globalUserID);
	// Event
	document.addEventListener("keydown",keyEvent ,false);
	document.getElementById("file_title").addEventListener("focus",function (e) {
		document.removeEventListener("keydown",keyEvent,false);
	},false);
	document.getElementById("file_title").addEventListener("blur",function (e) {
		document.addEventListener("keydown",keyEvent,false);
	});
	document.getElementById("file_title").addEventListener("keyup",function (e) {
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
			$('#file_title').blur();
			document.addEventListener("keydown",keyEvent,false);
		}
	});
	$('body').on('click','.file_list .file_name',function (e) {
		console.log('file name click');
		var file_id = $(this).attr('data-file_id');
		readFile(file_id);
	});
	// クリック箇所にフォーカスを移動する
	$('body').on('click','.vertical_paragraph > .vertical_row',function (e) {
		if ($('.input_buffer').text() !== "") { return; }
		var prev = $('.focus');
		prev.removeClass('focus');
		getCharOnRowClick($(this),e).addClass('focus'); // クリックした行のうち最も近い文字にフォーカスが当たる
		Focus.repositionCharNum();
		printInfomation();
	});
	$('body').on('mousewheel','#vertical_draft',wheelEvent);
})();
