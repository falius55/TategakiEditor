import java.io.*;
import java.util.*;
import javax.servlet.*;
import javax.servlet.http.*;
import java.sql.*;
import java.net.*;
import java.text.*;

abstract public class AbstractServlet extends HttpServlet  {
	protected Connection connection = null; // FileListMakerでも利用するためprotected
	private PreparedStatement preparedStatement = null;
	private ResultSet resultSet = null;

	private int indexCounter = 0;

	/*
	 * DataBase
	 */
	protected void startSql(String url, String user, String password) {
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

	public void destroy() {
		try {
			if (preparedStatement != null) {
				preparedStatement.close();
			}
			if(connection != null) {
				connection.close();
			}
		} catch(SQLException e) {
			log(e.getMessage());
		}
	}

	// startSql(url,user,password);
	// Resultset rs = executeSql("select * from table where id = ? and save = ?").setInt(5).setTimeMillis(savedMillis).query();
	// int id;
	// long savedMillis;
	// String saved;
	// if (next()) {
	//		id = getInt("id");
	//		savedMillis = getTimeMillis("saved");
	//		saved = getDateFormat("saved");
	// }
	// stopSql();
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

	protected void query() {
		try {
			resultSet =  preparedStatement.executeQuery();
		} catch (SQLException e) {
			log(e.getMessage());
		}
	}

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

	protected String dateFormat(long millis) {
		java.util.Date date = new java.util.Date(millis);
		String saved = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(date);
		return saved;
	}

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
	protected String contextPath(String path) {
		ServletContext context = getServletContext();
		return context.getRealPath(path);	// ルートディレクトリ/pathとなる
	}

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

	protected void createFile(String path) {
		try {
			File newFile = new File(contextPath(path));
			newFile.createNewFile(); // ファイル作成
		} catch (IOException e) {
			log(e.getMessage());
		}
	}

	protected boolean deleteFile(String path) {
		File delFile = new File(contextPath(path));
		return recDeleteFile(delFile);
	}

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
