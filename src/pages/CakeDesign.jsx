"use client";

import { useState } from "react";
import { Download, RotateCcw } from "lucide-react";

import { useNavigate } from "react-router-dom";

const CakeDesign = () => {
  const [selectedShape, setSelectedShape] = useState("Round");
  const [numberOfTiers, setNumberOfTiers] = useState(3);
  const [diameter, setDiameter] = useState(25);
  const [height, setHeight] = useState(15);
  const [width, setWidth] = useState(20);
  const [selectedFlavors, setSelectedFlavors] = useState(["Vanilla"]);
  const navigate = useNavigate();

  const shapes = ["Round", "Square", "Rect", "Heart"];
  const flavors = ["Vanilla", "Chocolate", "Lemon", "Red Velvet"];
  const designOptions = ["Frosting", "Toppings", "Decor"];

  const toggleFlavor = (flavor) => {
    setSelectedFlavors((prev) =>
      prev.includes(flavor)
        ? prev.filter((f) => f !== flavor)
        : [...prev, flavor]
    );
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-pink-600">Cake Design</h1>
        <div className="flex items-center gap-3">
          <button
            className="px-4 py-2 bg-gradient-to-r from-pink-400 to-purple-400 text-white rounded-lg font-semibold shadow hover:from-pink-500 hover:to-purple-500 transition-all duration-200"
            onClick={() => navigate('/ai-generated-images')}
          >
            AI Generation
          </button>
          <div className="text-sm text-gray-500">Cake design V.2</div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Design Canvas */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <RotateCcw className="w-4 h-4" />
              </button>
              <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Download className="w-4 h-4" />
              </button>
              <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option>All Fragment</option>
              </select>
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                Export
              </button>
              <button className="px-4 py-2 bg-pink-500 text-white rounded-lg text-sm hover:bg-pink-600">
                Save
              </button>
            </div>
          </div>

          {/* Cake Preview */}
          <div className="flex justify-center items-center h-96 bg-gray-50 rounded-lg">
            <div className="relative">
              {/* Multi-tier cake visualization */}
              {Array.from({ length: numberOfTiers }).map((_, index) => {
                const tierSize = 120 - index * 20;
                return (
                  <div
                    key={index}
                    className={`mx-auto bg-gradient-to-b from-pink-200 to-pink-300 border-4 border-pink-400 ${
                      selectedShape === "Round"
                        ? "rounded-full"
                        : selectedShape === "Square"
                        ? "rounded-lg"
                        : selectedShape === "Heart"
                        ? "rounded-t-full"
                        : "rounded-md"
                    }`}
                    style={{
                      width: `${tierSize}px`,
                      height: `${height * 2}px`,
                      marginBottom: index < numberOfTiers - 1 ? "4px" : "0",
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Design Controls */}
        <div className="w-80 space-y-6">
          {/* Design Options */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex space-x-2 mb-4">
              {designOptions.map((option) => (
                <button
                  key={option}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    option === "Frosting"
                      ? "bg-pink-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Cake Shape */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="font-semibold text-gray-800 mb-4">Cake Shape</h3>
            <div className="grid grid-cols-2 gap-2">
              {shapes.map((shape) => (
                <button
                  key={shape}
                  onClick={() => setSelectedShape(shape)}
                  className={`p-3 rounded-lg border text-sm font-medium ${
                    selectedShape === shape
                      ? "bg-pink-500 text-white border-pink-500"
                      : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {shape}
                </button>
              ))}
            </div>
          </div>

          {/* Number of Tiers */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="font-semibold text-gray-800 mb-4">
              Number of Tiers
            </h3>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="1"
                max="5"
                value={numberOfTiers}
                onChange={(e) =>
                  setNumberOfTiers(Number.parseInt(e.target.value))
                }
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm font-medium text-gray-600">
                {numberOfTiers}
              </span>
            </div>
          </div>

          {/* Size Controls */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="font-semibold text-gray-800 mb-4">Size</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-600">
                    Diameter
                  </label>
                  <span className="text-sm text-gray-500">{diameter} Cm</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="50"
                  value={diameter}
                  onChange={(e) => setDiameter(Number.parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-600">
                    Height
                  </label>
                  <span className="text-sm text-gray-500">{height} Cm</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  value={height}
                  onChange={(e) => setHeight(Number.parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-600">
                    Width
                  </label>
                  <span className="text-sm text-gray-500">{width} Cm</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="40"
                  value={width}
                  onChange={(e) => setWidth(Number.parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Cake Flavors */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="font-semibold text-gray-800 mb-4">Cake Flavors</h3>
            <div className="flex flex-wrap gap-2">
              {flavors.map((flavor) => (
                <button
                  key={flavor}
                  onClick={() => toggleFlavor(flavor)}
                  className={`px-3 py-2 rounded-full text-sm font-medium ${
                    selectedFlavors.includes(flavor)
                      ? flavor === "Vanilla"
                        ? "bg-yellow-100 text-yellow-800"
                        : flavor === "Chocolate"
                        ? "bg-amber-100 text-amber-800"
                        : flavor === "Lemon"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {flavor}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-gray-500">
        © 2025 CakeStory. All rights reserved.
      </div>

    </div>
  );
};

export default CakeDesign;
