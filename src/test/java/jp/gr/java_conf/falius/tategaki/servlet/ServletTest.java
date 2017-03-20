package jp.gr.java_conf.falius.tategaki.servlet;

import static org.hamcrest.CoreMatchers.*;
import static org.junit.Assert.*;

import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;

import java.io.FileInputStream;
import java.io.InputStream;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.Files;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Properties;
import java.util.Map;

import jp.gr.java_conf.falius.mysqlfacade.PreparedDatabase;
import jp.gr.java_conf.falius.mysqlfacade.SQLDatabase;

import jp.gr.java_conf.falius.tategaki.servlet.util.Connector;
import jp.gr.java_conf.falius.tategaki.servlet.util.GetConnector;
import jp.gr.java_conf.falius.tategaki.servlet.util.PostConnector;
import jp.gr.java_conf.falius.tategaki.sql.FileTable;
import jp.gr.java_conf.falius.tategaki.sql.UserTable;

public class ServletTest {
    private static Properties mProperties;
    private static SQLDatabase mDB;

    @BeforeClass
    public static void setupDB() throws SQLException, IOException {
        mProperties = new Properties();
        String propertiesPath = "build/resources/test/jp/gr/java_conf/falius/tategaki/servlet/test.properties";
        try (InputStream is = new FileInputStream(propertiesPath)) {
            mProperties.load(is);
        }

        String dbName = mProperties.getProperty("test-database-name");
        String user = mProperties.getProperty("test-database-user");
        String pass = mProperties.getProperty("test-database-password");

        mDB = new PreparedDatabase(dbName, user, pass);
    }

    @AfterClass
    public static void closeDB() throws SQLException {
        mDB.close();
    }

    private long register() throws IOException, SQLException {
        String url = "http://localhost:8100/tategaki-editor/Register";

        Map<String, String> data = new HashMap<>();
        data.put("username", "test_user");
        data.put("password", "test_password");

        Connector connector = new PostConnector(url);
        connector.send(data);

        assertTrue(mDB.isExistRecord(UserTable.class, UserTable.NAME, "test_user"));

        ResultSet rs = mDB.selectAllColumns(UserTable.class, UserTable.NAME, "test_user");
        assertTrue(rs.next());
        assertThat(rs.getString(UserTable.PASSWORD.toString()), is("test_password"));

        long id = rs.getLong(UserTable.ID.toString());
        System.out.println("id:" + id);

        // root dir
        ResultSet frs = mDB.selectAllColumns(FileTable.class, FileTable.USER_ID, id);
        assertTrue(frs.next());
        assertThat(frs.getString(FileTable.FILE_NAME.toString()), is(FileTable.FileType.ROOT.toString()));
        assertThat(frs.getString(FileTable.TYPE.toString()), is(FileTable.FileType.ROOT.toString()));
        assertThat(frs.getInt(FileTable.PARENT_DIR.toString()), is(0));
        // savedは秒単位で記録しているため、確認は困難
        return id;
    }

    private void withdraw(long id) throws IOException, SQLException {
        String url = "http://localhost:8100/tategaki-editor/Withdraw";

        Map<String, Long> data = new HashMap<>();
        data.put("userID", id);

        Connector connector = new PostConnector(url);
        String ret = connector.send(data);
        assertFalse(mDB.isExistRecord(UserTable.class, UserTable.ID, id));

        String contextPath = mProperties.getProperty("context_path");
        Path dirPath = Paths.get(contextPath, "/", Long.toString(id));
        assertFalse(Files.exists(dirPath));
    }

    private void saveFile(long id) {
    }

    @Test
    public void testCycle() throws IOException, SQLException {
        long userID = register();

        withdraw(userID);
    }
}
