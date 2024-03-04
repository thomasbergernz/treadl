import React, { useState, useEffect } from 'react';
import { Button, Modal, ModalHeader, ModalContent, ModalDescription, ModalActions, Input } from 'semantic-ui-react';
import styled from 'styled-components';
import api from '../../api';
import Warp from '../main/projects/objects/Warp';
import Weft from '../main/projects/objects/Weft';

const PreviewContainer = styled.div`
  display: block;
  margin-top: 10px;
  position: relative;
  min-height: 300px;
  overflow-y: scroll;
`;

export default function SnippetSaver({ type, threading, treadling, isOpen, onComplete }) {
  const [name, setName] = useState('');

  useEffect(() => {
    setName('Snippet made on ' + new Date().toLocaleString());
  }, []);

  const save = () => {
    api.snippets.create({ name, type, threading, treadling }, newSnippet => {
      onComplete(newSnippet);
    });
  }
  let shafts = 0;
  threading?.forEach(thread => {
    if (thread.shaft > shafts) shafts = thread.shaft;
  });
  let treadles = 0;
  treadling?.forEach(thread => {
    if (thread.treadle > treadles) treadles = thread.treadle;
  });

  return (
    <Modal
      onClose={() => onComplete()}
      open={isOpen}
    >
      <ModalHeader>Save a {type} snippet</ModalHeader>
      <ModalContent>
        <ModalDescription>
          <p>Snippets are partial warps or wefts that you can re-use later in this and other drafts.</p>
          <p><strong>Give your snippet a name:</strong></p>
          <Input placeholder='Type a name...' value={name} onChange={e => setName(e.target.value)} fluid autoFocus />
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
