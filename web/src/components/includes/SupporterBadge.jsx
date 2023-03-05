import React from 'react';
import { Icon, Popup, Label, Button } from 'semantic-ui-react';

const supporterTypes = {
  silver: {
		text: 'Silver Supporter',
		trophyColour: 'white',
	},
	gold: {
		text: 'Gold Supporter',
		trophyColour: 'yellow',
	},
};

export default function SupporterBadge({ type, compact }) {
	if (!supporterTypes[type]) return null;
	return (
		compact ?
		  <Popup basic
				trigger={<Label size='mini' circular color='black' style={{borderRadius: '50%', width: 20, height: 20}}><Icon name='trophy' color={supporterTypes[type].trophyColour} /></Label>}
			>
				<Popup.Content>{supporterTypes[type].text}</Popup.Content>
			</Popup>
		:
			<Label color='black' icon>
				<Icon name='trophy' color={supporterTypes[type].trophyColour} />
				<Label.Detail>{supporterTypes[type].text}</Label.Detail>
			</Label>
	);
}