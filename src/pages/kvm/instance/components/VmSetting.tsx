import React, {useEffect, useState} from "react";
import {FooterToolbar, GridContent} from "@ant-design/pro-layout";
import {Button, Checkbox, Divider, Form, Typography, List, Menu, message, Space, Tooltip} from "antd";
import "./VmSetting.less";
import ProForm, {ProFormDigit, ProFormList, ProFormSelect, ProFormText} from "@ant-design/pro-form";
import {actionInstance, getMedia} from "@/services/wops/kvm";
import {UpOutlined, DownOutlined, DownSquareTwoTone, PlusOutlined, UpSquareTwoTone} from "@ant-design/icons";


type SettingType = {
  value: API.InstanceItem;
};

const VmSetting: React.FC<SettingType> = (props) => {
  const [menuKey, setMenuKey] = useState<string>('');
  const [mediaList, setMediaList] = useState<{ label: React.ReactNode; value: string; }[]>([]);
  const [deviceFormInitData, setDeviceFormInitData] = useState<any>({});
  const [netFormInitData, setNetFormInitData] = useState<any>({});
  const [bootList, setBootList] = useState<string[]>([]);
  const [selectIndex, setSelectIndex] = useState<number>();
  const [upDisabled, setUpDisabled] = useState<boolean>(true);
  const [downDisabled, setDownDisabled] = useState<boolean>(true);
  const [bootMenu, setBootMenu] = useState<boolean>(false);
  const [checkedBootList, setCheckedBootList] = useState<string[]>([]);
  const [memoryFrom] = ProForm.useForm();
  const [cpuFrom] = ProForm.useForm();

  const deviceTypeList = [
    {label: '光驱', value: 'cdrom'},
    {label: '软盘', value: 'floppy'},
    {label: '磁盘', value: 'disk'},
  ];

  const netTypeList = [
    {label: 'virtio', value: 'virtio'},
    {label: 'e1000', value: 'e1000'},
    {label: 'rtl8139', value: 'rtl8139'},
  ];

  const netList = [
    {label: 'br0', value: 'br0'},
    {label: 'lo', value: 'lo'},
  ];


  useEffect(() => {
    const deviceData: any = [];
    const netData: any = [];
    props.value.disks?.forEach(item => {
      deviceData.push({dev: item.dev, type: item.device, file: item.file})
    });

    props.value.networks?.forEach(item => {
      netData.push({nic: item.nic, model: item.model, mac: item.mac})
    });

    setDeviceFormInitData({media: deviceData});
    setNetFormInitData({networks: netData});

    actionInstance({data: {instanceId: props.value.id, action: 'getBoot'}}).then(res => {

      setBootList(res.data.bootlist.map(item => {
      if (item.order) {
        checkedBootList.push(item.dev);
      }
      return item.dev;
      }));

      console.log(checkedBootList)
      setBootMenu(res.data.bootmenu);
    })

  }, [])

  const formListChildren = (action: React.ReactNode, disabled: boolean) => {
    return (
      <div>
        <Space>
          <ProFormText name="dev" hidden/>
          <ProFormSelect
            width="xs"
            name="type"
            placeholder="设备类型"
            options={deviceTypeList}
            rules={[{required: true, message: '请选择设备类型'}]}
            fieldProps={{
              onChange: value => {
                getMedia({serverId: props.value.server?.id as number, type: value}).then(res => {
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
          {action}
        </Space>
      </div>
    )
  };


  const renderChildren = () => {
    switch (menuKey) {
      case 'device':
        return <Form key="device" initialValues={deviceFormInitData} onFinish={async value => {
          const hide = message.loading('更新配置中', 0);
          await actionInstance({
            data: {
              instanceId: props.value.id,
              action: 'setDevice',
              device: value.media
            }
          }).then(() => {
            message.success('更新配置成功，关机后生效');
          }).finally(() => hide());
        }}>
          <ProFormList
            name="media"
            creatorButtonProps={{
              style: {width: 440},
              position: 'bottom',
              creatorButtonText: '添加挂载',
            }}
            copyIconProps={false}
            itemRender={(doms, {record}) => {
              let disabled = false;
              if (deviceFormInitData.media.includes(record)) {
                disabled = true;
              }
              return formListChildren(doms.action, disabled);

            }}
          >

          </ProFormList>
          <Divider style={{marginTop: 60}}/>
          <Button style={{float: "right"}} type="primary" htmlType="submit">应用</Button>

        </Form>
      case 'net':
        return <Form key="net" initialValues={netFormInitData} onFinish={async value => {
          const hide = message.loading('更新配置中', 0);
          await actionInstance({
            data: {
              instanceId: props.value.id,
              action: 'setNet',
              device: value.media
            }
          }).then(() => {
            message.success('更新配置成功，关机后生效');
          }).finally(() => hide())
        }}>
          <ProFormList
            name="networks"
            creatorButtonProps={{
              style: {width: 440},
              position: 'bottom',
              creatorButtonText: '添加网卡'
            }}
            copyIconProps={false}
            creatorRecord={() => {
              const mac = "XX:XX:XX:XX:XX:XX".replace(/X/g, function () {
                return "0123456789ABCDEF".charAt(Math.floor(Math.random() * 16));
              });
              return {mac};
            }}
          >
            <Space>
              <ProFormText
                name="mac"
              />
              <ProFormSelect
                name="nic"
                options={netList}
                rules={[{required: true, message: '请选择设备'}]}
              />
              <ProFormSelect
                name="model"
                options={netTypeList}
                rules={[{required: true, message: '请选择设备类型'}]}
              />
            </Space>
          </ProFormList>
          <Divider style={{marginTop: 60, width: '100%'}}/>
          <Button style={{float: "right"}} type="primary" htmlType="submit">应用</Button>

        </Form>;
      case 'boot': {
        return <Form initialValues={{bootmenu: bootMenu, boot: checkedBootList}} onFinish={async value => {
          console.log(value)
          const hide = message.loading('更新配置中', 0);
          await actionInstance({
            data: {
              instanceId: props.value.id,
              action: 'setBoot',
              bootmenu: value.bootmenu,
              boot: bootList.filter(item => value.boot?.includes(item))
            }
          }).then(() => {
            message.success('更新配置成功，关机后生效');
          }).finally(() => hide())
        }}
        >
          <Form.Item name="bootmenu" valuePropName="checked" style={{marginBottom: 20}}>
            <Checkbox>启动引导菜单</Checkbox>
          </Form.Item>
          <Form.Item>
            <Space align="center">
              <div className="boot-box">
                <Form.Item name="boot" noStyle>
                <Checkbox.Group>
                  <Space direction="vertical">
                    {bootList.map((value, index) =>
                      <div className={selectIndex === index ? 'boot-box-select' : ''} key={value}
                           onClick={() => {
                             setSelectIndex(index);
                             if (index === 0) {
                               setUpDisabled(true);
                               setDownDisabled(false);
                             } else if (index + 1 === bootList.length) {
                               setUpDisabled(false);
                               setDownDisabled(true);
                             } else {
                               setUpDisabled(false);
                               setDownDisabled(false);
                             }
                           }}><Checkbox style={{margin: '0px 5px 0px'}} value={value}/><span
                        style={{cursor: 'default'}}>{value}</span></div>
                    )}
                  </Space>
                </Checkbox.Group>
                </Form.Item>
              </div>
              <Space direction="vertical" size={10}>
                <Button size="small" icon={<UpOutlined/>} disabled={upDisabled} onClick={() => {
                  const index = selectIndex as number;
                  const newIndex = index - 1;

                  if (newIndex === 0) {
                    setUpDisabled(true);
                    setDownDisabled(false);
                  }

                  [bootList[newIndex], bootList[index]] = [bootList[index], bootList[newIndex]];

                  setSelectIndex(newIndex);
                }}/>
                <Button size="small" icon={<DownOutlined/>} disabled={downDisabled} onClick={() => {
                  const index = selectIndex as number;
                  const newIndex = index + 1;

                  if (newIndex + 1 === bootList.length) {
                    setUpDisabled(false);
                    setDownDisabled(true);
                  }

                  [bootList[newIndex], bootList[index]] = [bootList[index], bootList[newIndex]];

                  setSelectIndex(newIndex);
                }}/>
              </Space>
            </Space>
          </Form.Item>
          <Divider style={{marginTop: 60}}/>
          <Button style={{float: "right"}} type="primary" htmlType="submit">应用</Button>
        </Form>;
      }
      case 'cpu': {
        return <Form
          form={cpuFrom}
          wrapperCol={{span: 5, offset: 1}}
          layout="horizontal"
          key="cpu"
          initialValues={{
            vcpu: props.value.vcpu,
            maxVcpu: props.value.max_vcpu
          }}
          onFinish={async value => {
            const hide = message.loading('更新配置中', 0);
          await actionInstance({
            data: {
              instanceId: props.value.id,
              action: 'setCpu',
              vcpu: value.vcpu,
              maxVcpu: value.maxVcpu
            }
          }).then((res) => {
            if (res.errmsg) {
              message.error(res.errmsg);
              return false;
            }
            message.success( '更新配置成功，配置关机后生效');
            return true;
          }).finally(() => hide())
          }}
        >
          <ProFormDigit
            tooltip={`服务器CPU: ${props.value.server.cpu}`}
            label="当前分配"
            name="vcpu"
            fieldProps={{
              min: 1,
              max: props.value.server.cpu,
              onChange: (value) => {
                if (value > cpuFrom.getFieldValue('maxVcpu')) {
                  cpuFrom.setFieldsValue({maxVcpu: value});
                }
              }
            }}
          />
          <ProFormDigit
            tooltip={`服务器CPU: ${props.value.server.cpu}`}
            label="最大分配"
            name="maxVcpu"
            fieldProps={{
              min: 1,
              max: props.value.server.cpu,
              onChange: (value) => {
                if (value < cpuFrom.getFieldValue('vcpu')) {
                  cpuFrom.setFieldsValue({vcpu: value});
                }
              }
            }}
          />
          <Divider style={{marginTop: 60}}/>
          <Button style={{float: "right"}} type="primary" htmlType="submit">应用</Button>
        </Form>
      }
      case 'memory': {
        return <Form
          wrapperCol={{span: 6, offset: 1}}
          layout="horizontal"
          key="memory"
          form={memoryFrom}
          initialValues={{
            memory: props.value.memory?.replace(/\D/g,''),
            maxMemory: props.value.max_memory?.replace(/\D/g,'')
          }}
        >
          <ProFormDigit
            label="当前分配"
            name="memory"
            tooltip={`服务器内存: ${props.value.server.memory}`}
            fieldProps={{
              addonAfter: 'GB',
              min: 1,
              max: props.value.server.memory!.replace(/\D/g,''),
              onChange: (value) => {
                if (value > memoryFrom.getFieldValue('maxMemory')) {
                  memoryFrom.setFieldsValue({maxMemory: value});
                }
              }
            }}
          />
          <ProFormDigit
            label="最大分配"
            name="maxMemory"
            tooltip={`服务器内存: ${props.value.server.memory}`}
            fieldProps={{
              addonAfter: 'GB',
              min: 1,
              max: props.value.server.memory!.replace(/\D/g,''),
              onChange: (value) => {
                if (value < memoryFrom.getFieldValue('currentMemory')) {
                  memoryFrom.setFieldsValue({currentMemory: value});
                }
              }
            }}
          />
          <Divider style={{marginTop: 60}}/>
          <Button style={{float: "right"}} type="primary" htmlType="submit">应用</Button>
        </Form>
        }
      default:
        return null;
    }
  };

  return (
    <>
      <GridContent>
        <div
          className="main"
        >
          <div className="leftMenu">
            <Menu
              onClick={({key}) => setMenuKey(key)}
            >
              <Menu.Item key="cpu">CPU配置</Menu.Item>
              <Menu.Item key="memory">内存配置</Menu.Item>
              <Menu.Item key="net">网络配置</Menu.Item>
              <Menu.Item key="boot">引导选项</Menu.Item>
            </Menu>
          </div>
          <div className="right">
            {renderChildren()}
          </div>
        </div>
      </GridContent>

    </>
  );
};


export default VmSetting;
