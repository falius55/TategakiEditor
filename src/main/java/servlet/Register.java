package servlet;

import java.util.Map;
import java.util.EnumMap;
import java.io.IOException;
import java.sql.SQLException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.ServletException;
import javax.servlet.http.HttpSession;

import mysqlfacade.SQLDatabase;
import mysqlfacade.SQLs;
import sql.FileDBUpdater;
import sql.UserTable;

/**
 * ユーザー登録を行うためのサーブレットです。
 *
 * <p>
 * POST: ユーザー登録を試みて、成功するとログインページへ、失敗すると再度ユーザー登録ページヘリダイレクトします。
 * <pre>
 * request {
 *  username,
 *  password
 * }
 * </pre>
 */
public class Register extends AbstractServlet {
    private static final long serialVersionUID = 1L;

    // post param
    private static final String PARAM_USER_NAME = "username";
    private static final String PARAM_PASSWORD = "password";

    private static final String SESSION_REGISTERED = "registered";
    private static final String REDIRECT_LOGIN_PAGE = "/tategaki-editor/loginpage.jsp";
    private static final String REDIRECT_REGISTERE_PAGE = "/tategaki-editor/register.jsp";

    @Override
	public String onPost(long userID, HttpServletRequest request, HttpServletResponse response)
		throws IOException, ServletException, SQLException {

		String user = request.getParameter(PARAM_USER_NAME);
		String pass = request.getParameter(PARAM_PASSWORD);

        boolean result = register(user, pass);

		HttpSession session = request.getSession(true);

		if (result) {
			session.setAttribute(SESSION_REGISTERED, Boolean.TRUE);

			response.sendRedirect(REDIRECT_LOGIN_PAGE);
		} else {
			session.setAttribute(SESSION_REGISTERED, Boolean.FALSE);
			response.sendRedirect(REDIRECT_REGISTERE_PAGE);
		}

        return null;
	}

    private boolean register(String user, String pass) throws SQLException {
        if (user == null || user.length() == 0 || pass == null || pass.length() == 0) {
            return false;
        }
        SQLDatabase db = getDatabase();

        // user info
        long curMillis = System.currentTimeMillis();
        String registered = SQLs.formatString(curMillis, AbstractServlet.DATE_FORMAT);
        Map<UserTable, Object> values = new EnumMap<>(UserTable.class);
        values.put(UserTable.NAME, user);
        values.put(UserTable.PASSWORD, pass);
        values.put(UserTable.REGISTERED, registered);
        long userID = db.insert(UserTable.class, values);
        if (userID < 0) {
            return false;
        }

        // user root dir info
        FileDBUpdater fileDB = getFileDBUpdater(userID);
        long rootID = fileDB.initRoot();
        if (rootID < 0) {
            db.delete(UserTable.class, UserTable.ID, userID);
            return false;
        }
        return true;
    }
}
