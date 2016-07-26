import java.io.*;
import java.util.*;
import javax.servlet.*;
import javax.servlet.http.*;
import java.sql.*;
import java.net.*;

/**
 * ajax
 * POST通信
 */
public class CreateFile extends HttpServlet  {
	// インスタンス変数
	Connection conn = null;
	// ====================================================================
	// 	servlet起動時の処理
	// ====================================================================
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
	// =====================================================================
	// 	servlet破棄時の処理
	// =====================================================================
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

	// =======================================================================
	// 	main
	// =======================================================================
	public void doPost(HttpServletRequest request, HttpServletResponse response)
		throws IOException, ServletException {

		try{
			// 返す値が1行だけならtext/plain
			// 複数ならapplication/json
			// response.setContentType("text/plain; charset=UTF-8");
			response.setContentType("application/json; charset=UTF-8");
			PrintWriter out = response.getWriter();

			// =======================================================
			// 	userIDから、ルートディレクトリのidを取得
			// =======================================================
			int userID = Integer.parseInt(request.getParameter("user_id"));
			String sql = "select * from edit_users where id = ?";
			PreparedStatement pstmt = conn.prepareStatement(sql);
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
			
			// ===================================================================
			// 	行を挿入し、ファイル名、ユーザー名、最終更新日を保存
			// ===================================================================
			// ファイル名
			String fileName = request.getParameter("filename");
			long savedMillis = Long.parseLong(request.getParameter("saved"));
			java.sql.Date date = new java.sql.Date(savedMillis);
			sql = "insert into file_table (filename,type,parent_dir,user_id,saved) values (?,?,?,?,?)";
			pstmt = conn.prepareStatement(sql);
			pstmt.setString(1,fileName);
			pstmt.setString(2,"file");
			pstmt.setInt(3,rootID);
			pstmt.setInt(4,userID);
			pstmt.setDate(5,date);
			pstmt.executeUpdate();
			pstmt.close();

			// ====================================================================
			// 	新しいfileIDを取得
			// ====================================================================
			sql = "select * from file_table where saved = ? and user_id = ?";
			pstmt = conn.prepareStatement(sql);
			pstmt.setDate(1,date);
			pstmt.setInt(2,userID);
			rs = pstmt.executeQuery();

			int fileID;
			if (rs.next()) {
				fileID = rs.getInt("id");
			}else{
				throw new SQLException();
			}
			pstmt.close();
			// =====================================================================
			// 	ファイルを作成
			// =====================================================================
			// サーバー用ルートディレクトリ(/tategaki)までのパスを取得
			ServletContext context = this.getServletContext();
			String path = context.getRealPath(String.format("data/%d/%d.txt",rootID,fileID));	// ルートディレクトリ/data/userID/fileID.txtとなる
			File newFile = new File(path);
			newFile.createNewFile(); // ファイル作成

			// ======================================================================
			//	 	ajaxへ送信
			// ======================================================================
			String rtn = String.format("{\"newFileID\" : \"%d\",\"filename\" : \"%s\"}",fileID,fileName);
			out.println(rtn);

			out.close();
		}catch(IOException e){
			log("IOException:" + e.getMessage());
		}catch(SQLException e){
			log("SQLException:" + e.getMessage());
		}catch(Exception e){
			log("Exception:" + e.getMessage());
		}
	}
}
