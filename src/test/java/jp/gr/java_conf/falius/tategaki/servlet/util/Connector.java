package jp.gr.java_conf.falius.tategaki.servlet.util;

import java.io.IOException;
import java.util.Map;

public interface Connector {

    String send(Map<?, ?> data) throws IOException;
}
