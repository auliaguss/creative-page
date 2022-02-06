import React from "react";
const ToastBootstrap = ({caption, show, success}) => {
  return (
    <div>
      <div className={show? "toast position-absolute top-0 end-0 m-4 fade show":"toast position-absolute top-0 end-0 m-4 fade hide"} role="alert">
      <div className={success ? "toast-body custom-bg-primary":"toast-body custom-bg-danger"}>
        {caption}
      </div>
      </div>
    </div>
  );
};

export default ToastBootstrap;