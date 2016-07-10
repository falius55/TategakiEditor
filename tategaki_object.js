// ===========================================================================
// 	オブジェクト化(label:object)
// ===========================================================================
var user = new User(getUserID());
function User(id){
	$.extend(this,{
		get id(){ return id; },
		get info(){ return document.getElementById('user-info'); },
	});
}
(function(){
	var num = 0;
	$.extend(User.prototype,{
		alert:function(str){
			this.info.textContent = str;
		},
		// 定数
		get INSERT_MODE(){ return num++; },
		get INPUT_MODE(){ return num++; },
		get CONVERT_MODE(){ return num++; },
		get COMMAND_MODE(){ return num++; },
		get FIND_MODE(){ return num++; },
		get MODAL_MODE(){ return num++; },
		isInsertMode: function(){
			var mode = 0;
			return mode == this.INSERT_MODE;
		},
		changeMode: function(newMode){
			var oldMode = this.info.dataset.mode;
			this.info.dataset.mode = newMode;
			switch(oldMode){
				case this.INSERT_MODE:
					break;
				case this.INPUT_MODE:
					break;
				case this.CONVERT_MODE:
					break;
				case this.COMMAND_MODE:
					break;
				default:
					break;
			}
			switch(newMode){
				case this.INSERT_MODE:
					document.addEventListener('keydown',keyEvent,false);
					break;
				case this.INPUT_MODE:
					break;
				case this.CONVERT_MODE:
					break;
				case this.COMMAND_MODE:
					break;
				case this.FIND_MODE:
					break;
				default:
					break;
			}
		},
		keydownOnInsertMode: function(e){
			var keycode = getKeyCode(e);
			if (e.ctrlKey) {
				this.keydownOnInsertModeWithCTRL(e);
				return;
			}
			switch (keycode) {
				case 8:
					// backspace
					var $delChar = $('.cursor').prev();
					deleteCharacter($delChar,$('.cursor-row'));
					checkKinsoku();
					break;
				case 13:
					// Enter
					lineBreak();
					checkKinsoku();
					break;
				case 32:
					// space
					insertStringFromCursor("　");
					checkKinsoku();
					break;
				case 37:
					// Left
					Cursor.shiftLeft();
					break;
				case 38:
					// Up
					Cursor.prev();
					break;
				case 39:
					// Right
					Cursor.shiftRight();
					break;
				case 40:
					// Down
					Cursor.next();
					break;
				case 58: // firefox developer edition
				case 186: // chrome
					// :
					startCommandMode();
					user.changeMode(user.COMMAND_MODE);
					break;
				case 191:
					// /
					startFindMode();
					user.changeMode(user.FIND_MODE);
					break;
				default:
					// bufferの更新
					console.log('draft key');
					var newInputStr;
					if (e.shiftKey) {
						newInputStr = key_table.shift_key[String(keycode)];
					}else{
						newInputStr = key_table.getString("",keycode);
					}
					if(newInputStr == null){
						break;
					}
					insertStringToInputBuffer(newInputStr);
					user.changeMode(user.INPUT_MODE);
					break;
			}
			// displayrow
			// reDisplay();
			changeDisplayRow(false);
			addPageBreak();
			printDocInfo();
		},
		keydownOnInsertModeWithCTRL: function(e){
			var $inputBuffer = $('#input-buffer');
			var textcheck = true;
			switch (keycode) {
				case 18:
				case 70:
					// f
					readyFileModal();
					$('#file-list-modal').modal();
					break;
				case 66:
					// b
				case 68:
					// d
					var $delChar = $('.cursor').prev();
					deleteCharacter($delChar,$('.cursor-row'));
					break;
				case 190:
					// .
					findPrev();
					break;
				case 79:
					// o
					openPrevFile();
					textcheck = false;
					break;
				case 188:
					// ,
					findNext();
					break;
				case 73:
					// i
					openNextFile();
					textcheck = false;
					break;
				case 72:
					// h
					Cursor.shiftLeft();
					break;
				case 74:
					// j
					Cursor.next();
					break;
				case 75:
					// k
					Cursor.prev();
					break;
				case 76:
					// l
					Cursor.shiftRight();
					break;
				case 78:
					// n
					break;
				case 83:
					// s
					saveJsonFile();
					textcheck = false;
					break;
				default:
					break;
			}
			// 非同期通信を伴う処理を行う場合はタイムラグが生じてしまうので、文章チェックはしない
			if (textcheck) {
				// 禁則処理
				checkKinsoku();
				// displayrow
				// reDisplay();
				changeDisplayRow(false);
				addPageBreak();
				printDocInfo();
			}
		},
		Mode: function(){
			var a = 0;
			return {
				get a(){ return a++; }
			};
		}()
	}
	);
})();
var chars = (function(){
	var data = [];
	return {
		push: function(d){
			if(d.type == "char"){
				data.push(d);
			}
		},
		get: function(index){
			return data[index];
		},
		del: function(){
		}
	};
})();
function createCharChain(){
	console.time('char chain');
	var draft = window.draft = new Draft(document.getElementById('vertical-draft'));
	draft.paragraph = [];
	draft.row = [];
	draft.char = [];
	var paras = draft.elem.getElementsByClassName('vertical-paragraph');
	var rows;
	var chars;
	var prevPara = null;
	var prevRow = null;
	var prevChar = null;
	var currentPara;
	var currentRow;
	var currentChar;
	var cnt_para;
	var cnt_row;
	var cnt_char;
	var row_index = 0;
	var char_index = 0;
	for(var para_i=0,cnt_para=paras.length;para_i<cnt_para;para_i++){
		currentPara = draft.paragraph[para_i] =  new Paragraph(para_i,paras[para_i],draft);
		draft.pushChild(currentPara);
		if(prevPara) prevPara.next = currentPara;
		currentPara.prev = prevPara;
		prevPara = currentPara;
		rows = currentPara.elem.getElementsByClassName('vertical-row');
		for(var row_i=0,cnt_row=rows.length;row_i<cnt_row;row_i++){
			currentRow = draft.row[row_index] = new Row(row_index++,rows[row_i],currentPara);
			currentPara.pushChild(currentRow);
			if(prevRow) prevRow.next = currentRow;
			currentRow.prev = prevRow;
			prevRow = currentRow;
			chars = currentRow.elem.getElementsByClassName('vertical-char');
			for(var char_i=0,cnt_char=chars.length;char_i<cnt_char;char_i++){
				if(chars[char_i].classList.contains('EOL')){
					currentRow.EOL = currentChar;
				}
				currentChar = draft.char[char_index] = new Char(char_index++,chars[char_i],currentRow);
				currentRow.pushChild(currentChar);
				if(prevChar) prevChar.next = currentChar;
				currentChar.prev = prevChar;
				prevChar = currentChar;
			}
		}
	}
	console.timeEnd('char chain');
	console.log(window.draft);
	return window.aChar = currentChar.first();
}
function Draft(_elem){
	var _children = [];
	var _classArr = _elem.className.match(/\S+/g) || [];
	var _gc = false;
	$.extend(this,{ 
		elem: _elem,
		length: 0,
		parent: null,
		get gc(){
			return _gc;
		},
		set gc(n){
			if(n == true || n == false){
				_gc = n;
			}
		},
		// get length(){ return this.children.length; },
		get children(){ return _children; },
		get classArr(){ return _classArr },
		set classArr(n){
			if(n.isArray()) _classArr = n;
		},
	});
}
$.extend(Draft.prototype,{
	get type(){ return "draft" },
	cursorChar: null,
	cursorRow: null,
	hasablechild: function(){ return true; },
	pushChild: function(child){
		if(child.parent.type === this.type){
			this.children.push(child);
			this.length++;
			return this;
		}
		return undefined;
	},
	addChild: function(index,child){
		if(child.parent.type === this.type){
			this.children.splice(index,0,child);
			this.length++;
			return this;
		}
		return undefined;
	},
	removeChild: function(child){
		if(!(child.isChild(this))) return this;
		var index = this.children.indexOf(child);
		if(child.parent.type === this.type){
			this.children.splice(index,1);
			this.length--;
			return this;
		}
		return undefined;
	},
	child: function(index){
		if(this.hasChild) return this.children[index];
		return undefined;
	},
	firstChild: function(){
		if(this.hasChild()){
			return this.children[0];
		}
		return null;
	},
	lastChild: function(){
		if(this.hasChild()){
			return this.children[this.length -1];
		}
		return null;
	},
	childFromElem: function(elem){
		var len = this.length;
		var ret = null;
		for(var i=0;i<len;i++){
			if(this.children[i].elem == elem){
				ret = this.children[i];
			}
		}
		return null;
	},
	hasChild: function(){
		return this.length > 0;
	},
	eachChild: function(fn){
		var cnt = 0;
		var len = this.length;
		// console.log(this.type + ' children:'+ _children);
		for(var i=0;i<len;i++){
			fn(this.children[i]);
			cnt++;
		}
		return cnt;
	},
	charCount: function(){
		var cnt = 0;
		this.eachChild(function(child){
			cnt += child.charCount;
		});
		return cnt;
	},
	strClass : function(){
		console.log('strClass');
		return this.elem.className;
	},
	hasClass: function(strClass){
		return this.classArr.includes(strClass);
	},
	isEOL: function(){
		return this.hasClass("EOL");
	},
	gavage: function(){
		var children = this.elem.children;
		if(!children || children[0].nodeType == document.TEXT_NODE){ return; }
		var child;
		var obj;
		var len = children.length;
		for(var i=0;i<len;i++){
			child = children[i];
			obj = this.childFromElem(child);
			if(obj){
				obj.gavage();
			}else{
				this.elem.removeChild(child);
			}
		}
	},
});
function Paragraph(_index,_elem,_parent){
	Draft.call(this,_elem);
	var _draft = _parent;
	var _prev = null;
	var _next = null;
	$.extend(this,{
		index : _index,
		get draft(){ return _draft },
		parent: _parent,
		get prevChar(){
			// 文字のみを追っていく(charの場合)
			if(_prev && _prev.isEOL()) return _prev.prev;
			return _prev;
		},
		get prev(){
			// EOL含めて
			return _prev;
		},
		set prev(n){
			if((typeof n == "object" && n.type == this.type) || n == null) _prev = n;
		},
		get nextChar(){
			if(_next && _next.isEOL()) return _next.next;
			return _next;
		},
		get next(){
			return _next;
		},
		set next(n){
			if((typeof n == "object" && n.type == this.type) || n == null) _next = n;
		},
	});
}
Paragraph.prototype = Object.create(Draft.prototype);
$.extend(Paragraph.prototype,{
	get type(){ return "paragraph" },
	first: function(){
		var first = this;
		while(first.prev){
			first = first.prev;
		}
		return first;
	},
	last : function(){
		var last = this;
		while(last.next){
			last = last.next;
		}
		return last;
	},
	isChild: function(parent){
		return this.parent == parent;
	},
	incrementAfterIndex: function(){
		this.index++;
		if(this.next) this.next.incrementAfterIndex();
	},
	decrementAfterIndex: function(){
		this.index--;
		if(this.next) this.next.decrementAfterIndex();
	},
	resetAfterIndex: function(){
		var obj = this.first();
		var index = 0;
		do{
			obj.index = index;
			obj = obj.next;
			index++;
		}while(obj);
		return this;
	},
	indexOf: function(elem){
		var obj = this.fromElem(elem);
		if(obj == null) return -1;
		return obj.index;
	},
	fromElem: function(elem){
		var obj = this.first();
		while(obj && obj.elem != elem){
			obj = obj.next;
		}
		return obj;
	},
	get: function(index){
		// var obj = this.first();
		// while(obj && obj.index != index){
		// 	obj = obj.next;
		// }
		// return obj;
		return window.draft[this.type][index];
	},
	strAllClass:function(){
		return this.classArr.join(" ");
	},
	text: function(){
		console.log('in text()');
		var ret = "";
		this.eachChild(function(child){
			ret += child.text();
		});
		return ret;
	},
	replaceElem: function(){
		// 画面反映まで
		// 自身をまるごと入れ替える
		var old = this.remakeElem();
		this.parent.replaceChild(this.elem,old);
		return this;
	},
	remakeElem: function(){
		// 古いエレメントが返ってくる
		var oldElem = this.elem;
		var newElem = document.createElement("div");
		newElem.setAttribute('class',this.strClass());

		var rows = this.children;
		var row;
		var charElem;
		var cnt = rows.length;
		for(var i=0;i<cnt;i++){
			row = rows[i];
			row.remakeElem();
			newElem.append(row.elem);
		}
		this.elem = newElem;
		return oldElem;
	},
	after: function(after){
		if(after.type != this.type) return null;
		if(after.prev) after.prev.next = after.next;
		if(after.next) after.next.prev = after.prev;
		after.next = this.next;
		after.prev = this;
		this.next = after;
		return this;
	},
	before: function(before){
		if(before.type != this.type) return null;
		if(before.prev) before.prev.next = before.next;
		if(before.next) before.next.prev = before.prev;
		before.prev = this.prev;
		before.next = this;
		this.prev = before;
		return this;
	},
	del: function(parent){
		console.log('parent:'+ parent);
		if(parent){
			console.log('second');
			if(parent.next == null && parent.prev == null){
				// 二段目
				// paragraphで最初に実行された場合のrow、かつrowが一行の場合のchar。
				// rowで最初に実行された場合のchar
				// 親は両サイドと接続を切っているので、両サイドのうち自分と異なる親を持つ方と接続を切る
				// paragraphで最初に実行され、rowが一行のみの場合はrowの両側と接続を切る。rowでは同じオブジェクトで二度実行されるが、二度目は何もしない。その場合、三段目のcharでも実行
				if(this.prev && this.prev.parent != parent){
					// parent.firstChild()
					var next = this;
					while((next = next.next) != null && next.parent == parent);
					this.prev.next = next;
					next.prev = this.prev;
					this.prev = null;
				}
				if(this.next && this.next.parent != parent){
					// parent.lastChild
					// var prev = this;
					// while((prev = prev.prev) != null && prev.parent == parent);
					// this.next.prev = prev;
					this.next = null;
				}
			}else if(parent.next == null || parent.prev == null){
				// 三段目
				// 親は片方とのみ接続を切っているので、親と同じサイドと接続を切る
				// paragraphで最初に実行され、rowが複数行の場合のcharでのみ実行されうる
				if(parent.next && this.prev.parent != parent){
					// 削除範囲の最初の文字
					// parent.nextで最初の行に所属していることを保証
					// this.prev.parent != parentで行の最初の文字であることを保証
					var next = this;
					while((next = next.next) != null && next.parent.parent == parent.parent);
					this.prev.next = next;
					next.prev = this.prev;
					this.prev = null;
				}
				if(parent.prev && this.isEOL()){
					// 削除範囲の最終文字
					// parent.prevで最終行に所属していることを保証
					// this.isEOL()で行の最終文字であることを保証
					// var prev = this;
					// while((prev = prev.prev) != null && prev.parent.parent == parent.parent);
					// this.next.prev = prev;
					this.next = null;
				}
			}else{
				// 親が接続を切っていないなら子も接続を切る必要がないので、再帰する前に終了
				return;
			}
		}else{
			// 一段目
			// 自分の両サイドと接続を切る
			if(this.parent.length == 1){
				// 自分を削除することで親の子供がいなくなる場合は、親から削除する
				this.parent.del();
				return;
			}
			if(!(this.isEOL())){
				if(this.prev) this.prev.next = this.next;
				if(this.next) this.next.prev = this.prev;
				this.next = null;
				this.prev = null;
				this.parent.removeChild(this);
				// this.parent.elem.removeChild(this.elem);
				this.parent = null;
			}
		}
		if(this.hasChild()){
			this.firstChild().del(this);
			this.lastChild().del(this);
		}
		return this;
	},
	changeParent: function(newParent){
		if(newParent.type == this.parent.type){
			this.parent.elem.removeChild(this.elem);

		}
	}
});
function Row(_index,_elem,_parent){
	Paragraph.call(this,_index,_elem,_parent)
		var _draft = _parent.draft;
	var _paragraph = _parent;
	// var _classArr = _elem.className.match(/decolation-\S+/g) || [];
	var _EOL = null;

	$.extend(this,{
		get draft(){ return _draft },
		paragraph: _parent,
		get EOL(){ return _EOL; },
		set EOL(n){ if(n.isEOL) _EOL = n; },
		get paragraph(){ return _paragraph },
		set paragraph(n){
			if(n.type == this.parent.type){
				_paragraph = n;
			}
		},
		parent: _parent,
	});
}
Row.prototype = Object.create(Paragraph.prototype);
$.extend(Row.prototype,{
	get type(){ return "row" },
	newInstance: function(str,paragraph){
		// 全く新しいインスタンス
		// この時点では他のインスタンスや要素と関連付けられていないし、
		// 画面にも反映されていない
		if(!(paragraph.type == "paragraph")) return undefined;
		var newElem = document.createElement("div");
		var strClass = "vertical-row display-row";
		newElem.setAttribute('class',strClass);
		var newInstance = new Row(-1,newElem,paragraph);

		var prevChar = null;
		var currentChar;
		var len = str.length;
		for(var i=0;i<len;i++){
			currentChar = Char.prototype.newInstance(str.charAt(i),newInstance);
			if(prevChar) prevChar.next = currentChar;
			currentChar.prev = prevChar;
			newInstance.pushChild(currentChar);
			newInstance.elem.append(currentChar.elem);
		}
		newInstance.elem.append(currentChar = document.createElement("span"));
		currentChar.setAttribute("class","vertical-char EOL");
		return newInstance;
	},
	remakeElem: function(){
		// 古いエレメントが返ってくる
		var oldElem = this.elem;
		var newElem = document.createElement("div");
		newElem.setAttribute('class',this.strClass());
		var EOL = document.createElement("span");
		EOL.setAttribute("class","vertical-char EOL");
		newElem.append(EOL);

		var chars = this.children;
		var char;
		var charElem;
		var cnt = chars.length;
		for(var i=0;i<cnt;i++){
			char = chars[i];
			char.remakeElem();
			EOL.before(char.elem);
		}
		this.EOL = EOL;
		this.elem = newElem;
		return oldElem;
	},
	bringChildFromNext: function(){
		// 次の行以降の最初の文字を、自分の最後に移動する
		// var $nextRow = $bringRow.nextAll('.vertical-row').first();
		// if(!($nextRow[0])) return;
		if(this.parent != this.next.parent) return;
		// var $bc = $nextRow.children('.vertical-char:first-of-type');
		var bc = this.next.firstChild();
		// if($bc.hasClass('EOL')){
		if(bc.isEOL()){
			// 次の行が空行ならその行を削除
			// $nextRow.remove();
			this.next.del();
			return;
		}
		// if ($bc.next().hasClass('EOL')) {
		if (bc.next.isEOL()) {
			// 削除すると空行ができる場合
			// $bringRow.children('.EOL').before($bc);
			this.EOL.elem.before(bc.elem);
			// $nextRow.remove();
			this.next.del();
			return;
		}
		// $bc.remove();
		// $bringRow.children('.EOL').before($bc);
		bc.parent = this;
		bc.elem.romove();
		this.EOL.elem.before(bc.elem);
		// backChar($nextRow);
		// 再帰は同一段落内で完結
		backChar(this.next);

		return this;
	}
	});
							  function Char(_index,_elem,_parent){
								  Row.call(this,_index,_elem,_parent)
									  var _row = _parent;
								  var _paragraph = _parent.parent;
								  var _draft = _paragraph.draft;
								  var _char = _elem.textContent;
								  var _bBold = this.classArr.includes("decolation-font-bold");
								  var _color = _elem.className.match(/decolation-color-(\S)+/);
								  _color?_color=_color[1]:null;
								  if(_elem.classList.contains("cursor")){
									  Draft.prototype.cursorChar = this;
									  Draft.prototype.cursorRow = _parent;
								  }

								  $.extend(this,{
									  get draft(){ return _draft },
									  paragraph: _paragraph,
									  get row(){ return _row },
									  set row(n){
										  if(n.type == this.parent.type){
											  _row = n;
										  }
									  },
									  get char(){ return _char },
									  get color(){ return _color },
									  get bold(){ return _bBold},
									  set bold(n){ if(n == true || n == false) _bBold = n; },
									  // get strDecolation(){
									  // 	// return this.classArr.join(" ");
									  // return this.classArr.join(" ");
									  // }
								  }
								  );
							  }
							  Char.prototype = Object.create(Row.prototype);
							  $.extend(Char.prototype,{
								  get type(){ return "char" },
								  hasableChild: function(){ return false; },
								  toString : function(){
									  var c = this.text();
									  var htmlChar = "<span class='";
									  htmlChar += this.strClass();
									  htmlChar += "'>";
									  htmlChar += c;
									  htmlChar += "</span>";
									  return htmlChar;
								  },
								  classes : function(){
									  // return this.elem.className.match(/decolation-\S+/g) || [];
								  },
								  text: function(c){
									  console.log('char text()');
									  c = String(c);
									  if(c && c.length == 1){
										  this.elem.textContent = c;
									  }else{
										  return this.char;
									  }
									  return this;
								  },
								  addFont: function(kind){
									  var className;
									  switch(kind){
										  case 'bold':
											  this.bold = true;
											  className = "decolation-font-bold";
											  break;
									  }
									  // this.elem.classList.add(className);
									  if(!(this.classArr.includes(className))) this.classArr.push(className);
									  return this;
								  },
								  remakeElem: function(){
									  // 新しいエレメントを作る
									  var oldElem = this.elem;
									  var newElem = document.createElement("span");
									  newElem.setAttribute('class',this.strClass());
									  newElem.textContent = this.text();
									  this.elem = newElem;
									  return oldElem;
								  },
								  newInstance: function(c,row){
									  c = String(c);
									  if(!(row.type == "row") || c.length != 1) return undefined;
									  var newElem = document.createElement("span");
									  var strClass = "vertical-char display-char ";
									  if(key_table.dotList.indexOf(c) !== -1){
										  strClass += " vertical-dot";
									  }else if(key_table.beforeBracketList.indexOf(c) !== -1){
										  strClass += " vertical-before-bracket";
									  }else if(key_table.afterBracketList.indexOf(c) !== -1){
										  strClass += " vertical-after-bracket";
									  }else if(key_table.lineList.indexOf(c) !== -1){
										  strClass += " character-line";
									  }else if (/[a-z]/.test(c)){
										  strClass += " alphabet";
									  }else if (/[１-９]/.test(c)){
										  strClass += " number";
									  }else if (/[っゃゅょぁぃぅぇぉ]/.test(c)){
										  strClass += " yoin";
									  }
									  newElem.setAttribute('class',strClass);
									  newElem.textContent = c;
									  return new Char(-1,newElem,row);
								  },
								  charCount: function(){
									  if(this.isEOL) return 0;
									  return 1;
								  },
								  deleteCharacter:function($delChar,$rowOfDelChar) {
									  // $delChar: 削除文字
									  // $rowofdelchar: 削除文字のある行
									  if (!($delChar[0])) {
										  // 行頭からのBS
										  var $preRow = $rowOfDelChar.prevAll('.vertical-row').first();
										  if (!($preRow[0])) {
											  // 前の行が見つからない　＝　段落の最初
											  // 段落をつなげて次の処理へ
											  var $delParagraph = $rowOfDelChar.closest('.vertical-paragraph');
											  var $preParagraph = $delParagraph.prevAll('.vertical-paragraph').first();
											  var $mvRow = $delParagraph.children('.vertical-row:first-of-type');
											  var $preRow = $preParagraph.children('.vertical-row:last-of-type');
											  if (!($preRow[0])) {
												  // 段落をまたいでも前の行が見つからない＝文章の最初
												  return;
											  }
											  if ($mvRow.children('.vertical-char:first-of-type').hasClass('EOL')) {
												  // 空段落でBSを押した時、段落を削除するのみ
												  $delParagraph.remove();
												  // cursorの調整
												  var $newCursor = $preRow.children('.vertical-char:last-of-type').addCursor(false);
												  reDisplay();
												  Cursor.repositionCharNum();
												  return;
											  }

											  do{
												  // $delParagraphの行を$preParagraphに移動
												  $mvRow.remove();
												  $preParagraph.append($mvRow);
												  $mvRow = $delParagraph.children('.vertical-row:first-of-type');
											  }while($mvRow[0]);
											  $delParagraph.remove();
											  if($preRow.children().length >= getStringLenOfRow()){
												  // 前の段落の最終行が規定文字数あるようなら、段落をつなげて終わり
												  return;
											  }
										  }
										  // 行頭からのBSかつ段落の最初ではない
										  if ($preRow.children('.vertical-char').length < getStringLenOfRow()) {
											  // 前の行の文字数が規定数(30)文字ないとき、$rowOfDelCharの文字を前の行に持って行って埋める
											  var cnt = getStringLenOfRow() - ($preRow.children('.vertical-char').length -1); // lengthではEOLも含まれるので-1
											  for (var i = 0; i < cnt; i++) {
												  backChar($preRow);
											  }
											  reDisplay();
											  Cursor.repositionCharNum();
											  return;
										  }else{
											  // 前の行の文字数が規定文字ある時、前の行の最後の文字を削除文字にする
											  $delChar = $preRow.children('.EOL').prev();
											  $rowOfDelChar = $preRow;
										  }
									  }
									  backChar($rowOfDelChar); // 次の行から１文字持ってくる
									  var character = $delChar.text();
									  $delChar.remove();
									  if ($rowOfDelChar.children('.vertical-char:first-of-type').hasClass('EOL') && ($rowOfDelChar.prev())[0]) {
										  // 先にカーソルの調整($rowOfDelChar削除前にカーソル位置取得)
										  var $newCursor = $rowOfDelChar.prev().children('.vertical-char:last-of-type');
										  $newCursor.addClass('cursor');
										  // 最後の１文字を削除した場合はbackCharが反応しないので、その空行を削除(それが段落最後の行でなければ)
										  $rowOfDelChar.remove();
										  reDisplay();
									  }
									  Cursor.repositionCharNum();
									  return character;
								  }
							  });

