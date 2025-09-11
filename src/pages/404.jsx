import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-pink-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Cake illustration */}
        <div className="mb-8">
          <div className="w-32 h-32 mx-auto bg-card rounded-full flex items-center justify-center shadow-lg">
            <svg
              className="w-16 h-16 text-primary"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 6c1.11 0 2-.9 2-2 0-.38-.1-.73-.29-1.03L12 0l-1.71 2.97c-.19.3-.29.65-.29 1.03 0 1.1.89 2 2 2zm4.5 3.5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5.67 1.5 1.5 1.5 1.5-.67 1.5-1.5zm-9 0C7.5 8.67 6.83 8 6 8s-1.5.67-1.5 1.5S5.17 11 6 11s1.5-.67 1.5-1.5zM12 15c2.5 0 4.71-1.28 6-3.22-.65-.78-1.61-1.28-2.69-1.28-.76 0-1.46.27-2.01.72-.55-.45-1.25-.72-2.01-.72-.76 0-1.46.27-2.01.72-.55-.45-1.25-.72-2.01-.72-1.08 0-2.04.5-2.69 1.28C7.29 13.72 9.5 15 12 15z" />
              <path d="M9 16h6c.55 0 1 .45 1 1v4c0 1.1-.9 2-2 2h-4c-1.1 0-2-.9-2-2v-4c0-.55.45-1 1-1z" />
            </svg>
          </div>
        </div>

        {/* Error message */}
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Oops! Trang không tìm thấy
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Có vẻ như chiếc bánh bạn đang tìm kiếm đã bị ăn hết rồi! Trang này
            không tồn tại hoặc đã được di chuyển.
          </p>
        </div>

        {/* Action buttons */}
        <div className="space-y-4">
          <Link
            to="/"
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
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Về trang chủ CakeStory
          </Link>

          <Link
            to="/search"
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            Tìm kiếm bánh ngon
          </Link>
        </div>

        {/* Help text */}
        <p className="mt-8 text-sm text-muted-foreground">
          Cần hỗ trợ?
          <Link to="/contact" className="text-primary hover:underline ml-1">
            Liên hệ với chúng tôi
          </Link>
        </p>
      </div>
    </div>
  );
}
