package test.util;

import java.util.Map;
import java.io.IOException;

public interface Connector {

    String send(Map<?, ?> data) throws IOException;
}
