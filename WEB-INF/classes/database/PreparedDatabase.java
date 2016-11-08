package database;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Objects;
import java.util.List;
import java.util.ArrayList;
import java.util.Optional;
import java.util.OptionalInt;;
import java.util.OptionalDouble;
import java.util.OptionalLong;
import java.text.SimpleDateFormat;

import database.Database;

public final class PreparedDatabase implements Database {

	private static final String DATABASE_NAME = "tategaki_editor";
	private static final String URL = "jdbc:mysql://localhost/"+ DATABASE_NAME;
	private static final String USER = "sampleuser";
	private static final String PASSWORD = "digk473";

	private Connection connection = null;
	private List<Entry> entries = new ArrayList<Entry>();

	public PreparedDatabase(String url, String user, String password) throws SQLException {
		try {
			// 指定したクラスのインスタンスを作成してJDBCドライバをロードする
			Class.forName("com.mysql.jdbc.Driver").newInstance();

			// Drivermanagerに接続(データベースへの接続)
			connection = DriverManager.getConnection(url,user,password);

		} catch (ClassNotFoundException e) {
			e.printStackTrace();
		} catch (SQLException e) {
			e.printStackTrace();
		} catch (Exception e) {
			e.printStackTrace();
		} 
		if (connection == null)
			throw new SQLException("database failed connect");
	}

	/**
     * {@inheritDoc}
	 */
	@Override
	public Entry entry(String sql) throws SQLException {
        Entry entry = new PreparedEntry(connection, sql);
        entries.add(entry);
		return entry;
	}
	/**
	 * 終了処理を行います
     * すでにクローズされた状態でcloseメソッドを呼び出してもエラーとはなりません
     * @return 自身のインスタンス
	 * @throws SQLException 終了処理に失敗した場合
	 */
	@Override
	public void close() throws SQLException {
		for (Entry entry : entries)
			entry.close();
		entries.clear();
	}
	/**
	 *	ミリ秒を"yyyy-MM-dd HH:mm:ss"のフォーマットに変換します
	 *	@param millis 変換するミリ秒の値
	 *	@return フォーマットされた文字列
	 */
	private static String dateFormat(long millis) {
		java.util.Date date = new java.util.Date(millis); // java.sql.Date()の場合、時分秒が切り捨てられてしまうので、java.util.Date()を使う必要がある
		String saved = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(date);
		return saved;
	}

	/**
	 * データベースへの各問い合わせを担当するクラス
	 */
	public static class PreparedEntry implements Entry {
		private final PreparedStatement preparedStatement;
		private int indexCounter = 0;
		private ResultSet resultSet = null;

		/**
		 * @param sql SQL文
		 * @throws SQLException 生成失敗
		 */
		private PreparedEntry(Connection connect, String sql) throws SQLException {
			try {
				indexCounter = 0;
				preparedStatement = connect.prepareStatement(sql);
			} catch (SQLException e) {
				throw new SQLException("fail new Entry", e);
			}
		}
		/**
		 *	{@inheritDoc}
		 */
		@Override
		public Entry query() throws SQLException {
            resultSet =  preparedStatement.executeQuery();
            return this;
		}
		/**
         * {@inheritDoc}
		 */
		@Override
		public int update() throws SQLException {
            return preparedStatement.executeUpdate();
		}

		/**
         * {@inheritDoc}
		 */
		@Override
		public boolean next() throws SQLException {
            return resultSet.next();
        }
        /**
         * 終了処理を行います
         * PreparedDatabaseのcloseによって自動的に実行されるため、必ずしもEntryインスタンスにおいて実行する必要はありません
         * すでにクローズされた状態でcloseメソッドを呼び出すと、操作は行われません
         * @throws SQLException データベースアクセスエラーが発生した場合
         */
		@Override
		public void close() throws SQLException {
			preparedStatement.close();
		}

		/**
         * {@inheritDoc}
		 */
		@Override
		public Entry setInt(int x) throws SQLException {
            indexCounter++;
            preparedStatement.setInt(indexCounter,x);
            return this;
		}

