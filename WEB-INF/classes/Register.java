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
		java.util.Date nowDate = new java.util.Date();
		try {

			// ========================================================
			// 	データベースへの登録
			//	========================================================
			String sql = "insert into edit_users (name,email,password,registered) values (?,?,?,?)";
			pstmt = conn.prepareStatement(sql);

			pstmt.setString(1,user);
			pstmt.setString(2,email);
			pstmt.setString(3,pass);
			pstmt.setString(4,String.format("%1$tF %1$tT",nowDate));
			pstmt.executeUpdate();

			// =========================================================
			// 	ユーザー専用ディレクトリの作成
			//	=========================================================
			// ユーザーIDの取得
			sql = "select * from edit_users where name = ? and email = ? and password = ? and registered = ?";
			pstmt = conn.prepareStatement(sql);

			pstmt.setString(1,user);
			pstmt.setString(2,email);
			pstmt.setString(3,pass);
			pstmt.setString(4,String.format("%1$tF %1$tT",nowDate));
			ResultSet rs = pstmt.executeQuery();
			int userID;
			if (rs.next()) {
				userID = rs.getInt("id");
			}else{
				log("database has no new data");
				throw new SQLException();	
			}

			// データベースへのディレクトリ情報登録
			sql = "insert into file_table (filename,type,parent_dir,user_id,saved) values (?,?,?,?,?)";
			pstmt = conn.prepareStatement(sql);

			pstmt.setString(1,"root");
			pstmt.setString(2,"root");
			pstmt.setInt(3,0);
			pstmt.setInt(4,userID);
			pstmt.setString(5,String.format("%1$tF %1$tT",nowDate));
			pstmt.executeUpdate();

			// rootIDの取得
			sql = "select * from file_table where user_id = ? and type = ? ";
			pstmt = conn.prepareStatement(sql);

			pstmt.setInt(1,userID);
			pstmt.setString(2,"root");
			rs = pstmt.executeQuery();
			int rootID;
			if (rs.next()) {
				rootID = rs.getInt("id");
			}else{
				log("database has no new data");
				throw new SQLException();	
			}

			// edit_usersへのrootディレクトリ情報の登録
			sql = "update edit_users set root_file_id = ?";
			pstmt = conn.prepareStatement(sql);
			pstmt.setInt(1,rootID);
			pstmt.executeUpdate();

			// サーバー用ルートディレクトリ(/tategaki)までのパスを取得
			ServletContext context = this.getServletContext();
			String path = context.getRealPath(String.format("data/%d",rootID));	// ルートディレクトリ/data/userIDとなる
			File userRootDir = new File(path);
			userRootDir.mkdirs(); // dataディレクトリが存在しない場合は同時に作成される
			
			return true;

		} catch (SQLException e) {
			log("SQLException:" + e.getMessage());
			return false;
		}
	}
}
