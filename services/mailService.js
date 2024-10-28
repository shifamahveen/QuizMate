const fetch = require('node-fetch');

exports.sendThresholdNotification = async (email) => {
  const url = 'https://mail-sender-api1.p.rapidapi.com/';
  const options = {
    method: 'POST',
    headers: {
      'x-rapidapi-key': 'd95138bcccmsh5d35a3a49ecb578p17c5b4jsn72168f34851e',
      'x-rapidapi-host': 'mail-sender-api1.p.rapidapi.com',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      sendto: email,  
      name: 'user2024',
      replyTo: 'sb1974660@gmail.com', 
      ishtml: 'false',
      title: 'New Quiz Alert: Challenge Your Knowledge!',
      body: "Hello, Were excited to inform you that a new quiz has been added to our platform! This is a great opportunity to test your knowledge and see how well you perform. \nGet started now and see how you fare!\n\nHappy Learning!"
    })
  };

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`Failed to send email: ${response.statusText}`);
    }
    const result = await response.text();
    console.log(`Email sent successfully: ${result}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};