package servlet;

import java.util.StringJoiner;
import java.io.IOException;
import java.sql.ResultSet;
import java.sql.SQLException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.ServletException;

import sql.FileDBUpdater;
import sql.SQLDatabase;
import sql.FileTable;
import sql.SQLs;

/**
 * <p>
 * GET: ファイルツリーを表すJSON文字列を送り返します。
 * <pre>
 * request なし
 * </pre>
 * <pre>
 * response例 {
 * 	"directoryname": "root",
 * 	"1":"sample",
 * 	"8":"file",
 * 	"6": {
 * 		"directoryname": "dirname",
 * 		"4":"indirfile",
 * 		"9":"file",
 * 		"12": {
 * 			"directoryname": "seconddir",
 * 			"17": "file"
 * 		}
 * 	}
 * }
 * </pre>
 *
 * <p>
 * POST: 親ディレクトリを変更、あるいはディレクトリを新規作成します。
 * <pre>
 * request {
 *  file_id,  // option 指定されないか０以下であればディレクトリを新規作成
 *  new_parent_id,  // option 指定なしか０以下ならrootが指定されたものとする
 *  name,  // option ディレクトリ新規作成でのみ必要
 *  saved  // option ディレクトリ新規作成でのみ必要
 * }
 * </pre>
 */
public class FileListServlet extends AbstractServlet {
    private static final long serialVersionUID = 1L;

    // post param
    private static final String PARAM_FILE_ID = "file_id";  // option なければディレクトリを新規作成
    private static final String PARAM_NEW_PARENT_ID = "new_parent_id";  // option 指定なしか負の数ならroot直下
    // post and new dir param
    private static final String PARAM_NEW_DIR_NAME = "name";
    private static final String PARAM_SAVED = "saved";

    /**
     * ファイルツリーを表すJSON文字列を送り返します。
     */
    @Override
    protected String onGet(long userID, HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException, SQLException {
        SQLDatabase db = getDatabase();
        String whereClause = FileTable.USER_ID + "=? and " + FileTable.TYPE + "=?";
        ResultSet rs = db.selectAllColumns(FileTable.class, whereClause, userID, FileTable.FileType.ROOT.toString());
        if (!rs.next()) {
            throw new IllegalStateException();
        }
        long rootID = rs.getLong(FileTable.ID.toString());
        return createDirJson(userID, rootID);
    }

    /**
     * ディレクトリツリーを表すJSON文字列を作成します
     * <pre>
     * <code>
     *  // 戻り値例
     * {
     * 	"directoryname": "root",
     * 	"1":"sample",
     * 	"8":"file",
     * 	"6": {
     * 		"directoryname": "dirname",
     * 		"4":"indirfile",
     * 		"9":"file",
     * 		"12": {
     * 			"directoryname": "seconddir",
     * 			"17": "file"
     * 		}
     * 	}
     * }
     * </code>
     * </pre>
     */
    private String createDirJson(long userID, long parentID) throws SQLException {
        SQLDatabase db = getDatabase();
        String whereClause = String.join(" ",
                FileTable.USER_ID.toString(), "=? and"
                + " (", FileTable.PARENT_DIR.toString(), "=? or", FileTable.ID.toString(), "=?)");
        // parentID + parentID直下
        ResultSet rs = db.selectAllColumns(FileTable.class, whereClause, userID, parentID, parentID);

        StringJoiner sj = new StringJoiner(",", "{", "}");
        while (rs.next()) {
            long id = rs.getLong(FileTable.ID.toString());
            if (id == parentID) {
                sj.add(String.format("\"directoryname\":\"%s\"", rs.getString(FileTable.FILE_NAME.toString())));
                continue;
            }

            long childID = id;
            String file = FileTable.FileType.FILE.toString();
            String dir = FileTable.FileType.DIRECTORY.toString();
            String fileType = rs.getString(FileTable.TYPE.toString());
            if (fileType.equals(file)) {
                sj.add(String.format("\"%d\":\"%s\"", childID, rs.getString(FileTable.FILE_NAME.toString())));
            }
            if (fileType.equals(dir)) {
                String childDirJson = createDirJson(userID, childID);
                sj.add(String.format("\"%d\":%s", childID, childDirJson));
            }
        }
        return sj.toString();
    }

    /**
     * 親ディレクトリを変更します。
     * fileIDがないか０以下であれば、ディレクトリを新規作成します。この際、new_parent_idが指定されないか０以下であればroot直下に作成されます。
     */
    @Override
    protected String onPost(long userID, HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException, SQLException {
        String paramFileID = request.getParameter(PARAM_FILE_ID);
        long fileID = paramFileID == null ? -1L : Long.parseLong(paramFileID);
        String paramParentDirID = request.getParameter(PARAM_NEW_PARENT_ID);
        long parentDirID = paramParentDirID == null ? -1L : Long.parseLong(paramParentDirID);

        if (fileID > 0) {
            return changeParent(userID, fileID, parentDirID);
        } else {
            String directoryName = request.getParameter(PARAM_NEW_DIR_NAME);
            long savedMillis = Long.parseLong(request.getParameter(PARAM_SAVED));
            String saved = SQLs.formatString(savedMillis, AbstractServlet.DATE_FORMAT);
            return createDirectory(userID, parentDirID, directoryName, saved);
        }
    }

    private String changeParent(long userID, long fileID, long parentDirID) throws SQLException {
        FileDBUpdater fileDB = getFileDBUpdater(userID);
        boolean result = fileDB.changeDir(fileID, parentDirID);

        return String.format("{\"result\":\"%b\"}", result);
    }

    private String createDirectory(long userID, long parentDirID, String directoryName, String saved) throws SQLException {
        FileDBUpdater fileDB = getFileDBUpdater(userID);
        long newID = fileDB.create(directoryName, parentDirID, saved, FileTable.FileType.DIRECTORY);
        boolean result = newID > 0;

        return String.format("{\"newDirectoryID\":\"%d\",\"directoryname\":\"%s\",\"result\":\"%b\"}", newID, directoryName, result);
    }
}
