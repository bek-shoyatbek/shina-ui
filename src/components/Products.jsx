// import { useEffect, useState, useCallback, useRef } from "react";
// import axios from "axios";
// import { Link, useLocation } from "react-router-dom";
// import queryString from "query-string";

// import "./Products.css";

// process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
// const API_URL = process.env.REACT_APP_API_URL;

// export default function Products() {
//   const location = useLocation();
//   const { username, userContact } = queryString.parse(location.search);

//   // optimize slow rendering
//   const [page, setPage] = useState(1);

//   const loader = useRef(null);

//   const handleObserver = useCallback((entries) => {
//     const target = entries[0];
//     if (target.isIntersecting) {
//       setPage((prev) => prev + 1);
//     }
//   }, []);

//   useEffect(() => {
//     const option = {
//       root: null,
//       rootMargin: "20px",
//       threshold: 0,
//     };
//     const observer = new IntersectionObserver(handleObserver, option);
//     if (loader.current) observer.observe(loader.current);
//   }, [handleObserver]);

//   const [categories, setCategories] = useState([]);

//   const [sizes, setSizes] = useState([]);

//   const [category, setCategory] = useState("all");

//   const [selectedSize, setSelectedSize] = useState("all");

//   const [products, setProducts] = useState([]);

//   useEffect(() => {
//     async function getProducts() {
//       try {
//         const jsonData = (
//           await axios.get(`${API_URL}/api/products`, {
//             timeout: 50000,
//           })
//         ).data;
//         setCategories(
//           Array.from(
//             new Set(jsonData.map((product) => product.full_model.trim()))
//           )
//         );
//         const uniqueProducts = jsonData.filter(
//           (product) => !products.some((p) => p._id === product._id)
//         );
//         setProducts((prev) => [...prev, ...uniqueProducts]);
//         setSizes(getSizeOfProducts(products));
//       } catch (err) {
//         console.log(err);
//       }
//     }
//     getProducts();
//   }, [products, page]);

//   let filteredProducts = [];
//   if (category === "all") {
//     filteredProducts = products;
//   } else {
//     filteredProducts = products.filter(
//       (product) => product.full_model.trim() === category
//     );
//   }
//   if (selectedSize !== "all") {
//     filteredProducts = filteredProducts.filter(
//       (product) => getSizeOfProduct(product) === selectedSize
//     );
//   }

//   function RenderProduct({ products }) {
//     if (products.length > 0) {
//       return products.map((product) => (
//         <div className="card" id="card">
//           <div className="imgBx" id="imbox">
//             <img
//               id="wheel"
//               className="wheel"
//               src={
//                 product.image.split("/").slice(3).join("").startsWith("BQ") ||
//                 product.image.split("/").slice(3).join("").startsWith("AgA")
//                   ? API_URL + "/" + product.image.split("/").slice(2).join("/")
//                   : API_URL + "/images/" + product.image
//               }
//               alt={product.full_model}
//             />
//           </div>
//           <div className="contentBx" id="contentBx">
//             <p className="color model">{product.full_name}</p>
//             <div className="size" style={{ marginTop: "20px" }}>
//               <span>3 oy</span>
//               <span>6 oy</span>
//               <span>9 oy</span>
//             </div>
//             <div className="color"></div>
//             <p className="color price" style={{ marginTop: "30px" }}></p>
//             <Link
//               to={`/wheel?productId=${product._id}&username=${username}&userContact=${userContact}`}
//             >
//               {" "}
//               Sotib olish{" "}
//             </Link>
//           </div>
//         </div>
//       ));
//     } else {
//       return (
//         <div className="notFound">
//           <h1>Mahsulotlar yuklanmoqda...</h1>
//         </div>
//       );
//     }
//   }

//   return (
//     <>
//       <div className="container">
//         <RenderProduct products={filteredProducts} />
//         <div ref={loader} />
//         <div className="navbar">
//           <select
//             className="filter  category-filter"
//             value={category}
//             onChange={(e) => {
//               e.preventDefault();
//               setCategory(e.target.value);
//             }}
//           >
//             <option value="all">Shina turlari</option>
//             {categories.map((category) => (
//               <option key={category} value={category.trim()}>
//                 {category}
//               </option>
//             ))}
//           </select>
//           <select
//             className="filter  size-filter"
//             value={selectedSize}
//             onChange={(e) => {
//               e.preventDefault();
//               setSelectedSize(e.target.value);
//             }}
//           >
//             <option value="all">O'lcham tanlash</option>
//             {sizes.map((size) => (
//               <option key={size} value={size}>
//                 {size}
//               </option>
//             ))}
//           </select>
//         </div>
//       </div>
//     </>
//   );
// }

