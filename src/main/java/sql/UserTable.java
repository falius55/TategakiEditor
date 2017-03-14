package sql;

import java.util.Map;
import java.util.HashMap;

import mysqlfacade.DatabaseColumn;

public enum UserTable implements DatabaseColumn {
    ID("id", "int", "not null primary key auto_increment"),
    NAME("name", "varchar(255)", "not null unique key"),
    PASSWORD("password", "varchar(32)", "not null"),
    REGISTERED("registered", "datetime", "");

    private static Map<String, UserTable> stringToEnum = new HashMap<>();

    static {
        for (UserTable column : values()) {
            stringToEnum.put(column.toString(), column);
        }
    }

    public static UserTable fromString(String name) {
        return stringToEnum.get(name);
    }

    private final String mName;
    private final String mType;
    private final String mOption;

    UserTable(String name, String type, String option) {
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

    public static String tableName() {
        return "edit_users";
    }
}
