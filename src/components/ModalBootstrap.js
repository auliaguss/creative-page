import React from "react";
import {Modal} from 'react-bootstrap';

const ModalBootstrap = ({ title, show, handleModal, children }) => {
  return (
    <div>
      <Modal show={show} onHide={handleModal}>
        <div className="modal-body text-center">
          <h3>{title}</h3>
          {children}
        </div>
        </Modal>
    </div>
  );
};

export default ModalBootstrap;