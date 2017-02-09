'use strict';
/* global AbstractHierarchy, ElemCreator, Util */

/**
 * ユーザーのファイル情報のひとつを扱うクラス
 */
class File extends AbstractHierarchy {//{{{
    // constructor {{{
    /**
     * @param {number} id ファイルのID
     * @param {string} filename ファイル名
     */
    constructor(id, filename) {
        super(ElemCreator.createFileElement(id,filename));
        this._link = this.elem().getElementsByTagName('a')[0];
        this._id = id;
        this._name = filename;
        this._nextFile = null;
        this._prevFile = null;
        this.addClickEventListener();
    }//}}}

    // --参照取得 {{{
    /**
     * 自身の属するファイルリストの参照を探して取得します
     * @return {FileList} 自身の属するファイルリストのインスタンス。見つからなければnull
     */
    fileList() {
        for (let parentDir = this.parent(); parentDir ;parentDir = parentDir.parent() )
            if (parentDir.isRoot())
            return parentDir;
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
    }//}}}

    // --判定 {{{
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
    }//}}}

    // --Status {{{
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
    }//}}}

    // --DOM操作 {{{
    /**
     * 文章コンテナに自身のファイルを非同期で読み込みます
     * @return {File} 自身のインスタンス
     */
    open() {
        const sentenceContainer = this.fileList().sentenceContainer();
        if (sentenceContainer.isChanged()) {
            sentenceContainer.announce('最後の変更が保存されていません');
            return this;
        }

        const data = {};
        data.user_id = sentenceContainer.userId();
        data.file_id = this.id();
        sentenceContainer.announce('読込中');
        Util.post('/tategaki/ReadJsonFile', data, json => sentenceContainer.init(json).isChanged(false).announce('読み込み完了'));
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
            if (json.result === 'false' || json.result === false) {
                console.log('ファイル削除エラーです(ファイル番号：'+ this.id() + ')');
                console.log('json.result', json.result);
                return;
            }

            const fileList = this.fileList();
            const sentenceContainer = fileList.sentenceContainer();
            // 現在開いているファイルを削除したなら、前後どちらかのファイルを開く
            // 同じディレクトリに他のファイルがなければ新しいファイルを開く
            // 最後に、ファイルリストを作り直す
            if (fileList.currentFile() === this) {
                const nextFile = this.nextFile() || this.prevFile();
                if (nextFile) {
                    nextFile.open();
                    fileList.read();
                    return;
                }
                if (!nextFile) {
                    sentenceContainer.newFile();
                    fileList.read();
                    return;
                }
            }
            fileList.read();
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
        Util.post('/tategaki/MoveFile',{
            user_id: fileList.sentenceContainer().userId(),
            file_id: this.id(),
            directory_id: newParentDir.id()
        }, data => fileList.read());
        return this;
    }//}}}

    // --イベント {{{
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
    }//}}}
}//}}}


/**
 * ユーザーのディレクトリ情報のひとつを扱うクラス
 */
class Directory extends AbstractHierarchy {//{{{
    // constructor {{{
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
        super(ElemCreator.createDirectoryElement(dirId,data));
        this._link = this.elem().getElementsByTagName('a')[0];
        this._innerList = this.elem().getElementsByTagName('ul')[0];

        this._id = parseInt(dirId);
        this._name = data.directoryname;
        for (let id in data) {
            if (id === 'directoryname') continue;
            if (typeof data[id] === 'string')
                this.append(new File(id,data[id]));
            if (typeof data[id] === 'object')
                this.append(new Directory(id,data[id]));
        }
    }//}}}

    // --参照取得 {{{
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
        for (let parentDir = this.parent(); parentDir; parentDir = parentDir.parent())
            if (parentDir.isRoot())
            return parentDir;
        return null;
    }

    /**
     * 自分の次のファイル(ディレクトリ、内部のファイルを除く)を探す
     * @return {File} 自分の次のファイル(ディレクトリ、内部のファイルを除く)。自分の後方にファイルがなければnull
     */
    findNextFile() {
        for (let fileList = this.fileList(), nextFile = fileList.findNextFile(this); nextFile; nextFile = fileList.findNextFile(nextFile))
            if (!this.contains(nextFile))
            return nextFile;
        return null;
    }//}}}

    // --判定 {{{
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

    /**
     * fileOrDirectoryがこのディレクトリ内にあるかどうかを判定します
     * @param {File Directory} fileOrDirectory 判定するファイル、またはディレクトリ
     * @return {boolean} 引数がこのディレクトリの中にあればtrue、そうでなければfalse
     */
    contains(fileOrDirectory) {
        for (let fileList = this.fileList(), parents = fileOrDirectory.parent(); parents !== fileList; parents = parents.parent())
            if (parents === this)
            return true;
        return false;
    }//}}}

    // --Status {{{
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
    }//}}}

    // --DOM操作 {{{
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
        console.log('delete option:', bl);
        Util.post('/tategaki/DeleteDirectory',{
            directory_id: this.id(),
            option: bl
        },function (data) {
            const fileList = this.fileList();
            fileList.read();
            if (data.result === 'within') {
                alert('ディレクトリが空ではないので削除できませんでした。');
                return;
            }

            // 現在開いているファイルが自分の中にある場合、自分の次のファイルを開く
            // 自分以降にファイルがなければ最初のファイル、それもなければ新しいファイルを開く
            if (this.contains(fileList.currentFile())) {
                const nextFile = this.findNextFile() || fileList.firstFile();
                if (nextFile) {
                    nextFile.open();
                } else {
                    fileList.sentenceContainer().newFile();
                }
            }

        }.bind(this));
        return this;
    }//}}}
}//}}}


