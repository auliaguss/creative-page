import React, { Component } from 'react';
import { useState } from 'react';
import CreativeService from '../service/creative.service';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from 'axios';
import ModalBootstrap from "./ModalBootstrap";
import {Link} from "react-router-dom";
import "../assets/FormCreative.css";
import { faUpload, faLaughWink, faFrownOpen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Loading from "./Loading";

function formatDate(date) {
  var d = new Date(date),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
}

async function getFileFromUrl(url, name, defaultType = 'image/jpeg'){
  const response = await fetch(url);
  const data = await response.blob();
  return new File([data], name, {
    type: data.type || defaultType,
  });
}

export default class AddCreative extends Component {
  constructor(props){
    super(props);
    this.state = {
      name: "",
      format: "",
      size: "",
      impressions: 0,
      start_date: new Date(),
      end_date: new Date(),
      asset: "",
      assetLocation: "",
      isFormSubmitted: false,
      isEndDateRequired: false,
      isCreativeLoading: false,
      isUploadLoading: false,
      responseUpload: null,
      showLoadingModal: false,
    }
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleAssetChange = this.handleAssetChange.bind(this);
    this.resetForm = this.resetForm.bind(this);
  }
  resetForm(){
    this.props.match.params.id = null
    this.props.history.push('/add')

    this.setState({
      name: "",
      format: "",
      size: "",
      impressions: 0,
      start_date: new Date(),
      end_date: new Date(),
      asset: "",
      assetLocation: "",
      isFormSubmitted: false,
      isEndDateRequired: false,
      isCreativeLoading: false,
      isUploadLoading:false,
      responseUpload: null,
      showLoadingModal: false,
    })
  }
  async componentWillMount(){
    if(this.props.match.params.id){
      this.setState({isCreativeLoading: true})
      CreativeService.get(this.props.match.params.id)
      .then(async (response) => {
        const creative = response.data.data
        const file = await getFileFromUrl(creative.asset, creative.name);
        this.setState({
          name: creative.name,
          format: creative.format,
          size: creative.size,
          impressions: creative.impressions,
          start_date: new Date(creative.start_date),
          end_date: creative.end_date ? new Date(creative.end_date) : new Date(),
          asset: file,
          isEndDateRequired:creative.end_date ? true : false,
          assetLocation: creative.asset,
          isCreativeLoading: false
        })
      })
      .catch(e => {
        console.log(e);
        this.setState({isCreativeLoading: true})
      });
    }
  }

  handleInputChange(e){
    const target = e.target;
    const value = target.value;
    const name = target.name;

    this.setState({ [name]: value })
  }

  handleAssetChange = (event) => {
    let asset = event.target.files;
    if (asset && asset[0]) {
      this.setState({
        asset: asset[0],
        assetLocation: URL.createObjectURL(asset[0])
      });
    }
  };
  async handleSubmit(e){
    this.setState({isFormSubmitted: true})
    if(!(this.state.isEndDateRequired && this.state.end_date < this.state.start_date) && this.state.name && this.state.format && this.state.size && this.state.start_date && !(this.state.impressions < 1000 || this.state.impressions > 1000000)
          && this.isAssetValid() && this.state?.asset?.size <= 10000000){
      await this.submit();
    }
  }
  isAssetValid(){
    return ((this.state.asset?.type?.toLowerCase().includes("video") && this.state.format === "Video") || (this.state.asset?.type?.toLowerCase().includes("image") && this.state.format ==="Image"))
  }
  
  async submit(){
    this.setState({showLoadingModal: true, isUploadLoading:true})
    const requestLink = this.props.match.params.id ?`https://creatives-api.bigads.co/update-creative?userid=aulia&creativeid=${this.props.match.params.id}` : "https://creatives-api.bigads.co/add-creative?userid=aulia";
    const formData = new FormData();
    formData.append("name", this.state.name)
    formData.append("format", this.state.format)
    formData.append("size", this.state.size)
    formData.append("impressions", this.state.impressions)
    formData.append("start_date", formatDate(this.state.start_date))
    formData.append("end_date", ( this.state.isEndDateRequired ? formatDate(this.state.end_date) : ""))
    formData.append("asset", this.state.asset)

    const res = await axios.post(requestLink, formData);
    this.setState({isUploadLoading: false, responseUpload: res.data})
  }
  render() {
    const { isCreativeLoading, name, impressions, start_date, format, size, asset, assetLocation, end_date, responseUpload, isEndDateRequired, isFormSubmitted, showLoadingModal, isUploadLoading } = this.state;
    const id = this.props.match.params.id
    const isAssetValid = this.isAssetValid();
    return(
      <div className="d-flex justify-content-center align-items-center form-box">
        <ModalBootstrap handleModal={() => this.setState({showLoadingModal: false})} show={showLoadingModal} title={isUploadLoading ? "Please wait a moment..." : "Done!"}>
          {isUploadLoading && <Loading />}
          {!isUploadLoading && 
          <div>
            {responseUpload?.success && <FontAwesomeIcon icon={faLaughWink} size="7x"/>}
            {!responseUpload?.success && <div><FontAwesomeIcon icon={faFrownOpen} size="7x"/><br/>Ooops! {responseUpload?.msg}</div>}
            <div className="d-flex justify-content-between modal-buttons">
              <Link to="/" class="btn btn-outline btn-block">Go to view all</Link>
                
              <button class="btn btn-primary btn-block" onClick={this.resetForm}>Add new creative</button>
            </div>
          </div>
          }
          
        </ModalBootstrap>

        
        {(id && isCreativeLoading) && <Loading /> }
        
        {!(id && isCreativeLoading) &&
        <div>
          <div class="form-bg"></div>
          <section class="container">
          {/* <div className="form-row-image"> */}
          { (asset && asset.type !== "video/mp4") && <img src={assetLocation} class="form-image o-f-cover"/>}
          { asset.type === "video/mp4" &&
            <video class="form-image o-f-cover" controls>
              <source src={assetLocation} type="video/mp4"/>
              Your browser does not support the video tag.
            </video>}
          

          { !assetLocation && <div class="form-image-solid"> </div> }
          {/* </div> */}
          <section class="form-text">
            <p>
              <form onSubmit={e => e.preventDefault()}>
                <div className="form-group">
                  <label>Name <span className="text-danger">*</span></label>
                  <input type="text" className="form-control" id="name" aria-describedby="name" placeholder="Ex: John Doe"
                    value={name} onChange={this.handleInputChange} name="name" required/>
                    
                  {(isFormSubmitted && !name) && <div class="text-danger">
                    Required
                  </div>}
                </div>
                <div className="form-group">
                  <label>Impressions <span className="text-danger">*</span></label>
                  <input type="number" className="form-control" id="name" aria-describedby="impressions" placeholder="Ex: 1000"
                    value={impressions} onChange={this.handleInputChange} name="impressions" required/>
                  <div className={(isFormSubmitted && (impressions < 1000 | impressions > 1000000)) ? "text-danger" : ""}>
                    Please put number between 1.000 - 1.000.000
                  </div>
                </div>
                <div className="form-group d-flex">
                  <div className="col date-picker">
                    <label>Start Date <span className="text-danger">*</span></label>
                    <DatePicker selected={start_date} onChange={(date) => this.setState({ start_date: date })} />
                  </div>
                  <div className="col date-picker">
                    <label>End Date</label>
                    <DatePicker selected={end_date} onChange={(date) => this.setState({ end_date: date })} disabled={!isEndDateRequired}/>
                    <input type="checkbox" id="end_date_required" name="is_end_date_required" checked={!isEndDateRequired} onChange={() => this.setState({isEndDateRequired: !this.state.isEndDateRequired})} /> No End Date
                    {(isEndDateRequired && end_date < start_date) && <div class="text-danger">
                      End date shouldn't be earlier than start date
                    </div>}
                  </div>
                </div>
                <div className="form-group d-flex">
                  <div className="col">
                    <label>Format <span className="text-danger">*</span></label>
                    <select className="form-control" id="format" name="format" value={format} onChange={this.handleInputChange}>
                      <option value="">Select</option>
                      <option value="Video">Video</option>
                      <option value="Image">Image</option>
                    </select>
                    {(isFormSubmitted && !format) && <div class="text-danger">
                      Required
                    </div>}
                  </div>
                  <div className="col">
                    <label>Size <span className="text-danger">*</span></label>
                    <select className="form-control" id="size" name="size" value={size} onChange={this.handleInputChange}>
                      <option value="">Select</option>
                      <option value="300x250">300 x 250</option>
                      <option value="300x600">300 x 600</option>
                    </select>
                    {(isFormSubmitted && !size) && <div class="text-danger">
                      Required
                    </div>}
                  </div>
                </div>
              </form>
              <div className="custom-file form-group">
                <div className="col">
                <label>Asset <span className="text-danger">*</span></label>
                <div>
                {format === "Image" && 
                  <span>
                    <input type="file" className="d-none" id="asset-image" name="asset" onChange={this.handleAssetChange}
                      disabled={format === ""} accept=".png, .jpg"/>
                    <label for="asset-image" className={format === "" ? "upload disabled" : "upload"}><FontAwesomeIcon icon={faUpload} size="sm"/>Upload</label>
                    <br/>
                    { format === "Image" &&
                      <span className={((isFormSubmitted && (!isAssetValid || !asset))) ? "text-danger" : ""}>
                        PNG or JPG only.
                      </span>
                    }
                  </span>
                }
                
                {format !== "Image" &&
                  <span>
                    <input type="file" className="d-none" id="asset-video" name="asset" onChange={this.handleAssetChange}
                      disabled={format === ""} accept=".mp4"/>
                    <label for="asset-video" className={format === "" ? "upload disabled" : "upload"}><FontAwesomeIcon icon={faUpload} size="sm"/>Upload</label>
                    <br/>
                    {format === "Video" && 
                      <span className={((isFormSubmitted && ( !isAssetValid || !asset))) ? "text-danger" : ""}>
                        MP4 only.
                      </span>
                    }
                  </span>
                }
                <span className={(isFormSubmitted && this.state?.asset?.size > 10000000) ? "text-danger":""}> Max size 10MB.</span>
                </div>
                </div>
              </div>
              <button onClick={this.handleSubmit} className="btn btn-primary">Submit</button>
            </p>

          </section>
          </section>
        </div>}
        </div>
    )
  }
}