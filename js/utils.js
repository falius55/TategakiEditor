'use strict';
console.log('utils.js');
const Util = {
	/**
	 * baseArrayをcnt個ずつの配列に分割する
	 */
	splitArray:function(baseArray,cnt) {
		'use strict';
		const b = baseArray.length;
		const newArray = [];

		for (let i = 0,j,p; i < Math.ceil(b/cnt); i++) {
			j = i*cnt;
			p = baseArray.slice(j,j+cnt);
			newArray.push(p);
		}
		return newArray;
	},
	copyArray:function (array) {
		'use strict';
		const retArray = [];
		for (let value of array) {
			retArray.push(value);
		}
		return retArray;
	},
	// ２点間の距離を計算する
	computeDistanceP2P:function(x1,y1,x2,y2) {
		// ２乗を使っているので、戻り値は必ず正の数になる
		// √{(b.x - a.x)^2+ (b.y - a.y)^2}
		return Math.sqrt(Math.pow(x2-x1,2)+Math.pow(y2-y1,2));
	},
	post: function (url,data,callback) {
		console.log('post send:', data);
		const xhr = new XMLHttpRequest();
		xhr.responseType = 'json';
		xhr.open('POST',url);
		xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded;charset=UTF-8');

		let sendData = '';
		for (let name in data) {
			if (sendData != '') {
				sendData += '&';
			}
			sendData += name + '=' + encodeURI(data[name]).replace(/&/g,'%26');
		}

		xhr.addEventListener('load',function (e) {
			if (xhr.response) {
				callback(xhr.response);
				console.log('success', xhr.response, e);
			} else {
				console.log('unsuccess', xhr.response, e);
			}
		});
		xhr.addEventListener('abort',function (e) {
			console.log('abort', e);
		});
		xhr.send(sendData);
	}
};
// closer
/**
 * DOM操作クロージャをまとめます
 */
