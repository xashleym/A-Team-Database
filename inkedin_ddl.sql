-- Alyce Harlan, Ashley Folse, Ashley Morrison
-- Team 97, "A" Team 
-- Inked In Database 
-- DDL - Data Definition Language

-- Citation for retrieving table data
-- Date: 11/1/2024
-- Adapted from course materials, chapter 16 of the textbook
-- https://canvas.oregonstate.edu/courses/1976520/pages/exploration-intro-to-sql?module_item_id=24719030
-- https://canvas.oregonstate.edu/courses/1976520/pages/exploration-sql-joins?module_item_id=24719042
-- https://ebookcentral.proquest.com/lib/osu/reader.action?docID=4509772&ppg=346

SET FOREIGN_KEY_CHECKS = 0;
SET AUTOCOMMIT = 0;
-- records a company to which many employees (Users) belong
CREATE OR REPLACE TABLE Companies (
        company_id int AUTO_INCREMENT PRIMARY KEY,
        company_name VARCHAR(145) NOT NULL
    );

-- records the details about Users of the e-signature service
CREATE OR REPLACE TABLE Users (
        user_id int AUTO_INCREMENT PRIMARY KEY,
        user_name varchar(50) UNIQUE NOT NULL,
        user_email varchar(50) UNIQUE NOT NULL,
        fk_userscompany_id int,
        FOREIGN KEY (fk_userscompany_id) REFERENCES Companies(company_id) ON DELETE
        SET NULL
    );
-- records the details of Files which can have multiple Forms, multiple Users
-- from the same Company can be given access to the same Files
CREATE OR REPLACE TABLE Files (
        file_id int AUTO_INCREMENT PRIMARY KEY,
        file_name varchar(50) NOT NULL,
        fk_filescompany_id int,
        FOREIGN KEY (fk_filescompany_id) REFERENCES Companies(company_id) ON DELETE
        SET NULL
    );
-- represent documents to be stored within Files and signed
-- multiple times by Users
CREATE OR REPLACE TABLE Forms (
        form_id int AUTO_INCREMENT PRIMARY KEY,
        form_name varchar(145) UNIQUE NOT NULL,
        fk_file_id int,
        FOREIGN KEY (fk_file_id) REFERENCES Files(file_id)
        ON DELETE SET NULL
    );
-- Records an instance of a User signing a Form, includes date signed.
CREATE OR REPLACE TABLE Signatures (
        signature_id int AUTO_INCREMENT PRIMARY KEY,
        date_signed timestamp DEFAULT CURRENT_TIMESTAMP,
        fk_sig_user_name varchar(50) UNIQUE,
        fk_sig_form_name varchar(145) UNIQUE,
        FOREIGN KEY (fk_sig_user_name) REFERENCES Users(user_name)
        ON DELETE
        SET NULL,
        FOREIGN KEY (fk_sig_form_name) REFERENCES Forms(form_name)
        ON DELETE
        SET NULL
    );
-- a join table that will manage access rights for users to files
CREATE OR REPLACE TABLE user_file_access (
        access_id int AUTO_INCREMENT PRIMARY KEY,
        fk_usersfile_id int,
        fk_uniquefile_id int,
        FOREIGN KEY (fk_usersfile_id) REFERENCES Users(user_id) ON DELETE
        SET NULL,
            FOREIGN KEY (fk_uniquefile_id) REFERENCES Files(file_id) ON DELETE
        SET NULL
    );
-- a join table that establishes the relationship between form and
-- the signatures on it
CREATE OR REPLACE TABLE form_signatures (
        form_signatures_id int AUTO_INCREMENT PRIMARY KEY,
        date_signed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fk_user_id int,
        fk_form_id int,
        FOREIGN KEY (fk_user_id) REFERENCES Users(user_id) ON DELETE
        SET NULL,
            FOREIGN KEY (fk_form_id) REFERENCES Forms(form_id) ON DELETE
        SET NULL
    );
-- **EXAMPLE DATA**--
-- Includes at least 3 examples per table
INSERT INTO Companies (company_name)
VALUES ("McDonalds"),
    ("Starbucks"),
    ("Black Bear Diner");
