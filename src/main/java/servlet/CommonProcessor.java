package servlet;

import java.sql.SQLException;

import javax.servlet.ServletConfig;
import javax.servlet.ServletContext;
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

import mysqlfacade.DatabaseColumn;
import mysqlfacade.SQLDatabase;
import mysqlfacade.PreparedDatabase;
import sql.UserTable;
import sql.FileTable;

public class CommonProcessor implements ServletContextListener {

    @Override
    public void contextInitialized(ServletContextEvent event) {

        try (SQLDatabase db = setupDatabase(event)) {

            createTableIfNotExist(UserTable.class, db);
            createTableIfNotExist(FileTable.class, db);

        } catch (SQLException e) {
            throw new IllegalStateException("failed database initializing", e);
        }
    }

    @Override
    public void contextDestroyed(ServletContextEvent event) {}

    private SQLDatabase setupDatabase(ServletContextEvent event) throws SQLException {
        ServletContext context = event.getServletContext();

        String dbName = context.getInitParameter(AbstractServlet.INIT_PARAM_DATABASE_NAME);
        String user = context.getInitParameter(AbstractServlet.INIT_PARAM_DATABASE_USER);
        String password = context.getInitParameter(AbstractServlet.INIT_PARAM_DATABASE_PASSWPRD);

        return new PreparedDatabase(dbName, user, password);
    }

    private <T extends Enum<T> & DatabaseColumn> void createTableIfNotExist(Class<T> table, SQLDatabase db)
        throws SQLException {
        if (db.isExistTable(table)) {
            return;
        }

        db.create(table);
    }
}
