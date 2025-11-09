-- Create RECORDS table for transaction history
CREATE TABLE IF NOT EXISTS records (
    Transaction_ID INT AUTO_INCREMENT PRIMARY KEY,
    Account_ID INT NOT NULL,
    Amount DECIMAL(10,2) NOT NULL,
    Date DATETIME DEFAULT CURRENT_TIMESTAMP,
    Status VARCHAR(50) NOT NULL,
    FOREIGN KEY (Account_ID) REFERENCES account(AccountID)
);
