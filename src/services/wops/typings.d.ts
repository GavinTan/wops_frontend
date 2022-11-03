// @ts-ignore
/* eslint-disable */

declare namespace API {
  type BaseResult = {
    code: number;
    success: boolean;
  };

  type UserItem = {
    id?: number;
    username?: string;
    password?: string;
    name?: string;
    avatar?: string;
    email?: string;
    country?: string;
    role?: string[];
    address?: string;
    phone?: string;
    last_login?: string;
    date_joined?: string;
    is_active?: boolean;
    is_superuser?: boolean;
  };

  type UserResult = {
    data: UserItem;
  } & BaseResult;

  type UserListResult = {
    data: UserItem[];
  } & BaseResult;

  type LoginItem = {
    token?: string;
    errmsg?: string;
    status?: string;
  };

  type LoginResult = {
    data: LoginItem;
  } & BaseResult;

  type InstanceItem = {
    id: number;
    server: ServerItem;
    name: string;
    vcpu: number;
    max_vcpu: number;
    memory: string;
    max_memory: string;
    console_type: string;
    console_port: string;
    networks: [{ [key: string]: any }];
    disks: [{ [key: string]: any }];
    uuid: string;
    vid: number;
    status: number;
    ip: string;
    http_proxy: ProxyItem;
    update_time?: string;
    create_time?: string;
  };

  type InstanceResult = {
    data: any[];
    errmsg?: string;
  } & BaseResult;

  type InstanceList = {
    total?: number;
    success?: boolean;
  } & InstanceResult;

  type ServerItem = {
    id?: number;
    name?: string;
    host?: string;
    username?: string;
    password?: string;
    conn_type?: number;
    cpu?: number;
    memory?: string;
    memory_usage?: number;
    status?: boolean;
    update_time?: string;
    create_time?: string;
  };

  type ServerResult = {
    data: NodeItem[];
  } & BaseResult;

  type ServerList = {
    total?: number;
    success?: boolean;
  } & ServerResult;

  type StorageItem = {
    name: string;
    target: string;
    type: string;
  };

  type StorageResult = {
  } & BaseResult

  type MediaResult = {
    data: {name: string; path: string;}[];
  } & BaseResult;

  type TreeNodeItem = {
    title: string;
    key: string;
    id?: number;
    parent?: number;
    children?: TreeNodeItem[];
  };

  type TreeNodeResult = {
    data: TreeNodeItem[];
  } & BaseResult;

  type AssetItem = {
    id?: number;
    name?: string;
    ip?: string;
    description?: string;
    tree_node?: number;
    proxy?: ProxyItem;
  };

  type AssetResult = {
    data: AssetItem[];
  } & BaseResult;

  type AssetList = {
    total?: number;
    success?: boolean;
  } & AssetResult;

  type ProxyItem = {
    id?: number;
    ip?: string;
    account?: {username: string; password: string;};
    platform?: ProxyPlatformItem;
    desc?: string;
    create_time?: string;
  };

  type ProxyResult = {
    data: ProxyItem[];
    total?: number;
  } & BaseResult;

  type ProxyPlatformItem = {
    id?: number;
    name?: string;
    account?: {username: string; password: string;};
    address?: string;
    desc?: string;
    create_time?: string;
  };

  type ProxyPlatformResult = {
    data: ProxyPlatformItem[];
    total?: number;
  } & BaseResult;

  type PageParams = {
    offset?: number;
    limit?: number;
  };

  type RuleListItem = {
    key?: number;
    disabled?: boolean;
    href?: string;
    avatar?: string;
    name?: string;
    owner?: string;
    desc?: string;
    callNo?: number;
    status?: number;
    updatedAt?: string;
    createdAt?: string;
    progress?: number;
  };

  type RuleList = {
    data?: RuleListItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  };

  type FakeCaptcha = {
    code?: number;
    status?: string;
  };

  type LoginParams = {
    username?: string;
    password?: string;
    autoLogin?: boolean;
    type?: string;
  };

  type ErrorResponse = {
    /** 业务约定的错误码 */
    errorCode: string;
    /** 业务上的错误信息 */
    errorMessage?: string;
    /** 业务上的请求是否成功 */
    success?: boolean;
  };

  type NoticeIconList = {
    data?: NoticeIconItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  };

  type NoticeIconItemType = 'notification' | 'message' | 'event';

  type NoticeIconItem = {
    id?: string;
    extra?: string;
    key?: string;
    read?: boolean;
    avatar?: string;
    title?: string;
    status?: string;
    datetime?: string;
    description?: string;
    type?: NoticeIconItemType;
  };
}
