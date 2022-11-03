import {FolderFilled, PlusOutlined, DownOutlined} from '@ant-design/icons';
import {Button, message, Input, Tree, Row, Col, Space, Tooltip} from 'antd';
import React, {useState, useRef, useEffect} from 'react';
import {PageContainer, FooterToolbar, GridContent} from '@ant-design/pro-layout';
import type {ProColumns, ActionType} from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import ProForm, {ModalForm, ProFormSelect, ProFormText, ProFormTextArea} from '@ant-design/pro-form';
import {
  getAssetTree,
  createAssetTreeNode,
  deleteAssetTreeNode,
  getAllAsset,
  addAsset,
  getAllProxy, deleteAsset, updateAsset, getAllProxyPlatform, createProxy, createProxyPlatform
} from "@/services/wops/assets";
import {Menu, Item, Separator, Submenu, animation, useContextMenu} from 'react-contexify';
import XLSX from 'xlsx';
import 'react-contexify/dist/ReactContexify.css';
import './index.less'
import AssetInfoModal from "./components/AssetInfo";
import UpdateFormAsset from "@/pages/assets/vm/components/UpdateFormAsset";
import CreateFormProxy from "@/pages/assets/proxy/components/CreateFormProxy";
import CreateFormProxyPlatform from "@/pages/assets/proxy/components/CreateFormProxyPlatform";


const handleCreate = async (fields: API.AssetItem) => {
  const hide = message.loading('正在添加');

  try {
    await addAsset({data: fields});
    hide();
    message.success('添加成功');
    return true;
  } catch (error) {
    hide();
    message.error('添加失败, 请重试!');
    return false;
  }
};

const handleCreateProxy = async (fields: API.ProxyItem) => {
  const hide = message.loading('正在添加');

  try {
    await createProxy({data: fields});
    hide();
    message.success('添加成功');
    return true;
  } catch (error) {
    hide();
    message.error('添加失败, 请重试!');
    return false;
  }
};

const handleCreateProxyPlatform = async (fields: API.ProxyPlatformItem) => {
  const hide = message.loading('正在添加');

  try {
    await createProxyPlatform({data: fields});
    hide();
    message.success('添加成功');
    return true;
  } catch (error) {
    hide();
    message.error('添加失败, 请重试!');
    return false;
  }
};

const handleUpdate = async (fields: API.AssetItem) => {
  const hide = message.loading('正在编辑');

  try {
    await updateAsset(fields.id as number, {data: fields});
    hide();
    message.success('编辑成功');
    return true;
  } catch (error) {
    hide();
    message.error('编辑失败, 请重试!');
    return false;
  }
};
/**
 *  Delete node
 * @zh-CN 删除虚拟机资产
 *
 * @param selectedRows
 */

const handleDelete = async (selectedRows: API.AssetItem[]) => {
  const hide = message.loading('正在删除');
  if (!selectedRows) return true;

  try {
    await deleteAsset({data: {ids: selectedRows.map(item => item.id)}});
    hide();
    message.success('删除成功');
    return true;
  } catch (error) {
    hide();
    message.error('删除失败, 请重试!');
    return false;
  }
};

