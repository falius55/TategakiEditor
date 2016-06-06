<%@ page contentType="text/html;charset=utf-8" import="java.sql.*" %>
<!DOCTYPE html>
<html lang="ja">

	<html>
		<head>
			<meta charset="utf-8">
			<meta name="viewport" content="width=device-width, initial-scale=1">
			<title>縦書きエディタ</title>
			<link rel="stylesheet" href="tategaki.css">
			<link rel="stylesheet" href="verticalprint.css" media="print">
			<link rel="stylesheet" href="bootstrap-3.3.6-dist/css/bootstrap.min.css" media="screen">
		</head>
		<body>
			<%
			// セッションからユーザーIDを取得
			String userID = (String)session.getAttribute("userid");
			String username = (String)session.getAttribute("username");
			%>
			<h1 id="site_title" data-user_id="<%= userID %>">縦書きエディタ</h1>
			<div id="app_container">
				<input type="text" id="file_title" data-file_id="-1"></input>
				<div id="vertical_draft" class="container"> 
					<div class="infomation">
						文字:<span class="str_num">-</span>/<span class="str_len">-</span>　行:<span class="row_num">1</span>/<span class="row_len">-</span>　ページ:<span class="page_num">-</span>/<span class="page_len">-</span>　最終更新日時:<span class="saved">-</span>
					</div>
				</div>
				<div class="input_buffer" style="display: none;"></div>
			</div>
			<ul class="file_list">
			</ul>
			<div id="header">
				<menu type="toolbar">
					<menu label="FILE">
						<button onclick="saveFile()"> 保存 </button>
						<button onclick="defaultNewFile()"> new </button>
						<button onclick="defaultDeleteFile()"> 削除 </button>
					</menu>
					<a href="/tategaki/Logout">Logout</a>
				</menu>
				<div class="button_container">
				</div>
			</div>

			<script src="/tategaki/jquery-1.12.2.min.js"></script>
			<script src="/tategaki/jquery.mousewheel.js"></script>
			<script src="/tategaki/bootstrap-3.3.6-dist/js/bootstrap.min.js">
			<script>
			  console.log('before key_table.js');
			</script>
			<script src="/tategaki/key_table.js"></script>
			<script>
			  console.log('inline script');
			  var globalUserID = <%= userID %>;
			</script>
			<script src="/tategaki/tategaki.js"></script>
		</body>
	</html>
