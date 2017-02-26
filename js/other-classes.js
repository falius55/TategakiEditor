'use strict';
/* global ColorDoMemory, BoldDoMemory, ItalicDoMemory, ElemCreator, PrintDoMemory, Char, DeleteDoMemory, LineBreakDoMemory, getSelection */  // jshint ignore:line
/*
 *	jQyeryの使用箇所:width(),height(),addwheelEventlistener(),removeWheelEventListener(),bootstrap関係
 */
console.log('dom-operation-classes.js');

// Class
/**
 * メニューバーを担当するクラス
 *     メニューバー上のボタンによるイベントを一括して請け負います
 */
class Menu {  // jshint ignore:line
    //{{{
    // constructor {{{
    /**
     * @param {SentenceContainer} sentenceContainer 対応する文章コンテナ
     */
    constructor(sentenceContainer) {
        this._sentenceContainer = sentenceContainer;
        this._fontSizeInputElem = document.getElementById('fontsize_input');
        this._confStrLenElem = document.getElementById('conf_str_len');
        this._confRowLenElem = document.getElementById('conf_row_len');
        this.addEventListeners();
    }//}}}

    // --参照取得 {{{

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
    }//}}}

    // --Status {{{

    /**
     * フォントサイズinputフォームに値を設定する、あるいは引数省略で現在のinputフォームの値を返します
     * @param {number string} [opt_newSize] inputに設定する値(数値か、文字列の'auto')
     * @return {Menu number string} 自身のインスタンス(引数を渡した場合)、
     *     あるいは現在のinputフォームの値(引数を省略した場合。'auto'の場合は文字列で返す)
     */
    fontSizeInput(opt_newSize) {
        if (opt_newSize === undefined) {
            return this._fontSizeInputElem.value === 'auto' ?
                'auto' : parseInt(this._fontSizeInputElem.value);
        }

        this._fontSizeInputElem.value = opt_newSize;
        return this;
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
        ret.strLen = this.confStrLenElem().value;
        ret.rowLen = this.confRowLenElem().value;
        return ret;
    }//}}}

    // --Style {{{

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
            if (oldColor) {
                eColorButton.classList.remove(oldColor[0]);
            }
            if (newColor === 'black') {
                return this;
            }
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
     * @param {boolean} [useUndo] Undoスタックに積む場合はtrue
     * @return {Menu} 自身のインスタンス
     */
    addColor(color, useUndo) {
        const chars = this.sentenceContainer().selectChars(true);
        if (useUndo) {
            this.sentenceContainer().addDo(new ColorDoMemory(chars, color));
        }
        for (let char of chars) {
            char.color(color);
        }
        this.sentenceContainer().isChanged(true);
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
     * @param {boolean} [useUndo] Undoスタックに積む場合はtrue
     * @return {Menu} 自身のインスタンス
     */
    bold(bl, useUndo) {
        const chars = this.sentenceContainer().selectChars(true);
        if (useUndo) {
            this.sentenceContainer().addDo(new BoldDoMemory(chars, bl));
        }
        for (let char of chars) {
            char.bold(bl);
        }
        this.sentenceContainer().isChanged(true);
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
     * @param {boolean} [useUndo] Undoスタックに積む場合はtrue
     * @return {Menu} 自身のインスタンス
     */
    italic(bl, useUndo) {
        const chars = this.sentenceContainer().selectChars(true);
        if (useUndo) {
            this.sentenceContainer().addDo(new ItalicDoMemory(chars, bl));
        }
        for (let char of chars) {
            char.italic(bl);
        }
        this.sentenceContainer().isChanged(true);
        return this;
    }

    /**
     * 選択範囲のフォントサイズを変更します
     * @param {number} size 新しいフォントサイズ
     * @param {boolean} [useUndo] Undoスタックに積む場合はtrue
     * @return {Menu} 自身のインスタンス
     */
    fontSize(size, useUndo) {
        const chars = this.sentenceContainer().selectChars(true);
        if (useUndo) {
            this.sentenceContainer().addDo(chars, size);
        }
        for (let char of chars) {
            char.fontSize(size);
        }
        this.sentenceContainer()
            .cordinate().checkKinsoku().changeDisplay().breakPage().printInfo().isChanged(true);
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
        this.sentenceContainer().isChanged(true);
        return this;
    }//}}}

    // イベントリスナー//{{{
    /**
     * メニューの各コンポーネントにイベントリスナーを付加します
     *     newボタン、saveボタン、deleteボタン、開くボタン、モーダルの開閉、
     *     文字色ボタン、文字色ドロップダウン、太字ボタン、斜体ボタン、
     * 	 text-alignボタン、フォントサイズのドロップダウン、設定モーダル
     * @return {Menu} 自身のインスタンス
     */
    addEventListeners() {
        // メニューボタン
        document.getElementById('menu_new').addEventListener('click', function (e) {
            this.sentenceContainer().newFile();
        }.bind(this), false);
        document.getElementById('menu_save').addEventListener('click', function (e) {
            this.sentenceContainer().saveFile();
        }.bind(this), false);
        document.getElementById('menu_delete').addEventListener('click', function (e) {
            this.sentenceContainer().fileList().currentFile().delete();
        }.bind(this), false);
        document.getElementById('modal_fileopen_link').addEventListener('click', function (e) {
            const filterInputElem = this.sentenceContainer().fileList().filterInputElem();
            // モーダルが開くのはブートストラップで行われるので、その前処理だけを行う
            filterInputElem.value = '';
            filterInputElem.focus();
            this.sentenceContainer().fileList().resetList();
        }.bind(this), false);

        // モーダル開閉
        $('div.modal').on('shown.bs.modal', function (e) {
            this.sentenceContainer().removeKeydownEventListener();
            if (this.sentenceContainer().inputBuffer().isDisplay()) {
                this.sentenceContainer().inputBuffer().empty().hide();
            }
        }.bind(this));
        $('div.modal').on('hidden.bs.modal', function (e) {
            if (this.sentenceContainer().command().isActive()) { return; }
            this.sentenceContainer().addKeydownEventListener();
        }.bind(this));

        // パレットボタン
        // 文字色ボタン
        document.getElementById('color_btn').addEventListener('click', function (e) {
            this.addColor(this.colorButton(), true);
        }.bind(this), false);
        // 文字色ドロップダウン
        this.addColorSelectClickEvent();

        // bold italic
        document.getElementById('btn-bold').addEventListener('click', function (e) {
            const eBtn = document.getElementById('btn-bold');
            eBtn.classList.toggle('active');
            this.bold(this.boldButton(), true);
        }.bind(this), false);
        document.getElementById('btn-italic').addEventListener('click', function (e) {
            const eBtn = document.getElementById('btn-italic');
            eBtn.classList.toggle('active');
            this.italic(this.italicButton(), true);
        }.bind(this), false);

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
        for (let i = 0, eSelColor; (eSelColor = eSelectColors[i]); i++) {
            const color = eSelColor.dataset.color;
            eSelColor.addEventListener('click',
                this._addColorCallback(eSelColor, color).bind(this), false);
        }
        return this;
    }

    // ループ内で使われるため別に定義する(関数外の変数を内部で使わないようにするため)
    // 即時関数に入れなければ、eSelColorとcolorの中身がクロージャ的に変化して
    // すべての場合で最後の値が利用されてしまうおそれがある
    _addColorCallback(eSelColor, color) {
        return function (e) {
            this.colorButton(color);
            this.addColor(color, true);
        };
    }

    /**
     * text-alignボタンをクリックするとカーソルのある段落のtext-alignが変更されるイベントを付加します
     * @return {Menu} 自身のインスタンス
     */
    addAlignClickEvent() {
        const eAligns = document.querySelectorAll('#align_btns button');
        for (let i = 0, eAlign; (eAlign = eAligns[i]); i++) {
            const align = eAlign.id.match(/text_btn_(\S+)/);
            eAlign.addEventListener('click', this._addAlignCallback(align).bind(this), false);
        }
        return this;
    }

    _addAlignCallback(align) {
        return function (e) {
            this.align(align);
        };
    }

    // font size

    /**
     * フォントサイズのドロップダウンをクリックするとフォントサイズのinputの数値が変更され、選択範囲の文字のフォントサイズが変更されるイベントを付加します
     *     querySelectorAll()でドロップダウンの各要素を取得してループでイベントを付加しているため、
     *     htmlとcssのみ変更することで扱うフォントサイズを増やすことが可能になります
     * @return {Menu} 自身のインスタンス
     */
    addFontSizeEvnet() {
        const eFontSizeDropdowns = document.querySelectorAll('#fontsize_dropdown a');
        for (let i = 0,eFontSize; (eFontSize = eFontSizeDropdowns[i]); i++) {
            eFontSize.addEventListener('click', this._addFontCallback().bind(this), false);
        }
        return this;
    }

    _addFontCallback() {
        return function (e) {
            const size = parseInt(e.target.dataset.size) || 'auto';
            this.fontSizeInput(size);
            this.fontSize(size);
        };
    }

    /**
     * 設定モーダルのinputフォームとsaveボタン、resetボタンにイベントを付加します
     * @return {Menu} 自身のインスタンス
     */
    addConfigueEvent() {
        document.getElementById('btn_conf_save').addEventListener('click', function (e) {
            const strLen = parseInt(this.confStrLenElem().value || 18);
            const rowLen = parseInt(this.confRowLenElem().value || 40);
            this.sentenceContainer().strLenOnRow(strLen).rowLenOnPage(rowLen);
            $('#configue_modal').modal('hide');
        }.bind(this),false);

        // html上でtype="reset"にすると、元に戻すというよりinputを空にしてしまう
        document.getElementById('btn_conf_reset').addEventListener('click', function (e) {
            this.confStrLenElem().value = this.sentenceContainer().strLenOnRow();
            this.confRowLenElem().value = this.sentenceContainer().rowLenOnPage();
        }.bind(this),false);

        // inputからフォーカスから外れた際に、不正な文字が入力されていたら元に戻す
        this.confStrLenElem().addEventListener('focusout', function (e) {
            if (!/^[0-9]+$/.test(this.confStrLenElem().value)) {
                this.confStrLenElem().value = this.sentenceContainer().strLenOnRow();
            }
        }.bind(this),false);

        this.confRowLenElem().addEventListener('focusout', function (e) {
            if (!/^[0-9]+$/.test(this.confRowLenElem().value)) {
                this.confRowLenElem().value = this.sentenceContainer().rowLenOnPage();
            }
        }.bind(this),false);

        return this;
    }//}}}
} //}}}


/**
 * コマンドラインを表すクラス
 *     コマンド操作を一括して請け負います
 */
class CommandLine {  // jshint ignore:line
    //{{{
    // constructor {{{
    /**
     * @param {SentenceContainer} sentenceContainer 対応する文章コンテナ
     */
    constructor(sentenceContainer) {
        this._elem = document.getElementById('command');
        this._sentenceContainer = sentenceContainer;
    }//}}}

    // --参照取得 {{{

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
    }//}}}

    // --判定 {{{

    /**
     * コマンドラインがアクティブかどうかを返します
     * @return {boolean} true=アクティブ、false=アクティブではない
     */
    isActive() {
        return this.elem().classList.contains('active');
    }//}}}

    // --Style {{{

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
        // モーダルウィンドウ表示時の半透明背景を見えなくする
        $('.modal-backdrop.fade.in').addClass('none_modal-backdrop');
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
    }//}}}

    // --DOM {{{

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
    }//}}}

    // --イベント {{{

    /**
     * コマンドのinputフォームにkeyupイベントを付加します。重ねがけは無効となります
     * @return {CommandLine} 自身のインスタンス
     */
    addKeyupEventListener() {
        if (this._keyupArg) {
            return this;
        }

        // removeするときと引数を同一にするためプロパティに保持する(それぞれでbindすると異なる参照になる？)
        this._keyupArg = this.onKeyup.bind(this);
        document.addEventListener('keyup',this._keyupArg);
        return this;
    }

    /**
     * コマンドのinputフォームへのkeyupイベントを除去します
     * @return {CommandLine} 自身のインスタンス
     */
    removeKeyupEventListener() {
        if (!this._keyupArg) {
            return this;
        }

        document.removeEventListener('keyup', this._keyupArg);
        this._keyupArg = null;
        return this;
    }

    /**
     * @private
     * keyupイベントの前処理を行い、イベントを実行します
     */
    onKeyup(e) {
        let keycode;
        if (document.all) {
            // IE
            keycode = e.keyCode;
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
    runKeyup(e, keycode) {
        if (keycode === 13) {
            // enter
            this.runCommand();
            this.stop();
            // 親要素へのイベントの伝播(バブリング)を止める。そうしなければ先にaddeventlistenerをしてしまっているので、documentにまでエンターキーが渡ってしまい改行されてしまう。
            e.stopPropagation();
        } else if (keycode === 27 || this.val() === '') {
            // Esc
            // あるいは全文字削除
            this.stop();
            e.stopPropagation();
        } else {
            // :eなどの後に途中まで引数を打てばファイルの検索ダイアログが出るようにする
            // 全角スペースも区切りとして有効。ただし、半角スペースとの混在は現状不可
            const command =
                this.val().split(' ').length > 1 ? this.val().split(' ') : this.val().split('　');

            switch (command[0]) {
                case ':e':
                case ':o':
                case ':open':
                case ':mv':
                case ':delete':
                case ':del':
                case ':d':
                case ':deldir':
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
        if (this._focusoutArg) {
            return this;
        }

        // removeするときと引数を同一にするためプロパティに保持する(それぞれでbindすると異なる参照になる？)
        this._focusoutArg = this.onFocusout.bind(this);
        document.addEventListener('focusout',this._focusoutArg);
        return this;
    }

    /**
     * コマンドラインからフォーカスが外れた際のイベントを除去します
     * @return {CommandLine} 自身のインスタンス
     */
    removeFocusoutEventListener() {
        if (!this._focusoutArg) {
            return this;
        }

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
        const command =
            this.val().split(' ').length > 1 ? this.val().split(' ') : this.val().split('　');

        switch (command[0]) {
            case ':w':
            case ':save':
            case ':s':
            case ': ｗ':
            case ':さヴぇ':
            case ':ｓ':
                if (command[1]) {
                    this.sentenceContainer().fileId(-1).filename(command[1]).saveFile();
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
                    const files = this.fileList().findFile(command[1]);
                    if (files.length > 0) {
                        files[0].open();
                    }
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
                if (command[1]) {
                    this.sentenceContainer().cursor().jumpRow(parseInt(command[1]));
                }
                break;
            case ':jumpp':
            case ':jumppage':
            case ':jp':
            case ':じゅｍっｐ':
            case ':じゅｍっぱげ':
            case ':ｊｐ':
                if (command[1]) {
                    this.sentenceContainer().cursor().jumpPage(parseInt(command[1]));
                }
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
                    if (currentFile) {
                        currentFile.delete();
                    }
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
                this.fileList().deleteDirectory(command[1],true);
                break;
            case ':noh':
            case ':のｈ':
                this.sentenceContainer().stopSearchMode();
                break;
            case '::':
                this.sentenceContainer().cursor().insert(':', true);
                break;
            case ':;':
                this.sentenceContainer().cursor().insert(';', true);
                break;
            case ':/':
                this.sentenceContainer().cursor().insert('/', true);
                break;
            case ':i':
                if (command[1]) {
                    this.sentenceContainer().cursor().insert(command[1], true);
                }
                break;
            case ':bold':
                this.sentenceContainer().menu()
                    .boldButton(!this.sentenceContainer().menu().boldButton());
                break;
            case ':italic':
                this.sentenceContainer().menu()
                    .italicButton(!this.sentenceContainer().menu().italicButton());
                break;
            default:
                break;
        }
    }//}}}
}//}}}


// 段落最後のEOL以外のEOLにカーソルは止まらない(EOLは基本、文字挿入のために存在)
/**
 * カーソルを表すクラス
 *     カーソルを起点とした操作を一括して請け負います
 */
class Cursor {  // jshint ignore:line
    //{{{
    // constructor {{{
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
    }//}}}

    // --参照取得 {{{

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
    }//}}}

    // --参照操作 {{{

    /**
     * カーソル文字を変更します
     * @param {Char} newChar 新しいカーソル文字
     * @return {Cursor} 自身のインスタンス
     */
    setChar(newChar) {
        if (this.getChar()) {
            this.memorySelection();
            this.getChar().removeClass('cursor');
        }
        newChar.addClass('cursor');
        this._char = newChar;
        return this;
    }

    /**
     * カーソルを移動させます
     * 加えて、与えられた文字の前の文字に文字装飾があれば対応する装飾ボタン等をその文字に合わせて変化させます
     * また、シフトキーが押されながら(bShiftがtrue)カーソルが与えられた場合、選択範囲を拡張します
     * @param {Char} char 新しいカーソル文字
     * @param {boolean} [bShift] シフトキーが押された状態でカーソルが与えられたかどうか。
     *     trueなら選択範囲を拡張する。falseなら解除する。省略(undefined)すると選択範囲には影響しない
     * @return {Cursor} 自身のインスタンス
     */
    addCursor(char, bShift) {
        this.setChar(char);

        // 前の文字に装飾があれば、そのボタンをオンにする
        const prevChar = char.prevCharOnParagraph();
        const menu = this.sentenceContainer().menu();
        menu.colorButton(prevChar ? prevChar.color() : 'black');
        menu.boldButton(prevChar ? prevChar.bold() : false);
        menu.italicButton(prevChar ? prevChar.italic() : false);
        menu.fontSizeInput(prevChar ? prevChar.fontSize() : 'auto');

        // シフトキーが押されながらなら、選択範囲を広げる
        this.extendSelection(bShift);
        this.sentenceContainer().printInfo();
        return this;
    }//}}}

    // --Status {{{

    /**
     * カーソル位置を記憶するDOM要素から、記憶されたインデックスを返します
     * @return {number} 記憶されたカーソル位置のインデックス。記憶された位置が見つからなければ-1
     */
    getPosMemory() {
        const eCharPoses = this.cursorLineElem().children;
        for (let i = 0,eCharPos; (eCharPos = eCharPoses[i]); i++) {
            if (eCharPos.classList.contains('cursor-pos-memory')) {
                return i;
            }
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
        if (eCharPoses[oldPos]) {
            eCharPoses[oldPos].classList.remove('cursor-pos-memory');
        }
        const maxIndex = eCharPoses.length - 1;
        if (index > maxIndex) { // char-posの最大数を超える数値は覚えられない
            index = maxIndex;
        }
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
            if (row.isPageBreak()) {
                return cnt;
            }
        }
        return -1;
    }

    /**
     * 現在ページの総行数を返します。最終ページのみ設定行数と異なるため、正確に総行数を数えるために利用されます
     * @return {number} 現在ページの総行数。ページの終わりが見つからなければ-1
     */
    rowLenOnPage() {
        for (let row = this.getRow(),cnt = this.currentRowPos(); row; row = row.next(),cnt++) {
            if (row.isPageLast()) {
                return cnt;
            }
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
            if (row.isPageBreak()) {
                cnt++;
            }
        }
        return cnt;
    }//}}}

    // --DOM操作 {{{

    /**
     * カーソル位置を記憶するDOM要素を文章コンテナの標準文字数に合わせて構築します。主にカーソルの左右移動の際に、そのカーソルが何文字目の位置から移動してきたのかを記憶するために用いるものです
     * @return {Cursor} 自身のインスタンス
     */
    createCursorLine() {
        const eCursorLine = document.getElementById('cursor_line');
        const eOldCharPoses = eCursorLine.children;
        for (let eOldCharPos; (eOldCharPos = eOldCharPoses[0]);) {
            eCursorLine.removeChild(eOldCharPos);
        }
        eCursorLine.appendChild(
            ElemCreator.createCharPosElement(this.sentenceContainer().strLenOnRow()));
        return this;
    }

    /**
     * カーソル位置に文字を挿入します
     *     文字列を渡した場合のみ、Undoスタックにプッシュされます
     * @param {string Char[]} chars 挿入する文字列、あるいはCharオブジェクトの配列
     * @param {boolean} [useUndo] Undoスタックに積む場合はtrue
     * @return {Cursor} 自身のインスタンス
     */
    insert(chars, useUndo) {
        const cursorChar = this.getChar();
        if (typeof chars === 'string') {
            chars = this._charsFromString(chars);
        }
        if (useUndo) {
            this.sentenceContainer().addDo(new PrintDoMemory(this, chars));
        }

        for (let char of chars) {
            cursorChar.before(char);
        }

        cursorChar.paragraph().cordinate().checkKinsoku();
        this.getChar().setPosMemory(); // cordinate()によってカーソル文字が変わっている可能性があるため、cursorCharは使えず取得しなおし
        this.sentenceContainer().changeDisplay().breakPage().printInfo().isChanged(true);
        return this;
    }

    /**
     * 文字列をCharオブジェクトの配列に変換します
     * @param {string} str 変換する文字列
     * @return {Char[]} 変換されたCharオブジェクトの配列
     */
    _charsFromString(str) {
        const ret = [];
        const cursorChar = this.getChar();
        for (let char of str) {
            const newChar = new Char(cursorChar.createData(char));
            ret.push(newChar);
        }
        return ret;
    }

    /**
     * カーソル位置でバックスペースを押下した時の処理を行います
     * @param {boolean} [useUndo] Undoスタックに積む場合はtrue
     * @return {Cursor} 自身のインスタンス
     */
    backSpace(useUndo) {
        const cursorChar = this.getChar();
        if (!cursorChar.prev()) { // 文章先頭からのバックスペースは何もしない
            return this;
        }

        // 段落先頭からのバックスペースでは、前の行に段落をつなげる
        if (cursorChar.isFirst() && cursorChar.row().isFirst()) {
            const cursorParagraph = cursorChar.row().paragraph();
            const newParagraph = cursorParagraph.prev(); // 融合先の段落
            for (let moveRow of cursorParagraph.rows()) {
                moveRow.moveLastBefore();
            }
            newParagraph.cordinate().checkKinsoku();
            // FIXME: 最終行が表示されている状態でbackSpace()すると、
            //     カーソル行が表示されているために表示開始行が変わらず、行数が足りているにも関わらず表示行数が少なくなってしまう
            this.sentenceContainer().changeDisplay().breakPage().printInfo().isChanged(true);
            return this;
        }

        //  段落先頭以外からのバックスペース
        //  カーソルの前の位置にある文字を削除する(行頭なら行をまたいで前の文字)
        if (!(cursorChar.isFirst() && cursorChar.row().isFirst())) {
            if (useUndo) {
                this.sentenceContainer().addDo(new DeleteDoMemory(this, [cursorChar.prevChar()]));
            }
            cursorChar.prevChar().delete();
            this.sentenceContainer().changeDisplay().breakPage().printInfo().isChanged(true);
            return this;
        }
    }

    /**
     * カーソル位置で改行した時の処理を行います
     * @param {boolean} [useUndo] Undoスタックに積む場合はtrue
     * @return {Cursor} 自身のインスタンス
     */
    lineBreak(useUndo) {
        // 段落の分割
        const cursorParagraph = this.getParagraph().divide(this.getChar());
        // 新しくできた段落の最初の文字にカーソルを移動する
        const newParagraph = cursorParagraph.next(); // divide()で新しく挿入された段落
        newParagraph.firstChild().firstChild().addCursor().setPosMemory();
        // HACK:changeDisplay()を二回続けている:新しい段落がdisplayされて表示されるので、最終表示行から改行した場合にカーソル行が表示から外れる(最終表示行とカーソル行が等しいため、表示開始行を変えずに表示)
        // かといって新しい段落を非表示にしてから挿入すると、表示行が文章コンテナを埋めていない状態の時に改行すると表示開始行が毎回ひとつ後ろにずれる(カーソル行が最終表示行より後ろにあるため)という現象が起こるので、行数が十分にあっても表示行が不足してしまう
        this.sentenceContainer()
            .changeDisplay().changeDisplay().breakPage().printInfo().isChanged(true);
        if (useUndo) {
            this.sentenceContainer().addDo(new LineBreakDoMemory(this));
        }
        return this;
    }//}}}

    // --カーソル操作 {{{

    // カーソル移動
    /**
     * カーソルを下方向に一つ動かします。ひとつ下が段落途中のEOLなら、さらにその次に動かします
     * @param {boolean} bShift シフトキーが押されていればtrue、そうでなければfalseを指定する
     * @return {Cursor} 自身のインスタンス
     */
    moveNext(bShift) {
        const nextChar = this.getChar().next();
        if (!nextChar) {
            return this;
        }

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
        if (!prevChar) {
            return this;
        }

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
    moveRow(row, bShift) {
        const index = this.getPosMemory();
        if (!row) {
            return this;
        }

        // 同じインデックスの文字がprevRowに存在しなければ、children()内でlastChild()が選択される
        const char = row.children(index);
        char.slidePrevCursor().addCursor(bShift);
        return this;
    }

    /**
     * num行目の最初の文字にカーソルを移動します。移動先の行が中央となるように表示されます
     * @param {number} num 移動先が何行目か。１から始まる。ページ内ではなく、文章全体で数える。０位下が渡されると最初の行に移動される
     * @return {Cursor} 自身のインスタンス
     */
    jumpRow(num) {
        if (typeof num !== 'number') {
            return this;
        }

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
        if (typeof num !== 'number') {
            return this;
        }

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
        const next = this._nextSearchChar();
        if (!next) { return this; }
        next.addCursor().setPosMemory();
        this.sentenceContainer().changeDisplay();
        return this;
    }

    /**
     * 次の検索語句を返します
     * @return {Char} 次の検索語句の１文字目のインスタンス。見つからなければnull
     */
    _nextSearchChar() {
        for (let char = this.getChar().nextChar() || this.sentenceContainer().firstChar();
            !char.is(this.getChar());
            char = char.nextChar() || this.sentenceContainer().firstChar()) {
                if (char.hasClass('search-label')) {
                    return char;
                }
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
        for (let char = this.getChar().prevChar() || this.sentenceContainer().lastChar();
            !char.is(this.getChar());
            char = char.prevChar() || this.sentenceContainer().lastChar()) {
                if (char.hasClass('search-label')) {
                    return char;
                }
            }
        return null;
    }

    // カーソル移動前に、selectionにカーソル位置を覚えさせる
    /**
     * 何も選択されていない状態の場合に、Selectionにカーソル位置を覚えさせます
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
    }//}}}
}//}}}
