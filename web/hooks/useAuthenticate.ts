import { useSDK } from "@thirdweb-dev/react";

export default function useAuthenticate() {
  const domain = "auth.sovietgirls.su";
  const sdk = useSDK();

  async function login() {
    const payload = await sdk?.auth.login(domain);
    await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ payload }),
    });
  }

  async function authenticate(uid: string) {
    const res = await fetch("/api/authenticate", {
      method: "POST",
      body: JSON.stringify({
        uid
      })
    });
    return res;
  }

  async function logout() {
    await fetch("/api/logout", {
      method: "POST",
    });
  }

  return {
    login,
    authenticate,
    logout,
  };
}