/**
 * ファイルやディレクトリを一覧にするファイルリストを表すクラス
 */
class FileList extends AbstractHierarchy {//{{{
    // constructor {{{
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
        if (opt_data)
            this.init(opt_data);
        else
            this.read();
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
            if (typeof data[id] === 'string')
                this.append(new File(id,data[id]));
            if (typeof data[id] === 'object')
                this.append(new Directory(id,data[id]));
        }
        this.chainFile();
        return this;
    }//}}}

    // --参照取得 {{{
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
        for (let file = this.firstFile(); file; file = file.nextFile())
            if (file.isOpen())
            return file;
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
        this.each(file => {
            if (file.isDirectory()) return;
            if (file.id() === idOrName || (typeof idOrName === 'string' && new RegExp('^'+ idOrName +'$','i').test(file.name())))
                ret.push(file);
        });
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
        this.each(dir => {
            if (dir.isFile()) return;
            if (dir.id() === idOrName || (typeof idOrName === 'string' && new RegExp('^'+ idOrName +'$','i').test(dir.name())))
                ret.push(dir);
        });
        return ret;
    }//}}}

    // --判定 {{{
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
    }//}}}

    // --参照操作 {{{
    /**
     * 内部のFile同士をポインタでつなぎます
     * @return {FileList} 自身のインスタンス
     */
    chainFile() {
        let prev;
        this.each(file => {
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
        if (this.firstChild() === null) return this; // ファイルやディレクトリがひとつもない場合
        // fileに子があれば子に進み、なければ次に進む(子のあるディレクトリなら最初の子、fileか空ディレクトリなら次に進む)
        // 次がなければ親の次に進む。それでもなければさらに親の次、と繰り返す
        // その過程でルートディレクトリが見つかれば探索終了
        for (let file = this.firstChild(), temp = this;; temp = file, file = file.hasChild() ? file.firstChild() : file.next()) {
            if (!file) {
                for (let parentDir = temp.parent(); !(file = parentDir.next()); parentDir = parentDir.parent())
                    if (parentDir.isRoot()) return this;
            }
            func(file);
        }
        return this;
    }//}}}

    // --Style {{{

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
    }//}}}

    // --DOM操作 {{{

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
        while ((child = children[0]))
            this.elem().removeChild(child);
        return this;
    }

    /**
     * 各インスタンスの参照はそのままで、DOM要素のみを構築し直します
     * @return {FileList} 自身のインスタンス
     */
    resetList() {
        this.emptyElem();
        this.each(file => {
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
        this.each(file => {
            if (regexp.test(file.name()))
                this.elem().appendChild(file.elem());
        });
        if (this.elem().children.length === 0) {
            const li = document.createElement('li');
            li.textContent = '該当するファイルは見つかりませんでした。';
            this.elem().appendChild(li);
        }
        return this;
    }//}}}

    // ファイル操作(非同期通信)//{{{

    /**
     * ファイルリストをサーバーから読み込み、各インスタンスを構築し直します(非同期通信)
     * @return {FileList} 自身のインスタンス
     * @see ../WEB-INF/classes/doc/FileListMaker.html
     */
    read() {
        const userId = this.sentenceContainer().userId();
        Util.post('/tategaki/FileListMaker',{
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
        } else if (this.hasFile()) {
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
            this.sentenceContainer().announce('存在しないファイルです','red');
            return this;
        }

        if (fileLength === 1) {
            files[0].delete();
            return this;
        }

        if (fileLength > 0) {
            if (window.confirm('同一名のファイルが複数存在します。\nすべてのファイルを削除しますか。\nこのうちのどれかのファイルを削除する場合はキャンセルし、個別に削除してください。'))
                for (let i = 0,file; (file = files[i]); i++)
                file.delete();
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
        Util.post('/tategaki/DirectoryMaker',{
            user_id: this.sentenceContainer().userId(),
            directoryname: dirname,
            saved: Date.now()
        },function (data) {
            this.sentenceContainer().announce('ディレクトリを作成しました:'+ dirname);
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
    }//}}}

    // --イベント {{{

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
            keycode = e.keyCode;
        } else {
            // IE以外
            keycode = e.which;
        }
        if (keycode === 123) { return; } // F12のみブラウザショートカットキー
        if (keycode === 13) {
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
    }//}}}
}//}}}

