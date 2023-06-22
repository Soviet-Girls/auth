import React, { ReactNode, useEffect } from "react";
import VK from "../public/openapi";

const VkAuth: ReactNode = (props: {
  user: object;
  setUser: React.Dispatch<React.SetStateAction<object>>;
  disconnectMetamask: Function;
}) => {
  useEffect(() => {
    VK.init({ apiId: 51686565 });
  }, []);

  return (
    <div className={"connect_container"}>
      {!props.user.id ? (
        <button
          onClick={() => {
            VK.Auth.login((r: any) => props.setUser(r.session.user), 4);
          }}
        >
          Войти с помощью ВКонтакте
        </button>
      ) : (
        <button
          onClick={() => {
            VK.Auth.logout((r: any) => {
              props.setUser({});
              props.disconnectMetamask();
            });
          }}
        >
          Выйти из ВКонтакте
        </button>
      )}
    </div>
  );
};

export default VkAuth;
