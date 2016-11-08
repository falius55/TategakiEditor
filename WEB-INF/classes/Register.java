import java.io.PrintWriter;
import java.io.File;
import java.io.IOException;
import java.sql.SQLException;
import java.util.concurrent.CompletionException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import database.Database;

/**
 * <p>ユーザー名、パスワードを受け取り、ユーザー登録を行うサーブレット<br>
 * 同時に、ユーザー専用のホームディレクトリを作成します<br>
 * また、認証に失敗したら再度登録画面に戻します
 * データベース上に規定の名称のテーブルが存在しなければ、新たに作成します
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
		try {
			if (!existTable("edit_users")) createUserTable();
			if (!existTable("file_table")) createFileTable();

			createUserRecord(user, pass);

			int userId = userId(user, pass);
			return createRootDirectory(userId);
		} catch (SQLException e) {
			log(e.getMessage());
			return false;
		}
	}

	/**
	 * データベースへのユーザー登録を行います
	 */
	private void createUserRecord(String username, String password) throws SQLException {
		// データベースへのユーザー登録
		long curMillis = new java.util.Date().getTime();
		executeSql("insert into edit_users (name,password,registered) values (?,?,?)")
			.setString(username).setString(password).setTimeMillis(curMillis).update();
	}

	/**
	 * ユーザーIDを取得します
	 * @return ユーザーID
	 *     取得に失敗すると-1
	 */
	private int userId(String username, String password) throws SQLException {
		Database.Entry entry = executeSql("select * from edit_users where name = ? and password = ?")
			.setString(username).setString(password).query();
		if (entry.next()) {
			return entry.getInt("id").orElse(-1);
		}
		throw new SQLException("database has no data");	
	}

	/**
	 * ユーザー専用ディレクトリを作成します
     * @return ディレクトリの作成に成功した場合
	 */
	private boolean createRootDirectory(int userId) {
        try {
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

            boolean result = userRootDir.mkdirs(); // dataディレクトリが存在しない場合は同時に作成される
            return result;
        } catch (SQLException e) {
            log(e.getMessage());
            return false;
        }
	}
	/**
	 * データベース上にedit_usersという名前のユーザー管理テーブルを作成します
	 */
	private void createUserTable() {
		log("create user table");
        try {
            executeSql("create table edit_users( id int not null auto_increment primary key, name varchar(255) unique not null, password varchar(32) not null, root_file_id int, registered datetime)")
                .update();
        } catch (SQLException e) {
            throw new CompletionException(e);
        }
	}
	/**
	 * データベース上にfile_tableという名前のファイル管理テーブルを作成します
	 */
	private void createFileTable() throws SQLException {
		log("create file table");
        try {
            executeSql("create table file_table( id int not null auto_increment primary key, filename varchar(255), type enum('root','dir','file') default 'file', parent_dir int, user_id int not null, saved datetime)")
                .update();
        } catch (SQLException e) {
            throw new CompletionException(e);
        }
	}
}
