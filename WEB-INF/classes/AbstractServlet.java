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
import java.util.Optional;
import java.util.OptionalInt;
import java.util.OptionalDouble;
import java.util.OptionalLong;
import java.util.List;
import java.util.ArrayList;

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
 * connectDatabase();
 *
 * // データベースへの問い合わせ
 * int id = Integer.parseInt(request.getParameter("id"));
 *	long savedMillis = Long.parseLong(request.getParameter("saved"));
 * Entry entry = executeSql("select * from table_name where id = ? and save = ?")
 * 			.setInt(id).setTimeMillis(savedMillis) // ?への値は前から順にセットされる
 * 			.query(); // 実行	データの取得ではなく更新ならupdate()を使う
 *
 * // データベースのデータの取得
 * int id;
 * long savedMillis;
 * String saved;
 * if (entry.next()) {
 *		id = entry.getInt("id");
 *		savedMillis = entry.getTimeMillis("saved"); // ミリ秒で取得される
 *		saved = entry.getDateFormat("saved"); // "yyyy-MM-dd HH:mm:ss"のフォーマットで取得する
 * }
 * </code>
 * </pre>
 */
abstract public class AbstractServlet extends HttpServlet  {
	private PrintWriter out = null;

	private static final String DATABASE_NAME = "tategaki_editor";
	private static final String URL = "jdbc:mysql://localhost/"+ DATABASE_NAME;
	private static final String USER = "serveruser";
	private static final String PASSWORD = "digk473";

	private Connection connection = null;
	private List<Entry> entries = new ArrayList<Entry>();

