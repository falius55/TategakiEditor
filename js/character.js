'use strict';
/* global AbstractHierarchy, ElemCreator, Util */

/**
 * 文字を表すクラス
 */
class Char extends AbstractHierarchy {//{{{
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
        super(data.char ? ElemCreator.createCharElement(data) : data); // dataオブジェクトにcharプロパティがなければEOLからの呼び出しで、dataにはエレメントが入っている
        if (!('fontSize' in data)) {
            this._fontSize = data.fontSize;
        }
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
        if (charRange.compareBoundaryPoints(Range.START_TO_START,range) >= 0 &&
            charRange.compareBoundaryPoints(Range.END_TO_END,range) <= 0) {
                charRange.detach();
                return true;
            }
        charRange.detach();
        return false;
    }

    // --Status

    /**
     * この文字の状態を表す規定のオブジェクトを作成します
     * @return {object} この文字の状態を表す規定のオブジェクト
     */
    data() {
        const data = {};
        data.char = this.text();
        data.decolation = this.classArray();
        data.fontSize = this.fontSize() + '';
        return data;
    }

    /**
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
     * @param {number string} [opt_fontSize] 新たに設定するフォントサイズ(数値以外では'auto'が渡せる)
     * @return {Char number string} 自身のインスタンス(引数を渡した場合)。現在のフォントサイズ(引数を省略した場合)、フォントサイズが数値で設定されていなければ文字列の'auto'
     */
    fontSize(opt_fontSize) {
        if (opt_fontSize) {
            this._fontSize = opt_fontSize;
            this._elem.dataset.fontSize = opt_fontSize;
            // フォントサイズが変更されると行の幅が変わる可能性があるため、計算し直しておく
            this.row().width(false);
            return this;
        }

        if (opt_fontSize === undefined) {
            if (this._fontSize === undefined)
                return 'auto';
            if (this._fontSize === 'auto')
                return this._fontSize;
            return parseInt(this._fontSize);
        }
    }

    /**
     * この文字に文字色を設定します。あるいは引数省略で現在の文字色を取得します
     * @param {string boolean} [opt_color] 文字列ならその色に設定する、falseを渡せば文字色を解除する
     * @return {Char string} 自身のインスタンス(引数を渡した場合)、あるいは現在の文字色(引数を省略した場合。文字色が設定されていなければ'black')
     */
    color(opt_color) {
        if (opt_color) {
            this._addColor(opt_color);
            return this;
        }
        if (opt_color === false) {
            this._removeColor();
            return this;
        }
        if (opt_color === undefined) {
            const color = this.className().match(/decolation-color-(\S+)/);
            return color ? color[1] : 'black';
        }
    }

    /**
     * この文字の太字を設定、解除します
     *     または引数省略でこの文字が太字になっているかどうかを返します
     * @param {boolean} [opt_bl] trueなら太字にする、falseなら太字を解除する
     * @return {Char boolean} 自身のインスタンス(引数を渡した場合)、あるいは太字になっているかどうかの真偽値(引数を省略した場合)
     */
    bold(opt_bl) {
        if (opt_bl === undefined)
            return this.hasClass('decolation-font-bold');

        if (opt_bl) {
            this.addClass('decolation-font-bold');
        } else {
            this.removeClass('decolation-font-bold');
        }
        return this;
    }

    /**
     * この文字の斜体を設定、解除します
     *     または引数省略でこの文字が斜体になっているかどうかを返します
     * @param {boolean} [opt_bl] trueなら斜体にする、falseなら斜体を解除する
     * @return {Char} 自身のインスタンス(引数を渡した場合)、あるいは斜体になっているかどうかの真偽値(引数を省略した場合)
     */
    italic(opt_bl) {
        if (opt_bl === undefined)
            return this.hasClass('decolation-font-italic');

        if (opt_bl) {
            this.addClass('decolation-font-italic');
        } else {
            this.removeClass('decolation-font-italic');
        }
        return this;
    }

    /**
     * 文字色を設定します
     * @param {string} color 設定する文字色
     * @return {Char} 自身のインスタンス
     */
    _addColor(color) {
        // 同一種のクラスをすでに持っていたら外す
        this.removeColor();
        if (color === 'decolation-color-black') return; // ブラックなら外して終わり
        this.addClass('decolation-color-'+ color);
        return this;
    }

    /**
     * 文字色を解除します
     * @return {Char} 自身のインスタンス
     */
    _removeColor() {
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
        if (oldPrev) {
            this.prev().next(char);
        }
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
        if (oldNextChar) {
            oldNextChar.prev(char);
        }
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
            if (row.lastChild().hasCursor()) {
                row.prev().EOL().addCursor().setPosMemory(); // 削除行にカーソルがあれば、その前の行のEOLにカーソルを移動する
            }
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
        if (oldRow.isEmpty()) {
            if (oldRow.hasCursor()) {
                this.next().addCursor(); // 削除行にカーソルが含まれていれば移動する
            }
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
            if (oldRow.EOL().hasCursor()) {
                newRow.EOL().addCursor(); // 段落最後のEOLにカーソルがあれば動かないので、移動する
            }
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
        ret.char = c;
        const menu = this.paragraph().container().menu();
        ret.decolation = menu.charDecolations();
        ret.fontSize = menu.fontSizeInput();
        return ret;
    }

    /**
     * 文字装飾のない文字の文字データを返します
     * @param {string} c 作成するオブジェクトが表す文字(１文字)
     * @return {object} 文字データを表す規定のオブジェクト
     */
    static createPlainCharData(c) {
        const ret = {};
        ret.char = c;
        ret.decolation = [];
        ret.fontSize = 'auto';
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
}//}}}


/**
 * 行の末端を表すクラス
 */
class EOL extends Char {//{{{
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
}//}}}


/**
 * 行を表すクラス
 */
class Row extends AbstractHierarchy {//{{{
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
            super(ElemCreator.createRowElement(data));
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
        }
        return super.children(opt_index) || this.EOL();
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
        for (let char of this.children())
            if (char.hasCursor()) return true;
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
        if (!(obj instanceof Char)) return false;
        for (let char of this.children())
            if (char.is(obj)) return true;
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
        for (let char of this.chars())
            data.push(char.data());
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
        for (let char of this.chars())
            max = Math.max(max, char.fontSize() === 'auto' ? 18 : char.fontSize());
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
        if (oldPrev !== null) {
            oldPrev.next(row);
        }
        row.prev(oldPrev);
        row.next(this);
        this.prev(row);
        // char
        if (oldPrev) {
            oldPrev.lastChild().next(row.firstChild());
            row.firstChild().prev(oldPrev.lastChild());
        }
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
        if (oldNext !== null) {
            oldNext.prev(row);
        }
        // char
        this.lastChild().next(row.firstChild());
        row.firstChild().prev(this.lastChild());
        if (oldNext !== null) {
            row.lastChild().next(oldNext.firstChild());
            oldNext.firstChild().prev(row.lastChild());
        }
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
        if (oldPrevRow) {
            oldPrevRow.next(oldNextRow);
        }
        if (oldNextRow) {
            oldNextRow.prev(oldPrevRow);
        }
        // char
        const oldPrevChar = oldPrevRow && oldPrevRow.lastChild();
        const oldNextChar = oldNextRow && oldNextRow.firstChild();
        if (oldPrevChar) {
            oldPrevChar.next(oldNextChar);
        }
        if (oldNextChar) {
            oldNextChar.prev(oldPrevChar);
        }

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
            if (this.hasCursor()) {
                prevParagraph.lastChild().EOL().addCursor().setPosMemory();
            }
            return this;
        }

        this.remove(); // カーソルはいじる必要なし
        prevParagraph.append(this);
        return this;
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
        for (let i = 0; i < num; i++)
            this.bringChar();
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
        for (let i = 0; i < num; i++)
            this.takeChar();
        return this;
    }

    /**
     * 引数の文字列から作成された装飾のない文字のインスタンスを自らの最後に追加します
     * @return {Row} 自身のインスタンス
     */
    createPlainContent(str) {
        for (let c of str)
            this.append(new Char(Char.createPlainCharData(c)));
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

        const confLen = this.container().strLenOnRow();
        const len = this.charLen();
        if (len < confLen)
            this.bringChars(confLen - len);

        // 多すぎる文字数は減らす
        // フォントの異なる文字が混ざっている場合、他の行と高さが異なってしまうため、その行の文字を変える必要がある
        const maxSize = confLen * 18; // 標準フォント×文字数の数値が基準
        let sum = 0;
        for (let array of this.chars().entries()) {
            const char = array[1];
            sum += char.fontSize() === 'auto' ? 18 : char.fontSize();
            if (sum > maxSize) {
                const index = array[0];
                this.takeChars(this.charLen() - index);
                return this;
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
        // カーソルが前にある
        if (cursorIndex <= currentFirst)
            return cursorIndex;
        // カーソルが後ろにある
        if ( cursorIndex > currentEnd)
            return currentFirst + (cursorIndex - currentEnd);
        return currentFirst;
    }

    /**
     * この行が何文字目から表示されているかのインデックスを返します
     * @return {number} EOL含め最初に表示された文字のインデックス。文字が全て非表示になっていれば-1
     */
    firstDisplayCharPos() {
        for (let char of this.children())
            if (char.isDisplay()) return char.index();
        return -1; // displayがひとつもない(EOLは常にdisplayなので、ここまで来たら異常)
    }

    /**
     * この行が何文字目まで表示されているかのインデックスを返します
     * @return {number} EOL含め最後に表示された文字のインデックス。文字が全て非表示になっていれば-1
     */
    lastDisplayCharPos() {
        if (!this.hasChar) return 0;
        for (let i = this.charLen()-1,char; (char = this.chars(i)); i--)
            if (char.isDisplay())
            return char.next().isEOL() ? i + 1 : i; // すべての文字がdisplayしていればEOLのインデックスを返す
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
}//}}}


/**
 * 段落を表すクラス
 */
class Paragraph extends AbstractHierarchy {//{{{
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
        super(ElemCreator.createParagraphElement(data));
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
        for (let row of this.rows())
            if (row.hasCursor()) return true;
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

        const oldAlign = this.className().match(/decolation-textalign-\S+/);
        if (oldAlign) this.removeClass(oldAlign[0]);

        if (opt_align && opt_align !== 'left')
            this.addClass('decolation-textalign-'+ opt_align);
        return this;
    }

    /**
     * 自身内部にあるすべてのCharから指定クラスを除去します
     * @return {Paragraph} 自身のインスタンス
     */
    removeClassFromAllChar(className) {
        for (let row of this.rows())
            row.removeClassFromAllChild(className);
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
        for (let row of this.rows())
            for (let char of row.chars())
            char.markSearchPhrase(str);
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
        if (oldNext) {
            oldNext.prev(paragraph);
        }
        // row
        this.lastChild().next(paragraph.firstChild());
        paragraph.firstChild().prev(this.lastChild());
        if (oldNext) {
            paragraph.lastChild().next(oldNext.firstChild());
            oldNext.firstChild().prev(paragraph.lastChild());
        }
        // char
        this.lastChild().lastChild().next(paragraph.firstChild().firstChild());
        paragraph.firstChild().firstChild().prev(this.lastChild().lastChild());
        if (oldNext) {
            paragraph.lastChild().lastChild().next(oldNext.firstChild().firstChild());
            oldNext.firstChild().firstChild().prev(paragraph.lastChild().lastChild());
        }
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
        if (oldPrevParagraph) {
            oldPrevParagraph.next(oldNextParagraph);
        }
        if (oldNextParagraph) {
            oldNextParagraph.prev(oldPrevParagraph);
        }

        // row
        // oldPrevParagraph.lastChild() - oldNextParagraph.firstChild();
        // oldPrevRow - oldNextRow
        const oldPrevRow = oldPrevParagraph && oldPrevParagraph.lastChild();
        const oldNextRow = oldNextParagraph && oldNextParagraph.firstChild();
        if (oldPrevRow) {
            oldPrevRow.next(oldNextRow);
        }
        if (oldNextRow) {
            oldNextRow.prev(oldPrevRow);
        }

        // char
        // oldPrevRow.lastChild() - oldNextRow.lastChild();
        // oldPrevChar - oldNextChar
        const oldPrevChar = oldPrevRow && oldPrevRow.lastChild();
        const oldNextChar = oldNextRow && oldNextRow.firstChild();
        if (oldPrevChar) {
            oldPrevChar.next(oldNextChar);
        }
        if (oldNextChar) {
            oldNextChar.prev(oldPrevChar);
        }

        this.container().deleteParagraph(this);
        if (this.prev(null).firstChild()) {
            if (this.firstChild().prev(null).firstChild()) {
                this.firstChild().firstChild().prev(null);
            }
        }
        if (this.next(null).lastChild()) {
            if (this.lastChild().next(null).lastChild()) {
                this.lastChild().lastChild().next(null);
            }
        }
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
        for (let row of this.rows())
            row.display(bDisplay);
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
}//}}}
