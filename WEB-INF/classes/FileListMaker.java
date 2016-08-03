import java.io.PrintWriter;
import java.io.IOException;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class FileListMaker extends AbstractServlet  {
	public void doPost(HttpServletRequest request, HttpServletResponse response)
		throws IOException, ServletException {

		try {
			response.setContentType("application/json; charset=UTF-8");
			PrintWriter out = response.getWriter();
			connectDatabase(/* url = */"jdbc:mysql://localhost/tategaki_editor",/* username = */"serveruser", /* password = */"digk473");

			// userIdから、ルートディレクトリのidを取得
			int userId = Integer.parseInt(request.getParameter("user_id"));
			executeSql("select * from edit_users where id = ?").setInt(userId).query();
			int rootId;
			if (next()) {
				rootId = getInt("root_file_id");
			} else {
				log("database has no new data");
				throw new SQLException();	
			}

			//	 ajaxへ送信
			String rtnJson = getFileJson(userId,rootId);
			out.println(rtnJson);


			log("FileListMaker return is " + rtnJson);
			out.close();
		} catch(IOException e) {
			log(e.getMessage());
		} catch(Exception e) {
			log(e.getMessage());
		}
	}

	private String getFileJson(int userId,int parentId) {
		// 再帰的にデータベースへの問い合わせを行うため、preparestatementを一つしか持てないexecuteSql()が使えない
		StringBuffer sb = new StringBuffer();
		try {
			String sql = "select * from file_table where user_id = ? and (parent_dir = ? or id = ?)";
			PreparedStatement pstmt = connection.prepareStatement(sql);
			pstmt.setInt(1,userId);
			pstmt.setInt(2,parentId);
			pstmt.setInt(3,parentId);
			ResultSet rs = pstmt.executeQuery();
			sb.append("{");
			for (int i=0;rs.next();i++) {
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
