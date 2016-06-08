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
								<li> <a data-toggle="modal" href="#file_list_modal"> 開く </a> </li>
								<li><a id="menu-save"> 保存 </a></li>
								<li><a id="menu-delete"> 削除 </a></li>
							</ul>
						</div>
					</li>
				</ul>
				<ul class="nav navbar-nav navbar-right">
					<li><a href="/tategaki/Logout">Logout</a></li>
				</ul>
			</nav>
			<div class="modal fade" id="file_list_modal">
				<div class="modal-dialog">
					<div class="modal-content">
						<div class="modal-header">
							<button class="close" data-dismiss="modal">&times;</button>
							<h4 class="modal-title">ファイルを開く</h4>
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
			<div id="app_container">
				<div id="vertical_draft" class="container"> 
					<input type="text" id="file_title" data-file_id="-1" value="newfile"></input>
					<div class="infomation">
						文字:<span class="str_num">-</span>/<span class="str_len">-</span>&nbsp;
						行:<span class="row_num">-</span>/<span class="row_len">-</span>&nbsp;
						ページ:<span class="page_num">-</span>/<span class="page_len">-</span>&nbsp;
						最終更新日時:<span class="saved">-</span>
					</div>
				</div>
				<div class="input_buffer"></div>
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
