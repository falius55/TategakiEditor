import java.io.*;
import javax.servlet.*;
import javax.servlet.http.*;
import java.sql.*;
import java.net.*;
import java.text.*;


// ajax通信用
// Post
// 受取
// fileId : ファイルid
// 返し
// fileNname
// literaArray : 読み込んだ各行文字列を格納した配列
public class ReadFile extends HttpServlet  {
	Connection conn = null;
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
			}
		}catch(SQLException e){
			log("SQLException:" + e.getMessage());
		}catch(NullPointerException e){
			log("NullPointerException:" + e.getMessage());
		}
	}

	// =======================================================================
	// 	main
	// =======================================================================
	public void doPost(HttpServletRequest request, HttpServletResponse response)
		throws IOException, ServletException {

		try{
			response.setContentType("application/json; charset=UTF-8");
			PrintWriter out = response.getWriter();

			// ======================================================
			//	 idから目的のファイル名、最終更新日を取得
			// ======================================================
			int fileID = Integer.parseInt(request.getParameter("file_id"));
			String sql = "select * from file_table where id = ?";
			PreparedStatement pstmt = conn.prepareStatement(sql);
			pstmt.setInt(1,fileID);
			ResultSet rs = pstmt.executeQuery();
			String fileName;
			String saved;

			if (rs.next()) {
				fileName = rs.getString("filename");
				saved = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(rs.getDate("saved"));
			}else{
				throw new SQLException();	
			}
			pstmt.close();

			StringBuffer sb = new StringBuffer();
			sb.append("{\"filename\":\"");
			sb.append(fileName);
			sb.append("\",");
			sb.append("\"saved\":\"");
			sb.append(saved);
			sb.append("\",");

			// =======================================================
			// 	userIDから、ルートディレクトリのidを取得
			// =======================================================
			int userID = Integer.parseInt(request.getParameter("user_id"));
			sql = "select * from edit_users where id = ?";
			pstmt = conn.prepareStatement(sql);
			pstmt.setInt(1,userID);
			rs = pstmt.executeQuery();
			int rootID;
			if (rs.next()) {
				rootID = rs.getInt("root_file_id");
			}else{
				log("database has no new data");
				throw new SQLException();	
			}
			pstmt.close();

			// ========================================================
			//	 ファイル読込
			// ========================================================
			// サーバー用ルートディレクトリ(/tategaki)までのパスを取得
			ServletContext context = this.getServletContext();
			String path = context.getRealPath(String.format("data/%d/%d_txt.txt",rootID,fileID));	// ルートディレクトリ/data/rootID/fileID.txtとなる
			BufferedReader br = new BufferedReader(new FileReader(new File(path)));

			// 複数行読み出し、配列で返している
			// {"literaArray": ["a","b","c"]}
			sb.append("\"literaArray\": [");
			String str = br.readLine();
			for(int i=0;str != null ;i++){
				if(i!=0)	sb.append(",");
				sb.append("\"");
				sb.append(str);
				sb.append("\"");
				str = br.readLine();
			}
			sb.append("]}");

			// ===================================================
			//	 ajaxへ送信
			// ====================================================
			out.println(sb.toString());


			br.close();
			out.close();
			log("fileName is " + fileName);
		}catch(IOException e){
			log("ReadFile's IOException:'" + e.getMessage());
		}catch(SQLException e){
			log("ReadFile's SQLException:'" + e.getMessage());
		}catch(NullPointerException e){
			log("ReadFile's NullPointerException:'" + e.getMessage());
		}catch(Exception e){
			log("ReadFile's Exception:'" + e.getMessage());
		}
	}
}
