import java.io.*;
import javax.servlet.*;
import javax.servlet.http.*;
import java.sql.*;

public class Register extends HttpServlet {
	// インスタンス変数
	Connection conn = null;
	PreparedStatement pstmt;
	// ====================================================================
	// 	jsp起動時の処理
	// ====================================================================
	// データベースへの接続
	public void init() {
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
		String email = request.getParameter("email");
		String pass = request.getParameter("password");

		// =====================================================
		// 認証のチェック
		// =====================================================
		HttpSession session = request.getSession(true);

		boolean check = registerUser(user,email,pass);

		if (check) {
			// 認証済みにセット
			session.setAttribute("registered",Boolean.TRUE);

			response.sendRedirect("/tategaki/loginpage.jsp");
		}else{
			// 認証に失敗したら、登録画面に戻す
			session.setAttribute("registered",Boolean.FALSE);
			response.sendRedirect("/tategaki/register.jsp");
		}
	}
	protected boolean registerUser(String user,String email,String pass){
		if (user == null || user.length() == 0 || email == null || email.length() == 0 || pass == null || pass.length() == 0) {
			return false;
		}	
		try {
			String sql = "insert into edit_users (name,email,password,registered) values (?,?,?,?)";
			pstmt = conn.prepareStatement(sql);

			pstmt.setString(1,user);
			pstmt.setString(2,email);
			pstmt.setString(3,pass);
			pstmt.setString(4,String.format("%1$tF %1$tT",new java.util.Date()));
			pstmt.executeUpdate();

			return true;

		} catch (SQLException e) {
			log("SQLException:" + e.getMessage());
			return false;
		}
	}
}
