package jp.gr.java_conf.falius.tategaki.servlet.util;

import java.io.OutputStream;
import java.io.PrintStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.BufferedReader;
import java.io.IOException;
import java.net.URL;
import java.net.URLConnection;
import java.net.MalformedURLException;
import java.net.ConnectException;
import java.util.Map;
import java.util.stream.Collectors;

public class PostConnector implements Connector {
    private final URL mUrl;

    public PostConnector(String url) {
        // url: http://localhost:8080/tategaki/...
        try {
            mUrl = new URL(url);
        } catch (MalformedURLException e) {
            throw new IllegalArgumentException("url:" + url, e);
        }
    }

    public String send(Map<?, ?> data) throws IOException {
        URLConnection uc = mUrl.openConnection();
        uc.setDoOutput(true);  // POST可能にする

        try (OutputStream os = uc.getOutputStream(); PrintStream ps = new PrintStream(os)) {
            String sendData = createSendString(data);
            ps.print(sendData);
        } catch (ConnectException e) {
            System.err.println("url:" + mUrl);
            e.printStackTrace();
            throw new IllegalStateException(e);
        }

        try (InputStream is = uc.getInputStream();
                BufferedReader br = new BufferedReader(new InputStreamReader(is))) {
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
