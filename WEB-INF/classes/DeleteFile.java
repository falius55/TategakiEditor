import java.io.PrintWriter;
import java.io.IOException;
import java.sql.SQLException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * <p>ユーザーIDとファイルIDを受け取り、指定されたファイルを削除するサーブレット
 * <pre>
 * request: {
 * 	user_id,
 * 	file_id
 * 	}
 * response: {
 * 	successRecord,
 * 	result
 * 	}
 * </pre>
 * successRecordは処理した行数、resultは削除に成功するとtrue
 */
public class DeleteFile extends AbstractServlet {
	public void doPost(HttpServletRequest request, HttpServletResponse response)
		throws IOException, ServletException {

		try {
			ready(request, response);
			connectDatabase(/* url = */"jdbc:mysql://localhost/tategaki_editor", /* username = */"serveruser", /* password = */"digk473");

			// --- データベースから該当idのファイルレコードを削除 ---
			int fileId = Integer.parseInt(request.getParameter("file_id"));
			int num = executeSql("delete from file_table where id = ?").setInt(fileId).update();

			// --- 該当ファイルを削除 ---
			int userId = Integer.parseInt(request.getParameter("user_id"));
			// rootIdの取得
			executeSql("select * from file_table where user_id = ? and type = ? ").setInt(userId).setString("root").query();
			int rootId;
			if (next()) {
				rootId = getInt("id");
			} else {
				throw new SQLException("database has no new data");	
			}

			boolean b = deleteFile(String.format("data/%d/%d.txt",rootId,fileId)); // 削除

			//	ajaxへ送信
			out("{\"successRecord\" : \"%d\",\"result\": \"%b\"}\n",num,b);
		} catch(SQLException e) {
			log(e.getMessage());
		} catch(Exception e) {
			log(e.getMessage());
		}
	}
}
