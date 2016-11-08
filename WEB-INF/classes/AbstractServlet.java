import java.io.PrintWriter;
import java.io.File;
import java.io.FileReader;
import java.io.BufferedReader;
import java.io.FileWriter;
import java.io.BufferedWriter;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.sql.SQLException;
import java.util.stream.Stream;
import java.util.stream.Collectors;
import java.util.Arrays;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.concurrent.CompletionException;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import database.Database;
import database.PreparedDatabase;

/**
 *	<p>共通処理、データベース処理、ファイル処理を行うサーブレットの基底クラス
 *
 * <p>データベース問い合わせの流れ<br>
 * <pre>
 * <code>
 *
 * // データベースへの問い合わせ
 * int id = Integer.parseInt(request.getParameter("id"));
 *	long savedMillis = Long.parseLong(request.getParameter("saved"));
 * Database.Entry entry = executeSql("select * from table_name where id = ? and save = ?")
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
	private static final String DATABASE_NAME = "tategaki_editor";
	private static final String URL = "jdbc:mysql://localhost/"+ DATABASE_NAME;
	private static final String USER = "sampleuser";
	private static final String PASSWORD = "digk473";

	private Database database = null;

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
	protected final void ready(HttpServletRequest request, HttpServletResponse response) {
		try {
			response.setContentType("application/json; charset=UTF-8");
			request.setCharacterEncoding("UTF-8"); // 受取のcharset
		} catch (IOException e) {
			log(e.getMessage());
		}
	}

	public void init() throws ServletException {
		try {
			database = new PreparedDatabase(URL, USER, PASSWORD);
		} catch (SQLException e) {
			log(e.getMessage());
		}
	}

	/**
	 *	サーブレットインスタンス破棄時の処理を行います。明示的に呼ぶ必要はありません<br>
	 */
	public void destroy() {
		try {
			database.close();
		} catch(SQLException e) {
			log(e.getMessage());
		}
	}

	/**
	 *	レスポンスのストリームに書き込みます。書き込みは一度きりです
	 *	@param output ストリームに書き込む文字列
     *	@throws UncheckedIOException 書き込みに失敗した場合
	 */
	protected final void out(HttpServletResponse response, String output) {
        // TODO: responseを引数に追加したため、使用箇所すべてを修正する
        try (PrintWriter out = response.getWriter()) {
            out.println(output);
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
	}
	/**
	 *	レスポンスのストリームにフォーマットを用いて書き込みます。
	 *	@param format 書き込む文字列
	 *	@param args フォーマットで置き換える各種値
     *	@throws UncheckedIOException 書き込みに失敗した場合
	 */
	protected final void out(HttpServletResponse response, String format, Object... args) {
        try (PrintWriter out = response.getWriter()) {
            out.printf(format, args);
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
	}
	/**
	 * ルートディレクトリのIDを取得する
	 * @param userId ユーザーID
	 * @return ユーザーID
	 * @throws CompletionException データベースエラーやデータベース上にデータが見つからない等により、結果を正常に取得できなかった場合
	 */
	protected final int rootId(int userId) {
        try {
            Database.Entry entry = executeSql("select * from file_table where user_id = ? and type = ? ").setInt(userId).setString("root").query();
            if (entry.next()) {
                return entry.getInt("id").orElse(-1);  // おそらく-1になることはない
            }
        } catch (SQLException e) {
            throw new CompletionException(e);
        }
		throw new IllegalArgumentException("database has no data for index :" + userId);
	}
	/**
	 * データベース上に指定されたテーブルが存在するかを確認します
	 * @param table 確認するテーブル名
	 * @return 指定されたテーブルが存在すればtrue、そうでなければfalse
     * @throws CompletionException データベースエラー等により結果を正常に取得できなかった場合
	 */
	protected final boolean existTable(String table) {
        try {
            return executeSql(String.format("show tables where Tables_in_%s like ?", DATABASE_NAME))
                .setString(table).query().next();
        } catch (SQLException e) {
            throw new CompletionException(e);
        }
	}

	/*
	 * DataBase
	 */
	/**
	 *	データベースの操作を始めます
	 *	@param	sql	SQLへの問い合わせ文
	 *	@return データベースクラスの各問い合わせを担当するクラスのインスタンス
     *	@throws SQLException データベースアクセスエラーの場合、SQL文が不正の場合
	 */
	protected final Database.Entry executeSql(String sql) throws SQLException {
        return database.entry(sql);
    }

	/*
	 *	File
	 */
	/**
	 *	サーブレットのルートディレクトリ以上も含めた絶対パスを取得します
	 *	@param	path	サーブレットのルートディレクトリからのファイルパス
	 *	@return 絶対パス
	 */
	protected final String contextPath(String path) {
		ServletContext context = getServletContext();
		return context.getRealPath(path);	// ルートディレクトリ/pathとなる
	}

	/**
	 *	サーバーのローカルファイルを文字列で読み込みます
	 *	@param	path	サーブレットのルートディレクトリからのファイルパス
	 *	@return 読み込まれた文字列
     *	@throws UncheckedIOException 読み込みに失敗した場合
	 */
	protected final String readFile(String path) {
		try (Stream<String> stream = Files.lines(Paths.get(contextPath(path)), StandardCharsets.UTF_8)) {
			return stream.collect(Collectors.joining());
		} catch (IOException e) {
            throw new UncheckedIOException(e);
		}
	}

	/**
	 *	サーバーのローカルファイルに文字列で書き込みます(上書き保存)
	 *	@param	path	サーブレットのルートディレクトリからのファイルパス
	 *	@param	str	書き込む内容
     *	@throws UncheckedIOException 書き込みに失敗した場合
	 */
	protected final void writeFile(String path, String... str) {
		log("strs is "+ Arrays.asList(str));
		try {
			Files.write(Paths.get(contextPath(path)), Arrays.asList(str), StandardOpenOption.CREATE);
		} catch (IOException e) {
            throw new UncheckedIOException(e);
		}
	}

	/**
	 *	サーバーのローカルファイルを新しく作成します
	 *	@param	path	サーブレットのルートディレクトリからのファイルパス
     *	@throws UncheckedIOException ファイル作成に失敗した場合
	 */
	protected final void createFile(String path) {
		try {
			Files.createFile(Paths.get(path));
		} catch (IOException e) {
            throw new UncheckedIOException(e);
		}
	}

	/**
	 *	サーバーのローカルファイルを削除します
	 *	@param	path	サーブレットのルートディレクトリからのファイルパス
	 *	@return 削除に成功した場合にtrue
	 */
	protected final boolean deleteFile(String path) {
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
