import React, {useEffect, useState} from "react";
import type {FormInstance} from "antd";
import {Button, Col, Divider, Space, Table} from "antd";
import ProForm, {
  ProFormCheckbox,
  ProFormDigit,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProFormTextArea
} from "@ant-design/pro-form";
import CreateFormAddTpl from "./CreateFormAddTpl";


export type CreateFormProps = {
  form: FormInstance
  nodeList: { label: React.ReactNode; value: number; }[];
}


interface DataType {
  key: React.Key;
  name: string;
  vcpu: number;
  memory: string;
  diskSize: string;
  pool: string;
  image: string;
}

const CreateFormTpl: React.FC<CreateFormProps> = (props) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>(['1']);
  const [addTplVisible, setAddTplVisible] = useState(false);

  const columns = [
    {
      title: '名称',
      dataIndex: 'name'
    },
    {
      title: 'vCPU',
      dataIndex: 'vcpu'
    },
    {
      title: '内存',
      dataIndex: 'memory'
    },
    {
      title: '硬盘',
      dataIndex: 'diskSize'
    },
    {
      title: '存储池',
      dataIndex: 'pool'
    },
    {
      title: '镜像',
      dataIndex: 'image'
    },
    {
      title: '操作',
       key: 'action',
    render: (text, record) => (
      <Space size="middle">
        <a>编辑</a>
        <a>删除</a>
      </Space>
    ),
    }
  ];


  const data: DataType[] = [
    {
      key: '1',
      name: 't1',
      vcpu: 2,
      memory: '2.0G',
      diskSize: '30G',
      pool: 'tt2',
      image: 'win7.iso'
    },
    {
      key: '2',
      name: 't2',
      vcpu: 4,
      memory: '4.0G',
      diskSize: '30G',
      pool: 'tt2',
      image: 'win7.iso'
    },
    {
      key: '3',
      name: 't3',
      vcpu: 8,
      memory: '8.0G',
      diskSize: '30G',
      pool: 'tt2',
      image: 'win7.iso'
    },
    {
      key: '4',
      name: 't4',
      vcpu: 8,
      memory: '16.0G',
      diskSize: '30G',
      pool: 'tt2',
      image: 'win7.iso'
    }
  ];

  useEffect(() => {
    data.forEach(value => value.key === '1' && props.form.setFieldsValue({tpl: value}))
  }, [])


  return (
    <>
      <ProFormText
        name="name"
        label="名称"
        width="lg"
        rules={[{required: true}]}
      />
      <ProFormSelect
        label="节点"
        name="node"
        width="lg"
        rules={[{required: true}]}
        options={props.nodeList}
      />
      <ProFormTextArea
        name="desc"
        width="lg"
        label="描述"
      />
      <Divider/>
      <ProFormText name="tpl" hidden/>
      <ProForm.Item label="模板">
        <Col span={14}>
        <Button  size="small" style={{marginBottom: 10, float: "right"}} onClick={() => setAddTplVisible(true)}>添加模板</Button>
        <Table
          columns={columns}
          rowSelection={{
            type: 'radio',
            onSelect: (record) => {
              setSelectedRowKeys([record.key])
              props.form.setFieldsValue({tpl: record})
            }, selectedRowKeys
          }}
          dataSource={data}
          onRow={(record: DataType) => ({
            onClick: () => {
              // let selectedRow = [...selectedRowKeys]
              // if (selectedRowKeys.indexOf(record.key) >= 0) {
              //   selectedRow.splice(selectedRowKeys.indexOf(record.key), 1);
              // } else {
              //   selectedRow = [record.key]
              // }
              setSelectedRowKeys([record.key])
              props.form.setFieldsValue({tpl: record})
            },
          })}
        />
        </Col>
      </ProForm.Item>
      <Divider/>
      <ProFormDigit label="数量" name="num" width="lg" initialValue={1}/>
      <ProFormCheckbox label="自启" name="autostart" fieldProps={{checked: true}}/>
      <CreateFormAddTpl modalVisible={addTplVisible} setModalVisible={setAddTplVisible}/>
    </>
  );
}


export default CreateFormTpl;
