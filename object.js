/*
 *	オブジェクト指向
 *	Draft,Paragraph,Row,Charは、親や子の参照を保持するのはもちろんのこと、木構造を無視して異なる親であっても次と前にある同種オブジェクトの参照を持つ
 *	Dom要素の参照を持つコンポジション
 *	要素の再利用のため、要素作成のみクロージャで行う
 */
console.log('object.js');
const Util = {
	// baseArrayをcnt個ずつの配列に分割する
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
		post: function (url,data,callback) {
			'use strict';
			const xhr = new XMLHttpRequest();
			xhr.responseType = 'json';
			// xhr.overrideMimeType('application/json');
			xhr.open('POST',url);
			xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded;charset=UTF-8');

			let sendData = '';
			for (let name in data) {
				if (sendData != '') {
					sendData += '&';
				}
				sendData += name + '=' + escape(data[name]); // HACK:escape()は非推奨？
			}

			xhr.addEventListener('load',function (e) {
				'use strict';
				if (this.response) {
					callback(xhr.response);
				} else {
					console.log('unsuccess');
				}
			});
			xhr.addEventListener('abort',function (e) {
				'use strict';
				alert('abort');
			});
			xhr.send(sendData);
		}
	};
// closer
Util.createCharElement = (function () {
	'use strict';
	const eCharTemplate = document.createElement('span');
	eCharTemplate.classList.add('vertical-char');

	return function (json) {
		const eChar = eCharTemplate.cloneNode(true);
		const char = json['char'];
		const classArr = json['decolation'];
		const fontSize = json['fontSize'];
		eChar.textContent = char;
		eChar.dataset.fontSize = fontSize || 'auto';

		// 文字の種類に応じて付与するクラス
		if (/[。、,.,]/.test(char))
			eChar.classList.add('vertical-dot');
		else if (/[「『]/.test(char))
			eChar.classList.add('vertical-before-kagi-brachet');
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
	'use strict';
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
	eRowTemplate.classList.add('vertical-row');
	eRowTemplate.classList.add('display-row');
	const eEOL = document.createElement('span');
	eEOL.classList.add('vertical-char');
	eEOL.classList.add('EOL');
	eEOL.classList.add('display-char');
	eRowTemplate.appendChild(eEOL);

	return function (json) {
		const eRow = eRowTemplate.cloneNode(true);
		return eRow;
	}
})();
Util.createParagraphElement = (function () {
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
	 * 						"decolation":[]
	 * 					}
	 * 					]
	 * 			]
	 */
	const eParagraphTemplate = document.createElement('div');
	eParagraphTemplate.classList.add('vertical-paragraph');

	return function (json) {
		const eParagraph = eParagraphTemplate.cloneNode(true);
		// 段落そのものにクラスを付与する
		for (let className of json[0]) {
			eParagraph.classList.add(className);
		}
		return eParagraph;
	}
})();
Util.createCharPosElement = (function () {
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
	 * 						"decolation":[]
	 * 					}
	 * 					]
	 * 			]
	 */
	const eCharPosTemplate = document.createElement('span');
	eCharPosTemplate.classList.add('char-pos');

	return function (strLen) {
		const flagment = document.createDocumentFragment();
		for (var i = 0; i < strLen; i++) {
			const eCharPos = eCharPosTemplate.cloneNode(true);
			flagment.appendChild(eCharPos);
		}
		return flagment;
	}
})();

