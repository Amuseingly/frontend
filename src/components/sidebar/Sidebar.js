import React from "react";
import SidebarButton from "./subcomponents/SidebarButton";
import icons from "../../icons/icons";
import "./styles/Sidebar.scss";
import {useLocation} from "react-router-dom";

function Sidebar() {
    let location = useLocation();
    return <nav id="sidebar">
        <SidebarButton active={location.pathname === "/"} icon={icons.library} to={"/"}>Library</SidebarButton>
        <SidebarButton active={location.pathname === "/search"} icon={icons.search} to={"/search"}>Search</SidebarButton>
    </nav>;
}

export default Sidebar;