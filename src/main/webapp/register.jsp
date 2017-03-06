<%@ page contentType="text/html;charset=utf-8" %>
<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="content-type" content="text/html; charset=utf-8">
        <title>ユーザー登録</title>
        <link rel="stylesheet" href="lib/honoka/css/bootstrap.min.css" media="screen">
        <link rel="stylesheet" href="css/loginpage.css">
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
        <form method="POST" action="/tategaki-editor/Register" name="registform">
            <fieldset>
                <div class="form-group">
                    <label for="username" class="control-label">名前</label>
                    <input type="text" name="username" class="form-control"></input>
                </div>
                <div class="form-group">
                    <label for="password" class="control-label">パスワード</label>
                    <input type="password" name="password" class="form-control"></input>
                </div>
                <div class="form-group">
                    <button type="submit" class="btn btn-primary">登録</button>
                    <button type="reset" class="btn btn-primary">Reset</button>
                </div>
                <a href="/tategaki-editor/loginpage.jsp">ログインページ</a>
            </fieldset>
        </form>
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min.js"></script>
        <script src="lib/honoka/js/bootstrap.min.js"></script>
    </body>
</html>

