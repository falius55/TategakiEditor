package jp.gr.java_conf.falius.tategaki.servlet;

import java.io.IOException;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.StringJoiner;
import java.util.Map;
import java.util.EnumMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.ServletException;

import jp.gr.java_conf.falius.mysqlfacade.SQLDatabase;
import jp.gr.java_conf.falius.mysqlfacade.SQLs;

import jp.gr.java_conf.falius.tategaki.datadir.UserDirectory;
import jp.gr.java_conf.falius.tategaki.sql.FileDBUpdater;
import jp.gr.java_conf.falius.tategaki.sql.FileTable;

/**
 * <p>
 * 各データファイルにアクセスするためのサーブレットです。
 *
 * <p>
 * GET: 受け取ったファイルIDの内容を送り返します。
 * <pre>
 * request {
 *  file_id
 * }
 * </pre>
 *
 * <p>
 * POST: ファイルデータの情報を受けとり、サーバーに保存します。ファイルIDが自然数であればすでに存在するファイルを上書きし、ファイルIDがないか０以下であればファイルを新規作成して保存します。
 * <pre>
 * request {
 *  file_id,  // option
 *  filename,
 *  saved,
 *  json,
 *  parent_dir  // option 指定がなければrootになる
 * }
 * </pre>
 *
 */
public class FileDataServlet extends AbstractServlet {
    private static final long serialVersionUID = 1L;

    // common param
    private static final String PARAM_FILE_ID = "file_id";

    // post param
    private static final String PARAM_FILE_NAME = "filename";
    private static final String PARAM_SAVED = "saved";
    private static final String PARAM_FILE_DATA = "json";
    private static final String PARAM_PARENT_DIR = "parent_dir";  // 'save as' only

    /**
     * リクエストされたファイルの内容を返します。
     */
    @Override
    protected String onGet(long userID, HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException, SQLException {
        SQLDatabase db = getDatabase();
        String whereClause = FileTable.ID + "=? and " + FileTable.USER_ID + "=?";
        long fileID = Long.parseLong(request.getParameter(PARAM_FILE_ID));

        ResultSet rs = db.selectAllColumns(FileTable.class, whereClause, fileID, userID);
        if (!rs.next()) {
            throw new IllegalStateException();
        }

        String fileName =  rs.getString(FileTable.FILE_NAME.toString());
        String saved = SQLs.formatString(
                rs.getTimestamp(FileTable.SAVED.toString()), AbstractServlet.DATE_FORMAT);

        UserDirectory dir = getDataDirectoryManager().getUserDirectory(userID);
        String fileData = dir.read(fileID);

        return createGetResponse(userID, fileID, fileName, saved, fileData);
    }

    private String createGetResponse(long userID, long fileID, String fileName, String saved, String fileData) {
        StringJoiner sj = new StringJoiner(",", "{", "}");
        sj.add(String.format("\"filename\":\"%s\"", fileName));
        sj.add(String.format("\"fileId\":\"%d\"", fileID));
        sj.add(String.format("\"saved\":\"%s\"", saved));
        sj.add(String.format("\"userId\":\"%d\"", userID));
        sj.add(String.format("\"data\":%s", fileData));
        return sj.toString().replaceAll("\"","\\\""); // jsonファイル中の"を\"にエスケープする
    }


    /**
     * ファイルの内容を書き換えます。
     * fileIDが０以下であれば、名前をつけて保存になります。
     */
    protected String onPost(long userID, HttpServletRequest request, HttpServletResponse response)
        throws ServletException, IOException, SQLException {

        String paramFileID = request.getParameter(PARAM_FILE_ID);
        long fileID = paramFileID == null ? -1L : Integer.parseInt(paramFileID);
        String fileName = request.getParameter(PARAM_FILE_NAME);
        long savedMillis = Long.parseLong(request.getParameter(PARAM_SAVED));
        String saved = SQLs.formatString(savedMillis, AbstractServlet.DATE_FORMAT);
        String fileData = request.getParameter(PARAM_FILE_DATA);

        if (fileID > 0) {
            return update(userID, fileID, fileName, saved, fileData);
        } else {
            String parent = request.getParameter(PARAM_PARENT_DIR);
            return saveAs(userID, fileName, parent, saved, fileData);
        }
    }

    private String update(long userID, long fileID, String fileName, String saved, String fileData) throws SQLException, IOException {
        FileDBUpdater fileDB = getFileDBUpdater(userID);
        boolean result = fileDB.update(fileID, fileName, saved);
        if (!result) {
            return "{\"result\":\"false\"}";
        }

        UserDirectory dir = getDataDirectoryManager().getUserDirectory(userID);
        dir.write(fileID, fileData);
        return String.format("{\"result\":\"true\",\"saved\":\"%s\",\"fileID\":\"%d\"}", saved, fileID);
    }

    private String saveAs(long userID, String fileName, String paramParent, String saved, String fileData) throws SQLException, IOException {
        FileDBUpdater fileDB = getFileDBUpdater(userID);
        long parentDirID = paramParent == null ? -1L : Long.parseLong(paramParent);
        long newID = fileDB.create(fileName, parentDirID, saved, FileTable.FileType.FILE);
        if (newID <= 0) {
            return "{\"result\":\"false\"}";
        }

        UserDirectory dir = getDataDirectoryManager().getUserDirectory(userID);
        dir.write(newID, fileData);
        return String.format("{\"result\":\"true\",\"fileID\" : \"%d\",\"saved\":\"%s\"}", newID, saved);
    }
}
