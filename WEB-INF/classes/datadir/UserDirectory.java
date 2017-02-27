package datadir;

import java.util.Arrays;
import java.util.stream.Stream;
import java.util.stream.Collectors;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.DirectoryStream;
import java.nio.file.StandardOpenOption;
import java.nio.file.DirectoryIteratorException;
import java.nio.file.attribute.PosixFilePermissions;

import javax.servlet.ServletContext;

public class UserDirectory {
    private final long mUserID;
    private final long mRootID;
    private final String mUserPath;

    public UserDirectory(ServletContext context, long userID, long rootID) throws IOException {
        mUserID = userID;
        mRootID = rootID;
        mUserPath = context.getRealPath(String.format("data/%d/", mRootID));  // ルートディレクトリ/pathとなる
        init();
    }

    private void init() throws IOException {
        Path path = Paths.get(mUserPath);
        if (Files.notExists(path)) {
            Files.createDirectories(path, PosixFilePermissions.asFileAttribute(PosixFilePermissions.fromString("r--------")));
        }
    }

    public void write(long fileID, String data) throws IOException {
        Path dirPath = Paths.get(mUserPath);
        Files.setPosixFilePermissions(dirPath, PosixFilePermissions.fromString("-wx------"));

        Path filePath = Paths.get(mUserPath, Long.toString(fileID) + ".json");

        Files.write(filePath, Arrays.asList(data), StandardCharsets.UTF_8, StandardOpenOption.CREATE);

        Files.setPosixFilePermissions(dirPath, PosixFilePermissions.fromString("r--------"));
    }

    public String read(long fileID) throws IOException {
        Path dirPath = Paths.get(mUserPath);
        Files.setPosixFilePermissions(dirPath, PosixFilePermissions.fromString("r-x------"));

        Path path = Paths.get(mUserPath, Long.toString(fileID) + ".json");
        try (Stream<String> stream = Files.lines(path, StandardCharsets.UTF_8)) {
            return stream.collect(Collectors.joining());
        } finally {
            Files.setPosixFilePermissions(dirPath, PosixFilePermissions.fromString("r--------"));
        }
    }

    public boolean delete(long fileID) throws IOException {
        Path path = Paths.get(mUserPath, Long.toString(fileID) + ".json");
        if (Files.isDirectory(path)) { // 実際にはディレクトリは作成しないので、trueになることはない
            return true;
        }
        try {
            Files.setPosixFilePermissions(Paths.get(mUserPath), PosixFilePermissions.fromString("-wx------"));
            return Files.deleteIfExists(path);
        } catch (IOException | SecurityException e) {
            e.printStackTrace();
            return false;
        } finally {
            Files.setPosixFilePermissions(Paths.get(mUserPath), PosixFilePermissions.fromString("r--------"));
        }
    }

    public void destroy() throws IOException {
        Path dirPath = Paths.get(mUserPath);
        Files.setPosixFilePermissions(dirPath, PosixFilePermissions.fromString("rwx------"));

        try (DirectoryStream<Path> stream = Files.newDirectoryStream(dirPath)) {
            for (Path file : stream) {
                Files.delete(file);
            }
        } catch (DirectoryIteratorException e) {
            throw new IOException(e);
        }
    }
}
