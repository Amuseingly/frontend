import React from "react";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {Link} from "react-router-dom";


function SidebarButton(props) {
    return <Link to={props.to}><button className={props.active ? "active" : null}><FontAwesomeIcon icon={props.icon} /><span>{props.children}</span></button></Link>;
}

export default SidebarButton;