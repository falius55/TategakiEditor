import java.io.PrintWriter;
import java.io.IOException;
import java.sql.SQLException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * ファイル情報を受けとり、ファイルID.jsonという名前のファイルにJSONの中身を書き出し、データベースにファイル名と更新日時を保存する
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
			response.setContentType("application/json; charset=UTF-8");
			request.setCharacterEncoding("UTF-8");
			PrintWriter out = response.getWriter();
			connectDatabase(/* url = */"jdbc:mysql://localhost/tategaki_editor", /* username = */"serveruser", /* password = */"digk473");

			// ファイル名、最終更新日の更新
			int fileId = Integer.parseInt(request.getParameter("file_id"));

			// ファイル名
			String fileName = request.getParameter("filename");
			executeSql("update file_table set filename = ? where id = ?").setString(fileName).setInt(fileId).update();

			// 更新日
			long savedMillis = Long.parseLong(request.getParameter("saved"));
			executeSql("update file_table set saved = ? where id = ?").setTimeMillis(savedMillis).setInt(fileId).update();

			// userIdから、ルートディレクトリのidを取得
			log("get root id");
			int userId = Integer.parseInt(request.getParameter("user_id"));
			executeSql("select * from edit_users where id = ?").setInt(userId).query();

			int rootId;
			if (next()) {
				rootId = getInt("root_file_id");
			} else {
				log("database has no new data");
				throw new SQLException();	
			}
			
			// テキストファイルへの書き込み
			log("witing text file");

			String json = request.getParameter("json");
			writeFile(String.format("data/%d/%d.json",rootId,fileId), json);

			// レスポンス
			String rtnJson = String.format("{\"result\":\"save success\",\"strDate\":\"%s\"}",dateFormat(savedMillis));
			out.println(rtnJson);

			out.close();
		} catch(IOException e) {
			log(e.getMessage());
		} catch(SQLException e) {
			log(e.getMessage());
		} catch(Exception e) {
			log(e.getMessage());
		}
	}
}
