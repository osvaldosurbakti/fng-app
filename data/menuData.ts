export const menuItems = [
  // Minuman - Rp6,000.00
  { name: "Tora Bika Cappuccino", price: 6000, category: "minuman" },
  { name: "Milo", price: 6000, category: "minuman" },
  { name: "Good Day Cappuccino", price: 6000, category: "minuman" },
  { name: "ABC Iced Klepon", price: 6000, category: "minuman" },
  { name: "Max Tea Tarik", price: 6000, category: "minuman" },
  { name: "Good Day Freeze", price: 6000, category: "minuman" },
  
  // Minuman - Rp5,000.00
  { name: "Energen Jahe", price: 5000, category: "minuman" },
  { name: "Kopi Susu ABC", price: 5000, category: "minuman" },
  { name: "Luwak White Koffie", price: 5000, category: "minuman" },
  { name: "Tora Bika Susu", price: 5000, category: "minuman" },
  { name: "Good Day Latte", price: 5000, category: "minuman" },
  { name: "Kapal Api Special Mix", price: 5000, category: "minuman" },
  { name: "Tora Bika Moka", price: 5000, category: "minuman" },
  { name: "Energen Coklat", price: 5000, category: "minuman" },
  
  // Makanan - Rp7,000.00
  { name: "Mie Instant (All varian)", price: 7000, category: "makanan" },
  
  // Makanan - Rp6,000.00
  { name: "Dumpling Keju (3 pcs)", price: 6000, category: "makanan" },
  { name: "Dumpling Ayam (3 pcs)", price: 6000, category: "makanan" },
  
  // Makanan - Rp5,000.00
  { name: "Sosis Besar Jumbo (1 pcs)", price: 5000, category: "makanan" },
  { name: "Nugget Double (2 pcs)", price: 5000, category: "makanan" },
  { name: "Cikuwa + Jamur (3 pcs)", price: 5000, category: "makanan" },
  
  // Makanan - Rp3,000.00
  { name: "Odeng Double (2 pcs)", price: 3000, category: "makanan" },
  { name: "Tofu Special (3 pcs)", price: 3000, category: "makanan" },
  { name: "Bakso Bakar (3 pcs)", price: 3000, category: "makanan" },
  { name: "Tempura (3 pcs)", price: 3000, category: "makanan" },
  { name: "Sosis Merah (1 pcs)", price: 3000, category: "makanan" },
];

export const getMenuByCategory = (category: "makanan" | "minuman") => {
  return menuItems.filter(item => item.category === category);
};