const TableList: React.FC = () => {

  const [createModalVisible, setCreateModalVisible] = useState<boolean>(false);
  const [createProxyVisible, setCreateProxyVisible] = useState<boolean>(false);
  const [createProxyPlatformVisible, setCreateProxyPlatformVisible] = useState<boolean>(false);
  const [updateModalVisible, setUpdateModalVisible] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.AssetItem>();
  const [selectedRowsState, setSelectedRows] = useState<API.RuleListItem[]>([]);
  const [treeData, setTreeData] = useState<API.TreeNodeItem[]>([]);
  const {show} = useContextMenu({id: 'assetTree'});
  const [rightClickTreeNode, setRightClickTreeNode] = useState<any>();
  const [selectTreeNode, setSelectTreeNode] = useState<any>();
  const [searchValue, setSearchValue] = useState<string>('');
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [autoExpandParent, setAutoExpandParent] = useState<boolean>(false);
  const [treeNodeEdit, setTreeNodeEdit] = useState<boolean>(false);
  const [tableParams, setTableParams] = useState({});
  const [treeList, setTreeList] = useState<any>([]);
  const [tableData, setTableData] = useState<API.AssetItem[]>([]);
  const [assetInfoModalVisible, setAssetInfoModalVisible] = useState<boolean>(false);
  const [proxySelect, setProxySelect] = useState<any>([]);
  const [proxyPlatformSelect, setProxyPlatformSelect] = useState<any>([]);



  const getData = () => {
    getAssetTree().then(res => {
      setTreeData(res.data);
    });

    getAssetTree({a: 'get_list'}).then(res => {
      setTreeList(res.data.map(item => {
        if (item.key === '0-0') {
          setSelectTreeNode(item.id);
        }
        return {label: item.title, value: item.id};
      }))
    })
  };

  const getProxyData = () => {
    getAllProxy().then(res => setProxySelect(res.data?.map(item => ({label: item.ip, value: item.id}))));
  };

  const getProxyPlatformData = () => {
    getAllProxyPlatform().then(res => {
      setProxyPlatformSelect(res.data?.map(item => ({label: item.name, value: item.id})))
    });
  };

  useEffect(() => {
    getData();
    getProxyData();
    getProxyPlatformData();
    setExpandedKeys(['0-0']);
  }, []);

  const columns: ProColumns<API.AssetItem>[] = [
    {
      title: '名称',
      dataIndex: 'name',
      render: (text, row) => {
        return (
          <a
            onClick={() => {
              setCurrentRow(row);
              setAssetInfoModalVisible(true);
            }}
          >
            {text}
          </a>
        );
      },
    },
    {
      title: 'IP',
      dataIndex: 'ip',
      valueType: 'text',
    },
    {
      title: '代理',
      dataIndex: 'proxy',
      valueType: 'text',
      renderText: text => text?.ip
    },
    {
      title: '描述',
      dataIndex: 'desc',
      valueType: 'textarea',
      ellipsis: true
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      valueType: 'dateTime'
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (text, record) => [
        <a
          key="edit"
          onClick={() => {
            setCurrentRow(Object.assign(record, {proxy: record.proxy?.id, proxySelect, treeList}));
            setUpdateModalVisible(true);
          }}
        >
          编辑
        </a>,
        <a key="delete" onClick={async () => {
          const success = await handleDelete([record]);

          if (success) {
            actionRef.current?.reload();
          }
        }}>
          删除
        </a>,
      ],
    },
  ];

  const handleTreeData = (data: any, key: string, value: any) => data.map((item: any) => {
    if (item.key === key) {
      if (value.isEdit) {
        item.children?.push(value)
      }
    }

    if (item.key === value.key && !value.isEdit) {
      Object.assign(item, {title: value.title, isEdit: false});
    }

    if (item.key === value.key && value.isEdit) {
      Object.assign(item, {isEdit: true});
    }

    if (item.children) {
      handleTreeData(item.children, key, value)
    }
    return item
  })

  const dataList: { key: string; title: string; }[] = [];
  const generateList = (data: any[]) => {
    data.forEach(item => {
      const {key, title} = item;
      dataList.push({key, title});
      if (item.children) {
        generateList(item.children);
      }
    })
  };
  generateList(treeData);

  const getParentKey = (key: string, tree: API.TreeNodeItem[]) => {
    let parentKey = '';
    for (let i = 0; i < tree.length; i += 1) {
      const node = tree[i];
      if (node.children) {
        if (node.children.some(item => item.key === key)) {
          parentKey = node.key;
        } else if (getParentKey(key, node.children)) {
          parentKey = getParentKey(key, node.children);
        }
      }
    }
    return parentKey;
  };

  const loop: any = (data: any[]) => {
    return data.map(item => {
      const index = item.title.indexOf(searchValue || 'null');
      const beforeStr = item.title.substr(0, index);
      const afterStr = item.title.substr(index + searchValue.length);
      let title

      if (index > -1) {
        title =
          <span>
            <FolderFilled style={{marginRight: 5}}/>
            {beforeStr}
            <span className="site-tree-search-value">{searchValue}</span>
            {afterStr}
          </span>
      } else if (item.isEdit) {
        title =
          <Input autoFocus className="input-underline" size={"small"} defaultValue={item.title} onBlur={async e => {
            const {value} = e.target
            if (value.length > 0) {
              if (treeNodeEdit) {
                const newData = Object.assign(item, {title: value});
                delete newData.children;
                delete newData.isEdit;
                await createAssetTreeNode({data: newData}).then(() => {
                  setTreeNodeEdit(false);
                  message.success('更新节点成功')
                })
              } else {
                const newData = {
                  title: value,
                  key: `${rightClickTreeNode.pos}-${rightClickTreeNode.children.length}`,
                  parent: rightClickTreeNode.pos
                };
                await createAssetTreeNode({data: newData}).then(() => {
                  message.success('添加节点成功');
                })
              }
            }
            getData();
          }}/>
      } else {
        title = <span><FolderFilled style={{marginRight: 5}}/>{item.title}</span>
      }
      if (item.children) {
        return {title, key: item.key, children: loop(item.children)};
      }
      return {
        title,
        key: item.key,
      };
    });
  }

  return (
    <PageContainer>
      <Menu id='assetTree' animation={animation.slide}>
        <Item onClick={async () => {
          const value =
            {
              title: '',
              key: `${rightClickTreeNode.pos}-${rightClickTreeNode.children.length}`,
              parent: rightClickTreeNode.pos,
              children: [],
              isEdit: true
            };
          const newTreeData = handleTreeData(treeData, rightClickTreeNode.key, value);
          setTreeData(newTreeData);
          setExpandedKeys([value.key]);
          setAutoExpandParent(true);
        }}>
          新建节点
        </Item>
        <Item onClick={() => {
          const {key} = rightClickTreeNode;
          setTreeNodeEdit(true);
          setTreeData(handleTreeData(treeData, '', {key, isEdit: true}));
        }}>
          重命名
        </Item>
        <Separator/>
        <Item onClick={async () => {
          const {key} = rightClickTreeNode;
          await deleteAssetTreeNode({data: {key}}).then(() => {
            message.success('删除节点成功');
            getData();
          });
        }}>
          删除节点
        </Item>
        <Separator/>
        <Submenu label="Submenu">
          <Item>
            Sub Item 1
          </Item>
          <Item>Sub Item 2</Item>
        </Submenu>
      </Menu>
      <GridContent>
        <Row gutter={24}>
          <Col lg={6} md={24}>
            <Input.Search
              size="small"
              onChange={e => {
                const {value} = e.target;
                const keys: any[] = dataList.map(item => {
                  if (value && item.title.indexOf(value) > -1) {
                    return getParentKey(item.key, treeData);
                  }
                  return null;
                }).filter((item, i, self) => item && self.indexOf(item) === i);
                setExpandedKeys(keys.length > 0 ? keys : ['0-0']);
                setAutoExpandParent(true);
                setSearchValue(value);
              }}
            />
            <Tree
              style={{backgroundColor: '#f0f2f5'}}
              onContextMenu={show}
              treeData={loop(treeData)}
              expandedKeys={expandedKeys}
              autoExpandParent={autoExpandParent}
              onExpand={expandedKeysValue => {
                setExpandedKeys(expandedKeysValue);
                setAutoExpandParent(false);
              }}
              onRightClick={e => {
                setRightClickTreeNode(e.node);
              }}
              onSelect={(selectedKeys, e) => {
                if (e.selected) {
                  getAssetTree({a: 'get_list'}).then(res => {
                    res.data.forEach(item => {
                      if (item.key === e.node.key) {
                        setSelectTreeNode(item.id);
                      }
                    })
                  })
                  setTableParams({treeKey: e.node.key});
                }
              }}
            />
          </Col>
          <Col lg={18} md={24}>
            <ProTable<API.AssetItem, API.PageParams>
              headerTitle={'资产列表'}
              actionRef={actionRef}
              id={'aa'}
              rowKey="id"
              search={{
                labelWidth: 120,
              }}
              toolBarRender={() => [
                <Button
                  type="primary"
                  key="primary"
                  onClick={() => {
                    setCreateModalVisible(true);
                  }}
                >
                  <PlusOutlined/> 新建
                </Button>,
                <Button onClick={() => {
                  const workbook = XLSX.utils.book_new();
                  const ws = XLSX.utils.json_to_sheet(tableData);
                  XLSX.utils.book_append_sheet(workbook, ws, "Sheet1");
                  XLSX.writeFile(workbook, 'assets.xlsb');
                }}>
                  导出数据
                  <DownOutlined/>
                </Button>
              ]}
              params={tableParams}
              request={getAllAsset}
              columns={columns}
              postData={data => {
                getAssetTree({a: 'get_list'}).then(res => {
                  const exportData = data.map(item => {
                    const v = {...item};
                    delete v.update_time;
                    delete v.create_time;
                    res.data.forEach(tree => {
                      if (tree.id === v.tree_node) {
                        v.tree_node = tree.title;
                      }
                    })
                    return v
                  })
                  setTableData(exportData);
                })
                return data
              }}
              rowSelection={{
                onChange: (_, selectedRows) => {
                  setSelectedRows(selectedRows);
                },
              }}
            />
            {selectedRowsState?.length > 0 && (
              <FooterToolbar
                extra={
                  <div>
                    已选择{' '}
                    <a
                      style={{
                        fontWeight: 600,
                      }}
                    >
                      {selectedRowsState.length}
                    </a>{' '}
                    项
                  </div>
                }
              >
                <Button
                  onClick={async () => {
                    await handleDelete(selectedRowsState);
                    setSelectedRows([]);
                    actionRef.current?.reloadAndRest?.();
                  }}
                >
                  批量删除
                </Button>
                <Button type="primary">批量迁移</Button>
              </FooterToolbar>
            )}
            {createModalVisible && <ModalForm
              title={'新建资产'}
              width="400px"
              visible={createModalVisible}
              onVisibleChange={setCreateModalVisible}
              onFinish={async (value) => {
                const success = await handleCreate(value as API.AssetItem);

                if (success) {
                  setCreateModalVisible(false);

                  if (actionRef.current) {
                    actionRef.current.reload();
                  }
                }
              }}
            >
              <ProFormText
                rules={[{required: true}]}
                width="md"
                name="name"
                label="名称"
              />
              <ProFormText
                rules={[{required: true}]}
                width="md"
                name="ip"
                label="IP"
              />
              <ProForm.Item
                noStyle
              >
                <Space>
                  <ProFormSelect
                    name="proxy"
                    label="代理"
                    width="md"
                    options={proxySelect}
                  />
                  <Tooltip title="添加" color="blue">
                    <Button type="link" icon={<PlusOutlined/>} onClick={() => {
                      setCreateProxyVisible(true);
                    }}/>
                  </Tooltip>
                </Space>
              </ProForm.Item>
              <ProFormSelect
                width="md"
                name="tree_node"
                label="节点"
                options={treeList}
                initialValue={selectTreeNode}
              />
              <ProFormTextArea label="描述" width="md" name="desc"/>
            </ModalForm>
            }
            {createProxyVisible && <CreateFormProxy
              visible={createProxyVisible}
              onFinish={async value => {
                const success = await handleCreateProxy(value as API.ProxyItem);

                if (success) {
                  setCreateProxyVisible(false);
                  getProxyData();
                }
              }}
              onVisibleChange={setCreateProxyVisible}
              onClick={() => setCreateProxyPlatformVisible(true)}
              value={{proxyPlatformSelect}}
            />
            }
            {createProxyPlatformVisible && <CreateFormProxyPlatform
              onFinish={async value => {
                const success = await handleCreateProxyPlatform(value as API.ProxyPlatformItem);

                if (success) {
                  setCreateProxyPlatformVisible(false);
                  getProxyPlatformData();
                }
              }}
              visible={createProxyPlatformVisible}
              onVisibleChange={setCreateProxyPlatformVisible}
            />
            }
            {updateModalVisible && <UpdateFormAsset
              onFinish={async (value) => {
                const success = await handleUpdate(value);

                if (success) {
                  setUpdateModalVisible(false);
                  setCurrentRow(undefined);

                  if (actionRef.current) {
                    actionRef.current.reload();
                  }
                }
              }}
              visible={updateModalVisible}
              onVisibleChange={setUpdateModalVisible}
              value={currentRow || {}}
            />
            }
            {currentRow && <AssetInfoModal
              currentRow={currentRow as API.AssetItem}
              visible={assetInfoModalVisible}
              onCancel={() => {
                setAssetInfoModalVisible(false);
                setCurrentRow(undefined);
              }}
            />
            }
          </Col>
        </Row>
      </GridContent>
    </PageContainer>
  );
};

export default TableList;
