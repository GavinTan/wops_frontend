import React from 'react';
import {ModalForm, ProFormText} from "@ant-design/pro-form";


const CreateTreeNode: React.FC = (props) => {


  return (
    <ModalForm>
      <ProFormText
        label="名称"
        name="title"
      />
      <ProFormText
        label="名称"
        name="title"
      />
    </ModalForm>
  )
}


export default CreateTreeNode;
