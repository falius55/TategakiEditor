'use strict';
/* global AbstractHierarchy, Char, Row, KeyTable, ElemCreator, Util */
// classは巻き上げが起こらないため、Char・Rowの下に作る必要がある。ただし、SentenceContainer内で利用するのでSentenceContainerよりは上になければならない
/**
 * 入力文字を表すクラス
 */
class InputChar extends Char {//{{{
    // constructor {{{
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
    }//}}}

    // --判定 {{{

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
    }//}}}

    // --Status {{{

    /**
     * この文字の文節番号をopt_newNumに設定する、あるいは引数省略で現在の文節番号を取得します
     * @param {number} [opt_newNum] 新たに設定する文節番号(０始まり)
     * @return {InputChar number} 自身のインスタンス(引数を渡した場合)、あるいは現在の文節のインデックス(引数を省略した場合)
     */
    phraseNum(opt_newNum) {
        if (opt_newNum === undefined) {
            return this._phraseNum;
        }
        this.elem().dataset.phraseNum = opt_newNum;
        this._phraseNum = opt_newNum;
        return this;
    }//}}}

    // --Style {{{

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
    }//}}}
}//}}}

/**
 * 入力された文字をいったん保持するバッファーを表すクラス。
 *     内部の子にInputCharのインスタンス群を持ちます。
 *     また、一度も漢字変換がされず文節番号がすべて-1の場合と、漢字変換が行われ文節が分けられている場合と２つの状態がある
 */
class InputBuffer extends Row {//{{{
    // constructor {{{
    /**
     * @param {SentenceContainer} container 自身の属する文章コンテナのインスタンス
     */
    constructor(container) {
        super(document.getElementById('input_buffer'));
        this._container = container;
        this._convertContainer = new ConvertContainer(this);
    }//}}}

    // --参照取得 {{{

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
        for (let char of this.chars())
            if (char.isPhraseNum(num))
            ret.push(char);
        return ret;
    }

    /**
     * 選択中の文節の入力文字インスタンスを返します
     * @return {InputChar[]} 選択中の入力文字インスタンスの配列。選択されていなければ空の配列
     */
    selectPhrases() {
        const ret = [];
        for (let char of this.chars())
            if (char.isSelect())
            ret.push(char);
        return ret;
    }//}}}

    // --判定 {{{

    /**
     * 自身が可視化されている(文字入力中)かどうかを返します
     * @return {boolean} 自身が可視化されていればtrue、そうでなければfalse
     */
    isDisplay() {
        return this.elem().style.display === 'block';
    }//}}}

    // --Status {{{

    /**
     * 各入力文字に文節番号をふります。変換候補一覧群を作成した後で使用してください
     * @return {InputBuffer} 自身のインスタンス
     */
    setPhraseNum() {
        let cnt = 0;
        for (let view of this.convertContainer().views()) {
            const num = view.phraseNum();
            const len = view.getSelect().length(); // 選択行がなければひらがなを使って計算
            for (let i = 0; i < len; i++, cnt++)
                this.chars(cnt).phraseNum(num);
        }
        return this;
    }

    /**
     * 選択されている文節のインデックスを返します
     * @return {number} 選択文節のインデックス。選択されていなければ-1
     */
    selectIndex() {
        for (let char of this.chars())
            if (char.isSelect())
            return char.phraseNum();
        return -1;
    }//}}}

    // --Style {{{

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
    }//}}}

    // 選択 {{{

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
    }//}}}

    // --文字操作 {{{

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
        this.cursor().insert(this.text(), true);
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
     * @see ../WEB-INF/classes/doc/JapaneseConvertServlet.html
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
    insertPhrase(num, str) {
        const phrases = this.phrases(num);
        if (phrases.length === 0) return this; // 指定された文節番号の文字が見つからなかった
        // 新しいInputCharをもともとあった文字の前に挿入していく
        for (let c of str) {
            const newChar = new InputChar(this.cursorChar().createData(c),num);
            phrases[0].before(newChar);
            if (phrases[0].isSelect()) newChar.select(); // 選択中の文節なら入替え文字も選択
        }
        // 古い文字を削除
        for (let old of phrases)
            old.remove();
        this.resize();
        return this;
    }

    /**
     * インデックスがnumである文節の後ろにstrを追加します。追加した文字の文節番号は負の値になります
     * @param {number} num 挿入位置の指定
     * @param {string} str 挿入する文字列
     * @return {InputBuffer} 自身のインスタンス
     */
    insertPhraseAfter(num, str) {
        const phrases = this.phrases(num);
        if (phrases.length === 0) return this; // 指定された文節番号の文字が見つからなかった
        const nextChar = phrases[phrases.length -1].next(); // 挿入用の文字。最後にはEOLがあるので、必ず存在する
        for (let c of str)
            nextChar.before(new InputChar(this.cursorChar().createData(c),-num));
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
            return inputStr + KeyTable.shiftKey[keycode];
        } else {
            return KeyTable.makeString(inputStr,keycode); //keycodeを加えた新しい文字列
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
            const cKatakana = KeyTable.katakana[char];
            if (cKatakana)
                rtnKatakana += cKatakana;
            else
                rtnKatakana += char; // 変換できなければ元の文字をそのまま連結
        }
        return rtnKatakana;
    }//}}}

    // --イベント {{{

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
    }//}}}
}//}}}

