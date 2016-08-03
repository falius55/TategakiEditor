import java.io.*;
import javax.servlet.*;
import javax.servlet.http.*;
import java.sql.*;
import java.net.*;
import java.util.*;

public class DeleteDirectory extends AbstractServlet  {
	public void doPost(HttpServletRequest request, HttpServletResponse response)
		throws IOException, ServletException {

		try {
			response.setContentType("application/json; charset=UTF-8");
			// 受取のcharset
			request.setCharacterEncoding("UTF-8");
			PrintWriter out = response.getWriter();
			startSql("jdbc:mysql://localhost/tategaki_editor","serveruser","digk473");

			int directoryId = Integer.parseInt(request.getParameter("directory_id"));
			boolean option = Boolean.getBoolean(request.getParameter("option"));
			String rtnJson;
			if (hasFileInDirectory(directoryId)) {
				// ディレクトリ内にファイルが存在する
				if (option) {
					// 強制的にディレクトリ内ファイルごと削除する
					// データベース上だけ
					executeSql("delete from file_table where id = ? or parent_dir = ?").setInt(directoryId).setInt(directoryId).update();
					rtnJson = "{\"result\":\"success(file in)\"}";
				}
				rtnJson = "{\"result\":\"within\"}";
			} else {
				// ディレクトリ内にファイルが存在しない
				executeSql("delete from file_table where id = ?").setInt(directoryId).update();
				rtnJson = "{\"result\":\"success\"}";
			}

			// レスポンス
			out.println(rtnJson);

			log("DeleteDirectory's directoryId:"+ directoryId);
			out.close();
		} catch(IOException e) {
			log(e.getMessage());
		} catch(Exception e) {
			log(e.getMessage());
		}
	}

	// ディレクトリ内にファイルがあればtrue
	private boolean hasFileInDirectory(int directoryId) {
		executeSql("select * from file_table where parent_dir = ?").setInt(directoryId).query();
		return next();
	}
}