// function getSizeOfProducts(products) {
//   return Array.from(
//     new Set(
//       products.map(
//         (product) =>
//           product.full_name.split(" ")[product.full_name.split(" ").length - 1]
//       )
//     )
//   );
// }

// function getSizeOfProduct(product) {
//   let len = product.full_name.split(" ").length;
//   return product.full_name.split(" ")[len - 1];
// }

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import queryString from "query-string";

import "./Products.css";

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
const API_URL = process.env.REACT_APP_API_URL;

export default function Products() {
  const location = useLocation();
  const { username, userContact } = queryString.parse(location.search);

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loader = useRef(null);

  const [categories, setCategories] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [category, setCategory] = useState("all");
  const [selectedSize, setSelectedSize] = useState("all");
  const [products, setProducts] = useState([]);

  const handleObserver = useCallback(
    (entries) => {
      const target = entries[0];
      if (target.isIntersecting && hasMore && !loading) {
        setPage((prev) => prev + 1);
      }
    },
    [hasMore, loading]
  );

  useEffect(() => {
    const option = {
      root: null,
      rootMargin: "20px",
      threshold: 0,
    };
    const observer = new IntersectionObserver(handleObserver, option);
    if (loader.current) observer.observe(loader.current);
    return () => {
      if (loader.current) observer.unobserve(loader.current);
    };
  }, [handleObserver]);

  const getProducts = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/products`, {
        params: {
          offset: (page - 1) * 10,
          limit: 10,
          category: category !== "all" ? category : undefined,
          size: selectedSize !== "all" ? selectedSize : undefined,
        },
        timeout: 50000,
      });
      const {
        products: newProducts,
        categories: newCategories,
        sizes: newSizes,
        totalPages,
      } = response.data;

      setCategories(newCategories);
      setSizes(newSizes);

      const uniqueProducts = newProducts.filter(
        (product) => !products.some((p) => p._id === product._id)
      );
      setProducts((prev) => [...prev, ...uniqueProducts]);
      setHasMore(page < totalPages);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }, [page, category, selectedSize, loading, hasMore, products]);

  useEffect(() => {
    getProducts();
  }, [getProducts]);

  const filteredProducts = useMemo(() => {
    let filtered =
      category === "all"
        ? products
        : products.filter((product) => product.full_model.trim() === category);
    if (selectedSize !== "all") {
      filtered = filtered.filter(
        (product) => getSizeOfProduct(product) === selectedSize
      );
    }
    return filtered;
  }, [products, category, selectedSize]);

  function RenderProduct({ products }) {
    if (products.length > 0) {
      return products.map((product) => (
        <div key={product._id} className="card" id="card">
          <div className="imgBx" id="imbox">
            <img
              id="wheel"
              className="wheel"
              src={
                product.image.split("/").slice(3).join("").startsWith("BQ") ||
                product.image.split("/").slice(3).join("").startsWith("AgA")
                  ? API_URL + "/" + product.image.split("/").slice(2).join("/")
                  : API_URL + "/images/" + product.image
              }
              alt={product.full_model}
            />
          </div>
          <div className="contentBx" id="contentBx">
            <p className="color model">{product.full_name}</p>
            <div className="size" style={{ marginTop: "20px" }}>
              <span>3 oy</span>
              <span>6 oy</span>
              <span>9 oy</span>
            </div>
            <div className="color"></div>
            <p className="color price" style={{ marginTop: "30px" }}></p>
            <Link
              to={`/wheel?productId=${product._id}&username=${username}&userContact=${userContact}`}
            >
              {" "}
              Sotib olish{" "}
            </Link>
          </div>
        </div>
      ));
    } else {
      return (
        <div className="notFound">
          <h1>Mahsulotlar yuklanmoqda...</h1>
        </div>
      );
    }
  }

  return (
    <>
      <div className="container">
        <RenderProduct products={filteredProducts} />
        {loading && <div>Loading...</div>}
        {!loading && hasMore && <div ref={loader} />}
        <div className="navbar">
          <select
            className="filter category-filter"
            value={category}
            onChange={(e) => {
              e.preventDefault();
              setCategory(e.target.value);
              setPage(1);
              setProducts([]);
            }}
          >
            <option value="all">Shina turlari</option>
            {categories.map((category) => (
              <option key={category} value={category.trim()}>
                {category}
              </option>
            ))}
          </select>
          <select
            className="filter size-filter"
            value={selectedSize}
            onChange={(e) => {
              e.preventDefault();
              setSelectedSize(e.target.value);
              setPage(1);
              setProducts([]);
            }}
          >
            <option value="all">O'lcham tanlash</option>
            {sizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
}

function getSizeOfProduct(product) {
  let len = product.full_name.split(" ").length;
  return product.full_name.split(" ")[len - 1];
}
