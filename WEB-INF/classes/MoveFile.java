import java.io.PrintWriter;
import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * <p>ユーザーIDとファイルID、ディレクトリIDを受け取り、ファイルをディレクトリの配下に置くデータベース処理を行うサーブレット<br>
 * ローカルに保存されているファイルが実際に移動されるわけではありません
 * <pre>
 * request: {
 * 	user_id,
 * 	file_id,
 *		directory_id
 * 	}
 * response: {
 * 	result
 * 	}
 * </pre>
 * resultには"success"が入る
 */
public class MoveFile extends AbstractServlet  {
	public void doPost(HttpServletRequest request, HttpServletResponse response)
		throws IOException, ServletException {

		try {
			ready(request, response);

			int fileId = Integer.parseInt(request.getParameter("file_id"));
			int parentDirId = Integer.parseInt(request.getParameter("directory_id"));

			changeParentDir(fileId, parentDirId);

			String rtnJson = "{\"result\":\"success\"}";
			out(rtnJson);

			log("MoveFile's parentDirId:"+ parentDirId + ",fileId:"+ fileId);
		} catch(Exception e) {
			log(e.getMessage());
		}
	}

	/**
	 * 親ディレクトリを変更します
	 */
	private void changeParentDir(int fileId, int newParentId) {
		executeSql("update file_table set parent_dir = ? where id = ?").setInt(newParentId).setInt(fileId).update();
	}
}
