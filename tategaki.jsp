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
			// idから目的のファイル名を取得
			int id = 1;
			stmt = conn.createStatement();
			String sql = "SELECT * FROM file_table where id = " + id;
			ResultSet rs = stmt.executeQuery(sql);
			String fileName;

			rs.next();
			fileName = rs.getString("filename");

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
			  //readFile(<%= id %>);
			  getFileList(<%= userID %>);
			  }());
			</script>
		</body>
	</html>

	<%!
	// インスタンス変数
	Connection conn = null;
	Statement stmt;
	// jsp起動時の処理
	// データベースへの接続
	public void jspInit() {
	String url = "jdbc:mysql://localhost/blog_app";
	String user = "sampleuser";
	String password = "digk473";

	try {
	// 指定したクラスのインスタンスを作成してJDBCドライバをロードする
	Class.forName("com.mysql.jdbc.Driver").newInstance();

	// Drivermanagerに接続(データベースへの接続)
	conn = DriverManager.getConnection(url,user,password);


	} catch (ClassNotFoundException e) {
	log("ClassNotFoundException:" + e.getMessage());
	} catch (SQLException e) {
	log("SQLException:" + e.getMessage());
	} catch (Exception e) {
	log("Exception:" + e.getMessage());
	} 
	}
	// jsp破棄時の処理
	// ConnectionとStatementをcloseしている
	public void jspDestroy(){
	try{
	if(conn != null){
	conn.close();
	stmt.close();
	}
	}catch(SQLException e){
	log("SQLException:" + e.getMessage());
	}
	}
	%>
