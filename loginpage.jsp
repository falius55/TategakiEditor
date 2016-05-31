<%@ page contentType="text/html;charset=utf-8" %>
<!DOCTYPE html>
<html>
	<head>
		<meta http-equiv="content-type" content="text/html; charset=utf-8">
		<title>ログイン</title>
		<link rel="stylesheet" href="loginpage.css">
	</head>
	<body>
		<h1>縦書きエディタ　ログイン</h1>
		<%
		//HttpSession session = request.getSession(true);

		// 認証失敗から呼び出されたのかどうか
		Boolean checked = (Boolean)session.getAttribute("login");

		if(checked != null && checked.equals(Boolean.FALSE)){
		%>
		<p>認証に失敗しました</p>
		<p>再度ユーザー名とパスワードを入力してください</p>
		<%
		session.setAttribute("login",null);
		}
		%>
		<form method="POST" action="/tategaki/Login" name="loginform">
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
							<label for="password">パスワード:</label>
						</td>
						<td>
							<input type="password" name="password"></input>
						</td>
					</tr>
					<tr>
						<td>
							<button type="submit">Login</button>
							</td>
						<td>
							<button type="reset">Reset</button>
							</td>
						</tr>
				</table>
								<a href="/tategaki/register.jsp">新規登録</a>
			</fieldset>
		</form>
	</body>
</html>
