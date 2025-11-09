-- Create TRANSACTION/RECORD table to store all transaction records
-- This table will hold comprehensive transaction data as per ER diagram

USE team06;

-- Drop table if exists
DROP TABLE IF EXISTS transaction_record;

-- Create transaction_record table
CREATE TABLE transaction_record (
    TransactionID INT PRIMARY KEY AUTO_INCREMENT,
    AccountID INT NOT NULL,
    TransactionType VARCHAR(50) NOT NULL, -- 'Credit', 'Debit', 'Transfer', 'Loan', 'Bill Payment'
    Amount DECIMAL(15, 2) NOT NULL,
    TransactionDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    Status VARCHAR(20) DEFAULT 'Completed', -- 'Completed', 'Pending', 'Failed'
    Description VARCHAR(255),
    Receiver VARCHAR(100), -- Account number or receiver name
    Operation VARCHAR(20), -- 'Credit' or 'Debit'
    PhoneNo VARCHAR(15),
    BalanceAfter DECIMAL(15, 2), -- Balance after transaction
    FOREIGN KEY (AccountID) REFERENCES account(AccountID) ON DELETE CASCADE
);

-- Create index for faster queries
CREATE INDEX idx_account_date ON transaction_record(AccountID, TransactionDate DESC);
CREATE INDEX idx_transaction_type ON transaction_record(TransactionType);

-- Insert sample data from existing payment_service table
INSERT INTO transaction_record (AccountID, TransactionType, Amount, TransactionDate, Status, Description, Receiver, Operation, PhoneNo)
SELECT 
    AccountID,
    BillType as TransactionType,
    Amount,
    PaymentDate as TransactionDate,
    Status,
    CONCAT('Transaction via ', BillType) as Description,
    Receiver,
    Operation,
    PhoneNo
FROM payment_service
WHERE AccountID IS NOT NULL;

SELECT 'Transaction/Record table created successfully!' as Message;
