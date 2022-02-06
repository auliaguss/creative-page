import React from 'react';
import '../assets/Loading.css'
import moon from '../assets/moon.png'

export default function Loading() {
  return (
    <div className="loading">
      <span className="loader">
        <img src={moon} />
      </span>
      <br />
    </div>
  )
}
