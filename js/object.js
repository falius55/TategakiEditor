'use strict';
/*
 *	オブジェクト指向
 *	Paragraph,Row,Charは、親や子の参照を保持するのはもちろんのこと、木構造を無視して異なる親であっても次と前にある同種オブジェクトの参照を持つ
 *	Dom要素の参照を持つコンポジション
 *	要素の再利用のため、要素作成のみクロージャで行う
 *	jQyeryの使用箇所:width(),height(),addwheelEventlistener(),removeWheelEventListener(),bootstrap関係
 */
console.log('object.js');
/**
 * @namespace
 */
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
			} else {
				console.log('unsuccess');
			}
		});
		xhr.addEventListener('abort',function (e) {
			console.log('abort');
		});
		xhr.send(sendData);
	}
};
// closer
/**
 * @memberof Util
 */
Util.createCharElement = (function () {
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
Util.createRowElement = (function () {
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
Util.createParagraphElement = (function () {
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
Util.createCharPosElement = (function () {
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
Util.createConvertViewElement = (function () {
	const eViewTemplate = document.createElement('div');
	eViewTemplate.classList.add('convert-view');

	return function () {
		'use strict';
		const eView = eViewTemplate.cloneNode(true);
		return eView;
	}
})();
// file_listの中に入れるファイル行を作成する
Util.createFileElement = (function () {
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
Util.createDirectoryElement = (function () {
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

// Class
/**
 * メニューバーを担当するクラス
 */
class Menu {
	/**
	 * @param {SentenceContainer} sentenceContainer 対応する文章コンテナ
	 */
	constructor(sentenceContainer) {
		this._sentenceContainer = sentenceContainer;
		this._fontSizeInputElem = document.getElementById('fontsize_input');
		this._confStrLenElem = document.getElementById('conf_str_len');
		this._confRowLenElem = document.getElementById('conf_row_len');
		this.addEventListeners();
	}

	// --参照取得

	/**
	 * このMenuが対応する文章コンテナのインスタンスを返します
	 * @return {SentenceContainer} SentenceContainerのインスタンス
	 */
	sentenceContainer() {
		return this._sentenceContainer;
	}
	/**
	 * 設定モーダルの文字数inputフォームのDOM要素を返します
	 * @return {Element} 文字数設定inputフォームのDOM要素
	 */
	confStrLenElem() {
		return this._confStrLenElem;
	}
	/**
	 * 設定モーダルの行数inputフォームのDOM要素を返します
	 * @return {Element} 行数設定inputフォームのDOM要素
	 */
	confRowLenElem() {
		return this._confRowLenElem;
	}

	// --Status

	/**
	 * フォントサイズinputフォームに値を設定する、あるいは引数省略で現在のinputフォームの値を返します
	 * @param {number string} [opt_newSize] inputに設定する値(数値か、文字列の'auto')
	 * @return {Menu number string} 自身のインスタンス(引数を渡した場合)、あるいは現在のinputフォームの値(引数を省略した場合。'auto'の場合は文字列で返す)
	 */
	fontSizeInput(opt_newSize) {
		if (opt_newSize === undefined) {
			return this._fontSizeInputElem.value === 'auto' ? 'auto' : parseInt(this._fontSizeInputElem.value);
		} else {
			this._fontSizeInputElem.value = opt_newSize;
			return this;
		}
	}
	/**
	 * 現在アクティブになっている文字装飾のクラスを配列にします
	 * @return {string[]} 現在アクティブになっている文字装飾のクラスの配列
	 */
	charDecolations() {
		const ret = [];
		if (this.boldButton()) {
			ret.push('decolation-font-bold');
		}
		if (this.italicButton()) {
			ret.push('decolation-font-italic');
		}
		if (this.colorButton() !== 'black') {
			ret.push('decolation-color-'+ this.colorButton());
		}
		return ret;
	}
	/**
	 * 現在の設定情報を表すオブジェクトを作成します
	 * <pre>
	 * {
	 * 	"strLen": "%d",
	 * 	"rowLen" : "%d"
	 * }
	 * </pre>
	 * @return {object} 現在の設定情報を表すオブジェクト
	 */
	configueData() {
		const ret = {};
		ret["strLen"] = this.confStrLenElem().value;
		ret["rowLen"] = this.confRowLenElem().value;
		return ret;
	}

	// --Style

	/**
	 * 文字色ボタンに色を付けます
	 *     引数を省略すると現在の色を取得します
	 * @param {string} [opt_color] 文字色ボタンにつける色の名前
	 * @return {Menu string} 自身のインスタンス(引数を渡した場合) 現在の文字色ボタンに付いている色の名前(引数を省略した場合)
	 */
	colorButton(opt_color) {
		const eColorButton = document.getElementById('color_btn');
		if(opt_color) {
			const oldColor = eColorButton.className.match(/select-\S+/);
			const newColor = opt_color;
			if (oldColor) eColorButton.classList.remove(oldColor[0]);
			if (newColor === 'black') return this;
			eColorButton.classList.add('select-'+ newColor);
			return this;
		}
		if (opt_color === undefined) {
			const color = eColorButton.className.match(/select-(\S+)/);
			return color ? color[1] : 'black';
		}
	}
	/**
	 * 選択範囲の文字色を変えます
	 * @param {string} color 新しい文字色
	 * @return {Menu} 自身のインスタンス
	 */
	addColor(color) {
		const chars = this.sentenceContainer().selectChars(true);
		for (let char of chars) {
			char.color(color);
		}
		return this;
	}
	/**
	 * 太字ボタンのオンオフを切り替えます 引数省略で、現在の太字ボタンのオンオフをbool値で返します
	 * @param {boolean} [opt_bl] trueで太字ボタンをオンにする。falseでオフにする
	 * @return {Menu boolean} 自身のインスタンス(引数を渡した場合) 現在の太字ボタンの状態(引数省略の場合)
	 */
	boldButton(opt_bl) {
		const eButton = document.getElementById('btn-bold');
		if (opt_bl === undefined) {
			return eButton.classList.contains('active');
		}
		if (opt_bl) {
			eButton.classList.add('active');
		} else {
			eButton.classList.remove('active');
		}
		return this;
	}
	/**
	 * 選択範囲を太字にします。または太字を外します
	 * @param {boolean} bl trueで太字にする。falseで外す
	 * @return {Menu} 自身のインスタンス
	 */
	bold(bl) {
		const chars = this.sentenceContainer().selectChars(true);
		for (let char of chars) {
			char.bold(bl);
		}
		return this;
	}
	/**
	 * 斜体ボタンのオンオフを切り替えます 引数省略で、現在の斜体ボタンのオンオフをbool値で返します
	 * @param {boolean} [opt_bl] trueで太字ボタンをオンにする。falseでオフにする
	 * @return {Menu boolean} 自身のインスタンス(引数を渡した場合) 現在の斜体ボタンの状態(引数省略の場合)
	 */
	italicButton(opt_bl) {
		const eButton = document.getElementById('btn-italic');
		if (opt_bl === undefined) {
			return eButton.classList.contains('active');
		}
		if (opt_bl) {
			eButton.classList.add('active');
		} else {
			eButton.classList.remove('active');
		}
		return this;
	}
	/**
	 * 選択範囲を斜体にします。または太字を外します
	 * @param {boolean} bl trueで斜体にする。falseで外す
	 * @return {Menu} 自身のインスタンス
	 */
	italic(bl) {
		const chars = this.sentenceContainer().selectChars(true);
		for (let char of chars) {
			char.italic(bl);
		}
		return this;
	}
	/**
	 * 選択範囲のフォントサイズを変更します
	 * @param {number} size 新しいフォントサイズ
	 * @return {Menu} 自身のインスタンス
	 */
	fontSize(size) {
		const chars = this.sentenceContainer().selectChars(true);
		for (let char of chars) {
			char.fontSize(size);
		}
		this.sentenceContainer().cordinate().checkKinsoku().changeDisplay().breakPage().printInfo();
		return this;
	}
	// 'center','left','right'
	/**
	 * カーソルのある段落のtext-alignを変更します
	 * @param {string} align 'center','left','right'のいずれか
	 * @return {Menu} 自身のインスタンス
	 */
	align(align) {
		const cursorParagraph = this.sentenceContainer().cursor().getParagraph();
		cursorParagraph.align(align);
		return this;
	}

	/**
	 * メニューの各コンポーネントにイベントリスナーを付加します
	 *     newボタン、saveボタン、deleteボタン、開くボタン、モーダルの開閉、
	 *     文字色ボタン、文字色ドロップダウン、太字ボタン、斜体ボタン、
	 * 	 text-alignボタン、フォントサイズのドロップダウン、設定モーダル
	 * @return {Menu} 自身のインスタンス
	 */
	addEventListeners() {
		// メニューボタン
		document.getElementById('menu_new').addEventListener('click',function (e) {  this.sentenceContainer().newFile(); }.bind(this),false);
		document.getElementById('menu_save').addEventListener('click',function (e) { this.sentenceContainer().saveFile(); }.bind(this),false);
		document.getElementById('menu_delete').addEventListener('click',function (e) { this.sentenceContainer().fileList().currentFile().delete(); }.bind(this),false);
		document.getElementById('modal_fileopen_link').addEventListener('click',function (e) {
			const filterInputElem = this.sentenceContainer().fileList().filterInputElem();
			// モーダルが開くのはブートストラップで行われるので、その前処理だけを行う
			filterInputElem.value = '';
			filterInputElem.focus();
			this.sentenceContainer().fileList().resetList();
		}.bind(this),false);

		// モーダル開閉
		$('div.modal').on('shown.bs.modal',function (e) {
			this.sentenceContainer().removeKeydownEventListener();
			if (this.sentenceContainer().inputBuffer().isDisplay()) {
				this.sentenceContainer().inputBuffer().empty().hide();
			}
		}.bind(this));
		$('div.modal').on('hidden.bs.modal',function (e) {
			if (this.sentenceContainer().command().isActive()) { return; }
			this.sentenceContainer().addKeydownEventListener();
		}.bind(this));

		// パレットボタン
		// 文字色ボタン
		document.getElementById('color_btn').addEventListener('click',function (e) {
			this.addColor(this.colorButton());
		}.bind(this),false);
		// 文字色ドロップダウン
		this.addColorSelectClickEvent();

		// bold italic
		document.getElementById('btn-bold').addEventListener('click',function (e) {
			const eBtn = document.getElementById('btn-bold');
			eBtn.classList.toggle('active');
			this.bold(this.boldButton());
		}.bind(this),false);
		document.getElementById('btn-italic').addEventListener('click',function (e) {
			const eBtn = document.getElementById('btn-italic');
			eBtn.classList.toggle('active');
			this.italic(this.italicButton());
		}.bind(this),false);

		// align
		this.addAlignClickEvent();

		// font size
		this.addFontSizeEvnet();

		// configue modal
		this.addConfigueEvent();

		return this;
	}

	/**
	 * 文字色(ドロップダウンの方)をクリックするとボタンの色と選択範囲の文字色が変わるイベントを付加します
	 *     querySelectorAll()でドロップダウンの各要素を取得してループでイベントを付加しているため、htmlとcssのみ変更することで扱う色を増やすことが可能
	 * @return {Menu} 自身のインスタンス
	 */
	addColorSelectClickEvent() {
		const eSelectColors = document.querySelectorAll('#color_dropdown a');
		for (let i = 0,eSelColor; eSelColor = eSelectColors[i]; i++) {
			const color = eSelColor.dataset.color;
			eSelColor.addEventListener('click',function (e) {
				this.colorButton(color);
				this.addColor(color);
			}.bind(this),false);
		}
		return this;
	}
	/**
	 * text-alignボタンをクリックするとカーソルのある段落のtext-alignが変更されるイベントを付加します
	 * @return {Menu} 自身のインスタンス
	 */
	addAlignClickEvent() {
		const eAligns = document.querySelectorAll('#align_btns button');
		for (let i = 0,eAlign; eAlign = eAligns[i]; i++) {
			eAlign.addEventListener('click',function (e) {
				const align = eAlign.id.match(/text_btn_(\S+)/);
				this.align(align[1]);
			}.bind(this),false);
		}
		return this;
	}

	// font size

	/**
	 * フォントサイズのドロップダウンをクリックするとフォントサイズのinputの数値が変更され、選択範囲の文字のフォントサイズが変更されるイベントを付加します
	 *     querySelectorAll()でドロップダウンの各要素を取得してループでイベントを付加しているため、htmlとcssのみ変更することで扱うフォントサイズを増やすことが可能になります
	 * @return {Menu} 自身のインスタンス
	 */
	addFontSizeEvnet() {
		const eFontSizeDropdowns = document.querySelectorAll('#fontsize_dropdown a');
		for (let i = 0,eFontSize; eFontSize = eFontSizeDropdowns[i]; i++) {
			eFontSize.addEventListener('click',function (e) {
				const size = parseInt(e.target.dataset.size) || 'auto';
				this.fontSizeInput(size);
				this.fontSize(size);
			}.bind(this),false);
		}
		return this;
	}

	/**
	 * 設定モーダルのinputフォームとsaveボタン、resetボタンにイベントを付加します
	 * @return {Menu} 自身のインスタンス
	 */
	addConfigueEvent() {
		document.getElementById('btn_conf_save').addEventListener('click',function (e) {
			const strLen = parseInt(this.confStrLenElem().value || 18);
			const rowLen = parseInt(this.confRowLenElem().value || 40);
			this.sentenceContainer().strLenOnRow(strLen).rowLenOnPage(rowLen);
			$('#configue_modal').modal('hide');
		}.bind(this),false);
		document.getElementById('btn_conf_reset').addEventListener('click',function (e) { // html上でtype="reset"にすると、元に戻すというよりinputを空にしてしまう
			this.confStrLenElem().value = this.sentenceContainer().strLenOnRow();
			this.confRowLenElem().value = this.sentenceContainer().rowLenOnPage();
		}.bind(this),false);
		// inputからフォーカスから外れた際に、不正な文字が入力されていたら元に戻す
		this.confStrLenElem().addEventListener('focusout',function (e) {
			if (!/^[0-9]+$/.test(this.confStrLenElem().value)) {
				this.confStrLenElem().value = this.sentenceContainer().strLenOnRow();
			}
		}.bind(this),false);
		this.confRowLenElem().addEventListener('focusout',function (e) {
			if (!/^[0-9]+$/.test(this.confRowLenElem().value)) {
				this.confRowLenElem().value = this.sentenceContainer().rowLenOnPage();
			}
		}.bind(this),false);
		return this;
	}
}
/**
 * コマンドラインを表すクラス
 */
class CommandLine {
	/**
	 * @param {SentenceContainer} sentenceContainer 対応する文章コンテナ
	 */
	constructor(sentenceContainer) {
		this._elem = document.getElementById('command');
		this._sentenceContainer = sentenceContainer;
	}

	// --参照取得

	/**
	 * 自身のHTML要素を返します
	 * @return {Element} 自身のHTML要素
	 */
	elem() {
		return this._elem;
	}
	/**
	 * 対応する文章コンテナの参照を返します
	 * @return {SentenceContainer} 対応する文章コンテナ
	 */
	sentenceContainer() {
		return this._sentenceContainer;
	}
	/**
	 * 操作するファイルリストの参照を返します
	 * @return {FileList} ファイルリストのインスタンス
	 */
	fileList() {
		return this.sentenceContainer().fileList();
	}

	// --判定

	/**
	 * コマンドラインがアクティブかどうかを返します
	 * @return {boolean} true=アクティブ、false=アクティブではない
	 */
	isActive() {
		return this.elem().classList.contains('active');
	}

	// --Style

	/**
	 * コマンドラインをアクティブにします
	 * @return {CommandLine} 自身のインスタンス
	 */
	active() {
		this.elem().classList.add('active');
		return this;
	}
	/**
	 * コマンドラインを非アクティブにしまる
	 * @return {CommandLine} 自身のインスタンス
	 */
	unActive() {
		this.elem().classList.remove('active');
		return this;
	}
	/**
	 * コマンドラインにフォーカスを与えます
	 * @return {CommandLine} 自身のインスタンス
	 */
	focus() {
		this.elem().focus();
		return this;
	}
	/**
	 * ファイルリストのモーダルをコマンドライン用に開きます
	 * @return {CommandLine} 自身のインスタンス
	 */
	displayFileModal() {
		this.fileList().$modal().addClass('command-modal').modal();
		$('.modal-backdrop.fade.in').addClass('none_modal-backdrop'); // モーダルウィンドウ表示時の半透明背景を見えなくする
		return this;
	}
	/**
	 * コマンドライン用に開いたモーダルを閉じます
	 * @return {CommandLine} 自身のインスタンス
	 */
	hideFileModal() {
		if (this.fileList().isOpen()) {
			// あらかじめbootstrapより先回りしてstyle適用で非表示にしておかなければ、消える前に一瞬中央表示になってしまう
			this.fileList().$modal()
				.attr('style','display: none;')
				.removeClass('command-modal')
				.modal('hide');
		}
		this.fileList().resetList();

		return this;
	}


	// --DOM

	/**
	 * コマンドラインに値を設定します
	 * @param {string} text コマンドラインに設定する値
	 * @return {CommandLine} 自身のインスタンス
	 */
	val(text) {
		if (text === undefined) {
			return this.elem().value;
		} else {
			this.elem().value = text;
			return this;
		}
	}
	/**
	 * コマンドモードを始めます
	 * @return {CommandLine} 自身のインスタンス
	 */
	start() {
		this.active();
		this.sentenceContainer().removeKeydownEventListener();
		this.focus().val(':');
		this.addKeyupEventListener().addFocusoutEventListener();
		return this;
	}
	/**
	 * コマンドモードを終了します
	 * @return {CommandLine} 自身のインスタンス
	 */
	stop() {
		this.unActive();
		this.removeKeyupEventListener().removeFocusoutEventListener();
		this.sentenceContainer().addKeydownEventListener();
		this.hideFileModal();
		return this;
	}

	// --イベント

	/**
	 * コマンドのinputフォームにkeyupイベントを付加します。重ねがけは無効となります
	 * @return {CommandLine} 自身のインスタンス
	 */
	addKeyupEventListener() {
		if (this._keyupArg) return this;
		this._keyupArg = this.onKeyup.bind(this); // removeするときと引数を同一にするためプロパティに保持する(それぞれでbindすると異なる参照になる？)
		document.addEventListener('keyup',this._keyupArg);
		return this;
	}
	/**
	 * コマンドのinputフォームへのkeyupイベントを除去します
	 * @return {CommandLine} 自身のインスタンス
	 */
	removeKeyupEventListener() {
		if (!this._keyupArg) return this;
		document.removeEventListener('keyup',this._keyupArg);
		this._keyupArg = null;
		return this;
	}
	/**
	 * @private
	 * keyupイベントの前処理を行い、イベントを実行します
	 */
	onKeyup(e) {
		'use strict';
		let keycode;
		if (document.all) {
			// IE
			keycode = e.keyCode
		} else {
			// IE以外
			keycode = e.which;
		}
		if (keycode === 123) { return; } // F12のみブラウザショートカットキー
		this.runKeyup(e,keycode);
		// デフォルトの動作を無効化する
		e.preventDefault();
	}
	/**
	 * コマンドのkeyupイベントの実行内容です
	 * @param {Event} e イベントオブジェクト
	 * @param {number} keycode 押下されたキーのキーコード
	 */
	runKeyup(e,keycode) {
		if (keycode == 13) {
			// enter
			this.runCommand();
			this.stop();
			e.stopPropagation(); // 親要素へのイベントの伝播(バブリング)を止める。そうしなければ先にaddeventlistenerをしてしまっているので、documentにまでエンターキーが渡ってしまい改行されてしまう。
		} else if (keycode == 27 || this.val() == '') {
			// Esc
			// あるいは全文字削除
			this.stop();
			e.stopPropagation();
		} else {
			// :eなどの後に途中まで引数を打てばファイルの検索ダイアログが出るようにする
			const command = this.val().split(' ').length > 1 ? this.val().split(' ') : this.val().split('　'); // 全角スペースも区切りとして有効。ただし、半角スペースとの混在は現状不可
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
							 this.displayFileModal();
							 this.fileList().filter(command[1]);
						 } else if (keycode === 8 && !(command[1])) {
							 // BSを押した結果、引数がなくなった
							 this.hideFileModal();
						 } else if (command[1] && command[2]) {
							 // 引数ふたつ目
							 this.fileList().filter(command[2]);
						 } else if (command[1]) {
							 // 引数ひとつ
							 this.fileList().filter(command[1]);
						 }
						 break;
				default:
						 break;
			}
		}
		e.preventDefault();
	}
	/**
	 * コマンドラインからフォーカスが外れた際のイベントを付加します
	 * @return {CommandLine} 自身のインスタンス
	 */
	addFocusoutEventListener() {
		if (this._focusoutArg) return this;
		this._focusoutArg = this.onFocusout.bind(this); // removeするときと引数を同一にするためプロパティに保持する(それぞれでbindすると異なる参照になる？)
		document.addEventListener('focusout',this._focusoutArg);
		return this;
	}
	/**
	 * コマンドラインからフォーカスが外れた際のイベントを除去します
	 * @return {CommandLine} 自身のインスタンス
	 */
	removeFocusoutEventListener() {
		if (!this._focusoutArg) return this;
		document.removeEventListener('focusout',this._focusoutArg);
		this._focusoutArg = null;
		return this;
	}
	/**
	 * コマンドラインからフォーカスが外れた際のイベントの実行内容です
	 * @param {Event} e イベントオブジェクト
	 */
	onFocusout(e) {
		this.stop();
	}
	/**
	 * コマンドの実行内容です
	 */
	runCommand() {
		// 半角スペースで区切られていないようなら、全角スペースの区切りでも可
		const command = this.val().split(' ').length > 1 ? this.val().split(' ') : this.val().split('　');
		switch (command[0]) {
			case ':w':
			case ':save':
			case ':s':
			case ': ｗ':
			case ':さヴぇ':
			case ':ｓ':
					 if (command[1]) {
						 this.sentenceContainer().saveAsFile(command[1]);
					 } else {
						 this.sentenceContainer().saveFile();
					 }
					 break;
			case ':e':
			case ':o':
			case ':open':
			case ':え':
			case ':お':
			case ':おぺｎ':
					 if (command[1]) {
						 const files = this.fileList().findFile(commnad[1]);
						 files.length > 0 && files[0].open();
					 } else {
						 this.sentenceContainer().newFile();
					 }
					 break;
			case ':jumpr':
			case ':jumprow':
			case ':jr':
			case ':じゅｍｐｒ':
			case ':じゅｍｐろｗ':
			case ':ｊｒ':
					 if (command[1]) this.sentenceContainer().cursor().jumpRow(parseInt(command[1]));
					 break;
			case ':jumpp':
			case ':jumppage':
			case ':jp':
			case ':じゅｍっｐ':
			case ':じゅｍっぱげ':
			case ':ｊｐ':
					 if (command[1]) this.sentenceContainer().cursor().jumpPage(parseInt(command[1]));
					 break;
			case ':new':
			case ':n':
			case ':ねｗ':
			case ':ｎ':
					 this.sentenceContainer().newFile(command[1]);
					 break;
			case ':delete':
			case ':del':
			case ':d':
			case ':rm':
			case ':でぇて':
			case ':でｌ':
			case ':ｄ':
			case ':ｒｍ':
					 if (command[1]) {
						 this.fileList().deleteFile(command[1]);
					 } else {
						 const currentFile = this.fileList().currentFile();
						 currentFile && currentFile.delete();
					 }
					 break;
			case ':next':
			case ':ねｘｔ':
					 // 次のファイルを開く
					 this.fileList().openNextFile();
					 break;
			case ':prev':
			case ':ｐれｖ':
					 // 前のファイルを開く
					 this.fileList().openPrevFile();
					 break;
			case ':title':
			case ':name':
			case ':t':
			case ':ちｔぇ':
			case ':なめ':
			case ':ｔ':
					 if (command[1]) {
						 this.sentenceContainer().filename(command[1]);
					 }
					 break;
			case ':mv':
			case ':ｍｖ':
					 this.fileList().moveFile(command[1],command[2]);
					 break;
			case ':mkdir':
			case ':ｍｋぢｒ':
					 this.fileList().mkdir(command[1]);
					 break;
			case ':deldir':
			case ':でｌぢｒ':
					 this.fileList().deleteDirectory(command[1],false);
					 break;
			case ':noh':
			case ':のｈ':
					 this.sentenceContainer().stopSearchMode();
					 break;
			case '::':
					 this.sentenceContainer().cursor().insert(':');
					 break;
			case ':;':
					 this.sentenceContainer().cursor().insert(';');
					 break;
			case ':/':
					  this.sentenceContainer().cursor().insert('/');
					  break;
			case ':i':
					 command[1] && this.sentenceContainer().cursor().insert(command[1]);
					 break;
			case ':bold':
					 this.sentenceContainer().menu().boldButton(!this.sentenceContainer().menu().boldButton());
					 break;
			case ':italic':
					 this.sentenceContainer().menu().italicButton(!this.sentenceContainer().menu().italicButton());
					 break;
			default:
					 break;
		}
	}
}
// 段落最後のEOL以外のEOLにカーソルは止まらない(EOLは基本、文字挿入のために存在)
/**
 * カーソルを表すクラス
 */
class Cursor {
	/**
	 * @param {SentenceContainer} sentenceContainer 対応する文章コンテナのインスタンス
	 */
	constructor(sentenceContainer) {
		this._sentenceContainer = sentenceContainer;
		this._cursorLineElem = document.getElementById('cursor_line');
	}
	/**
	 * カーソルを初期化して一文字目にカーソルを与えます
	 * @return {Cursor} 自身のインスタンス
	 */
	init() {
		const firstChar = this.sentenceContainer().firstChild().firstChild().firstChild();
		this._char = firstChar;
		this.createCursorLine();
		this._char.addCursor().setPosMemory();
		return this;
	}

	// --参照取得

	/**
	 * 対応する文章コンテナのインスタンスを返します
	 * @return {SentenceContainer} 対応する文章コンテナのインスタンス
	 */
	sentenceContainer() {
		return this._sentenceContainer;
	}
	/**
	 * カーソルのある文字のインスタンスを返します
	 * @return {Char} カーソル文字のインスタンス
	 */
	getChar() {
		return this._char;
	}
	/**
	 * カーソル行のインスタンスを返します
	 * @return {Row} カーソル行のインスタンス
	 */
	getRow() {
		return this.getChar().row();
	}
	/**
	 * カーソルのある段落のインスタンスを返します
	 * @return {Paragraph} カーソルのある段落のインスタンス
	 */
	getParagraph() {
		return this.getRow().paragraph();
	}
	/**
	 * カーソル位置を記憶するためのDOM要素を返します
	 * @return {Element} カーソル位置を記憶するための要素
	 */
	cursorLineElem() {
		return this._cursorLineElem;
	}

	// --参照操作

	/**
	 * @private
	 * カーソル文字への参照を変更します
	 * @param {Char} newChar 新しいカーソル文字
	 * @return {Cursor} 自身のインスタンス
	 */
	setChar(newChar) {
		this._char = newChar;
		return this;
	}
	/**
	 * charにカーソルを与えます
	 * @param {Char} char 新しいカーソル文字
	 * @param {boolean} [bShift] シフトキーが押された状態でカーソルが与えられたかどうか。trueなら選択範囲を拡張する。falseなら解除する。省略(undefined)すると選択範囲には影響しない
	 * @return {Cursor} 自身のインスタンス
	 */
	addCursor(char,bShift) {
		if (this.getChar()) {
			this.memorySelection();
			this.getChar().removeClass('cursor');
		}
		char.addClass('cursor');
		this.setChar(char);

		// 前の文字に装飾があれば、そのボタンをオンにする
		const prevChar = char.prevCharOnParagraph();
		const menu = this.sentenceContainer().menu();
		menu.colorButton(prevChar ? prevChar.color() : 'black');
		menu.boldButton(prevChar ? prevChar.isBold() : false);
		menu.italicButton(prevChar ? prevChar.isItalic() : false);
		menu.fontSizeInput(prevChar ? prevChar.fontSize() : 'auto');

		// シフトキーが押されながらなら、選択範囲を広げる
		this.extendSelection(bShift);
		this.sentenceContainer().printInfo();
		return this;
	}

	// --Status

	/**
	 * カーソル位置を記憶するDOM要素から、記憶されたインデックスを返します
	 * @return {number} 記憶されたカーソル位置のインデックス。記憶された位置が見つからなければ-1
	 */
	getPosMemory() {
		const eCharPoses = this.cursorLineElem().children;
		for (let i = 0,eCharPos; eCharPos = eCharPoses[i]; i++) {
			if (eCharPos.classList.contains('cursor-pos-memory'))
				return i;
		}
		return -1;
	}
	/**
	 * カーソル位置を記憶するDOM要素に位置を記憶します
	 * @param {number} index 記憶する位置のインデックス
	 * @return {Cursor} 自身のインスタンス
	 */
	setPosMemory(index) {
		const oldPos = this.getPosMemory();
		if (index === oldPos) {
			return this;
		}
		const eCharPoses = this.cursorLineElem().children;
		if (eCharPoses[oldPos]) eCharPoses[oldPos].classList.remove('cursor-pos-memory');
		const maxIndex = eCharPoses.length - 1;
		if (index > maxIndex) index = maxIndex; // char-posの最大数を超える数値は覚えられない
		eCharPoses[index].classList.add('cursor-pos-memory');
		return this;
	}
	/**
	 * 現在行のうち何文字目にカーソルがあるかを返します。行頭では１，EOLでは行の総文字数＋１が返ります
	 * @return {number} カーソルの位置。入力の始まる位置のインデックスと同じ
	 */
	currentCharPos() {
		return this.getChar().index() + 1;
	}
	/**
	 * 現在行の総文字数を返す
	 * @return {number} 現在行の総文字数
	 */
	strLenOfRow() {
		return this.getRow().charLen();
	}
	/**
	 * カーソル行がそのページで何行目かを返します
	 * @return {number} カーソル行がページ内で何行目か。改ページが見つからなければ-1
	 */
	currentRowPos() {
		for (let row = this.getRow(),cnt = 1; row; row = row.prev(),cnt++) {
			if (row.isPageBreak()) return cnt;
		}
		return -1;
	}
	/**
	 * 現在ページの総行数を返します。最終ページのみ設定行数と異なるため、正確に総行数を数えるために利用されます
	 * @return {number} 現在ページの総行数。ページの終わりが見つからなければ-1
	 */
	rowLenOnPage() {
		for (let row = this.getRow(),cnt = this.currentRowPos(); row; row = row.next(),cnt++) {
			if (row.isPageLast()) return cnt;
		}
		return -1;
	}
	/**
	 * 現在ページを返します
	 * @return {number} 現在ページ
	 */
	currentPage() {
		let cnt = 0;
		for (let row = this.getRow(); row; row = row.prev()) {
			if (row.isPageBreak()) cnt++;
		}
		return cnt;
	}

	// --DOM操作

	/**
	 * カーソル位置を記憶するDOM要素を文章コンテナの標準文字数に合わせて構築します。主にカーソルの左右移動の際に、そのカーソルが何文字目の位置から移動してきたのかを記憶するために用いるものです
	 * @return {Cursor} 自身のインスタンス
	 */
	createCursorLine() {
		const eCursorLine = document.getElementById('cursor_line');
		const eOldCharPoses = eCursorLine.children;
		for (let eOldCharPos; eOldCharPos = eOldCharPoses[0];) {
			eCursorLine.removeChild(eOldCharPos);
		}
		eCursorLine.appendChild(Util.createCharPosElement(this.sentenceContainer().strLenOnRow()));
		return this;
	}

	/**
	 * カーソル位置に文字を挿入します
	 * @param {string} str 挿入する文字列
	 * @return {Cursor} 自身のインスタンス
	 */
	insert(str) {
		const cursorChar = this.getChar();
		for (let char of str) {
			const newChar = new Char(cursorChar.createData(char));
			cursorChar.before(newChar);
		}

		cursorChar.paragraph().cordinate().checkKinsoku();
		this.getChar().setPosMemory(); // cordinate()によってカーソル文字が変わっている可能性があるため、cursorCharは使えず取得しなおし
		this.sentenceContainer().changeDisplay().breakPage().printInfo();
		return this;
	}
	/**
	 * カーソル位置でバックスペースを押下した時の処理を行います
	 * @return {Cursor} 自身のインスタンス
	 */
	backSpace() {
		const cursorChar = this.getChar();
		if (!cursorChar.prev()) return this; // 文章先頭からのバックスペースは何もしない

		// 段落先頭からのバックスペースでは、前の行に段落をつなげる
		if (cursorChar.isFirst() && cursorChar.row().isFirst()) {
			const cursorParagraph = cursorChar.row().paragraph();
			const newParagraph = cursorParagraph.prev(); // 融合先の段落
			for (let moveRow of cursorParagraph.rows()) {
				moveRow.moveLastBefore();
			}
			newParagraph.cordinate().checkKinsoku();
			// HACK: 最終行が表示されている状態でbackSpace()すると、カーソル行が表示されているために表示開始行が変わらず、行数が足りているにも関わらず表示行数が少なくなってしまう
			this.sentenceContainer().changeDisplay().breakPage().printInfo();
			return this;
		}

		//  段落先頭以外からのバックスペース
		//  カーソルの前の位置にある文字を削除する(行頭なら行をまたいで前の文字)
		if (!(cursorChar.isFirst() && cursorChar.row().isFirst())) {
			cursorChar.prevChar().delete();
			this.sentenceContainer().changeDisplay().breakPage().printInfo();
			return this;
		}
	}
	/**
	 * カーソル位置で改行した時の処理を行います
	 * @return {Cursor} 自身のインスタンス
	 */
	lineBreak() {
		// 段落の分割
		const cursorParagraph = this.getParagraph().divide(this.getChar());
		// 新しくできた段落の最初の文字にカーソルを移動する
		const newParagraph = cursorParagraph.next(); // divide()で新しく挿入された段落
		newParagraph.firstChild().firstChild().addCursor().setPosMemory();
		// HACK:changeDisplay()を二回続けている:新しい段落がdisplayされて表示されるので、最終表示行から改行した場合にカーソル行が表示から外れる(最終表示行とカーソル行が等しいため、表示開始行を変えずに表示)
		// かといって新しい段落を非表示にしてから挿入すると、表示行が文章コンテナを埋めていない状態の時に改行すると表示開始行が毎回ひとつ後ろにずれる(カーソル行が最終表示行より後ろにあるため)という現象が起こるので、行数が十分にあっても表示行が不足してしまう
		this.sentenceContainer().changeDisplay().changeDisplay().breakPage().printInfo();
		return this;
	}

	// --カーソル操作

	// カーソル移動
	/**
	 * カーソルを下方向に一つ動かします。ひとつ下が段落途中のEOLなら、さらにその次に動かします
	 * @param {boolean} bShift シフトキーが押されていればtrue、そうでなければfalseを指定する
	 * @return {Cursor} 自身のインスタンス
	 */
	moveNext(bShift) {
		const nextChar = this.getChar().next();
		if (!nextChar) return this;
		nextChar.slideNextCursor().addCursor(bShift).setPosMemory();
		this.sentenceContainer().changeDisplay();
		return this;
	}
	/**
	 * カーソルを上方向に一つ動かします。段落途中の行頭なら、前の行の最終文字に動かします
	 * @param {boolean} bShift シフトキーが押されていればtrue、そうでなければfalseを指定する
	 * @return {Cursor} 自身のインスタンス
	 */
	movePrev(bShift) {
		const prevChar = this.getChar().prev();
		if (!prevChar) return this;
		prevChar.slidePrevCursor().addCursor(bShift).setPosMemory();
		this.sentenceContainer().changeDisplay();
		return this;
	}
	/**
	 * カーソルを右方向に一つ動かします。一つ右が段落途中のEOLなら、移動先の前の文字にさらに動かします
	 * @param {boolean} bShift シフトキーが押されていればtrue、そうでなければfalseを指定する
	 * @return {Cursor} 自身のインスタンス
	 */
	moveRight(bShift) {
		const prevRow = this.getChar().row().prev();
		this.moveRow(prevRow,bShift);
		this.sentenceContainer().changeDisplay();
		return this;
	}
	/**
	 * カーソルを左方向に一つ動かします。一つ左が段落途中のEOLなら、移動先の前の文字にさらに動かします
	 * @param {boolean} bShift シフトキーが押されていればtrue、そうでなければfalseを指定する
	 * @return {Cursor} 自身のインスタンス
	 */
	moveLeft(bShift) {
		const nextRow = this.getChar().row().next();
		this.moveRow(nextRow,bShift);
		this.sentenceContainer().changeDisplay();
		return this;
	}
	/**
	 * rowにカーソルを移動します。移動先の文字は記憶されたカーソル位置と同じインデックスの文字となりますが、それがEOLならその前の文字に移動します
	 * @param {Row} row 移動先の行のインスタンス
	 * @param {boolean} bShift シフトキーが押されているかどうか。trueなら、選択範囲を拡張する
	 * @return {Cursor} 自身のインスタンス
	 */
	moveRow(row,bShift) {
		const index = this.getPosMemory();
		if (!row) return this;
		const char = row.children(index); // 同じインデックスの文字がprevRowに存在しなければ、children()内でlastChild()が選択される
		char.slidePrevCursor().addCursor(bShift);
		return this;
	}
	/**
	 * num行目の最初の文字にカーソルを移動します。移動先の行が中央となるように表示されます
	 * @param {number} num 移動先が何行目か。１から始まる。ページ内ではなく、文章全体で数える。０位下が渡されると最初の行に移動される
	 * @return {Cursor} 自身のインスタンス
	 */
	jumpRow(num) {
		if (typeof num !== 'number') return this;
		const row = this.sentenceContainer().row(num);
		if (row) {
			row.firstChild().addCursor().setPosMemory();
			this.sentenceContainer().changeDisplay('center');
		}
		return this;
	}
	/**
	 * numページ目の一行目最初の文字にカーソルが移動します。その行が最初の行となるように表示されます
	 * @param {number} num 何ページ目に移動するか
	 * @return {Cursor} 自身のインスタンス
	 */
	jumpPage(num) {
		if (typeof num !== 'number') return this;
		const row = this.sentenceContainer().pageRow(num);
		if (row) {
			row.firstChild().addCursor().setPosMemory();
			this.sentenceContainer().changeDisplay('right');
		}
		return this;
	}
	/**
	 * 次の検索語句にカーソルを移動します。検索されていない、あるいは検索語句が見つからなければ何もしません
	 * @return {Cursor} 自身のインスタンス
	 */
	nextSearch() {
		const next = this.nextSearchChar();
		if (!next) { return this; }
		next.addCursor().setPosMemory();
		this.sentenceContainer().changeDisplay();
		return this;
	}
	/**
	 * @private
	 * 次の検索語句を返します
	 * @return {Char} 次の検索語句の１文字目のインスタンス。見つからなければnull
	 */
	nextSearchChar() {
		for (let char = this.getChar().nextChar() || this.sentenceContainer().firstChar(); !char.is(this.getChar()); char = char.nextChar() || this.sentenceContainer().firstChar()) {
			if (char.hasClass('search-label')) return char;
		}
		return null;
	}
	/**
	 * 前の検索語句にカーソルを移動します。検索されていない、あるいは検索語句が見つからなければ何もしません
	 * @return {Cursor} 自身のインスタンス
	 */
	prevSearch() {
		const prev = this.prevSearchChar();
		if (!prev) { return this; }
		prev.addCursor().setPosMemory();
		this.sentenceContainer().changeDisplay();
		return this;
	}
	/**
	 * @private
	 * 前の検索語句を返します
	 * @return {Char} 前の検索語句の１文字目のインスタンス。見つからなければnull
	 */
	prevSearchChar() {
		for (let char = this.getChar().prevChar() || this.sentenceContainer().lastChar(); !char.is(this.getChar()); char = char.prevChar() || this.sentenceContainer().lastChar()) {
			if (char.hasClass('search-label')) return char;
		}
		return null;
	}
	// カーソル移動前に、selectionにカーソル位置を覚えさせる
	/**
	 * @private
	 * selectionにカーソル位置を覚えさせる
	 * @return {Cursor} 自身のインスタンス
	 */
	memorySelection() {
		const selection = getSelection();
		if (selection.rangeCount === 0) {
			selection.selectAllChildren(this.getChar().elem());
		}
		return this;
	}
	// 選択範囲を動かす(カーソル移動時)
	/**
	 * bShiftがtrueなら選択範囲を拡張します
	 * @param {boolean} [opt_bShift] true=選択範囲を拡張する、false=選択範囲を解除する。省略されると何もしない
	 * @return {Cursor} 自身のインスタンス
	 */
	extendSelection(opt_bShift) {
		const selection = getSelection();
		if (opt_bShift) {
			// シフトキーが押されていれば、カーソルのオフセット０までselectionを拡張
			selection.extend(this.getChar().elem(),0);
		} else if (opt_bShift === false) {
			// シフトキー無しでカーソルが動いたならselectionを解除する(省略でなく、明確にfalseが渡された場合)
			selection.removeAllRanges();
		}
		return this;
	}
}

/**
 * ヒエラルキー構造を持つ各クラスの基底クラス
 * 木構造とは異なり、枝分かれしていても同列のオブジェクト間でポインタを持ち合います
 */
class AbstractHierarchy {
	/**
	 * @param {Element} elem 自身のDOM要素
	 */
	constructor(elem) {
		this._elem = elem;
		this._parent = null;
		this._next = null;
		this._prev = null;
		this._children = [];
		this._width = null;
		this._height = null;
	}

	// --参照取得

	/**
	 * 自身のDOM要素を返します
	 * @return {Element} 自身のDOM要素
	 */
	elem() {
		return this._elem;
	}
	/**
	 * 自身の親を設定します。また、引数を省略すると自身の親を取得します
	 * @param {AbstractHierarchy} [opt_newParent] 新たに設定する親
	 * @return {AbstractHierarchy} 自身のインスタンス(引数を渡した場合)あるいは自身の親のインスタンス(引数を省略した場合)
	 */
	parent(opt_newParent) {
		if (opt_newParent === undefined) { // nullが渡されることもあるのでundefinedと厳密に比較
			return this._parent;
		} else {
			this._parent = opt_newParent;;
			return this;
		}
	}
	/**
	 * 自身の次にある同列のインスタンスを新たに設定します。また、引数を省略すると自身の次にある同列のインスタンスを取得します
	 * @param {AbstractHierarchy} [opt_newNext] 新たに設定するインスタンス
	 * @return {AbstractHierarchy} 自身のインスタンス(引数を渡した場合)あるいは自身の次にある同列のインスタンス(引数を省略した場合)
	 */
	next(opt_newNext) {
		if (opt_newNext === undefined) {
			return this._next;
		} else {
			this._next = opt_newNext;
			return this;
		}
	}
	/**
	 * 自身の前にある同列のインスタンスを新たに設定します。また、引数を省略すると自身の前にある同列のインスタンスを取得します
	 * @param {AbstractHierarchy} [opt_newPrev] 新たに設定するインスタンス
	 * @return {AbstractHierarchy} 自身のインスタンス(引数を渡した場合)あるいは自身の前にある同列のインスタンス(引数を省略した場合)
	 */
	prev(opt_newPrev) {
		if (opt_newPrev === undefined) {
			return this._prev;
		} else {
			this._prev = opt_newPrev;
			return this;
		}
	}
	/**
	 * 指定されたインデックスの子を取得します。また、引数省略で自身の子を配列で取得します
	 * @param {number} [opt_index] 取得する子のインデックス。範囲外ならundefinedが返される
	 * @return {AbstractHierarchy} indexで指定された子(引数を渡した場合)あるいは自身の子の配列(引数を省略した場合)
	 */
	children(opt_index) {
		if (opt_index === undefined) {
			return Util.copyArray(this._children);
		} else {
			return this._children[opt_index];
		}
	}
	/**
	 * 自身の最初の子を取得します
	 * @return {AbstractHierarchy} 自身の最初の子。子がいなければnull
	 */
	firstChild() {
		if (this.hasChild()) {
			return this._children[0];
		} else {
			return null;
		}
	}
	/**
	 * 自身の最後の子を取得します
	 * @return {AbstractHierarchy} 自身の最後の子。子がいなければnull
	 */
	lastChild() {
		if (this.hasChild()) {
			return this._children[this.childLength()-1];
		} else {
			return null;
		}
	}

	// --判定

	/**
	 * objが自身と同一のオブジェクトかどうかを返します
	 * @param {AbstractHierarchy} obj 比較するオブジェクト
	 * @return {boolean} objが自身と同一ならtrue、そうでなければfalse
	 */
	is(obj) {
		return obj === this;
	}
	/**
	 * 自身がクラスにclassNameを持っているかどうかを返します
	 * @param {string} className 判定するクラス名
	 * @return {boolean} 自身がclassNameを付与されていればtrue、そうでなければfalse
	 */
	hasClass(className) {
		return this._elem.classList.contains(className);
	}
	/**
	 * 自身が子を持っているかどうかを返します
	 * @return {boolean} 自身が子を持っていればtrue、そうでなければfalse
	 */
	hasChild() {
		return this._children.length > 0;
	}
	/**
	 * 自身が親にとって唯一の子であるかどうかを返します
	 * @return {boolean} 自身が親にとって唯一の子であればtrue、そうでなければfalse
	 */
	isOnlyChild() {
		return this.parent().childLength() === 1
			&& this.parent().children(0) === this;
	}
	/**
	 * 自身の子が空であるかどうかを返します
	 * @return {boolean} 自身が子を持っていなければtrue、そうでなければfalse
	 */
	isEmpty() {
		return this._children.length === 0;
	}
	/**
	 * 同一の親を持つ次の兄弟が存在するかどうかを返します
	 * @return {boolean} 自身の次のインスタンスの親が自身の親と同一ならtrue、そうでなければfalse
	 */
	hasNextSibling() {
		if (this.next()) {
			return this.next().parent() === this.parent();
		} else {
			return false;
		}
	}
	/**
	 * 同一の親を持つ前の兄弟が存在するかどうかを返します
	 * @return {boolean} 自身の前のインスタンスの親が自身の親と同一ならtrue、そうでなければfalse
	 */
	hasPrevSibling() {
		if (this.prev()) {
			return this.prev().parent() === this.parent();
		} else {
			return false;
		}
	}
	/**
	 * 自身が親の第一の子であるかどうかを返します
	 * @return {boolean} 自身の前のインスタンスの親が自身の親と同一でなければtrue、そうでなければfalse
	 */
	isFirst() {
		return !this.hasPrevSibling();
	}
	/**
	 * 自身が親の最後の子であるかどうかを返します。Charの場合は、EOLの前の文字とEOLの２つでtrueを返します
	 * @return {boolean} 自身の次のインスタンスの親が自身の親と同一でなければtrue、そうでなければfalse
	 */
	isLast() {
		return !this.hasNextSibling();
	}

	// --参照操作

	/**
	 * childを自身の子の最後に加えます
	 * @param {AbstractHierarchy} child 自身の子の最後に加えるインスタンス
	 * @return {AbstractHierarchy} 自身のインスタンス
	 */
	pushChild(child) {
		this._children.push(child);
		return this;
	}
	/**
	 * 自身の子のpos番目にchildを加えます
	 * @param {number} pos childを加える位置のインデックス(０始まり)
	 * @param {AbstractHierarchy} child 子に加えるインスタンス
	 * @return {AbstractHierarchy} 自身のインスタンス
	 */
	insertChild(pos,child) {
		// 配列の範囲外の数値を渡されたらpushに切り替える
		if (pos < 0 || pos >= this._children.length) {
			return this.pushChild(child);
		}
		this._children.splice(pos,0,child);
		return this;
	}
	/**
	 * childを自身の子から削除します
	 * @param {AbstractHierarchy} child 自身の子から削除するインスタンス
	 * @return {AbstractHierarchy} 自身のインスタンス
	 */
	deleteChild(child) {
		const pos = child.index();
		this._children.splice(pos,1);
		child.parent(null);
		return this;
	}
	/**
	 * 自身の子のoldChildを子から削除し、新たにnewChildを同じ位置に加えます
	 * @param {AbstractHierarchy} oldChild 入替えられる自身の子のインスタンス
	 * @param {AbstractHierarchy} newChild 入れ替える自身の子でなかったインスタンス
	 * @return {AbstractHierarchy} 自身のインスタンス
	 */
	replaceChild(oldChild,newChild) {
		const pos = oldChild.index();
		this._children.splice(pos,1,newChild);
		return this;
	}
	/**
	 * 子の参照を自身から切り離して空にします。DOM要素には影響しません
	 * @return {AbstractHierarchy} 自身のインスタンス
	 */
	emptyChild() {
		this._children = [];
		return this;
	}

	// --Status

	/**
	 * 自身が表す文字列を返します
	 * @return {string} 自身の内部にある文字列
	 */
	text() {
		return this.elem().textContent;
	}
	/**
	 * 自身が表す文字列の文字数を返します
	 * @return {number} 自身の内部にある文字列の文字数
	 */
	length() {
		return this.text().length;
	}
	/**
	 * 同一の親を持つ兄弟の中でのインデックスを返します
	 * @return {number} 同一の親を持つ兄弟の中での０始まりのインデックス
	 */
	index() {
		const siblings = this.parent().children();
		return siblings.indexOf(this);
	}
	/**
	 * 自身の子の数を返します
	 * @return {number} 自身の子の数
	 */
	childLength() {
		return this._children.length; // Rowではchildren()の意味が違うので、混同しないようchildren()をさけて直接プロパティにアクセスする
	}

	// --Style

	/**
	 * 自身の持つクラスすべてをひとつの文字列で返します
	 * @return {string} 自身の持つすべてのクラス名
	 */
	className() {
		return this._elem.className || ''; // クラスがひとつもなければ空文字
	}
	/**
	 * 自身のクラスにclassNameを加えます
	 * @param {string} className 自身のクラスに加えるクラス名
	 * @return {AbstractHierarchy} 自身のインスタンス
	 */
	addClass(className) {
		this._elem.classList.add(className);
		return this;
	}
	/**
	 * 自身のクラスからclassNameを除去します
	 * @param {string} className 自身のクラスから除去するクラス名
	 * @return {AbstractHierarchy} 自身のインスタンス
	 */
	removeClass(className) {
		this._elem.classList.remove(className);
		return this;
	}
	/**
	 * 自身の持つすべての子のクラスからclassNameを除去します
	 * @param {string} className 除去するクラス名
	 * @return {AbstractHierarchy} 自身のインスタンス
	 */
	removeClassFromAllChild(className) {
		for (let child of this._children) {
			child.removeClass(className);
		}
		return this;
	}
	/**
	 * 自身の高さを取得します
	 * @param {boolean} [opt_useCache=true] true=キャッシュを利用する、false=キャッシュを利用しない。省略するとデフォルトでtrueになるので、キャッシュを使わず計算し直す場合には明示的にfalseを渡す必要がある
	 * @return {number} 自身の高さ
	 */
	height(opt_useCache) {
		// elementが不可視状態にあれば長さが０になったり、ブラウザごとに取得手段に違いがあったり直接指定されているstyleとcssでの指定の違い、cssでの指定が'auto'になっていると文字列が返ってきたりと
		// javascriptでのcss値の取得は複雑で困難であることから、jQueryの使用が適していると判断した(不可視の要素は一時的に可視状態にしてから取得するので、レンダリングが発生する可能性は高い)
		// 読み込み時には時間がかかるが、キャッシュすることで行移動などでは最低限の計算になると期待
		if (opt_useCache == undefined) opt_useCache = true;
		if (opt_useCache && this._height) {
			return this._height;
		}
		return this._height = parseInt($(this.elem()).css('height'));
	}
	/**
	 * 自身の幅を取得します
	 * @param {boolean} [opt_useCache=true] true=キャッシュを利用する、false=キャッシュを利用しない。省略するとデフォルトでtrueになるので、キャッシュを使わず計算し直す場合には明示的にfalseを渡す必要がある
	 * @return {number} 自身の幅
	 */
	width(opt_useCache) {
		if (opt_useCache == undefined) opt_useCache = true;
		if (opt_useCache && this._width) {
			return this._width;
		}
		return this._width = parseInt($(this.elem()).css('width'));
	}
	/**
	 * 要素左上のX座標を返します
	 * @return {number} 要素左上のX座標
	 */
	x() {
		return this.elem().getBoundingClientRect().left + window.pageXOffset;
	}
	/**
	 * 要素左上のY座標を返します
	 * @return {number} 要素左上のY座標
	 */
	y() {
		return this.elem().getBoundingClientRect().top + window.pageYOffset;
	}
	/**
	 * ある点からオブジェクトの中心点までの距離を計算します
	 * @param {number} x 基準点のX座標
	 * @param {number} y 基準点のY座標
	 * @return {number} 計算された距離のピクセル数
	 */
	computeDistanceFromPoint(x,y) {
		const ownPos = this.computeCenterPoint();
		return Util.computeDistanceP2P(x,y,ownPos.x,ownPos.y);
	}
	/**
	 * 中心点の座標を返します
	 * @return {object} プロバティxにX座標、プロパティyにY座標の入ったオブジェクト
	 */
	computeCenterPoint() {
		return {
			x: this.x() + this.width()/2,
			y: this.y() + this.height()/2
		}
	}

	// --DOM操作関係

	/**
	 * 内部のエレメントを空にします。childrenとして持っていない要素(EOLなど)は削除されません
	 * @return {AbstractHierarchy} 自身のインスタンス
	 */
	emptyElem() {
		for (let child of this._children) {
			this.elem().removeChild(child.elem());
		}
		return this;
	}
	/**
	 * 内部のエレメントに加え、内部の参照も空にします
	 * @return {AbstractHierarchy} 自身のインスタンス
	 */
	empty() {
		this.emptyElem();
		this.emptyChild();
		return this;
	}

	// --イベント

	/**
	 * 自身にkeydownイベントリスナーを付加します。重ねがけは無効となります
	 * @return {AbstractHierarchy} 自身のインスタンス
	 */
	addKeydownEventListener() {
		if (this._keydownArg) return this;
		this._keydownArg = this.onKeydown.bind(this); // removeするときと引数を同一にするためプロパティに保持する(それぞれでbindすると異なる参照になる？)
		document.addEventListener('keydown',this._keydownArg);
		return this;
	}
	/**
	 * 自身のkeydownイベントリスナーを除去します
	 * @return {AbstractHierarchy} 自身のインスタンス
	 */
	removeKeydownEventListener() {
		if (!this._keydownArg) return this;
		document.removeEventListener('keydown',this._keydownArg);
		this._keydownArg = null;
		return this;
	}
	/**
	 * @private
	 * keydownイベントの前処理を行い、イベントを実行します
	 * @param {object} e イベントオブジェクト
	 */
	onKeydown(e) {
		'use strict';
		let keycode;
		if (document.all) {
			// IE
			keycode = e.keyCode
		} else {
			// IE以外
			keycode = e.which;
		}
		if (keycode === 123) { return; } // F12のみブラウザショートカットキー
		this.runKeydown(e,keycode);
		// デフォルトの動作を無効化する
		e.preventDefault();
	}
	/**
	 * @private
	 * keydownイベントの実行内容。onkeydown()内で使用するために定義しておくが、内容はサブクラスで上書きします
	 * @param {object} e イベントオブジェクト
	 * @param {number} keycode 押下されたキーのキーコード
	 * @return {AbstractHierarchy} 自身のインスタンス
	 */
	runKeydown(e,keycode) {
		return this;
	}
	/**
	 * 自身にクリックイベントを付加します。重ねがけは無効となります
	 * @return {AbstractHierarchy} 自身のインスタンス
	 */
	addClickEventListener() {
		if (this._clickArg) return this;
		this._clickArg = this.onClick.bind(this); // removeするときと引数を同一にするためプロパティに保持する(それぞれでbindすると異なる参照になる？)
		this.elem().addEventListener('click',this._clickArg);
		return this;
	}
	/**
	 * 自身のクリックイベントを除去します
	 * @return {AbstractHierarchy} 自身のインスタンス
	 */
	removeClickEventListener() {
		if (!this._clickArg) return this;
		this.elem().removeEventListener('click',this._clickArg);
		this._clickArg = null;
		return this;
	}
	/**
	 * @private
	 * クリックイベントを実行します
	 * @param {Event} e イベントオブジェクト
	 */
	onClick(e) {
		this.runClick(e);
	}
	/**
	 * @private
	 * clickイベントの実行内容です。onClick()内で使用するために定義しておきますが、内容はサブクラスで上書きする必要があります
	 * @param {object} e イベントオブジェクト
	 * @return {AbstractHierarchy} 自身のインスタンス
	 */
	runClick(e) {
		return this;
	}
	/**
	 * 自身にホイールイベントを付加します。重ねがけは無効となります
	 * @return {AbstractHierarchy} 自身のインスタンス
	 */
	addWheelEventListener() {
		if (this._wheelArg) return this;
		this._wheelArg = this.onWheel.bind(this); // removeするときと引数を同一にするためプロパティに保持する(それぞれでbindすると異なる参照になる？)
		const selector = '#' + this.elem().id;
		$('body').on('mousewheel',selector,this._wheelArg)
			return this;
	}
	/**
	 * 自身のホイールイベントを除去します
	 * @return {AbstractHierarchy} 自身のインスタンス
	 */
	removeWheelEventListener() {
		if (!this._wheelArg) return this;
		const selector = '#' + this.elem().id;
		$('body').off('mousewheel',selector,this._wheelArg);
		this._wheelArg = null;
		return this;
	}
	/**
	 * @private
	 * keydownイベントの前処理を行い、イベントを実行します
	 * @param {object} e イベントオブジェクト
	 * @param {number} delta ホイールの移動量
	 * @param {number} deltaX
	 * @param {number} deltaY
	 */
	onWheel(e,delta,deltaX,deltaY) {
		this.runWheel(e,delta > 0);
	}
	/**
	 * @private
	 * ホイールイベントの実行内容です。onWheel()内で使用するために定義しておきますが、内容はサブクラスで上書きする必要があります
	 * @param {object} e イベントオブジェクト
	 * @param {boolean} isUp ホイールが上方向に動いたならtrue、そうでなければfalse
	 * @return {AbstractHierarchy} 自身のインスタンス
	 */
	runWheel(e,isUp) {
		return this;
	}
}

/**
 * 文字を表すクラス
 */
class Char extends AbstractHierarchy {
	/**
	 * @param {object} data 文字を表すオブジェクト<br>
	 * <pre>
	 * <code>
	 *  // 例
	 *		{
	 *			"char":"あ",
	 *			"decolation":["decolation-color-blue"]
	 *			"fontSize": "auto"
	 *		}
	 *	</code>
	 *	</pre>
	 */
	constructor(data) {
		super(data.char ? Util.createCharElement(data) : data); // dataオブジェクトにcharプロパティがなければEOLからの呼び出しで、dataにはエレメントが入っている
		data.fontSize && (this._fontSize = data.fontSize);
	}

	// --参照取得

	/**
	 * 自身の親であるRowインスタンスをnewRowに設定します、あるいは引数省略で取得します
	 * @param {Row} [opt_newRow] 新たに設定する行のインスタンス
	 * @return {Char Row} 自身のインスタンス(引数を渡した場合)あるいは自身の親のインスタンス(引数を省略した場合)
	 */
	row(opt_newRow) {
		return this.parent(opt_newRow);
	}
	/**
	 * 自身の属する段落のインスタンスを取得します
	 * @return {Paragraph} 自身の属する段落のインスタンス
	 */
	paragraph() {
		return this.row().paragraph();
	}
	/**
	 * 自身の属する文章コンテナのインスタンスを取得します
	 * @return {SentenceContainer} 自身の属する文章コンテナのインスタンス
	 */
	sentenceContainer() {
		return this.paragraph().container();
	}
	/**
	 * カーソルのインスタンスを取得します
	 * @return {Cursor} 自身の属する文章コンテナの持つカーソルのインスタンス
	 */
	cursor() {
		return this.row().paragraph().container().cursor();
	}
	// Cursor用
	/**
	 * カーソル文字として自身が不適なら自身の次のCharを返します。具体的には、自身が段落途中のEOLならその次の文字となります
	 * @return {Char} 自身も含めた自身以降でカーソル文字として適したインスタンス
	 */
	slideNextCursor() {
		// 段落最後のEOL以外のEOLには止まらない
		// 段落途中のEOLならその次の文字に変更する
		if (this.isEOL() && this.row().hasNextSibling()) {
			return this.next();
		} else {
			return this;
		}
	}
	/**
	 * カーソル文字として自身が不適なら自身の前のCharを返します。具体的には、自身が段落途中のEOLならその前の文字となります
	 * @return {Char} 自身も含めた自身以前でカーソル文字として適したインスタンス
	 */
	slidePrevCursor() {
		// 段落最後のEOL以外のEOLには止まらない
		// 段落途中のEOLならその前の文字に変更する
		if (this.isEOL() && this.row().hasNextSibling()) {
			return this.prev();
		} else {
			return this;
		}
	}
	/**
	 * 自身の次の文字を表すCharインスタンスを返します。段落途中か段落の最後かに関わらず、EOLは完全排除して文字のみを返します
	 * @return {Char} 自身の次のCharインスタンス。見つからなければnull
	 */
	nextChar() {
		if (this.next() && this.next().isEOL()) {
			return this.next().nextChar();
		} else {
			return this.next();
		}
	}
	/**
	 * 自身の前の文字を表すCharインスタンスを返します。段落途中か段落の最後かに関わらず、EOLは完全排除して文字のみを返します
	 * @return {Char} 自身の前のCharインスタンス。見つからなければnull
	 */
	prevChar() {
		if (this.prev() && this.prev().isEOL()) {
			return this.prev().prevChar();
		} else {
			return this.prev();
		}
	}
	/**
	 * 同一段落内での次の文字を返します。EOLは含みません
	 * @return {Char} 同一段落内での次の文字のインスタンス。なければnull
	 */
	nextCharOnParagraph() {
		if (this.hasNextCharOnParagraph()) {
			return this.nextChar();
		}
		return null;
	}
	/**
	 * 同一段落内での前の文字を返します。EOLは含みません
	 * @return {Char} 同一段落内での前の文字のインスタンス。なければnull
	 */
	prevCharOnParagraph() {
		if (this.hasPrevCharOnParagraph()) {
			return this.prevChar();
		}
		return null;
	}

	// --判定

	/**
	 * 自身がEOLであるかどうかを返します
	 * @return {boolean} オーバーライドされない限り常にfalse
	 */
	isEOL() {
		return false;
	}
	/**
	 * 自身にカーソルがあたっているかどうかを返します
	 * @return {boolean} 自身にカーソルがあればtrue、そうでなければfalse
	 */
	hasCursor() {
		return this.hasClass('cursor');
	}
	/**
	 * 自身が可視化されているかどうかを返します
	 * @return {boolean} 自身が可視化されていればtrue、そうでなければfalse
	 */
	isDisplay() {
		return this.hasClass('display');
	}
	/**
	 * 自身が同一行内で最終文字であるかどうかを返します。EOLは含みません(次の文字がEOLならfalse,自身がEOLの場合もfalse)
	 * @return {boolean} 同一行内で最終文字でなければtrue、最終文字ならfalse。
	 */
	hasNextSibling() {
		return !(this._isEOL || this.next().isEOL());
	}
	/**
	 * 同一段落内で次のCharがあるかどうかを返します
	 * @return {boolean} 同一段落内で次のCharがあればtrue、そうでなければfalse
	 */
	hasNextCharOnParagraph() {
		return this.nextChar() && this.nextChar().paragraph() === this.paragraph();
	}
	/**
	 * 同一段落内で前のCharがあるかどうかを返します
	 * @return {boolean} 同一段落内で前のCharがあればtrue、そうでなければfalse
	 */
	hasPrevCharOnParagraph() {
		return this.prevChar() && this.prevChar().paragraph() === this.paragraph();
	}
	/**
	 * この要素がrangeの中にあるかどうかを返します
	 * @param {Range} range 判定の基準となる範囲を表すRange
	 * @return {boolean} この要素がrangeの中にあればtrue、そうでなければfalse
	 */
	isInRange(range) {
		const charRange = document.createRange();
		// 現在の要素を囲む範囲をcharRangeとして設定。selectNodeContentsをselectNodeにする、あるいは引数をテキストノードではなくspan要素にすると、選択中最初と最終文字が反応しないことがある
		charRange.selectNodeContents(this.elem().childNodes.item(0));
		// 開始位置が同じかselectの開始位置より文字の開始位置が後ろにあり、
		// 終了位置が同じかselectの終了位置より文字の終了位置が前にある
		if (charRange.compareBoundaryPoints(Range.START_TO_START,range) >= 0
				&& charRange.compareBoundaryPoints(Range.END_TO_END,range) <= 0) {
			charRange.detach();
			return true;
		}
		charRange.detach();
		return false;
	}
	/**
	 * この文字が太字になっているかどうかを返します
	 * @return {boolean} 太字になっていればtrue、そうでなければfalse
	 */
	isBold() {
		return this.hasClass('decolation-font-bold');
	}
	/**
	 * この文字が斜体になっているかどうかを返します
	 * @return {boolean} 斜体になっていればtrue、そうでなければfalse
	 */
	isItalic() {
		return this.hasClass('decolation-font-italic');
	}

	// --Status

	/**
	 * この文字の状態を表す規定のオブジェクトを作成します
	 * @return {object} この文字の状態を表す規定のオブジェクト
	 */
	data() {
		const data = {};
		data['char'] = this.text();
		data['decolation'] = this.classArray();
		data['fontSize'] = this.fontSize() + '';
		return data;
	}
	/**
	 * @private
	 * この文字にかかっている装飾のクラスを配列にして返します
	 * @return {string[]} この文字にかかっている装飾のクラスの配列。文字装飾がかかっていなければ空の配列
	 */
	classArray() {
		return this.className().match(/decolation-\S+/g) || [];
	}

	// --Style

	/**
	 * この文字にカーソルを当てます
	 * @param {boolean} [opt_bShift] シフトキーが押されていればtrue、そうでなければfalse
	 * @return {Char} 自身のインスタンス
	 */
	addCursor(opt_bShift) {
		this.cursor().addCursor(this,opt_bShift);
		return this;
	}

	/**
	 * この文字のフォントサイズを変更します。あるいは引数省略で現在のフォントサイズを取得します
	 * @param {number} [opt_fontSize] 新たに設定するフォントサイズ
	 * @return {Char number string} 自身のインスタンス(引数を渡した場合)。現在のフォントサイズ(引数を省略した場合)、フォントサイズが数値で設定されていなければ文字列の'auto'
	 */
	fontSize(opt_fontSize) {
		if (opt_fontSize) {
			this._fontSize = opt_fontSize;
			this._elem.dataset.fontSize = opt_fontSize;
			// フォントサイズが変更されると行の幅が変わる可能性があるため、計算し直しておく
			this.row().width(false);
			return this;
		} else {
			if (this._fontSize) {
				if (this._fontSize === 'auto') {
					return this._fontSize;
				} else {
					return parseInt(this._fontSize);
				}
			} else {
				return 'auto';
			}
		}
	}
	/**
	 * この文字に文字色を設定します。あるいは引数省略で現在の文字色を取得します
	 * @param {string boolean} [opt_color] 文字列ならその色に設定する、falseを渡せば文字色を解除する
	 * @return {Char string} 自身のインスタンス(引数を渡した場合)、あるいは現在の文字色(引数を省略した場合。文字色が設定されていなければ'black')
	 */
	color(opt_color) {
		if (opt_color) {
			this.addColor(opt_color);
			return this;
		}
		if (opt_color === false) {
			this.removeColor();
			return this;
		}
		if (opt_color === undefined) {
			const color = this.className().match(/decolation-color-(\S+)/);
			return color ? color[1] : 'black';
		}
	}
	/**
	 * この文字の太字を設定、解除します
	 * @param {boolean} bl trueなら太字にする、falseなら太字を解除する
	 * @return {Char} 自身のインスタンス
	 */
	bold(bl) {
		if (bl) {
			this.addClass('decolation-font-bold');
		} else {
			this.removeClass('decolation-font-bold');
		}
		return this;
	}
	/**
	 * この文字の斜体を設定、解除します
	 * @param {boolean} bl trueなら斜体にする、falseなら斜体を解除する
	 * @return {Char} 自身のインスタンス
	 */
	italic(bl) {
		if (bl) {
			this.addClass('decolation-font-italic');
		} else {
			this.removeClass('decolation-font-italic');
		}
		return this;
	}
	/**
	 * @private
	 * 文字色を設定します
	 * @param {string} color 設定する文字色
	 * @return {Char} 自身のインスタンス
	 */
	addColor(color) {
		// 同一種のクラスをすでに持っていたら外す
		this.removeColor();
		if (color === 'decolation-color-black') return; // ブラックなら外して終わり
		this.addClass('decolation-color-'+ color);
		return this;
	}
	/**
	 * @private
	 * 文字色を解除します
	 * @return {Char} 自身のインスタンス
	 */
	removeColor() {
		const regexp = new RegExp('decolation-color-\\S+');
		const rmClass = this.className().match(regexp);
		if (rmClass) { this.removeClass(rmClass[0]); }
		return this;
	}
	/**
	 * この文字から始まる文字列がstrと合致するなら、その文字列のCharにクラスを付与します
	 * @param {string} str 判定する文字列
	 * @return {Char} 自身のインスタンス
	 */
	markSearchPhrase(str) {
		// １文字ずつ比較し、渡された文字列の長さ分のループを終えるまでに異なる文字が現れるか段落に残りの文字がなくなればreturn
		// 最初のループを無事に終えればこの文字から始まる文字列はstrに合致しているということなので、それぞれクラスを付与する

		// 合致しているかの判定
		// 合致しない文字が現れたか、文字列を比較し終える前に段落の最後に達したらreturn
		for (let i = 0,len = str.length,char = this; i < len; i++,char = char.nextCharOnParagraph()) {
			if (!char || str.charAt(i) !== char.text()) return this;
		}

		// クラスの付与
		this.addClass('search-label');
		for (let i = 0,len = str.length,char = this; i < len; char = char.nextChar(),i++) {
			char.addClass('search-word');
		}
		return this;
	}

	// --DOM操作関係

	/**
	 * charを自身の直前に挿入します
	 * @param {Char} char 挿入するインスタンス
	 * @return {Char} 自身のインスタンス
	 */
	before(char) {
		// DOM
		// this.elem().before(char.elem()); // before(),after()はまだサポートされず
		this.row().elem().insertBefore(char.elem(),this.elem());

		// ポインタ調整
		// oldPrev - char - this

		// char
		const oldPrev = this.prev();
		oldPrev && this.prev().next(char);
		char.prev(oldPrev);
		char.next(this);
		this.prev(char);
		// parent
		char.row(this.row());
		const pos = this.index();
		this.row().insertChar(pos,char);
		return this;
	}
	/**
	 * charを自身の直後に挿入します
	 * @param {Char} char 挿入するインスタンス
	 * @return {Char} 自身のインスタンス
	 */
	after(char) {
		if (this.isEOL()) { return this; } // todo: 例外を使用したほうがいいかも EOLからのafterはできない
		// DOM
		if (this.hasNextSibling()) {
			this.row().elem().insertBefore(char.elem(),this.next().elem());
		} else {
			this.row().elem().appendChild(char.elem());
		}

		// ポインタ調整
		// this - char - oldNextChar

		// char
		const oldNextChar = this.next();
		this.next(char);
		char.prev(this);
		char.next(oldNextChar);
		oldNextChar && oldNextChar.prev(char);
		// parent
		char.row(this.row());
		const pos = this.index() + 1;
		this.row().insertChar(pos,char);
		return this;
	}
	/**
	 * 自身を削除します。文書整形は行いません
	 * @return {Char} 自身のインスタンス
	 */
	remove() {
		// 要素と参照の削除
		if (this.isEOL()) return this; // EOLは削除不可
		const row = this.row();
		row.elem().removeChild(this.elem());
		// oldPrev - this - oldNext →　oldPrev - oldNext
		const oldPrev = this.prev();
		const oldNext = this.next();
		if (oldPrev) oldPrev.next(oldNext);
		if (oldNext) oldNext.prev(oldPrev);
		// 古い親の配列から削除
		row.deleteChar(this);
		return this;
	}
	/**
	 * 自身を削除し、文書整形を行います(空行ができたらその行も削除し、文字数調整や禁則処理を行います)
	 * @return {Char} 自身のインスタンス
	 */
	delete() {
		const row = this.row();
		const paragraph = row.paragraph();
		this.remove();

		// 段落先頭以外の行で、文字を削除した結果行が空になった場合、その行を削除する
		if (!row.isFirst() && row.isEmpty()) {
			row.lastChild().hasCursor() && row.prev().EOL().addCursor().setPosMemory(); // 削除行にカーソルがあれば、その前の行のEOLにカーソルを移動する
			row.remove();
		}

		paragraph.cordinate().checkKinsoku();
		return this;
	}
	/**
	 * 自分自身をnewCharと入れ替えます
	 * @param {Char} newChar 自身と入れ替える文字のインスタンス
	 * @return {Char} 自身のインスタンス
	 */
	replace(newChar) {
		newChar.prev(this.prev());
		newChar.next(this.next());
		if (this.prev()) { this.prev().next(newChar); }
		if (this.next()) { this.next().prev(newChar); }
		this.prev(null);
		this.next(null);
		this.row().replaceChild(this,newChar);
		this.row(null);
		return this;
	}
	/**
	 * 前の行の最後に移動します。その結果空行ができたら削除し、カーソルがその行にあれば自身の次のEOLに移動します
	 *     段落はまたがず、移動前の自身が段落最初の文字であれば何もしません
	 * @return {Char} 自身のインスタンス
	 */
	moveLastBefore() {
		if (this.isEOL() || !this.isFirst()) { return this; } // 各行最初の文字でのみ有効
		if (this.row().isFirst()) return this; // 段落はまたがない

		const oldRow = this.row();
		this.remove(); // delete()内でcordinate()を使い、cordinate()内でmoveLastBefore()を使っているので、ここでdelete()を使うと無限再帰の恐れあり
		oldRow.prev().append(this);

		// 移動した結果、空行ができたら削除する
		if (oldRow.isEmpty()){
			oldRow.hasCursor() && this.next().addCursor(); // 削除行にカーソルが含まれていれば移動する
			oldRow.remove();
		}
		this.setPosMemory();
		return this;
	}
	/**
	 * 次の行の最初に移動します。次の行が同じ段落になければ新しく行を作り、カーソルは自身の次のEOLに移動します
	 * @return {Char} 自身のインスタンス
	 */
	moveFirstAfter() {
		if (this.isEOL() || !this.isLast()) return this; // 各行最後の文字でのみ有効

		const oldRow = this.row();
		// 次の行がなければ新しく作る(段落はまたがない)
		if (oldRow.isLast()) {
			const newRow = Row.createEmptyRow();
			oldRow.after(newRow);
			oldRow.EOL().hasCursor() && newRow.EOL().addCursor(); // 段落最後のEOLにカーソルがあれば動かないので、移動する
		}

		this.remove();
		oldRow.next().prepend(this.display(true)); // displayしておかなければ、changeDisplay()での計算に狂いが生じる

		this.setPosMemory(); // カーソルが付与されている文字は変わらないが、その文字の位置が変わる可能性があるためposMemoryを付け替える
		return this;
	}

	// --Display関係
	/**
	 * 自身の表示非表示を切り替えます
	 * @param {boolean} bDisplay trueなら表示、falseなら非表示
	 * @return {Char} 自身のインスタンス
	 */
	display(bDisplay) {
		if (bDisplay) {
			this._elem.classList.add('display');
		} else {
			this._elem.classList.remove('display');
		}
		return this;
	}

	// Utility

	/**
	 * 現在のメニューバーの状態に即してcを内容に持つ規定のオブジェクトを作成します。メソッドを持つ既存のCharインスタンスには影響しません
	 * @param {string} c 作成するオブジェクトが表す文字(１文字)
	 * @return {object} 文字データを表す規定のオブジェクト
	 */
	createData(c) {
		// Menuインスタンスを取得しやすくするため、インスタンスメソッドとして定義
		const ret = {};
		ret["char"] = c;
		const menu = this.paragraph().container().menu();
		ret["decolation"] = menu.charDecolations();
		ret["fontSize"] = menu.fontSizeInput();
		return ret;
	}
	/**
	 * 文字装飾のない文字の文字データを返します
	 * @param {string} c 作成するオブジェクトが表す文字(１文字)
	 * @return {object} 文字データを表す規定のオブジェクト
	 */
	static createPlainCharData(c) {
		const ret = {};
		ret['char'] = c;
		ret['decolation'] = [];
		ret['fontSize'] = 'auto';
		return ret;
	}

	// -- other

	/**
	 * この文字のインデックスをカーソル位置として記憶します
	 * @return {Char} 自身のインスタンス
	 */
	setPosMemory() {
		const index = this.index();
		this.cursor().setPosMemory(index);
		return this;
	}

	/**
	 * 自分を含めて、自分以降で同じ段落内のChar全てに処理を行います(EOLは含まない)
	 * @param {function} func 処理内容が定義された関数オブジェクト
	 * @return {Char} 自身のインスタンス
	 */
	afterEach(func) {
		const index = this.index();
		let cnt = 0;
		for (let char of this.row().chars()) {
			if (cnt >= index) func(char);
			cnt++;
		}
		return this;
	}
}

/**
 * 行の末端を表すクラス
 */
class EOL extends Char {
	// Rowとともに要素を作ってしまうため、要素を引数に取る必要がある
	/**
	 * @param {Element} elem 自身のDOM要素
	 */
	constructor(elem) {
		super(elem); // 最初にスーパークラスのコンストラクタを呼ばなければエラー
	}

	/**
	 * 自身がEOLであるかどうかを返します
	 * @return {boolean} 常にtrue
	 */
	isEOL() {
		return true;
	}

	// -- Status

	/**
	 * 自身のインデックスを返します
	 * @return {number} 自身は親の配列に入っていないので、親の配列の長さと同じ数値を返す
	 */
	index() {
		return this.row().childLength();
	}

	// --DOM操作

	/**
	 * rowを親として紐付けます
	 * @param {Row} row 親となる行のインスタンス
	 * @return {EOL} 自身のインスタンス
	 */
	appended(row) {
		// EOLは各行一文字目であるのとDom要素が先に作られるためRowのappend()が利用できない
		// EOLがappendedされるのはまだrowが文書内に組み込まれる前なので、nextとprevの操作は不要
		row.elem().appendChild(this.elem());
		this.row(row);
		return this;
	}
}

/**
 * 行を表すクラス
 */
class Row extends AbstractHierarchy {
	/**
	 * @param {object} data 行を表すオブジェクト<br>
	 * 例
	 * <pre>
	 * <code>
	 *	// 各文字のオブジェクトが配列で格納される
	 *	[
	 *		{	 // 文字を表すオブジェクト
	 *			"char":"あ",
	 *			"decolation":["decolation-color-blue"]
	 *			"fontSize":"auto"
	 *		},
	 *		{
	 *			"char":"い",
	 *			"decolation":null
	 *			"fontSize":"18"
	 *		}
	 *	]
	 *	</code>
	 *	</pre>
	 */
	constructor(data) {
		// 配列が渡されたら新しく要素を作り、そうでなければ要素が渡されたとしてそれを元にインスタンスを作る
		if (Array.isArray(data)) {
			super(Util.createRowElement(data));
		} else {
			// InputBufferの場合
			super(data);
			data = [];
		}
		this._EOL = new EOL(this._elem.lastElementChild);
		this._EOL.appended(this);
		if (!Array.isArray(data)) return;
		for (let charData of data) {
			const char = new Char(charData);
			this.append(char);
		}

		this.addClickEventListener();
	}

	// --参照取得

	/**
	 * 自身のEOLのインスタンスを返します
	 * @return {EOL} 自身のEOLのインスタンス
	 */
	EOL() {
		return this._EOL;
	}
	/**
	 * 自身の属する文章コンテナのインスタンスを返します
	 * @return {SentenceContainer} 自身の属する文章コンテナのインスタンス
	 */
	container() {
		return this.paragraph().container();
	}
	/**
	 * 自身の親の段落を新たに設定する、あるいは現在の親段落を取得します
	 * @param {Paragraph} [opt_newParagraph] 新たに設定する親段落
	 * @return {Row Paragraph} 自身のインスタンス(引数を渡した場合)あるいは自身の親段落のインスタンス(引数を省略した場合)
	 */
	paragraph(opt_newParagraph) {
		return this.parent(opt_newParagraph);
	}
	/**
	 * カーソルを持つ文字のインスタンスを取得します
	 * @return {Char} カーソルを持つ文字のインスタンス
	 */
	cursorChar() {
		return this.paragraph().container().cursor().getChar();
	}
	/**
	 * 自身の内部にある最初のインスタンスを返します
	 * @return {Char} 自身の第一文字のインスタンス。それがなければ自身のEOLのインスタンス
	 */
	firstChild() {
		// 空行ではEOLが選択されるため、firstChar()ではなくfirstChild()
		// RowではEOLが絡むためオーバーライドする
		if (this.hasChar()) {
			return this.chars()[0];
		} else {
			return this.EOL();
		}
	}
	/**
	 * 自身の内部にある最後のインスタンスであるEOLのインスタンスを返します
	 * @return {Char} 自身のEOLのインスタンス
	 */
	lastChild() {
		return this.EOL();
	}
	/**
	 * 自身の最終文字のインスタンスを返します
	 * @return {Char} 自身の最終文字のインスタンス。空行であればnull
	 */
	lastChar() {
		return super.lastChild();
	}
	/**
	 * 指定されたインデックスの子である文字のインスタンスを取得、あるいは子のインスタンスの配列を取得します。EOLは含まれません
	 * @param {number} [opt_index] 取得する子のインデックス
	 * @return {Char Char[]} 指定された子のインスタンス(引数を渡した場合。範囲外の数値ならundefined)、あるいは子のインスタンスの配列(引数を省略した場合。子がいなければ空の配列)
	 */
	chars(opt_index) { // EOLは含まれない
		return super.children(opt_index);
	}
	/**
	 * EOLを含む、指定されたインデックスの子である文字のインスタンスを取得、あるいは子のインスタンスの配列を取得します
	 * @param {number} [opt_index] 取得する子のインデックス
	 * @return {Char} 指定された子のインスタンス(引数を渡した場合。範囲外のインデックスならEOL)、あるいはEOLを含む子のインスタンスの配列(引数を省略した場合。子がいなければ要素がEOLのみである配列)
	 */
	children(opt_index) { // EOLを含む
		if (opt_index === undefined) {
			const ret = super.children(); // push()の戻り値はlenghtプロパティの値なので、一旦変数に入れる必要あり
			ret.push(this.EOL());
			return ret;
		} else {
			return super.children(opt_index) || this.EOL();
		}
	}

	// --判定

	/**
	 * 内部に文字があるかどうかを返します
	 * @return {boolean} 内部に文字があればtrue、EOLのみの空行ならfalse
	 */
	hasChar() {
		return super.hasChild();
	}
	/**
	 * 行内にカーソルがあるかどうかを返します
	 * @return {boolean} 行内にカーソルが含まれていればtrue、そうでなければfalse
	 */
	hasCursor() {
		for (let char of this.children()) {
			if (char.hasCursor()) return true;
		}
		return false;
	}
	/**
	 * この要素が可視化されているかどうかを返します
	 * @return {boolean} 可視化されていたらtrue、そうでなければfalse
	 */
	isDisplay() {
		return this.hasClass('display');
	}
	/**
	 * objが行内に含まれているかどうかを返します
	 * @param {Char} obj 判定するインスタンス
	 * @return {Char} objが行内にあるCharおよびEOLのいずれかに一致するとtrue、そうでなければfalse
	 */
	contains(obj) {
		if (!obj instanceof Char) return false;
		for (let char of this.children()) {
			if (char.is(obj)) return true;
		}
		return false;
	}
	/**
	 * ページ内で最初の行であるかどうかを返します
	 * @return {boolean} ページ内で最初の行であればtrue、そうでなければfalse
	 */
	isPageBreak() {
		return this.hasClass('page-break');
	}
	/**
	 * ページ内で最終行であるかどうかを返します
	 * @return {boolean} ページ内で最終行ならtrue、そうでなければfalse
	 */
	isPageLast() {
		return this.hasClass('page-last-row');
	}

	// --参照操作

	/**
	 * charを自身の子の最後に加えます
	 * @param {Char} char 子に加える文字のインスタンス
	 * @return {Row} 自身のインスタンス
	 */
	pushChar(char) {
		return this.pushChild(char);
	}
	/**
	 * charを自身の子の指定された位置に加えます
	 * @param {number} pos 加える位置のインデックス
	 * @param {Char} char 加える子のインスタンス
	 * @return {Row} 自身のインスタンス
	 */
	insertChar(pos,char) {
		return this.insertChild(pos,char);
	}
	/**
	 * charを自身の子から削除します
	 * @param {Char} char 削除する子のインスタンス
	 * @return {Row} 自身のインスタンス
	 */
	deleteChar(char) {
		return this.deleteChild(char);
	}

	// --Status

	/**
	 * この行の状態を表す規定のオブジェクトを作成します
	 * @return {object[]} この行の状態を表す規定のオブジェクト
	 */
	data() {
		const data = [];
		for (let char of this.chars()) {
			data.push(char.data());
		}
		return data;
	}
	/**
	 * この行の文字数を返します。EOLは含みません
	 * @return {number} この行の文字数。空行なら０
	 */
	charLen() {
		return super.childLength();
	}
	/**
	 * この行の内部にある文字のうち、最も大きいフォントサイズを返します。'auto'は18として計算します
	 * @return {number} 最大のフォント数
	 */
	maxFont() {
		let max = 0; // 空行では０になる
		for (let char of this.chars()) {
			max = Math.max(max,char.fontSize() === 'auto' ? 18 : char.fontSize());
		}
		return max;
	}

	// --Style

	/**
	 * この行の横幅を返します。行は９０度回転しているため、ここでいう幅はcss上の高さを表します
	 * @param {boolean} [opt_useCache=true] true=キャッシュを利用する、false=キャッシュを利用しない。省略するとデフォルトでtrueになるので、キャッシュを使わず計算し直す場合には明示的にfalseを渡す必要がある
	 * @return {number} 自身の幅
	 */
	width(opt_useCache) {
		return super.height(opt_useCache);
	}
	/**
	 * この行の高さを返します。行は９０度回転しているため、ここでいう高さはcss上の幅を表します
	 * @param {boolean} [opt_useCache=true] true=キャッシュを利用する、false=キャッシュを利用しない。省略するとデフォルトでtrueになるので、キャッシュを使わず計算し直す場合には明示的にfalseを渡す必要がある
	 * @return {number} 自身の高さ
	 */
	height(opt_useCache) {
		return super.width(opt_useCache);
	}

	// --DOM操作関係

	/**
	 * 子を空にして参照を整えます
	 * @return {Row} 自身のインスタンス
	 */
	empty() {
		// emptyElem()に加え、オブジェクト参照も切り離す
		this.emptyElem();
		const prevRow = this.prev();
		if (prevRow) {
			this.EOL().prev(prevRow.lastChild());
			prevRow.lastChild().next(this.EOL());
		} else {
			this.EOL().prev(null);
		}
		this.emptyChild();
		return this;
	}
	/**
	 * 自身の最初にcharを挿入します
	 * @param {Char} char 挿入する文字のインスタンス
	 * @return {Row} 自身のインスタンス
	 */
	prepend(char) {
		this.firstChild().before(char);
		return this;
	}
	/**
	 * 自身の最後(EOLの直前)にcharを挿入します
	 * @param {Char} char 挿入する文字のインスタンス
	 * @return {Row} 自身のインスタンス
	 */
	append(char) {
		this.EOL().before(char);
		return this;
	}
	/**
	 * 自身の直前にrowを挿入します
	 * @param {Row} row 挿入する行のインスタンス
	 * @return {Row} 自身のインスタンス
	 */
	before(row) {
		// DOM
		this.paragraph().elem().insertBefore(row.elem(),this.elem());

		// ポインタ調整
		// oldPrev - row - this

		// row
		const oldPrev = this.prev();
		oldPrev && oldPrev.next(row);
		row.prev(oldPrev);
		row.next(this);
		this.prev(row);
		// char
		oldPrev && oldPrev.lastChild().next(row.firstChild());
		oldPrev && row.firstChild().prev(oldPrev.lastChild());
		row.lastChild().next(this.firstChild());
		this.firstChild().prev(row.lastChild());
		// parent
		row.paragraph(this.paragraph());
		const pos = this.index();
		this.paragraph().insertRow(pos,row);
		return this;
	}
	/**
	 * 自身の直後にrowを挿入します
	 * @param {Row} row 挿入する行のインスタンス
	 * @return {Row} 自身のインスタンス
	 */
	after(row) {
		// DOM
		if (this.hasNextSibling()) {
			this.paragraph().elem().insertBefore(row.elem(),this.next().elem());
		} else {
			this.paragraph().elem().appendChild(row.elem());
		}

		// ポインタ調整
		// this - row - oldNext

		// row
		const oldNext = this.next();
		this.next(row);
		row.prev(this);
		row.next(oldNext);
		oldNext && oldNext.prev(row);
		// char
		this.lastChild().next(row.firstChild());
		row.firstChild().prev(this.lastChild());
		oldNext && row.lastChild().next(oldNext.firstChild());
		oldNext && oldNext.firstChild().prev(row.lastChild());
		// parent
		row.paragraph(this.paragraph());
		const pos = this.index() + 1;
		this.paragraph().insertRow(pos,row);
		return this;
	}
	/**
	 * 自身を削除します。文書整形は行われません
	 * @return {Row} 自身のインスタンス
	 */
	remove() {
		// 段落に自分しか行がない場合、段落ごと削除する
		if (this.isOnlyChild()) {
			this.paragraph().remove();
			return this;
		}

		this.paragraph().elem().removeChild(this.elem());
		// oldPrev - this - oldNext →　oldPrev - oldNext
		// row
		const oldPrevRow = this.prev();
		const oldNextRow = this.next();
		oldPrevRow && oldPrevRow.next(oldNextRow);
		oldNextRow && oldNextRow.prev(oldPrevRow);
		// char
		const oldPrevChar = oldPrevRow && oldPrevRow.lastChild();
		const oldNextChar = oldNextRow && oldNextRow.firstChild();
		oldPrevChar && oldPrevChar.next(oldNextChar);
		oldNextChar && oldNextChar.prev(oldPrevChar);

		this.paragraph().deleteRow(this);

		this.next(null);
		this.prev(null);
		this.firstChild().prev(null);
		this.lastChild().next(null);
		return this;
	}
	/**
	 * 自身を削除し、文書整形を行います(カーソルが含まれていれば前の行、前の行がなければ次の行にカーソルを移動します)
	 * @return {Row} 自身のインスタンス
	 */
	delete() {
		// カーソルを動かしたくなければremove()を使う
		const oldPrevRow = this.prev();
		const oldNextRow = this.next();

		this.remove();

		// カーソルが削除行に含まれていれば、その前の行にカーソルを移動する
		if (this.hasCursor()) {
			if (oldPrevRow) {
				this.cursor().moveRow(oldPrevRow);
			} else {
				this.cursor().moveRow(oldNextRow);
			}
		}
		return this;
	}
	/**
	 * 前の段落の最終行として移動します。各段落最初の行でのみ有効です。自身が空行であれば削除されます
	 * @return {Row} 自身のインスタンス
	 */
	moveLastBefore() {
		if (!this.isFirst()) { return this; } // 各段落最初の行でのみ有効
		if (this.paragraph().isFirst()) return this; // 文章先頭では無効

		const prevParagraph = this.paragraph().prev();

		// 空行を移動しようとした時の処理
		if (this.isEmpty()) {
			// 前の段落に移動せず削除する
			// カーソルが含まれていれば、カーソルを前の行のEOLに移動
			this.remove();
			this.hasCursor() && prevParagraph.lastChild().EOL().addCursor().setPosMemory();
			return this;
		}

		// 空行ではない
		if (!this.isEmpty()) {
			this.remove(); // カーソルはいじる必要なし
			prevParagraph.append(this);
			return this;
		}
	}
	/**
	 * 次のRowの第一文字を、自らの最後に移動します。段落内でのみ有効となります
	 * @return {Row} 自身のインスタンス
	 */
	bringChar() {
		if (this.isLast()) return this;
		this.next().firstChild().moveLastBefore();
		return this;
	}
	/**
	 * 次のRowの最初のnum文字を、自らの最後に移動します。段落内でのみ有効となります。また、文字同士の順番に変化はありません
	 * @param {number} num 移動する文字数
	 * @return {Row} 自身のインスタンス
	 */
	bringChars(num) {
		for (let i = 0; i < num; i++) {
			this.bringChar();
		}
		return this;
	}
	/**
	 * 自分の最後の文字を、次の行の最初に移動します。次の行がなければ新しく作成されます
	 * @return {Row} 自身のインスタンス
	 */
	takeChar() {
		if (!this.hasChar()) return this; // lastChar()でnullが取得される可能性があるため
		this.lastChar().moveFirstAfter(); // lastChild()では毎回EOLが取得されるのでlastChar()
		return this;
	}
	/**
	 * 自分の最後のnum文字を、次の行の最初に移動します。次の行がなければ新しく作成されます
	 * @param {number} num 移動する文字数
	 * @return {Row} 自身のインスタンス
	 */
	takeChars(num) {
		for (let i = 0; i < num; i++) {
			this.takeChar();
		}
		return this;
	}
	/**
	 * 引数の文字列から作成された装飾のない文字のインスタンスを自らの最後に追加します
	 * @return {Row} 自身のインスタンス
	 */
	createPlainContent(str) {
		for (let c of str) {
			this.append(new Char(Char.createPlainCharData(c)));
		}
		return this;
	}

	// --文章整理

	/**
	 * 指定文字数と異なる文字数なら、指定文字数に合わせて文字数を調節します。
	 *     標準以外のフォントサイズの文字があれば文字数はフォントサイズに合わせて調整されます。
	 *     また、自身が空段落以外での空行であれば削除します
	 * @return {Row} 自身のインスタンス
	 */
	cordinate() {
		if (this.index() > 0 && this.isEmpty()) return this.delete(); // 空段落以外での空行は削除する

		const strLen = this.container().strLenOnRow();
		const len = this.charLen();
		if (len < strLen) {
			this.bringChars(strLen - len);
		}

		// 多すぎる文字数は減らす
		// フォントの異なる文字が混ざっている場合、他の行と高さが異なってしまうため、その行の文字を変える必要がある
		const maxSize = strLen * 18; // 標準フォント×文字数の数値が基準
		let sum = 0;
		for (let array of this.chars().entries()) {
			const char = array[1];
			sum += char.fontSize() === 'auto' ? 18 : char.fontSize();
			if (sum > maxSize) {
				const index = array[0];
				this.takeChars(this.charLen() - index);
				break;
			}
		}
		return this;
	}
	/**
	 * 行内の禁則処理を行います
	 * @return {Row} 自身のインスタンス
	 */
	checkKinsoku() {
		if (this.isEmpty()) { return this; }
		// 行頭にあるべきではないもの
		for (let firstText = this.firstChild().text(); !this.isFirst() && /[」』）。、？]/.test(firstText); firstText = this.firstChild().text()) {
			this.firstChild().moveLastBefore();
		}
		// 行末にあるべきではないもの
		for (let lastText = this.lastChar().text(); !this.isLast() && /[「『（]/.test(lastText); lastText = this.lastChar().text()) {
			this.lastChar().moveFirstAfter();
		}
		return this;
	}

	// --Display関係

	/**
	 * 自身と子のCharを表示、あるいは非表示にします。内部の文字はfirst文字以降で自身に収まる文字を表示し、それ以外の文字は非表示にします
	 * @param {boolean} bDisplay trueであれば自身を表示し、falseで非表示にする
	 * @param {number} first 自身内部のCharを何文字目から表示するかのインデックス(０始まり)
	 * @return {Row} 自身のインスタンス
	 */
	display(bDisplay,first) {
		if (!bDisplay) {
			this.elem().classList.remove('display');
			return this;
		}

		this.elem().classList.add('display');
		const dispHeight = this.height();
		let heightSum = 0;
		const addArray = [];
		for (let array of this.chars().entries()) {
			const index = array[0];
			const char = array[1];
			if (index < first) {
				char.display(false);
				continue;
			}
			const fontHeight = char.fontSize(); // sizeの取得はDOMにアクセスせずに行っているため、ここではレンダリングは発生しない
			heightSum += fontHeight === 'auto' ? 18 : fontHeight;
			char.display(index >= first && heightSum < dispHeight); // trueになれば表示、falseになれば非表示
		}
		return this;
	}
	/**
	 * カーソル位置を基準にして、文字を何文字目から表示すべきかの計算結果を返します
	 * @return {number} 文字の表示開始位置のインデックス
	 */
	computeDisplayCharPos() {
		const cursorIndex = this.cursorChar().index();
		const currentFirst = this.firstDisplayCharPos();
		const currentEnd = this.lastDisplayCharPos();
		if (cursorIndex <= currentFirst) {
			// カーソルが前にある
			return cursorIndex;
		} else if ( cursorIndex > currentEnd) {
			// カーソルが後ろにある
			return currentFirst + (cursorIndex - currentEnd);
		} else {
			return currentFirst;
		}
	}
	/**
	 * この行が何文字目から表示されているかのインデックスを返します
	 * @return {number} EOL含め最初に表示された文字のインデックス。文字が全て非表示になっていれば-1
	 */
	firstDisplayCharPos() {
		for (let char of this.children()) {
			if (char.isDisplay()) return char.index();
		}
		return -1; // displayがひとつもない(EOLは常にdisplayなので、ここまで来たら異常)
	}
	/**
	 * この行が何文字目まで表示されているかのインデックスを返します
	 * @return {number} EOL含め最後に表示された文字のインデックス。文字が全て非表示になっていれば-1
	 */
	lastDisplayCharPos() {
		if (!this.hasChar) return 0;
		for (let i = this.charLen()-1,char; char = this.chars(i); i--) {
			if (char.isDisplay()) return char.next().isEOL() ? i + 1 : i; // すべての文字がdisplayしていればEOLのインデックスを返す
		}
		return -1;
	}

	// --イベント

	/**
	 * 行のクリックイベントの実行内容です。行をクリックすると最も近い文字にカーソルが当たります
	 * @param {Event} e イベントオブジェクト
	 */
	runClick(e) {
		if (this.container().inputBuffer().isDisplay()) return;
		const clickX = e.pageX;
		const clickY = e.pageY;
		let min = Number.MAX_VALUE;
		let closestChar;

		for (let char of this.children()) {
			const distance = char.computeDistanceFromPoint(clickX,clickY);
			if (distance < min) {
				min = distance;
				closestChar = char;
			}
		}
		closestChar.slidePrevCursor().addCursor().setPosMemory();
	}

	// --静的メソッド

	/**
	 * 空行のRowインスタンスを新たに作成します
	 * @return {Row} 作成されたインスタンス
	 */
	static createEmptyRow() {
		return new Row([]);
	}

	// -- other

	/**
	 * 同一段落で自分以降の行に処理を行います。
	 *     処理中に同一段落の行でなくなったなどしても影響せず、実行時時点で処理対象であった行すべてが処理されますので注意してください
	 * @param {function} func 処理が定義された関数オブジェクト
	 * @return {Row} 自身のインスタンス
	 */
	afterEach(func) {
		const index = this.index();
		let cnt = 0;
		for (let row of this.paragraph().rows()) {
			if (cnt >= index) func(row);
			cnt++;
		}
		return this;
	}

}

/**
 * 段落を表すクラス
 */
class Paragraph extends AbstractHierarchy {
	/**
	 * @param {object} data 段落を表すオブジェクト<br>
	 * 例
	 * <pre>
	 * <code>
	 *  // 段落のクラスと各文字オブジェクトの配列の入った配列
	 *	[
	 *		["decolation-textalign-center"],		 // 段落のクラスが文字列の配列で格納される
	 *		[												 // 各文字のオブジェクトが配列で格納される
	 *			{											 // 文字を表すオブジェクト
	 *				"char":"あ",
	 *				"decolation":["decolation-color-blue"]
	 *				"fontSize":"auto"
	 *			},
	 *			{
	 *				"char":"い",
	 *				"decolation":[]
	 *				"fontSize":"30"
	 *			}
	 *			]
	 *	]
	 *	</code>
	 *	</pre>
	 */
	constructor(data) {
		super(Util.createParagraphElement(data));
		const strLen = 40;
		const spArray = Util.splitArray(data[1],strLen); // data[1]が空配列なら、spArrayにも空配列が入る
		for (let charArray of spArray) {
			this.append(new Row(charArray));
		}
		// data[1]が空配列 = 空段落(空行)の場合は上記for文が実行されないので、別に空行を作成して連結する
		if (spArray.length === 0) {
			this.append(Row.createEmptyRow());
		}
	}

	// --参照取得

	/**
	 * 親の文章コンテナを設定、または引数省略で取得します
	 * @param {SentenceContainer} [opt_newContainer] 新たに設定する、自身の属する文章コンテナのインスタンス
	 * @return {Paragraph SentenceContainer} 自身のインスタンス(引数を渡した場合)、あるいは自身の親の文章コンテナのインスタンス
	 */
	container(opt_newContainer) {
		return this.parent(opt_newContainer);
	}
	/**
	 * 指定された行のインスタンス、あるいは引数省略で子のインスタンスの配列を取得します
	 * @param {number} [opt_index] 取得する子のインスタンスのインデックス
	 * @return {Row Row[]} 指定された行のインスタンス(引数を渡した場合)、あるいは子の配列(引数を省略した場合)
	 */
	rows(opt_index) {
		return this.children(opt_index);
	}

	// --判定

	/**
	 * 自身が内部に行を持っているかどうかを返します
	 * @return {boolean} 自身が子を持っていればtrue、そうでなければfalse
	 */
	hasRow() {
		return this.hasChild();
	}
	/**
	 * 自身が空段落であるかどうかを返します。
	 *     空行がひとつだけあってもtrueを返します(空行は空段落にしか存在しないのが正常であるため)
	 * @return {boolean} 内部に行が存在しないか、空行が一つだけならtrue
	 */
	isEmpty() {
		return !this.hasChild() || this.firstChild().isEmpty();
	}
	/**
	 * 段落内にカーソルが含まれているかどうかを返します
	 * @return {boolean} 段落内にカーソルが含まれていればtrue、そうでなければfalse
	 */
	hasCursor() {
		for (let row of this.rows()) {
			if (row.hasCursor()) return true;
		}
		return false;
	}
	/**
	 * 引数で渡されたオブジェクトが段落内にある行か文字のいずれかに一致するかどうかを返します
	 * @param {AbstractHierarchy} obj 判定するインスタンス
	 * @return {boolean} 引数で渡されたオブジェクトが段落内にある行か文字のいずれかに一致するとtrue、そうでなければfalse
	 */
	contains(obj) {
		for (let row of this.rows()) {
			if (row.is(obj)) return true;
			if (row.contains(obj)) return true;
		}
		return false;
	}

	// --参照操作

	/**
	 * 自身の子の最後にrowを加えます
	 * @param {Row} row 自身の子の最後に加えるインスタンス
	 * @return {Paragraph} 自身のインスタンス
	 */
	pushRow(row) {
		return this.pushChild(row);
	}
	/**
	 * 自身の子の指定された位置にrowを挿入します
	 * @param {number} pos rowを挿入する位置のインデックス
	 * @param {Row} row 挿入するインスタンス
	 * @return {Paragraph} 自身のインスタンス
	 */
	insertRow(pos,row) {
		return this.insertChild(pos,row);
	}
	/**
	 * 自身の子からrowを削除します
	 * @param {Row} row 削除する子のインスタンス
	 * @return {Paragraph} 自身のインスタンス
	 */
	deleteRow(row) {
		return this.deleteChild(row);
	}

	// --Status

	/**
	 * この段落の状態を表す規定のオブジェクトを作成します
	 * @return {object[]} この段落の状態を表す規定のオブジェクト
	 */
	data() {
		const data = [];
		data[0] = this.classArray();
		const charArray = [];
		for (let row of this.rows()) {
			for (let char of row.chars()) {
				charArray.push(char.data());
			}
		}
		data[1] = charArray;
		return data;
	}
	/**
	 * この段落の装飾のクラスを文字列の配列にします
	 * @return {string[]} 装飾関係のクラスの配列。なければ空の配列
	 */
	classArray() {
		return this.elem().className.match(/decolation-\S+/g) || [];
	}
	/**
	 * 段落内の文字数を数えます
	 * @return {number} 段落内の文字数
	 */
	countChar() {
		let cnt = 0;
		for (let row of this.rows()) {
			cnt += row.charLen();
		}
		return cnt;
	}

	// --Style

	/**
	 * 段落にtext-alignを設定する、あるいは引数省略で現在のtext-alignの状態を取得します
	 * @param {string boolean} [opt_align] 新たに設定する'left','center','right'の文字列。'left'あるいはfalseならalignを解除する
	 * @return {Paragraph string} 自身のインスタンス(引数を渡した場合)、あるいは現在のtext-alignの状態(引数を省略した場合)
	 */
	align(opt_align) {
		if (opt_align === undefined) {
			const align = this.className().match(/decolation-textalign-(\S+)/);
			return align ? align[1] : 'left';
		}
		if (opt_align) {
			const oldAlign = this.className().match(/decolation-textalign-\S+/);
			if (oldAlign) this.removeClass(oldAlign[0]);
			if (opt_align !== 'left') this.addClass('decolation-textalign-'+ opt_align);
		} else {
			const oldAlign = this.className().match(/decolation-textalign-\S+/);
			if (oldAlign) this.removeClass(oldAlign[0]);
		}
		return this;
	}
	/**
	 * 自身内部にあるすべてのCharから指定クラスを除去します
	 * @return {Paragraph} 自身のインスタンス
	 */
	removeClassFromAllChar(className) {
		for (let row of this.rows()) {
			row.removeClassFromAllChild(className);
		}
		return this;
	}
	/**
	 * 自身内部にある文字にstrと合致する文字列があればsearch-labelクラスとsearch-wordクラスを付与します
	 * @param {string} str 判定する文字列
	 * @return {Paragraph} 自身のインスタンス
	 */
	search(str) {
		this.removeClassFromAllChar('search-label');
		this.removeClassFromAllChar('search-word');
		for (let row of this.rows()) {
			for (let char of row.chars()) {
				char.markSearchPhrase(str);
			}
		}
		return this;
	}

	// --DOM操作関係

	/**
	 * 自身の最後にrowを追加します
	 * @param {Row} row 追加するインスタンス
	 * @return {Paragraph} 自身のインスタンス
	 */
	append(row) {
		this.elem().appendChild(row.elem());
		row.paragraph(this);
		const nextParagraph = this.next();
		// rowの後側接続
		if (nextParagraph) {
			// row
			const nextRow = nextParagraph.firstChild();
			nextRow.prev(row);
			row.next(nextRow);
			// char
			nextRow.firstChild().prev(row.lastChild());
			row.lastChild().next(nextRow.firstChild());
		}
		// rowの前側接続
		const oldLastRow = this.hasRow() ? this.lastChild() : (this.prev() ? this.prev().lastChild() : null); // 自段落の最終行　→　前の段落の最終行　→　null

		this.pushRow(row);
		if (oldLastRow === null) {
			// 一行も存在しない状態からのappend
			return this;
		}
		// row
		oldLastRow.next(row);
		row.prev(oldLastRow);
		// char
		oldLastRow.lastChild().next(row.firstChild());
		row.firstChild().prev(oldLastRow.lastChild());

		return this;
	}
	/**
	 * 自身の直後にparagraphを挿入します
	 * @param {Paragraph} paragraph 挿入するインスタンス
	 * @return {Paragraph} 自身のインスタンス
	 */
	after(paragraph) {
		// DOM
		if (this.hasNextSibling()) {
			this.container().elem().insertBefore(paragraph.elem(),this.next().elem());
		} else {
			this.container().elem().appendChild(paragraph.elem());
		}

		// ポインタ調整
		// this - paragraph - oldNext

		// paragraph
		const oldNext = this.next();
		this.next(paragraph);
		paragraph.prev(this);
		paragraph.next(oldNext);
		oldNext && oldNext.prev(paragraph);
		// row
		this.lastChild().next(paragraph.firstChild());
		paragraph.firstChild().prev(this.lastChild());
		oldNext && paragraph.lastChild().next(oldNext.firstChild());
		oldNext && oldNext.firstChild().prev(paragraph.lastChild());
		// char
		this.lastChild().lastChild().next(paragraph.firstChild().firstChild());
		paragraph.firstChild().firstChild().prev(this.lastChild().lastChild());
		oldNext && paragraph.lastChild().lastChild().next(oldNext.firstChild().firstChild());
		oldNext && oldNext.firstChild().firstChild().prev(paragraph.lastChild().lastChild());
		// parent
		paragraph.container(this.container());
		const pos = this.index() + 1;
		this.container().insertParagraph(pos,paragraph);
		return this;
	}
	/**
	 * 自身を削除します。文書整形は行われません
	 * @return {Paragraph} 自身のインスタンス
	 */
	remove() {
		this.container().elem().removeChild(this.elem());
		// oldPrev - this - oldNext →　oldPrev - oldNext

		// paragraph
		// oldPrevParagraph - oldNextParagraph
		const oldPrevParagraph = this.prev();
		const oldNextParagraph = this.next();
		oldPrevParagraph && oldPrevParagraph.next(oldNextParagraph);
		oldNextParagraph && oldNextParagraph.prev(oldPrevParagraph);

		// row
		// oldPrevParagraph.lastChild() - oldNextParagraph.firstChild();
		// oldPrevRow - oldNextRow
		const oldPrevRow = oldPrevParagraph && oldPrevParagraph.lastChild();
		const oldNextRow = oldNextParagraph && oldNextParagraph.firstChild();
		oldPrevRow && oldPrevRow.next(oldNextRow);
		oldNextRow && oldNextRow.prev(oldPrevRow);

		// char
		// oldPrevRow.lastChild() - oldNextRow.lastChild();
		// oldPrevChar - oldNextChar
		const oldPrevChar = oldPrevRow && oldPrevRow.lastChild();
		const oldNextChar = oldNextRow && oldNextRow.firstChild();
		oldPrevChar && oldPrevChar.next(oldNextChar);
		oldNextChar && oldNextChar.prev(oldPrevChar);

		this.container().deleteParagraph(this);
		this.prev(null).firstChild() && this.firstChild().prev(null).firstChild() && this.firstChild().firstChild().prev(null);
		this.next(null).lastChild() && this.lastChild().next(null).lastChild() && this.lastChild().lastChild().next(null);
		return this;
	}
	/**
	 * 自身を削除し、文書を整形します(内部にカーソルがあれば直前の行に平行移動します。直前の行がなければ直後の行に移動します)
	 * @return {Paragraph} 自身のインスタンス
	 */
	delete() {
		const oldPrevRow = this.prev() && this.prev().lastChild();
		const oldNextRow = this.next() && this.next().firstChild();

		this.remove();

		if (this.hasCursor()) {
			if (oldPrevRow) {
				this.cursor().moveRow(oldPrevRow);
			} else { // 直前の行がなければ直後
				this.cursor().moveRow(oldNextRow);
			}
		}
		return this;
	}
	/**
	 * 渡された文字以降を新しい段落に移動して、段落を２つに分けます
	 * @param {Char} char 段落分割の基準文字のインスタンス
	 * @return {Paragraph} 自身のインスタンス
	 */
	divide(char) {
		// 新しい段落を作成し、基準文字以降を新しい段落に移動する。基準文字の属していた行以降の同段落の行を新しい段落に移動する。新しい段落を基準文字のあった段落の直後に挿入する。cordinate()で文字の調整を行う
		// 段落先頭から:一行目の文字が丸々新しい行に移って次の段落の一行目となる。二行目以降は行ごと次の段落へ →　基準文字のあった行は空行となりもともとの段落の唯一の行となるため、あたかも空段落が基準行の前に挿入されたようになる
		// 行頭から:基準行の文字がまるまる新しい行に移って次の段落の一行目になる。基準行以降の行は行ごと新しい段落に移る。　→　基準行以降が新しい段落に移り、それ以前の行はもともとの段落に残るため、段落が２つに別れる。この時点では、もともとの段落の最後に空行が残っている状態なので、cordinate()で対応する
		// 行の途中から:基準文字以降の同じ行の文字が新しい行に移って次の段落の一行目になる。それ以降は行ごと次の段落に移る。　→　基準文字以降が新しい段落になる。この時点では一行目の文字数がおかしいので、cordinate()で調整する
		// 段落最後のEOLから: 基準文字のインデックスが同一行の他の文字より大きいため、afterEach()が一度も実行されない。次の行も存在しないのでnextRowが存在せず、nextRow.afterEach()は実行されない。ただし、新しい行はnewParagraphを作成した時点で存在している。 →　新しい段落が今いる段落の後ろに追加されるだけ
		if (!this.contains(char)) return this;
		const paragraph = char.row().paragraph();
		const newParagraph = Paragraph.createEmptyParagraph().align(paragraph.align()); // 作成時点で空行が含まれている 段落にテキストアラインが付与されていれば、新しい段落も同様にする
		const nextRow = char.row().hasNextSibling() ? char.row().next() : null; // この行以降を新しい段落に移動
		// 一行目
		// 基準文字以降を新しい行に移し、新しい段落に挿入する
		// 元々の行は空になってもそのまま
		const newRow = newParagraph.firstChild();
		char.afterEach(function (c) {
			c.remove();
			newRow.append(c);
		});

		// 二行目以降
		// 行ごと新しい段落に移動
		if (nextRow) {
			nextRow.afterEach(function (row) {
				row.remove();
				newParagraph.append(row);
			});
		}

		this.after(newParagraph);
		paragraph.cordinate().checkKinsoku();
		newParagraph.cordinate().checkKinsoku();
		return this;
	}

	// --文章整理

	/**
	 * 内部行が指定文字数と異なる文字数なら、指定文字数に合わせて文字数を調節します。
	 *     標準以外のフォントサイズの文字があれば文字数はそのサイズに合わせて調整されます。
	 *     また、自身が空段落ではなく内部に空行があれば削除します
	 * @return {Paragraph} 自身のインスタンス
	 */
	cordinate() {
		// エラー原因まとめ
		// ここで一旦rows()の内容が保存され、そこから一つ一つrowを取り出す(rows()はコピーされた配列が返される)
		// row.cordinate()内のbringChar()によって、最終行が削除されることがある
		// 削除された最終行でも、先に保存されていたためrow.cordinate()が実行される
		// 削除行の参照は保持されているのでcordinate()はエラーが起きずに実行される
		// ただしremove()された時にparentにnullが代入されているので、内部でparagraph().container()が実行されるときにNullPointer
		for (let row of this.rows()) {
			if (!row.paragraph()) continue; // cordinate()内で行が削除された場合の対策
			row.cordinate();
		}
		return this;
	}
	/**
	 * 段落内に禁則処理を施します
	 * @return {Paragraph} 自身のインスタンス
	 */
	checkKinsoku() {
		for (let row of this.rows()) {
			if (!row.paragraph()) continue;
			row.checkKinsoku();
		}
		return this;
	}

	/**
	 * 内部にあるすべての行の表示非表示を切り替えます
	 * @param {boolean} bDisplay 表示するならtrue、そうでなければfalseを指定する
	 * @return {Paragraph} 自身のインスタンス
	 */
	display(bDisplay) {
		for (let row of this.rows()) {
			row.display(bDisplay);
		}
		return this;
	}

	/**
	 * 空段落のインスタンスを新たに作成します
	 * @return {Paragraph} 空段落のインスタンス
	 */
	static createEmptyParagraph() {
		const arg = [];
		arg[0] = [];
		arg[1] = [];
		return new Paragraph(arg);
	}
}

// classは巻き上げが起こらないため、Char・Rowの下に作る必要がある。ただし、SentenceContainer内で利用するのでSentenceContainerよりは上になければならない
/**
 * 漢字変換ビューを表すクラス。
 *     それぞれ一つの文節を担当し、複数の漢字変換候補を持ちます。
 *     また、内部には変換候補としてRowクラスのインスタンスを持ちます
 */
class ConvertView extends AbstractHierarchy {
	// 文節番号は、ConvertViewのindex()と同じ
	/**
	 * @param {object} data 変換候補を表すオブジェクト<br>
	 * 例
	 * <pre>
	 * <code>
	 * [[ひらがな],[平仮名,ヒラガナ,平賀な,平がな,HIRAGANA]]
	 *	</code>
	 *	</pre>
	 */
	constructor(data) {
		super(Util.createConvertViewElement());
		data[1].push(data[0]); // 末尾に明確にひらがなを入れる
		for (let str of data[1]) {
			const row = Row.createEmptyRow();
			row.createPlainContent(str);
			this.append(row);
		}
		this.removeClass('paragraph');
		this.addClass('convert-view');
	}

	// --参照取得

	/**
	 * 自分の属する漢字変換コンテナのインスタンスを新たに設定する、あるいは引数省略で現在属しているの漢字変換コンテナを取得します
	 * @param {ConvertContainer} [opt_newContainer] 新たに設定する漢字変換コンテナのインスタンス
	 * @return {ConvertView ConvertContainer} 自身のインスタンス(引数を渡した場合)、あるいは所属する漢字変換コンテナ(引数を省略した場合)
	 */
	container(opt_newContainer) {
		return this.parent(opt_newContainer);
	}
	/**
	 * 指定されたインデックスの変換候補を表すインスタンス、あるいは引数省略で変換候補インスタンスの配列を取得します
	 * @param {number} [opt_index] 取得する変換候補のインデックス
	 * @return {Row Row[]} 指定されたインデックスの変換候補インスタンス(引数を渡した場合)、あるいは変換候補インスタンスの配列(引数を省略した場合) 
	 */
	rows(opt_index) {
		return this.children(opt_index);
	}
	/**
	 * 現在選択中の行を取得します
	 * @return {Row} 現在選択中の行のインスタンス。選択行がなければ候補最後のひらがな行のインスタンス
	 */
	getSelect() {
		for (let row of this.rows()) {
			if (row.hasClass('select')) return row;
		}
		return this.lastChild(); // 選択行がなければひらがな行
	}

	// --判定

	/**
	 * この候補一覧が可視化されているかどうかを返します
	 * @return {boolean} 可視化されていればtrue、そうでなければfalse
	 */
	isActive() {
		return this.hasClass('active');
	}

	// --Status

	/**
	 * この候補一覧が担当する文節のひらがなを文字列で返します
	 * @return {string} 担当文節のひらがな
	 */
	hiragana() {
		return this.lastChild().text(); // 最終行は必ずひらがな
	}

	/**
	 * ひらがなでの文字数を返します
	 * @return {number} ひらがなでの文字数
	 */
	kanaLength() {
		return this.hiragana().length;
	}
	/**
	 * 担当する文節のインデックスを返します
	 * @return {number} 担当文節のインデックス(０始まり)
	 */
	phraseNum() {
		return this.index();
	}

	// --Style

	/**
	 * この漢字変換候補一覧を可視化します
	 * @return {ConvertView} 自身のインスタンス
	 */
	active() {
		for (let view of this.container().views()) {
			if (view.hasClass('active')) { view.removeClass('active'); }
		}
		this.addClass('active');
		return this;
	}
	/**
	 * 変換候補の選択をひとつ左に移動します
	 * @return {ConvertView} 自身のインスタンス
	 */
	selectLeft() {
		const index = this.getSelect().index() + 1;
		this.select(index);
		return this;
	}
	/**
	 * 変換候補の選択をひとつ右に移動します
	 * @return {ConvertView} 自身のインスタンス
	 */
	selectRight() {
		const index = this.getSelect().index() - 1;
		this.select(index);
		return this;
	}

	// --DOM操作

	/**
	 * 指定されたインデックスの変換候補を選択します
	 * @param {number} index 選択する候補のインデックス
	 * @return {ConvertView} 自身のインスタンス
	 */
	select(index) {
		if (index < 0) index = 0;
		if (index >= this.childLength()) index = this.childLength() - 1;

		for (let row of this.rows()) {
			if (row.hasClass('select')) row.removeClass('select');
		}
		const newRow = this.rows(index);
		newRow.addClass('select');
		this.container().inputBuffer().insertPhrase(this.phraseNum(),newRow.text());
		return this;
	}
	/**
	 * 自身の最後に変換候補を追加します
	 * @param {Row} row 追加する変換候補
	 * @return {ConvertView} 自身のインスタンス
	 */
	append(row) {
		// DOM
		this.elem().appendChild(row.elem());
		// ポインタ調整
		// view
		if (this.hasChild()) {
			this.lastChild().next(row);
			row.prev(this.lastChild());
		}
		// parent
		row.parent(this);
		this.pushChild(row);
		return this;
	}
	/**
	 * 自身の直前に変換候補一覧を挿入します
	 * @param {ConvertView} view 挿入する変換候補一覧
	 * @return {ConvertView} 自身のインスタンス
	 */
	before(view) {
		// DOM
		this.container().elem().insertBefore(view.elem(),this.elem());

		// ポインタ調整
		// oldPrev - view - this

		// view
		const oldPrev = this.prev();
		oldPrev && oldPrev.next(view);
		view.prev(oldPrev);
		view.next(this);
		this.prev(view);
		// paretn
		view.container(this.container());
		const pos = this.index();
		this.container().insertChild(pos,view);
		return this;
	}
	/**
	 * 自身の直後に変換候補一覧を挿入します
	 * @param {ConvertView} view 挿入する変換候補一覧
	 * @return {ConvertView} 自身のインスタンス
	 */
	after(view) {
		// DOM
		if (this.hasNextSibling()) {
			this.container().elem().insertBefore(view.elem(),this.next().elem());
		} else {
			this.container().elem().appendChild(view.elem());
		}

		// ポインタ調整
		// this - view - oldNext

		// view
		const oldNext = this.next();
		this.next(view);
		view.prev(this);
		view.next(oldNext);
		oldNext && oldNext.prev(view);
		// parent
		view.container(this.container());
		const pos = this.index() + 1;
		this.container().insertChild(pos,view);
		return this;
	}
	/**
	 * 自身を削除します
	 * @return {ConvertView} 自身のインスタンス
	 */
	remove() {
		// DOM
		this.container().elem().removeChild(this.elem());

		// ポインタ調整
		// oldPrev - this - oldNext →　oldPrev - oldNext

		// view
		const oldPrev = this.prev();
		const oldNext = this.next();
		oldPrev && oldPrev.next(oldNext);
		oldNext && oldNext.prev(oldPrev);
		this.prev(null);
		this.next(null);
		// parent
		this.container().deleteChild(this);
		this.container(null);
		return this;
	}
	/**
	 * 自身をviewと入れ替えます
	 * @param {ConvertView} view 入れ替える変換候補一覧
	 * @return {ConvertView} 自身のインスタンス
	 */
	replace(view) {
		this.before(view);
		if (this.isActive()) view.active();
		return this.remove();
	}
	/**
	 * 自身が担当する文節をカタカナに変換します
	 * @return {ConvertView} 自身のインスタンス
	 */
	toKatakana() {
		this.container().inputBuffer().insertPhrase(this.phraseNum(),this.getKatakana());
		return this;
	}
	/**
	 * @private
	 * 自身が担当する文節のカタカナを文字列で取得します
	 * @return {string} カタカナに変換した場合の文字列
	 */
	getKatakana() {
		const str = this.hiragana();
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
}
/**
 * 変換候補一覧を束ねる漢字変換コンテナを表すクラス
 */
class ConvertContainer extends AbstractHierarchy {
	/**
	 * @param {InputBuffer} inputBuffer 入力元のインスタンス
	 */
	constructor(inputBuffer) {
		super(document.getElementById('convert_container'));
		this._inputBuffer = inputBuffer;
	}

	// --参照取得

	/**
	 * 入力元のインスタンスを取得します
	 * @return {InputBuffer} 入力元のインスタンス
	 */
	inputBuffer() {
		return this._inputBuffer;
	}
	/**
	 * 指定された変換候補一覧、あるいは引数省略で変換候補一覧の配列を取得します
	 * @param {number} [opt_index] 取得する候補一覧のインデックス
	 * @return {ConvertView ConvertView[]} 指定された候補一覧(引数を渡した場合)、あるいは候補一覧の配列(引数を省略した場合)
	 */
	views(opt_index) {
		return super.children(opt_index);
	}
	/**
	 * 現在アクティブになっている変換候補一覧のインスタンスを取得します
	 * @return {ConvertView} 現在アクティブな変換候補一覧のインスタンス。なければnull
	 */
	activeView() {
		for (let view of this.views()) {
			if (view.isActive()) return view;
		}
		return null;
	}

	// --判定

	/**
	 * 漢字変換が行われているところかどうかを返します
	 * @return {boolean} 候補一覧がひとつでも内部にあればtrue、そうでなければfalse
	 */
	isActive() {
		return this.childLength() > 0;
	}

	// --Style

	/**
	 * 表示位置をカーソル横に移動します
	 * @return {ConvertContainer} 自身のインスタンス
	 */
	reposition() {
		const x = this.cursorX();
		const y = this.cursorY();
		this.elem().style.top = y + 'px';
		this.elem().style.left = (x - this.width()) + 'px';
		return this;
	}
	/**
	 * カーソル位置のX座標を返します
	 * @return {number} カーソル位置のX座標
	 */
	cursorX() {
		return this.inputBuffer().cursorX();
	}
	/**
	 * カーソル位置のY座標を返します
	 * @return {number} カーソル位置のY座標
	 */
	cursorY() {
		return this.inputBuffer().cursorY();
	}
	/**
	 * 自身を表示します
	 * @return {ConvertContainer} 自身のインスタンス
	 */
	show() {
		this.elem().style.display = 'block';
		return this;
	}
	/**
	 * 自身を非表示にします
	 * @return {ConvertContainer} 自身のインスタンス
	 */
	hide() {
		this.elem().style.display = 'none';
		this.removeKeydownEventListener();
		return this;
	}

	// --DOM操作

	/**
	 * カーソル位置から文字を挿入して、内部の変換候補一覧を破棄します
	 * @return {ConvertContainer} 自身のインスタンス
	 */
	print() {
		this.inputBuffer().print();
		return this;
	}
	/**
	 * 内部に変換候補一覧のインスタンス群を構築します
	 * @param {object} data 文節分け及び変換候補を示すオブジェクト<br>
	 * <pre>
	 * <code>
	 *  // data形式例
	 * [[ひらがな,[漢字１,漢字２,漢字３]],[ひらがな２,[漢字４,漢字５]],[[ひらがな３,[漢字６,漢字７]]]]
	 * </code>
	 * </pre>
	 * @return {ConvertContainer} 自身のインスタンス
	 */
	createViews(data) {
		this.empty();
		for (let phraseData of data) {
			this.append(new ConvertView(phraseData));
		}
		return this;
	}
	/**
	 * 漢字変換を始めます(非同期通信)
	 * @param {string} str 変換する文字列
	 * @return {ConvertContainer} 自身のインスタンス
	 * @see ../WEB-INF/classes/doc/KanjiProxy.html
	 */
	convert(str) {
		Util.post("/tategaki/KanjiProxy",{
			sentence: str
		},function (json) {
			this.createViews(json);
			this.inputBuffer().setPhraseNum();
			// すべて変換第一候補を選択する
			for (let view of this.views()) {
				view.select(0);
			}
			// 最初の文節を選択
			this.inputBuffer().select(0);

			this.reposition();
			this.addKeydownEventListener();
		}.bind(this));
		this.show();

		return this;
	}
	/**
	 * 文節区切りをひとつ前にずらして変換し直します(非同期通信)
	 * @return {ConvertContainer} 自身のインスタンス
	 * @see ../WEB-INF/classes/doc/KanjiProxy.html
	 */
	shiftUp() {
		const activeView = this.activeView();

		if (activeView.kanaLength() === 1) { return this; }

		// 最終文節から
		// 最後の一字を分離して、二文節を変換し直す
		if (activeView.isLast()) {
			const activeKana = activeView.hiragana();
			const sendString = activeKana.slice(0,-1) + ',' + activeKana.slice(-1);
			Util.post("/tategaki/KanjiProxy",{
				sentence: sendString
			},function (json) {
				this.replace(activeView.phraseNum(),json);
			}.bind(this));
			return this;
		}

		// 最終文節からではない
		// 選択文字列から最後の一文字を取り除き、その次の文節の頭につなげてそれぞれを変換し直す
		if (!activeView.isLast()) {
			const activeKana = activeView.hiragana();
			const nextView = activeView.next();
			const nextKana = nextView.hiragana();
			const sendString = activeKana.slice(0,-1) + ',' + activeKana.slice(-1) + nextKana;
			Util.post("/tategaki/KanjiProxy",{
				sentence: sendString
			},function (json) {
				const newFirst = new ConvertView(json[0]);
				activeView.replace(newFirst);
				newFirst.select(0);
				const newSecond = new ConvertView(json[1]);
				nextView.replace(newSecond);
				newSecond.select(0);
			});
			return this;
		}
	}
	/**
	 * 文節区切りをひとつ下にずらして変換し直します(非同期通信)
	 * @return {ConvertContainer} 自身のインスタンス
	 * @see ../WEB-INF/classes/doc/KanjiProxy.html
	 */
	shiftDown() {
		const activeView = this.activeView();
		const nextView = activeView.next();

		if (activeView.isLast()) return;

		// 次の文節の文字数が１文字だけなら融合して、１文節として変換する
		if (nextView.kanaLength() === 1) {
			const nextPhrase = this.inputBuffer().phrases(nextView.phraseNum())[0];
			const sendString = activeView.hiragana() + nextView.hiragana() + ','; // 文節を区切られないよう、,を末尾に追加する
			Util.post("/tategaki/KanjiProxy",{
				sentence: sendString
			},function (json) {
				const newView = new ConvertView(json[0]);
				activeView.replace(newView);
				nextView.remove();
				nextPhrase.remove();
				newView.select(0);
				this.inputBuffer().setPhraseNum();
			}.bind(this));
			return this;
		}

		// 次の文節が二文字以上
		// 次の文節の１文字目を選択文節に移動して、それぞれを変換し直す
		const activeKana = activeView.hiragana();
		const nextKana = nextView.hiragana();
		const sendString = activeKana + nextKana.slice(0,1) + ',' + nextKana.slice(1);
		Util.post("/tategaki/KanjiProxy",{
			sentence: sendString
		},function (json) {
			const newFirst = new ConvertView(json[0]);
			activeView.replace(newFirst);
			newFirst.select(0);
			const newSecond = new ConvertView(json[1]);
			nextView.replace(newSecond);
			newSecond.select(0);
		});
		return this;
	}
	/**
	 * 入力中の文字が二文字以上あれば最後の１音のみ削除して選択文節を変換し直します(非同期通信)。
	 *     入力中の文字がひらがなにして１文字しかなければ全て破棄して入力を終了します
	 * @return {ConvertContainer} 自身のインスタンス
	 * @see ../WEB-INF/classes/doc/KanjiProxy.html
	 */
	backSpace() {
		const activeView = this.activeView();
		// buffer文字がひらがなにして一文字しかない
		// 文字を削除してinput終了
		if (activeView.isOnlyChild() && activeView.kanaLength() === 1) {
			this.empty();
			this.inputBuffer().decreace();
			return this;
		}

		// 文節がひらがなにして一文字しかない
		// その文節を削除してひとつ前の文節を選択する
		if (activeView.kanaLength() === 1) {
			const phraseNum = activeView.phraseNum();
			const phraseChar = this.inputBuffer().phrases(phraseNum)[0];
			phraseChar.remove();
			activeView.remove();
			this.inputBuffer().setPhraseNum()
				.select(phraseNum > 0 ? phraseNum - 1 : phraseNum); // 一つ前の文節がなければ、一つ次の文節
			return this;
		}

		// 文節にひらがなにして二文字以上ある
		// 最後の一字を削除して、その文節を変換し直す
		const phraseNum = activeView.phraseNum();
		const newString = activeView.hiragana().slice(0,-1) + ','; // 文節を区切られないよう、,を末尾に追加する
		Util.post("/tategaki/KanjiProxy",{
			sentence: newString
		},function (json) {
			this.replace(phraseNum,json);
		}.bind(this));
		return this;
	}
	/**
	 * インデックスがnumの文節の変換候補一覧を、新たなdataで入れ替えます
	 * @param {number} num 入れ替える文節のインデックス
	 * @param {object} data 変換候補を表すオブジェクト<br>
	 * 例
	 * <pre>
	 * <code>
	 * [[ひらがな],[平仮名,ヒラガナ,平賀な,平がな,HIRAGANA]]
	 *	</code>
	 *	</pre>
	 * @return {ConvertContainer} 自身のインスタンス
	 */
	replace(num,data) {
		const oldView = this.views(num);
		const newViews = []; // 文節番号を振り直した後でないとview.select()できない(中でinsertPhrase()をしているため)ので、いったん新しいインスタンスを入れておく
		// viewを入れ替え、bufferにはいったんひらがなを挿入する
		for (let phraseData of data.entries()) {
			// view
			const newView = new ConvertView(phraseData[1]);
			newViews.push(newView);
			oldView.before(newView);
			// input_buffer
			// setPhraseNum()は、select()する前のviewではひらがなの長さを使って文節番号を割り振る。そのため、いったんひらがなをbufferに追加する
			if (phraseData[0] === 0) // ひとつめだけ入替えで、他はその後に追加していく
				this.inputBuffer().insertPhrase(num,oldView.prev().hiragana()); // 古いbuffer文字はここでなくなる
			else
				this.inputBuffer().insertPhraseAfter(num,oldView.prev().hiragana()); // HACK:追加分の文字の順番がこの時点ではおかしくなるが、合計のひらがなの数は正しくなっているので、buffer.setPhraseNum()とnewView.select(0)で正しく文字が置き換わる
		}
		oldView.remove();

		// 文節番号の振り直し
		this.inputBuffer().setPhraseNum();
		// 最初の候補で置き換える
		for (let newView of newViews) {
			newView.select(0);
		}
		if (oldView.isActive()) newViews[0].active();
		return this;
	}
	/**
	 * 自身の最後に変換候補一覧を追加します
	 * @param {ConvertContainer} view 追加する変換候補一覧のインスタンス
	 * @return {ConvertContainer} 自身のインスタンス
	 */
	append(view) {
		this.elem().appendChild(view.elem());
		if (this.hasChild()) {
			this.lastChild().next(view);
			view.prev(this.lastChild());
		}
		view.container(this);
		this.pushChild(view);
		return this;
	}

	// --イベント

	/**
	 * 漢字変換中のkeydownイベントリスナーを付加します。重ねがけは無効となります
	 * @return {ConvertContainer} 自身のインスタンス
	 */
	addKeydownEventListener() {
		this.inputBuffer().removeKeydownEventListener()
			.container().removeKeydownEventListener();
		super.addKeydownEventListener();
		return this;
	}
	/**
	 * keydownイベントの実行内容です
	 * @param {Event} e イベントオブジェクト
	 * @param {number} keycode 押下されたキーのキーコード
	 */
	runKeydown(e,keycode) {
		switch (keycode) {
			case 8:
				this.backSpace();
				break;
			case 13:
				// Enter
				this.print();
				break;
			case 32:
			case 37:
				// space
				// Left
				this.activeView().selectLeft();
				break;
			case 38:
				// Up
				if (e.shiftKey) {
					this.shiftUp();
				} else {
					this.inputBuffer().selectPrev();
				}
				break;
			case 39:
				// Right
				this.activeView().selectRight();
				break;
			case 40:
				// Down
				if (e.shiftKey) {
					this.shiftDown();
				} else {
					this.inputBuffer().selectNext();
				}
				break;
			case 118:
				// F7
				this.activeView().toKatakana();
				break;
			default:
				break;
		}
	}
}
/**
 * 入力文字を表すクラス
 */
class InputChar extends Char {
	/**
	 * @param {object} data 文字を表すオブジェクト<br>
	 * 例
	 * <pre>
	 * <code>
	 *	{
	 *		"char":"あ",
	 *		"decolation":["decolation-color-blue"]
	 *		"fontSize": "auto"
	 *	}
	 *	</code>
	 *	</pre>
	 *	@param {number} [opt_phraseNum=-1] 文節のインデックス
	 */
	constructor(data,opt_phraseNum) {
		super(data);
		if (opt_phraseNum === undefined) opt_phraseNum = -1;
		this.phraseNum(opt_phraseNum);
	}

	// --判定

	/**
	 * 自身の文節番号がnumであるかどうかを返します
	 * @param {number} num 判定するインデックス
	 * @return {boolean} 自身の文節番号がnumであればtrue、そうでなければfalse
	 */
	isPhraseNum(num) {
		return num === this.phraseNum();
	}
	/**
	 * 自身が選択されているかどうかを表します
	 * @return {boolean} 自身が選択されていればtrue、そうでなければfalse。漢字変換が一度もされていなければfalse
	 */
	isSelect() {
		return this.hasClass('select-phrase');
	}

	// --Status

	/**
	 * この文字の文節番号をopt_newNumに設定する、あるいは引数省略で現在の文節番号を取得します
	 * @param {number} [opt_newNum] 新たに設定する文節番号(０始まり)
	 * @return {InputChar number} 自身のインスタンス(引数を渡した場合)、あるいは現在の文節のインデックス(引数を省略した場合)
	 */
	phraseNum(opt_newNum) {
		if (opt_newNum === undefined) {
			return this._phraseNum;
		} else {
			this.elem().dataset.phraseNum = opt_newNum;
			this._phraseNum = opt_newNum;
			return this;
		}
	}

	// --Style

	/**
	 * この文字を選択状態にします
	 * @return {InputChar} 自身のインスタンス
	 */
	select() {
		this.addClass('select-phrase');
		return this;
	}
	/**
	 * この文字を非選択状態にします
	 * @return {InputChar} 自身のインスタンス
	 */
	removeSelect() {
		this.removeClass('select-phrase');
		return this;
	}

}

/**
 * 入力された文字をいったん保持するバッファーを表すクラス。
 *     内部の子にInputCharのインスタンス群を持ちます。
 *     また、一度も漢字変換がされず文節番号がすべて-1の場合と、漢字変換が行われ文節が分けられている場合と２つの状態がある
 */
class InputBuffer extends Row {
	/**
	 * @param {SentenceContainer} container 自身の属する文章コンテナのインスタンス
	 */
	constructor(container) {
		super(document.getElementById('input_buffer'));
		this._container = container;
		this._convertContainer = new ConvertContainer(this);
	}

	// --参照取得

	/**
	 * 自身の属する文章コンテナのインスタンスを取得します
	 * @return {SentenceContainer} 自身の属する文章コンテナ
	 */
	container() {
		return this._container;
	}
	/**
	 * カーソルのインスタンスを取得します
	 * @return {Cursor} カーソルのインスタンス
	 */
	cursor() {
		return this.container().cursor();
	}
	/**
	 * カーソルのある文字のインスタンスを取得します
	 * @return {Char} カーソル文字のインスタンス
	 */
	cursorChar() {
		return this.cursor().getChar();
	}
	/**
	 * 漢字変換コンテナのインスタンスを取得します
	 * @return {ConvertContainer} 漢字変換コンテナのインスタンス
	 */
	convertContainer() {
		return this._convertContainer;
	}
	/**
	 * 指定された文節番号の入力文字インスタンスを配列にして返します
	 * @param {number} num 集める入力文字の文節番号
	 * @return {InputChar[]} 指定された文節番号の入力文字インスタンスの配列
	 */
	phrases(num) {
		const ret = [];
		for (let char of this.chars()) {
			if (char.isPhraseNum(num)) ret.push(char);
		}
		return ret;
	}
	/**
	 * 選択中の文節の入力文字インスタンスを返します
	 * @return {InputChar[]} 選択中の入力文字インスタンスの配列。選択されていなければ空の配列
	 */
	selectPhrases() {
		const ret = [];
		for (let char of this.chars()) {
			if (char.isSelect()) ret.push(char);
		}
		return ret;
	}

	// --判定

	/**
	 * 自身が可視化されている(文字入力中)かどうかを返します
	 * @return {boolean} 自身が可視化されていればtrue、そうでなければfalse
	 */
	isDisplay() {
		return this.elem().style.display === 'block';
	}

	// --Status

	/**
	 * 変換候補一覧群を作成した後に、各入力文字に文節番号をふります
	 * @return {InputBuffer} 自身のインスタンス
	 */
	setPhraseNum() {
		let cnt = 0;
		for (let view of this.convertContainer().views()) {
			const num = view.phraseNum();
			const len = view.getSelect().length(); // 選択行がなければひらがなを使って計算
			for (let i = 0; i < len; i++,cnt++) {
				this.chars(cnt).phraseNum(num);
			}
		}
		return this;
	}
	/**
	 * 選択されている文節のインデックスを返します
	 * @return {number} 選択文節のインデックス。選択されていなければ-1
	 */
	selectIndex() {
		for (let char of this.chars()) {
			if (char.isSelect()) return char.phraseNum();
		}
		return -1;
	}

	// --Style

	/**
	 * 自身の幅を取得します。文章内のRowと異なり回転されていないため、css上の幅と一致します
	 * @return {number} 自身の幅
	 */
	width() {
		return super.super.width();
	}
	/**
	 * 自身の高さを取得します。文章内のRowと異なり回転されていないため、css上の高さと一致します
	 * @return {number} 自身の高さ
	 */
	height() {
		return super.super.height();
	}
	/**
	 * 自身の高さや幅を内部の各入力文字に合わせて調整します
	 * @return {InputBuffer} 自身のインスタンス
	 */
	resize() {
		const style = this.elem().style;
		style.width = this.newWidth() + 'px';
		style.height = this.newHeight() + 'px';
		return this;
	}
	/**
	 * 自身の表示位置をカーソルに合わせます
	 * @return {InputBuffer} 自身のインスタンス
	 */
	move() {
		this.elem().style.left = this.cursorX() + 'px';
		this.elem().style.top = this.cursorY() + 'px';
		return this;
	}
	/**
	 * 自身を表示します
	 * @return {InputBuffer} 自身のインスタンス
	 */
	show() {
		this.elem().style.display = 'block';
		return this;
	}
	/**
	 * 自身を非表示にします
	 * @return {InputBuffer} 自身のインスタンス
	 */
	hide() {
		this.elem().style.display = 'none';
		this.removeKeydownEventListener();
		return this;
	}
	/**
	 * 選択文節を次の文節に変更します。最後の文節から実行されれば、最初の文節が選択されます
	 * @return {InputBuffer} 自身のインスタンス
	 */
	selectNext() {
		return this.select(this.selectIndex() + 1);
	}
	/**
	 * 選択文節を前の文節に変更します。最初の文節から実行されれば、最後の文節が選択されます
	 * @return {InputBuffer} 自身のインスタンス
	 */
	selectPrev() {
		return this.select(this.selectIndex() - 1);
	}
	/**
	 * 文節番号がindexの文字を選択します。引数が負になれば最後の文節を、最大の文節番号を越えれば最初の文節を選択します
	 * @param {number} index 選択する文節のインデックス。負の数なら最後の文節、範囲より大きな数なら最初の文節が選択される
	 * @return {InputBuffer} 自身のインスタンス
	 */
	select(index) {
		const maxIndex = this.lastChar().phraseNum();
		if (index < 0) index = maxIndex;
		if (index > maxIndex) index = 0;

		for (let char of this.chars()) {
			if (char.phraseNum() === index)
				char.select();
			else
				char.removeSelect();
		}
		this.convertContainer().views(index).active();
		return this;
	}

	// --DOM操作

	/**
	 * 自身を空にして、文字入力を終了します
	 * @return {InputBuffer} 自身のインスタンス
	 */
	empty() {
		super.empty();
		if (this.convertContainer().isActive()) {
			this.convertContainer().empty().hide();
		}
		return this;
	}
	/**
	 * keycodeを追加した場合の新たな文字列で入力文字を置き換えます
	 * @param {number} keycode 追加するキーのキーコード
	 * @param {boolean} bShift シフトキーが押されていればtrue、そうでなければfalse
	 * @return {InputBuffer} 自身のインスタンス
	 */
	increace(keycode,bShift) {
		const newInputStr = this.newString(keycode,bShift);

		if (newInputStr === undefined || newInputStr.indexOf('undefined') !== -1) {
			// 未定義文字(alt,ctrl,tabなど)はreturn
			return this;
		}
		this.update(newInputStr);
		this.resize();
		return this;
	}
	/**
	 * bufferの最後の文字を削除します。内部に文字がなくなれば入力を終了します
	 * @return {InputChar} 削除した入力文字のインスタンス
	 */
	decreace() {
		if (!this.hasChar) return this;
		const ret = this.lastChar().remove();
		this.resize();
		if (!this.hasChar()) {
			this.hide();
			this.container().addKeydownEventListener();
		}
		return ret;
	}
	/**
	 * 内部の入力文字をstrで置き換えます
	 * @param {string} str 置き換える文字列
	 * @return {InputBuffer} 自身のインスタンス
	 */
	update(str) {
		this.empty();
		for (let char of str) {
			this.append(new InputChar(this.cursorChar().createData(char)));
		}
		this.show();
		return this;
	}
	/**
	 * カーソル位置に文字を挿入し、後処理を行って入力状態を終了します
	 * @return {InputBuffer} 自身のインスタンス
	 */
	print() {
		this.cursor().insert(this.text());
		this.empty().hide();
		this.container().addKeydownEventListener();
		this.container().changeDisplay();
		return this;
	}
	/**
	 * 入力文字をすべてカタカナに置き換えます
	 * @return {InputBuffer} 自身のインスタンス
	 */
	toKatakanaAll() {
		this.update(this.getKatakana());
		return this;
	}
	/**
	 * 入力文字すべてを漢字変換します(非同期通信)
	 * @return {InputBuffer} 自身のインスタンス
	 * @see ../WEB-INF/classes/doc/KanjiProxy.html
	 */
	convert() {
		this.convertContainer().convert(this.text());
		return this;
	}
	/**
	 * インデックスがnumである文節の入力文字をstrで入れ替えます
	 * @param {number} num 入れ替える文節のインデックス
	 * @param {string} str 入れ替える文字列
	 * @return {InputBuffer} 自身のインスタンス
	 */
	insertPhrase(num,str) {
		const phrases = this.phrases(num);
		if (phrases.length === 0) return this; // 指定された文節番号の文字が見つからなかった
		// 新しいInputCharをもともとあった文字の前に挿入していく
		for (let c of str) {
			const newChar = new InputChar(this.cursorChar().createData(c),num);
			phrases[0].before(newChar);
			if (phrases[0].isSelect()) newChar.select(); // 選択中の文節なら入替え文字も選択
		}
		// 古い文字を削除
		for (let old of phrases) {
			old.remove();
		}
		this.resize();
		return this;
	}
	/**
	 * インデックスがnumである文節の後ろにstrを追加します。追加した文字の文節番号は負の値になります
	 * @param {number} num 挿入位置の指定
	 * @param {string} str 挿入する文字列
	 * @return {InputBuffer} 自身のインスタンス
	 */
	insertPhraseAfter(num,str) {
		const phrases = this.phrases(num);
		if (phrases.length === 0) return this; // 指定された文節番号の文字が見つからなかった
		const nextChar = phrases[phrases.length -1].next(); // 挿入用の文字。最後にはEOLがあるので、必ず存在する
		for (let c of str) {
			nextChar.before(new InputChar(this.cursorChar().createData(c),-num));
		}
		this.resize();
		return this;
	}

	// --外からの情報取得

	/**
	 * @private
	 * 現在の文字列にkeycodeを加えて作られる文字列を取得します。
	 *     未定義のkeycodeの場合はundefinedが文字列内に含まれますので注意してください
	 * @param {number} keycode 追加するキーのキーコード
	 * @param {boolean} bShift シフトキーが押されていればtrue、そうでなければfalse
	 * @return {string} keycodeを追加して作られた文字列
	 */
	newString(keycode,bShift) {
		const inputStr = this.text(); //もともとの文字列
		if (bShift) {
			return inputStr + key_table.shift_key[keycode];
		} else {
			return key_table.getString(inputStr,keycode); //keycodeを加えた新しい文字列
		}
	}
	/**
	 * @private
	 * 現在の入力文字をカタカナに変換した場合の文字列を返します。
	 *     変換できない文字があれば変換せずに元の文字をそのまま連結します
	 * @return {string} カタカナに置き換えた文字列
	 */
	getKatakana() {
		const str = this.text();
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
	/**
	 * @private
	 * 内部の入力文字を元に、適切な幅を計算します
	 * @return {number} 計算された幅のピクセル数
	 */
	newWidth() {
		const cache = {};
		let width = 0;
		for (let char of this.chars()) {
			const size = char.fontSize();
			if (cache[size]) {
				width = Math.max(width,cache[size]);
			} else {
				cache[size] = char.width();
				width = Math.max(width,char.width());
			}
		}
		return width + 5; // 5px余裕をもたせる
	}
	/**
	 * @private
	 * 内部の入力文字を元に、適切な高さを計算します
	 * @return {number} 計算された高さのピクセル数
	 */
	newHeight() {
		const cache = {};
		let height = 0;
		for (let char of this.chars()) {
			const size = char.fontSize();
			if (cache[size]) {
				height += cache[size];
			} else {
				cache[size] = char.height();
				height += cache[size];
			}
		}
		return height + 5; // 5px余裕をもたせる
	}
	/**
	 * カーソル位置のX座標を返します
	 * @return {number} カーソル位置のX座標
	 */
	cursorX() {
		return this.cursorChar().x();
	}
	/**
	 * カーソル位置のY座標を返します
	 * @return {number} カーソル位置のY座標
	 */
	cursorY() {
		return this.cursorChar().y();
	}

	// --イベント

	/**
	 * keyeventがSentenceContainerから移動するかどうかを判定して前処理を行います(キーコードをincreace()して入力文字ができれば入力モードに移行します)
	 * @param {number} keycode 押下されたキーのキーコード
	 * @param {boolean} bShift シフトキーが押されていればtrue、そうでなければfalse
	 * @return {InputBuffer} 自身のインスタンス
	 */
	tryTransfer(keycode,bShift) {
		this.increace(keycode,bShift);
		if (this.hasChar()) {
			this.addKeydownEventListener();
			this.move();
		}
		return this;
	}
	/**
	 * 入力時のkeydownイベントリスナーを付加します
	 * @return {InputBuffer} 自身のインスタンス
	 */
	addKeydownEventListener() {
		this.container().removeKeydownEventListener();
		this.convertContainer().removeKeydownEventListener();
		super.addKeydownEventListener();
		return this;
	}
	/**
	 * 入力時のkeydownイベントの実行内容です
	 * @param {Event} e イベントオブジェクト
	 * @param {number} keycode 押下されたキーのキーコード
	 */
	runKeydown(e,keycode) {
		switch (keycode) {
			case 8:
				// backspace
				this.decreace();
				break;
			case 13:
				// enter
				this.print();
				break;
			case 32:
				// space
				this.convert();
				break;
			case 118:
				// F7
				this.toKatakanaAll();
				break;
			default:
				this.increace(keycode,e.shiftKey);
				break;
		}
	}
}

/**
 * ユーザーのファイル情報のひとつを扱うクラス
 */
class File extends AbstractHierarchy {
	/**
	 * @param {number} id ファイルのID
	 * @param {string} filename ファイル名
	 */
	constructor(id,filename) {
		super(Util.createFileElement(id,filename));
		this._link = this.elem().getElementsByTagName('a')[0];
		this._id = id;
		this._name = filename;
		this._nextFile = null;
		this._prevFile = null;
		this.addClickEventListener();
	}

	// --参照取得

	/**
	 * 自身の属するファイルリストの参照を探して取得します
	 * @return {FileList} 自身の属するファイルリストのインスタンス。見つからなければnull
	 */
	fileList() {
		for (let parentDir = this.parent(); parentDir ;parentDir = parentDir.parent() ) {
			if (parentDir.isRoot()) return parentDir;
		}
		return null;
	}

	/**
	 * 内部のaタグのDOM要素を取得します
	 * @return {Element} 自身の持つaタグのDOM要素
	 */
	link() {
		return this._link;
	}
	/**
	 * 自身の次に位置するファイルのインスタンスを新たに設定、または引数省略で取得します。
	 *     通常のnext()はディレクトリも含め同階層のみをつなぎますが、nextFile()はファイルのみを、それもディレクトリ横断的に、さらに階層もまたいでつなぎます
	 * @param {File} [opt_file] 新たに設定するファイルのインスタンス
	 * @return {File} 自身のインスタンス(引数を渡した場合)、あるいは自身の次のファイルのインスタンス(引数を省略した場合)
	 */
	nextFile(opt_file) {
		if (opt_file === undefined) {
			return this._nextFile;
		} else {
			this._nextFile = opt_file;
			return this;
		}
	}
	/**
	 * 自身の前に位置するファイルのインスタンスを新たに設定、または引数省略で取得します。
	 *     通常のやprev()はディレクトリも含め同階層のみをつなぎますが、prevFile()はファイルのみを、それもディレクトリ横断的に、さらに階層もまたいでつなぎます
	 * @param {File} [opt_file] 新たに設定するファイルのインスタンス
	 * @return {File} 自身のインスタンス(引数を渡した場合)、あるいは自身の前のファイルのインスタンス(引数を省略した場合)
	 */
	prevFile(opt_file) {
		if (opt_file === undefined) {
			return this._prevFile;
		} else {
			this._prevFile = opt_file;
			return this;
		}
	}

	// --判定

	/**
	 * 自身がFileListのインスタンスであるかどうかを返します
	 * @return {boolean} 常にfalse
	 */
	isRoot() {
		return false;
	}
	/**
	 * 自身がディレクトリのインスタンスであるかどうかを返します
	 * @return {boolean} 常にfalse
	 */
	isDirectory() {
		return false;
	}
	/**
	 * 自身がファイルのインスタンスであるかどうかを返します
	 * @return {boolean} 常にtrue
	 */
	isFile() {
		return true;
	}
	/**
	 * 自身が最初のファイルであるかどうかを返します(ディレクトリ単位ではなく、ファイルリスト全体の中で最初のファイルであるかどうか)
	 * @return {boolean} 自身がファイルリストの中で最初のファイルならtrue、そうでなければfalse
	 */
	isFirstFile() {
		return this.prevFile() === null;
	}
	/**
	 * 自身が最後のファイルであるかどうかを返します(ディレクトリ単位ではなく、ファイルリスト全体の中で最後のファイルであるかどうか)
	 * @return {boolean} 自身がファイルリストの中で最後のファイルならtrue、そうでなければfalse
	 */
	isLastFile() {
		return this.nextFile() === null;
	}
	/**
	 * 自身が表すファイルが文章コンテナに読み込まれているかどうかを返します
	 * @return {boolean} 自身が現在読み込まれていればtrue、そうでなければfalse
	 */
	isOpen() {
		return this.fileList().sentenceContainer().fileId() === this.id();
	}
	/**
	 * 自身が表すファイルが文章コンテナに読み込まれていないかどうかを返します
	 * @return {boolean} 自身が現在読み込まれていなければtrue、そうでなければfalse
	 */
	isClose() {
		return this.fileList().sentenceContainer().fileId() !== this.id();
	}

	// --Status
	/**
	 * 自身のファイルIDを返します
	 * @return {number} 自身のファイルID
	 */
	id() {
		return this._id;
	}
	/**
	 * 自身のファイル名を返します
	 * @return {string} 自身のファイル名
	 */
	name() {
		return this._name;
	}

	// --DOM操作

	/**
	 * 文章コンテナに自身のファイルを非同期で読み込みます
	 * @return {File} 自身のインスタンス
	 */
	open() {
		const sentenceContainer = this.fileList().sentenceContainer();

		const data = {};
		data.user_id = sentenceContainer.userId();
		data.file_id = this.id();
		sentenceContainer.userAlert('読込中');
		Util.post('/tategaki/ReadJsonFile',data,function (json) {
			sentenceContainer.init(json).userAlert('読み込み完了');
		}.bind(this));
		return this;
	}
	/**
	 * 自身の要素及び自身への参照を削除し、自身が表すファイルを削除します(非同期通信)
	 * @return {File} 自身のインスタンス
	 * @see ../WEB-INF/classes/doc/DeleteFile.html
	 */
	delete() {
		Util.post('/tategaki/DeleteFile',{
			user_id: this.fileList().sentenceContainer().userId(),
			file_id: this.id()
		},function (json) {
			if (!result) { console.log('ファイル削除エラーです(ファイル番号：'+ this.id() + ')'); }
					// 現在開いているファイルを削除したなら、前後どちらかのファイルを開く
					// 同じディレクトリに他のファイルがなければ新しいファイルを開く
					// 最後に、ファイルリストを作り直す
					if (this.sentenceContainer().fileList().currentFile() === this) {
						const nextFile = this.next() || this.prev();
						if (nextFile) {
							nextFile.open();
							this.sentenceContainer().fileList().read();
							return;
						}
						if (!nextFile) {
							this.sentenceContainer().newFile();
							this.sentenceContainer().fileList().read();
							return;
						}
					}
					this.sentenceContainer().fileList().read();
					}.bind(this));
			return this;
	}
	/**
	 * 自身をnewParentDirの中に移動し、ファイルリストを作り直します(非同期通信)
	 * @param {Directory} newParentDir 自身の親となるディレクトリのインスタンス
	 * @return {File} 自身のインスタンス
	 * @see ../WEB-INF/classes/doc/MoveFile.html
	 */
	move(newParentDir) {
		const fileList = this.fileList();
		Util.post("/tategaki/MoveFile",{
			user_id: fileList.sentenceContainer().userId(),
			file_id: this.id(),
			directory_id: newParentDir.id()
		},function (data) {
			fileList.read();
		});
		return this;
	}

	// --イベント

	// liタグの要素ではなくaタグ要素にクリックイベントを設定するためオーバーライド
	/**
	 * 自身のリンクにクリックイベントを付加します
	 * @return {File} 自身のインスタンス
	 */
	addClickEventListener() {
		this._clickArg = this.onClick.bind(this);
		this.link().addEventListener('click',this._clickArg);
		return this;
	}
	/**
	 * 自身のリンクへのクリックイベントを除去します
	 * @return {File} 自身のインスタンス
	 */
	removeClickEventListener() {
		if (!this._clickArg) return this;
		this.link().removeEventListener('click',this._clickArg);
		this._clickArg = null;
		return this;
	}
	/**
	 * 自身のリンクへのクリックイベントの内容です(クリックするとファイルが読み込まれる)
	 * @param {Event} e イベントオブジェクト
	 */
	runClick(e) {
		this.open();
		$('#file_list_modal').modal('hide');
	}
}
/**
 * ユーザーのディレクトリ情報のひとつを扱うクラス
 */
class Directory extends AbstractHierarchy {
	/**
	 * @param {number} dirId ディレクトリID
	 * @param {object} data ディレクトリの情報を持つオブジェクト
	 * <pre>
	 * <code>
	 *  // データの内容例
	 * {
	 *		"directoryname": "dirname",
	 *		"4":"indirfile",
	 *		"9":"file",
	 *		"12": {
	 *			"directoryname": "seconddir",
	 *			"17": "file"
	 *		}
	 *	}
	 *	</code>
	 *	</pre>
	 */
	constructor(dirId,data) {
		/*
		 * dataの中身例(rootから見て)
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
		super(Util.createDirectoryElement(dirId,data));
		this._link = this.elem().getElementsByTagName('a')[0];
		this._innerList = this.elem().getElementsByTagName('ul')[0];

		this._id = parseInt(dirId);
		this._name = data['directoryname'];
		for (let id in data) {
			if (id === 'directoryname') continue;
			if (typeof data[id] === 'string') {
				this.append(new File(id,data[id]));
			} else {
				this.append(new Directory(id,data[id]));
			}
		}
	}

	// --参照取得

	/**
	 * 内部のaタグのDOM要素を取得します
	 * @return {Element} 自身の持つaタグのDOM要素
	 */
	link() {
		return this._link;
	}
	/**
	 * 自身の内部の要素の構築先であるDOM要素(コラプスの内容の格納先)を返します
	 * @return {Element} 自身の内部リストのDOM要素
	 */
	innerList() {
		return this._innerList;
	}
	/**
	 * 自身の属するファイルリストの参照を探して取得します
	 * @return {FileList} 自身の属するファイルリストのインスタンス。見つからなければnull
	 */
	fileList() {
		for (let parentDir = this.parent(); parentDir ;parentDir = parentDir.parent() ) {
			if (parentDir.isRoot()) return parentDir;
		}
		return null;
	}

	// --判定

	/**
	 * 自身がFileListのインスタンスであるかどうかを返します
	 * @return {boolean} 常にfalse
	 */
	isRoot() {
		return false;
	}
	/**
	 * 自身がDirectoryのインスタンスであるかどうかを返します
	 * @return {boolean} 常にtrue
	 */
	isDirectory() {
		return true;
	}
	/**
	 * 自身がFileのインスタンスであるかどうかを返します
	 * @return {boolean} 常にfalse
	 */
	isFile() {
		return false;
	}

	// --参照操作

	// --Status

	/**
	 * 自身のIDを返します
	 * @return {number} 自身のID
	 */
	id() {
		return this._id;
	}
	/**
	 * 自身のディレクトリ名を返します
	 * @return {string} 自身のディレクトリ名
	 */
	name() {
		return this._name;
	}

	// --DOM操作

	/**
	 * 自身の内部の最後にfileを追加します
	 * @param {File Directory} file 追加するファイル、あるいはディレクトリのインスタンス
	 * @return {Directory} 自身のインスタンス
	 */
	append(file) {
		// DOM
		this.appendElem(file);

		// ポインタ調整
		// 最初の要素と最後の要素はつなげる

		if (this.hasChild()) {
			this.lastChild().next(file);
			file.prev(this.lastChild());
		}
		file.parent(this);
		this.pushChild(file);
		return this;
	}
	/**
	 * 自身の内部リストの内部の最後にfileのDOM要素を追加します
	 * @param {File Directory} file 追加するファイル、あるいはディレクトリのインスタンス
	 * @return {Directory} 自身のインスタンス
	 */
	appendElem(file) {
		this.innerList().appendChild(file.elem());
		return this;
	}
	/**
	 * 自身を削除します(非同期通信)
	 * @param {boolean} [opt_bl=false] 自身の内部にファイルがあるとき、強制的に中のファイルごと削除するならtrue、そうでなければfalseを指定する
	 * @return {Directory} 自身のインスタンス
	 * @see ../WEB-INF/classes/doc/DeleteDirectory.html
	 */
	delete(opt_bl) {
		const bl = opt_bl || false; // 引数省略の場合でも、明確にfalseを入れる
		Util.post("/tategaki/DeleteDirectory",{
			directory_id: this.id(),
			option: bl
		},function (data) {
			this.fileList().read();
			if (data.result === 'within') {
				alert('ディレクトリが空ではないので削除できませんでした。');
			}
		}.bind(this));
		return this;
	}
}
/**
 * ファイルやディレクトリを一覧にするファイルリストを表すクラス
 */
class FileList extends AbstractHierarchy {
	/**
	 * @param {SentenceContainer} sentenceContainer 自身のファイルを展開する文章コンテナのインスタンス
	 * @param {object} [opt_data] ファイルやディレクトリの情報を扱うオブジェクト。省略した場合は、init()にdataを渡して参照やDOMの構築を行う
	 * <pre>
	 * <code>
	 *  // dataの中身例
	 * {
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
	 * </code>
	 * </pre>
	 */
	constructor(sentenceContainer,opt_data) {
		super(document.getElementById('file_list'));
		this._sentenceContainer = sentenceContainer;
		this._$modal = $('#file_list_modal');
		this._filterInputElem = document.getElementById('file_list_filter');
		this.addEventListenerOnInput();
		if (opt_data) {
			this.init(opt_data);
		} else {
			this.read();
		}
	}
	/**
	 * 参照やDOMの構築を行います
	 * @param {object} data ファイルやディレクトリの情報を扱うオブジェクト。詳細はconstructorの説明へ
	 * @return {FileList} 自身のインスタンス
	 */
	init(data) {
		this.empty();
		for (let id in data) {
			if (id === 'directoryname') continue;
			if (typeof data[id] === 'string') {
				this.append(new File(id,data[id]));
			} else {
				this.append(new Directory(id,data[id]));
			}
		}
		this.chainFile();
		return this;
	}
	// --参照取得

	/**
	 * 文章コンテナのインスタンスを返します
	 * @return {SentenceContainer} 自身のファイルを展開する文章コンテナのインスタンス
	 */
	sentenceContainer() {
		return this._sentenceContainer;
	}
	/**
	 * 自身の子のうち、最初のファイルのインスタンスを取得します
	 * @return {File} 最初のファイルのインスタンス
	 */
	firstFile() {
		return this.findNextFile(this);
	}
	/**
	 * 自身の子のうち、最後のファイルのインスタンスを取得します
	 * @return {File} 最後のファイルのインスタンス
	 */
	lastFile() {
		for (let file = this.firstFile(); file; file = file.nextFile()) {
			if (file.isLastFile()) return file;
		}
		return null;
	}
	/**
	 * 現在文章コンテナに展開されているファイルのインスタンスを返します
	 * @return {File} 現在開かれているファイルのインスタンス
	 */
	currentFile() {
		for (let file = this.firstFile(); file; file = file.nextFile()) {
			if (file.isOpen()) return file;
		}
		return null;
	}
	/**
	 * ファイルリストのモーダルのjQueryオブジェクトを返します
	 * @return {jQuery} ファイルリストモーダルのjQueryオブジェクト
	 */
	$modal() {
		return this._$modal;
	}
	/**
	 * ファイルリストモーダル下部にある検索ボックスのDOM要素を返します
	 * @return {Element} 検索用InputのDOM要素
	 */
	filterInputElem() {
		return this._filterInputElem;
	}
	/**
	 * 指定されたファイルのインスタンスを探索して返します。
	 *     同じ名前を持つファイルが複数見つかる場合もあるので、結果は配列にして返します
	 * @param {number string} idOrName 対象ファイルのID、もしくはファイル名
	 * @return {File[]} 見つかったファイルインスタンスの配列
	 */
	findFile(idOrName) {
		const ret = [];
		for (let file = this.firstFile(); file; file = file.nextFile()) {
			if (file.id() == idOrName || (typeof idOrName === 'string' && new RegExp('^'+ idOrName +'$','i').test(file.name()))) {
				ret.push(file);
			}
		}
		return ret;
	}
	/**
	 * 指定されたディレクトリのインスタンスを探索して返します。
	 *     同じ名前を持つディレクトリが複数見つかる場合もあるので、結果は配列にして返します
	 * @param {number string} idOrName 対象ディレクトリのID、もしくはディレクトリ名
	 * @return {Directory[]} 見つかったディレクトリインスタンスの配列
	 */
	findDirectory(idOrName) {
		const ret = [];
		this.each(function (dir) {
			if (dir.isDirectory && (dir.id() === idOrName || (typeof idOrName === 'string' && new RegExp('^'+ idOrName +'$','i').test(dir.name())))) {
				ret.push(dir);
			}
		});
		return ret;
	}

	// --判定

	/**
	 * 自身がFileListのインスタンスであるかどうかを返します
	 * @return {boolean} 常にtrue
	 */
	isRoot() {
		return true;
	}
	/**
	 * 自身がDirectoryのインスタンスであるかどうかを返します
	 * @return {boolean} 常にfalse
	 */
	isFile() {
		return false;
	}
	/**
	 * 自身がFileのインスタンスであるかどうかを返します
	 * @return {boolean} 常にfalse
	 */
	isDirectory() {
		return false;
	}
	/**
	 * ファイルリストのモーダルが開いているかどうかを返します
	 * @return {boolean} ファイルリストのモーダルが開いていればtrue、そうでなければfalse
	 */
	isOpen() {
		return this.$modal().hasClass('in');
	}
	/**
	 * 自身の内部にファイルがあるかどうかを返します
	 * @return {boolean} ファイルがあればtrue、そうでなければfalse
	 */
	hasFile() {
		return this.firstFile() !== null;
	}

	// --参照操作

	/**
	 * 内部のFile同士をポインタでつなぎます
	 * @return {FileList} 自身のインスタンス
	 */
	chainFile() {
		let prev;
		this.each(function (file) {
			if (!file.isFile()) return;
			if (prev) prev.nextFile(file);
			file.prevFile(prev);
			prev = file;
		});
		return this;
	}
	/**
	 * リストで上からファイルだけを数えた場合の、引数の次のファイルを返します
	 * @param {FileList File Directory} file 基準とするインスタンス
	 * @return {File} 見つかったファイルのインスタンス。引数の次のファイルが見つからなければnull
	 */
	findNextFile(file) {
		// チェックする順番は、ファイルならその次のファイルをチェックし、ディレクトリなら下に潜って最初に見つけたファイルをチェックする
		// -- 全要素を順に探索していくための道のり --
		// 引数がファイルなら。引数の次を確認する
		// 引数がディレクトリなら、その最初の子を確認する(FileListはディレクトリ扱い)
		// 空ディレクトリ(firstChild()===null)なら、引数の次を確認する
		// 引数の次が同じ階層になければ(ディレクトリ内の最後と判断する)、親ディレクトリの次を確認する(それでもなければ、さらに上の親ディレクトリの次、と繰り返す)
		// 引数の次の要素が見つからず親をたどっていく過程でルートディレクトリ(FileList)に辿り着いた場合は、探索が最後に達したとしてnullを返す
		// -- ここまでで確認要素を取得 --
		// 取得した確認要素がディレクトリなら、さらに潜って探索を次に進めるため再帰する
		// 取得した確認要素がファイルなら、その要素が引数の次のファイルなので返す
		if (file.isEmpty() && file.isRoot()) return null;
		let check;
		if (file.isFile()) {
			check = file.next();
		}
		if (file.isDirectory() || file.isRoot()) {
			check = file.firstChild() || file.next();
		}
		if (!check) {
			for (let parentDir = file.parent(); !(check = parentDir.next()); parentDir = parentDir.parent())
				if (parentDir.isRoot()) return null;
		}
		if (check.isDirectory()) {
			return this.findNextFile(check);
		}
		if (check.isFile()) {
			return check;
		}
		return null;
	}
	/**
	 * すべてのファイルとディレクトリを順に引数にして関数を実行します
	 * @param {function} func 実行する関数オブジェクト
	 * @return {FileList} 自身のインスタンス
	 */
	each(func) {
		// fileに子があれば子に進み、なければ次に進む(子のあるディレクトリなら最初の子、fileか空ディレクトリなら次に進む)
		// 次がなければ親の次に進む。それでもなければさらに親の次、と繰り返す
		// その過程でルートディレクトリが見つかれば探索終了
		for (let file = this.firstChild(),temp = this;; temp = file, file = file.hasChild() ? file.firstChild() : file.next()) {
			if (!file) {
				for (let parentDir = temp.parent(); !(file = parentDir.next()); parentDir = parentDir.parent())
					if (parentDir.isRoot()) return this;
			}
			func(file);
		}
		return this;
	}

	// --Style

	/**
	 * ファイルリストのモーダルを開きます。その際、ファイル検索ボックスに自動的にフォーカスを当てます
	 * @return {FileList} 自身のインスタンス
	 */
	showModal() {
		this.filterInputElem().value = '';
		this.filterInputElem().focus();
		this.resetList();
		this.$modal().modal();
		return this;
	}
	/**
	 * ファイルリストのモーダルを閉じます
	 * @return {FileList} 自身のインスタンス
	 */
	hideModal() {
		this.$modal().modal('hide');
		return this;
	}

	// --DOM操作

	/**
	 * ファイルリストの末端にファイル、またはディレクトリを追加します
	 * @param {File Directory} file 追加するファイル、またはディレクトリ
	 * @return {FileList} 自身のインスタンス
	 */
	append(file) {
		// DOM
		this.appendElem(file);

		// ポインタ調整
		// 最初の要素と最後の要素はつなげる

		if (this.hasChild()) {
			this.lastChild().next(file);
			file.prev(this.lastChild());
		}
		file.parent(this);
		this.pushChild(file);
		return this;
	}
	/**
	 * 自身のDOM要素の内部の最後にfileのDOM要素を追加します
	 * @param {File Directory} file 追加するファイル、またはディレクトリのインスタンス
	 * @return {FileList} 自身のインスタンス
	 */
	appendElem(file) {
		this.elem().appendChild(file.elem());
		return this;
	}
	/**
	 * 内部のエレメントを空にします
	 * @return {FileList} 自身のインスタンス
	 */
	emptyElem() {
		// FileListは内部のエレメントが参照とは独立して変動するため、参照として保持しているエレメントを削除する方式では
		// 存在しないエレメントを削除しようとすることになりエラーが起こるため、オーバーライドする
		const children = this.elem().children;
		let child;
		while (child = children[0]) {
			this.elem().removeChild(child);
		}
		return this;
	}
	/**
	 * 各インスタンスの参照はそのままで、DOM要素のみを構築し直します
	 * @return {FileList} 自身のインスタンス
	 */
	resetList() {
		this.emptyElem();
		this.each(function (file) {
			file.parent().appendElem(file);
		});
		return this;
	}
	/**
	 * ファイルリストの内容をstrから始まる名前を持つファイル・ディレクトリのみに置き換えます(各インスタンスの参照はそのままで、DOM要素のみを変更します)
	 * @param {string} str この文字列から始まる名前を持つファイル、ディレクトリだけがファイルリスト内に表示される
	 * @return {FileList} 自身のインスタンス
	 */
	filter(str) {
		this.emptyElem();
		const regexp = new RegExp('^'+ str +'.*','i');
		this.each(function (file) {
			if (regexp.test(file.name())) {
				this.elem().appendChild(file.elem());
			}
		}.bind(this));
		if (this.elem().children.length === 0) {
			const li = document.createElement('li');
			li.textContent = '該当するファイルは見つかりませんでした。';
			this.elem().appendChild(li);
		}
		return this;
	}

	/**
	 * ファイルリストをサーバーから読み込み、各インスタンスを構築し直します(非同期通信)
	 * @return {FileList} 自身のインスタンス
	 * @see ../WEB-INF/classes/doc/FileListMaker.html
	 */
	read() {
		const userId = this.sentenceContainer().userId();
		Util.post("/tategaki/FileListMaker",{
			user_id: userId
		},function (json) {
			this.init(json);
		}.bind(this));
		return this;
	}
	/**
	 * 現在開いているファイルの次のファイルを読み込み、文章コンテナに展開します
	 * @return {FileList} 自身のインスタンス
	 */
	openNextFile() {
		const currentFile = this.currentFile();
		const file = currentFile && currentFile.nextFile();
		if (file) {
			file.open();
		} else if(this.hasFile()) {
			this.firstFile().open();
		}
		return this;
	}
	/**
	 * 現在開いているファイルの前のファイルを読み込み、文章コンテナに展開します
	 * @return {FileList} 自身のインスタンス
	 */
	openPrevFile() {
		const currentFile = this.currentFile();
		const file = currentFile && currentFile.prevFile();
		if (file) {
			file.open();
		} else {
			this.lastFile().open();
		}
		return this;
	}
	/**
	 * 名前で指定されたファイルを削除します(非同期通信)。同名のファイルが複数見つかった場合は確認します
	 * @param {string} filename 削除するファイルの名前
	 * @return {FileList} 自身のインスタンス
	 * @see ../WEB-INF/classes/doc/DeleteFile.html
	 */
	deleteFile(filename) {
		const files = this.findFile(filename);
		const fileLength = files.length;
		if (fileLength === 0) {
			this.sentenceContainer().userAlert('存在しないファイルです','red');
			return this;
		}

		if (fileLength === 1) {
			files[0].delete();
			return this;
		}

		if (fileLength > 0) {
			if (window.confirm('同一名のファイルが複数存在します。\nすべてのファイルを削除しますか。\nこのうちのどれかのファイルを削除する場合はキャンセルし、個別に削除してください。'))
				for (let i = 0,file; file = files[i]; i++) {
					file.delete();
				}
			else 
				console.log('[複数ファイル]削除できませんでした。:' + filename);
		}
		return this;
	}
	/**
	 * 指定された名前でディレクトリを作成します(非同期通信)
	 * @param {string} dirname 新しく作成されるディレクトリの名前
	 * @return {FileList} 自身のインスタンス
	 * @see ../WEB-INF/classes/doc/DirectoryMaker.html
	 */
	mkdir(dirname) {
		if (!dirname) return this;
		Util.post("/tategaki/DirectoryMaker",{
			user_id: this.sentenceContainer().userId(),
			directoryname: dirname,
			saved: Date.now()
		},function (data) {
			this.sentenceContainer().userAlert('ディレクトリを作成しました:'+ dirname);
			this.read();
		}.bind(this));
		return this;
	}
	/**
	 * 指定された名前のディレクトリを削除します(非同期通信)
	 * @param {string} dirname 削除するディレクトリの名前
	 * @param {boolean} isForce ディレクトリ内にファイル等があっても強制的に中身ごと削除するならtrue、そうでなければfalse
	 * @return {FileList} 自身のインスタンス
	 * @see ../WEB-INF/classes/doc/DeleteDirectory.html
	 */
	deleteDirectory(dirname,isForce) {
		const dirs = this.findDirectory(dirname);
		if (dirs.length === 0) return this;
		dirs[0].delete(isForce);
		return this;
	}
	/**
	 * 指定されたファイルを指定されたディレクトリ内に移動します(非同期通信)
	 * @param {string} filename 移動するファイル名。同名のファイルが見つかった場合は、最初に見つかったファイルが選択される
	 * @param {string} dirname 移動先のディレクトリ名。同名のディレクトリが見つかった場合は、最初に見つかったディレクトリが選択される
	 * @return {FileList} 自身のインスタンス
	 * @see ../WEB-INF/classes/doc/MoveFile.html
	 */
	moveFile(filename,dirname) {
		const files = this.findFile(filename);
		const dirs = this.findDirectory(dirname);
		if (files.length === 0 || dirs.length === 0) return this;
		files[0].move(dirs[0]);
		return this;
	}

	// --イベント

	/**
	 * ファイルリストのモーダル内にあるファイル検索ボックス関係のイベントを付加します
	 */
	addEventListenerOnInput() {
		// モーダルが開くと、検索欄にフォーカスが移動する
		this.$modal().on('shown.bs.modal',function (e) {
			this.filterInputElem().focus();
		}.bind(this));
		// ファイル検索欄
		this.filterInputElem().addEventListener('keyup',this.onKeyupOnInput.bind(this));
	}
	/**
	 * ファイル検索ボックスのkeyupイベントの内容です
	 * @param {Event} e イベントオブジェクト
	 */
	onKeyupOnInput(e) {
		let keycode;
		if (document.all) {
			// IE
			keycode = e.keyCode
		} else {
			// IE以外
			keycode = e.which;
		}
		if (keycode === 123) { return; } // F12のみブラウザショートカットキー
		if (keycode == 13) {
			// enter
			const file = this.findFile(this.filterInputElem().value)[0];
			if (file) {
				file.open();
			}
			this.hideModal();
			this.resetList();
		} else if (this.filterInputElem().value.length === 0) {
			this.resetList();
		} else {
			this.filter(this.filterInputElem().value);
		}
	}
}

/**
 * 文章コンテナを表すクラス
 */
class SentenceContainer extends AbstractHierarchy {
	/**
	 * @param {number} userId ユーザーID
	 * @param {object} [opt_data] 文書情報のオブジェクト
	 * <pre>
	 * {
	 * 	"filename": "sampleFile",
	 * 	"fileId": "12",
	 *		"saved": "2016-08-23 02:13:05",
	 *		"userId": "7",
	 *		"data": {
	 *			"conf": { // 文書全体に関する設定情報
	 *				"strLen": "36",
	 *				"rowLen": "42"
	 *			},
	 *			"text":[ // 各段落の情報が入った配列の配列
	 *						[ // 段落の情報が入った配列
	 *							["decolation-textalign-center"],		 // 段落のクラスが文字列の配列で格納される
	 *							[	 // 各文字のオブジェクトが配列で格納される
	 *								{	 // 文字を表すオブジェクト
	 *									"char":"あ",
	 *									"decolation":["decolation-color-blue"],
	 *									"fontSize":"auto"
	 *								},
	 *								{
	 *									"char":"い",
	 *									"decolation":[]
	 *								}
	 *							]
	 *						],
	 *						[
	 *							[],
	 *							[
	 *								{
	 *									"char":"い",
	 *									"decolation":["decolation-color-red"],
	 *									"fontSize":"30"
	 *								},
	 *								{
	 *									"char":"う",
	 *									"decolation":["decolation-color-red"],
	 *									"fontSize":"30"
	 *								}
	 *							]
	 *						]
	 *			]
	 *		}
	 * }
	 * </pre>
	 */
	constructor(userId,opt_data) {
		super(document.getElementById('sentence_container'));
		if (opt_data) this.init(opt_data);
		this._userId = userId;
		this._titleElem = document.getElementById('file_title');
		this._searchInputElem = document.getElementById('search');
		this._userAlertElem = document.getElementById('user_info');
		this.addFileTitleEvent();
		this.addSelectEvent();
		this._cursor = new Cursor(this);
		this._inputBuffer = new InputBuffer(this);
		this._fileList = new FileList(this);
		this._command = new CommandLine(this);
		this._menu = new Menu(this);

		if (!opt_data) this.newFile();
	}
	/**
	 * 文書をコンテナに展開します
	 * @param {object} data 文書情報のオブジェクト
	 * @return {SentenceContainer} 自身のインスタンス
	 */
	init(data) {
		this.empty();
		// 文書情報
		this.filename(data["filename"]);
		this.fileId(data["fileId"]);
		this.saved(data["saved"] || (new Date(Date.now()).toLocaleDateString() + ' ' + new Date(Date.now()).toLocaleTimeString()).replace(/\//g,'-'));
		this._strLenOnRow = data["data"]["conf"]["strLen"] || 40; // １行の文字数
		this._rowLenOnPage = data["data"]["conf"]["rowLen"] || 40; // １ページの行数
		this.menu().confStrLenElem().value = this._strLenOnRow;
		this.menu().confRowLenElem().value = this._rowLenOnPage;
		// DOMの構築
		for (let paraData of data["data"]["text"]) {
			this.append(new Paragraph(paraData));
		}

		this.cursor().init();
		this.cordinate().resetDisplay();
		this.breakPage().printInfo();
		this.addKeydownEventListener();
		this.addWheelEventListener();
		return this;
	}

	// --参照取得

	/**
	 * 指定された段落のインスタンス、あるいは引数省略で子の段落のインスタンスの配列を取得します
	 * @param {number} [opt_index] 取得する段落のインデックス
	 * @return {Paragraph Paragraph[]} 指定された段落のインスタンス。あるいは引数省略で段落のインスタンスの配列(子がなければ空の配列)
	 */
	paragraphs(opt_index) {
		return this.children(opt_index);
	}
	/**
	 * 文章内の最初の行のインスタンスを返します
	 * @return {Row} 最初の行のインスタンス
	 */
	firstRow() {
		return this.firstChild().firstChild();
	}
	/**
	 * 文章内の最終行のインスタンスを返します
	 * @return {Row} 最終行のインスタンス
	 */
	lastRow() {
		return this.lastChild().lastChild();
	}
	/**
	 * num行目のRowを取得します。
	 *     numが負の数なら最初の行、numが行数以上の数値であれば最終行のインスタンスが取得されます
	 * @param {number} num 取得する行のインデックス
	 * @return {Row} 見つかった行のインスタンス
	 */
	row(num) {
		if (num <= 0) return this.firstRow();
		let cnt = 0;
		for (let row = this.firstRow(); row; row = row.next()) {
			cnt++;
			if (cnt === num) return row;
		}
		return this.lastRow();
	}
	/**
	 * numページ目の第一行目のRowを取得します。
	 *     numが負の数なら最初の行、numがページ数以上の数値であれば最終行のインスタンスが取得されます
	 * @param {number} num 何ページ目か
	 * @return {Row} 見つかった行のインスタンス
	 */
	pageRow(num) {
		if (num <= 0) return this.firstRow();
		let cnt = 0;
		for (let row = this.firstRow(); row; row = row.next()) {
			if (row.isPageBreak()) {
				cnt++;
				if (cnt === num) return row;
			}
		}
		return this.lastRow();
	}
	/**
	 * 文書内で最初の文字(あるいはEOL)のインスタンスを返します
	 * @return {Char EOL} 見つかった文字のインスタンス
	 */
	firstChar() {
		return this.firstRow().firstChild();
	}
	/**
	 * 文書内で最終文字(EOLは除く)のインスタンスを返します
	 * @return {Char} 見つかった文字のインスタンス
	 */
	lastChar() {
		return this.lastEOL().prevChar();
	}
	/**
	 * 文書内で最終行のEOLを返します
	 * @return {EOL} 最後のEOL
	 */
	lastEOL() {
		return this.lastRow().lastChild();
	}
	/**
	 * カーソルのインスタンスを返します
	 * @return {Cursor} 文書内のカーソルのインスタンス
	 */
	cursor() {
		return this._cursor;
	}
	/**
	 * この文書内でカーソルのあたっている文字のインスタンスを返します
	 * @return {Char} カーソル文字のインスタンス
	 */
	cursorChar() {
		return this.cursor().getChar();
	}
	/**
	 * この文書内でカーソルのある行のインスタンスを返します
	 * @return {Row} カーソル行のインスタンス
	 */
	cursorRow() {
		return this.cursorChar().row();
	}
	/**
	 * この文書に入力する際に使用する入力バッファーのインスタンスを返します
	 * @return {InputBuffer} 入力バッファーのインスタンス
	 */
	inputBuffer() {
		return this._inputBuffer;
	}
	/**
	 * この文書コンテナを使用するファイルリストのインスタンスを返します
	 * @return {FileList} ファイルリストのインスタンス
	 */
	fileList() {
		return this._fileList;
	}
	/**
	 * コマンドラインのインスタンスを返します
	 * @return {CommandLine} コマンドラインのインスタンス
	 */
	command() {
		return this._command;
	}
	/**
	 * ファイル名InputフォームのDOM要素を返します
	 * @return {Element} ファイル名inputフォームのDOM要素
	 */
	titleElem() {
		return this._titleElem;
	}
	/**
	 * 文書内語句検索で使用するinputフォームのDOM要素を返します
	 * @return {Element} 語句検索inputフォームのDOM要素
	 */
	searchInputElem() {
		return this._searchInputElem;
	}
	/**
	 * ユーザーへの情報を表示するinputフォームのDOM要素を返します
	 * @return {Element} 情報表示inputフォームのDOM要素
	 */
	userAlertElem() {
		return this._userAlertElem;
	}
	/**
	 * この文書を操作するMenuクラスのインスタンスを返します
	 * @return {Menu} メニューバーのインスタンス
	 */
	menu() {
		return this._menu;
	}

	// --判定

	/**
	 * この文書内に段落が存在するかどうかを返します
	 * @return {boolean} 段落が存在するならtrue、そうでなければfalse
	 */
	hasParagraph() {
		return this.hasChild();
	}

	// --参照操作

	/**
	 * 子の最後にparagraphを追加します
	 * @param {Paragraph} paragraph 追加する段落のインスタンス
	 * @return {SentenceContainer} 自身のインスタンス
	 */
	pushParagraph(paragraph) {
		return this.pushChild(paragraph);
	}
	/**
	 * 子の指定された位置にparagraphを挿入します
	 * @param {number} pos 挿入する位置のインデックス
	 * @param {Paragraph} paragraph 挿入するインスタンス
	 * @return {SentenceContainer} 自身のインスタンス
	 */
	insertParagraph(pos,paragraph) {
		return this.insertChild(pos,paragraph);
	}
	/**
	 * 子からparagraphを削除します
	 * @param {Paragraph} paragraph 削除する段落のインスタンス
	 * @return {SentenceContainer} 自身のインスタンス
	 */
	deleteParagraph(paragraph) {
		return this.deleteChild(paragraph);
	}

	// --Status

	/**
	 * 文書の内容を表したオブジェクトを作成します
	 * @return {object} 文書内容を表すオブジェクト
	 */
	data() {
		const data = {};
		data["conf"] = this.menu().configueData();
		const paraArr = [];
		for (let paragraph of this.paragraphs()) {
			paraArr.push(paragraph.data());
		}
		data["text"] = paraArr;

		return JSON.stringify(data);
	}
	/**
	 * ユーザーIDを返します
	 * @return {number} ユーザーID
	 */
	userId() {
		return this._userId;
	}
	/**
	 * この文書内に展開しているファイル名を変更する、あるいは引数省略で現在のファイル名を取得します
	 * @param {string} [opt_newFilename] 新たに設定するファイル名
	 * @return {SentenceContainer string} 自身のインスタンス(引数を渡した場合)、あるいは現在のファイル名(引数を省略した場合)
	 */
	filename(opt_newFilename) {
		if (opt_newFilename === undefined) {
			return this._filename;
		} else {
			this._filename = opt_newFilename;
			this.titleElem().value = opt_newFilename;
			this.titleElem().dataset.filename = opt_newFilename;
			return this;
		}
	}
	/**
	 * 現在のファイルに新たなIDを与える、あるいは引数省略で現在のファイルIDを取得します
	 * @param {number} [opt_newId] 新たに設定するID
	 * @return {SentenceContainer number} 自身のインスタンス(引数を渡した場合)、あるいは現在のファイルID(引数を省略した場合)
	 */
	fileId(opt_newId) {
		if (opt_newId === undefined) {
			return this._fileId;
		} else {
			const newId = opt_newId;
			this._fileId = newId;
			this.titleElem().dataset.fileId = newId;
			return this;
		}
	}
	/**
	 * 最終更新日時を設定、あるいは引数省略で最終更新日時を取得します
	 * @param {string} [opt_newSaved] 新たに設定する最終更新日時の文字列
	 * @return {SentenceContainer string} 自身のインスタンス(引数を渡した場合)、あるいは現在の最終更新日時の文字列(引数を省略した場合)
	 */
	saved(opt_newSaved) {
		if (opt_newSaved === undefined) {
			return this._saved;
		} else {
			const newSaved = opt_newSaved;
			this._saved = newSaved;
			document.getElementById('saved').textContent = newSaved;
			return this;
		}
	}
	/**
	 * 一行の文字数を変更する、あるいは引数省略で現在の設定上の一行の文字数を取得します
	 * @param {number} [opt_newStrLen] 新たに設定する行内文字数
	 * @return {SentenceContainer number} 自身のインスタンス(引数を渡した場合)、あるいは現在の設定上の行内文字数(引数を省略した場合)
	 */
	strLenOnRow(opt_newStrLen) {
		if (opt_newStrLen === undefined) {
			return this._strLenOnRow;
		} else {
			const newStrLen = opt_newStrLen;
			this._strLenOnRow = newStrLen;
			this.cordinate().checkKinsoku().changeDisplay().breakPage().printInfo();
			this.cursor().createCursorLine();
			return this;
		}
	}
	// 設定上のページ内行数
	/**
	 * 一ページの行数を変更する、あるいは引数省略で現在の一ページの行数を取得します
	 * @param {number} [opt_newRowLen] 新たに設定するページ内行数
	 * @return {SentenceContainer number} 自身のインスタンス(引数を渡した場合)、あるいは現在のページ内行数(引数を省略した場合)
	 */
	rowLenOnPage(opt_newRowLen) {
		if (opt_newRowLen === undefined) {
			return this._rowLenOnPage;
		} else {
			const newRowLen = opt_newRowLen;
			this._rowLenOnPage = newRowLen;
			this.breakPage().printInfo();
			return this;
		}
	}
	/**
	 * 文書内文字数を数えます
	 * @return {number} 文書内の総文字数
	 */
	countChar() {
		let cnt = 0;
		for (let paragraph of this.paragraphs()) {
			cnt += paragraph.countChar();
		}
		return cnt;
	}
	// 全行数
	/**
	 * 文書内行数を数えます
	 * @return {number} 文書内の総行数
	 */
	countRow() {
		let cnt = 0;
		for (let paragraph of this.paragraphs()) {
			cnt += paragraph.childLength();
		}
		return cnt;
	}
	/**
	 * 文書内のページ数を数えます
	 * @return {number} 文書内の総ページ数
	 */
	countPage() {
		let cnt = 0;
		for (let row = this.firstRow(); row; row = row.next()) {
			if (row.isPageBreak()) cnt++;
		}
		return cnt;
	}

	// --Style

	/**
	 * この文書コンテナの横幅を返えます。
	 *     文書コンテナは９０度回転しているため、css上は高さと同様です
	 * @param {boolean} [opt_useCache=true] true=キャッシュを利用する、false=キャッシュを利用しない。省略するとデフォルトでtrueになるので、キャッシュを使わず計算し直す場合には明示的にfalseを渡す必要がある
	 * @return {number} 自身の幅
	 */
	width(opt_useCache) {
		return super.height(opt_useCache);
	}
	/**
	 * この文書コンテナの高さを返します。
	 *     文書コンテナは９０度回転しているため、css上は横幅と同様です
	 * @param {boolean} [opt_useCache=true] true=キャッシュを利用する、false=キャッシュを利用しない。省略するとデフォルトでtrueになるので、キャッシュを使わず計算し直す場合には明示的にfalseを渡す必要がある
	 * @return {number} 自身の高さ
	 */
	height(opt_useCache) {
		return super.width(opt_useCache);
	}
	/**
	 * 文書内すべての文字から、指定されたクラスを除去します
	 * @param {string} className 除去するクラス名
	 * @return {SentenceContainer} 自身のインスタンス
	 */
	removeClassFromAllChar(className) {
		for (let paragraph of this.paragraphs()) {
			paragraph.removeClassFromAllChar(className);
		}
		return this;
	}
	/**
	 * 渡された文字列を本文内から探し、見つかった文字列にsearch-wordクラスを付与します。
	 *     さらに、見つかった文字列の先頭文字にsearch-labelクラスを付与します
	 *  @param {string} str 検索文字列
	 *  @return {SentenceContainer} 自身のインスタンス
	 */
	search(str) {
		for (let paragraph of this.paragraphs()) {
			paragraph.search(str);
		}
		return this;
	}
	/**
	 * 文書内語句検索を始めます
	 * @return {SentenceContainer} 自身のインスタンス
	 */
	startSearchMode() {
		this.searchInputElem().classList.add('active');
		this.searchInputElem().focus();
		this.searchInputElem().value = '/';
		this.removeKeydownEventListener();
		if (!this._keyupOnSearchArg) {
			this._keyupOnSearchArg = this.onKeyupOnSearchMode.bind(this);
			this.searchInputElem().addEventListener('keyup',this._keyupOnSearchArg,false);
			this.searchInputElem().addEventListener('focusin',this.onFocusinOnSearchMode.bind(this));
			this.searchInputElem().addEventListener('focusout',this.onFocusoutOnSearchMode.bind(this));
		}
		return this;
	}
	/**
	 * 文書内語句検索を完全に終了します
	 * @return {SentenceContainer} 自身のインスタンス
	 */
	stopSearchMode() {
		this.addKeydownEventListener();
		this.searchInputElem().value = '';
		this.searchInputElem().classList.remove('active');
		this.removeClassFromAllChar('search-label').removeClassFromAllChar('search-word');
		return this;
	}

	// selection

	/**
	 * 選択範囲にある文字インスタンスを配列で返します
	 * @param {boolean} [opt_bl] 選択範囲を解除するならtrueを指定する
	 * @return {Char[]} 選択範囲内にある文字インスタンスの配列
	 */
	selectChars(opt_bl) {
		const ret = [];
		const selection = getSelection();
		if (this.selectText().length === 0) return ret; // rangeCount===0とすると、EOLのみ選択されることがある
		const selRange = selection.getRangeAt(0);
		for (let char = this.firstChar(); char; char = char.nextChar()) {
			if (char.isInRange(selRange)) ret.push(char);
		}
		selRange.detach();
		if (opt_bl) selection.removeAllRanges(); // 選択を解除する
		return ret;
	}
	/**
	 * 選択範囲内にある文字列をローカルストレージに保存します
	 * @return {SentenceContainer} 自身のインスタンス
	 */
	copySelectText() {
		localStorage.clipBoard = this.selectText();
		return this;
	}
	// ペースト
	/**
	 * ローカルストレージに保存した文字列をカーソル位置から挿入します
	 * @return {SentenceContainer} 自身のインスタンス
	 */
	pasteText() {
		this.cursor().insert(localStorage.clipBoard);
		return this;
	}
	/**
	 * 選択範囲内にある文字列を返します
	 * @return {string} 選択範囲内の文字列
	 */
	selectText() {
		const selection = getSelection();
		let ret = '';
		for (let i = 0,cnt = selection.rangeCount; i < cnt; i++) {
			const selRange = selection.getRangeAt(i);
			ret += selRange.toString();
		}
		return ret;
	}

	// --DOM操作関係

	/**
	 * 子を空にし、入力モード、語句検索モードは終了します
	 * @return {SentenceContainer} 自身のインスタンス
	 */
	empty() {
		this.emptyElem();
		this.emptyChild();
		this.removeKeydownEventListener();
		this.removeWheelEventListener();
		if (this.inputBuffer().isDisplay()) {
			this.inputBuffer().empty().hide();
		}
		this.stopSearchMode();
		return this;
	}
	/**
	 * この文章コンテナの末尾にparagraphを追加します
	 * @param {Paragraph} paragraph 追加する段落のインスタンス
	 * @return {SentenceContainer} 自身のインスタンス
	 */
	append(paragraph) {
		this.elem().appendChild(paragraph.elem());
		paragraph.container(this);
		if (!this.hasParagraph()) {
			this.pushParagraph(paragraph);
			return this;
		}
		// paragraph
		this.lastChild().next(paragraph);
		paragraph.prev(this.lastChild());
		// row
		const lastRow = this.lastChild().lastChild();
		lastRow.next(paragraph.firstChild());
		paragraph.firstChild().prev(lastRow);
		// char
		const lastChar = lastRow.lastChild();
		lastChar.next(paragraph.firstChild().firstChild());
		paragraph.firstChild().firstChild().prev(lastChar);

		this.pushParagraph(paragraph);
		return this;
	}
	/**
	 * 文書情報を表示します
	 * @return {SentenceContainer} 自身のインスタンス
	 */
	printInfo() {
		document.getElementById('str_pos').textContent = this.cursor().currentCharPos();
		document.getElementById('str_len').textContent = this.cursor().strLenOfRow();
		document.getElementById('row_pos').textContent = this.cursor().currentRowPos();
		document.getElementById('row_len').textContent = this.cursor().rowLenOnPage();
		document.getElementById('page_pos').textContent = this.cursor().currentPage();
		document.getElementById('page_len').textContent = this.countPage();
		return this;
	}

	// --文章整理

	/**
	 * 各行が指定文字数と異なる文字数なら、指定文字数に合わせて文字数を調節します。
	 *     標準以外のフォントサイズの文字があればフォントサイズに合わせて文字数は調整されます。
	 *     また、空段落以外に空行があれば削除します
	 * @return {SentenceContainer} 自身のインスタンス
	 */
	cordinate() {
		for (let paragraph of this.paragraphs()) {
			paragraph.cordinate();
		}
		return this;
	}
	/**
	 * 禁則処理を行います。
	 *     各行の文字数への変化が伴うため、cordinate()の後に実行してください
	 * @return {SentenceContainer} 自身のインスタンス
	 */
	checkKinsoku() {
		for (let paragraph of this.paragraphs()) {
			paragraph.checkKinsoku();
		}
		return this;
	}
	// 改ページ
	/**
	 * ページの最初の行と最終行に目印となるクラスを与えます
	 * @return {SentenceContainer} 自身のインスタンス
	 */
	breakPage() {
		const pageNum = this.rowLenOnPage();
		// page-break
		let cnt1 = 0;
		for (let paragraph of this.paragraphs()) {
			for (let row of paragraph.rows()) {
				if (cnt1 === 0 || cnt1 % pageNum === 0) { // １行目とpageNumの倍数行目
					row.addClass('page-break');
				} else {
					row.removeClass('page-break');
				}
				cnt1++;
			}
		}
		// page-last-row
		let cnt2 = 0;
		const lastRow = this.countRow() -1;
		for (let paragraph of this.paragraphs()) {
			for (let row of paragraph.rows()) {
				if ((cnt2 + 1) % pageNum === 0 || cnt2 === lastRow) { // (pageNumの倍数-1)行目と最終行
					row.addClass('page-last-row');
				} else {
					row.removeClass('page-last-row');
				}
				cnt2++;
			}
		}
		return this;
	}
	/**
	 * ユーザーへの情報を表示します
	 * @param {string} str 表示する情報
	 * @param {string} [opt_color='black'] 黒文字以外の文字色で表示する場合に色名を指定する
	 * @return {SentenceContainer} 自身のインスタンス
	 */
	userAlert(str,opt_color) {
		this.userAlertElem().textContent = str;
		if (opt_color) this.userAlertElem().style.color = opt_color;
		else this.userAlertElem().style.color = '';
		return this;
	}

	// --ファイル操作

	/**
	 * 指定されたファイルを開きます(非同期通信)
	 * @param {number} fileId 開くファイルのID
	 * @return {SentenceContainer} 自身のインスタンス
	 * @see ../WEB-INF/classes/doc/ReadJsonFile.html
	 */
	readFile(fileId) {
		const file = this.fileList().findFile(fileId)[0];
		file.open();
		return this;
	}
	/**
	 * 現在開いているファイルを上書き保存します。
	 *     newFile()されて初めての保存なら名前をつけて保存します。(ともに非同期通信)
	 * @return {SentenceContainer} 自身のインスタンス
	 * @see ../WEB-INF/classes/doc/WriteJsonFile.html
	 */
	saveFile() {
		if (this.fileId() === -1) {
			this.saveAsFile(this.filename());
			return this;
		}
		this.userAlert('保存中');
		Util.post('/tategaki/WriteJsonFile',{
			user_id: this.userId(),
			file_id: this.fileId(),
			filename: this.filename(),
			json: this.data(),
			saved: Date.now()
		},function (json) {
			this.saved(json.strDate).userAlert('保存しました');
			this.fileList().read();
		}.bind(this));
		return this;
	}
	/**
	 * 現在開いているファイルを名前をつけて保存します(非同期通信)
	 * @param {string} filename 新しいファイルの名前
	 * @return {SentenceContainer} 自身のインスタンス
	 * @see ../WEB-INF/classes/doc/FileMaker.html
	 * @see ../WEB-INF/classes/doc/WriteJsonFile.html
	 */
	saveAsFile(filename) {
		Util.post('/tategaki/FileMaker',{
			user_id: this.userId(),
			filename: filename,
			saved: Date.now()
		},function (data) {
			this.filename(data.filename).fileId(data.newFileId);
			const file = new File(data.newFileId,data.filename);
			this.fileList().append(file).chainFile();
			this.saveFile();
		}.bind(this));
		return this;
	}
	/**
	 * 新しいファイルを開きます
	 * @param {string} filename 新しいファイル名
	 * @return {SentenceContainer} 自身のインスタンス
	 */
	newFile(filename) {
		if (filename === undefined) filename = 'newfile';
		this.init({
			fileId: -1,
			filename: filename,
			data: {
				conf:{},
				text:[[[],[]]]
			}
		}); // 空段落のデータ
		return this;
	}

	// --Display関係

	/**
	 * 文書を１行目の１文字目から表示します
	 * @return {SentenceContainer} 自身のインスタンス
	 */
	resetDisplay() {
		this.addDisplay(0,0);
		return this;
	}
	// strPos: 'center','right'
	/**
	 * カーソル位置を基準として文書を表示し直します
	 * @param {string} [opt_pos] 表示後のカーソル位置を指定する。'center'と'right'に対応。
	 *     省略した場合は現在の表示位置から最低限の移動でカーソル文字が表示されるように表示される
	 * @return {SentenceContainer} 自身のインスタンス
	 */
	changeDisplay(opt_pos) {
		const cursorChar = this.cursorChar();
		const rowPos = this.computeDisplayRowPos(opt_pos);
		const charPos = cursorChar.row().computeDisplayCharPos();
		this.addDisplay(rowPos,charPos);
		return this;
	}
	/**
	 * firstRow行目以降を表示します。
	 *     文字はfirstChar文字目以降が表示されます
	 * @param {number} firstRow 表示される最初の行のインデックス
	 * @param {number} firstChar 表示される最初の文字のインデックス
	 * @return {SentenceContainer} 自身のインスタンス
	 */
	addDisplay(firstRow,firstChar) {
		const dispWidth = this.width();
		const cache = {};
		let cnt = 0; // 総行数をカウントする
		let sum = 0; // 表示行の幅合計
		for (let paragraph of this.paragraphs()) {
			for (let row of paragraph.rows()) {
				if (cnt < firstRow) {
					row.display(false);
					cnt++;
					continue;
				}
				// 行の幅は子の最大のフォントによって決まると考え、最大フォントごとの行幅をキャッシュする(レンダリング頻度の削減)
				const maxFont = row.maxFont();
				if (cache[maxFont]) {
					const rowWidth = cache[maxFont];
					sum += rowWidth + 2; // 2はボーダーの幅
				} else {
					cache[maxFont] = row.width();
					const rowWidth = cache[maxFont];
					sum += rowWidth + 2; // 2はボーダーの幅
				}
				row.display((sum < dispWidth),firstChar);
				cnt++;
			}
		}
		return this;
	}
	/**
	 * @private
	 * カーソル位置を基準に、最初に表示されるべき行のインデックスを返します
	 * @param {string} [opt_pos] 表示後のカーソル位置を指定する。'center'なら、カーソル位置を中央にする。'right'なら、カーソル位置が最も右になるよう表示される。
	 *     省略した場合は現在の表示位置から最低限の移動でカーソル文字が表示されるように表示される
	 * @return {number} 計算された最初に表示されるべき行のインデックス
	 */
	computeDisplayRowPos(opt_pos) {
		const currentFirst = this.firstDisplayRowPos();
		const cursorIndex = this.cursorRowPos();
		const currentEnd = this.lastDisplayRowPos();

		// カーソル位置を中央にする
		// HACK:計算前のdisplayの数を基準にするので、フォントの大きさなどによってずれもありうる
		if (opt_pos === 'center') {
			const harfRange = (currentEnd - currentFirst)/2;
			const ret = cursorIndex - harfRange;
			return ret >= 0 ? ret : 0;
		} else if (opt_pos === 'right') {
			return cursorIndex;
		}

		if (cursorIndex < currentFirst) {
			// カーソルが前にある
			return cursorIndex;
		} else if (cursorIndex > currentEnd) {
			// カーソルが後ろにある
			return currentFirst + (cursorIndex - currentEnd);
		} else {
			// displayに囲まれた部分にdisplayでない行がある場合
			// 途中行数変化
			return currentFirst;
		}
	}
	/**
	 * @private
	 * 現在表示されている行の最初の行のインデックスを返します
	 * @return {number} 現在表示されている行の最初の行のインデックス。表示行がなければ-1
	 */
	firstDisplayRowPos() {
		let cnt = 0;
		for (let paragraph of this.paragraphs()) {
			for (let row of paragraph.rows()) {
				if (row.isDisplay())
					return cnt;
				cnt++;
			}
		}
		return -1;
	}
	/**
	 * @private
	 * 現在表示されている行の最後の行のインデックスを返します
	 * @return {number} 現在表示されている行の最後の行のインデックス。表示行がなければ-1
	 */
	lastDisplayRowPos() {
		for (let row = this.lastRow(),cnt = this.countRow() -1; row; row = row.prev(),cnt--) {
			if (row.isDisplay()) return cnt;
		}
		return -1;
	}
	/**
	 * @private
	 * カーソル行の文書全体で何行目かを返します
	 * @return {number} カーソル行の文書全体でのインデックス。文書内に段落がない、あるいはカーソル行がなければ-1
	 */
	cursorRowPos() {
		const cursorRow = this.cursor().getChar().row();
		let cnt = 0;
		for (let paragraph of this.paragraphs()) {
			for (let row of paragraph.rows()) {
				if (row.is(cursorRow))
					return cnt;
				cnt++;
			}
		}
		return -1;
	}
	/**
	 * @private
	 * 表示されている行のうち最初の行のインスタンスを返します
	 * @return {Row} 最初の表示行のインスタンス。表示行がなければnull
	 */
	firstDisplayRow() {
		for (let paragraph of this.paragraphs()) {
			for (let row of paragraph.rows()) {
				if (row.isDisplay()) return row;
			}
		}
		return null;
	}
	/**
	 * @private
	 * 表示されている行のうち最後の行のインスタンスを返します
	 * @return {Row} 最後の表示行のインスタンス。表示行がなければnull
	 */
	lastDisplayRow() {
		for (let row = this.lastRow(); row; row = row.prev()) {
			if (row.isDisplay()) return row;
		}
		return null;
	}

	/**
	 * 表示を一行分右に動かします
	 * @return {SentenceContainer} 自身のインスタンス
	 */
	shiftRightDisplay() {
		const charPos = this.cursorRow().computeDisplayCharPos();
		const firstDisplay = this.firstDisplayRow();
		if (!firstDisplay.prev()) { return this; }
		firstDisplay.prev().display(true,charPos);
		this.lastDisplayRow().display(false);
		return this;
	}
	/**
	 * 表示を一行分左に動かします
	 * @return {SentenceContainer} 自身のインスタンス
	 */
	shiftLeftDisplay() {
		const charPos = this.cursorRow().computeDisplayCharPos();
		const lastDisplay = this.lastDisplayRow();
		if (!lastDisplay.next()) { return this; }
		lastDisplay.next().display(true,charPos);
		this.firstDisplayRow().display(false);
		return this;
	}

	// --イベント

	// keydown
	/**
	 * この文書コンテナにkeydownイベントリスナーを付加します
	 * @return {SentenceContainer} 自身のインスタンス
	 */
	addKeydownEventListener() {
		this.inputBuffer().removeKeydownEventListener()
			.convertContainer().removeKeydownEventListener();
		super.addKeydownEventListener();
		return this;
	}
	/**
	 * keydownイベントの実行内容です
	 * @param {Event} e イベントオブジェクト
	 * @param {number} keycode 押下されたキーのキーコード
	 * @return {SentenceContainer} 自身のインスタンス
	 */
	runKeydown(e,keycode) {
		this.userAlert('');
		if (e.ctrlKey) return this.runControlKeyDown(e,keycode);

		switch (keycode) {
			case 8:
				// backspace
				this.cursor().backSpace();
				break;
			case 13:
				// Enter
				this.cursor().lineBreak();
				break;
			case 32:
				// space
				this.cursor().insert('　');
				break;
			case 37:
				// Left
				this.cursor().moveLeft(e.shiftKey);
				break;
			case 38:
				// Up
				this.cursor().movePrev(e.shiftKey);
				break;
			case 39:
				// Right
				this.cursor().moveRight(e.shiftKey);
				break;
			case 40:
				// Down
				this.cursor().moveNext(e.shiftKey);
				break;
			case 58: // firefox developer edition
			case 186: // chrome
				// :
				this.command().start();
				break;
			case 191:
				// /
				this.startSearchMode();
				break;
			default:
				this.inputBuffer().tryTransfer(keycode,e.shiftKey);
				break;
		}
		return this;
	}
	/**
	 * @private
	 * コントロールキーを押されていた場合のkeydownイベントの実行内容です
	 * @return {SentenceContainer} 自身のインスタンス
	 */
	runControlKeyDown(e,keycode) {
		switch (keycode) {
			case 67:
				// c
				this.copySelectText();
				break;
			case 18:
			case 70:
				// f
				this.fileList().showModal();
				break;
			case 72:
				// h
				this.cursor().moveLeft(e.shiftKey);
				break;
			case 73:
				// i
				this.fileList().openNextFile();
				break;
			case 74:
				// j
				this.cursor().moveNext(e.shiftKey);
				break;
			case 75:
				// k
				this.cursor().movePrev(e.shiftKey);
				break;
			case 76:
				// l
				this.cursor().moveRight(e.shiftKey);
				break;
			case 79:
				// o
				this.fileList().openPrevFile();
				break;
			case 83:
				// s
				this.saveFile();
				break;
			case 86:
				// v
				this.pasteText();
				break;
			case 188:
				// ,
				this.cursor().nextSearch();
				break;
			case 190:
				// .
				this.cursor().prevSearch();
				break;
			default:
				break;
		}
		return this;
	}

	// wheel
	/**
	 * ホイールイベントの実行内容です(表示を４行分移動する)
	 * @param {Event} e イベントオブジェクト
	 * @param {boolean} isUp 上方向にホイールが動かされたならtrue、そうでなければfalse
	 * @return {SentenceContainer} 自身のインスタンス
	 */
	runWheel(e,isUp) {
		const mvRowNum = 4; // 一度に動かす行数
		if (isUp) {
			for (let i = 0; i < mvRowNum; i++) { this.shiftRightDisplay(); }
		} else {
			for (let i = 0; i < mvRowNum; i++) { this.shiftLeftDisplay(); }
		}
		return this;
	}

	// 語句検索
	/**
	 * 語句検索inputフォームのkeyupイベントです
	 * @param {Event} e イベントオブジェクト
	 */
	onKeyupOnSearchMode(e) {
		let keycode;
		if (document.all) {
			// IE
			keycode = e.keyCode
		} else {
			// IE以外
			keycode = e.which;
		}
		if (keycode === 13) {
			// enter
			this.searchInputElem().blur(); // enterを押しただけではフォーカスが外れない
			return;
		}

		// 中身が空になればsearchモードを完全に終了する
		if (this.searchInputElem().value === '') {
			this.searchInputElem().blur();
			this.stopSearchMode();
			return;
		}

		this.search(this.searchInputElem().value.slice(1));
	}
	/**
	 * 語句検索inputフォームからフォーカスが外れた際のイベント実行内容です。
	 *     文書コンテナ本体にkeydownイベントを戻します
	 */
	onFocusoutOnSearchMode() {
		this.addKeydownEventListener();
	}
	/**
	 * 語句検索inputフォームにフォーカスがあたった際のイベント実行内容です。
	 *     文書コンテナ本体のkeydownイベントを外します
	 */
	onFocusinOnSearchMode() {
		this.removeKeydownEventListener();
	}

	// ファイル名input
	/**
	 * ファイル名inputフォームにイベントを付加します(主に、フォーカスがあたった際と外れた際のイベント)。
	 */
	addFileTitleEvent() {
		// 与えっぱなし。実行内容もここで定義
		this.titleElem().addEventListener('focusin',function (e) {
			if (this.inputBuffer().isDisplay) { this.inputBuffer().empty().hide(); }
			this.removeKeydownEventListener();
		}.bind(this),false);
		this.titleElem().addEventListener('focusout',function (e) {
			if (this.titleElem().value === '') {
				this.userAlert('ファイル名が入力されていません','red');
				this.titleElem().value = this.titleElem().dataset.filename;
			}
			this.addKeydownEventListener();
		}.bind(this),false);
	}

	// selection
	/**
	 * マウスで選択範囲を変更した際のイベントを与えます。選択範囲最後の文字の次の文字にカーソルを当てます
	 */
	addSelectEvent() {
		this.elem().addEventListener('mouseup',function (e) {
			const selChars = this.selectChars();
			// 選択範囲の直後にカーソルを当てる
			if (selChars.length > 0) {
				const lastCharOnSelect = selChars[selChars.length -1];
				const newCursor = lastCharOnSelect.hasNextSibling() ? lastCharOnSelect.next() : lastCharOnSelect;
				newCursor.addCursor().setPosMemory();
			}
		}.bind(this),false);
	}
}

