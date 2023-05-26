import type { NextPage } from "next";

import useAuthenticate from "../hooks/useAuthenticate";
import { useAddress, useDisconnect, useMetamask } from "@thirdweb-dev/react";
import { useEffect, useState } from "react";
import { set } from "zod";

const Home: NextPage = () => {
  const address = useAddress();
  const disconnect = useDisconnect();
  const connectWithMetamask = useMetamask();
  const { login, authenticate, logout } = useAuthenticate();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMessage, setAuthMessage] = useState("N/A");
  const [isMetamaskConnected, setIsMetamaskConnected] = useState(false);

  useEffect(() => {
    console.log(isMetamaskConnected);
  }, [isMetamaskConnected]);

  const signInWithEthereum = async () => {
    setAuthMessage("N/A");
    await connectWithMetamask();
    await login();
    setIsLoggedIn(true);
  };

  const authenticatedRequest = async () => {
    const res = await authenticate();
    if (res.ok) {
      const address = await res.json();
      setAuthMessage(`Succesfully authenticated! Chat adress: ${address}`);
      window.open(address, "_blank");
    } else {
      setAuthMessage(
        `Failed to authenticate, backend responded with ${res.status} (${res.statusText})`
      );
    }
  };

  const connectMetamask = async () => {
    await connectWithMetamask();
    setIsMetamaskConnected(true);
  };

  const disconnectMetamask = async () => {
    await disconnect();
    await logoutWallet();
    setIsMetamaskConnected(false);
  };

  const logoutWallet = async () => {
    await logout();
    setIsLoggedIn(false);
    setAuthMessage("N/A");
  };

  return (
    <>
      {/*<header*/}
      {/*  style={{*/}
      {/*    width: "100%",*/}
      {/*    height: "50px",*/}
      {/*    position: "sticky",*/}
      {/*    top: 0,*/}
      {/*    backgroundColor: "rgba(50, 50, 50, 0.8);",*/}
      {/*    backdropFilter: "blur(10px)",*/}
      {/*      boxShadow: "0 1px 20px rgba(0, 0, 0, 0.7)"*/}
      {/*  }}*/}
      {/*>*/}
      {/*  <div*/}
      {/*    style={{*/}
      {/*      display: "flex",*/}
      {/*      width: "100%",*/}
      {/*      height: "100%",*/}
      {/*      justifyContent: "center",*/}
      {/*      alignItems: "center",*/}
      {/*    }}*/}
      {/*  >*/}
      {/*    Soviet Girls*/}
      {/*  </div>*/}
      {/*</header>*/}
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <div className={"connect_container"}>
          {!address ? (
            <button onClick={connectMetamask}>1. Подключить кошелёк</button>
          ) : (
            <button onClick={disconnectMetamask}>Отключить кошелёк</button>
          )}
        </div>
        {isMetamaskConnected && (
          <div
            style={{
              marginTop: 10,
            }}
            className={"connect_container"}
          >
            {isLoggedIn ? (
              <button onClick={logoutWallet}>Отозвать подпись</button>
            ) : (
              <button onClick={signInWithEthereum}>2. Подписать сообщение</button>
            )}
          </div>
        )}
        {isMetamaskConnected && isLoggedIn && (
          <div style={{ marginTop: 10 }} className={"connect_container"}>
            <button onClick={authenticatedRequest}>3. Получить ссылку</button>
          </div>
        )}
      </div>
    </>
  );
};

export default Home;
