import java.io.PrintWriter;
import java.io.File;
import java.io.IOException;
import java.sql.SQLException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

/**
 * <p>ユーザー名、パスワードを受け取り、ユーザー登録を行うサーブレット<br>
 * 同時に、ユーザー専用のホームディレクトリを作成します<br>
 * また、認証に失敗したら再度登録画面に戻します
 * <pre>
 * request: {
 * 		username,
 * 		password
 * 	}
 *	</pre>
 */
public class Register extends AbstractServlet {
	public void doPost(HttpServletRequest request, HttpServletResponse response)
		throws IOException, ServletException {

		ready(request, response);

		String user = request.getParameter("username");
		String pass = request.getParameter("password");

		// 認証のチェック
		HttpSession session = request.getSession(true);

		boolean check = registerUser(user,pass);

		if (check) {
			session.setAttribute("registered",Boolean.TRUE);

			response.sendRedirect("/tategaki/loginpage.jsp");
		} else {
			session.setAttribute("registered",Boolean.FALSE);
			response.sendRedirect("/tategaki/register.jsp");
		}
	}

	private boolean registerUser(String user,String pass) {
		if (user == null || user.length() == 0 || pass == null || pass.length() == 0) {
			return false;
		}	
		connectDatabase(/* url = */"jdbc:mysql://localhost/tategaki_editor", /* username = */"serveruser", /* password = */"digk473");
		java.util.Date nowDate = new java.util.Date();
		try {

			createUserRecord(user, pass);

			int userId = userId(user, pass);
			createRootDirectory(userId);

			return true;

		} catch (SQLException e) {
			log(e.getMessage());
			return false;
		}
	}

	/**
	 * データベースへのユーザー登録を行います
	 */
	private void createUserRecord(String username, String password) {
		// データベースへのユーザー登録
		long curMillis = new java.util.Date().getTime();
		executeSql("insert into edit_users (name,password,registered) values (?,?,?)")
			.setString(username).setString(password).setTimeMillis(curMillis).update();
	}

	/**
	 * ユーザーIDを取得します
	 */
	private int userId(String username, String password) throws SQLException {
		executeSql("select * from edit_users where name = ? and password = ?")
			.setString(username).setString(password).query();
		if (next()) {
			return getInt("id");
		}
		throw new SQLException("database has no data");	
	}

	/**
	 * ユーザー専用ディレクトリを作成します
	 */
	private void createRootDirectory(int userId) throws SQLException {
		long curMillis = new java.util.Date().getTime();

		// データベースへのディレクトリ情報登録
		executeSql("insert into file_table (filename,type,parent_dir,user_id,saved) values (?,?,?,?,?)")
			.setString("root").setString("root").setInt(0).setInt(userId).setTimeMillis(curMillis).update();

		int rootId = rootId(userId);

		// edit_usersへのrootディレクトリ情報の登録
		executeSql("update edit_users set root_file_id = ? where id = ?").setInt(rootId).setInt(userId).update();

		// サーバー用ルートディレクトリ(/tategaki)までのパスを取得
		String path = contextPath(String.format("data/%d",rootId));	// ルートディレクトリ/data/userIdとなる
		File userRootDir = new File(path);

		userRootDir.mkdirs(); // dataディレクトリが存在しない場合は同時に作成される
	}
}
