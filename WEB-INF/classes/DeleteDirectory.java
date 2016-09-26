import java.io.PrintWriter;
import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * ディレクトリのIDとオプションの真偽値を受け取り、指定のディレクトリの削除処理を行うサーブレット
 * ディレクトリ内に別のファイルやディレクトリがあった場合、オプションがtrueなら中身ごと削除します
 * <pre>
 * request: {
 * 	directory_id,
 * 	option
 * 	}
 * response: {
 * 	result
 * 	}
 * </pre>
 * responseのresultには、
 *     空のディレクトリを削除した場合には"success"が、
 *     空ではないディレクトリを中身ごと削除した場合には"success(fileIn)"が、
 *     空ではないディレクトリを削除しようとしたがオプションがfalseであって削除できなかった場合には"notEmpty"
 *     になります
 */
public class DeleteDirectory extends AbstractServlet  {
	public void doPost(HttpServletRequest request, HttpServletResponse response)
		throws IOException, ServletException {

			ready(request, response);
			connectDatabase();

			int directoryId = Integer.parseInt(request.getParameter("directory_id"));
			boolean option = Boolean.valueOf(request.getParameter("option"));
			String rtnJson;
			if (hasFileInDirectory(directoryId)) {
				rtnJson = deleteInDirectory(directoryId, option);
			} else {
				rtnJson = deleteEmptyDirectory(directoryId);
			}

			// レスポンス
			out(rtnJson);

			log("DeleteDirectory's directoryId:"+ directoryId + ", option:"+ option);
	}

	// ディレクトリ内にファイルがあればtrue
	private boolean hasFileInDirectory(int directoryId) {
		Entry entry = executeSql("select * from file_table where parent_dir = ?").setInt(directoryId).query();
		return entry.next();
	}

	/**
	 * 空のディレクトリを削除します
	 * @param directoryId 削除するディレクトリのID
	 */
	private String deleteEmptyDirectory(int directoryId) {
		executeSql("delete from file_table where id = ?").setInt(directoryId).update();
		return "{\"result\":\"success\"}";
	}

	/**
	 * ディレクトリ内にファイルが存在する場合の削除処理を行います
	 * @param directoryId 削除するディレクトリのID
	 * @param option 中のファイルごと削除する場合はtrue、そうでなければfalse
	 */
	private String deleteInDirectory(int directoryId, boolean option) {
		if (option) {
			// 強制的にディレクトリ内ファイルごと削除する
			// データベース上だけ
			executeSql("delete from file_table where id = ? or parent_dir = ?").setInt(directoryId).setInt(directoryId).update();
			return "{\"result\":\"success(fileIn)\"}";
		}
		return "{\"result\":\"notEmpty\"}";
	}
}
