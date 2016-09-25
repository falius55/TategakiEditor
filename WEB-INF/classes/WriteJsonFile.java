import java.io.PrintWriter;
import java.io.IOException;
import java.sql.SQLException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * ファイル情報を受けとり、ファイルID.jsonという名前のファイルにJSONの中身を書き出し、データベースにファイル名と更新日時を保存します
 * <pre>
 * request: {
 * 		user_id,
 * 		file_id,
 * 		filename,
 * 		json, // ファイル内容のJSON文字列
 * 		saved
 * 	}
 * response: {
 * 		result,
 * 		strDate // 最終更新日時の文字列
 * 	}
 *	</pre>
 */
public class WriteJsonFile extends AbstractServlet {
	public void doPost(HttpServletRequest request, HttpServletResponse response)
		throws IOException, ServletException {

		try {
			ready(request, response);
			connectDatabase(/* url = */"jdbc:mysql://localhost/tategaki_editor", /* username = */"serveruser", /* password = */"digk473");

			// ファイル名、最終更新日の更新
			int fileId = Integer.parseInt(request.getParameter("file_id"));
			String filename = request.getParameter("filename");
			long savedMillis = Long.parseLong(request.getParameter("saved"));

			updateFilename(fileId, filename);
			updateSaved(fileId, savedMillis);

			// テキストファイルへの書き込み
			int userId = Integer.parseInt(request.getParameter("user_id"));
			int rootId = rootId(userId);
			String json = request.getParameter("json");
			writeFile(String.format("data/%d/%d.json",rootId,fileId), json);

			String rtnJson = String.format("{\"result\":\"save success\",\"strDate\":\"%s\"}",dateFormat(savedMillis));
			out(rtnJson);

		} catch(SQLException e) {
			log(e.getMessage());
		} catch(Exception e) {
			log(e.getMessage());
		}
	}
	private void updateFilename(int fileId, String newFilename) {
		executeSql("update file_table set filename = ? where id = ?").setString(newFilename).setInt(fileId).update();
	}
	private void updateSaved(int fileId, long newSaved) {
		executeSql("update file_table set saved = ? where id = ?").setTimeMillis(newSaved).setInt(fileId).update();
	}
}
