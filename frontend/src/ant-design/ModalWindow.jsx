import React, { useState } from 'react';
import { Button, Modal } from 'antd';
import { useModal } from '../context';

const ModalWindow = ({
  userModalCloseTiming = 2000,
  children
}) => {

  // useModal context:
  const { openModal, closeModal, modalType } = useModal();

  const handleCancel = () => {
    // console.log('Clicked cancel button');
    closeModal();
  };
  return (
    <>

      <Modal
        open={modalType} // open the modal only if it has a type set.
        onCancel={handleCancel}
        footer={null}
        closeIcon={null}
        style={{padding: 0}}
        maskClosable
      >
        {children}
      </Modal>
    </>
  );
};
export default ModalWindow;