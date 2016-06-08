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
public class DeleteDirectory extends HttpServlet  {
	// インスタンス変数
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
			// 返す値が1行だけならtext/plain
			// 複数ならapplication/json
			// response.setContentType("text/plain; charset=UTF-8");
			response.setContentType("application/json; charset=UTF-8");
			// 受取のcharset
			request.setCharacterEncoding("UTF-8");
			PrintWriter out = response.getWriter();

			int directoryID = Integer.parseInt(request.getParameter("directory_id"));
			boolean option = Boolean.getBoolean(request.getParameter("option"));
			String rtnJson;
			if (isFileInDirectory(directoryID)) {
				// ディレクトリ内にファイルが存在する
				if (option) {
					// 強制的にディレクトリ内ファイルごと削除する
					// データベース上だけ
					String sql = "delete from file_table where id = ? or parent_dir = ?;";
					pstmt = conn.prepareStatement(sql);
					pstmt.setInt(1,directoryID);
					pstmt.setInt(2,directoryID);
					pstmt.executeUpdate();
					rtnJson = "{\"result\":\"success(file in)\"}";
				}
					rtnJson = "{\"result\":\"failed\"}";
			}else{
				// ディレクトリ内にファイルが存在しない		
					String sql = "delete from file_table where id = ?;";
					pstmt = conn.prepareStatement(sql);
					pstmt.setInt(1,directoryID);
					pstmt.executeUpdate();
					rtnJson = "{\"result\":\"success\"}";
			}
			// =============================================================================
			// 	レスポンス
			// =============================================================================
			out.println(rtnJson);


			log("DeleteDirectory's directoryID:"+ directoryID);
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
	private boolean isFileInDirectory(int directoryID) {
		// ディレクトリ内にファイルがあればtrue
		try{
			String sql = "select * from file_table where type = ? and parent_dir = ?";
			pstmt = conn.prepareStatement(sql);
			pstmt.setString(1,"file");
			pstmt.setInt(2,directoryID);
			ResultSet rs = pstmt.executeQuery();
			if (rs.next()) {
				return true;
			}else{
				return false;		
			}
		}catch(SQLException e){
			log("SQLException");
			log("getMessage is " + e.getMessage());
		}
		return false;
	}
}
