import OpenAI from "openai";
import nodemailer from "nodemailer";
import Handlebars from "handlebars";
import fs from "fs";

export const  sendMsgToOpenAI = async(req, res) => {
  try{
    const {conversation, email} = req.body;

    if (!conversation || !email) {
      return res.status(400).send("Invalid request parameters!");
    }


    conversation.push({role: "user", content: "Make a proper formatted document of this conversation as assistant. Listing all essential features in bullet points and with proper headings. Note: Avoid budget details "});

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_KEY,
    });

    const completion = await openai.chat.completions.create({
      messages: conversation,
      model: "gpt-4",
      temperature: 0.7
    });

    const summary = completion.choices[0].message.content;
    const report = generateHTMLReport(summary);


    const templateData = {
        report: report,
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: "guptaud007@gmail.com",
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: "guptaud007@gmail.com",
        to: email,
        subject: "Welcome to TensorBlue",
        text: "TensorBlue: Dare to disrupt",
        html: compileTemplate(templateData)
    }

    const result = await transporter.sendMail(mailOptions);
    
    res.status(200).json({message: "Mail Sent!", summary: summary});
  }
  catch(e){
    console.log(e);
    res.status(500).json({ error: 'Error communicating with OpenAI API', details: e.message });
  }
}

function generateHTMLReport(summary) {
  const lines = summary.split('\n');
  let report = "";
  let inBlock = false;

  for (let i = 1; i < lines.length; i++) {
    if (lines[i].startsWith('#')) {
      const level = lines[i].lastIndexOf('#') + 1;
      const title = lines[i].substring(level).trim();
      report += `<h${level} class="subsection">${title}</h${level}>`;
    } else if (lines[i].startsWith('**')) {
      if (!inBlock) {
        report += '<div class="key">';
        inBlock = true;
      }
      report += lines[i].replace('**', '') + '<br>';
    } else if (lines[i].startsWith('-')) {
      if (inBlock) {
        report += '</div>';
        inBlock = false;
      }
      report += `<ul><li>${lines[i].substring(1).trim()}</li></ul>`;
    } else if (lines[i].trim() !== '') {
      report += `<p class="section">${lines[i].trim()}</p>`;
    }
  }

  if (inBlock) {
    report += '</div>';
  }

  return report;
}


function compileTemplate(data) {
  const mailTemplate = fs.readFileSync("../templates/mailTemplate.html", "utf-8").toString();
  const template = Handlebars.compile(mailTemplate);
  return template(data);
}
