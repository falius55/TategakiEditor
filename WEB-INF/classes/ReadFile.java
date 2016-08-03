import java.io.PrintWriter;
import java.io.File;
import java.io.FileReader;
import java.io.BufferedReader;
import java.io.IOException;
import java.sql.SQLException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;


public class ReadFile extends AbstractServlet  {
	public void doPost(HttpServletRequest request, HttpServletResponse response)
		throws IOException, ServletException {

		try {
			response.setContentType("application/json; charset=UTF-8");
			PrintWriter out = response.getWriter();
			connectDatabase(/* url = */"jdbc:mysql://localhost/tategaki_editor", /* username = */"serveruser", /* password = */"digk473");

			//	idから目的のファイル名、最終更新日を取得
			int fileId = Integer.parseInt(request.getParameter("file_id"));
			executeSql("select * from file_table where id = ?").setInt(fileId).query();

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

			//	 ファイル読込
			String path = contextPath(String.format("data/%d/%d_txt.txt",rootId,fileId));	// ルートディレクトリ/data/rootId/fileId.txtとなる
			BufferedReader br = new BufferedReader(new FileReader(new File(path)));

			// 複数行読み出し、配列で返している
			// {"literaArray": ["a","b","c"]}
			sb.append("\"literaArray\": [");
			String str = br.readLine();
			for(int i=0;str != null ;i++) {
				if(i!=0)	sb.append(",");
				sb.append("\"");
				sb.append(str);
				sb.append("\"");
				str = br.readLine();
			}
			sb.append("]}");

			//	 ajaxへ送信
			out.println(sb.toString());

			br.close();
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
