// <!-- Alyce Harlan, Ashley Folse, Ashley Morrison -->
// <!-- Team 97, "A" Team --> 
// <!-- Inked In Database  -->
// This is our app.js file that allows the front end of our website to run

// # Citation for structure of web application
// # Date: Summer term 2024
// # Adapted from course project of the Web Development CS 290 class at OSU, course resources
// # https://github.com/osu-cs340-ecampus/nodejs-starter-app
// # https://canvas.oregonstate.edu/courses/1933705/pages/exploration-install-node?module_item_id=23487362

/*
    SETUP
*/
// Express
var mysql = require('mysql');
var express = require('express');   // We are using the express library for the web server
var app = express();                // We need to instantiate an express object to interact with the server in our code
const path = require('path');
const { pool } = require('./db-connector');
const PORT = 9865;                  // Set a port number at the top so it's easy to change in the future
const bodyParser = require('body-parser');
const cors = require('cors');
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));


/*
    ROUTES
*/
app.get('/companies', (req, res) => {
    const query = 'SELECT company_id, company_name FROM Companies ORDER BY company_id ASC'; 

    pool.query(query, (err, results) => {  
        if (err) {
            console.error('Error fetching companies:', err);
            res.status(500).send('Server Error');
        } else {
            res.json(results);
        }
    });
});


app.post('/companies/addCompany', (req, res) => {
    console.log('Request body:', req.body);  // Log the incoming request body for debugging
    
    // Destructure the company name from the request body
    const { companyName } = req.body;

    // Validate company name
    if (!companyName) {
        return res.status(400).json({ error: 'Company name is required' });
    }

    // Insert the new company into the database
    const query = 'INSERT INTO Companies (company_name) VALUES (?)';
    pool.query(query, [companyName], (err, results) => {
        if (err) {
            console.error('Error adding company:', err);
            return res.status(500).send('Server error');
        }

       
        const newCompany = {
            company_name: companyName
        };

        console.log('New company added:', newCompany);

        // Return the new company data in the response
        res.status(201).json(newCompany);
    });
});


// Delete Company by company ID
app.delete('/companies/deleteCompany/:companyId', (req, res) => {
  const companyId = req.params.companyId;
  const query = 'DELETE FROM Companies WHERE company_id = ?';

  pool.query(query, [companyId], (err, results) => {
    if (err) {
      console.error('Error deleting company:', err);
      res.status(500).send('Server Error');
    } else {
      res.json({ message: 'Company deleted successfully' });
    }
  });
});

// Route to update company
app.post('/companies/editCompany/:companyID', (req, res) => {
  const companyId = req.params.companyID;
  const { companyName } = req.body;
  
  if (!companyName) {
    return res.status(400).json({ error: 'Company name is required' });
  }

  const query = 'UPDATE Companies SET company_name = ? WHERE company_id = ?';
  
  pool.query(query, [companyName, companyId], (err, results) => {
    if (err) {
      console.error('Database update failed:', err);
      return res.status(500).json({ error: 'Server error' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.json({ message: 'Company updated successfully' });
  });
});

// Get users for a specific company
app.get('/users', (req, res) => {
  const usersCompanyId = req.query.usersCompanyId;

  if (!usersCompanyId) {
    return res.status(400).json({ error: 'Company ID is required' });
  }

  const query = 'SELECT user_id, user_name, user_email FROM Users WHERE fk_userscompany_id = ?';

  pool.query(query, [usersCompanyId], (err, results) => {
    if (err) {
      console.error('Database query failed:', err);
      return res.status(500).json({ error: 'Server Error' });
    } else {
      res.json(results);
    }
  });
});


// Add user to a specific company
app.post('/users/addUser', (req, res) => {
  const { companyId, userName, userEmail } = req.body;

  // Validate required fields
  if (!companyId || !userName || !userEmail) {
    return res.status(400).json({ error: 'All fields are required.' });
  }


  const query = 'INSERT INTO Users (user_name, user_email, fk_userscompany_id) VALUES (?, ?, ?)';

  pool.query(query, [userName, userEmail, companyId], (err, results) => {
    if (err) {
      console.error('Error adding user:', err);
      return res.status(500).json({ error: 'Server error. Failed to add user.' });
    }

    // Return the new user's details
    res.status(201).json({
      user_id: results.insertId,
      user_name: userName,
      user_email: userEmail,
    });
  });
});

// Delete user by user ID
app.delete('/users/deleteUser/:userId', (req, res) => {
  const userId = req.params.userId;
  const query = 'DELETE FROM Users WHERE user_id = ?';

  pool.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error deleting user:', err);
      res.status(500).send('Server Error');
    } else {
      res.json({ message: 'User deleted successfully' });
    }
  });
});


// Route to fetch files for a specific company
app.get('/files', (req, res) => {
    const companyId = req.query.companyId;

    if (!companyId) {
        return res.status(400).send('companyId query parameter is required');
    }

    const query = 'SELECT * FROM Files WHERE fk_filescompany_id = ?';
    pool.query(query, [companyId], (error, results) => {
        if (error) {
            console.error('Error fetching files:', error);
            res.status(500).send('Server error');
        } else {
            res.json(results);
        }
    });
});

// Route to add a new file for a company
app.post('/addFile', (req, res) => {
    const { file_name, company_id } = req.body;

    if (!file_name || !company_id) {
        return res.status(400).send('File name and company ID are required');
    }

    const query = 'INSERT INTO Files (file_name, fk_filescompany_id) VALUES (?, ?)';
    pool.query(query, [file_name, company_id], (error, results) => {
        if (error) {
            console.error('Error adding file:', error);
            res.status(500).send('Server error');
        } else {
            // Fetch updated list of files for the company
            const fetchQuery = 'SELECT * FROM Files WHERE fk_filescompany_id = ?';
            pool.query(fetchQuery, [company_id], (fetchError, updatedResults) => {
                if (fetchError) {
                    console.error('Error fetching updated files:', fetchError);
                    res.status(500).send('Server error');
                } else {
                    res.json(updatedResults); // Return updated files to client
                }
            });
        }
    });
});


