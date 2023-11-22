import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Product from './components/Product';
import { useEffect } from 'react';
import Products from './components/Products';
import eruda from "eruda";


const tele = window.Telegram.WebApp;


function App() {

  useEffect(() => {
    tele.ready();
    tele.expand();
    eruda.init();
  })

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route key={"products"} path={'/'} element={<Products />} />
          <Route key={"product"} path={'/wheel'} element={<Product />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
