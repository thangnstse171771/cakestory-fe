import { MoreHorizontal, Image } from "lucide-react";

const ChatArea = () => {
  return (
    <div className="flex-1 bg-white rounded-r-xl shadow-sm border-t border-r border-b border-gray-100 flex flex-col">
      <div className="p-4  border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img
            src="https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg"
            alt="Sarah Baker"
            className="w-10 h-10 rounded-full"
          />
          <div>
            <h3 className="font-semibold text-gray-800">Sarah Baker</h3>
            <span className="text-sm text-green-500">Online</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <img
              src="https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg"
              alt="Sarah Baker"
              className="w-10 h-10 rounded-full"
            />
            <div className="flex flex-col gap-2">
              <img
                src="https://assets.epicurious.com/photos/65ca8c02e09b10a92f8e7775/4:3/w_5132,h_3849,c_limit/Swiss-Meringue-Buttercream_RECIPE.jpg"
                alt="Sent media"
                className="rounded-md max-w-[350px] object-cover"
              />
              <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                <p className="text-sm text-gray-800">
                  Hi! I loved your chocolate cake recipe. Could you share more
                  details about the frosting?
                </p>
                <span className="text-xs text-gray-500 mt-1 block">
                  10:30 AM
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 mb-3">
            <img
              src="https://assets.epicurious.com/photos/65ca8c02e09b10a92f8e7775/4:3/w_5132,h_3849,c_limit/Swiss-Meringue-Buttercream_RECIPE.jpg"
              alt="Sent media"
              className="rounded-md max-w-[350px] object-cover"
            />

            <div className="bg-pink-500 text-white rounded-lg p-3 max-w-xs">
              <p className="text-sm">
                Of course! I use a Swiss meringue buttercream. The key is to
                whip the egg whites to soft peaks first.
              </p>
              <span className="text-xs text-pink-100 mt-1 block text-right">
                10:32 AM
              </span>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <img
              src="https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg"
              alt="Sarah Baker"
              className="w-10 h-10 rounded-full"
            />
            <div className="flex flex-col gap-2">
              {/* <img
                src="https://assets.epicurious.com/photos/65ca8c02e09b10a92f8e7775/4:3/w_5132,h_3849,c_limit/Swiss-Meringue-Buttercream_RECIPE.jpg"
                alt="Sent media"
                className="rounded-md max-w-[350px] object-cover"
              /> */}
              <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                <p className="text-sm text-gray-800">
                  Thanks for the cake recipe!
                </p>
                <span className="text-xs text-gray-500 mt-1 block">
                  10:35 AM
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
          <button className="p-2 text-pink-500 hover:text-pink-600 rounded-lg">
            <Image className="w-8 h-8" />
          </button>
          <button className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors">
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
