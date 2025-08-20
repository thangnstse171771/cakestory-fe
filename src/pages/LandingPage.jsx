import React from "react";
import {
  Heart,
  MessageCircle,
  Share,
  ShoppingCart,
  CakeSlice,
  Users,
  Award,
  Palette,
  Search,
  TrendingUp,
  Crown,
  Gift,
  Camera,
  ChevronRight,
  MapPin,
  Clock,
  Star,
  BadgeCheck,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const LandingPage = () => {
  const { isAuthenticated, logout } = useAuth();
  const authed = isAuthenticated();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-orange-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <CakeSlice className="w-8 h-8 text-pink-500" />
              <span className="text-2xl font-bold text-gray-800">
                CakeStory
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link
                to={authed ? "/marketplace" : "/login"}
                className="text-gray-600 hover:text-pink-600 font-medium transition-colors"
              >
                Khu Mua Sắm
              </Link>
              <Link
                to={authed ? "/challenge" : "/login"}
                className="text-gray-600 hover:text-pink-600 font-medium transition-colors"
              >
                Thử Thách
              </Link>
              <Link
                to={authed ? "/cake-design" : "/login"}
                className="text-gray-600 hover:text-pink-600 font-medium transition-colors"
              >
                Thiết Kế
              </Link>
              <Link
                to={authed ? "/home" : "/login"}
                className="text-gray-600 hover:text-pink-600 font-medium transition-colors"
              >
                Cộng Đồng
              </Link>
            </div>

            <div className="flex items-center gap-4">
              {!authed && (
                <>
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-pink-600 font-medium transition-colors"
                  >
                    Đăng Nhập
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-gradient-to-r from-pink-500 to-orange-500 text-white px-6 py-2 rounded-full font-semibold hover:from-pink-600 hover:to-orange-600 transition-all transform hover:scale-105"
                  >
                    Đăng Ký
                  </Link>
                </>
              )}
              {authed && (
                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-pink-600 font-medium transition-colors"
                >
                  Đăng Xuất
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen overflow-hidden pt-20">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1920&h=1080&fit=crop&crop=center"
            alt="Beautiful cake background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-pink-600/80 to-orange-600/80"></div>
        </div>
        <div className="relative z-20 h-full flex items-center container mx-auto px-6">
          <div className="max-w-4xl text-white text-center mx-auto">
            <h1 className="text-6xl font-bold mb-6 leading-tight">
              Chào Mừng Đến Với CakeStory
            </h1>
            <p className="text-xl mb-8 text-pink-100 max-w-2xl mx-auto leading-relaxed">
              Nền tảng kết nối cộng đồng yêu thích làm bánh - Nơi bạn có thể học
              hỏi, chia sẻ, mua bán và tham gia các thử thách thú vị cùng những
              người đam mê làm bánh.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                to={authed ? "/home" : "/login"}
                className="bg-white text-pink-600 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
              >
                {authed ? "Vào Trang Chủ" : "Khám Phá Ngay"}
              </Link>
              {!authed && (
                <Link
                  to="/signup"
                  className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-pink-600 transition-all shadow-lg"
                >
                  Đăng Ký Miễn Phí
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Tính Năng Nổi Bật
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              CakeStory mang đến cho bạn trải nghiệm hoàn hảo trong thế giới làm
              bánh
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Marketplace
              </h3>
              <p className="text-gray-600">
                Khám phá và mua sắm những chiếc bánh đẹp mắt từ các cửa hàng uy
                tín
              </p>
              <Link
                to="/login"
                className="inline-block mt-4 text-pink-600 font-semibold hover:text-pink-700"
              >
                Khám phá →
              </Link>
            </div>

            <div className="text-center p-6 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Palette className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Thiết Kế Bánh
              </h3>
              <p className="text-gray-600">
                Công cụ thiết kế bánh trực tuyến với AI hỗ trợ tạo ra những mẫu
                độc đáo
              </p>
              <Link
                to="/login"
                className="inline-block mt-4 text-orange-600 font-semibold hover:text-orange-700"
              >
                Thử ngay →
              </Link>
            </div>

            <div className="text-center p-6 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Thử Thách
              </h3>
              <p className="text-gray-600">
                Tham gia các cuộc thi làm bánh và thể hiện tài năng của bạn
              </p>
              <Link
                to="/login"
                className="inline-block mt-4 text-purple-600 font-semibold hover:text-purple-700"
              >
                Tham gia →
              </Link>
            </div>

            <div className="text-center p-6 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Cộng Đồng
              </h3>
              <p className="text-gray-600">
                Kết nối với những người cùng đam mê, chia sẻ kinh nghiệm và học
                hỏi
              </p>
              <Link
                to="/login"
                className="inline-block mt-4 text-green-600 font-semibold hover:text-green-700"
              >
                Kết nối →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Showcase Section */}
      <section className="py-20 bg-gradient-to-r from-pink-100 to-orange-100">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Khám Phá Thế Giới CakeStory
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Từ thiết kế đến chia sẻ, từ mua sắm đến thi đấu - tất cả đều có
              tại CakeStory
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h3 className="text-3xl font-bold text-gray-800 mb-6">
                Marketplace Đa Dạng
              </h3>
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                Khám phá hàng ngàn mẫu bánh từ các cửa hàng uy tín. Từ bánh sinh
                nhật đến bánh cưới, từ bánh truyền thống đến hiện đại - tất cả
                đều có tại đây.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-orange-600 transition-all"
              >
                Khám Phá Ngay
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=600&h=400&fit=crop&crop=center"
                alt="Beautiful wedding cake showcase"
                className="rounded-2xl shadow-lg w-full h-80 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative order-2 lg:order-1">
              <img
                src="https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=600&h=400&fit=crop&crop=center"
                alt="Cake design and decoration"
                className="rounded-2xl shadow-lg w-full h-80 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
            </div>
            <div className="order-1 lg:order-2">
              <h3 className="text-3xl font-bold text-gray-800 mb-6">
                AI Thiết Kế Thông Minh
              </h3>
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                Công cụ thiết kế bánh được hỗ trợ bởi AI, giúp bạn tạo ra những
                mẫu bánh độc đáo và ấn tượng chỉ với vài thao tác đơn giản.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                Thử Thiết Kế
                <Palette className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Cách Thức Hoạt Động
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Chỉ với vài bước đơn giản, bạn đã có thể tham gia vào cộng đồng
              CakeStory
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-pink-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                1
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Đăng Ký Tài Khoản
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Tạo tài khoản miễn phí để bắt đầu hành trình khám phá thế giới
                làm bánh
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                2
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Khám Phá & Tương Tác
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Duyệt marketplace, thiết kế bánh, tham gia thử thách và kết nối
                với cộng đồng
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-purple-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                3
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Chia Sẻ & Phát Triển
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Chia sẻ tác phẩm của bạn, nhận phản hồi và không ngừng cải thiện
                kỹ năng
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-gradient-to-r from-pink-100 to-orange-100">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Tại Sao Chọn CakeStory?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Chúng tôi mang đến trải nghiệm tốt nhất cho cộng đồng yêu thích
              làm bánh
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BadgeCheck className="w-6 h-6 text-pink-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      Chất Lượng Được Đảm Bảo
                    </h3>
                    <p className="text-gray-600">
                      Các cửa hàng tham gia đều trải qua quy trình xác minh và
                      kiểm duyệt.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Camera className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      Công Nghệ AI Tiên Tiến
                    </h3>
                    <p className="text-gray-600">
                      Hỗ trợ thiết kế bánh thông minh với công nghệ AI hiện đại
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Award className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      Cộng Đồng Năng Động
                    </h3>
                    <p className="text-gray-600">
                      Kết nối với những người đam mê làm bánh trên toàn quốc
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop&crop=center"
                alt="Happy baking community"
                className="rounded-2xl shadow-lg w-full h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-2xl"></div>
              <div className="absolute bottom-8 left-8 right-8 text-white">
                <h3 className="text-2xl font-bold mb-2">Cộng Đồng Đam Mê</h3>
                <p className="text-white/90 mb-4">
                  Hàng ngàn người yêu thích làm bánh đang chờ đón bạn
                </p>
                {!authed && (
                  <Link
                    to="/signup"
                    className="bg-white text-pink-600 px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition-all inline-block"
                  >
                    Tham Gia Ngay
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-pink-600 to-orange-600">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-5xl font-bold text-white mb-6">
            Bắt Đầu Hành Trình Của Bạn
          </h2>
          <p className="text-xl text-pink-100 mb-8 max-w-2xl mx-auto leading-relaxed">
            Tham gia cộng đồng CakeStory ngay hôm nay và khám phá thế giới làm
            bánh đầy màu sắc. Từ học hỏi, chia sẻ đến kinh doanh - tất cả đều có
            ở đây!
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            {!authed && (
              <>
                <Link
                  to="/signup"
                  className="bg-white text-pink-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
                >
                  Đăng Ký Miễn Phí
                </Link>
                <Link
                  to="/login"
                  className="border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-pink-600 transition-all shadow-lg"
                >
                  Đăng Nhập
                </Link>
              </>
            )}
            {authed && (
              <>
                <Link
                  to="/marketplace"
                  className="bg-white text-pink-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
                >
                  Khám Phá Marketplace
                </Link>
                <button
                  onClick={handleLogout}
                  className="border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-pink-600 transition-all shadow-lg"
                >
                  Đăng Xuất
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <CakeSlice className="w-8 h-8 text-pink-400" />
                <span className="text-2xl font-bold">CakeStory</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                Nền tảng kết nối cộng đồng yêu thích làm bánh, nơi bạn có thể
                khám phá, học hỏi và chia sẻ niềm đam mê làm bánh.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Tính Năng</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link
                    to="/login"
                    className="hover:text-white transition-colors"
                  >
                    Marketplace
                  </Link>
                </li>
                <li>
                  <Link
                    to="/login"
                    className="hover:text-white transition-colors"
                  >
                    Thiết Kế Bánh
                  </Link>
                </li>
                <li>
                  <Link
                    to="/login"
                    className="hover:text-white transition-colors"
                  >
                    Thử Thách
                  </Link>
                </li>
                <li>
                  <Link
                    to="/login"
                    className="hover:text-white transition-colors"
                  >
                    Cộng Đồng
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Hỗ Trợ</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link
                    to="/login"
                    className="hover:text-white transition-colors"
                  >
                    Hướng Dẫn
                  </Link>
                </li>
                <li>
                  <Link
                    to="/login"
                    className="hover:text-white transition-colors"
                  >
                    Liên Hệ
                  </Link>
                </li>
                <li>
                  <Link
                    to="/login"
                    className="hover:text-white transition-colors"
                  >
                    Điều Khoản
                  </Link>
                </li>
                <li>
                  <Link
                    to="/login"
                    className="hover:text-white transition-colors"
                  >
                    Bảo Mật
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 CakeStory. Tất cả quyền được bảo lưu.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
