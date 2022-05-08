import React from 'react';
import { Helmet } from 'react-helmet';
import { Container } from 'semantic-ui-react';
import utils from 'utils/utils.js';

function PrivacyPolicy() {
  const APP_NAME = utils.appName();
  const EMAIL = process.env.REACT_APP_CONTACT_EMAIL;
  return (
    <Container style={{ marginTop: 50, marginBottom: 50 }}>
      <Helmet title='Privacy Policy' />
      <h1>Privacy Policy</h1>
      <p>This policy is designed to be accessible, understandable, and easy to read without legal and other jargon. If you have any comments, questions, or concerns about this policy, please get in touch with us by emailing {EMAIL}.</p>
      <p>This document will have slight changes made to it occasionally. Please refer back to it from time to time.</p>
      <p>This policy governs the use and protection of personal data of people (‘users’, ‘you’, etc.) using {APP_NAME}.</p>
      <p>Data protection refers to the responsible security of personal data and transparency in the way we handle and process such data. Personal data is information that - on its own or in conjunction with other data - can be used to identify an individual person.</p>

      <h2>Complaints</h2>
      <p>If you would like to complain about this policy, or how we may have treated a request from you with respect to data protection, then please get in touch with us in the first case so that we can help rectify the problem. In other cases, you may also want to get in touch with the Information Comissioner's Office (ICO), who may be able to provide you with more information and support. Their website is at https://ico.org.uk.</p>

      <h2>What data does {APP_NAME} collect?</h2>

      <h3>When visiting and browsing our website</h3>
      <p>When you visit us using a web browser, we collect some data about your computer and the way our services are used by you, even if you don't have an account. We do not collect your name or other details about you at this stage, but we may process information such as your computing device’s location, its IP address, and details about relevant software your device may be running. This data is processed by Simple Analytics (for tracking aggregated use of our services, so that we can better understand how to improve our services for their audiences). The legal basis for processing this data is a legitimate interest in recording aggregated analytics data for improvement purposes and to see how often people visit our website.</p>

      <h3>When sending us an email</h3>
      <p>Sometimes you may wish to send an email to us or reply to an email we have sent you. Any emails received will be treated in confidence and kept securely. Strong passwords and multi-factor authentication is implemented on all email accounts that can receive such emails.</p>

      <h3>When signing-up for a {APP_NAME} account</h3>
      <p>{APP_NAME} allows you to register for an account. This is the primary way by which we collect personal data from you, since such data is needed in order to identify you when you want to login and use these services. We may also use your email address to update you on platform updates and notifications, which you can control. When signing-up we collect an email address, username, and password. Once registered, you can choose to fill in additional profile data, such as social media links, a bio, and more. We ask for consent to this policy when creating an account, and the legal basis for processing this data is a legitimate interest in being able to provide services to you.</p>

      <h3>When using {APP_NAME}</h3>
      <p>Posts, content, comments, patterns, files and any other data you add to or upload to {APP_NAME} as part of its standard use are also collected. This is for the purposes of providing services to you. To use {APP_NAME}, you will have provided consent to this policy during the registration process, and the legal basis for processing this data is a legitimate interest in being able to provide core services to you.</p>

      <h2>Who has access to your data?</h2>
      <p>Staff operating {APP_NAME} can view accounts and account data. This is with the exception of passwords, which are fully encrypted.</p>
      <p>Other users and visitors to {APP_NAME} will also be able to see the profile data and content that you have made public. Your username and other profile data is always available to other people.</p>
      <p>In order to provide access to our services to users, we also sometimes need to pass pieces of your personal data to third-party services (known as ‘data processors’ for the purposes of the GDPR). We only ever do this when we need to, and only send the minimum amount of information required. We ensure that the processors' own privacy policies follow suitable data protection practices. Our current data processors are:</p>
      <ul>
        <li>Mailgun (for sending mail). We provide Mailgun with your email address so that the mail can be delivered.</li>
        <li>Drift (for providing support). If you get in touch with us via the Drift chat widget, it may collect your email address for ongoing support provision.</li>
        <li>Simple Analytics (for aggregated visitor analytics). This service may collect information about your browser and the location you visit us from.</li>
      </ul>

      <h2>How long do we keep your data for?</h2>
      <p>We keep your account data (email and username) and content produced by your account (e.g. posts, comments, projects) for as long as your account is active. You can fully and irreversibly delete your account (and its associated data) at any time. Please note that data held in backup systems may be held for up to 30 days after such an event before it too is deleted.</p>

      <h2>Where is your data stored?</h2>
      <p>Our databases and servers are all based in the UK, and so your data will be processed fully within the UK. We use Mailgun's EU based servers for transmitting mail, and other processors may process subsets of your data in the US, if you choose to use those features.</p>

      <h2>How do we protect your data?</h2>
      <p>All data is encrypted during transmission (e.g. between your device and our servers, and between our servers), and when stored ("encrypted at rest"). Our servers are well-protected with industry standard security measures.</p>

      <h2>Child safety</h2>
      <p>Children under the age of 16 are not allowed to use {APP_NAME} or to directly provide us with personal data. As such, we do not knowingly store or process personal data relating to children under the age of 16.</p>

      <h2>Your rights</h2>
      <p>We take the handling of personal data very seriously, and we want to make sure that you are aware of your rights under this policy. If your wish to invoke your rights requires us to complete some action on your behalf (for example, to stop processing your data), then we will always deal with your request in total confidence, at no cost, and as soon as we can (within 30 days of receiving your request).</p>
      <h3>Right to be informed</h3>
      <p>You have a right to know about how we handle and process your personal data. This Privacy Policy aims to fulfil this Right, but please email us if you have further questions or concerns.</p>
      <h3>Right of access</h3>
      <p>You have a right to know if we store or process your personal data and to obtain access to the personal data about you that we, or any data processors that process data on our behalf, have about you. To obtain this information, please email us.</p>
      <h3>Right to rectification</h3>
      <p>You have a right to have personal data we keep or process about you rectified. If data we have about you is incorrect or incomplete, then please email us with details of any corrections to be made.</p>
      <h3>Right to erasure</h3>
      <p>You have the right to have all of your personal data erased, which will prevent any further storage or processing any of your personal data on our behalf, and will sometimes result in a necessary deletion of any accounts you hold with us. In many cases, deleting any accounts you hold with us will erase your details. However, if you wish to make sure of this, then please email us with details of your request.</p>
      <h3>Right to restrict processing</h3>
      <p>You have the right to halt the processing of your personal data in the way that you choose. For example, you may wish to maintain an account with us but no longer want us to use one of our data processors to process your data. To restrict the processing of your personal data, please email us with details of your request.</p>
      <h3>Right to data portability</h3>
      <p>You have the right to obtain personal data we have or process about you in a format that is useful to you or to another service you would like to use with your data. We are happy to provide data to you in formats including CSV, JSON, PDF, Microsoft Word, and more. Please email us with details of your request.</p>
      <h3>Right to object</h3>
      <p>You have a right to object to the processing of your personal data in particular ways. For example, for marketing or profiling purposes. If you would like to object to our processing of your data, then please email us.</p>
      <h3>Rights related to automated decision making including profiling</h3>
      <p>We do not use personal data for automated decision making, and does not use such data for profiling users. Additionally, any processing done for analytics and reporting is done on an entirely anonymous basis. For more information or if you have any concerns, please email us.</p>
    </Container>
  );
}

export default PrivacyPolicy;
