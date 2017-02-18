import java.io.PrintWriter;
import java.io.IOException;
import java.sql.SQLException;
import java.util.concurrent.CompletionException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.text.SimpleDateFormat;

/**
 * ファイル情報を受けとり、ファイルID.jsonという名前のファイルにJSONの中身を書き出し、データベースにファイル名と更新日時を保存します
 * <pre>
 * request: {
 * 		user_id,
 * 		file_id,
 * 		filename,
 * 		json, // ファイル内容のJSON文字列
 * 		saved
 * 	}
 * response: {
 * 		result,
 * 		strDate // 最終更新日時の文字列
 * 	}
 *	</pre>
 */
public class WriteJsonFile extends AbstractServlet {
    private static final long serialVersionUID = 1L;

	public void doPost(HttpServletRequest request, HttpServletResponse response)
		throws ServletException {

        ready(request, response);

        // ファイル名、最終更新日の更新
        int fileId = Integer.parseInt(request.getParameter("file_id"));
        String filename = request.getParameter("filename");
        long savedMillis = Long.parseLong(request.getParameter("saved"));

        updateFilename(fileId, filename);
        updateSaved(fileId, savedMillis);

        // テキストファイルへの書き込み
        int userId = userId(request);
        int rootId = rootId(userId);
        String json = request.getParameter("json");
        writeFile(String.format("data/%d/%d.json",rootId,fileId), json);

        String rtnJson = String.format("{\"result\":\"save success\",\"strDate\":\"%s\"}",dateFormat(savedMillis));
        out(response, rtnJson);
    }

	private void updateFilename(int fileId, String newFilename) {
        try {
            executeSql("update file_table set filename = ? where id = ?").setString(newFilename).setInt(fileId).update();
        } catch (SQLException e) {
            throw new CompletionException(e);
        }
	}

	private void updateSaved(int fileId, long newSaved) {
        try {
            executeSql("update file_table set saved = ? where id = ?").setTimeMillis(newSaved).setInt(fileId).update();
        } catch (SQLException e) {
            throw new CompletionException(e);
        }
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
}
