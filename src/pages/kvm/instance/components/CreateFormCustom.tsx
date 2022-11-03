import {AutoComplete, Button, Divider, Input, message, Select, Space, Tooltip} from "antd";
import React, {useState} from "react";
import ProForm, {
  ProFormList,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProFormDigit,
  ProFormCheckbox, ProFormRadio
} from "@ant-design/pro-form";
import {PlusOutlined} from "@ant-design/icons";
import {createStorage, getMedia, getStorage} from "@/services/wops/kvm";
import CreateFormStorage from "./CreateFormStorage";

export type CreateFormProps = {
  serverList: { label: React.ReactNode; value: number; }[];
}

const CreateFormCustom: React.FC<CreateFormProps> = (props) => {
  const [mediaList, setMediaList] = useState<{ label: React.ReactNode; value: string; }[]>([]);
  const [storagePoolList, setStoragePoolList] = useState<{ label: React.ReactNode; value: string; }[]>([]);
  const [poolDiskList, setPoolDiskList] = useState<{ label: React.ReactNode; value: string; }[]>([]);
  const [selectServer, setSelectServer] = useState<number>();
  const [storageVisible, setStorageVisible] = useState(false);
  const [sysDiskType, setSysDiskType] = useState<string>('new')
  const [deviceTypeList, setDeviceTypeList] = useState([
    {label: '光驱', value: 'cdrom'},
    {label: '软盘', value: 'floppy'},
    {label: '磁盘', value: 'disk'},
  ]);


  return (
    <>
      <ProFormText
        name="name"
        label="名称"
        width="lg"
        tooltip="多个创建时名称以下划线数字结尾将自动递增结尾数字，没有以下划线数字结尾将自动从第二个开始会在尾部添加 _1 递增的数字。"
        rules={[{required: true}]}
      />
      <ProFormSelect
        label="服务器"
        name="server"
        width="lg"
        options={props.serverList}
        rules={[{required: true}]}
        fieldProps={{
          filterOption: (input: any, option: any) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0,
          onSelect: (value: number, option: any) => {
            setSelectServer(value);
            getStorage(value).then((res: any) => {
              setStoragePoolList(res.data[option.label]?.map((item: any) => ({
                label: `${item.name} (${item.path})`,
                value: item.name,
              })));
            });
          }
        }}
      />
      <ProFormTextArea
        name="desc"
        width="lg"
        label="描述"
      />
      <Divider/>
      <ProFormRadio.Group
        label="系统硬盘"
        name="sysDiskType"
        options={[{label: '创建新的磁盘', value: 'new'}, {label: '选择现有磁盘', value: 'existing'}]}
        initialValue={'new'}
        fieldProps={{
          onChange: (e) => {
            setSysDiskType(e.target.value)
          }
        }}
      />
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
      <ProForm.Item label="存储池" required>
        <Space>
          <ProForm.Item label="存储池" name="pool" rules={[{required: true}]} noStyle>
            <Select style={{width: 440}} options={storagePoolList} onSelect={(value: string) => {
              getMedia({serverId: selectServer as number, pool: value, type: 'disk'}).then(res => {
                setPoolDiskList(res.data.map(item => ({
                  label: item.name,
                  value: item.path,
                })));
              });
            }}/>
          </ProForm.Item>

          <Tooltip title="添加" color="blue">
            <Button type="link" icon={<PlusOutlined/>} onClick={() => {
              setStorageVisible(true);
            }}/>
          </Tooltip>
        </Space>
      </ProForm.Item>
      {
        sysDiskType === 'existing' &&
        <ProFormSelect label="硬盘文件" name="disk" width="lg" rules={[{required: true}]} options={poolDiskList}/>
      }
      {sysDiskType === 'new' && <ProForm.Item
        label="硬盘大小"
        name="diskSize"
        rules={[{required: true}]}
      >
        <AutoComplete
          style={{width: 440}}
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
      }
      <Divider/>
      <ProFormList
        name="media"
        label="设备"
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
            rules={[{required: true, message: '请选择设备类型'}]}
            fieldProps={{
              onChange: value => {
                getMedia({serverId: selectServer as number, type: value}).then(res => {
                  setMediaList(res.data.map((item: any) => ({
                    label: item.name,
                    value: item.path,
                  })));
                });
              }
            }}
          />
          <ProFormSelect
            width="md"
            name="file"
            options={mediaList}
            fieldProps={{
              showSearch: true,
              filterOption: (input, option) => option!.label!.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0
            }}
            rules={[{required: true, message: '请选择挂载文件'}]}
          />
        </Space>
      </ProFormList>
      <Divider/>
      <ProFormDigit label="数量" name="num" width="lg" initialValue={1}/>
      <ProFormCheckbox tooltip="跟随服务器启动" label="自启" name="autostart" initialValue={false}/>
      <CreateFormStorage
        modalVisible={storageVisible}
        setModalVisible={setStorageVisible}
        serverId={selectServer as number}
        onSubmit={async (values) => {
          const hide = message.loading('正在添加');
          await createStorage({data: values}).then(() => {
            setStoragePoolList([
              ...storagePoolList,
              {label: `${values.name} (${values.target})`, value: values.name}
            ]);
            message.success('添加成功');
            setStorageVisible(false);
          }).finally(() => hide());
        }}
      />
    </>
  )
};

export default CreateFormCustom;
