import java.io.PrintWriter;
import java.io.IOException;
import java.sql.SQLException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * <p>ユーザーID、ファイル名、日時を表すミリ秒の値を受け取り、新しい空ファイルを作成するサーブレット
 * <pre>
 * request: {
 * 	user_id,
 * 	filename,
 *		saved
 * 	}
 * response: {
 * 	newFileId,
 * 	filename
 * 	}
 * </pre>
 */
public class FileMaker extends AbstractServlet  {
	public void doPost(HttpServletRequest request, HttpServletResponse response)
		throws IOException, ServletException {

		try {
			ready(request, response);
			connectDatabase();

			int userId = Integer.parseInt(request.getParameter("user_id"));
			int rootId = rootId(userId);

			String fileName = request.getParameter("filename");
			long savedMillis = Long.parseLong(request.getParameter("saved"));
			insertFileRecord(fileName, rootId, userId, savedMillis);

			int fileId = queryFileIdFromSaved(userId, savedMillis);

			// ファイルを作成
			createFile(String.format("data/%d/%d.json",rootId,fileId));

			//	ajaxへ送信
			String rtn = String.format("{\"newFileId\" : \"%d\",\"filename\" : \"%s\"}",fileId,fileName);
			out(rtn);

		} catch(SQLException e) {
			log(e.getMessage());
		} catch(Exception e) {
			log(e.getMessage());
		}
	}

	/**
	 * 行を挿入し、ファイル名、ユーザーID、最終更新日を保存します
	 * @param directoryName ディレクトリ名
	 * @param rootId ルートディレクトリのID
	 * @param userId ユーザーID
	 * @param savedMillis 最終更新日時のミリ秒
	 */
	private void insertFileRecord(String fileName, int rootId, int userId, long savedMillis) {
		executeSql("insert into file_table (filename,type,parent_dir,user_id,saved) values (?,?,?,?,?)")
			.setString(fileName).setString("file").setInt(rootId).setInt(userId).setTimeMillis(savedMillis).update();
	}
	/**
	 * 指定された最終更新日時に合致する特定のファイルIDを取得します
	 * @param userId ユーザーID
	 * @param savedMillis 最終更新日時のミリ秒
	 *     取得に失敗すると-1
	 */
	private int queryFileIdFromSaved(int userId, long savedMillis) throws SQLException {
		Entry entry = executeSql("select * from file_table where user_id = ? and saved = ?")
			.setInt(userId).setTimeMillis(savedMillis).query();
		if (entry.next()) {
			return entry.getInt("id").orElse(-1);
		}
		throw new SQLException();
	}
}
