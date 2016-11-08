package database;

import java.sql.SQLException;
import java.util.Optional;
import java.util.OptionalInt;;
import java.util.OptionalDouble;
import java.util.OptionalLong;

/**
 * データベースを操作するクラスです
 * {@code 
 *      try (Database db = new PreparedDatabase(url, user, password)) {
 *          Database.Entry entry = db.entry(sql).setInt(i).setString(s).query();
 *          while (entry.next()) {
 *              System.out.println(entry.getString(column)).orElse("no data");
 *          }
 *      } catch (SQLException e) {
 *          e.printStackTrace();
 *      }
 * }
 */
public interface Database extends AutoCloseable {

	/**
	 *	データベースの操作を始めます
	 *	@param	sql	SQLへの問い合わせ文
	 *	@return 自らのインスタンス
     *	@throws SQLException SQL文が不正な場合
	 */
	Entry entry(String sql) throws SQLException;

	/**
	 * 終了処理を行います
	 * @throws SQLException 終了処理の途中で失敗した場合
	 */
	void close() throws SQLException;

	/**
	 * データベースへの各問い合わせを担当するクラスのインタフェース
	 */
	interface Entry {

		/**
		 *	SQL文の問い合わせを実行します
		 *	@return 自身のインスタンス
         *	@throws SQLException 問い合わせに失敗した場合
		 */
		Entry query() throws SQLException;

		/**
		 *	データベースへの更新を実行します
		 *	@return	正常に処理が終了した行数
         *	@throws SQLException 更新に失敗した場合
		 */
		int update() throws SQLException;

		/**
		 *	SQL文の問い合わせ結果を一行次に進めます
		 *	@return	次の行が存在し、正常にカーソルが進めばtrue
         *	@throws SQLException データベースエラー、またはクローズされた結果呼び出された場合
		 */
		boolean next() throws SQLException;

		/**
		 * 終了処理を行います
         * @throws SQLException データベースアクセスエラーが発生した場合
		 */
		void close() throws SQLException;

		/**
		 *	SQL文のクエスチョンマークにint値をセットします
		 *	@param x セットする整数
		 *	@return 自らのインスタンス
         *	@throws SQLException setした回数がパラメータマーカーに対応しない場合、データベースアクセスエラーが発生した場合、またはクローズしたあとで実行された場合
		 */
		Entry setInt(int x) throws SQLException;
		/**
		 *	SQL文のクエスチョンマークに文字列をセットします
		 *	@param x セットする文字列
		 *	@return 自らのインスタンス
         *	@throws SQLException setした回数がパラメータマーカーに対応しない場合、データベースアクセスエラーが発生した場合、またはクローズしたあとで実行された場合
		 */
		Entry setString(String x) throws SQLException;
		/**
		 *	SQL文のクエスチョンマークに真偽値をセットします
		 *	@param x セットする真偽値
		 *	@return 自らのインスタンス
         *	@throws SQLException setした回数がパラメータマーカーに対応しない場合、データベースアクセスエラーが発生した場合、またはクローズしたあとで実行された場合
		 */
		Entry setBoolean(boolean x) throws SQLException;
		/**
		 *	SQL文のクエスチョンマークに、ミリ秒を"yyyy-MM-dd HH:mm:ss"のフォーマットに変換してセットします
		 *	@param x	セットする、単位がミリ秒の時刻
		 *	@return 自らのインスタンス
         *	@throws SQLException setした回数がパラメータマーカーに対応しない場合、データベースアクセスエラーが発生した場合、またはクローズしたあとで実行された場合
		 */
		Entry setTimeMillis(long x) throws SQLException;
		/**
		 *	SQL文のクエスチョンマークに、java.sql.Date値をセットします
		 *	時分秒は切り捨て
		 *	@param	x	java.sql.Date値
		 *	@return 自らのインスタンス
         *	@throws SQLException setした回数がパラメータマーカーに対応しない場合、データベースアクセスエラーが発生した場合、またはクローズしたあとで実行された場合
		 */
		Entry setDate(java.sql.Date x) throws SQLException;
		/**
		 *	SQL文のクエスチョンマークに、double値をセットします
		 *	@param	x	セットするdouble値
		 *	@return 自らのインスタンス
         *	@throws SQLException setした回数がパラメータマーカーに対応しない場合、データベースアクセスエラーが発生した場合、またはクローズしたあとで実行された場合
		 */
		Entry setDouble(double x) throws SQLException;
		/**
		 *	SQL文のクエスチョンマークにfloat値をセットします
		 *	@param x セットするfloat値
		 *	@return 自らのインスタンス
         *	@throws SQLException setした回数がパラメータマーカーに対応しない場合、データベースアクセスエラーが発生した場合、またはクローズしたあとで実行された場合
		 */
		Entry setFloat(float x) throws SQLException;
		/**
		 *	SQL文のクエスチョンマークにlong値をセットします
		 *	@param x セットするlong値
		 *	@return 自らのインスタンス
         *	@throws SQLException setした回数がパラメータマーカーに対応しない場合、データベースアクセスエラーが発生した場合、またはクローズしたあとで実行された場合
		 */
		Entry setLong(long x) throws SQLException;

		/**
		 * SQL文の指定した問い合わせ結果をint値で取り出します
		 * @param column 結果を取り出すカラム名
		 * @return 問い合わせ結果。正常に取り出せなければ空のOptionalInt
		 */
		OptionalInt getInt(String column);
		/**
		 * SQL文の指定した問い合わせ結果を文字列で取り出します
		 * @param column 結果を取り出すカラム名
		 * @return 問い合わせ結果。正常に取り出せなければ空のOptional
		 */
		Optional<String> getString(String column);
		/**
		 * SQL文の指定した問い合わせ結果をdouble値で取り出します
		 * @param column 結果を取り出すカラム名
		 * @return 問い合わせ結果。正常に取り出せなければ空のOptionalDouble
		 */
		OptionalDouble getDouble(String column);
		/**
		 * SQL文の指定した問い合わせ結果をミリ秒で取り出します
		 * @param column 結果を取り出すカラム名
		 * @return 問い合わせ結果。正常に取り出せなければ空のOptionalLong
		 */
		OptionalLong getTimeMillis(String column);
		/**
		 * SQL文の指定した問い合わせ結果を"yyyy-MM-dd HH:mm:ss"の形式で取り出します
		 * @param column 結果を取り出すカラム名
		 * @return 問い合わせ結果
		 */
		Optional<String> getDateFormat(String column);
	}
}
