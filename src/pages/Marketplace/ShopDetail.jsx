import React, { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { useParams } from "react-router-dom";
import { fetchShopByUserId } from "../../api/axios";

const mockShop = {
  id: 1,
  avatar:
    "https://scientificallysweet.com/wp-content/uploads/2020/09/IMG_4117-feature.jpg",
  name: "Sweet Delights Bakery",
  tagline: "Crafting memorable moments with delicious cakes",
  rating: 4.9,
  reviews: 500,
  since: 2018,
  location: "123 Bakery Street, Sweet City, SC 12345",
  businessHours: ["Mon-Sat: 9:00 AM - 7:00 PM", "Sun: 10:00 AM - 4:00 PM"],
  delivery: [
    "Available within 30 miles radius",
    "Free delivery on orders above $200",
  ],
  gallery: [
    {
      title: "Elegant Wedding Cake",
      img: "https://via.placeholder.com/600x400?text=600x400",
    },
    {
      title: "Birthday Celebration",
      img: "https://via.placeholder.com/600x400?text=600x400",
    },
    {
      title: "Chocolate Dream",
      img: "https://via.placeholder.com/600x400?text=600x400",
    },
    {
      title: "Floral Design",
      img: "https://via.placeholder.com/600x400?text=600x400",
    },
    {
      title: "Summer Berry",
      img: "https://via.placeholder.com/600x400?text=600x400",
    },
    {
      title: "Classic Vanilla",
      img: "https://via.placeholder.com/600x400?text=600x400",
    },
  ],
  services: [
    {
      title: "Wedding Cakes",
      desc: "Elegant custom wedding cakes for your special day",
      price: "$299-999",
      img: "https://via.placeholder.com/400x300?text=400x300",
    },
    {
      title: "Birthday Cakes",
      desc: "Personalized birthday cakes for all ages",
      price: "$89-299",
      img: "https://via.placeholder.com/400x300?text=400x300",
    },
  ],
};

const ShopDetail = () => {
  const { id } = useParams();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await fetchShopByUserId(id);
        // Map API về format UI cũ, phần nào chưa có thì dùng mock
        setShop({
          id: data.shop.shop_id,
          avatar: data.shop.image_url || mockShop.avatar,
          name: data.shop.business_name,
          tagline: mockShop.tagline,
          rating: 4.9,
          reviews: 500,
          since: 2018,
          location: data.shop.business_address,
          businessHours: mockShop.businessHours,
          delivery: mockShop.delivery,
          gallery: mockShop.gallery,
          services: mockShop.services,
        });
      } catch (err) {
        setShop(mockShop);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading || !shop) return <div>Loading...</div>;

  return (
    <div>
      {/* Header */}
      <div className="bg-pink-100 rounded-xl p-6 flex flex-col gap-4 mb-6">
        <div className="flex items-center gap-6">
          <img
            src={shop.avatar}
            alt="avatar"
            className="w-[80px] h-[80px] md:w-32 md:h-32 rounded-full object-cover border-4 border-white shadow"
          />
          <div className="flex-1 text-left">
            <h2 className="text-xl md:text-3xl font-bold mb-1">{shop.name}</h2>
            <div className="text-sm md:text-base text-gray-600 mb-2">
              {shop.tagline}
            </div>
            <div className="flex flex-col sm:flex-row gap-2 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="font-semibold text-gray-700 mr-1">
                  {shop.rating}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">·</span>
                <span>{shop.reviews}+ Orders</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">·</span>
                <span>Since {shop.since}</span>
              </div>
            </div>
          </div>
          {/* <button className="bg-red-500 text-white px-6 py-2 rounded-lg font-semibold">
            Dashboard
          </button> */}
        </div>
        <div className="flex flex-col md:flex-row gap-4 mt-2">
          <div className="bg-white rounded-lg shadow p-4 flex-1 min-w-[220px]">
            <div className="text-sm font-semibold mb-1">Location</div>
            <div className="text-gray-700 text-sm">{shop.location}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 flex-1 min-w-[220px]">
            <div className="text-sm font-semibold mb-1">Business Hours</div>
            <div className="text-gray-700 text-sm whitespace-pre-line">
              {shop.businessHours.join("\n")}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 flex-1 min-w-[220px]">
            <div className="text-sm font-semibold mb-1">Delivery Area</div>
            <div className="text-gray-700 text-sm whitespace-pre-line">
              {shop.delivery.join("\n")}
            </div>
          </div>
        </div>
      </div>

      {/* Gallery */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-xl">Our Cake Gallery</h3>
          <button className="bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-6 h-8 rounded-md shadow-sm transition">
            Show all
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {shop.gallery.map((item, idx) => (
            <div
              key={idx}
              className="bg-gray-200 rounded-lg h-40 flex items-center justify-center relative overflow-hidden"
            >
              <img
                src={item.img}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover opacity-60"
              />
              <span className="relative z-10 text-white font-semibold text-center text-shadow-lg">
                {item.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Services */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-xl">Our Services</h3>
          <button className="bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-6 h-8 rounded-md shadow-sm transition">
            Show all
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {shop.services.map((service, idx) => (
            <div
              key={idx}
              className="bg-gray-100 rounded-lg overflow-hidden flex flex-col"
            >
              <div className="bg-gray-200 flex-1 flex items-center justify-center min-h-[180px]">
                <img
                  src={service.img}
                  alt={service.title}
                  className="object-cover w-full h-full opacity-60"
                />
              </div>
              <div className="p-4 flex flex-col flex-1">
                <div className="font-semibold mb-1">{service.title}</div>
                <div className="text-sm text-gray-500 mb-2">{service.desc}</div>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-pink-600 font-bold">
                    {service.price}
                  </span>
                  <button className="bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-4 py-1.5 rounded-lg text-sm">
                    Inquire Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShopDetail;
