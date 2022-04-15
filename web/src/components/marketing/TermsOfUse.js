import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { Container } from 'semantic-ui-react';

class TermsOfUse extends Component {
  render() {
    return (
      <Container style={{ marginTop: 50, marginBottom: 50 }}>
        <Helmet title='Terms of Use' />
        <h1>Treadl Terms of Use</h1>
        <p>This document is designed to be accessible, understandable, and easy to read without legal and other jargon. If you have any comments, questions, or concerns about this policy, please get in touch with us by emailing hello@treadl.com.</p>

        <p>Treadl and its services and websites at (and any subdomains of) treadl.com ('our services', Treadl, etc.) is owned and operated by Seastorm Limited (‘we’, ‘our’, ‘us’, etc.). Seastorm Limited is a company registered in England and Wales, with company number 11867862.</p>

        <p>This document will have slight changes made to it occasionally. If there are more significant changes made that affect you, and if we have personal data about you, we will do our best to notify you of these changes.</p>

        <h2>Terms</h2>
        <p>Treadl does not guarantee constant availability of service access and accepts no liability for downtime or access failure due to circumstances beyond its reasonable control (including any failure by ISP or system provider).</p>

        <p>The services may contain links to other sites on the internet. We are not responsible for the accuracy, legality, decency of material or copyright compliance of any such linked websites or services or information provided via any such link.</p>

        <p>No data transmission over the Internet can be guaranteed as totally secure. Whilst we strive to protect such information, we do not warrant and cannot ensure the security of information which you transmit to us. Accordingly, any information which you transmit to us is transmitted at your own risk.</p>

        <p>Any information on our services may include technical inaccuracies or typographical errors. We strive to maintain accuracy as much as possible.</p>

        <p>We distribute the content supplied by our users. We try to maintain a safe platform for all of our users, but cannot take responsibility for such content. We are not liable for any damages as a result of such content. Self-policing is a an important feature of platforms like Treadl, so please report any problems with such user-generated content to the email address above. We accept no liability or responsibility to any person or organisation as a consequence of any reliance upon the information contained by our services.</p>

        <p>Our services are provided on an “as is”, “as available” basis without warranties of any kind, express or implied, including, but not limited to, those of TITLE, MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE or NON-INFRINGEMENT or any warranty arising from a course of dealing, usage, or trade practice. No advice or written information provided shall create a warranty; nor shall members or visitors to our services rely on any such information or advice.</p>

        <p>We reserve the right to permanently ban any user from our services for any reason related to mis-behaviour. We will be the sole judge of behavior and we do not offer appeals or refunds in those cases.</p>

      </Container>
    );
  }
}

export default TermsOfUse;
