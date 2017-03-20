package jp.gr.java_conf.falius.tategaki.sql;

import java.util.Map;
import java.util.HashMap;

import jp.gr.java_conf.falius.mysqlfacade.DatabaseColumn;

public enum FileTable implements DatabaseColumn {
    ID("id", "int", "not null primary key auto_increment"),
    FILE_NAME("filename", "varchar(255)", ""),
    TYPE("type", "enum('root', 'dir', 'file')", "default 'file'"),
    PARENT_DIR("parent_dir", "int", ""),
    USER_ID("user_id", "int", "not null"),
    SAVED("saved", "datetime", "");

    private static final Map<String, FileTable> stringToEnum = new HashMap<>();

    static {
        for (FileTable column : values()) {
            stringToEnum.put(column.toString(), column);
        }
    }

    public static FileTable fromString(String name) {
        return stringToEnum.get(name);
    }

    public static String tableName() {
        return "file_table";
    }

    private final String mName;
    private final String mType;
    private final String mOption;

    FileTable(String name, String type, String option) {
        mName = name;
        mType = type;
        mOption = option;
    }

    @Override
    public String toString() {
        return mName;
    }

    @Override
    public String type() {
        return mType;
    }

    @Override
    public String columnString() {
        return String.join(" ", mName, mType, mOption);
    }

    public enum FileType {
        FILE("file"),
        DIRECTORY("dir"),
        ROOT("root");

        private final String mName;
        FileType(String name) {
            mName = name;
        }
        @Override
        public String toString() {
            return mName;
        }
    }
}
