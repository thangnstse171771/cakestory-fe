import { useState } from "react";
import CustomizeModal from "../pages/Cart/CustomizedOrderForm";

// Example of how to use CustomizeModal with API data
export default function CustomizeModalExample() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Example API response data
  const apiResponse = {
    message: "Marketplace post retrieved",
    post: {
      post_id: 40,
      post: {
        id: 40,
        title: "Bánh tiramisu matcha",
        description:
          "Kem matcha trà xanh siêu tơi xốp, đan xen là lớp phủ cốt bánh hạnh nhân siêu ngon",
        media: [
          {
            image_url:
              "https://firebasestorage.googleapis.com/v0/b/reactchat-be688.firebasestorage.app/o/marketplace_media%2F1754732792494-Banh-Kem-Tra-Xanh-2.jpg?alt=media&token=a796a8d0-3c45-461b-8304-16fdc6b48b91",
          },
        ],
      },
      shop: {
        business_name: "Memory Cake Shop",
      },
      cakeSizes: [
        {
          id: 14,
          marketplace_post_id: 40,
          size: "25cm",
          price: "240000.00",
        },
        {
          id: 15,
          marketplace_post_id: 40,
          size: "30cm",
          price: "300000.00",
        },
      ],
    },
  };

  // Transform API data to component props
  const product = {
    id: apiResponse.post.post.id,
    name: apiResponse.post.post.title,
    description: apiResponse.post.post.description,
    image: apiResponse.post.post.media[0]?.image_url,
    seller: apiResponse.post.shop.business_name,
  };

  const sizeOptions = apiResponse.post.cakeSizes.map((size) => ({
    id: size.id,
    size: size.size,
    price: size.price,
  }));

  const handleConfirm = (customizedProduct) => {
    console.log("Customized product:", customizedProduct);
    // Handle adding to cart or further processing
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">CustomizeModal Example</h1>

      <button
        onClick={() => setIsModalOpen(true)}
        className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
      >
        Open Customize Modal
      </button>

      <CustomizeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={product}
        sizeOptions={sizeOptions}
        onConfirm={handleConfirm}
      />

      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-lg font-bold mb-2">API Data Preview:</h2>
        <pre className="text-sm overflow-auto">
          {JSON.stringify({ product, sizeOptions }, null, 2)}
        </pre>
      </div>
    </div>
  );
}