const ElemCreater = {};
ElemCreater.createCharElement = (function () {
	const eCharTemplate = document.createElement('span');
	eCharTemplate.classList.add('char');
	eCharTemplate.classList.add('display');

	return function (data) {
		const eChar = eCharTemplate.cloneNode(true);
		const char = data['char'];
		const classArr = data['decolation'];
		const fontSize = data['fontSize'];
		eChar.textContent = char;
		eChar.dataset.fontSize = fontSize || 'auto';
		for (let decolation of classArr) {
			eChar.classList.add(decolation);
		}

		// 文字の種類に応じて付与するクラス
		if (/[。、,.,]/.test(char))
			eChar.classList.add('vertical-dot');
		else if (/[「『]/.test(char))
			eChar.classList.add('vertical-before-kagi-bracket');
		else if (/[」』]/.test(char))
			eChar.classList.add('vertical-after-kagi-bracket');
		else if (/[（\[<\{【\(［〈]/.test(char))
			eChar.classList.add('vertical-before-bracket');
		else if (/[\)\]>\}】）］〉]/.test(char))
			eChar.classList.add('vertical-after-bracket');
		else if (/[-ー―〜]/.test(char))
			eChar.classList.add('character-line');
		else if (/[a-z]/.test(char))
			eChar.classList.add('alphabet');
		else if (/[１-９]/.test(char))
			eChar.classList.add('number');
		else if (/[っゃゅょぁぃぅぇぉァィゥェォッャュョ]/.test(char))
			eChar.classList.add('yoin');

		return eChar;
	}
})();
ElemCreater.createRowElement = (function () {
	/*
	 *	[												 // 各文字のオブジェクトが配列で格納される
	 *		{											 // 文字を表すオブジェクト
	 *			"char":"あ",
	 *			"decolation":["decolation-color-blue"]
	 *		},
	 *		{
	 *			"char":"い",
	 *			"decolation":null
	 *		}
	 *	]
	 */
	const eRowTemplate = document.createElement('div');
	eRowTemplate.classList.add('row');
	eRowTemplate.classList.add('display');
	const eEOL = document.createElement('span');
	eEOL.classList.add('char');
	eEOL.classList.add('EOL');
	eEOL.classList.add('display');
	eRowTemplate.appendChild(eEOL);

	return function (data) {
		const eRow = eRowTemplate.cloneNode(true);
		return eRow;
	}
})();
ElemCreater.createParagraphElement = (function () {
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
	 * 						"decolation":[]
	 * 					}
	 * 					]
	 * 			]
	 */
	const eParagraphTemplate = document.createElement('div');
	eParagraphTemplate.classList.add('paragraph');

	return function (data) {
		const eParagraph = eParagraphTemplate.cloneNode(true);
		// 段落そのものにクラスを付与する
		for (let className of data[0]) {
			eParagraph.classList.add(className);
		}
		return eParagraph;
	}
})();
ElemCreater.createCharPosElement = (function () {
	const eCharPosTemplate = document.createElement('span');
	eCharPosTemplate.classList.add('char-pos');

	return function (strLen) {
		const flagment = document.createDocumentFragment();
		for (var i = 0; i <= strLen; i++) { // EOLの分も作成する
			const eCharPos = eCharPosTemplate.cloneNode(true);
			flagment.appendChild(eCharPos);
		}
		return flagment;
	}
})();
ElemCreater.createConvertViewElement = (function () {
	const eViewTemplate = document.createElement('div');
	eViewTemplate.classList.add('convert-view');

	return function () {
		'use strict';
		const eView = eViewTemplate.cloneNode(true);
		return eView;
	}
})();
// file_listの中に入れるファイル行を作成する
ElemCreater.createFileElement = (function () {
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
	eFileTemplate.classList.add('fileLi');
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
ElemCreater.createDirectoryElement = (function () {
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
	eDirectoryTemplete.classList.add('dirLi');
	const eDirLinkTemplete = document.createElement('a');
	eDirLinkTemplete.classList.add('directory');
	eDirLinkTemplete.dataset.type = 'directory';
	eDirLinkTemplete.dataset.toggle = 'collapse';
	eDirLinkTemplete.innerHTML = '<span class="glyphicon glyphicon-folder-close" aria-hidden="true"></span>'; // フォルダアイコン

	const eCollapseTemplate = document.createElement('div');
	const eInnerUlTemplate = document.createElement('ul');
	const eWellTemplate = document.createElement('div');
	eCollapseTemplate.classList.add('collapse');
	eWellTemplate.classList.add('well');

	return function (id,innerData) {
		const eDirectory = eDirectoryTemplete.cloneNode(true);
		const eDirLink = eDirLinkTemplete.cloneNode(true);
		const directoryname = innerData.directoryname;
		eDirLink.dataset.directoryId = id;
		eDirLink.dataset.directoryName = directoryname;
		eDirLink.href = '#directory' + id;
		eDirLink.insertAdjacentHTML('beforeend',directoryname);

		eDirectory.appendChild(eDirLink);

		const eCollapse = eCollapseTemplate.cloneNode(true);
		const eInnerUl = eInnerUlTemplate.cloneNode(true);
		const eWell = eWellTemplate.cloneNode(true);
		eCollapse.id = 'directory' + id;

		// eInnerUl内にファイルリストを加える

		eCollapse.appendChild(eWell);
		eWell.appendChild(eInnerUl);

		eDirectory.appendChild(eCollapse); // コラプスも加える
		return eDirectory;
	}
})();

/**
 * キーコードから日本語文字列を作成します
 */
const key_table = {
	makeString : function (buffer_string,keycode) {
			// bufferに文字なし キーコードの文字をそのまま返す
		if (buffer_string.length === 0)
			return this.key_table_jpn[keycode];
		if(buffer_string.length === 1)
			return this.makeStringFromOnceBufferString(buffer_string, keycode);
		return this.makeStringFromMultipleBufferString(buffer_string, keycode);
	},
	makeStringFromOnceBufferString : function (buffer_string, keycode) {
		// bufferの文字がアルファベットでなければbufferの文字とキーコード文字を連結した文字列を返す
		if (!this.convertable.includes(buffer_string))
			return buffer_string + this.key_table_jpn[keycode];
		// bufferの文字が変換可能アルファベット
		const s = this.key_table_jpn[buffer_string]; // keytableからオブジェクト取得
		// オブジェクトにキーコードを与えて、変換文字取得
		const str =  s[keycode];
		if (str)
			return str; // 変換できた場合 buffer文字をkeytableに与えて返ってきたオブジェクトにkeycodeを与えて得た文字を返す
		// 変換文字が取得できないということは、アルファベット二文字が変換可能な組み合わせではないということ
		const typestr = this.key_table_jpn[keycode];
		// 例えばzzと打つなど同じアルファベットの連続の場合、"っｚ"と返す
		if (buffer_string === typestr)
			return "っ" + typestr;
		// 異なるアルファベットの場合、そのまま連結
		return buffer_string + typestr;
	},
	makeStringFromMultipleBufferString : function (buffer_string, keycode) {
		const noEncode = buffer_string.substring(0,buffer_string.length - 2); // 変換しない文字
		const first = buffer_string.charAt(buffer_string.length - 2);
		const second = buffer_string.charAt(buffer_string.length -1);

		// bufferの後ろから二文字目がアルファベット
		if (this.convertable.includes(first)) {
			// 最後の文字がアルファベットでないならそのまま連結 "sた + r"などの場合
			if (!this.convertable.includes(second))
				return buffer_string + this.key_table_jpn[keycode];
			// bufferの最後に変換可能アルファベット二文字
			const o = this.key_table_jpn[first][second]; // 第一添字がアルファベットなら必ず第二添字のためのオブジェクトは返ってくる
			if (o) {
				const str = o[keycode];
				// 三文字で１文字が完成した場合
				// sy + a →  "しゃ" など
				if (str) return noEncode + str;
			}
		}

		// 最後から二文字目が変換可能アルファベットではない
		// 三文字で一文字が完成しない場合、後ろ二文字で１文字が完成する可能性 staの三文字で"sた"となる場合がある
		//     後ろ二文字で１文字が完成しなければそのまま二文字が返ってくるので、やはりfirstを挟んで連結
		return noEncode + first + this.makeStringFromOnceBufferString(second, keycode);
	},
	convertable : ["k","s","t","n","h","m","y","r","w","g","z","d","b","p","j","f","l","x","c","v","q"],
	katakana : {
		"あ" : "ア",
		"い" : "イ",
		"う" : "ウ",
		"え" : "エ",
		"お" : "オ",
		"か" : "カ",
		"き" : "キ",
		"く" : "ク",
		"け" : "ケ",
		"こ" : "コ",
		"さ" : "サ",
		"し" : "シ",
		"す" : "ス",
		"せ" : "セ",
		"そ" : "ソ",
		"た" : "タ",
		"ち" : "チ",
		"つ" : "ツ",
		"て" : "テ",
		"と" : "ト",
		"な" : "ナ",
		"に" : "ニ",
		"ぬ" : "ヌ",
		"ね" : "ネ",
		"の" : "ノ",
		"は" : "ハ",
		"ひ" : "ヒ",
		"ふ" : "フ",
		"へ" : "ヘ",
		"ほ" : "ホ",
		"ま" : "マ",
		"み" : "ミ",
		"む" : "ム",
		"め" : "メ",
		"も" : "モ",
		"や" : "ヤ",
		"ゆ" : "ユ",
		"よ" : "ヨ",
		"ら" : "ラ",
		"り" : "リ",
		"る" : "ル",
		"れ" : "レ",
		"ろ" : "ロ",
		"わ" : "ワ",
		"を" : "ヲ",
		"ん" : "ン",
		"が" : "ガ",
		"ぎ" : "ギ",
		"ぐ" : "グ",
		"げ" : "ゲ",
		"ご" : "ゴ",
		"ざ" : "ザ",
		"じ" : "ジ",
		"ず" : "ズ",
		"ぜ" : "ゼ",
		"ぞ" : "ゾ",
		"だ" : "ダ",
		"ぢ" : "ヂ",
		"づ" : "ヅ",
		"で" : "デ",
		"ど" : "ド",
		"ば" : "バ",
		"び" : "ビ",
		"ぶ" : "ブ",
		"べ" : "ベ",
		"ぼ" : "ボ",
		"ゃ" : "ャ",
		"ゅ" : "ュ",
		"ょ" : "ョ",
		"ぁ" : "ァ",
		"ぃ" : "ィ",
		"ぅ" : "ゥ",
		"ぇ" : "ェ",
		"ぉ" : "ォ",
		"っ" : "ッ"
	},
	shift_key : {
		"49" : "!",
		"50" : "\”",
		"51" : "＃",
		"52" : "＄",
		"53" : "％",
		"54" : "＆",
		"55" : "\’",
		"56" : "（",
		"57" : "）",
		"187" : "〜",
		"188" : "〈",
		"190" : "〉",
		"191" : "？",
		"220" : "}",
		"221" : "{",
		"65": "A",
		"66": "B",
		"67": "C",
		"68": "D",
		"69": "E",
		"70": "F",
		"71": "G",
		"72": "H",
		"73": "I",
		"74": "J",
		"75": "K",
		"76": "L",
		"77": "M",
		"78": "N",
		"79": "O",
		"80": "P",
		"81": "Q",
		"82": "R",
		"83": "S",
		"84": "T",
		"85": "U",
		"86": "V",
		"87": "W",
		"88": "X",
		"89": "Y",
		"90": "Z"
	},
	key_table_jpn : {
		"48": "０",
		"49": "１",
		"50": "２",
		"51": "３",
		"52": "４",
		"53": "５",
		"54": "６",
		"55": "７",
		"56": "８",
		"57": "９",
		"65": "あ",
		"73": "い",
		"85": "う",
		"69": "え",
		"79": "お",
		"75": "k",
		"83": "s",
		"84": "t",
		"78": "n",
		"72": "h",
		"77": "m",
		"89": "y",
		"82": "r",
		"87": "w",
		"71": "g",
		"90": "z",
		"68": "d",
		"66": "b",
		"80": "p",
		"74": "j",
		"70": "f",
		"76": "l",
		"88": "x",
		"67": "c",
		"86": "v",
		"81": "q",
		"188": "、",
		"189": "ー",
		"190": "。",
		"191": "・",
		"219" : "＠",
		"220" : "」",
		"221" : "「",
		"k": { "65": "か", "73": "き", "85": "く", "69": "け", "79": "こ",
			"y":{
				"65": "きゃ", "73": "きぃ", "85": "きゅ", "69": "きぇ", "79": "きょ"
			}
		},
		"s": {
			"65": "さ", "73": "し", "85": "す", "69": "せ", "79": "そ",
			"y" : {
				"65": "しゃ", "73": "しぃ", "85": "しゅ", "69": "しぇ", "79": "しょ"
			},
			"h" : {
				"65": "しゃ", "73": "し", "85": "しゅ", "69": "しぇ", "79": "しょ"
			}
		} ,
		"t": { "65": "た", "73": "ち", "85": "つ", "69": "て", "79": "と",
			"y" : {
				"65": "ちゃ", "73": "ちぃ", "85": "ちゅ", "69": "ちぇ", "79": "ちょ"
			}
		},
		"n": { "65": "な", "73": "に", "85": "ぬ", "69": "ね", "79": "の","78": "ん",
			"y" : {
				"65": "にゃ", "73": "にぃ", "85": "にゅ", "69": "にぇ", "79": "にょ"
			}
		},
		"h": { "65": "は", "73": "ひ", "85": "ふ", "69": "へ", "79": "ほ",
			"y" : {
				"65": "ひゃ", "73": "ひぃ", "85": "ひゅ", "69": "ひぇ", "79": "ひょ"
			}
		},
		"m": { "65": "ま", "73": "み", "85": "む", "69": "め", "79": "も",
			"y" : {
				"65": "みゃ", "73": "みぃ", "85": "みゅ", "69": "みぇ", "79": "みょ"
			}
		},
		"y": { "65": "や", "73": "い", "85": "ゆ", "69": "いぇ", "79": "よ" },
		"r": { "65": "ら", "73": "り", "85": "る", "69": "れ", "79": "ろ",
			"y" : {
				"65": "りゃ", "73": "りぃ", "85": "りゅ", "69": "りぇ", "79": "りょ"
			}
		},
		"w": { "65": "わ", "73": "うぃ", "85": "う", "69": "うぇ", "79": "を" },
		"g": { "65": "が", "73": "ぎ", "85": "ぐ", "69": "げ", "79": "ご",
			"y" : {
				"65": "ぎゃ", "73": "ぎぃ", "85": "ぎゅ", "69": "ぎぇ", "79": "ぎょ"
			}
		},
		"z": { "65": "ざ", "73": "じ", "85": "ず", "69": "ぜ", "79": "ぞ",
			"y" : {
				"65": "じゃ", "73": "じぃ", "85": "じゅ", "69": "じぇ", "79": "じょ"
			}
		},
		"d": { "65": "だ", "73": "ぢ", "85": "づ", "69": "で", "79": "ど",
			"y" : {
				"65": "ぢゃ", "73": "ぢぃ", "85": "ぢゅ", "69": "ぢぇ", "79": "ぢょ"
			}
		},
		"b": { "65": "ば", "73": "び", "85": "ぶ", "69": "べ", "79": "ぼ",
			"y" : {
				"65": "びゃ", "73": "びぃ", "85": "びゅ", "69": "びぇ", "79": "びょ"
			}
		},
		"p": { "65": "ぱ", "73": "ぴ", "85": "ぷ", "69": "ぺ", "79": "ぽ",
			"y" : {
				"65": "ぴゃ", "73": "ぴぃ", "85": "ぴゅ", "69": "ぴぇ", "79": "ぴょ"
			}
		},
		"j": { "65": "じゃ", "73": "じ", "85": "じゅ", "69": "じぇ", "79": "じょ" },
		"f": { "65": "ふぁ", "73": "ふぃ", "85": "ふ", "69": "ふぇ", "79": "ふぉ" },
		"l": { "65": "ぁ", "73": "ぃ", "85": "ぅ", "69": "ぇ", "79": "ぉ" },
		"x": { "65": "ぁ", "73": "ぃ", "85": "ぅ", "69": "ぇ", "79": "ぉ" },
		"c": { "65": "か", "73": "し", "85": "く", "69": "せ", "79": "こ" },
		"v": { "65": "ヴァ", "73": "ヴィ", "85": "ヴ", "69": "ヴェ", "79": "ヴォ" },
		"q": { "65": "くぁ", "73": "くぃ", "85": "く", "69": "くぇ", "79": "くぉ" }
	}
}
