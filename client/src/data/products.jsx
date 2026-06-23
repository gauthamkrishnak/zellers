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
  },
  {
    id: 2,
    title: "Gaming Laptop",
    price: 65000,
    type: "Electronics",
    location: "Bangalore, Karnataka",
    listed: "Yesterday",
    image: lap,
  },
  {
    id: 3,
    title: "Study Table",
    price: 5000,
    type: "Furniture",
    location: "Chennai, Tamil Nadu",
    listed: "3 days ago",
    image: table,
  },
  {
    id: 4,
    title: "Mountain Bike",
    price: 12000,
    type: "Sports",
    location: "Pune, Maharashtra",
    listed: "5 days ago",
    image: bike,
  },
  {
    id: 5,
    title: "Office Chair",
    price: 7000,
    type: "Furniture",
    location: "Kochi, Kerala",
    listed: "1 week ago",
    image: chair,
  },
  {
    id: 6,
    title: "PlayStation 5",
    price: 42000,
    type: "Electronics",
    location: "Hyderabad, Telangana",
    listed: "4 hours ago",
    image: ps,
  },
  {
    id: 7,
    title: "Samsung Galaxy S23",
    price: 52000,
    type: "Mobiles",
    location: "Kochi, Kerala",
    listed: "6 hours ago",
    image: s23,
  },
  {
    id: 8,
    title: "OnePlus 12",
    price: 48000,
    type: "Mobiles",
    location: "Bangalore, Karnataka",
    listed: "Yesterday",
    image: oneplus12,
  },
  {
    id: 9,
    title: "Dell XPS 15",
    price: 85000,
    type: "Electronics",
    location: "Hyderabad, Telangana",
    listed: "2 days ago",
    image: lap,
  },
  {
    id: 10,
    title: "Canon DSLR Camera",
    price: 35000,
    type: "Electronics",
    location: "Chennai, Tamil Nadu",
    listed: "3 days ago",
    image: canondslrcamera,
  },
  {
    id: 11,
    title: "Toyota Innova",
    price: 750000,
    type: "Vehicles",
    location: "Mumbai, Maharashtra",
    listed: "4 days ago",
    image: toyotainnova,
  },
  {
    id: 12,
    title: "Honda Activa",
    price: 55000,
    type: "Vehicles",
    location: "Pune, Maharashtra",
    listed: "1 week ago",
    image: hondaactiva,
  },
  {
    id: 13,
    title: "Wooden Dining Table",
    price: 18000,
    type: "Furniture",
    location: "Mysore, Karnataka",
    listed: "2 weeks ago",
    image: woodendiningset,
  },
  {
    id: 14,
    title: "Sofa Set",
    price: 25000,
    type: "Furniture",
    location: "Coimbatore, Tamil Nadu",
    listed: "5 hours ago",
    image: sofa,
  },
  {
    id: 15,
    title: "Men's Denim Jacket",
    price: 1800,
    type: "Fashion",
    location: "Delhi",
    listed: "8 hours ago",
    image: mensdenimjacket,
  },
  {
    id: 16,
    title: "Women's Handbag",
    price: 2200,
    type: "Fashion",
    location: "Kolkata, West Bengal",
    listed: "Yesterday",
    image: womenshandbag,
  },
  {
    id: 17,
    title: "Running Shoes",
    price: 3500,
    type: "Fashion",
    location: "Jaipur, Rajasthan",
    listed: "3 days ago",
    image: runningshoes,
  },
  {
    id: 18,
    title: "Atomic Habits",
    price: 450,
    type: "Books",
    location: "Thrissur, Kerala",
    listed: "6 days ago",
    image: atomichabits,
  },
  {
    id: 19,
    title: "The Psychology of Money",
    price: 399,
    type: "Books",
    location: "Kottayam, Kerala",
    listed: "1 week ago",
    image: psychologyofmoney,
  },
  {
    id: 20,
    title: "Cricket Bat",
    price: 2500,
    type: "Sports",
    location: "Lucknow, Uttar Pradesh",
    listed: "2 weeks ago",
    image: cricketball,
  },
  {
    id: 21,
    title: "Football",
    price: 900,
    type: "Sports",
    location: "Kozhikode, Kerala",
    listed: "10 hours ago",
    image: football,
  },
  {
    id: 22,
    title: "Badminton Racket",
    price: 1500,
    type: "Sports",
    location: "Indore, Madhya Pradesh",
    listed: "2 days ago",
    image: badmintonracket,
  },
  {
    id: 23,
    title: "Acoustic Guitar",
    price: 7000,
    type: "Others",
    location: "Goa",
    listed: "4 days ago",
    image: guitar,
  },
  {
    id: 24,
    title: "Smart Watch",
    price: 4500,
    type: "Others",
    location: "Ahmedabad, Gujarat",
    listed: "Yesterday",
    image: smartwatch,
  },
  {
    id: 25,
    title: "Gaming Chair",
    price: 12000,
    type: "Furniture",
    location: "Ernakulam, Kerala",
    listed: "5 days ago",
    image: gamingchair,
  },
  {
    id: 26,
    title: "Air Fryer",
    price: 6500,
    type: "Electronics",
    location: "Visakhapatnam, Andhra Pradesh",
    listed: "1 week ago",
    image: airfreyer,
  },
];

export default products;
