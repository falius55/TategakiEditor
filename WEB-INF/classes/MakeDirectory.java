import java.io.*;
import java.util.*;
import javax.servlet.*;
import javax.servlet.http.*;
import java.sql.*;
import java.net.*;
import java.text.*;

/**
 * ajax
 * POST通信
 */
public class MakeDirectory extends HttpServlet  {
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

			int userID = Integer.parseInt(request.getParameter("user_id"));
			// =======================================================
			// 	userIDから、ルートディレクトリのidを取得
			// =======================================================
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
			sql = "insert into file_table (filename,type,parent_dir,user_id,saved) values (?,?,?,?,?)";
			pstmt = conn.prepareStatement(sql);

			// ファイル名
			String directoryname = request.getParameter("directoryname");
			pstmt.setString(1,directoryname);
			pstmt.setString(2,"dir");
			pstmt.setInt(3,rootID);
			// ユーザー名
			pstmt.setInt(4,userID);
			// 最終更新日
			long savedMillis = Long.parseLong(request.getParameter("saved"));
			java.util.Date date = new java.util.Date(savedMillis); // java.sql.Dateは、時分秒を切り捨ててしまう
			String strDate = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(date);
			pstmt.setString(5,strDate);

			pstmt.executeUpdate();
			pstmt.close();
			// ====================================================================
			// 	新しいfileIDを取得
			// ====================================================================
			sql = "select * from file_table where saved = ? and user_id = ?";
			pstmt = conn.prepareStatement(sql);
			pstmt.setString(1,strDate);
			pstmt.setInt(2,userID);
			rs = pstmt.executeQuery();

			int directoryID;
			if (rs.next()) {
				directoryID = rs.getInt("id");
			}else{
				throw new SQLException();
			}
			pstmt.close();
			// ======================================================================
			//	 	ajaxへ送信
			// ======================================================================
			String rtn = String.format("{\"newDirectoryID\" : \"%d\",\"filename\" : \"%s\"}",directoryID,directoryname);
			out.println(rtn);

			log("MakeDirectory return is " + rtn);
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
