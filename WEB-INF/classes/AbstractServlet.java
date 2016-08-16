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
 * <p>データベース問い合わせの流れ<br />
 * ブロックごとに上から、
 * データベースへの接続<br />
 * データベースへの問い合わせ<br />
 * データベースのデータの取得<br />
 * <pre>
 * <code>
 * String url = "jdbc:mysql://network_adress/database_name";
 * String user = "username";
 * String password = "pass";
 * connectDatabase(url,user,password);
 *
 * int id = Integer.parseInt(request.getParameter("id"));
 *	long savedMillis = Long.parseLong(request.getParameter("saved"));
 * executeSql("select * from table_name where id = ? and save = ?")
 * 			.setInt(id).setTimeMillis(savedMillis) // ?への値は前から順にセットされる
 * 			.query(); // 実行	データの取得ではなく更新ならupdate()を使う
 *
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
	 *	初期設定を行う
	 *	文字コード:UTF-8
	 *	返送データのtype: json
	 *	PrintWriterの取得
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
	 *	サーブレットインスタンス破棄時の処理
	 *	PreparedStatementのclose
	 *	Connectionのclose
	 *	PrintWriterのclose
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
	 */
	protected void out(String output) {
		out.println(output);
		out.close();
		out = null;
	}
	/**
	 *	レスポンスのストリームに書き込む。書き込みは一度きり。フォーマットを利用
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

	/*
	 * データベース問い合わせの流れ
	 * connectDatabase(url,user,password);
	 * executeSql("select * from table where id = ? and save = ?")
	 * 	.setInt(5).setTimeMillis(savedMillis) // ?への値は前から順にセットされる
	 * 	.query();
	 * int id;
	 * long savedMillis;
	 * String saved;
	 * if (next()) {
	 *		id = getInt("id");
	 *		savedMillis = getTimeMillis("saved");
	 *		saved = getDateFormat("saved");
	 * }
	 */
	/**
	 *	データベースの操作を始める
	 *	@param	sql	SQL文
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
	 *	SQL文の?にint値をセットする
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

	protected AbstractServlet setString(String x) {
		try {
			indexCounter++;
			preparedStatement.setString(indexCounter,x);
		} catch (SQLException e) {
			log(e.getMessage());
		}
		return this;
	}

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
	 *	SQL文の?に、ミリ秒を"yyyy-MM-dd HH:mm:ss"のフォーマットに変換してセットする
	 *	@param	単位がミリ秒の時刻
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
	 *	SQL文の?に、java.sql.Date値をセットする
	 *	時分秒は切り捨て
	 *	@param	x	java.sql.Date値
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

	protected AbstractServlet setDouble(double x) {
		try {
			indexCounter++;
			preparedStatement.setDouble(indexCounter,x);
		} catch (SQLException e) {
			log(e.getMessage());
		}
		return this;
	}

	protected AbstractServlet setFloat(float x) {
		try {
			indexCounter++;
			preparedStatement.setFloat(indexCounter,x);
		} catch (SQLException e) {
			log(e.getMessage());
		}
		return this;
	}

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

	protected int getInt(String column) {
		try {
			return resultSet.getInt(column);
		} catch (SQLException e) {
			log(e.getMessage());
		}
		return Integer.MIN_VALUE;
	}

	protected String getString(String column) {
		try {
			return resultSet.getString(column);
		} catch (SQLException e) {
			log(e.getMessage());
		}
		return null;
	}

	protected double getDouble(String column) {
		try {
			return resultSet.getDouble(column);
		} catch (SQLException e) {
			log(e.getMessage());
		}
		return Double.NaN;
	}

	protected long getTimeMillis(String column) {
		try {
			long millis = resultSet.getTimestamp(column).getTime();
			return millis;
		} catch (SQLException e) {
			log(e.getMessage());
		}
		return 0L;
	}

	protected String getDateFormat(String column) {
		long millis = getTimeMillis(column);
		String saved = dateFormat(millis);
		return saved;
	}

	/**
	 *	ミリ秒を"yyyy-MM-dd HH:mm:ss"のフォーマットに変換する
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
	 */
	protected String contextPath(String path) {
		ServletContext context = getServletContext();
		return context.getRealPath(path);	// ルートディレクトリ/pathとなる
	}

	/**
	 *	サーバーのローカルファイルを文字列で読み込む
	 *	@param	path	サーブレットのルートディレクトリからのファイルパス
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
