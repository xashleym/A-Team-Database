-- Alyce Harlan, Ashley Folse, Ashley Morrison
-- Team 97, "A" Team 
-- Inked In Database 
-- DML - Data Manipulation Language

-- # Citation for retrieving table data
-- # Date: 11/1/2024
-- # Adapted from course materials, chapter 16 of the textbook
-- # https://canvas.oregonstate.edu/courses/1976520/pages/exploration-intro-to-sql?module_item_id=24719030
-- # https://canvas.oregonstate.edu/courses/1976520/pages/exploration-sql-joins?module_item_id=24719042
-- # https://ebookcentral.proquest.com/lib/osu/reader.action?docID=4509772&ppg=346

--SELECT query to retrieve Companies for homepage display
SELECT company_id, company_name FROM Companies ORDER BY company_id ASC;


--Insert new company into database
INSERT INTO Companies (company_name) VALUES (?);

-- SELECT query to retrieve all users
SELECT * FROM Users;

-- SELECT query to retrieve all files accessible by a specific user
SELECT Files.file_name 
FROM Files 
JOIN user_file_access ON Files.file_id = user_file_access.fk_uniquefile_id
WHERE user_file_access.fk_usersfile_id = :userId;

-- INSERT query to add a new user
INSERT INTO Users (user_name, user_email, fk_userscompany_id)
VALUES (:userName, :userEmail, 
    (SELECT company_id FROM Companies WHERE company_name = :companyName));

-- UPDATE query to edit a company name
UPDATE Companies
SET company_name = :newName
WHERE company_id = :companyID;


-- UPDATE query to update a user's email
UPDATE Users
SET user_email = :newEmail
WHERE user_id = :userId;

-- DELETE query to remove a user using the primary key
DELETE FROM Users
WHERE user_id = :userId;

-- DELETE query to remove a company using the primary key
DELETE FROM Companies
WHERE company_id = :companyId;

-- DELETE query to remove a file using the primary key
DELETE FROM Files
WHERE file_id = :fileId;

-- DELETE query to remove a form using the primary key
DELETE FROM Forms
WHERE form_id = :formId;

-- DELETE query to remove a signature using the primary key
DELETE FROM Signatures
WHERE signature_id = :signatureId;

-- INSERT query to add a new file
INSERT INTO Files (file_name, fk_filescompany_id)
VALUES (:fileName, 
    (SELECT company_id FROM Companies WHERE company_name = :companyName));

-- INSERT query to add a new signature
INSERT INTO Signatures (date_signed, fk_sig_user_name, fk_sig_form_name)
VALUES (CURRENT_TIMESTAMP, 
    (SELECT user_name FROM Users WHERE user_id = :userId),
    (SELECT form_name FROM Forms WHERE form_id = :formId));

-- INSERT query to grant a user access to a file
INSERT INTO user_file_access (fk_usersfile_id, fk_uniquefile_id)
VALUES ((SELECT user_id FROM Users WHERE user_name = :userName),
    (SELECT file_id FROM Files WHERE file_name = :fileName));
