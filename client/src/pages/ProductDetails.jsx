import { useParams } from "react-router-dom";
import Products from "../data/products";

function ProductDetails() {
  const { id } = useParams();

  const product = Products.find((product) => product.id === Number(id));

  if (!product) {
    return <h1>Product Not Found</h1>;
  }

  return (
    <div className="p-10">
      <img src={product.image} alt={product.title} className="w-96" />

      <h1 className="text-4xl font-bold mt-4">{product.title}</h1>

      <p className="text-2xl text-blue-600">₹{product.price}</p>

      <p>{product.location}</p>

      <p>{product.listed}</p>
    </div>
  );
}

export default ProductDetails;
