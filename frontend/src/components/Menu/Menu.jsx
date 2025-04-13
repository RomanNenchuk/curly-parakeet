import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { useWidth } from "../../contexts/ScreenWidthContext.jsx";

import { useUserInfo } from "../../contexts/UserInfoContext.jsx";
import TopBar from "./TopBar.jsx";
import SideBar from "./SideBar.jsx";
import "./Menu.css";
import AltSide from "./AltSide.jsx";

export default function Menu() {
  const [isExpanded, setExpand] = useState(false)
  const { avatar, fullName, currentUser } = useUserInfo()
  const { width } = useWidth()
  return (
    <div className="wrapper">
      <TopBar setExpand={setExpand}/>
      <div className="forum-container">
      {width > 768 ?<SideBar /> : <AltSide display={isExpanded ? "block" : "none"} setExpand={setExpand} />}

        <Outlet />
      </div>
    </div>
  );
}
