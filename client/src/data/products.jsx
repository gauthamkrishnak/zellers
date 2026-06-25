import iphone from "../assets/iphone 13.jpg";
import bike from "../assets/mountainbike.jpg";
import chair from "../assets/chair.jpg";
import ps from "../assets/ps5.jpg";
import table from "../assets/studytable.jpg";
import lap from "../assets/gaminglap.jpg";

import airfreyer from "../assets/airfreyer.jpg";
import atomichabits from "../assets/atomic habits.jpg";
import badmintonracket from "../assets/badminton racket.jpg";
import football from "../assets/football.jpg";
import gamingchair from "../assets/gamingchair.jpg";

import guitar from "../assets/guitar.jpg";

import hondaactiva from "../assets/hondaactiva.jpg";

import officechair from "../assets/officechair.jpg";
import oneplus12 from "../assets/oneplus12.jpg";
import runningshoes from "../assets/runningshoes.jpg";
import s23 from "../assets/s23.jpg";
import smartwatch from "../assets/smart watch.jpg";

import sofa from "../assets/sofa.jpg";

import psychologyofmoney from "../assets/the psychology of money.jpg";
import toyotainnova from "../assets/toyotainnova.jpg";
import womenshandbag from "../assets/womenshandbag.jpg";
import woodendiningset from "../assets/woodendiningset.jpg";
import canondslrcamera from "../assets/canondslrcamera.jpg";
import cricketball from "../assets/cricketball.jpg";
import mensdenimjacket from "../assets/mensdenimjacket.jpg";
const products = [
  {
    id: 1,
    title: "iPhone 13",
    price: 45000,
    type: "Mobiles",
    location: "Thrissur, Kerala",
    listed: "2 hours ago",
    image: iphone,
    desc: "Well-maintained iPhone 13 in excellent condition with smooth performance and great battery life. No major scratches or issues. Includes original charging cable and box.",
  },
  {
    id: 2,
    title: "Gaming Laptop",
    price: 65000,
    type: "Electronics",
    location: "Bangalore, Karnataka",
    listed: "Yesterday",
    image: lap,
    desc: "High-performance gaming laptop capable of handling modern games and productivity tasks. Features a powerful processor and dedicated graphics card. Well-maintained and fully functional.",
  },
  {
    id: 3,
    title: "Study Table",
    price: 5000,
    type: "Furniture",
    location: "Chennai, Tamil Nadu",
    listed: "3 days ago",
    image: table,
    desc: "Modern study table with ample workspace and storage. Strong build quality and suitable for students or home offices. Maintained in excellent condition.",
  },
  {
    id: 4,
    title: "Mountain Bike",
    price: 12000,
    type: "Sports",
    location: "Pune, Maharashtra",
    listed: "5 days ago",
    image: bike,
    desc: "Durable mountain bike designed for both city rides and off-road adventures. Smooth gear shifting and reliable braking system. Maintained regularly and rides perfectly.",
  },
  {
    id: 5,
    title: "Office Chair",
    price: 7000,
    type: "Furniture",
    location: "Kochi, Kerala",
    listed: "1 week ago",
    image: chair,
    desc: "Ergonomic office chair with adjustable height and comfortable seating. Provides excellent support during long work sessions. Barely used and in great condition.",
  },
  {
    id: 6,
    title: "PlayStation 5",
    price: 42000,
    type: "Electronics",
    location: "Hyderabad, Telangana",
    listed: "4 hours ago",
    image: ps,
    desc: "PlayStation 5 console in excellent working condition. Delivers smooth gaming performance and supports the latest titles. Includes controller and power cables.",
  },
  {
    id: 7,
    title: "Samsung Galaxy S23",
    price: 52000,
    type: "Mobiles",
    location: "Kochi, Kerala",
    listed: "6 hours ago",
    image: s23,
    desc: "Premium Samsung Galaxy S23 with stunning display and flagship camera performance. Device is in excellent condition and works perfectly. Includes charger and protective case.",
  },
  {
    id: 8,
    title: "OnePlus 12",
    price: 48000,
    type: "Mobiles",
    location: "Bangalore, Karnataka",
    listed: "Yesterday",
    image: oneplus12,
    desc: "OnePlus 12 with powerful performance, fast charging, and smooth user experience. Kept carefully with no visible damage. Ready for immediate use.",
  },
  {
    id: 9,
    title: "Dell XPS 15",
    price: 85000,
    type: "Electronics",
    location: "Hyderabad, Telangana",
    listed: "2 days ago",
    image: lap,
    desc: "Premium Dell XPS 15 laptop with excellent display quality and reliable performance. Ideal for students, professionals, and creators. In great condition with minimal signs of use.",
  },
  {
    id: 10,
    title: "Canon DSLR Camera",
    price: 35000,
    type: "Electronics",
    location: "Chennai, Tamil Nadu",
    listed: "3 days ago",
    image: canondslrcamera,
    desc: "Canon DSLR camera with exceptional image quality and reliable autofocus. Perfect for photography enthusiasts and content creators. Includes lens and original accessories.",
  },
  {
    id: 11,
    title: "Toyota Innova",
    price: 750000,
    type: "Vehicles",
    location: "Mumbai, Maharashtra",
    listed: "4 days ago",
    image: toyotainnova,
    desc: "Toyota Innova in excellent mechanical condition with spacious seating and comfortable ride quality. Regularly serviced and maintained. Ideal for family use and long journeys.",
  },
  {
    id: 12,
    title: "Honda Activa",
    price: 55000,
    type: "Vehicles",
    location: "Pune, Maharashtra",
    listed: "1 week ago",
    image: hondaactiva,
    desc: "Honda Activa scooter with smooth engine performance and excellent fuel efficiency. Well-maintained and suitable for daily commuting. All documents are available.",
  },
  {
    id: 13,
    title: "Wooden Dining Table",
    price: 18000,
    type: "Furniture",
    location: "Mysore, Karnataka",
    listed: "2 weeks ago",
    image: woodendiningset,
    desc: "Elegant wooden dining table crafted with durable materials and premium finish. Suitable for family gatherings and everyday use. Well-maintained with no major damage.",
  },
  {
    id: 14,
    title: "Sofa Set",
    price: 25000,
    type: "Furniture",
    location: "Coimbatore, Tamil Nadu",
    listed: "5 hours ago",
    image: sofa,
    desc: "Comfortable sofa set with soft cushioning and modern design. Perfect for living rooms and lounges. Clean, well-maintained, and ready for use.",
  },
  {
    id: 15,
    title: "Men's Denim Jacket",
    price: 1800,
    type: "Fashion",
    location: "Delhi",
    listed: "8 hours ago",
    image: mensdenimjacket,
    desc: "Stylish men's denim jacket made from high-quality fabric. Comfortable fit and versatile design suitable for casual wear. Used only a few times.",
  },
  {
    id: 16,
    title: "Women's Handbag",
    price: 2200,
    type: "Fashion",
    location: "Kolkata, West Bengal",
    listed: "Yesterday",
    image: womenshandbag,
    desc: "Elegant women's handbag with spacious compartments and premium finish. Perfect for daily use and special occasions. Maintained in excellent condition.",
  },
  {
    id: 17,
    title: "Running Shoes",
    price: 3500,
    type: "Fashion",
    location: "Jaipur, Rajasthan",
    listed: "3 days ago",
    image: runningshoes,
    desc: "Lightweight running shoes designed for comfort and performance. Provides excellent grip and cushioning. Gently used and in great condition.",
  },
  {
    id: 18,
    title: "Atomic Habits",
    price: 450,
    type: "Books",
    location: "Thrissur, Kerala",
    listed: "6 days ago",
    image: atomichabits,
    desc: "Popular self-improvement book by James Clear focusing on building positive habits and achieving long-term success. Book is in excellent condition with clean pages.",
  },
  {
    id: 19,
    title: "The Psychology of Money",
    price: 399,
    type: "Books",
    location: "Kottayam, Kerala",
    listed: "1 week ago",
    image: psychologyofmoney,
    desc: "Bestselling finance book by Morgan Housel that explains money management and wealth-building concepts. Well-preserved copy with no damage.",
  },
  {
    id: 20,
    title: "Cricket Bat",
    price: 2500,
    type: "Sports",
    location: "Lucknow, Uttar Pradesh",
    listed: "2 weeks ago",
    image: cricketball,
    desc: "High-quality cricket bat suitable for practice sessions and matches. Offers excellent balance, durability, and performance. Lightly used and maintained carefully.",
  },
  {
    id: 21,
    title: "Football",
    price: 900,
    type: "Sports",
    location: "Kozhikode, Kerala",
    listed: "10 hours ago",
    image: football,
    desc: "Professional-quality football with excellent grip and durability. Suitable for training sessions and friendly matches. Maintained in good condition.",
  },
  {
    id: 22,
    title: "Badminton Racket",
    price: 1500,
    type: "Sports",
    location: "Indore, Madhya Pradesh",
    listed: "2 days ago",
    image: badmintonracket,
    desc: "Lightweight badminton racket with excellent balance and control. Suitable for beginners and intermediate players. Well-maintained and ready for use.",
  },
  {
    id: 23,
    title: "Acoustic Guitar",
    price: 7000,
    type: "Others",
    location: "Goa",
    listed: "4 days ago",
    image: guitar,
    desc: "Acoustic guitar with rich sound quality and comfortable playability. Perfect for beginners and music enthusiasts. Includes protective carrying bag.",
  },
  {
    id: 24,
    title: "Smart Watch",
    price: 4500,
    type: "Others",
    location: "Ahmedabad, Gujarat",
    listed: "Yesterday",
    image: smartwatch,
    desc: "Feature-rich smartwatch with fitness tracking, notifications, and long battery life. Works smoothly and pairs easily with smartphones. Excellent condition.",
  },
  {
    id: 25,
    title: "Gaming Chair",
    price: 12000,
    type: "Furniture",
    location: "Ernakulam, Kerala",
    listed: "5 days ago",
    image: gamingchair,
    desc: "Gaming chair with ergonomic design, adjustable features, and superior comfort. Ideal for gaming and work setups. Excellent condition with minimal wear.",
  },
  {
    id: 26,
    title: "Air Fryer",
    price: 6500,
    type: "Electronics",
    location: "Visakhapatnam, Andhra Pradesh",
    listed: "1 week ago",
    image: airfreyer,
    desc: "Compact air fryer that prepares healthy and delicious meals with less oil. Easy to clean and simple to operate. Used lightly and works perfectly.",
  },
];

export default products;
