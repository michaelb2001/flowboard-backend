import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly resend: Resend;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      throw new Error('RESEND_API_KEY non configurata');
    }

    this.resend = new Resend(apiKey);
  }

  async sendPasswordResetEmail(
    email: string,
    resetUrl: string,
  ): Promise<void> {
    const from = process.env.MAIL_FROM;

    if (!from) {
      throw new Error('MAIL_FROM non configurata');
    }

    const { error } = await this.resend.emails.send({
      from,
      to: email,
      subject: 'Reimposta la tua password - FlowBoard',
      text: `Hai richiesto di reimpostare la password del tuo account FlowBoard.

Per reimpostare la password visita questo link:

${resetUrl}

Se non hai richiesto tu questa operazione, puoi ignorare questa email.`,
      html: `
        <h2>Reimposta la tua password</h2>

        <p>
          Hai richiesto di reimpostare la password del tuo account FlowBoard.
        </p>

        <p>
          <a href="${resetUrl}">
            Reimposta la password
          </a>
        </p>

        <p>
          Se non hai richiesto tu questa operazione, puoi ignorare questa email.
        </p>
      `,
    });

    if (error) {
  console.error('RESEND ERROR:', error);

  throw new InternalServerErrorException(
    'Impossibile inviare l email di recupero password',
  );
}

  }
}