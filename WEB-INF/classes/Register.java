import java.io.PrintWriter;
import java.io.File;
import java.io.IOException;
import java.sql.SQLException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

public class Register extends AbstractServlet {
	public void doPost(HttpServletRequest request, HttpServletResponse response)
		throws IOException, ServletException {

		response.setContentType("application/json; charset=UTF-8");
		PrintWriter out = response.getWriter();

		// フォームからの情報受取
		String user = request.getParameter("username");
		String pass = request.getParameter("password");

		// 認証のチェック
		HttpSession session = request.getSession(true);

		boolean check = registerUser(user,pass);

		if (check) {
			// 認証済みにセット
			session.setAttribute("registered",Boolean.TRUE);

			response.sendRedirect("/tategaki/loginpage.jsp");
		} else {
			// 認証に失敗したら、登録画面に戻す
			session.setAttribute("registered",Boolean.FALSE);
			response.sendRedirect("/tategaki/register.jsp");
		}
	}

	protected boolean registerUser(String user,String pass) {
		if (user == null || user.length() == 0 || pass == null || pass.length() == 0) {
			return false;
		}	
		connectDatabase(/* url = */"jdbc:mysql://localhost/tategaki_editor", /* username = */"serveruser", /* password = */"digk473");
		java.util.Date nowDate = new java.util.Date();
		try {

			// データベースへのユーザー登録
			long curMillis = new java.util.Date().getTime();
			executeSql("insert into edit_users (name,password,registered) values (?,?,?)")
				.setString(user).setString(pass).setTimeMillis(curMillis).update();

			// ユーザー専用ディレクトリの作成

			// ユーザーIdの取得
			executeSql("select * from edit_users where name = ? and password = ? and registered = ?")
				.setString(user).setString(pass).setTimeMillis(curMillis).query();
			int userId;
			if (next()) {
				userId = getInt("id");
			} else {
				log("database has no new data");
				throw new SQLException();	
			}

			// データベースへのディレクトリ情報登録
			executeSql("insert into file_table (filename,type,parent_dir,user_id,saved) values (?,?,?,?,?)")
				.setString("root").setString("root").setInt(0).setInt(userId).setTimeMillis(curMillis).update();

			// rootIdの取得
			executeSql("select * from file_table where user_id = ? and type = ? ")
				.setInt(userId).setString("root").query();
			int rootId;
			if (next()) {
				rootId = getInt("id");
			} else {
				log("database has no new data");
				throw new SQLException();	
			}

			// edit_usersへのrootディレクトリ情報の登録
			executeSql("update edit_users set root_file_id = ? where id = ?").setInt(rootId).setInt(userId).update();

			// サーバー用ルートディレクトリ(/tategaki)までのパスを取得
			String path = contextPath(String.format("data/%d",rootId));	// ルートディレクトリ/data/userIdとなる
			File userRootDir = new File(path);
			userRootDir.mkdirs(); // dataディレクトリが存在しない場合は同時に作成される

			return true;

		} catch (SQLException e) {
			log(e.getMessage());
			return false;
		}
	}
}
