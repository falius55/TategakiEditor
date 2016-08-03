import java.io.PrintWriter;
import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class MoveFile extends AbstractServlet  {
	public void doPost(HttpServletRequest request, HttpServletResponse response)
		throws IOException, ServletException {

		try {
			response.setContentType("application/json; charset=UTF-8");
			// 受取のcharset
			request.setCharacterEncoding("UTF-8");
			PrintWriter out = response.getWriter();
			connectDatabase(/* url = */"jdbc:mysql://localhost/tategaki_editor", /* username = */"serveruser", /* password = */"digk473");

			int fileId = Integer.parseInt(request.getParameter("file_id"));
			int parentDirId = Integer.parseInt(request.getParameter("directory_id"));

			// 親ディレクトリの更新
			executeSql("update file_table set parent_dir = ? where id = ?").setInt(parentDirId).setInt(fileId).update();

			// レスポンス
			String rtnJson = "{\"result\":\"success\"}";
			out.println(rtnJson);

			log("MoveFile's parentDirId:"+ parentDirId + ",fileId:"+ fileId);
			out.close();
		} catch(IOException e) {
			log(e.getMessage());
		} catch(Exception e) {
			log(e.getMessage());
		}
	}
}
