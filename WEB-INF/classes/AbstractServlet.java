import java.io.PrintWriter;
import java.io.File;
import java.io.FileReader;
import java.io.BufferedReader;
import java.io.FileWriter;
import java.io.BufferedWriter;
import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.text.SimpleDateFormat;
import javax.servlet.ServletContext;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 *	<p>共通処理、データベース処理、ファイル処理を行うサーブレットの基底クラス
 *
 * <p>データベース問い合わせの流れ<br>
 * <pre>
 * <code>
 * // データベースへの接続
 * String url = "jdbc:mysql://network_adress/database_name";
 * String user = "username";
 * String password = "pass";
 * connectDatabase(url,user,password);
 *
 * // データベースへの問い合わせ
 * int id = Integer.parseInt(request.getParameter("id"));
 *	long savedMillis = Long.parseLong(request.getParameter("saved"));
 * executeSql("select * from table_name where id = ? and save = ?")
 * 			.setInt(id).setTimeMillis(savedMillis) // ?への値は前から順にセットされる
 * 			.query(); // 実行	データの取得ではなく更新ならupdate()を使う
 *
 * // データベースのデータの取得
 * int id;
 * long savedMillis;
 * String saved;
 * if (next()) {
 *		id = getInt("id");
 *		savedMillis = getTimeMillis("saved"); // ミリ秒で取得される
 *		saved = getDateFormat("saved"); // "yyyy-MM-dd HH:mm:ss"のフォーマットで取得する
 * }
 * </code>
 * </pre>
 * <p>※この使い方は同時並行で使えないため注意(二度問い合わせする場合は、一度目の問い合わせの処理を完全に終えてから二度目の問い合わせを行うこと)
 */
abstract public class AbstractServlet extends HttpServlet  {
	private PrintWriter out = null;

	private PreparedStatement preparedStatement = null;
	private ResultSet resultSet = null;
	protected Connection connection = null; // FileListMakerでも利用するためprotected

	private int indexCounter = 0;

	/*
	 *	common operator
	 */
	/**
	 *	初期設定を行う<br>
	 *	文字コード:UTF-8<br>
	 *	返送データのtype: json<br>
	 *	PrintWriterの取得<br>
	 *	@param request doGet()およびdoPost()に渡されたHttpServletRequest
	 *	@param response doGet()およびdoPost()に渡されたHttpServletResponse
	 */
	protected void ready(HttpServletRequest request, HttpServletResponse response) {
		try {
			response.setContentType("application/json; charset=UTF-8");
			request.setCharacterEncoding("UTF-8"); // 受取のcharset
			out = response.getWriter();
		} catch (IOException e) {
			log(e.getMessage());
		}
	}

	/**
	 *	サーブレットインスタンス破棄時の処理を行う。明示的に呼ぶ必要はない<br>
	 *	PreparedStatementのclose<br>
	 *	Connectionのclose<br>
	 *	PrintWriterのclose<br>
	 */
	public void destroy() {
		try {
			if (preparedStatement != null) {
				preparedStatement.close();
			}
			if (connection != null) {
				connection.close();
			}
			if (out != null) {
				out.close();
			}
		} catch(SQLException e) {
			log(e.getMessage());
		}
	}

	/**
	 *	レスポンスのストリームに書き込む。書き込みは一度きり
	 *	@param output ストリームに書き込む文字列
	 */
	protected void out(String output) {
		out.println(output);
		out.close();
		out = null;
	}
	/**
	 *	レスポンスのストリームにフォーマットを用いて書き込む。書き込みは一度きり
	 *	@param format 書き込む文字列
	 *	@param args フォーマットで置き換える各種値
	 */
	protected void out(String format, Object... args) {
		out.printf(format, args);
		out.close();
		out = null;
	}

	/*
	 * DataBase
	 */
	/**
	 *	データベースに接続する
	 *	@param	url	データベースのurl("jdbc:mysql://network_adress/database_name")
	 *	@param	user	データベースのユーザー名
	 *	@param	password	データベースのパスワード
	 */
	protected void connectDatabase(String url, String user, String password) {
		try {
			// 指定したクラスのインスタンスを作成してJDBCドライバをロードする
			Class.forName("com.mysql.jdbc.Driver").newInstance();

			// Drivermanagerに接続(データベースへの接続)
			connection = DriverManager.getConnection(url,user,password);

		} catch (ClassNotFoundException e) {
			log(e.getMessage());
		} catch (SQLException e) {
			log(e.getMessage());
		} catch (Exception e) {
			log(e.getMessage());
		} 
	}

	/**
	 *	データベースの操作を始める
	 *	@param	sql	SQLへの問い合わせ文
	 *	@return 自らのインスタンス
	 */
	protected AbstractServlet executeSql(String sql) {
		try {
			if (preparedStatement != null) {
				preparedStatement.close();
			}
			indexCounter = 0;
			preparedStatement = connection.prepareStatement(sql);
		} catch (SQLException e) {
			log(e.getMessage());
		}
		return this;
	}

