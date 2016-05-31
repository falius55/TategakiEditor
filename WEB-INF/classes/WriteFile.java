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
// @param file_id,filename,json,saved
// @return resule,date
// file_id.txtという名前のファイルにjsonの中身を書き出し、データベースにファイル名と更新日時を保存します。
public class WriteFile extends HttpServlet  {
	BufferedWriter bw;
	// インスタンス変数
	Connection conn = null;
	Statement stmt;
	// ========================================================================
	// jsp起動時の処理
	// =======================================================================
	// データベースへの接続
	public void init() {
		String url = "jdbc:mysql://localhost/blog_app";
		String user = "sampleuser";
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
				stmt.close();
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

			int fileId = Integer.parseInt(request.getParameter("file_id"));
			// ==================================================================
			//	 	更新日時文字列の作成
			// ==================================================================
			long savedMillis = Long.parseLong(request.getParameter("saved"));
			java.util.Date d = new java.util.Date(savedMillis);
			//Calendar cal = new GregorianCalendar();
			//cal.setTimeInMillis(savedMillis);
			//StringBuffer sb = new StringBuffer();
			//sb.append(String.format("%1$tF %1$tT",d)); // 2011-11-08 11:05:20 の書式
			String strDate = String.format("%1$tF %1$tT",d); // 2011-11-08 11:05:20 の書式
			//sb.append(cal.get(Calendar.YEAR));
			//sb.append("-");
			//sb.append(String.format("%02d",(cal.get(Calendar.MONTH) + 1)));
			//sb.append("-");
			//sb.append(String.format("%02d",cal.get(Calendar.DATE)));
			//sb.append(" ");
			//sb.append(String.format("%02d",cal.get(Calendar.HOUR_OF_DAY)));
			//sb.append(":");
			//sb.append(cal.get(Calendar.MINUTE));
			//sb.append(":");
			//sb.append(cal.get(Calendar.SECOND));
			// ========================================================================
			// 	ファイル名、最終更新日の更新
			// ========================================================================
			// init()がjspInit()となっていたため、connがnullになってnullPointerExceptionが発生していた
			stmt = conn.createStatement();
			// ファイル名
			String fileName = request.getParameter("filename");
			//String sql = "update file_table set filename = \'" + fileName + "\' where id = " + fileId;
			String sql = String.format("update file_table set filename = \'%s\' where id = %d",fileName,fileId);
			stmt.executeUpdate(sql);
			// 更新日
			//sql = "update file_table set saved = \'" + sb.toString() + "\' where id = " + fileId;
			sql = String.format("update file_table set saved = \'%s\' where id = %d",strDate,fileId);
			stmt.executeUpdate(sql);

			// ==========================================================================
			// 	テキストファイルへの書き込み
			// ==========================================================================
			// サーバー用ルートディレクトリ(/tategaki)までのパスを取得
			ServletContext context = this.getServletContext();
			String path = context.getRealPath(fileId + ".txt");	// ルートディレクトリ/fileId.txtとなる
			bw = new BufferedWriter(new FileWriter(new File(path),false));

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
			//String rtn = "{\"result\":\"save success\",\"date\":\""+ sb.toString() + "\"}";
			String rtn = String.format("{\"result\":\"save success\",\"date\":\"%s\"}",strDate);
			// エラーの原因
			// ストリームを取得したなら、何かしらを返さなければならない
			// また、受け手がdatatypeをjsonにしているなら、jsonで返さなければならない
			out.println(rtn);


			bw.close();
			out.close();
			log("fileName is " + fileName);
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
	// 別クラスにして使うなら、JavaBeensにする必要あり
	public static <T> T parse(Class<T> dto, String json)  {
		ObjectMapper mapper = new ObjectMapper();
		try {
			//return Arrays.asList(mapper.readValue(json,dto)).toArray(new String[]);
			return (T)mapper.readValue(json,dto);
		} catch (IOException e) {
			return null;
		}
	}
}
