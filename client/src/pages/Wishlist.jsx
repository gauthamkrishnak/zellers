import Products from "../data/products";
import ProductCard from "../components/productcard";

function Wishlist() {
  const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

  const wishlistProducts = Products.filter((product) =>
    wishlist.includes(product.id),
  );

  if (wishlist.length != []) {
    return (
      <>
        <div className="p-8">
          <h1 className="text-3xl font-bold mb-6">My Wishlist</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {wishlistProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </div>
      </>
    );
  }
  //to check if empty
  if (wishlist.length == []) {
    return (
      <>
        <div>Wishlist is empty</div>;
      </>
    );
  }
}

export default Wishlist;
