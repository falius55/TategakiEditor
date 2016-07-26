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
// Post
public class MoveFile extends HttpServlet  {
	// インスタンス変数
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
	// ConnectionとStatementをcloseしている
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
			// 返す値が1行だけならtext/plain
			// 複数ならapplication/json
			// response.setContentType("text/plain; charset=UTF-8");
			response.setContentType("application/json; charset=UTF-8");
			// 受取のcharset
			request.setCharacterEncoding("UTF-8");
			PrintWriter out = response.getWriter();

			int fileID = Integer.parseInt(request.getParameter("file_id"));
			int parentDirID = Integer.parseInt(request.getParameter("directory_id"));
			// ========================================================================
			// 	親ディレクトリの更新
			// ========================================================================
			String sql = "update file_table set parent_dir = ? where id = ?";
			PreparedStatement pstmt = conn.prepareStatement(sql);
			pstmt.setInt(1,parentDirID);
			pstmt.setInt(2,fileID);
			pstmt.executeUpdate();
			pstmt.close();
			// =============================================================================
			// 	レスポンス
			// =============================================================================
			String rtnJson = "{\"result\":\"success\"}";
			out.println(rtnJson);


			log("MoveFile's parentDirID:"+ parentDirID + ",fileID:"+ fileID);
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
