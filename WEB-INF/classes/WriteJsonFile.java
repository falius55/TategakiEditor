import java.io.*;
import javax.servlet.*;
import javax.servlet.http.*;
import java.sql.*;
import java.net.*;
import java.util.*;
import java.text.*;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.Gson;

// ajax通信用
// Post
// file_id.txtという名前のファイルにjsonの中身を書き出し、データベースにファイル名と更新日時を保存します。
public class WriteJsonFile extends HttpServlet  {
	Connection conn = null;
	PreparedStatement pstmt;
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
	// ConnectionとStatementをcloseしている
	public void destroy(){
		try{
			if(conn != null){
				conn.close();
				pstmt.close();
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
			request.setCharacterEncoding("UTF-8");
			PrintWriter out = response.getWriter();

			// ========================================================================
			// 	ファイル名、最終更新日の更新
			// ========================================================================
			int fileID = Integer.parseInt(request.getParameter("file_id"));

			// ファイル名
			String fileName = request.getParameter("filename");
			String sql = "update file_table set filename = ? where id = ?";
			pstmt = conn.prepareStatement(sql);
			pstmt.setString(1,fileName);
			pstmt.setInt(2,fileID);
			pstmt.executeUpdate();

			// 更新日
			long savedMillis = Long.parseLong(request.getParameter("saved"));
			java.util.Date date = new java.util.Date(savedMillis); // java.sql.Dateは、時分秒を切り捨ててしまう
			String strDate = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(date);
			sql = "update file_table set saved = ? where id = ?";
			pstmt = conn.prepareStatement(sql);
			pstmt.setString(1,strDate);
			pstmt.setInt(2,fileID);
			pstmt.executeUpdate();

			// =======================================================
			// 	userIDから、ルートディレクトリのidを取得
			// =======================================================
			log("get root id");
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
			
			// ==========================================================================
			// 	テキストファイルへの書き込み
			// ==========================================================================
			// サーバー用ルートディレクトリ(/tategaki)までのパスを取得
			log("witing text file");
			ServletContext context = this.getServletContext();
			String path = context.getRealPath(String.format("data/%d/%d.txt",rootID,fileID));	// ルートディレクトリ/data/rootID/fileID.txtとなる
			BufferedWriter bw = new BufferedWriter(new FileWriter(new File(path),false));

			String json = request.getParameter("json");
			bw.write(json);

			// =============================================================================
			// 	レスポンス
			// =============================================================================
			String rtnJson = String.format("{\"result\":\"save success\",\"strDate\":\"%s\"}",strDate);
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
