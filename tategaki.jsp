<%@ page contentType="text/html;charset=utf-8" import="java.sql.*" %>
<!DOCTYPE html>
<html lang="ja">

	<html>
		<head>
			<meta charset="UTF-8">
			<title>縦書きエディタ</title>
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
			<div id="container">
				<input type="text" id="title" data-file_id="-1"></input>
				<div id="vertical_draft"> 
					<div class="infomation">
						文字:<span class="str_num">-</span>/<span class="str_len">-</span>　行:<span class="row_num">1</span>/<span class="row_len">-</span>　ページ:<span class="page_num">-</span>/<span class="page_len">-</span>　最終更新日時:<span class="saved">-</span>
					</div>
				</div>
				<div class="input_buffer" style="display: none;"></div>
			</div>
			<ul class="file_list">
			</ul>
			<div id="header">
				<div class="button_container">
					<button onclick="saveFile()"> 保存 </button>
					<button onclick="defaultNewFile()"> new </button>
					<button onclick="defaultDeleteFile()"> 削除 </button>
				</div>
				<a href="/tategaki/Logout">Logout</a>
			</div>

			<script src="/tategaki/jquery-1.12.2.min.js"></script>
			<script src="/tategaki/jquery.mousewheel.js"></script>
			<script src="/tategaki/key_table.js"></script>
			<script src="/tategaki/tategaki.js"></script>
			<script>
			  (function(){
			  init();
			  appendParagraph("縦書きテキストエディタ");
			  $('.vertical_row').addClass('displayRow').children('.vertical_character:first').addClass('focus');
			  addPageBreak();
			  Focus.addFocusRow();
			  printInfomation();
			  getFileList(<%= userID %>);
			  }());
			</script>
		</body>
	</html>
