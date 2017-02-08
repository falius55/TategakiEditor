'use strict';
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
