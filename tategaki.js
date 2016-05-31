// 以下、jquery
// scriptの関数を利用されて他人のファイルを盗み見られないよう、サーバー側で読み込みの際に認証するようにしたほうがいいかも
console.log("in jsfile");
function getKanji(str,$firstConvertView,$secondConvertView,bl) {
	// 漢字変換
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
			bool: bl
		},
		success : function (json) {
			// 表示データを受け取ってからの処理
			console.log("communication success!");
			//$('#test').text($(xml).find('Candidata:first').text());
			//$('#test').text(json[0][0]); // ひらがな
			// $('#test').text(json[0][1][0]); // 変換候補１つ目
			//$('#test').text(json);
			if (this.$second && this.bool) {
				// 統合
				// getkanji(str,$first,$second,true)
				console.log('統合:');
				console.log('json:' + json);
				console.log('this.$first:' + this.$first);
				console.log('this.second:' + this.$second);
				console.log('this.bool:' + this.bool);
				var fphrase_num = this.$first.children('.phrase_num').text();
				var $newConvertView = createConvertView(fphrase_num,json[0]).attr('data-alternativeList','select');
				this.$first.before($newConvertView);
				// 第一候補の文字でinput_bufferの該当文字を置き換える
				insertPhraseToInputBuffer(fphrase_num,getStringFromRow($newConvertView.children('.vertical_row:first-of-type').addClass('alternative_focus')));
				$('.input_buffer > .vertical_character[data-phrase_num='+ this.$second.children('.phrase_num').text() +']').remove();
				// selectphraseクラスの付け替え
				$('.input_buffer > .vertical_character[data-phrase_num='+ fphrase_num +']').addClass('selectPhrase');
				// convertviewの位置を調整
				repositionConvertView();
				// 古いconvertviewを削除する
				this.$first.remove();
				this.$second.remove();

				resetPhraseNum();
			}else if(this.bool){
				console.log('一文節のみ変換:');
				console.log('json:' + json);
				console.log('this.$first:' + this.$first);
				console.log('this.second:' + this.$second);
				console.log('this.bool:' + this.bool);
				// 一文節のみ変換
				// getKanji(str,$firstconvertview,null,true)
				//var $newConvertView = $('<div>').addClass('convertView').attr('data-alternativeList','select');
				var $newConvertView = createConvertView(fphrase_num,json[0]).attr('data-alternativeList','select');
				var fphrase_num = this.$first.children('.phrase_num').text();
				this.$first.before($newConvertView);
				// 第一候補の文字でinput_bufferの該当文字を置き換える
				insertPhraseToInputBuffer(fphrase_num,getStringFromRow($newConvertView.children('.vertical_row:first-of-type').addClass('alternative_focus')));
				// selectphraseクラスの付け替え
				$('.input_buffer > .vertical_character[data-phrase_num='+ fphrase_num +']').addClass('selectPhrase');
				// convertviewの位置を調整
				repositionConvertView();
				// 古いconvertviewを削除する
				this.$first.remove();
			}else if (this.$second) {
				console.log('文節総数に変化なし:');
				console.log('json:' + json);
				console.log('this.$first:' + this.$first);
				console.log('this.second:' + this.$second);
				console.log('this.bool:' + this.bool);
				// 引数があれば文節変更による変換
				// 以下は文節総数に変化なしの場合
				// getKanji(str,$first,$second,false)
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
				// convertviewの位置を調整
				repositionConvertView();

				// 古いconvertviewを削除する
				this.$first.remove();
				this.$second.remove();

			}else if(this.$first){
				console.log('分離:');
				console.log('json:' + json);
				console.log('this.$first:' + this.$first);
				console.log('this.second:' + this.$second);
				console.log('this.bool:' + this.bool);
				// 引数があれば文節変更による変換
				// 分離
				// getKanji(str,$first,null,false)
				// convertviewを新たに作成する
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
				// convertviewの位置を調整
				repositionConvertView();

				// 古いconvertviewを削除する
				this.$first.remove();

				resetPhraseNum();
			}else{
				console.log('初変換:');
				console.log('json:' + json);
				console.log('this.first:' + this.$first);
				console.log('this.second:' + this.$second);
				console.log('this.bool:' + this.bool);
				// 初変換
				// getKanji(str,null,null,false)
				var $input_buffer = $('.input_buffer');
				var $characters = $input_buffer.children('.vertical_character');
				var $convertView = $('.convertView');
				var count = 0;
				for (var i = 0; i < json.length; i++) {
					var hiragana = json[i][0];
					var hiraLen = hiragana.length;
					// 文節番号をつける(同じ文節には同じ番号)
					for (var j = count; j < (count + hiraLen); j++) {
						//$characters.eq(j).data("phrase_num",i);
						$characters.eq(j).attr('data-phrase_num',i);
						//$characters.eq(j).attr('class','aaa');
					}
					count += hiraLen;
					insertPhraseToInputBuffer(i,json[i][1][0]); // 第一候補の漢字でinput_bufferの文字列を置き換える
					// 変換候補表示
					// convertviewを文節分作成する
					var $convertView = createConvertView(i,json[i]);
					$('#vertical_draft').before($convertView); // 順序を守って並べるために、vertical_draftからのbeforeでconvertviewを挿入
				}
				var $convertViews = $('.convertView');
				$('.convertView:eq(0)').attr('data-alternativeList','select');
				$('.convertView[data-alternativeList="select"] > .vertical_row:first-of-type').addClass('alternative_focus');
				// convertviewの位置を調整
				repositionConvertView();

				// 現在選択中の文節にselectphraseクラスを設定する
				var phraseNum = $('.alternative_focus').siblings('.phrase_num').text(); // 現在選択中の文節番号
				$('.input_buffer > .vertical_character[data-phrase_num='+ phraseNum + ']').addClass('selectPhrase');
			}
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
	// jsonArrayはひらがなと漢字配列が入っているように、json[i]の形で渡す
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
	$convertViews.css('top',y + 'px').css('left',(x - parseInt($convertViews.css('width').substring(0,$convertViews.css('width').length -2))) + 'px');
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
	$('#vertical_draft > .vertical_paragraph').remove();
	$.ajax({
		type : "POST",
		url : "/tategaki/ReadFile",
		data : {
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
			$('#title').val(data.filename).attr('data-file_id',this.id);
			// 文章のhtml書き出し
			printString(data.literaArray,getStrLenOfRow());
			// 禁則処理
			checkKinsoku();
			// 最初の４０行のみ表示する
			addDisplayRow(0,getDisplayRowLen());
			Focus.init();
			$('.infomation > .saved').text(data.saved);

			// 改ページ行の作成
			addPageBreak();
			printInfomation();
			//$('#vertical_draft > .vertical_paragraph > .vertical_row:nth-child(40n)').each(function () {
			//	$(this).addClass('page_break');
			//});
		},
		error : function (XMLHttpRequest, textStatus, errorThrown) {
			alert("Error:"+ textStatus + ":\n" + errorThrown + ":status=" + XMLHttpRequest.status + "in readFile");
		}
	});
}
// 改ページクラスの付与
function addPageBreak() {
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
// 配列を引数にして、各文字列を表示
// strLen: １行の文字数
function printString(strArray,strLen) {
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
	var $title = $('#title');
	var user_id = getUserID();
	//var filename = $title.text();
	var filename = $title.val();
	if (filename.length === 0) {
		alert("ファイル名を入力してください");
		return;
	}
	if (filename.indexOf("'") > -1 || filename.indexOf("<")>-1 || filename.indexOf(">")>-1) {
		alert("ファイル名に使用不可能文字が含まれています。");
		return;
	}
	var file_id = $title.attr('data-file_id');
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
	// 配列をJson文字列に変換する
	var contentsJson = JSON.stringify(contentsArray);
	var date = Date.now() + "";
	console.log(date);

	console.log("communication start point");
	$.ajax({
		type : "POST",
		url : "/tategaki/WriteFile",
		data : {
			file_id: file_id,
			filename: filename,
			json: contentsJson,
			saved: date
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
			$('.saved').text(data.date);
			getFileList(this.user_id);
			console.log('保存しました:file_id=' + this.file_id);
		},
		error : function (XMLHttpRequest, textStatus, errorThrown) {
			alert("Error:"+ textStatus + ":\n" + errorThrown + ":status=" + XMLHttpRequest.status + "in saveFile");
		}
	});
}
function getFileList(userId){
	"use strict";
	console.log("communication start point in getFileList(userID:"+ userId +")");
	$('.file_list').empty();
	$.ajax({
		type : "POST",
		url : "/tategaki/GetFileList",
		data : {
			user_id: userId
		},
		dataType : "json",
		success : function (data) {
			// 表示データを受け取ってからの処理
			// data.fileid_list[] : ファイルid
			// data.filename_list[] : ファイル名
			if(data.fileId_list) console.log("communication success! in getFileList()");
			var $fileList = $('.file_list').text('ファイルを開く');
			var file_id;
			var filename;
			var $filename;
			for (var i = 0; i < data.fileId_list.length; i++) {
				file_id = data.fileId_list[i];
				filename = data.filename_list[i];
				//$filename = $('<li>').addClass('file_name').attr('data-file_id',file_id).attr('data-file_name',filename).text(filename);
				$filename = $('<a>').addClass('file_name').attr('href','#').attr('data-file_id',file_id).attr('data-file_name',filename).text(filename);
				//$fileList.append($filename);
				$fileList.append($('<li>').append($filename));
			}
		},
		error : function (XMLHttpRequest, textStatus, errorThrown) {
			alert("Error:"+ textStatus + ":\n" + errorThrown + ":status=" + XMLHttpRequest.status + " in getFileList");
		}
	});
}
//$('body').on('click','.file_list > .file_name',function (e) {
$('body').on('click','.file_list .file_name',function (e) {
	console.log('file name click');
	var file_id = $(this).attr('data-file_id');
	readFile(file_id);
});
function defaultNewFile() {
	newFile('newfile');
}
function newFile(filename){
	"use strict";
	console.log("communication start point");
	$('#vertical_draft > .vertical_paragraph').remove();
	var user_id = getUserID();
	var date = Date.now() + "";
	$.ajax({
		type : "POST",
		url : "/tategaki/NewFile",
		data : {
			filename: filename,
			user_id: user_id,
			saved: date
		},
		context : {
			user_id: user_id
		},
		dataType : "json",
		success : function (data) {
			// 表示データを受け取ってからの処理
			if(data.newFileID) console.log("communication success!");
			// ファイル名を表示
			//$('#title').text(data.filename).attr('data-file_id',data.newFileID);
			$('#title').val(data.filename).attr('data-file_id',data.newFileID);
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
	var date = Date.now() + "";
	$.ajax({
		type : "POST",
		url : "/tategaki/NewFile",
		data : {
			filename: filename,
			user_id: user_id,
			saved: date
		},
		context : {
			user_id: user_id
		},
		dataType : "json",
		success : function (data) {
			// 表示データを受け取ってからの処理
			if(data.newFileID) console.log("communication success!");
			// ファイル名を表示
			//$('#title').text(data.filename).attr('data-file_id',data.newFileID);
			$('#title').val(data.filename).attr('data-file_id',data.newFileID);
			saveFile();
		},
		error : function (XMLHttpRequest, textStatus, errorThrown) {
			alert("Error:"+ textStatus + ":\n" + errorThrown + ":status=" + XMLHttpRequest.status + "in saveAs");
		}
	});
}
function defaultDeleteFile() {
	var file_id = $('input#title').attr('data-file_id');
	deleteFile(file_id);
}
function deleteFile(file_id) {
	"use strict";
	console.log("communication start point");
	if(window.confirm('本当に削除しますか:'+ getFileNameFromFileID(file_id) + '('+ file_id +')')){
		$.ajax({
			type : "POST",
			url : "/tategaki/DeleteFile",
			data : {
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
					//var $filenames = $('.file_list > .file_name');
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
	var rtn = "";
	for (var i = 0; i < $rows.length; ++i) {
		rtn += getStringFromRow($rows.eq(i));
	}
	return rtn;
}
function init() {
	// miss:セレクタでタグを選ぶとき、<>で囲むのを忘れると解析がうまく行かないためか、ブラウザがフリーズする
	var $container = $('#container');

	var strLen = getStrLenOfRow();
	var $NOC_line = $('<div>').addClass('NOC_line');
	var $number_of_char;
	for (var i = 0; i < strLen; i++) {
		$number_of_char = $('<span>').addClass('number_of_char');
		$NOC_line.append($number_of_char);
	}
	$('#vertical_draft').prepend($NOC_line);

	// 入力バッファー
	//var $input_buffer = $('<div>').addClass('input_buffer');
	//$container.append($input_buffer);
	//$input_buffer.hide();

	//// メニューバー
	//var $menu = $('<div>').addClass('menubar');
	//var $menu_file = $('<span>').addClass('menu_file').html("&nbsp;ファイル&nbsp;");
	//$menu.append($menu_file);
	//$container.prepend($menu);
	// 情報バー
	//var $info = $('<div>').addClass('infomation');
	//$info.html("文字:<span class='str_num'>-</span>/<span class='str_len'>-</span>　行:<span class='row_num'>1</span>/<span class='row_len'>-</span>　ページ:<span class='page_num'>-</span>/<span class='page_len'>-</span>　最終更新日時:<span class='saved'>-</span>");
	//$container.children('#vertical_draft').append($info);

	// ヘッダー
	//var $header = $('<div>').attr('id','header');
	//$container.after($header);

	//var $button_container = $('<div>').addClass('button_container');
	//$save_button = $('<button>').attr('onclick','saveFile()').text('保存');
	//$new_button = $('<button>').attr('onclick','defaultNewFile()').text('new');
	//$del_button = $('<button>').attr('onclick','defaultDeleteFile()').text('削除');
	//$button_container.append($save_button).append($new_button).append($del_button);
	//$header.append($button_container);

	// ファイルリスト
	//var $file_list = $('<div>').addClass('file_list');
	//$container.after($file_list);

	// ファイル名
	//var $title_input = $('<input>').attr('type','text').attr('id','title');
	//$container.prepend($title_input);
	//document.getElementById("title").addEventListener("focus",function (e) {
	//	// keyeventを外さなければinputに文字を入力できない
	//	document.removeEventListener("keydown",keyEvent,false);
	//},false);
	//document.getElementById("title").addEventListener("blur",function (e) {
	//	document.addEventListener("keydown",keyEvent,false);
	//});
	//document.getElementById("title").addEventListener("keyup",function (e) {
	//	var keycode;
	//	if (document.all) {
	//		// IE
	//		keycode = e.keyCode
	//	}else{
	//		// IE以外
	//		keycode = e.which;
	//	}
	//	if (keycode === 13) {
	//		// enter
	//		$('#title').blur();
	//		document.addEventListener("keydown",keyEvent,false);
	//	}
	//});

}
document.getElementById("title").addEventListener("focus",function (e) {
	// keyeventを外さなければinputに文字を入力できない
	document.removeEventListener("keydown",keyEvent,false);
},false);
document.getElementById("title").addEventListener("blur",function (e) {
	document.addEventListener("keydown",keyEvent,false);
});
document.getElementById("title").addEventListener("keyup",function (e) {
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
		$('#title').blur();
		document.addEventListener("keydown",keyEvent,false);
	}
});
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
	// 文節番号の初期化
	$newInput_Buffer.children('.vertical_character').attr('data-phrase_num',-1);
	// 文節番号のコピー(変換に利用する)
	if ($input_buffer.text()!=="" && $input_buffer.children('.vertical_character:first-of-type').attr('data-phrase_num') !== "-1") {
		for (var i = 0; i < $input_buffer.children('.vertical_character').length; i++) {
			var $oldCharacter = $input_buffer.children('.vertical_character').eq(i);
			var $newCharacter = $newInput_Buffer.children('.vertical_character').eq(i);
			$newCharacter.attr('data-phrase_num',$oldCharacter.attr('data-phrase_num'));
		}
	}
	// 新しいinput_bufferを挿入
	$input_buffer.before($newInput_Buffer);
	$input_buffer.remove(); // 古いinput_bufferを削除
	$newInput_Buffer.show();
	moveInput(); // 新しいinput_bufferの位置調整　miss: $input_bufferは一度削除して新しく作り直すので、cssの適用などは新しい方にしなければダメ

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
	// 入れ替えた文字に文節番号を付与する
	return $('.input_buffer > .vertical_character[data-phrase_num="-10"]').attr('data-phrase_num',phNum);
}
function appendParagraph(str) {
	"use strict";
	// miss:.vertical_draftではなく、#vertical_draft
	// createparagraphで作成した段落をvertical_draftにappend
	$('#vertical_draft').append(createParapraph(str));
}

function createParapraph(str) {
	"use strict";
	// 文字列をstrLen文字ごとに区切って行にして、paragraphにappendする
	// 作成したparagraphを返す
	var strLen = getStrLenOfRow(); // １行の文字数
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
	// .vertical_rowにEOLを追加し、EOLの直前に書く文字を挿入していく
	"use strict";
	if(str == null) return;
	var $row = $('<div>').addClass('vertical_row');
	var count = str.length;
	// EOLの追加
	var $EOL = $('<span>').addClass('vertical_character').addClass('EOL');
	$row.append($EOL);
	for (var i = 0; i < count; i++) {
		// 文字を作って挿入
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
	var $focusRow = $focus.closest('.vertical_row');
	var $div; // 改行以降の文字を入れる(次の行になる)
	var $nextRow = $focusRow.nextAll('.vertical_row:first'); //改行前の次の行
	var $prevChar = $focus.prev(); //移動しない文字の最後
	if (!($prevChar[0])) {
		// 行頭フォーカスで改行
		var $baseParagraph = $focusRow.closest('.vertical_paragraph');
		var $paragraph = $('<div>').addClass('vertical_paragraph');
		var $row = createRow("");
		$paragraph.append($row);
		//	// フォーカス行より前に新しい行を挿入するため、最初のdisplayRowをremoveClassする
		//	if($('.displayRow').length === 40 && $('.displayRow:last')[0] === $('.focus').closest('.vertical_row')[0]) $('.displayRow:first').removeClass('displayRow');
		if (($focusRow.prev())[0]) {
			// 段落途中での行頭改行では、段落を２つに分ける
			var $afterParagraph = createDevideParagraph($focusRow);
			// $baseParagraph,$afterParagraphの順番になるように
			$baseParagraph.after($afterParagraph);
			//		// displayrow
			//	var startDispNum = $('.vertical_paragraph > .vertical_row').index($('.displayRow:first'));
			//	console.log('startDispNum:' + startDispNum);
			//		addDisplayRow(startDispNum,startDispNum+40);
			return;
		}
		// 段落最初での改行では、その前のところに空行挿入
		$baseParagraph.before($paragraph.addClass('displayRow'));
		//		// displayrow
		//	var startDispNum = $('.vertical_paragraph > .vertical_row').index($('.displayRow:first'));
		//	console.log('startDispNum:' + startDispNum);
		//		addDisplayRow(startDispNum,startDispNum+40);
		return;
	}

	// 同じ段落内で次の行が存在するか
	if ($nextRow[0]) {
		$div = $nextRow;
	}else{
		// 次の行がなければ新しく作る
		$div = createRow("");
		$focusRow.after($div);
	}
	var $insertPosObj = $div.children('.vertical_character:first-of-type'); //挿入先の最初の文字
	var $vChar = $focus; // 移動文字
	while($vChar[0] && !($vChar.hasClass('EOL'))){ // EOLは移動しない
		// $divの先頭にある$insertPosObjに、$prevCharの次の文字を挿入していく
		$vChar.remove();
		$insertPosObj.before($vChar);
		$vChar = $prevChar.nextAll('.vertical_character:first');
	}
	if ($focus.hasClass('EOL')) { // EOLにフォーカスがあると、EOLが動かないために、フォーカスが次の行に行かないので強制的に動かす必要あり
		// = 行末での改行
		$focus.removeClass('focus');
		$div.children('.vertical_character:first-of-type').addClass('focus');
	}
	// 移動文字列を次の行に入れた結果規定文字数を超えた場合のために、次の行を文字数調整
	cordinateStringNumber($div,getStrLenOfRow());

	// $div以降を新しい段落とする
	var $currentParagraph = $div.closest('.vertical_paragraph');
	var $newParagraph = createDevideParagraph($div);
	$currentParagraph.after($newParagraph);

	Focus.repositionCharNum();
	//		// displayrow
	//	var startDispNum = $('.vertical_paragraph > .vertical_row').index($('.displayRow:first'));
	//	console.log('startDispNum:' + startDispNum);
	//		addDisplayRow(startDispNum,startDispNum+40);
}
function createDevideParagraph($div) {
	// $div以降を新しい段落とする
	// 段落を分けるときに利用する
	var $currentParagraph = $div.closest('.vertical_paragraph');
	var $newParagraph = $('<div>').addClass('vertical_paragraph');
	var $nextDiv;
	do{
		// ここでの$divは移動対象行
		// $divを新しい段落に移動していく
		$nextDiv = $div.next(); // $divを移動すると次の移動対象選択には使えないので、次の行を保持しておく
		$div.remove(); // 旧段落の$divを削除して
		$newParagraph.append($div); // 削除した$divを新しい段落に
		$div = $nextDiv;
	}while($div[0]);

	return $newParagraph;
}
// 入力などの結果規定文字数を超えた行の文字数を調整する
// 同一段落内で完結
// $vRow: 調整行
// strLen: １行の文字数
function cordinateStringNumber($vRow,strLen) {
	if($vRow.children().length <= (strLen +1)) return; //調整行の文字数が規定値以下なら調整の必要なし(EOL含めると31個)
	var $div;
	var $nextRow = $vRow.nextAll('.vertical_row:first');
	if ($nextRow[0]) {
		$div = $nextRow;
	}else{
		// 次の行がなければ新しく作る
		$div = createRow("");
		$vRow.after($div);
	}
	var $prevChar = $vRow.children('.vertical_character').eq(strLen -1); //移動しない文字の最後
	var $insertPosObj = $div.children('.vertical_character:first-of-type'); //挿入先の最初の文字
	var $vChar = $prevChar.nextAll('.vertical_character:first'); // 移動文字
	while($vChar[0] && !($vChar.hasClass('EOL'))){ // EOLは移動しない
		$vChar.remove();
		$insertPosObj.before($vChar);
		$vChar = $prevChar.nextAll('.vertical_character:first');
	}
	// 移動先の行がstrlen文字を超えている時のために再帰
	cordinateStringNumber($div,strLen);
	// focusが調整行の最後にあれば動いてくれないので、強制的に動かす
	if ($prevChar.nextAll('.vertical_character:first').hasClass('focus')) {
		$('.focus').removeClass('focus');
		$insertPosObj.addClass('focus');
		Focus.repositionCharNum();
	}
}
// $vCharacter: 削除文字
// $rowofdelchar: 削除文字のある行
function deleteCharacter($vCharacter,$rowOfDelChar) {
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
		//	// displayrowを増やす
		//	var $lastDisp = $('.displayRow:last');
		//	var $newDisp = $lastDisp.next('.displayRow');
		//	if (!($newDisp[0])) {
		//		$newDisp = $lastDisp.closest('.vertical_paragraph').next('.vertical_paragraph').children('.vertical_row:first-of-type');
		//	}
		//	$newDisp.addClass('displayRow');
	}
	Focus.repositionCharNum();
	return character;
}
// $bringRowの次の行以降の最初の文字を、その前の行の最後に移動する
function backChar($bringRow) {
	var $nextRow = $bringRow.nextAll('.vertical_row:first');
	if(!($nextRow[0])) return;
	var $bc = $nextRow.children('.vertical_character:first-of-type');
	if($bc.hasClass('EOL')){
		// 次の行が空行ならその行を削除
		$nextRow.remove();
		//	// displayrowを増やす
		//	var $lastDisp = $('.displayRow:last');
		//	var $newDisp = $lastDisp.next('.displayRow');
		//	if (!($newDisp[0])) {
		//		$newDisp = $lastDisp.closest('.vertical_paragraph').next('.vertical_paragraph').children('.vertical_row:first-of-type');
		//	}
		//	$newDisp.addClass('displayRow');
		return;
	}
	if ($bc.next().hasClass('EOL')) {
		// 削除すると空行ができる場合
		$bringRow.children('.EOL').before($bc);
		$nextRow.remove();
		//	// displayrowを増やす
		//	var $lastDisp = $('.displayRow:last');
		//	var $newDisp = $lastDisp.next('.displayRow');
		//	if (!($newDisp[0])) {
		//		$newDisp = $lastDisp.closest('.vertical_paragraph').next('.vertical_paragraph').children('.vertical_row:first-of-type');
		//	}
		//	$newDisp.addClass('displayRow');
		return;
	}
	$bc.remove();
	$bringRow.children('.EOL').before($bc);
	backChar($nextRow);
}
var Focus = {
	init: function () {
		//$('#vertical_draft > .vertical_paragraph:eq(0) > .vertical_row:eq(0) > .vertical_character:eq(0)').addClass('focus');
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
		//changeDisplayRow();
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
		//changeDisplayRow();
		this.addFocusRow();
	},
	shiftRight: function () {
		// カーソルを前の行に移動する
		var prev = $('.focus');
		var NOC_Num = $('.NOC_line').children('.number_of_char').index($('.focus_char'));
		var next = prev
			.closest('.vertical_row')
			.prevAll('.vertical_row:first')
			//.children('.vertical_character:eq('+ $('.NOC_line')
			//.children('.number_of_char').index($('.focus_char')) +')');
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
			//next = prev.parents('.vertical_paragraph').prevAll('.vertical_paragraph:first').children('.vertical_row:last-of-type').children('.vertical_character:eq('+ $('.NOC_line').children('.number_of_char').index($('.focus_char')) +')');
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
		//changeDisplayRow();
		this.addFocusRow();
	},
	shiftLeft: function () {
		// カーソルを次の行に移動する
		var prev = $('.focus');
		var NOC_Num = $('.NOC_line').children('.number_of_char').index($('.focus_char'));
		//var next = prev.closest('.vertical_row').nextAll('.vertical_row:first').children('.vertical_character:eq('+ $('.NOC_line').children('.number_of_char').index($('.focus_char')) +')');
		var next = prev.closest('.vertical_row').nextAll('.vertical_row:first').children('.vertical_character').eq(NOC_Num);
		if (!(next[0])) {
			next = prev.closest('.vertical_row').nextAll('.vertical_row:first').children('.vertical_character:last-of-type');
		}
		if (!(next[0])) {
			// 段落の最後に達していたら、次の段落
			//next = prev.parents('.vertical_paragraph').nextAll('.vertical_paragraph:first').children('.vertical_row:first-of-type').children('.vertical_character:eq('+ $('.NOC_line').children('.number_of_char').index($('.focus_char')) +')');
			next = prev.parents('.vertical_paragraph').nextAll('.vertical_paragraph:first').children('.vertical_row:first-of-type').children('.vertical_character').eq(NOC_Num);
		}
		if (!(next[0])) {
			// 最後をlast-of-typeにしていたらなぜかシンタックスエラー......
			next = prev.parents('.vertical_paragraph').nextAll('.vertical_paragraph:first').children('.vertical_row:first-of-type').children('.EOL');
		}
		if (!(next[0])) {
			return;
		}
		prev.removeClass('focus');
		next.addClass('focus');
		//changeDisplayRow();
		this.addFocusRow();
	},
	repositionCharNum: function () {
		// charNumの位置を再調整
		var focusPos = $('.focus').closest('.vertical_row').children().index($('.focus'));
		$('.focus_char').removeClass('focus_char');
		//$('.NOC_line > .number_of_char:eq(' + focusPos + ')').addClass('focus_char');
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

// クリック箇所にフォーカスを移動する
//$('body').on('click','.vertical_row > .vertical_character',function (e) {
$('body').on('click','.vertical_paragraph > .vertical_row',function (e) {
	if ($('.input_buffer').text() !== "") { return; }
	var prev = $('.focus');
	prev.removeClass('focus');
	//$(this).addClass('focus');
	getCharOnRowClick($(this),e).addClass('focus');
	Focus.repositionCharNum();
	//setCursor($(this));
	printInfomation();
});
$('body').on('mousewheel','#vertical_draft',wheelEvent);
function wheelEvent(e,delta,deltaX,deltaY) {
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
	//if ($('.convertView').text() !== "") {
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
						getKanji(newString,$firstConvertView,$secondConvertView,true);
						break;
					}
					newString = firstKana + secondKana.charAt(0) + "," + secondKana.substring(1);
					getKanji(newString,$firstConvertView,$secondConvertView);
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
				getKanji(inputStr);
				break;
			case 118:
				changeKatakanaAtInput();
				break;
			default:
				// input_bufferの更新
				var inputStr = getStringFromRow($input_buffer); //もともとの文字列
				var newInputStr;
				if (e.shiftKey) {
					newInputStr = inputStr + key_table.shift_key[(new Number(keycode)).toString()];
				}else{
					newInputStr = key_table.getString(inputStr,keycode); //keycodeを加えた新しい文字列
				}
				if(newInputStr.indexOf("undefined") !== -1){
					// 未定義文字(alt,ctrl,tabなど)はbreak
					break;
				}
				insertStringToInputBuffer(newInputStr);
				//moveInput(); // 新しいinput_bufferの位置調整　miss: $input_bufferは一度削除して新しく作り直すので、cssの適用などは新しい方にしなければダメ
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
					//case 18:
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
					openNextFile();
					textcheck = false;
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
					// input_bufferに何もなければ改行
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
						newInputStr = key_table.shift_key[(new Number(keycode)).toString()];
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

	// 全文字消した場合
	//var $paragraphs = $('#vertical_draft > .vertical_paragraph');
	//if ($paragraphs.length == 0) {
	//	appendParagraph("");
	//	$('.vertical_paragraph > .vertical_row > .vertical_character').addClass('.focus');
	//}
	console.log(keycode);
	// デフォルトの動作を無効化する
	e.preventDefault();
	//e.stopPropagation();
	//return false;
}
document.addEventListener("keydown",keyEvent ,false);

function reDisplay() {
	var startDispNum = $('.vertical_paragraph > .vertical_row').index($('.displayRow:first'));
	addDisplayRow(startDispNum,startDispNum+getDisplayRowLen()); // 行数変化
	// if ($('.displayRow').length >= getDisplayRowLen())  // 文末からの行頭BS等で表示行数が減少した場合に対応できない条件式
	if (getRowLen() >= getDisplayRowLen()) {
		// 全行数が表示行数より少なければ実行しない
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
		// -----------------以下はDown のみと同じ--------------
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
		// ---------------ここまでDownと同じ-------------------
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
	getKanji(hira.substring(0,hira.length-1),$selectConvertView,null,true);

}
function shiftUpOnConvert() {
	var $firstConvertView = $('.convertView[data-alternativeList="select"]');
	var $secondConvertView = $firstConvertView.next('.convertView');
	//var $secondConvertView = $firstConvertView.next('.convertView');
	var firstKana = getStringFromRow($firstConvertView.children('.vertical_row:last'));
	if(firstKana.length < 2) return;
	var newString;
	var secondKana;
	if(!($secondConvertView[0])){
		// 最後の文節の場合
		// 分離
		newString = firstKana.substring(0,firstKana.length-1) + "," + firstKana.substring(firstKana.length-1,firstKana.length);
		getKanji(newString,$firstConvertView);
		return;
	}else{
		secondKana = getStringFromRow($secondConvertView.children('.vertical_row:last'));
	}
	newString = firstKana.substring(0,firstKana.length-1) + ","+ firstKana.substring(firstKana.length-1,firstKana.length) + secondKana;
	getKanji(newString,$firstConvertView,$secondConvertView);
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
	var height = (parseInt($character.css('height').substring(0,$character.css('height').length-2)) + parseInt($character.css('border-width').substring(0,$character.css('border-width').length-2))*2) * ($input_buffer.children('.vertical_character').length-1);
	//console.log('children.length' + $input_buffer.children('.vertical_character').length);
	$input_buffer.css('height',height + 'px');
}
function setCursor($cursorObj) {
	//var timer = "";
	//var bw = $cursorObj.css('border-width').substring(0,$cursorObj.css('border-width').length-2); // borderの幅
	//bw = bw ^ 1; // 排他的論理和
	//$cursorObj.css('border-width',bw + 'px');
	//	clearTimeout(timer);
	$cursorObj.css('border-color',$cursorObj.css('border-color')=='yellowgreen'?'black':'yellowgreen');
	//console.log(bw);
	var id = $('.data').text();
	clearTimeout(id);
	id = setTimeout(setCursor($cursorObj),5000);
	$('.data').text(id);
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
		// miss: $nextRowが段落をまたいで見つからなかったため、shiftRightした時に最初にaddClassした行がすぐさまremoveclassされていた
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
	// 現在行の表示
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
	console.log('phraseNum:' + phraseNum);
	console.log('str:' + str);
	insertPhraseToInputBuffer(phraseNum,str).addClass('selectPhrase');
	resizeInputBuffer();
}
function changeKatakanaAtInput() {
	var str = getStringFromRow($('.input_buffer.vertical_row'));
	insertStringToInputBuffer(getKatakana(str)).children('.vertical_character:not(.EOL)').addClass('selectPhrase');
}
function getKatakana(str) {
	var rtn = "";
	var c;
	var len = str.length;
	for (var i = 0; i < len; i++) {
		c = key_table.katakana[str.charAt(i)];
		if (c) {
			rtn += c;
		}else{
			// 変換できなければ元の文字をそのまま連結
			rtn += str.charAt(i);
		}
	}
	return rtn;
}
function startCommandMode() {
	console.log('startCommandMode');
	var $command = $('<input>').attr('type','text').attr('id','command');
	$('#container').after($command);
	document.removeEventListener("keydown",keyEvent,false);
	// フォーカスを当てたからvalueをセットすることで末尾にカーソルが移動される
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
					 setTitle(command[1]);
				 }
		default:
				 break;
	}
}
function setTitle(filename) {
	$('input#title').val(filename);
}
function openNextFile() {
	console.log('openNextFile()');
	//var $currentFile = $('.file_list > .file_name[data-file_id="'+ $('input#title').attr('data-file_id') +'"]');
	var $currentFileLi = $('.file_list > li').has('.file_name[data-file_id="'+ $('input#title').attr('data-file_id') +'"]');
	var $nextFile;
	if ($currentFileLi[0]) {
		//$nextFile = $currentFile.nextAll('.file_name:first');
		$nextFile = $currentFileLi.nextAll('li:first').children('.file_name');
	}else{
		//$nextFile = $('.file_list > .file_name:first-of-type');
		$nextFile = $('.file_list .file_name:first');
	}
	if($nextFile[0]) readFile($nextFile.attr('data-file_id'));
}
function openPrevFile() {
	console.log('openPrevFile()');
	//var $currentFile = $('.file_list > .file_name[data-file_id="'+ $('input#title').attr('data-file_id') +'"]');
	var $currentFileLi = $('.file_list > li').has('.file_name[data-file_id="'+ $('input#title').attr('data-file_id') +'"]');
	//var $nextFile = $currentFileLi.prevAll('.file_name:first');
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
	//var $filename = $('.file_list > .file_name:contains('+ filename +')');
	//var $filename = $('.file_list > .file_name[data-file_name="'+ filename +'"]');
	var $filename = $('.file_list .file_name[data-file_name="'+ filename +'"]');
	return $filename;
}
function getFileNameFromFileID(file_id) {
	//return $('.file_list > .file_name[data-file_id="'+ file_id +'"]').attr('data-file_name');
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
	// dispWidth / (rowWidth + padding*2) = rowLen
	var padding = (dispWidth/rowLen - rowWidth)/2;
	return padding;
}
function getDisplayRowLen() {
	// 表示する行数
	var dispWidth = parseInt($('#vertical_draft').css('width'))-50; // 負の数になることも考慮すること
	var rowWidth = parseInt($('.vertical_paragraph > .vertical_row').css('width'));
	console.log('rowBodyWidth:' + rowWidth);
	//var rowBorderWidth = parseInt($('.vertical_paragraph > .vertical_row').css('border-width'))*2;
	var rowBorderWidth = 2;
	console.log('rowBorderWidth:'+ rowBorderWidth);
	rowWidth += rowBorderWidth;
	//return 40;
	var dispLen = dispWidth / rowWidth;
	console.log('dispWidth:'+ dispWidth);
	console.log('rowWidth:'+ rowWidth);
	console.log('getDisplayRowLen:' + dispLen);
	return dispLen -1; // 一行だけ余裕をもたせる
}

function getCurrentFileID() {
	var $title = $('#title');
	var file_id = $title.attr('data-file_id');
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
// クリック箇所にもっとも近い.vertical_characterオブジェクトを返す
// @param $row .vertical_rowクラスのオブジェクトｊ
// @param rowEo クリックイベントのイベントオブジェクト
function getCharOnRowClick($row,rowEo) {
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
	// √{(b.x - a.x)^2+ (b.y - a.y)}
	//return Math.sqrt(Math.pow(bCenterPos.x-aCenterPos.x,2)+Math.pow(bCenterPos.y-aCenterPos.y,2));
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
	// べき乗を使って足しているので、戻り値は必ず正の数
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
