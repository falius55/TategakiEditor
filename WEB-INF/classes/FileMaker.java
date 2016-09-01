import java.io.PrintWriter;
import java.io.IOException;
import java.sql.SQLException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * <p>ユーザーID、ファイル名、日時を表すミリ秒の値を受け取り、新しい空ファイルを作成するサーブレット
 * <pre>
 * request: {
 * 	user_id,
 * 	filename,
 *		saved
 * 	}
 * response: {
 * 	newFileId,
 * 	filename
 * 	}
 * </pre>
 */
public class FileMaker extends AbstractServlet  {
	public void doPost(HttpServletRequest request, HttpServletResponse response)
		throws IOException, ServletException {

		try {
			response.setContentType("application/json; charset=UTF-8");
			PrintWriter out = response.getWriter();
			connectDatabase(/* url = */"jdbc:mysql://localhost/tategaki_editor", /* username = */"serveruser", /* password = */"digk473");

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

			// 行を挿入し、ファイルId、ユーザー名、最終更新日を保存
			String fileName = request.getParameter("filename");
			long savedMillis = Long.parseLong(request.getParameter("saved"));
			executeSql("insert into file_table (filename,type,parent_dir,user_id,saved) values (?,?,?,?,?)")
				.setString(fileName).setString("file").setInt(rootId).setInt(userId).setTimeMillis(savedMillis).update();

			// 新しいfileIdを取得
			executeSql("select * from file_table where user_id = ? and saved = ?").setInt(userId).setTimeMillis(savedMillis).query();

			int fileId;
			if (next()) {
				fileId = getInt("id");
			} else {
				throw new SQLException();
			}

			// ファイルを作成
			createFile(String.format("data/%d/%d.txt",rootId,fileId));

			//	ajaxへ送信
			String rtn = String.format("{\"newFileId\" : \"%d\",\"filename\" : \"%s\"}",fileId,fileName);
			out.println(rtn);

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
