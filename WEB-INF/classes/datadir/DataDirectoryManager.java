package datadir;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.io.IOException;

import javax.servlet.ServletContext;

import sql.SQLDatabase;
import sql.FileTable;

public class DataDirectoryManager {
    private final ServletContext mContext;
    private final SQLDatabase mDatabase;

    public DataDirectoryManager(ServletContext context, SQLDatabase db) {
        mContext = context;
        mDatabase = db;
    }

    public UserDirectory getUserDirectory(long userID) throws IOException {
        try {
            long rootID = rootFromUserID(userID);
            return new UserDirectory(mContext, userID, rootID);
        } catch (SQLException e) {
            throw new IOException(e);
        }
    }

    private long rootFromUserID(long userID) throws SQLException {
        String whereClause = FileTable.TYPE + "=? and " + FileTable.USER_ID + "=?";
        ResultSet rs = mDatabase.selectAllColumns(FileTable.class, whereClause, FileTable.FileType.ROOT.toString(), userID);
        if (rs.next()) {
            return rs.getLong(FileTable.ID.toString());
        } else {
            throw new IllegalStateException("user(" + userID + ") has no root directory");
        }
    }
}
