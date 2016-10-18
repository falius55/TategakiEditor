import java.io.PrintWriter;
import java.io.IOException;
import java.sql.SQLException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import database.Database;

/**
 * <p>送られてきたユーザー名とパスワードを確認してログインするサーブレット
 * <p>認証に失敗したら、ログイン画面に戻します
 * データベース上に規定の名称のテーブルが存在しなければ登録されたユーザーが存在しないと判断し、認証に失敗します
 * <pre>
 * request: {
 *		username,
 *		password
 * 	}
 * </pre>
 */
public class Login extends AbstractServlet {
	public void doPost(HttpServletRequest request, HttpServletResponse response)
		throws IOException, ServletException {

		request.setCharacterEncoding("UTF-8"); // 受取のcharset

		String user = request.getParameter("username");
		String pass = request.getParameter("password");

		// 認証のチェック
		HttpSession session = request.getSession(true);

		boolean checked = userCheck(user,pass,session);

		if (checked) {
			session.setAttribute("login",Boolean.TRUE);
			response.sendRedirect("/tategaki/tategaki.jsp");
		} else {
			session.setAttribute("login",Boolean.FALSE);
			response.sendRedirect("/tategaki/loginpage.jsp");
		}
	}

	private boolean userCheck(String user,String pass,HttpSession session) {
		if (user == null || user.length() == 0 || pass == null || pass.length() == 0)
			return false;
		try {
			if (!existTable("edit_users")) return false;
			if (!existTable("file_table")) return false;
		} catch (SQLException e) {
			log(e.getMessage());
		}
		Database.Entry entry = executeSql("select * from edit_users where name = ? && password = ?")
			.setString(user).setString(pass).query();

		if (entry.next()) {
			String userid = entry.getString("id").orElse("-1");
			String username = entry.getString("name").orElse("not found");

			session.setAttribute("userid",userid);
			session.setAttribute("username",username);

			return true;
		} else {
			return false;		
		}
	}
}
