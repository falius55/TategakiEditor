import java.io.IOException;
import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

/**
 * アクセスしたクライアントのセッションを確認し、セッションがまだ始まっていないか、ログインがされていなければログインページに飛ばすフィルター
 */
public class UserCheckFilter implements Filter {
	
	public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) {
		try {
			HttpServletRequest servletrequest = (HttpServletRequest)request;
			HttpServletResponse servletresponse= (HttpServletResponse)response;

			HttpSession session = servletrequest.getSession();

			if (session == null) {
				session = servletrequest.getSession(true);

				servletresponse.sendRedirect("/tategaki/loginpage.jsp");
			} else {
				Boolean loginCheck = (Boolean)session.getAttribute("login");
				if (loginCheck == null || loginCheck.equals(Boolean.FALSE)) {
					servletresponse.sendRedirect("/tategaki/loginpage.jsp");
				}
			}
			chain.doFilter(request,response);
		} catch (ServletException e) {
			System.err.println(e.getMessage());
		} catch(IOException e) {
			System.err.println(e.getMessage());
		} catch(Exception e) {
			System.err.println(e.getMessage());
		}
	}

	public void init(FilterConfig filterconfig) throws ServletException {
			
	}
	public void destroy() {
			
	}
}
