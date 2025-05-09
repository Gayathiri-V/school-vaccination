import nodemailer from 'nodemailer'

export async function sendEmail({ to, subject, text, html }){

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_ID, 
        pass: process.env.GMAIL_PASSWORD,
      },
    });
    
    const mailOptions = {
      to,
      subject,
      text,
      html
    };
    
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });

}

