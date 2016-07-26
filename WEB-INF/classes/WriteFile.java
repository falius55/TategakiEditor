import java.io.*;
import javax.servlet.*;
import javax.servlet.http.*;
import java.sql.*;
import java.net.*;
import java.util.*;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.Gson;

// ajax通信用
public class WriteFile extends HttpServlet  {
	Connection conn = null;
	// ========================================================================
	// jsp起動時の処理
	// =======================================================================
	// データベースへの接続
	public void init() {
		String url = "jdbc:mysql://localhost/tategaki_editor";
		String user = "serveruser";
		String password = "digk473";

		try {
			// 指定したクラスのインスタンスを作成してJDBCドライバをロードする
			Class.forName("com.mysql.jdbc.Driver").newInstance();

			// Drivermanagerに接続(データベースへの接続)
			conn = DriverManager.getConnection(url,user,password);


		} catch (ClassNotFoundException e) {
			log("ClassNotFoundException:" + e.getMessage());
		} catch (SQLException e) {
			log("SQLException:" + e.getMessage());
		} catch (Exception e) {
			log("Exception:" + e.getMessage());
		} 
	}
	// =======================================================================
	// 	jsp破棄時の処理
	// =======================================================================
	public void destroy(){
		try{
			if(conn != null){
				conn.close();
			}
		}catch(SQLException e){
			log("SQLException:" + e.getMessage());
		}
	}

	// =========================================================================
	// 	main
	// =========================================================================
	public void doPost(HttpServletRequest request, HttpServletResponse response)
		throws IOException, ServletException {

		try{
			response.setContentType("application/json; charset=UTF-8");
			// 受取のcharset
			request.setCharacterEncoding("UTF-8");
			PrintWriter out = response.getWriter();

			int fileID = Integer.parseInt(request.getParameter("file_id"));
			// ========================================================================
			// 	ファイル名、最終更新日の更新
			// ========================================================================

			// ファイル名
			String fileName = request.getParameter("filename");
			String sql = "update file_table set filename = ? where id = ?";
			PreparedStatement pstmt = conn.prepareStatement(sql);
			pstmt.setString(1,fileName);
			pstmt.setInt(2,fileID);
			pstmt.executeUpdate();
			pstmt.close();

			// 更新日
			long savedMillis = Long.parseLong(request.getParameter("saved"));
			java.sql.Date date = new java.sql.Date(savedMillis);
			sql = "update file_table set saved = ? where id = ?";
			pstmt = conn.prepareStatement(sql);
			pstmt.setDate(1,date);
			pstmt.setInt(2,fileID);
			pstmt.executeUpdate();
			pstmt.close();

			// =======================================================
			// 	userIDから、ルートディレクトリのidを取得
			// =======================================================
			int userID = Integer.parseInt(request.getParameter("user_id"));
			sql = "select * from edit_users where id = ?";
			pstmt = conn.prepareStatement(sql);
			pstmt.setInt(1,userID);
			ResultSet rs = pstmt.executeQuery();
			int rootID;
			if (rs.next()) {
				rootID = rs.getInt("root_file_id");
			}else{
				log("database has no new data");
				throw new SQLException();	
			}
			pstmt.close();

			// ==========================================================================
			// 	テキストファイルへの書き込み
			// ==========================================================================
			// サーバー用ルートディレクトリ(/tategaki)までのパスを取得
			ServletContext context = this.getServletContext();
			String path = context.getRealPath(String.format("data/%d/%d_txt.txt",rootID,fileID));	// ルートディレクトリ/data/rootID/fileID.txtとなる
			BufferedWriter bw = new BufferedWriter(new FileWriter(new File(path),false));

			String json = request.getParameter("json");
			Gson gson = new Gson();
			List contents = gson.fromJson(json,List.class);
			for (int i=0; i<contents.size(); i++) {
				bw.write((String)contents.get(i));
				bw.newLine(); // 改行する
			}

			// =============================================================================
			// 	レスポンス
			// =============================================================================
			String rtnJson = String.format("{\"result\":\"save success\",\"strDate\":\"%s\"}",date.toString());
			out.println(rtnJson);


			bw.close();
			out.close();
		}catch(IOException e){
			log("IOException");
			log("getMessage is " + e.getMessage());
		}catch(SQLException e){
			log("SQLException");
			log("getMessage is " + e.getMessage());
		}catch(Exception e){
			log("Exception");
			log("getMessage is " + e.getMessage());
		}
	}
}
