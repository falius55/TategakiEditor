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
public class KanjiProxy extends HttpServlet {
	String sentence;
	String rtnString;

	public void doPost(HttpServletRequest request, HttpServletResponse response)
		throws IOException, ServletException {
		try{
		response.setContentType("application/json; charset=UTF-8");
		PrintWriter out = response.getWriter();

		sentence = request.getParameter("sentence");
		rtnString = getData(sentence);

		log("rtnKanjiJson:"+ rtnString);
		out.println(rtnString);
		out.close();
		}catch(IOException e){
			log(e.getMessage());
		}catch(Exception e){
			log(e.getMessage());
		}
	}

	public static void main(String args[]) {
		System.out.println(getData(args[0]));
	}

	/**
	 * 漢字変換候補を返します
	 * @param str 変換する文字列
	 * @return 通信で得た漢字変換候補のJSON文字列
	 */
	public static String getData(String str) {
		// TODO: 読み込みは、bufferedReaderに変換してlinesで読み込む
		byte[] b = new byte[10000];
		try {
			// Google CGI API for Japanese Input(Google日本語入力API)
			String strUrl = "http://www.google.com/transliterate?langpair=ja-Hira|ja&text=" + str;
			URL url = new URL(strUrl);
			InputStream in = url.openStream();
			BufferedReader br = new BufferedReader(new InputStreamReader(in));

			String ret = br.lines().collect(Collectors.joining());

			in.close();
			br.close();
			return ret;
		} catch(MalformedURLException e) {
			System.err.println(e);
		} catch(IOException e) {
			System.err.println(e);
		}
		int i;
		for(i = 0; b[i] != 0 && i < b.length; i++); // 読み込みバイト数を数える
		return new String(b,0,i);
	}
}
