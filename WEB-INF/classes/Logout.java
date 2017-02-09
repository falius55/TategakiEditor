import java.io.PrintWriter;
import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpSession;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * <p>GET通信のリクエストに対し、セッションを破棄してログアウトするサーブレット
 */
public class Logout extends HttpServlet {

    public void doGet(HttpServletRequest request,HttpServletResponse response) throws IOException,ServletException {
        response.setContentType("text/html; charset=UTF-8");

        HttpSession session = request.getSession(true);
        session.invalidate(); // セッションを破棄する

        response.sendRedirect("/tategaki/loginpage.jsp");
    }
}
