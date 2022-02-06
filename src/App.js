import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link, Switch, NavLink } from "react-router-dom";
import ListCreative from './components/ListCreative';
import AddCreative  from './components/AddCreative';
import './App.css';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.min.js";
import { faHome, faFolder, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
export default class App extends Component {
  render() {
    return (
      <div className="App">
        <div class="sidebar">
          <a class="active" href="https://www.linkedin.com/company/big-ads-co/" target="_blank" className="logo-nav">
            <img height="40px" src='https://media-exp1.licdn.com/dms/image/C560BAQGcAxx5i7ZtHw/company-logo_200_200/0/1582585582050?e=1651708800&v=beta&t=FZ26mGDYvHiPBPqoL1qNkHzleumLbYd8MTcmlsl9_gI' className='me-3'/>
            <span className="nav-text">BigAds</span>
          </a>
          <NavLink activeClassName='btn-gradient' to='/add'>
            <span className="nav-icon">
              <FontAwesomeIcon icon={faPlus} size="1x"/>
            </span><span className="nav-text"> Add New</span>
          </NavLink>
          <NavLink exact={true} activeClassName='btn-gradient' to='/'>
            <span className="nav-icon">
              <FontAwesomeIcon icon={faFolder} size="1x"/>
            </span><span className="nav-text"> View All</span>
          </NavLink>
        </div>

        <div class="content main">
          <Switch>
            <Route exact path={["/", "/creatives"]} component={ListCreative} />
            <Route exact path="/add" component={AddCreative} />
            <Route path="/add/:id" component={AddCreative} />
          </Switch>
        </div>
      </div>
    );
  }
}