// Class
(function () {
	'use strict';
class Cursor {
	constructor(draft) {
		this.draft = draft;
		const firstChar = this.draft.firstChild().firstChild().firstChild();
		console.log(firstChar);
		this._char = firstChar;
		this._char.addClass('cursor'); // この時点ではDraftの_cursorにインスタンスが入っていないのでdraft.cursor()が使えず、そのためchar.addCursor()が利用できない
		this.createCursorLine();
		this.setPosMemory(this._char.index());
	}
	getChar() {
		return this._char;
	}
	setChar(newChar) {
		this._char = newChar;
		return this;
	}
	moveNext() {
		const nextChar = this._char.next();
		if (nextChar){
			nextChar.addCursor();
			this.setPosMemory(nextChar.index());
		}
		return this;
	}
	movePrev() {
		const prevChar = this._char.prev();
		if (prevChar) prevChar.addCursor();
		this.setPosMemory(prevChar.index());
		return this;
	}
	moveRight() {
		const currentChar = this.getChar();
		const index = this.getPosMemory();
		const rightChar = currentChar.row().prev().children(index);
		rightChar.addCursor();
		return this;
	}
	moveLeft() {
		const currentChar = this.getChar();
		const index = this.getPosMemory();
		console.log(this);
		console.log(currentChar);
		console.log(currentChar.row());
		console.log(currentChar.row().next());
		console.log(currentChar.row().next().children(index));
		console.log(index);
		const leftChar = currentChar.row().next().children(index);
		leftChar.addCursor();
		console.log(this.getChar());
		return this;
	}
	// cursor-pos-memoryは、カーソルの左右移動の際にカーソルが何文字目の位置から移動してきたのかを記憶する要素
	createCursorLine() {
		const eCursorLine = document.getElementById('cursor_line');
		const eOldCharPoses = eCursorLine.children;
		for (let i = 0,eOldCharPos; eOldCharPos = eOldCharPoses[0]; i++) {
			eCursorLine.removeChild(eOldCharPos);
		}
		eCursorLine.appendChild(Util.createCharPosElement(this.draft.strLen()));
		return this;
	}
	getPosMemory() {
		const eCursorLine = document.getElementById('cursor_line');
		const eCharPoses = eCursorLine.children;
		for (let i = 0,eCharPos; eCharPos = eCharPoses[i]; i++) {
			if (eCharPos.classList.contains('cursor-pos-memory'))
				return i;
		}
		return -1;
	}
	setPosMemory(index) {
		const eCursorLine = document.getElementById('cursor_line');
		const eCharPoses = eCursorLine.children;
		if (eCharPoses[this.getPosMemory()]) eCharPoses[this.getPosMemory()].classList.remove('cursor-pos-memory');
		eCharPoses[index].classList.add('cursor-pos-memory');
		return this;
	}
}
// 文書を構成する各クラスの基底クラス
class Sentence {
	constructor(elem) {
		this._elem = elem;
		this._parent = null;
		this._next = null;
		this._prev = null;
		this._children = [];
		this._width = null;
		this._height = null;
	}
	// 保持している参照
	elem() {
		return this._elem;
	}
	parent(newParent) {
		if (newParent === undefined) {
			return this._parent;
		} else {
			this._parent = newParent;;
			return this;
		}
	}
	next(newNext) {
		if (newNext === undefined) { // nullを代入することもあるのでundefinedと厳密に比較
			return this._next;
		} else {
			this._next = newNext;
			return this;
		}
	}
	prev(newPrev) {
		if (newPrev === undefined) {
			return this._prev;
		} else {
			this._prev = newPrev;
			return this;
		}
	}
	// TODO: 防御的コピーが必要かも?
	children(index) {
		if (index === undefined) {
			return this._children;
		} else {
			return this._children[index];
		}
	}
	pushChild(child) {
		this._children.push(child);
		return this;
	}
	insertChild(pos,child) {
		// 配列の範囲外の数値を渡されたらpushに切り替える
		if (pos < 0 || pos >= this._children.length) {
			return this.pushChild(child);
		}
		this._children.splice(pos,0,child);
		return this;
	}
	deleteChild(child) {
		const pos = child.index();
		this.children().splice(pos,1);
		child.parent(null);
		return this;
	}
	firstChild() {
		if (this.hasChild()) {
			return this.children()[0];
		} else {
			return null;
		}
	}
	lastChild() {
		if (this.hasChild) {
			return this.children()[this.children().length - 1];
		} else {
			return null;
		}
	}
	childLen() {
		return this._children.length;
	}
	hasChild() {
		return this.children().length > 0;
	}
	isEmpty() {
		return this.children().length === 0;
	}
	// style
	// useCache: キャッシュを使わず計算し直す場合にfalseを渡す
	height(useCache) {
		if (useCache == undefined) useCache = true;
		if (useCache && this._height) {
			return this._height;
		}
		return this._width = parseInt($(this.elem()).css('width'));
	}
	// elementが不可視状態にあれば長さが０になったり、ブラウザごとに取得手段に違いがあったり直接指定されているstyleとcssでの指定の違い、cssでの指定が'auto'になっていると文字列が返ってきたりと
	// javascriptでのcss値の取得は複雑で困難であることから、jQueryの使用が適していると判断した(不可視の要素は一時的に可視状態にしてから取得するので、レンダリングが発生する可能性は高い)
	// 読み込み時には時間がかかるが、キャッシュすることで行移動などでは最低限の計算になると期待
	width(useCache) {
		if (useCache == undefined) useCache = true;
		if (useCache && this._width) {
			return this._width;
		}
		return this._width = parseInt($(this.elem()).css('height'));
	}
	className(className) {
		return this._elem.className || ''; // クラスがひとつもなければ空文字
	}
	addClass(className) {
		this._elem.classList.add(className);
		return this;
	}
	removeClass(className) {
		this._elem.classList.remove(className);
		return this;
	}
	// 同一の親を持つ兄弟の中での０始まりのインデックス
	index() {
		const siblings = this.parent().children();
		const index = siblings.indexOf(this);
		return index;
	}
	text() {
		return this.elem().textContent;
	}

	addKeyDownEventListener() {
		console.log('addKeyDownEventListener');
		const self = this;
		document.addEventListener('keydown',function (e) {
			'use strict';
			console.log('abstract event');
			let keycode;
			if (document.all) {
				// IE
				keycode = e.keyCode
			} else {
				// IE以外
				keycode = e.which;
			}
		if (keycode === 123) { return; } // F12のみブラウザショートカットキー
			self.runKeyDown(e,keycode);
		});
	}
	runKeyDown(e,keycode) {
		return this;
	}
}
class Char extends Sentence {
		/*
		 *		文字を表すオブジェクト
		 *		{
		 *			"char":"あ",
		 *			"decolation":["decolation-color-blue"]
		 *			"fontSize": "auto"
		 *		}
		 */
	constructor(json) {
		super(json.char ? Util.createCharElement(json) : json); // jsonオブジェクトにcharプロパティがなければEOLからの呼び出しで、jsonにはエレメントが入っている
		this._isEOL = false;
		if (!json.fontSize || json.fontSize === 'auto') {
			this._fontSize = 18;
		} else {
			this._fontSize = parseInt(json.fontSize);
		}
	}
	isEOL() {
		return this._isEOL;
	}
	row(newRow) {
		return this.parent(newRow);
	}

	// 同一行内で最終文字でなければtrue、最終文字ならfalse。EOLは含まない(次の文字がEOLならfalse)
	hasNextSibling() {
		return !(this._isEOL || this.next().isEOL());
	}

	json() {
		const json = {};
		json['char'] = this.text();
		const classArray = this.className().match(/decolation-\S+/g) || [];
		json['decolation'] = classArray;
		this['fontSize'] = this._fontSize();
		return json;
	}

	fontSize(fontSize) {
		if (fontSize) {
			this._fontSize = fontSize;
			this._elem.dataset.fontSize = fontSize;
			// フォントサイズが変更されると行の幅が変わる可能性があるため、計算し直しておく
			this.row().width(false);
			return this;
		} else {
			return this._fontSize || 'auto';
		}
	}
	color(color) {
		if (color) {
			this.addDecolationClass('decolation-color-'+ color);
			return this;
		} else {
			// TODO: 現在の文字色の取得
			return this;
		}
	}
	// 文字装飾用のクラスを付与する
	addDecolationClass(className) {
		// 同一種のクラスをすでに持っていたら外す
		let kind = className.match(/(decolation-.+)-.+/);
		if (!kind) return this; // 引数が文字装飾用のクラスではない
		kind = kind[1];
		const regexp = new RegExp(kind +'-\\S+');
		const rmClass = this.className().match(regexp);
		if (rmClass) { this.removeClass(rmClass[0]); }

		if (className === 'decolation-color-black') return; // ブラックなら外して終わり
		this.addClass(className);
	}

	// trueなら表示、falseなら非表示
	display(opt_bool) {
		if (opt_bool) {
			this._elem.classList.add('display-char');
		} else {
			this._elem.classList.remove('display-char');
		}
		return this;
	}

	before(char) {
		// oldPrev - char - this
		// this.elem.before(char.elem);
		const row = this.row();
		row.elem().insertBefore(char.elem(),this._elem);
		const oldPrev = this._prev;
		if (oldPrev) this.prev().next(char);
		char.prev(this.prev());
		char.next(this);
		this.prev(char);
		char.row(row);
		// rowのcharsにcharを追加
		const pos = this.index();
		console.log(pos);
		row.insertChar(pos,char);
		return this;
	}
	after(char) {
		// this - oldNextChar - char
		if (this.isEOL()) { return this; } // todo: 例外を使用したほうがいいかも EOLからのafterはできない
		this.elem.after(char.elem());
		const oldNextChar = this.next();
		if (oldNextChar) oldNextChar.prev(char);
		char.next(oldNextChar);
		char.prev(this);
		this.next(char);
		const row = this.row();
		char.row(row);
		// rowのcharsにcharを追加
		const pos = this.index() + 1;
		row.insertChar(pos,char);
		return this;
	}
	// 自分を含めて、自分以降で同じ段落内のChar全てに処理を行う(EOLは含まない)
	afterEach(func) {
		func(this);
		for (let char = this; char.hasNextSibling(); ) {
			char = char.next();
			func(this);
		}
		return this;
	}
	// 前の行の最終行に移動する
	moveBeforeLast() {
		if (this.isEOL() || this !== this.row().firstChild()) { return this; } // 各行最初の文字でのみ有効
		this.delete();
		this.row().prev().append(this);
		return this;
	}
	delete() {
		this.row().elem().removeChild(this.elem());
		// oldPrev - this - oldNext →　oldPrev - oldNext
		const oldPrev = this.prev();
		const oldNext = this.next();
		oldPrev.next(oldNext);
		oldNext.prev(oldPrev);
		// 古い親の配列から削除
		this.row().deleteChar(this);
		return this;
	}
	cursor() {
		return this.row().paragraph().draft().cursor();
	}
	cursorChar() {
		return this.cursor().getChar();
	}
	addCursor() {
		if (this.cursorChar()) this.cursorChar().removeClass('cursor');
		this.addClass('cursor');
		this.cursor().setChar(this);
		return this;
	}
}
class EOL extends Char {
	// Rowとともに要素を作ってしまうため、要素を引数に取る必要がある。CharとEOLはis-a関係が成り立つと考え、継承を選択
	constructor(elem) {
		super(elem); // 最初にスーパークラスのコンストラクタを呼ばなければエラー
		this._isEOL = true;
	}

	// EOLは各行一文字目であるのとDom要素が先に作られるためRowのappend()が利用できない
	appended(row) {
		// EOLがappendedされるのはまだrowが文書内に組み込まれる前なので、nextとprevの操作は不要
		row.elem().appendChild(this.elem());
		this.row(row);
		return this;
	}
	index() {
		return this.row().childLen();
	}
}

class Row extends Sentence {
	constructor(json) {
		super(Util.createRowElement(json));
		this._EOL = new EOL(this._elem.lastElementChild);
		this._EOL.appended(this);
		for (let charJson of json) {
			const char = new Char(charJson);
			this.append(char);
		}
	}
	EOL() {
		return this._EOL;
	}
	chars(index) { // EOLは含まれない
		return super.children(index);
	}
	children(index) {
		if (index === undefined) {
			return super.children(index);
		} else if(index === this.childLen()) {
			return this.EOL();
		} else {
			return super.children(index);
		}
	}
	pushChar(char) {
		return this.pushChild(char);
	}
	insertChar(pos,char) {
		return this.insertChild(pos,char);
	}
	deleteChar(char) {
		return this.deleteChild(char);
	}
	paragraph(newParagraph) {
		return this.parent(newParagraph);
	}
	json() {
		const json = [];
		for (let char of this.chars()) {
			json.push(char.json());
		}
		return json;
	}
	maxFont() {
		let max = 0; // 空行では０になる
		for (let char of this.chars()) {
			max = Math.max(max,char.fontSize());
		}
		return max;
	}
	// 空行ではEOLが選択されるため、firstChar()ではなくfirstChild()
	// RowではEOLが絡むためオーバーライドする
	firstChild() {
		if (this.hasChar()) {
			return this.chars()[0];
		} else {
			return this.EOL();
		}
	}
	lastChild() {
		return this.EOL();
	}
	hasChar() {
		return this.hasChild();
	}
	prepend(char) {
		this.firstChild().before(char);
		return this;
	}
	append(char) {
		this.EOL().before(char);
		return this;
	}
	before(row) {
		// oldPrev - row - this
		// row
		this.elem().before(row.elem());
		row.paragraph(this.paragraph());
		const oldPrev = this.prev();
		if (oldPrev) oldPrev.next(row);
		row.prev(oldPrev);
		row.next(this);
		this.prev(row);
		// char
		if (oldPrev) row.firstChild().prev(oldPrev.lastChild());
		row.lastChild().next(this.firstChild());
		this.firstChild().prev(row.lastChild());
		if (oldPrev) oldPrev.lastChild().next(row.firstChild());
		// parentのrowsにrowを追加
		// const rows = this.paragraph().rows();
		// const pos = rows.indexOf(this);
		const pos = this.index();
		// rows.splice(pos,0,row);
		this.paragraph().insertRow(pos,row);
		return this;
	}
	after(row) {
		// this - row - oldNext
		// row
		this.elem().after(row.elem());
		row.paragraph(this.paragraph());
		const oldNext = this.next();
		if (oldNext) oldNext.prev(row);
		row.next(oldNext);
		row.prev(this);
		this.next(row);
		// char
		row.firstChild().prev(this.lastChild());
		if (oldNext) row.lastChild().next(oldNext.firstChild());
		this.lastChild().next(row.firstChild());
		if (oldNext) oldNext.firstChild().prev(row.lastChild());
		// parentのrowsにrowを追加
		// const rows = this.paragraph().rows();
		// const pos = rows.indexOf(this) + 1;
		const pos = this.index() + 1;
		// rows.splice(pos,0,row);
		this.paragraph().insertRow(pos,row);
		return this;
	}
	// 隣のRowの第一文字を、自らの最後に移動する
	// 持ってきた結果次の行が空になったら、その行は削除する
	bringChar() {
		this.next().firstChild().moveBeforeLast();
		if (this.next().isEmpty()) {
			this.next().delete();
		}
		return this;
	}

	// 同一段落内で最終行でなければtrue、最終行ならfalse
	hasNextSibling() {
		return this.next().paragraph() === this.paragraph();
	}
	// 自分を含めて、自分以降で同じ段落内のRow全てに処理を行う
	afterEach(func) {
		func(this);
		for (let row = this; row.hasNextSibling(); ) {
			row = row.next();
			func(this);
		}
		return this;
	}
	// 同一段落内で、自分とその以降でそれぞれ次の行から１文字持ってきて埋める
	bringChars() {
		afterEach(function (row) {
			row.bringChar();
		});
	}
	// 行を削除する
	delete() {
		this.paragraph().elem().removeChild(this.elem());
		// oldPrev - this - oldNext →　oldPrev - oldNext
		const oldPrev = this.prev();
		const oldNext = this.next();
		if (oldPrev) {
			// row
			oldPrev.next(oldNext);
			// char
			oldPrev.lastChild().next(oldNext.firstChild());
		}
		if (oldNext) {
			// row
			oldNext.prev(oldPrev);
			// char
			oldNext.firstChild().prev(oldPrev.lastChild());
		}
		this.paragraph.deleteRow(this);
		this.next(null);
		this.prev(null);
		this.firstChild().prev(null);
		this.lastChild().next(null);
		return this;
	}

	// opt_boolがtrueであれば、first文字以降でその行に収まる文字を表示し、それ以外の文字は非表示にする
	display(opt_bool,first) {
		if (!opt_bool) {
			this.elem().classList.remove('display-row');
			return this;
		}

		this.elem().classList.add('display-row');
		const dispHeight = this.height();
		let fontHeight = 0;
		let heightSum = 0;
		const addArray = [];
		for (let array of this.chars().entries()) {
			const index = array[0];
			const char = array[1];
			fontHeight = char.fontSize() + 2; // sizeの取得はDOMにアクセスせずに行っているため、ここではレンダリングは発生しない
			heightSum += fontHeight;
			char.display(index >= first && heightSum < dispHeight); // trueになれば表示、falseになれば非表示
		}
		return this;
	}
}

class Paragraph extends Sentence {
	constructor(json) {
		super(Util.createParagraphElement(json));
		const strLen = 40;
		const spArray = Util.splitArray(json[1],strLen); // json[1]が空配列なら、spArrayにも空配列が入る
		for (let charArray of spArray) {
			this.append(new Row(charArray));
		}
		// json[1]が空配列 = 空段落(空行)の場合は上記for文が実行されないので、別に空行を作成して連結する
		if (spArray.length === 0) {
			this.append(new Row([]));
		}
	}
	rows(index) {
		return this.children(index);
	}
	pushRow(row) {
		return this.pushChild(row);
	}
	insertRow(pos,row) {
		return this.insertChild(pos,row);
	}
	deleteRow(row) {
		return this.deleteChild(row);
	}
	draft(newDraft) {
		return this.parent(newDraft);
	}

	// json用の形式に変換する
	json() {
		const json = [];
		json[0] = classArray();
		const charArray = [];
		for (let row of this.rows()) {
			for (let char of row.chars()) {
				charArray.push(char.json());
			}
		}
		json[1] = charArray;
		return json;
	}
	classArray() {
		return this.elem().className.match(/decolation-\S+/g) || [];
	}
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

		// this.rows().push(row);
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
	hasRow() {
		return this.hasChild();
	}
}
	
window.Draft = class extends Sentence {
	constructor(fileId,json) {
		super(document.getElementById('vertical_draft'));
		// this._elem = document.getElementById('vertical_draft');
		// 文書情報
		this._fileId = fileId;
		this._strLen = 40; // １行の文字数
		this._rowLen = 40; // １ページの行数
		// DOMの構築
		this.emptyElem();
		for (let paraJson of json) {
			this.append(new Paragraph(paraJson));
		}

		this._cursor = new Cursor(this);
		this.addKeyDownEventListener();
	}
	paragraphs(index) {
		return this.children(index);
	}
	pushParagraph(paragraph) {
		return this.pushChild(paragraph);
	}
	insertParagraph(pos,paragraph) {
		return this.insertChild(pos,paragraph);
	}
	deleteParagraph(paragraph) {
		return this.deleteChild(paragraph);
	}
	cursor() {
		return this._cursor;
	}
	fileId() {
		return this._fileId;
	}
	strLen(newStrLen) {
		if (newStrLen === undefined) {
			return this._strLen;
		} else {
			this._strLen = newStrLen;
			return this;
		}
	}
	rowLen(newRowLen) {
		if (newRowLen === undefined) {
			return this._rowLen;
		} else {
			this._rowLen = newRowLen;
			return this;
		}
	}

	// 子を空にする
	empty() {
		this.emptyElem();
		this._paragraphs = [];
		return this;
	}
	emptyElem() {
		if (this.paragraphs()) {
			for (let paragraph of this.paragraphs()) {
				this.elem().removeChild(paragraph.elem());
			}
		}
		return this;
	}

	json() {
		const json = {};
		json.conf = {};
		const paraArr = [];
		for (let paragraph of this.paragraphs()) {
			paraArr.push(paragraph.json());
		}
		json.text = paraArr;

		return JSON.stringify(json);
	}
	// TODO: 配列が渡されたらフラグメントを使ってappendする
	append(paragraph) {
		this.elem().appendChild(paragraph.elem());
		paragraph.draft(this);
		if (!this.hasParagraph()) {
			// this.paragraphs().push(paragraph);
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

		// this.paragraphs().push(paragraph);
		this.pushParagraph(paragraph);
		return this;
	}
	hasParagraph() {
		return this.hasChild();
	}
	cursorChar() {
		return this.cursor().getChar();
	}
	resetDisplay() {
		this.addDisplay(0,0);
	}
	// firstRow行目以降を表示する。文字はfirstChar文字目以降
	addDisplay(firstRow,firstChar) {
		const dispWidth = this.width();
		const cache = {};
		let cnt = 0; // 総行数をカウントする
		let sum = 0; // 表示行の幅合計
		for (let paragraph of this.paragraphs()) {
			for (let row of paragraph.rows()) {
				if (cnt >= firstRow) {
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
				}
				row.display((sum < dispWidth),firstChar); // (sum < dispwidth)はbool値を渡している
				cnt++;
			}
		}
		return this;
	}
	// ファイル操作
	static readFile(data) { // static factory method
		console.time('readFile');
		const userId = data.user_id;
		const fileId = data.file_id;
		console.time('post()');
		Util.post('/tategaki/ReadJsonFile',data,function (json) {
			'use strict';
			console.timeEnd('post()');
			// 表示データを受け取ってからの処理
			// ファイル名を表示
			$('#file_title').val(json.filename).attr('data-file-id',fileId);
			// 文章のhtml書き出し
			const text = json.data.text;
			window.draft.emptyElem();
			console.time('new Draft');
			window.draft = new Draft(fileId,text);
			console.timeEnd('new Draft');
			console.time('display');
			window.draft.resetDisplay();
			console.timeEnd('display');
			// console.log(window.draft);
			// FIXME: page-breakなどをつけないとprintDocInfo()が使えない(addPageBreak()を同時に使わない操作で使われると計算で無限ループとなってブラウザが落ちる)
			$('.vertical-char').first().addClass('cursor')
				$('.cursor').closest('.vertical-row').addClass('cursor-row');
			$('#cursor_line > .char-pos').first().addClass('cursor-pos-memory');
			$('.doc-info > .saved').text(json.saved);
			console.timeEnd('readFile');
			console.log(window.draft);
		});
	}
	saveFile() {
	}
	static newFile(filename) {
		window.draft = new Draft(-1,[[[],[]]]); // 空段落のデータ
		return this;
	}

	runKeyDown(e,keycode) {
		console.log('runKeyDown:'+ keycode);
		switch (keycode) {
			case 37:
				// Left
				this.cursor().moveLeft();
				break;
			case 38:
				// Up
				this.cursor().movePrev();
				break;
			case 39:
				// Right
				this.cursor().moveRight();
				break;
			case 40:
				// Down
				this.cursor().moveNext();
				break;
			case 188:
				// ,
				console.log(this);
				console.log(window.draft);
				break;
			default:
				break;
		}
		return this;
	}
}

})();
