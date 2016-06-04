import java.io.*;
import javax.servlet.*;
import javax.servlet.http.*;
import java.sql.*;

/**
 * 送られてきたユーザー名とパスワードを確認してログインします。
 */
public class Login extends HttpServlet {
	// インスタンス変数
	Connection conn = null;
	PreparedStatement pstmt;
	// ====================================================================
	// 	jsp起動時の処理
	// ====================================================================
	// データベースへの接続
	public void init() {
		String url = "jdbc:mysql://localhost/tategaki_editor";
		String user = "serveruser";
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
	// =====================================================================
	// 	jsp破棄時の処理
	// =====================================================================
	// ConnectionとStatementをcloseしている
	public void destroy(){
		try{
			if(conn != null){
				conn.close();
				pstmt.close();
			}
		}catch(SQLException e){
			log("SQLException:" + e.getMessage());
		}catch(NullPointerException e){
			log("NullPointerException:" + e.getMessage());
		}
	}

	// =======================================================================
	// 	main
	// =======================================================================
	public void doPost(HttpServletRequest request, HttpServletResponse response)
		throws IOException, ServletException {

		response.setContentType("application/json; charset=UTF-8");
		PrintWriter out = response.getWriter();

		// =====================================================
		// フォームからの情報受取
		// =====================================================
		String user = request.getParameter("username");
		String pass = request.getParameter("password");

		// =====================================================
		// 認証のチェック
		// =====================================================
		HttpSession session = request.getSession(true);

		boolean checked = userCheck(user,pass,session);

		if (checked) {
			// 認証済みにセット
			session.setAttribute("login",Boolean.TRUE);

			response.sendRedirect("/tategaki/tategaki.jsp");
		}else{
			// 認証に失敗したら、ログイン画面に戻す
			session.setAttribute("login",Boolean.FALSE);
			response.sendRedirect("/tategaki/loginpage.jsp");
		}
	}
	protected boolean userCheck(String user,String pass,HttpSession session){
		if (user == null || user.length() == 0 || pass == null || pass.length() == 0) {
			return false;
		}	
		try {
			String sql = "SELECT * FROM edit_users WHERE name = ? && password = ?";
			pstmt = conn.prepareStatement(sql);

			pstmt.setString(1,user);
			pstmt.setString(2,pass);
			ResultSet rs = pstmt.executeQuery();

			if (rs.next()) {
				String userid = rs.getString("id");
				String username = rs.getString("name");

				session.setAttribute("userid",userid);
				session.setAttribute("username",username);

				return true;
			}else{
				return false;		
			}
		} catch (SQLException e) {
			log("SQLException:" + e.getMessage());
			return false;
		}
	}
}
