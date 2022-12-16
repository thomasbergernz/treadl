import React from 'react';
import { Icon, Popup, Label, Button } from 'semantic-ui-react';

export default function SupporterBadge({ type, compact }) {
	if (type === 'silver')
		return (
			compact ?
				<Popup basic
					trigger={<Label size='mini' circular color='black' style={{borderRadius: '50%', width: 20, height: 20}} icon='trophy' />
							}
				>
					<Popup.Content>Silver Supporter</Popup.Content>
				</Popup>
			:
				<Label color='black' icon>
					<Icon name='trophy' />
					<Label.Detail>Silver Supporter</Label.Detail>
				</Label>
		);
	return null;
}