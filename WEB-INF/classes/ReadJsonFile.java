import java.io.PrintWriter;
import java.io.IOException;
import java.sql.SQLException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;


public class ReadJsonFile extends AbstractServlet  {
	public void doPost(HttpServletRequest request, HttpServletResponse response)
		throws IOException, ServletException {

		try {
			response.setContentType("application/json; charset=UTF-8");
			PrintWriter out = response.getWriter();
			connectDatabase(/* url = */"jdbc:mysql://localhost/tategaki_editor", /* username = */"serveruser", /* password = */"digk473");

			//	 idから目的のファイル名、最終更新日を取得
			int fileID = Integer.parseInt(request.getParameter("file_id"));
			executeSql("select * from file_table where id = ?").setInt(fileID).query();

			String fileName;
			String saved;
			if (next()) {
				fileName = getString("filename");
				saved = getDateFormat("saved");
			} else {
				throw new SQLException();	
			}

			StringBuffer sb = new StringBuffer();
			sb.append("{\"filename\":\"");
			sb.append(fileName);
			sb.append("\",");
			sb.append("\"saved\":\"");
			sb.append(saved);
			sb.append("\",");

			// userIDから、ルートディレクトリのidを取得
			int userID = Integer.parseInt(request.getParameter("user_id"));
			executeSql("select * from edit_users where id = ?").setInt(userID).query();
			int rootID;
			if (next()) {
				rootID = getInt("root_file_id");
			} else {
				log("database has no new data");
				throw new SQLException();	
			}

			//	ファイル読込
			sb.append("\"data\":");
			sb.append(readFile(String.format("data/%d/%d.txt",rootID,fileID)));
			sb.append("}");

			//	ajaxへ送信
			String rtnJson = sb.toString().replaceAll("\"","\\\""); // jsonファイル中の"を\"にエスケープする
			log(rtnJson);
			out.println(rtnJson);

			out.close();
			log("fileName is " + fileName);
		} catch(IOException e) {
			log(e.getMessage());
		} catch(SQLException e) {
			log(e.getMessage());
		} catch(Exception e) {
			log(e.getMessage());
		}
	}
}
