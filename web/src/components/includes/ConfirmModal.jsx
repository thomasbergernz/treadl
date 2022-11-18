import React from 'react';
import { confirmable } from 'react-confirm';
import {
  Modal, Header, Button, Icon,
} from 'semantic-ui-react';

class Dialog extends React.Component {
  render() {
    const {
      show, proceed, dismiss, cancel, title, confirmation,
    } = this.props;
    return (
      <Modal
        open={show}
        onClose={dismiss}
        basic
        size="small"
      >
        <Header content={title} />
        <Modal.Content>
          {confirmation}
        </Modal.Content>
        <Modal.Actions>
          <Button basic color="red" inverted onClick={cancel}>
            <Icon name="remove" />
            {' '}
No
          </Button>
          <Button color="green" inverted onClick={proceed}>
            <Icon name="checkmark" />
            {' '}
Yes
          </Button>
        </Modal.Actions>
      </Modal>
    );
  }
}

export default confirmable(Dialog);
