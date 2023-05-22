import React from 'react';
import { Instagram } from 'react-content-loader';
import { Card } from 'semantic-ui-react';

export default function PatternLoader({ count }) {
  if (!count) count = 1;
  return (<>
    {[...new Array(count)].map((item, index) =>
      <Card><Instagram /></Card>
    )}
  </>);
}