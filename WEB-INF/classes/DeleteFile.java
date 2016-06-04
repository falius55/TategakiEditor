import java.io.*;
import javax.servlet.*;
import javax.servlet.http.*;
import java.sql.*;
import java.net.*;

// ajax通信用
// Post
// 渡し
// file_id
// 戻り
// successRecord データベースで処理した行数
// resulet 削除処理が行われた場合にtrue
public class DeleteFile extends HttpServlet  {
	BufferedReader br;
	// インスタンス変数
	Connection conn = null;
	Statement stmt;
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
	// ConnectionとStatementをcloseしている
	public void destroy(){
		try{
			if(conn != null){
				conn.close();
				stmt.close();
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
			// 返す値が1行だけならtext/plain
			// 複数ならapplication/json
			// response.setContentType("text/plain; charset=UTF-8");
			response.setContentType("application/json; charset=UTF-8");
			PrintWriter out = response.getWriter();
			// ========================================================================
			// 	データベースから該当idのファイルレコードを削除
			// ========================================================================
			// init()がjspInit()となっていたため、connがnullになってnullPointerExceptionが発生していた
			String strFileID = request.getParameter("file_id");
			stmt = conn.createStatement();
			String sql = String.format("delete from file_table where id = %s",strFileID);
			int num = stmt.executeUpdate(sql);

			// ========================================================================
			// 	該当ファイルを削除
			// ========================================================================
			// サーバー用ルートディレクトリ(/tategaki)までのパスを取得
			ServletContext context = this.getServletContext();
			String userID = request.getParameter("user_id");
			String path = context.getRealPath(String.format("data/%s/%s.txt",userID,strFileID));	// ルートディレクトリ/data/userID/fileID.txtとなる
			File delFile = new File(path);
			boolean b = deleteFile(delFile);

			// ====================================================
			//	 ajaxへ送信
			// ====================================================
			out.printf("{\"successRecord\" : \"%d\",\"result\": \"%b\"}\n",num,b);


			br.close();
			out.close();
		}catch(IOException e){
			log("DeleteFile's IOException:'" + e.getMessage());
		}catch(NullPointerException e){
			log("DeleteFile's NullPointerException:'" + e.getMessage());
		}catch(Exception e){
			log("DeleteFile's Exception:'" + e.getMessage());
		}
	}
	private boolean deleteFile(File file) {
		// 削除処理が行われればtrueを返す。ただし、すべての処理において正しく削除処理が終了したことを保証するものではない。
		// ファイルまたはディレクトリが存在しない場合は何もしない
		if (file.exists() == false) {
			return false;
		}		
		if (file.isFile()) {
			// ファイルの場合は削除する
			 return file.delete();
		}else if (file.isDirectory()) {
			// ディレクトリの場合は、すべてのファイルを削除する
			File[] files = file.listFiles(); // 対象ディレクトリ内のファイル及びディレクトリの一覧を取得
			// ファイル及びディレクトリをすべて削除
			for (File f : files) {
				// 自身をコールし、再帰的に削除する
				deleteFile(f);
			}
			// 自ディレクトリを削除する
			return file.delete();
		}
		return false;
	}
}
