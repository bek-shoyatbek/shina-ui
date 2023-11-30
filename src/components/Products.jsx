import { useEffect, useState, useCallback, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import queryString from "query-string";

import "./Products.css";
import axios from "axios";

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
const API_URL = process.env.REACT_APP_API_URL;

export default function Products() {
  const location = useLocation();
  const { username, userContact } = queryString.parse(location.search);

  localStorage.setItem(
    "username",
    username || localStorage.getItem("username")
  );
  localStorage.setItem(
    "userContact",
    userContact || localStorage.getItem("userContact")
  );

  // optimize slow rendering

  const [page, setPage] = useState(1);

  const loader = useRef(null);

  const handleObserver = useCallback((entries) => {
    const target = entries[0];
    if (target.isIntersecting) {
      setPage((prev) => prev + 1);
    }
  }, []);

  useEffect(() => {
    const option = {
      root: null,
      rootMargin: "20px",
      threshold: 0,
    };
    const observer = new IntersectionObserver(handleObserver, option);
    if (loader.current) observer.observe(loader.current);
  }, [handleObserver]);

  const [categories, setCategories] = useState([]);

  const [sizes, setSizes] = useState([]);

  const [category, setCategory] = useState("all");

  const [selectedSize, setSelectedSize] = useState("all");

  const [products, setProducts] = useState([]);

  useEffect(() => {
    async function getProducts() {
      try {
        const jsonData = (
          await axios.get(`${API_URL}/api/products`, {
            timeout: 30000,
          })
        ).data;
        setCategories(
          Array.from(
            new Set(jsonData.map((product) => product.full_model.trim()))
          )
        );
        const uniqueProducts = jsonData.filter(
          (product) => !products.some((p) => p._id === product._id)
        );
        setProducts((prev) => [...prev, ...uniqueProducts]);
        setSizes(getSizeOfProducts(products));
      } catch (err) {
        console.log(err);
      }
    }
    getProducts();
  }, [products, page]);

  let filteredProducts = [];
  if (category === "all") {
    filteredProducts = products;
  } else {
    filteredProducts = products.filter(
      (product) => product.full_model.trim() === category
    );
  }
  if (selectedSize !== "all") {
    filteredProducts = filteredProducts.filter(
      (product) => getSizeOfProduct(product) === selectedSize
    );
  }

  function RenderProduct({ products }) {
    if (products.length > 0) {
      return products.map((product) => (
        <div className="card" id="card">
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
            <Link to={`/wheel?productId=${product._id}`}> Sotib olish </Link>
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
        <div ref={loader} />
        <div className="navbar">
          <select
            className="filter  category-filter"
            value={category}
            onChange={(e) => {
              e.preventDefault();
              setCategory(e.target.value);
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
            className="filter  size-filter"
            value={selectedSize}
            onChange={(e) => {
              e.preventDefault();
              setSelectedSize(e.target.value);
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

function getSizeOfProducts(products) {
  return Array.from(
    new Set(
      products.map(
        (product) =>
          product.full_name.split(" ")[product.full_name.split(" ").length - 1]
      )
    )
  );
}

function getSizeOfProduct(product) {
  let len = product.full_name.split(" ").length;
  return product.full_name.split(" ")[len - 1];
}
