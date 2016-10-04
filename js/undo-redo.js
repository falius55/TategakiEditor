'use strict';
/**
 * Undo,Redoを担当するクラス
 *     Undo可能な操作を行った際に、addメソッドを使ってDoMemoryクラスの操作に対応するサブクラスを追加してください
 *     そうすることでDoManagerクラスのundoメソッド、redoメソッドで各操作に対するundo,redoを統一された操作によって行うことが可能になります
 */
class DoManager {
	constructor(sentenceContainer) {
		this._sentenceContainer = sentenceContainer;
		this._undos = [];
		this._redos = [];
	}
	/**
	 * Undo可能かどうかを検査します
	 * @return Undoのスタックに要素が残っていればtrue、そうでなければfalse
	 */
	hasUndo() {
		return this._undos.length > 0;
	}
	/**
	 * Redo可能かどうかを検査します
	 * @return Redoのスタックに要素が残っていればtrue、そうでなければfalse
	 */
	hasRedo() {
		return this._redos.length > 0;
	}

	undo() {
		const doMemory = this._undos.pop();
		doMemory.undo();
		this._redos.push(doMemory);
		this._sentenceContainer.isChanged(true);
		return this;
	}
	redo() {
		const doMemory = this._redos.pop();
		doMemory.redo();
		this._undos.push(doMemory);
		this._sentenceContainer.isChanged(true);
		return this;
	}

	/**
	 * undo可能な新たな操作を行った場合に、対応するDoMemoryオブジェクトを追加します
	 * @param {DoMemory} memory 追加するDoMemoryオブジェクト
	 * @return {DoManager} 自身のインスタンス
	 */
	add(memory) {
		this._undos.push(memory);
		this._redos = [];
		return this;
	}

	reset() {
		this._undos = [];
		this._redos = [];
	}
}
/**
 * Undo, Redoを記憶するすべてのオブジェクトの基底クラス
 */
class DoMemory {
	constructor() {
	}
	/**
	 * Undoします
	 * このメソッドは、サブクラスでオーバーライドする必要があります
	 */
	undo() {
		throw new Error('このメソッドは、サブクラスでオーバーライドする必要があります');
	}
	/**
	 * Redoします
	 * このメソッドは、サブクラスでオーバーライドする必要があります
	 */
	redo() {
		throw new Error('このメソッドは、サブクラスでオーバーライドする必要があります');
	}
}
/**
 * 文字をカーソルから入力した際のUndo,Redoを担当するクラス
 */
class PrintDoMemory extends DoMemory {

	/**
	 * @param {Cursor} cursor カーソルオブジェクト
	 * @param {Char[]} targets 対象となる文字の配列
	 */
	constructor(cursor, targets) {
		super();
		this._cursor = cursor;
		this._memoryChar = cursor.getChar();
		this._targets = targets;
	}

	undo() {
		this._cursor.setChar(this._memoryChar);
		for (let i = 0, len = this._targets.length; i < len; i++)
			this._cursor.backSpace();
		return this;
	}
	redo() {
		this._cursor.setChar(this._memoryChar);
		this._cursor.insert(this._targets);
		return this;
	}
}
/**
 * 文字をカーソルから削除した際のUndo,Redoを担当するクラス
 */
class DeleteDoMemory extends DoMemory {
	// TODO: backspaceで段落をつなげた際のUndo,Redoは別途作成すること
	/**
	 * @param {Cursor} cursor カーソルオブジェクト
	 * @param {Char[]} targets 対象となる文字の配列
	 */
	constructor(cursor, targets) {
		super();
		this._cursor = cursor;
		this._memoryChar = cursor.getChar();
		this._targets = targets;
	}

	undo() {
		this._cursor.setChar(this._memoryChar);
		this._cursor.insert(this._targets);
		return this;
	}
	redo() {
		this._cursor.setChar(this._memoryChar);
		for (let i = 0, len = this._targets.length; i < len; i++)
			this._cursor.backSpace();
		return this;
	}
}

class LineBreakDoMemory extends DoMemory {

	constructor(cursor) {
		super();
		this._cursor = cursor;
		this._memoryChar = cursor.getChar();
	}
	undo() {
		this._cursor.setChar(this._memoryChar)
			.backSpace();
		return this;
	}
	redo() {
		this._cursor.setChar(this._memoryChar)
			.lineBreak();
		return this;
	}
}

class ColorDoMemory extends DoMemory {
	/**
	 * このクラスでは古い文字色も情報として必要となるので、必ず文字色変更前に作成してください
	 */
	constructor(targets, newColor) {
		super();
		this._targets = targets;
		this._oldColors = targets.map(char => char.color());
		this._newColor = newColor;
	}

	undo() {
		for (let entry of this._targets.entries())
			entry[1].color(this._oldColors[entry[0]]);
		return this;
	}
	redo() {
		for (let char of this._targets)
			char.color(this._newColor);
		return this;
	}
}
class ItalicDoMemory extends DoMemory {
	/**
	 * このクラスでは古い状態も情報として必要となるので、必ず文字の変更前に作成してください
	 */
	constructor(targets, blNew) {
		super();
		this._targets = targets;
		this._olders = targets.map(char => char.italic());
		this._blNew = blNew;
	}

	undo() {
		for (let entry of this._targets.entries())
			entry[1].italic(this._olders[entry[0]]);
		return this;
	}
	redo() {
		for (let char of this._targets)
			char.italic(this._blNew);
		return this;
	}
}
class BoldDoMemory extends DoMemory {
	/**
	 * このクラスでは古い状態も情報として必要となるので、必ず文字の変更前に作成してください
	 */
	constructor(targets, blNew) {
		super();
		this._targets = targets;
		this._olders = targets.map(char => char.bold());
		this._blNew = blNew;
	}

	undo() {
		for (let entry of this._targets.entries())
			entry[1].bold(this._olders[entry[0]]);
		return this;
	}
	redo() {
		for (let char of this._targets)
			char.bold(this._blNew);
		return this;
	}
}
class FontSizeDoMemory extends DoMemory {
	/**
	 * このクラスでは古い状態も情報として必要となるので、必ず文字の変更前に作成してください
	 */
	constructor(targets, newSize) {
		this._targets = targets;
		this._olders = targets.map(char => char.fontSize());
		this._newSize = newSize;
	}
	undo() {
		for (let entry of this._targets.entries())
			entry[1].fontSize(this._olders[entry[0]]);
		return this;
	}
	redo() {
		for (let char of this._targets)
			char.fontSize(this._newSize);
		return this;
	}

	// TODO: align
}
