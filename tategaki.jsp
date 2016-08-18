<%@ page contentType="text/html;charset=utf-8" import="java.sql.*" %>
<!DOCTYPE html>
<html lang="ja">

	<html>
		<head>
			<meta charset="utf-8">
			<meta name="viewport" content="width=device-width, initial-scale=1">
			<title>縦書きエディタ</title>
			<!--
			<link rel="stylesheet" href="bootstrap-3.3.6-dist/css/bootstrap.min.css" media="screen">
		-->
			<link rel="stylesheet" href="honoka/css/bootstrap.min.css" media="screen">
			<link rel="stylesheet" href="tategaki.css">
			<link rel="stylesheet" href="tategaki-character-decolation.css">
			<link rel="stylesheet" href="verticalprint.css" media="print">
		</head>
		<body>
			<%
			// セッションからユーザーIDを取得
			String userId = (String)session.getAttribute("userid");
			String username = (String)session.getAttribute("username");
			%>
			<h1 id="site_title" data-user-id="<%= userId %>">縦書きエディタ</h1>
			<nav class="nav navbar-default navbar-fixed-top">
				<ul class="nav navbar-nav">
					<li>
						<div class="btn-group">
							<button class="btn btn-primary dropdown-toggle" data-toggle="dropdown">ファイル<span class="caret"></span></button>
							<ul class="dropdown-menu">
								<li><a id="menu_new"> 新規作成 </a></li>
								<li> <a data-toggle="modal" href="#file_list_modal" id="modal_fileopen_link"> 開く </a> </li>
								<li><a id="menu_save"> 保存 </a></li>
								<li><a id="menu_delete"> 削除 </a></li>
							</ul>
						</div>
					</li>
					<li><button class="btn btn-primary" href="#configue-modal" data-toggle="modal">設定</button></li>
					<li><button class="btn btn-primary" href="#help_modal" data-toggle="modal">ヘルプ</button></li>
					<li><button class="btn btn-primary" id="test">test</button></li>
				</ul>
				<ul class="nav navbar-nav navbar-right">
					<li><div class="navbar-brand alert alert-info" role="alert" id="user_info"></div></li>
					<li><a class="navbar-brand" href="/tategaki/Logout">Logout</a></li>
				</ul>
			</nav>

			<div id="app_container">
				<input type="text" id="file_title" data-file-id="-1" value="newfile"></input>
				<div id="cursor_line"></div>
					<div id="sentence_container"> </div>
				<div class="doc-info">
					文字:<span class="str-num">-</span>/<span class="str-len">-</span>&nbsp;
					行:<span class="row-num">-</span>/<span class="row-len">-</span>&nbsp;
					ページ:<span class="page-num">-</span>/<span class="page-len">-</span>&nbsp;
					最終更新日時:<span class="saved">-</span>
				</div>
				<div id="input_buffer" class="row"><span class="char EOL display"></span></div>
				<div id="convert_container"></div>
				<input type="text" id="command"></input>
				<input type="text" id="find"></input>
			</div>

			<nav id="palette" class="nav navbar-default">

					<ul class="nav navbar-nav">
						<li>
							<div class="btn-group">
								<button type="button" id="color_btn" class="btn btn-default navbar-btn"><span class="glyphicon glyphicon-text-color"></span></button>
								<button type="button" class="btn btn-default dropdown-toggle navbar-btn" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"> <span class="caret"></span> </button>
								<ul class="dropdown-menu">
									<li id="select_color_black"><a href="#">black</a></li>
									<li id="select_color_red" class="select-red"><a href="#">red</a></li>
									<li id="select_color_blue" class="select-blue"><a href="#">blue</a></li>
								</ul>
							</div>
						</li>
							<li id="btn-bold"><a href="#"><span class="glyphicon glyphicon-bold"></span></a></li>
							<li id="btn-italic"><a href="#"><span class="glyphicon glyphicon-italic"></span></a></li>
							<li>
								<div class="input-group">
									<div class="input-group-btn">
										<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><span class="glyphicon glyphicon-text-size"></span><span class="caret"></span></button>
										<ul class="dropdown-menu" role="menu">
											<li><a href="#" id="select-font-8">8</a></li>
											<li><a href="#" id="select-font-14">14</a></li>
											<li><a href="#" id="select-font-30">30</a></li>
											</ul>
										</div>
										<input type="text" id="input_text_size" class="form-control" value="14" aria-label="text size"></input>
									</div>
							</li>
							<li>
								<div class="btn-group">
									<button type="button" id="text-btn-left" class="btn btn-default"><span class="glyphicon glyphicon-align-left"></button>
									<button type="button" id="text-btn-center" class="btn btn-default"><span class="glyphicon glyphicon-align-center"></button>
									<button type="button" id="text-btn-right" class="btn btn-default"><span class="glyphicon glyphicon-align-right"></button>
								</div>
							</li>
					</ul>
				</nav>

			<div class="modal fade" id="file_list_modal" data-backdrop="static">
				<div class="modal-dialog">
					<div class="modal-content">
						<div class="modal-header">
							<button class="close" data-dismiss="modal">&times;</button>
							<h4 class="modal-title modal-title-open">ファイルを開く</h4>
							<h4 class="modal-title modal-title-command">検索結果</h4>
						</div>
						<div class="modal-body">
							<ul id="file_list"> </ul>
						</div>
						<div class="modal-footer">
							<div class="form-group">
								<label for="search_file" class="control-label"><span class="glyphicon glyphicon-search" aria-hidden="true"></span>ファイルを検索 </label>
								<input type="text" name="search_file" id="search_file" class="form-control" placeholder="ファイル名"></input>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class="modal fade" id="configue-modal" data-backdrop="static">
				<div class="modal-dialog">
					<div class="modal-content">
						<div class="modal-header">
							<button class="close" data-dismiss="modal">&times;</button>
							<h4 class="modal-title modal-title-open">設定</h4>
							</div>
						<div class="modal-body">
							<form action="#" name="conf-form">
								<fieldset>
									<div class="form-group">
										<label for="str_len" class="control-label">文字数</label>
										<input type="text" name="str_len" id="conf-str-len" class="form-control"></input>
									</div>
									<div class="form-group">
										<label for="row_len" class="control-label">行数</label>
										<input type="text" name="row_len" id="conf-row-len" class="form-control"></input>
									</div>
									<div class="form-group">
										<label for="str_size" class="control-label">文字の大きさ</label>
										<input type="radio" name="str_size" value="big" id="conf_str_size_big">大</input>
										<input type="radio" name="str_size" value="middle" id="conf_str_size_middle" checked>中</input>
										<input type="radio" name="str_size" value="small" id="conf_str_size_small">小</input>
										</div>
									<div class="form-group">
										<button class="btn btn-primary">Save</button>
										<button type="reset" class="btn btn-primary">Reset</button>
									</div>
								</fieldset>
							</form>
							</div>
						<div class="modal-footer">
							</div>
						</div>
					</div>
				</div>

			<div class="modal fade" id="help_modal">
				<div class="modal-dialog">
					<div class="modal-content">
						<div class="modal-header">
							<button class="close" data-dismiss="modal">&times;</button>
							<h4 class="modal-title modal-title-open">ヘルプ</h4>
							</div>
							<div class="modal-body">
								<ul class="nav nav-tabs" role="tablist">
									<li role="presentation" class="active"><a href="#help_shortcut" aria-controls="help_shortcut" role="tab" data-toggle="tab">ショートカットキー</a></li>
									<li role="presentation"><a href="#help_command" aria-controls="help_command" role="tab" data-toggle="tab">コマンド</a></li>
								</ul>
								<div class="tab-content">
									<div role="tabpanel" class="tab-pane active" id="help_shortcut">
									<ul>
										<li> &lt;CTL-J&gt;&nbsp;カーソル移動[Down]</li>
										<li> &lt;CTL-K&gt;&nbsp;カーソル移動[Up]</li>
										<li> &lt;CTL-L&gt;&nbsp;カーソル移動[Right]</li>
										<li> &lt;CTL-H&gt;&nbsp;カーソル移動[Left]</li>
										<li> &lt;CTL-D&gt;&nbsp;カーソルの前にある文字を１文字削除[BackSpace]</li>
										<li> &lt;CTL-S&gt;&nbsp;ファイルを上書き保存</li>
										<li> &lt;CTL-,&gt;&nbsp;同じディレクトリ内の次のファイルを開く</li>
										<li> &lt;CTL-.&gt;&nbsp;同じディレクトリ内の前のファイルを開く</li>
										<li> &lt;CTL-F&gt;&nbsp;「ファイルを開く」ダイアログを開く</li>
										<li> &lt;CTL-I&gt;&nbsp;次の検索語句に進む</li>
										<li> &lt;CTL-O&gt;&nbsp;前の検索語句に進む</li>
										<li> &lt;/&gt;&nbsp;語句検索を開始する</li>
										<li> &lt;CTL-C&gt;&nbsp;選択範囲をコピー</li>
										<li> &lt;CTL-V&gt;&nbsp;ペースト</li>
									</ul>
									</div>
									<div role="tabpanel" class="tab-pane" id="help_command">
									<ul>
										<li> &lt;:(w|s|save)&gt;&nbsp;ファイルを上書き保存</li>
										<li> &lt;:(w|s|save) ファイル名&gt;&nbsp;名前をつけて保存</li>
										<li> &lt;:(o|open|e|n(ew)?)&gt;&nbsp;「newfile」という名前でファイルを新規作成する</li>
										<li> &lt;:(o|open|e) ファイル名&gt;&nbsp;ファイルを開く</li>
										<li> &lt;:(n|new) ファイル名&gt;&nbsp;ファイル名」という名前でファイルを新規作成する</li>
										<li> &lt;:(jr|jumpr|jumprow) [1-9]+[0-9]*&gt;&nbsp;(指定した数値)行目にジャンプする</li>
										<li> &lt;:(jp|jumpp|jumppage) [1-9]+[0-9]*&gt;&nbsp;（指定した数値)ページ目の１行目にジャンプする</li>
										<li> &lt;:(d|del|delete)&gt;&nbsp;今開いているファイルを削除する</li>
										<li> &lt;:(d|del|delete) ファイル名&gt;&nbsp;「ファイル名」という名前のファイルを削除する</li>
										<li> &lt;:next&gt;&nbsp;次のファイルを開く</li>
										<li> &lt;:prev&gt;&nbsp;前のファイルを開く</li>
										<li> &lt;:(t|title|name) ファイル名&gt;&nbsp;現在開いているファイルの名前を「ファイル名」に変更する(これだけでは保存されません)</li>
										<li> &lt;:mkdir ディレクトリ名&gt;&nbsp;「ディレクトリ名」という名前でディレクトリを作成する</li>
										<li> &lt;:mv ファイル名 ディレクトリ名&gt;&nbsp;「ファイル名」を「ディレクトリ名」の中に移動する</li>
										<li> &lt;:deldir ディレクトリ名&gt;&nbsp;ディレクトリ「ディレクトリ名」を削除する</li>
										<li> &lt;:noh&gt;&nbsp;語句検索を終了する</li>
									</ul>
									</div>
								</div>
							</div>
						<div class="modal-footer">
							</div>
						</div>
					</div>
				</div>

			<script src="https://ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min.js"></script>
			<script src="/tategaki/jquery.mousewheel.js"></script>
			<script src="/tategaki/bootstrap-3.3.6-dist/js/bootstrap.min.js"></script>
			<script src="/tategaki/key_table.js"></script>
			<script>
			  var globalUserId = <%= userId %>;
			</script>
			<script src="/tategaki/object.js"></script>
			<script src="/tategaki/tategaki.js"></script>
		</body>
	</html>