		/**
         * {@inheritDoc}
		 */
		@Override
		public Entry setString(String x) throws SQLException {
            indexCounter++;
            preparedStatement.setString(indexCounter,x);
            return this;
		}

		/**
         * {@inheritDoc}
		 */
		@Override
		public Entry setBoolean(boolean x) throws SQLException {
            indexCounter++;
            preparedStatement.setBoolean(indexCounter,x);
            return this;
		}

		/**
         * {@inheritDoc}
		 */
		@Override
		public Entry setTimeMillis(long x) throws SQLException {
            String strDate = dateFormat(x);
            indexCounter++;
            preparedStatement.setString(indexCounter,strDate);
            return this;
		}

		/**
         * {@inheritDoc}
		 */
		@Override
		public Entry setDate(java.sql.Date x) throws SQLException {
            indexCounter++;
            preparedStatement.setDate(indexCounter,x);
            return this;
		}

		/**
         * {@inheritDoc}
		 */
		@Override
		public Entry setDouble(double x) throws SQLException {
            indexCounter++;
            preparedStatement.setDouble(indexCounter,x);
            return this;
		}

		/**
         * {@inheritDoc}
		 */
		@Override
		public Entry setFloat(float x) throws SQLException {
            indexCounter++;
            preparedStatement.setFloat(indexCounter,x);
            return this;
		}

		/**
         * {@inheritDoc}
		 */
		@Override
		public Entry setLong(long x) throws SQLException {
            indexCounter++;
            preparedStatement.setLong(indexCounter,x);
            return this;
		}

		/**
		 * SQL文の指定した問い合わせ結果をint値で取り出します
		 * @param column 結果を取り出すカラム名
		 * @return 問い合わせ結果。正常に取り出せなければ空のOptionalInt
		 */
		@Override
		public OptionalInt getInt(String column) {
			try {
				return OptionalInt.of(resultSet.getInt(column));
			} catch (SQLException e) {
				e.printStackTrace();
			}
			return OptionalInt.empty();
		}

		/**
		 * SQL文の指定した問い合わせ結果を文字列で取り出します
		 * @param column 結果を取り出すカラム名
		 * @return 問い合わせ結果。正常に取り出せなければ空のOptional
		 */
		@Override
		public Optional<String> getString(String column) {
			try {
				return Optional.of(resultSet.getString(column));
			} catch (SQLException e) {
				e.printStackTrace();
			}
			return Optional.empty();
		}

		/**
		 * SQL文の指定した問い合わせ結果をdouble値で取り出します
		 * @param column 結果を取り出すカラム名
		 * @return 問い合わせ結果。正常に取り出せなければ空のOptionalDouble
		 */
		@Override
		public OptionalDouble getDouble(String column) {
			try {
				return OptionalDouble.of(resultSet.getDouble(column));
			} catch (SQLException e) {
				e.printStackTrace();
			}
			return OptionalDouble.empty();
		}

		/**
		 * SQL文の指定した問い合わせ結果をミリ秒で取り出します
		 * @param column 結果を取り出すカラム名
		 * @return 問い合わせ結果。正常に取り出せなければ空のOptionalLong
		 */
		@Override
		public OptionalLong getTimeMillis(String column) {
			try {
				long millis = resultSet.getTimestamp(column).getTime();
				return OptionalLong.of(millis);
			} catch (SQLException e) {
				e.printStackTrace();
			}
			return OptionalLong.empty();
		}

		/**
		 * SQL文の指定した問い合わせ結果を"yyyy-MM-dd HH:mm:ss"の形式で取り出します
		 * @param column 結果を取り出すカラム名
		 * @return 問い合わせ結果
		 */
		@Override
		public Optional<String> getDateFormat(String column) {
            try {
                long millis = getTimeMillis(column).orElseThrow(() -> new SQLException());
                String saved = dateFormat(millis);
                return Optional.of(saved);
            } catch (SQLException e) {
                return Optional.empty();
            }
		}
	}
}
