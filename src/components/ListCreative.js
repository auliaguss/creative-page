import { Link } from "react-router-dom";
import React, { Component } from "react";
import CreativeService from '../service/creative.service';
import Loading from "./Loading";
import ModalBootstrap from "./ModalBootstrap";
import ToastBootstrap from "./ToastBootstrap";
import moon from '../assets/moon.png'
import "../assets/ListCreative.css"
import { faTrashAlt, faPencilAlt, faBookmark, faSort, faSearch, faFrownOpen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import badge from '../assets/badge.png'
import bookmark from '../assets/bookmark.png'

function get_url_extension( url ) {
  return url.split(/[#?]/)[0].split('.').pop().trim();
}
function getWeekDates() {

  let now = new Date();
  let dayOfWeek = now.getDay(); //0-6
  let numDay = now.getDate();

  let end = new Date(now); //copy
  end.setDate(numDay - dayOfWeek);
  end.setHours(0, 0, 0, 0);

  let start = new Date(now); //copy
  start.setDate(numDay - (7 - dayOfWeek));
  start.setHours(0, 0, 0, 0);

  return [start, end];
}
export default class ListCreative extends Component {
  constructor(props) {
    super(props);

    this.state = {
      creatives: [],
      highestThisWeek: [],
      originalCreatives: [],
      isLoading: true,
      showModalDelete: false,
      search: "",
      currentCreativeID : "",
      sortBy: "",
      isOrderAscending: true,
      showToastPopup: false,
      isToastSuccess: false,
      toastCaption: "",
      pageMode: ""
    };
    this.handleSearchChange = this.handleSearchChange.bind(this);
    // this.delete = this.deleteCreative.bind(this);
    this.handleModalDelete = this.handleModalDelete.bind(this);
    this.refreshData();
  }
  handleModalDelete() {
    this.setState({
      showModalDelete: !this.state.showModalDelete
    })
  }
  delete(){
    this.setState({
      showModalDelete:false
    })
    CreativeService.delete(this.state.currentCreativeID)
    .then(response => {
      const data = this.state.creatives.filter(x => x.id !== this.state.currentCreativeID)
      this.setState({
        creatives: data,
        isLoading: false,
        showModalDelete:false,
        originalCreatives: data
      });
      this.setToastPopup(true, "Data successfully saved");
    })
    .catch(e => {
      this.setToastPopup(false, e);
    });
  }
  handleSearchChange(e){
    const value = e.target.value;
    if(value){
      const searchPerson = this.state.originalCreatives.filter((v) => v.name.toLowerCase().includes(value.toLowerCase()) );

      this.setState({ search: value, creatives: searchPerson })
    }else{
      this.setState({ search: value, creatives: this.state.originalCreatives })
    }
  }

  refreshData() {
    CreativeService.getAll()
      .then(response => {
        this.setState({
          creatives: response.data.data,
          isLoading: false,
          originalCreatives: response.data.data
        });
      })
      .catch(e => {
        this.setToastPopup(false, e)
      });
  }
  saveStorage(creative){
    let storedCreatives = JSON.parse(localStorage.getItem("creatives-data"));
    let toastCaption = "";
    //if data exist in storage, then remove
    let index = storedCreatives ? storedCreatives.findIndex(c => c.id === creative.id) : -1;
    if(index >= 0){
      if(this.state.pageMode === "saved"){
        storedCreatives.splice(index, 1);
        toastCaption = "Data succesfully removed from saved"
      }else toastCaption = "Data is already saved"
    }else{
      if(storedCreatives) storedCreatives.push(creative)
      else storedCreatives = [creative]
      toastCaption = "Data succesfully saved"
    }
    localStorage.setItem("creatives-data", JSON.stringify(storedCreatives))
    if(this.state.pageMode === "saved") this.setState({creatives: storedCreatives})
    this.setToastPopup(true, toastCaption)
  }
  showSaved(){
    if(this.state.pageMode === "saved") this.setState({creatives: this.state.originalCreatives, pageMode: ""})
    else this.setState({creatives: JSON.parse(localStorage.getItem("creatives-data")), pageMode: "saved"})
  }
  setToastPopup(isSuccess, caption){
    this.setState({showToastPopup: true, isToastSuccess: isSuccess, toastCaption: caption})
    setTimeout(() => { 
      this.setState({showToastPopup: false})
    }, 5000);
  }
  showRank(){
    if(this.state.pageMode == "rank") this.setState({creatives: this.state.originalCreatives, pageMode:""})
    else{
      let [start, end] = getWeekDates();
      const dataThisWeek = this.state.originalCreatives.filter(d => +new Date(d.start_date) >= +start && +new Date(d.start_date) < +end);
      if(dataThisWeek != null){
        const sortImpressions = dataThisWeek.sort(function (a, b) {
          return b.impressions - a.impressions;
        });
        let highestThisWeek = [];
        for(let i=0; i<3; i++){
          //if datathisweek length is < 3 then break
          if(dataThisWeek.length == i) break;
          highestThisWeek.push(sortImpressions[i])
        }
        this.setState({creatives: highestThisWeek, pageMode:"rank"})
      }
    }
  }
  setOrderFrom(orderBy){
    let orderedData = null;
    let isAscending = this.state.orderBy === orderBy ? !this.state.isOrderAscending : true;
    
    if(orderBy === "impressions"){
      orderedData = this.state.originalCreatives.sort(function (a, b) {
        if(isAscending) return a.impressions - b.impressions;
        return b.impressions - a.impressions;
      });
    }
    if(orderBy === "name" || orderBy === "format" || orderBy === "size" ) orderedData = this.sortAlphabetically(orderBy, isAscending)
    if(orderBy === "end_date" || orderBy === "start_date") orderedData = this.sortDate(orderBy, isAscending)
    if(orderedData) this.setState({creatives:orderedData, orderBy: orderBy, isOrderAscending: isAscending})
  }

  sortDate(orderBy, isAscending){
    return this.state.originalCreatives.sort(function(a,b){
      if(a[orderBy]==null) return -1;
      if(b[orderBy]==null) return -1;
      a = a[orderBy].split('-');
      b = b[orderBy].split('-');
      if(isAscending) return a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
      return b[0] - a[0] || b[1] - a[1] || b[2] - a[2];
      
    })
  }

  sortAlphabetically(orderBy, isAscending){
    return this.state.originalCreatives.sort(function (a, b) {
      let nameA=a[orderBy].toLowerCase(), nameB=b[orderBy].toLowerCase();
      if (nameA < nameB){
        if(isAscending) return -1;
        return 1;
      }
      if (nameA > nameB){
        if(isAscending) return 1;
        return -1;
      }
      return 0;
    });
  }
  render(){
    const { creatives, isLoading, showModalDelete, showToastPopup, isToastSuccess, toastCaption, pageMode } = this.state;
    return(
      <div className="list-creative w-100 h-100 pt-50">
        <h1>
          {pageMode === "saved" && "SAVED DATA"}
          {pageMode === "rank" && "RANK THIS WEEK"}
          {pageMode === "" && "CREATIVE DATA"}
        </h1>
        <ToastBootstrap show={showToastPopup} caption={toastCaption} success={isToastSuccess}/>
      <ModalBootstrap handleModal={this.handleModalDelete} show={showModalDelete} title="Are you sure you want to delete?">
        <p>
          <FontAwesomeIcon icon={faFrownOpen} size="7x"/>
        </p>
        <div className="d-flex justify-content-between modal-buttons">
          
          <button class="btn btn-outline btn-block" onClick={this.handleModalDelete}>Close</button>
            
          <button class="btn btn-danger btn-block" onClick={() => this.delete()}>Yes, delete</button>
        </div>
      </ModalBootstrap>
        <div className="d-flex justify-content-between">
          <div className="rank-weekly" onClick={() => this.showRank()}>
            <span>Check out this week's highest impressions!</span>
            <img src={badge}/>
          </div>
          <div className="saved-data" onClick={() => this.showSaved()}>
            <span>See your saved data</span>
            <img src={bookmark}/>
          </div>
        </div>
        <div className="search-bar">
          <FontAwesomeIcon icon={faSearch} size="lg"/>
          <input type="text" className="form-control" id="search" aria-describedby="search" placeholder="Search creative...."
            value={this.state.search} onChange={this.handleSearchChange} name="search" required/>
        </div>

        { !isLoading && 
        <div className="table-outer-container">
        <table className="table-container">
        <thead>
          <tr>
            <th>Asset </th>
            <th>Name <FontAwesomeIcon icon={faSort} size="lg" onClick={() => this.setOrderFrom("name")}/></th>
            <th>Format <FontAwesomeIcon icon={faSort} size="lg" onClick={() => this.setOrderFrom("format")}/></th>
            <th>Size <FontAwesomeIcon icon={faSort} size="lg" onClick={() => this.setOrderFrom("size")}/></th>
            <th>Impressions <FontAwesomeIcon icon={faSort} size="lg" onClick={() => this.setOrderFrom("impressions")}/></th>
            <th>Start Date <FontAwesomeIcon icon={faSort} size="lg" onClick={() => this.setOrderFrom("start_date")}/></th>
            <th>End Date <FontAwesomeIcon icon={faSort} size="lg" onClick={() => this.setOrderFrom("end_date")}/></th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {creatives &&
            creatives.map((creative, index) => (
              <tr key={creative.id}>
                <td>
                  { get_url_extension(creative.format) == "Image" && <img src={creative.asset} class=""/>}
                  { get_url_extension(creative.format) == "Video" &&
                    <video class="" controls>
                      <source src={creative.asset} type="video/mp4"/>
                      Your browser does not support the video tag.
                    </video>}
                </td>
                <td>{creative.name}</td>
                <td>{creative.format}</td>
                <td>{creative.size}</td>
                <td>{creative.impressions}</td>
                <td>{creative.start_date}</td>
                <td>{creative.end_date}</td>
                <td>
                  <div className="d-flex justify-content-between">
                  <span>
                    <Link to={"/add/"+creative.id}>
                      <FontAwesomeIcon icon={faPencilAlt} className="custom-text-primary" size="1x"/>
                    </Link>
                  </span>
                  <span>
                    <a onClick={() => this.setState({ showModalDelete: true, currentCreativeID: creative.id })}>
                      <FontAwesomeIcon icon={faTrashAlt} className="text-danger" size="1x"/>
                    </a>
                  </span>
                  <span>
                    <a onClick={() => this.saveStorage(creative)}>
                      <FontAwesomeIcon icon={faBookmark}  size="1x"/>
                    </a>
                  </span>
                  </div>
                </td>
              </tr>
              ))}
        </tbody>
        </table>
        </div>
        }
        
        {((creatives == null || creatives?.length == 0) && !isLoading)&& <div className="loading no-data">
          <img src={moon} width="200px"/><br/><br/><br/>
            No data!
            </div>}
        { isLoading && <Loading />}
      </div>);
  }
};
