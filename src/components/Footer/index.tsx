import { DefaultFooter } from '@ant-design/pro-layout';

export default () => {
  const defaultMessage = 'wops';
  return (
    <DefaultFooter
      copyright={`2021 ${defaultMessage}`}
      links={[]}
    />
  );
};
