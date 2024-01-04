document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // Send an email
  document.getElementById('compose-form').addEventListener('submit', send_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

/*thats hide all views*/
function hidingElements(){
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#details').style.display = 'none';
}

function compose_email() {

  // Show compose view and hide other views
  hidingElements();
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  hidingElements();
  document.querySelector('#emails-view').style.display = 'block';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // this code was taked from the documentation https://cs50.harvard.edu/web/2020/projects/3/mail/#get-emailsstrmailbox, and modified because it was a example
  // mails of user
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      emails.forEach(element => {
        const email = document.createElement('div');
        email.className = 'list-group-item mb-2';
        email.innerHTML = `
          <p><strong>Sender</strong>: ${element.sender}</p>
          <p><strong>Subject</strong>: ${element.subject}</p>
          <p>${element.timestamp}</p>
        `
        document.querySelector('#emails-view').append(email);  

        //thas is when you click on an email, for view it
        email.addEventListener('click', function(){
          fetch(`/emails/${element.id}`)
          .then(response => response.json())
          .then(email => {
              hidingElements();
              document.querySelector('#details').style.display = 'block';
              details = document.querySelector('#details');

              details.className = 'list-group-item mb-2';

              details.innerHTML = `
                <p><strong>From</strong>: ${email.sender}</p>
                <p><strong>To</strong>: ${email.recipients}</p>
                <p><strong>Subject</strong>: ${email.subject}</p>
                <p><strong>Timestamp</strong>: ${email.timestamp}</p>
              `
              if(!email.read){
                fetch(`/emails/${email.id}`, {
                  method: 'PUT',
                  body: JSON.stringify({
                    read: true
                  })
                })
              }
              console.log(element.id + " WAS READ - " + element.read);


              //archive the mails
              const btn = document.createElement('button');

              if(email.archived){
                btn.innerHTML = "Unarchive"
                btn.className = "btn btn-success"
              }
              else{
                btn.innerHTML = "Archived"
                btn.className = "btn btn-danger"
              }

              btn.addEventListener('click', function(){
                fetch(`/emails/${email.id}`, {
                  method: 'PUT',
                  body: JSON.stringify({
                    archived: !email.archived
                  })
                })
                .then(() => {
                  load_mailbox('archive');
                })
              });
              document.querySelector('#details').append(btn);


              //reply the mails
              const reply = document.createElement('button');
              reply.innerHTML = "Reply"
              reply.className = "btn btn-warning"
              reply.addEventListener('click', function(){
                hidingElements();
                compose_email();
                document.querySelector('#compose-recipients').value = email.sender;
                document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
                document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;
              })
              document.querySelector('#details').append(reply);
          });
        })
      });
  });
}


/**
 * Sends an email using the values from the form.
 */
function send_email(event){
  //https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault#blocking_default_click_handling
  //The preventDefault() method of the Event interface tells the user agent that if the event does not get explicitly handled, its default action should not be taken as it normally would be.
  event.preventDefault();

  // get the values from the form
  const recipients = document.getElementById('compose-recipients').value;
  const subjects = document.getElementById('compose-subject').value;
  const body = document.getElementById('compose-body').value;

  // this code was taked from the documentation https://cs50.harvard.edu/web/2020/projects/3/mail/#get-emailsstrmailbox, and modified because it was a example
  try {
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: recipients,
        subject: subjects,
        body: body
      })
    })
    .then(response => response.json())
    .then(result => {
      // Print result
      console.log(result);
      load_mailbox('sent');
    })
  } catch (error) {
    console.log(error);
  }
}