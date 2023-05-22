import React from 'react';
import { Instagram, List } from 'react-content-loader';
import { Card } from 'semantic-ui-react';

export default function PatternLoader({ count, isCompact }) {
  if (!count) count = 1;
  return (<>
    {[...new Array(count)].map((item, index) =>
      <Card>{isCompact ? <Card.Content><List /></Card.Content> : <Instagram />}</Card>
    )}
  </>);
}