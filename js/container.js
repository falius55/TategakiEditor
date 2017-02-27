'use strict';
/* global AbstractHierarchy, Paragraph, Cursor, InputBuffer, CommandLine, Menu, DoManager, Util, getSelection */  // jshint ignore:line


class SearchMode {  // jshint ignore:line
    //{{{
    constructor(sentenceContainer) {
        this._elem = document.getElementById('search');
        this._sentenceContainer = sentenceContainer;
    }

    /**
     * 渡された文字列を本文内から探し、見つかった文字列にsearch-wordクラスを付与します。
     *     さらに、見つかった文字列の先頭文字にsearch-labelクラスを付与します
     *  @param {string} str 検索文字列
     *  @return {SentenceContainer} 自身のインスタンス
     */
    _search(str) {
        for (let paragraph of this._sentenceContainer.paragraphs()) {
            paragraph.search(str);
        }
        return this;
    }

    /**
     * 文書内語句検索を始めます
     * @return {SentenceContainer} 自身のインスタンス
     */
    start() {
        this._elem.classList.add('active');
        this._elem.focus();
        this._elem.value = '/';
        this._sentenceContainer.removeKeydownEventListener();
        if (!this._keyupArg) {
            this._keyupArg = this._onKeyup.bind(this);
            this._elem.addEventListener('keyup', this._keyupArg, false);
            this._elem.addEventListener('focusin', this._onFocusin.bind(this));
            this._elem.addEventListener('focusout', this._onFocusout.bind(this));
        }
        return this;
    }

    /**
     * 文書内語句検索を完全に終了します
     * @return {SentenceContainer} 自身のインスタンス
     */
    stop() {
        this._sentenceContainer.addKeydownEventListener();
        this._elem.value = '';
        this._elem.classList.remove('active');
        this._sentenceContainer
            .removeClassFromAllChar('search-label').removeClassFromAllChar('search-word');
        return this;
    }

    /**
     * 語句検索inputフォームのkeyupイベントです
     * @param {Event} e イベントオブジェクト
     */
    _onKeyup(e) {
        let keycode;
        if (document.all) {
            // IE
            keycode = e.keyCode;
        } else {
            // IE以外
            keycode = e.which;
        }

        if (keycode === 13) {
            // enter
            this._elem.blur(); // enterを押しただけではフォーカスが外れない
            return;
        }

        // 中身が空になればsearchモードを完全に終了する
        if (this._elem.value === '') {
            this._elem.blur();
            this.stop();
            return;
        }

        this._search(this._elem.value.slice(1));
    }

    /**
     * 語句検索inputフォームからフォーカスが外れた際のイベント実行内容です。
     *     文書コンテナ本体にkeydownイベントを戻します
     */
    _onFocusout() {
        this._sentenceContainer.addKeydownEventListener();
    }

    /**
     * 語句検索inputフォームにフォーカスがあたった際のイベント実行内容です。
     *     文書コンテナ本体のkeydownイベントを外します
     */
    _onFocusin() {
        this._sentenceContainer.removeKeydownEventListener();
    }
}//}}}


class SelectRange {  // jshint ignore:line
    //{{{

    constructor(sentenceContainer) {
        this._sentenceContainer = sentenceContainer;
        this._cursor = sentenceContainer.cursor();
    }

    /**
     * 選択範囲にある文字インスタンスを配列で返します
     * @param {boolean} [opt_bl] 選択範囲を解除するならtrueを指定する
     * @return {Char[]} 選択範囲内にある文字インスタンスの配列
     */
    selectChars(opt_bl) {
        const ret = [];
        const selection = getSelection();
        if (this._selectText().length === 0) {
            return ret; // rangeCount===0とすると、EOLのみ選択されることがある
        }

        const selRange = selection.getRangeAt(0);
        for (let char = this._sentenceContainer.firstChar(); char; char = char.nextChar()) {
            if (char.isInRange(selRange)) {
                ret.push(char);
            }
        }

        selRange.detach();
        if (opt_bl) {
            selection.removeAllRanges(); // 選択を解除する
        }
        return ret;
    }

