import type { NextPage } from "next";

import useAuthenticate from "../hooks/useAuthenticate";
import { useAddress, useDisconnect, useMetamask } from "@thirdweb-dev/react";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { set } from "zod";
const VkAuth = dynamic(() => import("../components/vkAuth"), {
  ssr: false,
});

const Home: NextPage = () => {
  const address = useAddress();
  const disconnect = useDisconnect();
  const connectWithMetamask = useMetamask();
  const { login, authenticate, logout } = useAuthenticate();

  const [user, setUser] = useState({});
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
    const res = await authenticate(user.id);
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

  useEffect(() => {
    console.log(user);
  }, [user]);

  return (
    <>
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
        <VkAuth user={user} setUser={setUser} disconnectMetamask={disconnectMetamask} />
        {user.id && (
          <div
            className={"connect_container"}
            style={{
              marginTop: 10,
            }}
          >
            {!address ? (
              <button onClick={connectMetamask}>1. Подключить кошелёк</button>
            ) : (
              <button onClick={disconnectMetamask}>Отключить кошелёк</button>
            )}
          </div>
        )}
        {user.id && isMetamaskConnected && (
          <div
            style={{
              marginTop: 10,
            }}
            className={"connect_container"}
          >
            {isLoggedIn ? (
              <button onClick={logoutWallet}>Отозвать подпись</button>
            ) : (
              <button onClick={signInWithEthereum}>2. Зайти в кошелёк</button>
            )}
          </div>
        )}
        {user.id && isMetamaskConnected && isLoggedIn && (
          <div style={{ marginTop: 10 }} className={"connect_container"}>
            <button onClick={authenticatedRequest}>3. Получить ссылку</button>
          </div>
        )}
      </div>
    </>
  );
};

export default Home;
