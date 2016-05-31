<%@ page contentType="text/html;charset=utf-8" %>
<!DOCTYPE html>
<html>
	<head>
		<meta http-equiv="content-type" content="text/html; charset=utf-8">
		<title>ユーザー登録</title>
		<link rel="stylesheet" href="loginpage.css">
	</head>
	<body>
		<h1>縦書きエディタ　ユーザー登録</h1>
		<%

		// 認証失敗から呼び出されたのかどうか
		Boolean result = (Boolean)session.getAttribute("registered");

		if(result != null && result.equals(Boolean.FALSE)){
		%>
		<p>登録に失敗しました</p>
		<p>再度ユーザー名とパスワードを入力してください</p>
		<%
		session.setAttribute("registered",null);
		}
		%>
		<form method="POST" action="/tategaki/Register" name="registform">
			<fieldset>
				<table>
					<tr>
						<td>
							<label for="username">名前: </label>
						</td>
						<td>
							<input type="text" name="username"></input>
						</td>
					</tr>
					<tr>
						<td>
							<label for="email">メールアドレス:</label>
						</td>
						<td>
							<input type="text" name="email"></input>
						</td>
					</tr>
					<tr>
						<td>
							<label for="password">パスワード:</label>
						</td>
						<td>
							<input type="text" name="password"></input>
						</td>
					</tr>
					<tr>
						<td>
							<button type="submit">登録する</button>
							</td>
						<td>
							<button type="reset">reset</button>
							</td>
						</tr>
				</table>
				<a href="/tategaki/loginpage.jsp">ログインページヘ</a>
			</fieldset>
		</form>
	</body>
</html>

