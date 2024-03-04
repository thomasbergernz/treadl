import React, { useState, useEffect } from 'react';
import { Button, Modal, ModalHeader, ModalContent, ModalDescription, ModalActions, Input, Card } from 'semantic-ui-react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import api from '../../api';
import actions from '../../actions';
import Warp from '../main/projects/objects/Warp';
import Weft from '../main/projects/objects/Weft';

const PreviewContainer = styled.div`
  display: block;
  margin-top: 10px;
  position: relative;
  min-height: 300px;
  overflow-y: scroll;
`;

export default function SnippetChooser({ type, isOpen, onComplete }) {
  const [count, setCount] = useState('');
  const dispatch = useDispatch();
  const { snippets } = useSelector(state => {
    return { snippets: state.objects.snippets };
  });

  useEffect(() => {
    api.snippets.listForUser(data => {
      console.log(data);
      data?.snippets?.forEach(s => dispatch(actions.objects.receiveSnippet(s)));
    });
  }, []);

  const typeSnippets = snippets.filter(s => s.type === type);

  return (
    <Modal
      onClose={() => onComplete()}
      open={isOpen}
    >
      <ModalHeader>Insert into the {type}</ModalHeader>
      <ModalContent>
        <ModalDescription>
          <Card.Group stackable doubling itemsPerRow={4}>
            {typeSnippets.map(s =>
                <Card raised key={s._id}>
              <PreviewContainer key={s._id}>
                {type === 'warp' &&
                  <Warp baseSize={10} warp={{threading: s.threading}} weft={{treadles: 0, treadling: []}}/>
                }
                {type === 'weft' &&
                  <Weft baseSize={10} warp={{shafts: 0, threading: []}} weft={{treadling, treadles}}/>
                }
                </PreviewContainer>
              </Card>
            )}
          </Card.Group>
        </ModalDescription>
      </ModalContent>
      <ModalActions>
        <Button color='black' onClick={() => onComplete()}>Cancel</Button>
        <Button onClick={() => {}} positive>Save snippet</Button>
      </ModalActions>
    </Modal>
  );
}