    /**
     * 選択範囲内にある文字列をローカルストレージに保存します
     * @return {SentenceContainer} 自身のインスタンス
     */
    copySelectText() {
        localStorage.clipBoard = this._selectText();
        return this;
    }

    // ペースト
    /**
     * ローカルストレージに保存した文字列をカーソル位置から挿入します
     * @return {SentenceContainer} 自身のインスタンス
     */
    pasteText() {
        this._cursor.insert(localStorage.clipBoard);
        return this;
    }

    /**
     * 選択範囲内にある文字列を返します
     * @return {string} 選択範囲内の文字列
     */
    _selectText() {
        const selection = getSelection();
        let ret = '';
        for (let i = 0, cnt = selection.rangeCount; i < cnt; i++) {
            const selRange = selection.getRangeAt(i);
            ret += selRange.toString();
        }
        return ret;
    }

    /**
     * マウスで選択範囲を変更した際のイベントを与えます。選択範囲最後の文字の次の文字にカーソルを当てます
     */
    addSelectEvent() {
        this._sentenceContainer.elem().addEventListener('mouseup', function (e) {
            const selChars = this.selectChars();
            // 選択範囲の直後にカーソルを当てる
            if (selChars.length > 0) {
                const lastCharOnSelect = selChars[selChars.length -1];
                const newCursor =
                    lastCharOnSelect.hasNextSibling() ? lastCharOnSelect.next() : lastCharOnSelect;
                newCursor.addCursor().setPosMemory();
            }
        }.bind(this),false);
    }
}//}}}


class Displayer { // jshint ignore:line
    //{{{
    constructor(sentenceContainer) {
        this._sentenceContainer = sentenceContainer;
    }

    /**
     * 文書を１行目の１文字目から表示します
     * @return {SentenceContainer} 自身のインスタンス
     */
    resetDisplay() {
        this._addDisplay(0,0);
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
        const cursorChar = this._sentenceContainer.cursorChar();
        const rowPos = this._computeDisplayRowPos(opt_pos);
        const charPos = cursorChar.row().computeDisplayCharPos();
        this._addDisplay(rowPos, charPos);
        return this;
    }

    /**
     * 表示を一行分右に動かします
     * @return {SentenceContainer} 自身のインスタンス
     */
    shiftRightDisplay() {
        const charPos = this._sentenceContainer.cursorRow().computeDisplayCharPos();
        const firstDisplay = this._firstDisplayRow();
        if (!firstDisplay.prev()) {
            return this;
        }

        firstDisplay.prev().display(true, charPos);
        this._lastDisplayRow().display(false);
        return this;
    }

    /**
     * 表示を一行分左に動かします
     * @return {SentenceContainer} 自身のインスタンス
     */
    shiftLeftDisplay() {
        const charPos = this._sentenceContainer.cursorRow().computeDisplayCharPos();
        const lastDisplay = this._lastDisplayRow();
        if (!lastDisplay.next()) {
            return this;
        }

        lastDisplay.next().display(true, charPos);
        this._firstDisplayRow().display(false);
        return this;
    }

