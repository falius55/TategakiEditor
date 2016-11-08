import java.io.PrintWriter;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.BufferedReader;
import java.io.IOException;
import java.net.URL;
import java.net.MalformedURLException;
import java.util.stream.Collectors;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;


/**
 * <p>文字列を受け取り、漢字変換の候補を返すサーブレット<br>
 *	変換にはウェブAPIの'Google CGI API for Japanese Input(Google日本語入力API)'を使用します
 * <pre>
 * request: {
 *	sentence
 * 	}
 * // responseの一例
 * response: [
 * 	[ひらがな,[漢字１,漢字２,漢字３]],
 * 	[ひらがな２,[漢字４,漢字５]],
 * 	[ひらがな３,[漢字６,漢字７]]
 * ]
 * </pre>
 */
public class KanjiProxy extends AbstractServlet {

	public void doPost(HttpServletRequest request, HttpServletResponse response)
		throws ServletException {
		ready(request, response);

		String sentence = request.getParameter("sentence");
		String rtnString = getData(sentence);

		log("rtnKanjiJson:"+ rtnString);
		out(response, rtnString);
	}

	public static void main(String args[]) {
		System.out.println(getData(args[0]));
	}

	/**
	 * 漢字変換候補を返します
	 * @param str 変換する文字列
	 * @return 通信で得た漢字変換候補のJSON文字列
	 *     取得に失敗すると空文字列
	 */
	public static String getData(String str) {
        // Google CGI API for Japanese Input(Google日本語入力API)
        String strUrl = "http://www.google.com/transliterate?langpair=ja-Hira|ja&text=" + str;
        try {
            URL url = new URL(strUrl);
            try (InputStream is = url.openStream();
                    BufferedReader br = new BufferedReader(new InputStreamReader(is, "UTF8"))) {
                return br.lines().collect(Collectors.joining());
            } catch (IOException e) {
                e.printStackTrace();
            }

        } catch (MalformedURLException e) {
            e.printStackTrace();
        }
		return "";
	}
}
