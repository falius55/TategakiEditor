import java.io.*;
import javax.servlet.*;
import javax.servlet.http.*;
import javax.servlet.Filter;
import javax.servlet.FilterChain;

/**
 * アクセスしたクライアントのセッションを確認し、セッションがまだ始まっていないか、ログインがされていなければログインページに飛ばします。
 */
public class UserCheckFilter implements Filter {
	
	public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) {
		try {
			HttpServletRequest servletrequest = (HttpServletRequest)request;
			HttpServletResponse servletresponse= (HttpServletResponse)response;

			//String target = ((HttpServletRequest)request).getRequestURI();
			//String target = servletrequest.getRequestURI();

			//HttpSession session = ((HttpServletRequest)request).getSession();
			HttpSession session = servletrequest.getSession();

			if (session == null) {
				//session = ((HttpServletRequest)request).getSession(true);
				session = servletrequest.getSession(true);

				//(HttpServletResponse)response).sendRedirect("/tategaki/loginpage.jsp");
				servletresponse.sendRedirect("/tategaki/loginpage.jsp");
			}else{
				Boolean loginCheck = (Boolean)session.getAttribute("login");
				if (loginCheck == null || loginCheck.equals(Boolean.FALSE)) {
					//((HttpServletResponse)response).sendRedirect("/tategaki/loginpage.jsp");
					servletresponse.sendRedirect("/tategaki/loginpage.jsp");
				}
			}
			chain.doFilter(request,response);
		} catch (ServletException e) {
			System.out.println("ServletException:" + e.getMessage());
		}catch(IOException e){
			System.out.println("IOException:" + e.getMessage());
		}catch(Exception e){
			System.out.println("Exception:" + e.getMessage());
		}
	}

	public void init(FilterConfig filterconfig) throws ServletException{
			
	}
	public void destroy(){
			
	}
}
