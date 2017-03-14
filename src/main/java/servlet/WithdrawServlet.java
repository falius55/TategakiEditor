package servlet;

import java.sql.SQLException;
import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.ServletException;

import mysqlfacade.SQLDatabase;
import sql.UserTable;

public class WithdrawServlet extends AbstractServlet {
    private static final long serialVersionUID = 1L;

    private static final String REDIRECT_LOGOUT_SERVLET = "/tategaki-editor/Logout";

    @Override
	public String onPost(long userID, HttpServletRequest request, HttpServletResponse response) throws SQLException, IOException {
        SQLDatabase db = getDatabase();
        db.delete(UserTable.class, UserTable.ID, userID);

        // rootIDを取得するためにデータベースを利用しているため、
        // データベースのデータ削除よりも前にディレクトリを削除する必要がある
        getDataDirectoryManager().getUserDirectory(userID).destroy();
        getFileDBUpdater(userID).destroy();

        response.sendRedirect(REDIRECT_LOGOUT_SERVLET);

        return null;
    }
}
