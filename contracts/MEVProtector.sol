// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract MEVProtector {
    struct Transaction {
        address user;
        bytes32 txHash;
        uint256 gasPrice;
        uint256 timestamp;
        bool isProtected;
        uint256 slippageProtection; // in basis points
    }
    
    struct MEVAttempt {
        bytes32 originalTxHash;
        address attacker;
        uint256 attemptedProfit;
        uint256 timestamp;
        bool wasBlocked;
        string attackType; // "frontrun", "sandwich", "backrun"
    }
    
    mapping(bytes32 => Transaction) public transactions;
    mapping(address => MEVAttempt[]) public mevAttempts;
    mapping(address => bool) public protectedUsers;
    mapping(address => uint256) public userNonces;
    
    bytes32[] public transactionHashes;
    uint256 public totalMEVBlocked;
    uint256 public totalTransactionsProtected;
    
    event TransactionProtected(bytes32 indexed txHash, address indexed user, uint256 slippage);
    event MEVAttemptBlocked(bytes32 indexed originalTx, address indexed attacker, string attackType);
    event UserProtectionEnabled(address indexed user);
    event SlippageProtectionTriggered(bytes32 indexed txHash, uint256 actualSlippage);
    
    modifier onlyProtectedUser() {
        require(protectedUsers[msg.sender], "User not protected");
        _;
    }
    
    function enableProtection(uint256 _defaultSlippage) external {
        protectedUsers[msg.sender] = true;
        emit UserProtectionEnabled(msg.sender);
    }
    
    function submitProtectedTransaction(
        bytes32 _txHash,
        uint256 _gasPrice,
        uint256 _slippageProtection
    ) external onlyProtectedUser {
        require(_slippageProtection <= 1000, "Slippage too high"); // Max 10%
        
        transactions[_txHash] = Transaction({
            user: msg.sender,
            txHash: _txHash,
            gasPrice: _gasPrice,
            timestamp: block.timestamp,
            isProtected: true,
            slippageProtection: _slippageProtection
        });
        
        transactionHashes.push(_txHash);
        totalTransactionsProtected++;
        
        emit TransactionProtected(_txHash, msg.sender, _slippageProtection);
    }
    
    function reportMEVAttempt(
        bytes32 _originalTxHash,
        address _attacker,
        uint256 _attemptedProfit,
        string memory _attackType
    ) external {
        MEVAttempt memory attempt = MEVAttempt({
            originalTxHash: _originalTxHash,
            attacker: _attacker,
            attemptedProfit: _attemptedProfit,
            timestamp: block.timestamp,
            wasBlocked: true,
            attackType: _attackType
        });
        
        mevAttempts[transactions[_originalTxHash].user].push(attempt);
        totalMEVBlocked += _attemptedProfit;
        
        emit MEVAttemptBlocked(_originalTxHash, _attacker, _attackType);
    }
    
    function getTransactionInfo(bytes32 _txHash) external view returns (
        address user,
        uint256 gasPrice,
        uint256 timestamp,
        bool isProtected,
        uint256 slippageProtection
    ) {
        Transaction memory tx = transactions[_txHash];
        return (tx.user, tx.gasPrice, tx.timestamp, tx.isProtected, tx.slippageProtection);
    }
    
    function getUserMEVAttempts(address _user) external view returns (MEVAttempt[] memory) {
        return mevAttempts[_user];
    }
    
    function getProtectionStats() external view returns (
        uint256 totalBlocked,
        uint256 totalProtected,
        uint256 totalUsers
    ) {
        uint256 userCount = 0;
        // This is a simplified count - in production, you'd track this more efficiently
        for (uint256 i = 0; i < transactionHashes.length; i++) {
            if (protectedUsers[transactions[transactionHashes[i]].user]) {
                userCount++;
            }
        }
        
        return (totalMEVBlocked, totalTransactionsProtected, userCount);
    }
    
    function simulateMEVDetection(
        bytes32 _txHash,
        uint256 _suspiciousGasPrice,
        address _suspiciousAddress
    ) external view returns (bool isSuspicious, string memory reason) {
        Transaction memory originalTx = transactions[_txHash];
        
        if (_suspiciousGasPrice > originalTx.gasPrice * 110 / 100) {
            return (true, "Gas price manipulation detected");
        }
        
        if (_suspiciousAddress == originalTx.user) {
            return (true, "Same user attempting manipulation");
        }
        
        return (false, "Transaction appears safe");
    }
}
