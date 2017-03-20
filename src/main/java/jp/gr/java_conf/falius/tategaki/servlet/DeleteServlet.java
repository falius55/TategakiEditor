package jp.gr.java_conf.falius.tategaki.servlet;

import java.sql.SQLException;
import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.ServletException;

import jp.gr.java_conf.falius.tategaki.datadir.UserDirectory;
import jp.gr.java_conf.falius.tategaki.sql.FileDBUpdater;

/**
 * <p>
 * GET: ファイルあるいはディレクトリを削除します。
 * <pre>
 * request {
 *  file_id,
 *  option  // trueであれば、内部のファイルごと削除します(file_idがディレクトリのIDである場合)。指定がなければfalse
 * }
 * </pre>
 *
 */
public class DeleteServlet extends AbstractServlet  {
    private static final long serialVersionUID = 1L;

    // post param
    private static final String PARAM_FILE_ID = "file_id";
    private static final String PARAM_OPTION = "option";

    /**
     * ファイルあるいはディレクトリを削除します。
     */
    @Override
    public String onPost(long userID, HttpServletRequest request, HttpServletResponse response)
        throws ServletException, SQLException, IOException {

        long fileID = Integer.parseInt(request.getParameter(PARAM_FILE_ID));
        String paramOption = request.getParameter(PARAM_OPTION);
        boolean option = paramOption == null ? false : Boolean.valueOf(paramOption);

        FileDBUpdater fileDB = getFileDBUpdater(userID);
        boolean result = fileDB.delete(fileID, option);

        if (result) {
            UserDirectory dir = getDataDirectoryManager().getUserDirectory(userID);
            result = result && dir.delete(fileID);
        }

        return String.format("{\"result\":\"%b\"}", result);
    }
}
