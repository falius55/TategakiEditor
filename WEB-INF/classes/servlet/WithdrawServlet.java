package servlet;

import java.sql.SQLException;
import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.ServletException;

import servlet.AbstractServlet;
import sql.SQLDatabase;
import sql.UserTable;

public class WithdrawServlet extends AbstractServlet {
    private static final long serialVersionUID = 1L;

    private static final String REDIRECT_LOGOUT_SERVLET = "/tategaki/Logout";

    @Override
	public String onPost(long userID, HttpServletRequest request, HttpServletResponse response) throws SQLException, IOException {
        SQLDatabase db = getDatabase();
        db.delete(UserTable.class, UserTable.ID, userID);

        getFileDBUpdater(userID).destroy();
        getDataDirectoryManager().getUserDirectory(userID).destroy();

        response.sendRedirect(REDIRECT_LOGOUT_SERVLET);

        return null;
    }
}
