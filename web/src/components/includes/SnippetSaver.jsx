import React, { useState } from 'react';
import { Button, Modal, ModalHeader, ModalContent, ModalDescription, ModalActions } from 'semantic-ui-react';
import styled from 'styled-components';
import api from '../../api';
import Warp from '../main/projects/objects/Warp';
import Weft from '../main/projects/objects/Weft';

const PreviewContainer = styled.div`
  display: block;
  position: relative;
  min-height: 300px;
  overflow-y: scroll;
`;

export default function SnippetSaver({ type, threading, treadling, isOpen, onComplete }) {
  const [name, setName] = useState('');

  const save = () => {
    api.snippets.create({ type, threading, treadling }, newSnippet => {
      onComplete(newSnippet);
    });
  }

  let shafts = 0;
  threading?.forEach(thread => {
    thread.isSelected = undefined;
    if (thread.shaft > shafts) shafts = thread.shaft;
  });
  let treadles = 0;
  treadling?.forEach(thread => {
    thread.isSelected = undefined;
    if (thread.treadle > treadles) treadles = thread.treadle;
  });

  return (
    <Modal
      onClose={() => onComplete()}
      open={isOpen}
    >
      <ModalHeader>Save a snippet</ModalHeader>
      <ModalContent>
        <ModalDescription>
          <p>Snippets are partial warps and wefts that you can re-use later in this and other drafts.</p>
          <PreviewContainer>
            {type === 'warp' &&
              <Warp baseSize={10} warp={{threading, shafts}} weft={{treadles: 0, treadling: []}}/>
            }
            {type === 'weft' &&
              <Weft baseSize={10} warp={{shafts: 0, threading: []}} weft={{treadling, treadles}}/>
            }
          </PreviewContainer>
        </ModalDescription>
      </ModalContent>
      <ModalActions>
        <Button color='black' onClick={() => onComplete()}>Cancel</Button>
        <Button onClick={save} positive>Save snippet</Button>
      </ModalActions>
    </Modal>
  );
}
