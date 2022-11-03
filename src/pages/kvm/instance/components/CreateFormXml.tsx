import React from "react";
import {ProFormDigit, ProFormSelect, ProFormTextArea} from "@ant-design/pro-form";
import {Divider, FormInstance} from "antd";


export type CreateFormProps = {
  nodeList: { label: React.ReactNode; value: number; }[];
}

const CreateFormXml: React.FC<CreateFormProps> = (props) => {
  return (
    <>
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
      <ProFormTextArea
        label="xml"
        name="xml"
        width={800}
        fieldProps={{
          rows: 50,
        }}
        initialValue={"<domain type='kvm'>\n" +
        "  <name>aa</name>\n" +
        "  <uuid>3720ba14-b45d-4ba6-b6eb-3112c2d4093f</uuid>\n" +
        "  <memory unit='KiB'>1048576</memory>\n" +
        "  <currentMemory unit='KiB'>1048576</currentMemory>\n" +
        "  <memtune>\n" +
        "    <hard_limit unit='KiB'>4193280</hard_limit>\n" +
        "    <soft_limit unit='KiB'>4193280</soft_limit>\n" +
        "  </memtune>\n" +
        "  <vcpu placement='static' current='1'>32</vcpu>\n" +
        "  <os>\n" +
        "    <type arch='x86_64' machine='pc-i440fx-rhel7.0.0'>hvm</type>\n" +
        "    <boot dev='hd'/>\n" +
        "    <boot dev='cdrom'/>\n" +
        "    <bootmenu enable='yes' timeout='3000'/>\n" +
        "  </os>\n" +
        "  <features>\n" +
        "    <acpi/>\n" +
        "    <apic/>\n" +
        "    <pae/>\n" +
        "  </features>\n" +
        "  <clock offset='localtime'/>\n" +
        "  <on_poweroff>destroy</on_poweroff>\n" +
        "  <on_reboot>restart</on_reboot>\n" +
        "  <on_crash>destroy</on_crash>\n" +
        "  <devices>\n" +
        "    <emulator>/usr/libexec/qemu-kvm</emulator>\n" +
        "    <disk type='file' device='disk'>\n" +
        "      <driver name='qemu' type='qcow2' cache='none'/>\n" +
        "      <source file='/data/aa.img'/>\n" +
        "      <target dev='vda' bus='virtio'/>\n" +
        "      <address type='pci' domain='0x0000' bus='0x00' slot='0x05' function='0x0'/>\n" +
        "    </disk>\n" +
        "    <disk type='file' device='cdrom'>\n" +
        "      <driver name='qemu' type='raw'/>\n" +
        "      <source file='/data/cn_windows_7_ultimate_with_sp1_x64_dvd_u_677408.iso'/>\n" +
        "      <target dev='hda' bus='ide'/>\n" +
        "      <readonly/>\n" +
        "      <address type='drive' controller='0' bus='0' target='0' unit='0'/>\n" +
        "    </disk>\n" +
        "    <controller type='usb' index='0' model='piix3-uhci'>\n" +
        "      <address type='pci' domain='0x0000' bus='0x00' slot='0x01' function='0x2'/>\n" +
        "    </controller>\n" +
        "    <controller type='pci' index='0' model='pci-root'/>\n" +
        "    <controller type='ide' index='0'>\n" +
        "      <address type='pci' domain='0x0000' bus='0x00' slot='0x01' function='0x1'/>\n" +
        "    </controller>\n" +
        "    <controller type='virtio-serial' index='0'>\n" +
        "      <address type='pci' domain='0x0000' bus='0x00' slot='0x04' function='0x0'/>\n" +
        "    </controller>\n" +
        "    <interface type='network'>\n" +
        "      <mac address='52:54:00:47:80:c1'/>\n" +
        "      <source network='default'/>\n" +
        "      <target dev='default-bDV5'/>\n" +
        "      <model type='virtio'/>\n" +
        "      <address type='pci' domain='0x0000' bus='0x00' slot='0x03' function='0x0'/>\n" +
        "    </interface>\n" +
        "    <channel type='unix'>\n" +
        "      <target type='virtio' name='org.qemu.guest_agent.0'/>\n" +
        "      <address type='virtio-serial' controller='0' bus='0' port='1'/>\n" +
        "    </channel>\n" +
        "    <input type='mouse' bus='ps2'/>\n" +
        "    <input type='tablet' bus='usb'>\n" +
        "      <address type='usb' bus='0' port='1'/>\n" +
        "    </input>\n" +
        "    <input type='keyboard' bus='ps2'/>\n" +
        "    <graphics type='vnc' port='-1' autoport='yes' listen='0.0.0.0' keymap='en-us'>\n" +
        "      <listen type='address' address='0.0.0.0'/>\n" +
        "    </graphics>\n" +
        "    <video>\n" +
        "      <model type='cirrus' vram='16384' heads='1' primary='yes'/>\n" +
        "      <address type='pci' domain='0x0000' bus='0x00' slot='0x02' function='0x0'/>\n" +
        "    </video>\n" +
        "    <memballoon model='virtio'>\n" +
        "      <address type='pci' domain='0x0000' bus='0x00' slot='0x06' function='0x0'/>\n" +
        "    </memballoon>\n" +
        "  </devices>\n" +
        "</domain>"}
      />
      <Divider/>
      <ProFormDigit label="数量" name="num" width="lg" initialValue={1}/>
    </>

  )
};

export default CreateFormXml;