/**
 * 漢字変換ビューを表すクラス。
 *     それぞれ一つの文節を担当し、複数の漢字変換候補を持ちます。
 *     また、内部には変換候補としてRowクラスのインスタンスを持ちます
 */
class ConvertView extends AbstractHierarchy {//{{{
    // 文節番号は、ConvertViewのindex()と同じ

    // constructor {{{
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
        super(ElemCreator.createConvertViewElement());
        data[1].push(data[0]); // 末尾に明確にひらがなを入れる
        for (let str of data[1]) {
            const row = Row.createEmptyRow();
            row.createPlainContent(str);
            this.append(row);
        }
        this.removeClass('paragraph');
        this.addClass('convert-view');
    }//}}}

    // --参照取得 {{{

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
        for (let row of this.rows())
            if (row.hasClass('select')) return row;
        return this.lastChild(); // 選択行がなければひらがな行
    }//}}}

    // --判定 {{{

    /**
     * この候補一覧が可視化されているかどうかを返します
     * @return {boolean} 可視化されていればtrue、そうでなければfalse
     */
    isActive() {
        return this.hasClass('active');
    }//}}}

    // --Status {{{

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
    }//}}}

    // --Style {{{

    /**
     * この漢字変換候補一覧を可視化します
     * @return {ConvertView} 自身のインスタンス
     */
    active() {
        for (let view of this.container().views())
            if (view.hasClass('active'))
            view.removeClass('active');
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

    /**
     * 指定されたインデックスの変換候補を選択します
     * @param {number} index 選択する候補のインデックス
     * @return {ConvertView} 自身のインスタンス
     */
    select(index) {
        if (index < 0) index = 0;
        if (index >= this.childLength()) index = this.childLength() - 1;

        for (let row of this.rows())
            if (row.hasClass('select'))
            row.removeClass('select');

        const newRow = this.rows(index);
        newRow.addClass('select');
        this.container().inputBuffer().insertPhrase(this.phraseNum(),newRow.text());
        return this;
    }//}}}

    // --DOM操作 {{{

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

        // 参照調整
        // oldPrev - view - this

        // view
        const oldPrev = this.prev();
        if (oldPrev) {
            oldPrev.next(view);
        }
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

        // 参照調整
        // this - view - oldNext

        // view
        const oldNext = this.next();
        this.next(view);
        view.prev(this);
        view.next(oldNext);
        if (oldNext) {
            oldNext.prev(view);
        }
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

        // 参照調整
        // oldPrev - this - oldNext →　oldPrev - oldNext

        // view
        const oldPrev = this.prev();
        const oldNext = this.next();
        if (oldPrev) {
            oldPrev.next(oldNext);
        }
        if (oldNext) {
            oldNext.prev(oldPrev);
        }
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
            const cKatakana = KeyTable.katakana[char];
            if (cKatakana)
                rtnKatakana += cKatakana;
            else
                rtnKatakana += char; // 変換できなければ元の文字をそのまま連結
        }
        return rtnKatakana;
    }//}}}
}//}}}


/**
 * 変換候補一覧を束ねる漢字変換コンテナを表すクラス
 */
class ConvertContainer extends AbstractHierarchy {//{{{
    // constructor {{{
    /**
     * @param {InputBuffer} inputBuffer 入力元のインスタンス
     */
    constructor(inputBuffer) {
        super(document.getElementById('convert_container'));
        this._inputBuffer = inputBuffer;
    }//}}}

