package filter;

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

import servlet.AbstractServlet;

/**
 * アクセスしたクライアントのセッションを確認し、セッションがまだ始まっていないか、ログインがされていなければログインページに飛ばすフィルター
 */
public class UserCheckFilter implements Filter {
    private static String REDIRECT_PAGE_IF_FALIED = "/tategaki/loginpage.jsp";

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) {
        try {
            HttpServletRequest servletRequest = (HttpServletRequest) request;
            HttpServletResponse servletResponse= (HttpServletResponse) response;

            if (shouldRedirect(servletRequest)) {
                servletResponse.sendRedirect(REDIRECT_PAGE_IF_FALIED);
            }

            chain.doFilter(request, response);
        } catch (ServletException | IOException e) {
            e.printStackTrace();
        }
    }

    private boolean shouldRedirect(HttpServletRequest request) {
        HttpSession session = request.getSession();
        if (session == null) {
            session = request.getSession(true);
            return true;
        }

        Boolean didLogin = (Boolean) session.getAttribute(AbstractServlet.SESSION_SUCCESS_LOGIN);
        return didLogin == null || !didLogin;
    }

    public void init(FilterConfig filterconfig) throws ServletException {}

    public void destroy() {}
}
