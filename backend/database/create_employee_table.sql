-- Create EMPLOYEE table (replacing STAFF from ER diagram)
USE team06;

CREATE TABLE IF NOT EXISTS employee (
  EmployeeID INT PRIMARY KEY AUTO_INCREMENT,
  Name VARCHAR(100) NOT NULL,
  DOB DATE,
  Address VARCHAR(255)
);

-- Insert sample employees for testing
INSERT INTO employee (Name, DOB, Address) VALUES
('John Admin', '1985-05-15', '123 Admin Street, Dhaka'),
('Sarah Manager', '1990-08-20', '456 Manager Road, Dhaka'),
('Mike Supervisor', '1988-03-10', '789 Supervisor Lane, Dhaka');

-- Show the created table
SELECT * FROM employee;
