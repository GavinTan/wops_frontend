import ProForm, {ModalForm, ProFormDigit, ProFormSelect, ProFormText} from "@ant-design/pro-form";
import React from "react";
import {AutoComplete, Input, message} from "antd";
import {createStorage} from "@/services/wops/kvm";


export type CreateFormProps = {
  modalVisible: boolean;
  setModalVisible: (modalVisible: boolean) => void;
}

const CreateFormAddTpl: React.FC<CreateFormProps> = (props) => {

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
      title="添加模板"
      width="400px"
      visible={props.modalVisible}
      onVisibleChange={props.setModalVisible}
      onFinish={async (values) => {
        await handleCreateStorage(values);
      }}
      initialValues={{
        node: props.node,
        stg_type: 'dir'
      }}
      modalProps={{
        forceRender: true,
        destroyOnClose: true,
      }}
    >
      <ProFormText
        label="名称"
        width="md"
        name="name"
        rules={[{required: true}]}
      />
      <ProForm.Item label="vCPU" name="vcpu" rules={[{required: true}]}>
        <AutoComplete
          placeholder="1~1024"
          style={{width: 328}}
          options={[
            {value: '1'},
            {value: '2'},
            {value: '4'},
            {value: '8'},
            {value: '16'},
            {value: '32'}
          ]}
          filterOption={(inputValue, option) =>
            option!.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
          }
        />
      </ProForm.Item>
      <ProForm.Item
        label="内存"
        rules={[{required: true}]}
        name="memory"
      >
        <AutoComplete
          style={{width: 328}}
          options={[
            {value: '1024', label: '1GB'},
            {value: '2048', label: '2GB'},
            {value: '4096', label: '4GB'},
            {value: '8192', label: '8GB'},
            {value: '16384', label: '16GB'},
            {value: '32768', label: '32GB'},
          ]}
          filterOption={(inputValue, option) =>
            option!.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
          }
        >
          <Input suffix="MB"/>
        </AutoComplete>
      </ProForm.Item>
      <ProForm.Item
        label="硬盘"
        name="diskSize"
        rules={[{required: true}]}
      >
        <AutoComplete
          style={{width: 328}}
          options={[
            {value: '30'},
            {value: '50'},
            {value: '60'},
            {value: '80'},
            {value: '100'},
            {value: '150'},
            {value: '200'},
            {value: '300'},
            {value: '500'}
          ]}
          filterOption={(inputValue, option) =>
            option!.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
          }
        >
          <Input suffix="GB"/>
        </AutoComplete>
      </ProForm.Item>

    </ModalForm>
  )
};


export default CreateFormAddTpl;
