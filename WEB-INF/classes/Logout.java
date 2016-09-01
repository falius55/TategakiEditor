import java.io.*;
import javax.servlet.*;
import javax.servlet.http.*;
import java.sql.*;

/**
 * <p>GET通信のリクエストに対し、セッションを破棄してログアウトするサーブレット
 */
public class Logout extends HttpServlet {
	public void doGet(HttpServletRequest request,HttpServletResponse response) throws IOException,ServletException {
		response.setContentType("text/html; charset=UTF-8");
		PrintWriter out = response.getWriter();

		HttpSession session = request.getSession(true);
		session.invalidate(); // セッションを破棄する

		response.sendRedirect("/tategaki/loginpage.jsp");
	}
}
