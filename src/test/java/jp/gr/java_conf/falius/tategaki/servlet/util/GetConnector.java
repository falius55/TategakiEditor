package jp.gr.java_conf.falius.tategaki.servlet.util;

import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.BufferedReader;
import java.io.IOException;
import java.net.URL;
import java.net.MalformedURLException;
import java.util.Map;
import java.util.stream.Collectors;

public class GetConnector implements Connector {
    private final String mStrUrl;

    public GetConnector(String url) {
        // url: http://localhost:8080/tategaki/...
        mStrUrl = url;
    }

    public String send(Map<?, ?> data) throws IOException {
        URL url;
        try {
            String sendData = createSendString(data);
            url = new URL(sendData.isEmpty() ?
                    mStrUrl : String.join("?", mStrUrl, sendData));
        } catch (MalformedURLException e) {
            throw new IllegalArgumentException("url:" + mStrUrl, e);
        }

        try (InputStream is = url.openStream(); BufferedReader br = new BufferedReader(new InputStreamReader(is))) {
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = br.readLine()) != null) {
                sb.append(line);
            }
            return sb.toString();
        }
    }

    private String createSendString(Map<?, ?> data) {
        if (data.size() == 0) {
            return "";
        }
        return data.entrySet().stream()
            .map(entry -> String.join("=", entry.getKey().toString(), entry.getValue().toString()))
            .collect(Collectors.joining("&"));
    }
}
