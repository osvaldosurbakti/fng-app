import { useState } from "react";
import { OrderItem } from "./types";
import { getMenuByCategory } from "@/data/menuData";

interface MenuSelectorProps {
  onAddItem: (item: Omit<OrderItem, "id">) => void;
}

export default function MenuSelector({ onAddItem }: MenuSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<"makanan" | "minuman">("makanan");
  const [selectedMenu, setSelectedMenu] = useState("");
  const [temperature, setTemperature] = useState<"panas" | "dingin">("panas");
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");

  const availableMenus = getMenuByCategory(selectedCategory);

  function handleAddToOrder() {
    if (!selectedMenu) return;

    const menuItem = availableMenus.find(item => item.name === selectedMenu);
    if (!menuItem) return;

    const newItem: Omit<OrderItem, "id"> = {
      category: selectedCategory,
      menu: selectedMenu,
      quantity,
      price: menuItem.price,
      notes: notes || undefined,
    };

    // Tambahkan temperature untuk minuman
    if (selectedCategory === "minuman") {
      newItem.temperature = temperature;
    }

    onAddItem(newItem);
    
    // Reset form untuk item berikutnya
    setSelectedMenu("");
    setQuantity(1);
    setNotes("");
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
        <span className="p-2 bg-green-100 rounded-lg">🍽️</span>
        Pilih Menu
      </h3>

      {/* Quick Category Selection */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => {
            setSelectedCategory("makanan");
            setSelectedMenu("");
          }}
          className={`flex-1 p-4 rounded-lg border-2 transition-all ${
            selectedCategory === "makanan"
              ? "border-green-500 bg-green-50"
              : "border-gray-200 hover:border-green-200"
          }`}
        >
          <div className="text-2xl mb-2">🍱</div>
          <div className="font-medium">Makanan</div>
        </button>
        <button
          onClick={() => {
            setSelectedCategory("minuman");
            setSelectedMenu("");
          }}
          className={`flex-1 p-4 rounded-lg border-2 transition-all ${
            selectedCategory === "minuman"
              ? "border-blue-500 bg-blue-50"
              : "border-gray-200 hover:border-blue-200"
          }`}
        >
          <div className="text-2xl mb-2">🥤</div>
          <div className="font-medium">Minuman</div>
        </button>
      </div>

      <div className="space-y-4">
        {/* Menu Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Menu {selectedCategory}
            </label>
            <select
              value={selectedMenu}
              onChange={(e) => setSelectedMenu(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">Pilih menu...</option>
              {availableMenus.map((item) => (
                <option key={item.name} value={item.name}>
                  {item.name} - Rp {item.price.toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          {/* Temperature Selection for Drinks */}
          {selectedCategory === "minuman" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Suhu
              </label>
              <div className="flex gap-2">
                {["panas", "dingin"].map((temp) => (
                  <button
                    key={temp}
                    type="button"
                    onClick={() => setTemperature(temp as "panas" | "dingin")}
                    className={`flex-1 py-3 px-4 rounded-lg border ${
                      temperature === temp
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-300 hover:border-blue-300"
                    } transition-all`}
                  >
                    {temp === "panas" ? "🔥 Panas" : "❄️ Dingin"}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quantity and Notes */}
        {selectedMenu && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jumlah
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-20 text-center rounded-lg border border-gray-300 px-2 py-2"
                />
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catatan
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2"
                placeholder="Tambahan/pengurangan..."
              />
            </div>
          </div>
        )}

        {/* Add to Order Button */}
        <button
          type="button"
          onClick={handleAddToOrder}
          disabled={!selectedMenu}
          className="w-full mt-4 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center gap-2"
        >
          <span className="text-xl">+</span>
          Tambah ke Pesanan
        </button>
      </div>
    </div>
  );
}