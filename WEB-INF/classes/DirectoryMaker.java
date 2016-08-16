import java.io.PrintWriter;
import java.io.IOException;
import java.sql.SQLException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class DirectoryMaker extends AbstractServlet  {
	public void doPost(HttpServletRequest request, HttpServletResponse response)
		throws IOException, ServletException {

		try {
			ready(request, response);
			connectDatabase(/* url = */"jdbc:mysql://localhost/tategaki_editor", /* username = */"serveruser", /* password = */"digk473");

			int userId = Integer.parseInt(request.getParameter("user_id"));

			// userIdから、ルートディレクトリのidを取得
			executeSql("select * from edit_users where id = ?").setInt(userId).query();
			int rootId;
			if (next()) {
				rootId = getInt("root_file_id");
			} else {
				log("database has no new data");
				throw new SQLException();	
			}
			
			// 行を挿入し、ファイル名、ユーザーID、最終更新日を保存
			String directoryname = request.getParameter("directoryname");
			long savedMillis = Long.parseLong(request.getParameter("saved"));
			executeSql("insert into file_table (filename,type,parent_dir,user_id,saved) values (?,?,?,?,?)")
				.setString(directoryname).setString("dir").setInt(rootId).setInt(userId).setTimeMillis(savedMillis).update();

			// 新しいfileIdを取得
			executeSql("select * from file_table where user_id = ? and saved = ?").setInt(userId).setTimeMillis(savedMillis).query();

			int directoryId;
			if (next()) {
				directoryId = getInt("id");
			} else {
				throw new SQLException();
			}

			//	ajaxへ送信
			String rtn = String.format("{\"newDirectoryID\" : \"%d\",\"filename\" : \"%s\"}",directoryId,directoryname);
			out(rtn);

			log("DirectoryMaker return is " + rtn);
		} catch(SQLException e) {
			log(e.getMessage());
		} catch(Exception e) {
			log(e.getMessage());
		}
	}
}
