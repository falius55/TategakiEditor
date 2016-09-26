import java.io.PrintWriter;
import java.io.IOException;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.StringJoiner;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * <p>ユーザーIDを受け取り、ファイルのツリー構造を表すJSONを文字列で返すサーブレット
 * <pre>
 * request: {
 * 	user_id
 * 	}
 * // responseは一例
 * response: {
 * 	"directoryname": "root",
 * 	"1":"sample",
 * 	"8":"file",
 * 	"6": {
 * 	"directoryname": "dirname",
 * 	"4":"indirfile",
 * 	"9":"file",
 * 	"12": {
 * 		"directoryname": "seconddir",
 * 		"17": "file"
 * 		}
 * 	}
 *	}
 * </pre>
 */
public class FileListMaker extends AbstractServlet  {
	public void doPost(HttpServletRequest request, HttpServletResponse response)
		throws IOException, ServletException {

		try {
			ready(request, response);
			connectDatabase();

			int userId = Integer.parseInt(request.getParameter("user_id"));
			int rootId = rootId(userId);

			String rtnJson = getFileJson(userId,rootId);
			out(rtnJson);

			log("FileListMaker return is " + rtnJson);
		} catch(SQLException e) {
			log(e.getMessage());
		} catch(Exception e) {
			log(e.getMessage());
		}
	}

	/**
	 * ディレクトリツリーを表すJSON文字列を作成します
	 * <pre>
	 * <code>
	 *  // 戻り値例
	 * {
	 * 	"directoryname": "root",
	 * 	"1":"sample",
	 * 	"8":"file",
	 * 	"6": {
	 * 		"directoryname": "dirname",
	 * 		"4":"indirfile",
	 * 		"9":"file",
	 * 		"12": {
	 * 			"directoryname": "seconddir",
	 * 			"17": "file"
	 * 		}
	 * 	}
	 * }
	 * </code>
	 * </pre>
	 */
	private String getFileJson(int userId, int parentId) {
		Entry entry = executeSql("select * from file_table where user_id = ? and (parent_dir = ? or id = ?)")
			.setInt(userId).setInt(parentId).setInt(parentId).query();
		StringJoiner sj = new StringJoiner(",", "{", "}");
		for (int i = 0; entry.next(); i++) {
			int id = entry.getInt("id").orElse(-1);
			if (id == parentId) {
				sj.add(String.format("\"directoryname\":\"%s\"", entry.getString("filename").orElse("not found")));
				continue;
			}
			if (entry.getString("type").orElse("").equals("file"))
				sj.add(String.format("\"%d\":\"%s\"", id, entry.getString("filename").orElse("not found")));
			if (entry.getString("type").orElse("").equals("dir"))
				sj.add(String.format("\"%d\":%s", id, getFileJson(userId, id)));
		}
		return sj.toString();
	}
}
