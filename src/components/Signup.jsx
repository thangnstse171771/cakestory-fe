"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
import { Cake, Eye, EyeOff, User, Users, BookOpen, Check } from "lucide-react";

const Signup = ({ onSignup }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!agreeTerms) {
      newErrors.terms = "You must agree to the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Mock signup - in real app, send data to backend
      onSignup();
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

          {/* Right Side - Signup Form */}
          <div className="lg:w-1/2 p-12">
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8">
                <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Cake className="w-8 h-8 text-pink-500" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  Join CakeStory
                </h2>
                <p className="text-gray-600">
                  Create your account to start your baking journey
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all ${
                      errors.fullName ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.fullName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.fullName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email address"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Create a password"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all pr-12 ${
                        errors.password ? "border-red-500" : "border-gray-300"
                      }`}
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
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm your password"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all pr-12 ${
                        errors.confirmPassword
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                <div>
                  <label className="flex items-start space-x-3">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="sr-only"
                      />
                      <div
                        className={`w-5 h-5 border-2 rounded flex items-center justify-center cursor-pointer transition-all ${
                          agreeTerms
                            ? "bg-pink-500 border-pink-500"
                            : errors.terms
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        onClick={() => setAgreeTerms(!agreeTerms)}
                      >
                        {agreeTerms && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                    <span className="text-sm text-gray-600 leading-5">
                      I agree to the{" "}
                      <a href="#" className="text-pink-500 hover:text-pink-600">
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a href="#" className="text-pink-500 hover:text-pink-600">
                        Privacy Policy
                      </a>
                    </span>
                  </label>
                  {errors.terms && (
                    <p className="text-red-500 text-xs mt-1">{errors.terms}</p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-pink-500 text-white py-3 rounded-lg font-semibold hover:bg-pink-600 transition-colors"
                >
                  Create Account
                </button>

                <div className="text-center">
                  <p className="text-gray-500 text-sm mb-4">or sign up with</p>
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
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-pink-500 hover:text-pink-600 font-medium"
                  >
                    Sign In
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

export default Signup;
