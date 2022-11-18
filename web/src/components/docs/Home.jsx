import React from 'react';
import utils from '../../utils/utils.js';

function DocsHome() {
  return (
    <div>
      <h2>Support documentation</h2>
      <p>Welcome to the {utils.appName()} documentation. Feel free to explore through the links on this page to learn more about how to use {utils.appName()}.</p>

      <p>If you need help, we recommend taking a look through these pages first to see if they can answer your question. If you're still stuck then reach out to us by emailing <a href={`mailTo:${import.meta.env.VITE_CONTACT_EMAIL}`}>{import.meta.env.VITE_CONTACT_EMAIL}.</a></p>
    </div>
  );
}

export default DocsHome;