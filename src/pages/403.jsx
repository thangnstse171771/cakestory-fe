import { Link } from "react-router-dom";

export default function Forbidden() {
  return (
    <div className="bg-pink-50 min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center ">
        {/* Lock illustration */}
        <div className="mb-8">
          <div className="w-32 h-32 mx-auto bg-card rounded-full flex items-center justify-center shadow-lg">
            <svg
              className="w-16 h-16 text-destructive"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <rect
                x="3"
                y="11"
                width="18"
                height="11"
                rx="2"
                ry="2"
                strokeWidth={2}
              />
              <circle cx="12" cy="7" r="4" strokeWidth={2} />
              <path d="M12 15v2" strokeWidth={2} strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Error message */}
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-destructive mb-4">403</h1>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Không có quyền truy cập
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Xin lỗi! Bạn không có quyền truy cập vào khu vực này. Có thể bạn cần
            đăng nhập hoặc liên hệ quản trị viên để được cấp quyền.
          </p>
        </div>

        {/* Action buttons */}
        <div className="space-y-4">
          <Link
            to="/login"
            className="inline-flex items-center justify-center w-full px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
              />
            </svg>
            Đăng nhập tài khoản
          </Link>

          <Link
            to="/"
            className="inline-flex items-center justify-center w-full px-6 py-3 bg-secondary text-secondary-foreground font-medium rounded-lg hover:bg-secondary/90 transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Về trang chủ CakeStory
          </Link>
        </div>

        {/* Help section */}
        <div className="mt-8 p-4 bg-muted rounded-lg">
          <h3 className="font-semibold text-foreground mb-2">Cần hỗ trợ?</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Nếu bạn cho rằng đây là lỗi, vui lòng liên hệ với đội ngũ hỗ trợ của
            chúng tôi.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center text-sm text-primary hover:underline"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            Gửi yêu cầu hỗ trợ
          </Link>
        </div>
      </div>
    </div>
  );
}
