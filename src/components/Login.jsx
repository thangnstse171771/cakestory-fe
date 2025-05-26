"use client";

import { useState } from "react";
import { Cake, Eye, EyeOff, User, Users, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mock login - in real app, validate credentials here
    if (email && password) {
      onLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-200 to-pink-300 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-6xl w-full">
        <div className="flex flex-col lg:flex-row">
          {/* Left Side - Branding */}
          <div className="lg:w-1/2 bg-gradient-to-br from-pink-300 to-pink-400 p-12 text-white">
            <div className="h-full flex flex-col justify-center">
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-white mb-4">
                  CakeStory
                </h1>
                <p className="text-pink-100 text-lg">
                  Where Every Slice Tells a Story
                </p>
              </div>

              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="bg-white/20 p-3 rounded-full">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">
                      Personalized Experience
                    </h3>
                    <p className="text-pink-100">
                      Customize your cake preferences and discover recipes
                      tailored to your taste.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-white/20 p-3 rounded-full">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">
                      Community Sharing
                    </h3>
                    <p className="text-pink-100">
                      Connect with fellow bakers and share your delicious
                      creations.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-white/20 p-3 rounded-full">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">
                      Baking Tutorials
                    </h3>
                    <p className="text-pink-100">
                      Access premium step-by-step tutorials from professional
                      bakers.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="lg:w-1/2 p-12">
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8">
                <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Cake className="w-8 h-8 text-pink-500" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  Welcome Back
                </h2>
                <p className="text-gray-600">
                  Sign in to continue to CakeStory
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email or Username
                  </label>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email or username"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all pr-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-pink-500 border-gray-300 rounded focus:ring-pink-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      Remember me
                    </span>
                  </label>
                  <a
                    href="#"
                    className="text-sm text-pink-500 hover:text-pink-600"
                  >
                    Forgot Password?
                  </a>
                </div>

                <button
                  type="submit"
                  className="w-full bg-pink-500 text-white py-3 rounded-lg font-semibold hover:bg-pink-600 transition-colors"
                >
                  Sign In
                </button>

                <div className="text-center">
                  <p className="text-gray-500 text-sm mb-4">or continue with</p>
                  <div className="flex justify-center space-x-4">
                    <button
                      type="button"
                      className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
                    >
                      G
                    </button>
                    <button
                      type="button"
                      className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                    >
                      f
                    </button>
                    <button
                      type="button"
                      className="w-12 h-12 bg-blue-400 text-white rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors"
                    >
                      t
                    </button>
                    <button
                      type="button"
                      className="w-12 h-12 bg-gray-800 text-white rounded-full flex items-center justify-center hover:bg-gray-900 transition-colors"
                    >
                      G
                    </button>
                  </div>
                </div>

                <p className="text-center text-sm text-gray-600">
                  Don't have an account?{" "}
                  <Link
                    to="/signup"
                    className="text-pink-500 hover:text-pink-600 font-medium"
                  >
                    Sign Up
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