    /**
     * firstRow行目以降を表示します。
     *     文字はfirstChar文字目以降が表示されます
     * @param {number} firstRow 表示される最初の行のインデックス
     * @param {number} firstChar 表示される最初の文字のインデックス
     * @return {SentenceContainer} 自身のインスタンス
     */
    _addDisplay(firstRow, firstChar) {
        const dispWidth = this.width();
        const cache = {};
        let cnt = 0; // 総行数をカウントする
        let sum = 0; // 表示行の幅合計
        for (let paragraph of this._sentenceContainer.paragraphs()) {
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
                row.display((sum < dispWidth), firstChar);
                cnt++;
            }
        }
        return this;
    }

    /**
     * カーソル位置を基準に、最初に表示されるべき行のインデックスを返します
     * @param {string} [opt_pos] 表示後のカーソル位置を指定する。
     *     'center'なら、カーソル位置を中央にする。'right'なら、カーソル位置が最も右になるよう表示される。
     *     省略した場合は現在の表示位置から最低限の移動でカーソル文字が表示されるように表示される
     *     (現在のカーソル位置が現在表示されている画面から一行後ろにあれば一行分表示位置が後ろにずれる、といった形)
     * @return {number} 計算された最初に表示されるべき行のインデックス
     */
    _computeDisplayRowPos(opt_pos) {
        const currentFirst = this._firstDisplayRowPos();
        const cursorIndex = this._cursorRowPos();
        const currentEnd = this._lastDisplayRowPos();

        // カーソル位置を中央にする
        // HACK:計算前のdisplayの数を基準にするので、フォントの大きさなどによってずれもありうる
        if (opt_pos === 'center') {
            const harfRange = (currentEnd - currentFirst) / 2;
            const ret = cursorIndex - harfRange;
            return ret >= 0 ? ret : 0;
        }

        if (opt_pos === 'right') {
            return cursorIndex;
        }

        // カーソルが前にある
        if (cursorIndex < currentFirst) {
            return cursorIndex;
        }

        // カーソルが後ろにある
        if (cursorIndex > currentEnd) {
            return currentFirst + (cursorIndex - currentEnd);
        }

        // displayに囲まれた部分にdisplayでない行がある場合
        // 途中行数変化
        return currentFirst;
    }

    /**
     * 現在表示されている行の最初の行のインデックスを返します
     * @return {number} 現在表示されている行の最初の行のインデックス。表示行がなければ-1
     */
    _firstDisplayRowPos() {
        let cnt = 0;
        for (let paragraph of this._sentenceContainer.paragraphs()) {
            for (let row of paragraph.rows()) {
                if (row.isDisplay()) {
                    return cnt;
                }
                cnt++;
            }
        }
        return -1;
    }

    /**
     * 現在表示されている行の最後の行のインデックスを返します
     * @return {number} 現在表示されている行の最後の行のインデックス。表示行がなければ-1
     */
    _lastDisplayRowPos() {
        for (let row = this._sentenceContainer.lastRow(),
            index = this._sentenceContainer.countRow() -1;
            row; row = row.prev(), index--) {
                if (row.isDisplay()) {
                    return index;
                }
            }
        return -1;
    }

    /**
     * カーソル行が文書全体で何行目かを返します
     * @return {number} カーソル行の文書全体でのインデックス。文書内に段落がない、あるいはカーソル行がなければ-1
     */
    _cursorRowPos() {
        const cursorRow = this._sentenceContainer.cursorRow();
        let cnt = 0;
        for (let paragraph of this.paragraphs()) {
            for (let row of paragraph.rows()) {
                if (row.is(cursorRow)) {
                    return cnt;
                }
                cnt++;
            }
        }
        return -1;
    }

    /**
     * 表示されている行のうち最初の行のインスタンスを返します
     * @return {Row} 最初の表示行のインスタンス。表示行がなければnull
     */
    _firstDisplayRow() {
        for (let paragraph of this._sentenceContainer.paragraphs()) {
            for (let row of paragraph.rows()) {
                if (row.isDisplay()) {
                    return row;
                }
            }
        }
        return null;
    }

    /**
     * 表示されている行のうち最後の行のインスタンスを返します
     * @return {Row} 最後の表示行のインスタンス。表示行がなければnull
     */
    _lastDisplayRow() {
        for (let row = this._sentenceContainer.lastRow(); row; row = row.prev()) {
            if (row.isDisplay()) {
                return row;
            }
        }
        return null;
    }
}//}}}


/**
 * 文章コンテナを表すクラス
 */
class SentenceContainer extends AbstractHierarchy {  // jshint ignore:line

