/*
 *	オブジェクト指向
 *	SentenceContainer,Paragraph,Row,Charは、親や子の参照を保持するのはもちろんのこと、木構造を無視して異なる親であっても次と前にある同種オブジェクトの参照を持つ
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
	copyArray:function (array) {
		'use strict';
		const retArray = [];
		for (let value of array) {
			retArray.push(value);
		}
		return retArray;
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
	eCharTemplate.classList.add('char');
	eCharTemplate.classList.add('display');

	return function (data) {
		const eChar = eCharTemplate.cloneNode(true);
		const char = data['char'];
		const classArr = data['decolation'];
		const fontSize = data['fontSize'];
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
	'use strict';
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

// Class
(function () {
	'use strict';
	class Cursor {
		constructor(sentence) {
			this._sentence = sentence;
			const firstChar = this._sentence.firstChild().firstChild().firstChild();
			this._char = firstChar;
			this._char.addClass('cursor'); // この時点ではSentenceContainerの_cursorにインスタンスが入っていないのでsentence.cursor()が使えず、そのためchar.addCursor()が利用できない
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
			if (!nextChar) return this;
			nextChar.addCursor().setPosMemory();
			this._sentence.changeDisplay();
			return this;
		}
		movePrev() {
			const prevChar = this._char.prev();
			if (!prevChar) return this;
			prevChar.addCursor().setPosMemory();
			this._sentence.changeDisplay();
			return this;
		}
		moveRight() {
			const currentChar = this.getChar();
			const index = this.getPosMemory();
			const prevRow = currentChar.row().prev();
			if (!prevRow) return this;
			const rightChar = prevRow.children(index); // 同じインデックスの文字がprevRowに存在しなければ、children()内でlastChild()が選択される
			rightChar.addCursor();
			this._sentence.changeDisplay();
			return this;
		}
		moveLeft() {
			const currentChar = this.getChar();
			const index = this.getPosMemory();
			const nextRow = currentChar.row().next();
			if (!nextRow) return this;
			const leftChar = nextRow.children(index);
			leftChar.addCursor();
			this._sentence.changeDisplay();
			return this;
		}
		// cursor-pos-memoryは、カーソルの左右移動の際にカーソルが何文字目の位置から移動してきたのかを記憶する要素
		createCursorLine() {
			const eCursorLine = document.getElementById('cursor_line');
			const eOldCharPoses = eCursorLine.children;
			for (let i = 0,eOldCharPos; eOldCharPos = eOldCharPoses[0]; i++) {
				eCursorLine.removeChild(eOldCharPos);
			}
			eCursorLine.appendChild(Util.createCharPosElement(this._sentence.strLenOnRow()));
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
			console.log('set memory');
			const oldPos = this.getPosMemory();
			if (index === oldPos) {
			console.log('not set memory');
				return this;
			}
			const eCursorLine = document.getElementById('cursor_line');
			const eCharPoses = eCursorLine.children;
			if (eCharPoses[oldPos]) eCharPoses[oldPos].classList.remove('cursor-pos-memory');
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
		// ステータス関係
		// 同一の親を持つ兄弟の中での０始まりのインデックス
		index() {
			const siblings = this.parent().children();
			const index = siblings.indexOf(this);
			return index;
		}
		text() {
			return this.elem().textContent;
		}
		// Rowではchildren()の意味が違うので、混同しないようchildren()をさけて直接プロパティにアクセスする
		childLen() {
			return this._children.length;
		}
		// style
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
		hasClass(className) {
			return this._elem.classList.contains(className);
		}
		// elementが不可視状態にあれば長さが０になったり、ブラウザごとに取得手段に違いがあったり直接指定されているstyleとcssでの指定の違い、cssでの指定が'auto'になっていると文字列が返ってきたりと
		// javascriptでのcss値の取得は複雑で困難であることから、jQueryの使用が適していると判断した(不可視の要素は一時的に可視状態にしてから取得するので、レンダリングが発生する可能性は高い)
		// 読み込み時には時間がかかるが、キャッシュすることで行移動などでは最低限の計算になると期待
		// useCache: キャッシュを使わず計算し直す場合にfalseを渡す
		height(useCache) {
			if (useCache == undefined) useCache = true;
			if (useCache && this._height) {
				return this._height;
			}
			return this._height = parseInt($(this.elem()).css('height'));
		}
		width(useCache) {
			if (useCache == undefined) useCache = true;
			if (useCache && this._width) {
				return this._width;
			}
			return this._width = parseInt($(this.elem()).css('width'));
		}
		// 要素左上のX座標
		x() {
			return this.elem().getBoundingClientRect().left + window.pageXOffset;
		}
		// 要素左上のY座標
		y() {
			return this.elem().getBoundingClientRect().top + window.pageYOffset;
		}

		// DOM参照関係
		elem() {
			return this._elem;
		}
		parent(newParent) {
			if (newParent === undefined) { // nullが渡されることもあるのでundefinedと厳密に比較
				return this._parent;
			} else {
				this._parent = newParent;;
				return this;
			}
		}
		next(newNext) {
			if (newNext === undefined) {
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
		hasChild() {
			return this._children.length > 0;
		}
		isEmpty() {
			return this._children.length === 0;
		}
		children(index) {
			if (index === undefined) {
				return Util.copyArray(this._children);
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
			this._children.splice(pos,1);
			child.parent(null);
			return this;
		}
		firstChild() {
			if (this.hasChild()) {
				return this._children[0];
			} else {
				return null;
			}
		}
		lastChild() {
			if (this.hasChild) {
				return this._children[this.childLen()-1];
			} else {
				return null;
			}
		}
		replaceChild(oldChild,newChild) {
			const pos = oldChild.index();
			this._children.splice(pos,1,newChild);
			return this;
		}
		emptyChild() {
			this._children = [];
			return this;
		}
		// DOM操作関係
		emptyElem() {
			const children = this.elem().children;
			let child;
			while (child = children[0]) {
				this.elem().removeChild(child);
			}
			return this;
		}

		addKeydownEventListener() {
			this._keydownArg = this.onKeydown.bind(this); // removeするときと引数を同一にするためプロパティに保持する(それぞれでbindすると異なる参照になる？)
			document.addEventListener('keydown',this._keydownArg);
			return this;
		}
		removeKeydownEventListener() {
			if (!this._keydownArg) return;
			document.removeEventListener('keydown',this._keydownArg);
			this._keydownArg = null;
			return this;
		}
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
			this.runKeyDown(e,keycode);
		}
		runKeyDown(e,keycode) {
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
		constructor(data) {
			super(data.char ? Util.createCharElement(data) : data); // dataオブジェクトにcharプロパティがなければEOLからの呼び出しで、dataにはエレメントが入っている
			this._isEOL = false;
			if (!data.fontSize || data.fontSize === 'auto') {
				this._fontSize = 18;
			} else {
				this._fontSize = parseInt(data.fontSize);
			}
		}
		// ステータス関係
		data() {
			const data = {};
			data['char'] = this.text();
			data['decolation'] = this.classArray();
			this['fontSize'] = this.fontSize();
			return data;
		}
		classArray() {
			return this.className().match(/decolation-\S+/g) || [];
		}
		// 同一行内で最終文字でなければtrue、最終文字ならfalse。EOLは含まない(次の文字がEOLならfalse)
		hasNextSibling() {
			return !(this._isEOL || this.next().isEOL());
		}

		isCursor() {
			return this.hasClass('cursor');
		}

		// フォント関係
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

		// Display関係
		// trueなら表示、falseなら非表示
		display(bDisplay) {
			if (bDisplay) {
				this._elem.classList.add('display');
			} else {
				this._elem.classList.remove('display');
			}
			return this;
		}
		isDisplay() {
			return this.hasClass('display');
		}

		// DOM参照関係
		isEOL() {
			return this._isEOL;
		}
		row(newRow) {
			return this.parent(newRow);
		}
		cursor() {
			return this.row().paragraph().sentence().cursor();
		}
		cursorChar() {
			return this.cursor().getChar();
		}

		// DOM操作関係
		addCursor() {
			if (this.cursorChar()) this.cursorChar().removeClass('cursor');
			this.addClass('cursor');
			this.cursor().setChar(this);
			return this;
		}
		setPosMemory() {
			console.log('char set memory');
			const index = this.index();
			this.cursor().setPosMemory(index);
			return this;
		}
		before(char) {
			// oldPrev - char - this
			// this.elem.before(char.elem); // before(),after()はまだサポートされず
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
			row.insertChar(pos,char);
			return this;
		}
		after(char) {
			// this - char - oldNextChar
			if (this.isEOL()) { return this; } // todo: 例外を使用したほうがいいかも EOLからのafterはできない
			// this.elem.after(char.elem());
			// this.row().elem().insertAfter(char.elem(),this.elem()); // javascriptにinsertAfter()という関数は存在しない
			if (this.next() && this.next().row() === this.row()) {
				this.row().elem().insertBefore(char.elem(),this.next().elem());
			} else {
				this.row().elem().appendChild(char.elem());
			}
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
		remove() {
			this.row().elem().removeChild(this.elem());
			// oldPrev - this - oldNext →　oldPrev - oldNext
			const oldPrev = this.prev();
			const oldNext = this.next();
			if (oldPrev) oldPrev.next(oldNext);
			if (oldNext) oldNext.prev(oldPrev);
			// 古い親の配列から削除
			this.row().deleteChar(this);
			return this;
		}
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
		// 前の行の最終行に移動する
		moveLastBefore() {
			if (this.isEOL() || this !== this.row().firstChild()) { return this; } // 各行最初の文字でのみ有効
			// 自分の次がEOLでなおかつカーソルがあれば動いてくれないので、記憶してカーソルを付けなおす(そうしなければbringChar()でカーソルごと行が削除される)
			let isCursor = false;
			if (this.next().isCursor()) isCursor = true;

			const oldRow = this.row();
			this.remove();
			oldRow.prev().append(this);
			if (isCursor) this.next().addCursor().setPosMemory();
			this.setPosMemory();
			return this;
		}
		// 次の行の最初に移動する
		moveFirstAfter() {
			if (this.isEOL() || this !== this.row().lastChar()) return this; // 各行最後の文字でのみ有効
			// 自分の次がEOLでなおかつカーソルがあれば動いてくれないので、記憶してカーソルを付けなおす(そうしなければ元々自分の後ろにあったカーソルが自分の前に来てしまう)
			let isCursor = false;
			if (this.next().isCursor()) isCursor = true;

			const oldRow = this.row();
			this.remove();
			oldRow.next().prepend(this);
			if (isCursor) this.next().addCursor();
			this.setPosMemory();
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

		static createData(c) {
			const ret = {};
			ret["char"] = c;
			ret["decolation"] = Char.activeDecolation();
			ret["fontSize"] = Char.currentFontSize();
			return ret;
		}
		static activeDecolation() {
			const ret = [];
			return ret;
		}
		static currentFontSize() {
			const ret = 'auto';
			return ret;
		}
	}
	class EOL extends Char {
		// Rowとともに要素を作ってしまうため、要素を引数に取る必要がある。CharとEOLはis-a関係が成り立つと考え、継承を選択
		constructor(elem) {
			super(elem); // 最初にスーパークラスのコンストラクタを呼ばなければエラー
			this._isEOL = true;
		}

		index() {
			return this.row().childLen();
		}

		// EOLは各行一文字目であるのとDom要素が先に作られるためRowのappend()が利用できない
		appended(row) {
			// EOLがappendedされるのはまだrowが文書内に組み込まれる前なので、nextとprevの操作は不要
			row.elem().appendChild(this.elem());
			this.row(row);
			return this;
		}
	}

	class Row extends Sentence {
		constructor(data) {
			// 配列が渡されたら新しく要素を作り、そうでなければ要素が渡されたとしてそれを元にインスタンスを作る
			if (Array.isArray(data)) {
				super(Util.createRowElement(data));
			} else {
				// InputBufferの場合
				console.log('input super()');
				super(data);
				data = [];
			}
			this._EOL = new EOL(this._elem.lastElementChild);
			this._EOL.appended(this);
			if (!Array.isArray(data)) return;
			for (let charData of data) {
				console.log('new char');
				const char = new Char(charData);
				this.append(char);
			}
		}
		// ステータス関係
		data() {
			const data = [];
			for (let char of this.chars()) {
				data.push(char.data());
			}
			return data;
		}
		maxFont() {
			let max = 0; // 空行では０になる
			for (let char of this.chars()) {
				max = Math.max(max,char.fontSize());
			}
			return max;
		}
		width(useCache) {
			return super.height(useCache);
		}
		height(useCache) {
			return super.width(useCache);
		}
		charLen() {
			return super.childLen();
		}
		// Display関係
		// displayがtrueであれば、first文字以降でその行に収まる文字を表示し、それ以外の文字は非表示にする
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
				heightSum += fontHeight;
				char.display(index >= first && heightSum < dispHeight); // trueになれば表示、falseになれば非表示
			}
			return this;
		}
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
		firstDisplayCharPos() {
			for (let char of this.children()) {
				if (char.isDisplay()) return char.index();
			}
			return -1; // displayがひとつもない(EOLは常にdisplayなので、ここまで来たら異常)
		}
		lastDisplayCharPos() {
			if (!this.hasChar) return -1;
			for (let i = this.charLen()-1,char; char = this.chars(i); i--) {
				if (char.isDisplay()) return char.next().isEOL() ? i + 1 : i; // すべての文字がdisplayしていればEOLのインデックスを返す
			}
			return -1;
		}
		isDisplay() {
			return this.hasClass('display');
		}

		// DOM参照関係
		EOL() {
			return this._EOL;
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
		lastChar() {
			return super.lastChild();
		}
		cursorChar() {
			return this.paragraph().sentence().cursor().getChar();
		}
		hasChar() {
			return super.hasChild();
		}
		// 同一段落内で最終行でなければtrue、最終行ならfalse
		hasNextSibling() {
			if (!this.next()) return false;
			return this.next().paragraph() === this.paragraph();
		}
		chars(index) { // EOLは含まれない
			return super.children(index);
		}
		// 範囲外のインデックスならEOLが返る
		children(index) { // EOLを含む
			if (index === undefined) {
				const ret = super.children(); // push()の戻り値はlenghtプロパティの値なので、一旦変数に入れる必要あり
				ret.push(this.EOL());
				return ret;
			} else {
				return super.children(index) || this.EOL();
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
		sentence() {
			return this.paragraph().sentence();
		}

		// DOM操作関係
		// 子を空にする(自身は削除しない)
		emptyElem() {
			for (let char of this.chars()) {
				this.elem().removeChild(char.elem());
			}
			return this;
		}
		empty() {
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
			// this.elem().before(row.elem());
			this.paragraph().elem().insertBefore(row.elem(),this.elem());
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
			const pos = this.index();
			this.paragraph().insertRow(pos,row);
			return this;
		}
		after(row) {
			// this - row - oldNext
			// row
			// this.elem().after(row.elem());
			// this.paragraph().elem().insertAfter(row.elem(),this.elem());
			if (this.next() && this.next().paragraph() === this.paragraph()) {
				this.paragraph().elem().insertBefore(row.elem(),this.next().elem());
			} else {
				this.paragraph().elem().appendChild(row.elem());
			}
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
			const pos = this.index() + 1;
			this.paragraph().insertRow(pos,row);
			return this;
		}
		// 行を削除する
		remove() {
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
		static createEmptyRow() {
			return new Row([]);
		}
		// 隣のRowの第一文字を、自らの最後に移動する
		// 持ってきた結果次の行が空になったら、その行は削除する
		bringChar() {
			if (!this.hasNextSibling()) return this;
			this.next().firstChild().moveLastBefore();
			if (this.next().isEmpty()) {
				this.next().remove();
			}
			return this;
		}
		bringChars(num) {
			for (let i = 0; i < num; i++) {
				this.bringChar();
			}
		}
		// 自分の最後の文字を、次の行の最初に移動する
		takeChar() {
			console.log(this);
			// 次の行がなければ新しく作る
			if (!this.hasNextSibling()) {
				this.after(Row.createEmptyRow());
				this.sentence().changeDisplay();
			}
			console.log('last char');
			console.log(this.lastChar());
			this.lastChar().moveFirstAfter();
			return this;
		}
		takeChars(num) {
			for (let i = 0; i < num; i++) {
				this.takeChar();
			}
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

		// 指定文字数と異なる文字数なら、指定文字数に合わせる
		cordinate() {
			const strLen = this.sentence().strLenOnRow();
			const len = this.charLen();
			if (len === strLen) return;
			if (len < strLen) {
				this.bringChars(strLen - len);
			}
			if (len > strLen) {
				this.takeChars(len - strLen);
			}
			return this;
		}
	}

	class Paragraph extends Sentence {
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
		// ステータス関係
		// data用の形式に変換する
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
		classArray() {
			return this.elem().className.match(/decolation-\S+/g) || [];
		}
		// Display関係
		// DOM参照関係
		rows(index) {
			return this.children(index);
		}
		hasRow() {
			return this.hasChild();
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
		sentence(newSentence) {
			return this.parent(newSentence);
		}

		// DOM操作関係
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

		cordinate() {
			for (let row of this.rows()) {
				row.cordinate();
			}
			return this;
		}
	}

	// classは巻き上げが起こらないため、Char・Rowの下に作る必要がある。ただし、SentenceContainer内で利用するのでSentenceContainerよりは上になければならない
	class InputChar extends Char {
		constructor(c,phraseNum) {
			super(Char.createData(c));
			if (phraseNum === undefined) phraseNum = -1;
			this.phraseNum(phraseNum);
		}
		phraseNum(newNum) {
			if (newNum === undefined) {
				return this._phraseNum;
			} else {
				this.elem().dataset.phraseNum = newNum;
				this._phraseNum = newNum;
				return this;
			}
		}
		static createPlainCharData(c) {
			const ret = {};
			ret['char'] = c;
			ret['decolation'] = [];
			ret['fontSize'] = 'auto';
			return ret;
		}
	}
	class InputBuffer extends Row {
		constructor(container) {
			super(document.getElementById('input_buffer'));
			this._container = container;
		}
		// key eventがSentenceContainerから移動するかどうかを判定して前処理を行う
		transfer(e,isShift) {
			this.push(e,isShift);
			if (this.hasChar()) {
				this.addKeydownEventListener();
				this.move();
			}
			return this;
		}
		container() {
			return this._container;
		}
		cursor() {
			return this.container().cursor();
		}
		cursorChar() {
			return this.cursor().getChar();
		}
		width() {
			return super.super.width();
		}
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
		height() {
			return super.super.height();
		}
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
		cursorX() {
			console.log(this.cursorChar());
			return this.cursorChar().x();
		}
		cursorY() {
			return this.cursorChar().y();
		}
		isDisplay() {
			return this.elem().style.display === 'block';
		}

		resize() {
			const style = this.elem().style;
			style.width = this.newWidth() + 'px';
			style.height = this.newHeight() + 'px';
			return this;
		}
		move() {
			this.elem().style.left = this.cursorX() + 'px';
			this.elem().style.top = this.cursorY() + 'px';
			return this;
		}
		show() {
			this.elem().style.display = 'block';
			return this;
		}
		hide() {
			this.elem().style.display = 'none';
			return this;
		}
		push(keycode,isShift) {
			const newInputStr = this.newString(keycode,isShift);

			if (newInputStr === undefined || newInputStr.indexOf('undefined') !== -1) {
				// 未定義文字(alt,ctrl,tabなど)はreturn
				return this;
			}
			this.update(newInputStr);
			this.resize();
			return this;
		}
		pop() {
			if (!this.hasChar) return this;
			console.log('pop()');
			console.log(this.lastChar());
			this.lastChar().remove();
			this.resize();
			if (!this.hasChar()) {
				this.hide();
				this.removeKeydownEventListener();
			}
			return this;
		}
		update(str) {
			this.empty();
			for (let char of str) {
				this.append(new InputChar(char));
			}
			this.show();
			return this;
		}
		newString(keycode,isShift) {
			const inputStr = this.text(); //もともとの文字列
			if (isShift) {
				return inputStr + key_table.shift_key[keycode];
			} else {
				return key_table.getString(inputStr,keycode); //keycodeを加えた新しい文字列
			}
		}
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
		// カーソル位置に文字を挿入し、後処理を行ってinput状態を終了する
		input() {
			InputBuffer.insert(this.text(),this.cursor());
			this.hide();
			this.empty();
			this.removeKeydownEventListener();
			this.container().changeDisplay();
			return this;
		}
		// カーソル位置に文字を挿入する
		static insert(str,cursor) {
			const cursorChar = cursor.getChar();
			for (let char of str) {
				const newChar = new Char(Char.createData(char));
				cursorChar.before(newChar);
			}

			cursorChar.row().paragraph().cordinate();
			cursor.getChar().setPosMemory(); // cordinate()によってカーソル文字が変わっている可能性があるため、cursorCharは使えない
			return this;
		}
		toKatakanaAll() {
			this.update(this.getKatakana());
			return this;
		}

		addKeydownEventListener() {
			this.container().removeKeydownEventListener();
			super.addKeydownEventListener();
			return this;
		}
		removeKeydownEventListener() {
			super.removeKeydownEventListener();
			this.container().addKeydownEventListener();
			return this;
		}
		runKeyDown(e,keycode) {
			switch (keycode) {
				case 8:
					// backspace
					this.pop();
					break;
				case 13:
					// enter
					this.input();
					break;
				case 118:
					// F7
					this.toKatakanaAll();
					break;
				default:
					this.push(keycode,e.shiftKey);
					break;
			}
		}
	}

	window.SentenceContainer = class extends Sentence {
		constructor(data) {
			super(document.getElementById('sentence_container'));
			// 文書情報
			this._userId = data.userId;
			this._filename = data.filename;
			this._fileId = data.fileId;
			this._strLenOnRow = 40; // １行の文字数
			this._rowLenOnPage = 40; // １ページの行数
			// DOMの構築
			if (window.sentence) window.sentence.emptyElem().removeKeydownEventListener();
			for (let paraData of data.data.text) {
				this.append(new Paragraph(paraData));
			}

			this._cursor = new Cursor(this);
			this.resetDisplay();
			this.breakPage();
			this.addKeydownEventListener();
			this._inputBuffer = new InputBuffer(this);
		}

		// ステータス関係
		data() {
			const data = {};
			data.conf = {};
			const paraArr = [];
			for (let paragraph of this.paragraphs()) {
				paraArr.push(paragraph.data());
			}
			data.text = paraArr;

			return JSON.stringify(data);
		}
		owner() {
			return this._userId;
		}
		filename() {
			return this._filename;
		}
		fileId() {
			return this._fileId;
		}
		strLenOnRow(newStrLen) {
			if (newStrLen === undefined) {
				return this._strLenOnRow;
			} else {
				this._strLenOnRow = newStrLen;
				return this;
			}
		}
		rowLenOnpage(newRowLen) {
			if (newRowLen === undefined) {
				return this._rowLenOnPage;
			} else {
				this._rowLenOnPage = newRowLen;
				return this;
			}
		}
		// 全行数
		rowLenAll() {
			let cnt = 0;
			for (let paragraph of this.paragraphs()) {
				for (let row of paragraph.rows()) {
					cnt++;
				}
			}
			return cnt;
		}
		width(useCache) {
			return super.height(useCache);
		}
		height(useCache) {
			return super.width(useCache);
		}

		// Display関係
		resetDisplay() {
			console.time('display');
			this.addDisplay(0,0);
			console.timeEnd('display');
		}
		changeDisplay() {
			console.time('change display');
			const cursorChar = this.cursor().getChar();
			if (cursorChar.isDisplay() && cursorChar.row().isDisplay()){
				console.timeEnd('change display');
				return;
			}
			const rowPos = this.computeDisplayRowPos();
			const charPos = cursorChar.row().computeDisplayCharPos();
			this.addDisplay(rowPos,charPos);
			console.timeEnd('change display');
			return this;
		}
		// firstRow行目以降を表示する。文字はfirstChar文字目以降
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
					row.display((sum < dispWidth),firstChar); // (sum < dispwidth)はbool値を渡している
					cnt++;
				}
			}
			return this;
		}
		computeDisplayRowPos(opt_bool) {
			const currentFirst = this.firstDisplayRowPos();
			const cursorIndex = this.cursorRowPos();
			const currentEnd = this.lastDisplayRowPos();

			// opt_boolがtrueなら、カーソル位置を中央にする
			// HACK:計算前のdisplayの数を基準にするので、フォントの大きさなどによってずれもありうる
			if (opt_bool) {
				const harfRange = (currentEnd - currentFirst)/2;
				const ret = cursorIndex - harfRange;
				return ret >= 0 ? ret : 0;
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
		lastDisplayRowPos() {
			let finded = false;
			let cnt = this.rowLenAll() -1;
			for (let paragraph_i = this.childLen()-1,paragraph; paragraph =  this.paragraphs(paragraph_i); paragraph_i--) {
				for (let row_i = paragraph.childLen()-1,row; row = paragraph.rows(row_i); row_i--) {
					if (row.isDisplay()) return cnt;
					cnt--;
				}
			}
			return -1;
		}
		cursorRowPos() {
			const cursorRow = this.cursor().getChar().row();
			let cnt = 0;
			for (let paragraph of this.paragraphs()) {
				for (let row of paragraph.rows()) {
					if (row === cursorRow)
						return cnt;
					cnt++;
				}
			}
			return -1;
		}

		// DOM参照関係
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
		hasParagraph() {
			return this.hasChild();
		}
		cursorChar() {
			return this.cursor().getChar();
		}
		inputBuffer() {
			return this._inputBuffer;
		}

		//DOM操作関係
		// 子を空にする
		empty() {
			this.emptyElem();
			this.emptyChild();
			return this;
		}
		// TODO: 配列が渡されたらフラグメントを使ってappendする
		append(paragraph) {
			this.elem().appendChild(paragraph.elem());
			paragraph.sentence(this);
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

		// 文書チェック
		// 改ページ
		breakPage() {
			const pageNum = this.rowLenOnpage();
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
			let cnt2 = 0;
			const lastRow = this.rowLenAll() -1;
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
		// 指定文字数(strLenOnRow)と異なる文字数の行があれば調整する
		cordinate() {
			for (let paragraph of this.paragraphs()) {
				paragraph.cordinate();
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
				// window.sentence.emptyElem();
				console.time('new SentenceContainer');
				window.sentence = new SentenceContainer(json);
				console.timeEnd('new SentenceContainer');
				$('.doc-info > .saved').text(json.saved);
				console.timeEnd('readFile');
				console.log(window.sentence);
			});
		}
		saveFile() {
			const nowDate_ms = Date.now();
			Util.post('/tategaki/WiteJsonFile',{
				user_id: this.owner(),
				file_id: this.fileId(),
				filename: this.filename(),
				json: this.data(),
				saved: nowDate_ms
			},function (json) {
				'use strict';

			});
		}
		static newFile(filename) {
			window.sentence = new SentenceContainer({
				fileId: -1,
				filename: filename,
				data: {
					text:[[[],[]]]
				}
			}); // 空段落のデータ
		}

		// イベントリスナー関係
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
					console.log(this.data());
					break;
				default:
					this.inputBuffer().transfer(keycode,e.shiftKey);
					break;
			}
			return this;
		}
	}

})();
