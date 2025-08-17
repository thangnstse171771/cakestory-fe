import React, { useState, useEffect } from "react";
import {
  Heart,
  MessageCircle,
  Share,
  Bookmark,
  Star,
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
  Play,
  ChevronRight,
  MapPin,
  Clock,
  Eye,
  ThumbsUp,
  BadgeCheck,
} from "lucide-react";
import { Link } from "react-router-dom";

const LandingPage = () => {
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);

  // Mock data cho hero section
  const heroSlides = [
    {
      id: 1,
      title: "Tạo Nên Chiếc Bánh Hoàn Hảo",
      subtitle: "Khám phá nghệ thuật làm bánh cùng CakeStory",
      image:
        "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1200&h=800&fit=crop&crop=center",
      cta: "Bắt Đầu Ngay",
    },
    {
      id: 2,
      title: "AI Thiết Kế Bánh Thông Minh",
      subtitle: "Công nghệ AI giúp tạo ra những mẫu bánh độc đáo",
      image:
        "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=1200&h=800&fit=crop&crop=center",
      cta: "Thử AI Designer",
    },
    {
      id: 3,
      title: "Cộng Đồng Yêu Bánh",
      subtitle: "Kết nối với hàng ngàn người đam mê làm bánh",
      image:
        "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=1200&h=800&fit=crop&crop=center",
      cta: "Tham Gia Ngay",
    },
  ];

  // Mock data cho featured shops
  const featuredShops = [
    {
      id: 1,
      name: "Sweet Dreams Bakery",
      avatar:
        "https://images.unsplash.com/photo-1607631568010-a87245c0daf8?w=100&h=100&fit=crop&crop=center",
      rating: 4.9,
      reviewCount: 1247,
      speciality: "Wedding Cakes",
      location: "Hà Nội",
      verified: true,
      followers: 15420,
      cakesSold: 892,
      image:
        "https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=400&h=300&fit=crop&crop=center",
    },
    {
      id: 2,
      name: "Golden Whisk Studio",
      avatar:
        "https://images.unsplash.com/photo-1607631568010-a87245c0daf8?w=100&h=100&fit=crop&crop=center",
      rating: 4.8,
      reviewCount: 956,
      speciality: "Custom Designs",
      location: "TP.HCM",
      verified: true,
      followers: 12350,
      cakesSold: 634,
      image:
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&crop=center",
    },
    {
      id: 3,
      name: "Artisan Cakes Co",
      avatar:
        "https://images.unsplash.com/photo-1607631568010-a87245c0daf8?w=100&h=100&fit=crop&crop=center",
      rating: 4.7,
      reviewCount: 743,
      speciality: "Birthday Cakes",
      location: "Đà Nẵng",
      verified: true,
      followers: 9876,
      cakesSold: 521,
      image:
        "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&h=300&fit=crop&crop=center",
    },
  ];

  // Mock data cho trending posts
  const trendingPosts = [
    {
      id: 1,
      user: {
        name: "Chef Minh Anh",
        avatar:
          "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=center",
        verified: true,
        title: "Master Baker",
      },
      content:
        "Vừa hoàn thành chiếc bánh cưới 3 tầng với chủ đề hoa hồng vintage. Mất 12 tiếng để hoàn thiện từng chi tiết! 🌹✨",
      image:
        "https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=600&h=400&fit=crop&crop=center",
      likes: 2340,
      comments: 186,
      shares: 92,
      timeAgo: "2 giờ trước",
      tags: ["wedding", "vintage", "roses"],
      isVideo: false,
    },
    {
      id: 2,
      user: {
        name: "Pastry Queen",
        avatar:
          "https://images.unsplash.com/photo-1494790108755-2616c0763552?w=100&h=100&fit=crop&crop=center",
        verified: true,
        title: "Professional Baker",
      },
      content:
        "Tutorial làm bánh red velvet siêu mềm! Bí quyết nằm ở việc cân bằng độ pH và nhiệt độ nướng. Ai muốn công thức không? 🔥",
      image:
        "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=600&h=400&fit=crop&crop=center",
      likes: 1876,
      comments: 234,
      shares: 156,
      timeAgo: "4 giờ trước",
      tags: ["tutorial", "redvelvet", "baking"],
      isVideo: true,
    },
    {
      id: 3,
      user: {
        name: "Cake Artist Luna",
        avatar:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=center",
        verified: false,
        title: "Home Baker",
      },
      content:
        "Thử nghiệm téchnique mới với fondant gradient. Hiệu ứng ombre này mất 3 tiếng để hoàn thành nhưng kết quả thật tuyệt vời! 🎨",
      image:
        "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=600&h=400&fit=crop&crop=center",
      likes: 1234,
      comments: 98,
      shares: 67,
      timeAgo: "6 giờ trước",
      tags: ["fondant", "gradient", "technique"],
      isVideo: false,
    },
  ];

  // Mock data cho challenges
  const activeChallenge = {
    id: 1,
    title: "Halloween Spooky Cakes 2024",
    description: "Tạo ra những chiếc bánh Halloween độc đáo và đáng sợ nhất!",
    prize: "10,000,000 VNĐ",
    participants: 234,
    deadline: "31/10/2024",
    image:
      "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=600&h=400&fit=crop&crop=center",
    timeLeft: "15 ngày",
  };

  // Mock data cho marketplace highlights
  const marketplaceHighlights = [
    {
      id: 1,
      name: "Bánh Sinh Nhật Unicorn",
      price: "450000",
      originalPrice: "550000",
      shop: "Magic Cakes",
      rating: 4.9,
      sold: 47,
      image:
        "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop&crop=center",
      isHot: true,
    },
    {
      id: 2,
      name: "Wedding Cake Elegant",
      price: "120000",
      originalPrice: "1400000",
      shop: "Royal Bakery",
      rating: 4.8,
      sold: 23,
      image:
        "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=400&h=300&fit=crop&crop=center",
      isNew: true,
    },
    {
      id: 3,
      name: "Chocolate Truffle Deluxe",
      price: "320000",
      originalPrice: "380000",
      shop: "Choco Heaven",
      rating: 4.7,
      sold: 89,
      image:
        "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop&crop=center",
      isHot: true,
    },
  ];

  // Auto change hero slides
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-orange-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/landing" className="flex items-center gap-2">
              <CakeSlice className="w-8 h-8 text-pink-500" />
              <span className="text-2xl font-bold text-gray-800">
                CakeStory
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link
                to="/login"
                className="text-gray-600 hover:text-pink-600 font-medium transition-colors"
              >
                Khu Mua Sắm
              </Link>
              <Link
                to="/login"
                className="text-gray-600 hover:text-pink-600 font-medium transition-colors"
              >
                Thử Thách
              </Link>
              <Link
                to="/login"
                className="text-gray-600 hover:text-pink-600 font-medium transition-colors"
              >
                Thiết Kế
              </Link>
              <Link
                to="/login"
                className="text-gray-600 hover:text-pink-600 font-medium transition-colors"
              >
                Sự Kiện
              </Link>
            </div>

            <div className="flex items-center gap-4">
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
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen overflow-hidden pt-20">
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent z-10"></div>
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentHeroSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
          </div>
        ))}

        <div className="relative z-20 h-full flex items-center container mx-auto px-6">
          <div className="max-w-2xl text-white">
            <h1 className="text-6xl font-bold mb-6 leading-tight">
              {heroSlides[currentHeroSlide].title}
            </h1>
            <p className="text-xl mb-8 text-gray-200">
              {heroSlides[currentHeroSlide].subtitle}
            </p>
            <div className="flex gap-4">
              <Link
                to="/login"
                className="bg-gradient-to-r from-pink-500 to-orange-500 text-white px-8 py-4 rounded-full font-semibold hover:from-pink-600 hover:to-orange-600 transition-all transform hover:scale-105"
              >
                {heroSlides[currentHeroSlide].cta}
              </Link>
              <Link
                to="/login"
                className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-pink-600 transition-all"
              >
                Khám Phá Ngay
              </Link>
            </div>
          </div>
        </div>

        {/* Hero Navigation Dots */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex gap-3">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentHeroSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentHeroSlide ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="p-6">
              <div className="text-4xl font-bold text-pink-600 mb-2">
                25,000+
              </div>
              <div className="text-gray-600">Thành viên</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-orange-600 mb-2">
                1,200+
              </div>
              <div className="text-gray-600">Cửa hàng</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-purple-600 mb-2">
                50,000+
              </div>
              <div className="text-gray-600">Bánh đã bán</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-green-600 mb-2">
                4.9/5
              </div>
              <div className="text-gray-600">Đánh giá</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Shops Section */}
      <section className="py-16 bg-gradient-to-r from-pink-100 to-orange-100">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Cửa Hàng Nổi Bật
            </h2>
            <p className="text-xl text-gray-600">
              Khám phá những cửa hàng bánh uy tín và chất lượng nhất
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredShops.map((shop) => (
              <div
                key={shop.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group"
              >
                <div className="relative">
                  <img
                    src={shop.image}
                    alt={shop.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {shop.verified && (
                    <div className="absolute top-4 right-4 bg-blue-500 text-white p-2 rounded-full">
                      <BadgeCheck size={16} />
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={shop.avatar}
                      alt={shop.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <h3 className="font-bold text-lg">{shop.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin size={14} />
                        {shop.location}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{shop.rating}</span>
                      <span className="text-gray-500">
                        ({shop.reviewCount})
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <strong>{shop.cakesSold}</strong> bánh đã bán
                    </div>
                  </div>

                  <div className="text-center mb-4">
                    <div className="text-pink-600 font-semibold">
                      {shop.speciality}
                    </div>
                    <div className="text-sm text-gray-500">
                      {shop.followers.toLocaleString()} người theo dõi
                    </div>
                  </div>

                  <Link
                    to="/login"
                    className="block w-full bg-gradient-to-r from-pink-500 to-orange-500 text-white text-center py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-orange-600 transition-all"
                  >
                    Xem Cửa Hàng
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Posts Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Bài Viết Thịnh Hành
            </h2>
            <p className="text-xl text-gray-600">
              Cập nhật những xu hướng mới nhất trong làm bánh
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {trendingPosts.map((post) => (
              <div
                key={post.id}
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Post Header */}
                <div className="p-4 flex items-center gap-3">
                  <img
                    src={post.user.avatar}
                    alt={post.user.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{post.user.name}</h4>
                      {post.user.verified && (
                        <BadgeCheck className="w-4 h-4 text-blue-500" />
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {post.user.title}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">{post.timeAgo}</div>
                </div>

                {/* Post Content */}
                <div className="px-4 pb-3">
                  <p className="text-gray-800 leading-relaxed">
                    {post.content}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-pink-100 text-pink-600 px-2 py-1 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Post Image/Video */}
                <div className="relative">
                  <img
                    src={post.image}
                    alt="Post content"
                    className="w-full h-64 object-cover"
                  />
                  {post.isVideo && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <Play className="w-12 h-12 text-white" />
                    </div>
                  )}
                </div>

                {/* Post Actions */}
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Heart className="w-5 h-5" />
                      <span>{post.likes.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MessageCircle className="w-5 h-5" />
                      <span>{post.comments}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Share className="w-5 h-5" />
                      <span>{post.shares}</span>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <Bookmark className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-orange-500 text-white px-8 py-3 rounded-full font-semibold hover:from-pink-600 hover:to-orange-600 transition-all"
            >
              Xem Thêm Bài Viết
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Challenge Section */}
      <section className="py-16 bg-gradient-to-r from-purple-100 to-pink-100">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Thử Thách Đang Diễn Ra
            </h2>
            <p className="text-xl text-gray-600">
              Tham gia thử thách và giành những phần thưởng hấp dẫn
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/2">
                  <img
                    src={activeChallenge.image}
                    alt={activeChallenge.title}
                    className="w-full h-64 md:h-full object-cover"
                  />
                </div>
                <div className="md:w-1/2 p-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Crown className="w-6 h-6 text-yellow-500" />
                    <span className="text-yellow-600 font-semibold">
                      CHALLENGE
                    </span>
                  </div>

                  <h3 className="text-3xl font-bold text-gray-800 mb-4">
                    {activeChallenge.title}
                  </h3>

                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {activeChallenge.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {activeChallenge.prize}
                      </div>
                      <div className="text-sm text-gray-500">Giải thưởng</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {activeChallenge.participants}
                      </div>
                      <div className="text-sm text-gray-500">
                        Người tham gia
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2 text-orange-600">
                      <Clock className="w-4 h-4" />
                      <span className="font-semibold">
                        Còn {activeChallenge.timeLeft}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      Deadline: {activeChallenge.deadline}
                    </div>
                  </div>

                  <Link
                    to="/login"
                    className="block w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-center py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
                  >
                    Tham Gia Ngay
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marketplace Highlights */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Sản Phẩm Nổi Bật
            </h2>
            <p className="text-xl text-gray-600">
              Những chiếc bánh được yêu thích nhất trên marketplace
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {marketplaceHighlights.map((product) => (
              <div
                key={product.id}
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow group"
              >
                <div className="relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.isHot && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                      HOT
                    </div>
                  )}
                  {product.isNew && (
                    <div className="absolute top-3 left-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                      NEW
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm rounded-full p-2">
                    <Heart className="w-4 h-4 text-gray-600" />
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                  <div className="text-sm text-gray-600 mb-3">
                    {product.shop}
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-semibold">
                        {product.rating}
                      </span>
                    </div>
                    <span className="text-gray-300">•</span>
                    <span className="text-sm text-gray-600">
                      Đã bán {product.sold}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-xl font-bold text-pink-600">
                        {parseInt(product.price).toLocaleString()}đ
                      </div>
                      <div className="text-sm text-gray-400 line-through">
                        {parseInt(product.originalPrice).toLocaleString()}đ
                      </div>
                    </div>
                    <div className="text-sm text-green-600 font-semibold">
                      -
                      {Math.round(
                        (1 -
                          parseInt(product.price) /
                            parseInt(product.originalPrice)) *
                          100
                      )}
                      %
                    </div>
                  </div>

                  <Link
                    to="/login"
                    className="block w-full bg-gradient-to-r from-pink-500 to-orange-500 text-white text-center py-2 rounded-lg font-semibold hover:from-pink-600 hover:to-orange-600 transition-all"
                  >
                    Xem Chi Tiết
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-orange-500 text-white px-8 py-3 rounded-full font-semibold hover:from-pink-600 hover:to-orange-600 transition-all"
            >
              Khám Phá Marketplace
              <ShoppingCart className="w-4 h-4" />
            </Link>
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
          <div className="flex justify-center gap-6">
            <Link
              to="/login"
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
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <CakeSlice className="w-6 h-6 text-pink-400" />
            <span className="text-xl font-bold">CakeStory</span>
          </div>
          <p className="text-gray-400 mb-4">
            Nền tảng kết nối cộng đồng yêu thích làm bánh
          </p>
          <div className="text-sm text-gray-500">
            © 2024 CakeStory. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