    // constructor {{{
    /**
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
    constructor(opt_data) {
        super(document.getElementById('sentence_container'));
        if (opt_data) {
            this.init(opt_data);
        }
        this._titleElem = document.getElementById('file_title');
        this._announceElem = document.getElementById('user_info');
        this._changedElem = document.getElementById('changed');

        this._cursor = new Cursor(this);
        this._inputBuffer = new InputBuffer(this);
        this._fileList = new FileList(this);
        this._command = new CommandLine(this);
        this._menu = new Menu(this);
        this._doManager = new DoManager(this);
        this._displayer = new Displayer(this);
        this._searchMode = new SearchMode(this);
        this._selectRange = new SelectRange(this);

        this.addFileTitleEvent();
        this._selectRange.addSelectEvent();

        if (!opt_data) {
            this.newFile();
        }
    }

    /**
     * 文書をコンテナに展開します
     * @param {object} data 文書情報のオブジェクト
     * @return {SentenceContainer} 自身のインスタンス
     */
    init(data) {
        this.empty();
        // 文書情報
        this.filename(data.filename);
        this.fileId(data.fileId);
        this.saved(
            data.saved ||
                (new Date(Date.now()).toLocaleDateString() + ' ' +
                    new Date(Date.now()).toLocaleTimeString()).replace(/\//g,'-'));
        this._strLenOnRow = data.data.conf.strLen || 40; // １行の文字数
        this._rowLenOnPage = data.data.conf.rowLen || 40; // １ページの行数
        this.menu().confStrLenElem().value = this._strLenOnRow;
        this.menu().confRowLenElem().value = this._rowLenOnPage;
        // DOMの構築
        for (let paraData of data.data.text) {
            this.append(new Paragraph(paraData));
        }

        this.cursor().init();
        this.cordinate();
        this._displayer.resetDisplay();
        this.breakPage().printInfo();
        this.addKeydownEventListener();
        this.addWheelEventListener();
        this._doManager.reset();
        return this;
    }
    // }}}

    // --参照取得 {{{

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
        if (num <= 0) {
            return this.firstRow();
        }

        let cnt = 0;
        for (let row = this.firstRow(); row; row = row.next()) {
            cnt++;
            if (cnt === num) {
                return row;
            }
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
        if (num <= 0) {
            return this.firstRow();
        }

        let cnt = 0;
        for (let row = this.firstRow(); row; row = row.next()) {
            if (row.isPageBreak()) {
                cnt++;
                if (cnt === num) {
                    return row;
                }
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
     * この文書を操作するMenuクラスのインスタンスを返します
     * @return {Menu} メニューバーのインスタンス
     */
    menu() {
        return this._menu;
    }
    // }}}

    // --判定 {{{
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
    }//}}}

    // --Status {{{
    /**
     * 文書の内容を表したオブジェクトのjson文字列を作成します
     * @return {string} 文書内容を表すオブジェクトのjson文字列
     */
    data() {
        const data = {};
        data.conf = this.menu().configueData();
        const paraArr = [];
        for (let paragraph of this.paragraphs()) {
            paraArr.push(paragraph.data());
        }
        data.text = paraArr;

        return JSON.stringify(data);
    }

    /**
     * この文書内に展開しているファイル名を変更する、あるいは引数省略で現在のファイル名を取得します
     * @param {string} [opt_newFilename] 新たに設定するファイル名
     * @return {SentenceContainer string} 自身のインスタンス(引数を渡した場合)、あるいは現在のファイル名(引数を省略した場合)
     */
    filename(opt_newFilename) {
        if (opt_newFilename === undefined) {
            return this._filename;
        }

        this._filename = opt_newFilename;
        this._titleElem.value = opt_newFilename;
        this._titleElem.dataset.filename = opt_newFilename;
        return this;
    }

    /**
     * 現在のファイルに新たなIDを与える、あるいは引数省略で現在のファイルIDを取得します
     * @param {number} [opt_newId] 新たに設定するID
     * @return {SentenceContainer number} 自身のインスタンス(引数を渡した場合)、あるいは現在のファイルID(引数を省略した場合)
     */
    fileId(opt_newId) {
        if (opt_newId === undefined) {
            return this._fileId;
        }

        const newId = opt_newId;
        this._fileId = newId;
        this._titleElem.dataset.fileId = newId;
        return this;
    }

    /**
     * 最終更新日時を設定、あるいは引数省略で最終更新日時を取得します
     * @param {string} [opt_newSaved] 新たに設定する最終更新日時の文字列
     * @return {SentenceContainer string} 自身のインスタンス(引数を渡した場合)、あるいは現在の最終更新日時の文字列(引数を省略した場合)
     */
    saved(opt_newSaved) {
        if (opt_newSaved === undefined) {
            return this._saved;
        }

        const newSaved = opt_newSaved;
        this._saved = newSaved;
        document.getElementById('saved').textContent = newSaved;
        return this;
    }

    /**
     * 最後の保存から変更があったのかどうかを示すマーク([+]記号)を設定、あるいは引数省略で現在設定されているのかどうかを取得します
     * @param {boolean} [opt_bl] 設定する場合はtrue、外す場合はfalse
     * @return {SentenceContainer boolean} 自身のインスタンス(引数を渡した場合)、あるいは現在の設定状態の真偽値(引数を省略した場合)
     */
    isChanged(opt_bl) {
        if (opt_bl === undefined) {
            return this._changedElem.classList.contains('active');
        }

        if (opt_bl === true) {
            this._changedElem.classList.add('active');
            return this;
        }
        if (opt_bl === false) {
            this._changedElem.classList.remove('active');
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
        }

        const newStrLen = opt_newStrLen;
        this._strLenOnRow = newStrLen;
        this.cordinate().checkKinsoku().changeDisplay().breakPage().printInfo();
        this.cursor().createCursorLine();
        return this;
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
        }

        const newRowLen = opt_newRowLen;
        this._rowLenOnPage = newRowLen;
        this.breakPage().printInfo();
        return this;
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
            if (row.isPageBreak()) {
                cnt++;
            }
        }
        return cnt;
    }//}}}

    // --Style {{{

    /**
     * この文書コンテナの横幅を返えます。
     *     文書コンテナは９０度回転しているため、css上は高さと同様です
     * @param {boolean} [opt_useCache=true] true=キャッシュを利用する、false=キャッシュを利用しない。
     *     省略するとデフォルトでtrueになるので、キャッシュを使わず計算し直す場合には明示的にfalseを渡す必要がある
     * @return {number} 自身の幅
     */
    width(opt_useCache) {
        return super.height(opt_useCache);
    }

    /**
     * この文書コンテナの高さを返します。
     *     文書コンテナは９０度回転しているため、css上は横幅と同様です
     * @param {boolean} [opt_useCache=true] true=キャッシュを利用する、false=キャッシュを利用しない。
     *     省略するとデフォルトでtrueになるので、キャッシュを使わず計算し直す場合には明示的にfalseを渡す必要がある
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
    } //}}}

    // --DOM操作関係 {{{
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
        this._searchMode.stop();
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
    }//}}}

    // printInfo {{{
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
    }//}}}

    // --文章整理 {{{
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
    }//}}}

    // 改ページ {{{
    /**
     * ページの最初の行と最終行に目印となるクラスを与えます
     * @return {SentenceContainer} 自身のインスタンス
     */
    breakPage() {
        const pageNum = this.rowLenOnPage();
        // page-break
        let cntBreak = 0;
        for (let paragraph of this.paragraphs()) {
            for (let row of paragraph.rows()) {
                if (cntBreak === 0 || cntBreak % pageNum === 0) { // １行目とpageNumの倍数行目
                    row.addClass('page-break');
                } else {
                    row.removeClass('page-break');
                }
                cntBreak++;
            }
        }
        // page-last-row
        let cntLast = 0;
        const lastRow = this.countRow() -1;
        for (let paragraph of this.paragraphs()) {
            for (let row of paragraph.rows()) {
                if ((cntLast + 1) % pageNum === 0 || cntLast === lastRow) { // (pageNumの倍数-1)行目と最終行
                    row.addClass('page-last-row');
                }
                else {
                    row.removeClass('page-last-row');
                }
                cntLast++;
            }
        }
        return this;
    }//}}}

    // announce {{{
    /**
     * ユーザーへの情報を表示します
     * @param {string} str 表示する情報
     * @param {string} [opt_color='black'] 黒文字以外の文字色で表示する場合に色名を指定する
     * @return {SentenceContainer} 自身のインスタンス
     */
    announce(str, opt_color) {
        this._announceElem.textContent = str;
        if (opt_color) {
            this._announceElem.style.color = opt_color;
        } else {
            this._announceElem.style.color = '';
        }
        return this;
    }//}}}

    // --ファイル操作 {{{
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
     * @see ../WEB-INF/classes/doc/FileDataServlet.html
     */
    saveFile() {
        this.announce('保存中');
        Util.post('/tategaki/FileData',{
            file_id: this.fileId(),
            filename: this.filename(),
            json: this.data(),
            saved: Date.now()
        }, function (json) {
            if (json.result === 'true') {
                this.saved(json.saved).announce('保存しました');
                this.fileId(json.fileID);
                this.fileList().read();
                this.isChanged(false);
            } else {
                this.announce('保存エラー');
            }
        }.bind(this));
        return this;
    }

    /**
     * 新しいファイルを開きます
     * @param {string='newfile'} filename 新しいファイル名
     * @return {SentenceContainer} 自身のインスタンス
     */
    newFile(filename) {
        if (filename === undefined) {
            filename = 'newfile';
        }
        this.init({
            fileId: -1,
            filename: filename,
            data: {
                conf:{},
                text:[[[],[]]]
            }
        }); // 空段落のデータ
        return this;
    }//}}}

    // --Display関係 {{{
    changeDisplay(opt_pos) {
        this._displayer.changeDisplay(opt_pos);
    } // }}}

    // undo redo {{{
    /**
     * DoMemoryをアンドゥスタックに積みます
     * @param {DoMemory} doMemory アンドゥスタックに積むDoMemory
     */
    addDo(doMemory) {
        this._doManager.add(doMemory);
        return this;
    }

    /**
     * アンドゥします
     */
    undo() {
        if (this._doManager.hasUndo()) {
            this._doManager.undo();
        } else {
            this.announce('すでに一番古い変更です');
        }
        return this;
    }

    /**
     * リドゥします
     */
    redo() {
        if (this._doManager.hasRedo()) {
            this._doManager.redo();
        } else {
            this.announce('すでに一番新しい変更です');
        }
        return this;
    }//}}}

    // --イベント {{{
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
    runKeydown(e, keycode) {
        this.announce('');
        if (e.ctrlKey) {
            return this.runControlKeyDown(e,keycode);
        }

        switch (keycode) {
            case 8:
                // backspace
                this.cursor().backSpace(true);
                break;
            case 13:
                // Enter
                this.cursor().lineBreak(true);
                break;
            case 32:
                // space
                this.cursor().insert('　', true);
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
                this._searchMode.start();
                break;
            default:
                this.inputBuffer().tryTransfer(keycode, e.shiftKey);
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
        console.log('keycode', keycode);
        switch (keycode) {
            case 67:
                // c
                this._selectRange.copySelectText();
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
            case 82:
                //r
                this.redo();
                break;
            case 83:
                // s
                this.saveFile();
                break;
            case 85:
                //u
                this.undo();
                break;
            case 86:
                // v
                this._selectRange.pasteText();
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
    runWheel(e, isUp) {
        const mvRowNum = 4; // 一度に動かす行数
        if (isUp) {
            for (let i = 0; i < mvRowNum; i++) {
                this._displayer.shiftRightDisplay();
            }
        } else {
            for (let i = 0; i < mvRowNum; i++) {
                this._displayer.shiftLeftDisplay();
            }
        }
        return this;
    }

    // ファイル名input
    /**
     * ファイル名inputフォームにイベントを付加します(主に、フォーカスがあたった際と外れた際のイベント)。
     */
    addFileTitleEvent() {
        // 与えっぱなし。実行内容もここで定義
        this._titleElem.addEventListener('focusin',function (e) {
            if (this.inputBuffer().isDisplay) {
                this.inputBuffer().empty().hide();
            }
            this.removeKeydownEventListener();
        }.bind(this),false);

        this._titleElem.addEventListener('focusout',function (e) {
            if (this._titleElem.value === '') {
                this.announce('ファイル名が入力されていません','red');
                this._titleElem.value = this._titleElem.dataset.filename;
            }
            this.addKeydownEventListener();
        }.bind(this),false);
    }

    //}}}
}