    // --参照取得 {{{

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
        for (let view of this.views())
            if (view.isActive()) return view;
        return null;
    }//}}}

    // --判定 {{{

    /**
     * 漢字変換が行われているところかどうかを返します
     * @return {boolean} 候補一覧がひとつでも内部にあればtrue、そうでなければfalse
     */
    isActive() {
        return this.childLength() > 0;
    }//}}}

    // --Style {{{

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
    }//}}}

    // --DOM操作 {{{

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
        for (let phraseData of data)
            this.append(new ConvertView(phraseData));
        return this;
    }

    /**
     * 漢字変換を始めます(非同期通信)
     * @param {string} str 変換する文字列
     * @return {ConvertContainer} 自身のインスタンス
     * @see ../WEB-INF/classes/doc/JapaneseConvertServlet.html
     */
    convert(str) {
        Util.get('/tategaki/Convert', function (json) {
            this.createViews(json);
            this.inputBuffer().setPhraseNum();
            // すべて変換第一候補を選択する
            for (let view of this.views())
                view.select(0);
            // 最初の文節を選択
            this.inputBuffer().select(0);

            this.reposition();
            this.addKeydownEventListener();
        }.bind(this), {
            sentence: str
        });
        this.show();

        return this;
    }

    /**
     * 文節区切りをひとつ前にずらして変換し直します(非同期通信)
     * @return {ConvertContainer} 自身のインスタンス
     * @see ../WEB-INF/classes/doc/JapaneseConvertServlet.html
     */
    shiftUp() {
        const activeView = this.activeView();

        if (activeView.kanaLength() === 1) return this;

        // 最終文節から
        // 最後の一字を分離して、二文節を変換し直す
        if (activeView.isLast()) {
            const activeKana = activeView.hiragana();
            const sendString = activeKana.slice(0, -1) + ',' + activeKana.slice(-1);
            Util.get('/tategaki/Convert', function (json) {
                this.replace(activeView.phraseNum(),json);
            }.bind(this), {
                sentence: sendString
            });
            return this;
        }

        // 選択文字列から最後の一文字を取り除き、その次の文節の頭につなげてそれぞれを変換し直す
        const activeKana = activeView.hiragana();
        const nextView = activeView.next();
        const nextKana = nextView.hiragana();
        const sendString = activeKana.slice(0,-1) + ',' + activeKana.slice(-1) + nextKana;
        Util.get('/tategaki/Convert', function (json) {
            const newFirst = new ConvertView(json[0]);
            activeView.replace(newFirst);
            newFirst.select(0);
            const newSecond = new ConvertView(json[1]);
            nextView.replace(newSecond);
            newSecond.select(0);
        }, {
            sentence: sendString
        });
        return this;
    }

    /**
     * 文節区切りをひとつ下にずらして変換し直します(非同期通信)
     * @return {ConvertContainer} 自身のインスタンス
     * @see ../WEB-INF/classes/doc/JapaneseConvertServlet.html
     */
    shiftDown() {
        const activeView = this.activeView();
        const nextView = activeView.next();

        if (activeView.isLast()) return this;

        // 次の文節の文字数が１文字だけなら融合して、１文節として変換する
        if (nextView.kanaLength() === 1) {
            const nextPhrase = this.inputBuffer().phrases(nextView.phraseNum())[0];
            const sendString = activeView.hiragana() + nextView.hiragana() + ','; // 文節を区切られないよう、,を末尾に追加する
            Util.get('/tategaki/Convert', function (json) {
                const newView = new ConvertView(json[0]);
                activeView.replace(newView);
                nextView.remove();
                nextPhrase.remove();
                newView.select(0);
                this.inputBuffer().setPhraseNum();
            }.bind(this), {
                sentence: sendString
            });
            return this;
        }

        // 次の文節が二文字以上
        // 次の文節の１文字目を選択文節に移動して、それぞれを変換し直す
        const activeKana = activeView.hiragana();
        const nextKana = nextView.hiragana();
        const sendString = activeKana + nextKana.slice(0,1) + ',' + nextKana.slice(1);
        Util.get('/tategaki/Convert', function (json) {
            const newFirst = new ConvertView(json[0]);
            activeView.replace(newFirst);
            newFirst.select(0);
            const newSecond = new ConvertView(json[1]);
            nextView.replace(newSecond);
            newSecond.select(0);
        }, {
            sentence: sendString
        });
        return this;
    }

    /**
     * 入力中の文字が二文字以上あれば最後の１音のみ削除して選択文節を変換し直します(非同期通信)。
     *     入力中の文字がひらがなにして１文字しかなければ全て破棄して入力を終了します
     * @return {ConvertContainer} 自身のインスタンス
     * @see ../WEB-INF/classes/doc/JapaneseConvertServlet.html
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
        Util.get('/tategaki/Convert', function (json) {
            this.replace(phraseNum,json);
        }.bind(this), {
            sentence: newString
        });
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
        for (let newView of newViews)
            newView.select(0);
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
    }//}}}

    // --イベント {{{

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
    }//}}}
}//}}}
