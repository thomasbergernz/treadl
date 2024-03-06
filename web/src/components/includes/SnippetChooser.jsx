import React, { useState, useEffect } from 'react';
import { Icon, Divider, Header, Button, Modal, ModalHeader, ModalContent, ModalDescription, ModalActions, Input, Card, Checkbox } from 'semantic-ui-react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import api from '../../api';
import actions from '../../actions';
import Warp from '../main/projects/objects/Warp';
import Weft from '../main/projects/objects/Weft';
import { PreviewContainer } from './SnippetSaver';

export default function SnippetChooser({ type, isOpen, onComplete }) {
  const [count, setCount] = useState(1);
  const [includeColours, setIncludeColours] = useState(false);
  const [selectedSnippet, setSelectedSnippet] = useState(null);
  const dispatch = useDispatch();
  const { snippets } = useSelector(state => {
    return { snippets: state.objects.snippets };
  });

  useEffect(() => {
    api.snippets.listForUser(data => {
      data?.snippets?.forEach(s => dispatch(actions.objects.receiveSnippet(s)));
    });
  }, []);

  const deleteSnippet = (id) => {
    if (!window.confirm('Are you sure you want to delete this snippet?')) return;
    api.snippets.delete(id, () => {
      dispatch(actions.objects.deleteSnippet(id));
      setSelectedSnippet(null);
    });
  }

  const insertSnippet = () => {
    if (!count) return onComplete();
    const snippet = selectedSnippet ?
      { ...snippets.find(s => s._id === selectedSnippet) }
    :
      {
        type,
        threading: type === 'warp' ? [{shaft: 0}] : null,
        treadling: type === 'weft' ? [{treadle: 0}] : null,
      };
    if (snippet) {
      const key = type === 'warp' ? 'threading' : 'treadling';
      const baseArray = [...snippet[key]];
      const newArray = [];
      for (let i = 0; i < count; i++) {
        baseArray.forEach(t => {
          newArray.push({ ...t, colour: includeColours ? t.colour : undefined });
        });
      }
      snippet[key] = newArray;
    }
    onComplete(snippet);
  }

  const typeSnippets = snippets.filter(s => s.type === type);

  return (
    <Modal
      onClose={() => onComplete()}
      open={isOpen}
    >
      <ModalHeader>Insert into the {type}</ModalHeader>
      <ModalContent>
        <ModalDescription>
          <Input
            label={{ basic: true, content: 'Number of repeats to insert:' }}
            labelPosition='left'
            placeholder='Count'
            value={count}
            onChange={(e, { value }) => setCount(parseInt(value || 0) || 0)}
          />
          <Divider hidden />
          <Header size='small'>Choose a blank thread or a snippet</Header>
          <Card.Group stackable doubling itemsPerRow={4}>
            <Card
              raised={!selectedSnippet}
              color={!selectedSnippet ? 'blue' : null}
              onClick={() => setSelectedSnippet(null)}
            >
              <Card.Content textAlign='center'>
                {!selectedSnippet && <Icon name='check circle' size='sm' />}
                <Header size='sm'>Blank thread</Header>
              </Card.Content>
            </Card>

            {!typeSnippets.length ? <Card>
              <Card.Content textAlign='center'>
                You don't have any {type} snippets yet. Create one by choosing threads in your pattern using the "select" tool.
              </Card.Content>
            </Card> : null}

            {typeSnippets.map(s => {
              const shafts = type === 'warp' ? Math.max(...s.threading?.map(t => t.shaft)) : 0;
              const treadles = type === 'weft' ? Math.max(...s.treadling?.map(t => t.treadle)) : 0;
              return (<Card key={s._id}
                raised={selectedSnippet === s._id}
                color={selectedSnippet === s._id ? 'blue' : null}
                onClick={() => setSelectedSnippet(s._id)}
            >
                <Card.Content textAlign='center'>
                  {selectedSnippet === s._id && <Icon name='check circle' size='sm' />}
                  <Header size='sm' style={{margin: 0}}>
                    {s.name}
                  </Header>
                  <div style={{overflow: 'scroll'}}>
                  <PreviewContainer type={type} shafts={shafts} treadles={treadles} threading={s.threading} treadling={s.treadling}>
                    {type === 'warp' &&
                      <Warp baseSize={10} warp={{threading: s.threading, shafts}} weft={{treadles, treadling: []}}/>
                    }
                    {type === 'weft' &&
                      <Weft baseSize={10} warp={{shafts, threading: []}} weft={{treadling: s.treadling, treadles}}/>
                    }
                  </PreviewContainer>
                  </div>
                </Card.Content>
                <Card.Content extra>
                  <a href='#' onClick={() => deleteSnippet(s._id)}>Delete snippet</a>
                </Card.Content>
              </Card>);
            })}
          </Card.Group>

          {selectedSnippet && <>
            <Divider hidden />
            <Checkbox
              label='Insert with snippet colours'
              onChange={(e, data) => setIncludeColours(data.checked)}
              checked={includeColours}
            />
          </>}
        </ModalDescription>
      </ModalContent>
      <ModalActions>
        <Button color='black' onClick={() => onComplete()}>Cancel</Button>
        <Button onClick={insertSnippet} positive>Insert selected thread or snippet</Button>
      </ModalActions>
    </Modal>
  );
}
