require('dotenv').config();
const { Resend } = require('resend');
const resend = new Resend(process.env.MAIL_API);

async function test() {
  console.log("Using API Key:", process.env.MAIL_API ? "Found" : "Not Found");
  const { data, error } = await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: 'pkrishikumar2468@gmail.com', // The user's email from their prompt
    subject: 'Test',
    html: '<p>Test</p>'
  });
  console.log("Data:", data);
  console.log("Error:", error);
}
test();
