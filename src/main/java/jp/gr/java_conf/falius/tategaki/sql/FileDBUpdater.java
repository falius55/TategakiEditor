package jp.gr.java_conf.falius.tategaki.sql;

import java.util.Map;
import java.util.EnumMap;
import java.sql.ResultSet;
import java.sql.SQLException;

import servlet.AbstractServlet;

import jp.gr.java_conf.falius.mysqlfacade.SQLDatabase;
import jp.gr.java_conf.falius.mysqlfacade.SQLs;

/**
 * 各メソッドは特に断りがない限り、ファイルだけでなくディレクトリにも適用できます。
 */
public class FileDBUpdater {
    private final SQLDatabase mDatabase;
    private final long mUserID;

    public FileDBUpdater(SQLDatabase db, long userID) {
        mDatabase = db;
        mUserID = userID;
    }

    public long initRoot() throws SQLException {
        long savedMillis = System.currentTimeMillis();
        String saved = SQLs.formatString(savedMillis, AbstractServlet.DATE_FORMAT);
        Map<FileTable, Object> values = new EnumMap<>(FileTable.class);
        values.put(FileTable.FILE_NAME, FileTable.FileType.ROOT.toString());
        values.put(FileTable.TYPE, FileTable.FileType.ROOT.toString());
        values.put(FileTable.PARENT_DIR, 0);
        values.put(FileTable.USER_ID, mUserID);
        values.put(FileTable.SAVED, saved);

        return mDatabase.insert(FileTable.class, values);
    }

    public boolean update(long fileID, String newFileName, String newSaved) throws SQLException {
        String whereClause = FileTable.ID + "=? and " + FileTable.USER_ID + "=?";
        Map<FileTable, Object> values = new EnumMap<>(FileTable.class);
        values.put(FileTable.FILE_NAME, newFileName);
        values.put(FileTable.SAVED, newSaved);
        int result = mDatabase.update(FileTable.class, values, whereClause, fileID, mUserID);
        return result > 0;
    }

    /**
     * @param parentDirID 親ディレクトリのID。０以下ならroot直下になる。
     */
    public long create(String fileName, long parentDirID, String newSaved, FileTable.FileType fileType) throws SQLException {
        if (parentDirID <= 0) {
            String whereClause = FileTable.USER_ID + "=? and " + FileTable.TYPE + "=?";
            ResultSet rs = mDatabase.selectAllColumns(FileTable.class, whereClause, mUserID, FileTable.FileType.ROOT.toString());
            if (!rs.next()) {
                return -1;
            }
            parentDirID = rs.getLong(FileTable.ID.toString());
        }

        Map<FileTable, Object> values = new EnumMap<>(FileTable.class);
        values.put(FileTable.FILE_NAME, fileName);
        values.put(FileTable.TYPE, fileType.toString());
        values.put(FileTable.PARENT_DIR, parentDirID);
        values.put(FileTable.USER_ID, mUserID);
        values.put(FileTable.SAVED, newSaved);

        long newID = mDatabase.insert(FileTable.class, values);
        return newID;
    }

    /**
     * ファイルあるいはディレクトリをデータベース上から削除します。
     * 指定されたIDのディレクトリの中に別のファイル化ディレクトリがある場合、canForceがfalseであれば何もせずfalseを返します。
     * @param canForce 指定されたIDのディレクトリ内に別のファイルあるいはディレクトリがある場合に、中身ごと削除するかどうか
     */
    public boolean delete(long fileID, boolean canForce) throws SQLException {
        boolean hasFile = mDatabase.isExistRecord(FileTable.class, FileTable.PARENT_DIR + "=?", fileID);
        if (hasFile && !canForce) {
            return false;
        }

        boolean result = mDatabase.delete(FileTable.class, FileTable.ID, fileID) == 1;

        ResultSet rs = mDatabase.selectAllColumns(FileTable.class, FileTable.PARENT_DIR + "=?", fileID);
        while (rs.next()) {
            int id = rs.getInt(FileTable.ID.toString());
            String type = rs.getString(FileTable.TYPE.toString());
            rs.deleteRow();
            if (type.equals("dir")) {
                result = result && delete(id, canForce);
            }
        }
        return result;
    }

    /**
     * newDirIDが０以下ならroot直下
     */
    public boolean changeDir(long fileID, long newDirID) throws SQLException {
        if (newDirID <= 0) {
            String whereClause = FileTable.USER_ID + "=? and " + FileTable.TYPE + "=?";
            ResultSet rs = mDatabase.selectAllColumns(FileTable.class, whereClause, mUserID, FileTable.FileType.ROOT.toString());
            if (!rs.next()) {
                return false;
            }
            newDirID = rs.getLong(FileTable.ID.toString());
        }

        Map<FileTable, Object> values = new EnumMap<>(FileTable.class);
        values.put(FileTable.PARENT_DIR, newDirID);
        String whereClause = String.join(" ", FileTable.ID.toString(), "=? and ", FileTable.USER_ID.toString(), " =?");
        int result = mDatabase.update(FileTable.class, values, whereClause, fileID, mUserID);
        return result == 1;
    }

    public void destroy() throws SQLException {
        mDatabase.delete(FileTable.class, FileTable.USER_ID, mUserID);
    }
}
