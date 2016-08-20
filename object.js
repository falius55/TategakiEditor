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
			sendData += name + '=' + encodeURI(data[name]);
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
Util.createConvertViewElement = (function () {
	'use strict';
	const eViewTemplate = document.createElement('div');
	eViewTemplate.classList.add('convert-view');

	return function () {
		'use strict';
		const eView = eViewTemplate.cloneNode(true);
		return eView;
	}
})();

// Class
(function () {
	'use strict';
	// 段落最後のEOL以外のEOLにカーソルは止まらない(EOLは基本、文字挿入のために存在)
	class Cursor {
		constructor(sentence) {
			this._sentence = sentence;
			const firstChar = this._sentence.firstChild().firstChild().firstChild();
			this._char = firstChar;
			this._char.addClass('cursor'); // この時点ではSentenceContainerの_cursorにインスタンスが入っていないのでsentence.cursor()が使えず、そのためchar.addCursor()が利用できない
			this.createCursorLine();
			this.setPosMemory(this._char.index());
		}

		// --参照取得

		sentence() {
			return this._sentence;
		}
		getChar() {
			return this._char;
		}
		getRow() {
			return this.getChar().row();
		}
		getParagraph() {
			return this.getRow().paragraph();
		}

		// --参照操作

		setChar(newChar) {
			this._char = newChar;
			return this;
		}

		// --Status

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
			const oldPos = this.getPosMemory();
			if (index === oldPos) {
				return this;
			}
			const eCursorLine = document.getElementById('cursor_line');
			const eCharPoses = eCursorLine.children;
			if (eCharPoses[oldPos]) eCharPoses[oldPos].classList.remove('cursor-pos-memory');
			eCharPoses[index].classList.add('cursor-pos-memory');
			return this;
		}

		// --DOM操作

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

		// カーソル位置に文字を挿入する
		insert(str) {
			const cursorChar = this.getChar();
			for (let char of str) {
				const newChar = new Char(Char.createData(char));
				cursorChar.before(newChar);
			}

			cursorChar.paragraph().cordinate();
			this.getChar().setPosMemory(); // cordinate()によってカーソル文字が変わっている可能性があるため、cursorCharは使えない
			return this;
		}
		// カーソル位置でバックスペース
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
				newParagraph.cordinate();
				this.sentence().changeDisplay();
				return this;
			}

			//  段落先頭以外からのバックスペース
			//  カーソルの前の位置にある文字を削除する(行頭なら行をまたいで前の文字)
			if (!(cursorChar.isFirst() && cursorChar.row().isFirst())) {
				cursorChar.prevChar().delete();
				this.sentence().changeDisplay();
				return this;
			}
		}

		// カーソル位置で改行する
		lineBreak() {
			// 段落の分割
			const cursorParagraph = this.getParagraph().divide(this.getChar());
			// 新しくできた段落の最初の文字にカーソルを移動する
			const newParagraph = cursorParagraph.next(); // divide()で新しく挿入された段落
			newParagraph.firstChild().firstChild().addCursor().setPosMemory();
			this.sentence().changeDisplay(true);
			return this;
		}

		// --カーソル操作

		// カーソル移動
		moveNext() {
			const nextChar = this.getChar().next();
			if (!nextChar) return this;
			nextChar.slideNextCursor().addCursor().setPosMemory();
			this._sentence.changeDisplay();
			return this;
		}
		movePrev() {
			const prevChar = this.getChar().prev();
			if (!prevChar) return this;
			prevChar.slidePrevCursor().addCursor().setPosMemory();
			this._sentence.changeDisplay();
			return this;
		}
		moveRight() {
			const prevRow = this.getChar().row().prev();
			this.moveRow(prevRow);
			this.sentence().changeDisplay();
			return this;
		}
		moveLeft() {
			const nextRow = this.getChar().row().next();
			this.moveRow(nextRow);
			this.sentence().changeDisplay();
			return this;
		}
		// 引数で指定された行にカーソルを移動する
		moveRow(row) {
			const index = this.getPosMemory();
			if (!row) return this;
			const char = row.children(index); // 同じインデックスの文字がprevRowに存在しなければ、children()内でlastChild()が選択される
			char.slidePrevCursor().addCursor();
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

		// --参照取得

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
		children(index) {
			if (index === undefined) {
				return Util.copyArray(this._children);
			} else {
				return this._children[index];
			}
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
				return this._children[this.childLength()-1];
			} else {
				return null;
			}
		}

		// --判定

		// 引数が自分と同じオブジェクトならtrueを返す
		is(char) {
			return char === this;
		}
		hasClass(className) {
			return this._elem.classList.contains(className);
		}
		hasChild() {
			return this._children.length > 0;
		}
		isOnlyChild() {
			return this.parent().childLength() === 1
				&& this.parent().children(0) === this;
		}
		isEmpty() {
			return this._children.length === 0;
		}
		hasNextSibling() {
			if (this.next()) {
				return this.next().parent() === this.parent();
			} else {
				return false;
			}
		}
		hasPrevSibling() {
			if (this.prev()) {
				return this.prev().parent() === this.parent();
			} else {
				return false;
			}
		}
		// １文字目、一行目などその親の中で最初の子であればtrue
		isFirst() {
			return !this.hasPrevSibling();
		}
		// 最終文字、最終行などその親の中で最後の子であればtrue
		// Charの場合は、hasNextSibling()はEOLの前の文字とEOL自身でfalseを返すため、isLast()でもEOLの前の文字とEOLの２つでtrueを返す
		isLast() {
			return !this.hasNextSibling();
		}

		// --参照操作

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
		replaceChild(oldChild,newChild) {
			const pos = oldChild.index();
			this._children.splice(pos,1,newChild);
			return this;
		}
		emptyChild() {
			this._children = [];
			return this;
		}

		// --Status

		text() {
			return this.elem().textContent;
		}
		// 文字数
		length() {
			return this.text().length;
		}
		// 同一の親を持つ兄弟の中での０始まりのインデックス
		index() {
			const siblings = this.parent().children();
			const index = siblings.indexOf(this);
			return index;
		}
		// Rowではchildren()の意味が違うので、混同しないようchildren()をさけて直接プロパティにアクセスする
		childLength() {
			return this._children.length;
		}

		// --Style

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

		// --DOM操作関係

		emptyElem() {
			const children = this.elem().children;
			let child;
			while (child = children[0]) {
				this.elem().removeChild(child);
			}
			return this;
		}

		// --イベント

		addKeydownEventListener() {
			this._keydownArg = this.onKeydown.bind(this); // removeするときと引数を同一にするためプロパティに保持する(それぞれでbindすると異なる参照になる？)
			document.addEventListener('keydown',this._keydownArg);
			return this;
		}
		removeKeydownEventListener() {
			if (!this._keydownArg) return this;
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
			// デフォルトの動作を無効化する
			e.preventDefault();
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

		// --参照取得

		row(newRow) {
			return this.parent(newRow);
		}
		paragraph() {
			return this.row().paragraph();
		}
		cursor() {
			return this.row().paragraph().container().cursor();
		}
		cursorChar() {
			return this.cursor().getChar();
		}
		// Cursor用
		// カーソル文字として不適ならその次の文字に移動する
		slideNextCursor() {
			// 段落最後のEOL以外のEOLには止まらない
			// 段落途中のEOLならその次の文字に変更する
			if (this.isEOL() && this.row().hasNextSibling()) {
				return this.next();
			} else {
				return this;
			}
		}
		// カーソル文字として不適ならその前の文字に移動する
		slidePrevCursor() {
			// 段落最後のEOL以外のEOLには止まらない
			// 段落途中のEOLならその前の文字に変更する
			if (this.isEOL() && this.row().hasNextSibling()) {
				return this.prev();
			} else {
				return this;
			}
		}
		// EOLを含まない(段落最後であるなど関係なく、EOLは完全排除)
		nextChar() {
			if (this.next() && this.next().isEOL()) {
				return this.next().nextChar();
			} else {
				return this.next();
			}
		}
		prevChar() {
			if (this.prev() && this.prev().isEOL()) {
				return this.prev().prevChar();
			} else {
				return this.prev();
			}
		}

		// --判定

		isEOL() {
			return this._isEOL;
		}
		hasCursor() {
			return this.hasClass('cursor');
		}
		isDisplay() {
			return this.hasClass('display');
		}
		// 同一行内で最終文字でなければtrue、最終文字ならfalse。EOLは含まない(次の文字がEOLならfalse,自身がEOLの場合もfalse)
		hasNextSibling() {
			return !(this._isEOL || this.next().isEOL());
		}

		// --Status

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

		// --Style

		addCursor() {
			if (this.cursorChar()) this.cursorChar().removeClass('cursor');
			this.addClass('cursor');
			this.cursor().setChar(this);
			return this;
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

		// --DOM操作関係

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
		// 要素と参照の削除
		remove() {
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
		// 文書整形も含む削除
		delete() {
			const row = this.row();
			const paragraph = row.paragraph();
			this.remove();

			// 段落先頭以外の行で、文字を削除した結果行が空になった場合、その行を削除する
			if (!row.isFirst() && row.isEmpty()) {
				row.lastChild().hasCursor() && row.prev().EOL().addCursor().setPosMemory(); // 削除行にカーソルがあれば、その前の行のEOLにカーソルを移動する
				row.remove();
			}

			paragraph.cordinate();
			return this;
		}
		// 自分自身をnewCharと入れ替える
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
		// 前の行の最後に移動する
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
		// 次の行の最初に移動する
		moveFirstAfter() {
			if (this.isEOL() || !this.isLast()) return this; // 各行最後の文字でのみ有効
			if (this.row().isLast()) return this; // 段落はまたがない

			const oldRow = this.row();
			this.remove();
			oldRow.next().prepend(this);

			this.setPosMemory(); // カーソルが付与されている文字は変わらないが、その文字の位置が変わる可能性があるためposMemoryを付け替える
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

		// --Display関係
		// trueなら表示、falseなら非表示
		display(bDisplay) {
			if (bDisplay) {
				this._elem.classList.add('display');
			} else {
				this._elem.classList.remove('display');
			}
			return this;
		}

		// 静的メソッド
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
		static createPlainCharData(c) {
			const ret = {};
			ret['char'] = c;
			ret['decolation'] = [];
			ret['fontSize'] = 'auto';
			return ret;
		}

		// -- other

		setPosMemory() {
			const index = this.index();
			this.cursor().setPosMemory(index);
			return this;
		}

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

	class EOL extends Char {
		// Rowとともに要素を作ってしまうため、要素を引数に取る必要がある。CharとEOLはis-a関係が成り立つと考え、継承を選択
		constructor(elem) {
			super(elem); // 最初にスーパークラスのコンストラクタを呼ばなければエラー
			this._isEOL = true;
		}

		// -- Status

		index() {
			return this.row().childLength();
		}

		// --DOM操作

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
		}

		// --参照取得

		EOL() {
			return this._EOL;
		}
		container() {
			return this.paragraph().container();
		}
		paragraph(newParagraph) {
			return this.parent(newParagraph);
		}
		cursorChar() {
			return this.paragraph().container().cursor().getChar();
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

		// --判定

		hasChar() {
			return super.hasChild();
		}
		// 行内にカーソルが含まれていればtrue
		hasCursor() {
			for (let char of this.children()) {
				if (char.hasCursor()) return true;
			}
			return false;
		}
		isDisplay() {
			return this.hasClass('display');
		}
		// objが行内にあるCharおよびEOLのいずれかに一致するとtrue
		contains(obj) {
			if (obj instanceof Char) {
				for (let char of this.children()) {
					if (char.is(obj)) return true;
				}
			}
			return false;
		}

		// --参照操作

		pushChar(char) {
			return this.pushChild(char);
		}
		insertChar(pos,char) {
			return this.insertChild(pos,char);
		}
		deleteChar(char) {
			return this.deleteChild(char);
		}

		// --Status

		data() {
			const data = [];
			for (let char of this.chars()) {
				data.push(char.data());
			}
			return data;
		}
		charLen() {
			return super.childLength();
		}
		maxFont() {
			let max = 0; // 空行では０になる
			for (let char of this.chars()) {
				max = Math.max(max,char.fontSize());
			}
			return max;
		}

		// --Style

		width(useCache) {
			return super.height(useCache);
		}
		height(useCache) {
			return super.width(useCache);
		}

		// --DOM操作関係

		// 子を空にする(自身は削除しない)
		// EOLは削除しない
		emptyElem() {
			for (let char of this.chars()) {
				this.elem().removeChild(char.elem());
			}
			return this;
		}
		// emptyElem()に加え、オブジェクト参照も切り離す
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
		// 行を削除する
		// 要素と参照のみ
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
		// 文章整形を含む削除
		// カーソルが含まれていれば前の行に平行移動する
		// カーソルを動かしたくなければremove()を使う
		delete() {
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
		// 前の段落の最終行として移動する
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
		// 隣のRowの第一文字を、自らの最後に移動する
		// 段落内でのみ有効
		bringChar() {
			if (this.isLast()) return this;
			this.next().firstChild().moveLastBefore();
			return this;
		}
		bringChars(num) {
			for (let i = 0; i < num; i++) {
				this.bringChar();
			}
			return this;
		}
		// 自分の最後の文字を、次の行の最初に移動する
		takeChar() {
			if (!this.hasChar()) return this; // lastChar()でnullが取得される可能性があるため
			// 次の行がなければ新しく作る
			if (this.isLast()) {
				this.after(Row.createEmptyRow());
				this.container().changeDisplay();
			}
			this.lastChar().moveFirstAfter(); // lastChild()では毎回EOLが取得されるのでlastChar()
			return this;
		}
		takeChars(num) {
			for (let i = 0; i < num; i++) {
				this.takeChar();
			}
			return this;
		}
		// 引数の文字列から、装飾のない文字を中に追加する
		createPlainContent(str) {
			for (let c of str) {
				this.append(new Char(Char.createPlainCharData(c)));
			}
			return this;
		}

		// --文章整理

		// 空行の整理
		// 指定文字数と異なる文字数なら、指定文字数に合わせて文字数を調節する
		cordinate() {
			if (this.index > 0 && this.isEmpty()) return this.delete(); // 空段落以外での空行は削除する

			const strLen = this.container().strLenOnRow();
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

		// --Display関係

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

		// --静的メソッド

		static createEmptyRow() {
			return new Row([]);
		}

		// -- other

		// 同一段落で自分以降の行に処理を行う
		// 処理中に同一段落の行でなくなったなどしても影響しない
		afterEach(func) {
			const index = this.index();
			let cnt = 0;
			for (let row of this.paragraph().rows()) {
				if (cnt >= index) func(row);
				cnt++;
			}
			return this;
		}

		// 影響する側の書き方
		// // 自分を含めて、自分以降で同じ段落内のRow全てに処理を行う
		// afterEach(func) {
		// 	func(this);
		// 	for (let row = this; row.hasNextSibling(); ) {
		// 		row = row.next();
		// 		func(this);
		// 	}
		// 	return this;
		// }
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

		// --参照取得

		container(newContainer) {
			return this.parent(newContainer);
		}
		rows(index) {
			return this.children(index);
		}

		// --判定

		hasRow() {
			return this.hasChild();
		}
		// 内部に行が存在しないか、空行が一つだけならtrue
		// 空行は空段落にしか存在しないのが正常
		isEmpty() {
			return !this.hasChild() || this.firstChild().isEmpty();
		}
		// 段落内にカーソルが含まれていればtrue
		hasCursor() {
			for (let row of this.rows()) {
				if (row.hasCursor()) return true;
			}
			return false;
		}
		// 引数で渡されたオブジェクトが段落内にある行か文字のいずれかに一致するとtrue
		contains(obj) {
			for (let row of this.rows()) {
				if (row.is(obj)) return true;
				if (row.contains(obj)) return true;
			}
			return false;
		}

		// --参照操作

		pushRow(row) {
			return this.pushChild(row);
		}
		insertRow(pos,row) {
			return this.insertChild(pos,row);
		}
		deleteRow(row) {
			return this.deleteChild(row);
		}

		// --Status

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

		// --DOM操作関係

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
		// 要素と参照の削除
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
		// 文章整形を含む削除
		// カーソルは削除範囲直前の行に平行移動
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
		// 渡された文字以降を新しい段落に移動して、段落を２つに分ける
		// 段落先頭から:一行目の文字が丸々新しい行に移って次の段落の一行目となる。二行目以降は行ごと次の段落へ →　基準文字のあった行は空行となりもともとの段落の唯一の行となるため、あたかも空段落が基準行の前に挿入されたようになる
		// 行頭から:基準行の文字がまるまる新しい行に移って次の段落の一行目になる。基準行以降の行は行ごと新しい段落に移る。　→　基準行以降が新しい段落に移り、それ以前の行はもともとの段落に残るため、段落が２つに別れる。この時点では、もともとの段落の最後に空行が残っている状態なので、cordinate()で対応する
		// 行の途中から:基準文字以降の同じ行の文字が新しい行に移って次の段落の一行目になる。それ以降は行ごと次の段落に移る。　→　基準文字以降が新しい段落になる。この時点では一行目の文字数がおかしいので、cordinate()で調整する
		// 段落最後のEOLから: 基準文字のインデックスが同一行の他の文字より大きいため、afterEach()が一度も実行されない。次の行も存在しないのでnextRowが存在せず、nextRow.afterEach()は実行されない。ただし、新しい行はnewParagraphを作成した時点で存在している。 →　新しい段落が今いる段落の後ろに追加されるだけ
		divide(char) {
			if (!this.contains(char)) return this;
			const paragraph = char.row().paragraph();
			const newParagraph = Paragraph.createEmptyParagraph(); // 作成時点で空行が含まれている
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
			paragraph.cordinate();
			newParagraph.cordinate();
			return this;
		}

		// --文章整理

		cordinate() {
			// エラー原因まとめ
			// ここで一旦rows()の内容が保存され、そこから一つ一つrowを取り出す(rows()はコピーされた配列が返される)
			// row.cordinate()内のbringChar()によって、最終行が削除されることがある
			// 削除された最終行でも、先に保存されていたためrow.cordinate()が実行される
			// 削除行の参照は保持されているのでcordinate()はエラーが起きずに実行される
			// ただしremove()された時にparentにnullが代入されているので、内部でparagraph().container()が実行されているときにNullPointer
			for (let row of this.rows()) {
				if (!row.paragraph()) continue;
				row.cordinate();
			}
			return this;
		}

		static createEmptyParagraph() {
			const arg = [];
			arg[0] = [];
			arg[1] = [];
			return new Paragraph(arg);
		}
	}

	// classは巻き上げが起こらないため、Char・Rowの下に作る必要がある。ただし、SentenceContainer内で利用するのでSentenceContainerよりは上になければならない
	class ConvertView extends Sentence {
		// 文節番号は、ConvertViewのindex()と同じ
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

		container(newContainer) {
			return this.parent(newContainer);
		}
		rows(index) {
			return this.children(index);
		}
		// 現在選択中の行を取得する
		getSelect() {
			for (let row of this.rows()) {
				if (row.hasClass('select')) return row;
			}
			return this.lastChild(); // 選択行がなければひらがな行
		}

		// --判定
		isActive() {
			return this.hasClass('active');
		}

		// --Status

		// 文節のひらがなを文字列で返す
		hiragana() {
			return this.lastChild().text(); // 最終行は必ずひらがな
		}

		// ひらがなでの文字数
		kanaLength() {
			return this.hiragana().length;
		}
		phraseNum() {
			return this.index();
		}

		// --Style
		active() {
			for (let view of this.container().views()) {
				if (view.hasClass('active')) { view.removeClass('active'); }
			}
			this.addClass('active');
			return this;
		}
		selectLeft() {
			const index = this.getSelect().index() + 1;
			this.select(index);
			return this;
		}
		selectRight() {
			const index = this.getSelect().index() - 1;
			this.select(index);
			return this;
		}

		// --DOM操作

		// index行目を選択
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
		replace(view) {
			this.before(view);
			if (this.isActive()) view.active();
			return this.remove();
		}
		toKatakana() {
			this.container().inputBuffer().insertPhrase(this.phraseNum(),this.getKatakana());
			return this;
		}
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
	class ConvertContainer extends Sentence {
		constructor(inputBuffer) {
			super(document.getElementById('convert_container'));
			this._inputBuffer = inputBuffer;
		}

		// --参照取得

		inputBuffer() {
			return this._inputBuffer;
		}
		views(index) {
			return super.children(index);
		}
		activeView() {
			for (let view of this.views()) {
				if (view.isActive()) return view;
			}
			return null;
		}

		// --Style

		reposition() {
			const x = this.cursorX();
			const y = this.cursorY();
			this.elem().style.top = y + 'px';
			this.elem().style.left = (x - this.width()) + 'px';
			return this;
		}
		cursorX() {
			return this.inputBuffer().cursorX();
		}
		cursorY() {
			return this.inputBuffer().cursorY();
		}
		show() {
			this.elem().style.display = 'block';
			return this;
		}
		hide() {
			this.elem().style.display = 'none';
			return this;
		}

		// --DOM操作

		// 文字を挿入してviewsを破棄する
		input() {
			this.empty().hide();
			this.inputBuffer().input();
			return this;
		}
		createViews(data) {
		/*
		 * data形式
		 * [[ひらがな,[漢字１,漢字２,漢字３]],[ひらがな２,[漢字４,漢字５]],[[ひらがな３,[漢字６,漢字７]]]]
		 */
			this.empty();
			for (let phraseData of data) {
				this.append(new ConvertView(phraseData));
			}
		}
		// 初変換
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
		}
		// 文節区切りを一つ前にずらす
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
		shiftDown() {
			const activeView = this.activeView();
			const nextView = activeView.next();

			if (activeView.isLast()) return;

			// 次の文節の文字数が１文字だけなら融合して、１文節としてとして変換する
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
		backSpace() {
			const activeView = this.activeView();
			// buffer文字がひらがなにして一文字しかない
			// 文字を削除してinput終了
			if (activeView.isOnlyChild() && activeView.kanaLength() === 1) {
				this.empty();
				this.inputBuffer().pop();
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
		// 文節番号がnumのviewをdataで入れ替える
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
		empty() {
			super.emptyElem();
			super.emptyChild();
			return this;
		}

		// --イベント

		addKeydownEventListener() {
			this.inputBuffer().removeKeydownEventListener()
				.container().removeKeydownEventListener();
			super.addKeydownEventListener();
			return this;
		}
		runKeyDown(e,keycode) {
			switch (keycode) {
				case 8:
					this.backSpace();
					break;
				case 13:
					// Enter
					this.input();
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
	class InputChar extends Char {
		constructor(c,phraseNum) {
			super(Char.createData(c));
			if (phraseNum === undefined) phraseNum = -1;
			this.phraseNum(phraseNum);
		}

		// --判定
		isPhraseNum(num) {
			return num === this.phraseNum();
		}
		isSelect() {
			return this.hasClass('select-phrase');
		}

		// --Status

		phraseNum(newNum) {
			if (newNum === undefined) {
				return this._phraseNum;
			} else {
				this.elem().dataset.phraseNum = newNum;
				this._phraseNum = newNum;
				return this;
			}
		}

		// --Stylw

		select() {
			this.addClass('select-phrase');
			return this;
		}
		removeSelect() {
			this.removeClass('select-phrase');
			return this;
		}

	}

	class InputBuffer extends Row {
		constructor(container) {
			super(document.getElementById('input_buffer'));
			this._container = container;
			this._convertContainer = new ConvertContainer(this);
		}

		// --参照取得

		container() {
			return this._container;
		}
		cursor() {
			return this.container().cursor();
		}
		cursorChar() {
			return this.cursor().getChar();
		}
		convertContainer() {
			return this._convertContainer;
		}
		// 引数で指定された文節番号を持つInputCharを配列にして返す
		phrases(num) {
			const ret = [];
			for (let char of this.chars()) {
				if (char.isPhraseNum(num)) ret.push(char);
			}
			return ret;
		}
		selectPhrases() {
			const ret = [];
			for (let char of this.chars()) {
				if (char.isSelect()) ret.push(char);
			}
			return ret;
		}

		// --判定

		isDisplay() {
			return this.elem().style.display === 'block';
		}

		// --Status

		// ConvertViewsを作成した後に、各文字に文節番号をふる
		setPhraseNum() {
			let cnt = 0;
			for (let view of this.convertContainer().views()) {
				const num = view.phraseNum();
				const len = view.getSelect().length();
				for (let i = 0; i < len; i++,cnt++) {
					this.chars(cnt).phraseNum(num);
				}
			}
			return this;
		}
		selectIndex() {
			for (let char of this.chars()) {
				if (char.isSelect()) return char.phraseNum();
			}
			return -1;
		}

		// --Style

		width() {
			return super.super.width();
		}
		height() {
			return super.super.height();
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
		selectNext() {
			return this.select(this.selectIndex() + 1);
		}
		selectPrev() {
			return this.select(this.selectIndex() - 1);
		}
		// 文節番号がindexの文字を選択する
		// 引数が負になれば最後の文節を、最大の文節番号を越えれば最初の文節を選択する
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
		// bufferの最後の文字を削除する
		// 文字が全てなくなればinputを終了する
		// 戻り値は削除したInputCharオブジェクト
		pop() {
			if (!this.hasChar) return this;
			const ret = this.lastChar().remove();
			this.resize();
			if (!this.hasChar()) {
				this.hide();
				this.container().addKeydownEventListener();
			}
			return ret;
		}
		update(str) {
			this.empty();
			for (let char of str) {
				this.append(new InputChar(char));
			}
			this.show();
			return this;
		}
		// カーソル位置に文字を挿入し、後処理を行ってinput状態を終了する
		input() {
			this.cursor().insert(this.text());
			this.empty().hide();
			this.container().addKeydownEventListener();
			this.container().changeDisplay();
			return this;
		}
		toKatakanaAll() {
			this.update(this.getKatakana());
			return this;
		}
		convert() {
			this.convertContainer().convert(this.text());
			return this;
		}
		// 文節文字を入れ替える
		insertPhrase(num,str) {
			const phrases = this.phrases(num);
			if (phrases.length === 0) return this; // 指定された文節番号の文字が見つからなかった
			// 新しいInputCharをもともとあった文字の前に挿入していく
			for (let c of str) {
				const newChar = new InputChar(c,num);
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
		// 指定した文節の後ろに文節を追加する
		// 追加した文字の文節番号は負の値になる
		insertPhraseAfter(num,str) {
			const phrases = this.phrases(num);
			if (phrases.length === 0) return this; // 指定された文節番号の文字が見つからなかった
			const nextChar = phrases[phrases.length -1].next(); // 挿入用の文字。最後にはEOLがあるので、必ず存在する
			for (let c of str) {
				nextChar.before(new InputChar(c,-num));
			}
			this.resize();
			return this;
		}

		// --外からの情報取得

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
		// buffer内の文字列から、適切な幅を計算する
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
		// buffer内の文字列から、適切な高さを計算する
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
			return this.cursorChar().x();
		}
		cursorY() {
			return this.cursorChar().y();
		}

		// --イベント

		// key eventがSentenceContainerから移動するかどうかを判定して前処理を行う
		transfer(e,isShift) {
			this.push(e,isShift);
			if (this.hasChar()) {
				this.addKeydownEventListener();
				this.move();
			}
			return this;
		}
		addKeydownEventListener() {
			this.container().removeKeydownEventListener();
			this.convertContainer().removeKeydownEventListener();
			super.addKeydownEventListener();
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
				case 32:
					// space
					this.convert();
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
			if (window.container) window.container.emptyElem().removeKeydownEventListener();
			for (let paraData of data.data.text) {
				this.append(new Paragraph(paraData));
			}

			this._cursor = new Cursor(this);
			this._inputBuffer = new InputBuffer(this);
			this.resetDisplay();
			this.breakPage();
			this.addKeydownEventListener();
		}

		// --参照取得

		paragraphs(index) {
			return this.children(index);
		}
		cursor() {
			return this._cursor;
		}
		cursorChar() {
			return this.cursor().getChar();
		}
		inputBuffer() {
			return this._inputBuffer;
		}

		// --判定

		hasParagraph() {
			return this.hasChild();
		}

		// --参照操作

		pushParagraph(paragraph) {
			return this.pushChild(paragraph);
		}
		insertParagraph(pos,paragraph) {
			return this.insertChild(pos,paragraph);
		}
		deleteParagraph(paragraph) {
			return this.deleteChild(paragraph);
		}

		// --Status

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

		// --Style

		width(useCache) {
			return super.height(useCache);
		}
		height(useCache) {
			return super.width(useCache);
		}

		// --DOM操作関係

		// 子を空にする
		empty() {
			this.emptyElem();
			this.emptyChild();
			return this;
		}
		// TODO: 配列が渡されたらフラグメントを使ってappendする
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

		// --文章整理

		// 指定文字数(strLenOnRow)と異なる文字数の行があれば調整する
		cordinate() {
			for (let paragraph of this.paragraphs()) {
				paragraph.cordinate();
			}
			return this;
		}
		// 改ページ
		breakPage() {
			const pageNum = this.rowLenOnpage();
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

		// --ファイル操作

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
				// window.container.emptyElem();
				console.time('new SentenceContainer');
				window.container = new SentenceContainer(json);
				console.timeEnd('new SentenceContainer');
				$('.doc-info > .saved').text(json.saved);
				console.timeEnd('readFile');
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
			window.container = new SentenceContainer({
				fileId: -1,
				filename: filename,
				data: {
					text:[[[],[]]]
				}
			}); // 空段落のデータ
		}

		// --Display関係

		resetDisplay() {
			console.time('display');
			this.addDisplay(0,0);
			console.timeEnd('display');
		}
		changeDisplay(isForce) {
			console.time('change display');
			const cursorChar = this.cursor().getChar();
			if (isForce === undefined && cursorChar.isDisplay() && cursorChar.row().isDisplay()){
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
			for (let paragraph_i = this.childLength()-1,paragraph; paragraph =  this.paragraphs(paragraph_i); paragraph_i--) {
				for (let row_i = paragraph.childLength()-1,row; row = paragraph.rows(row_i); row_i--) {
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

		// --イベント

		addKeydownEventListener() {
			this.inputBuffer().removeKeydownEventListener()
				.convertContainer().removeKeydownEventListener();
			super.addKeydownEventListener();
			return this;
		}
		runKeyDown(e,keycode) {
			if (e.ctrlKey) return this.runControlKeyDown();

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
					break;
				default:
					this.inputBuffer().transfer(keycode,e.shiftKey);
					break;
			}
			return this;
		}
		runControlKeyDown(e,keycode) {
			switch (keycode) {
				case 72:
					// h
					this.cursor().moveLeft();
					break;
				case 74:
					// j
					this.cursor().moveNext();
					break;
				case 75:
					// k
					this.cursor().movePrev();
					break;
				case 76:
					// l
					this.cursor().moveRight();
					break;
				default:
					break;
			}
			return this;
		}
	}

})();