	/**
	 *	SQL文のクエスチョンマークにint値をセットする
	 *	@param x セットする整数
	 *	@return 自らのインスタンス
	 */
	protected AbstractServlet setInt(int x) {
		try {
			indexCounter++;
			preparedStatement.setInt(indexCounter,x);
		} catch (SQLException e) {
			log(e.getMessage());
		}
		return this;
	}

	/**
	 *	SQL文のクエスチョンマークに文字列をセットする
	 *	@param x セットする文字列
	 *	@return 自らのインスタンス
	 */
	protected AbstractServlet setString(String x) {
		try {
			indexCounter++;
			preparedStatement.setString(indexCounter,x);
		} catch (SQLException e) {
			log(e.getMessage());
		}
		return this;
	}

	/**
	 *	SQL文のクエスチョンマークに真偽値をセットする
	 *	@param x セットする真偽値
	 *	@return 自らのインスタンス
	 */
	protected AbstractServlet setBoolean(boolean x) {
		try {
			indexCounter++;
			preparedStatement.setBoolean(indexCounter,x);
		} catch (SQLException e) {
			log(e.getMessage());
		}
		return this;
	}

	/**
	 *	SQL文のクエスチョンマークに、ミリ秒を"yyyy-MM-dd HH:mm:ss"のフォーマットに変換してセットする
	 *	@param x	セットする、単位がミリ秒の時刻
	 *	@return 自らのインスタンス
	 */
	protected AbstractServlet setTimeMillis(long x) {
		try {
			String strDate = dateFormat(x);
			indexCounter++;
			preparedStatement.setString(indexCounter,strDate);
		} catch (SQLException e) {
			log(e.getMessage());
		}
		return this;
	}

	/**
	 *	SQL文のクエスチョンマークに、java.sql.Date値をセットする
	 *	時分秒は切り捨て
	 *	@param	x	java.sql.Date値
	 *	@return 自らのインスタンス
	 */
	protected AbstractServlet setDate(java.sql.Date x) {
		try {
			indexCounter++;
			preparedStatement.setDate(indexCounter,x);
		} catch (SQLException e) {
			log(e.getMessage());
		}
		return this;
	}

	/**
	 *	SQL文のクエスチョンマークに、double値をセットする
	 *	@param	x	セットするdouble値
	 *	@return 自らのインスタンス
	 */
	protected AbstractServlet setDouble(double x) {
		try {
			indexCounter++;
			preparedStatement.setDouble(indexCounter,x);
		} catch (SQLException e) {
			log(e.getMessage());
		}
		return this;
	}

	/**
	 *	SQL文のクエスチョンマークにfloat値をセットする
	 *	@param x セットするfloat値
	 *	@return 自らのインスタンス
	 */
	protected AbstractServlet setFloat(float x) {
		try {
			indexCounter++;
			preparedStatement.setFloat(indexCounter,x);
		} catch (SQLException e) {
			log(e.getMessage());
		}
		return this;
	}

	/**
	 *	SQL文のクエスチョンマークにlong値をセットする
	 *	@param x セットするlong値
	 *	@return 自らのインスタンス
	 */
	protected AbstractServlet setLong(long x) {
		try {
			indexCounter++;
			preparedStatement.setLong(indexCounter,x);
		} catch (SQLException e) {
			log(e.getMessage());
		}
		return this;
	}

	/**
	 *	SQL文の問い合わせを実行する
	 */
	protected void query() {
		try {
			resultSet =  preparedStatement.executeQuery();
		} catch (SQLException e) {
			log(e.getMessage());
		}
	}

	/**
	 *	SQL文の問い合わせ結果を一行次に進める
	 *	@return	次の行が存在し、正常にカーソルが進めばtrue
	 */
	protected boolean next() {
		try {
			return resultSet.next();
		} catch (SQLException e) {
			log(e.getMessage());
		}
		return false;
	}

	/**
	 * SQL文の指定した問い合わせ結果をint値で取り出す
	 * @param column 結果を取り出すカラム名
	 * @return 問い合わせ結果。正常に取り出せなければ最小の値
	 */
	protected int getInt(String column) {
		try {
			return resultSet.getInt(column);
		} catch (SQLException e) {
			log(e.getMessage());
		}
		return Integer.MIN_VALUE;
	}

	/**
	 * SQL文の指定した問い合わせ結果を文字列で取り出す
	 * @param column 結果を取り出すカラム名
	 * @return 問い合わせ結果。正常に取り出せなければnull
	 */
	protected String getString(String column) {
		try {
			return resultSet.getString(column);
		} catch (SQLException e) {
			log(e.getMessage());
		}
		return null;
	}

	/**
	 * SQL文の指定した問い合わせ結果をdouble値で取り出す
	 * @param column 結果を取り出すカラム名
	 * @return 問い合わせ結果。正常に取り出せなければNaN
	 */
	protected double getDouble(String column) {
		try {
			return resultSet.getDouble(column);
		} catch (SQLException e) {
			log(e.getMessage());
		}
		return Double.NaN;
	}

