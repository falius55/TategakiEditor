import java.io.PrintWriter;
import java.io.IOException;
import java.sql.SQLException;
import java.util.StringJoiner;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import database.Database;

/**
 * ユーザーIDとファイルIDを受け取り、読み込んだファイルの内容を文字列でクライアントに送り返すサーブレット
 * <pre>
 * request: {
 * 		user_id,
 * 		file_id
 * 	}
 * response: {
 * 		filename,
 * 		fileId,
 * 		saved, // 最終更新日時
 * 		userId,
 * 		data // ファイル内容のjson文字列
 * 	}
 *	</pre>
 */
public class ReadJsonFile extends AbstractServlet  {
	public void doPost(HttpServletRequest request, HttpServletResponse response)
		throws IOException, ServletException {

		try {
			ready(request,response);

			int fileId = Integer.parseInt(request.getParameter("file_id"));
			String filename = filename(fileId);
			String saved = saved(fileId);

			StringJoiner sj = new StringJoiner(",", "{", "}");
			sj.add(String.format("\"filename\":\"%s\"", filename));
			sj.add(String.format("\"fileId\":\"%d\"", fileId));
			sj.add(String.format("\"saved\":\"%s\"", saved));

			int userId = Integer.parseInt(request.getParameter("user_id"));
			int rootId = rootId(userId);

			sj.add(String.format("\"userId\":\"%d\"", userId));

			//	ファイル読込
			sj.add(String.format("\"data\":%s", readFile(String.format("data/%d/%d.json", rootId, fileId))));

			//	ajaxへ送信
			String rtnJson = sj.toString().replaceAll("\"","\\\""); // jsonファイル中の"を\"にエスケープする
			out(rtnJson);

			log("fileName is " + filename);
			log(rtnJson);
		} catch(SQLException e) {
			log(e.getMessage());
		} catch(Exception e) {
			log(e.getMessage());
		}
	}

	private String filename(int fileId) throws SQLException {
		Database.Entry entry = executeSql("select * from file_table where id = ?").setInt(fileId).query();

		if (entry.next())
			return entry.getString("filename").orElse("not found");
		throw new SQLException("no database data");	
	}
	private String saved(int fileId) throws SQLException {
		Database.Entry entry = executeSql("select * from file_table where id = ?").setInt(fileId).query();

		if (entry.next())
			return entry.getDateFormat("saved");
		throw new SQLException("no database data");	
	}
}