INSERT INTO Users (user_name, user_email, fk_userscompany_id)
VALUES (
        "Grimace",
        "grim@mickeydees.com",
(
            SELECT company_id
            FROM Companies
            WHERE company_name = "McDonalds"
        )
    ),
    (
        "Ronald McDonald",
        "ronnie@mickeydees.com",
        (
            SELECT company_id
            FROM Companies
            WHERE company_name = "McDonalds"
        )
    ),
    (
        "Birdie the Early Bird",
        "mcdonaldsbirdie@mickeydees.com",
        (
            SELECT company_id
            FROM Companies
            WHERE company_name = "McDonalds"
        )
    );
INSERT INTO Files (file_name, fk_filescompany_id)
VALUES (
        "Menus",
        (
            SELECT company_id
            FROM Companies
            WHERE company_name = "McDonalds"
        )
    ),
    (
        "Employee Agreements",
        (
            SELECT company_id
            FROM Companies
            WHERE company_name = "McDonalds"
        )
    ),
    (
        "Release of Liability",
        (
            SELECT company_id
            FROM Companies
            WHERE company_name = "McDonalds"
        )
    );
INSERT INTO Forms (form_name, fk_file_id)
VALUES (
        "$1 Menu",
        (
            SELECT file_id
            FROM Files
            WHERE file_name = "Menus"
        )
    ),
    (
        "Burger Flipper Agreement",
        (
            SELECT file_id
            FROM Files
            WHERE file_name = "Employee Agreements"
        )
    ),
    (
        "PlayPlace Release of Liability",
        (
            SELECT file_id
            FROM Files
            WHERE file_name = "Release of Liability"
        )
    );
INSERT INTO Signatures (date_signed, fk_sig_user_name, fk_sig_form_name)
VALUES (
        CURRENT_TIMESTAMP,
        (
            SELECT user_name
            FROM Users
            WHERE user_id = "1"
        ),
        (
            SELECT form_name
            FROM Forms
            WHERE form_id = "1"
        )
    ),
    (
        CURRENT_TIMESTAMP,
        (
            SELECT user_name
            FROM Users
            WHERE user_id = "2"
        ),
        (
            SELECT form_name
            FROM Forms
            WHERE form_id = "2"
        )
    ),
    (
        CURRENT_TIMESTAMP,
        (
            SELECT user_name
            FROM Users
            WHERE user_id = "3"
        ),
        (
            SELECT form_name
            FROM Forms
            WHERE form_id = "3"
        )
    );
INSERT INTO user_file_access (fk_usersfile_id, fk_uniquefile_id)
VALUES (
        (
            SELECT user_id
            FROM Users
            WHERE user_name = "Grimace"
        ),
        (
            SELECT file_id
            FROM Files
            WHERE file_name = "Menus"
        )
    ),
    (
        (
            SELECT user_id
            FROM Users
            WHERE user_name = "Ronald McDonald"
        ),
        (
            SELECT file_id
            FROM Files
            WHERE file_name = "Employee Agreements"
        )
    ),
    (
        (
            SELECT user_id
            FROM Users
            WHERE user_name = "Birdie the Early Bird"
        ),
        (
            SELECT file_id
            FROM Files
            WHERE file_name = "Release of Liability"
        )
    );
INSERT INTO form_signatures (
        form_signatures_id,
        fk_user_id,
        date_signed,
        fk_form_id
    )
VALUES (
        1,
        (
            SELECT user_id
            FROM Users
            WHERE user_name = "Grimace"
        ),
        CURRENT_TIMESTAMP,
        (
            SELECT form_id
            FROM Forms
            WHERE form_name = "$1 Menu"
        )
    ),
    (
        2,
        (
            SELECT user_id
            FROM Users
            WHERE user_name = "Ronald McDonald"
        ),
        CURRENT_TIMESTAMP,
        (
            SELECT form_id
            FROM Forms
            WHERE form_name = "Burger Flipper Agreement"
        )
    ),
    (
        3,
        (
            SELECT user_id
            FROM Users
            WHERE user_name = "Birdie the Early Bird"
        ),
        CURRENT_TIMESTAMP,
        (
            SELECT form_id
            FROM Forms
            WHERE form_name = "PlayPlace Release of Liability"
        )
    );
SET FOREIGN_KEY_CHECKS = 1;
COMMIT;
