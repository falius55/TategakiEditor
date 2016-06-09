import java.io.*;
import javax.servlet.*;
import javax.servlet.http.*;
import java.sql.*;
import java.net.*;

/**
 * POST通信
 */
public class GetFileList extends HttpServlet  {
	// インスタンス変数
	Connection conn = null;
	Statement stmt;
	PreparedStatement pstmt;
	// ====================================================================
	// 	jsp起動時の処理
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
	// 	jsp破棄時の処理
	// =====================================================================
	public void destroy(){
		try{
			if(conn != null){
				conn.close();
				stmt.close();
				pstmt.close();
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
			stmt = conn.createStatement();
			// =======================================================
			// 	userIDから、ルートディレクトリのidを取得
			// =======================================================
			String sql = "select * from edit_users where id = ?";
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

			// ===================================================
			//	 ajaxへ送信
			// ====================================================
			String rtnJson = getJsonFileTree(userID,rootID);
			out.println(rtnJson);


			log("getFileList return is " + rtnJson);
			out.close();
		}catch(NullPointerException e){
			log("NullPointerException(main):"+ e.getMessage());
		}catch(IOException e){
			log("IOException(main):"+ e.getMessage());
		}catch(Exception e){
			log("Exception(main):"+ e.getMessage());
		}
	}
	private String getJsonFileTree(int userID,int parentID){
		StringBuffer sb = new StringBuffer();
		try{
			stmt = conn.createStatement();
			String sql = String.format("SELECT * FROM file_table WHERE user_id = %d and (parent_dir = %d or id = %d)",userID,parentID,parentID);
			ResultSet rs = stmt.executeQuery(sql);
			sb.append("{");
			for (int i=0;rs.next();i++) {
				if(i != 0) sb.append(",");
				int fileID = rs.getInt("id");
				sb.append("\"");
				if (fileID == parentID) {
					sb.append("directoryname\":\"");
					sb.append(rs.getString("filename"));
					sb.append("\"");
				}else{
					sb.append(fileID);
					sb.append("\":");
					if (rs.getString("type").equals("file")) {
						sb.append("\"");
						sb.append(rs.getString("filename"));
						sb.append("\"");
					}else{
						sb.append(getJsonFileTree(userID,fileID));
					}
				}
			}
			sb.append("}");
		}catch(SQLException e){
			log("SQLException(getJsonFileTree):"+ e.getMessage());
		}
		return sb.toString();
	}
}
