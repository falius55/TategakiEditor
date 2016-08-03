import java.io.*;
import javax.servlet.*;
import javax.servlet.http.*;
import java.sql.*;
import java.net.*;
import java.util.*;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.Gson;

public class WriteFile extends AbstractServlet  {
	public void doPost(HttpServletRequest request, HttpServletResponse response)
		throws IOException, ServletException {

		try {
			response.setContentType("application/json; charset=UTF-8");
			// 受取のcharset
			request.setCharacterEncoding("UTF-8");
			PrintWriter out = response.getWriter();
			startSql("jdbc:mysql://localhost/tategaki_editor","serveruser","digk473");

			int fileId = Integer.parseInt(request.getParameter("file_id"));

			// ファイル名の更新
			String filename = request.getParameter("filename");
			executeSql("update file_table set filename = ? where id = ?").setString(filename).setInt(fileId).update();

			// 更新日の更新
			long savedMillis = Long.parseLong(request.getParameter("saved"));
			executeSql("update file_table set saved = ? where id = ?").setTimeMillis(savedMillis).setInt(fileId).update();

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

			// テキストファイルへの書き込み
			String path = contextPath(String.format("data/%d/%d_txt.txt",rootId,fileId));	// ルートディレクトリ/data/rootId/fileId.txtとなる
			BufferedWriter bw = new BufferedWriter(new FileWriter(new File(path),false));

			String json = request.getParameter("json");
			Gson gson = new Gson();
			List contents = gson.fromJson(json,List.class);
			for (int i=0; i<contents.size(); i++) {
				bw.write((String)contents.get(i));
				bw.newLine(); // 改行する
			}

			// レスポンス
			String rtnJson = String.format("{\"result\":\"save success\",\"strDate\":\"%s\"}",dateFormat(savedMillis));
			out.println(rtnJson);

			bw.close();
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
