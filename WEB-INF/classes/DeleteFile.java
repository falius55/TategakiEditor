import java.io.PrintWriter;
import java.io.IOException;
import java.sql.SQLException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class DeleteFile extends AbstractServlet {
	public void doPost(HttpServletRequest request, HttpServletResponse response)
		throws IOException, ServletException {

		try {
			response.setContentType("application/json; charset=UTF-8");
			PrintWriter out = response.getWriter();
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
				log("database has no new data");
				throw new SQLException();	
			}

			boolean b = deleteFile(String.format("data/%d/%d.txt",rootId,fileId)); // 削除

			//	ajaxへ送信
			out.printf("{\"successRecord\" : \"%d\",\"result\": \"%b\"}\n",num,b);

			out.close();
		} catch(IOException e) {
			log(e.getMessage());
		} catch(Exception e) {
			log(e.getMessage());
		}
	}
}
