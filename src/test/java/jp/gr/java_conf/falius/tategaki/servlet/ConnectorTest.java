package jp.gr.java_conf.falius.tategaki.servlet;

import org.junit.Test;

import java.util.Map;
import java.util.HashMap;

import java.io.IOException;

import jp.gr.java_conf.falius.tategaki.servlet.util.Connector;
import jp.gr.java_conf.falius.tategaki.servlet.util.GetConnector;
import jp.gr.java_conf.falius.tategaki.servlet.util.PostConnector;

public class ConnectorTest {

    @Test
    public void testPost() throws IOException {
        System.out.println("testPost");

        String url = "http://localhost:8100/tategaki-editor/Login";
        Map<String, String> data = new HashMap<>();
        data.put("username", "sampleuser");
        data.put("password", "pass");

        Connector connector = new PostConnector(url);
        String result = connector.send(data);
        System.out.println(result);  // リダイレクトの場合はHTML文がすべて返ってくる
    }

    @Test
    public void testGet() throws IOException {
        System.out.println("testGet");

        String url = "http://localhost:8100/tategaki-editor/FileList";
        Map<String, Long> data = new HashMap<>();
        data.put("userID", 1L);

        Connector connector = new GetConnector(url);
        String result = connector.send(data);
        System.out.println(result);  // JSON文字列
    }
}
