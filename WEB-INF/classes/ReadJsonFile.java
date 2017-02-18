import java.io.PrintWriter;
import java.io.IOException;
import java.sql.SQLException;
import java.util.StringJoiner;
import java.util.concurrent.CompletionException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import database.Database;

/**
 * ユーザーIDとファイルIDを受け取り、読み込んだファイルの内容を文字列でクライアントに送り返すサーブレット
 * <pre>
 * request: {
 * 		user_id,
 * 		file_id
 * 	}
 * response: {
 * 		filename,
 * 		fileId,
 * 		saved, // 最終更新日時
 * 		userId,
 * 		data // ファイル内容のjson文字列
 * 	}
 *	</pre>
 */
public class ReadJsonFile extends AbstractServlet  {
    private static final long serialVersionUID = 1L;

    public void doPost(HttpServletRequest request, HttpServletResponse response)
        throws ServletException {

        ready(request,response);

        int fileId = Integer.parseInt(request.getParameter("file_id"));
        String filename = filename(fileId);
        String saved = saved(fileId);

        StringJoiner sj = new StringJoiner(",", "{", "}");
        sj.add(String.format("\"filename\":\"%s\"", filename));
        sj.add(String.format("\"fileId\":\"%d\"", fileId));
        sj.add(String.format("\"saved\":\"%s\"", saved));

        int userId = userId(request);
        int rootId = rootId(userId);

        sj.add(String.format("\"userId\":\"%d\"", userId));

        //	ファイル読込
        sj.add(String.format("\"data\":%s", readFile(String.format("data/%d/%d.json", rootId, fileId))));

        String rtnJson = sj.toString().replaceAll("\"","\\\""); // jsonファイル中の"を\"にエスケープする
        out(response, rtnJson);

        log("fileName is " + filename);
        log(rtnJson);
    }

    private String filename(int fileId) {
        try {
            Database.Entry entry = executeSql("select * from file_table where id = ?").setInt(fileId).query();
            if (entry.next())
                return entry.getString("filename").orElse("not found");
        } catch (SQLException e) {
            throw new CompletionException(e);
        }

        throw new IllegalArgumentException("no database data");
    }

    private String saved(int fileId) {
        try {
            Database.Entry entry = executeSql("select * from file_table where id = ?").setInt(fileId).query();
            if (entry.next())
                return entry.getDateFormat("saved").orElse("0000-00-00 00:00:00");
        } catch (SQLException e) {
            throw new CompletionException(e);
        }
        throw new IllegalArgumentException("no database data");
    }
}
