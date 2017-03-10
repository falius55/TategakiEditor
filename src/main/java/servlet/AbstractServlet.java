package servlet;

import java.io.PrintWriter;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.sql.SQLException;

import javax.servlet.ServletConfig;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import sql.SQLDatabase;
import sql.PreparedDatabase;
import sql.FileDBUpdater;
import datadir.DataDirectoryManager;

abstract public class AbstractServlet extends HttpServlet  {
    private static final long serialVersionUID = 1L;

    public static final String SESSION_SUCCESS_LOGIN = "login";  // 外部使用：UserCheckFilter
    protected static final String SESSION_USER_ID = "userid";
    protected static final String SESSION_USER_NAME = "username";

    static final String INIT_PARAM_DATABASE_NAME = "database-name";
    static final String INIT_PARAM_DATABASE_USER = "database-user";
    static final String INIT_PARAM_DATABASE_PASSWPRD = "database-password";
    static final String INIT_PARAM_PROJECT_ROOT = "project-root";

    public static final String DATE_FORMAT = "yyyy-MM-dd HH:mm:ss";  // 外部使用：FileDBUpdater

    enum MethodType {
        GET, POST
    }

    private SQLDatabase mDatabase = null;
    private DataDirectoryManager mDataDirectoryManager = null;

    @Override
    public void init() throws ServletException {
        super.init();
        log(getClass().getName() + " init()");
        ServletConfig config = getServletConfig();
        ServletContext context = config.getServletContext();

        String dbName = context.getInitParameter(INIT_PARAM_DATABASE_NAME);
        String user = context.getInitParameter(INIT_PARAM_DATABASE_USER);
        String password = context.getInitParameter(INIT_PARAM_DATABASE_PASSWPRD);

        try {
            mDatabase = new PreparedDatabase(dbName, user, password);
        } catch (SQLException e) {
            throw new IllegalStateException(e);
        }

        String projectRootPath = context.getInitParameter(INIT_PARAM_PROJECT_ROOT);
        mDataDirectoryManager = new DataDirectoryManager(projectRootPath, mDatabase);
    }

    @Override
    public void destroy() {
        super.destroy();
        log(getClass().getName() + " destroy()");
        try {
            mDatabase.close();
        } catch(SQLException e) {
            log(e.getMessage());
        }
    }

    protected SQLDatabase getDatabase() {
        return mDatabase;
    }

    protected FileDBUpdater getFileDBUpdater(long userID) {
        return new FileDBUpdater(mDatabase, userID);
    }

    protected DataDirectoryManager getDataDirectoryManager() {
        return mDataDirectoryManager;
    }

    protected String onPost(long userID, HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException, SQLException {
        return null;
    }

    protected String onGet(long userID, HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException, SQLException {
        return null;
    }

    @Override
    public void doGet(HttpServletRequest request, HttpServletResponse response)
        throws ServletException {
        hundle(MethodType.GET, request, response);
    }

    @Override
    public void doPost(HttpServletRequest request, HttpServletResponse response)
        throws ServletException {
        hundle(MethodType.POST, request, response);
    }

    private void hundle(MethodType methodType, HttpServletRequest request, HttpServletResponse response) throws ServletException {
        try {
            log("handle on " + getClass().getName());
            log("method type:" + request.getMethod());
            java.util.Map<?, ?> parameters = request.getParameterMap();
            log("parameters: " + parameters);
            log("request url:" + request.getRequestURI());

            request.setCharacterEncoding("UTF-8");
            response.setContentType("application/json; charset=UTF-8");

            HttpSession session = request.getSession(true);

            Object attrID = session.getAttribute(SESSION_USER_ID);
            long id = attrID == null ? -1 : Long.parseLong(attrID.toString());

            // テストのためのコード。localhostからの通信の場合に限って、ユーザーID直接指定を許可する
            if (request.getRequestURL().toString().contains("localhost") &&
                    request.getParameter("userID") != null) {
                id = Long.parseLong(request.getParameter("userID"));
                log("for test id:" + id);
            }

            log("userID:" + id);

            String ret;
            switch (methodType) {
                case GET:
                    ret = onGet(id, request, response);
                    break;
                case POST:
                    ret = onPost(id, request, response);
                    break;
                default:
                    throw new ServletException();
            }

            log("return value from " + getClass().getName() + " -> " + ret);

            if (ret != null) {
                try (PrintWriter out = response.getWriter()) {
                    out.println(ret);
                }
            }

            mDatabase.clear();

        } catch (IOException e) {
            throw new UncheckedIOException(e);
        } catch (SQLException e) {
            throw new ServletException(e);
        }
    }
}
