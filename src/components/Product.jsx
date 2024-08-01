import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import queryString from "query-string";
import Swal from "sweetalert2";
import axios from "axios";
import "./Product.css";

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
const API_URL = process.env.REACT_APP_API_URL;

export default function Product() {
  const location = useLocation();
  let { productId, username, userContact } = queryString.parse(location.search);

  console.log(productId, username, userContact);

  const [product, setProduct] = useState();

  const [creditType, setCreditType] = useState(1);

  const [price, setPrice] = useState(1);

  const [currency, setCurrency] = useState(0);

  const [solidPrice, setSolidPrice] = useState(0);

  const [activeBtn, setActiveBtn] = useState(null);

  useEffect(() => {
    async function getProduct() {
      const jsonData = (
        await axios.get(`${API_URL}/api/product/${productId}`, {
          timeout: 30000,
        })
      ).data;
      setProduct(jsonData);
      setPrice(parseFloat(jsonData.price_usd.trim()).toFixed(2));
    }

    getProduct();
  }, [productId]);

  useEffect(() => {
    async function getCurrency() {
      try {
        const jsonData = (
          await axios.get(`${API_URL}/api/currency`, {
            timeout: 30000,
          })
        ).data;
        setCurrency(jsonData.data.val);
        setSolidPrice(parseFloat(product.price_usd) * parseFloat(currency));
      } catch (err) {
        console.log(err);
      }
    }
    getCurrency();
  }, [currency, product]);

  const getUserContact = async () => {
    const result = await Swal.fire({
      title: "telegram (username)ni kiriting",
      input: "text",
    });

    const username = result.value;

    const phoneResult = await Swal.fire({
      title: "Telefon raqamingiz",
      input: "tel",
    });

    const phoneNumber = phoneResult.value;

    return {
      username,
      phoneNumber,
    };
  };

  const submitOrder = async (e) => {
    e.preventDefault();

    if (
      username === "undefined" ||
      !username ||
      userContact === "undefined" ||
      !userContact
    ) {
      const userInfo = await getUserContact();
      if (userInfo) {
        username = userInfo.username;
        userContact = userInfo.phoneNumber;
      }
      if (!username || !userContact) return;
    }
    if (username && userContact) {
      await orderProduct(productId);
      Swal.fire({
        title: "Success",
        text: "Buyurtmangiz qabul qilindi!",
        icon: "success",
      });
    }
  };

  async function orderProduct(productId) {
    try {
      const response = await axios.get(
        `${API_URL}/api/order/${productId}?userContact=${userContact}&username=${username}&creditType=${creditType}`,
        { timeout: 30000 }
      );

      if (response.ok) {
        return true;
      }
    } catch (err) {
      console.error(err);
    }
  }

  function RenderProduct({ product }) {
    if (product) {
      return (
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
            <ul className="details">
              <li className="detail_item">
                Narxi : {solidPrice.toFixed(2)} so'm
              </li>
              <li className="detail_item">O'lchami :{product.size}</li>
              <li className="detail_item">Uzunligi :{product.width}</li>
              <li className="detail_item">Diametr :{product.diameter}</li>
            </ul>
            <div className="size" style={{ marginTop: "10px" }}>
              <div className="size-buttons">
                <button
                  className={activeBtn === "1" ? "size-btn active" : "size-btn"}
                  name="size"
                  value="1"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveBtn(e.target.value);
                    let oldPrice = parseFloat(price);
                    let newPrice = oldPrice * parseFloat(currency);
                    setSolidPrice(newPrice);
                    setCreditType(e.target.value);
                  }}
                >
                  Naqtga
                </button>
                <button
                  className={activeBtn === "3" ? "size-btn active" : "size-btn"}
                  name="size"
                  value="3"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveBtn(e.target.value);
                    let priceFor3Months = parseFloat(product.percent_3m);
                    setSolidPrice(priceFor3Months * parseFloat(currency));
                    setCreditType(e.target.value);
                  }}
                >
                  3 oy
                </button>
                <button
                  className={activeBtn === "6" ? "size-btn active" : "size-btn"}
                  name="size"
                  value="6"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveBtn(e.target.value);
                    let priceFor6Months = parseFloat(product.percent_6m);
                    setSolidPrice(priceFor6Months * parseFloat(currency));
                    setCreditType(e.target.value);
                  }}
                >
                  6 oy
                </button>
                <button
                  className={activeBtn === "9" ? "size-btn active" : "size-btn"}
                  name="size"
                  value="9"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveBtn(e.target.value);
                    let priceFor9Months = parseFloat(product.percent_9m);
                    setSolidPrice(priceFor9Months * parseFloat(currency));
                    setCreditType(e.target.value);
                  }}
                >
                  9 oy
                </button>
              </div>
            </div>
            <div className="color"></div>
            <p className="color price" style={{ marginTop: "30px" }}></p>
          </div>
        </div>
      );
    } else {
      return (
        <div className="notFound">
          <p>Mahsulot topilmadi!</p>
        </div>
      );
    }
  }

  return (
    <>
      <div className="container">
        <RenderProduct product={product} />
        <div className="navbar_product">
          <button
            className="orderBtn"
            style={{ marginTop: "1px" }}
            onClick={submitOrder}
          >
            Buyurtma berish
          </button>
          <Link to={"/"} className="linker">
            Asosiy menu
          </Link>
        </div>
      </div>
    </>
  );
}
