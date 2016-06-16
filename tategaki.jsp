<%@ page contentType="text/html;charset=utf-8" import="java.sql.*" %>
<!DOCTYPE html>
<html lang="ja">

	<html>
		<head>
			<meta charset="utf-8">
			<meta name="viewport" content="width=device-width, initial-scale=1">
			<title>縦書きエディタ</title>
			<link rel="stylesheet" href="bootstrap-3.3.6-dist/css/bootstrap.min.css" media="screen">
			<link rel="stylesheet" href="tategaki.css">
			<link rel="stylesheet" href="tategaki-character-decolation.css">
			<link rel="stylesheet" href="verticalprint.css" media="print">
		</head>
		<body>
			<%
			// セッションからユーザーIDを取得
			String userID = (String)session.getAttribute("userid");
			String username = (String)session.getAttribute("username");
			%>
			<h1 id="site_title" data-user_id="<%= userID %>">縦書きエディタ</h1>
			<nav class="nav navbar-default navbar-fixed-top">
				<ul class="nav navbar-nav">
					<li>
						<div class="btn-group">
							<button class="btn btn-primary dropdown-toggle" data-toggle="dropdown">ファイル<span class="caret"></span></button>
							<ul class="dropdown-menu">
								<li><a id="menu-new"> 新規作成 </a></li>
								<li> <a data-toggle="modal" href="#file_list_modal" id="modal-fileopen-link"> 開く </a> </li>
								<li><a id="menu-save"> 保存 </a></li>
								<li><a id="menu-delete"> 削除 </a></li>
							</ul>
						</div>
					</li>
					<li><button class="btn btn-primary" href="#help-modal" data-toggle="modal">ヘルプ</button></li>
					<li><button class="btn btn-primary" id="test">test</button></li>
				</ul>
				<ul class="nav navbar-nav navbar-right">
					<li><div class="navbar-brand alert alert-info" role="alert" id="user-info">おしらせ</div></li>
					<li><a class="navbar-brand" href="/tategaki/Logout">Logout</a></li>
				</ul>
			</nav>

			<div id="app_container">
					<input type="text" id="file_title" data-file_id="-1" value="newfile"></input>
				<div id="vertical_draft" class="container"> 
				</div>
					<div class="doc-info">
						文字:<span class="str_num">-</span>/<span class="str_len">-</span>&nbsp;
						行:<span class="row_num">-</span>/<span class="row_len">-</span>&nbsp;
						ページ:<span class="page_num">-</span>/<span class="page_len">-</span>&nbsp;
						最終更新日時:<span class="saved">-</span>
					</div>
				<div class="input_buffer"></div>
			</div>

			<div class="modal fade" id="file_list_modal" data-backdrop="static">
				<div class="modal-dialog">
					<div class="modal-content">
						<div class="modal-header">
							<button id="file-modal-close" class="close" data-dismiss="modal">&times;</button>
							<h4 class="modal-title modal-title-open">ファイルを開く</h4>
							<h4 class="modal-title modal-title-command">検索結果</h4>
						</div>
						<div class="modal-body">
							<ul class="file_list"> </ul>
						</div>
						<div class="modal-footer">
							<div class="form-group">
								<label for="serch_file" class="control-label">ファイルを検索 </label>
								<input type="text" name="serch_file" id="serch_file" class="form-control" placeholder="ファイル名"></input>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class="modal fade" id="configue-modal" data-backdrop="static">
				<div class="modal-dialog">
					<div class="modal-content">
						<div class="modal-header">
							<h4 class="modal-title modal-title-open">設定</h4>
							</div>
						<div class="modal-body">
							</div>
						<div class="modal-footer">
							</div>
						</div>
					</div>
				</div>

			<div class="modal fade" id="help-modal">
				<div class="modal-dialog">
					<div class="modal-content">
						<div class="modal-header">
							<h4 class="modal-title modal-title-open">ヘルプ</h4>
							</div>
						<div class="modal-body">
							<ul>
								<li> &lt;CTL-J&gt;&nbsp;カーソル移動[Down]</li>
								<li> &lt;CTL-K&gt;&nbsp;カーソル移動[Up]</li>
								<li> &lt;CTL-L&gt;&nbsp;カーソル移動[Right]</li>
								<li> &lt;CTL-H&gt;&nbsp;カーソル移動[Left]</li>
								<li> &lt;CTL-D&gt;&nbsp;カーソルの前にある文字を１文字削除[BackSpace]</li>
								<li> &lt;CTL-S&gt;&nbsp;ファイルを上書き保存</li>
								<li> &lt;CTL-I&gt;&nbsp;同じディレクトリ内の次のファイルを開く</li>
								<li> &lt;CTL-O&gt;&nbsp;同じディレクトリ内の前のファイルを開く</li>
								<li> &lt;CTL-F&gt;&nbsp;「ファイルを開く」ダイアログを開く</li>
							</ul>
							</div>
						<div class="modal-footer">
							</div>
						</div>
					</div>
				</div>

			<script src="/tategaki/jquery-1.12.2.min.js"></script>
			<script src="/tategaki/jquery.mousewheel.js"></script>
			<script src="/tategaki/bootstrap-3.3.6-dist/js/bootstrap.min.js"></script>
			<script src="/tategaki/key_table.js"></script>
			<script>
			  var globalUserID = <%= userID %>;
			</script>
			<script src="/tategaki/tategaki.js"></script>
		</body>
	</html>