//get users with access to a file with user_file_access
app.get('/user_file_access', (req, res) => {
  const fileId = req.query.fileId;

  if (!fileId) {
    return res.status(400).json({ error: 'fileId is required' });
  }

  // SQL query to fetch users for the given fileId
  const query = `
    SELECT u.user_name
    FROM Users u
    JOIN user_file_access ufa ON u.user_id = ufa.fk_usersfile_id
    WHERE ufa.fk_uniquefile_id = ?
  `;

  pool.query(query, [fileId], (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).json({ error: 'Failed to fetch users' });
    }

    console.log('Users fetched for file ID:', fileId, results);
    res.json(results);  // Send back the list of users as JSON
  });
});

//grant file access to a specified user
app.post('/user_file_access/grant', (req, res) => {
  const { file_id, user_id } = req.body;
  if (!file_id || !user_id) {
    return res.status(400).send({ error: 'File ID and User ID are required' });
  }

  const query = `
    INSERT INTO user_file_access (fk_usersfile_id, fk_uniquefile_id)
    VALUES (?, ?)
  `;

  pool.query(query, [user_id, file_id], (error) => {
    if (error) {
      console.error('Error granting access:', error);
      return res.status(500).send({ error: 'Database error' });
    }
    res.status(200).send({ message: 'Access granted successfully' });
  });
});

app.get('/forms', (req, res) => {
  const companyId = req.query.companyId;

  if (!companyId) {
      return res.status(400).send('companyId query parameter is required');
  }

  // Query to fetch forms associated with a specific company
  const query = `
      SELECT Forms.* 
      FROM Forms
      JOIN Files ON Forms.fk_file_id = Files.file_id
      WHERE Files.fk_filescompany_id = ?
  `;

  pool.query(query, [companyId], (error, results) => {
      if (error) {
          console.error('Error fetching forms:', error);
          res.status(500).send('Server error');
      } else {
          res.json(results);
      }
  });
});

// Route to add a new form
app.post('/addForm', (req, res) => {
  const { formName, fileId } = req.body;

  // Validate incoming data
  if (!formName || !fileId) {
      return res.status(400).json({ error: 'Form name and file ID are required' });
  }

  // Insert the new form into the database
  const insertQuery = 'INSERT INTO Forms (form_name, fk_file_id) VALUES (?, ?)';
  pool.query(insertQuery, [formName, fileId], (insertError, insertResults) => {
      if (insertError) {
          console.error('Error adding form:', insertError);
          return res.status(500).json({ error: 'Failed to add form' });
      }

      // Fetch updated forms associated with the given file ID
      const fetchQuery = 'SELECT * FROM Forms WHERE fk_file_id = ?';
      pool.query(fetchQuery, [fileId], (fetchError, updatedForms) => {
          if (fetchError) {
              console.error('Error fetching updated forms:', fetchError);
              return res.status(500).json({ error: 'Failed to fetch updated forms' });
          }

          // Send the updated forms back to the client
          res.json(updatedForms);
      });
  });
});

// Route to delete a form
app.delete('/forms/deleteForm/:formId', (req, res) => {
  const formId = req.params.formId;
  const query = 'DELETE FROM Forms WHERE form_id = ?';
  
  pool.query(query, [formId], (error, results) => {
      if (error) {  // Change 'err' to 'error'
          console.error('Error deleting form:', error);
          res.status(500).send('Server error');
      } else {
          res.json({ message: 'Form deleted successfully' });
      }
  });
});


// Route to fetch signatures
app.get('/signatures', (req, res) => {
  const signatureId = req.query.signatureId;

  if (!signatureId) {
      return res.status(400).send('signatureId query parameter is required');
  }
  
  const query = 
  `SELECT s.signature_id, s.date_signed, 
  u.user_name AS fk_sig_user_name, f.form_name AS fk_sig_form_name 
  FROM Signatures s 
  JOIN Users u ON s.fk_sig_user_name = u.user_name 
  JOIN Forms f ON s.fk_sig_form_name = f.form_name 
  WHERE s.signature_id = ?`;

    pool.query(query, [signatureId], (error, results) => {
        if (error) {
            console.error('Error fetching signatures:', error);
            res.status(500).send('Server error');
        } else {
            res.json(results);
        }
    });
});


// Delete user by file ID
app.delete('/files/deleteFile/:fileId', (req, res) => {
  const fileId = req.params.fileId;
  const query = 'DELETE FROM Files WHERE file_id = ?';

  pool.query(query, [fileId], (err, results) => {
    if (err) {
      console.error('Error deleting file:', err);
      res.status(500).send('Server Error');
    } else {
      res.json({ message: 'File deleted successfully' });
    }
  });
});

// Delete user by signature ID
app.delete('/signatures/deleteSignature/:signatureId', (req, res) => {
  const signatureId = req.params.signatureId;
  const query = 'DELETE FROM Signatures WHERE signature_id = ?';

  pool.query(query, [signatureId], (err, results) => {
    if (err) {
      console.error('Error deleting signature:', err);
      res.status(500).send('Server Error');
    } else {
      res.json({ message: 'Signature deleted successfully' });
    }
  });
});
/*
    LISTENER
*/
app.listen(PORT, () => {  // This is the basic syntax for what is called the 'listener' which receives incoming requests on the specified PORT.
    console.log('Express started on http://classwork.engr.oregonstate.edu:' + PORT + '; press Ctrl-C to terminate.')
});
