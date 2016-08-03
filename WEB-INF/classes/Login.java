import java.io.PrintWriter;
import java.io.IOException;
import java.sql.SQLException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

/**
 * 送られてきたユーザー名とパスワードを確認してログインします。
 */
public class Login extends AbstractServlet {
	public void doPost(HttpServletRequest request, HttpServletResponse response)
		throws IOException, ServletException {

		response.setContentType("application/json; charset=UTF-8");
		PrintWriter out = response.getWriter();

		// フォームからの情報受取
		String user = request.getParameter("username");
		String pass = request.getParameter("password");

		// 認証のチェック
		HttpSession session = request.getSession(true);

		boolean checked = userCheck(user,pass,session);

		if (checked) {
			// 認証済みにセット
			session.setAttribute("login",Boolean.TRUE);
			response.sendRedirect("/tategaki/tategaki.jsp");
		} else {
			// 認証に失敗したら、ログイン画面に戻す
			session.setAttribute("login",Boolean.FALSE);
			response.sendRedirect("/tategaki/loginpage.jsp");
		}
	}

	protected boolean userCheck(String user,String pass,HttpSession session) {
		if (user == null || user.length() == 0 || pass == null || pass.length() == 0) {
			return false;
		}	
		connectDatabase(/* url = */"jdbc:mysql://localhost/tategaki_editor", /* username = */"serveruser", /* password = */"digk473");
		executeSql("select * from edit_users where name = ? && password = ?")
			.setString(user).setString(pass).query();

		if (next()) {
			String userid = getString("id");
			String username = getString("name");

			session.setAttribute("userid",userid);
			session.setAttribute("username",username);

			return true;
		} else {
			return false;		
		}
	}
}
