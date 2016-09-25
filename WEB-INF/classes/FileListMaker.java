import java.io.PrintWriter;
import java.io.IOException;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
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
			connectDatabase(/* url = */"jdbc:mysql://localhost/tategaki_editor",/* username = */"serveruser", /* password = */"digk473");

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
	private String getFileJson(int userId,int parentId) {
		// 再帰的にデータベースへの問い合わせを行うため、preparestatementを一つしか持てないexecuteSql()が使えない
		StringBuilder sb = new StringBuilder();
		try {
			String sql = "select * from file_table where user_id = ? and (parent_dir = ? or id = ?)";
			PreparedStatement pstmt = connection.prepareStatement(sql);
			pstmt.setInt(1,userId);
			pstmt.setInt(2,parentId);
			pstmt.setInt(3,parentId);
			ResultSet rs = pstmt.executeQuery();
			sb.append("{");
			for (int i = 0; rs.next(); i++) {
				if(i != 0) sb.append(",");
				int fileId = rs.getInt("id");
				sb.append("\"");
				if (fileId == parentId) {
					// parentIdのディレクトリ自身
					sb.append("directoryname\":\"");
					sb.append(rs.getString("filename"));
					sb.append("\"");
				} else {
					// 親がparentId
					sb.append(fileId);
					sb.append("\":");
					if (rs.getString("type").equals("file")) {
						sb.append("\"");
						sb.append(rs.getString("filename"));
						sb.append("\"");
					} else {
						// 親がparentIdのディレクトリなら再帰
						sb.append(getFileJson(userId,fileId));
					}
				}
			}
			sb.append("}");
			pstmt.close();
		} catch(SQLException e) {
			log(e.getMessage());
		}
		return sb.toString();
	}
}