	/**
	 * SQL文の指定した問い合わせ結果をミリ秒で取り出す
	 * @param column 結果を取り出すカラム名
	 * @return 問い合わせ結果。正常に取り出せなければ０
	 */
	protected long getTimeMillis(String column) {
		try {
			long millis = resultSet.getTimestamp(column).getTime();
			return millis;
		} catch (SQLException e) {
			log(e.getMessage());
		}
		return 0L;
	}

	/**
	 * SQL文の指定した問い合わせ結果を"yyyy-MM-dd HH:mm:ss"の形式で取り出す
	 * @param column 結果を取り出すカラム名
	 * @return 問い合わせ結果
	 */
	protected String getDateFormat(String column) {
		long millis = getTimeMillis(column);
		String saved = dateFormat(millis);
		return saved;
	}

	/**
	 *	ミリ秒を"yyyy-MM-dd HH:mm:ss"のフォーマットに変換する
	 *	@param millis 変換するミリ秒の値
	 *	@return フォーマットされた文字列
	 */
	protected String dateFormat(long millis) {
		java.util.Date date = new java.util.Date(millis); // java.sql.Date()の場合、時分秒が切り捨てられてしまうので、java.util.Date()を使う必要がある
		String saved = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(date);
		return saved;
	}

	/**
	 *	データベースへの更新を実行する
	 *	@return	正常に処理が終了した行数
	 */
	protected int update() {
		int rows = 0;
		try {
			rows = preparedStatement.executeUpdate();
		} catch (SQLException e) {
			log(e.getMessage());
		}
		return rows;
	}

	/*
	 *	File
	 */
	/**
	 *	サーブレットのルートディレクトリ以上も含めた絶対パスを取得する
	 *	@param	path	サーブレットのルートディレクトリからのファイルパス
	 *	@return 絶対パス
	 */
	protected String contextPath(String path) {
		ServletContext context = getServletContext();
		return context.getRealPath(path);	// ルートディレクトリ/pathとなる
	}

	/**
	 *	サーバーのローカルファイルを文字列で読み込む
	 *	@param	path	サーブレットのルートディレクトリからのファイルパス
	 *	@return 読み込まれた文字列
	 */
	protected String readFile(String path) {
		StringBuffer sb = new StringBuffer();
		try {
			File file = new File(contextPath(path));
			BufferedReader br = new BufferedReader(new FileReader(file));
			String str;
			for(int i=0;(str = br.readLine()) != null ;i++) {
				sb.append(str);
				str = br.readLine();
			}
			br.close();
		} catch (IOException e) {
			log(e.getMessage());
		}
		return sb.toString();
	}

	/**
	 *	サーバーのローカルファイルに文字列で書き込む(上書き保存)
	 *	@param	path	サーブレットのルートディレクトリからのファイルパス
	 *	@param	str	書き込む内容
	 */
	protected void writeFile(String path, String str) {
		try {
			File file = new File(contextPath(path));
			BufferedWriter bw = new BufferedWriter(new FileWriter(file,false));
			bw.write(str);
			bw.close();
		} catch (IOException	e) {
			log(e.getMessage());
		}
	}

	/**
	 *	サーバーのローカルファイルを新しく作成する
	 *	@param	path	サーブレットのルートディレクトリからのファイルパス
	 */
	protected void createFile(String path) {
		try {
			File newFile = new File(contextPath(path));
			newFile.createNewFile(); // ファイル作成
		} catch (IOException e) {
			log(e.getMessage());
		}
	}

	/**
	 *	サーバーのローカルファイルを削除する
	 *	@param	path	サーブレットのルートディレクトリからのファイルパス
	 *	@return 削除に成功した場合にtrue
	 */
	protected boolean deleteFile(String path) {
		File delFile = new File(contextPath(path));
		return recDeleteFile(delFile);
	}

	// ディレクトリの内部も含めて、ファイル・ディレクトリを削除する
	private boolean recDeleteFile(File file) {
		// 削除処理が行われればtrueを返す。ただし、すべての処理において正しく削除処理が終了したことを保証するものではない。

		// ファイルまたはディレクトリが存在しない場合は何もしない
		if (file.exists() == false) {
			return false;
		}		
		// ファイルの場合は削除する
		if (file.isFile()) {
			return file.delete();
		}
		// ディレクトリの場合は、すべてのファイルを削除する
		if (file.isDirectory()) {
			File[] files = file.listFiles(); // 対象ディレクトリ内のファイル及びディレクトリの一覧を取得
			// ファイル及びディレクトリをすべて削除
			for (File f : files) {
				// 自身をコールし、再帰的に削除する
				recDeleteFile(f);
			}
			// 自ディレクトリを削除する
			return file.delete();
		}
		return false;
	}
}