	/*
	 *	common operator
	 */
	/**
	 *	初期設定を行います<br>
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
	 *	サーブレットインスタンス破棄時の処理を行います。明示的に呼ぶ必要はありません<br>
	 *	PreparedStatementのclose<br>
	 *	Connectionのclose<br>
	 *	PrintWriterのclose<br>
	 */
	public void destroy() {
		try {
			entryClose();
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
	 *	レスポンスのストリームに書き込みます。書き込みは一度きりです
	 *	@param output ストリームに書き込む文字列
	 */
	protected void out(String output) {
		out.println(output);
		out.close();
		out = null;
	}
	/**
	 *	レスポンスのストリームにフォーマットを用いて書き込みます。書き込みは一度きりです
	 *	@param format 書き込む文字列
	 *	@param args フォーマットで置き換える各種値
	 */
	protected void out(String format, Object... args) {
		out.printf(format, args);
		out.close();
		out = null;
	}
	/**
	 * ルートディレクトリのIDを取得する
	 * @param userId ユーザーID
	 * @return ユーザーID
	 * @throws SQLException ユーザーIDに対応するルートディレクトリのレコードがデータベース上に見つからなかった場合
	 */
	protected int rootId(int userId) throws SQLException {
		Entry entry = executeSql("select * from file_table where user_id = ? and type = ? ").setInt(userId).setString("root").query();
		if (entry.next()) {
			return entry.getInt("id").orElseThrow(() -> new SQLException("not found database data"));
		}
		throw new SQLException("database has no data");	
	}
	/**
	 * データベース上に指定されたテーブルが存在するかを確認します
	 */
	protected final boolean existTable(String table) throws SQLException {
		return executeSql(String.format("show tables where Tables_in_%s like ?", DATABASE_NAME))
			.setString(table).query().next();
	}

	/*
	 * DataBase
	 */
	/**
	 *	データベースに接続します
	 *	@param	url	データベースのurl("jdbc:mysql://network_adress/database_name")
	 *	@param	user	データベースのユーザー名
	 *	@param	password	データベースのパスワード
	 */
	protected void connectDatabase() {
		try {
			// 指定したクラスのインスタンスを作成してJDBCドライバをロードする
			Class.forName("com.mysql.jdbc.Driver").newInstance();

			// Drivermanagerに接続(データベースへの接続)
			connection = DriverManager.getConnection(URL,USER,PASSWORD);

		} catch (ClassNotFoundException e) {
			log(e.getMessage());
		} catch (SQLException e) {
			log(e.getMessage());
		} catch (Exception e) {
			log(e.getMessage());
		} 
	}

	/**
	 *	データベースの操作を始めます
	 *	@param	sql	SQLへの問い合わせ文
	 *	@return 自らのインスタンス
	 */
	protected Entry executeSql(String sql) {
		Entry entry = null;
		try {
			entry = new Entry(sql);
		} catch (SQLException e) {
			log(e.getMessage());
		}
		entries.add(entry);
		return entry;
	}
	/**
	 *	ミリ秒を"yyyy-MM-dd HH:mm:ss"のフォーマットに変換します
	 *	@param millis 変換するミリ秒の値
	 *	@return フォーマットされた文字列
	 */
	protected static String dateFormat(long millis) {
		java.util.Date date = new java.util.Date(millis); // java.sql.Date()の場合、時分秒が切り捨てられてしまうので、java.util.Date()を使う必要がある
		String saved = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(date);
		return saved;
	}

	/*
	 *	File
	 */
	/**
	 *	サーブレットのルートディレクトリ以上も含めた絶対パスを取得します
	 *	@param	path	サーブレットのルートディレクトリからのファイルパス
	 *	@return 絶対パス
	 */
	protected String contextPath(String path) {
		ServletContext context = getServletContext();
		return context.getRealPath(path);	// ルートディレクトリ/pathとなる
	}

	/**
	 *	サーバーのローカルファイルを文字列で読み込みます
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
	 *	サーバーのローカルファイルに文字列で書き込みます(上書き保存)
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
	 *	サーバーのローカルファイルを新しく作成します
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
	 *	サーバーのローカルファイルを削除します
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

	/**
	 * すべてのエントリー内部に保持されているPreparedStatementをcloseします
	 * @return 自身のインスタンス
	 * @throws SQLException PreparedStatementのcloseに失敗した場合
	 */
	protected AbstractServlet entryClose() throws SQLException {
		for (Entry entry : entries)
			entry.close();
		entries.clear();
		return this;
	}

	public class Entry {
		private final PreparedStatement preparedStatement;
		private int indexCounter = 0;
		private ResultSet resultSet = null;

		private Entry(String sql) throws SQLException {
			try {
				indexCounter = 0;
				preparedStatement = connection.prepareStatement(sql);
			} catch (SQLException e) {
				throw new SQLException("fail new Entry");
			}
		}
		/**
		 *	SQL文の問い合わせを実行します
		 *	@return 自身のインスタンス
		 */
		protected Entry query() {
			try {
				resultSet =  preparedStatement.executeQuery();
			} catch (SQLException e) {
				log(e.getMessage());
			}
			return this;
		}
		/**
		 *	データベースへの更新を実行します
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

		/**
		 *	SQL文の問い合わせ結果を一行次に進めます
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
		protected void close() throws SQLException {
			preparedStatement.close();
		}

		/**
		 *	SQL文のクエスチョンマークにint値をセットします
		 *	@param x セットする整数
		 *	@return 自らのインスタンス
		 */
		protected Entry setInt(int x) {
			try {
				indexCounter++;
				preparedStatement.setInt(indexCounter,x);
			} catch (SQLException e) {
				log(e.getMessage());
			}
			return this;
		}

		/**
		 *	SQL文のクエスチョンマークに文字列をセットします
		 *	@param x セットする文字列
		 *	@return 自らのインスタンス
		 */
		protected Entry setString(String x) {
			try {
				indexCounter++;
				preparedStatement.setString(indexCounter,x);
			} catch (SQLException e) {
				log(e.getMessage());
			}
			return this;
		}

		/**
		 *	SQL文のクエスチョンマークに真偽値をセットします
		 *	@param x セットする真偽値
		 *	@return 自らのインスタンス
		 */
		protected Entry setBoolean(boolean x) {
			try {
				indexCounter++;
				preparedStatement.setBoolean(indexCounter,x);
			} catch (SQLException e) {
				log(e.getMessage());
			}
			return this;
		}

		/**
		 *	SQL文のクエスチョンマークに、ミリ秒を"yyyy-MM-dd HH:mm:ss"のフォーマットに変換してセットします
		 *	@param x	セットする、単位がミリ秒の時刻
		 *	@return 自らのインスタンス
		 */
		protected Entry setTimeMillis(long x) {
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
		 *	SQL文のクエスチョンマークに、java.sql.Date値をセットします
		 *	時分秒は切り捨て
		 *	@param	x	java.sql.Date値
		 *	@return 自らのインスタンス
		 */
		protected Entry setDate(java.sql.Date x) {
			try {
				indexCounter++;
				preparedStatement.setDate(indexCounter,x);
			} catch (SQLException e) {
				log(e.getMessage());
			}
			return this;
		}

		/**
		 *	SQL文のクエスチョンマークに、double値をセットします
		 *	@param	x	セットするdouble値
		 *	@return 自らのインスタンス
		 */
		protected Entry setDouble(double x) {
			try {
				indexCounter++;
				preparedStatement.setDouble(indexCounter,x);
			} catch (SQLException e) {
				log(e.getMessage());
			}
			return this;
		}

		/**
		 *	SQL文のクエスチョンマークにfloat値をセットします
		 *	@param x セットするfloat値
		 *	@return 自らのインスタンス
		 */
		protected Entry setFloat(float x) {
			try {
				indexCounter++;
				preparedStatement.setFloat(indexCounter,x);
			} catch (SQLException e) {
				log(e.getMessage());
			}
			return this;
		}

		/**
		 *	SQL文のクエスチョンマークにlong値をセットします
		 *	@param x セットするlong値
		 *	@return 自らのインスタンス
		 */
		protected Entry setLong(long x) {
			try {
				indexCounter++;
				preparedStatement.setLong(indexCounter,x);
			} catch (SQLException e) {
				log(e.getMessage());
			}
			return this;
		}

		/**
		 * SQL文の指定した問い合わせ結果をint値で取り出します
		 * @param column 結果を取り出すカラム名
		 * @return 問い合わせ結果。正常に取り出せなければ空のOptionalInt
		 */
		protected OptionalInt getInt(String column) {
			try {
				return OptionalInt.of(resultSet.getInt(column));
			} catch (SQLException e) {
				log(e.getMessage());
			}
			return OptionalInt.empty();
		}

		/**
		 * SQL文の指定した問い合わせ結果を文字列で取り出します
		 * @param column 結果を取り出すカラム名
		 * @return 問い合わせ結果。正常に取り出せなければ空のOptional
		 */
		protected Optional<String> getString(String column) {
			try {
				return Optional.of(resultSet.getString(column));
			} catch (SQLException e) {
				log(e.getMessage());
			}
			return Optional.empty();
		}

		/**
		 * SQL文の指定した問い合わせ結果をdouble値で取り出します
		 * @param column 結果を取り出すカラム名
		 * @return 問い合わせ結果。正常に取り出せなければ空のOptionalDouble
		 */
		protected OptionalDouble getDouble(String column) {
			try {
				return OptionalDouble.of(resultSet.getDouble(column));
			} catch (SQLException e) {
				log(e.getMessage());
			}
			return OptionalDouble.empty();
		}

		/**
		 * SQL文の指定した問い合わせ結果をミリ秒で取り出します
		 * @param column 結果を取り出すカラム名
		 * @return 問い合わせ結果。正常に取り出せなければ空のOptionalLong
		 */
		protected OptionalLong getTimeMillis(String column) {
			try {
				long millis = resultSet.getTimestamp(column).getTime();
				return OptionalLong.of(millis);
			} catch (SQLException e) {
				log(e.getMessage());
			}
			return OptionalLong.empty();
		}

		/**
		 * SQL文の指定した問い合わせ結果を"yyyy-MM-dd HH:mm:ss"の形式で取り出します
		 * @param column 結果を取り出すカラム名
		 * @return 問い合わせ結果
		 */
		protected String getDateFormat(String column) {
			long millis = getTimeMillis(column).orElse(0);
			String saved = dateFormat(millis);
			return saved;
		}
	}
}
