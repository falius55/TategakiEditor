import java.io.PrintWriter;
import java.io.IOException;
import java.sql.SQLException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

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
			connectDatabase(/* url = */"jdbc:mysql://localhost/tategaki_editor", /* username = */"serveruser", /* password = */"digk473");

			//	idから目的のファイル名、最終更新日を取得
			int fileId = Integer.parseInt(request.getParameter("file_id"));
			executeSql("select * from file_table where id = ?").setInt(fileId).query();

			log("fileId"+ fileId);
			String fileName;
			String saved;
			if (next()) {
				fileName = getString("filename");
				saved = getDateFormat("saved");
			} else {
				log("no database data");
				throw new SQLException();	
			}

			StringBuffer sb = new StringBuffer();
			sb.append("{\"filename\":\"");
			sb.append(fileName);
			sb.append("\",");
			sb.append("\"fileId\":\"");
			sb.append(fileId);
			sb.append("\",");
			sb.append("\"saved\":\"");
			sb.append(saved);
			sb.append("\",");

			// userIdから、ルートディレクトリのidを取得
			int userId = Integer.parseInt(request.getParameter("user_id"));
			executeSql("select * from edit_users where id = ?").setInt(userId).query();
			int rootId;
			if (next()) {
				rootId = getInt("root_file_id");
			} else {
				throw new SQLException("database has no new data");	
			}

			//	ファイル読込
			sb.append("\"userId\":\"");
			sb.append(userId);
			sb.append("\",");
			sb.append("\"data\":");
			sb.append(readFile(String.format("data/%d/%d.json",rootId,fileId)));
			sb.append("}");

			//	ajaxへ送信
			String rtnJson = sb.toString().replaceAll("\"","\\\""); // jsonファイル中の"を\"にエスケープする
			out(rtnJson);

			log("fileName is " + fileName);
			log(rtnJson);
		} catch(SQLException e) {
			log(e.getMessage());
		} catch(Exception e) {
			log(e.getMessage());
		}
	}
}
