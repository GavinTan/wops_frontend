import {ModalForm, ProFormSelect, ProFormText} from "@ant-design/pro-form";
import React from "react";
import {message} from "antd";
import {createStorage} from "@/services/wops/kvm";


export type CreateFormProps = {
  modalVisible: boolean;
  setModalVisible: (modalVisible: boolean) => void;
  onSubmit: (values: API.StorageItem) => Promise<void>;
  serverId: number;
}

const CreateFormStorage: React.FC<CreateFormProps> = (props) => {

    const handleCreateStorage = async (fields: API.StorageItem) => {
    const hide = message.loading('正在添加');

    try {
      await createStorage({data: fields});
      hide();
      message.success('添加成功');
      return true;
    } catch (error) {
      hide();
      message.error('添加失败，请重试');
      return false;
    }
  };

  return (
    <ModalForm
      title="添加存储池"
      width="400px"
      visible={props.modalVisible}
      onVisibleChange={props.setModalVisible}
      onFinish={props.onSubmit}
      initialValues={{
        serverId: props.serverId,
        stg_type: 'dir'
      }}
      modalProps={{
        forceRender: true,
        destroyOnClose: true,
      }}
    >
      <ProFormText
        label="节点"
        width="md"
        name="serverId"
        hidden
      />
      <ProFormText
        label="名称"
        width="md"
        name="name"
        rules={[{required: true}]}
      />
      <ProFormSelect
        label="类型"
        width="md"
        name="stg_type"
        options={[{label: 'dir', value: 'dir'}]}
      />
      <ProFormText
        label="路径"
        width="md"
        name="target"
        placeholder="/data/kvm"
        rules={[{required: true}]}
      />

    </ModalForm>
  )
};


export default CreateFormStorage;
