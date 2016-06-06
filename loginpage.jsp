<%@ page contentType="text/html;charset=utf-8" %>
<!DOCTYPE html>
<html>
	<head>
		<meta http-equiv="content-type" content="text/html; charset=utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<title>ログイン</title>
		<link rel="stylesheet" href="loginpage.css">
		<link rel="stylesheet" href="bootstrap-3.3.6-dist/css/bootstrap.min.css" media="screen">
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
					<div class="form-group">
								<label for="username" class="control-label">名前 </label>
								<input type="text" name="username" class="form-control"></input>
					</div>
					<div class="form-group">
								<label for="password" class="control-label">パスワード</label>
								<input type="password" name="password" class="form-control"></input>
					</div>
					<div class="form-group">
								<button type="submit" class="btn btn-primary">Login</button>
								<button type="reset" class="btn btn-primary">Reset</button>
					</div>
				<a href="/tategaki/register.jsp">新規登録</a>
			</fieldset>
		</form>
		<script src="/tategaki/bootstrap-3.3.6-dist/js/bootstrap.min.js">
</body>
</html>
