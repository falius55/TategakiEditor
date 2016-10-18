import java.io.PrintWriter;
import java.io.IOException;
import java.sql.SQLException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import database.Database;

/**
 * <p>ユーザーID、ディレクトリ名、日時を表すミリ秒を受け取り、新しいディレクトリを作成するサーブレット
 * <pre>
 * request: {
 * 	user_id,
 * 	directoryname,
 *		saved
 * 	}
 * response: {
 * 	newDirectoryID,
 * 	directoryname
 * 	}
 * </pre>
 */
public class DirectoryMaker extends AbstractServlet  {
	public void doPost(HttpServletRequest request, HttpServletResponse response)
		throws IOException, ServletException {

		try {
			ready(request, response);

			int userId = Integer.parseInt(request.getParameter("user_id"));
			int rootId = rootId(userId);
			
			String directoryname = request.getParameter("directoryname");
			long savedMillis = Long.parseLong(request.getParameter("saved"));
			insertDirectoryRecord(directoryname, rootId, userId, savedMillis);

			// 新しいfileIdを取得
			int directoryId = queryFileIdFromSaved(userId, savedMillis);

			//	ajaxへ送信
			String rtn = String.format("{\"newDirectoryID\" : \"%d\",\"directoryname\" : \"%s\"}",directoryId,directoryname);
			out(rtn);

			log("DirectoryMaker return is " + rtn);
		} catch(SQLException e) {
			log(e.getMessage());
		} catch(Exception e) {
			log(e.getMessage());
		}
	}

	/**
	 * 行を挿入し、ディレクトリ名、ユーザーID、最終更新日を保存します
	 * @param directoryName ディレクトリ名
	 * @param rootId ルートディレクトリのID
	 * @param userId ユーザーID
	 * @param savedMillis 最終更新日時のミリ秒
	 */
	private void insertDirectoryRecord(String directoryName, int rootId, int userId, long savedMillis) {
		executeSql("insert into file_table (filename,type,parent_dir,user_id,saved) values (?,?,?,?,?)")
			.setString(directoryName).setString("dir").setInt(rootId).setInt(userId).setTimeMillis(savedMillis).update();
	}

	/**
	 * 指定された最終更新日時に合致する特定のファイルIDを取得します
	 * @param userId ユーザーID
	 * @param savedMillis 最終更新日時のミリ秒
	 *     取得に失敗すると-1
	 */
	private int queryFileIdFromSaved(int userId, long savedMillis) throws SQLException {
		Database.Entry entry = executeSql("select * from file_table where user_id = ? and saved = ?")
			.setInt(userId).setTimeMillis(savedMillis).query();
		if (entry.next()) {
			return entry.getInt("id").orElse(-1);
		}
		throw new SQLException("database has no data");
	}
}
