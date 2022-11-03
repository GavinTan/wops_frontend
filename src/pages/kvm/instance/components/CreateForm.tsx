import React, {useEffect, useState} from 'react';
import {AutoComplete, Button, Input, message, Modal, Select, Space, Tooltip, Upload} from 'antd';
import {getStorage, createStorage, getMedia} from '@/services/wops/kvm'
import ProForm, {
  ModalForm, ProFormList,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  StepsForm,
} from '@ant-design/pro-form';
import {CloudUploadOutlined, InfoCircleOutlined, PlusOutlined} from "@ant-design/icons";

export type FormValueType = {
  disk?: string,
  storage?: string,
  image?: string,
  floppy?: string
} & Partial<API.VmItem>;

export type CreateFormProps = {
  onCancel: (flag?: boolean, formVals?: FormValueType) => void;
  onSubmit: (values: FormValueType) => Promise<void>;
  createModalVisible: boolean;
  nodeList: { label: React.ReactNode; value: number; }[];
  // floppyList: { label: React.ReactNode; value: number; }[];
  // imageList: { label: React.ReactNode; value: number; }[];
  // storageList: { label: React.ReactNode; value: number; }[];
};


const CreateForm: React.FC<CreateFormProps> = (props) => {
  const [mediaList, setMediaList] = useState<{ label: React.ReactNode; value: number; }[]>([]);
  const [storagePoolList, setStoragePoolList] = useState<{ label: React.ReactNode; value: number; }[]>([]);
  const [fileList, setFileList] = useState<{ label: React.ReactNode; value: number; }[]>([]);
  const [deviceTypeList, setDeviceTypeList] = useState([
    {label: '光驱', value: 'cdrom'},
    {label: '软盘', value: 'floppy'},
    {label: '磁盘', value: 'disk'},
  ]);
  const [selectNode, setSelectNode] = useState<number>();
  const [storageVisible, setStorageVisible] = useState(false);


  const handleCreateStorage = async (fields: API.RuleListItem) => {
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
    <><ModalForm
      title="添加存储池"
      width="400px"
      visible={storageVisible}
      onVisibleChange={setStorageVisible}
      onFinish={async (values) => {
        await handleCreateStorage(values);
      }}
      initialValues={{
        node: selectNode,
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
        name="node"
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
      <StepsForm
        stepsProps={{
          size: 'small',
        }}
        stepsFormRender={(dom, submitter) => {
          return (
            <Modal
              width={640}
              bodyStyle={{
                padding: '32px 40px 48px',
              }}
              forceRender
              destroyOnClose
              title="新建虚拟机"
              visible={props.createModalVisible}
              footer={submitter}
              onCancel={() => {
                props.onCancel();
              }}
            >
              {dom}
            </Modal>
          );
        }}
        onFinish={props.onSubmit}
      >
        <StepsForm.StepForm
          title="基本信息"
        >
          <ProFormText
            name="name"
            label="名称"
            width="lg"
            rules={[{required: true}]}
          />
          <ProForm.Item label="节点" name="node" rules={[{required: true}]}>
            <Select
              style={{width: 440}}
              options={props.nodeList}
              showSearch
              allowClear
              placeholder="请选择"
              filterOption={(input: any, option: any) =>
                option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              onSelect={(value: number, option: any) => {
                setSelectNode(value);
                getStorage({id: value}).then((res: any) => {
                  setStoragePoolList(res[option.label].map((item: any) => ({
                    label: `${item.name} (${item.path})`,
                    value: item.name,
                  })))
                })

                getMedia({nodeId: value}).then(res => {
                  setMediaList(res.data.map((item: any) => ({
                    label: item,
                    value: item,
                  })))
                })
              }}
            />
          </ProForm.Item>
          <ProFormTextArea
            name="desc"
            width="lg"
            label="描述"
          />
        </StepsForm.StepForm>
        <StepsForm.StepForm
          initialValues={{}}
          title="虚拟机配置"
        >
          <ProForm.Item label="CPU" name="vcpu" rules={[{required: true}]}>
            <AutoComplete
              placeholder="1~1024"
              style={{width: 440}}
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
            tooltip={{title: 'MB', icon: <InfoCircleOutlined/>}}
          >
            <AutoComplete
              style={{width: 440}}
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
            tooltip={{title: 'GB', icon: <InfoCircleOutlined/>}}
          >
            <AutoComplete
              style={{width: 440}}
              options={[
                {value: '10'},
                {value: '20'},
                {value: '30'},
                {value: '50'},
                {value: '60'},
                {value: '80'},
                {value: '100'}
              ]}
              filterOption={(inputValue, option) =>
                option!.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
              }
            >
              <Input suffix="GB"/>
            </AutoComplete>
          </ProForm.Item>
          <Space>
            <ProFormSelect
              width="lg"
              label="存储池"
              name="pool"
              options={storagePoolList}
            />
            <Tooltip title="添加" color="blue">
              <Button type="link" icon={<PlusOutlined/>} onClick={() => {
                setStorageVisible(true)
              }}/>
            </Tooltip>
          </Space>
        </StepsForm.StepForm>
        <StepsForm.StepForm
          initialValues={{}}
          title="挂载"
        >
          <ProFormList
            name="media"
            creatorButtonProps={{
              style: {width: 440},
              position: 'bottom',
              creatorButtonText: '添加挂载',

            }}
          >
            <Space>
              <ProFormSelect
                width="xs"
                name="type"
                placeholder="设备类型"
                options={deviceTypeList}
              />
              <ProFormSelect
                width="md"
                name="file"
                options={mediaList}
                fieldProps={{
                  showSearch: true,
                  filterOption: (input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }}
              />
              {/*<ProForm.Item>*/}
              {/*  <Upload*/}
              {/*    action={API_UPLOAD_URL}*/}
              {/*    showUploadList={false}*/}
              {/*    onChange={(info) => {*/}
              {/*      if (info.file.status === 'done') {*/}
              {/*        message.success(`${info.file.name} 上传成功`);*/}
              {/*        handleGetFileList()*/}
              {/*      } else if (info.file.status === 'error') {*/}
              {/*        message.error(`${info.file.name} 上传失败`);*/}
              {/*      }*/}
              {/*    }*/}
              {/*    }*/}
              {/*  >*/}
              {/*    <Tooltip title="上传" color="blue">*/}
              {/*      <Button type="link" icon={<CloudUploadOutlined/>}/>*/}
              {/*    </Tooltip>*/}
              {/*  </Upload>*/}
              {/*</ProForm.Item>*/}
            </Space>
          </ProFormList>

        </StepsForm.StepForm>
      </StepsForm>
    </>
  );
};

export default CreateForm;
