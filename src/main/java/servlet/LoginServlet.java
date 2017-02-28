package servlet;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import javax.servlet.ServletException;

import sql.SQLDatabase;
import sql.UserTable;

/**
 * ログインを試みて、成功するとメインページへ、失敗すると再度ログインページヘリダイレクトします。
 *
 * <p>
 * POST: ログインを試みます。
 * <pre>
 * request {
 *  username,
 *  password
 * }
 * </pre>
 */
public class LoginServlet extends AbstractServlet {
    private static final long serialVersionUID = 1L;

    // post param
    private static final String PARAM_USER_NAME = "username";
    private static final String PARAM_PASSWORD = "password";

    private static final String REDIRECT_PAGE_IF_SUCCESS_LOGIN = "/tategaki/tategaki.jsp";
    private static final String REDIRECT_PAGE_IF_FAILED_LOGIN = "/tategaki/loginpage.jsp";

    @Override
    protected String onPost(long userID, HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException, SQLException {
        log("POST to LoginServlet");

        String user = request.getParameter(PARAM_USER_NAME);
        String pass = request.getParameter(PARAM_PASSWORD);

        HttpSession session = request.getSession(true);

        boolean success = tryLogin(user, pass, session);

        if (success) {
            log("success login; redirect to " + REDIRECT_PAGE_IF_SUCCESS_LOGIN);
            session.setAttribute(AbstractServlet.SESSION_SUCCESS_LOGIN,Boolean.TRUE);
            response.sendRedirect(REDIRECT_PAGE_IF_SUCCESS_LOGIN);
        } else {
            log("failed login; redirect to " + REDIRECT_PAGE_IF_FAILED_LOGIN);
            session.setAttribute(AbstractServlet.SESSION_SUCCESS_LOGIN,Boolean.FALSE);
            response.sendRedirect(REDIRECT_PAGE_IF_FAILED_LOGIN);
        }

        return null;
    }

    private boolean tryLogin(String user, String pass, HttpSession session) throws ServletException, SQLException {
        if (user == null || user.length() == 0 || pass == null || pass.length() == 0)
            return false;

        SQLDatabase db = getDatabase();
        String whereClause = UserTable.NAME + "=? and " + UserTable.PASSWORD + "=?";
        ResultSet rs
            = db.select(UserTable.class, new UserTable[] { UserTable.ID, UserTable.NAME }, whereClause, user, pass);

        if (!rs.next()) {
            return false; }

        long userID = rs.getLong(UserTable.ID.toString());
        String userName = rs.getString(UserTable.NAME.toString());

        session.setAttribute(AbstractServlet.SESSION_USER_ID, userID);
        session.setAttribute(AbstractServlet.SESSION_USER_NAME, userName);
        return true;
    }
}
