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

			int fileId = Integer.parseInt(request.getParameter("file_id"));
			int num = deleteFileFromDatabase(fileId);

			int userId = Integer.parseInt(request.getParameter("user_id"));
			int rootId = rootId(userId);

			boolean b = deleteFile(String.format("data/%d/%d.txt",rootId,fileId));

			out("{\"successRecord\" : \"%d\",\"result\": \"%b\"}\n",num,b);
		} catch(SQLException e) {
			log(e.getMessage());
		} catch(Exception e) {
			log(e.getMessage());
		}
	}

	/**
	 * @return 削除数
	 */
	private int deleteFileFromDatabase(int fileId) {
		return executeSql("delete from file_table where id = ?").setInt(fileId).update();
	}
}
