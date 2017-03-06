package test;

import org.junit.Test;

import java.util.Map;
import java.util.HashMap;

import java.io.IOException;

import test.util.Connector;
import test.util.PostConnector;
import test.util.GetConnector;

public class ConnectorTest {

    @Test
    public void testPost() throws IOException {
        System.out.println("testPost");

        String url = "http://localhost:8000/tategaki/Login";
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

        String url = "http://localhost:8000/tategaki/FileList";
        Map<String, Long> data = new HashMap<>();
        data.put("userID", 1L);

        Connector connector = new GetConnector(url);
        String result = connector.send(data);
        System.out.println(result);  // JSON文字列
    }
}
