import React from 'react';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import { Icon, Label, Button, Form, Dropdown } from 'semantic-ui-react';
import actions from 'actions';
import api from 'api';

import UserChip from 'components/includes/UserChip';
import FileChooser from 'components/includes/FileChooser';

const NewFeedMessage = connect(
  (state, ownProps) => {
    const projects = state.projects.projects.filter(p => p.user === ownProps?.user?._id);
    const { post, attachments, attachmentUploading, replyingTo, posting } = state.posts;
    return { projects, post, attachments, attachmentUploading, replyingTo, posting };
  }, dispatch => ({
    updatePost: content => dispatch(actions.posts.updatePost(content)),
    addAttachment: a => dispatch(actions.posts.addAttachment(a)),
    deleteAttachment: a => dispatch(actions.posts.deleteAttachment(a)),
    clear: () => dispatch(actions.posts.clear()),
    updateAttachmentUploading: u => dispatch(actions.posts.updateAttachmentUploading(u)),
    updateReplyingTo: entryId => dispatch(actions.posts.updateReplyingTo(entryId)),
    updatePosting: p => dispatch(actions.posts.updatePosting(p)),
  })
)(({ autoFocus, inReplyTo, user, forType, group, object, projects, post, attachments, attachmentUploading, replyingTo, posting, placeholder, noAttachments, addAttachment, deleteAttachment, updatePost, updateAttachmentUploading, clear, updateReplyingTo, updatePosting, onPosted }) => {

  let forObj;
  if (forType === 'group') forObj = group;
  if (forType === 'object') forObj = object;

  const attachProject = (project) => {
    addAttachment({
      name: project.name,
      fullName: project.fullName,
      storedName: project.fullName,
      type: 'project',
      projectId: project._id,
    });
  }

  const createEntry = () => {
    if (attachmentUploading) return toast.warning('Please wait until your attachment has uploaded');
    if (!post || !post.trim().length) return;
    updatePosting(true);
    const data = { content: post };
    if (attachments && attachments.length) data.attachments = attachments;
    const successCallback = (entry) => {
      updatePosting(false);
      clear();
      updateReplyingTo(null);
      onPosted(entry);
    }
    const errorCallback = (err) => {
      toast.error(err.message);
      updatePosting(false);
    }
    if (forType === 'group') {
      if (inReplyTo) api.groups.createEntryReply(group._id, inReplyTo, data, successCallback, errorCallback);
      else api.groups.createEntry(group._id, data, successCallback, errorCallback);
    }
    if (forType === 'object') {
      api.objects.createComment(object._id, data, successCallback, errorCallback);
    }
  }

  return ( <>
    <Form>
      <UserChip user={user} />
      <Form.TextArea autoFocus={autoFocus} style={{marginTop: 10}} placeholder={placeholder || (inReplyTo ? 'Write a reply...' : 'Write a new post...')} onChange={e => updatePost(e.target.value)} value={post} />
    </Form>
    {attachments && attachments.length > 0 &&
      <div style={{margin: '10px 0px'}}>
        {attachments.map(a =>
          <Label style={{margin: 4}} key={a.storedName}>{a.name}
            <Icon name='close' onClick={e => deleteAttachment(a)} />
          </Label>
        )}
      </div>
    }
    <Button.Group style={{marginTop: 10, float:'right'}}>
      {!noAttachments &&
        <Dropdown
          trigger=<Button size='small' icon='paperclip' content='Attach something' loading={attachmentUploading}/>
        >
          <Dropdown.Menu>
            <FileChooser
              forType={forType} forObject={forObj}
              trigger=<Dropdown.Item icon="upload" content="Upload a file from your computer" />
              onUploadStart={e => updateAttachmentUploading(true) }
              onUploadFinish={e => updateAttachmentUploading(false) }
              onComplete={addAttachment}
            />
            <Dropdown.Divider />
            <Dropdown item text="Attach one of your projects">
              <Dropdown.Menu direction='left'>
                {(projects && projects.length > 0) ?
                  projects.map(p =>
                    <Dropdown.Item key={p._id} icon="book" text={p.name} onClick={e => attachProject(p)} />
                  )
                :
                  <Dropdown.Header>No projects available</Dropdown.Header>
                }
              </Dropdown.Menu>
            </Dropdown>
          </Dropdown.Menu>
        </Dropdown>
      }
      <Button disabled={posting} loading={posting} size='small' color='teal' icon='send' content={inReplyTo ? 'Post reply' : 'Post message'} onClick={createEntry}/>
    </Button.Group>
    <div style={{clear:'both'}} />
  </>
  );
});

export default NewFeedMessage;
